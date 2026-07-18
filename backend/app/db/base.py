from abc import ABC, abstractmethod
from typing import Any, Dict, Optional

from pydantic import BaseModel


class SystemLogCreate(BaseModel):
    level: str
    module: str
    message: str
    user_id: Optional[str] = None
    request_id: Optional[str] = None
    ip_address: Optional[str] = None
    endpoint: Optional[str] = None
    details: Optional[Dict[str, Any]] = None


class UserProfile(BaseModel):
    id: str
    email: str
    username: Optional[str] = None
    image_quota_count: int
    solver_quota_count: int
    last_reset_date: str
    created_at: str
    updated_at: str


class IUserRepository(ABC):
    @abstractmethod
    async def get_user(self, user_id: str) -> Optional[UserProfile]:
        """Retrieve user profile by ID"""
        pass

    @abstractmethod
    async def create_user(
        self,
        user_id: str,
        email: str,
        username: Optional[str] = None,
        initial_image_quota: int = 5,
        initial_solver_quota: int = 100,
    ) -> UserProfile:
        """Create new user profile"""
        pass

    @abstractmethod
    async def update_user(self, user_id: str, updates: Dict[str, Any]) -> UserProfile:
        """Update user profile fields"""
        pass


class ISystemLogRepository(ABC):
    @abstractmethod
    async def create_log(self, log_entry: SystemLogCreate) -> None:
        """Create log entry in database"""
        pass


class IDatabaseProvider(ABC):
    @abstractmethod
    def get_user_repository(self) -> IUserRepository:
        """Get the user repository instance"""
        pass

    @abstractmethod
    def get_system_log_repository(self) -> ISystemLogRepository:
        """Get the system log repository instance"""
        pass

    @abstractmethod
    async def verify_token(self, token: str) -> dict:
        """Verify JWT/auth token and return user metadata"""
        pass
