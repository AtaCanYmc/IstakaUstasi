import sys
import traceback

from fastapi import Request
from fastapi.responses import JSONResponse

from exceptions import DomainException


async def domain_exception_handler(request: Request, exc: DomainException):
    """
    Global exception handler for DomainException and its subclasses.
    Converts domain exceptions into standardized JSON responses.
    """
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.message, "error_type": exc.__class__.__name__},
    )


async def global_exception_handler(request: Request, exc: Exception):
    """Catch unhandled exceptions, log them with context"""

    ip_address = request.client.host if request.client else None
    endpoint = f"{request.method} {request.url.path}"
    request_id = request.headers.get("X-Request-ID")
    user_id = getattr(request.state, "user_id", None)

    error_msg = f"Unhandled Exception: {str(exc)}\n{traceback.format_exc()}"

    try:
        log_repo = RepositoryFactory.get_system_log_repository()
        await LogService.error(
            log_provider=log_repo,
            module="SYSTEM",
            message=error_msg,
            user_id=user_id,
            request_id=request_id,
            ip_address=ip_address,
            endpoint=endpoint,
        )
    except Exception as log_exc:
        print(f"Failed to save error log: {log_exc}", file=sys.stderr)

    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error. Please try again later."},
    )


def setup_exception_handlers(app):
    """Registers custom exception handlers with the FastAPI app."""
    app.add_exception_handler(DomainException, domain_exception_handler)
    app.add_exception_handler(Exception, global_exception_handler)
