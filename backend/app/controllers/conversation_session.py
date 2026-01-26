from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from datetime import datetime
from typing import List, Optional
from uuid import UUID

from ..database.database import get_db
from ..models.conversation_session import ConversationSession, ConversationSessionResponse, SessionStatus
from ..models.user import User
from ..dependencies.auth import get_current_user, require_roles

router = APIRouter(prefix="/conversation-sessions", tags=["conversation-sessions"])

@router.post("/assign", status_code=status.HTTP_201_CREATED)
def assign_exam(
    student_id: UUID,
    vocabulary_list_id: UUID,
    topic: str,
    target_language: str,
    difficulty_level: str,
    conversation_prompt: str,
    due_date: Optional[datetime] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("teacher"))
):
    statement = select(User).where(User.id == student_id, User.teacher_id == current_user.id)
    student = db.exec(statement).first()

    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found or not assigned to you"
        )
    
    new_session = ConversationSession(
        student_id=student_id,
        assigned_by=current_user.id,
        vocabulary_list_id=vocabulary_list_id,
        topic=topic,
        target_language=target_language,
        difficulty_level=difficulty_level,
        conversation_prompt=conversation_prompt,
        due_date=due_date,
        status=SessionStatus.assigned
    )

    db.add(new_session)
    db.commit()
    db.refresh(new_session)

    return new_session

@router.post("/${session_id}/start")
def start_session(
    session_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = db.get(ConversationSession, session_id)

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if session.student_id != current_user.id:
        raise HTTPException(status_code=403, detail="This session is not assigned to you")
    
    if session.status != SessionStatus.assigned:
        raise HTTPException(status_code=400, detail="Session has already been started")
    
    session.status = SessionStatus.in_progress

    db.add(session)
    db.commit()
    db.refresh(session)

    return session

@router.post("/${session_id}/complete")
def complete_session(
    session_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = db.get(ConversationSession, session_id)

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if session.student_id != current_user.id:
        raise HTTPException(status_code=403, detail="This session is not assigned to you.")

    if session.status != SessionStatus.in_progress:
        raise HTTPException(status_code=400, detail="Session is not im progress")

    session.status = SessionStatus.completed
    session.ended_at = datetime.datetime.now(datetime.UTC)

    db.add(session)
    db.commit()
    db.refresh(session)
    
    # TODO: Trigger score generation here
    
    return session

@router.get("/", response_model=List[ConversationSessionResponse])
def get_all_conversation_sessions(db: Session = Depends(get_db)):
    statement = select(ConversationSession)
    conversation_sessions = db.exec(statement).all()
    return conversation_sessions