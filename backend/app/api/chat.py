from fastapi import APIRouter, Depends
from app.core.auth import get_current_user

router = APIRouter()


@router.post("/stream")
async def chat_stream(user_id: str = Depends(get_current_user)):
    pass


@router.get("/history")
async def chat_history(user_id: str = Depends(get_current_user)):
    pass
