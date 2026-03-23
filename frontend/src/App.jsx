import { useState, useEffect } from "react";
import UploadPanel from "./components/UploadPanel";
import SearchPanel from "./components/SearchPanel";
import ResultsPanel from "./components/ResultsPanel";
import PreviewModal from "./components/PreviewModal";
import API from "./api/api";

function App() {
  const [files, setFiles] = useState([]);
  const [results, setResults] = useState([]);
  const [selectedResultId, setSelectedResultId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileType, setFileType] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ LOAD HISTORY (CLEAN INVALID IDS)
  useEffect(() => {
    API.get("/history/")
      .then((res) => {
        const cleanData = (res.data || []).filter(
          (item) =>
            typeof item._id === "string" && item._id.length > 10
        );

        setResults(cleanData);
      })
      .catch((err) => {
        console.error("Failed to load history", err);
      });
  }, []);

  useEffect(() => {
    if (results.length > 0) {
      setSelectedResultId(results[0]._id);
    }
  }, [results]);

  const handlePreview = (file, type) => {
    setSelectedFile(file);
    setFileType(type);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        AI Document & Media Search Assistant
      </h1>

      <div className="max-w-6xl mx-auto space-y-6 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UploadPanel setFiles={setFiles} />
          <SearchPanel
            setResults={setResults}
            setSelectedResultId={setSelectedResultId}
            loading={loading}
            setLoading={setLoading}
          />
        </div>

        <ResultsPanel
          results={results}
          selectedResultId={selectedResultId}
          setSelectedResultId={setSelectedResultId}
          setResults={setResults}
        />
      </div>

      {selectedFile && (
        <PreviewModal
          file={selectedFile}
          type={fileType}
          onClose={() => setSelectedFile(null)}
        />
      )}
    </div>
  );
}

export default App;