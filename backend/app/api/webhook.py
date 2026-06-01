from fastapi import APIRouter, Request, HTTPException
import hashlib
import hmac

from app.core.config import settings

router = APIRouter()


@router.post("/github")
async def github_webhook(request: Request):
    # Verify signature
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

    # Only process pushes to master
    if payload.get("ref") != "refs/heads/master":
        return {"status": "ignored", "reason": "not master branch"}

    # Trigger pipeline in background
    # TODO: await run_pipeline(triggered_by="webhook", payload=payload)

    return {"status": "accepted"}
