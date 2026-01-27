from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
import uuid

if TYPE_CHECKING:
    from .user import User
    from .conversation_session import ConversationSession


# Bridge table for many-to-many
class VocabularyListItem(SQLModel, table=True):
    __tablename__ = "vocabulary_list_items"
    
    vocabulary_list_id: uuid.UUID = Field(foreign_key="vocabulary_lists.id", primary_key=True)
    vocabulary_item_id: uuid.UUID = Field(foreign_key="vocabulary_items.id", primary_key=True)


class VocabularyItem(SQLModel, table=True):
    __tablename__ = "vocabulary_items"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    word: str
    translation: str
    part_of_speech: Optional[str] = None
    example_sentence: Optional[str] = None
    regional_notes: Optional[str] = None
    
    # Relationship via bridge table
    vocabulary_lists: List["VocabularyList"] = Relationship(
        back_populates="items",
        link_model=VocabularyListItem
    )


class VocabularyList(SQLModel, table=True):
    __tablename__ = "vocabulary_lists"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    title: str
    description: Optional[str] = None
    target_language: str
    
    # Foreign key to teacher who created it
    teacher_id: Optional[uuid.UUID] = Field(default=None, foreign_key="users.id")
    
    # Relationships
    teacher: Optional["User"] = Relationship(
        back_populates="vocabulary_lists", 
        sa_relationship_kwargs={"foreign_keys": "[VocabularyList.teacher_id]"}
    )
    
    items: List["VocabularyItem"] = Relationship(
        back_populates="vocabulary_lists",
        link_model=VocabularyListItem
    )
    sessions: List["ConversationSession"] = Relationship(back_populates="vocabulary_list")