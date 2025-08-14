import React, { useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:8000"; // FastAPI backend URL

export default function UploadCsv() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a CSV file first!");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE}/api/upload-csv`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert(response.data.message || "File uploaded successfully!");
    } catch (error) {
      console.error(error);
      alert("Error uploading file!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "500px" }}>
      <h2>Upload CSV</h2>
      <input type="file" accept=".csv" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Uploading..." : "Upload CSV"}
      </button>
    </div>
  );
}
