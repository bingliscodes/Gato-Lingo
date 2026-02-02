from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from sqlmodel import Session

from .database.database import engine, init_db
from .database.seed import seed_all
from .controllers import user as user_controller
from .controllers import auth as auth_controller
from .controllers import conversation_session as conversation_session_controller
from .controllers import exam as exam_controller
from .websockets.conversation import ConversationHandler
from .utils.score_session import generate_session_score

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Creating database tables...")
    init_db()
    
    print("Seeding database...")
    with Session(engine) as db:
        seed_all(db)

    yield 
    
    print("Shutting down...")

app = FastAPI(title="Language Tutor API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(user_controller.router)
app.include_router(auth_controller.router)
app.include_router(exam_controller.router)
app.include_router(conversation_session_controller.router)

# WebSocket handler
conversation_handler = ConversationHandler()
generate_session_score("d9a15a41-2215-493b-a1a0-4ad371e5f002")
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.websocket("/ws/conversation")
async def websocket_endpoint(websocket: WebSocket):
    await conversation_handler.handle_connection(websocket)