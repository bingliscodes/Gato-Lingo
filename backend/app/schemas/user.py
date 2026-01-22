from pydantic import BaseModel, EmailStr, model_validator
from typing import Optional
from datetime import datetime
from uuid import UUID

class UserCreate(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    password: str
    password_confirm: str

    # optional fields
    native_language: Optional[str] = None
    target_language: Optional[str] = None
    proficiency_level: Optional[str] = "beginner"

        
    # Validate passwords match (runs after individual field validation)
    @model_validator(mode='after')
    def passwords_match(self):
        if self.password != self.password_confirm:
            raise ValueError('Passwords do not match')
        return self
    
# Schema for updating a user (all fields optional; passwords not updated this way)
class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    native_language: Optional[str] = None
    target_language: Optional[str] = None
    proficiency_level: Optional[str] = None

# Schema for returning a user (what the client receives)
class UserResponse(BaseModel):
    id: UUID
    email: str
    first_name: str
    last_name: str
    role: str
    native_language: Optional[str]
    target_language: Optional[str]
    proficiency_level: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True