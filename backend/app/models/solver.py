from typing import List, Optional

from okey_core.types import OkeyMeta, Tile
from pydantic import BaseModel


# backtracking, greedy, ilp, hybrid, beam, genetic, annealing, mcts
class ArrangeRequestCustom(BaseModel):
    tiles: List[Tile]
    okey_meta: Optional[OkeyMeta] = None
    strategy: Optional[str] = "backtracking"
    allow_one_after: Optional[bool] = True
