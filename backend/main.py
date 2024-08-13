import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.services.chat import chat_router
from app.services.summarize import summarize_router
from app.services.feedback import feedback_router
from app.services.bing_search import bing_router  # Import Bing router

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Configure CORS
origins = ["http://localhost:3000"]  # Frontend URL

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router, prefix="/chat", tags=["chat"])
app.include_router(summarize_router, prefix="/summarize", tags=["summarize"])
app.include_router(feedback_router, prefix="/feedback", tags=["feedback"])
app.include_router(bing_router, prefix="/bing", tags=["bing"])  # Include Bing router

@app.get("/")
def read_root():
    logger.info("Root endpoint accessed")
    return {"message": "Welcome to the Azure OpenAI Chat API"}
