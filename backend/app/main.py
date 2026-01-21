from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from .websockets.conversation import ConversationHandler
from ..database.database import session, engine
from ..models import database_models

app = FastAPI(title="Language Tutor API")

database_models.Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

conversation_handler = ConversationHandler()

db = session()

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.websocket("/ws/conversation")
async def websocket_endpoint(websocket: WebSocket):
    await conversation_handler.handle_connection(websocket)