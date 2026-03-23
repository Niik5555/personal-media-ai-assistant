import React, { useEffect, useMemo } from "react";
import ReactPlayer from "react-player";
import { Document, Page } from "react-pdf";

export default function PreviewModal({ file, type, onClose }) {
  const fileURL = useMemo(() => URL.createObjectURL(file), [file]);

  useEffect(() => {
    return () => URL.revokeObjectURL(fileURL);
  }, [fileURL]);

  if (!file) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-2xl max-w-3xl w-full relative">
        
        <button onClick={onClose} className="absolute top-2 right-2">✕</button>

        <h2 className="mb-4">{file.name}</h2>

        {type === "pdf" && (
          <Document file={file}>
            <Page pageNumber={1} />
          </Document>
        )}

        {type === "image" && (
          <img src={fileURL} alt="" className="max-h-[70vh]" />
        )}

        {type === "video" && (
          <ReactPlayer url={fileURL} controls width="100%" />
        )}
      </div>
    </div>
  );
}