"""LangGraph workflow definition."""

from langgraph.graph import StateGraph, END
from app.agent.state import ChatState
from app.agent.nodes import (
    classify_query,
    load_user_context,
    retrieve_text,
    retrieve_graph,
    fuse_results,
    generate_response,
    generate_response_stream,
    check_summarize,
)


def build_workflow() -> StateGraph:
    """Build the sequential chat workflow graph."""
    workflow = StateGraph(ChatState)

    workflow.add_node("classify_query", classify_query)
    workflow.add_node("load_user_context", load_user_context)
    workflow.add_node("retrieve_text", retrieve_text)
    workflow.add_node("retrieve_graph", retrieve_graph)
    workflow.add_node("fuse_results", fuse_results)
    workflow.add_node("generate_response", generate_response)
    workflow.add_node("generate_response_stream", generate_response_stream)
    workflow.add_node("check_summarize", check_summarize)

    workflow.set_entry_point("classify_query")
    workflow.add_edge("classify_query", "load_user_context")
    workflow.add_edge("load_user_context", "retrieve_text")
    workflow.add_edge("retrieve_text", "retrieve_graph")
    workflow.add_edge("retrieve_graph", "fuse_results")
    workflow.add_edge("fuse_results", "generate_response")
    workflow.add_edge("generate_response", "check_summarize")
    workflow.add_edge("check_summarize", END)

    return workflow.compile()


def build_stream_workflow() -> StateGraph:
    """Build workflow with streaming response generation."""
    workflow = StateGraph(ChatState)

    workflow.add_node("classify_query", classify_query)
    workflow.add_node("load_user_context", load_user_context)
    workflow.add_node("retrieve_text", retrieve_text)
    workflow.add_node("retrieve_graph", retrieve_graph)
    workflow.add_node("fuse_results", fuse_results)
    workflow.add_node("generate_response_stream", generate_response_stream)
    workflow.add_node("check_summarize", check_summarize)

    workflow.set_entry_point("classify_query")
    workflow.add_edge("classify_query", "load_user_context")
    workflow.add_edge("load_user_context", "retrieve_text")
    workflow.add_edge("retrieve_text", "retrieve_graph")
    workflow.add_edge("retrieve_graph", "fuse_results")
    workflow.add_edge("fuse_results", "generate_response_stream")
    workflow.add_edge("generate_response_stream", "check_summarize")
    workflow.add_edge("check_summarize", END)

    return workflow.compile()
