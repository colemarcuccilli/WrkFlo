'use client';
import dynamic from 'next/dynamic';
import ImageViewer from './ImageViewer';

// Dynamic import for WaveformPlayer to avoid SSR issues with WaveSurfer
const WaveformPlayer = dynamic(() => import('./WaveformPlayer'), { ssr: false });
const VideoPlayer = dynamic(() => import('./VideoPlayer'), { ssr: false });

export default function FilePreview({ file, comments, onAddComment, onSeekToTimestamp }) {
  if (!file) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-slate-400">Select a file to preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm font-medium text-slate-300 truncate">{file.name}</span>
        <span className="text-xs text-slate-500 flex-shrink-0">{file.type}</span>
      </div>

      {file.type === 'video' && (
        <VideoPlayer
          file={file}
          comments={comments}
          onAddComment={onAddComment}
          onSeekToComment={onSeekToTimestamp}
        />
      )}

      {file.type === 'audio' && (
        <WaveformPlayer
          file={file}
          comments={comments}
          onAddComment={onAddComment}
          onSeekToComment={onSeekToTimestamp}
        />
      )}

      {file.type === 'image' && (
        <ImageViewer
          file={file}
          comments={comments}
          onAddComment={onAddComment}
        />
      )}

      {file.type === 'document' && (
        <div className="flex flex-col items-center justify-center py-16 bg-slate-800 rounded-lg">
          <svg className="w-16 h-16 text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-slate-300 font-medium">{file.name}</p>
          <p className="text-slate-500 text-sm mt-1">Document preview</p>
          <div className="mt-4 bg-slate-700 border border-slate-600 rounded-lg p-4 max-w-md w-full">
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-2 bg-slate-600 rounded"
                  style={{ width: `${60 + Math.random() * 35}%` }}
                />
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-4 text-center">PDF viewer not available in prototype</p>
          </div>
        </div>
      )}
    </div>
  );
}
