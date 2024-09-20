from fastapi import APIRouter, HTTPException, UploadFile, Request, Depends
from app.models.chat import ChatRequest
from app.models.bing_search import BingSearchRequest, BingSearchResult
from utils import create_azure_client, calculate_tokens, summarize, store_retriever, get_retriever, store_documents, get_documents, delete_retriever, delete_documents
from pydantic import BaseModel

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnableParallel, RunnablePassthrough
from app.services.bing_search import search_bing_endpoint
import logging
from app.services.token_validation import validate_token

from app.database import Database
import logging
import uuid
#from fastapi.responses import EventSourceResponse
from sse_starlette.sse import EventSourceResponse
import asyncio
import json

chat_router = APIRouter()
logger = logging.getLogger("chat_service")

# Define request model for chat-ids list
class CleanupRequest(BaseModel):
    chat_ids: list[str]

retriever = None  # Global variable to store the retriever



# Helper function to stream Azure response
async def stream_azure_response(create_completion, inputs):
    async for chunk in await create_completion(messages=inputs["messages"], stream=True):
        if chunk.choices and chunk.choices[0].delta.content is not None:
            yield chunk.choices[0].delta.contentices[0].delta.content


@chat_router.post("/send")
async def send_message(request: ChatRequest, req: Request, payload: dict = Depends(validate_token)):
    try:
        logger.info("send_message endpoint accessed with message: %s", request.message)
        chat_id = req.headers.get("Chat-Id")  # Get chatId from headers

        # Get the database connection from the FastAPI app state
        db: Database = req.app.state.db

        # Extract oid from the validated token payload
        user_id = payload.get("oid")
        
        # Get the retriever for this chat session
        retriever = get_retriever(chat_id)
        context_text = ""
        if retriever:
            context = retriever.get_relevant_documents(request.message)
            context_text = " ".join([doc.page_content for doc in context])

        conversation_history = "\n".join([f"{msg.type.capitalize()}: {msg.content}" for msg in request.history])

        template = """You are an advanced AI assistant with expertise in a wide range of topics. Your task is to provide comprehensive, well-structured answers based on the given context, conversation history, and question. Your entire response must be formatted in Markdown. Follow these guidelines:
        1. Markdown Formatting:
        - Use Markdown syntax for all formatting. Your entire response should be valid Markdown.
        - Give appropriate line spacing 
        2. Response Structure:
        - Begin with a # Heading summarizing your answer (1-2 sentences).
        - Organize your response into logical sections
        3. Content Guidelines:
        - Provide detailed explanations, drawing from the context if available, or your general knowledge if not.
        - Include relevant examples, analogies, or use cases to illustrate your points.
        - If applicable, mention pros and cons or different perspectives on the topic.
        - For technical topics, include code snippets in appropriate Markdown code blocks.
        4. Accuracy and Honesty:
        - Avoid making assumptions or guessing. Clearly state which parts of the question you can and cannot address.
        5. Engagement:
        - Add a conclusion section whenever required
        - End your response with a thought-provoking question or suggestion to promote user continue the conversation or ask th user if he has an further questions
        Context: {context}
        Conversation History: {history}
        Question: {question}
        Markdown Response:
        """
        
          # Use the ChatPromptTemplate to generate the message to be sent
        prompt = ChatPromptTemplate.from_template(template)

        # Apply the template with dynamic inputs
        formatted_prompt = prompt.format(context=context_text, history=conversation_history, question=request.message)

        # Prepare the messages for the model (system prompt and user input)
        messages = [
            {"role": "system", "content": "You are an advanced AI assistant with expertise in a wide range of topics."},
            {"role": "user", "content": formatted_prompt}
        ]

        # Initialize the Azure OpenAI client with streaming enabled
        create_completion = create_azure_client(streaming=True)

        
        async def event_generator(create_completion, messages, db, request, user_id):
            total_tokens = calculate_tokens(request.message)  # Initial tokens for the user's message

            try:
                # Await the coroutine returned by create_completion
                completion_response = await create_completion(messages=messages)

                if completion_response is None:
                    logger.error("Completion response is None, possibly due to an API error.")
                    yield f"data: {json.dumps({'error': 'No response from Azure OpenAI'})}\n\n"
                    return

                async for chunk in completion_response:
                   # Extract the content from the chunk
                     if chunk.choices and chunk.choices[0].delta.content:
                        content = chunk.choices[0].delta.content
                        assistant_message += content  # Concatenate the content as string
                        yield f"data: {json.dumps({'data': content})}\n\n" # Stream to frontend
                                 
                
                # Once all chunks are streamed, calculate the total tokens and cost
                total_tokens += calculate_tokens(assistant_message)
                cost = round((total_tokens / 1000) * 0.06, 2)

                message_id = str(uuid.uuid4())
                price_id = str(uuid.uuid4())

                 # Send final response object after streaming completes
                final_data = {
                    "response": assistant_message,
                    "message_id": message_id,
                    "tokens": total_tokens,
                    "cost": cost
                }
                
                # Final event containing full response information 
                yield f"data: {json.dumps({'data': final_data})}\n\n"

                # Store the user prompt and assistant response in the chat_messages table
                db.execute_query("""
                    INSERT INTO Chat_Messages (message_id, user_id, user_prompt, response, source)
                    VALUES (%s, %s, %s, %s, %s)
                """, (message_id, user_id, request.message, assistant_message, "OpenAI"))

                # Store the price details in the price table
                db.execute_query("""
                    INSERT INTO Price (price_id, message_id, completion_price)
                    VALUES (%s, %s, %s)
                    """, (price_id, message_id, cost))

            except Exception as e:
                logger.error(f"Error during streaming: {str(e)}")
                yield f"data: {json.dumps({'error': str(e)})}\n\n"

            finally:
                # End the event stream
                yield "data: [DONE]\n\n" 
        
        
        logger.info("Before return statement")       
        return EventSourceResponse(event_generator(create_completion,messages,db,request, user_id ))

    except Exception as e:
        logger.error("Error in send_message: %s", str(e))
        raise HTTPException(status_code=500, detail=str(e))

@chat_router.post("/upload_document")
async def upload_document(file: UploadFile, req: Request, payload: dict = Depends(validate_token)):
    try:
        logger.info("upload_document endpoint accessed with file: %s", file.filename)
        chat_id = req.headers.get("Chat-Id")  # Get chatId from headers
        result, new_retriever = summarize(file, chat_id)
        summary_text = result["output_text"]

        # global retriever
        # retriever = new_retriever  # Update the global retriever

        # Store the updated retriever
        store_retriever(chat_id, new_retriever)

        tokens = calculate_tokens(summary_text)
        cost = round((tokens / 1000) * 0.06, 2)

        # Extract oid from the validated token payload
        user_id = payload.get("oid")

        # Generate message IDs
        message_id = str(uuid.uuid4())  

        # Get the database connection from the FastAPI app state
        db: Database = req.app.state.db

        # Store the user prompt and assistant response in the chat_messages table
        db.execute_query("""
            INSERT INTO Chat_Messages (message_id, user_id, user_prompt, response, source)
            VALUES (%s, %s, %s, %s, %s)
        """, (message_id, user_id, f"Generating File Summary for {file.filename}", summary_text, "Document"))

         # Generate price ID
        price_id = str(uuid.uuid4())  

        # Store the price detials the price table
        db.execute_query("""
            INSERT INTO Price (price_id, message_id, completion_price)
            VALUES (%s, %s, %s)
        """, (price_id, message_id, cost))

        return {
            "summary": f"Your document '{file.filename}' has been uploaded. If you need any specific sections or details from the document summarized, or expanded upon, please let me know!",
            "tokens": tokens,
            "cost": cost
        }
    except Exception as e:
        logger.error("Error in upload_document: %s", str(e))
        raise HTTPException(status_code=500, detail=str(e))
    


@chat_router.post("/cleanup_chat_sessions")
async def cleanup_sessions(request: CleanupRequest, req: Request, payload: dict = Depends(validate_token)):
    try:
        chat_ids = request.chat_ids
        logger.info("Cleaning up sessions for chat-ids: %s", chat_ids)

        # Iterate through each chat-id and delete associated retriever and documents
        for chat_id in chat_ids:
            # Delete retriever
            delete_retriever(chat_id)
            # Delete documents
            delete_documents(chat_id)
            logger.info("Cleaned  chat_ids: %s",chat_id )

        return {"message": "Chat sessions cleaned up successfully.", "chat_ids_cleaned": chat_ids}
    
    except Exception as e:
        logger.error("Error in cleanup_sessions: %s", str(e))
        raise HTTPException(status_code=500, detail=str(e))