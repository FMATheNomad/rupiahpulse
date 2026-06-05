from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class ExplanationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    timestamp_bucket: datetime
    explanation: str
    score: int
    category: str
    top_factors: str | None = None
    created_at: datetime
