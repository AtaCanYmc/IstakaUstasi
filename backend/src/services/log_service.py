import logging
from typing import Any, Dict, Optional

from src.db import DatabaseFactory, ISystemLogRepository, SystemLogCreate

logger = logging.getLogger("okey_bridge_server")


class RepositoryFactory:
    @staticmethod
    def get_system_log_repository() -> ISystemLogRepository:
        return DatabaseFactory.get_provider().get_system_log_repository()


class LogService:
    @staticmethod
    async def log(
        log_provider: ISystemLogRepository,
        level: str,
        module: str,
        message: str,
        user_id: Optional[str] = None,
        request_id: Optional[str] = None,
        ip_address: Optional[str] = None,
        endpoint: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
    ):
        """Adds a new log entry to the pool.
        Only ERROR and CRITICAL logs are saved in the DB."""
        log_msg = f"[{module}] {message}"
        level_upper = level.upper()
        if level_upper in ["ERROR", "CRITICAL"]:
            logger.error(log_msg)
        elif level_upper == "WARNING":
            logger.warning(log_msg)
        else:
            logger.info(log_msg)

        # Only ERROR and CRITICAL levels are written to the database
        if level_upper not in ["ERROR", "CRITICAL"]:
            return

        try:
            log_entry = SystemLogCreate(
                level=level_upper,
                module=module.upper(),
                message=message,
                user_id=user_id,
                request_id=request_id,
                ip_address=ip_address,
                endpoint=endpoint,
                details=details,
            )
            await log_provider.create_log(log_entry)
        except Exception as e:
            # DB connection error will not crash the logging system itself
            logger.critical(
                f"[SYSTEM] Failed to write to log pool (DB)! Error: {str(e)}"
            )

    @staticmethod
    async def info(
        log_provider: ISystemLogRepository,
        module: str,
        message: str,
        user_id: Optional[str] = None,
        request_id: Optional[str] = None,
        ip_address: Optional[str] = None,
        endpoint: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
    ):
        await LogService.log(
            log_provider,
            "INFO",
            module,
            message,
            user_id,
            request_id,
            ip_address,
            endpoint,
            details,
        )

    @staticmethod
    async def error(
        log_provider: ISystemLogRepository,
        module: str,
        message: str,
        user_id: Optional[str] = None,
        request_id: Optional[str] = None,
        ip_address: Optional[str] = None,
        endpoint: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
    ):
        await LogService.log(
            log_provider,
            "ERROR",
            module,
            message,
            user_id,
            request_id,
            ip_address,
            endpoint,
            details,
        )

    @staticmethod
    async def warning(
        log_provider: ISystemLogRepository,
        module: str,
        message: str,
        user_id: Optional[str] = None,
        request_id: Optional[str] = None,
        ip_address: Optional[str] = None,
        endpoint: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
    ):
        await LogService.log(
            log_provider,
            "WARNING",
            module,
            message,
            user_id,
            request_id,
            ip_address,
            endpoint,
            details,
        )
