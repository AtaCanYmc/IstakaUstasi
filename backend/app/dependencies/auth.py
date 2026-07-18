import structlog
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.db import DatabaseFactory

logger = structlog.get_logger("okey_bridge_server.dependencies.auth")
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    token = credentials.credentials
    try:
        provider = DatabaseFactory.get_provider()
        user_info = await provider.verify_token(token)
        return user_info
    except Exception as e:
        logger.warning("Authentication failed", error=str(e))
        raise HTTPException(
            status_code=401,
            detail="Authentication failed or token invalid",
        )
