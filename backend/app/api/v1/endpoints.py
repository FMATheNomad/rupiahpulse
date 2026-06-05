from __future__ import annotations

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db, async_session_factory
from app.models.currency import CurrencySnapshot
from app.models.explanation import ExplanationCache
from app.models.news import NewsCache
from app.schemas.currency import CurrencySnapshotResponse, CurrencyHistoryResponse
from app.schemas.health import HealthIndexResponse, FactorBreakdown, HealthIndexHistoryResponse
from app.schemas.explanation import ExplanationResponse
from app.schemas.news import NewsResponse
from app.services.repository import CurrencyRepository, MacroRepository
from app.services.scoring import ScoringEngine
from app.services.explanation import ExplanationEngine
from app.jobs.scheduler import run_news_job

router = APIRouter()

RANGE_MAP = {
    "1d": timedelta(hours=24),
    "5d": timedelta(days=5),
    "1m": timedelta(days=30),
    "3m": timedelta(days=90),
    "1y": timedelta(days=365),
    "5y": timedelta(days=1825),
    "max": None,
}


def get_range_cutoff(range_str: str) -> datetime | None:
    delta = RANGE_MAP.get(range_str)
    if delta is None:
        return None
    return datetime.now(timezone.utc) - delta


@router.get("/usd-idr")
async def get_usd_idr(db: AsyncSession = Depends(get_db)):
    repo = CurrencyRepository(db)
    latest = await repo.get_latest("USD/IDR")
    if not latest:
        raise HTTPException(status_code=404, detail="No data available")
    return {
        "data": CurrencySnapshotResponse.model_validate(latest),
        "meta": {"timestamp": datetime.now(timezone.utc).isoformat()},
    }


@router.get("/usd-idr/history")
async def get_usd_idr_history(
    range: str = Query("1y", alias="range"),
    granularity: str = Query("daily", alias="granularity"),
    db: AsyncSession = Depends(get_db),
):
    cutoff = get_range_cutoff(range)
    stmt = select(CurrencySnapshot).where(CurrencySnapshot.pair == "USD/IDR")
    if cutoff:
        stmt = stmt.where(CurrencySnapshot.timestamp_bucket >= cutoff)
    stmt = stmt.order_by(desc(CurrencySnapshot.timestamp_bucket)).limit(2000)
    result = await db.execute(stmt)
    rows = result.scalars().all()

    daily: dict[str, list[float]] = {}
    for r in rows:
        day = r.timestamp_bucket.strftime("%Y-%m-%d")
        if day not in daily:
            daily[day] = []
        daily[day].append(float(r.rate))

    aggregated = []
    for day in sorted(daily.keys(), reverse=True):
        rates = daily[day]
        aggregated.append({
            "timestamp_bucket": f"{day}T00:00:00Z",
            "rate": round(sum(rates) / len(rates), 2),
            "change_24h_pct": None,
        })

    return {
        "data": aggregated,
        "meta": {"total": len(aggregated), "range": range},
    }


async def compute_health_index(db: AsyncSession, lang: str = "id") -> HealthIndexResponse | None:
    currency_repo = CurrencyRepository(db)
    macro_repo = MacroRepository(db)

    latest_currency = await currency_repo.get_latest("USD/IDR")
    if not latest_currency:
        return None

    dxy = await macro_repo.get_latest_value("market_dxy")
    dxy_change = await macro_repo.get_latest_value("market_dxy_change")
    oil = await macro_repo.get_latest_value("market_oil")
    oil_change = await macro_repo.get_latest_value("market_oil_change")
    inflation = await macro_repo.get_latest_value("macro_inflation", lookback_hours=720)
    fx_reserves = await macro_repo.get_latest_value("macro_fx_reserves", lookback_hours=720)
    trade_balance = await macro_repo.get_latest_value("macro_trade_balance", lookback_hours=720)

    sentiment_stmt = select(func.avg(NewsCache.sentiment_score))
    sentiment_result = await db.execute(sentiment_stmt)
    avg_sentiment = sentiment_result.scalar() or 0.0

    usd_idr_rate = float(latest_currency.rate)

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
        "usd_idr_rate": usd_idr_rate,
    }

    engine = ScoringEngine()
    score, computed = engine.compute(factors)

    category = engine.get_category(score)

    expl_engine = ExplanationEngine()
    explanation = expl_engine.generate(
        score, category, computed,
        float(latest_currency.change_24h_pct) if latest_currency.change_24h_pct else None,
        usd_idr_rate,
        lang=lang,
    )

    factor_breakdowns = [
        FactorBreakdown(
            factor=f.name,
            subscore=round(f.subscore, 1),
            weight=f.weight,
            contribution=round(f.subscore * f.weight, 2),
            raw_value=f.raw_value,
            change_24h_pct=f.change_24h_pct,
        )
        for f in computed
    ]

    return HealthIndexResponse(
        score=score,
        category=category,
        usd_idr_rate=usd_idr_rate,
        usd_idr_change_24h_pct=float(latest_currency.change_24h_pct) if latest_currency.change_24h_pct else None,
        timestamp_bucket=latest_currency.timestamp_bucket,
        factors=factor_breakdowns,
        explanation=explanation,
    )


@router.get("/health-index")
async def get_health_index(
    lang: str = Query("id"),
    db: AsyncSession = Depends(get_db),
):
    result = await compute_health_index(db, lang=lang)
    if result is None:
        return {"data": None, "meta": {"message": "Insufficient data to compute health index"}}
    return {
        "data": result,
        "meta": {"timestamp": datetime.now(timezone.utc).isoformat()},
    }


@router.get("/history")
async def get_history(
    range: str = Query("1y", alias="range"),
    db: AsyncSession = Depends(get_db),
):
    cutoff = get_range_cutoff(range)
    query = select(ExplanationCache)
    if cutoff:
        query = query.where(ExplanationCache.timestamp_bucket >= cutoff)
    query = query.order_by(desc(ExplanationCache.timestamp_bucket)).limit(1000)
    result = await db.execute(query)
    rows = result.scalars().all()

    daily: dict[str, list[dict]] = {}
    for r in rows:
        day = r.timestamp_bucket.strftime("%Y-%m-%d")
        if day not in daily:
            daily[day] = []
        daily[day].append({"score": r.score, "category": r.category})

    aggregated = []
    for day in sorted(daily.keys(), reverse=True):
        entries = daily[day]
        avg_score = round(sum(e["score"] for e in entries) / len(entries))
        cats = [e["category"] for e in entries]
        dominant = max(set(cats), key=cats.count)
        aggregated.append({
            "timestamp_bucket": f"{day}T00:00:00Z",
            "score": avg_score,
            "category": dominant,
        })

    return {
        "data": aggregated,
        "meta": {"total": len(aggregated), "range": range},
    }


@router.get("/explanation")
async def get_explanation(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ExplanationCache).order_by(desc(ExplanationCache.timestamp_bucket)).limit(1)
    )
    expl = result.scalar_one_or_none()
    if not expl:
        raise HTTPException(status_code=404, detail="No explanation available")
    return {
        "data": ExplanationResponse.model_validate(expl),
        "meta": {"timestamp": datetime.now(timezone.utc).isoformat()},
    }


@router.get("/prediction")
async def prediction(
    lang: str = Query("id"),
    db: AsyncSession = Depends(get_db),
):
    result = await get_prediction(db, lang=lang)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return {"data": result, "meta": {"timestamp": datetime.now(timezone.utc).isoformat()}}


@router.get("/news")
async def get_news(
    limit: int = Query(10, le=50),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    query = select(NewsCache).order_by(desc(NewsCache.published_at))
    count_query = select(func.count(NewsCache.id))
    total = (await db.execute(count_query)).scalar() or 0
    query = query.limit(limit).offset(offset)
    result = await db.execute(query)
    rows = result.scalars().all()
    has_more = (offset + limit) < total
    return {
        "data": [NewsResponse.model_validate(r) for r in rows],
        "meta": {"total": total, "limit": limit, "offset": offset, "has_more": has_more},
    }


import time as time_module

from app.services.prediction import get_prediction

_last_refresh_time: float = 0.0
_REFRESH_COOLDOWN_SECONDS = 60


@router.post("/news/refresh")
async def refresh_news():
    global _last_refresh_time
    now = time_module.time()
    elapsed = now - _last_refresh_time

    if elapsed < _REFRESH_COOLDOWN_SECONDS:
        remaining = round(_REFRESH_COOLDOWN_SECONDS - elapsed)
        return {
            "data": {
                "status": "cooldown",
                "message": f"Mohon tunggu {remaining} detik sebelum refresh lagi",
                "cooldown_remaining": remaining,
            }
        }

    try:
        result = await run_news_job()
        if not result.success:
            error_msg = result.error or "Gagal mengambil berita"
            if "429" in error_msg:
                return {"data": {"status": "rate_limited", "message": "Terlalu banyak permintaan. Silakan coba lagi dalam beberapa menit."}}
            raise HTTPException(status_code=502, detail=error_msg)
        _last_refresh_time = time_module.time()
        return {"data": {"status": "ok", "message": "Berita berhasil diperbarui"}}
    except Exception as e:
        return {"data": {"status": "error", "message": f"Gagal refresh: {str(e)[:100]}"}}
