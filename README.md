# 🇮🇩 Rupiah Pulse — Rupiah Health Index

> **Real-time web application that monitors, analyzes, and predicts the Indonesian Rupiah's health against the US Dollar.**

Built with FastAPI + React + PostgreSQL. Fetches live data from Yahoo Finance, Stooq, World Bank & GDELT every 5 minutes. Includes a deterministic scoring engine, rule-based NLG explanation engine (Bahasa Indonesia / English), and an exponentially-weighted regression prediction model.

---

## ✨ Features

- **Real-time USD/IDR rate** — Live from Yahoo Finance (USDIDR=X), updates every 5 min
- **Rupiah Health Index (0–100)** — Composite score from 7 factors (DXY, Oil, Inflation, FX Reserves, Trade Balance, Market Sentiment, USD/IDR Rate)
- **Prediction Engine** — Exponentially-weighted regression + acceleration detection + economist consensus
- **Explanation Engine** — Deterministic NLG in Bahasa Indonesia & English
- **Time-Series Charts** — 1H to Max range, daily granularity, ECharts
- **News Aggregator** — GDELT-powered with sentiment scoring, language filtering, pagination + refresh
- **Responsive UI** — Dark/Light/System theme toggle, ID/EN/Auto language toggle, hamburger mobile menu
- **SEO Optimized** — JSON-LD structured data, sitemap.xml, Google Search Console, OG tags, canonical URLs
- **Anti-Abuse** — 60s cooldown on news refresh, nginx rate limiting
- **Security** — CORS restricted, security headers, non-root container, error sanitization

---

## 🏗 Architecture

```
rupiahpulse/
├── backend/                    # FastAPI (Python 3.13)
│   ├── app/
│   │   ├── api/v1/            # REST endpoints (versioned)
│   │   ├── core/              # Config, structured JSON logging
│   │   ├── db/                # SQLAlchemy async session
│   │   ├── models/            # 4 tables: currency, macro, explanation, news
│   │   ├── schemas/           # Pydantic DTOs (type-safe)
│   │   ├── services/          # Scoring, explanation, prediction, data providers
│   │   └── jobs/              # APScheduler worker (5 min + daily)
│   ├── migrations/            # Alembic (all schema changes)
│   ├── tests/                 # Pytest (44 tests)
│   ├── Dockerfile             # Web service
│   ├── Dockerfile.worker      # Worker service
│   └── seed.py                # 5-year realistic historical data
├── frontend/                   # React 18 + Vite + TypeScript
│   ├── src/
│   │   ├── components/        # UI (shadcn-style), Charts (ECharts), Pages
│   │   ├── hooks/             # TanStack Query hooks
│   │   └── styles/            # TailwindCSS
│   └── Dockerfile             # Nginx static build
├── docker-compose.yml         # Local development
└── README.md
```

### Single-Container Architecture

All services run in 1 container via supervisord:

| Process | Role | Port |
|---------|------|------|
| **nginx** | Serves frontend SPA + proxies /api/ to backend | 80 |
| **uvicorn** | FastAPI backend (REST API v1) | 8000 |
| **worker** | APScheduler: fetches data every 5 min | — |

---

## 🚀 Quick Start (Local)

### Prerequisites

- Python 3.13+
- Node.js 20+
- PostgreSQL 16+
- Docker (optional)

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install fastapi uvicorn sqlalchemy asyncpg psycopg2-binary alembic pydantic pydantic-settings httpx apscheduler python-dotenv structlog orjson

# Set up DB
psql -U postgres -c "CREATE DATABASE rupiahpulse;"

# Migrate & seed
PYTHONPATH=. alembic upgrade head
PYTHONPATH=. python seed.py

# Start API
PYTHONPATH=. uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

### Worker

```bash
cd backend
PYTHONPATH=. python -m app.jobs.runner
```

### Docker Compose

```bash
docker compose up --build
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Healthcheck (validates DB) |
| `GET` | `/api/v1/usd-idr` | Latest USD/IDR rate |
| `GET` | `/api/v1/usd-idr/history?range=1y&granularity=daily` | USD/IDR time series |
| `GET` | `/api/v1/health-index` | Live health index + factor breakdown |
| `GET` | `/api/v1/history?range=1y` | Health index history |
| `GET` | `/api/v1/prediction` | Rupiah forecast (1m/3m/6m/1y) |
| `GET` | `/api/v1/explanation` | Latest explanation text |
| `GET` | `/api/v1/news?limit=10&offset=0` | Paginated news with sentiment |
| `POST` | `/api/v1/news/refresh` | Trigger GDELT news fetch (60s cooldown) |

All responses use standard envelope:
```json
{ "data": {...}, "meta": {...} }
```

### Range Options

`1d`, `5d`, `1m`, `3m`, `1y`, `5y`, `max`

---

## 🧮 Health Index Formula

Score range: **0–100**

| Factor | Weight | Frequency | Baseline |
|--------|--------|-----------|----------|
| DXY | 15% | 5 min | 95 (index) |
| Crude Oil | 10% | 5 min | $65/bbl |
| Inflation (ID) | 10% | Monthly | 2.5% (BI target) |
| FX Reserves | 10% | Monthly | $140B |
| Trade Balance | 10% | Monthly | Surplus threshold |
| Market Sentiment | 10% | 5 min | News tone (GDELT) |
| USD/IDR Rate | 35% | 5 min | Rp 15,500 |

**Categories**: Strong ≥ 75 | Neutral 50–74 | Weak < 50

---

## 🔮 Prediction Model

- **Method**: Linear regression on last 90 days of USD/IDR data
- **Adjusted by**: Average news sentiment (GDELT tone)
- **Output**: Predicted rate + 95% confidence interval for 1m/3m/6m/1y
- **Consensus**: Bearish / Neutral / Bullish (based on trend + sentiment)

---

## 📊 Data Sources

| Source | Data | Frequency | Key Required |
|--------|------|-----------|-------------|
| [Yahoo Finance](https://finance.yahoo.com) | USD/IDR (USDIDR=X), DXY (DX-Y.NYB), Oil (CL=F) | Real-time | No |
| [Stooq](https://stooq.com) | Gold (XAUUSD) | Delayed | No |
| [World Bank API](https://api.worldbank.org) | Inflation, FX Reserves, Trade Balance | Annual | No |
| [GDELT Project](https://www.gdeltproject.org) | News + sentiment | Real-time | No |

---

## 🔧 Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `APP_ENV` | ✅ | `local` | `local`, `staging`, `production` |
| `DATABASE_URL` | ✅ | — | PostgreSQL async connection string |
| `CORS_ORIGINS` | ✅ | — | Comma-separated allowed origins |
| `LOG_LEVEL` | ✅ | `DEBUG` | `DEBUG`, `INFO`, `WARNING`, `ERROR` |
| `DATA_PROVIDER_TIMEOUT_SECONDS` | ✅ | `15` | External API timeout |
| `GDELT_QUERY` | ✅ | `indonesia rupiah` | News query string |
| `CACHE_TTL_SECONDS_EXPLANATION` | ✅ | `300` | Explanation cache TTL |
| `CACHE_TTL_SECONDS_NEWS` | ✅ | `600` | News cache TTL |

---

## 🗄 Database Migrations

```bash
PYTHONPATH=. alembic upgrade head       # Apply all migrations
PYTHONPATH=. alembic downgrade -1       # Rollback last
PYTHONPATH=. alembic revision --autogenerate -m "description"  # Create new
```

## 🧪 Testing

```bash
cd backend
PYTHONPATH=. pytest --cov=app tests/
```

```bash
cd frontend
npm test
```

---

## 🌐 Deployment (Railway)

### One-Command Deploy (Automated)

```bash
chmod +x railway-deploy.sh
./railway-deploy.sh
```

The script will:
1. Login to Railway via CLI
2. Create project + PostgreSQL plugin
3. Create all 3 services (api, worker, frontend) with correct configs
4. Set all environment variables
5. Trigger deployment

Post-deploy steps (via Railway Shell):
```bash
cd backend && pip install -r requirements.txt && PYTHONPATH=. alembic upgrade head && python seed.py
```

### Manual Deploy

Railway detects the service via root `railway.json` with DOCKERFILE builder:

| Setting | Value |
|---------|-------|
| **Root Directory** | (empty — use repo root) |
| **Build** | Auto-detect `Dockerfile` |
| **Port** | `80` (set `PORT=80` env var) |
| **Healthcheck** | `/health` |

**Steps:**
1. Connect GitHub repo `FMATheNomad/rupiahpulse` to Railway
2. Add PostgreSQL plugin
3. Railway auto-detects 3 services from subdirectory `railway.json` files
4. For **Worker**: override start command to `python -m app.jobs.runner`
5. Set environment variables for each service
6. Run migrations + seed via Railway Shell:
   ```bash
   cd backend && pip install fastapi uvicorn sqlalchemy asyncpg psycopg2-binary alembic pydantic pydantic-settings httpx apscheduler python-dotenv structlog orjson && PYTHONPATH=. alembic upgrade head && python seed.py
   ```

### Required Environment Variables

| Variable | Required | Services |
|----------|----------|----------|
| `APP_ENV` | ✅ | api, worker |
| `DATABASE_URL` | ✅ (auto by Railway) | api, worker |
| `CORS_ORIGINS` | ✅ | api |
| `LOG_LEVEL` | ✅ | api, worker |
| `DATA_PROVIDER_TIMEOUT_SECONDS` | ✅ | api, worker |
| `GDELT_QUERY` | ✅ | worker |
| `CACHE_TTL_SECONDS_EXPLANATION` | ✅ | api, worker |
| `CACHE_TTL_SECONDS_NEWS` | ✅ | api, worker |
| `VITE_API_BASE_URL` | ✅ | frontend |

---

## 📄 License

MIT © 2026 FMA Software Labs — see [LICENSE](./LICENSE)

---

## 🧑‍💻 Author

**FMA Software Labs** — Built for the Indonesian market by [FMATheNomad](https://github.com/FMATheNomad)
