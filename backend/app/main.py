from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from .websockets.conversation import ConversationHandler
from ..database.database import session, engine
from ..models import database_models

app = FastAPI(title="Language Tutor API")

database_models.Base.metadata.create_all(bind=engine)

users = [database_models.User(id=1, first_name="ben", last_name="inglis", email="testEmail", native_language="english", target_language="cat", password="pass", password_confirm="pass", role="admin" ),
         database_models.User(id=2, first_name="cannoli", last_name="inglis", email="cannoliEmail", native_language="cat", target_language="spanish", password="pass", password_confirm="pass", role="admin" )]


def init_db():
    db = session()

    count = db.query(database_models.User).count

    if count == 0:
        db.add_all(users)
        db.commit()

init_db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

conversation_handler = ConversationHandler()


@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.websocket("/ws/conversation")
async def websocket_endpoint(websocket: WebSocket):
    await conversation_handler.handle_connection(websocket)