# Rupiah Pulse — Single container: Frontend (nginx) + Backend (FastAPI) + Worker
# ── Build frontend ──
FROM node:20-alpine AS frontend
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# ── Build backend ──
FROM python:3.13-slim AS backend
RUN apt-get update && apt-get install -y --no-install-recommends gcc libpq-dev && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY backend/ .
RUN pip install --no-cache-dir \
    fastapi==0.115.6 uvicorn[standard]==0.34.0 sqlalchemy==2.0.36 \
    asyncpg==0.30.0 psycopg2-binary==2.9.10 alembic==1.14.1 \
    pydantic==2.10.5 pydantic-settings==2.7.1 httpx==0.28.1 \
    apscheduler==3.11.0 python-dotenv==1.1.0 structlog==25.2.0 orjson==3.10.15

# ── Final runtime ──
FROM nginx:alpine
RUN apk add --no-cache python3 supervisor ca-certificates && \
    adduser -D appuser

# Backend
COPY --from=backend /usr/local/lib/python3.13/site-packages /usr/lib/python3.13/site-packages
COPY --from=backend /app /app

# Frontend
COPY --from=frontend /app/dist /usr/share/nginx/html

# Nginx config
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf

# Supervisor config to run both nginx + uvicorn
RUN mkdir -p /etc/supervisor.d
COPY deploy/supervisord.conf /etc/supervisor.d/rupiahpulse.ini

RUN chown -R appuser:appuser /app /usr/share/nginx/html

EXPOSE 80

CMD ["supervisord", "-c", "/etc/supervisor.d/rupiahpulse.ini", "-n"]
