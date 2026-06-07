from __future__ import annotations

import asyncio
from datetime import datetime, timezone, timedelta
from decimal import Decimal

import structlog
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db.session import async_session_factory
from app.models.currency import CurrencySnapshot
from app.models.macro import MacroSnapshot
from app.models.news import NewsCache
from app.models.explanation import ExplanationCache
from app.services.data_provider import DataProvider, DataProviderError
from app.services.scoring import ScoringEngine
from app.services.explanation import ExplanationEngine
from app.services.repository import CurrencyRepository, MacroRepository

logger = structlog.get_logger(__name__)


class JobResult:
    def __init__(self, name: str):
        self.name = name
        self.success = True
        self.error: str | None = None

    def fail(self, error: str):
        self.success = False
        self.error = error
        logger.error("job_failed", job=self.name, error=error)


CURRENCY_PAIRS = ["USD/IDR", "SGD/IDR", "MYR/IDR", "CNY/IDR", "JPY/IDR", "THB/IDR", "EUR/IDR", "GBP/IDR", "AUD/IDR"]

async def run_currency_job():
    result = JobResult("currency_fetch")
    try:
        provider = DataProvider()
        usd_idr = await provider.fetch_usd_idr()
        now = datetime.now(timezone.utc)
        bucket = now.replace(minute=(now.minute // 5) * 5, second=0, microsecond=0)

        async with async_session_factory() as session:
            repo = CurrencyRepository(session)
            await repo.upsert({
                "timestamp_bucket": bucket,
                "pair": "USD/IDR",
                "rate": usd_idr["rate"],
                "source": usd_idr["source"],
            })
            await session.commit()

        logger.info("currency_job_completed", rate=str(usd_idr["rate"]))
    except DataProviderError as e:
        result.fail(str(e))
    return result


async def run_currencies_job():
    result = JobResult("currencies_fetch")
    try:
        provider = DataProvider()
        rates = await provider.fetch_all_currencies()
        now = datetime.now(timezone.utc)
        bucket = now.replace(minute=0, second=0, microsecond=0)

        async with async_session_factory() as session:
            repo = CurrencyRepository(session)
            for item in rates:
                if item["pair"] != "USD/IDR":
                    await repo.upsert({
                        "timestamp_bucket": bucket,
                        "pair": item["pair"],
                        "rate": item["rate"],
                        "source": item["source"],
                    })
            await session.commit()

        logger.info("currencies_job_completed", count=len(rates))
    except Exception as e:
        result.fail(str(e))
    return result


async def run_market_job():
    result = JobResult("market_fetch")
    try:
        provider = DataProvider()
        dxy = await provider.fetch_dxy()
        oil = await provider.fetch_oil()
        gold = await provider.fetch_gold()
        ihsg = await provider.fetch_ihsg()
        now = datetime.now(timezone.utc)
        bucket = now.replace(minute=(now.minute // 5) * 5, second=0, microsecond=0)

        async with async_session_factory() as session:
            repo = MacroRepository(session)
            for indicator, data in [("DXY", dxy), ("Oil", oil), ("Gold", gold), ("IHSG", ihsg)]:
                await repo.upsert({
                    "timestamp_bucket": bucket,
                    "indicator": f"market_{indicator.lower()}",
                    "value": Decimal(str(data["close"])),
                    "unit": "index" if indicator == "DXY" else "usd",
                    "source": data["source"],
                })
                if data.get("change_pct") is not None:
                    await repo.upsert({
                        "timestamp_bucket": bucket,
                        "indicator": f"market_{indicator.lower()}_change",
                        "value": Decimal(str(data["change_pct"])),
                        "unit": "pct",
                        "source": data["source"],
                    })
            await session.commit()

        logger.info("market_job_completed", dxy=dxy["close"], oil=oil["close"])
    except DataProviderError as e:
        result.fail(str(e))
    return result


async def run_macro_daily_job():
    result = JobResult("macro_daily")
    try:
        provider = DataProvider()
        now = datetime.now(timezone.utc)
        bucket = now.replace(hour=0, minute=0, second=0, microsecond=0)

        indicators = {
            "inflation": "FP.CPI.TOTL.ZG",
            "fx_reserves": "FI.RES.TOTL.CD",
            "trade_balance": "BN.GSR.GNFS.CD",
        }

        async with async_session_factory() as session:
            repo = MacroRepository(session)
            for name, code in indicators.items():
                macro = await provider.fetch_macro_world_bank(code)
                await repo.upsert({
                    "timestamp_bucket": bucket,
                    "indicator": f"macro_{name}",
                    "value": macro["value"],
                    "unit": "pct" if name == "inflation" else "usd",
                    "source": macro["source"],
                })
            await session.commit()

        logger.info("macro_daily_job_completed")
    except DataProviderError as e:
        result.fail(str(e))
    return result


async def run_news_job():
    result = JobResult("news_fetch")
    try:
        provider = DataProvider()
        articles = await provider.fetch_gdelt_news()

        async with async_session_factory() as session:
            for article in articles:
                article_id = article.get("url", "") or article.get("title", "")
                stmt = select(NewsCache).where(NewsCache.article_id == article_id)
                existing = (await session.execute(stmt)).scalar_one_or_none()
                if not existing:
                    session.add(NewsCache(
                        article_id=article_id,
                        title=article["title"],
                        source=article["source"],
                        url=article["url"],
                        published_at=datetime.now(timezone.utc),
                        sentiment_score=article.get("sentiment_score"),
                    ))
            await session.commit()

        logger.info("news_job_completed", count=len(articles))
    except DataProviderError as e:
        result.fail(str(e))
    return result


async def run_health_index_job():
    result = JobResult("health_index_calc")
    try:
        now = datetime.now(timezone.utc)
        bucket = now.replace(minute=(now.minute // 5) * 5, second=0, microsecond=0)

        async with async_session_factory() as session:
            currency_repo = CurrencyRepository(session)
            macro_repo = MacroRepository(session)

            latest_currency = await currency_repo.get_latest("USD/IDR")
            if not latest_currency:
                result.fail("No currency data available")
                return result

            dxy = await macro_repo.get_latest_value("market_dxy")
            dxy_change = await macro_repo.get_latest_value("market_dxy_change")
            oil = await macro_repo.get_latest_value("market_oil")
            oil_change = await macro_repo.get_latest_value("market_oil_change")
            inflation = await macro_repo.get_latest_value("macro_inflation", lookback_hours=720)
            fx_reserves = await macro_repo.get_latest_value("macro_fx_reserves", lookback_hours=720)
            trade_balance = await macro_repo.get_latest_value("macro_trade_balance", lookback_hours=720)

            sentiment_stmt = select(func.avg(NewsCache.sentiment_score))
            sentiment_result = await session.execute(sentiment_stmt)
            avg_sentiment = sentiment_result.scalar() or 0.0

            factors = {
                "dxy_change_pct": float(dxy_change.value) if dxy_change else None,
                "dxy_raw": float(dxy.value) if dxy else None,
                "oil_change_pct": float(oil_change.value) if oil_change else None,
                "oil_raw": float(oil.value) if oil else None,
                "inflation_rate": float(inflation.value) if inflation else None,
                "inflation_raw": float(inflation.value) if inflation else None,
                "fx_reserves": float(fx_reserves.value) if fx_reserves else None,
                "fx_reserves_raw": float(fx_reserves.value) if fx_reserves else None,
                "fx_reserves_median": 130000.0,
                "trade_balance": float(trade_balance.value) if trade_balance else None,
                "trade_balance_raw": float(trade_balance.value) if trade_balance else None,
                "sentiment": avg_sentiment,
                "sentiment_raw": avg_sentiment,
                "usd_idr_rate": float(latest_currency.rate) if latest_currency else None,
            }

            engine = ScoringEngine()
            score, computed = engine.compute(factors)

            category = engine.get_category(score)

            expl_engine = ExplanationEngine()
            metric_hash = expl_engine.build_metric_hash(factors)
            explanation = expl_engine.generate(
                score, category, computed,
                float(latest_currency.change_24h_pct) if latest_currency.change_24h_pct else None,
                float(latest_currency.rate),
            )

            stmt = select(ExplanationCache).where(
                ExplanationCache.metric_hash == metric_hash,
                ExplanationCache.timestamp_bucket == bucket,
            )
            existing_expl = (await session.execute(stmt)).scalar_one_or_none()
            if not existing_expl:
                top_factors_str = ", ".join(
                    f"{f.name}:{f.subscore:.1f}" for f in sorted(computed, key=lambda x: x.weight * abs(x.subscore - 50), reverse=True)[:4]
                )
                session.add(ExplanationCache(
                    timestamp_bucket=bucket,
                    metric_hash=metric_hash,
                    explanation=explanation,
                    score=score,
                    category=category,
                    top_factors=top_factors_str,
                ))
            await session.commit()

        logger.info("health_index_job_completed", score=score, category=category)
    except Exception as e:
        result.fail(str(e))
    return result


async def run_all_jobs():
    results = await asyncio.gather(
        run_currency_job(),
        run_market_job(),
        run_news_job(),
        run_health_index_job(),
        return_exceptions=True,
    )
    for r in results:
        if isinstance(r, JobResult) and not r.success:
            logger.error("job_chain_failure", job=r.name, error=r.error)
        elif isinstance(r, Exception):
            logger.error("job_chain_exception", error=str(r))
