import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import FileUploader from '../components/FileUploader';
import TrafficMeter from '../components/TrafficMeter';

export default function HomePage({ meta }) {
  const [uploadedFile, setUploadedFile] = useState(null);
  const theme = meta.theme || { primary: '#3b82f6', versionBadge: 'v1.0.0 (STABLE)', trafficShare: '80% STABLE' };

  const copyLink = () => {
    if (!uploadedFile) return;
    const url = `${window.location.origin}${uploadedFile.previewUrl}`;
    navigator.clipboard.writeText(url);
    alert('Shareable link copied to clipboard!');
  };

  return (
    <div className="w-full flex flex-col items-center justify-center p-4">
      <Navbar meta={meta} />

      <div className="w-full max-w-xl bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
        <FileUploader theme={theme} onUploadSuccess={(file) => setUploadedFile(file)} />

        {uploadedFile && (
          <div className="mt-4 p-4 rounded-xl bg-slate-800 border border-white/10">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-400">🎉 Shareable Preview Link Created:</span>
              <span className="font-mono text-slate-400">{uploadedFile.name} ({uploadedFile.size})</span>
            </div>
            <div className="flex gap-2 mt-2">
              <input 
                type="text" 
                readOnly 
                value={`${window.location.origin}${uploadedFile.previewUrl}`}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200" 
              />
              <button onClick={copyLink} className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-semibold text-white">Copy</button>
              <a 
                href={uploadedFile.previewUrl} 
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-xs font-semibold text-white flex items-center gap-1"
              >
                <span>Open Preview ↗</span>
              </a>
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-2">
              Processed by {uploadedFile.version} on pod {uploadedFile.pod}
            </div>
          </div>
        )}

        <TrafficMeter />

        <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between text-xs font-mono text-slate-400">
          <div>Pod: <span className="text-slate-200 font-bold">{meta.pod || 'localhost'}</span></div>
          <div>Expected: <span className="text-white font-bold" style={{ color: theme.primary }}>{theme.trafficShare}</span></div>
          <div>Status: <span className="text-emerald-400 font-bold">Online</span></div>
        </div>
      </div>
    </div>
  );
}
