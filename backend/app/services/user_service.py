from typing import Any, Dict, Optional

import structlog

from app.db import DatabaseFactory

logger = structlog.get_logger("okey_bridge_server.services.user")


class UserService:
    @classmethod
    async def sync_user_profile(
        cls, user_id: str, email: str, username: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Synchronizes user profile after authenticating.
        Creates record if it does not exist.
        """
        provider = DatabaseFactory.get_provider()
        user_repo = provider.get_user_repository()
        try:
            user = await user_repo.get_user(user_id)
            if not user:
                user = await user_repo.create_user(
                    user_id,
                    email,
                    username=username,
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
