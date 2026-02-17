from sqlmodel import SQLModel, Field, Relationship
from typing import List, TYPE_CHECKING
import uuid


if TYPE_CHECKING:
    from .user import User

class UsageToken(SQLModel, table=True):
    __tablename__ = "usage_tokens"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str = Field(default = "demo")
    usage_limit: int
    daily_usage: int = Field(default = 0)

    users: List["User"] = Relationship(back_populates="usage_token")


class UsageTokenResponse(SQLModel):
    status: str
    message: str
    