import fakeredis
import pytest


@pytest.fixture
def fake_redis(monkeypatch):
    """Swap the limiter's Redis client for an in-process fake."""
    fake = fakeredis.FakeStrictRedis(decode_responses=True)
    # Patch the reference in the module that USES it (import binds the name there).
    monkeypatch.setattr("app.utils.rate_limit.redis_client", fake)
    return fake
