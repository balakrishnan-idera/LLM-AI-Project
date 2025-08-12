# upsert_from_csv.py

import os
import pandas as pd
from uuid import uuid4
from dotenv import load_dotenv
from pinecone import Pinecone, ServerlessSpec
from langchain_openai import OpenAIEmbeddings

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_ENV = os.getenv("PINECONE_ENV")
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME")

embedding = OpenAIEmbeddings(model="text-embedding-3-small", openai_api_key=OPENAI_API_KEY)
pc = Pinecone(api_key=PINECONE_API_KEY)

def upsert_from_csv_file(csv_path: str):
    if PINECONE_INDEX_NAME in pc.list_indexes().names():
        pc.delete_index(PINECONE_INDEX_NAME)

    pc.create_index(
        name=PINECONE_INDEX_NAME,
        dimension=1536,
        metric="cosine",
        spec=ServerlessSpec(cloud="aws", region=PINECONE_ENV)
    )

    index = pc.Index(PINECONE_INDEX_NAME)
    df = pd.read_csv(csv_path)
    vectors = []

    for _, row in df.iterrows():
        name = str(row.get("Name", "")).strip()
        if not name:
            continue

        vector = embedding.embed_query(name)
        metadata = {
            "Key": str(row.get("Key", "")).strip(),
            "Name": name,
            "Status": str(row.get("Status", "")).strip(),
            "Definition": str(row.get("Definition", "")).strip(),
            "Abbreviations": str(row.get("Abbreviations", "")).strip(),
            "Aliases": str(row.get("Aliases", "")).strip(),
            "AdditionalNotes": str(row.get("AdditionalNotes", "")).strip(),
            "Stewards": str(row.get("Stewards", "")).strip(),
            "RelatedGlossaries": str(row.get("RelatedGlossaries", "")).strip(),
            "TermEntityType": str(row.get("TermEntityType", "")).strip(),
            "ParentGlossary": str(row.get("ParentGlossary", "")).strip(),
            "text": name,
            "source": os.path.basename(csv_path)
        }

        vectors.append({
            "id": str(uuid4()),
            "values": vector,
            "metadata": metadata
        })

    for i in range(0, len(vectors), 100):
        index.upsert(vectors=vectors[i:i+100], namespace="default")

    return f"Upserted {len(vectors)} records from {csv_path}"
