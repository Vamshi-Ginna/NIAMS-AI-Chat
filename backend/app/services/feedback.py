import logging
from fastapi import APIRouter, HTTPException, Request
from app.models.feedback import Feedback
from app.database import Database

feedback_router = APIRouter()
logger = logging.getLogger("feedback_service")

@feedback_router.post("/")
async def receive_feedback(request: Request, feedback: Feedback):
    try:
        logger.info("receive_feedback endpoint accessed with message_id: %s", feedback.message_id)
        
        # Get the database connection from the FastAPI app state
        db: Database = request.app.state.db
        
        # Insert the feedback into the database
        sql = """
            INSERT INTO Feedback (feedback_id, message_id, rating, comment, user_id)
            VALUES (%s, %s, %s, %s)
        """
        values = ('117a7be7-b235-456f-86d1-cdcd50fa8fb5',feedback.message_id, feedback.rating, feedback.comment, '550e8400-e29b-41d4-a716-446655440000')
        db.execute_query(sql, values)
        
        return {"status": "Feedback received"}
    except Exception as e:
        logger.error("Error in receive_feedback: %s", str(e))
        raise HTTPException(status_code=500, detail=str(e))
