from __future__ import annotations

from datetime import datetime, timezone
from decimal import Decimal
from unittest.mock import AsyncMock, MagicMock, Mock

import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.repository import CurrencyRepository, MacroRepository
from app.models.currency import CurrencySnapshot
from app.models.macro import MacroSnapshot


@pytest_asyncio.fixture
async def mock_session():
    session = AsyncMock(spec=AsyncSession)
    return session


class TestCurrencyRepository:
    @pytest.mark.asyncio
    async def test_upsert_new(self, mock_session):
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_session.execute.return_value = mock_result

        repo = CurrencyRepository(mock_session)
        data = {
            "timestamp_bucket": datetime.now(timezone.utc),
            "pair": "USD/IDR",
            "rate": Decimal("16500.000000"),
            "source": "test",
        }
        await repo.upsert(data)
        assert mock_session.add.called
        assert mock_session.flush.called

    @pytest.mark.asyncio
    async def test_upsert_existing(self, mock_session):
        existing = CurrencySnapshot(
            timestamp_bucket=datetime.now(timezone.utc),
            pair="USD/IDR",
            rate=Decimal("16000.000000"),
            source="test",
        )
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = existing
        mock_session.execute.return_value = mock_result

        repo = CurrencyRepository(mock_session)
        data = {
            "timestamp_bucket": existing.timestamp_bucket,
            "pair": "USD/IDR",
            "rate": Decimal("16500.000000"),
            "source": "test",
        }
        result = await repo.upsert(data)
        assert float(result.rate) == 16500.0
        assert not mock_session.add.called


class TestMacroRepository:
    @pytest.mark.asyncio
    async def test_upsert_new(self, mock_session):
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_session.execute.return_value = mock_result

        repo = MacroRepository(mock_session)
        data = {
            "timestamp_bucket": datetime.now(timezone.utc),
            "indicator": "test_indicator",
            "value": Decimal("100.000000"),
            "source": "test",
        }
        await repo.upsert(data)
        assert mock_session.add.called
