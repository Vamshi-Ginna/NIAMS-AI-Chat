# app/models/feedback.py
from pydantic import BaseModel
from typing import Optional
from uuid import UUID

class Feedback(BaseModel):
    message_id: UUID 
    rating: int
    comment: Optional[str] = None 
