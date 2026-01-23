
from sqlmodel import Session, create_engine, SQLModel
from ..config import settings

db_url = f"postgresql://{settings.postgres_user}:{settings.postgres_password}@localhost:5432/{settings.db_name}"

engine = create_engine(db_url, echo=True)

def init_db():
    from ..models.conversation_session import ConversationSession
    from ..models.conversation_turns import ConversationTurn
    from ..models.session_scores import SessionScore
    from ..models.user import User

    SQLModel.metadata.create_all(engine)

def get_db():
    with Session(engine) as session:
        yield session
