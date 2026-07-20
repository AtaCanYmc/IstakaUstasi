from typing import Optional

from pydantic import BaseModel, EmailStr

from app.db.base import UserProfile


class UserSignupRequest(BaseModel):
    email: EmailStr
    password: str
    username: Optional[str] = None


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    user: UserProfile


class RoboflowKeySaveRequest(BaseModel):
    api_key: str
    workspace: Optional[str] = None
    workflow_id: Optional[str] = None
    api_url: Optional[str] = None


class RoboflowKeyResponse(BaseModel):
    has_key: bool
    api_key_masked: Optional[str] = None
    workspace: Optional[str] = None
    workflow_id: Optional[str] = None
    api_url: Optional[str] = None


class ProfileUpdateRequest(BaseModel):
    username: str
