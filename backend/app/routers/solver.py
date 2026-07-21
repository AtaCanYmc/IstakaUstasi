import structlog
from fastapi import APIRouter, HTTPException, Request

# Import okey types and functions
from okey_core.types import Arrangement
from okey_solver import create_standard_okey_solver

from app.models.solver import ArrangeRequestCustom
from app.utils.i18n import get_message

logger = structlog.get_logger("okey_bridge_server.routers.solver")
router = APIRouter(prefix="/solver", tags=["Solver"])


@router.post("/arrange", response_model=Arrangement)
def arrange_hand(req: ArrangeRequestCustom, request: Request):
    """
    Solves and arranges a given list of Okey tiles into optimal melds.
    Supports strategy selection:
    'backtracking', 'greedy', 'ilp', 'hybrid', 'beam', 'genetic', 'annealing', 'mcts'.
    """
    strategy = req.strategy or "backtracking"
    strategy = strategy.lower()

    valid_strategies = [
        "backtracking",
        "greedy",
        "ilp",
        "hybrid",
        "beam",
        "genetic",
        "annealing",
        "mcts",
    ]
    if strategy not in valid_strategies:
        raise HTTPException(
            status_code=400,
            detail=get_message(
                request,
                "invalid_strategy",
                strategy=strategy,
                supported=", ".join(valid_strategies),
            ),
        )

    try:
        logger.info("Solving hand", tiles_count=len(req.tiles), strategy=strategy)
        solver = create_standard_okey_solver(strategy=strategy)
        if hasattr(solver, "meld_generator") and hasattr(
            solver.meld_generator, "validator"
        ):
            solver.meld_generator.validator.allow_one_after = req.allow_one_after
        return solver.find_best_arrangement(req.tiles, req.okey_meta)
    except ValueError as e:
        logger.warn("Validation error in solver", error=str(e))
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.exception("Unexpected server error in solver", error=str(e))
        raise HTTPException(
            status_code=500,
            detail=get_message(request, "internal_error", error=str(e)),
        )
