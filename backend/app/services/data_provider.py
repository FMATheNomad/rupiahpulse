from __future__ import annotations

import asyncio
import html
import random
from datetime import datetime, timezone
from decimal import Decimal

import httpx
import structlog

from app.core.config import settings

logger = structlog.get_logger(__name__)

MAX_RESPONSE_SIZE = 10 * 1024 * 1024  # 10MB


class DataProviderError(Exception):
    def __init__(self, source: str, message: str, status_code: int | None = None):
        self.source = source
        self.message = message
        self.status_code = status_code
        super().__init__(f"{source}: {message}")


async def retry_with_backoff(coro_factory, max_attempts: int = 3, source: str = "unknown"):
    last_exc = None
    for attempt in range(1, max_attempts + 1):
        try:
            return await coro_factory()
        except (httpx.TimeoutException, httpx.HTTPStatusError, DataProviderError) as e:
            last_exc = e
            if attempt < max_attempts:
                wait = 2 ** attempt + random.uniform(0, 1)
                logger.warning("retry_attempt", source=source, attempt=attempt, max_attempts=max_attempts, wait=wait, error=str(e))
                await asyncio.sleep(wait)
            else:
                logger.error("retry_exhausted", source=source, attempts=max_attempts, error=str(e))
    raise last_exc


class DataProvider:
    def __init__(self):
        self.timeout = settings.DATA_PROVIDER_TIMEOUT_SECONDS

    def _client(self):
        return httpx.AsyncClient(
            timeout=httpx.Timeout(self.timeout),
            follow_redirects=False,
        )

    async def _fetch_with_limit(self, url: str, headers: dict | None = None) -> bytes:
        async with self._client() as client:
            async with client.stream("GET", url, headers=headers or {}) as resp:
                resp.raise_for_status()
                chunks = []
                size = 0
                async for chunk in resp.aiter_bytes():
                    size += len(chunk)
                    if size > MAX_RESPONSE_SIZE:
                        raise DataProviderError("source", "Response too large")
                    chunks.append(chunk)
                return b"".join(chunks)

    async def fetch_usd_idr(self) -> dict:
        result = await self._fetch_yahoo_json("USDIDR=X")
        return {"rate": Decimal(str(result["close"])), "source": result["source"], "fetched_at": datetime.now(timezone.utc)}

    async def _fetch_yahoo_json(self, symbol: str) -> dict:
        url = f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}?interval=1d"
        async def _fetch():
            data = await self._fetch_with_limit(url, headers={"User-Agent": "Mozilla/5.0"})
            import json
            parsed = json.loads(data)
            result = parsed.get("chart", {}).get("result")
            if not result:
                raise DataProviderError(f"yahoo:{symbol}", "No result in response")
            meta = result[0].get("meta", {})
            price = meta.get("regularMarketPrice")
            prev_close = meta.get("previousClose") or meta.get("chartPreviousClose")
            if price is None:
                raise DataProviderError(f"yahoo:{symbol}", "No price data")
            change_pct = ((price - prev_close) / prev_close * 100) if prev_close and prev_close > 0 else None
            return {"symbol": symbol, "close": price, "change_pct": change_pct, "source": "yahoo"}
        return await retry_with_backoff(_fetch, source=f"yahoo:{symbol}")

    async def fetch_dxy(self) -> dict:
        return await self._fetch_yahoo_json("DX-Y.NYB")

    async def fetch_oil(self) -> dict:
        return await self._fetch_yahoo_json("CL=F")

    async def fetch_stooq_csv(self, symbol: str) -> dict:
        url = f"https://stooq.com/q/l/?s={symbol}&f=sd2t2ohlcv&h&e=csv"
        async def _fetch():
            data = await self._fetch_with_limit(url)
            lines = data.decode().strip().split("\n")
            if len(lines) < 2:
                raise DataProviderError(f"stooq:{symbol}", "Empty CSV response")
            header = lines[0].lower().split(",")
            values = lines[1].split(",")
            data_dict = dict(zip(header, values))
            if data_dict.get("close") in (None, "", "N/D"):
                raise DataProviderError(f"stooq:{symbol}", "No data available")
            close_val = float(data_dict["close"])
            change_pct = float(data_dict.get("changepct", 0)) if data_dict.get("changepct") and data_dict["changepct"] not in ("", "N/D") else None
            return {"symbol": symbol, "close": close_val, "change_pct": change_pct, "source": "stooq"}
        return await retry_with_backoff(_fetch, source=f"stooq:{symbol}")

    async def fetch_gold(self) -> dict:
        return await self.fetch_stooq_csv("xauusd")

    async def fetch_macro_world_bank(self, indicator: str) -> dict:
        url = f"https://api.worldbank.org/v2/country/ID/indicator/{indicator}?format=json&per_page=5"
        async def _fetch():
            data = await self._fetch_with_limit(url)
            import json
            parsed = json.loads(data)
            if len(parsed) < 2 or not parsed[1]:
                raise DataProviderError("worldbank", f"No data for {indicator}")
            latest = parsed[1][0]
            return {"indicator": indicator, "value": Decimal(str(latest["value"])), "year": latest["date"], "source": "worldbank"}
        return await retry_with_backoff(_fetch, source=f"worldbank:{indicator}")

    async def fetch_gdelt_news(self) -> list[dict]:
        query = settings.GDELT_QUERY
        url = f"https://api.gdeltproject.org/api/v2/doc/doc?query={query}&mode=artlist&format=json&maxrecords=15"
        async def _fetch():
            data = await self._fetch_with_limit(url)
            import json
            parsed = json.loads(data)
            blocked_domains = [
                "cfi.net.cn", "finance.eastmoney.com", "orientaldaily.com.my",
                "knowledge.hket.com", "jp.reuters.com", "nikkei.com",
                "chinatimes.com", "zaobao.com", "eastmoney.com",
                "163.com", "sina.com.cn", "qq.com", "sohu.com", "ifeng.com",
                "xinhuanet.com", "bbc.com",
            ]
            allowed_langs = {"indonesian", "english", "id", "en", "in", ""}
            articles = []
            for article in parsed.get("articles", []):
                domain = (article.get("domain", "") or "").lower()
                lang = (article.get("language", "") or "").lower()
                title = article.get("title", "")
                if any(b in domain for b in blocked_domains):
                    continue
                if lang not in allowed_langs and lang:
                    continue
                articles.append({
                    "title": html.escape(title),
                    "source": domain,
                    "url": article.get("url", "") if article.get("url", "").startswith("http") else "",
                    "published_at": article.get("seendate", ""),
                    "sentiment_score": article.get("tone", None),
                })
            return articles
        return await retry_with_backoff(_fetch, source="gdelt")
