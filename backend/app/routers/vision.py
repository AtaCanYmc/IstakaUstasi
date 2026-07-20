from typing import Any, Optional

import structlog
from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    Form,
    HTTPException,
    Request,
    status,
)

# Import okey types and functions
from okey_core.types import OkeyMeta, TileColor

from app.db import DatabaseFactory
from app.dependencies.auth import get_current_user
from app.dependencies.image_validation import validate_and_sanitize_image
from app.models.vision import ExtractResultCustom, JobStatusResponse
from app.services.encryption import EncryptionService
from app.services.job_service import JobService
from app.services.user_service import UserService
from app.utils.i18n import get_language, get_message

logger = structlog.get_logger("okey_bridge_server.routers.vision")
router = APIRouter(prefix="/vision", tags=["Vision"])


def parse_roboflow_error(error_msg: str, lang: str = "en") -> str:
    err_lower = error_msg.lower()
    if (
        "403" in error_msg
        or "unauthorized" in err_lower
        or "forbidden" in err_lower
        or "unauthorised" in err_lower
    ):
        return (
            "API anahtarınız hatalı, lütfen kontrol edin."
            if lang == "tr"
            else "Your API key is incorrect, please check."
        )
    if (
        "429" in error_msg
        or "quota" in err_lower
        or "limit" in err_lower
        or "too many requests" in err_lower
    ):
        return (
            "Roboflow limitsiz kullanım kotanız doldu veya limit aşıldı."
            if lang == "tr"
            else "Roboflow unlimited quota has been reached or rate limited."
        )
    return (
        f"Roboflow hatası: {error_msg}"
        if lang == "tr"
        else f"Roboflow error: {error_msg}"
    )


async def run_extract_task(
    job_id: str, image_content: bytes, pipeline: Any, user_id: str, lang: str = "en"
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
        error_detail = parse_roboflow_error(str(e), lang)
        JobService.update_job_failure(job_id, error_detail)


async def run_solve_task(
    job_id: str,
    image_content: bytes,
    pipeline: Any,
    okey_meta: Optional[OkeyMeta],
    user_id: str,
    allow_one_after: bool = True,
    strategy: str = "backtracking",
    lang: str = "en",
):
    from okey_orchestrator import VisionSolverEngine
    from okey_solver import create_standard_okey_solver

    try:
        logger.info("Starting background vision solver", job_id=job_id, user_id=user_id)
        solver = create_standard_okey_solver(strategy=strategy)
        if hasattr(solver, "meld_generator") and hasattr(
            solver.meld_generator, "validator"
        ):
            solver.meld_generator.validator.allow_one_after = allow_one_after

        engine = VisionSolverEngine(
            pipeline=pipeline, okey_meta=okey_meta, solver=solver
        )
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
        error_detail = parse_roboflow_error(str(e), lang)
        JobService.update_job_failure(job_id, error_detail)


async def has_user_custom_key(user_id: str) -> bool:
    provider = DatabaseFactory.get_provider()
    client = getattr(provider, "client", None)
    if not client:
        return False
    try:
        res = (
            client.table("user_roboflow_keys")
            .select("api_key")
            .eq("user_id", user_id)
            .execute()
        )
        return len(res.data) > 0
    except Exception:
        return False


async def get_user_roboflow_provider(
    request: Request, current_user: dict = Depends(get_current_user)
) -> Any:
    provider = DatabaseFactory.get_provider()
    client = getattr(provider, "client", None)
    if not client:
        raise HTTPException(
            status_code=500, detail=get_message(request, "db_not_configured")
        )

    try:
        res = (
            client.table("user_roboflow_keys")
            .select("*")
            .eq("user_id", current_user["id"])
            .execute()
        )
    except Exception as e:
        logger.error(
            "Failed to retrieve user Roboflow credentials",
            user_id=current_user["id"],
            error=str(e),
        )
        raise HTTPException(
            status_code=500, detail=get_message(request, "db_not_configured")
        )

    if not res.data:
        raise HTTPException(
            status_code=400,
            detail=get_message(request, "no_custom_key"),
        )

    row = res.data[0]
    workspace = row.get("workspace") or "ata-dc7ry"
    workflow_id = (
        row.get("workflow_id")
        or "okey-and-rummikub-vrummikub-p8akb-vr0ef-3-yolov8n-t1-logic"
    )
    api_url = row.get("api_url") or "https://serverless.roboflow.com"

    try:
        decrypted_key = EncryptionService.decrypt(row["api_key"])
    except Exception as e:
        logger.error(
            "Failed to decrypt user Roboflow credentials",
            user_id=current_user["id"],
            error=str(e),
        )
        raise HTTPException(
            status_code=500, detail=get_message(request, "decryption_error")
        )

    registry = request.app.state.provider_registry
    return registry.get_roboflow_workflow_provider(
        api_key=decrypted_key,
        workspace_name=workspace,
        workflow_id=workflow_id,
        api_url=api_url,
    )


@router.post(
    "/extract",
    response_model=JobStatusResponse,
    status_code=status.HTTP_202_ACCEPTED,
)
async def extract_vision(
    background_tasks: BackgroundTasks,
    request: Request,
    image_content: bytes = Depends(validate_and_sanitize_image),
    pipeline: Any = Depends(get_user_roboflow_provider),
    current_user: dict = Depends(get_current_user),
):
    """
    Triggers detection and extraction of Okey tiles from an image.
    Runs asynchronously and returns a 202 Accepted status with a job ID.
    """
    # Check/Decrement quota if user has no custom Roboflow key
    # (unlimited access for custom keys)
    if not await has_user_custom_key(current_user["id"]):
        if not await UserService.check_and_update_quota(current_user["id"]):
            raise HTTPException(
                status_code=402,
                detail=get_message(request, "quota_exceeded"),
            )

    job_id = JobService.create_job()
    background_tasks.add_task(
        run_extract_task,
        job_id,
        image_content,
        pipeline,
        current_user["id"],
        get_language(request),
    )
    return JobStatusResponse(job_id=job_id, status="processing")


@router.post(
    "/solve", response_model=JobStatusResponse, status_code=status.HTTP_202_ACCEPTED
)
async def solve_vision(
    background_tasks: BackgroundTasks,
    request: Request,
    okey_meta_color: Optional[TileColor] = Form(None),
    okey_meta_value: Optional[int] = Form(None),
    strategy: str = Form("backtracking"),
    allow_one_after: bool = Form(True),
    image_content: bytes = Depends(validate_and_sanitize_image),
    pipeline: Any = Depends(get_user_roboflow_provider),
    current_user: dict = Depends(get_current_user),
):
    """
    Processes an uploaded board image and directly solves the optimal arrangement.
    Runs asynchronously and returns a 202 Accepted status with a job ID.
    """
    # Check/Decrement quota if user has no custom Roboflow key
    # (unlimited access for custom keys)
    if not await has_user_custom_key(current_user["id"]):
        if not await UserService.check_and_update_quota(current_user["id"]):
            raise HTTPException(
                status_code=402,
                detail=get_message(request, "quota_exceeded"),
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
        allow_one_after,
        strategy,
        get_language(request),
    )
    return JobStatusResponse(job_id=job_id, status="processing")


@router.get("/jobs/{job_id}", response_model=JobStatusResponse)
async def get_job_status(
    job_id: str,
    request: Request,
    current_user: dict = Depends(get_current_user),
):
    """
    Retrieves the status of a specific background job by ID.
    """
    job = JobService.get_job(job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=get_message(request, "job_not_found"),
        )
    return JobStatusResponse(
        job_id=job_id,
        status=job["status"],
        result=job["result"],
        error=job["error"],
    )
