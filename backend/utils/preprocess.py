import os
import pdfplumber
from docx import Document
from PIL import Image, ImageEnhance, ImageFilter
import pytesseract
from moviepy.editor import VideoFileClip
import whisper
import cv2
import tempfile
import numpy as np

# ✅ Tesseract path
pytesseract.pytesseract.tesseract_cmd = r"D:\OCR\tesseract.exe"

# -----------------------------
# Load Whisper model globally
# -----------------------------
WHISPER_MODEL = whisper.load_model("base")
print("Whisper model loaded!")

# ---------------------------------------------------
# Image OCR (optimized)
# ---------------------------------------------------
def preprocess_image_for_ocr(img: Image.Image):
    img = img.convert("L")  # grayscale

    # Resize (improves OCR accuracy)
    img = img.resize((img.width * 2, img.height * 2))

    # Enhance contrast
    img = ImageEnhance.Contrast(img).enhance(2)

    # Sharpen
    img = img.filter(ImageFilter.SHARPEN)

    # Convert to numpy for thresholding
    img_np = np.array(img)
    _, thresh = cv2.threshold(img_np, 150, 255, cv2.THRESH_BINARY)

    return Image.fromarray(thresh)


def extract_text_from_image(file_path):
    try:
        img = Image.open(file_path)
        img = preprocess_image_for_ocr(img)

        text = pytesseract.image_to_string(img)

        return [line.strip() for line in text.split("\n") if line.strip()]

    except Exception as e:
        print(f"Image error ({file_path}): {e}")
        return []

# ---------------------------------------------------
# Video Extraction (optimized)
# ---------------------------------------------------
def extract_text_from_video(file_path):
    text_chunks = []

    # --- Audio transcription ---
    try:
        clip = VideoFileClip(file_path)
        audio_path = os.path.join(tempfile.gettempdir(), "temp_audio.wav")

        clip.audio.write_audiofile(audio_path, logger=None)
        clip.close()

        result = WHISPER_MODEL.transcribe(
            audio_path,
            fp16=False  # safer on CPU
        )

        audio_text = result.get("text", "").strip()
        if audio_text:
            text_chunks.append("Audio Transcript: " + audio_text)

        # cleanup
        if os.path.exists(audio_path):
            os.remove(audio_path)

    except Exception as e:
        print("Whisper error:", e)

    # --- Frame OCR (no disk writes) ---
    try:
        cap = cv2.VideoCapture(file_path)

        fps = cap.get(cv2.CAP_PROP_FPS) or 1
        interval = int(fps * 2)  # every 2 seconds

        frame_count = 0
        frame_id = 0

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            if frame_count % interval == 0:
                # Convert frame to PIL directly
                frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                img = Image.fromarray(frame_rgb)

                img = preprocess_image_for_ocr(img)

                text = pytesseract.image_to_string(img)

                if text.strip():
                    text_chunks.append(f"Frame {frame_id}: {text.strip()}")

                frame_id += 1

            frame_count += 1

        cap.release()

    except Exception as e:
        print("Video OCR error:", e)

    return text_chunks

# ---------------------------------------------------
# Main entry point
# ---------------------------------------------------
def extract_text_from_file(file_path):
    text_chunks = []
    ext = os.path.splitext(file_path)[1].lower()

    try:
        if ext == ".pdf":
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    text = page.extract_text()
                    if text:
                        text_chunks.extend([
                            p.strip() for p in text.split("\n") if p.strip()
                        ])

        elif ext == ".docx":
            doc = Document(file_path)
            for para in doc.paragraphs:
                if para.text.strip():
                    text_chunks.append(para.text.strip())

        elif ext in [".txt", ".csv"]:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                text_chunks = [
                    line.strip() for line in f.readlines() if line.strip()
                ]

        elif ext in [".png", ".jpg", ".jpeg"]:
            text_chunks = extract_text_from_image(file_path)

        elif ext in [".mp4", ".mov", ".mkv", ".avi"]:
            text_chunks = extract_text_from_video(file_path)

        else:
            print(f"Unsupported file type: {ext}")

    except Exception as e:
        print(f"Processing error ({file_path}): {e}")

    return text_chunks