from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime, timezone
from typing import Optional, List, TYPE_CHECKING
import uuid

if TYPE_CHECKING:
    from .user import User
    from .vocabulary import VocabularyList
    from .conversation_session import ConversationSession

class Exam(SQLModel, table=True):
    __tablename__ = "exams"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    
    # Exam metadata
    title: str
    description: Optional[str] = None
    
    # Conversation configuration
    conversation_prompt: str
    cultural_context: Optional[str] = None
    target_language: str
    topic: str
    tenses: Optional[str] = None  # JSON array as string
    vocabulary_list_manual: Optional[str] = None #Use this field until set up vocab list uploads
    difficulty_level: str
    
    created_at: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: Optional[datetime] = Field(default=None)

    # Foreign Keys
    created_by_id: Optional[uuid.UUID] = Field(default=None, foreign_key="users.id")
    vocabulary_list_id: Optional[uuid.UUID] = Field(default=None, foreign_key="vocabulary_lists.id")
    
    # Relationships
    created_by: Optional["User"] = Relationship(
        back_populates="created_exams",
        sa_relationship_kwargs={"foreign_keys": "[Exam.created_by_id]"}
    )
    vocabulary_list: Optional["VocabularyList"] = Relationship(back_populates="exams")
    sessions: List["ConversationSession"] = Relationship(back_populates="exam")


# Schemas
class ExamCreate(SQLModel):
    title: str
    description: Optional[str] = None
    cultural_context: Optional[str] = None
    target_language: str
    topic: str
    tenses: Optional[str] = None
    vocabulary_list_manual: Optional[str] = None
    vocabulary_list_id: Optional[uuid.UUID] = None
    difficulty_level: str

from ..schemas.responses import ExamResponse, DashboardExamResponse