from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional, TYPE_CHECKING, List
import uuid

if TYPE_CHECKING:
    from .user import User
    from .vocabulary import VocabularyList
    from .conversation_turns import ConversationTurn
    from .session_scores import SessionScore

class ConversationSession(SQLModel, table=True):
    __tablename__ = "conversation_sessions"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    
    # Conversation meta data
    started_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    ended_at: Optional[datetime] = Field(default=None)
    conversation_prompt: str
    cultural_context: Optional[str] = None
    target_language: str
    topic: str
    tenses: Optional[str] = None # string for now, but want this to be something we can parse, like csv or JSON
    difficulty_level: str

    # Exam/Assignment fields
    assigned_by_id: Optional[uuid.UUID] = Field(default=None, foreign_key="users.id")
    due_date: Optional[datetime] = Field(default=None)

    # Foreign Keys – should be on the "many" side of relationship
    student_id: Optional[uuid.UUID] = Field(default=None, foreign_key="users.id")
    vocabulary_list_id: Optional[uuid.UUID] = Field(default=None, foreign_key="vocabulary_lists.id")

    # Relationships (virtual fields)
    student: Optional["User"] = Relationship(back_populates="sessions", sa_relationship_kwargs={"foreign_keys": "[ConversationSession.student_id]"})
    assigned_by: Optional["User"] = Relationship(back_populates="sessions", sa_relationship_kwargs={"foreign_keys": "[ConversationSession.assigned_by_id]"})
    vocabulary_list: Optional["VocabularyList"] = Relationship(back_populates="sessions")
    turns: List["ConversationTurn"] = Relationship(back_populates="conversation_session")
    session_score: Optional["SessionScore"] = Relationship(back_populates="session")


class ConversationSessionResponse(SQLModel):
    id: uuid.UUID
    started_at: datetime
    ended_at: Optional[datetime] = None