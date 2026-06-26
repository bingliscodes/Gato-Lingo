"""Unit tests for resolve_key_and_limit's per-user vs shared-demo bucketing."""
from datetime import datetime, timezone

from app.models.usage_token import UsageToken
from app.models.user import User
from app.utils import rate_limit


def test_normal_user_gets_per_user_bucket(session):
    user = User(email="a@test.com", password_hash="x", first_name="A", last_name="B")
    session.add(user)
    session.commit()
    session.refresh(user)

    key, limit = rate_limit.resolve_key_and_limit(user)

    assert key.startswith(f"usage:user:{user.id}:")
    assert limit == rate_limit.settings.max_daily_requests


def test_demo_users_share_one_bucket(session):
    demo_token = UsageToken(name="demo", usage_limit=10)
    session.add(demo_token)
    session.commit()
    session.refresh(demo_token)

    # Two different demo users linked to the same token...
    u1 = User(email="d1@test.com", password_hash="x", first_name="D", last_name="1",
              usage_token_id=demo_token.id)
    u2 = User(email="d2@test.com", password_hash="x", first_name="D", last_name="2",
              usage_token_id=demo_token.id)
    session.add(u1)
    session.add(u2)
    session.commit()
    session.refresh(u1)
    session.refresh(u2)

    today = datetime.now(timezone.utc).date().isoformat()
    key1, limit1 = rate_limit.resolve_key_and_limit(u1)
    key2, limit2 = rate_limit.resolve_key_and_limit(u2)

    # ...resolve to the SAME shared key, capped by the token's limit.
    assert key1 == key2 == f"usage:demo:{today}"
    assert limit1 == limit2 == 10
