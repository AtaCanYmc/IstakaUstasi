import os
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional

import structlog
from supabase import Client, create_client

logger = structlog.get_logger("okey_bridge_server.services.supabase")


class SupabaseService:
    _client: Optional[Client] = None

    @classmethod
    def get_client(cls) -> Client:
        if cls._client is None:
            url = os.getenv("SUPABASE_URL")
            key = os.getenv("SUPABASE_KEY")
            if not url or not key:
                logger.warning("SUPABASE_URL or SUPABASE_KEY not set in environment.")
                raise ValueError("Supabase environment variables not configured.")
            cls._client = create_client(url, key)
        return cls._client

    @classmethod
    def sync_user_profile(cls, user_id: str, email: str) -> Dict[str, Any]:
        """
        Synchronizes user profile after authenticating.
        Creates record if it does not exist, initializing quota to 5.
        """
        client = cls.get_client()
        try:
            res = client.table("users").select("*").eq("id", user_id).execute()
            if not res.data:
                # User doesn't exist, create it
                new_user = {
                    "id": user_id,
                    "email": email,
                    "image_quota_count": 5,
                    "last_reset_date": datetime.now(timezone.utc).isoformat(),
                }
                insert_res = client.table("users").insert(new_user).execute()
                logger.info(
                    "Created new user profile in Supabase",
                    user_id=user_id,
                    email=email,
                )
                return insert_res.data[0]
            else:
                return res.data[0]
        except Exception as e:
            logger.exception(
                "Error syncing user profile with Supabase",
                user_id=user_id,
                error=str(e),
            )
            raise e

    @classmethod
    def check_and_update_quota(cls, user_id: str) -> bool:
        """
        Checks if user has available quota, renewing weekly if 7 days have passed.
        Decrements the quota count by 1 and records log in quota_logs if successful.
        Returns True if successful, False if quota is exceeded.
        """
        client = cls.get_client()
        try:
            res = client.table("users").select("*").eq("id", user_id).execute()
            if not res.data:
                logger.error("User profile not found for quota check", user_id=user_id)
                return False

            user = res.data[0]
            quota = user.get("image_quota_count", 0)
            last_reset_str = user.get("last_reset_date")

            now = datetime.now(timezone.utc)
            should_reset = False
            if last_reset_str:
                last_reset = datetime.fromisoformat(
                    last_reset_str.replace("Z", "+00:00")
                )
                if now - last_reset >= timedelta(days=7):
                    should_reset = True
            else:
                should_reset = True

            if should_reset:
                logger.info("Weekly quota reset triggered for user", user_id=user_id)
                quota = 5
                client.table("users").update(
                    {
                        "image_quota_count": quota,
                        "last_reset_date": now.isoformat(),
                    }
                ).eq("id", user_id).execute()

            if quota <= 0:
                logger.warn(
                    "User has exceeded their image extraction quota",
                    user_id=user_id,
                )
                return False

            new_quota = quota - 1
            client.table("users").update({"image_quota_count": new_quota}).eq(
                "id", user_id
            ).execute()

            cls.log_quota_action(user_id, "image_extraction")

            logger.info(
                "Quota decremented successfully",
                user_id=user_id,
                remaining_quota=new_quota,
            )
            return True
        except Exception as e:
            logger.exception(
                "Error updating quota in Supabase",
                user_id=user_id,
                error=str(e),
            )
            return False

    @classmethod
    def log_quota_action(cls, user_id: str, action: str):
        client = cls.get_client()
        try:
            client.table("quota_logs").insert(
                {
                    "user_id": user_id,
                    "action": action,
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                }
            ).execute()
        except Exception as e:
            logger.error(
                "Failed to write to quota_logs",
                user_id=user_id,
                error=str(e),
            )
