import logging
from fastapi import APIRouter, HTTPException, Request, Depends
from app.models.feedback import Feedback
from app.database import Database
from app.services.token_validation import validate_token
import uuid

feedback_router = APIRouter()
logger = logging.getLogger("feedback_service")

@feedback_router.post("/")
async def receive_feedback(request: Request, feedback: Feedback, payload: dict = Depends(validate_token)):
    try:
        logger.info("receive_feedback endpoint accessed with message_id: %s", feedback.message_id)
        
        # Get the database connection from the FastAPI app state
        db: Database = request.app.state.db

         # Extract oid from the validated token payload
        user_id = payload.get("oid")
        
        # Generate UUID feedback ID
        feedback_id = str(uuid.uuid4())  

        # Insert the feedback into the database
        sql = """
            INSERT INTO Feedback (feedback_id, message_id, rating, comment, user_id)
            VALUES (%s, %s, %s, %s, %s)
        """
        values = (feedback_id, str(feedback.message_id), feedback.rating, feedback.comment, user_id)
        db.execute_query(sql, values)
        
        return {"status": "Feedback received"}
    except Exception as e:
        logger.error("Error in receive_feedback: %s", str(e))
        raise HTTPException(status_code=500, detail=str(e))
