from fastapi import APIRouter, Depends, Request, HTTPException, status
from typing import Optional

from app.core.auth import get_current_user
from app.services.course_repo import CourseRepo
from app.services.progress_repo import ProgressRepo
from app.services.progress_service import ProgressService

router = APIRouter()


def is_structural_node(node_id: str, title: str, course_title: str = "") -> bool:
    if not title:
        return True
    if title == node_id:
        return True
    t = str(title).lower()
    if course_title and t == course_title.lower():
        return True
    return (
        t in ("horizontal node", "vertical node", "roadmap.sh")
        or "interactive version" in t
        or "has lots of services" in t
        or "best way to learn" in t
        or "continue learning" in t
        or "relevant tracks" in t
        or "detailed version" in t
    )


def get_course_repo(request: Request) -> CourseRepo:
    return CourseRepo(request.app.db)


def get_progress_repo(request: Request) -> ProgressRepo:
    return ProgressRepo(request.app.db)


@router.get("/")
async def list_courses(
    status_filter: Optional[str] = "all",
    user_id: str = Depends(get_current_user),
    course_repo: CourseRepo = Depends(get_course_repo),
    progress_repo: ProgressRepo = Depends(get_progress_repo),
):
    courses = await course_repo.find_all()
    progress_records = await progress_repo.find_all_for_user(user_id)
    progress_map = {r["course_id"]: r for r in progress_records}
    progress_service = ProgressService()

    result = []
    for course in courses:
        course_title = course.get("title", "")
        # Filter out structural nodes for accurate node counting
        real_nodes = [
            n for n in course.get("nodes", [])
            if not is_structural_node(n.get("node_id"), n.get("title", ""), course_title)
        ]
        total = len(real_nodes)
        
        progress = progress_map.get(course.get("course_id"), {})
        completed = progress.get("completed_nodes", [])
        real_completed = [n for n in completed if any(rn.get("node_id") == n for rn in real_nodes)]
        completed_count = len(real_completed)

        result.append({
            "course_id": course.get("course_id"),
            "title": course.get("title"),
            "description": course.get("description"),
            "icon": course.get("icon"),
            "total_nodes": total,
            "completed_nodes": completed_count,
            "completion_percentage": progress_service.calculate_completion_percentage(
                completed_nodes=completed_count, total_nodes=total,
            ),
            "last_accessed": progress.get("last_accessed"),
        })

    return {"courses": result}


@router.get("/{course_id}")
async def get_course(
    course_id: str,
    user_id: str = Depends(get_current_user),
    course_repo: CourseRepo = Depends(get_course_repo),
    progress_repo: ProgressRepo = Depends(get_progress_repo),
):
    # Retrieve user preferences for dynamic skip lists.
    # In a real app, this might come from a user profile collection.
    user_preferences = {"known_skills": []} 
    
    course = await course_repo.get_dynamic_roadmap(course_id, user_preferences)
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    progress = await progress_repo.find_by_user_course(user_id, course_id)
    completed_nodes = progress.get("completed_nodes", []) if progress else []
    current_node = progress.get("current_node", "") if progress else ""
    progress_service = ProgressService()

    # Identify structural nodes in the course
    course_title = course.get("title", "")
    structural_node_ids = set()
    for node in course.get("nodes", []):
        node_id = node.get("node_id")
        title = node.get("title", "")
        if is_structural_node(node_id, title, course_title):
            structural_node_ids.add(node_id)

    # Treat structural nodes as completed for prerequisite checks
    effective_completed = set(completed_nodes) | structural_node_ids

    # Calculate status for each topic across all phases
    for phase in course.get("phases", []):
        for topic in phase.get("topics", []):
            node_id = topic.get("id")
            
            # Reconstruct prerequisites for this specific node from topic_graph
            prereqs = [edge["from"] for edge in course.get("topic_graph", []) if edge["to"] == node_id]
            
            node_status = progress_service.calculate_node_status(
                node_id=node_id,
                prerequisites=prereqs,
                completed_nodes=list(effective_completed),
                current_node=current_node,
            )
            topic["status"] = node_status

    # Reconstruct flat nodes and edges list for contract and integration test compatibility
    flat_nodes = []
    for node in course.get("nodes", []):
        node_id = node.get("node_id")
        prereqs = [edge["from"] for edge in course.get("topic_graph", []) if edge["to"] == node_id]
        node_status = progress_service.calculate_node_status(
            node_id=node_id,
            prerequisites=prereqs,
            completed_nodes=list(effective_completed),
            current_node=current_node,
        )
        flat_nodes.append({
            "node_id": node_id,
            "title": node.get("title"),
            "content": node.get("content", ""),
            "links": node.get("links", []),
            "position": node.get("position", {"x": 0, "y": 0}),
            "tags": node.get("tags", []),
            "prerequisites": prereqs,
            "estimated_minutes": node.get("estimated_minutes", 30),
            "status": node_status
        })

    return {
        "course_id": course.get("course_id"),
        "title": course.get("title"),
        "description": course.get("description", ""),
        "meta": {
            "level": "beginner",
            "total_phases": len(course.get("phases", [])),
            "total_topics": sum(1 for p in course.get("phases", []) for t in p.get("topics", []) if t.get("id") not in structural_node_ids)
        },
        "phases": course.get("phases", []),
        "topic_graph": course.get("topic_graph", []),
        "variants": course.get("variants", []),
        "nodes": flat_nodes,
        "edges": course.get("edges", [])
    }


@router.get("/{course_id}/nodes/{node_id}")
async def get_node(
    course_id: str,
    node_id: str,
    user_id: str = Depends(get_current_user),
    course_repo: CourseRepo = Depends(get_course_repo),
):
    node = await course_repo.find_node_by_id(course_id, node_id)
    if not node:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Node not found")

    return {
        "node_id": node.get("node_id"),
        "title": node.get("title"),
        "content": node.get("content", ""),
        "links": node.get("links", []),
        "prerequisites": node.get("prerequisites", []),
        "estimated_minutes": node.get("estimated_minutes", 30),
    }
