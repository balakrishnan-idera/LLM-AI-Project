from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Body, Query
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from services.upsert_from_csv import upsert_from_csv_file
from services.vector_engine import get_similar_terms
from services.fetch_data import delete_vector_by_id, get_all_vectors, get_vector_by_id
import shutil
from pydantic import BaseModel
from dotenv import load_dotenv
import os
import pandas as pd
from uuid import uuid4

from pinecone import Pinecone, ServerlessSpec
from langchain_openai import OpenAIEmbeddings
from langchain_pinecone import PineconeVectorStore
from langchain.schema import Document
from openai import OpenAI
from sentence_transformers import SentenceTransformer
from typing import Optional, List, Dict, Any

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

embedding_model = SentenceTransformer("BAAI/bge-large-en-v1.5")

# 📌 Embedding model: llama-text-embed-v2
# embedding_model = HuggingFaceEmbedding(model_name="meta-llama/Llama-2-7b-hf")

class SearchRequest(BaseModel):
    query: str

class SearchResult(BaseModel):
    name: str
    definition: str
    score: float
    reason: str

class VectorRequest(BaseModel):
    namespace: str = ""
    limit: int = 100
    pagination_token: str | None = None
    
class VectorsRequest(BaseModel):
    namespace: str = ""
    limit: int = 100
    cursor: str = None  # for pagination

def generate_reason(user_query: str, metadata: dict) -> str:
    reasoning_prompt = f"""
    The user searched for: "{user_query}".
    Candidate match:
    - Name: {metadata.get("Name", "")}
    - Definition: {metadata.get("Definition", "")}
    - Aliases: {metadata.get("Aliases", "")}

    Explain briefly in one or two sentences why this result is relevant to the query.
    """
    try:
        reasoning_response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": reasoning_prompt}],
            max_tokens=60,
            temperature=0.7,
        )
        content = reasoning_response.choices[0].message.content
        return content.strip() if content else "Reason unavailable"
    except Exception as e:
        print(f"OpenAI reasoning error: {e}")
        return "Reason unavailable"

# def generate_reason(query, doc):
#     """Generate explanation for match."""
#     prompt = f"""
#     The user searched for: "{query}".
#     The best match found is: "{doc.metadata.get('Name')}" with description: "{doc.metadata.get('Definition')}".
#     Explain briefly why this is a relevant match.
#     """
#     response = openai_client.chat.completions.create(
#         model="gpt-4o-mini",
#         messages=[{"role": "user", "content": prompt}],
#         max_tokens=50
#     )
#     return response.choices[0].message.content.strip()

# @app.post("/api/search-old", response_model=list[SearchResult])
# async def search_term(request: SearchRequest):
#     response = []
#     try:
#         result = get_similar_terms(request.query)
#         return JSONResponse(content={"message": result})
#     except Exception as e:
#         return JSONResponse(content={"error": str(e)}, status_code=500)

#     return response

# @app.post("/api/upload-csv-old")
# async def upload_csv(file: UploadFile = File(...)):
#     temp_dir = "uploads"
#     os.makedirs(temp_dir, exist_ok=True)
#     temp_file_path = os.path.join(temp_dir, file.filename)

#     with open(temp_file_path, "wb") as buffer:
#         shutil.copyfileobj(file.file, buffer)

#     try:
#         result = upsert_from_csv_file(temp_file_path)
#         return JSONResponse(content={"message": result})
#     except Exception as e:
#         return JSONResponse(content={"error": str(e)}, status_code=500)
#     finally:
#         os.remove(temp_file_path)


# @app.get("/api/term-relation")
# async def fetch_Term_relation():
#     result = [];
#     return result;

# @app.get("/api/term-relation")
# async def fetch_Term_relation():
#     result = [];
#     return result;

# @app.post("/api/upload-csv-1")
# async def upload_csv(file: UploadFile = File(...)):
#     """Upload CSV and store it in Pinecone."""
#     try:
#         # Read CSV safely
#         df = pd.read_csv(file.file, encoding="utf-8")

#         # Replace NaN with empty strings for safe JSON serialization
#         df = df.fillna("")

#         # Ensure 'Key' column exists
#         if "Key" not in df.columns:
#             df["Key"] = ""

#         docs = []
#         for _, row in df.iterrows():
#             # If Key is empty, generate a UUID
#             key_value = row["Key"] if str(row["Key"]).strip() else ""

#             # Build content for vector store
#             content = f"{row['Name']} - {row['Definition']}"

#             # Include Key in metadata
#             metadata = {col: row[col] for col in df.columns}
#             metadata["Key"] = key_value

#             docs.append(Document(page_content=content, metadata=metadata))

#         # Push to Pinecone vector store
#         vectorstore.add_documents(docs)

#         return {
#             "status": "success",
#             "message": f"{len(docs)} records uploaded to Pinecone",
#         }

#     except Exception as e:
#         return {"status": "error", "message": str(e)}


# @app.get("/api/search-1")
# async def search(query: str, top_k: int = 3):
#     """Search in Pinecone and return results."""
#     docs = vectorstore.similarity_search_with_score(query, k=top_k)

#     results = []
#     for doc, score in docs:
#         reason = generate_reason(query, doc)
#         results.append({
#             "name": doc.metadata.get("Name", "N/A"),
#             "definition": doc.metadata.get("Definition", "N/A"),
#             "score": round(score * 100, 2),
#             "reason": reason
#         })
#     return {"results": results}

# @app.get("/api/fetch-term")
# async def fetch_term_data():
#     try:
#         results = get_all_vectors()
#         return {"results": results}
#     except Exception as e:
#         # Log the error for debugging
#         print(f"Error fetching term data: {str(e)}")
#         raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
    
# @app.get("/api/fetch-term/{vector_id}")
# async def fetch_term_data(vector_id: str):
#     try:
#         results = get_vector_by_id(vector_id=vector_id, namespace="default")
#         return {"results": results}
#     except Exception as e:
#         print(f"Endpoint error: {str(e)}")
#         raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")


# @app.delete("/api/delete-term/{vector_id}")
# async def delete_term(vector_id: str):
#     try:
#         result = delete_vector_by_id(vector_id=vector_id, namespace="default")
#         return JSONResponse(content=result)
#     except HTTPException as he:
#         raise he
#     except Exception as e:
#         print(f"Error deleting term: {str(e)}")
#         raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
    
# ------------------------------- llama endpoints ------------------------

class FetchRequest(BaseModel):
    limit: int = 100

@app.post("/api/upload-csv")
async def upload_csv(file: UploadFile):
    try:
        df = pd.read_csv(file.file)

        if "Name" not in df.columns:
            return {"error": "CSV must contain a 'Name' column."}

        vectors = []
        for _, row in df.iterrows():
            name = str(row.get("Name", "")).strip()
            if not name:
                continue
            vector = embedding_model.encode(name).tolist()
            metadata = {col: str(row.get(col, "")).strip() for col in df.columns}
            metadata["source"] = file.filename

            vectors.append({
                "id": str(uuid4()),
                "values": vector,
                "metadata": metadata
            })

        for i in range(0, len(vectors), 100):
            index.upsert(vectors=vectors[i:i+100])

        return {"message": f"Upserted {len(vectors)} records from {file.filename}"}

    except Exception as e:
        import traceback
        traceback.print_exc()
        print(str(e));
        return {"error": str(e)}

@app.post("/api/search")
async def search(request: SearchRequest):
    try:
        query_vector = embedding_model.encode(request.query).tolist()
        results = index.query(vector=query_vector, top_k=6, include_metadata=True)
        
        response = []
        for match in results.matches:
            metadata = match.metadata or {}
            
            name = metadata.get("Name", "")
            aliases = metadata.get("Aliases", "")
            definition = metadata.get("Definition", "")

            # 🚫 skip if exact duplicate of query
            if request.query.strip().lower() in [
                name.strip().lower(),
                aliases.strip().lower(),
                definition.strip().lower()
            ]:
                continue

            response.append({
                "id": match.id,
                "score": match.score,
                "name": metadata.get("Name", ""),
                "definition": metadata.get("Definition", ""),
                "aliases": metadata.get("Aliases", ""),
                "reason": generate_reason(request.query, metadata)
            })
        return {"results": response}

    except Exception as e:
        # Debug log for your console
        print(f"Error in /api/search: {e}")
        # Return 500 with details
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/vectors")
async def get_vectors(limit: int = 100):
    try:
        # use a zero-vector to pull top-K items
        zero_vector = [0.0] * 1024  # dimension = 1024
        query_response = index.query(
            vector=zero_vector,
            top_k=limit,
            include_metadata=True
        )

        response = []
        for match in query_response.matches:
            metadata = match.metadata or {}
            response.append({
                "id": match.id,
                "score": match.score,
                "name": metadata.get("Name", ""),
                "definition": metadata.get("Definition", ""),
                "aliases": metadata.get("Aliases", ""),
                "parentGlossary": metadata.get("ParentGlossary", ""),
                "stewards": metadata.get("Stewards", ""),
                "termEntityType": metadata.get("TermEntityType", ""),
                "source": metadata.get("source", "")
            })

        return {"results": response}

    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"error": str(e)}

@app.get("/api/vectors/{vector_id}")
async def get_vector_by_id(vector_id: str):
    try:
        fetch_response = index.fetch(ids=[vector_id])

        if not fetch_response.vectors:
            return {"error": f"No vector found with ID {vector_id}"}

        vec = fetch_response.vectors[vector_id]
        metadata = vec.metadata or {}

        return {
            "id": vec.id,
            "name": metadata.get("Name", ""),
            "definition": metadata.get("Definition", ""),
            "aliases": metadata.get("Aliases", ""),
            "parentGlossary": metadata.get("ParentGlossary", ""),
            "stewards": metadata.get("Stewards", ""),
            "termEntityType": metadata.get("TermEntityType", ""),
            "source": metadata.get("source", "")
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"error": str(e)}

@app.delete("/api/vectors/delete/{vector_id}")
def delete_vector(vector_id: str):
    """
    Delete vectors from Pinecone.
    - Provide `ids` to delete specific vectors
    - Set `delete_all=True` to wipe all vectors (optionally by namespace)
    """
    try:
        index.delete(ids=vector_id)
        return {"status": "success", "message": f"Deleted {len(vector_id)}"}
    except Exception as e:
        return {"error": str(e)}

