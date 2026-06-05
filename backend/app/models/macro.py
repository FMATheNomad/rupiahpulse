from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from uuid import UUID, uuid4

from sqlalchemy import DateTime, Index, Numeric, String
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin


class MacroSnapshot(Base, TimestampMixin):
    __tablename__ = "macro_snapshot"

    id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    timestamp_bucket: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, index=True
    )
    indicator: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    value: Mapped[Decimal] = mapped_column(Numeric(20, 6), nullable=False)
    unit: Mapped[str | None] = mapped_column(String(20), nullable=True)
    source: Mapped[str] = mapped_column(String(50), nullable=False)

    __table_args__ = (
        Index("ix_macro_snapshot_indicator_bucket", "indicator", "timestamp_bucket", unique=True),
    )
