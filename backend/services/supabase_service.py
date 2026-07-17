from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional

import structlog

from db import DatabaseFactory

logger = structlog.get_logger("okey_bridge_server.services.supabase")


class SupabaseService:
    @classmethod
    async def sync_user_profile(
        cls, user_id: str, email: str, username: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Synchronizes user profile after authenticating.
        Creates record if it does not exist, initializing quota to 5.
        """
        provider = DatabaseFactory.get_provider()
        user_repo = provider.get_user_repository()
        try:
            user = await user_repo.get_user(user_id)
            if not user:
                user = await user_repo.create_user(
                    user_id, email, username=username, initial_quota=5
                )
                logger.info(
                    "Created new user profile in database",
                    user_id=user_id,
                    email=email,
                )
            return user.model_dump()
        except Exception as e:
            logger.exception(
                "Error syncing user profile with database",
                user_id=user_id,
                error=str(e),
            )
            raise e

    @classmethod
    async def check_and_update_quota(cls, user_id: str) -> bool:
        """
        Checks if user has available quota, renewing weekly if 7 days have passed.
        Decrements the quota count by 1 and records log in quota_logs if successful.
        Returns True if successful, False if quota is exceeded.
        """
        provider = DatabaseFactory.get_provider()
        user_repo = provider.get_user_repository()
        log_repo = provider.get_system_log_repository()
        try:
            user = await user_repo.get_user(user_id)
            if not user:
                logger.error("User profile not found for quota check", user_id=user_id)
                return False

            quota = user.image_quota_count
            last_reset_str = user.last_reset_date

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
                user = await user_repo.update_user(
                    user_id,
                    {
                        "image_quota_count": quota,
                        "last_reset_date": now.isoformat(),
                    },
                )

            if quota <= 0:
                logger.warn(
                    "User has exceeded their image extraction quota",
                    user_id=user_id,
                )
                return False

            new_quota = quota - 1
            await user_repo.update_user(user_id, {"image_quota_count": new_quota})

            from db.base import SystemLogCreate

            await log_repo.create_log(
                SystemLogCreate(
                    level="INFO",
                    module="QUOTA",
                    message=f"User {user_id} consumed quota. Remaining: {new_quota}",
                    user_id=user_id,
                )
            )

            logger.info(
                "Quota decremented successfully",
                user_id=user_id,
                remaining_quota=new_quota,
            )
            return True
        except Exception as e:
            logger.exception(
                "Error updating quota in database",
                user_id=user_id,
                error=str(e),
            )
            return False
