"""
Seed the database with initial data for development.
"""
from sqlmodel import Session, select
from ..models.user import User
from ..models.conversation_session import ConversationSession
from ..utils.password import hash_password

def seed_users(db: Session):
    """Add test users if none exist."""
    
    # Check if users already exist
    statement = select(User)
    results = db.exec(statement)
    users = results.all()
    user_count = len(users)
    
    if user_count > 0:
        print(f"Database already has {user_count} users. Skipping seed.")
        return
    
    # Create test users
    test_users = [
        User(
            email="ben@example.com",
            password_hash=hash_password("password123"),  
            first_name="Ben",
            last_name="Inglis",
            role="admin",
            native_language="english",
            target_language="spanish",
        ),
        User(
            email="cannoli@example.com",
            password_hash=hash_password("password123"),
            first_name="Cannoli",
            last_name="Inglis",
            role="student",
            native_language="cat",
            target_language="spanish",
        ),
    ]
    db.add_all(test_users)
    db.commit()
    
    print(f"Seeded {len(test_users)} users.")

def seed_conversations(db: Session):
    test_statement = select(ConversationSession)
    results = db.exec(test_statement)
    conversation_sessions = results.all()
    conversation_session_count = len(conversation_sessions)
    
    if conversation_session_count > 0:
        print(f"Database already has {conversation_session_count} users. Skipping seed.")
        return
    statement = select(User).where(User.role == "student")
    student = db.exec(statement).first()
    
    test_conversations = [
        ConversationSession(
            conversation_prompt="test",
            cultural_context="mexico",
            target_language="cat",
            topic="meow",
            tenses="present, preterite",
            vocabulary="meow, meow",
            difficulty_level="hard",
            student_id = student.id
        ),
    ]

    db.add_all(test_conversations)
    db.commit()

    print(f"Seeded {len(test_conversations)} conversations.")

def seed_all(db: Session):
    """Run all seed functions."""
    seed_users(db)
    seed_conversations(db)
    # seed_vocabulary(db)  # Add more seeders as needed
    # seed_topics(db)