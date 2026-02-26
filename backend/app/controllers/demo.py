from fastapi import APIRouter, Depends, Response, HTTPException, status
from sqlmodel import Session, select
from typing import Optional
from uuid import UUID
import random
import string

from ..database.database import get_db
from ..models.conversation_session import ConversationSession, SessionStatus
from ..models.vocabulary import VocabularyList
from ..models.usage_token import UsageToken
from ..models.user import User, UserResponse, AuthResponse
from ..models.exam import Exam, ExamCreate
from ..utils.password import get_password_hash
from ..utils.jwt import create_access_token
from ..controllers.auth import set_token_cookie
from ..controllers.exam import create_exam, ExamCreate

def generate_random_string(length):
    """
    Generates a random string of a specified length using letters and digits.
    """
    characters = string.ascii_letters + string.digits
    return ''.join(random.choice(characters) for _ in range(length))

router = APIRouter(prefix="/demo", tags=["demo"])

@router.post("/", response_model=AuthResponse)
def init_demo(response: Response, db: Session = Depends(get_db), demo_data: Optional[ExamCreate] = None):
    """
    Create a demo for the exam-taking side by creating a new student, assigning a demo exam to them, and associating the demo_usage token with them
    """
    print("initializing demo...")
    print("demo_data", demo_data)
    
    statement = select(UsageToken).where(UsageToken.name == "demo")
    demo_token = db.exec(statement).first()
    if not demo_token:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Demo token not found"
        )
    
    statement = select(User).where(User.email == "teacher@example.com")
    demo_teacher = db.exec(statement).first()
    if not demo_teacher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Demo teacher not found"
        )

    statement = select(VocabularyList).where(VocabularyList.teacher_id == demo_teacher.id)
    demo_vocab_list = db.exec(statement).first()
    if not demo_vocab_list:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Demo vocabulary list not found"
        )
    demo_account_string = generate_random_string(10)
    new_student = User(
            password_hash=get_password_hash("password123"),
            email=f"{demo_account_string}@example.com",
            first_name="Student",
            last_name="Demo",
            role="student",
            native_language="English",
            target_language="Spanish",
            teacher=demo_teacher,
            usage_token=demo_token
    )

    print("adding new student...")
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
        tenses='["present", "preterite"]',
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