from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from app.dependencies.auth import get_current_user
from app.main import app

client = TestClient(app)


async def override_get_current_user():
    return {"id": "test-user-id", "email": "test@example.com"}


@pytest.fixture(autouse=True)
def setup_overrides():
    app.dependency_overrides[get_current_user] = override_get_current_user
    yield
    app.dependency_overrides.clear()


@patch("app.db.DatabaseFactory.get_provider")
def test_roboflow_key_endpoints_flow(mock_get_provider):
    mock_client = MagicMock()
    mock_provider = MagicMock()
    mock_provider.client = mock_client
    mock_get_provider.return_value = mock_provider

    # 1. GET key (empty)
    mock_table = MagicMock()
    mock_client.table.return_value = mock_table
    mock_select = MagicMock()
    mock_table.select.return_value = mock_select
    mock_eq = MagicMock()
    mock_select.eq.return_value = mock_eq

    mock_eq.execute.return_value = MagicMock(data=[])

    response = client.get("/api/v1/auth/roboflow-key")
    assert response.status_code == 200
    assert response.json() == {
        "has_key": False,
        "api_key_masked": None,
        "workspace": None,
        "workflow_id": None,
        "api_url": None,
    }

    # 2. POST save key
    mock_upsert = MagicMock()
    mock_table.upsert.return_value = mock_upsert
    mock_upsert.execute.return_value = MagicMock()

    payload = {
        "api_key": "test_rf_key_value_long_enough",
        "workspace": "my-workspace",
        "workflow_id": "my-workflow",
        "api_url": "https://serverless.roboflow.com",
    }
    response = client.post("/api/v1/auth/roboflow-key", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["has_key"] is True
    assert data["api_key_masked"] == "test...ough"
    assert data["workspace"] == "my-workspace"

    # 3. GET key (configured)
    from app.services.encryption import EncryptionService

    encrypted_val = EncryptionService.encrypt("test_rf_key_value_long_enough")
    mock_eq.execute.return_value = MagicMock(
        data=[
            {
                "user_id": "test-user-id",
                "api_key": encrypted_val,
                "workspace": "my-workspace",
                "workflow_id": "my-workflow",
                "api_url": "https://serverless.roboflow.com",
            }
        ]
    )

    response = client.get("/api/v1/auth/roboflow-key")
    assert response.status_code == 200
    assert response.json()["api_key_masked"] == "test...ough"

    # 4. DELETE key
    mock_delete = MagicMock()
    mock_table.delete.return_value = mock_delete
    mock_delete_eq = MagicMock()
    mock_delete.eq.return_value = mock_delete_eq
    mock_delete_eq.execute.return_value = MagicMock()

    response = client.delete("/api/v1/auth/roboflow-key")
    assert response.status_code == 200
    assert "deleted successfully" in response.json()["message"]
