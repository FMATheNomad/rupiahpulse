from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class CurrencySnapshotCreate(BaseModel):
    timestamp_bucket: datetime
    pair: str = "USD/IDR"
    rate: Decimal
    high_24h: Decimal | None = None
    low_24h: Decimal | None = None
    change_24h_pct: float | None = None
    source: str = "open.er-api.com"


class CurrencySnapshotResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    timestamp_bucket: datetime
    pair: str
    rate: Decimal
    high_24h: Decimal | None = None
    low_24h: Decimal | None = None
    change_24h_pct: float | None = None
    source: str
    created_at: datetime


class CurrencyHistoryResponse(BaseModel):
    timestamp_bucket: datetime
    rate: float
    change_24h_pct: float | None = None
