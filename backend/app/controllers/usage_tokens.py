import redis

from fastapi import APIRouter, Depends
from ..models.usage_token import UsageTokenResponse
from ..models.user import User
from ..dependencies.auth import get_current_user
from ..utils.rate_limit import get_usage, resolve_key_and_limit

router = APIRouter(prefix="/usage", tags=["usage"])


@router.get("/me", response_model=UsageTokenResponse)
def read_usage(current_user: User = Depends(get_current_user)):
    key, limit = resolve_key_and_limit(current_user)

    try:
        used = get_usage(key)
    except redis.RedisError as err:
        print(f"Redis unavailable for usage read: {err}")
        return UsageTokenResponse(
            status="success", message="Usage temporarily unavailable"
        )

    remaining = limit - used

    if remaining > 0:
        return UsageTokenResponse(
            status="success", message=f"Remaining uses: {remaining}"
        )

    return UsageTokenResponse(status="failure", message="Daily usage limit reached.")
