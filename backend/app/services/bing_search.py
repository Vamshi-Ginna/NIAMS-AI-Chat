import requests
from fastapi import APIRouter, HTTPException
from config import Config
from app.models.bing_search import BingSearchRequest, BingSearchResponse, BingSearchResult
from langchain_community.utilities import BingSearchAPIWrapper
import logging
from bs4 import BeautifulSoup

bing_router = APIRouter()
logger = logging.getLogger("bing_search_service")

api_wrapper = BingSearchAPIWrapper(
    bing_subscription_key=Config.BING_SEARCH_API_KEY,
    bing_search_url=Config.BING_SEARCH_ENDPOINT,
    k=3
)

def clean_html(raw_html):
    soup = BeautifulSoup(raw_html, "html.parser")
    return soup.get_text()

@bing_router.post("/search", response_model=BingSearchResponse)
async def search_bing_endpoint(request: BingSearchRequest):
    try:
        logger.info("search_bing endpoint accessed with query: %s", request.query)
        results = api_wrapper.results(request.query,3)
        logger.info("Raw Bing Search API results: %s", results)  # Add logging to debug

        cleaned_results = [
            BingSearchResult(
                title=clean_html(res['title']),
                link=res['link'],
                snippet=clean_html(res['snippet'])
            )
            for res in results
        ]
        logger.info("Cleaned Bing Search API results: %s", cleaned_results)  # Add logging to debug

        return BingSearchResponse(results=cleaned_results)
    except Exception as e:
        logger.error("Error in search_bing: %s", str(e))
        raise HTTPException(status_code=500, detail=str(e))