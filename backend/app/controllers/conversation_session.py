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
    session.ended_at = datetime.now(datetime.UTC)

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