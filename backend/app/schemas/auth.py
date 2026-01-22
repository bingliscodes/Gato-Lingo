from pydantic import BaseModel, EmailStr, field_validator, model_validator
from typing import Optional
from uuid import UUID
from datetime import datetime

class SignupRequest(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    password: str
    password_confirm: str
    native_language: Optional[str]
    target_language: Optional[str]
    proficiency_level: Optional[str]

    @model_validator(mode='after')
    def passwords_match(self):
        if self.password != self.password_confirm:
            raise ValueError('Passwords do not match!')
        return self
    
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class AuthResponse(BaseModel):
    status: str = "success"
    token: str
    user: "UserData"

    class Config:
        from_attributes = True

class UserData(BaseModel):
    id: UUID
    email: str
    first_name: str
    last_name: str
    role: str
    native_language: Optional[str]
    target_language: Optional[str]
    proficiency_level: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class PasswordResetRequest(BaseModel):
    password: str
    password_confirm: str

    @model_validator(mode='after')
    def passwords_match(self):
        if self.password != self.password_confirm:
            raise ValueError('Passwords do not match')
        return self
    
class MessageResponse(BaseModel):
    status: str = "success"
    message: str

AuthResponse.model_rebuild()