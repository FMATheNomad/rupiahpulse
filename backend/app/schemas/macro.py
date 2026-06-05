from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class MacroSnapshotCreate(BaseModel):
    timestamp_bucket: datetime
    indicator: str
    value: Decimal
    unit: str | None = None
    source: str


class MacroSnapshotResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    timestamp_bucket: datetime
    indicator: str
    value: Decimal
    unit: str | None = None
    source: str
    created_at: datetime
