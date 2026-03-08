'use client';
import { useState } from 'react';

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
  const topLevel = comments.filter((c) => !c.parentId);
  const rounds = {};
  for (const c of topLevel) {
    const round = c.revisionRound || c.revision_round || 1;
    if (!rounds[round]) rounds[round] = [];
    rounds[round].push(c);
  }
  return Object.entries(rounds)
    .map(([round, items]) => ({ round: parseInt(round), comments: items }))
    .sort((a, b) => a.round - b.round);
}

function getReplies(comments, parentId) {
  return comments.filter((c) => c.parentId === parentId);
}

function InlineReplyInput({ onSubmit, onCancel }) {
  const [text, setText] = useState('');
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSubmit(text);
    setText('');
  };
  return (
    <form onSubmit={handleSubmit} className="mt-2 flex gap-2">
      <input
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write a reply..."
        className="flex-1 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.9)' }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') onCancel();
        }}
      />
      <button
        type="submit"
        disabled={!text.trim()}
        className="px-2.5 py-1.5 text-xs font-medium rounded-lg disabled:opacity-40 transition-colors"
        style={{ background: CYAN, color: '#0a0a0f' }}
      >
        Reply
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="px-2 py-1.5 text-xs rounded-lg transition-colors"
        style={{ color: 'rgba(255,255,255,0.4)' }}
      >
        Cancel
      </button>
    </form>
  );
}

function ReplyCard({ comment }) {
  return (
    <div className="flex gap-2 mt-2 pl-3" style={{ borderLeft: '2px solid rgba(21,243,236,0.1)' }}>
      <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0" style={
        comment.authorRole === 'client'
          ? { background: 'rgba(21,243,236,0.12)', color: CYAN }
          : { background: CYAN, color: '#0a0a0f' }
      }>
        {comment.author?.charAt(0) || '?'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>{comment.author}</span>
          <span className="text-[10px] px-1 py-0.5 rounded" style={
            comment.authorRole === 'client'
              ? { background: 'rgba(21,243,236,0.08)', color: CYAN }
              : { background: 'rgba(21,243,236,0.12)', color: CYAN }
          }>
            {comment.authorRole}
          </span>
          <span className="text-[10px] ml-auto" style={{ color: 'rgba(255,255,255,0.3)' }}>{comment.createdAt}</span>
        </div>
        <p className="text-xs leading-relaxed mt-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>{comment.content}</p>
      </div>
    </div>
  );
}

function CommentCard({ comment, comments, fileType, onSeekToTimestamp, onReply }) {
  const [showReply, setShowReply] = useState(false);
  const hasTimestamp = typeof comment.timestamp === 'number';
  const hasImagePin = comment.timestamp && typeof comment.timestamp === 'object' && 'x' in comment.timestamp && !('time' in comment.timestamp);
  const hasVideoPin = comment.timestamp && typeof comment.timestamp === 'object' && 'x' in comment.timestamp && 'time' in comment.timestamp;
  const hasAnyPin = hasImagePin || hasVideoPin;

  const allPins = comments.filter((c) => !c.parentId && c.timestamp && typeof c.timestamp === 'object' && 'x' in c.timestamp);
  const pinNumber = hasAnyPin ? allPins.findIndex((c) => c.id === comment.id) + 1 : null;

  const replies = getReplies(comments, comment.id);

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

        {hasImagePin && pinNumber && (
          <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: CYAN, color: '#0a0a0f' }}>
            {pinNumber}
          </div>
        )}
      </div>

      {/* Content */}
      <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>{comment.content}</p>

      {/* Footer + reply button */}
      <div className="flex items-center justify-between mt-2">
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{comment.createdAt}</p>
        {!showReply && (
          <button
            onClick={() => setShowReply(true)}
            className="text-xs flex items-center gap-1 transition-colors"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
            Reply{replies.length > 0 ? ` (${replies.length})` : ''}
          </button>
        )}
      </div>

      {/* Replies */}
      {replies.map((reply) => (
        <ReplyCard key={reply.id} comment={reply} />
      ))}

      {/* Inline reply input */}
      {showReply && (
        <InlineReplyInput
          onSubmit={(text) => {
            onReply(comment.id, text);
            setShowReply(false);
          }}
          onCancel={() => setShowReply(false)}
        />
      )}
    </div>
  );
}

export default function CommentFeed({ comments, fileType, onSeekToTimestamp, currentRound = 1, fileVersions = [], onReply }) {
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

  // Map round number → version label (round 1 = V1, round 2 = V2, etc.)
  const roundVersionLabel = (round) => `V${round}`;

  // If only one round, just render flat
  if (!hasMultipleRounds) {
    return (
      <div className="space-y-3">
        {comments.filter((c) => !c.parentId).map((comment) => (
          <CommentCard
            key={comment.id}
            comment={comment}
            comments={comments}
            fileType={fileType}
            onSeekToTimestamp={onSeekToTimestamp}
            onReply={onReply}
          />
        ))}
      </div>
    );
  }

  // Multiple rounds — group with version headers
  return (
    <div className="space-y-4">
      {rounds.map(({ round, comments: roundComments }) => {
        const isCurrent = round === currentRound;
        const totalInRound = roundComments.length + comments.filter((c) => c.parentId && roundComments.some((rc) => rc.id === c.parentId)).length;

        return (
          <div key={round}>
            {/* Round header with version label */}
            <div className="flex items-center gap-2 mb-2">
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                style={{
                  background: isCurrent ? 'rgba(21,243,236,0.1)' : 'rgba(255,255,255,0.04)',
                  color: isCurrent ? CYAN : 'rgba(255,255,255,0.4)',
                  border: isCurrent ? '1px solid rgba(21,243,236,0.2)' : '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 4 23 10 17 10" />
                  <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
                </svg>
                {roundVersionLabel(round)} · Round {round}
              </div>
              <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {roundComments.length} {roundComments.length === 1 ? 'comment' : 'comments'}
              </span>
              {!isCurrent && (
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded"
                  style={{ background: 'rgba(22,255,192,0.08)', color: MINT }}
                >
                  resolved
                </span>
              )}
              {isCurrent && (
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded"
                  style={{ background: 'rgba(21,243,236,0.08)', color: CYAN }}
                >
                  current
                </span>
              )}
            </div>

            {/* Round comments */}
            <div className="space-y-2 pl-2" style={{ borderLeft: `2px solid ${isCurrent ? 'rgba(21,243,236,0.15)' : 'rgba(255,255,255,0.04)'}` }}>
              {roundComments.map((comment) => (
                <CommentCard
                  key={comment.id}
                  comment={comment}
                  comments={comments}
                  fileType={fileType}
                  onSeekToTimestamp={onSeekToTimestamp}
                  onReply={onReply}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
