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
        className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg text-sm text-gray-700 transition-colors"
      >
        <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="font-mono text-orange-500">{currentVersion}</span>
        <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1 left-0 z-50 w-72 bg-white border border-gray-200 rounded-xl shadow-lg shadow-gray-200/80 overflow-hidden">
          <div className="px-3 py-2 border-b border-gray-200">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Version History</p>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {[...file.versions].reverse().map((v, idx) => (
              <div
                key={v.version}
                className={`px-3 py-3 border-b border-gray-100 last:border-0 ${
                  v.version === currentVersion ? 'bg-orange-50' : ''
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-1.5 py-0.5 rounded font-mono text-xs font-bold ${
                    v.version === currentVersion
                      ? 'bg-orange-100 text-orange-600'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {v.version}
                  </span>
                  {v.version === currentVersion && (
                    <span className="text-xs text-orange-500">Current</span>
                  )}
                  <span className="text-xs text-gray-400 ml-auto">{v.date}</span>
                </div>
                <p className="text-xs text-gray-600">{v.notes}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
