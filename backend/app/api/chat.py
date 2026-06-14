from fastapi import APIRouter, Depends, Request, HTTPException, status
from fastapi.responses import StreamingResponse
import json
from typing import Optional
from datetime import datetime

from app.core.auth import get_current_user
from app.models.dtos import ChatRequest
from app.graph.workflow import build_stream_workflow
from app.services.chat_repo import ChatRepo

router = APIRouter()

workflow = build_stream_workflow()


def get_chat_repo(request: Request) -> ChatRepo:
    return ChatRepo(request.app.db)


@router.post("/stream")
async def chat_stream(
    req: ChatRequest,
    user_id: str = Depends(get_current_user),
    chat_repo: ChatRepo = Depends(get_chat_repo),
    request: Request = None,
):
    session_id = req.course_id

    if not session_id:
        session_id = await chat_repo.create(
            user_id=user_id,
            course_context=req.course_id,
            node_context=req.node_id,
        )
    else:
        await chat_repo.save_message(session_id, "user", req.message)

    initial_state = {
        "user_id": user_id,
        "user_message": req.message,
        "course_context": req.course_id,
        "node_context": req.node_id,
        "query_type": "general",
        "complexity": "simple",
        "extracted_entities": [],
        "knowledge_profile": {},
        "completed_nodes": [],
        "difficulty_preference": "intermediate",
        "effective_difficulty": "intermediate",
        "text_results": [],
        "graph_results": [],
        "fused_results": [],
        "tool_calls": [],
        "response": "",
        "sources_cited": [],
        "conversation_summary": None,
        "session_id": session_id,
        "message_count": 1,
        "token_count": 0,
        "_db": request.app.db,
        "_conversation_history": [],
        "_stream_chunk": "",
    }

    async def event_generator():
        full_response = []
        sources = []
        final_state = initial_state.copy()

        try:
            async for event in workflow.astream(initial_state, stream_mode="updates"):
                for node_name, node_output in event.items():
                    final_state.update(node_output)
                    chunk = node_output.get("_stream_chunk", "")
                    if chunk and not chunk.startswith("Error"):
                        full_response.append(chunk)
                        yield f"event: token\ndata: {json.dumps({'token': chunk})}\n\n"

            sources = final_state.get("sources_cited", [])

            yield f"event: sources\ndata: {json.dumps({'sources': sources})}\n\n"

            await chat_repo.save_message(
                session_id, "assistant",
                "".join(full_response),
                sources=sources,
            )

            yield f"event: done\ndata: {json.dumps({'session_id': session_id, 'token_count': len(full_response)})}\n\n"

        except Exception as e:
            yield f"event: error\ndata: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@router.get("/history")
async def chat_history(
    user_id: str = Depends(get_current_user),
    chat_repo: ChatRepo = Depends(get_chat_repo),
):
    sessions = await chat_repo.find_by_user(user_id)
    return {"sessions": sessions}


@router.get("/history/{session_id}")
async def chat_session(
    session_id: str,
    user_id: str = Depends(get_current_user),
    chat_repo: ChatRepo = Depends(get_chat_repo),
):
    session = await chat_repo.find_by_id(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return {
        "session_id": session["_id"],
        "messages": session.get("messages", []),
        "created_at": session.get("created_at"),
        "token_count": session.get("token_count", 0),
    }


@router.delete("/history/{session_id}")
async def chat_delete(
    session_id: str,
    user_id: str = Depends(get_current_user),
    chat_repo: ChatRepo = Depends(get_chat_repo),
):
    deleted = await chat_repo.delete(session_id, user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"status": "deleted"}
