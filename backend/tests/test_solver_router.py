from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_solver_arrange_allow_one_after_true():
    # 12-13-1 run is allowed by default
    payload = {
        "tiles": [
            {"id": "r12", "color": "RED", "value": 12},
            {"id": "r13", "color": "RED", "value": 13},
            {"id": "r1", "color": "RED", "value": 1},
            # Add some dummy tiles so solver doesn't fail basic size checks
            {"id": "b1", "color": "BLUE", "value": 5},
            {"id": "b2", "color": "BLUE", "value": 6},
            {"id": "b3", "color": "BLUE", "value": 7},
        ],
        "okey_meta": None,
        "strategy": "backtracking",
        "allow_one_after": True,
    }
    response = client.post("/api/v1/solver/arrange", json=payload)
    assert response.status_code == 200
    data = response.json()

    # Confirm RED 12, 13, 1 are in a SERI meld
    melds = data["melds"]
    seri_melds = [m for m in melds if m["type"] == "SERI"]
    assert len(seri_melds) >= 1

    # One of the seri melds should contain values 12, 13, 1
    has_circular = False
    for m in seri_melds:
        values = {t["value"] for t in m["tiles"]}
        if 12 in values and 13 in values and 1 in values:
            has_circular = True
            break
    assert has_circular


def test_solver_arrange_allow_one_after_false():
    # 12-13-1 run is disallowed
    payload = {
        "tiles": [
            {"id": "r12", "color": "RED", "value": 12},
            {"id": "r13", "color": "RED", "value": 13},
            {"id": "r1", "color": "RED", "value": 1},
            {"id": "b1", "color": "BLUE", "value": 5},
            {"id": "b2", "color": "BLUE", "value": 6},
            {"id": "b3", "color": "BLUE", "value": 7},
        ],
        "okey_meta": None,
        "strategy": "backtracking",
        "allow_one_after": False,
    }
    response = client.post("/api/v1/solver/arrange", json=payload)
    assert response.status_code == 200
    data = response.json()

    # Confirm RED 12, 13, 1 are NOT in a SERI meld (because allow_one_after is False)
    melds = data["melds"]
    seri_melds = [m for m in melds if m["type"] == "SERI"]

    has_circular = False
    for m in seri_melds:
        values = {t["value"] for t in m["tiles"]}
        if 12 in values and 13 in values and 1 in values:
            has_circular = True
            break
    assert not has_circular
