"""Initial sync script — fetch latest content from developer-roadmap."""

import asyncio
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
from app.pipeline.orchestrator import run_pipeline


async def main():
    """Run initial sync from nilbuild/developer-roadmap.

    Usage:
        python scripts/initial_sync.py              # Skip LLM (fast)
        python scripts/initial_sync.py --with-llm   # Include LLM extraction
    """
    skip_llm = "--with-llm" not in sys.argv

    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.DATABASE_NAME]

    mode = "without LLM" if skip_llm else "with LLM extraction"
    print(f"Starting initial sync ({mode}) from nilbuild/developer-roadmap...")
    print(f"MongoDB: {settings.MONGODB_URL}")
    print(f"Database: {settings.DATABASE_NAME}")

    result = await run_pipeline(db, triggered_by="initial_sync", skip_llm=skip_llm)

    print("\nSync result:")
    print(f"  Status: {result.get('status')}")
    print(f"  SHA: {result.get('sha')}")

    if result.get("status") == "completed":
        print(f"  Courses: {result.get('courses_updated', 0)}")
        print(f"  Global Skills/Frameworks Built: {result.get('topics_built', 0)}")
        print(f"  Nodes added: {result.get('nodes_added', 0)}")
        print(f"  Nodes updated: {result.get('nodes_updated', 0)}")
    elif result.get("status") == "no_changes":
        print("  No new changes since last sync")
    elif result.get("status") == "failed":
        print(f"  Error: {result.get('error')}")

    client.close()
    return result


if __name__ == "__main__":
    asyncio.run(main())
