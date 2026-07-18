import os
from typing import Any, Dict, Optional

import structlog
from supabase import Client, create_client

from app.db.base import (
    IDatabaseProvider,
    ISystemLogRepository,
    IUserRepository,
    SystemLogCreate,
    UserProfile,
    UserQuota,
)

logger = structlog.get_logger("okey_bridge_server.db.supabase")


class SupabaseUserRepository(IUserRepository):
    def __init__(self, client: Client):
        self.client = client

    def _map_user_data(self, data: Dict[str, Any]) -> UserProfile:
        return UserProfile(
            id=data["id"],
            email=data["email"],
            username=data.get("username"),
            image_quota_count=data["image_quota_count"],
            solver_quota_count=data.get("solver_quota_count", 20),
            last_reset_date=data["last_reset_date"],
            created_at=data["created_at"],
            updated_at=data["updated_at"],
        )

    async def get_user(self, user_id: str) -> Optional[UserProfile]:
        res = self.client.table("users").select("*").eq("id", user_id).execute()
        if not res.data:
            return None

        # Load quotas from user_quotas table
        quota_res = (
            self.client.table("user_quotas")
            .select("*")
            .eq("user_id", user_id)
            .execute()
        )
        quotas = {
            item["quota_type"]: UserQuota(
                user_id=item["user_id"],
                quota_type=item["quota_type"],
                quota_count=item["quota_count"],
                last_reset_date=item["last_reset_date"],
            )
            for item in quota_res.data
        }

        user_data = res.data[0]
        user_data["image_quota_count"] = (
            quotas.get("image").quota_count if quotas.get("image") else 5
        )
        user_data["solver_quota_count"] = (
            quotas.get("solver").quota_count if quotas.get("solver") else 20
        )
        user_data["last_reset_date"] = (
            quotas.get("image").last_reset_date
            if quotas.get("image")
            else user_data.get("created_at")
        )
        return self._map_user_data(user_data)

    async def create_user(
        self,
        user_id: str,
        email: str,
        username: Optional[str] = None,
        initial_image_quota: int = 10,
        initial_solver_quota: int = 100,
    ) -> UserProfile:
        from datetime import datetime, timezone

        now_str = datetime.now(timezone.utc).isoformat()
        new_user = {
            "id": user_id,
            "email": email,
            "username": username or email.split("@")[0],
            "created_at": now_str,
            "updated_at": now_str,
        }
        res = self.client.table("users").insert(new_user).execute()

        # Create initial quotas
        self.client.table("user_quotas").insert(
            [
                {
                    "user_id": user_id,
                    "quota_type": "image",
                    "quota_count": initial_image_quota,
                    "last_reset_date": now_str,
                },
                {
                    "user_id": user_id,
                    "quota_type": "solver",
                    "quota_count": initial_solver_quota,
                    "last_reset_date": now_str,
                },
            ]
        ).execute()

        user_data = res.data[0]
        user_data["image_quota_count"] = initial_image_quota
        user_data["solver_quota_count"] = initial_solver_quota
        user_data["last_reset_date"] = now_str
        return self._map_user_data(user_data)

    async def update_user(self, user_id: str, updates: Dict[str, Any]) -> UserProfile:
        from datetime import datetime, timezone

        updates_copy = dict(updates)
        now_str = datetime.now(timezone.utc).isoformat()

        # Extract quota parameters if present
        image_quota = updates_copy.pop("image_quota_count", None)
        solver_quota = updates_copy.pop("solver_quota_count", None)
        last_reset = updates_copy.pop("last_reset_date", None)

        if updates_copy:
            updates_copy["updated_at"] = now_str
            self.client.table("users").update(updates_copy).eq("id", user_id).execute()

        if image_quota is not None:
            quota_up: Dict[str, Any] = {"quota_count": image_quota}
            if last_reset:
                quota_up["last_reset_date"] = last_reset
            self.client.table("user_quotas").upsert(
                {"user_id": user_id, "quota_type": "image", **quota_up},
                on_conflict="user_id,quota_type",
            ).execute()

        if solver_quota is not None:
            quota_up = {"quota_count": solver_quota}
            if last_reset:
                quota_up["last_reset_date"] = last_reset
            self.client.table("user_quotas").upsert(
                {"user_id": user_id, "quota_type": "solver", **quota_up},
                on_conflict="user_id,quota_type",
            ).execute()

        # Retrieve fully integrated user record
        final_user = await self.get_user(user_id)
        if not final_user:
            raise ValueError("Failed to retrieve user after updates")
        return final_user


class SupabaseSystemLogRepository(ISystemLogRepository):
    def __init__(self, client: Client):
        self.client = client

    async def create_log(self, log_entry: SystemLogCreate) -> None:
        log_payload = log_entry.model_dump()
        try:
            self.client.table("quota_logs").insert(
                {
                    "user_id": log_payload.get("user_id"),
                    "action": (
                        f"LOG: {log_payload.get('level')} - "
                        f"{log_payload.get('module')}: "
                        f"{log_payload.get('message')[:100]}"
                    ),
                }
            ).execute()
        except Exception as e:
            logger.error("Failed to write log entry to Supabase DB", error=str(e))


class SupabaseDatabaseProvider(IDatabaseProvider):
    def __init__(self):
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_KEY")
        if not url or not key:
            raise ValueError("Supabase environment URL/KEY variables not configured.")
        self.client = create_client(url, key)
        self.user_repo = SupabaseUserRepository(self.client)
        self.log_repo = SupabaseSystemLogRepository(self.client)

    def get_user_repository(self) -> IUserRepository:
        return self.user_repo

    def get_system_log_repository(self) -> ISystemLogRepository:
        return self.log_repo

    async def verify_token(self, token: str) -> dict:
        auth_res = self.client.auth.get_user(token)
        if not auth_res or not auth_res.user:
            raise ValueError("Invalid auth credentials or token expired")

        user = auth_res.user
        metadata = getattr(user, "user_metadata", {}) or {}
        username = (
            metadata.get("full_name")
            or metadata.get("name")
            or metadata.get("user_name")
        )
        return {"id": user.id, "email": user.email, "username": username}
