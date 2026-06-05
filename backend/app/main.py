from __future__ import annotations

import sys

import structlog
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.endpoints import router as v1_router
from app.core.config import settings
from app.core.logging import setup_logging
from app.db.session import engine, async_session_factory

logger = structlog.get_logger(__name__)


def create_app() -> FastAPI:
    setup_logging()

    if settings.APP_ENV in ("staging", "production") and not settings.CORS_ORIGINS.strip():
        logger.error("cors_origins_empty", app_env=settings.APP_ENV)
        print("FATAL: CORS_ORIGINS must be set in staging/production mode")
        sys.exit(1)

    app = FastAPI(
        title="Rupiah Health Index API",
        version="1.0.0",
        docs_url="/docs" if settings.APP_ENV == "local" else None,
    )

    origins = settings.get_cors_origins()
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        logger.error("unhandled_error", error=str(exc), path=str(request.url))
        return JSONResponse(
            status_code=500,
            content={
                "error": {
                    "code": "INTERNAL_ERROR",
                    "message": "An unexpected error occurred",
                    "details": str(exc) if settings.APP_ENV == "local" else None,
                }
            },
        )

    @app.get("/health")
    async def health():
        ok = False
        try:
            async with async_session_factory() as session:
                from sqlalchemy import text
                await session.execute(text("SELECT 1"))
                ok = True
        except Exception as e:
            logger.error("healthcheck_db_failed", error=str(e))

        if not ok:
            return JSONResponse(
                status_code=503,
                content={"status": "unhealthy", "database": "disconnected"},
            )
        return {"status": "healthy", "database": "connected"}

    app.include_router(v1_router, prefix="/api/v1")

    @app.on_event("shutdown")
    async def shutdown():
        await engine.dispose()

    return app


app = create_app()
