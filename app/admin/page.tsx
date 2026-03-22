'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { isAdmin } from '@/lib/admin'

/* ── Brand palette ─────────────────────────────────── */
const CYAN = '#15f3ec'
const MINT = '#16ffc0'
const BG = '#0a0a0f'
const cardBg = 'rgba(255,255,255,0.03)'
const cardBorder = 'rgba(255,255,255,0.06)'
const textHeading = 'rgba(255,255,255,0.9)'
const textBody = 'rgba(255,255,255,0.6)'
const textLabel = 'rgba(255,255,255,0.4)'
const textMuted = 'rgba(255,255,255,0.3)'

type Tab = 'overview' | 'users' | 'activity' | 'projects' | 'reports' | 'invites'

const STATUS_COLORS: Record<string, string> = {
  new: CYAN,
  investigating: '#f59e0b',
  resolved: '#22c55e',
  dismissed: '#6b7280',
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatShortDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n) + '...' : s
}

/* ── Stat Card ─────────────────────────────────── */
function StatCard({ label, value, color }: { label: string; value: number | string; color?: string }) {
  return (
    <div style={{
      background: cardBg,
      border: `1px solid ${cardBorder}`,
      borderRadius: 16,
      padding: '24px 20px',
      flex: '1 1 160px',
      minWidth: 140,
    }}>
      <div style={{ fontSize: 12, color: textLabel, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
        {label}
      </div>
      <div style={{
        fontSize: 32,
        fontWeight: 800,
        letterSpacing: '-0.02em',
        color: color || textHeading,
        lineHeight: 1.1,
      }}>
        {value}
      </div>
    </div>
  )
}

/* ── Tab Button ─────────────────────────────────── */
function TabBtn({ label, tab, active, onClick }: { label: string; tab: Tab; active: Tab; onClick: (t: Tab) => void }) {
  const isActive = tab === active
  return (
    <button
      onClick={() => onClick(tab)}
      style={{
        padding: '8px 18px',
        borderRadius: 10,
        border: 'none',
        fontSize: 13,
        fontWeight: isActive ? 700 : 500,
        cursor: 'pointer',
        transition: 'all 0.2s',
        background: isActive ? `linear-gradient(135deg, ${CYAN}, ${MINT})` : 'rgba(255,255,255,0.04)',
        color: isActive ? '#0a0a0f' : textBody,
      }}
    >
      {label}
    </button>
  )
}

/* ── Badge ─────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLORS[status] || textMuted
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 600,
      textTransform: 'capitalize',
      background: `${color}18`,
      color,
      border: `1px solid ${color}30`,
    }}>
      {status}
    </span>
  )
}

/* ── Main Admin Page ─────────────────────────────────── */
export default function AdminPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [stats, setStats] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [activity, setActivity] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [reports, setReports] = useState<any[]>([])
  const [invites, setInvites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Invite modal
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('creator')
  const [inviting, setInviting] = useState(false)
  const [inviteMsg, setInviteMsg] = useState('')

  const authorized = isAdmin(user?.email)

  const fetchData = useCallback(async () => {
    if (!authorized) return
    setLoading(true)
    try {
      const [statsR, usersR, activityR, projectsR, reportsR, invitesR] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users'),
        fetch('/api/admin/activity'),
        fetch('/api/admin/projects'),
        fetch('/api/admin/reports'),
        fetch('/api/admin/invite'),
      ])

      const [sData, uData, aData, pData, rData, iData] = await Promise.all([
        statsR.json(),
        usersR.json(),
        activityR.json(),
        projectsR.json(),
        reportsR.ok ? reportsR.json() : [],
        invitesR.json(),
      ])

      setStats(sData)
      if (Array.isArray(uData)) setUsers(uData)
      if (Array.isArray(aData)) setActivity(aData)
      if (Array.isArray(pData)) setProjects(pData)
      if (Array.isArray(rData)) setReports(rData)
      if (Array.isArray(iData)) setInvites(iData)
    } catch (e: any) {
      setError(e.message)
    }
    setLoading(false)
  }, [authorized])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Handle invite submit
  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!inviteEmail.trim()) return
    setInviting(true)
    setInviteMsg('')
    try {
      const res = await fetch('/api/admin/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      })
      const data = await res.json()
      if (!res.ok) {
        setInviteMsg(data.error || 'Failed to send invite')
      } else {
        setInviteMsg('Invite sent!')
        setInviteEmail('')
        // Refresh invites
        const r = await fetch('/api/admin/invite')
        const d = await r.json()
        if (Array.isArray(d)) setInvites(d)
      }
    } catch {
      setInviteMsg('Failed to send invite')
    }
    setInviting(false)
  }

  // Handle bug report status update
  async function updateReportStatus(id: string, status: string) {
    try {
      const res = await fetch('/api/admin/reports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      if (res.ok) {
        setReports(prev => prev.map(r => r.id === id ? { ...r, status } : r))
      }
    } catch {
      // Silently fail
    }
  }

  // Auth guard
  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: textBody, fontSize: 16 }}>Loading...</div>
      </div>
    )
  }

  if (!authorized) {
    return (
      <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: 48, opacity: 0.3 }}>403</div>
        <div style={{ color: textBody, fontSize: 16 }}>Access denied. Admin only.</div>
        <Link href="/dashboard" style={{ color: CYAN, fontSize: 14, textDecoration: 'none' }}>Back to Dashboard</Link>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: BG }}>
      {/* ── Header ─────────────────────────────────── */}
      <header style={{
        borderBottom: `1px solid rgba(21,243,236,0.1)`,
        background: 'rgba(10,10,15,0.95)',
        backdropFilter: 'blur(16px)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Link href="/dashboard" style={{ color: textLabel, fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, transition: 'color 0.2s' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Dashboard
            </Link>
            <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.08)' }} />
            <h1 style={{
              fontSize: 20,
              fontWeight: 800,
              letterSpacing: '-0.02em',
              margin: 0,
              background: `linear-gradient(135deg, ${CYAN}, ${MINT})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              WrkFlo Admin
            </h1>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '4px 12px',
            borderRadius: 20,
            background: `rgba(21,243,236,0.08)`,
            border: `1px solid rgba(21,243,236,0.2)`,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={CYAN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span style={{ fontSize: 12, fontWeight: 600, color: CYAN }}>Admin</span>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>
        {/* ── Error / Loading ─────────────────────────────────── */}
        {error && (
          <div style={{ padding: 16, borderRadius: 12, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: 14, marginBottom: 24 }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              border: `3px solid rgba(21,243,236,0.15)`,
              borderTopColor: CYAN,
              animation: 'spin 0.8s linear infinite',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        ) : (
          <>
            {/* ── Stats Overview ─────────────────────────────────── */}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 32 }}>
              <StatCard label="Total Users" value={stats?.users ?? 0} color={CYAN} />
              <StatCard label="Total Projects" value={stats?.projects ?? 0} color={MINT} />
              <StatCard label="Total Files" value={stats?.files ?? 0} />
              <StatCard label="Total Comments" value={stats?.comments ?? 0} />
              <StatCard label="Active (7d)" value={stats?.activeUsers ?? 0} color="#5bc7f9" />
              <StatCard label="Bug Reports" value={stats?.bugReports ?? 0} color="#f59e0b" />
            </div>

            {/* ── Tab Navigation ─────────────────────────────────── */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
              <TabBtn label="Activity Feed" tab="activity" active={activeTab} onClick={setActiveTab} />
              <TabBtn label="Users" tab="users" active={activeTab} onClick={setActiveTab} />
              <TabBtn label="Projects" tab="projects" active={activeTab} onClick={setActiveTab} />
              <TabBtn label="Bug Reports" tab="reports" active={activeTab} onClick={setActiveTab} />
              <TabBtn label="Beta Invites" tab="invites" active={activeTab} onClick={setActiveTab} />
            </div>

            {/* ── Activity Feed Tab ─────────────────────────────────── */}
            {activeTab === 'activity' && (
              <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: `1px solid ${cardBorder}` }}>
                  <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: textHeading }}>Recent Activity</h2>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: textLabel }}>Last 20 comments across all projects</p>
                </div>
                {activity.length === 0 ? (
                  <div style={{ padding: 40, textAlign: 'center', color: textMuted, fontSize: 14 }}>No activity yet</div>
                ) : (
                  <div>
                    {activity.map((a: any) => (
                      <div key={a.id} style={{
                        padding: '16px 24px',
                        borderBottom: `1px solid ${cardBorder}`,
                        transition: 'background 0.15s',
                        cursor: 'default',
                      }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: CYAN }}>{a.author_name}</span>
                            <span style={{ fontSize: 11, color: textMuted }}>on</span>
                            <span style={{ fontSize: 12, color: textBody }}>{a.file_name}</span>
                            <span style={{ fontSize: 11, color: textMuted }}>in</span>
                            <span style={{ fontSize: 12, fontWeight: 500, color: textBody }}>{a.project_name}</span>
                          </div>
                          <span style={{ fontSize: 11, color: textMuted, whiteSpace: 'nowrap' }}>{formatDate(a.created_at)}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: 13, color: textLabel, lineHeight: 1.5 }}>
                          {truncate(a.content, 120)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Users Tab ─────────────────────────────────── */}
            {activeTab === 'users' && (
              <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: `1px solid ${cardBorder}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: textHeading }}>User Management</h2>
                    <p style={{ margin: '4px 0 0', fontSize: 12, color: textLabel }}>{users.length} total users</p>
                  </div>
                  <button
                    onClick={() => { setShowInviteModal(true); setActiveTab('invites') }}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 10,
                      border: 'none',
                      background: `linear-gradient(135deg, ${CYAN}, ${MINT})`,
                      color: '#0a0a0f',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    + Invite Beta User
                  </button>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${cardBorder}` }}>
                        {['Email', 'Name', 'Role', 'Projects', 'Joined'].map(h => (
                          <th key={h} style={{ padding: '12px 16px', fontSize: 11, fontWeight: 600, color: textLabel, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left' }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u: any) => (
                        <tr
                          key={u.id}
                          style={{ borderBottom: `1px solid ${cardBorder}`, transition: 'background 0.15s' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                          <td style={{ padding: '14px 16px', fontSize: 13, color: textBody }}>{u.email}</td>
                          <td style={{ padding: '14px 16px', fontSize: 13, color: textHeading, fontWeight: 500 }}>{u.name || '--'}</td>
                          <td style={{ padding: '14px 16px' }}>
                            <span style={{
                              padding: '3px 10px',
                              borderRadius: 20,
                              fontSize: 11,
                              fontWeight: 600,
                              textTransform: 'capitalize',
                              background: u.role === 'creator' ? 'rgba(21,243,236,0.1)' : 'rgba(22,255,192,0.1)',
                              color: u.role === 'creator' ? CYAN : MINT,
                              border: `1px solid ${u.role === 'creator' ? 'rgba(21,243,236,0.2)' : 'rgba(22,255,192,0.2)'}`,
                            }}>
                              {u.role}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px', fontSize: 13, color: u.project_count > 0 ? CYAN : textMuted, fontWeight: 600 }}>
                            {u.project_count}
                          </td>
                          <td style={{ padding: '14px 16px', fontSize: 12, color: textMuted }}>{formatShortDate(u.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── Projects Tab ─────────────────────────────────── */}
            {activeTab === 'projects' && (
              <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: `1px solid ${cardBorder}` }}>
                  <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: textHeading }}>Project Analytics</h2>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: textLabel }}>{projects.length} total projects, sorted by most recent</p>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${cardBorder}` }}>
                        {['Project', 'Creator', 'Client', 'Status', 'Files', 'Comments', 'Created'].map(h => (
                          <th key={h} style={{ padding: '12px 16px', fontSize: 11, fontWeight: 600, color: textLabel, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left' }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {projects.map((p: any) => (
                        <tr
                          key={p.id}
                          style={{ borderBottom: `1px solid ${cardBorder}`, transition: 'background 0.15s' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                          <td style={{ padding: '14px 16px', fontSize: 13, color: textHeading, fontWeight: 600 }}>{p.name}</td>
                          <td style={{ padding: '14px 16px', fontSize: 12, color: textBody }}>{p.creator_email}</td>
                          <td style={{ padding: '14px 16px', fontSize: 12, color: textBody }}>{p.client_name || '--'}</td>
                          <td style={{ padding: '14px 16px' }}>
                            <span style={{
                              padding: '3px 10px',
                              borderRadius: 20,
                              fontSize: 11,
                              fontWeight: 600,
                              background: p.status === 'Complete' ? 'rgba(34,197,94,0.1)' : p.status === 'In Review' ? 'rgba(21,243,236,0.1)' : 'rgba(255,255,255,0.05)',
                              color: p.status === 'Complete' ? '#22c55e' : p.status === 'In Review' ? CYAN : textLabel,
                              border: `1px solid ${p.status === 'Complete' ? 'rgba(34,197,94,0.2)' : p.status === 'In Review' ? 'rgba(21,243,236,0.2)' : 'rgba(255,255,255,0.08)'}`,
                            }}>
                              {p.status}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px', fontSize: 13, color: p.file_count > 0 ? textBody : textMuted, fontWeight: 500 }}>
                            {p.file_count}
                          </td>
                          <td style={{ padding: '14px 16px', fontSize: 13, color: p.comment_count > 0 ? CYAN : textMuted, fontWeight: 600 }}>
                            {p.comment_count}
                          </td>
                          <td style={{ padding: '14px 16px', fontSize: 12, color: textMuted }}>{formatShortDate(p.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── Bug Reports Tab ─────────────────────────────────── */}
            {activeTab === 'reports' && (
              <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: `1px solid ${cardBorder}` }}>
                  <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: textHeading }}>Bug Reports</h2>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: textLabel }}>{reports.length} reports</p>
                </div>
                {reports.length === 0 ? (
                  <div style={{ padding: 40, textAlign: 'center', color: textMuted, fontSize: 14 }}>
                    No bug reports yet. The bug_reports table may not have data.
                  </div>
                ) : (
                  <div>
                    {reports.map((r: any) => (
                      <div
                        key={r.id}
                        style={{
                          padding: '20px 24px',
                          borderBottom: `1px solid ${cardBorder}`,
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                            <span style={{
                              padding: '3px 10px',
                              borderRadius: 20,
                              fontSize: 11,
                              fontWeight: 600,
                              textTransform: 'capitalize',
                              background: 'rgba(91,199,249,0.1)',
                              color: '#5bc7f9',
                              border: '1px solid rgba(91,199,249,0.2)',
                            }}>
                              {r.category}
                            </span>
                            <StatusBadge status={r.status} />
                            {r.user_email && (
                              <span style={{ fontSize: 12, color: textLabel }}>{r.user_email}</span>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 11, color: textMuted }}>{formatDate(r.created_at)}</span>
                            <select
                              value={r.status}
                              onChange={e => updateReportStatus(r.id, e.target.value)}
                              style={{
                                padding: '4px 8px',
                                borderRadius: 6,
                                background: 'rgba(255,255,255,0.04)',
                                border: `1px solid ${cardBorder}`,
                                color: textBody,
                                fontSize: 11,
                                cursor: 'pointer',
                                outline: 'none',
                              }}
                            >
                              <option value="new" style={{ background: BG }}>New</option>
                              <option value="investigating" style={{ background: BG }}>Investigating</option>
                              <option value="resolved" style={{ background: BG }}>Resolved</option>
                              <option value="dismissed" style={{ background: BG }}>Dismissed</option>
                            </select>
                          </div>
                        </div>
                        <p style={{ margin: '0 0 6px', fontSize: 14, color: textBody, lineHeight: 1.6 }}>
                          {r.description}
                        </p>
                        {r.url && (
                          <div style={{ fontSize: 12, color: textLabel }}>
                            URL: <span style={{ color: textMuted }}>{r.url}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Beta Invites Tab ─────────────────────────────────── */}
            {activeTab === 'invites' && (
              <div>
                {/* Invite Form Card */}
                <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, padding: 24, marginBottom: 24 }}>
                  <h2 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: textHeading }}>Invite Beta User</h2>
                  <form onSubmit={handleInvite} style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 280px' }}>
                      <label style={{ display: 'block', fontSize: 12, color: textLabel, marginBottom: 6 }}>Email</label>
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={e => setInviteEmail(e.target.value)}
                        placeholder="user@example.com"
                        required
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: 10,
                          border: `1px solid ${cardBorder}`,
                          background: 'rgba(255,255,255,0.04)',
                          color: textHeading,
                          fontSize: 14,
                          outline: 'none',
                          transition: 'border-color 0.2s',
                          boxSizing: 'border-box',
                        }}
                        onFocus={e => (e.currentTarget.style.borderColor = `rgba(21,243,236,0.4)`)}
                        onBlur={e => (e.currentTarget.style.borderColor = cardBorder)}
                      />
                    </div>
                    <div style={{ flex: '0 0 140px' }}>
                      <label style={{ display: 'block', fontSize: 12, color: textLabel, marginBottom: 6 }}>Role</label>
                      <select
                        value={inviteRole}
                        onChange={e => setInviteRole(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: 10,
                          border: `1px solid ${cardBorder}`,
                          background: 'rgba(255,255,255,0.04)',
                          color: textBody,
                          fontSize: 14,
                          cursor: 'pointer',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      >
                        <option value="creator" style={{ background: BG }}>Creator</option>
                        <option value="client" style={{ background: BG }}>Client</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      disabled={inviting}
                      style={{
                        padding: '10px 24px',
                        borderRadius: 10,
                        border: 'none',
                        background: `linear-gradient(135deg, ${CYAN}, ${MINT})`,
                        color: '#0a0a0f',
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: inviting ? 'not-allowed' : 'pointer',
                        opacity: inviting ? 0.6 : 1,
                        transition: 'all 0.2s',
                        boxShadow: '0 4px 20px rgba(21,243,236,0.2)',
                      }}
                    >
                      {inviting ? 'Sending...' : 'Send Invite'}
                    </button>
                  </form>
                  {inviteMsg && (
                    <div style={{
                      marginTop: 12,
                      padding: '8px 14px',
                      borderRadius: 8,
                      fontSize: 13,
                      background: inviteMsg.includes('sent') ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                      color: inviteMsg.includes('sent') ? '#22c55e' : '#f87171',
                      border: `1px solid ${inviteMsg.includes('sent') ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                    }}>
                      {inviteMsg}
                    </div>
                  )}
                </div>

                {/* Invites List */}
                <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden' }}>
                  <div style={{ padding: '20px 24px', borderBottom: `1px solid ${cardBorder}` }}>
                    <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: textHeading }}>Sent Invites</h2>
                    <p style={{ margin: '4px 0 0', fontSize: 12, color: textLabel }}>{invites.length} invites</p>
                  </div>
                  {invites.length === 0 ? (
                    <div style={{ padding: 40, textAlign: 'center', color: textMuted, fontSize: 14 }}>No invites sent yet</div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ borderBottom: `1px solid ${cardBorder}` }}>
                            {['Email', 'Status', 'Sent'].map(h => (
                              <th key={h} style={{ padding: '12px 16px', fontSize: 11, fontWeight: 600, color: textLabel, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left' }}>
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {invites.map((inv: any) => (
                            <tr
                              key={inv.id}
                              style={{ borderBottom: `1px solid ${cardBorder}`, transition: 'background 0.15s' }}
                              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                            >
                              <td style={{ padding: '14px 16px', fontSize: 13, color: textBody }}>{inv.email}</td>
                              <td style={{ padding: '14px 16px' }}>
                                <span style={{
                                  padding: '3px 10px',
                                  borderRadius: 20,
                                  fontSize: 11,
                                  fontWeight: 600,
                                  textTransform: 'capitalize',
                                  background: inv.status === 'accepted' ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)',
                                  color: inv.status === 'accepted' ? '#22c55e' : '#f59e0b',
                                  border: `1px solid ${inv.status === 'accepted' ? 'rgba(34,197,94,0.2)' : 'rgba(245,158,11,0.2)'}`,
                                }}>
                                  {inv.status}
                                </span>
                              </td>
                              <td style={{ padding: '14px 16px', fontSize: 12, color: textMuted }}>{formatShortDate(inv.created_at)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
