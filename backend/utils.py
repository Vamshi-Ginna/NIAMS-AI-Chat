from langchain.chains import ConversationChain
from langchain.memory import ConversationBufferMemory
from langchain_core.prompts.prompt import PromptTemplate
from langchain_openai import AzureChatOpenAI, AzureOpenAIEmbeddings, ChatOpenAI, OpenAIEmbeddings
from langchain_community.document_loaders import PyPDFLoader, Docx2txtLoader
import json
import tempfile
import io, os, logging
from pypdf import PdfReader
from langchain.schema import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import DocArrayInMemorySearch
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnableParallel, RunnablePassthrough
from typing import List
from langchain.chains.summarize import load_summarize_chain
from config import Config
import tiktoken
import xml.etree.ElementTree as ET
from openai import AsyncAzureOpenAI

logger = logging.getLogger(__name__)


# In-memory store for retrievers (can be replaced with Redis)
retriever_store = {}

def store_retriever(chat_id: str, retriever):
    retriever_store[chat_id] = retriever

def get_retriever(chat_id: str):
    return retriever_store.get(chat_id)

def delete_retriever(chat_id: str):
    if chat_id in retriever_store:
        del retriever_store[chat_id]

# Store and retrieve documents (in-memory, can be replaced with Redis)
document_store = {}

def store_documents(chat_id: str, new_documents):
    if chat_id in document_store:
        document_store[chat_id] += new_documents
    else:
        document_store[chat_id] = new_documents

def get_documents(chat_id: str):
    return document_store.get(chat_id, [])

def delete_documents(chat_id: str):
    if chat_id in document_store:
        del document_store[chat_id]


def calculate_tokens(text):
    encoding = tiktoken.get_encoding('cl100k_base')
    return len(encoding.encode(text))

def create_azure_client(streaming: bool = False):
    client = AsyncAzureOpenAI(
        api_key=os.getenv("AZURE_OPENAI_API_KEY"),
        api_version=os.getenv("AZURE_OPENAI_API_VERSION"),
        azure_endpoint=os.getenv("AZURE_OPENAI_API_ENDPOINT")
    )
    
    # Error handling during the request
    async def create_chat_completion(messages: List[dict], **kwargs):
        try:
            # Handle streaming mode based on the flag
            return await client.chat.completions.create(
                model=os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME"),
                messages=messages,
                stream=streaming,
                **kwargs
            )
        except Exception as e:
            # Log the error and re-raise or handle it gracefully
            logger.error(f"Error during OpenAI completion: {str(e)}")
            raise e
    return create_chat_completion


def create_embeddings_model() -> OpenAIEmbeddings:
    embeddings = OpenAIEmbeddings(model=Config.OPENAI_EMBEDDINGS_MODEL, dimensions=1000)
    return embeddings

def create_azure_embeddings() -> AzureOpenAIEmbeddings:
    embeddings = AzureOpenAIEmbeddings(
        azure_endpoint=Config.AZURE_OPENAI_API_ENDPOINT,
        azure_deployment=Config.AZURE_OPENAI_EMBEDDINGS_DEPLOYMENT_NAME,
        openai_api_version=Config.AZURE_OPENAI_API_VERSION,
        model=Config.AZURE_OPENAI_EMBEDDINGS_MODEL_NAME,
        api_key=Config.AZURE_OPENAI_API_KEY,
    )
    return embeddings

def get_docs_from_bytes(data: bytes) -> List[Document]:
    reader = PdfReader(io.BytesIO(initial_bytes=data))
    docs = [Document(page_content=page.extract_text(), page_number=index + 1) for index, page in enumerate(reader.pages)]
    return docs

def split_docs_from_docs(docs: List[Document], chunk_size: int = 2000, chunk_overlap: int = 500) -> List[Document]:
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap, length_function=len)
    return text_splitter.split_documents(docs)

def create_embeddings(docs: List[Document]) -> DocArrayInMemorySearch:
    return DocArrayInMemorySearch.from_documents(documents=docs, embedding=create_azure_embeddings())

def get_retriever_from_docs(docs: List[Document], chunk_size: int = 2000, chunk_overlap: int = 200):
    llm = create_azure_client(temperature=0.0)
    split_docs = split_docs_from_docs(docs, chunk_size=chunk_size, chunk_overlap=chunk_overlap)
    vector_store = create_embeddings(split_docs)
    db_retriever = vector_store.as_retriever(search_kwargs={"k": 20})

    return db_retriever

def summarize(file, chat_id): 
    file_name = file.filename
    logger.info("summarize function: %s", file_name) 
    extension = os.path.splitext(file_name)[1]
    logger.info("extension: %s", extension)
    
    llm = AzureChatOpenAI(
        azure_endpoint=Config.AZURE_OPENAI_API_ENDPOINT,
        api_key=Config.AZURE_OPENAI_API_KEY,
        model=Config.AZURE_OPENAI_MODEL_NAME,
        azure_deployment=Config.AZURE_OPENAI_DEPLOYMENT_NAME,
        api_version=Config.AZURE_OPENAI_API_VERSION,
        temperature=0.7
    )

    with tempfile.NamedTemporaryFile(delete=False) as temp:      
        temp.write(file.file.read())      
        temp.flush()
        temp_path = temp.name
    temp.close()

   # Process based on file type
    if extension == '.pdf':
        loader = PyPDFLoader(temp_path)
        docs = loader.load_and_split()
    elif extension == '.docx':
        loader = Docx2txtLoader(temp_path)
        docs = loader.load_and_split()
    elif extension == '.txt' or extension == '.md':
        with open(temp_path, 'r') as f:
            content = f.read()
        docs = [Document(page_content=content)]
    elif extension == '.json':
        with open(temp_path, 'r') as f:
            json_content = json.load(f)
        content = json.dumps(json_content, indent=2)  # Convert JSON to readable string
        docs = [Document(page_content=content)]
    elif extension == '.xml':
        tree = ET.parse(temp_path)
        root = tree.getroot()
        content = ET.tostring(root, encoding='unicode')  # Convert XML to string
        docs = [Document(page_content=content)]
    else:
        raise ValueError("Unsupported file type")

    os.remove(temp_path)

     # Combine with existing documents for the chat_id
    existing_docs = get_documents(chat_id)
    combined_docs = existing_docs + docs
    store_documents(chat_id, docs)  # Update document store with new docs

    # Create retriever from combined documents
    retriever = get_retriever_from_docs(combined_docs)

    chain = load_summarize_chain(llm, chain_type="stuff")
    result = chain.invoke(combined_docs)

    logger.info("#############################")
    logger.info("result : %s", result)
    logger.info("retriever : %s", retriever)
    logger.info("#############################")

    return result, retriever

