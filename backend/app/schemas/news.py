from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class NewsCreate(BaseModel):
    article_id: str
    title: str
    source: str | None = None
    url: str | None = None
    published_at: datetime | None = None
    sentiment_score: float | None = None
    content_snippet: str | None = None


class NewsResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    article_id: str
    title: str
    source: str | None = None
    url: str | None = None
    published_at: datetime | None = None
    sentiment_score: float | None = None
    content_snippet: str | None = None
    created_at: datetime
