import React from 'react';

export default function Navbar({ meta }) {
  const theme = meta.theme || { primary: '#3b82f6', versionBadge: 'v1.0.0 (STABLE)', colorName: 'Ocean Blue' };

  return (
    <div className="w-full max-w-xl text-center mb-6">
      <div 
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg border border-white/10 mb-2 text-white" 
        style={{ backgroundColor: theme.primary }}
      >
        <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
        <span>{theme.versionBadge} ({theme.colorName})</span>
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight text-white">CloudDrop React FileShare</h1>
      <p className="text-slate-400 text-xs mt-1">Progressive Canary Delivery with Istio Mesh & Argo Rollouts</p>
    </div>
  );
}
