"""MongoDB index definitions for all collections."""


def get_all_indexes():
    """Return all index definitions keyed by collection name.

    Each entry is a list of index specs:
        (keys, options) where keys is a dict and options is a dict.
    """
    return {
        "users": [
            ([("email", 1)], {"unique": True}),
            ([("google_id", 1)], {"unique": True, "sparse": True}),
        ],
        "courses": [
            ([("course_id", 1)], {"unique": True}),
            ([("nodes.node_id", 1), ("course_id", 1)], {}),
            (
                [
                    ("nodes.title", "text"),
                    ("nodes.content", "text"),
                    ("nodes.tags", "text"),
                ],
                {},
            ),
        ],
        "user_progress": [
            ([("user_id", 1), ("course_id", 1)], {"unique": True}),
            ([("user_id", 1)], {}),
        ],
        "topic_graph": [
            ([("name", 1)], {"unique": True}),
            ([("relationships.to", 1)], {}),
            ([("courses_seen_in", 1)], {}),
        ],
        "knowledge_profile": [
            ([("user_id", 1)], {"unique": True}),
        ],
        "chat_sessions": [
            ([("user_id", 1), ("created_at", -1)], {}),
            ([("user_id", 1), ("course_context_id", 1)], {}),
        ],
        "sync_log": [
            ([("started_at", -1)], {}),
        ],
        "refresh_tokens": [
            ([("token", 1), ("revoked", 1), ("expires_at", 1)], {}),
            ([("user_id", 1)], {}),
        ],
    }


async def create_indexes(db):
    """Create all indexes on the given database."""
    indexes = get_all_indexes()
    for collection_name, index_specs in indexes.items():
        collection = db[collection_name]
        for keys, options in index_specs:
            await collection.create_index(keys, **options)
