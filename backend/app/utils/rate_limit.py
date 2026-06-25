from datetime import datetime, timezone

from ..redis_client import redis_client

USAGE_TTL_SECONDS = 60 * 60 * 48


def _usage_key(token_id) -> str:
    today = datetime.now(timezone.utc).date().isoformat()
    return f"usage:{token_id}:{today}"


def increment_usage(token_id, limit: int) -> tuple[bool, int]:
    key = _usage_key(token_id)
    count = redis_client.incr(key)
    if count == 1:
        redis_client.expire(key, USAGE_TTL_SECONDS)

    return count <= limit, count
