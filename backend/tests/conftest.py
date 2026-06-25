import fakeredis
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.pool import StaticPool
from sqlmodel import Session, SQLModel, create_engine

# Importing the app also imports every controller -> every model, so
# SQLModel.metadata is fully populated before we create_all() below.
from app.main import app
from app.database.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User


@pytest.fixture
def fake_redis(monkeypatch):
    """Swap the limiter's Redis client for an in-process fake."""
    fake = fakeredis.FakeStrictRedis(decode_responses=True)
    # Patch the reference in the module that USES it (import binds the name there).
    monkeypatch.setattr("app.utils.rate_limit.redis_client", fake)
    return fake


@pytest.fixture
def session():
    """A fresh in-memory SQLite DB per test (StaticPool keeps one shared connection)."""
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as s:
        yield s


@pytest.fixture
def client(session, fake_redis):
    """TestClient with get_db pointed at the test session and Redis faked.

    Not used as a context manager on purpose: that would fire the app lifespan
    (init_db/seed/redis ping) against real infrastructure.
    """
    app.dependency_overrides[get_db] = lambda: session
    yield TestClient(app)
    app.dependency_overrides.clear()


@pytest.fixture
def auth_user(session):
    """A persisted student with no usage_token (-> per-user rate-limit bucket)."""
    user = User(
        email="student@test.com",
        password_hash="x",
        first_name="Test",
        last_name="Student",
        role="student",
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@pytest.fixture
def auth_client(client, auth_user):
    """client, but with get_current_user overridden to return auth_user."""
    app.dependency_overrides[get_current_user] = lambda: auth_user
    return client
