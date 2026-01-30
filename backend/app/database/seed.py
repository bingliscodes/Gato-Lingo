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
    ben = User( email="ben@example.com",
            password_hash=hash_password("password123"),  
            first_name="Ben",
            last_name="Inglis",
            role="teacher",
            native_language="english",
            target_language="spanish",)
    
    cannoli = User (
          email="cannoli@example.com",
            password_hash=hash_password("password123"),
            first_name="Cannoli",
            last_name="Inglis",
            role="student",
            native_language="cat",
            target_language="spanish",
            teacher = ben
    )
    db.add(ben)
    db.add(cannoli)
    db.commit()


def seed_all(db: Session):
    """Run all seed functions."""
    seed_users(db)
    # seed_conversations(db)
    # seed_vocabulary(db)  # Add more seeders as needed
    # seed_topics(db)