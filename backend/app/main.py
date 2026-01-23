from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .database.database import engine, Base, session, SessionDep, init_db
from .database.seed import seed_all
from .controllers import user as user_controller
from .controllers import auth as auth_controller
from .websockets.conversation import ConversationHandler

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Runs on startup and shutdown."""
    # Startup
    print("Creating database tables...")
    init_db(engine)
    
    print("Seeding database...")
    
    yield  # App runs here
    
    # Shutdown (if needed)
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

# WebSocket handler
conversation_handler = ConversationHandler()

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.websocket("/ws/conversation")
async def websocket_endpoint(websocket: WebSocket):
    await conversation_handler.handle_connection(websocket)