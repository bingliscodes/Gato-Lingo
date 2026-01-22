from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database.database import get_db
from ..models.user import User
from ..schemas.user import UserCreate, UserUpdate, UserResponse

router = APIRouter(
    prefix="/users",
    tags=["users"]  # Groups endpoints in API docs
)

@router.get("/", response_model=List[UserResponse])
def get_all_users(db: Session = Depends(get_db)):
    """Get all users."""
    return db.query(User).all()

@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    """Get a specific user by ID."""
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {user_id} not found"
        )
    
    return user

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(user_data: UserCreate, db: Session = Depends(get_db)):
    """Create a new user."""
    
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Convert Pydantic schema to SQLAlchemy model
    # In production, you'd hash the password here!
    user = User(
        email=user_data.email,
        password_hash=hash_password(user_data.password),  # You'd implement this
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        native_language=user_data.native_language,
        target_language=user_data.target_language,
        proficiency_level=user_data.proficiency_level
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)  # Refresh to get the generated id, created_at, etc.
    
    return user

@router.patch("/{user_id}", response_model=UserResponse)
def update_user(user_id: int, user_data: UserUpdate, db: Session = Depends(get_db)):
    """Update a user."""
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {user_id} not found"
        )
    
    # Only update fields that were provided
    update_data = user_data.model_dump(exclude_unset=True)
    
    # Handle password separately (needs hashing)
    if "password" in update_data:
        update_data["password_hash"] = hash_password(update_data.pop("password"))
    
    for field, value in update_data.items():
        setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    
    return user

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    """Delete a user."""
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {user_id} not found"
        )
    
    db.delete(user)
    db.commit()
    
    return None


# Placeholder - you'd use a proper library like passlib
def hash_password(password: str) -> str:
    # In production, use: from passlib.context import CryptContext
    # pwd_context = CryptContext(schemes=["bcrypt"])
    # return pwd_context.hash(password)
    return f"hashed_{password}"  # DON'T DO THIS IN PRODUCTION