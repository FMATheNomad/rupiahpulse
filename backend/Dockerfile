FROM python:3.13-slim AS builder

RUN apt-get update && apt-get install -y --no-install-recommends gcc libpq-dev && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY pyproject.toml .
RUN pip install --no-cache-dir fastapi==0.115.6 uvicorn[standard]==0.34.0 sqlalchemy==2.0.36 asyncpg==0.30.0 psycopg2-binary==2.9.10 alembic==1.14.1 pydantic==2.10.5 pydantic-settings==2.7.1 httpx==0.28.1 apscheduler==3.11.0 python-dotenv==1.1.0 structlog==25.2.0 orjson==3.10.15

FROM python:3.13-slim
WORKDIR /app

RUN groupadd -r appuser && useradd -r -g appuser appuser

COPY --from=builder /usr/local/lib/python3.13/site-packages /usr/local/lib/python3.13/site-packages
COPY --from=builder /usr/local/bin/uvicorn /usr/local/bin/uvicorn

COPY . .
RUN chown -R appuser:appuser /app

USER appuser

ENV PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1 PYTHONPATH=/app

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--proxy-headers"]
