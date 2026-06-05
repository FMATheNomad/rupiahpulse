# Rupiah Pulse — Single container: Frontend (nginx) + Backend (FastAPI) + Worker

# ── Build frontend ──
FROM node:20-alpine AS frontend
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# ── Final runtime (Alpine with Python + nginx) ──
FROM nginx:alpine

# Install Python and build deps
RUN apk add --no-cache python3 py3-pip gcc libpq-dev python3-dev musl-dev && \
    pip3 install --no-cache-dir --break-system-packages \
    fastapi==0.115.6 uvicorn[standard]==0.34.0 sqlalchemy==2.0.36 \
    asyncpg==0.30.0 psycopg2-binary==2.9.10 alembic==1.14.1 \
    pydantic==2.10.5 pydantic-settings==2.7.1 httpx==0.28.1 \
    apscheduler==3.11.0 python-dotenv==1.1.0 structlog==25.2.0 orjson==3.10.15 && \
    adduser -D appuser

# Copy backend code
WORKDIR /app
COPY backend/ .

# Copy frontend build
COPY --from=frontend /app/dist /usr/share/nginx/html

# Copy nginx + supervisor config
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY deploy/supervisord.conf /etc/supervisor.d/rupiahpulse.ini

RUN chown -R appuser:appuser /app /usr/share/nginx/html

EXPOSE 80

CMD ["supervisord", "-c", "/etc/supervisor.d/rupiahpulse.ini", "-n"]
