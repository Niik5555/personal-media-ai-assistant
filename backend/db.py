from pymongo import MongoClient

client = MongoClient(
    "mongodb://localhost:27017",
    serverSelectionTimeoutMS=5000
)

db = client["personal_media_search"]

documents_col = db["documents"]
searches_col = db["search_history"]

# ✅ Indexes for performance
documents_col.create_index("filename")
searches_col.create_index("createdAt")