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
        <svg className="w-8 h-8 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        <p className="text-sm text-gray-500">No comments yet</p>
        <p className="text-xs text-gray-400 mt-1">
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
          <div key={comment.id} className="bg-gray-50 border border-gray-100 rounded-lg p-3">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  comment.authorRole === 'client'
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-orange-500 text-white'
                }`}>
                  {comment.author.charAt(0)}
                </div>
                <span className="text-sm font-medium text-gray-900">{comment.author}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded ${
                  comment.authorRole === 'client'
                    ? 'bg-orange-50 text-orange-600'
                    : 'bg-orange-100 text-orange-700'
                }`}>
                  {comment.authorRole}
                </span>
              </div>

              {/* Timestamp / pin badge */}
              {hasTimestamp && (
                <button
                  onClick={() => onSeekToTimestamp && onSeekToTimestamp(comment.timestamp)}
                  className="text-xs font-mono text-orange-500 hover:text-orange-600 bg-orange-50 hover:bg-orange-100 px-2 py-0.5 rounded transition-colors"
                  title="Jump to this timestamp"
                >
                  ▶ {formatTime(comment.timestamp)}
                </button>
              )}
              {hasPin && pinNumber && (
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                  comment.authorRole === 'client' ? 'bg-orange-500 text-white' : 'bg-orange-600 text-white'
                }`}>
                  {pinNumber}
                </div>
              )}
            </div>

            {/* Content */}
            <p className="text-sm text-gray-700 leading-relaxed">{comment.content}</p>

            {/* Footer */}
            <p className="text-xs text-gray-400 mt-2">{comment.createdAt}</p>
          </div>
        );
      })}
    </div>
  );
}
