#!/usr/bin/env python3
"""Seed: 5 years realistic data + smooth health index."""
from __future__ import annotations

import asyncio
import random
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from uuid import uuid4

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

from app.core.config import settings
from app.models.currency import CurrencySnapshot
from app.models.macro import MacroSnapshot
from app.models.news import NewsCache
from app.models.explanation import ExplanationCache

engine = create_async_engine(settings.DATABASE_URL, echo=False)
SessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

ANCHORS = [
    ("2021-06-06", 14300),
    ("2021-09-01", 14100),
    ("2022-01-01", 14200),
    ("2022-04-01", 14400),
    ("2022-07-01", 14800),
    ("2022-10-01", 15200),
    ("2023-01-01", 15100),
    ("2023-04-01", 15000),
    ("2023-07-01", 15300),
    ("2023-10-01", 15600),
    ("2024-01-01", 15600),
    ("2024-04-01", 15800),
    ("2024-07-01", 16200),
    ("2024-10-01", 16400),
    ("2025-01-01", 16300),
    ("2025-04-01", 16500),
    ("2025-07-01", 16800),
    ("2025-10-01", 17200),
    ("2026-01-01", 17200),
    ("2026-04-01", 17600),
    ("2026-06-05", 18000),
]


def interpolate(target_date: datetime, anchors: list) -> float:
    target_ts = target_date.timestamp()
    for i in range(len(anchors) - 1):
        d1 = datetime.strptime(anchors[i][0], "%Y-%m-%d").replace(tzinfo=timezone.utc)
        d2 = datetime.strptime(anchors[i + 1][0], "%Y-%m-%d").replace(tzinfo=timezone.utc)
        if d1 <= target_date <= d2:
            frac = (target_ts - d1.timestamp()) / (d2.timestamp() - d1.timestamp())
            return anchors[i][1] + (anchors[i + 1][1] - anchors[i][1]) * frac
    if target_date < datetime.strptime(anchors[0][0], "%Y-%m-%d").replace(tzinfo=timezone.utc):
        return float(anchors[0][1])
    return float(anchors[-1][1])


async def seed():
    async with SessionLocal() as session:
        await session.execute(text("TRUNCATE currency_snapshot, macro_snapshot, news_cache, explanation_cache CASCADE"))

        now = datetime.now(timezone.utc)
        random.seed(42)
        start_date = now - timedelta(days=1825)

        # Currency snapshots - 5 years daily
        BATCH = 500
        for batch_start in range(0, 1825, BATCH):
            batch_end = min(batch_start + BATCH, 1825)
            for i in range(batch_start, batch_end):
                ts = start_date + timedelta(days=i)
                if ts > now:
                    break
                base = interpolate(ts, ANCHORS)
                noise = random.uniform(-60, 60)
                rate = round(base + noise, 2)
                bucket = ts.replace(hour=0, minute=0, second=0, microsecond=0)
                session.add(CurrencySnapshot(
                    timestamp_bucket=bucket, pair="USD/IDR",
                    rate=Decimal(str(rate)),
                    change_24h_pct=random.uniform(-1.0, 1.0),
                    source="open.er-api.com",
                ))
            await session.commit()
        print("  Currency: 1825/1825")

        # Macro snapshots
        for indicator, value, unit in [
            ("market_dxy", Decimal("99.400"), "index"),
            ("market_dxy_change", Decimal("0.01"), "pct"),
            ("market_oil", Decimal("93.000"), "usd"),
            ("market_oil_change", Decimal("0.50"), "pct"),
            ("market_gold", Decimal("4440.000"), "usd"),
            ("macro_inflation", Decimal("4.200"), "pct"),
            ("macro_fx_reserves", Decimal("135000.000"), "usd_million"),
            ("macro_trade_balance", Decimal("1500.000"), "usd_million"),
        ]:
            session.add(MacroSnapshot(
                timestamp_bucket=now.replace(hour=0, minute=0, second=0, microsecond=0),
                indicator=indicator, value=value, unit=unit, source="seed",
            ))
        await session.commit()

        # News cache
        for title, source, sentiment in [
            ("BI pertahankan suku bunga acuan di 6.0%", "Kompas", 0.2),
            ("Rupiah menguat didorong aliran modal asing", "Kontan", 0.5),
            ("Neraca dagang Indonesia surplus $3.2 miliar", "Bisnis.com", 0.4),
            ("The Fed isyaratkan pemangkasan suku bunga", "Reuters", 0.6),
            ("Harga minyak turun imbas kekhawatiran resesi", "Bloomberg", -0.3),
            ("Cadangan devisa Indonesia naik ke $145 miliar", "Bank Indonesia", 0.3),
        ]:
            session.add(NewsCache(
                article_id=str(uuid4()), title=title, source=source,
                url="",
                published_at=now - timedelta(hours=random.randint(1, 48)),
                sentiment_score=sentiment,
            ))
        await session.commit()

        # Explanation cache - 260 weeks smooth trend
        base_score_5y = 62
        for week in range(260):
            progress = week / 259
            score = int(base_score_5y - (progress * 28) + random.uniform(-4, 4))
            score = max(30, min(70, score))
            category = "Strong" if score >= 60 else "Neutral" if score >= 40 else "Weak"
            week_bucket = (now - timedelta(weeks=259 - week)).replace(hour=0, minute=0, second=0, microsecond=0)
            session.add(ExplanationCache(
                timestamp_bucket=week_bucket,
                metric_hash=f"seed_hash_{week:03d}",
                explanation=f"Rupiah dalam kondisi {category.lower()} dengan skor {score}/100.",
                score=score, category=category,
                top_factors=f"USD/IDR Rate:{score-5}, Oil:{score-10}, DXY:{score-15}, Inflation:{score-8}",
            ))
        await session.commit()
        print("Seed done: 1825 currency + 8 macro + 6 news + 260 explanations")


if __name__ == "__main__":
    asyncio.run(seed())
