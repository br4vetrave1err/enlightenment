"""Fallback cron sync — check for new commits every 6 hours."""

import asyncio
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.pipeline.orchestrator import run_pipeline


async def cron_sync(db: AsyncIOMotorDatabase, interval_seconds: int = 21600):
    """Run pipeline sync on a schedule (default: every 6 hours)."""
    while True:
        try:
            latest = await db.sync_log.find_one(sort=[("started_at", -1)])
            previous_sha = latest.get("github_sha") if latest else None

            result = await run_pipeline(
                db,
                triggered_by="cron",
                previous_sha=previous_sha,
            )
            print(f"Cron sync result: {result}")
        except Exception as e:
            print(f"Cron sync error: {e}")

        await asyncio.sleep(interval_seconds)
