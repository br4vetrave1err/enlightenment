from fastapi import APIRouter, Depends, Request
from app.core.auth import get_current_user
from app.models.dtos import SearchRequest
from app.services.search_service import SearchService

router = APIRouter()


def get_search_service(request: Request) -> SearchService:
    return SearchService(request.app.db)


@router.post("/search")
async def search(
    req: SearchRequest,
    user_id: str = Depends(get_current_user),
    search_service: SearchService = Depends(get_search_service),
):
    results = await search_service.search(
        query=req.query,
        course_filter=req.course_filter,
        limit=req.limit,
    )
    return {"results": results, "total": len(results)}
