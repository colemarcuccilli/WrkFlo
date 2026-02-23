'use client';
import dynamic from 'next/dynamic';
import ImageViewer from './ImageViewer';

const WaveformPlayer = dynamic(() => import('./WaveformPlayer'), { ssr: false });
const VideoPlayer = dynamic(() => import('./VideoPlayer'), { ssr: false });

export default function FilePreview({ file, comments, onAddComment, onSeekToTimestamp }) {
  if (!file) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-400">Select a file to preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm font-medium text-gray-700 truncate">{file.name}</span>
        <span className="text-xs text-gray-400 flex-shrink-0">{file.type}</span>
      </div>

      {file.type === 'video' && (
        <VideoPlayer file={file} comments={comments} onAddComment={onAddComment} onSeekToComment={onSeekToTimestamp} />
      )}

      {file.type === 'audio' && (
        <WaveformPlayer file={file} comments={comments} onAddComment={onAddComment} onSeekToComment={onSeekToTimestamp} />
      )}

      {file.type === 'image' && (
        <ImageViewer file={file} comments={comments} onAddComment={onAddComment} />
      )}

      {(file.type === 'document' || file.type === 'pdf') && (
        <div className="flex flex-col items-center justify-center py-16 bg-gray-50 border border-gray-200 rounded-lg">
          <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-700 font-medium">{file.name}</p>
          <p className="text-gray-400 text-sm mt-1">Document preview</p>
          <div className="mt-4 bg-white border border-gray-200 rounded-lg p-4 max-w-md w-full">
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-2 bg-gray-100 rounded" style={{ width: `${60 + (i * 7) % 35}%` }} />
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-4 text-center">PDF viewer coming soon</p>
          </div>
        </div>
      )}

      {!['video', 'audio', 'image', 'document', 'pdf'].includes(file.type) && (
        <div className="flex flex-col items-center justify-center py-16 bg-gray-50 border border-gray-200 rounded-lg">
          <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-700 font-medium">{file.name}</p>
          <p className="text-gray-400 text-sm mt-1 capitalize">{file.type} file</p>
          {file.url && (
            <a
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Download File
            </a>
          )}
        </div>
      )}
    </div>
  );
}
