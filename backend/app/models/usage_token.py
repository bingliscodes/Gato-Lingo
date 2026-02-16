from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime, timezone
from typing import List, TYPE_CHECKING
import uuid

if TYPE_CHECKING:
    from .user import User

class UsageToken(SQLModel, table=True):
    __tablename__ = "usage_tokens"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    usage_limit: int
    daily_usage: int = Field(default = 0)

    users: List["User"] = Relationship(back_populates="token")
    