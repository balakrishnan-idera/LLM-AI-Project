import os
from dotenv import load_dotenv
# from langchain.embeddings import OpenAIEmbeddings
from pinecone import Pinecone, ServerlessSpec
from openai import OpenAI

load_dotenv()

# === Step 1: Initialize API Keys ===
# Load environment variables
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_ENV = os.getenv("PINECONE_ENVIRONMENT")
INDEX_NAME = os.getenv("PINECONE_INDEX_NAME")

# === Step 2: Initialize OpenAI client ===
openai_client = OpenAI(api_key=OPENAI_API_KEY)

# === Step 3: Initialize Pinecone client ===
pc = Pinecone(api_key=PINECONE_API_KEY)
index = pc.Index(INDEX_NAME)

# === Step 4: Generate Embeddings and Upsert ===
def get_embedding(text):
    response = openai_client.embeddings.create(
        model="text-embedding-3-small",
        input=text
    )
    return response.data[0].embedding

def generate_reason(query, match):
    prompt = f"""
    The user searched for: "{query}".
    The best match found is: "{match['metadata'].get('Name')}" with description: "{match['metadata'].get('Definition')}".
    Explain briefly why this is a relevant match.
    """
    response = openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=50
    )
    return response.choices[0].message.content.strip()
    
# === Step 5: Query by semantic search ===
def semantic_search(query, top_k=2):
    query_embedding = get_embedding(query)
    results = index.query(vector=query_embedding, top_k=top_k, include_metadata=True)

    formatted_results = []
    for match in results.matches:
        name = match.metadata.get("Name", "N/A")
        definition = match.metadata.get("Definition", "N/A")
        score = match.score
        reason = generate_reason(query, match)
        formatted_results.append({
            "name": name,
            "definition": definition,
            "score": round(round(score, 3) * 100),
            "reason": reason
        })
    return formatted_results

def get_similar_terms(query: str, k: int = 5):
    results = semantic_search(query)
    return {"results": results}
