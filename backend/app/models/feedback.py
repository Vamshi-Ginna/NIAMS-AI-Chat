from pydantic import BaseModel
from typing import Optional

class Feedback(BaseModel):
    message_id: int
    rating: int
    comment: Optional[str] = None  # Optional field with a default value of None
    user_id: int 
