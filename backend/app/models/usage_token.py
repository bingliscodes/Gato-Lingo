from sqlmodel import SQLModel, Field, Relationship
from typing import List, TYPE_CHECKING
import uuid


if TYPE_CHECKING:
    from .user import User

class UsageToken(SQLModel, table=True):
    __tablename__ = "usage_tokens"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str = Field(default = "demo")
    # Limit value only — the live request count now lives in Redis (date-keyed
    # with a TTL), so there is no daily_usage column or daily-reset cron.
    usage_limit: int

    users: List["User"] = Relationship(back_populates="usage_token")


class UsageTokenResponse(SQLModel):
    status: str
    message: str
    