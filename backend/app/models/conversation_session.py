from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional, TYPE_CHECKING, List
from enum import Enum
import uuid

if TYPE_CHECKING:
    from .user import User
    from .vocabulary import VocabularyList
    from .conversation_turn import ConversationTurn
    from .session_score import SessionScore

class SessionStatus(str, Enum):
    assigned = "assigned"
    in_progress = "in_progress"
    completed = "completed"

class ConversationSession(SQLModel, table=True):
    __tablename__ = "conversation_sessions"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    
    # Conversation meta data
    started_at: Optional[datetime] = Field(default=None)
    ended_at: Optional[datetime] = Field(default=None)
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    
    # Session content
    conversation_prompt: str
    cultural_context: Optional[str] = None
    target_language: str
    topic: str
    tenses: Optional[str] = None
    difficulty_level: str
    status: str

    # Exam/assignment fields
    status: SessionStatus = Field(default=SessionStatus.assigned)
    assigned_by_id: Optional[uuid.UUID] = Field(default=None, foreign_key="users.id")
    due_date: Optional[datetime] = Field(default=None)

    # Foreign Keys – should be on the "many" side of relationship
    student_id: Optional[uuid.UUID] = Field(default=None, foreign_key="users.id")
    vocabulary_list_id: Optional[uuid.UUID] = Field(default=None, foreign_key="vocabulary_lists.id")

    # Relationships (virtual fields)
    student: Optional["User"] = Relationship(back_populates="sessions", sa_relationship_kwargs={"foreign_keys": "[ConversationSession.student_id]"})
    assigned_by: Optional["User"] = Relationship(sa_relationship_kwargs={"foreign_keys": "[ConversationSession.assigned_by_id]"})
    vocabulary_list: Optional["VocabularyList"] = Relationship(back_populates="sessions")
    turns: List["ConversationTurn"] = Relationship(back_populates="conversation_session")
    session_score: Optional["SessionScore"] = Relationship(back_populates="session")


class ConversationSessionResponse(SQLModel):
    id: uuid.UUID
    started_at: datetime
    ended_at: Optional[datetime] = None