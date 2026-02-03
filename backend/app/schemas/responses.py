from sqlmodel import SQLModel
from datetime import datetime
from typing import Optional, List
from decimal import Decimal
from uuid import UUID
from enum import Enum

class SessionStatus(str, Enum):
    assigned = "assigned"
    in_progress = "in_progress"
    completed = "completed"

class SessionScoreResponse(SQLModel):
    id: UUID
    vocabulary_usage_score: Decimal 
    grammar_accuracy_score: Decimal 
    verb_tense_accuracy_score: Decimal
    fluency_score: Decimal
    overall_score: Decimal 
    vocabulary_used: Optional[str]
    vocabulary_missed: Optional[str]
    grammar_feedback: Optional[str]

class ConversationSessionResponse(SQLModel):
    id: UUID
    status: str
    due_date: Optional[datetime]
    started_at: Optional[datetime]
    ended_at: Optional[datetime]
    created_at: datetime
    exam_id: Optional[UUID]
    student_id: Optional[UUID]
    session_score: Optional[SessionScoreResponse]


class ExamResponse(SQLModel):
    id: UUID
    title: str
    description: Optional[str]
    target_language: str
    difficulty_level: str
    topic: str
    tenses: Optional[str]
    vocabulary_list_manual: Optional[str]
    vocabulary_list_id: Optional[UUID]
    cultural_context: Optional[str]
    conversation_prompt: Optional[str]
    created_by_id: Optional[UUID]
    created_at: datetime


class DashboardExamResponse(SQLModel):
    exam: ExamResponse
    total_assigned: int
    pending: int
    in_progress: int
    completed: int
    sessions: List[ConversationSessionResponse]


class StudentAssignmentResponse(SQLModel):
    id: UUID
    status: SessionStatus
    due_date: Optional[datetime]
    started_at: Optional[datetime]
    ended_at: Optional[datetime]
    created_at: datetime
    student_id: Optional[UUID]

    exam: Optional[ExamResponse] = None
    session_score: Optional[SessionScoreResponse] = None