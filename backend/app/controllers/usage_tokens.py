import redis

from fastapi import APIRouter, Depends
from sqlmodel import Session
from ..models.usage_token import UsageToken, UsageTokenResponse
from ..models.user import User
from ..database.database import get_db
from ..dependencies.auth import get_current_user
from ..utils.rate_limit import increment_usage, resolve_key_and_limit

router = APIRouter(prefix="/usage", tags=["usage"])


@router.get("/update", response_model=UsageTokenResponse)
def update_usage_token(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    key, limit = resolve_key_and_limit(current_user)

    try:
        allowed, count = increment_usage(key, limit)
    except redis.RedisError as err:
        print(f"Redis unavailable, falling back to Postgres limiter: {err}")
        return _update_usage_postgres(db, current_user.usage_token)

    if allowed:
        return UsageTokenResponse(
            status="success",
            message=f"Usage token updated. Remaining uses: {limit - count}",
        )
    return UsageTokenResponse(
        status="failure",
        message=f"Token {current_user.usage_token.id} has reached its daily usage limit. Please wait until it resets to try again",
    )


def _update_usage_postgres(
    db: Session, usage_token: UsageToken | None
) -> UsageTokenResponse:
    if not usage_token:
        return UsageTokenResponse(
            status="success", message="No usage token associated with this user"
        )

    if usage_token.daily_usage < usage_token.usage_limit:
        usage_token.daily_usage += 1
        db.add(usage_token)
        db.commit()
        return UsageTokenResponse(
            status="success",
            message=f"Usage token updated. Remaining uses: {usage_token.usage_limit - usage_token.daily_usage}",
        )

    return UsageTokenResponse(
        status="failure",
        message=f"Token {usage_token.id} has reached its daily usage limit. Please wait until it resets to try again",
    )
