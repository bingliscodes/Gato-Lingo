from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List, Optional
from uuid import UUID
import json

from ..config import settings
from ..services.conversation_engine import ConversationEngine
from ..database.database import get_db
from ..models.exam import Exam, ExamCreate, ExamResponse, DashboardExamResponse, StudentAssignmentResponse
from ..models.conversation_session import ConversationSession, SessionStatus, SessionAssignment, ConversationSessionResponse
from ..models.user import User
from ..dependencies.auth import get_current_user, require_roles

router = APIRouter(prefix="/exams", tags=["exams"])

conversation_engine = ConversationEngine(settings.anthropic_api_key)

def parse_tenses(tenses_json: Optional[str]) -> List[str]:
    if not tenses_json:
        return []
    try:
        parsed = json.loads(tenses_json)
        return parsed if isinstance(parsed, list) else []
    except json.JSONDecodeError:
        return []
    
def parse_vocabulary(vocab_string: Optional[str]) -> List[str]:
    if not vocab_string:
        return []
    return [word.strip() for word in vocab_string.split(",") if word.strip()]

@router.post("/", response_model=ExamResponse, status_code=status.HTTP_201_CREATED)
def create_exam(
    exam_data: ExamCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("teacher"))
):
    """Teacher creates a new exam template."""
    
    # Parse the incoming data for prompt generation
    vocabulary_list = parse_vocabulary(exam_data.vocabulary_list_manual)
    tenses_list = parse_tenses(exam_data.tenses)
    
    conversation_prompt = conversation_engine.build_system_prompt(
        target_language=exam_data.target_language,
        student_level=exam_data.difficulty_level,
        vocabulary=vocabulary_list,
        topic=exam_data.topic,
        verb_tenses=tenses_list,
        region_variant=exam_data.cultural_context
    )

    # Create the exam
    exam = Exam(
        title=exam_data.title,
        description=exam_data.description,
        target_language=exam_data.target_language,
        difficulty_level=exam_data.difficulty_level,
        topic=exam_data.topic,
        tenses=exam_data.tenses,  # Store as JSON string
        vocabulary_list_manual=exam_data.vocabulary_list_manual,  # Store as comma-separated
        vocabulary_list_id=exam_data.vocabulary_list_id,
        cultural_context=exam_data.cultural_context,
        conversation_prompt=conversation_prompt,
        created_by_id=current_user.id
    ) 
    
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


@router.get("/dashboard", response_model=List[DashboardExamResponse])
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


@router.get("/assignments", response_model=List[StudentAssignmentResponse])
def student_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    assignments_statement = select(ConversationSession).where(ConversationSession.student_id == current_user.id)
    assignments = db.exec(assignments_statement).all()
    results = []

    for session in assignments:
        exam = db.get(Exam, session.exam_id) if session.exam_id else None

        exam_summary = None
        if exam:
            exam_summary = ExamResponse(
                id=exam.id,
                title=exam.title,
                description=exam.description,
                vocabulary_list_id=exam.vocabulary_list_id,
                conversation_prompt=exam.conversation_prompt,
                topic=exam.topic,
                target_language=exam.target_language,
                difficulty_level=exam.difficulty_level,
                vocabulary_list_manual=exam.vocabulary_list_manual,
                cultural_context=exam.cultural_context,
                tenses=exam.tenses,
                created_by_id=exam.created_by_id,
                created_at=exam.created_at
            )
        results.append(StudentAssignmentResponse(
            id=session.id,
            status=session.status,
            due_date=session.due_date,
            started_at=session.started_at,
            ended_at=session.ended_at,
            created_at=session.created_at,
            student_id=session.student_id,
            exam=exam_summary,
        ))

    return results