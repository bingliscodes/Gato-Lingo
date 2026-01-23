from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
from uuid import UUID

from ..database.database import get_db
from ..models.conversation_session import ConversationSession, ConversationSessionResponse

router = APIRouter(prefix="/conversation-sessions", tags=["conversation-sessions"])

@router.get("/", response_model=List[ConversationSessionResponse])
def get_all_conversation_sessions(db: Session = Depends(get_db)):
    statement = select(ConversationSession)
    conversation_sessions = db.exec(statement).all()
    return conversation_sessions