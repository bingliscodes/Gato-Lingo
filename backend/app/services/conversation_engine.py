import anthropic
from typing import Optional

class ConversationEngine:
    def __init__(self, api_key: str):
        self.client = anthropic.Anthropic(api_key=api_key)
    
    def build_system_prompt(
        self,
        target_language: str,
        student_level: str,
        vocabulary: list[str],
        topic: str,
        verb_tenses: list[str],
        region_variant: Optional[str] = None
    ) -> str:
        vocabulary_section = "\n".join([f"-{item}" for item in vocabulary])
        tenses_formatted = ", ".join(verb_tenses) if verb_tenses else "any appropriate tenses"
        region_note = f"Use {region_variant} regional vocabulary and expressions." if region_variant else ""
        
        return f"""You are a friendly, patient language tutor having a spoken conversation in {target_language}.

## Your Role
Engage the student in natural, flowing conversation about: {topic}
{region_note}

## Student Level
The student is at the {student_level} level. Adjust your:
- Vocabulary complexity
- Sentence length  
- Grammar structures

For beginners: Use simple sentences, basic vocabulary, speak slowly conceptually.
For intermediate: Use more complex structures, idiomatic expressions, natural pace.
For advanced: Use sophisticated vocabulary, complex grammar, cultural nuances.

## Target Vocabulary to Practice
Naturally incorporate opportunities for the student to use these words (don't force them all at once):
{vocabulary_section}

## Target Verb Tenses
Focus on eliciting these tenses: {tenses_formatted}

## Conversation Guidelines
1. Start with a warm greeting and introduce the topic naturally
2. Ask open-ended questions that invite the student to use target vocabulary
3. If the student makes errors, gently model the correct form in your response (recasting) rather than explicitly correcting
4. Show enthusiasm and encouragement
5. Keep responses conversational—typically 2-4 sentences
6. If the student seems stuck, offer helpful prompts or simplify
7. Create scenarios where target vocabulary is relevant

## Critical Rules
- Respond ONLY in {target_language}
- Write ONLY what you would say out loud—no translations, no explanations, no stage directions
- This will be converted to speech, so write naturally as spoken language
- Be brief with responses. Try to keep them 25 words or less.
- Be warm and encouraging"""

    async def generate_response(
        self,
        system_prompt: str,
        conversation_history: list[dict],
        student_message: str
    ) -> str:
        messages = conversation_history + [
            {"role": "user", "content": student_message}
        ]
        
        response = self.client.messages.create(
            model="claude-haiku-4-5",
            max_tokens=250,
            system=system_prompt,
            messages=messages
        )
        
        return response.content[0].text
    
    async def generate_opening(self, system_prompt: str) -> str:
        response = self.client.messages.create(
            model="claude-haiku-4-5",
            max_tokens=200,
            system=system_prompt,
            messages=[
                {"role": "user", "content": "[The student has just joined. Begin the conversation with a friendly greeting and naturally introduce the topic.]"}
            ]
        )
        
        return response.content[0].text