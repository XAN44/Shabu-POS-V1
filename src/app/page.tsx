"use client";
import { useState } from "react";

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (data.success) {
      setUrl(data.data.secure_url);
    }
  };

  return (
    <div className="p-6">
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button
        onClick={handleUpload}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Upload
      </button>

      {url && (
        <div className="mt-4">
          <p>Uploaded:</p>
          <img src={url} alt="Uploaded" className="w-64" />
        </div>
      )}
    </div>
  );
}
