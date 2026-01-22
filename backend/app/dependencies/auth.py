from datetime import datetime
from typing import Optional
from uuid import UUID

from fastapi import Depends, HTTPException, status, Request, Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from ..database.database import get_db
from ..models.user import User
from ..utils.jwt import decode_token
from ..config import settings

# This extracts the token from the Authorization header
security = HTTPBearer(auto_error=False)


def get_token_from_request(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[str]:
    """
    Extract JWT token from either:
    1. Authorization header (Bearer token)
    2. Cookie (jwt)
    
    This mirrors your Express protect middleware checking req.cookies.jwt
    """
    # First, try Authorization header
    if credentials:
        return credentials.credentials
    
    # Then, try cookie
    token = request.cookies.get("jwt")
    if token:
        return token
    
    return None


def get_current_user(
    token: Optional[str] = Depends(get_token_from_request),
    db: Session = Depends(get_db)
) -> User:
    """
    Dependency that gets the current authenticated user.
    Equivalent to your protect middleware.
    """
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="You are not logged in! Please log in to get access."
        )
    
    # Decode and verify token
    try:
        payload = decode_token(token)
    except HTTPException:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    
    # Check if user still exists
    user = db.query(User).filter(User.id == UUID(user_id)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="The user belonging to this token no longer exists"
        )
    
    # Check if user changed password after token was issued
    token_issued_at = datetime.utcfromtimestamp(payload.get("iat", 0))
    if user.password_changed_at and user.password_changed_at > token_issued_at:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User recently changed password! Please log in again."
        )
    
    return user


def get_current_user_optional(
    token: Optional[str] = Depends(get_token_from_request),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """
    Same as get_current_user but returns None instead of raising an exception.
    Useful for routes that work with or without authentication.
    """
    if not token:
        return None
    
    try:
        return get_current_user(token, db)
    except HTTPException:
        return None


def require_roles(*allowed_roles: str):
    """
    Dependency factory that checks if user has one of the allowed roles.
    Equivalent to your restrictTo middleware.
    
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