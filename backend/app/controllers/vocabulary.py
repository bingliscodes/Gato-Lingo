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
from ..models.vocabulary import VocabularyItem, VocabularyList, VocabularyListItem
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

@router.post("/vocabulary-lists")
def create_vocabulary_list(
    data: VocabularyListCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("teacher"))
):
    vocab_list = VocabularyList(
        title = data.title,
        description=data.description,
        target_language=data.target_language,
        teacher_id=current_user.id
    )

    db.add(vocab_list)
    db.commit()
    db.refresh(vocab_list)

    for item_data in data.items:
        statement = select(VocabularyItem).where(
            VocabularyItem.word == item_data.word,
            VocabularyItem.translation == item_data.translation
        )
        existing_item = db.exec(statement).first()

        if existing_item:
            item = existing_item
        else:
            item = VocabularyItem(**item_data.model_dump())
            db.add(item)
            db.commit()
            db.refresh(item)

        link = VocabularyListItem(
            vocabulary_list_id=vocab_list.id,
            vocabulary_item_id=item.id
        )
        db.add(link())

    db.commit()

    return vocab_list