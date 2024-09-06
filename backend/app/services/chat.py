from fastapi import APIRouter, HTTPException, UploadFile, Request, Depends
from app.models.chat import ChatRequest
from app.models.bing_search import BingSearchRequest, BingSearchResult
from utils import create_azure_client, calculate_tokens, summarize
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnableParallel, RunnablePassthrough
from app.services.bing_search import search_bing_endpoint
import logging
from app.services.token_validation import validate_token

from app.database import Database
import logging
import uuid

chat_router = APIRouter()
logger = logging.getLogger("chat_service")

retriever = None  # Global variable to store the retriever

@chat_router.post("/send")
async def send_message(request: ChatRequest, req: Request, payload: dict = Depends(validate_token)):
    try:
        logger.info("send_message endpoint accessed with message: %s", request.message)

        # Get the database connection from the FastAPI app state
        db: Database = req.app.state.db

        # Extract oid from the validated token payload
        user_id = payload.get("oid")
        
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

        source = "OpenAI"
        if isinstance(response, str):
            assistant_message = response
        elif isinstance(response, dict) and "output_text" in response:
            assistant_message = response["output_text"]
        else:
            raise ValueError("Unexpected response format from chain")

        logger.info("assistant_message: %s", assistant_message)

       #if assistant_message == "Not Found":
        if "not found" in assistant_message.lower():  #checking assistant_message contains a substring called not found (case insensitive)
            logger.info("Query not found by LLM, invoking Bing Search API.")
            bing_response = await search_bing_endpoint(BingSearchRequest(query=request.message))
            formatted_results = "\n\n".join(
                [f"**{res.title}** - {res.link}\n{res.snippet}" for res in bing_response.results]
            )
            assistant_message = f"Bing Search Results:\n\n{formatted_results}"
            source = "Bing"

        user_tokens = calculate_tokens(request.message)
        assistant_tokens = calculate_tokens(assistant_message)
        total_tokens = user_tokens + assistant_tokens
        cost = round((total_tokens / 1000) * 0.06, 2)

        # Generate message IDs
        message_id = str(uuid.uuid4())  


        # Store the user prompt and assistant response in the chat_messages table
        db.execute_query("""
            INSERT INTO Chat_Messages (message_id, user_id, user_prompt, response, source)
            VALUES (%s, %s, %s, %s, %s)
        """, (message_id, user_id, request.message, assistant_message, source))

        return {
            "response": assistant_message,
            "message_id": message_id, 
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
