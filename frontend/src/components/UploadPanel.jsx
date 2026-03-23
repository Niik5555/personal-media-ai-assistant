import React, { useState } from "react";
import API from "../api/api";

export default function UploadPanel({ setFiles }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      setUploading(true);

      await API.post("/upload/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setFiles((prev) => [...prev, selectedFile]);
      setSelectedFile(null);

    } catch (err) {
      alert("Upload failed");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border h-full">
      <h3 className="text-lg font-semibold mb-4">Upload File</h3>

      <input
        type="file"
        onChange={handleFileSelect}
        className="block w-full text-sm text-gray-500
        file:mr-4 file:py-2 file:px-5
        file:rounded-full file:border-0
        file:text-sm file:font-semibold
        file:bg-blue-600 file:text-white
        hover:file:bg-blue-700 cursor-pointer"
      />

      {selectedFile && (
        <p className="mt-2 text-sm text-gray-600 truncate">
          {selectedFile.name}
        </p>
      )}

      <button
        onClick={handleUpload}
        disabled={!selectedFile || uploading}
        className={`mt-4 w-full py-2 rounded-full text-white
        ${
          uploading || !selectedFile
            ? "bg-gray-400"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {uploading ? "⏳ Uploading..." : "Upload"}
      </button>
    </div>
  );
}