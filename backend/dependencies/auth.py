import structlog
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from db import DatabaseFactory

logger = structlog.get_logger("okey_bridge_server.dependencies.auth")
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    token = credentials.credentials
    try:
        provider = DatabaseFactory.get_provider()
        # Retrieve initialized Supabase client from provider
        client = getattr(provider, "client", None)
        if not client:
            raise ValueError("Active database provider does not supply a client.")

        auth_res = client.auth.get_user(token)
        if not auth_res or not auth_res.user:
            raise HTTPException(
                status_code=401,
                detail="Invalid auth credentials or token expired",
            )

        user = auth_res.user
        metadata = getattr(user, "user_metadata", {}) or {}
        username = (
            metadata.get("full_name")
            or metadata.get("name")
            or metadata.get("user_name")
        )
        return {"id": user.id, "email": user.email, "username": username}
    except Exception as e:
        logger.warning("Authentication failed", error=str(e))
        raise HTTPException(
            status_code=401,
            detail="Authentication failed or token invalid",
        )
