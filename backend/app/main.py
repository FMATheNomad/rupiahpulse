from __future__ import annotations

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

    app = FastAPI(
        title="Rupiah Health Index API",
        version="1.0.0",
        docs_url="/docs" if settings.APP_ENV == "local" else None,
    )

    origins = settings.get_cors_origins()
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=False,
        allow_methods=["GET", "POST"],
        allow_headers=["Content-Type", "Authorization"],
    )

    @app.middleware("http")
    async def log_requests(request: Request, call_next):
        logger.info("request", method=request.method, path=request.url.path)
        response = await call_next(request)
        logger.info("response", status=response.status_code)
        return response

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        sanitized = str(exc).replace(str(settings.DATABASE_URL), "***REDACTED***")
        logger.error("unhandled_error", error=sanitized, path=str(request.url))
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
                content={"status": "unhealthy"},
            )
        return {"status": "healthy"}

    app.include_router(v1_router, prefix="/api/v1")

    @app.on_event("shutdown")
    async def shutdown():
        await engine.dispose()

    return app


app = create_app()
