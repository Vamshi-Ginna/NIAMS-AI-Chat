# app/models/bing_search.py
from pydantic import BaseModel
from typing import List

class BingSearchRequest(BaseModel):
    query: str

class BingSearchResult(BaseModel):
    title: str
    link: str
    snippet: str

class BingSearchResponse(BaseModel):
    results: List[BingSearchResult]