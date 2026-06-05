from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel


class FactorBreakdown(BaseModel):
    factor: str
    subscore: float
    weight: float
    contribution: float
    raw_value: float | None = None
    change_24h_pct: float | None = None


class HealthIndexResponse(BaseModel):
    score: int
    category: str
    usd_idr_rate: float | None = None
    usd_idr_change_24h_pct: float | None = None
    timestamp_bucket: datetime
    factors: list[FactorBreakdown]
    explanation: str | None = None


class HealthIndexHistoryResponse(BaseModel):
    timestamp_bucket: datetime
    score: int
    category: str
