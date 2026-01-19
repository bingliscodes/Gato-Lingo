"""
Mock services for development/testing without hitting real APIs.
Set USE_MOCK_SERVICES=true in .env to enable.
"""

class MockConversationEngine:
    def build_system_prompt(self, **kwargs) -> str:
        return "mock_system_prompt"
    
    async def generate_response(
        self,
        system_prompt: str,
        conversation_history: list[dict],
        student_message: str
    ) -> str:
        # Return a simple echo response
        responses = [
            "¡Muy bien! Me alegra escucharte.",
            "Interesante. ¿Puedes decirme más?",
            "¡Excelente! Estás progresando mucho.",
            "Entiendo. ¿Y qué piensas sobre eso?",
        ]
        import random
        return random.choice(responses)
    
    async def generate_opening(self, system_prompt: str) -> str:
        return "¡Hola! Bienvenido a nuestra conversación. ¿Cómo estás hoy?"


class MockSpeechToTextService:
    async def transcribe(self, audio_data: bytes, language: str = "spanish") -> str:
        # Return a fake transcription
        mock_responses = [
            "Hola, estoy bien gracias",
            "Me gusta practicar español",
            "Quiero aprender más vocabulario",
            "El restaurante tiene buena comida",
        ]
        import random
        return random.choice(mock_responses)


class MockTextToSpeechService:
    async def synthesize(self, text: str, voice: str = "nova") -> bytes:
        # Return a tiny valid MP3 (silent audio)
        # This is a minimal valid MP3 frame - won't play audibly but won't error
        silent_mp3 = bytes([
            0xFF, 0xFB, 0x90, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        ] * 10)
        return silent_mp3