from fastapi import APIRouter, Depends
from app.core.auth import get_current_user

router = APIRouter()


@router.get("/")
async def list_courses(user_id: str = Depends(get_current_user)):
    pass


@router.get("/{course_id}")
async def get_course(course_id: str, user_id: str = Depends(get_current_user)):
    pass


@router.get("/{course_id}/nodes/{node_id}")
async def get_node(course_id: str, node_id: str, user_id: str = Depends(get_current_user)):
    pass
