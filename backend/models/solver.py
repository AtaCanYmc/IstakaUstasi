from typing import List, Optional
from pydantic import BaseModel
from okey_core.types import Tile, OkeyMeta

class ArrangeRequestCustom(BaseModel):
    tiles: List[Tile]
    okey_meta: Optional[OkeyMeta] = None
    strategy: Optional[str] = "backtracking" # backtracking, greedy, ilp, hybrid
