from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional, TYPE_CHECKING
import uuid

if TYPE_CHECKING:
    from .conversation_session import ConversationSession

class ConversationTurn(SQLModel, table=True):
    __tablename__ = "conversation_turns"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    
    timestamp: Optional[datetime] = Field(default_factory=lambda: datetime.now(datetime.timezone.utc))
    speaker: str 
    audio_url: str
    transcript: str
    turn_number: int
    target_language: str

    # Foreign Keys
    session_id: Optional[uuid.UUID] = Field(default=None, foreign_key="conversation_sessions.id")
    
    # Relationships (virtual fields)
    conversation_session: Optional["ConversationSession"] = Relationship(back_populates="turns")

class ConversationTurnResponse(SQLModel):
    id: uuid.UUID
    timestamp: datetime
    speaker: str
    audio_url: str
    transcript: str
    turn_number: int