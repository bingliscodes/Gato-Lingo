# reset_db.py
import sys
sys.path.insert(0, '.')

from sqlmodel import SQLModel
from sqlalchemy import text
from app.database.database import engine

# Import ALL models so SQLModel knows about them
from app.models.user import User
from app.models.vocabulary import VocabularyList, VocabularyItem, VocabularyListItem
from app.models.conversation_session import ConversationSession
from app.models.conversation_turn import ConversationTurn
from app.models.session_score import SessionScore

response = input("This will DELETE ALL DATA. Are you sure? (yes/no): ")
if response.lower() != "yes":
    print("Aborted.")
    sys.exit(0)

print("Dropping all tables...")

# Use raw SQL to force drop everything
with engine.connect() as conn:
    conn.execute(text("DROP SCHEMA public CASCADE;"))
    conn.execute(text("CREATE SCHEMA public;"))
    conn.commit()

print("Creating all tables...")
SQLModel.metadata.create_all(engine)

print("Done! Database has been reset.")

# Verify the users table structure
from sqlalchemy import inspect
inspector = inspect(engine)
columns = [col['name'] for col in inspector.get_columns('users')]
print(f"Users table columns: {columns}")