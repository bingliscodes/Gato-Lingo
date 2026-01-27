from datetime import datetime, timedelta
import secrets
import hashlib

from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlmodel import Session, select

from ..database.database import get_db
from ..models.user import (
    User,
    UserCreate,
    LoginRequest,
    UserResponse,
    AuthResponse,
    MessageResponse,
    ForgotPasswordRequest,
    ResetPasswordRequest,
)
from ..utils.password import hash_password, verify_password
from ..utils.jwt import create_access_token
from ..dependencies.auth import get_current_user
from ..config import settings

router = APIRouter(prefix="/auth", tags=["auth"])

def set_token_cookie(response: Response, token: str):
    response.set_cookie(
        key="jwt",
        value=token,
        httponly=True,
        secure=settings.frontend_url.startswith("https"),  # True in production
        samesite="lax",
        max_age=settings.jwt_expires_in_minutes * 60  # Convert to seconds
    )


@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def signup(
    user_data: UserCreate,
    response: Response,
    db: Session = Depends(get_db)
):
    # Check if email exists
    statement = select(User).where(User.email == user_data.email)
    existing_user = db.exec(statement).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    new_user = User(
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        native_language=user_data.native_language,
        target_language=user_data.target_language,
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    token = create_access_token(new_user.id)
    set_token_cookie(response, token)
    
    return AuthResponse(
        status="success",
        token=token,
        user=UserResponse.model_validate(new_user)
    )


@router.post("/login", response_model=AuthResponse)
def login(
    credentials: LoginRequest,
    response: Response,
    db: Session = Depends(get_db)
):
    # Find user by email
    statement = select(User).where(User.email == credentials.email)
    user = db.exec(statement).first()
    
    # Check if user exists and password is correct
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    token = create_access_token(user.id)
    set_token_cookie(response, token)
    
    return AuthResponse(
        status="success",
        token=token,
        user=UserResponse.model_validate(user)
    )


@router.get("/logout", response_model=MessageResponse)
def logout(response: Response):
    response.delete_cookie(
        key="jwt",
        httponly=True,
        secure=settings.frontend_url.startswith("https"),
        samesite="lax"
    )
    
    return MessageResponse(
        status="success",
        message="Logged out successfully"
    )


@router.get("/me", response_model=AuthResponse)
def get_me(current_user: AuthResponse = Depends(get_current_user)):
    return current_user


@router.post("/forgot-password", response_model=MessageResponse)
def forgot_password(
    request_data: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):
    statement = select(User).where(User.email == request_data.email)
    user = db.exec(statement).first()
    
    if not user:
        return MessageResponse(status="success", message="If that email exists, a reset link has been sent")
    
    reset_token = secrets.token_urlsafe(32)
    hashed_token = hashlib.sha256(reset_token.encode()).hexdigest()
    
    # Save to user
    user.password_reset_token = hashed_token
    user.password_reset_expires = datetime.now(datetime.UTC) + timedelta(hours=1)
    db.commit()
    
    # TODO: Send email with reset link
    # reset_url = f"{settings.frontend_url}/resetPassword/{reset_token}"
    # await send_password_reset_email(user.email, reset_url)
    
    # For development, print the token
    print(f"Password reset token for {user.email}: {reset_token}")
    print(f"Reset URL: {settings.frontend_url}/resetPassword/{reset_token}")
    
    return MessageResponse(
        status="success",
        message="Token sent to email!"
    )


@router.post("/reset-password/{token}", response_model=AuthResponse)
def reset_password(
    token: str,
    request_data: ResetPasswordRequest,
    response: Response,
    db: Session = Depends(get_db)
):
    # Hash the token to compare with stored hash
    hashed_token = hashlib.sha256(token.encode()).hexdigest()
    
    statement = select(User).where(
        User.password_reset_token == hashed_token,
        User.password_reset_expires > datetime.now(datetime.UTC)
    )
    user = db.exec(statement).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token is invalid or has expired"
        )
    
    # Update password
    user.password_hash = hash_password(request_data.password)
    user.password_changed_at = datetime.now(datetime.UTC)
    user.password_reset_token = None
    user.password_reset_expires = None
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Log user in with new token
    jwt_token = create_access_token(user.id)
    set_token_cookie(response, jwt_token)
    
    return AuthResponse(
        status="success",
        token=jwt_token,
        user=UserResponse.model_validate(user)
    )
