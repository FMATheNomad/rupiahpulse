from __future__ import annotations

import asyncio
import signal

import structlog
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger

from app.core.config import settings
from app.core.logging import setup_logging
from app.jobs.scheduler import (
    run_currency_job,
    run_market_job,
    run_news_job,
    run_health_index_job,
    run_macro_daily_job,
)

logger = structlog.get_logger(__name__)


async def run_scheduler():
    setup_logging()
    scheduler = AsyncIOScheduler()

    scheduler.add_job(run_currency_job, IntervalTrigger(minutes=5), id="currency_fetch", replace_existing=True)
    scheduler.add_job(run_market_job, IntervalTrigger(minutes=5), id="market_fetch", replace_existing=True)
    scheduler.add_job(run_news_job, IntervalTrigger(minutes=30), id="news_fetch", replace_existing=True)
    scheduler.add_job(run_health_index_job, IntervalTrigger(minutes=5), id="health_index_calc", replace_existing=True)
    scheduler.add_job(run_macro_daily_job, IntervalTrigger(hours=24), id="macro_daily_fetch", replace_existing=True)

    scheduler.start()
    logger.info("worker_started", app_env=settings.APP_ENV)

    loop = asyncio.get_running_loop()
    stop_event = asyncio.Event()

    for sig in (signal.SIGINT, signal.SIGTERM):
        try:
            loop.add_signal_handler(sig, lambda: stop_event.set())
        except NotImplementedError:
            pass

    await stop_event.wait()
    logger.info("worker_shutting_down")
    scheduler.shutdown(wait=False)


def main():
    asyncio.run(run_scheduler())


if __name__ == "__main__":
    main()
