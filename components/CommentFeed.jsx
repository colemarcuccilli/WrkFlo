'use client';

function formatTime(seconds) {
  if (seconds === null || seconds === undefined) return null;
  if (typeof seconds !== 'number') return null;
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function CommentFeed({ comments, fileType, onSeekToTimestamp }) {
  if (!comments || comments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <svg className="w-8 h-8 mb-3" style={{ color: 'rgba(255,255,255,0.15)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>No comments yet</p>
        <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {fileType === 'image' ? 'Click on the image to pin a comment' : 'Click on the timeline to add a comment'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {comments.map((comment, idx) => {
        const hasTimestamp = typeof comment.timestamp === 'number';
        const hasPin = comment.timestamp && typeof comment.timestamp === 'object' && 'x' in comment.timestamp;
        const pinNumber = hasPin
          ? comments.filter((c) => c.timestamp && typeof c.timestamp === 'object').findIndex((c) => c.id === comment.id) + 1
          : null;

        return (
          <div key={comment.id} className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={
                  comment.authorRole === 'client'
                    ? { background: 'rgba(21,243,236,0.12)', color: '#15f3ec' }
                    : { background: '#15f3ec', color: '#0a0a0f' }
                }>
                  {comment.author.charAt(0)}
                </div>
                <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.9)' }}>{comment.author}</span>
                <span className="text-xs px-1.5 py-0.5 rounded" style={
                  comment.authorRole === 'client'
                    ? { background: 'rgba(21,243,236,0.08)', color: '#15f3ec' }
                    : { background: 'rgba(21,243,236,0.12)', color: '#15f3ec' }
                }>
                  {comment.authorRole}
                </span>
              </div>

              {/* Timestamp / pin badge */}
              {hasTimestamp && (
                <button
                  onClick={() => onSeekToTimestamp && onSeekToTimestamp(comment.timestamp)}
                  className="text-xs font-mono px-2 py-0.5 rounded transition-colors"
                  style={{ color: '#15f3ec', background: 'rgba(21,243,236,0.08)' }}
                  title="Jump to this timestamp"
                >
                  ▶ {formatTime(comment.timestamp)}
                </button>
              )}
              {hasPin && pinNumber && (
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style={
                  comment.authorRole === 'client'
                    ? { background: '#15f3ec', color: '#0a0a0f' }
                    : { background: '#15f3ec', color: '#0a0a0f' }
                }>
                  {pinNumber}
                </div>
              )}
            </div>

            {/* Content */}
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>{comment.content}</p>

            {/* Footer */}
            <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.4)' }}>{comment.createdAt}</p>
          </div>
        );
      })}
    </div>
  );
}
