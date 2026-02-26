from datetime import datetime, timezone, timedelta
from typing import Optional, Annotated
from uuid import UUID

import jwt
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials, OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlmodel import Session, select
from jwt.exceptions import InvalidTokenError
from ..database.database import get_db, engine
from ..models.user import User, UserResponse
from ..utils.jwt import decode_token
from ..utils.password import verify_password, get_password_hash, DUMMY_HASH

from pydantic import BaseModel

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str | None = None

security = HTTPBearer(auto_error=False)
SECRET_KEY = "bcd9a9baaf81fdb7e79bf5e0352e6c4ecb3cc9f3dbe68a2418f9379dc1f37db3"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_token_from_request(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[str]:

    # First, try Authorization header
    if credentials:
        return credentials.credentials
    
    return request.cookies.get("jwt")

def get_user(username: str) -> User | None:
    with Session(engine) as db:
        statement = select(User).where(User.email == username)
        user = db.exec(statement).first()
        return user
        

def authenticate_user(username: str, password: str):
    user = get_user(username=username)

    if not user:
        verify_password(password, DUMMY_HASH)
        return False
    if not verify_password(password, user.password_hash):
        return False
    return user

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(
        token: Annotated[str, Depends(oauth2_scheme)]
) -> UserResponse:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except InvalidTokenError:
        raise credentials_exception
    user = get_user(username=token_data.username)
    if user is None:
        raise credentials_exception
    return UserResponse.model_validate(user)
    

def require_roles(*allowed_roles: str):
    """
    Dependency factory that checks if user has one of the allowed roles.
    
    Usage:
        @router.get("/admin-only", dependencies=[Depends(require_roles("admin"))])
        def admin_route():
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