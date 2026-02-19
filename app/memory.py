
import chromadb
from chromadb.config import Settings
import os

client = chromadb.PersistentClient(path="chromadb_storage")
collection = client.get_or_create_collection(name="interview_memory")

def add_memory(user_id: int, interview_id: int, text: str, role: str):
    collection.add(
        documents=[text],
        metadatas=[{"user_id": user_id, "interview_id": interview_id, "role": role}],
        ids=[f"mem_{user_id}_{interview_id}_{role}_{os.urandom(4).hex()}"]
    )

def get_context(user_id: int, interview_id: int):
    results = collection.get(
        where={"$and": [{"user_id": user_id}, {"interview_id": interview_id}]}
    )
    return "\n".join(results["documents"] if results["documents"] else [])
