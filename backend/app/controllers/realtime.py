import requests
from requests.exceptions import HTTPError
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from pydantic import BaseModel
from typing import Optional

from ..database.database import get_db
from ..config import settings

router = APIRouter(prefix="/realtime", tags=["realtime"])



class TokenRequest(BaseModel):
    instructions: Optional[str] = None

@router.post("/token")
def get_ephemeral_token(request: TokenRequest):
    """
    Retrieves an OpenAI ephemeral token to create a realtime session
    """

    session_config = {
        "model": "gpt-realtime",
        "voice": "verse",
    }

    if request.instructions:
        session_config["instructions"] = request.instructions
    
    try:
        res = requests.post(
            "https://api.openai.com/v1/realtime/sessions",
            headers={
                "Authorization": f"Bearer {settings.openai_api_key}",
                "Content-Type": "application/json"
            },
            json=session_config
        )
        res.raise_for_status()

        return res.json()

    except HTTPError as http_err:
        print(f"HTTP error occurred: {http_err}")
        print(f"Response body: {http_err.response.text}")
        raise HTTPException(
            status_code=http_err.response.status_code,
            detail=f"OpenAI API error: {http_err.response.text}"
        )
    except Exception as err:
        print(f"Other error occurred: {err}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get ephemeral token: {str(err)}"
        )