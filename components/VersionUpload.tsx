'use client';
import { useState } from 'react';
import GoogleDriveImporter from './GoogleDriveImporter';
import DropboxImporter from './DropboxImporter';
import OneDriveImporter from './OneDriveImporter';
import { getVersionColor } from '@/lib/version-colors';

type CloudProvider = 'choose' | 'google_drive' | 'dropbox' | 'onedrive';

interface VersionUploadProps {
  fileId: string;
  fileName: string;
  currentVersion: string;
  projectId: string;
  onVersionUploaded: (updatedFile: any) => void;
  onClose: () => void;
}

export default function VersionUpload({ fileId, fileName, currentVersion, projectId, onVersionUploaded, onClose }: VersionUploadProps) {
  const [provider, setProvider] = useState<CloudProvider>('choose');
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const currentVersionNum = parseInt((currentVersion || 'V1').replace('V', '')) || 1;
  const nextVersionLabel = `V${currentVersionNum + 1}`;

  const handleCloudImport = async (imported: any[]) => {
    if (imported.length === 0) return;
    setUploading(true);
    setError('');
    try {
      const cloudFile = imported[0];
      const res = await fetch(`/api/files/${fileId}/version`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes,
          url: cloudFile.url,
          storage_type: cloudFile.storage_type,
          external_id: cloudFile.external_id,
          mime_type: cloudFile.mime_type,
          name: cloudFile.name,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Import failed');
      }
      const updated = await res.json();
      onVersionUploaded(updated);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Import failed');
      setUploading(false);
    }
  };

  const CLOUD_OPTIONS = [
    {
      key: 'google_drive' as CloudProvider,
      label: 'Google Drive',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
          <path d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8H0c0 1.55.4 3.1 1.2 4.5l5.4 9.35z" fill="#0066DA"/>
          <path d="M43.65 25L29.9 1.2C28.55 2 27.4 3.1 26.6 4.5L3.45 44.7c-.8 1.4-1.2 2.95-1.2 4.5h27.5L43.65 25z" fill="#00AC47"/>
          <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75L84.1 61.5c.8-1.4 1.2-2.95 1.2-4.5H57.8l6.85 11.85L73.55 76.8z" fill="#EA4335"/>
          <path d="M43.65 25L57.4 1.2c-1.35-.8-2.9-1.2-4.5-1.2H34.4c-1.6 0-3.15.45-4.5 1.2L43.65 25z" fill="#00832D"/>
          <path d="M57.8 49.2H29.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h46.5c1.6 0 3.15-.45 4.5-1.2L57.8 49.2z" fill="#2684FC"/>
          <path d="M73.4 26.5L60.65 4.5c-.8-1.4-1.95-2.5-3.3-3.3L43.6 25l14.2 24.2h27.45c0-1.55-.4-3.1-1.2-4.5L73.4 26.5z" fill="#FFBA00"/>
        </svg>
      ),
    },
    {
      key: 'dropbox' as CloudProvider,
      label: 'Dropbox',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 256 218" xmlns="http://www.w3.org/2000/svg">
          <path d="M63.995 0L0 40.771l63.995 40.772L128 40.771zM192.005 0L128 40.771l64.005 40.772L256 40.771zM0 122.321l63.995 40.772L128 122.321 63.995 81.543zM192.005 81.543L128 122.321l64.005 40.772L256 122.321z" fill="#0061FF"/>
        </svg>
      ),
    },
    {
      key: 'onedrive' as CloudProvider,
      label: 'OneDrive',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M10.086 9.386a4.313 4.313 0 013.893-2.46c1.721 0 3.208 1.014 3.893 2.46a3.238 3.238 0 011.378-.307C21.32 9.079 23 10.759 23 12.829s-1.68 3.75-3.75 3.75H6.25A3.25 3.25 0 013 13.329c0-1.562 1.1-2.868 2.567-3.18a4.313 4.313 0 014.52-.763z" fill="#0364B8"/>
        </svg>
      ),
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="rounded-2xl shadow-xl w-full max-w-md"
        style={{ background: 'rgba(10,10,15,0.95)', border: '1px solid rgba(255,255,255,0.08)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-0">
          <div>
            <h2 className="text-base font-bold" style={{ color: 'rgba(255,255,255,0.9)' }}>Upload New Version</h2>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{fileName} · {currentVersion} → {nextVersionLabel}</p>
          </div>
          <button onClick={onClose} className="transition-colors" style={{ color: 'rgba(255,255,255,0.4)' }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Version info banner */}
          {(() => {
            const nextColor = getVersionColor(currentVersionNum + 1);
            return (
              <div className="rounded-lg p-3" style={{ background: `${nextColor}14`, border: `1px solid ${nextColor}30` }}>
                <p className="text-xs" style={{ color: nextColor }}>
                  <span className="font-semibold">Uploading as {nextVersionLabel}</span> — status resets to &ldquo;In Review&rdquo;. Previous feedback is preserved in Round {currentVersionNum}.
                </p>
              </div>
            );
          })()}

          {/* Provider selection */}
          {provider === 'choose' && (
            <div>
              <p className="text-xs font-medium mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>Pick the updated file from your cloud storage</p>
              <div className="grid grid-cols-3 gap-2">
                {CLOUD_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setProvider(opt.key)}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all hover:scale-[1.02]"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    {opt.icon}
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Cloud import */}
          {provider !== 'choose' && (
            <div className="space-y-3">
              <button
                onClick={() => setProvider('choose')}
                className="flex items-center gap-1 text-xs transition-colors"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>

              {/* Notes */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.7)' }}>What changed? <span style={{ color: 'rgba(255,255,255,0.4)' }}>(optional)</span></label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Fixed color grading, tightened cuts at 1:20..."
                  rows={2}
                  className="w-full rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none"
                  style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.9)' }}
                />
              </div>

              {error && (
                <p className="text-sm px-3 py-2 rounded-lg" style={{ color: 'rgba(255,80,80,0.9)', background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.2)' }}>{error}</p>
              )}

              {uploading && (
                <div className="flex items-center justify-center gap-2 py-4">
                  <svg className="w-5 h-5 animate-spin" style={{ color: '#15f3ec' }} fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>Importing as {nextVersionLabel}...</span>
                </div>
              )}

              {!uploading && provider === 'google_drive' && (
                <GoogleDriveImporter projectId={projectId} onImportComplete={handleCloudImport} />
              )}
              {!uploading && provider === 'dropbox' && (
                <DropboxImporter projectId={projectId} onImportComplete={handleCloudImport} />
              )}
              {!uploading && provider === 'onedrive' && (
                <OneDriveImporter projectId={projectId} onImportComplete={handleCloudImport} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
