'use client';
import dynamic from 'next/dynamic';
import ImageViewer from './ImageViewer';

const WaveformPlayer = dynamic(() => import('./WaveformPlayer'), { ssr: false });
const VideoPlayer = dynamic(() => import('./VideoPlayer'), { ssr: false });

const FILE_TYPE_CONFIG = {
  vector: {
    icon: (
      <svg className="w-16 h-16" style={{ color: 'rgba(255,255,255,0.15)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    ),
    label: 'Vector File',
    description: 'SVG / AI / EPS — open in your design tool',
  },
  design: {
    icon: (
      <svg className="w-16 h-16" style={{ color: 'rgba(255,255,255,0.15)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    ),
    label: 'Design File',
    description: 'Figma / Sketch / PSD — open in your design tool',
  },
  archive: {
    icon: (
      <svg className="w-16 h-16" style={{ color: 'rgba(255,255,255,0.15)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
    ),
    label: 'Archive',
    description: 'ZIP / RAR — download and extract to view',
  },
  other: {
    icon: (
      <svg className="w-16 h-16" style={{ color: 'rgba(255,255,255,0.15)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    label: 'File',
    description: 'Download to view on your device',
  },
};

function GenericFileCard({ file }) {
  const config = FILE_TYPE_CONFIG[file.type] || FILE_TYPE_CONFIG.other;
  return (
    <div className="flex flex-col items-center justify-center py-16 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="mb-4">{config.icon}</div>
      <p className="font-semibold text-base" style={{ color: 'rgba(255,255,255,0.9)' }}>{file.name}</p>
      <p className="text-sm font-medium mt-0.5" style={{ color: '#15f3ec' }}>{config.label}</p>
      <p className="text-xs mt-2 text-center max-w-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{config.description}</p>
      {file.url && (
        <a
          href={file.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg transition-colors shadow-sm"
          style={{ background: '#15f3ec', color: '#0a0a0f' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download
        </a>
      )}
      <div className="mt-4 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
        Use the comment section to leave feedback
      </div>
    </div>
  );
}

export default function FilePreview({ file, comments, onAddComment, onSeekToTimestamp }) {
  if (!file) {
    return (
      <div className="flex items-center justify-center h-full" style={{ color: 'rgba(255,255,255,0.4)' }}>
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4" style={{ color: 'rgba(255,255,255,0.15)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p style={{ color: 'rgba(255,255,255,0.4)' }}>Select a file to preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm font-medium truncate" style={{ color: 'rgba(255,255,255,0.7)' }}>{file.name}</span>
        <span className="text-xs flex-shrink-0 capitalize" style={{ color: 'rgba(255,255,255,0.4)' }}>{file.type}</span>
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
        <div className="flex flex-col gap-3">
          {file.url ? (
            <>
              {/* Try to embed via Google Docs Viewer */}
              <div className="rounded-lg overflow-hidden" style={{ height: '70vh', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <iframe
                  src={`https://docs.google.com/gview?url=${encodeURIComponent(file.url)}&embedded=true`}
                  className="w-full h-full"
                  title={file.name}
                  loading="lazy"
                  onError={() => {}}
                />
              </div>
              <div className="flex items-center justify-between text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                <span>Preview via Google Docs · some files may not load</span>
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium"
                  style={{ color: '#15f3ec' }}
                >
                  Open original →
                </a>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <svg className="w-16 h-16 mb-4" style={{ color: 'rgba(255,255,255,0.15)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>{file.name}</p>
              <p className="text-sm font-medium mt-0.5" style={{ color: '#15f3ec' }}>PDF / Document</p>
              <p className="text-xs mt-3" style={{ color: 'rgba(255,255,255,0.4)' }}>No preview available — leave feedback in the comments panel</p>
            </div>
          )}
        </div>
      )}

      {!['video', 'audio', 'image', 'document', 'pdf'].includes(file.type) && (
        <GenericFileCard file={file} />
      )}
    </div>
  );
}
