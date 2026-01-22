from pydantic import BaseModel, ConfigDict, EmailStr, model_validator
from typing import Optional
from uuid import UUID
from datetime import datetime

class SignupRequest(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    password: str
    password_confirm: str
    native_language: Optional[str] = None
    target_language: Optional[str] = None
    proficiency_level: Optional[str] = "beginner"

    @model_validator(mode='after')
    def passwords_match(self):
        if self.password != self.password_confirm:
            raise ValueError('Passwords do not match!')
        return self
    
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

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

    model_config = ConfigDict(from_attributes=True)

class AuthResponse(BaseModel):
    status: str = "success"
    token: str
    user: "UserData"

    model_config = ConfigDict(from_attributes=True)



class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
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