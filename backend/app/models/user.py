from sqlmodel import SQLModel, Field, Relationship
from pydantic import EmailStr, model_validator
from datetime import datetime, timezone
from typing import Optional, List, TYPE_CHECKING
import uuid

if TYPE_CHECKING:
    from .conversation_session import ConversationSession
    from .vocabulary import VocabularyList
    from .exam import Exam

class User(SQLModel, table=True):
    __tablename__ = "users"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    email: str = Field(unique=True, index=True)
    password_hash: str
    first_name: str
    last_name: str
    role: str = Field(default="student")
    native_language: Optional[str] = None  # Optional = nullable
    target_language: Optional[str] = None  # Optional = nullable
    
    # Timestamps
    created_at: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: Optional[datetime] = Field(default=None)
    
    # Password reset fields (internal only)
    password_changed_at: Optional[datetime] = Field(default=None)
    password_reset_token: Optional[str] = Field(default=None)
    password_reset_expires: Optional[datetime] = Field(default=None)

    # Relationships
    teacher_id: Optional[uuid.UUID] = Field(default=None, foreign_key="users.id")
    teacher: Optional["User"] = Relationship(
        back_populates="students",
        sa_relationship_kwargs={
            "remote_side": "User.id", 
            "foreign_keys": "[User.teacher_id]"
        }
    )
    students: List["User"] = Relationship(
        back_populates="teacher",
        sa_relationship_kwargs={"foreign_keys": "[User.teacher_id]"})
    
    sessions: List["ConversationSession"] = Relationship(
        back_populates="student", 
        sa_relationship_kwargs={"foreign_keys": "[ConversationSession.student_id]"}
    )

    created_exams: List["Exam"] = Relationship(
        back_populates="created_by",
        sa_relationship_kwargs={"foreign_keys": "[Exam.created_by_id]"}
    )

    vocabulary_lists: List["VocabularyList"] = Relationship(
        back_populates="teacher",
        sa_relationship_kwargs={"foreign_keys": "[VocabularyList.teacher_id]"}
    )


class UserBase(SQLModel):
    email: str = Field(index=True, unique=True)
    first_name: str
    last_name: str
    role: str = Field(default="student")
    native_language: Optional[str] = None
    target_language: Optional[str] = None

class UserCreate(SQLModel):
    """Schema for creating a new user (signup)."""
    email: EmailStr
    first_name: str
    last_name: str
    password: str
    password_confirm: str
    native_language: Optional[str] = None
    target_language: Optional[str] = None
    role: Optional[str] = "student"
    
    @model_validator(mode='after')
    def passwords_match(self):
        if self.password != self.password_confirm:
            raise ValueError('Passwords do not match')
        return self
    
class UserUpdate(SQLModel):
    """Schema for updating a user (all fields optional)."""
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    native_language: Optional[str] = None
    target_language: Optional[str] = None

class LoginRequest(SQLModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

class StudentResponse(SQLModel):
    id: uuid.UUID
    email: str
    first_name: str
    last_name: str

class AuthResponse(SQLModel):
    status: str = "success"
    token: str
    user: UserResponse

class ForgotPasswordRequest(SQLModel):
    email: EmailStr

class ResetPasswordRequest(SQLModel):
    password: str
    password_confirm: str

    @model_validator(mode='after')
    def passwords_match(self):
        if self.password != self.password_confirm:
            raise ValueError('Passwords do not match')
        return self

class MessageResponse(SQLModel):
    status: str = "success"
    message: str

