"""
Seed the database with initial data for development.
"""
from sqlmodel import Session, select
from ..models.user import User
from ..models.usage_token import UsageToken
from ..models.vocabulary import VocabularyItem, VocabularyList, VocabularyListItem
from ..utils.password import get_password_hash

def seed_users(db: Session):
    """Add test users if none exist."""
    
    # Check if users already exist
    statement = select(User)
    results = db.exec(statement)
    users = results.all()
    user_count = len(users)
    
    if user_count > 0:
        print(f"Database already has {user_count} users. Skipping seed.")
        return
    
    # Create test users
    demo_teacher = User( email="teacher@example.com",
            password_hash=get_password_hash("password123"),  
            first_name="Teacher",
            last_name="Demo",
            role="teacher",
            native_language="English",
            target_language="Spanish",)
    
    demo_student = User (
        email="student@example.com",
            password_hash=get_password_hash("password123"),
            first_name="Student",
            last_name="Demo",
            role="student",
            native_language="cat",
            target_language="Spanish",
            teacher = demo_teacher
    )
    db.add(demo_teacher)
    db.add(demo_student)
    db.commit()


def seed_vocabulary(db:Session):
    statement = select(VocabularyListItem)
    results = db.exec(statement)
    vocab = results.all()
    vocab_count = len(vocab)

    if vocab_count > 0:
        print(f"Database already has {vocab_count} vocabulary list items. Skipping seed")
        return
    
    teacher_statement = select(User).where(User.role=="teacher")
    teacher = db.exec(teacher_statement).first()
    # Create vocabulary lists and items
    list_1 = VocabularyList(
        title="Gatos",
        description="Essential vocabulary for talking about cats and cat care",
        target_language="Spanish",
        teacher_id=teacher.id,
    )
    word_1 = VocabularyItem(
        word="gato",
        translation="cat",
        part_of_speech="noun",
        example_sentence="El gato duerme en el sofá.",
        vocabulary_lists=[list_1]
    )

    word_2 = VocabularyItem(
        word="gatito",
        translation="kitten",
        part_of_speech="noun",
        example_sentence="El gatito juega con una pelota de lana.",
        vocabulary_lists=[list_1]
    )

    word_3 = VocabularyItem(
        word="maullar",
        translation="to meow",
        part_of_speech="verb",
        example_sentence="Mi gato maúlla cuando tiene hambre.",
        vocabulary_lists=[list_1]
    )

    word_4 = VocabularyItem(
        word="ronronear",
        translation="to purr",
        part_of_speech="verb",
        example_sentence="El gato ronronea cuando está feliz.",
        vocabulary_lists=[list_1]
    )

    word_5 = VocabularyItem(
        word="bigotes",
        translation="whiskers",
        part_of_speech="noun",
        example_sentence="Los bigotes del gato son muy largos.",
        vocabulary_lists=[list_1]
    )

    word_6 = VocabularyItem(
        word="pata",
        translation="paw",
        part_of_speech="noun",
        example_sentence="El gato me tocó con su pata.",
        vocabulary_lists=[list_1]
    )

    word_7 = VocabularyItem(
        word="cola",
        translation="tail",
        part_of_speech="noun",
        example_sentence="El gato mueve la cola cuando está enojado.",
        vocabulary_lists=[list_1]
    )

    word_8 = VocabularyItem(
        word="arañar",
        translation="to scratch",
        part_of_speech="verb",
        example_sentence="El gato araña el sofá todos los días.",
        vocabulary_lists=[list_1]
    )

    word_9 = VocabularyItem(
        word="pelaje",
        translation="fur",
        part_of_speech="noun",
        example_sentence="El pelaje de mi gato es muy suave.",
        vocabulary_lists=[list_1]
    )

    word_10 = VocabularyItem(
        word="alimentar",
        translation="to feed",
        part_of_speech="verb",
        example_sentence="Necesito alimentar al gato dos veces al día.",
        vocabulary_lists=[list_1]
    )

    word_11 = VocabularyItem(
        word="acariciar",
        translation="to pet",
        part_of_speech="verb",
        example_sentence="Me gusta acariciar a mi gato.",
        vocabulary_lists=[list_1]
    )

    word_12 = VocabularyItem(
        word="caja de arena",
        translation="litter box",
        part_of_speech="noun",
        example_sentence="Hay que limpiar la caja de arena cada semana.",
        vocabulary_lists=[list_1]
    )

    word_13 = VocabularyItem(
        word="juguete",
        translation="toy",
        part_of_speech="noun",
        example_sentence="El gato persigue su juguete favorito.",
        vocabulary_lists=[list_1]
    )

    word_14 = VocabularyItem(
        word="saltar",
        translation="to jump",
        part_of_speech="verb",
        example_sentence="El gato puede saltar muy alto.",
        vocabulary_lists=[list_1]
    )

    word_15 = VocabularyItem(
        word="esconderse",
        translation="to hide",
        part_of_speech="verb",
        example_sentence="Al gato le gusta esconderse debajo de la cama.",
        vocabulary_lists=[list_1]
    )

    word_16 = VocabularyItem(
        word="veterinario",
        translation="veterinarian",
        part_of_speech="noun",
        example_sentence="Llevé a mi gato al veterinario ayer.",
        vocabulary_lists=[list_1]
    )

    word_17 = VocabularyItem(
        word="dormir",
        translation="to sleep",
        part_of_speech="verb",
        example_sentence="Los gatos duermen muchas horas al día.",
        vocabulary_lists=[list_1]
    )

    word_18 = VocabularyItem(
        word="cazar",
        translation="to hunt",
        part_of_speech="verb",
        example_sentence="El gato intenta cazar pájaros en el jardín.",
        vocabulary_lists=[list_1]
    )

    word_19 = VocabularyItem(
        word="curioso",
        translation="curious",
        part_of_speech="adjective",
        example_sentence="Mi gato es muy curioso y explora todo.",
        vocabulary_lists=[list_1]
    )

    word_20 = VocabularyItem(
        word="mimado",
        translation="spoiled",
        part_of_speech="adjective",
        example_sentence="Este gato está muy mimado.",
        vocabulary_lists=[list_1]
    )

    db.add_all([
    word_1, word_2, word_3, word_4, word_5,
    word_6, word_7, word_8, word_9, word_10,
    word_11, word_12, word_13, word_14, word_15,
    word_16, word_17, word_18, word_19, word_20
])
    db.commit()

def seed_usage_token(db: Session):
    statement = select(UsageToken)
    results = db.exec(statement)
    usage_tokens = results.all()
    usage_tokens_count = len(usage_tokens)

    if usage_tokens_count > 0:
        print(f"Database already has {usage_tokens_count} usage tokens. Skipping seed")
        return
    
    demo_token = UsageToken(
        usage_limit=10,
    )

    db.add(demo_token)
    db.commit()
    

def seed_all(db: Session):
    """Run all seed functions."""
    seed_users(db)
    seed_vocabulary(db)
    seed_usage_token(db)
