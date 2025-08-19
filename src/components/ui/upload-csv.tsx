import React, { useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:8000"; // FastAPI backend URL

function UploadCsv() {
  const [file, setFile] = useState(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const handleUpload = async () => {
    if (!file) {
        alert("Please select a CSV file first.");
        return;
    }
    const formData = new FormData();
    formData.append("file", file);

    try {
        const res = await axios.post(`${API_BASE}/api/upload-csv`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        });
        alert(res.data.message || res.data.error);
    } catch (err) {
        console.error(err);
        alert("Upload failed. Check backend logs.");
    }
    };

  const handleSearch = async () => {
    const formData = new FormData();
    formData.append("query", query);
    const res = await axios.post(`${API_BASE}/api/search`, formData);
    setResults(res.data.results);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Upload CSV</h2>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>Upload</button>

      {/* <h2 style={{ marginTop: "30px" }}>🔍 Semantic Search</h2>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter search term..."
      />
      <button onClick={handleSearch}>Search</button>

      <h3>Results:</h3>
      <ul>
        {results.map((r, i) => (
          <li key={i}>
            <b>{r.Name}</b> (score: {r.score.toFixed(3)})<br />
            {r.Definition} <br />
            <i>{r.Aliases}</i>
          </li>
        ))}
      </ul> */}
    </div>
  );
}

export default UploadCsv;
