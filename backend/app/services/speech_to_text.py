import openai
from io import BytesIO

class SpeechToTextService:
    def __init__(self, api_key: str):
        self.client = openai.OpenAI(api_key=api_key)
    
    # Map full language names to ISO codes
    LANGUAGE_CODES = {
        "spanish": "es",
        "french": "fr", 
        "german": "de",
        "italian": "it",
        "portuguese": "pt",
        "japanese": "ja",
        "korean": "ko",
        "chinese": "zh",
        "russian": "ru",
        "arabic": "ar",
        "hindi": "hi",
        "english": "en"
    }
    
    async def transcribe(self, audio_data: bytes, language: str = "spanish") -> str:
        audio_file = BytesIO(audio_data)
        audio_file.name = "audio.webm"
        
        lang_code = self.LANGUAGE_CODES.get(language.lower(), language[:2].lower())
        
        transcript = self.client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file,
            language=lang_code,
            response_format="text"
        )
        
        return transcript