from fastapi import APIRouter, Depends, HTTPException

from app.db import DatabaseFactory
from app.dependencies.auth import get_current_user
from app.models.auth import AuthResponse, UserLoginRequest, UserSignupRequest
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
        solver_quota_count=profile["solver_quota_count"],
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
