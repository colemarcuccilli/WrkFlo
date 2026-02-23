'use client';
import { useState } from 'react';

export default function VersionHistory({ file }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!file.versions || file.versions.length === 0) return null;

  const currentVersion = file.version;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-sm text-slate-300 transition-colors"
      >
        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="font-mono text-indigo-300">{currentVersion}</span>
        <svg className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1 left-0 z-50 w-72 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl shadow-black/50 overflow-hidden">
          <div className="px-3 py-2 border-b border-slate-700">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Version History</p>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {[...file.versions].reverse().map((v, idx) => (
              <div
                key={v.version}
                className={`px-3 py-3 border-b border-slate-700/50 last:border-0 ${
                  v.version === currentVersion ? 'bg-indigo-500/10' : ''
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-1.5 py-0.5 rounded font-mono text-xs font-bold ${
                    v.version === currentVersion
                      ? 'bg-indigo-500/30 text-indigo-300'
                      : 'bg-slate-700 text-slate-400'
                  }`}>
                    {v.version}
                  </span>
                  {v.version === currentVersion && (
                    <span className="text-xs text-indigo-400">Current</span>
                  )}
                  <span className="text-xs text-slate-500 ml-auto">{v.date}</span>
                </div>
                <p className="text-xs text-slate-400">{v.notes}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
