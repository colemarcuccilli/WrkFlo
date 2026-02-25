'use client';
import { useState, useRef, useCallback } from 'react';

const ACCEPTED_TYPES = {
  'video/mp4': 'video',
  'video/quicktime': 'video',
  'video/webm': 'video',
  'audio/mpeg': 'audio',
  'audio/wav': 'audio',
  'audio/ogg': 'audio',
  'audio/aac': 'audio',
  'image/png': 'image',
  'image/jpeg': 'image',
  'image/gif': 'image',
  'image/webp': 'image',
  'image/svg+xml': 'image',
  'application/pdf': 'pdf',
};

const MAX_SIZE_MB = 200;

export default function FileUploader({ projectId, onUploadComplete }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploads, setUploads] = useState([]); // { name, progress, status, error }
  const inputRef = useRef(null);

  const uploadFile = useCallback(async (file) => {
    const id = `${Date.now()}-${file.name}`;

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setUploads((prev) => [...prev, { id, name: file.name, progress: 0, status: 'error', error: `File too large (max ${MAX_SIZE_MB}MB)` }]);
      return;
    }

    setUploads((prev) => [...prev, { id, name: file.name, progress: 0, status: 'uploading' }]);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('project_id', projectId);

      // Simulate progress (real progress needs XHR)
      const progressInterval = setInterval(() => {
        setUploads((prev) =>
          prev.map((u) =>
            u.id === id && u.progress < 80
              ? { ...u, progress: u.progress + 10 }
              : u
          )
        );
      }, 200);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Upload failed');
      }

      const fileRecord = await res.json();

      setUploads((prev) =>
        prev.map((u) =>
          u.id === id ? { ...u, progress: 100, status: 'done' } : u
        )
      );

      onUploadComplete?.(fileRecord);
    } catch (err) {
      setUploads((prev) =>
        prev.map((u) =>
          u.id === id ? { ...u, progress: 0, status: 'error', error: err.message } : u
        )
      );
    }
  }, [projectId, onUploadComplete]);

  const handleFiles = useCallback((files) => {
    Array.from(files).forEach(uploadFile);
  }, [uploadFile]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const clearDone = () => {
    setUploads((prev) => prev.filter((u) => u.status !== 'done'));
  };

  const activeUploads = uploads.filter((u) => u.status === 'uploading' || u.status === 'error' || u.status === 'done');
  const hasCompleted = uploads.some((u) => u.status === 'done');

  return (
    <div className="space-y-3">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200"
        style={
          isDragging
            ? { borderColor: '#15f3ec', background: 'rgba(21,243,236,0.08)', transform: 'scale(1.01)' }
            : { borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }
        }
      >
        <div className="w-10 h-10 rounded-full mx-auto mb-3 flex items-center justify-center transition-colors" style={
          isDragging ? { background: 'rgba(21,243,236,0.12)' } : { background: 'rgba(255,255,255,0.06)' }
        }>
          <svg className="w-5 h-5 transition-colors" style={isDragging ? { color: '#15f3ec' } : { color: 'rgba(255,255,255,0.4)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <p className="text-sm font-medium transition-colors" style={isDragging ? { color: '#15f3ec' } : { color: 'rgba(255,255,255,0.7)' }}>
          {isDragging ? 'Drop to upload' : 'Drag & drop files here'}
        </p>
        <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
          or <span className="font-medium" style={{ color: '#15f3ec' }}>browse files</span>
        </p>
        <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Video · Audio · Images · PDF · Max {MAX_SIZE_MB}MB
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="video/*,audio/*,image/*,application/pdf"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Upload Progress */}
      {activeUploads.length > 0 && (
        <div className="space-y-2">
          {hasCompleted && (
            <div className="flex justify-end">
              <button
                onClick={clearDone}
                className="text-xs transition-colors"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                Clear completed
              </button>
            </div>
          )}
          {uploads.map((upload) => (
            <div key={upload.id} className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center gap-3 mb-1.5">
                <div className="flex-shrink-0">
                  {upload.status === 'done' ? (
                    <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'rgba(22,255,192,0.12)' }}>
                      <svg className="w-3.5 h-3.5" style={{ color: '#16ffc0' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  ) : upload.status === 'error' ? (
                    <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,80,80,0.12)' }}>
                      <svg className="w-3.5 h-3.5" style={{ color: 'rgba(255,80,80,0.9)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'rgba(21,243,236,0.12)' }}>
                      <svg className="w-3.5 h-3.5 animate-spin" style={{ color: '#15f3ec' }} fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate" style={{ color: 'rgba(255,255,255,0.9)' }}>{upload.name}</p>
                  {upload.status === 'error' && (
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(255,80,80,0.9)' }}>{upload.error}</p>
                  )}
                  {upload.status === 'done' && (
                    <p className="text-xs mt-0.5" style={{ color: '#16ffc0' }}>Upload complete</p>
                  )}
                </div>
                <span className="text-xs flex-shrink-0" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {upload.status === 'uploading' ? `${upload.progress}%` : ''}
                </span>
              </div>
              {upload.status === 'uploading' && (
                <div className="w-full rounded-full h-1 overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-200"
                    style={{ width: `${upload.progress}%`, background: '#15f3ec' }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
