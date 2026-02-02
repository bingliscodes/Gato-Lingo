from sqlmodel import Session, select
from datetime import datetime, timezone
from uuid import UUID
import re

from ..database.database import engine
from ..models.conversation_session import ConversationSession
from ..models.conversation_turn import ConversationTurn
from ..models.exam import Exam

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
    return
