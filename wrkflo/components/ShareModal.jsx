'use client';
import { useState } from 'react';

export default function ShareModal({ project, onClose, onSetPassword = null }) {
  const [copied, setCopied] = useState(false);
  const [msgCopied, setMsgCopied] = useState(false);
  const [showPasswordPanel, setShowPasswordPanel] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);

  const reviewUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/review/${project.reviewToken || project.review_token}`
    : `/review/${project.reviewToken || project.review_token}`;

  const prewrittenMessage = `Hey! I've finished your ${project.name} and it's ready for your review.\n\nClick here to view the files, leave comments, and approve: ${reviewUrl}\n\nNo account needed — just click the link. Let me know if you have any questions!`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(reviewUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(prewrittenMessage);
      setMsgCopied(true);
      setTimeout(() => setMsgCopied(false), 2000);
    } catch {}
  };

  const shareNative = async () => {
    if (navigator.share) {
      await navigator.share({
        title: `Review ${project.name}`,
        text: prewrittenMessage,
        url: reviewUrl,
      });
    } else {
      copyLink();
    }
  };

  const handleSavePassword = async () => {
    setPasswordSaving(true);
    try {
      await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ review_password: password || null }),
      });
      setPasswordSaved(true);
      setTimeout(() => setPasswordSaved(false), 2000);
    } catch {}
    setPasswordSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-gray-900">Share with Client</h2>
            <p className="text-xs text-gray-500 mt-0.5">{project.client || project.client_name} • {project.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Review link */}
        <div className="mb-4">
          <p className="text-xs font-medium text-gray-700 mb-2">Review Link</p>
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg p-3">
            <span className="flex-1 text-sm text-gray-600 truncate font-mono">{reviewUrl}</span>
            <button
              onClick={copyLink}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                copied
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-orange-600 hover:bg-orange-500 text-white'
              }`}
            >
              {copied ? (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </>
              )}
            </button>
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <p className="text-xs text-gray-400">✓ No account required for your client</p>
            <button
              onClick={() => setShowPasswordPanel(!showPasswordPanel)}
              className="text-xs text-gray-400 hover:text-orange-600 transition-colors"
            >
              {showPasswordPanel ? 'Hide' : '🔒 Add password'}
            </button>
          </div>
        </div>

        {/* Password Panel */}
        {showPasswordPanel && (
          <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-xs font-medium text-gray-700 mb-2">Optional Password Protection</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Set a password (or leave blank to remove)"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-400"
              />
              <button
                onClick={handleSavePassword}
                disabled={passwordSaving}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  passwordSaved
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-orange-600 hover:bg-orange-500 text-white'
                }`}
              >
                {passwordSaved ? '✓' : passwordSaving ? '...' : 'Save'}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1.5">Client will be prompted for this password before viewing</p>
          </div>
        )}

        {/* Pre-written message */}
        <div className="mb-5">
          <p className="text-xs font-medium text-gray-700 mb-2">Or copy a ready-to-send message</p>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">{prewrittenMessage}</p>
          </div>
          <button
            onClick={copyMessage}
            className={`mt-2 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
              msgCopied
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {msgCopied ? '✓ Message copied!' : 'Copy message'}
          </button>
        </div>

        {/* Share button */}
        <button
          onClick={shareNative}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share
        </button>
      </div>
    </div>
  );
}
