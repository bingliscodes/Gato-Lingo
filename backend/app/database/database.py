from typing import Annotated
from sqlmodel import Session, create_engine, select, SQLModel
from sqlalchemy import create_engine
from fastapi import Depends
from sqlalchemy.orm import sessionmaker
from ..config import settings

db_url = f"postgresql://{settings.postgres_user}:{settings.postgres_password}@localhost:5432/{settings.db_name}"

engine = create_engine(db_url)
session = Session(engine)
sqlAlchemy_session = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db(session: Session) -> None:
    SQLModel.metadata.create_all(engine)


def get_db():
    with Session(engine) as session:
        yield session

SessionDep = Annotated[Session, Depends(get_db)]

def reset_database():
    """Drop all tables and recreate them. USE ONLY IN DEVELOPMENT."""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("Database reset complete!")