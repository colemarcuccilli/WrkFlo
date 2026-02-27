'use client';

const CYAN = '#15f3ec';
const MINT = '#16ffc0';

function formatTime(seconds) {
  if (seconds === null || seconds === undefined) return null;
  if (typeof seconds !== 'number') return null;
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function groupByRound(comments) {
  const rounds = {};
  for (const c of comments) {
    const round = c.revisionRound || c.revision_round || 1;
    if (!rounds[round]) rounds[round] = [];
    rounds[round].push(c);
  }
  return Object.entries(rounds)
    .map(([round, items]) => ({ round: parseInt(round), comments: items }))
    .sort((a, b) => a.round - b.round);
}

function CommentCard({ comment, comments, fileType, onSeekToTimestamp }) {
  const hasTimestamp = typeof comment.timestamp === 'number';
  const hasImagePin = comment.timestamp && typeof comment.timestamp === 'object' && 'x' in comment.timestamp && !('time' in comment.timestamp);
  const hasVideoPin = comment.timestamp && typeof comment.timestamp === 'object' && 'x' in comment.timestamp && 'time' in comment.timestamp;
  const hasAnyPin = hasImagePin || hasVideoPin;

  const allPins = comments.filter((c) => c.timestamp && typeof c.timestamp === 'object' && 'x' in c.timestamp);
  const pinNumber = hasAnyPin ? allPins.findIndex((c) => c.id === comment.id) + 1 : null;

  return (
    <div className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={
            comment.authorRole === 'client'
              ? { background: 'rgba(21,243,236,0.12)', color: CYAN }
              : { background: CYAN, color: '#0a0a0f' }
          }>
            {comment.author?.charAt(0) || '?'}
          </div>
          <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.9)' }}>{comment.author}</span>
          <span className="text-xs px-1.5 py-0.5 rounded" style={
            comment.authorRole === 'client'
              ? { background: 'rgba(21,243,236,0.08)', color: CYAN }
              : { background: 'rgba(21,243,236,0.12)', color: CYAN }
          }>
            {comment.authorRole}
          </span>
        </div>

        {/* Time-only comment: timestamp button */}
        {hasTimestamp && (
          <button
            onClick={() => onSeekToTimestamp && onSeekToTimestamp(comment.timestamp)}
            className="text-xs font-mono px-2 py-0.5 rounded transition-colors"
            style={{ color: CYAN, background: 'rgba(21,243,236,0.08)' }}
            title="Jump to this timestamp"
          >
            ▶ {formatTime(comment.timestamp)}
          </button>
        )}

        {/* Video pin: pin number + timestamp */}
        {hasVideoPin && pinNumber && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onSeekToTimestamp && onSeekToTimestamp(comment.timestamp)}
              className="text-[10px] font-mono px-1.5 py-0.5 rounded transition-colors"
              style={{ color: CYAN, background: 'rgba(21,243,236,0.08)' }}
              title="Jump to this pin"
            >
              ▶ {formatTime(comment.timestamp.time)}
            </button>
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: CYAN, color: '#0a0a0f' }}>
              {pinNumber}
            </div>
          </div>
        )}

        {/* Image pin: pin number only */}
        {hasImagePin && pinNumber && (
          <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: CYAN, color: '#0a0a0f' }}>
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
}

export default function CommentFeed({ comments, fileType, onSeekToTimestamp, currentRound = 1 }) {
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

  const rounds = groupByRound(comments);
  const hasMultipleRounds = rounds.length > 1 || (rounds.length === 1 && rounds[0].round > 1);

  // If only one round, just render flat
  if (!hasMultipleRounds) {
    return (
      <div className="space-y-3">
        {comments.map((comment) => (
          <CommentCard
            key={comment.id}
            comment={comment}
            comments={comments}
            fileType={fileType}
            onSeekToTimestamp={onSeekToTimestamp}
          />
        ))}
      </div>
    );
  }

  // Multiple rounds — group with headers
  return (
    <div className="space-y-4">
      {rounds.map(({ round, comments: roundComments }) => (
        <div key={round}>
          {/* Round header */}
          <div className="flex items-center gap-2 mb-2">
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{
                background: round === currentRound
                  ? 'rgba(21,243,236,0.1)'
                  : 'rgba(255,255,255,0.04)',
                color: round === currentRound ? CYAN : 'rgba(255,255,255,0.4)',
                border: round === currentRound
                  ? '1px solid rgba(21,243,236,0.2)'
                  : '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
              </svg>
              Round {round}
            </div>
            <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {roundComments.length} {roundComments.length === 1 ? 'comment' : 'comments'}
            </span>
            {round < currentRound && (
              <span
                className="text-[10px] px-1.5 py-0.5 rounded"
                style={{ background: 'rgba(22,255,192,0.08)', color: MINT }}
              >
                resolved
              </span>
            )}
          </div>

          {/* Round comments */}
          <div className="space-y-2 pl-2" style={{ borderLeft: `2px solid ${round === currentRound ? 'rgba(21,243,236,0.15)' : 'rgba(255,255,255,0.04)'}` }}>
            {roundComments.map((comment) => (
              <CommentCard
                key={comment.id}
                comment={comment}
                comments={comments}
                fileType={fileType}
                onSeekToTimestamp={onSeekToTimestamp}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
