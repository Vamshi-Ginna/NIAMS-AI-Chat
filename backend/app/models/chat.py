# app/models/chat.py
from pydantic import BaseModel
from typing import List

class Message(BaseModel):
    type: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[Message]