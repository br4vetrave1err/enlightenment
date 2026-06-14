from fastapi import APIRouter, Depends, Request, HTTPException, status
from datetime import datetime
from typing import Optional

from app.core.auth import get_current_user
from app.models.dtos import NodeProgressRequest
from app.services.progress_repo import ProgressRepo
from app.services.progress_service import ProgressService
from app.services.stats_service import StatsService
from app.services.mastery_service import MasteryService
from app.services.knowledge_profile_repo import KnowledgeProfileRepo
from app.services.knowledge_profile_service import KnowledgeProfileService
from app.services.course_repo import CourseRepo

router = APIRouter()


def get_progress_repo(request: Request) -> ProgressRepo:
    return ProgressRepo(request.app.db)


def get_knowledge_profile_repo(request: Request) -> KnowledgeProfileRepo:
    return KnowledgeProfileRepo(request.app.db)


def get_course_repo(request: Request) -> CourseRepo:
    return CourseRepo(request.app.db)


@router.get("/learning-stats")
async def get_learning_stats(
    user_id: str = Depends(get_current_user),
    progress_repo: ProgressRepo = Depends(get_progress_repo),
    knowledge_profile_repo: KnowledgeProfileRepo = Depends(get_knowledge_profile_repo),
):
    progress_records = await progress_repo.find_all_for_user(user_id)
    profile = await knowledge_profile_repo.find_by_user(user_id)

    stats_service = StatsService()
    knowledge_service = KnowledgeProfileService()

    completed_nodes_all = []
    courses_in_progress = 0
    time_per_node_total = {}

    for record in progress_records:
        completed = record.get("completed_nodes", [])
        if completed:
            completed_nodes_all.extend([
                {"node_id": n, "completed_at": record.get("last_accessed", datetime.min)}
                for n in completed
            ])
        if record.get("current_node") or completed:
            courses_in_progress += 1
        for node_id, seconds in record.get("time_spent_per_node", {}).items():
            time_per_node_total[node_id] = time_per_node_total.get(node_id, 0) + seconds

    activity_dates = [
        record.get("last_accessed", datetime.min)
        for record in progress_records
        if record.get("last_accessed")
    ]

    topics = profile.get("topics", []) if profile else []
    gaps = knowledge_service.find_gaps(topics)

    return {
        "total_nodes_completed": len(completed_nodes_all),
        "courses_in_progress": courses_in_progress,
        "current_streak_days": stats_service.current_streak(activity_dates),
        "nodes_per_week": stats_service.nodes_per_week(completed_nodes_all),
        "time_spent_total_hours": stats_service.total_time_hours(time_per_node_total),
        "knowledge_gaps": gaps,
    }


@router.get("/knowledge-profile")
async def get_knowledge_profile(
    user_id: str = Depends(get_current_user),
    knowledge_profile_repo: KnowledgeProfileRepo = Depends(get_knowledge_profile_repo),
    progress_repo: ProgressRepo = Depends(get_progress_repo),
):
    profile = await knowledge_profile_repo.find_by_user(user_id)
    progress_records = await progress_repo.find_all_for_user(user_id)

    stats_service = StatsService()
    knowledge_service = KnowledgeProfileService()

    if not profile:
        profile = {"topics": [], "updated_at": None}

    topics = profile.get("topics", [])
    gaps = knowledge_service.find_gaps(topics)

    completed_nodes_all = []
    for record in progress_records:
        completed = record.get("completed_nodes", [])
        if completed:
            completed_nodes_all.extend([
                {"node_id": n, "completed_at": record.get("last_accessed", datetime.min)}
                for n in completed
            ])

    activity_dates = [
        record.get("last_accessed", datetime.min)
        for record in progress_records
        if record.get("last_accessed")
    ]

    return {
        "topics": topics,
        "knowledge_gaps": gaps,
        "learning_velocity": {
            "nodes_per_week": stats_service.nodes_per_week(completed_nodes_all),
            "current_streak_days": stats_service.current_streak(activity_dates),
        },
        "updated_at": profile.get("updated_at"),
    }


@router.post("/progress/{course_id}/node")
async def update_node_progress(
    course_id: str,
    req: NodeProgressRequest,
    user_id: str = Depends(get_current_user),
    progress_repo: ProgressRepo = Depends(get_progress_repo),
):
    if req.action == "complete":
        result = await progress_repo.mark_node_complete(
            user_id=user_id,
            course_id=course_id,
            node_id=req.node_id,
            time_spent=req.time_spent_seconds,
            rating=req.self_rating,
        )
    else:
        result = await progress_repo.upsert(
            user_id=user_id,
            course_id=course_id,
            data={"current_node": req.node_id},
        )

    completed_count = len(result.get("completed_nodes", [])) if result else 0

    return {
        "status": "updated",
        "node_id": req.node_id,
        "action": req.action,
        "completed_nodes_count": completed_count,
    }


@router.put("/progress/{course_id}/node/{node_id}")
async def update_node_state(
    course_id: str,
    node_id: str,
    user_id: str = Depends(get_current_user),
    progress_repo: ProgressRepo = Depends(get_progress_repo),
    course_repo: CourseRepo = Depends(get_course_repo),
):
    progress = await progress_repo.find_by_user_course(user_id, course_id)
    course = await course_repo.find_by_id(course_id)

    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    progress_service = ProgressService()

    completed_nodes = progress.get("completed_nodes", []) if progress else []
    current_node = progress.get("current_node", "") if progress else ""

    node = None
    for n in course.get("nodes", []):
        if n.get("node_id") == node_id:
            node = n
            break

    if not node:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Node not found")

    node_status = progress_service.calculate_node_status(
        node_id=node_id,
        prerequisites=node.get("prerequisites", []),
        completed_nodes=completed_nodes,
        current_node=current_node,
    )

    total_nodes = len(course.get("nodes", []))
    completion_pct = progress_service.calculate_completion_percentage(
        completed_nodes=len(completed_nodes),
        total_nodes=total_nodes,
    )

    return {
        "node_id": node_id,
        "status": node_status,
        "completion_percentage": completion_pct,
        "completed_nodes": len(completed_nodes),
        "total_nodes": total_nodes,
    }


@router.get("/progress")
async def list_progress(
    user_id: str = Depends(get_current_user),
    progress_repo: ProgressRepo = Depends(get_progress_repo),
    course_repo: CourseRepo = Depends(get_course_repo),
):
    progress_records = await progress_repo.find_all_for_user(user_id)
    progress_service = ProgressService()

    courses = []
    for record in progress_records:
        course = await course_repo.find_by_id(record["course_id"])
        total_nodes = len(course.get("nodes", [])) if course else 0
        completed_nodes = record.get("completed_nodes", [])
        completion_pct = progress_service.calculate_completion_percentage(
            completed_nodes=len(completed_nodes),
            total_nodes=total_nodes,
        )

        courses.append({
            "course_id": record["course_id"],
            "completed_nodes": len(completed_nodes),
            "total_nodes": total_nodes,
            "completion_percentage": completion_pct,
            "current_node": record.get("current_node"),
            "last_accessed": record.get("last_accessed"),
            "node_ratings": record.get("node_ratings", {}),
            "time_spent_per_node": record.get("time_spent_per_node", {}),
        })

    return {"courses": courses}
