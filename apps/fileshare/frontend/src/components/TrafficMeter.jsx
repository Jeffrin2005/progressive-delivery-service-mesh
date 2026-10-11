import React, { useState } from 'react';

export default function TrafficMeter() {
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [logs, setLogs] = useState([]);

  const testTraffic = async (count = 10) => {
    setRunning(true);
    setLogs([]);
    let v1 = 0;
    let v2 = 0;
    const newLogs = [];

    for (let i = 1; i <= count; i++) {
      try {
        const res = await fetch('/api/ping', { cache: 'no-store' });
        const data = await res.json();
        if (data.isCanary) {
          v2++;
          newLogs.push({ id: i, text: `[${i}/${count}] 🟢 CANARY (${data.version} on ${data.pod})`, color: 'text-emerald-400' });
        } else {
          v1++;
          newLogs.push({ id: i, text: `[${i}/${count}] 🔵 STABLE (${data.version} on ${data.pod})`, color: 'text-blue-400' });
        }
      } catch (e) {
        newLogs.push({ id: i, text: `[${i}/${count}] ❌ Request Failed`, color: 'text-red-400' });
      }
      setLogs([...newLogs]);
    }

    setResults({ v1, v2, count });
    setRunning(false);
  };

  return (
    <div className="mt-6 pt-4 border-t border-slate-800">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400">🧪 Istio Live Traffic Testing</div>
        <div className="flex gap-2">
          <button 
            onClick={() => window.location.reload()} 
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-md text-xs font-medium text-slate-300 border border-slate-700"
          >
            🔄 Refresh Route
          </button>
          <button 
            onClick={() => testTraffic(10)} 
            disabled={running}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded-md text-xs font-medium text-white shadow"
          >
            {running ? 'Testing...' : '🚀 Test 10 Requests'}
          </button>
        </div>
      </div>

      {results && (
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs">
          <div className="flex justify-between text-slate-300 mb-2">
            <span>Results: <b>{results.count} Requests</b></span>
            <span>🔵 Stable: <b className="text-blue-400">{results.v1} ({Math.round((results.v1/results.count)*100)}%)</b></span>
            <span>🟢 Canary: <b className="text-emerald-400">{results.v2} ({Math.round((results.v2/results.count)*100)}%)</b></span>
          </div>
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
            <div className="bg-blue-500 h-full transition-all" style={{ width: `${(results.v1/results.count)*100}%` }}></div>
            <div className="bg-emerald-500 h-full transition-all" style={{ width: `${(results.v2/results.count)*100}%` }}></div>
          </div>
          <div className="mt-3 max-h-24 overflow-y-auto text-[11px] space-y-1">
            {logs.map(l => (
              <div key={l.id} className={l.color}>{l.text}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
