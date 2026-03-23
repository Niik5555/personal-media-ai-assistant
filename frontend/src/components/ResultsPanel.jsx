import { useState, useEffect } from "react";
import API from "../api/api";
import ConfirmDialog from "./ConfirmDialog";
import { FiTrash2, FiEdit } from "react-icons/fi";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ResultsPanel({
  results,
  selectedResultId,
  setSelectedResultId,
  setResults,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [editedQuery, setEditedQuery] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const selected = results.find((r) => r._id === selectedResultId);

  useEffect(() => {
    if (selected) {
      setEditedQuery(selected.query);
      setIsEditing(false);
    }
  }, [selected]);

  // ---------------- DELETE ----------------
  const confirmDelete = async () => {
    if (!deleteTarget?._id) return;

    try {
      await API.delete(`/history/${deleteTarget._id}`);

      const updated = results.filter(
        (r) => r._id !== deleteTarget._id
      );

      setResults(updated);
      setDeleteTarget(null);

      if (updated.length > 0) {
        setSelectedResultId(updated[0]._id);
      } else {
        setSelectedResultId(null);
      }
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  // ---------------- EDIT + RESEARCH ----------------
  const handleResearch = async () => {
    if (!editedQuery.trim()) return;

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("query", editedQuery);

      const res = await API.put(
        `/history/${selected._id}`,
        formData
      );

      const updatedItem = {
        ...selected,
        query: editedQuery,
        answer: res.data.answer,
        createdAt: new Date().toISOString(),
      };

      const updatedList = results.map((r) =>
        r._id === selected._id ? updatedItem : r
      );

      setResults(updatedList);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert("Search failed");
    } finally {
      setLoading(false);
    }
  };

  if (!results || results.length === 0) return null;

  return (
    <>
      {/* DELETE CONFIRM MODAL */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <div className="mt-6 flex max-w-6xl mx-auto h-[500px] border rounded-2xl shadow-lg overflow-hidden">

        {/* ---------------- SIDEBAR ---------------- */}
        <div
          className={`bg-gray-50 border-r flex flex-col transition-all duration-300
          ${sidebarOpen ? "w-64" : "w-12"}`}
        >
          {/* HEADER */}
          <div className="flex justify-between items-center p-3 border-b">
            {sidebarOpen && (
              <h4 className="font-semibold text-gray-700">History</h4>
            )}

            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-xs text-blue-600 px-2 py-1 border rounded hover:bg-blue-50"
            >
              {sidebarOpen ? "<" : ">"}
            </button>
          </div>

          {/* LIST */}
          <div
            className={`flex-1 overflow-y-auto p-2 space-y-1 transition-opacity
            ${sidebarOpen ? "opacity-100" : "opacity-0"}`}
          >
            {results.map((r) => (
              <div
                key={r._id}
                className={`flex justify-between items-center p-2 rounded text-sm
                ${
                  r._id === selectedResultId
                    ? "bg-blue-100 text-blue-800"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                <span
                  onClick={() => setSelectedResultId(r._id)}
                  className="flex-1 cursor-pointer truncate"
                >
                  {r.query}
                </span>

                {/* DELETE ICON */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTarget(r);
                  }}
                  className="text-red-500 ml-2 hover:text-red-700"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ---------------- RIGHT PANEL ---------------- */}
        <div className="flex-1 bg-gray-50 p-6 overflow-auto">

          {selected ? (
            <div className="bg-white rounded-2xl shadow-md p-5 h-full flex flex-col">

              {/* HEADER */}
              <div className="flex items-center justify-between mb-4 border-b pb-3">
                {!isEditing ? (
                  <>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {selected.query}
                    </h3>

                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FiEdit size={18} />
                    </button>
                  </>
                ) : (
                  <div className="w-full">
                    <input
                      value={editedQuery}
                      onChange={(e) => setEditedQuery(e.target.value)}
                      className="w-full border px-3 py-2 rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />

                    <div className="flex gap-2">
                      <button
                        onClick={handleResearch}
                        disabled={loading}
                        className="px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                      >
                        {loading ? "⏳ Searching..." : "Search Again"}
                      </button>

                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-1.5 border rounded-md hover:bg-gray-100"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* RESPONSE */}
              <div className="flex-1 overflow-auto pr-2">
                <div className="prose prose-sm max-w-none text-gray-700">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {selected.answer}
                  </ReactMarkdown>
                </div>
              </div>

            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 italic">
              Select a query from history
            </div>
          )}

        </div>
      </div>
    </>
  );
}