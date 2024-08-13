import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    OPENAI_COMPLETIONS_ENGINE = os.getenv("OPENAI_COMPLETIONS_ENGINE", "gpt-4-0125-preview")
    OPENAI_EMBEDDINGS_MODEL = os.getenv("OPENAI_EMBEDDINGS_MODEL", "text-embedding-3-large")
    AZURE_OPENAI_API_TYPE = "azure"
    AZURE_OPENAI_API_ENDPOINT = os.getenv("AZURE_OPENAI_API_ENDPOINT")
    AZURE_OPENAI_API_KEY = os.getenv("AZURE_OPENAI_API_KEY")
    AZURE_OPENAI_MODEL_NAME = os.getenv("AZURE_OPENAI_MODEL_NAME")
    AZURE_OPENAI_DEPLOYMENT_NAME = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME")
    AZURE_OPENAI_API_VERSION = os.getenv("AZURE_OPENAI_API_VERSION", "2024-02-15-preview")
    AZURE_OPENAI_EMBEDDINGS_DEPLOYMENT_NAME = os.getenv("AZURE_OPENAI_EMBEDDINGS_DEPLOYMENT_NAME")
    AZURE_OPENAI_EMBEDDINGS_MODEL_NAME = os.getenv("AZURE_OPENAI_EMBEDDINGS_MODEL_NAME")
    MY_SQL_HOST = os.getenv("mysql_host")
    MY_SQL_USER = os.getenv("mysql_user")
    MY_SQL_PASSWORD = os.getenv("mysql_password")
    MY_SQL_DB = os.getenv("mysql_db")
    BING_SEARCH_API_KEY = os.getenv('BING_SEARCH_API_KEY')
    BING_SEARCH_ENDPOINT = os.getenv('BING_SEARCH_ENDPOINT')