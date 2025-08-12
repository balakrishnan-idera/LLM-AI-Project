from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from services.upsert_from_csv import upsert_from_csv_file
from services.vector_engine import get_similar_terms
from services.fetch_data import get_all_vectors
import shutil
from pydantic import BaseModel
from dotenv import load_dotenv
import os

from pinecone import Pinecone, ServerlessSpec
from langchain_openai import OpenAIEmbeddings
from langchain_pinecone import PineconeVectorStore

# Load environment variables
load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_ENV = os.getenv("PINECONE_ENV")  # e.g., "us-east-1"
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME")

# Initialize Pinecone client
pc = Pinecone(api_key=PINECONE_API_KEY)

# Create index if it doesn't exist
if not pc.list_indexes().names().__contains__(PINECONE_INDEX_NAME):
    pc.create_index(
        name=PINECONE_INDEX_NAME,
        dimension=1536,
        metric="cosine",
        spec=ServerlessSpec(cloud="aws", region=PINECONE_ENV)
    )

# Connect to index
index = pc.Index(PINECONE_INDEX_NAME)

# Initialize LangChain components
embedding = OpenAIEmbeddings(model="text-embedding-3-small", openai_api_key=OPENAI_API_KEY)
vectorstore = PineconeVectorStore(index=index, embedding=embedding, namespace="default")

# FastAPI app
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],  # or ["*"] for all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SearchRequest(BaseModel):
    text: str

class SearchResult(BaseModel):
    name: str
    description: str
    score: float
    reason: str

@app.post("/api/search", response_model=list[SearchResult])
async def search_term(request: SearchRequest):
    response = []
    try:
        result = get_similar_terms(request.text)
        return JSONResponse(content={"message": result})
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

    return response

@app.post("/api/upload-csv")
async def upload_csv(file: UploadFile = File(...)):
    temp_dir = "uploads"
    os.makedirs(temp_dir, exist_ok=True)
    temp_file_path = os.path.join(temp_dir, file.filename)

    with open(temp_file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        result = upsert_from_csv_file(temp_file_path)
        return JSONResponse(content={"message": result})
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)
    finally:
        os.remove(temp_file_path)

@app.get("/api/fetch-term")
async def fetch_Term_data():
    print("API Started!")
    return {"results": get_all_vectors()}

@app.get("/api/term-relation")
async def fetch_Term_relation():
    result = [];
    return result;

@app.get("/api/term-relation")
async def fetch_Term_relation():
    result = [];
    return result;