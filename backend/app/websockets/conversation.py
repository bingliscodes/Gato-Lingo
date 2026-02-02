from fastapi import WebSocket, WebSocketDisconnect
from ..services.conversation_engine import ConversationEngine
from ..services.speech_to_text import SpeechToTextService
from ..services.text_to_speech import TextToSpeechService
from ..config import settings
import base64

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
        
        try:
            while True:
                data = await websocket.receive_json()
                
                if data["type"] == "config":
                    # Initialize conversation with config
                    # Modify this to take in a system prompt from the exam data
                    print("config received!", data)
                    await websocket.send_json({
                        "type": "tutor_message",
                        "text": "Testing connection"
                    })
                    target_language = data.get("targetLanguage", "spanish")
                    exam_data = data.get("exam")
                    system_prompt = exam_data.get("conversation_prompt")

                    # Generate opening
                    opening = await self.conversation_engine.generate_opening(system_prompt)
                    opening_audio = await self.tts_service.synthesize(opening)
                    
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
                    await websocket.send_json({
                        "type": "session_ended",
                        "turns": len(conversation_history) // 2
                    })
                    break
        
        except WebSocketDisconnect:
            print("Client disconnected")
        except Exception as e:
            print(f"Error: {e}")
            await websocket.send_json({
                "type": "error", 
                "message": str(e)
            })