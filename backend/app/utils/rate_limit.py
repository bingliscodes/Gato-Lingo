from datetime import datetime, timezone

from ..config import settings
from ..redis_client import redis_client

USAGE_TTL_SECONDS = 60 * 60 * 48


def _today() -> str:
    return datetime.now(timezone.utc).date().isoformat()


def resolve_key_and_limit(user) -> tuple[str, int]:
    """Takes in a user and returns a tuple with their Redis key and daily usage limit"""
    token = user.usage_token
    if token and token.name == "demo":
        return f"usage:demo:{_today()}", token.usage_limit
    return f"usage:user:{user.id}:{_today()}", settings.max_daily_requests


def get_usage(key: str) -> int:
    """Current count for `key` without incrementing. 0 if unset."""
    value = redis_client.get(key)
    return int(value) if value else 0


def increment_usage(key: str, limit: int) -> tuple[bool, int]:
    count = redis_client.incr(key)
    if count == 1:
        redis_client.expire(key, USAGE_TTL_SECONDS)
    return count <= limit, count
