from fastapi import APIRouter, Depends, Response
from sqlmodel import Session, select
from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime, timezone
import random
import string

from ..database.database import get_db
from ..config import settings
from ..models.conversation_session import ConversationSession, SessionStatus
from ..models.vocabulary import VocabularyItem, VocabularyList
from ..models.usage_token import UsageToken
from ..models.user import User, UserResponse, AuthResponse
from ..models.exam import Exam, ExamCreate
from ..utils.password import hash_password
from ..utils.jwt import create_access_token
from ..controllers.auth import set_token_cookie
from ..controllers.exam import create_exam, ExamCreate

def generate_random_string(length):
    """
    Generates a random string of a specified length using letters and digits.
    """
    # Define the pool of characters to choose from
    characters = string.ascii_letters + string.digits
    
    # Use a list comprehension and join to create the random string
    random_string = ''.join(random.choice(characters) for _ in range(length))
    
    return random_string

router = APIRouter(prefix="/demo", tags=["demo"])

@router.get("/")
def init_demo(demo_data: ExamCreate, response: Response, db: Session = Depends(get_db)):
    """
    Create a demo for the exam-taking side by creating a new student, assigning a demo exam to them, and associating the demo_usage token with them
    """
    statement = select(UsageToken).where(UsageToken.name == "demo")
    demo_token = db.exec(statement).first()
    if not demo_token:
        return "Error, no demo token found"
    
    statement = select(User).where(User.email == "teacher@example.com")
    demo_teacher = db.exec(statement).first()

    statement = select(VocabularyList).where(VocabularyList.teacher_id == demo_teacher.id)
    demo_vocab_list = db.exec(statement).first()
    demo_account_string = generate_random_string(10)
    new_student = User(
            password_hash=hash_password("password123"),
            email=f"{demo_account_string}@example.com",
            first_name="Student",
            last_name="Demo",
            role="student",
            native_language="English",
            target_language="Spanish",
            teacher=demo_teacher,
            usage_token=demo_token
    )

    db.add(new_student)
    db.commit()
    db.refresh(new_student)
    
    token = create_access_token(new_student.id)
    set_token_cookie(response, token)
    
    exam_data = ExamCreate(
        title = demo_data.title if demo_data.title else "Demo Exam",
        description= demo_data.description if demo_data.description else "A demonstration of GatoLingo",
        difficulty_level=demo_data.difficulty_level if demo_data.difficulty_level else "beginner",
        target_language="spanish",
        tenses=["present", "preterite"],
        topic= demo_data.topic if demo_data.topic else "How cool cats are",
        vocabulary_list_id=demo_vocab_list.id,
    )
    demo_exam = create_exam(exam_data=exam_data, db=db, current_user=demo_teacher)

    demo_session = ConversationSession(
        exam_id = demo_exam.id,
        student_id=new_student.id,
        status = SessionStatus.assigned,
    )

    db.add(demo_session)
    db.commit()


    return AuthResponse(
        status="success",
        token=token,
        user=UserResponse.model_validate(new_student)
    )