'use client';
import { useState, useRef } from 'react';

interface VersionUploadProps {
  fileId: string;
  fileName: string;
  currentVersion: string;
  onVersionUploaded: (updatedFile: any) => void;
  onClose: () => void;
}

export default function VersionUpload({ fileId, fileName, currentVersion, onVersionUploaded, onClose }: VersionUploadProps) {
  const [notes, setNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(e.target.files?.[0] || null);
    setError('');
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('notes', notes);
      const res = await fetch(`/api/files/${fileId}/version`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Upload failed');
      }
      const updated = await res.json();
      onVersionUploaded(updated);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Upload failed');
      setUploading(false);
    }
  };

  const currentVersionNum = parseInt((currentVersion || 'V1').replace('V', '')) || 1;
  const nextVersionLabel = `V${currentVersionNum + 1}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="rounded-2xl shadow-xl w-full max-w-md p-6" style={{ background: 'rgba(10,10,15,0.95)', border: '1px solid rgba(255,255,255,0.08)' }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
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

        <div className="space-y-4">
          {/* File picker */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>New File <span style={{ color: 'rgba(255,80,80,0.9)' }}>*</span></label>
            <div
              onClick={() => inputRef.current?.click()}
              className="border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors"
              style={
                selectedFile
                  ? { borderColor: 'rgba(21,243,236,0.4)', background: 'rgba(21,243,236,0.08)' }
                  : { borderColor: 'rgba(255,255,255,0.08)' }
              }
            >
              {selectedFile ? (
                <div className="flex items-center gap-3 justify-center">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(21,243,236,0.12)' }}>
                    <svg className="w-4 h-4" style={{ color: '#15f3ec' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.9)' }}>{selectedFile.name}</p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{(selectedFile.size / 1024 / 1024).toFixed(1)} MB</p>
                  </div>
                </div>
              ) : (
                <>
                  <svg className="w-8 h-8 mx-auto mb-2" style={{ color: 'rgba(255,255,255,0.15)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Click to select file</p>
                  <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Same file type recommended</p>
                </>
              )}
              <input ref={inputRef} type="file" className="hidden" onChange={handleFileChange} />
            </div>
          </div>

          {/* Version notes */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.7)' }}>What changed? <span style={{ color: 'rgba(255,255,255,0.4)' }}>(optional)</span></label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Revised color palette, tightened kerning..."
              rows={3}
              className="w-full rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none"
              style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.9)' }}
            />
          </div>

          {/* Version info */}
          <div className="rounded-lg p-3" style={{ background: 'rgba(21,243,236,0.08)', border: '1px solid rgba(21,243,236,0.2)' }}>
            <p className="text-xs" style={{ color: '#15f3ec' }}>
              <span className="font-semibold">Uploading as {nextVersionLabel}</span> — file status will reset to "In Review" and the client will need to re-approve.
            </p>
          </div>

          {error && (
            <p className="text-sm px-3 py-2 rounded-lg" style={{ color: 'rgba(255,80,80,0.9)', background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.2)' }}>{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors"
              style={{ border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={uploading || !selectedFile}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium rounded-lg transition-colors"
              style={{ background: '#15f3ec', color: '#0a0a0f' }}
            >
              {uploading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Uploading...
                </>
              ) : (
                `Upload ${nextVersionLabel}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
