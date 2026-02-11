import openai
from typing import Literal

class TextToSpeechService:
    def __init__(self, api_key: str):
        self.client = openai.OpenAI(api_key=api_key)
    
    async def synthesize(
        self,
        text: str,
        voice: Literal["alloy", "echo", "fable", "onyx", "nova", "shimmer"] = "nova",
        response_format: str = "mp3"
    ) -> bytes:
        response = self.client.audio.speech.create(
            model="gpt-4o-mini-tts",
            voice=voice,
            input=text,
            response_format=response_format
        )
        
        return response.content