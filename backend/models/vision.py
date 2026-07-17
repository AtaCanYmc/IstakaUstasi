from typing import List, Optional, Any
from pydantic import BaseModel
from okey_core.types import Tile

class ExtractResultCustom(BaseModel):
    tiles: List[Tile]
    raw: Optional[Any] = None
