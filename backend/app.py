from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import os
import uuid

from utils.preprocess import extract_text_from_file
from ollama import chat
from db import documents_col, searches_col

from bson import ObjectId
from bson.errors import InvalidId

# ---------------- CONFIG ----------------
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_TYPES = [
    "text/plain",
    "application/pdf",
    "image/png",
    "image/jpeg",
    "video/mp4",
]

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

# ---------------- APP ----------------
app = FastAPI(title="Personal Document/Media Search Assistant")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- UTILS ----------------
def build_prompt(combined_text: str, query: str) -> str:
    return f"""
You must answer ONLY from the provided documents.
If the answer is not found, say: "Not found in documents."

Documents:
<<<
{combined_text}
>>>

Query:
{query}

Answer:
"""

# ---------------- UPLOAD ----------------
@app.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    content = await file.read()

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large")

    unique_name = f"{uuid.uuid4()}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, unique_name)

    with open(file_path, "wb") as f:
        f.write(content)

    text_chunks = extract_text_from_file(file_path)

    if not text_chunks:
        raise HTTPException(status_code=400, detail="No text extracted")

    documents_col.delete_many({"filename": file.filename})

    documents_col.insert_one({
        "filename": file.filename,
        "stored_filename": unique_name,
        "chunks": text_chunks,
        "uploadedAt": datetime.utcnow()
    })

    return {
        "filename": file.filename,
        "chunks": len(text_chunks)
    }

# ---------------- SEARCH ----------------
@app.post("/search/")
async def search(query: str = Form(...)):
    if not query.strip():
        raise HTTPException(status_code=400, detail="Empty query")

    docs = list(documents_col.find({}, {"_id": 0}))

    if not docs:
        raise HTTPException(status_code=400, detail="No documents uploaded")

    combined_docs = []
    for i, doc in enumerate(docs, start=1):
        chunk_text = "\n".join(doc["chunks"])
        combined_docs.append(
            f"[Document {i}] Filename: {doc['filename']}\n{chunk_text}"
        )

    MAX_CHARS = 12000
    combined_text = ""

    for doc in combined_docs:
        if len(combined_text) + len(doc) > MAX_CHARS:
            break
        combined_text += doc + "\n\n"

    prompt = build_prompt(combined_text, query)

    try:
        response = chat(
            model="deepseek-r1:7b",
            messages=[
                {
                    "role": "system",
                    "content": "You are a strict document-based assistant."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        answer = response.message.content.strip()

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    # ✅ SAVE TO DB
    result = searches_col.insert_one({
        "query": query,
        "answer": answer,
        "createdAt": datetime.utcnow()
    })

    # ✅ RETURN FULL OBJECT (CRITICAL FIX)
    return {
        "_id": str(result.inserted_id),
        "query": query,
        "answer": answer,
        "createdAt": datetime.utcnow().isoformat()
    }

# ---------------- HISTORY ----------------
@app.get("/history/")
def get_history():
    history = list(
        searches_col.find(
            {},
            {"query": 1, "answer": 1, "createdAt": 1}
        ).sort("createdAt", -1)
    )

    # ✅ FIX: Convert ObjectId → string
    for item in history:
        item["_id"] = str(item["_id"])

    return history

# ---------------- DELETE ----------------
@app.delete("/history/{id}")
def delete_history(id: str):
    print("DELETE ID:", id)

    try:
        obj_id = ObjectId(id)
    except InvalidId:
        raise HTTPException(
            status_code=400,
            detail="Invalid ID format"
        )

    result = searches_col.delete_one({"_id": obj_id})

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Item not found"
        )

    return {
        "message": "Deleted successfully",
        "deleted_id": id
    }

# ---------------- UPDATE (EDIT QUERY) ----------------
@app.put("/history/{id}")
async def update_history(id: str, query: str = Form(...)):
    if not query.strip():
        raise HTTPException(status_code=400, detail="Empty query")

    try:
        obj_id = ObjectId(id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid ID format")

    docs = list(documents_col.find({}, {"_id": 0}))

    if not docs:
        raise HTTPException(status_code=400, detail="No documents uploaded")

    combined_docs = []
    for i, doc in enumerate(docs, start=1):
        chunk_text = "\n".join(doc["chunks"])
        combined_docs.append(
            f"[Document {i}] Filename: {doc['filename']}\n{chunk_text}"
        )

    MAX_CHARS = 12000
    combined_text = "\n\n".join(combined_docs)[:MAX_CHARS]

    prompt = build_prompt(combined_text, query)

    try:
        response = chat(
            model="deepseek-r1:7b",
            messages=[
                {"role": "system", "content": "Strict document assistant"},
                {"role": "user", "content": prompt}
            ]
        )

        answer = response.message.content.strip()

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    searches_col.update_one(
        {"_id": obj_id},
        {
            "$set": {
                "query": query,
                "answer": answer,
                "createdAt": datetime.utcnow()
            }
        }
    )

    return {
        "message": "Updated successfully",
        "answer": answer
    }