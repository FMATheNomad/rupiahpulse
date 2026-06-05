#!/bin/bash
# ============================================================
# Rupiah Pulse — Automated Railway Deployment Script
# ============================================================
# This script creates all 3 Railway services from your
# GitHub repo in one command.
# ============================================================
set -e

REPO="FMATheNomad/rupiahpulse"
PROJECT_NAME="rupiahpulse"

echo "╔══════════════════════════════════════════════════════════╗"
echo "║        🚀 Rupiah Pulse — Railway Auto-Deploy           ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# ── Step 1: Login ──────────────────────────────────────────────
echo "➤  Checking Railway CLI..."
if ! command -v railway &> /dev/null; then
  echo "   ⚠️  Railway CLI not found. Install with:"
  echo "      curl -fsSL https://railway.app/install.sh | sh"
  exit 1
fi

echo "➤  Logging into Railway..."
railway login

# ── Step 2: Create project ─────────────────────────────────────
echo "➤  Creating project: $PROJECT_NAME..."
railway init --name "$PROJECT_NAME" 2>/dev/null || echo "   ℹ️  Project already exists, using existing."

# ── Step 3: PostgreSQL ─────────────────────────────────────────
echo "➤  Adding PostgreSQL plugin..."
railway add postgres 2>/dev/null || echo "   ℹ️  PostgreSQL already added."

# ── Step 4: Create API service ─────────────────────────────────
echo "➤  Creating API service..."
railway service create "api" 2>/dev/null || echo "   ℹ️  API service already exists."
railway link --service "api"
railway service source --service "api" --repo "$REPO" --root "backend" --branch "main"
railway service variable --service "api" set APP_ENV=production
railway service variable --service "api" set PORT=8000

# ── Step 5: Create Worker service ──────────────────────────────
echo "➤  Creating Worker service..."
railway service create "worker" 2>/dev/null || echo "   ℹ️  Worker service already exists."
railway link --service "worker"
railway service source --service "worker" --repo "$REPO" --root "backend" --branch "main"
railway service variable --service "worker" set APP_ENV=production

# Override worker start command
railway service variable --service "worker" set RAILWAY_START_COMMAND="python -m app.jobs.runner"

# ── Step 6: Create Frontend service ────────────────────────────
echo "➤  Creating Frontend service..."
railway service create "frontend" 2>/dev/null || echo "   ℹ️  Frontend service already exists."
railway link --service "frontend"
railway service source --service "frontend" --repo "$REPO" --root "frontend" --branch "main"
railway service variable --service "frontend" set VITE_API_BASE_URL=""
railway service variable --service "frontend" set PORT=80

# ── Step 7: Set shared env vars ────────────────────────────────
echo "➤  Setting environment variables..."
for svc in api worker; do
  railway service variable --service "$svc" set LOG_LEVEL=INFO
  railway service variable --service "$svc" set DATA_PROVIDER_TIMEOUT_SECONDS=15
  railway service variable --service "$svc" set GDELT_QUERY="indonesia rupiah"
  railway service variable --service "$svc" set CACHE_TTL_SECONDS_EXPLANATION=300
  railway service variable --service "$svc" set CACHE_TTL_SECONDS_NEWS=600
done

# ── Step 8: Deploy ─────────────────────────────────────────────
echo "➤  Deploying all services..."
for svc in api worker frontend; do
  echo "   Deploying $svc..."
  railway up --service "$svc" --detach 2>/dev/null || echo "   ⚠️  Deploy $svc may need manual trigger"
done

# ── Step 9: Post-deploy ────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  ✅ Deployment initiated!                               ║"
echo "║                                                          ║"
echo "║  After all services deploy, run these in Railway Shell: ║"
echo "║  1. cd backend && pip install ... && alembic upgrade head║"
echo "║  2. cd backend && python seed.py                         ║"
echo "║                                                          ║"
echo "║  Then set CORS_ORIGINS in API service to frontend URL.   ║"
echo "╚══════════════════════════════════════════════════════════╝"
