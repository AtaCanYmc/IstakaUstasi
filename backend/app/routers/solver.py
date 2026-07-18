import structlog
from fastapi import APIRouter, HTTPException

# Import okey types and functions
from okey_core.types import Arrangement
from okey_solver import create_standard_okey_solver

from app.models.solver import ArrangeRequestCustom

logger = structlog.get_logger("okey_bridge_server.routers.solver")
router = APIRouter(prefix="/solver", tags=["Solver"])


@router.post("/arrange", response_model=Arrangement)
def arrange_hand(req: ArrangeRequestCustom):
    """
    Solves and arranges a given list of Okey tiles into optimal melds.
    Supports strategy selection: 'backtracking', 'greedy', 'ilp', 'hybrid'.
    """
    strategy = req.strategy or "backtracking"
    strategy = strategy.lower()

    valid_strategies = ["backtracking", "greedy", "ilp", "hybrid"]
    if strategy not in valid_strategies:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Invalid strategy '{strategy}'. "
                f"Supported strategies: {', '.join(valid_strategies)}"
            ),
        )

    try:
        logger.info("Solving hand", tiles_count=len(req.tiles), strategy=strategy)
        solver = create_standard_okey_solver(strategy=strategy)
        return solver.find_best_arrangement(req.tiles, req.okey_meta)
    except ValueError as e:
        logger.warn("Validation error in solver", error=str(e))
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.exception("Unexpected server error in solver", error=str(e))
        raise HTTPException(
            status_code=500, detail=f"An internal server error occurred: {str(e)}"
        )
