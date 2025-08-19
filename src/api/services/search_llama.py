import os
from dotenv import load_dotenv
from pinecone import Pinecone
from llama_index.vector_stores.pinecone import PineconeVectorStore
from llama_index.core import StorageContext, VectorStoreIndex
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.core.query_engine import RetrieverQueryEngine

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_ENV = os.getenv("PINECONE_ENV")
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME")

pc = Pinecone(api_key=PINECONE_API_KEY)
index = pc.Index(PINECONE_INDEX_NAME)

# Wrap Pinecone in LlamaIndex
vector_store = PineconeVectorStore(pinecone_index=index)
storage_context = StorageContext.from_defaults(vector_store=vector_store)

embedding_model = OpenAIEmbedding(model="text-embedding-3-large", api_key=OPENAI_API_KEY)

# Load existing index
vector_index = VectorStoreIndex.from_vector_store(
    vector_store, storage_context=storage_context, embed_model=embedding_model
)

# Create retriever
retriever = vector_index.as_retriever(
    similarity_top_k=5,
    # rerank with embeddings → more accuracy
)

# Query engine
query_engine = RetrieverQueryEngine.from_args(retriever)

def semantic_search(query: str):
    response = query_engine.query(query)
    results = []
    for node in response.source_nodes:
        results.append({
            "text": node.text,
            "score": node.score,
            "metadata": node.metadata
        })
    return results


if __name__ == "__main__":
    query = "customer account details"
    res = semantic_search(query)
    for r in res:
        print(f"{r['score']:.3f} | {r['text']} | {r['metadata'].get('Name')}")
