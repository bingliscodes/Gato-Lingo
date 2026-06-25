"""Integration tests for server-side rate-limit enforcement on /realtime/token."""

from app.utils import rate_limit


class _FakeOpenAI:
    """Stand-in so tests never call the real OpenAI API."""

    def __init__(self, *args, **kwargs):
        self.realtime = self

    @property
    def client_secrets(self):
        return self

    def create(self, session):
        class _Secret:
            def model_dump(self_inner):
                return {"client_secret": "fake-ephemeral-key"}

        return _Secret()


def test_token_requires_auth(client):
    """Unauthenticated mint is rejected before any spend."""
    res = client.post("/realtime/token", json={"language": "spanish"})
    assert res.status_code == 401


def test_token_enforces_limit(auth_client, monkeypatch):
    monkeypatch.setattr("app.controllers.realtime.OpenAI", _FakeOpenAI)
    # Lower the per-user limit so we hit it quickly.
    monkeypatch.setattr(rate_limit.settings, "max_daily_requests", 2)

    body = {"language": "spanish"}
    first = auth_client.post("/realtime/token", json=body)
    second = auth_client.post("/realtime/token", json=body)
    third = auth_client.post("/realtime/token", json=body)

    assert first.status_code == 200
    assert second.status_code == 200
    assert third.status_code == 429  # over limit -> no token minted


def test_usage_me_is_read_only(auth_client, fake_redis):
    """Reading remaining quota must not create or bump a counter."""
    res = auth_client.get("/usage/me")
    assert res.status_code == 200
    auth_client.get("/usage/me")
    # A read endpoint should never write a usage key.
    assert fake_redis.keys("usage:*") == []
