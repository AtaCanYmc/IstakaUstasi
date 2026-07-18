from typing import Any, Optional

import structlog
from fastapi import APIRouter, BackgroundTasks, Depends, Form, HTTPException, status

# Import okey types and functions
from okey_core.types import OkeyMeta, TileColor
from okey_server.dependencies import get_roboflow_workflow_provider

from app.dependencies.auth import get_current_user
from app.dependencies.image_validation import validate_and_sanitize_image
from app.models.vision import ExtractResultCustom, JobStatusResponse
from app.services.job_service import JobService
from app.services.user_service import UserService

logger = structlog.get_logger("okey_bridge_server.routers.vision")
router = APIRouter(prefix="/vision", tags=["Vision"])


async def run_extract_task(
    job_id: str, image_content: bytes, pipeline: Any, user_id: str
):
    from okey_vision import VisionEngine

    try:
        logger.info(
            "Starting background tile extraction", job_id=job_id, user_id=user_id
        )
        vision_engine = VisionEngine(pipeline=pipeline)
        tiles = await vision_engine.process_frame_async(image_content)
        raw_val = getattr(pipeline, "last_raw_response", None)

        result_model = ExtractResultCustom(tiles=tiles, raw=raw_val)
        if hasattr(result_model, "model_dump"):
            result = result_model.model_dump()
        else:
            result = result_model.dict()

        JobService.update_job_success(job_id, result)
        logger.info(
            "Tile extraction background task completed",
            job_id=job_id,
            user_id=user_id,
        )
    except Exception as e:
        logger.exception(
            "Background tile extraction failed", job_id=job_id, error=str(e)
        )
        JobService.update_job_failure(job_id, f"Vision provider error: {str(e)}")


async def run_solve_task(
    job_id: str,
    image_content: bytes,
    pipeline: Any,
    okey_meta: Optional[OkeyMeta],
    user_id: str,
):
    from okey_orchestrator import VisionSolverEngine

    try:
        logger.info("Starting background vision solver", job_id=job_id, user_id=user_id)
        engine = VisionSolverEngine(pipeline=pipeline, okey_meta=okey_meta)
        orchestrator_result = await engine.analyze_frame_async(image_content)

        if hasattr(orchestrator_result, "model_dump"):
            result = orchestrator_result.model_dump()
        elif hasattr(orchestrator_result, "dict"):
            result = orchestrator_result.dict()
        else:
            result = orchestrator_result

        JobService.update_job_success(job_id, result)
        logger.info(
            "Vision solver background task completed", job_id=job_id, user_id=user_id
        )
    except Exception as e:
        logger.exception("Background vision solver failed", job_id=job_id, error=str(e))
        JobService.update_job_failure(job_id, f"Vision/Solver pipeline error: {str(e)}")


@router.post(
    "/extract",
    response_model=JobStatusResponse,
    status_code=status.HTTP_202_ACCEPTED,
)
async def extract_vision(
    background_tasks: BackgroundTasks,
    image_content: bytes = Depends(validate_and_sanitize_image),
    pipeline: Any = Depends(get_roboflow_workflow_provider),
    current_user: dict = Depends(get_current_user),
):
    """
    Triggers detection and extraction of Okey tiles from an image.
    Runs asynchronously and returns a 202 Accepted status with a job ID.
    """
    # Check/Decrement quota
    if not await UserService.check_and_update_quota(current_user["id"]):
        raise HTTPException(
            status_code=402,
            detail="Quota exceeded. Weekly quota limits you to 5 image extractions.",
        )

    job_id = JobService.create_job()
    background_tasks.add_task(
        run_extract_task, job_id, image_content, pipeline, current_user["id"]
    )
    return JobStatusResponse(job_id=job_id, status="processing")


@router.post(
    "/solve", response_model=JobStatusResponse, status_code=status.HTTP_202_ACCEPTED
)
async def solve_vision(
    background_tasks: BackgroundTasks,
    okey_meta_color: Optional[TileColor] = Form(None),
    okey_meta_value: Optional[int] = Form(None),
    image_content: bytes = Depends(validate_and_sanitize_image),
    pipeline: Any = Depends(get_roboflow_workflow_provider),
    current_user: dict = Depends(get_current_user),
):
    """
    Processes an uploaded board image and directly solves the optimal arrangement.
    Runs asynchronously and returns a 202 Accepted status with a job ID.
    """
    # Check/Decrement quota
    if not await UserService.check_and_update_quota(current_user["id"]):
        raise HTTPException(
            status_code=402,
            detail="Quota exceeded. Weekly quota limits you to 5 image extractions.",
        )

    okey_meta = None
    if okey_meta_color and okey_meta_value is not None:
        okey_meta = OkeyMeta(color=okey_meta_color, value=okey_meta_value)

    job_id = JobService.create_job()
    background_tasks.add_task(
        run_solve_task,
        job_id,
        image_content,
        pipeline,
        okey_meta,
        current_user["id"],
    )
    return JobStatusResponse(job_id=job_id, status="processing")


@router.get("/jobs/{job_id}", response_model=JobStatusResponse)
async def get_job_status(job_id: str, current_user: dict = Depends(get_current_user)):
    """
    Retrieves the status of a specific background job by ID.
    """
    job = JobService.get_job(job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Job not found"
        )
    return JobStatusResponse(
        job_id=job_id,
        status=job["status"],
        result=job["result"],
        error=job["error"],
    )
