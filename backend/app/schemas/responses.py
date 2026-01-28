from sqlmodel import SQLModel
from datetime import datetime
from typing import Optional, List
from uuid import UUID


class ConversationSessionResponse(SQLModel):
    id: UUID
    status: str
    due_date: Optional[datetime]
    started_at: Optional[datetime]
    ended_at: Optional[datetime]
    created_at: datetime
    exam_id: Optional[UUID]
    student_id: Optional[UUID]


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