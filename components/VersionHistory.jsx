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
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors"
        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }}
      >
        <svg className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.5)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="font-mono" style={{ color: '#15f3ec' }}>{currentVersion}</span>
        <svg className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} style={{ color: 'rgba(255,255,255,0.4)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1 left-0 z-50 w-72 rounded-xl shadow-lg overflow-hidden" style={{ background: 'rgba(10,10,15,0.95)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
          <div className="px-3 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>Version History</p>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {[...file.versions].reverse().map((v, idx) => (
              <div
                key={v.version}
                className="px-3 py-3"
                style={{
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  ...(v.version === currentVersion ? { background: 'rgba(21,243,236,0.08)' } : {}),
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-1.5 py-0.5 rounded font-mono text-xs font-bold" style={
                    v.version === currentVersion
                      ? { background: 'rgba(21,243,236,0.12)', color: '#15f3ec' }
                      : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }
                  }>
                    {v.version}
                  </span>
                  {v.version === currentVersion && (
                    <span className="text-xs" style={{ color: '#15f3ec' }}>Current</span>
                  )}
                  <span className="text-xs ml-auto" style={{ color: 'rgba(255,255,255,0.4)' }}>{v.date}</span>
                </div>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>{v.notes}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
