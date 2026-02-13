import requests
from requests.exceptions import HTTPError
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime, timezone
from openai import OpenAI

from ..database.database import get_db
from ..config import settings
from ..models.conversation_turn import ConversationTurn, ConversationTurnCreate
from ..models.conversation_session import ConversationSession, SessionStatus
from ..utils.score_session import generate_session_score

router = APIRouter(prefix="/realtime", tags=["realtime"])

class TokenRequest(BaseModel):
    instructions: Optional[str] = None

@router.post("/token")
def get_ephemeral_token(request: TokenRequest):
    """
    Retrieves an OpenAI ephemeral token to create a realtime session
    """
    try:
        client = OpenAI(api_key=settings.openai_api_key)
        session_config = {
            "type": "realtime",
            "model": "gpt-realtime",
            "audio": {
                "input": {
                    "transcription": {
                        "language": "es",
                        "model": "whisper-1",
                    },
                    "turn_detection": {
                        "type": "server_vad",
                        "threshold": 0.65, 
                        "silence_duration_ms": 750
                    }
                },
                "output": {
                    "voice": "marin",
                }
            },
            "instructions": request.instructions,
        }

        client_secret_response = client.realtime.client_secrets.create(session=session_config)

        return client_secret_response.model_dump()
    
    except Exception as err:
        print(f"Error getting token: {err}")
        raise HTTPException(status_code=500, detail=str(err))

    # except HTTPError as http_err:
    #     print(f"HTTP error occurred: {http_err}")
    #     print(f"Response body: {http_err.response.text}")
    #     raise HTTPException(
    #         status_code=http_err.response.status_code,
    #         detail=f"OpenAI API error: {http_err.response.text}"
    #     )
    # except Exception as err:
    #     print(f"Other error occurred: {err}")
    #     raise HTTPException(
    #         status_code=500,
    #         detail=f"Failed to get ephemeral token: {str(err)}"
    #     )


#TODO: Implement the controller to grade the session from Realtime AI and save all the conversation turns
class GradeRequest(BaseModel):
    conversation_history: List[ConversationTurnCreate]
    session_id: str

class GradeResponse(BaseModel):
    status: str

@router.post("/grade")
def grade_session(request: GradeRequest, db: Session = Depends(get_db)):
    if request.session_id:
        session = db.get(ConversationSession, UUID(request.session_id))
        turns = 0
        if session:
            # 1. Save all turns
            for turn in request.conversation_history:
                # Handle date cleaning
                cleaned_timestamp = turn.timestamp
                if turn.timestamp.endswith('Z'):
                    cleaned_timestamp = cleaned_timestamp.replace('Z', '+00:00')
                python_datetime_object = datetime.fromisoformat(cleaned_timestamp)
                
                turns += 1
                new_turn = ConversationTurn(
                    session_id=session.id,
                    timestamp=python_datetime_object,
                    speaker= turn.speaker,
                    transcript=turn.transcript,
                    turn_number = turns
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



    