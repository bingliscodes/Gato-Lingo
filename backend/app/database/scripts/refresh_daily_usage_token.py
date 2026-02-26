import sys
from pathlib import Path

# Go up from scripts/ -> database/ -> app/ -> backend/
project_root = Path(__file__).resolve().parent.parent.parent.parent
sys.path.insert(0, str(project_root))

from sqlmodel import Session, select
from app.database.database import engine
from app.models.usage_token import UsageToken

print("Resetting daily usage token...")

with Session(engine) as db:
    statement = select(UsageToken).where(UsageToken.name == 'demo')
    token = db.exec(statement).first()
    
    if token:
        token.daily_usage = 0
        db.commit()
        db.refresh(token)
    else:
        print("Demo token not found.")

print("Done! daily usage token has been reset.")
