import React, { useState } from "react";
import API from "../api/api";

export default function SearchPanel({ setResults, setSelectedResultId }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    console.log("CLICKED SEARCH");

    if (!query.trim()) return;

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("query", query);

      const res = await API.post("/search/", formData);

      const newItem = res.data;

      setResults((prev) => [newItem, ...prev]);
      setSelectedResultId(newItem._id);

      setQuery(""); // clear input
    } catch (err) {
      console.error(err);
      alert("Search failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border">
      <h3 className="text-lg font-semibold mb-4">Search</h3>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSearch();
        }}
        placeholder="Enter query..."
        className="w-full px-3 py-2 border rounded mb-3"
      />

      <button
        onClick={handleSearch}
        disabled={loading}
        className="w-full py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
      >
        {loading ? "⏳ Thinking... (LLM running)" : "Search"}
      </button>
    </div>
  );
}
