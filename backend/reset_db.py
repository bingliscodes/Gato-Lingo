"""
Reset database - drops all tables and recreates them.
Run with: python reset_db.py
"""
import sys
sys.path.insert(0, '.')  # Add current directory to path

from sqlmodel import SQLModel
from app.database.database import engine

response = input("This will DELETE ALL DATA. Are you sure? (yes/no): ")
if response.lower() != "yes":
    print("Aborted.")
    sys.exit(0)

print("Dropping all tables...")
SQLModel.metadata.drop_all(engine)

print("Creating all tables...")
SQLModel.metadata.create_all(engine)

print("Done! Database has been reset.")