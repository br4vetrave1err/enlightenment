import os
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from httpx import ASGITransport, AsyncClient
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from mongomock_motor import AsyncMongoMockClient

from app.core.auth import create_access_token

# Disable rate limiting in tests - must be set before importing app
os.environ["DISABLE_RATE_LIMIT"] = "true"

from app.main import app


@pytest.fixture(autouse=True)
def reset_rate_limiter():
    """Reset rate limiter between tests."""
    from app.main import rate_limiter
    rate_limiter.requests.clear()
    yield


@pytest.fixture
def mock_mongodb():
    """Create an async mongomock client that mimics motor's async interface."""
    client = AsyncMongoMockClient()
    db = client["roadmap_learning_test"]
    return db


@pytest.fixture
def test_user_factory():
    """Factory for creating test user documents."""
    def create_user(email="test@example.com", display_name="Test User", password_hash="$2b$12$dummy"):
        return {
            "email": email,
            "display_name": display_name,
            "password_hash": password_hash,
            "google_id": None,
            "avatar_url": None,
            "settings": {
                "preferred_model": "qwen3.6-plus",
                "difficulty_preference": "auto",
                "constellation_theme": "dark",
            },
        }
    return create_user


@pytest.fixture
def test_course_factory():
    """Factory for creating test course documents."""
    def create_course(course_id="frontend", title="Frontend Developer"):
        return {
            "course_id": course_id,
            "title": title,
            "description": f"Learn to become a {title.lower()} developer",
            "icon": "🎨",
            "nodes": [
                {
                    "node_id": "html-basics",
                    "title": "HTML Basics",
                    "content": "# HTML Basics\n\nHTML stands for HyperText Markup Language.",
                    "links": ["https://mdn.io/html"],
                    "position": {"x": 100, "y": 200},
                    "tags": ["html", "markup", "beginner"],
                    "prerequisites": [],
                    "estimated_minutes": 30,
                    "extracted_concepts": ["html", "markup", "dom"],
                    "difficulty": "beginner",
                    "summary": "Introduction to HTML structure and elements",
                },
                {
                    "node_id": "css-basics",
                    "title": "CSS Basics",
                    "content": "# CSS Basics\n\nCSS stands for Cascading Style Sheets.",
                    "links": ["https://mdn.io/css"],
                    "position": {"x": 300, "y": 200},
                    "tags": ["css", "styling", "beginner"],
                    "prerequisites": ["html-basics"],
                    "estimated_minutes": 45,
                    "extracted_concepts": ["css", "styling", "layout"],
                    "difficulty": "beginner",
                    "summary": "Introduction to CSS styling and layout",
                },
            ],
            "edges": [
                {"from": "html-basics", "to": "css-basics", "type": "sequential"},
            ],
        }
    return create_course


@pytest.fixture
async def async_client(mock_mongodb):
    """Create an async test client with mocked MongoDB."""
    app.db = mock_mongodb
    transport = ASGITransport(app=app)
    client = AsyncClient(transport=transport, base_url="http://test")
    yield client
    await client.aclose()
    if hasattr(app, "db"):
        delattr(app, "db")


@pytest.fixture
async def auth_client(mock_mongodb):
    """Create an async test client with auth token and mocked MongoDB."""
    app.db = mock_mongodb
    transport = ASGITransport(app=app)
    client = AsyncClient(transport=transport, base_url="http://test")
    # Create a test user in the DB
    await app.db.users.insert_one({
        "_id": ObjectId(),
        "email": "test@example.com",
        "display_name": "Test User",
        "password_hash": "$2b$12$dummy",
    })
    # Generate auth token
    token = create_access_token("test_user_id")
    client.headers["Authorization"] = f"Bearer {token}"
    yield client
    await client.aclose()
    if hasattr(app, "db"):
        delattr(app, "db")


@pytest.fixture
async def live_mongodb():
    """Create a real MongoDB connection for integration tests."""
    import os
    mongo_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    client = AsyncIOMotorClient(mongo_url)
    db = client["roadmap_learning_integration_test"]
    yield db
    await client.drop_database("roadmap_learning_integration_test")
    client.close()


@pytest.fixture
async def live_client(live_mongodb):
    """Create an async test client with live MongoDB."""
    app.db = live_mongodb
    transport = ASGITransport(app=app)
    client = AsyncClient(transport=transport, base_url="http://test")
    yield client
    await client.aclose()
    if hasattr(app, "db"):
        delattr(app, "db")


@pytest.fixture
async def live_mongodb():
    """Create a real MongoDB connection for integration tests."""
    # Inside Docker: mongodb://mongodb:27017, on host: mongodb://localhost:27017
    import os
    mongo_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    client = AsyncIOMotorClient(mongo_url)
    db = client["roadmap_learning_integration_test"]
    yield db
    # Cleanup: drop test database
    await client.drop_database("roadmap_learning_integration_test")
    client.close()


@pytest.fixture
async def live_client(live_mongodb):
    """Create an async test client with live MongoDB."""
    app.db = live_mongodb
    transport = ASGITransport(app=app)
    client = AsyncClient(transport=transport, base_url="http://test")
    yield client
    await client.aclose()
    if hasattr(app, "db"):
        delattr(app, "db")


@pytest.fixture(autouse=True)
def mock_run_pipeline():
    """Mock the background run_pipeline task globally in tests to prevent git clones and LLM queries."""
    with patch("app.pipeline.orchestrator.run_pipeline") as mock:
        mock.return_value = {
            "status": "completed",
            "sha": "test-sha",
            "courses_updated": 1,
            "topics_built": 1,
            "nodes_added": 1,
            "nodes_updated": 0
        }
        yield mock
