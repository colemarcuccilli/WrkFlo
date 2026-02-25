'use client';
import { useState } from 'react';

export default function CommentInput({ onSubmit, disabled, placeholder = 'Add a comment...' }) {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSubmit({ text, timestamp: null });
    setText('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={disabled}
        placeholder={disabled ? 'This file is locked — feedback disabled' : placeholder}
        rows={3}
        className="w-full rounded-lg px-3 py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed resize-none focus:outline-none"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.9)' }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            handleSubmit(e);
          }
        }}
      />
      <div className="flex items-center justify-between">
        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>⌘↩ to submit</span>
        <button
          type="submit"
          disabled={disabled || !text.trim()}
          className="px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
          style={{ background: '#15f3ec', color: '#0a0a0f' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          Comment
        </button>
      </div>
    </form>
  );
}
