
from sqlmodel import Session, create_engine, SQLModel
from ..config import settings

if settings.environment_mode == "development":
    db_url = f"postgresql://{settings.postgres_user}:{settings.postgres_password}@localhost:5432/{settings.db_name}"
if settings.environment_mode == "production":
    db_url = f"postgresql://{settings.pguser}:{settings.pgpassword}@{settings.pghost}/{settings.pgdatabase}"
#TODO: Make this an env variable and update in Render
# 2. Update backend url variable in netlify once deployed
# 3. Update CORS settings

engine = create_engine(db_url, echo=False)

def init_db():
    SQLModel.metadata.create_all(engine)

def get_db():
    with Session(engine) as session:
        yield session
