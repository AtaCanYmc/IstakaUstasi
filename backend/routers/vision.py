from typing import Any, Optional

import structlog
from fastapi import APIRouter, Depends, Form, HTTPException

# Import okey types and functions
from okey_core.types import OkeyMeta, OrchestratorResult, TileColor
from okey_server.dependencies import get_roboflow_workflow_provider, validate_image_file

from dependencies.auth import get_current_user
from models.vision import ExtractResultCustom
from services.supabase_service import SupabaseService

logger = structlog.get_logger("okey_bridge_server.routers.vision")
router = APIRouter(prefix="/vision", tags=["Vision"])


@router.post("/extract", response_model=ExtractResultCustom)
async def extract_vision(
    image_content: bytes = Depends(validate_image_file),
    pipeline: Any = Depends(get_roboflow_workflow_provider),
    current_user: dict = Depends(get_current_user),
):
    """
    Detects and extracts Okey tiles from an image using Roboflow.
    Requires user auth and decrements extraction quota.
    """
    # Check/Decrement quota
    if not SupabaseService.check_and_update_quota(current_user["id"]):
        raise HTTPException(
            status_code=402,
            detail="Quota exceeded. Weekly quota limits you to 5 image extractions.",
        )

    from okey_vision import VisionEngine

    try:
        logger.info("Extracting tiles from image", user_id=current_user["id"])
        vision_engine = VisionEngine(pipeline=pipeline)
        tiles = await vision_engine.process_frame_async(image_content)
        raw_val = getattr(pipeline, "last_raw_response", None)
        return ExtractResultCustom(tiles=tiles, raw=raw_val)
    except Exception as e:
        logger.exception("Vision processing error occurred", error=str(e))
        raise HTTPException(status_code=500, detail=f"Vision provider error: {str(e)}")


@router.post("/solve", response_model=OrchestratorResult)
async def solve_vision(
    okey_meta_color: Optional[TileColor] = Form(None),
    okey_meta_value: Optional[int] = Form(None),
    image_content: bytes = Depends(validate_image_file),
    pipeline: Any = Depends(get_roboflow_workflow_provider),
    current_user: dict = Depends(get_current_user),
):
    """
    Processes an uploaded board image and directly solves the optimal arrangement.
    Requires user auth and decrements extraction quota.
    """
    # Check/Decrement quota
    if not SupabaseService.check_and_update_quota(current_user["id"]):
        raise HTTPException(
            status_code=402,
            detail="Quota exceeded. Weekly quota limits you to 5 image extractions.",
        )

    from okey_orchestrator import VisionSolverEngine

    okey_meta = None
    if okey_meta_color and okey_meta_value is not None:
        okey_meta = OkeyMeta(color=okey_meta_color, value=okey_meta_value)

    try:
        logger.info(
            "Extracting and solving arrangement from image",
            user_id=current_user["id"],
        )
        engine = VisionSolverEngine(pipeline=pipeline, okey_meta=okey_meta)
        return await engine.analyze_frame_async(image_content)
    except Exception as e:
        logger.exception("Unexpected error in vision-solve pipeline", error=str(e))
        raise HTTPException(
            status_code=500, detail=f"Vision/Solver pipeline error: {str(e)}"
        )
