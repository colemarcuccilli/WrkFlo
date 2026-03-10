'use client';
import { useState } from 'react';
import CloudImportPanel from './CloudImportPanel';
import { getVersionColor, getVersionBg } from '@/lib/version-colors';

const fileStatusColors: Record<string, string> = {
  'draft': 'text-gray-500',
  'in-review': '',
  'changes-requested': '',
  'approved': '',
  'locked': 'text-purple-600',
};

const fileStatusInlineColors: Record<string, string> = {
  'in-review': '#15f3ec',
  'changes-requested': 'rgba(255,80,80,0.9)',
  'approved': '#16ffc0',
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

const statusDotStyles: Record<string, string> = {
  'draft': '',
  'in-review': '#15f3ec',
  'changes-requested': 'rgba(255,80,80,0.9)',
  'approved': '#16ffc0',
  'locked': '',
};

const statusDotClass: Record<string, string> = {
  'draft': 'bg-gray-400',
  'in-review': '',
  'changes-requested': '',
  'approved': '',
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
  const [showCloudImport, setShowCloudImport] = useState(false);

  return (
    <div className="flex flex-col h-full" style={{ background: '#0a0a0f' }}>
      <div className="px-4 py-3 flex items-center justify-between flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>Files</h2>
        {projectId && (
          <button
            onClick={() => setShowCloudImport((v) => !v)}
            title="Import files"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
            style={showCloudImport
              ? { background: 'linear-gradient(135deg, rgba(21,243,236,0.12), rgba(22,255,192,0.08))', border: '1px solid rgba(21,243,236,0.2)', color: '#15f3ec' }
              : { border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }
            }
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Import
          </button>
        )}
      </div>

      {/* Cloud import panel */}
      {showCloudImport && projectId && (
        <div className="flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)' }}>
          <CloudImportPanel
            projectId={projectId}
            onImportComplete={(imported: any[]) => {
              imported.forEach((f) => onUploadComplete?.(f));
              setShowCloudImport(false);
            }}
          />
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {files.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <svg className="w-10 h-10 mb-3" style={{ color: 'rgba(255,255,255,0.08)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>No files yet</p>
            {projectId && (
              <button
                onClick={() => setShowCloudImport(true)}
                className="mt-2 text-xs font-medium"
                style={{ color: '#15f3ec' }}
              >
                Import from cloud storage &rarr;
              </button>
            )}
          </div>
        )}

        {files.map((file: any) => {
          const isSelected = file.id === selectedFileId;
          const colorClass = fileStatusColors[file.status] || 'text-gray-500';
          const inlineColor = fileStatusInlineColors[file.status] || undefined;
          const dotClass = statusDotClass[file.status] || 'bg-gray-400';
          const dotInlineColor = statusDotStyles[file.status] || undefined;

          return (
            <button
              key={file.id}
              onClick={() => onSelectFile(file)}
              className={`w-full text-left px-4 py-3 transition-colors duration-150`}
              style={{
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                ...(isSelected ? { background: 'rgba(21,243,236,0.08)', borderLeft: '2px solid #15f3ec' } : {}),
              }}
            >
              <div className="flex items-start gap-3">
                {/* Type icon */}
                <div className={`mt-0.5 flex-shrink-0 ${colorClass}`} style={inlineColor ? { color: inlineColor } : undefined}>
                  {fileTypeIcon(file.type)}
                </div>

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium truncate" style={{ color: isSelected ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.7)' }}>
                      {file.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Version badge */}
                    <span className="px-1.5 py-0.5 text-xs rounded font-mono" style={{ background: getVersionBg(file.version || 'V1'), color: getVersionColor(file.version || 'V1') }}>
                      {file.version || 'V1'}
                    </span>

                    {/* Status dot */}
                    <span className="flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} style={dotInlineColor ? { background: dotInlineColor } : undefined} />
                      <span className={`text-xs ${colorClass}`} style={inlineColor ? { color: inlineColor } : undefined}>{fileStatusLabels[file.status] || file.status}</span>
                    </span>
                  </div>

                  <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{file.upload_date || file.uploadDate || ''}</p>
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
