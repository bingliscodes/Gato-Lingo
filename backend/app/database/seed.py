"""
Seed the database with initial data for development.
"""
from sqlalchemy.orm import Session
from ..models.user import User
from ..utils.password import hash_password

def seed_users(db: Session):
    """Add test users if none exist."""
    
    # Check if users already exist
    user_count = db.query(User).count()
    
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
            proficiency_level="intermediate"
        ),
        User(
            email="cannoli@example.com",
            password_hash=hash_password("password123"),
            first_name="Cannoli",
            last_name="Inglis",
            role="student",
            native_language="cat",
            target_language="spanish",
            proficiency_level="beginner"
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