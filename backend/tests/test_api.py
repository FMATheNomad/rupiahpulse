from __future__ import annotations

from httpx import AsyncClient, ASGITransport
import pytest

from app.main import app


@pytest.fixture
def client():
    transport = ASGITransport(app=app)
    return AsyncClient(transport=transport, base_url="http://test")


@pytest.mark.asyncio
async def test_health_endpoint(client):
    resp = await client.get("/health")
    assert resp.status_code in (200, 503)


@pytest.mark.asyncio
async def test_usd_idr_endpoint(client):
    resp = await client.get("/api/v1/usd-idr")
    assert resp.status_code in (200, 404)


@pytest.mark.asyncio
async def test_health_index_endpoint(client):
    resp = await client.get("/api/v1/health-index")
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_history_endpoint(client):
    resp = await client.get("/api/v1/history")
    assert resp.status_code == 200
    body = resp.json()
    assert "data" in body
    assert "meta" in body


@pytest.mark.asyncio
async def test_explanation_endpoint(client):
    resp = await client.get("/api/v1/explanation")
    assert resp.status_code in (200, 404)


@pytest.mark.asyncio
async def test_news_endpoint(client):
    resp = await client.get("/api/v1/news")
    assert resp.status_code == 200
    body = resp.json()
    assert "data" in body
    assert "meta" in body


@pytest.mark.asyncio
async def test_news_with_pagination(client):
    resp = await client.get("/api/v1/news?limit=5&offset=0")
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_history_with_pagination(client):
    resp = await client.get("/api/v1/history?limit=10&offset=0")
    assert resp.status_code == 200
