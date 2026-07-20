from fastapi import APIRouter, Depends, HTTPException

from app.db import DatabaseFactory
from app.dependencies.auth import get_current_user
from app.models.auth import (
    AuthResponse,
    RoboflowKeyResponse,
    RoboflowKeySaveRequest,
    UserLoginRequest,
    UserSignupRequest,
)
from app.services.encryption import EncryptionService
from app.services.user_service import UserService

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/sync")
async def sync_user(current_user: dict = Depends(get_current_user)):
    """
    Syncs authenticated Supabase auth.users into public.users table.
    Initializes quota and user metadata if the user record does not exist.
    """
    profile = await UserService.sync_user_profile(
        user_id=current_user["id"],
        email=current_user["email"],
        username=current_user.get("username"),
    )
    return {"message": "User synchronized successfully", "profile": profile}


@router.post("/signup", response_model=AuthResponse)
async def signup(req: UserSignupRequest):
    """
    Signs up a new user via Supabase Auth and registers them in the database.
    """
    provider = DatabaseFactory.get_provider()
    client = getattr(provider, "client", None)
    if not client:
        raise HTTPException(
            status_code=500, detail="Database client provider not configured."
        )

    try:
        auth_res = client.auth.sign_up(
            {
                "email": req.email,
                "password": req.password,
                "options": {"data": {"full_name": req.username}},
            }
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Synchronize custom user profile data
    profile = await UserService.sync_user_profile(
        user_id=auth_res.user.id,
        email=auth_res.user.email,
        username=req.username,
    )

    access_token = auth_res.session.access_token if auth_res.session else ""
    refresh_token = auth_res.session.refresh_token if auth_res.session else ""

    # Package as user model profile
    from app.db import UserProfile

    user_profile = UserProfile(
        id=profile["id"],
        email=profile["email"],
        username=profile["username"],
        image_quota_count=profile["image_quota_count"],
        last_reset_date=profile["last_reset_date"],
        created_at=profile["created_at"],
        updated_at=profile["updated_at"],
    )

    return AuthResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=user_profile,
    )


@router.post("/login", response_model=AuthResponse)
async def login(req: UserLoginRequest):
    """
    Logs in an existing user using email/password.
    """
    provider = DatabaseFactory.get_provider()
    client = getattr(provider, "client", None)
    if not client:
        raise HTTPException(
            status_code=500, detail="Database client provider not configured."
        )

    try:
        auth_res = client.auth.sign_in_with_password(
            {"email": req.email, "password": req.password}
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Authentication failed: {str(e)}")

    # Ensure profile records exist in public schema
    user_repo = provider.get_user_repository()
    profile = await user_repo.get_user(auth_res.user.id)
    if not profile:
        metadata = getattr(auth_res.user, "user_metadata", {}) or {}
        username = metadata.get("full_name") or metadata.get("name")
        profile = await user_repo.create_user(
            user_id=auth_res.user.id,
            email=auth_res.user.email,
            username=username,
        )

    return AuthResponse(
        access_token=auth_res.session.access_token,
        refresh_token=auth_res.session.refresh_token,
        user=profile,
    )


@router.get("/roboflow-key", response_model=RoboflowKeyResponse)
async def get_roboflow_key(current_user: dict = Depends(get_current_user)):
    """
    Retrieves user-defined Roboflow key configuration (API key is masked).
    """
    provider = DatabaseFactory.get_provider()
    client = getattr(provider, "client", None)
    if not client:
        raise HTTPException(status_code=500, detail="Database client not configured.")

    try:
        res = (
            client.table("user_roboflow_keys")
            .select("*")
            .eq("user_id", current_user["id"])
            .execute()
        )
        if not res.data:
            return RoboflowKeyResponse(has_key=False)

        row = res.data[0]
        encrypted_key = row["api_key"]
        try:
            decrypted_key = EncryptionService.decrypt(encrypted_key)
        except Exception:
            decrypted_key = ""

        masked = (
            decrypted_key[:4] + "..." + decrypted_key[-4:]
            if len(decrypted_key) > 8
            else "..."
        )

        return RoboflowKeyResponse(
            has_key=True,
            api_key_masked=masked,
            workspace=row.get("workspace"),
            workflow_id=row.get("workflow_id"),
            api_url=row.get("api_url"),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/roboflow-key", response_model=RoboflowKeyResponse)
async def save_roboflow_key(
    req: RoboflowKeySaveRequest, current_user: dict = Depends(get_current_user)
):
    """
    Saves or updates user-defined Roboflow credentials.
    """
    provider = DatabaseFactory.get_provider()
    client = getattr(provider, "client", None)
    if not client:
        raise HTTPException(status_code=500, detail="Database client not configured.")

    encrypted_key = None
    decrypted_key = ""
    if not req.api_key or req.api_key == "••••••••••••••••":
        try:
            res = (
                client.table("user_roboflow_keys")
                .select("api_key")
                .eq("user_id", current_user["id"])
                .execute()
            )
            if res.data:
                encrypted_key = res.data[0]["api_key"]
                try:
                    decrypted_key = EncryptionService.decrypt(encrypted_key)
                except Exception:
                    decrypted_key = ""
            else:
                raise HTTPException(status_code=400, detail="API Key is required.")
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    else:
        decrypted_key = req.api_key
        encrypted_key = EncryptionService.encrypt(req.api_key)

    payload = {
        "user_id": current_user["id"],
        "api_key": encrypted_key,
        "workspace": req.workspace,
        "workflow_id": req.workflow_id,
        "api_url": req.api_url,
    }

    try:
        client.table("user_roboflow_keys").upsert(payload).execute()
        masked = (
            decrypted_key[:4] + "..." + decrypted_key[-4:]
            if len(decrypted_key) > 8
            else "..."
        )
        return RoboflowKeyResponse(
            has_key=True,
            api_key_masked=masked,
            workspace=req.workspace,
            workflow_id=req.workflow_id,
            api_url=req.api_url,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/roboflow-key")
async def delete_roboflow_key(current_user: dict = Depends(get_current_user)):
    """
    Removes user-defined Roboflow credentials.
    """
    provider = DatabaseFactory.get_provider()
    client = getattr(provider, "client", None)
    if not client:
        raise HTTPException(status_code=500, detail="Database client not configured.")

    try:
        client.table("user_roboflow_keys").delete().eq(
            "user_id", current_user["id"]
        ).execute()
        return {"message": "Roboflow key configuration deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
