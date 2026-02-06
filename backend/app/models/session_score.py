from decimal import Decimal
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime, timezone
from typing import Optional, TYPE_CHECKING, List
import uuid

if TYPE_CHECKING:
    from .conversation_session import ConversationSession

class SessionScore(SQLModel, table=True):
    __tablename__ = "session_scores"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    
    vocabulary_usage_score: Decimal = Field(default=0, max_digits=5, decimal_places=2)
    grammar_accuracy_score: Decimal = Field(default=0, max_digits=5, decimal_places=2)
    verb_tense_accuracy_score: Decimal = Field(default=0, max_digits=5, decimal_places=2)
    fluency_score: Decimal = Field(default=0, max_digits=5, decimal_places=2)
    overall_score: Decimal = Field(default=0, max_digits=5, decimal_places=2) 
    vocabulary_feedback: Optional[str] = None
    vocabulary_used: Optional[str]
    vocabulary_missed: Optional[str]
    grammar_feedback: Optional[str]
    created_at: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    # Foreign Keys
    session_id: uuid.UUID = Field(foreign_key="conversation_sessions.id")
    
    # Relationships (virtual fields)
    session: Optional["ConversationSession"] = Relationship(back_populates="session_score")