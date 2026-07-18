from typing import Any, List, Optional

from okey_core.types import Tile
from pydantic import BaseModel


class ExtractResultCustom(BaseModel):
    tiles: List[Tile]
    raw: Optional[Any] = None


class JobStatusResponse(BaseModel):
    job_id: str
    status: str
    result: Optional[Any] = None
    error: Optional[str] = None
