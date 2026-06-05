from __future__ import annotations

from app.services.explanation import ExplanationEngine
from app.services.scoring import ScoringEngine


class TestExplanationEngine:
    def setup_method(self):
        self.engine = ExplanationEngine()
        self.scoring = ScoringEngine()

    def test_generate_returns_string(self):
        factors = {
            "dxy_change_pct": None, "dxy_raw": None,
            "oil_change_pct": None, "oil_raw": None,
            "inflation_rate": None, "inflation_raw": None,
            "fx_reserves": None, "fx_reserves_raw": None, "fx_reserves_median": None,
            "trade_balance": None, "trade_balance_raw": None,
            "sentiment": None, "sentiment_raw": None,
            "usd_idr_rate": None,
        }
        score, computed = self.scoring.compute(factors)
        result = self.engine.generate(score, "Neutral", computed, None, 18000)
        assert isinstance(result, str)
        assert len(result) > 0

    def test_generate_contains_rupiah(self):
        factors = {
            "dxy_change_pct": 0.5, "dxy_raw": 108.0,
            "oil_change_pct": None, "oil_raw": None,
            "inflation_rate": None, "inflation_raw": None,
            "fx_reserves": None, "fx_reserves_raw": None, "fx_reserves_median": None,
            "trade_balance": None, "trade_balance_raw": None,
            "sentiment": None, "sentiment_raw": None,
            "usd_idr_rate": 18200,
        }
        score, computed = self.scoring.compute(factors)
        result = self.engine.generate(score, "Weak", computed, 0.5, 18200)
        assert "Rupiah" in result
        assert "melemah" in result

    def test_generate_strong_category_uses_menguat(self):
        factors = {
            "dxy_change_pct": -0.8, "dxy_raw": 95.0,
            "oil_change_pct": -1.0, "oil_raw": 60.0,
            "inflation_rate": 2.5, "inflation_raw": 2.5,
            "fx_reserves": 150000, "fx_reserves_raw": 150000, "fx_reserves_median": 130000,
            "trade_balance": 3000, "trade_balance_raw": 3000,
            "sentiment": 0.8, "sentiment_raw": 0.8,
            "usd_idr_rate": 15000,
        }
        score, computed = self.scoring.compute(factors)
        result = self.engine.generate(score, "Strong", computed, -0.3, 15000)
        assert "menguat" in result

    def test_generate_deterministic(self):
        factors = {
            "dxy_change_pct": None, "dxy_raw": None,
            "oil_change_pct": None, "oil_raw": None,
            "inflation_rate": None, "inflation_raw": None,
            "fx_reserves": None, "fx_reserves_raw": None, "fx_reserves_median": None,
            "trade_balance": None, "trade_balance_raw": None,
            "sentiment": None, "sentiment_raw": None,
            "usd_idr_rate": None,
        }
        score, computed = self.scoring.compute(factors)
        result1 = self.engine.generate(score, "Neutral", computed, None, 18000)
        result2 = self.engine.generate(score, "Neutral", computed, None, 18000)
        assert result1 == result2

    def test_build_metric_hash_consistent(self):
        m1 = {"a": 1, "b": 2}
        m2 = {"b": 2, "a": 1}
        assert self.engine.build_metric_hash(m1) == self.engine.build_metric_hash(m2)

    def test_generate_with_dxy_driver(self):
        factors = {
            "dxy_change_pct": 0.5, "dxy_raw": 108.0,
            "oil_change_pct": None, "oil_raw": None,
            "inflation_rate": None, "inflation_raw": None,
            "fx_reserves": None, "fx_reserves_raw": None, "fx_reserves_median": None,
            "trade_balance": None, "trade_balance_raw": None,
            "sentiment": None, "sentiment_raw": None,
            "usd_idr_rate": 18300,
        }
        score, computed = self.scoring.compute(factors)
        result = self.engine.generate(score, "Weak", computed, 0.3, 18300)
        assert "DXY" in result
