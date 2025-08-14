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
import pandas as pd
import uuid

from pinecone import Pinecone, ServerlessSpec
from langchain_openai import OpenAIEmbeddings
from langchain_pinecone import PineconeVectorStore
from langchain.schema import Document
from openai import OpenAI

# Load environment variables
load_dotenv()

# FastAPI app
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],  # or ["*"] for all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_ENV = os.getenv("PINECONE_ENV")  # e.g., "us-east-1"
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME")

# Initialize Pinecone client
pc = Pinecone(api_key=PINECONE_API_KEY)

# Initialize OpenAI client for reasoning
openai_client = OpenAI(api_key=OPENAI_API_KEY)

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


class SearchRequest(BaseModel):
    text: str

class SearchResult(BaseModel):
    name: str
    description: str
    score: float
    reason: str

@app.post("/api/search-old", response_model=list[SearchResult])
async def search_term(request: SearchRequest):
    response = []
    try:
        result = get_similar_terms(request.text)
        return JSONResponse(content={"message": result})
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

    return response

@app.post("/api/upload-csv-old")
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

def generate_reason(query, doc):
    """Generate explanation for match."""
    prompt = f"""
    The user searched for: "{query}".
    The best match found is: "{doc.metadata.get('Name')}" with description: "{doc.metadata.get('Definition')}".
    Explain briefly why this is a relevant match.
    """
    response = openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=50
    )
    return response.choices[0].message.content.strip()

@app.post("/api/upload-csv")
async def upload_csv(file: UploadFile = File(...)):
    """Upload CSV and store it in Pinecone."""
    try:
        # Read CSV safely
        df = pd.read_csv(file.file, encoding="utf-8")

        # Replace NaN with empty strings for safe JSON serialization
        df = df.fillna("")

        # Ensure 'Key' column exists
        if "Key" not in df.columns:
            df["Key"] = ""

        docs = []
        for _, row in df.iterrows():
            # If Key is empty, generate a UUID
            key_value = row["Key"] if str(row["Key"]).strip() else ""

            # Build content for vector store
            content = f"{row['Name']} - {row['Definition']}"

            # Include Key in metadata
            metadata = {col: row[col] for col in df.columns}
            metadata["Key"] = key_value

            docs.append(Document(page_content=content, metadata=metadata))

        # Push to Pinecone vector store
        vectorstore.add_documents(docs)

        return {
            "status": "success",
            "message": f"{len(docs)} records uploaded to Pinecone",
        }

    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.get("/api/search")
async def search(query: str, top_k: int = 3):
    """Search in Pinecone and return results."""
    docs = vectorstore.similarity_search_with_score(query, k=top_k)

    results = []
    for doc, score in docs:
        reason = generate_reason(query, doc)
        results.append({
            "name": doc.metadata.get("Name", "N/A"),
            "definition": doc.metadata.get("Definition", "N/A"),
            "score": round(score * 100, 2),
            "reason": reason
        })
    return {"results": results}