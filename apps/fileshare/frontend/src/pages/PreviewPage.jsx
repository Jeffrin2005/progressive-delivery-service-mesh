import React, { useEffect, useState } from 'react';

export default function PreviewPage({ fileId }) {
  const [fileData, setFileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`/api/file/${fileId}`)
      .then(res => {
        if (!res.ok) throw new Error('File not found or expired');
        return res.json();
      })
      .then(data => {
        setFileData(data.file);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [fileId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-300">
        <div className="text-sm font-mono animate-pulse">Loading shared file from cluster...</div>
      </div>
    );
  }

  if (error || !fileData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center max-w-sm">
          <div className="text-4xl mb-2">⚠️</div>
          <h2 className="text-xl font-bold text-white mb-1">File Not Found</h2>
          <p className="text-xs text-slate-400 mb-4">{error || 'This link may have expired.'}</p>
          <a href="/" className="px-4 py-2 bg-blue-600 rounded-lg text-xs font-semibold text-white">Back to Upload</a>
        </div>
      </div>
    );
  }

  const theme = fileData.theme || { primary: '#3b82f6', versionBadge: 'v1.0.0 (STABLE)' };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl relative">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xl">📁</span>
            <span className="font-bold text-sm tracking-wide text-white">CloudDrop Shared File</span>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider text-white" style={{ backgroundColor: theme.primary }}>
            {theme.versionBadge}
          </span>
        </div>

        <div className="text-center my-4">
          {fileData.isImage ? (
            <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-950/60 p-2 mb-4 max-h-64 flex items-center justify-center">
              <img src={fileData.rawDownloadUrl} alt="Preview" className="max-h-56 max-w-full rounded-lg object-contain shadow" />
            </div>
          ) : (
            <div className="w-24 h-24 mx-auto rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-4xl mb-4 shadow-inner">
              📄
            </div>
          )}

          <h2 className="text-xl font-bold text-white break-words mt-2">{fileData.name}</h2>
          <p className="text-xs text-slate-400 mt-1">Size: <span className="text-slate-200 font-semibold">{fileData.size}</span></p>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <a 
            href={fileData.rawDownloadUrl} 
            download={fileData.name} 
            className="w-full py-3.5 rounded-xl font-bold text-sm text-white text-center shadow-lg transition-all hover:brightness-110 flex items-center justify-center gap-2" 
            style={{ backgroundColor: theme.primary }}
          >
            <span>📥</span>
            <span>Download File ({fileData.size})</span>
          </a>

          <a href="/" className="text-center text-xs text-slate-400 hover:text-white transition-colors mt-2">
            ← Upload another file
          </a>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between text-[11px] font-mono text-slate-500">
          <span>Delivered by: <b>{fileData.pod}</b></span>
          <span>Mesh Route: <b style={{ color: theme.primary }}>{theme.trafficShare}</b></span>
        </div>
      </div>
    </div>
  );
}
