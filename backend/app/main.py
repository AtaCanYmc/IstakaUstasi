from typing import Any

import structlog
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from okey_server.logging_config import setup_logging
from okey_server.otel_config import setup_opentelemetry
from okey_server.registry import VisionProviderRegistry

# Monkeypatch InferenceHTTPClient.run_workflow to handle both
# "images" and "image" parameters
try:
    from inference_sdk import InferenceHTTPClient

    original_run_workflow = InferenceHTTPClient.run_workflow

    def patched_run_workflow(self, *args, **kwargs):
        if "images" in kwargs and isinstance(kwargs["images"], dict):
            images_dict = kwargs["images"]
            if "images" in images_dict and "image" not in images_dict:
                images_dict["image"] = images_dict["images"]
            elif "image" in images_dict and "images" not in images_dict:
                images_dict["images"] = images_dict["image"]
        return original_run_workflow(self, *args, **kwargs)

    InferenceHTTPClient.run_workflow = patched_run_workflow
except ImportError:
    pass

# Monkeypatch OkeyRuleValidator.evaluate_group
# to support dynamic allow_one_after configuration
try:
    from okey_solver.rules import MeldType, OkeyRuleValidator

    original_evaluate_group = OkeyRuleValidator.evaluate_group

    def patched_evaluate_group(self, tiles, okey_meta=None):
        allow_one = getattr(self, "allow_one_after", True)
        if self.is_per(tiles, okey_meta):
            return MeldType.PER
        if self.is_seri(tiles, allow_one, okey_meta):
            return MeldType.SERI
        if len(tiles) == 2 and self.is_tiles_same(tiles[0], tiles[1], okey_meta):
            return MeldType.CIFT
        return MeldType.INVALID

    OkeyRuleValidator.evaluate_group = patched_evaluate_group
except ImportError:
    pass

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
        "https://atacanymc.github.io",
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
