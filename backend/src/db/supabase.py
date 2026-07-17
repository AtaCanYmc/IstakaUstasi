import os
from typing import Any, Dict, Optional

import structlog
from supabase import Client, create_client

from src.db.base import (
    IDatabaseProvider,
    ISystemLogRepository,
    IUserRepository,
    SystemLogCreate,
    UserProfile,
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
        return self._map_user_data(res.data[0])

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
            "image_quota_count": initial_image_quota,
            "solver_quota_count": initial_solver_quota,
            "last_reset_date": now_str,
            "created_at": now_str,
            "updated_at": now_str,
        }
        res = self.client.table("users").insert(new_user).execute()
        return self._map_user_data(res.data[0])

    async def update_user(self, user_id: str, updates: Dict[str, Any]) -> UserProfile:
        from datetime import datetime, timezone

        updates["updated_at"] = datetime.now(timezone.utc).isoformat()
        res = self.client.table("users").update(updates).eq("id", user_id).execute()
        return self._map_user_data(res.data[0])


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
