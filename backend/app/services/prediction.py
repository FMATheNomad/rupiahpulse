from __future__ import annotations

from datetime import datetime, timezone, timedelta
import math

from sqlalchemy import select, desc, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.currency import CurrencySnapshot
from app.models.news import NewsCache


def linear_regression(data: list[tuple[float, float]]) -> tuple[float, float]:
    n = len(data)
    if n < 2:
        return 0, 0
    sum_x = sum(x for x, _ in data)
    sum_y = sum(y for _, y in data)
    sum_xy = sum(x * y for x, y in data)
    sum_x2 = sum(x * x for x, _ in data)
    slope = (n * sum_xy - sum_x * sum_y) / (n * sum_x2 - sum_x * sum_x)
    intercept = (sum_y - slope * sum_x) / n
    return slope, intercept


def r_squared(data: list[tuple[float, float]], slope: float, intercept: float) -> float:
    n = len(data)
    if n < 2:
        return 0
    mean_y = sum(y for _, y in data) / n
    ss_res = sum((y - (slope * x + intercept)) ** 2 for x, y in data)
    ss_tot = sum((y - mean_y) ** 2 for _, y in data)
    if ss_tot == 0:
        return 0
    return 1 - ss_res / ss_tot


async def get_prediction(db: AsyncSession) -> dict:
    now = datetime.now(timezone.utc)

    # Get last 90 days of data for trend
    cutoff_90d = now - timedelta(days=90)
    stmt = (
        select(CurrencySnapshot)
        .where(CurrencySnapshot.pair == "USD/IDR", CurrencySnapshot.timestamp_bucket >= cutoff_90d)
        .order_by(CurrencySnapshot.timestamp_bucket.asc())
    )
    result = await db.execute(stmt)
    rows = result.scalars().all()

    if len(rows) < 5:
        return {"error": "Insufficient data for prediction"}

    latest_rate = float(rows[-1].rate)
    data = [(r.timestamp_bucket.timestamp(), float(r.rate)) for r in rows]

    slope, intercept = linear_regression(data)
    r2 = r_squared(data, slope, intercept)
    daily_change = slope * 86400
    weekly_change = daily_change * 7
    monthly_change = daily_change * 30

    volatility = math.sqrt(sum((y - (slope * x + intercept)) ** 2 for x, y in data) / len(data))

    # Get sentiment from news
    news_stmt = select(func.avg(NewsCache.sentiment_score))
    news_result = await db.execute(news_stmt)
    avg_sentiment = news_result.scalar() or 0.0

    sentiment_multiplier = 1.0 + (avg_sentiment * 0.1)

    # Predictions with confidence intervals
    predictions = {}
    for label, days in [("1m", 30), ("3m", 90), ("6m", 180), ("1y", 365)]:
        trend = daily_change * days * sentiment_multiplier
        predicted = latest_rate + trend
        margin = volatility * math.sqrt(days / 30) * 1.96
        predictions[label] = {
            "predicted": round(predicted, 0),
            "lower": round(predicted - margin, 0),
            "upper": round(predicted + margin, 0),
            "change": round(trend, 0),
            "change_pct": round((trend / latest_rate) * 100, 1),
        }

    # Sentiment-based assessment
    trend_direction = "melemah" if daily_change > 0 else "menguat"

    if trend_direction == "melemah":
        if avg_sentiment > 0.2:
            consensus = "neutral"
            summary = "Sentimen positif tidak cukup kuat menahan pelemahan. Faktor fundamental dan eksternal masih mendominasi."
        elif avg_sentiment < -0.2:
            consensus = "bearish"
            summary = "Tekanan pelemahan Rupiah diperkuat sentimen negatif. Ekspektasi pelemahan berlanjut."
        else:
            consensus = "bearish"
            summary = "Tren pelemahan Rupiah berlanjut seiring faktor global dan domestik."
    else:
        if avg_sentiment > 0.2:
            consensus = "bullish"
            summary = "Sentimen positif mendukung penguatan Rupiah. Aliran modal asing diperkirakan masuk."
        elif avg_sentiment < -0.2:
            consensus = "neutral"
            summary = "Potensi penguatan terbatas karena sentimen negatif masih membayangi."
        else:
            consensus = "bullish"
            summary = "Rupiah menunjukkan penguatan di tengah sentimen yang bervariasi."
    r2_pct = round(r2 * 100, 1)

    return {
        "latest_rate": round(latest_rate, 0),
        "trend": {
            "daily_change": round(daily_change, 2),
            "direction": trend_direction,
            "r_squared": r2_pct,
            "volatility": round(volatility, 0),
        },
        "sentiment": {
            "score": round(avg_sentiment, 2),
            "consensus": consensus,
            "summary": summary,
        },
        "predictions": predictions,
        "generated_at": now.isoformat(),
    }
