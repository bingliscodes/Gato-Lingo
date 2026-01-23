"""
Seed the database with initial data for development.
"""
from sqlmodel import Session, select
from ..database.database import get_db
from ..models.user import User
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


def seed_all(db: Session):
    """Run all seed functions."""
    seed_users(db)
    # seed_vocabulary(db)  # Add more seeders as needed
    # seed_topics(db)