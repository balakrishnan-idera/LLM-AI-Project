import os
import pandas as pd
from uuid import uuid4
from dotenv import load_dotenv
from pinecone import Pinecone, ServerlessSpec
from llama_index.vector_stores.pinecone import PineconeVectorStore
from llama_index.core import Document, StorageContext, VectorStoreIndex
from llama_index.embeddings.openai import OpenAIEmbedding

load_dotenv()

# 🔑 Keys
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_ENV = os.getenv("PINECONE_ENV")
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME")

# Init Pinecone
pc = Pinecone(api_key=PINECONE_API_KEY)

# Create / Reset index
if PINECONE_INDEX_NAME in pc.list_indexes().names():
    pc.delete_index(PINECONE_INDEX_NAME)

pc.create_index(
    name=PINECONE_INDEX_NAME,
    dimension=3072,   # ✅ "text-embedding-3-large" has 3072 dims
    metric="cosine",
    spec=ServerlessSpec(cloud="aws", region=PINECONE_ENV)
)

index = pc.Index(PINECONE_INDEX_NAME)

# Embedding model
embedding_model = OpenAIEmbedding(
    model="text-embedding-3-large", api_key=OPENAI_API_KEY
)

# LlamaIndex wrapper
vector_store = PineconeVectorStore(pinecone_index=index)
storage_context = StorageContext.from_defaults(vector_store=vector_store)


def upsert_from_csv_file(csv_path: str):
    df = pd.read_csv(csv_path)
    docs = []

    for _, row in df.iterrows():
        name = str(row.get("Name", "")).strip()
        if not name:
            continue

        # Use Name + Definition as main text
        content = f"{name} - {row.get('Definition', '')}"

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
            "source": os.path.basename(csv_path)
        }

        docs.append(Document(text=content, metadata=metadata))

    # Build index & insert docs
    VectorStoreIndex.from_documents(
        docs, storage_context=storage_context, embed_model=embedding_model
    )

    return f"Upserted {len(docs)} records from {csv_path}"


if __name__ == "__main__":
    print(upsert_from_csv_file("your_data.csv"))
