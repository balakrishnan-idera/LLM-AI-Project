
from fastapi import FastAPI
from pinecone import Pinecone
import os

pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index = pc.Index(os.getenv("PINECONE_INDEX_NAME"))

app = FastAPI()

def get_all_vectors(limit=100):
    all_data = []
    cursor = None
    while True:
        # Paginated listing of IDs
        response = index.list_paginated(limit=limit, cursor=cursor)
        ids = [v.id for v in response.vectors]

        if ids:
            # Fetch metadata for these IDs
            fetch_resp = index.fetch(ids=ids)
            for vid, vec in fetch_resp.vectors.items():
                all_data.append({
                    "id": vid,
                    "name": vec.metadata.get("Name", "N/A"),
                    "definition": vec.metadata.get("Definition", "N/A")
                })
        
        print("response.cursor", response.cursor)
        cursor = response.cursor
        if not cursor:  # No more pages
            break

    print("all_data", all_data)
    return all_data