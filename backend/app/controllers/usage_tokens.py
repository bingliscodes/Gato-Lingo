from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from ..models.usage_token import UsageToken, UsageTokenResponse
from ..models.user import User

from ..database.database import get_db
from ..dependencies.auth import get_current_user
router = APIRouter(prefix="/usage", tags=["usage"])


@router.post("/update", response_model=UsageTokenResponse)
def update_usage_token(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    usage_token = db.get(UsageToken, current_user.usage_token_id)

    if usage_token.daily_usage < usage_token.usage_limit:
        usage_token.daily_usage += 1
        db.add(usage_token)
        db.commit()

        return UsageTokenResponse(
            status = "Success",
            message = f"Usage token updated. Remaining uses: {usage_token.remaining_uses}"
        )

    else:
        return UsageTokenResponse(
            status = "Failure",
            message = f"Token {usage_token.id} has no more uses. Please wait until it resets to try again"
        )

    
        