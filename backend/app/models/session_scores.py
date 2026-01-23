from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional, TYPE_CHECKING, List
import uuid

if TYPE_CHECKING:
    from .conversation_session import ConversationSession

class SessionScore(SQLModel, table=True):
    __tablename__ = "session_scores"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    
    # Conversation meta data
    started_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    ended_at: Optional[datetime] = Field(default=None)
    conversation_prompt: str
    cultural_context: str
    target_language: str
    topic: str
    tenses: str # string for now, but want this to be something we can parse, like csv or JSON
    vocabulary: str # same as above
    difficulty_level: str

    # Foreign Keys
    session_id: Optional[uuid.UUID] = Field(default=None, foreign_key="conversation_sessions.id")
    
    # Relationships (virtual fields)
    session: Optional["ConversationSession"] = Relationship(back_populates="session_score")


class ConversationSessionResponse(SQLModel):
    id: uuid.UUID
    started_at: datetime
    ended_at: Optional[datetime] = None