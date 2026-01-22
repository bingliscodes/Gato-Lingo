from datetime import datetime, timedelta
from typing import Optional
from uuid import UUID

from jose import JWTError, jwt
from fastapi import HTTPException, status

from ..config import settings


def create_access_token(user_id: UUID) -> str:
    """
    Create a JWT token for a user.
    Equivalent to your signToken() function.
    """
    expire = datetime.now() + timedelta(minutes=settings.jwt_expires_in_minutes)
    
    payload = {
        "sub": str(user_id),  # "sub" (subject) is the standard JWT claim for user ID
        "exp": expire,        # Expiration time
        "iat": datetime.now()  # Issued at time
    }
    
    token = jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)
    return token


def decode_token(token: str) -> dict:
    """
    Decode and verify a JWT token.
    Returns the payload if valid, raises exception if not.
    """
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )


def get_user_id_from_token(token: str) -> UUID:
    """Extract the user ID from a token."""
    payload = decode_token(token)
    user_id = payload.get("sub")
    
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )
    
    return UUID(user_id)