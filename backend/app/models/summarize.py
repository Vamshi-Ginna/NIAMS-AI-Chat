# app/models/summarize.py
from pydantic import BaseModel

class SummarizeRequest(BaseModel):
    file: bytes
    filename: str
