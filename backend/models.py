from pydantic import BaseModel

class ChatRequest(BaseModel):
    message: str
    history: list

class SummarizeRequest(BaseModel):
    file: bytes
    filename: str