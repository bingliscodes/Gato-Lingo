import anthropic
from typing import Optional
import json
import re

class ScoringEngine:
    def __init__(self, api_key: str):
        self.client = anthropic.Anthropic(api_key=api_key)

    async def analyze_with_ai(
            self,
            target_language: str,
            conversation_turns: list,
            expected_tenses: list[str],
    ) -> dict:
        # 1. Build the prompt
        system = "You are a language learning assessment assistant. Always respond with valid JSON only, no other text."
        user_message = f"""
        Analyze this student's language learning conversation in {target_language}.

        Conversation:
        {student_text}

        Expected verb tenses to practice: {expected_tenses}

        Please evaluate and respond in JSON format:
        {{
            "grammar_accuracy_score": <0.0-1.0>,
            "grammar_errors": [<list of specific errors>],
            "grammar_feedback": "<brief summary of grammar performance>",
            "tenses_used": [<list of tenses student actually used>],
            "tense_accuracy_score": <0.0-1.0>,
            "fluency_score": <0.0-1.0>,
            "fluency_feedback": "<brief assessment of natural flow>"
        }}

"""
        # 2. Call Claude
        response = self.client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=500,
            system=system,
            messages=[{"role": "user", "content": user_message}]
        )
        
        # 3. Parse JSON response
        response_text = response.content[0].text
        
        extracted_text = extract_json_from_markdown(response_text)
        
        if extracted_text:
            return extracted_text
        else:
            return "No JSON block found"
    

def extract_json_from_markdown(response_text: str) -> dict | None:
    try:
        return json.loads(response_text)
    except json.JSONDecodeError:
        pass

    pattern = re.compile(r"```json\s*(\{.*?\})\s*```", re.DOTALL)
    match = pattern.search(response_text)

    if match:
        json_string = match.group(1)
        try:
            data = json.loads(json_string)
            return data
        except json.JSONDecodeError as e:
            print(f"Error decoding JSON: {e}")
            return None
    
    return None