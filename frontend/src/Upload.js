import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle } from 'lucide-react';
import { uploadCSV } from './api';

function Upload({ setColumns, setResults, setFixedResults, setExplanation, setError, setMetadata }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const res = await uploadCSV(file);
      setColumns(res.data.columns);
      setMetadata(res.data.metadata || {});
      setResults(null);
      setFixedResults(null);
      setExplanation('');
    } catch (err) {
      setError('Upload failed: ' + (err.response?.data?.detail || err.message));
    }
    setUploading(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith('.csv')) {
      setFile(droppedFile);
    } else {
      setError('Please upload a CSV file.');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <UploadCloud size={20} className="text-indigo-600" /> Upload Dataset
      </h3>

      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
          dragOver ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 bg-gray-50'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <FileText size={40} className="mx-auto text-gray-400 mb-3" />
        <p className="text-gray-600 mb-2">Drag and drop your CSV file here, or click to browse</p>
        <input
          type="file"
          accept=".csv"
          onChange={(e) => { setFile(e.target.files[0]); setError(''); }}
          className="hidden"
          id="csv-upload"
        />
        <label
          htmlFor="csv-upload"
          className="inline-block bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 cursor-pointer font-medium transition"
        >
          Choose File
        </label>
        {file && (
          <div className="mt-3 flex items-center justify-center gap-2 text-green-700">
            <CheckCircle size={16} />
            <span className="font-medium">{file.name}</span>
          </div>
        )}
      </div>

      {file && (
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="mt-4 w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium transition shadow-sm"
        >
          {uploading ? 'Uploading...' : 'Upload CSV'}
        </button>
      )}
    </div>
  );
}

export default Upload;
