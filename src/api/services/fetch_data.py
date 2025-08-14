# fetch_data.py

from fastapi import FastAPI, HTTPException
from pinecone import Pinecone
from dotenv import load_dotenv
import os
from contextlib import asynccontextmanager

# Load .env variables
load_dotenv()

# Initialize Pinecone
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index_name = os.getenv("PINECONE_INDEX_NAME")
index = pc.Index(index_name)

# Lifespan for startup and shutdown
@asynccontextmanager
async def lifespan(app: FastAPI):
    print(f"Starting FastAPI app, connected to Pinecone index: {index_name}")
    try:
        stats = index.describe_index_stats()
        print(f"Index stats (check namespaces and vector count): {stats}")
        yield
    except Exception as e:
        print(f"Error during startup: {str(e)}")
    finally:
        print("Shutting down FastAPI app...")
        # Clean up resources if necessary
        # For Pinecone, no explicit cleanup is needed as the client is stateless
        # Add any other cleanup logic here if needed

app = FastAPI(lifespan=lifespan)

def get_all_vectors(limit=100, namespace="default"):
    all_data = []
    try:
        print(f"Fetching from index: {index_name}, namespace: {namespace}, limit per page: {limit}")
        for page in index.list(limit=limit, namespace=namespace):
            ids = page
            print(f"Page retrieved {len(ids)} IDs: {ids[:5]}...")
            if ids:
                fetch_resp = index.fetch(ids=ids, namespace=namespace)
                print(f"Fetched {len(fetch_resp.vectors)} vectors")
                for vid, vec in fetch_resp.vectors.items():
                    metadata = vec.metadata if vec.metadata else {}
                    all_data.append({
                        "id": vid,
                        "name": metadata.get("Name", ""),
                        "definition": metadata.get("Definition", ""),
                        "abbreviations": metadata.get("Abbreviations", ""),
                        "additional_notes": metadata.get("AdditionalNotes", ""),
                        "aliases": metadata.get("Aliases", ""),
                        "key": metadata.get("Key", ""),
                        "parent_glossary": metadata.get("ParentGlossary", ""),
                        "related_glossaries": metadata.get("RelatedGlossaries", ""),
                        "status": metadata.get("Status", ""),
                        "stewards": metadata.get("Stewards", ""),
                        "term_entity_type": metadata.get("TermEntityType", ""),
                        "text": metadata.get("text", "")
                    })
                    if len(all_data) == 100:
                        return all_data
        print(f"Total items retrieved: {len(all_data)}")
        if len(all_data) == 0:
            print("Warning: No vectors retrieved. Check namespace and data in Pinecone UI.")
    except Exception as e:
        print(f"Error fetching vectors: {str(e)}")
        raise
    return all_data

def get_vector_by_id(vector_id: str, namespace="default"):
    all_data = []
    try:
        print(f"Fetching vector ID: {vector_id} from index: {index_name}, namespace: {namespace}")
        fetch_resp = index.fetch(ids=[vector_id], namespace=namespace)
        print(f"Fetched {len(fetch_resp.vectors)} vectors")
        for vid, vec in fetch_resp.vectors.items():
            metadata = vec.metadata if vec.metadata else {}
            all_data.append({
                "id": vid,
                "name": metadata.get("Name", ""),
                "definition": metadata.get("Definition", ""),
                "abbreviations": metadata.get("Abbreviations", ""),
                "additional_notes": metadata.get("AdditionalNotes", ""),
                "aliases": metadata.get("Aliases", ""),
                "key": metadata.get("Key", ""),
                "parent_glossary": metadata.get("ParentGlossary", ""),
                "related_glossaries": metadata.get("RelatedGlossaries", ""),
                "status": metadata.get("Status", ""),
                "stewards": metadata.get("Stewards", ""),
                "term_entity_type": metadata.get("TermEntityType", ""),
                "text": metadata.get("text", "")
            })
        print(f"Total items retrieved: {len(all_data)}")
        if len(all_data) == 0:
            print(f"Warning: No vector found for ID {vector_id}. Check ID and namespace in Pinecone UI.")
    except Exception as e:
        print(f"Error fetching vector: {str(e)}")
        raise
    return all_data

def delete_vector_by_id(vector_id: str, namespace="default"):
    try:
        print(f"Deleting vector ID: {vector_id} from index: {index_name}, namespace: {namespace}")
        # Check if the vector exists
        fetch_resp = index.fetch(ids=[vector_id], namespace=namespace)
        if not fetch_resp.vectors:
            print(f"Vector ID {vector_id} not found in namespace {namespace}")
            raise HTTPException(status_code=404, detail=f"Vector with ID {vector_id} not found")
        
        # Delete the vector
        index.delete(ids=[vector_id], namespace=namespace)
        print(f"Successfully deleted vector ID: {vector_id}")
        return {"status": "success", "message": f"Vector with ID {vector_id} deleted"}
    except Exception as e: 
        print(f"Error deleting vector: {str(e)}")
        raise