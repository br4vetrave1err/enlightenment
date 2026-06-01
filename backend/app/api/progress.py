from fastapi import APIRouter, Depends
from app.core.auth import get_current_user

router = APIRouter()


@router.get("/learning-stats")
async def get_learning_stats(user_id: str = Depends(get_current_user)):
    pass


@router.get("/knowledge-profile")
async def get_knowledge_profile(user_id: str = Depends(get_current_user)):
    pass


@router.post("/progress/{course_id}/node")
async def update_node_progress(
    course_id: str,
    user_id: str = Depends(get_current_user),
):
    pass
