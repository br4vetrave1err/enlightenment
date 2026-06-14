from fastapi import APIRouter, Request, HTTPException, BackgroundTasks
import hashlib
import hmac

from app.core.config import settings

router = APIRouter()


@router.post("/github")
async def github_webhook(request: Request, background_tasks: BackgroundTasks):
    signature = request.headers.get("X-Hub-Signature-256", "")
    body = await request.body()

    if settings.GITHUB_WEBHOOK_SECRET:
        expected = "sha256=" + hmac.new(
            settings.GITHUB_WEBHOOK_SECRET.encode(),
            body,
            hashlib.sha256,
        ).hexdigest()

        if not hmac.compare_digest(signature, expected):
            raise HTTPException(status_code=401, detail="Invalid signature")

    payload = await request.json()

    # Ping event from GitHub — no signature, just confirm connectivity
    if payload.get("zen"):
        return {"status": "pong"}

    if payload.get("ref") not in ("refs/heads/main", "refs/heads/master"):
        return {"status": "ignored", "reason": "not master or main branch"}

    # Get previous SHA from last sync to enable incremental fetching
    latest = await request.app.db.sync_log.find_one(sort=[("started_at", -1)])
    previous_sha = latest.get("github_sha") if latest else None

    from app.pipeline.orchestrator import run_pipeline
    background_tasks.add_task(run_pipeline, request.app.db, "webhook", previous_sha)

    return {"status": "sync_triggered", "sha": payload.get("after", "unknown")}
