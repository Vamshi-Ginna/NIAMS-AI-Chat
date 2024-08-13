import logging
from fastapi import APIRouter, HTTPException
from app.models.feedback import Feedback
import mysql.connector
from config import Config

feedback_router = APIRouter()
logger = logging.getLogger("feedback_service")

def sql_connect(message, feedback):
    mydb = mysql.connector.connect(
        host=Config.MY_SQL_HOST,
        user=Config.MY_SQL_USER,
        password=Config.MY_SQL_PASSWORD,
        database=Config.MY_SQL_DB
    )
    mycursor = mydb.cursor()
    sql = "INSERT INTO feedback (message, feedback) VALUES (%s, %s)"
    val = (message, feedback)
    mycursor.execute(sql, val)
    mydb.commit()
    mydb.close()

@feedback_router.post("/")
async def receive_feedback(feedback: Feedback):
    try:
        logger.info("receive_feedback endpoint accessed with message: %s", feedback.message)
        sql_connect(feedback.message, feedback.feedback)
        return {"status": "Feedback received"}
    except Exception as e:
        logger.error("Error in receive_feedback: %s", str(e))
        raise HTTPException(status_code=500, detail=str(e))