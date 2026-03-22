# Personal Media Search AI Assistant

**AI-powered tool to search and analyze your personal documents, images, and videos.** Upload files, query them, and get structured insights in real time.

---

## Features

- Upload PDFs, DOCX, TXT/CSV, images (PNG/JPG), and videos (MP4)  
- Extract text from documents, OCR for images/videos, and audio transcription  
- Query uploaded content via AI (LLM)  
- View search history, edit queries, and delete entries  
- Preview uploaded files (PDFs, images, videos)  
- Render answers with tables, highlights, and structured insights  

---

## Prerequisites
- Python 3.x installed  
- Required dependencies (listed in `requirements.txt`)  
- Git (optional, for cloning the repo)  

---

## Installation / Setup

### 1. Start MongoDB
```bash
# Linux/macOS
sudo service mongod start
# Windows
net start MongoDB
2. Start Backend (Python/FastAPI)
# Navigate to backend folder
cd backend

# Activate virtual environment (if using .venv)
# Linux/macOS
source .venv/bin/activate
# Windows (PowerShell)
.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Start backend
uvicorn app:app --host 127.0.0.1 --port 8000 --reload
3. Start Frontend (React)
cd frontend
npm install
npm start   # Runs on http://localhost:3000
4. Access Application
Frontend: http://localhost:3000
Backend API: http://127.0.0.1:8000
MongoDB runs on default: mongodb://localhost:27017
