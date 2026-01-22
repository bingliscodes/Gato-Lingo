from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .database.database import engine, Base, session
from .database.seed import seed_all
from .controllers import user as user_controller
from .websockets.conversation import ConversationHandler

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Runs on startup and shutdown."""
    # Startup
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    
    print("Seeding database...")
    db = session()
    try:
        seed_all(db)
    finally:
        db.close()
    
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

# WebSocket handler
conversation_handler = ConversationHandler()

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.websocket("/ws/conversation")
async def websocket_endpoint(websocket: WebSocket):
    await conversation_handler.handle_connection(websocket)