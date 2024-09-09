import logging
from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
from app.models.summarize import SummarizeRequest
from utils import summarize, calculate_tokens
from app.services.token_validation import validate_token

summarize_router = APIRouter()

logger = logging.getLogger(__name__)

@summarize_router.post("/")
async def summarize_file(file: UploadFile = File(...), payload: dict = Depends(validate_token)):
    logger.info("summarize_file endpoint accessed with file: %s", file.filename)
    try:
        result, _ = summarize(file)
        summary_text = result["output_text"]
        
        tokens = calculate_tokens(summary_text)
        cost = round((tokens / 1000) * 0.06, 2)

        logger.info("Summary generated: %s", summary_text)
        return {
            "summary": summary_text,
            "tokens": tokens,
            "cost": cost
        }
    except Exception as e:
        logger.error("Error in summarize_file: %s", str(e))
        raise HTTPException(status_code=500, detail=str(e))
