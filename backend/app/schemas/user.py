from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
from datetime import datetime

# Base schema with shared fields
class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    native_language: Optional[str] = None
    target_language: Optional[str] = None
    proficiency_level: Optional[str] = "beginner"

# Schema for creating a user (what the client sends)
class UserCreate(UserBase):
    password: str
    
    # Note: No 'id', no 'created_at' - the database handles those

# Schema for updating a user (all fields optional)
class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    native_language: Optional[str] = None
    target_language: Optional[str] = None
    proficiency_level: Optional[str] = None
    password: Optional[str] = None

# Schema for returning a user (what the client receives)
class UserResponse(UserBase):
    id: int
    role: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    # This tells Pydantic to read data from SQLAlchemy models
    model_config = ConfigDict(from_attributes=True)
    
    # Note: No 'password_hash' - never expose this!
"""
Why multiple schemas?

UserCreate:    What client sends when creating
               - Has password (plain text, will be hashed)
               - No id (database assigns it)

UserUpdate:    What client sends when updating  
               - All fields optional (only update what's provided)

UserResponse:  What we send back to client
               - Has id, created_at (database-generated fields)
               - No password (never expose this!)

               """