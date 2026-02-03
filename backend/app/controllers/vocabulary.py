from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlmodel import Session, select
from typing import List, Optional
from uuid import UUID
import csv
import io
import json

from ..config import settings
from ..services.conversation_engine import ConversationEngine
from ..database.database import get_db
from ..models.vocabulary import VocabularyItem, VocabularyList
from ..models.user import User
from ..dependencies.auth import get_current_user, require_roles

router = APIRouter(prefix="/vocabulary-lists", tags=["vocabulary-lists"])

@router.post("/vocabulary-lists/preview")
async def preview_vocabulary_upload(
    file: UploadFile = File(...),
    current_user: User = Depends(require_roles("teacher"))
):
    """Parse CSV and return items for preview, but don't save anything yet"""
    contents = await file.read()
    decoded = contents.decode('utf-8')
    reader = csv.DictReader(io.StringIO(decoded))

    items = []
    errors = []

    for i, row in enumerate(reader):
        if not row.get('word') or not row.get('translation'):
            errors.append(f"Row {i+1}: missing required field")
            continue
        items.append({
            "word": row.get('word', '').strip(),
            "translation": row.get('translation', '').strip(),
            "part_of_speech": row.get('part_of_speech', '').strip() or None,
            "example_sentence": row.get('example_sentence', '').strip() or None,
            "regional_notes": row.get('regional_notes', '').strip() or None,
        })

    return {
        "items": items,
        "total": len(items),
        "errors": errors
    }