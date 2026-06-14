from fastapi import APIRouter, Depends, Request
from fastapi import HTTPException, status

from app.services.sync_log_repo import SyncLogRepo
from app.pipeline.orchestrator import run_pipeline

router = APIRouter()


def get_sync_log_repo(request: Request) -> SyncLogRepo:
    return SyncLogRepo(request.app.db)


@router.get("/status")
async def sync_status(sync_repo: SyncLogRepo = Depends(get_sync_log_repo)):
    latest = await sync_repo.find_latest()
    if not latest:
        return {"status": "never_synced"}

    return {
        "last_sync": latest.get("started_at"),
        "status": latest.get("status"),
        "courses_updated": latest.get("courses_updated", []),
        "nodes_added": latest.get("nodes_added", 0),
        "nodes_updated": latest.get("nodes_updated", 0),
        "github_sha": latest.get("github_sha"),
    }


@router.post("/trigger")
async def sync_trigger(request: Request, skip_llm: bool = False):
    result = await run_pipeline(request.app.db, triggered_by="manual", skip_llm=skip_llm)
    if result.get("status") == "failed":
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("error"),
        )
    return result
