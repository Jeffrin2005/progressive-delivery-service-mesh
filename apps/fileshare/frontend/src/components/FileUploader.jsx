import React, { useState } from 'react';

export default function FileUploader({ theme, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please choose a file from your computer first!');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload-file', {
        method: 'POST',
        body: formData,
        cache: 'no-store'
      });
      const data = await res.json();
      if (res.ok) {
        onUploadSuccess(data.file);
        setFile(null);
      } else {
        setError(`Upload Failed: ${data.error} (${data.message})`);
      }
    } catch (err) {
      setError(`Network Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-2 border-dashed rounded-xl p-6 text-center transition-all bg-slate-800/40" style={{ borderColor: theme.primary }}>
      <div className="text-3xl mb-2">📤</div>
      <h3 className="text-base font-semibold text-white">Choose any file from your computer</h3>
      <p className="text-xs text-slate-400 mt-1">Upload real images, PDFs, docs, or zip files</p>
      
      <div className="mt-4 flex flex-col items-center gap-3">
        <input 
          type="file" 
          onChange={handleFileChange}
          className="text-xs text-slate-300 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-700 file:text-white hover:file:bg-slate-600 cursor-pointer" 
        />
        
        <button 
          onClick={handleUpload}
          disabled={loading}
          className="w-full py-2.5 rounded-lg font-semibold text-sm text-white transition-all shadow-md hover:brightness-110 flex items-center justify-center gap-2"
          style={{ backgroundColor: theme.primary }}
        >
          {loading ? 'Uploading to Mesh...' : 'Upload & Generate Shareable Link'}
        </button>
      </div>

      {error && (
        <div className="mt-3 p-2 rounded-lg bg-red-500/20 border border-red-500 text-red-300 text-xs font-mono">
          {error}
        </div>
      )}
    </div>
  );
}
