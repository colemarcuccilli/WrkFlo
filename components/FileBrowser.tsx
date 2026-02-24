'use client';
import { useState } from 'react';
import FileUploader from './FileUploader';
import GoogleDriveImporter from './GoogleDriveImporter';

const fileStatusColors: Record<string, string> = {
  'draft': 'text-gray-500',
  'in-review': 'text-orange-600',
  'changes-requested': 'text-red-500',
  'approved': 'text-emerald-600',
  'locked': 'text-purple-600',
};

const fileStatusLabels: Record<string, string> = {
  'draft': 'Draft',
  'in-review': 'In Review',
  'changes-requested': 'Changes Requested',
  'approved': 'Approved',
  'locked': 'Locked',
};

const fileTypeIcon = (type: string) => {
  switch (type) {
    case 'video':
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      );
    case 'audio':
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      );
    case 'image':
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    case 'document':
    case 'pdf':
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    default:
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
  }
};

const statusDotClass: Record<string, string> = {
  'draft': 'bg-gray-400',
  'in-review': 'bg-orange-500',
  'changes-requested': 'bg-red-500',
  'approved': 'bg-emerald-500',
  'locked': 'bg-purple-500',
};

interface FileBrowserProps {
  files: any[];
  selectedFileId: string | null;
  onSelectFile: (file: any) => void;
  projectId?: string | null;
  onUploadComplete?: ((file: any) => void) | null;
}

export default function FileBrowser({ files, selectedFileId, onSelectFile, projectId, onUploadComplete }: FileBrowserProps) {
  const [showUploader, setShowUploader] = useState(false);
  const [showDriveImporter, setShowDriveImporter] = useState(false);

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Files</h2>
        {projectId && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => { setShowDriveImporter((v) => !v); if (!showDriveImporter) setShowUploader(false); }}
              title="Import from Google Drive"
              className={`p-1 rounded-lg transition-colors ${showDriveImporter ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'}`}
            >
              <svg className="w-4 h-4" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8H0c0 1.55.4 3.1 1.2 4.5l5.4 9.35z" fill="#0066DA"/>
                <path d="M43.65 25L29.9 1.2C28.55 2 27.4 3.1 26.6 4.5L3.45 44.7c-.8 1.4-1.2 2.95-1.2 4.5h27.5L43.65 25z" fill="#00AC47"/>
                <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75L84.1 61.5c.8-1.4 1.2-2.95 1.2-4.5H57.8l6.85 11.85L73.55 76.8z" fill="#EA4335"/>
                <path d="M43.65 25L57.4 1.2c-1.35-.8-2.9-1.2-4.5-1.2H34.4c-1.6 0-3.15.45-4.5 1.2L43.65 25z" fill="#00832D"/>
                <path d="M57.8 49.2H29.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h46.5c1.6 0 3.15-.45 4.5-1.2L57.8 49.2z" fill="#2684FC"/>
                <path d="M73.4 26.5L60.65 4.5c-.8-1.4-1.95-2.5-3.3-3.3L43.6 25l14.2 24.2h27.45c0-1.55-.4-3.1-1.2-4.5L73.4 26.5z" fill="#FFBA00"/>
              </svg>
            </button>
            <button
              onClick={() => { setShowUploader((v) => !v); if (!showUploader) setShowDriveImporter(false); }}
              title="Upload files"
              className={`p-1 rounded-lg transition-colors ${showUploader ? 'bg-orange-100 text-orange-600' : 'text-gray-400 hover:text-orange-600 hover:bg-orange-50'}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Upload panel */}
      {showUploader && projectId && (
        <div className="p-3 border-b border-gray-100 flex-shrink-0 bg-gray-50">
          <FileUploader
            projectId={projectId}
            onUploadComplete={(file: any) => {
              onUploadComplete?.(file);
              setShowUploader(false);
            }}
          />
        </div>
      )}

      {/* Google Drive import panel */}
      {showDriveImporter && projectId && (
        <div className="border-b border-gray-100 flex-shrink-0 bg-gray-50">
          <GoogleDriveImporter
            projectId={projectId}
            onImportComplete={(imported: any[]) => {
              imported.forEach((f) => onUploadComplete?.(f));
              setShowDriveImporter(false);
            }}
          />
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {files.length === 0 && !showUploader && (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <svg className="w-10 h-10 text-gray-200 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <p className="text-xs text-gray-400">No files yet</p>
            {projectId && (
              <button
                onClick={() => setShowUploader(true)}
                className="mt-2 text-xs text-orange-500 hover:text-orange-600 font-medium"
              >
                Upload first file →
              </button>
            )}
          </div>
        )}

        {files.map((file: any) => {
          const isSelected = file.id === selectedFileId;
          const colorClass = fileStatusColors[file.status] || 'text-gray-500';
          const dotClass = statusDotClass[file.status] || 'bg-gray-400';

          return (
            <button
              key={file.id}
              onClick={() => onSelectFile(file)}
              className={`w-full text-left px-4 py-3 border-b border-gray-100 transition-colors duration-150 hover:bg-gray-50 ${
                isSelected ? 'bg-orange-50 border-l-2 border-l-orange-500' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Type icon */}
                <div className={`mt-0.5 flex-shrink-0 ${colorClass}`}>
                  {fileTypeIcon(file.type)}
                </div>

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-sm font-medium truncate ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                      {file.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Version badge */}
                    <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded font-mono">
                      {file.version || 'V1'}
                    </span>

                    {/* Status dot */}
                    <span className="flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
                      <span className={`text-xs ${colorClass}`}>{fileStatusLabels[file.status] || file.status}</span>
                    </span>
                  </div>

                  <p className="text-xs text-gray-400 mt-1">{file.upload_date || file.uploadDate || ''}</p>
                </div>

                {/* Lock icon for locked files */}
                {file.status === 'locked' && (
                  <div className="flex-shrink-0 text-purple-500 mt-0.5">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
