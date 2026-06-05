from __future__ import annotations

from datetime import datetime, timedelta, timezone
from decimal import Decimal

from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.currency import CurrencySnapshot
from app.models.macro import MacroSnapshot


class CurrencyRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def upsert(self, data: dict) -> CurrencySnapshot:
        ts = data["timestamp_bucket"]
        pair = data.get("pair", "USD/IDR")
        stmt = select(CurrencySnapshot).where(
            CurrencySnapshot.pair == pair,
            CurrencySnapshot.timestamp_bucket == ts,
        )
        result = await self.session.execute(stmt)
        existing = result.scalar_one_or_none()
        if existing:
            for key, val in data.items():
                setattr(existing, key, val)
            obj = existing
        else:
            obj = CurrencySnapshot(**data)
            self.session.add(obj)
        await self.session.flush()
        return obj

    async def get_latest(self, pair: str = "USD/IDR") -> CurrencySnapshot | None:
        stmt = (
            select(CurrencySnapshot)
            .where(CurrencySnapshot.pair == pair)
            .order_by(desc(CurrencySnapshot.timestamp_bucket))
            .limit(1)
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_history(
        self,
        pair: str = "USD/IDR",
        from_ts: datetime | None = None,
        to_ts: datetime | None = None,
        limit: int = 100,
        offset: int = 0,
    ) -> list[CurrencySnapshot]:
        stmt = select(CurrencySnapshot).where(CurrencySnapshot.pair == pair)
        if from_ts:
            stmt = stmt.where(CurrencySnapshot.timestamp_bucket >= from_ts)
        if to_ts:
            stmt = stmt.where(CurrencySnapshot.timestamp_bucket <= to_ts)
        stmt = stmt.order_by(desc(CurrencySnapshot.timestamp_bucket)).limit(limit).offset(offset)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())


class MacroRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def upsert(self, data: dict) -> MacroSnapshot:
        ts = data["timestamp_bucket"]
        indicator = data["indicator"]
        stmt = select(MacroSnapshot).where(
            MacroSnapshot.indicator == indicator,
            MacroSnapshot.timestamp_bucket == ts,
        )
        result = await self.session.execute(stmt)
        existing = result.scalar_one_or_none()
        if existing:
            for key, val in data.items():
                setattr(existing, key, val)
            obj = existing
        else:
            obj = MacroSnapshot(**data)
            self.session.add(obj)
        await self.session.flush()
        return obj

    async def get_latest_value(
        self, indicator: str, lookback_hours: int = 48
    ) -> MacroSnapshot | None:
        cutoff = datetime.now(timezone.utc) - timedelta(hours=lookback_hours)
        stmt = (
            select(MacroSnapshot)
            .where(
                MacroSnapshot.indicator == indicator,
                MacroSnapshot.timestamp_bucket >= cutoff,
            )
            .order_by(desc(MacroSnapshot.timestamp_bucket))
            .limit(1)
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_history(
        self,
        indicator: str,
        from_ts: datetime | None = None,
        to_ts: datetime | None = None,
        limit: int = 100,
        offset: int = 0,
    ) -> list[MacroSnapshot]:
        stmt = select(MacroSnapshot).where(MacroSnapshot.indicator == indicator)
        if from_ts:
            stmt = stmt.where(MacroSnapshot.timestamp_bucket >= from_ts)
        if to_ts:
            stmt = stmt.where(MacroSnapshot.timestamp_bucket <= to_ts)
        stmt = stmt.order_by(desc(MacroSnapshot.timestamp_bucket)).limit(limit).offset(offset)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())
