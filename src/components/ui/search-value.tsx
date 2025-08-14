import React, { useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:8000"; // FastAPI backend URL

interface SearchResult {
  name: string;
  definition: string;
  score: number;
  reason: string;
}

export default function SearchValue() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) {
      alert("Please enter a search term!");
      return;
    }
    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE}/search`, { query });
      setResults(response.data.results || []);
    } catch (error) {
      console.error(error);
      alert("Error searching glossary!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "500px" }}>
      <h2>Search Glossary</h2>
      <input
        type="text"
        placeholder="Enter search term..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button onClick={handleSearch} disabled={loading}>
        {loading ? "Searching..." : "Search"}
      </button>

      {results.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>Results:</h3>
          <ul>
            {results.map((item, idx) => (
              <li key={idx} style={{ marginBottom: "10px" }}>
                <strong>{item.name}</strong> — {item.definition}
                <br />
                <em>Score: {item.score}%</em>
                <br />
                <small>{item.reason}</small>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
