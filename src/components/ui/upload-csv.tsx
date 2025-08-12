// UploadCsv.tsx
import React, { useState } from "react";
import axios from "axios";

const UploadCsv = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a CSV file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setStatus("Uploading...");
      const response = await axios.post("http://localhost:8000/api/upload-csv", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setStatus(`Success: ${response.data.message}`);
    } catch (error: any) {
      setStatus(`Error: ${error?.response?.data?.error || error.message}`);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">Upload CSV</h2>
      <input type="file" accept=".csv" onChange={handleFileChange} />
      <button
        onClick={handleUpload}
        className="ml-4 bg-blue-600 text-white px-4 py-2 rounded"
      >
        Upload
      </button>
      {status && <p className="mt-2">{status}</p>}
    </div>
  );
};

export default UploadCsv;
