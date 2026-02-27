from datetime import datetime, timezone, timedelta
from typing import Optional
from uuid import UUID

import jwt
from fastapi import Depends, HTTPException, status, Request, Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session, select
from jwt.exceptions import InvalidTokenError

from ..database.database import get_db
from ..models.user import User, UserResponse
from ..utils.password import verify_password, DUMMY_HASH
from ..config import settings

from pydantic import BaseModel


# ============================================
# Schemas
# ============================================

class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    user_id: str | None = None


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


# ============================================
# Security Configuration
# ============================================

security = HTTPBearer(auto_error=False)

SECRET_KEY = settings.jwt_secret
ALGORITHM = settings.jwt_algorithm
ACCESS_TOKEN_EXPIRE_MINUTES = settings.jwt_expires_in_minutes


# ============================================
# Token Functions
# ============================================

def create_access_token(user_id: UUID, expires_delta: timedelta | None = None) -> str:
    """Create a JWT access token for a user."""
    to_encode = {"sub": str(user_id)}
    
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({
        "exp": expire,
        "iat": datetime.now(timezone.utc)
    })
    
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_token(token: str) -> dict:
    """Decode and validate a JWT token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}"
        )


# ============================================
# Cookie Functions
# ============================================

def set_token_cookie(response: Response, token: str) -> None:
    """Set JWT token as HTTP-only cookie."""
    response.set_cookie(
        key="jwt",
        value=token,
        httponly=True,
        secure=settings.environment_mode == "production",
        samesite="lax",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )


def clear_token_cookie(response: Response) -> None:
    """Remove JWT cookie."""
    response.delete_cookie(key="jwt")


# ============================================
# User Lookup Functions
# ============================================

def get_user_by_email(email: str, db: Session) -> User | None:
    """Get user by email address."""
    statement = select(User).where(User.email == email)
    return db.exec(statement).first()


def get_user_by_id(user_id: UUID, db: Session) -> User | None:
    """Get user by ID."""
    statement = select(User).where(User.id == user_id)
    return db.exec(statement).first()


# ============================================
# Authentication Functions
# ============================================

def authenticate_user(email: str, password: str, db: Session) -> User | None:
    """
    Authenticate user with email and password.
    Returns user if valid, None otherwise.
    """
    user = get_user_by_email(email, db)
    
    if not user:
        # Prevent timing attacks by still running hash comparison
        verify_password(password, DUMMY_HASH)
        return None
    
    if not verify_password(password, user.password_hash):
        return None
    
    return user


# ============================================
# Dependency Functions
# ============================================

def get_token_from_request(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[str]:
    """
    Extract JWT token from request.
    Checks Authorization header first, then falls back to cookie.
    """
    # First, try Authorization header
    if credentials:
        return credentials.credentials
    
    # Fall back to cookie
    return request.cookies.get("jwt")


def get_current_user(
    token: Optional[str] = Depends(get_token_from_request),
    db: Session = Depends(get_db)
) -> User:
    """
    Dependency that gets the current authenticated user.
    Raises HTTPException if not authenticated.
    """
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="You are not logged in! Please log in to get access.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Decode and verify token
    try:
        payload = decode_token(token)
    except HTTPException:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if user still exists
    user = get_user_by_id(UUID(user_id), db)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="The user belonging to this token no longer exists",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if user changed password after token was issued
    token_issued_at = datetime.fromtimestamp(payload.get("iat", 0), tz=timezone.utc)
    if user.password_changed_at and user.password_changed_at > token_issued_at:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User recently changed password! Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user



def require_roles(*allowed_roles: str):
    """
    Dependency factory that checks if user has one of the allowed roles.
    
    Usage:
        @router.get("/teachers-only")
        def teacher_route(current_user: User = Depends(require_roles("teacher"))):
            ...
    """
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action"
            )
        return current_user
    
    return role_checker