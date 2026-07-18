# Routers package
from routers.auth import router as auth_router
from routers.solver import router as solver_router
from routers.vision import router as vision_router

__all__ = ["auth_router", "solver_router", "vision_router"]
