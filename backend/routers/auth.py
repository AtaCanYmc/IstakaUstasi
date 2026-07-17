from fastapi import APIRouter, Depends

from dependencies.auth import get_current_user
from services.supabase_service import SupabaseService

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/sync")
async def sync_user(current_user: dict = Depends(get_current_user)):
    """
    Syncs authenticated Supabase auth.users into public.users table.
    Initializes quota and user metadata if the user record does not exist.
    """
    profile = await SupabaseService.sync_user_profile(
        user_id=current_user["id"],
        email=current_user["email"],
        username=current_user.get("username"),
    )
    return {"message": "User synchronized successfully", "profile": profile}
