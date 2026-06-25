import redis

from .config import settings

redis_client = redis.from_url(settings.redis_url, decode_responses=True)


def ping_redis() -> bool:
    try:
        return redis_client.ping()
    except redis.RedisError as err:
        print(f"Redis unavailable at startup: {err}")
        return False
