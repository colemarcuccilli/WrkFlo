'use client';
import { fileStatusColors, fileStatusLabels } from '@/lib/mock-data';

const fileTypeIcon = (type) => {
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
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    default:
      return null;
  }
};

const statusDotClass = {
  'draft': 'bg-slate-500',
  'in-review': 'bg-blue-400',
  'changes-requested': 'bg-orange-400',
  'approved': 'bg-green-400',
  'locked': 'bg-purple-400',
};

export default function FileBrowser({ files, selectedFileId, onSelectFile }) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-slate-700">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Files</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {files.map((file) => {
          const isSelected = file.id === selectedFileId;
          const colorClass = fileStatusColors[file.status] || 'text-slate-400';
          const dotClass = statusDotClass[file.status] || 'bg-slate-500';

          return (
            <button
              key={file.id}
              onClick={() => onSelectFile(file)}
              className={`w-full text-left px-4 py-3 border-b border-slate-700/50 transition-colors duration-150 hover:bg-slate-700/50 ${
                isSelected ? 'bg-indigo-500/10 border-l-2 border-l-indigo-500' : ''
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
                    <span className={`text-sm font-medium truncate ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                      {file.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Version badge */}
                    <span className="px-1.5 py-0.5 bg-slate-700 text-slate-300 text-xs rounded font-mono">
                      {file.version}
                    </span>

                    {/* Status dot */}
                    <span className="flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
                      <span className={`text-xs ${colorClass}`}>{fileStatusLabels[file.status]}</span>
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mt-1">{file.uploadDate}</p>
                </div>

                {/* Lock icon for locked files */}
                {file.status === 'locked' && (
                  <div className="flex-shrink-0 text-purple-400 mt-0.5">
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
