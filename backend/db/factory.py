import os
from typing import Optional

from db.base import IDatabaseProvider
from db.supabase import SupabaseDatabaseProvider


class DatabaseFactory:
    _provider: Optional[IDatabaseProvider] = None

    @classmethod
    def get_provider(cls) -> IDatabaseProvider:
        if cls._provider is None:
            provider_type = os.getenv("DB_PROVIDER", "supabase").lower()
            if provider_type == "supabase":
                cls._provider = SupabaseDatabaseProvider()
            else:
                raise ValueError(f"Unsupported database provider: {provider_type}")
        return cls._provider
