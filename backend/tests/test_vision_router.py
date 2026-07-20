import io
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from PIL import Image

from app.dependencies.auth import get_current_user
from app.main import app
from app.routers.vision import get_user_roboflow_provider
from app.services.job_service import JobService

client = TestClient(app)


async def override_get_current_user():
    return {"id": "test-user-id", "email": "test@example.com", "username": "testuser"}


async def override_get_roboflow_workflow_provider():
    return MagicMock()


@pytest.fixture(autouse=True)
def setup_overrides():
    app.dependency_overrides[get_current_user] = override_get_current_user
    app.dependency_overrides[get_user_roboflow_provider] = (
        override_get_roboflow_workflow_provider
    )
    JobService._jobs.clear()
    yield
    app.dependency_overrides.clear()


@patch(
    "app.routers.vision.has_user_custom_key",
    new_callable=AsyncMock,
)
@patch(
    "okey_vision.VisionEngine.process_frame_async",
    new_callable=AsyncMock,
)
@patch(
    "app.services.user_service.UserService.check_and_update_quota",
    new_callable=AsyncMock,
)
def test_extract_vision_success(mock_quota, mock_process, mock_custom_key):
    mock_quota.return_value = True
    mock_process.return_value = []
    mock_custom_key.return_value = False

    # Create simple valid image bytes
    img_byte_arr = io.BytesIO()
    image = Image.new("RGB", (100, 100), color="blue")
    image.save(img_byte_arr, format="PNG")
    img_byte_arr.seek(0)

    response = client.post(
        "/api/v1/vision/extract",
        files={"file": ("test.png", img_byte_arr, "image/png")},
    )

    assert response.status_code == 202
    data = response.json()
    assert "job_id" in data
    assert data["status"] == "processing"

    # Inspect the job in service
    job_id = data["job_id"]
    job = JobService.get_job(job_id)
    assert job is not None
    # Since TestClient runs background tasks synchronously before returning,
    # the job will actually be completed!
    assert job["status"] == "completed"


@patch(
    "app.routers.vision.has_user_custom_key",
    new_callable=AsyncMock,
)
@patch(
    "app.services.user_service.UserService.check_and_update_quota",
    new_callable=AsyncMock,
)
def test_extract_vision_quota_exceeded(mock_quota, mock_custom_key):
    mock_quota.return_value = False
    mock_custom_key.return_value = False

    # Create simple valid image bytes
    img_byte_arr = io.BytesIO()
    image = Image.new("RGB", (100, 100), color="blue")
    image.save(img_byte_arr, format="PNG")
    img_byte_arr.seek(0)

    response = client.post(
        "/api/v1/vision/extract",
        files={"file": ("test.png", img_byte_arr, "image/png")},
    )

    assert response.status_code == 402
    assert "Quota exceeded" in response.json()["detail"]


def test_get_job_status_not_found():
    response = client.get("/api/v1/vision/jobs/invalid-job-id")
    assert response.status_code == 404
    assert "Job not found" in response.json()["detail"]


def test_get_job_status_found():
    job_id = JobService.create_job()
    response = client.get(f"/api/v1/vision/jobs/{job_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["job_id"] == job_id
    assert data["status"] == "processing"


@patch(
    "app.routers.vision.has_user_custom_key",
    new_callable=AsyncMock,
)
@patch(
    "okey_orchestrator.VisionSolverEngine.analyze_frame_async",
    new_callable=AsyncMock,
)
@patch(
    "app.services.user_service.UserService.check_and_update_quota",
    new_callable=AsyncMock,
)
def test_solve_vision_success(mock_quota, mock_analyze, mock_custom_key):
    mock_quota.return_value = True
    from okey_core.types import Arrangement

    mock_analyze.return_value = Arrangement(melds=[], remainingTiles=[], totalScore=0)
    mock_custom_key.return_value = False

    # Create simple valid image bytes
    img_byte_arr = io.BytesIO()
    image = Image.new("RGB", (100, 100), color="blue")
    image.save(img_byte_arr, format="PNG")
    img_byte_arr.seek(0)

    response = client.post(
        "/api/v1/vision/solve",
        data={
            "strategy": "hybrid",
            "allow_one_after": "false",
        },
        files={"file": ("test.png", img_byte_arr, "image/png")},
    )

    assert response.status_code == 202
    data = response.json()
    assert "job_id" in data
