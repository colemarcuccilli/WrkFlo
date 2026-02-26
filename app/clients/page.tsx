'use client';
import { useState, useEffect } from 'react';
import AppHeader from '@/components/AppHeader';

/* ── Brand tokens (inline) ── */
const CYAN = '#15f3ec';
const BLUE = '#5bc7f9';
const MINT = '#16ffc0';
const BG = '#0a0a0f';
const CARD_BG = 'rgba(255,255,255,0.03)';
const CARD_BORDER = 'rgba(255,255,255,0.06)';
const TEXT_PRIMARY = 'rgba(255,255,255,0.9)';
const TEXT_SECONDARY = 'rgba(255,255,255,0.6)';
const TEXT_TERTIARY = 'rgba(255,255,255,0.4)';

function InviteModal({ onClose, onInvited }: { onClose: () => void; onInvited: () => void }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to invite client');
      } else {
        setSent(true);
        onInvited();
      }
    } catch {
      setError('Something went wrong');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)' }} onClick={onClose}>
      <div
        className="rounded-2xl w-full max-w-md p-6"
        style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${CARD_BORDER}`, boxShadow: '0 25px 50px rgba(0,0,0,0.5)', backdropFilter: 'blur(20px)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold" style={{ color: TEXT_PRIMARY }}>Invite Client</h2>
            <p className="text-xs mt-0.5" style={{ color: TEXT_SECONDARY }}>They&apos;ll get access to projects you assign them.</p>
          </div>
          <button onClick={onClose} className="transition-colors" style={{ color: TEXT_TERTIARY }} onMouseEnter={(e) => (e.currentTarget.style.color = TEXT_PRIMARY)} onMouseLeave={(e) => (e.currentTarget.style.color = TEXT_TERTIARY)}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {sent ? (
          <div className="text-center py-6">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(22,255,192,0.1)' }}>
              <svg className="w-7 h-7" style={{ color: MINT }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-base font-semibold mb-1" style={{ color: TEXT_PRIMARY }}>Client Invited!</h3>
            <p className="text-sm mb-5" style={{ color: TEXT_SECONDARY }}>
              <span className="font-medium" style={{ color: TEXT_PRIMARY }}>{email}</span> has been added.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-medium rounded-lg transition-all"
              style={{ background: `linear-gradient(135deg, ${CYAN}, ${MINT})`, color: '#0a0a0f' }}
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleInvite} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: TEXT_SECONDARY }}>Client Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@company.com"
                required
                className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: `1px solid rgba(255,255,255,0.1)`,
                  color: TEXT_PRIMARY,
                  caretColor: CYAN,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = CYAN;
                  e.currentTarget.style.boxShadow = `0 0 0 2px rgba(21,243,236,0.15)`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>
            {error && (
              <div className="p-3 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <p className="text-sm" style={{ color: '#f87171' }}>{error}</p>
              </div>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 text-sm font-medium rounded-xl transition-all"
                style={{ border: `1px solid rgba(255,255,255,0.1)`, color: TEXT_SECONDARY, background: 'transparent' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all disabled:opacity-50"
                style={{ background: `linear-gradient(135deg, ${CYAN}, ${MINT})`, color: '#0a0a0f', boxShadow: `0 4px 15px rgba(21,243,236,0.25)` }}
              >
                {loading ? 'Inviting...' : 'Send Invite'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function AssignProjectModal({
  clientRecord,
  onClose,
  onAssigned,
}: {
  clientRecord: any;
  onClose: () => void;
  onAssigned: () => void;
}) {
  const [projects, setProjects] = useState<any[]>([]);
  const [assignedIds, setAssignedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/projects').then((r) => r.json()),
      fetch(`/api/clients/${clientRecord.id}/projects`).then((r) => r.json()),
    ]).then(([allProjects, assigned]) => {
      setProjects(Array.isArray(allProjects) ? allProjects : []);
      const ids = new Set<string>((assigned || []).map((a: any) => a.project_id));
      setAssignedIds(ids);
      setLoading(false);
    });
  }, [clientRecord.id]);

  const toggleProject = async (projectId: string) => {
    setSaving(true);
    if (assignedIds.has(projectId)) {
      await fetch(`/api/clients/${clientRecord.id}/projects/${projectId}`, { method: 'DELETE' });
      setAssignedIds((prev) => { const next = new Set(prev); next.delete(projectId); return next; });
    } else {
      const res = await fetch(`/api/clients/${clientRecord.id}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId }),
      });
      if (res.ok) {
        setAssignedIds((prev) => new Set(prev).add(projectId));
      }
    }
    setSaving(false);
    onAssigned();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)' }} onClick={onClose}>
      <div
        className="rounded-2xl w-full max-w-md p-6 max-h-[80vh] overflow-y-auto"
        style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${CARD_BORDER}`, boxShadow: '0 25px 50px rgba(0,0,0,0.5)', backdropFilter: 'blur(20px)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold" style={{ color: TEXT_PRIMARY }}>Assign Projects</h2>
            <p className="text-xs mt-0.5" style={{ color: TEXT_SECONDARY }}>{clientRecord.client_email}</p>
          </div>
          <button onClick={onClose} className="transition-colors" style={{ color: TEXT_TERTIARY }} onMouseEnter={(e) => (e.currentTarget.style.color = TEXT_PRIMARY)} onMouseLeave={(e) => (e.currentTarget.style.color = TEXT_TERTIARY)}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="py-8 text-center text-sm" style={{ color: TEXT_TERTIARY }}>Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="py-8 text-center text-sm" style={{ color: TEXT_TERTIARY }}>No projects yet. Create a project first.</div>
        ) : (
          <div className="space-y-2">
            {projects.map((p: any) => {
              const isAssigned = assignedIds.has(p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => toggleProject(p.id)}
                  disabled={saving}
                  className="w-full flex items-center justify-between p-3 rounded-lg transition-colors text-left"
                  style={{
                    border: isAssigned ? `1px solid rgba(21,243,236,0.3)` : `1px solid rgba(255,255,255,0.08)`,
                    background: isAssigned ? 'rgba(21,243,236,0.08)' : 'transparent',
                  }}
                  onMouseEnter={(e) => { if (!isAssigned) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
                  onMouseLeave={(e) => { if (!isAssigned) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                >
                  <div>
                    <p className="text-sm font-medium" style={{ color: TEXT_PRIMARY }}>{p.name}</p>
                    <p className="text-xs" style={{ color: TEXT_TERTIARY }}>{p.client_name || 'No client'}</p>
                  </div>
                  <div
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                    style={{
                      borderColor: isAssigned ? CYAN : 'rgba(255,255,255,0.2)',
                      background: isAssigned ? CYAN : 'transparent',
                    }}
                  >
                    {isAssigned && (
                      <svg className="w-3 h-3" style={{ color: '#0a0a0f' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-4 w-full px-4 py-2.5 text-sm font-medium rounded-lg transition-all"
          style={{ background: `linear-gradient(135deg, ${CYAN}, ${MINT})`, color: '#0a0a0f' }}
        >
          Done
        </button>
      </div>
    </div>
  );
}

export default function ClientsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [assignClient, setAssignClient] = useState<any>(null);

  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchClients = () => {
    setFetchError(null);
    fetch('/api/clients')
      .then((r) => r.json())
      .then((d) => {
        if (d.error) {
          setFetchError(d.error);
        } else {
          setData(d);
        }
        setLoading(false);
      })
      .catch((err) => {
        setFetchError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => { fetchClients(); }, []);

  const [resending, setResending] = useState<string | null>(null);

  const handleRevoke = async (clientId: string) => {
    if (!confirm('Revoke this client? They will lose access to all assigned projects.')) return;
    await fetch(`/api/clients/${clientId}`, { method: 'DELETE' });
    fetchClients();
  };

  const handleCancel = async (clientId: string) => {
    if (!confirm('Cancel this invite? The client record will be deleted and you can re-invite later.')) return;
    await fetch(`/api/clients/${clientId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'cancel' }),
    });
    fetchClients();
  };

  const handleResend = async (clientId: string) => {
    setResending(clientId);
    const res = await fetch(`/api/clients/${clientId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'resend' }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || 'Failed to resend');
    }
    setResending(null);
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, { bg: string; color: string; border: string }> = {
      active: { bg: 'rgba(22,255,192,0.1)', color: MINT, border: 'rgba(22,255,192,0.2)' },
      pending: { bg: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: 'rgba(251,191,36,0.2)' },
      revoked: { bg: 'rgba(239,68,68,0.1)', color: '#f87171', border: 'rgba(239,68,68,0.2)' },
    };
    const s = styles[status] || styles.pending;
    return { background: s.bg, color: s.color, border: `1px solid ${s.border}` };
  };

  return (
    <div className="min-h-screen" style={{ background: BG }}>
      <AppHeader />

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: TEXT_PRIMARY }}>Clients</h1>
            <p className="mt-1" style={{ color: TEXT_SECONDARY }}>Manage client access to your projects.</p>
          </div>
          <button
            onClick={() => setShowInvite(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all"
            style={{ background: `linear-gradient(135deg, ${CYAN}, ${MINT})`, color: '#0a0a0f', boxShadow: `0 4px 15px rgba(21,243,236,0.25)` }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Invite Client
          </button>
        </div>

        {/* Subscription summary */}
        {data && (
          <div className="rounded-2xl p-5 mb-6" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs mb-1" style={{ color: TEXT_TERTIARY }}>Current Plan</p>
                <p className="text-lg font-bold" style={{ color: TEXT_PRIMARY }}>{data.tier?.name || 'Starter'}</p>
              </div>
              <div className="text-right">
                <p className="text-xs mb-1" style={{ color: TEXT_TERTIARY }}>Clients Used</p>
                <p className="text-lg font-bold" style={{ color: TEXT_PRIMARY }}>
                  {data.usage?.clientsUsed || 0}
                  <span className="font-normal" style={{ color: TEXT_TERTIARY }}>/{data.usage?.maxClients || 5}</span>
                </p>
              </div>
            </div>
            <div className="mt-3 w-full rounded-full h-1.5" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: `${Math.min(100, ((data.usage?.clientsUsed || 0) / (data.usage?.maxClients || 5)) * 100)}%`,
                  background: `linear-gradient(90deg, ${CYAN}, ${BLUE})`,
                }}
              />
            </div>
          </div>
        )}

        {/* Error display */}
        {fetchError && (
          <div className="rounded-2xl p-5 mb-6" style={{ background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.2)' }}>
            <p className="text-sm font-medium" style={{ color: '#ff6b6b' }}>Error loading clients: {fetchError}</p>
            <button onClick={fetchClients} className="mt-2 text-xs font-medium px-3 py-1.5 rounded-lg" style={{ background: 'rgba(255,80,80,0.15)', color: '#ff6b6b' }}>
              Retry
            </button>
          </div>
        )}

        {/* Client list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl p-5 animate-pulse" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
                <div className="h-4 rounded w-1/3 mb-2" style={{ background: 'rgba(255,255,255,0.06)' }} />
                <div className="h-3 rounded w-1/4" style={{ background: 'rgba(255,255,255,0.04)' }} />
              </div>
            ))}
          </div>
        ) : !data?.clients?.length ? (
          <div className="rounded-2xl p-12 text-center" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(21,243,236,0.08)' }}>
              <svg className="w-8 h-8" style={{ color: CYAN }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold mb-1" style={{ color: TEXT_PRIMARY }}>No clients yet</h3>
            <p className="text-sm mb-4" style={{ color: TEXT_SECONDARY }}>Invite your first client to get started.</p>
            <button
              onClick={() => setShowInvite(true)}
              className="px-4 py-2 text-sm font-medium rounded-lg transition-all"
              style={{ background: `linear-gradient(135deg, ${CYAN}, ${MINT})`, color: '#0a0a0f' }}
            >
              Invite Client
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {data.clients.map((client: any) => (
              <div key={client.id} className="rounded-2xl p-5" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{ background: 'rgba(21,243,236,0.1)', color: CYAN }}
                    >
                      {client.client_email[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: TEXT_PRIMARY }}>{client.client_email}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-medium"
                          style={statusBadge(client.status)}
                        >
                          {client.status}
                        </span>
                        <span className="text-xs" style={{ color: TEXT_TERTIARY }}>
                          {(client.client_project_access || []).length} project{(client.client_project_access || []).length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {client.status === 'pending' && (
                      <button
                        onClick={() => handleResend(client.id)}
                        disabled={resending === client.id}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg transition-all disabled:opacity-50"
                        style={{ border: `1px solid rgba(21,243,236,0.2)`, color: CYAN, background: 'transparent' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(21,243,236,0.08)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        {resending === client.id ? 'Sending...' : 'Resend Invite'}
                      </button>
                    )}
                    {client.status === 'pending' && (
                      <button
                        onClick={() => handleCancel(client.id)}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg transition-all"
                        style={{ border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', background: 'transparent' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        Cancel Invite
                      </button>
                    )}
                    {client.status === 'active' && (
                      <>
                        <button
                          onClick={() => setAssignClient(client)}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg transition-all"
                          style={{ border: `1px solid rgba(255,255,255,0.1)`, color: TEXT_SECONDARY, background: 'transparent' }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                        >
                          Assign Projects
                        </button>
                        <button
                          onClick={() => handleRevoke(client.id)}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg transition-all"
                          style={{ border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', background: 'transparent' }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                          Revoke
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showInvite && <InviteModal onClose={() => setShowInvite(false)} onInvited={fetchClients} />}
      {assignClient && (
        <AssignProjectModal
          clientRecord={assignClient}
          onClose={() => setAssignClient(null)}
          onAssigned={fetchClients}
        />
      )}
    </div>
  );
}
