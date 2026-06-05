"""initial schema

Revision ID: 001
Revises:
Create Date: 2026-06-05 03:00:00.000000
"""
from __future__ import annotations

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "currency_snapshot",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("timestamp_bucket", sa.DateTime(timezone=True), nullable=False, index=True),
        sa.Column("pair", sa.String(10), nullable=False, server_default="USD/IDR"),
        sa.Column("rate", sa.Numeric(20, 6), nullable=False),
        sa.Column("high_24h", sa.Numeric(20, 6), nullable=True),
        sa.Column("low_24h", sa.Numeric(20, 6), nullable=True),
        sa.Column("change_24h_pct", sa.Float, nullable=True),
        sa.Column("source", sa.String(50), nullable=False, server_default="exchangerate.host"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index(
        "ix_currency_snapshot_pair_bucket",
        "currency_snapshot",
        ["pair", "timestamp_bucket"],
        unique=True,
    )

    op.create_table(
        "macro_snapshot",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("timestamp_bucket", sa.DateTime(timezone=True), nullable=False, index=True),
        sa.Column("indicator", sa.String(50), nullable=False, index=True),
        sa.Column("value", sa.Numeric(20, 6), nullable=False),
        sa.Column("unit", sa.String(20), nullable=True),
        sa.Column("source", sa.String(50), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index(
        "ix_macro_snapshot_indicator_bucket",
        "macro_snapshot",
        ["indicator", "timestamp_bucket"],
        unique=True,
    )

    op.create_table(
        "explanation_cache",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("timestamp_bucket", sa.DateTime(timezone=True), nullable=False, index=True),
        sa.Column("metric_hash", sa.String(64), nullable=False),
        sa.Column("explanation", sa.Text, nullable=False),
        sa.Column("score", sa.Integer, nullable=False),
        sa.Column("category", sa.String(20), nullable=False),
        sa.Column("top_factors", sa.Text, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index(
        "ix_explanation_cache_hash_bucket",
        "explanation_cache",
        ["metric_hash", "timestamp_bucket"],
        unique=True,
    )
    op.create_table(
        "news_cache",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("article_id", sa.String(255), nullable=False, unique=True, index=True),
        sa.Column("title", sa.Text, nullable=False),
        sa.Column("source", sa.String(255), nullable=True),
        sa.Column("url", sa.Text, nullable=True),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True, index=True),
        sa.Column("sentiment_score", sa.Float, nullable=True),
        sa.Column("content_snippet", sa.Text, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("news_cache")
    op.drop_table("explanation_cache")
    op.drop_table("macro_snapshot")
    op.drop_table("currency_snapshot")
