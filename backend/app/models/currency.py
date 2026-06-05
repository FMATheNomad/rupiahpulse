from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from uuid import UUID, uuid4

from sqlalchemy import DateTime, Float, Index, Numeric, String
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin


class CurrencySnapshot(Base, TimestampMixin):
    __tablename__ = "currency_snapshot"

    id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    timestamp_bucket: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, index=True
    )
    pair: Mapped[str] = mapped_column(String(10), nullable=False, default="USD/IDR")
    rate: Mapped[Decimal] = mapped_column(Numeric(20, 6), nullable=False)
    high_24h: Mapped[Decimal | None] = mapped_column(Numeric(20, 6), nullable=True)
    low_24h: Mapped[Decimal | None] = mapped_column(Numeric(20, 6), nullable=True)
    change_24h_pct: Mapped[float | None] = mapped_column(Float, nullable=True)
    source: Mapped[str] = mapped_column(String(50), nullable=False, default="exchangerate.host")

    __table_args__ = (
        Index("ix_currency_snapshot_pair_bucket", "pair", "timestamp_bucket", unique=True),
    )
