from __future__ import annotations

import hashlib
import json
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
        lang: str = "id",
    ) -> str:
        is_en = lang == "en"
        sorted_factors = sorted(factors, key=lambda f: abs(f.subscore - 50) * f.weight, reverse=True)
        top_drivers = [f for f in sorted_factors if abs(f.subscore - 50) >= 2][:4]

        trend = ("menguat", "strengthening") if category == "Strong" else ("melemah", "weakening") if category == "Weak" else ("stabil", "stable")
        trend_txt = trend[1] if is_en else trend[0]
        curr = "Rp"
        rate_str = f"{curr}{usd_idr_rate:,.0f}" if usd_idr_rate else f"{curr}-,--"

        parts = []
        for f in top_drivers:
            if f.name == "DXY" and f.change_24h_pct is not None:
                d = "up" if is_en else "naik" if f.change_24h_pct > 0 else "down" if is_en else "turun"
                parts.append(f"{'DXY Index' if is_en else 'Indeks DXY'} {d} {abs(f.change_24h_pct):.2f}%")
            elif f.name == "Oil" and f.change_24h_pct is not None:
                d = "up" if is_en else "naik" if f.change_24h_pct > 0 else "down" if is_en else "turun"
                parts.append(f"{'oil price' if is_en else 'harga minyak'} {d} {abs(f.change_24h_pct):.2f}%")
            elif f.name == "Inflation" and f.raw_value is not None:
                parts.append(f"{'inflation at' if is_en else 'inflasi berada di'} {f.raw_value:.1f}%")
            elif f.name == "FX Reserves" and f.raw_value is not None:
                parts.append(f"{'FX reserves of' if is_en else 'cadangan devisa sebesar'} ${f.raw_value:,.0f}{'M' if is_en else ' juta'}")
            elif f.name == "Trade Balance" and f.raw_value is not None:
                d = "surplus" if f.raw_value > 0 else "deficit"
                parts.append(f"{'trade balance' if is_en else 'neraca perdagangan'} {d} {'of' if is_en else ''} ${abs(f.raw_value):,.0f}{'M' if is_en else ' juta'}")
            elif f.name == "Market Sentiment" and f.raw_value is not None:
                s = "positive" if is_en else "positif" if f.raw_value > 0 else "negative" if is_en else "negatif"
                parts.append(f"{'market sentiment' if is_en else 'sentimen pasar'} {s} ({f.raw_value:+.2f})")
            elif f.name == "USD/IDR Rate" and f.raw_value is not None:
                lvl = ("sangat tinggi", "very high") if f.raw_value > 17500 else ("tinggi", "high") if f.raw_value > 16000 else ("moderat", "moderate")
                parts.append(f"{'USD/IDR rate' if is_en else 'nilai tukar USD/IDR yang'} {lvl[1 if is_en else 0]} {'at' if is_en else 'di'} {curr}{f.raw_value:,.0f}")

        if not parts:
            return f"{'Rupiah is' if is_en else 'Rupiah dalam kondisi'} {trend_txt} {'at' if is_en else 'di'} {rate_str} {'with Health Index' if is_en else 'dengan Indeks Kesehatan'} {score}/100."

        drivers = ", ".join(parts[:-1]) + (f"{' and' if is_en else ', dan'} {parts[-1]}" if len(parts) > 1 else parts[0]) if len(parts) > 1 else parts[0]
        if is_en:
            return f"Rupiah is {trend_txt} today at {rate_str}. Main drivers: {drivers}."
        return f"Rupiah {trend_txt} hari ini di {rate_str}. Penyebab utama: {drivers}."

    def build_metric_hash(self, metrics: dict[str, Any]) -> str:
        raw = json.dumps(metrics, sort_keys=True, default=str)
        return hashlib.sha256(raw.encode()).hexdigest()
