from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlmodel import Session, select
from typing import List
import csv
import io

from ..database.database import get_db
from ..models.vocabulary import VocabularyItem, VocabularyList, VocabularyListCreate, VocabularyListResponse
from ..models.user import User
from ..dependencies.auth import get_current_user, require_roles

router = APIRouter(prefix="/vocabulary-lists", tags=["vocabulary-lists"])


@router.get("/", response_model=List[VocabularyListResponse])
async def get_created_lists(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("teacher")),
):
    statement = select(VocabularyList).where(VocabularyList.teacher_id == current_user.id)
    vocab_lists = db.exec(statement).all()
    
    return [VocabularyListResponse.model_validate(vl) for vl in vocab_lists]


@router.post("/preview")
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

@router.post("/save")
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
            vocab_list.items.append(item)
            db.add(item)
            db.commit()
            db.refresh(item)

    db.commit()

    return vocab_list