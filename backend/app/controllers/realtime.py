import redis

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime, timezone
from openai import OpenAI
from ..database.database import get_db
from ..config import settings
from ..models.user import User
from ..models.conversation_turn import ConversationTurn, ConversationTurnCreate
from ..models.conversation_session import ConversationSession, SessionStatus
from ..utils.rate_limit import increment_usage, resolve_key_and_limit
from ..dependencies.auth import get_current_user
from ..utils.score_session import generate_session_score

router = APIRouter(prefix="/realtime", tags=["realtime"])

language_map = {"spanish": "es", "french": "fr"}


class TokenRequest(BaseModel):
    instructions: Optional[str] = None
    language: str = "spanish"


@router.post("/token")
def get_ephemeral_token(
    request: TokenRequest, current_user: User = Depends(get_current_user)
):
    """
    Retrieves an OpenAI ephemeral token to create a realtime session.
    Enforces the daily usage limit at the point of the expensive action.
    """

    key, limit = resolve_key_and_limit(current_user)
    try:
        allowed, _ = increment_usage(key, limit)
    except redis.RedisError as err:
        print(f"Redis unavailable, refusing to mint token: {err}")
        raise HTTPException(
            status_code=503,
            detail="Usage service unavailable, please try again shortly.",
        )

    if not allowed:
        raise HTTPException(
            status_code=429,
            detail="Daily usage limit reached. Please wait until it resets",
        )

    try:
        language_code = language_map[request.language]

        client = OpenAI(api_key=settings.openai_api_key)
        session_config = {
            "type": "realtime",
            "model": "gpt-realtime",
            "audio": {
                "input": {
                    "transcription": {
                        "language": language_code,
                        "model": "whisper-1",
                    },
                    "noise_reduction": {"type": "far_field"},
                    "turn_detection": {
                        "type": "server_vad",
                        "threshold": 0.75,  # Higher threshold for noisy environments
                        "prefix_padding_ms": 400,
                        "silence_duration_ms": 800,  # Wait longer to confirm speech ended
                        "interrupt_response": False,
                    },
                },
                "output": {
                    "voice": "marin",
                },
            },
            "instructions": request.instructions,
        }

        client_secret_response = client.realtime.client_secrets.create(
            session=session_config
        )

        return client_secret_response.model_dump()

    except Exception as err:
        print(f"Error getting token: {err}")
        raise HTTPException(status_code=500, detail=str(err))


class GradeRequest(BaseModel):
    conversation_history: Optional[List[ConversationTurnCreate]] = Query(None)
    session_id: str


class GradeResponse(BaseModel):
    status: str


@router.post("/grade")
def grade_session(request: GradeRequest, db: Session = Depends(get_db)):
    print("grading exam... request is:", request)
    if request.session_id:
        session = db.get(ConversationSession, UUID(request.session_id))

        if not request.conversation_history:
            generate_session_score(conversation_session_id=request.session_id)
            session.status = SessionStatus.completed
            session.ended_at = datetime.now(timezone.utc)
            db.add(session)
            db.commit()
            return GradeResponse(status="success")

        turns = 0
        if session:
            # 1. Save all turns
            for turn in request.conversation_history:
                # Handle date cleaning
                cleaned_timestamp = turn.timestamp
                if turn.timestamp.endswith("Z"):
                    cleaned_timestamp = cleaned_timestamp.replace("Z", "+00:00")
                python_datetime_object = datetime.fromisoformat(cleaned_timestamp)

                turns += 1
                new_turn = ConversationTurn(
                    session_id=session.id,
                    timestamp=python_datetime_object,
                    speaker=turn.speaker,
                    transcript=turn.transcript,
                    turn_number=turns,
                )
                db.add(new_turn)
                db.commit()

            # 2. Mark session as completed
            session.status = SessionStatus.completed
            session.ended_at = datetime.now(timezone.utc)
            db.add(session)
            db.commit()

            print(f"Session {request.session_id} ended with {turns} turns")

            # 3. Grade session
            generate_session_score(conversation_session_id=request.session_id)

        return GradeResponse(status="success")
