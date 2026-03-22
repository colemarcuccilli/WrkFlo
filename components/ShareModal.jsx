'use client';
import { useState, useEffect } from 'react';

export default function ShareModal({ project, onClose, onSetPassword = null }) {
  const [copied, setCopied] = useState(false);
  const [msgCopied, setMsgCopied] = useState(false);
  const [clients, setClients] = useState([]);
  const [assignedIds, setAssignedIds] = useState(new Set());
  const [loadingClients, setLoadingClients] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordEnabled, setPasswordEnabled] = useState(!!project.review_password);
  const [passwordValue, setPasswordValue] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState(project.review_password ? 'set' : 'none'); // 'none' | 'set' | 'saved'

  const token = project.reviewToken || project.review_token;
  const reviewUrl = token
    ? (typeof window !== 'undefined' ? `${window.location.origin}/review/${token}` : `/review/${token}`)
    : null;

  const prewrittenMessage = reviewUrl
    ? `Hey! I've finished your ${project.name} and it's ready for your review.\n\nClick here to view the files, leave comments, and approve: ${reviewUrl}\n\nSign in with your account to access the review. Let me know if you have any questions!`
    : `Review link is being generated for ${project.name}. Please try again in a moment.`;

  useEffect(() => {
    // Fetch creator's clients and which ones have access to this project
    fetch('/api/clients')
      .then((r) => r.json())
      .then((data) => {
        const activeClients = (data.clients || []).filter((c) => c.status !== 'revoked');
        setClients(activeClients);

        // Check which clients have access to this project
        const assigned = new Set();
        activeClients.forEach((c) => {
          if (c.client_project_access?.some((a) => a.project_id === project.id)) {
            assigned.add(c.id);
          }
        });
        setAssignedIds(assigned);
        setLoadingClients(false);
      })
      .catch(() => setLoadingClients(false));
  }, [project.id]);

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

  const toggleClientAccess = async (clientRecord) => {
    setSaving(true);
    const isAssigned = assignedIds.has(clientRecord.id);

    if (isAssigned) {
      await fetch(`/api/clients/${clientRecord.id}/projects/${project.id}`, { method: 'DELETE' });
      setAssignedIds((prev) => { const next = new Set(prev); next.delete(clientRecord.id); return next; });
    } else {
      const res = await fetch(`/api/clients/${clientRecord.id}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: project.id }),
      });
      if (res.ok) {
        setAssignedIds((prev) => new Set(prev).add(clientRecord.id));
      }
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold" style={{ color: 'rgba(255,255,255,0.9)' }}>Share with Client</h2>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{project.client || project.client_name} &bull; {project.name}</p>
          </div>
          <button onClick={onClose} className="transition-colors" style={{ color: 'rgba(255,255,255,0.4)' }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Client access section */}
        <div className="mb-4">
          <p className="text-xs font-medium mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>Assign to Client</p>
          {loadingClients ? (
            <div className="text-xs p-3 rounded-lg" style={{ color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.03)' }}>Loading clients...</div>
          ) : clients.length === 0 ? (
            <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>No clients yet.</p>
              <a href="/clients" className="text-xs font-medium" style={{ color: '#15f3ec' }}>
                Invite your first client →
              </a>
            </div>
          ) : (
            <div className="space-y-1.5">
              {clients.map((client) => (
                <button
                  key={client.id}
                  onClick={() => toggleClientAccess(client)}
                  disabled={saving}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg border text-left transition-colors"
                  style={
                    assignedIds.has(client.id)
                      ? { borderColor: 'rgba(21,243,236,0.3)', background: 'rgba(21,243,236,0.08)' }
                      : { borderColor: 'rgba(255,255,255,0.08)' }
                  }
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'rgba(21,243,236,0.12)', color: '#15f3ec' }}>
                      {client.client_email[0].toUpperCase()}
                    </div>
                    <span className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{client.client_email}</span>
                  </div>
                  <div className="w-4 h-4 rounded border-2 flex items-center justify-center" style={
                    assignedIds.has(client.id)
                      ? { borderColor: '#15f3ec', background: '#15f3ec' }
                      : { borderColor: 'rgba(255,255,255,0.3)' }
                  }>
                    {assignedIds.has(client.id) && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
              <a href="/clients" className="block text-xs font-medium mt-2 ml-1" style={{ color: '#15f3ec' }}>
                + Invite new client
              </a>
            </div>
          )}
        </div>

        {/* Review link */}
        <div className="mb-4">
          <p className="text-xs font-medium mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>Review Link</p>
          {!reviewUrl ? (
            <div className="rounded-lg p-3" style={{ background: 'rgba(255,80,80,0.06)', border: '1px solid rgba(255,80,80,0.15)' }}>
              <p className="text-xs" style={{ color: '#ff6b6b' }}>Review token not found. Try refreshing the page or recreating this project.</p>
            </div>
          ) : (
          <>
          <div className="flex items-center gap-2 rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <span className="flex-1 text-sm truncate font-mono" style={{ color: 'rgba(255,255,255,0.6)' }}>{reviewUrl}</span>
            <button
              onClick={copyLink}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
              style={
                copied
                  ? { background: 'rgba(22,255,192,0.12)', color: '#16ffc0' }
                  : { background: '#15f3ec', color: '#0a0a0f' }
              }
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
          <p className="text-xs mt-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Clients must be signed in to access the review</p>
          </>
          )}
        </div>

        {/* Password Protection */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>Password Protection</p>
            {passwordStatus === 'set' || passwordStatus === 'saved' ? (
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(21,243,236,0.12)', color: '#15f3ec' }}>Protected</span>
            ) : (
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>No password</span>
            )}
          </div>
          <div className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <label className="flex items-center gap-3 cursor-pointer">
              <button
                type="button"
                onClick={async () => {
                  const newEnabled = !passwordEnabled;
                  setPasswordEnabled(newEnabled);
                  if (!newEnabled && (passwordStatus === 'set' || passwordStatus === 'saved')) {
                    setPasswordSaving(true);
                    try {
                      await fetch(`/api/projects/${project.id}/password`, { method: 'DELETE' });
                      setPasswordStatus('none');
                      setPasswordValue('');
                    } catch {}
                    setPasswordSaving(false);
                  }
                }}
                className="relative w-9 h-5 rounded-full transition-colors flex-shrink-0"
                style={{ background: passwordEnabled ? '#15f3ec' : 'rgba(255,255,255,0.15)' }}
              >
                <div
                  className="absolute top-0.5 w-4 h-4 rounded-full transition-all"
                  style={{
                    background: passwordEnabled ? '#0a0a0f' : 'rgba(255,255,255,0.4)',
                    left: passwordEnabled ? '18px' : '2px',
                  }}
                />
              </button>
              <span className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>Require password to access review</span>
            </label>
            {passwordEnabled && (
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="text"
                  value={passwordValue}
                  onChange={(e) => setPasswordValue(e.target.value)}
                  placeholder={passwordStatus === 'set' || passwordStatus === 'saved' ? 'Enter new password to change' : 'Enter a password'}
                  className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.9)',
                  }}
                />
                <button
                  onClick={async () => {
                    if (!passwordValue.trim()) return;
                    setPasswordSaving(true);
                    try {
                      const res = await fetch(`/api/projects/${project.id}/password`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ password: passwordValue.trim() }),
                      });
                      if (res.ok) {
                        setPasswordStatus('saved');
                        setPasswordValue('');
                      }
                    } catch {}
                    setPasswordSaving(false);
                  }}
                  disabled={passwordSaving || !passwordValue.trim()}
                  className="px-3 py-2 rounded-lg text-sm font-medium transition-all flex-shrink-0"
                  style={{
                    background: passwordValue.trim() ? '#15f3ec' : 'rgba(255,255,255,0.06)',
                    color: passwordValue.trim() ? '#0a0a0f' : 'rgba(255,255,255,0.3)',
                    opacity: passwordSaving ? 0.7 : 1,
                  }}
                >
                  {passwordSaving ? '...' : 'Set'}
                </button>
              </div>
            )}
            {passwordEnabled && passwordStatus === 'saved' && !passwordValue && (
              <p className="text-xs mt-2" style={{ color: '#16ffc0' }}>Password saved successfully</p>
            )}
          </div>
        </div>

        {/* Pre-written message */}
        <div className="mb-5">
          <p className="text-xs font-medium mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>Or copy a ready-to-send message</p>
          <div className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-xs leading-relaxed whitespace-pre-line" style={{ color: 'rgba(255,255,255,0.6)' }}>{prewrittenMessage}</p>
          </div>
          <button
            onClick={copyMessage}
            className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border"
            style={
              msgCopied
                ? { background: 'rgba(22,255,192,0.08)', borderColor: 'rgba(22,255,192,0.2)', color: '#16ffc0' }
                : { background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }
            }
          >
            {msgCopied ? 'Message copied!' : 'Copy message'}
          </button>
        </div>

        {/* Share button */}
        <button
          onClick={shareNative}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors"
          style={{ background: '#15f3ec', color: '#0a0a0f' }}
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
