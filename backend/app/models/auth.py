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
