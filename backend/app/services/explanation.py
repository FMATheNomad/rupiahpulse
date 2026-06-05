from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone
from typing import Any

from app.services.scoring import FactorInput


class ExplanationEngine:
    def generate(
        self,
        score: int,
        category: str,
        factors: list[FactorInput],
        usd_idr_change_pct: float | None,
        usd_idr_rate: float | None,
    ) -> str:
        sorted_factors = sorted(factors, key=lambda f: abs(f.subscore - 50) * f.weight, reverse=True)
        top_drivers = [f for f in sorted_factors if abs(f.subscore - 50) >= 2][:4]

        if category == "Strong":
            trend = "menguat"
        elif category == "Weak":
            trend = "melemah"
        else:
            trend = "stabil"

        rate_str = f"Rp{usd_idr_rate:,.0f}" if usd_idr_rate else "Rp-,--"
        parts = []

        for f in top_drivers:
            if f.name == "DXY":
                if f.change_24h_pct is not None:
                    direction = "naik" if f.change_24h_pct > 0 else "turun"
                    parts.append(f"Indeks DXY {direction} {abs(f.change_24h_pct):.2f}%")
            elif f.name == "Oil":
                if f.change_24h_pct is not None:
                    direction = "naik" if f.change_24h_pct > 0 else "turun"
                    parts.append(f"harga minyak {direction} {abs(f.change_24h_pct):.2f}%")
            elif f.name == "Inflation":
                if f.raw_value is not None:
                    parts.append(f"inflasi berada di {f.raw_value:.1f}%")
            elif f.name == "FX Reserves":
                if f.raw_value is not None:
                    parts.append(f"cadangan devisa sebesar ${f.raw_value:,.0f} juta")
            elif f.name == "Trade Balance":
                if f.raw_value is not None:
                    direction = "surplus" if f.raw_value > 0 else "defisit"
                    parts.append(f"neraca perdagangan {direction} ${abs(f.raw_value):,.0f} juta")
            elif f.name == "Market Sentiment":
                if f.raw_value is not None:
                    parts.append(f"sentimen pasar {'positif' if f.raw_value > 0 else 'negatif'} ({f.raw_value:+.2f})")
            elif f.name == "USD/IDR Rate":
                if f.raw_value is not None:
                    level = "sangat tinggi" if f.raw_value > 17500 else "tinggi" if f.raw_value > 16000 else "moderat"
                    parts.append(f"nilai tukar USD/IDR yang {level} di Rp{f.raw_value:,.0f}")

        if not parts:
            base = f"Rupiah dalam kondisi {trend} di {rate_str} dengan Indeks Kesehatan {score}/100."
        else:
            drivers = ", ".join(parts[:-1]) + (f", dan {parts[-1]}" if len(parts) > 1 else parts[0]) if len(parts) > 1 else parts[0]
            base = f"Rupiah {trend} hari ini di {rate_str}. Penyebab utama: {drivers}."

        return base

    def build_metric_hash(self, metrics: dict[str, Any]) -> str:
        raw = json.dumps(metrics, sort_keys=True, default=str)
        return hashlib.sha256(raw.encode()).hexdigest()
