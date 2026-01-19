from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from .websockets.conversation import ConversationHandler

app = FastAPI(title="Language Tutor API")

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
```

**.env**
```
ANTHROPIC_API_KEY=your-anthropic-key
OPENAI_API_KEY=your-openai-key