from typing import Annotated
from datetime import datetime, timedelta, timezone
import secrets
import hashlib

from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select

from ..database.database import get_db
from ..models.user import (
    User,
    UserCreate,
    UserResponse,
    MessageResponse,
    ForgotPasswordRequest,
    ResetPasswordRequest,
)
from ..dependencies.auth import (
    authenticate_user,
    create_access_token,
    set_token_cookie,
    clear_token_cookie,
    get_current_user,
    LoginResponse,
    Token,
)
from ..utils.password import get_password_hash, verify_password
from ..config import settings


ACCESS_TOKEN_EXPIRE_MINUTES = 30
router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=LoginResponse, status_code=status.HTTP_201_CREATED)
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
        password_hash=get_password_hash(user_data.password),
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        native_language=user_data.native_language,
        target_language=user_data.target_language,
        role=user_data.role
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    access_token = create_access_token(new_user.id)
    set_token_cookie(response, access_token)
    
    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(new_user)
    )


@router.post("/login", response_model=LoginResponse)
def login(response: Response, form_data: Annotated[OAuth2PasswordRequestForm, Depends()], db: Session = Depends(get_db) ) -> Token:
    user = authenticate_user(form_data.username, form_data.password, db)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(user.id)
    set_token_cookie(response, access_token)
    
    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )


@router.get("/logout", response_model=MessageResponse)
def logout(response: Response):
    clear_token_cookie(response)
    return MessageResponse(
        status="success",
        message="Logged out successfully"
    )


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)) -> UserResponse:
    return UserResponse.model_validate(current_user)


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


@router.post("/reset-password/{token}", response_model=LoginResponse)
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
    user.password_hash = get_password_hash(request_data.password)
    user.password_changed_at = datetime.now(datetime.UTC)
    user.password_reset_token = None
    user.password_reset_expires = None
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Log user in with new token
    access_token = create_access_token(user.id)
    set_token_cookie(response, access_token)
    
    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )
