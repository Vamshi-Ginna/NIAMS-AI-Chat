import logging
import os
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.services.chat import chat_router
from app.services.summarize import summarize_router
from app.services.feedback import feedback_router
from app.services.bing_search import bing_router
from app.services.login import login_router
from app.services.token_validation import validate_token  # Import the token validation function from token_validation.py
from app.database import Database

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Initialize database connection
db = Database()
db.connect()

# Pass the database instance to your routes
app.state.db = db

# CORS Configuration
origins = os.getenv("CORS_ORIGINS", "").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Apply token validation to your routers
app.include_router(chat_router, prefix="/chat", tags=["chat"], dependencies=[Depends(validate_token)])
app.include_router(summarize_router, prefix="/summarize", tags=["summarize"], dependencies=[Depends(validate_token)])
app.include_router(feedback_router, prefix="/feedback", tags=["feedback"], dependencies=[Depends(validate_token)])
app.include_router(bing_router, prefix="/bing", tags=["bing"], dependencies=[Depends(validate_token)])
app.include_router(login_router, prefix="/auth", tags=["auth"], dependencies=[Depends(validate_token)])

@app.get("/")
def read_root():
    logger.info("Root endpoint accessed")
    return {"message": "Welcome to the Azure OpenAI Chat API"}
