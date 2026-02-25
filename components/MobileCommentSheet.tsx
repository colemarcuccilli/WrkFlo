'use client';
import { useState, useEffect } from 'react';

interface MobileCommentSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { text: string; timestamp: any }) => void;
  currentTimestamp?: number | null;
  disabled?: boolean;
  fileType?: string;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function MobileCommentSheet({
  isOpen,
  onClose,
  onSubmit,
  currentTimestamp,
  disabled,
  fileType,
}: MobileCommentSheetProps) {
  const [text, setText] = useState('');
  const [pinTimestamp, setPinTimestamp] = useState(currentTimestamp ?? null);

  useEffect(() => {
    if (isOpen) {
      setPinTimestamp(currentTimestamp ?? null);
      setText('');
    }
  }, [isOpen, currentTimestamp]);

  const handleSubmit = () => {
    if (!text.trim() || disabled) return;
    onSubmit({ text, timestamp: pinTimestamp });
    setText('');
    onClose();
  };

  const isTimebased = fileType === 'video' || fileType === 'audio';

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
        onClick={onClose}
      />

      {/* Bottom sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl shadow-2xl md:hidden p-5 pb-safe" style={{ background: 'rgba(10,10,15,0.95)', border: '1px solid rgba(255,255,255,0.08)', borderBottom: 'none' }}>
        {/* Handle */}
        <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: 'rgba(255,255,255,0.08)' }} />

        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.9)' }}>Add Comment</h3>
            {isTimebased && pinTimestamp !== null && (
              <p className="text-xs mt-0.5" style={{ color: '#15f3ec' }}>
                Pinned at <span className="font-mono font-bold">{formatTime(pinTimestamp)}</span>
              </p>
            )}
          </div>
          <button onClick={onClose} style={{ color: 'rgba(255,255,255,0.4)' }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={disabled ? 'File is locked' : 'Share your thoughts...'}
          disabled={disabled}
          rows={4}
          autoFocus
          className="w-full rounded-xl px-4 py-3 text-sm resize-none focus:outline-none"
          style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.9)' }}
        />

        <div className="flex gap-3 mt-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 text-sm font-medium rounded-xl transition-colors"
            style={{ border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={disabled || !text.trim()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 disabled:opacity-50 text-sm font-medium rounded-xl transition-colors"
            style={{ background: '#15f3ec', color: '#0a0a0f' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            Post Comment
          </button>
        </div>
      </div>
    </>
  );
}
