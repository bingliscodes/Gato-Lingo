from fastapi import APIRouter, Depends
from sqlmodel import Session
from ..models.usage_token import UsageToken, UsageTokenResponse
from ..models.user import User

from ..database.database import get_db
from ..dependencies.auth import get_current_user
router = APIRouter(prefix="/usage", tags=["usage"])


@router.get("/update", response_model=UsageTokenResponse)
def update_usage_token(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    print("updating usage token")
    usage_token = db.get(UsageToken, current_user.usage_token_id)
    if not usage_token:
        return UsageTokenResponse(
            status = "success",
            message = "No usage token associated with this user"
        )
    
    if usage_token.daily_usage < usage_token.usage_limit:
        usage_token.daily_usage += 1
        db.add(usage_token)
        db.commit()

        return UsageTokenResponse(
            status = "success",
            message = f"Usage token updated. Remaining uses: {usage_token.daily_usage - usage_token.usage_limit}"
        )

    else:
        return UsageTokenResponse(
            status = "failure",
            message = f"Token {usage_token.id} has reached it's daily usage limit. Please wait until it resets to try again"
        )

    
        