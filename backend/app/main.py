from typing import Any

import structlog
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from okey_server.logging_config import setup_logging
from okey_server.otel_config import setup_opentelemetry
from okey_server.registry import VisionProviderRegistry

# Import state configs and configurations
from okey_server.settings import OkeyServerSettings

# Import router modules
from app.routers import auth_router, solver_router, vision_router

# Setup logging
setup_logging()
logger = structlog.get_logger("okey_bridge_server")

# Initialize FastAPI App
app = FastAPI(
    title="Okey Solver Bridge API",
    description=(
        "Bridge microservice for solving Okey hand arrangements "
        "and detecting tiles from images."
    ),
    version="0.5.0",
)

# OpenTelemetry configuration
setup_opentelemetry(app)

# Load configuration and state
settings = OkeyServerSettings()
state: Any = app.state
state.settings = settings
state.provider_registry = VisionProviderRegistry()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/v1/health")
def health_check():
    return {
        "status": "ok",
        "version": "0.5.0",
        "vision_configured": settings.rf_key is not None,
    }


# Include routers under /api/v1 prefix
app.include_router(auth_router, prefix="/api/v1")
app.include_router(solver_router, prefix="/api/v1")
app.include_router(vision_router, prefix="/api/v1")
