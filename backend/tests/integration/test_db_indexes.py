"""Integration test for DB index creation."""

import pytest
from app.core.db_indexes import create_indexes, get_all_indexes


@pytest.mark.integration
@pytest.mark.asyncio
async def test_create_indexes_creates_all(live_mongodb):
    await create_indexes(live_mongodb)

    indexes = get_all_indexes()
    for collection_name in indexes:
        collection = live_mongodb[collection_name]
        index_list = [idx async for idx in collection.list_indexes()]
        # Each collection should have at least the default _id index + our indexes
        assert len(index_list) > 1, f"Collection {collection_name} has no custom indexes"


@pytest.mark.integration
def test_get_all_indexes_returns_all_collections():
    indexes = get_all_indexes()
    expected_collections = [
        "users", "courses", "user_progress",
        "topic_graph", "knowledge_profile",
        "chat_sessions", "sync_log",
    ]
    for collection in expected_collections:
        assert collection in indexes, f"Missing index definition for {collection}"
