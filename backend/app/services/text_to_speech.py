import openai
from typing import Literal

class TextToSpeechService:
    def __init__(self, api_key: str):
        self.client = openai.OpenAI(api_key=api_key)
    
    async def synthesize(
        self,
        text: str,
        voice: Literal["alloy", "echo", "fable", "onyx", "nova", "shimmer"] = "nova"
    ) -> bytes:
        response = self.client.audio.speech.create(
            model="tts-1",
            voice=voice,
            input=text,
            response_format="mp3"
        )
        
        return response.content