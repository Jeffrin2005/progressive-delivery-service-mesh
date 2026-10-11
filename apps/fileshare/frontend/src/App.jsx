import React, { useState, useEffect } from 'react';
import HomePage from './pages/HomePage';
import PreviewPage from './pages/PreviewPage';

export default function App() {
  const [meta, setMeta] = useState({ theme: {}, pod: 'pod', version: 'v1.0.0' });
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    fetch('/api/meta', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => setMeta(data))
      .catch(() => {});
  }, []);

  const isFilePage = currentPath.startsWith('/file/');
  const fileId = isFilePage ? currentPath.split('/file/')[1] : null;

  const bgGradient = meta.theme && meta.theme.bgGradient 
    ? meta.theme.bgGradient 
    : 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 50%, #020617 100%)';

  return (
    <div className="min-h-screen text-slate-100 flex flex-col justify-center items-center" style={{ background: bgGradient }}>
      {isFilePage && fileId ? (
        <PreviewPage fileId={fileId} />
      ) : (
        <HomePage meta={meta} />
      )}
    </div>
  );
}
