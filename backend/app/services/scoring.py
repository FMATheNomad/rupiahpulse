from __future__ import annotations

from dataclasses import dataclass


@dataclass
class FactorInput:
    name: str
    weight: float
    raw_value: float | None
    change_24h_pct: float | None
    subscore: float


class ScoringEngine:
    WEIGHTS = {
        "dxy": 0.15,
        "oil": 0.10,
        "inflation": 0.10,
        "fx_reserves": 0.10,
        "trade_balance": 0.10,
        "market_sentiment": 0.10,
        "idr_rate": 0.35,
    }

    def normalize_dxy(self, dxy: float | None, change_pct: float | None = None) -> float:
        if dxy is None:
            return 50.0
        baseline = 95.0
        diff = dxy - baseline
        score = 100.0 - (diff * 8)
        if change_pct is not None:
            modifier = -change_pct * 50
            modifier = max(-15.0, min(15.0, modifier))
            score += modifier
        return max(0.0, min(100.0, score))

    def normalize_oil(self, oil: float | None, change_pct: float | None = None) -> float:
        if oil is None:
            return 50.0
        baseline = 65.0
        score = 100.0 - (max(0, oil - baseline) * 2.0)
        if change_pct is not None:
            modifier = -change_pct * 50
            modifier = max(-15.0, min(15.0, modifier))
            score += modifier
        return max(0.0, min(100.0, score))

    def normalize_idr_rate(self, rate: float | None) -> float:
        if rate is None:
            return 50.0
        baseline = 15500.0
        score = 100.0 - (max(0, rate - baseline) / 35.0)
        return max(0.0, min(100.0, score))

    def normalize_inflation(self, inflation_rate: float | None) -> float:
        if inflation_rate is None:
            return 50.0
        benchmark = 2.5
        diff = inflation_rate - benchmark
        score = 100.0 - (diff * 40)
        return max(0.0, min(100.0, score))

    def normalize_fx_reserves(self, current: float | None, median: float = 140000) -> float:
        if current is None or median <= 0:
            return 50.0
        ratio = current / median
        score = (ratio - 0.7) * 350
        return max(0.0, min(100.0, score))

    def normalize_trade_balance(self, surplus: float | None) -> float:
        if surplus is None:
            return 50.0
        score = 50.0 + (surplus / 1500)
        return max(0.0, min(100.0, score))

    def normalize_market_sentiment(self, sentiment: float | None) -> float:
        if sentiment is None:
            return 50.0
        score = 50.0 + (sentiment * 50)
        return max(0.0, min(100.0, score))

    def compute(self, factors: dict) -> tuple[int, list[FactorInput]]:
        computed: list[FactorInput] = []

        dxy_sub = self.normalize_dxy(factors.get("dxy_raw"), factors.get("dxy_change_pct"))
        computed.append(FactorInput("DXY", self.WEIGHTS["dxy"], factors.get("dxy_raw"), factors.get("dxy_change_pct"), dxy_sub))

        oil_sub = self.normalize_oil(factors.get("oil_raw"), factors.get("oil_change_pct"))
        computed.append(FactorInput("Oil", self.WEIGHTS["oil"], factors.get("oil_raw"), factors.get("oil_change_pct"), oil_sub))

        inflation_sub = self.normalize_inflation(factors.get("inflation_rate"))
        computed.append(FactorInput("Inflation", self.WEIGHTS["inflation"], factors.get("inflation_raw"), None, inflation_sub))

        fx_sub = self.normalize_fx_reserves(factors.get("fx_reserves"), factors.get("fx_reserves_median"))
        computed.append(FactorInput("FX Reserves", self.WEIGHTS["fx_reserves"], factors.get("fx_reserves_raw"), None, fx_sub))

        tb_sub = self.normalize_trade_balance(factors.get("trade_balance"))
        computed.append(FactorInput("Trade Balance", self.WEIGHTS["trade_balance"], factors.get("trade_balance_raw"), None, tb_sub))

        sent_sub = self.normalize_market_sentiment(factors.get("sentiment"))
        computed.append(FactorInput("Market Sentiment", self.WEIGHTS["market_sentiment"], factors.get("sentiment_raw"), None, sent_sub))

        idr_sub = self.normalize_idr_rate(factors.get("usd_idr_rate"))
        computed.append(FactorInput("USD/IDR Rate", self.WEIGHTS["idr_rate"], factors.get("usd_idr_rate"), None, idr_sub))

        total = sum(f.subscore * f.weight for f in computed)
        score = max(0, min(100, round(total)))
        return score, computed

    def get_category(self, score: int) -> str:
        if score >= 75:
            return "Strong"
        elif score >= 50:
            return "Neutral"
        return "Weak"
