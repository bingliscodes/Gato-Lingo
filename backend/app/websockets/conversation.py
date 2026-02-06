from fastapi import WebSocket, WebSocketDisconnect
from sqlmodel import Session, select
from datetime import datetime, timezone
from uuid import UUID
import json
import base64

from ..services.conversation_engine import ConversationEngine
from ..services.speech_to_text import SpeechToTextService
from ..services.text_to_speech import TextToSpeechService
from ..config import settings
from ..database.database import engine
from ..models.conversation_session import ConversationSession, SessionStatus
from ..models.conversation_turn import ConversationTurn
from ..utils.score_session import generate_session_score


if settings.use_mock_services:
    from ..services.mock_services import (
        MockConversationEngine as ConversationEngine,
        MockSpeechToTextService as SpeechToTextService,
        MockTextToSpeechService as TextToSpeechService,
    )
else:
    from ..services.conversation_engine import ConversationEngine
    from ..services.speech_to_text import SpeechToTextService
    from ..services.text_to_speech import TextToSpeechService

class ConversationHandler:
    def __init__(self):
        if settings.use_mock_services:
            self.conversation_engine = ConversationEngine()
            self.stt_service = SpeechToTextService()
            self.tts_service = TextToSpeechService()
        else:
            self.conversation_engine = ConversationEngine(settings.anthropic_api_key)
            self.stt_service = SpeechToTextService(settings.openai_api_key)
            self.tts_service = TextToSpeechService(settings.openai_api_key)
    
    async def handle_connection(self, websocket: WebSocket):
        await websocket.accept()
        
        conversation_history = []
        system_prompt = None
        target_language = "spanish"
        session_id = None
        turn_number = 0
        
        try:
            while True:
                data = await websocket.receive_json()
                
                if data["type"] == "config":
                    # Initialize conversation with config
                    target_language = data.get("targetLanguage", "spanish")
                    exam_data = data.get("exam")
                    session_id = data.get("id")
                    system_prompt = exam_data.get("conversation_prompt")

                    if session_id:
                        with Session(engine) as db:
                            session = db.get(ConversationSession, UUID(session_id))

                            if session and session.status == SessionStatus.in_progress:
                                statement = select(ConversationTurn).where(ConversationTurn.session_id == session.id).order_by(ConversationTurn.turn_number)
                                existing_turns = db.exec(statement).all()

                                for turn in existing_turns:
                                    role = "user" if turn.speaker == "student" else "assistant"
                                    conversation_history.append({
                                        "role": role,
                                        "content": turn.transcript
                                    })

                                turn_number = len(existing_turns)

                                await websocket.send_json({
                                    "type": "session_resumed",
                                    "turns_loaded": len(existing_turns),
                                    "turns": [
                                        {
                                            "speaker": turn.speaker,
                                            "transcript": turn.transcript,
                                            "timestamp": turn.timestamp.isoformat() if turn.timestamp else None
                                        }
                                        for turn in existing_turns
                                    ]
                                })

                                return
                            
                            if session:
                                session.status = SessionStatus.in_progress
                                session.started_at = datetime.now(timezone.utc)
                                db.add(session)
                                db.commit()

                    # Generate opening
                    opening = await self.conversation_engine.generate_opening(system_prompt)
                    opening_audio = await self.tts_service.synthesize(opening)
                    
                    if session_id:
                        turn_number += 1
                        self._save_turn(
                            session_id=session_id,
                            turn_number=turn_number,
                            speaker="tutor",
                            transcript=opening,
                            target_language=target_language
                        )

                    await websocket.send_json({
                        "type": "tutor_message",
                        "text": opening,
                        "audio": base64.b64encode(opening_audio).decode()
                    })
                    
                    conversation_history.append({"role": "assistant", "content": opening})
                
                elif data["type"] == "audio":
                    if not system_prompt:
                        await websocket.send_json({
                            "type": "error",
                            "message": "Please configure the conversation first"
                        })
                        continue
                    
                    # Decode and transcribe
                    audio_bytes = base64.b64decode(data["audio"])
                    transcript = await self.stt_service.transcribe(audio_bytes, target_language)

                    if session_id:
                        turn_number += 1
                        self._save_turn(
                            session_id=session_id,
                            turn_number=turn_number,
                            speaker="student",
                            transcript=transcript,
                            target_language=target_language
                        )
                    
                    # Send transcript back
                    await websocket.send_json({
                        "type": "transcript",
                        "text": transcript
                    })
                    
                    # Generate response
                    response = await self.conversation_engine.generate_response(
                        system_prompt,
                        conversation_history,
                        transcript
                    )

                    if session_id:
                        turn_number += 1
                        self._save_turn(
                            session_id=session_id,
                            turn_number=turn_number,
                            speaker="tutor",
                            transcript=response,
                            target_language=target_language
                        )
                    
                    # Convert to speech
                    response_audio = await self.tts_service.synthesize(response)
                    
                    # Send response
                    await websocket.send_json({
                        "type": "tutor_message",
                        "text": response,
                        "audio": base64.b64encode(response_audio).decode()
                    })
                    
                    # Update history
                    conversation_history.append({"role": "user", "content": transcript})
                    conversation_history.append({"role": "assistant", "content": response})
                
                elif data["type"] == "end_session":
                    if session_id:
                        with Session(engine) as db:
                            session = db.get(ConversationSession, UUID(session_id))
                            if session:
                                session.status = SessionStatus.completed
                                session.ended_at = datetime.now(timezone.utc)
                                db.add(session)
                                db.commit()

                    await websocket.send_json({
                        "type": "session_ended",
                        "turns": turn_number
                    })
                    print(f"Session {session_id} ended with {turn_number} turns")
                    generate_session_score(conversation_session_id=session_id)
                    break
        
        except WebSocketDisconnect:
            print("Client disconnected")
        except Exception as e:
            print(f"Error: {e}")
            await websocket.send_json({
                "type": "error", 
                "message": str(e)
            })

    def _save_turn(
            self,
            session_id: str,
            turn_number: int,
            speaker: str,
            transcript: str,
            target_language: str,
            audio_url: str = None
    ):
        with Session(engine) as db:
            turn = ConversationTurn(
                session_id=UUID(session_id),
                turn_number = turn_number,
                speaker=speaker,
                transcript=transcript,
                target_language=target_language,
                audio_url=audio_url
            )
            db.add(turn)
            db.commit()