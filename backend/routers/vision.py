from typing import List, Optional, Any
from fastapi import APIRouter, Depends, Form, HTTPException
import structlog

# Import okey types and functions
from okey_core.types import Tile, OkeyMeta, TileColor, OrchestratorResult
from okey_server.dependencies import validate_image_file, get_roboflow_workflow_provider
from pydantic import BaseModel

logger = structlog.get_logger("okey_bridge_server.routers.vision")
router = APIRouter(prefix="/vision", tags=["Vision"])

class ExtractResultCustom(BaseModel):
    tiles: List[Tile]
    raw: Optional[Any] = None

@router.post("/extract", response_model=ExtractResultCustom)
async def extract_vision(
    image_content: bytes = Depends(validate_image_file),
    pipeline: Any = Depends(get_roboflow_workflow_provider),
):
    """
    Detects and extracts the list of Okey tiles from an uploaded image using Roboflow workflows.
    """
    from okey_vision import VisionEngine
    
    try:
        logger.info("Extracting tiles from image")
        vision_engine = VisionEngine(pipeline=pipeline)
        tiles = await vision_engine.process_frame_async(image_content)
        raw_val = getattr(pipeline, "last_raw_response", None)
        return ExtractResultCustom(tiles=tiles, raw=raw_val)
    except Exception as e:
        logger.exception("Vision processing error occurred", error=str(e))
        raise HTTPException(
            status_code=500, detail=f"Vision provider error: {str(e)}"
        )

@router.post("/solve", response_model=OrchestratorResult)
async def solve_vision(
    okey_meta_color: Optional[TileColor] = Form(None),
    okey_meta_value: Optional[int] = Form(None),
    image_content: bytes = Depends(validate_image_file),
    pipeline: Any = Depends(get_roboflow_workflow_provider),
):
    """
    Processes an uploaded board image and directly solves the optimal arrangement.
    """
    from okey_orchestrator import VisionSolverEngine

    okey_meta = None
    if okey_meta_color and okey_meta_value is not None:
        okey_meta = OkeyMeta(color=okey_meta_color, value=okey_meta_value)

    try:
        logger.info("Extracting and solving arrangement from image")
        engine = VisionSolverEngine(pipeline=pipeline, okey_meta=okey_meta)
        return await engine.analyze_frame_async(image_content)
    except Exception as e:
        logger.exception("Unexpected error in vision-solve pipeline", error=str(e))
        raise HTTPException(
            status_code=500, detail=f"Vision/Solver pipeline error: {str(e)}"
        )
