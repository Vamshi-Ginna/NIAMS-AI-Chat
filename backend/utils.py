from langchain.chains import ConversationChain
from langchain.memory import ConversationBufferMemory
from langchain_core.prompts.prompt import PromptTemplate
from langchain_openai import AzureChatOpenAI, AzureOpenAIEmbeddings, ChatOpenAI, OpenAIEmbeddings
from langchain_community.document_loaders import PyPDFLoader, Docx2txtLoader
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

logger = logging.getLogger(__name__)

def calculate_tokens(text):
    encoding = tiktoken.get_encoding('cl100k_base')
    return len(encoding.encode(text))

def create_azure_client(temperature: float = 0.7):
    llm = AzureChatOpenAI(
        azure_endpoint=Config.AZURE_OPENAI_API_ENDPOINT,
        api_key=Config.AZURE_OPENAI_API_KEY,
        model=Config.AZURE_OPENAI_MODEL_NAME,
        azure_deployment=Config.AZURE_OPENAI_DEPLOYMENT_NAME,
        api_version=Config.AZURE_OPENAI_API_VERSION,
        temperature=temperature
    )
    
    return llm


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

def summarize(file): 
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

    if extension == '.pdf':  
        loader = PyPDFLoader(temp_path)
        docs = loader.load_and_split()
    elif extension == '.docx':
        loader = Docx2txtLoader(temp_path)
        docs = loader.load_and_split()
    else:
        raise ValueError("Unsupported file type")

    chain = load_summarize_chain(llm, chain_type="stuff")
    result = chain.invoke(docs)
    os.remove(temp_path)

    retriever = get_retriever_from_docs(docs)

    logger.info("#############################")
    logger.info("result : %s", result)
    logger.info("retriever : %s", retriever)
    logger.info("#############################")

    return result, retriever