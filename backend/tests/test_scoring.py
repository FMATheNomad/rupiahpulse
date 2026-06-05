from __future__ import annotations

import pytest
from app.services.scoring import ScoringEngine


class TestScoringEngine:
    def setup_method(self):
        self.engine = ScoringEngine()

    def test_normalize_dxy_below_baseline(self):
        score = self.engine.normalize_dxy(93.0)
        assert score > 50

    def test_normalize_dxy_above_baseline(self):
        score = self.engine.normalize_dxy(105.0)
        assert score < 50

    def test_normalize_dxy_high_level(self):
        score = self.engine.normalize_dxy(115.0)
        assert score < 30

    def test_normalize_dxy_with_positive_change(self):
        score = self.engine.normalize_dxy(103.0, 0.5)
        assert score < 100

    def test_normalize_dxy_with_negative_change(self):
        score = self.engine.normalize_dxy(103.0, -0.5)
        assert score > 50

    def test_normalize_dxy_none_returns_midpoint(self):
        assert self.engine.normalize_dxy(None) == 50.0

    def test_normalize_oil_above_baseline(self):
        score = self.engine.normalize_oil(93.0)
        assert score < 60

    def test_normalize_oil_at_baseline(self):
        score = self.engine.normalize_oil(65.0)
        assert score == 100.0

    def test_normalize_oil_below_baseline(self):
        score = self.engine.normalize_oil(50.0)
        assert score == 100.0

    def test_normalize_oil_none_returns_midpoint(self):
        assert self.engine.normalize_oil(None) == 50.0

    def test_normalize_idr_rate_at_baseline(self):
        score = self.engine.normalize_idr_rate(15500)
        assert score == 100.0

    def test_normalize_idr_rate_high(self):
        score = self.engine.normalize_idr_rate(18000)
        assert score < 50

    def test_normalize_idr_rate_very_high(self):
        score = self.engine.normalize_idr_rate(20000)
        assert score < 20

    def test_normalize_inflation_above_benchmark(self):
        score = self.engine.normalize_inflation(5.0)
        assert score < 50

    def test_normalize_inflation_below_benchmark(self):
        score = self.engine.normalize_inflation(2.0)
        assert score > 50

    def test_normalize_fx_reserves_above_median(self):
        score = self.engine.normalize_fx_reserves(150000, 130000)
        assert score > 50

    def test_normalize_fx_reserves_below_median(self):
        score = self.engine.normalize_fx_reserves(80000, 140000)
        assert score < 50

    def test_normalize_trade_balance_surplus(self):
        score = self.engine.normalize_trade_balance(2000)
        assert score > 50

    def test_normalize_trade_balance_deficit(self):
        score = self.engine.normalize_trade_balance(-1000)
        assert score < 50

    def test_normalize_market_sentiment_positive(self):
        score = self.engine.normalize_market_sentiment(0.5)
        assert score > 50

    def test_normalize_market_sentiment_negative(self):
        score = self.engine.normalize_market_sentiment(-0.5)
        assert score < 50

    def test_compute_reflects_weak_rupiah(self):
        factors = {
            "dxy_change_pct": 0.3,
            "dxy_raw": 108.0,
            "oil_change_pct": 1.0,
            "oil_raw": 100.0,
            "inflation_rate": 5.0,
            "inflation_raw": 5.0,
            "fx_reserves": 90000,
            "fx_reserves_raw": 90000,
            "fx_reserves_median": 130000,
            "trade_balance": -500,
            "trade_balance_raw": -500,
            "sentiment": -0.5,
            "sentiment_raw": -0.5,
            "usd_idr_rate": 18500,
        }
        score, factors_list = self.engine.compute(factors)
        assert score < 50
        assert len(factors_list) == 7

    def test_compute_all_factors_neutral(self):
        factors = {k: None for k in [
            "dxy_change_pct", "dxy_raw",
            "oil_change_pct", "oil_raw",
            "inflation_rate", "inflation_raw",
            "fx_reserves", "fx_reserves_raw", "fx_reserves_median",
            "trade_balance", "trade_balance_raw",
            "sentiment", "sentiment_raw",
            "usd_idr_rate",
        ]}
        score, _ = self.engine.compute(factors)
        assert score == 50

    def test_compute_weights_sum_to_one(self):
        total = sum(ScoringEngine.WEIGHTS.values())
        assert abs(total - 1.0) < 0.01

    def test_compute_score_clamping(self):
        factors = {
            "dxy_change_pct": -10.0,
            "dxy_raw": 90.0,
            "oil_change_pct": -10.0,
            "oil_raw": 30.0,
            "inflation_rate": 0.5,
            "inflation_raw": 0.5,
            "fx_reserves": 500000,
            "fx_reserves_raw": 500000,
            "fx_reserves_median": 130000,
            "trade_balance": 50000,
            "trade_balance_raw": 50000,
            "sentiment": 1.0,
            "sentiment_raw": 1.0,
            "usd_idr_rate": 14000,
        }
        score, _ = self.engine.compute(factors)
        assert 0 <= score <= 100

    def test_compute_high_dxy_and_rate_penalizes_score(self):
        factors = {
            "dxy_change_pct": 0.0,
            "dxy_raw": 115.0,
            "oil_change_pct": None,
            "oil_raw": None,
            "inflation_rate": None,
            "inflation_raw": None,
            "fx_reserves": None,
            "fx_reserves_raw": None,
            "fx_reserves_median": None,
            "trade_balance": None,
            "trade_balance_raw": None,
            "sentiment": None,
            "sentiment_raw": None,
            "usd_idr_rate": 18000,
        }
        score, flist = self.engine.compute(factors)
        dxy = [f for f in flist if f.name == "DXY"][0]
        idr = [f for f in flist if f.name == "USD/IDR Rate"][0]
        assert dxy.subscore < 30
        assert idr.subscore < 50
        assert score < 55

    def test_compute_high_oil_penalizes_score(self):
        factors = {
            "dxy_change_pct": None,
            "dxy_raw": None,
            "oil_change_pct": 1.0,
            "oil_raw": 100.0,
            "inflation_rate": None,
            "inflation_raw": None,
            "fx_reserves": None,
            "fx_reserves_raw": None,
            "fx_reserves_median": None,
            "trade_balance": None,
            "trade_balance_raw": None,
            "sentiment": None,
            "sentiment_raw": None,
            "usd_idr_rate": None,
        }
        score, flist = self.engine.compute(factors)
        oil = [f for f in flist if f.name == "Oil"][0]
        assert oil.subscore < 50
