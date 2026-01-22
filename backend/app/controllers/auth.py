from datetime import datetime, timedelta
from typing import Optional
import secrets
import hashlib

from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.orm import Session

from ..database.database import get_db
from ..models.user import User
from ..schemas.auth import (SignupRequest, LoginRequest, AuthResponse, UserData, ForgotPasswordRequest, ResetPasswordRequest, MessageResponse)
from ..schemas.user import UserResponse
from ..utils.jwt import create_access_token
from ..dependencies.auth import get_current_user
from ..utils.password import verify_password