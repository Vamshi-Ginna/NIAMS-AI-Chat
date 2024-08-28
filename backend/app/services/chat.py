from fastapi import APIRouter, HTTPException, UploadFile
from app.models.chat import ChatRequest
from app.models.bing_search import BingSearchRequest, BingSearchResult
from utils import create_azure_client, calculate_tokens, summarize
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnableParallel, RunnablePassthrough
from app.services.bing_search import search_bing_endpoint
import logging

chat_router = APIRouter()
logger = logging.getLogger("chat_service")

retriever = None  # Global variable to store the retriever

@chat_router.post("/send")
async def send_message(request: ChatRequest):
    try:
        logger.info("send_message endpoint accessed with message: %s", request.message)

        global retriever
        context_text = ""
        if retriever:
            context = retriever.get_relevant_documents(request.message)
            context_text = " ".join([doc.page_content for doc in context])
        
        conversation_history = "\n".join([f"{msg.type.capitalize()}: {msg.content}" for msg in request.history])
        
        template = """You are a helpful assistant. Answer the question based on the provided context and conversation history. 
                      If context is empty, use your general knowledge. Do not guess answers. 
                      If you do not know the answer, say "Not Found".
                      Context: {context}
                      Conversation History: {history}
                      Question: {question}
                      Answer:"""

        prompt = ChatPromptTemplate.from_template(template)
        output_parser = StrOutputParser()
        setup_and_retrieval = RunnableParallel({"context": RunnablePassthrough(), "history": RunnablePassthrough(), "question": RunnablePassthrough()})
        chain = setup_and_retrieval | prompt | create_azure_client() | output_parser

        response = chain.invoke({"context": context_text, "history": conversation_history, "question": request.message})
        
        logger.info("Chain response: %s", response)
        
        if isinstance(response, str):
            assistant_message = response
        elif isinstance(response, dict) and "output_text" in response:
            assistant_message = response["output_text"]
        else:
            raise ValueError("Unexpected response format from chain")

        if assistant_message == "Not Found":
            logger.info("Query not found by LLM, invoking Bing Search API.")
            bing_response = await search_bing_endpoint(BingSearchRequest(query=request.message))
            
            logger.info("Bing Search API response: %s", bing_response)

            formatted_results = "\n\n".join(
                [f"**{res.title}** - {res.link}\n{res.snippet}" for res in bing_response.results]
            )
            assistant_message = f"Bing Search Results:\n\n{formatted_results}"

        user_tokens = calculate_tokens(request.message)
        assistant_tokens = calculate_tokens(assistant_message)
        total_tokens = user_tokens + assistant_tokens
        cost = round((total_tokens / 1000) * 0.06, 2)

        logger.info("#############################")
        logger.info("response : %s", assistant_message)
        logger.info("#############################")

        return {
            "response": assistant_message,
            "tokens": total_tokens,
            "cost": cost
        }

    except Exception as e:
        logger.error("Error in send_message: %s", str(e))
        raise HTTPException(status_code=500, detail=str(e))

@chat_router.post("/upload_document")
async def upload_document(file: UploadFile):
    try:
        logger.info("upload_document endpoint accessed with file: %s", file.filename)
        result, new_retriever = summarize(file)
        summary_text = result["output_text"]

        global retriever
        retriever = new_retriever  # Update the global retriever

        tokens = calculate_tokens(summary_text)
        cost = round((tokens / 1000) * 0.06, 2)

        return {
            "summary": summary_text,
            "tokens": tokens,
            "cost": cost
        }
    except Exception as e:
        logger.error("Error in upload_document: %s", str(e))
        raise HTTPException(status_code=500, detail=str(e))
