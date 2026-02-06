from sqlmodel import Session, select
from datetime import datetime, timezone
from uuid import UUID
import re

from ..config import settings
from ..database.database import engine
from ..services.scoring_engine import ScoringEngine
from ..controllers.exam import parse_vocabulary
from ..models.conversation_session import ConversationSession
from ..models.conversation_turn import ConversationTurn
from ..models.session_score import SessionScore
from ..models.exam import Exam

scoring_engine = ScoringEngine(settings.anthropic_api_key)

def generate_session_score(conversation_session_id: str):
    with Session(engine) as db:
        conversation_session = db.get(ConversationSession, UUID(conversation_session_id))
        exam = db.get(Exam, conversation_session.exam_id)

        statement = select(ConversationTurn).where(ConversationTurn.session_id == conversation_session.id)
        turns = db.exec(statement).all()

        student_turns = [t for t in turns if t.speaker == "student"]
        student_text = " ".join([t.transcript for t in student_turns])
        
        # Remove punctuation from student text before splitting
        clean_text = re.sub(r'[^\w\s]', '', student_text.lower())
        student_words = set(clean_text.split())

        expected_vocab = set([word.strip().lower() for word in exam.vocabulary_list_manual.split(",")])

        vocabulary_used = set()
        for word in student_words:
            if word in expected_vocab:
                vocabulary_used.add(word)

        vocabulary_missed = expected_vocab - vocabulary_used

        vocabulary_score = len(vocabulary_used) / len(expected_vocab) if expected_vocab else 0

        try:
            scores_dict = scoring_engine.analyze_with_ai(conversation_turns=turns, target_language=exam.target_language, expected_tenses=exam.tenses)
        except ValueError as e:
            print(f"An error has occurred generating the score: {e}")
            return None
        
        scores_dict["vocabulary_usage_score"] = vocabulary_score
        scores_dict["vocabulary_used"] = vocabulary_used
        scores_dict["vocabulary_missed"] = vocabulary_missed

        # Get overall score
        overall_score = (scores_dict["grammar_accuracy_score"] + scores_dict["verb_tense_accuracy_score"] + scores_dict["fluency_score"] + vocabulary_score) / 4
        scores_dict["overall_score"] = overall_score

        create_session_score(scores_dict=scores_dict, conversation_session_id=conversation_session_id)
    return scores_dict

def create_session_score(scores_dict: dict, conversation_session_id: str) -> None:
    with Session(engine) as db:
        conversation_session = db.get(ConversationSession, UUID(conversation_session_id))
        new_score = SessionScore(
            session_id=conversation_session.id,
            vocabulary_usage_score=scores_dict["vocabulary_usage_score"],
            grammar_accuracy_score=scores_dict["grammar_accuracy_score"],
            verb_tense_accuracy_score=scores_dict["verb_tense_accuracy_score"],
            fluency_score=scores_dict["fluency_score"],
            overall_score=scores_dict["overall_score"],
            grammar_feedback=scores_dict["grammar_feedback"],
            vocabulary_used=parse_vocabulary(scores_dict.get("vocabulary_used")),
            vocabulary_missed=parse_vocabulary(scores_dict.get("vocabulary_missed"))
        )
        
        db.add(new_score)
        db.commit()
        db.refresh(new_score)

def parse_vocabulary(vocabulary: set | None) -> str:
    """
    :param vocabulary: Description
    :type vocabulary: set
    :return: a list of vocabular items, separated by commas. Returns an empty string if vocabulary set is empty
    :rtype: str
    """
    if vocabulary:
        return ",".join([word for word in vocabulary])
    
    return ''
