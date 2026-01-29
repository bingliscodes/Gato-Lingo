from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime, timezone
from typing import Optional, TYPE_CHECKING, List
import uuid

if TYPE_CHECKING:
    from .user import User
    from .exam import Exam
    from .conversation_turn import ConversationTurn
    from .session_score import SessionScore


class ConversationSession(SQLModel, table=True):
    __tablename__ = "conversation_sessions"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    
    # Session status and timing
    status: SessionStatus = Field(default=SessionStatus.assigned)
    due_date: Optional[datetime] = Field(default=None)
    started_at: Optional[datetime] = Field(default=None)
    ended_at: Optional[datetime] = Field(default=None)
    created_at: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc))
    

    # Foreign Keys – should be on the "many" side of relationship
    exam_id: Optional[uuid.UUID] = Field(default=None, foreign_key="exams.id")
    student_id: Optional[uuid.UUID] = Field(default=None, foreign_key="users.id")

    # Relationships (virtual fields)
    exam: Optional["Exam"] = Relationship(back_populates="sessions") 
    student: Optional["User"] = Relationship(back_populates="sessions", sa_relationship_kwargs={"foreign_keys": "[ConversationSession.student_id]"})
    turns: List["ConversationTurn"] = Relationship(back_populates="conversation_session")
    session_score: Optional["SessionScore"] = Relationship(back_populates="session")


# Schemas
class SessionAssignment(SQLModel):
    """Schema for assigning an exam to students."""
    exam_id: uuid.UUID
    student_ids: List[uuid.UUID]  # Can assign to multiple students at once
    due_date: Optional[datetime] = None

# Import response schema from shared file
from ..schemas.responses import ConversationSessionResponse, SessionStatus, StudentAssignmentResponse