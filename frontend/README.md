# 🧠 AI Document & Media Search Assistant (Offline)

An offline AI-powered system that allows users to upload documents, images, and videos, and extract insights using a local LLM.

---

## 🚀 Features

* 📄 Upload PDFs, DOCX, TXT files
* 🖼️ Extract text from images using OCR
* 🎥 Process videos (audio + frame text)
* 🧠 Ask questions and get AI-generated insights
* 💬 Search history tracking
* 🔒 Fully offline (no external APIs)

---

## 🏗️ Tech Stack

* **Frontend:** React
* **Backend:** FastAPI
* **Database:** MongoDB
* **AI Models:**

  * DeepSeek R1 (via Ollama)
  * Whisper (speech-to-text)
  * Tesseract OCR

---

## ⚙️ How It Works

1. Upload file
2. Extract text (OCR / speech)
3. Store chunks in DB
4. Query → send context to LLM
5. Get AI-generated answer

---

## 🖥️ Demo (UI)

![App Screenshot](./assets/demo.png)

---

## ▶️ Run Locally

### 1. Start Ollama

```bash
ollama run deepseek-r1:7b
```

### 2. Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### 3. Frontend

```bash
cd frontend
npm install
npm start
```

---

## ⚠️ Limitations

* Uses full document context (no semantic search yet)
* Not optimized for large datasets

---

## 🚀 Future Improvements

* Add vector search (FAISS)
* Streaming responses
* Better UI/UX

---

## 👨‍💻 Author

Your Name
