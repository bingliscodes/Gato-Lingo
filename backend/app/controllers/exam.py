from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
from uuid import UUID

from ..config import settings
from ..services.conversation_engine import ConversationEngine
from ..database.database import get_db
from ..models.exam import Exam, ExamCreate, ExamResponse
from ..models.conversation_session import ConversationSession, SessionStatus, SessionAssignment, ConversationSessionResponse
from ..models.user import User
from ..dependencies.auth import get_current_user, require_roles

router = APIRouter(prefix="/exams", tags=["exams"])

conversation_engine = ConversationEngine(settings.anthropic_api_key)

@router.post("/", response_model=ExamResponse, status_code=status.HTTP_201_CREATED)
def create_exam(
    exam_data: ExamCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("teacher"))
):
    """Teacher creates a new exam template."""
    
    exam = Exam(
        **exam_data.model_dump(),
        created_by_id=current_user.id
    )
    """
    TODO: Get data in correct format from exam creation form. May need to use manual list of vocab temporarily,
    then transform it once we work out the list uploads and management
    For this to work, the data has to be formatted as follows: 
        target_language: str,
        student_level: str,
        vocabulary: list[str],
        topic: str,
        verb_tenses: list[str],
        region_variant: Optional[str] = None
    """
    conversation_prompt = conversation_engine.build_system_prompt(
        target_language = exam_data.target_language,
        student_level = exam_data.difficulty_level,
        vocabulary = exam_data.vocabulary_list_manual,
        topic = exam_data.topic,
        verb_tenses = exam_data.tenses
    )
    
    exam.conversation_prompt = conversation_prompt
    
    
    db.add(exam)
    db.commit()
    db.refresh(exam)
    
    return exam


@router.get("/", response_model=List[ExamResponse])
def get_my_exams(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("teacher"))
):
    """Get all exams created by this teacher."""
    
    statement = select(Exam).where(Exam.created_by_id == current_user.id)
    exams = db.exec(statement).all()
    
    return exams


@router.post("/assign", response_model=List[ConversationSessionResponse])
def assign_exam(
    assignment: SessionAssignment,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("teacher"))
):
    """Assign an exam to one or more students."""
    
    # Verify exam exists and belongs to this teacher
    exam = db.get(Exam, assignment.exam_id)
    if not exam or exam.created_by_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exam not found"
        )
    
    # Verify all students belong to this teacher
    statement = select(User).where(
        User.id.in_(assignment.student_ids),
        User.teacher_id == current_user.id
    )
    students = db.exec(statement).all()
    
    if len(students) != len(assignment.student_ids):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="One or more students not found or not assigned to you"
        )
    
    # Create a session for each student
    sessions = []
    for student_id in assignment.student_ids:
        session = ConversationSession(
            exam_id=assignment.exam_id,
            student_id=student_id,
            status=SessionStatus.assigned,
            due_date=assignment.due_date
        )
        db.add(session)
        sessions.append(session)
    
    db.commit()
    
    # Refresh all sessions
    for session in sessions:
        db.refresh(session)
    
    return sessions


@router.get("/dashboard")
def teacher_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("teacher"))
):
    """Get dashboard data for teacher."""
    
    # Get all exams by this teacher
    exams_statement = select(Exam).where(Exam.created_by_id == current_user.id)
    exams = db.exec(exams_statement).all()
    
    dashboard_data = []
    
    for exam in exams:
        # Get all sessions for this exam
        sessions_statement = select(ConversationSession).where(
            ConversationSession.exam_id == exam.id
        )
        sessions = db.exec(sessions_statement).all()
        
        dashboard_data.append({
            "exam": exam,
            "total_assigned": len(sessions),
            "pending": len([s for s in sessions if s.status == SessionStatus.assigned]),
            "in_progress": len([s for s in sessions if s.status == SessionStatus.in_progress]),
            "completed": len([s for s in sessions if s.status == SessionStatus.completed]),
            "sessions": sessions
        })
    
    return dashboard_data
