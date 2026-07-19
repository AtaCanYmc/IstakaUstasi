from typing import List, Optional

from okey_core.types import OkeyMeta, Tile
from pydantic import BaseModel


class ArrangeRequestCustom(BaseModel):
    tiles: List[Tile]
    okey_meta: Optional[OkeyMeta] = None
    strategy: Optional[str] = "backtracking"  # backtracking, greedy, ilp, hybrid
    allow_one_after: Optional[bool] = True
