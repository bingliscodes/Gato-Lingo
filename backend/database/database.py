from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

db_url = "postgresql://{DB_USERNAME}:{DB_PASSWORD}@localhost:5432/benjamininglis"
engine = create_engine()
session = sessionmaker(autocommit=False, autoflush=False, bind=engine)