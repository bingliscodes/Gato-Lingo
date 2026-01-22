from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware

from .database.database import engine, Base
from .controllers import user as user_controller
from .websockets.conversation import ConversationHandler

Base.metadata.create_all(bind=engine)
app = FastAPI(title="Language Tutor API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(user_controller.router)

# WebSocket handler
conversation_handler = ConversationHandler()

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.websocket("/ws/conversation")
async def websocket_endpoint(websocket: WebSocket):
    await conversation_handler.handle_connection(websocket)