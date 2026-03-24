'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { isAdmin } from '@/lib/admin'

const CYAN = '#15f3ec'
const MINT = '#16ffc0'
const BG = '#0a0a0f'
const cardBg = 'rgba(255,255,255,0.03)'
const cardBorder = 'rgba(255,255,255,0.06)'
const textHeading = 'rgba(255,255,255,0.9)'
const textBody = 'rgba(255,255,255,0.6)'
const textLabel = 'rgba(255,255,255,0.4)'
const textMuted = 'rgba(255,255,255,0.3)'
const BLUE = '#3b82f6'
const PURPLE = '#a855f7'
const AMBER = '#f59e0b'
const RED = '#ef4444'
const GREEN = '#22c55e'

type Tab = 'overview' | 'activity' | 'users' | 'projects' | 'reports' | 'feedback' | 'invites' | 'email-testing' | 'testing'

const TAB_LABELS: Record<Tab, string> = {
  overview: 'Overview',
  activity: 'Activity Feed',
  users: 'Users',
  projects: 'Projects',
  reports: 'Bug Reports',
  feedback: 'Feedback',
  invites: 'Beta Invites',
  'email-testing': 'Email Testing',
  testing: 'Testing Panel',
}

/* ── Helper Components ───────────────────────────────────────────── */

function TabBtn({ tab, active, onClick }: { tab: Tab; active: boolean; onClick: (t: Tab) => void }) {
  return (
    <button
      onClick={() => onClick(tab)}
      style={{
        padding: '8px 16px',
        fontSize: 13,
        fontWeight: active ? 600 : 400,
        color: active ? CYAN : textBody,
        background: active ? 'rgba(21,243,236,0.08)' : 'transparent',
        border: active ? '1px solid rgba(21,243,236,0.2)' : '1px solid transparent',
        borderRadius: 8,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'all 0.2s',
      }}
    >
      {TAB_LABELS[tab]}
    </button>
  )
}

function StatCard({ label, value, color, sub }: { label: string; value: string | number; color?: string; sub?: string }) {
  return (
    <div style={{
      background: cardBg,
      border: `1px solid ${cardBorder}`,
      borderRadius: 12,
      padding: '20px 24px',
      backdropFilter: 'blur(12px)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {color && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: color }} />}
      <div style={{ fontSize: 13, color: textLabel, marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: color || textHeading }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: textMuted, marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

function StatusBadge({ status, color }: { status: string; color: string }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 10px',
      fontSize: 11,
      fontWeight: 600,
      borderRadius: 999,
      background: `${color}18`,
      color,
      border: `1px solid ${color}30`,
      textTransform: 'capitalize',
    }}>
      {status}
    </span>
  )
}

function StarDisplay({ rating, max = 5 }: { rating: number; max?: number }) {
  const stars = []
  for (let i = 1; i <= max; i++) {
    stars.push(
      <span key={i} style={{ color: i <= Math.round(rating) ? AMBER : textMuted, fontSize: 16 }}>
        {i <= Math.round(rating) ? '\u2605' : '\u2606'}
      </span>
    )
  }
  return <span style={{ display: 'inline-flex', gap: 2 }}>{stars}</span>
}

function Spinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60 }}>
      <div style={{
        width: 32, height: 32, border: `3px solid ${cardBorder}`, borderTopColor: CYAN,
        borderRadius: '50%', animation: 'adminspin 0.8s linear infinite',
      }} />
      <style>{`@keyframes adminspin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

function CategoryBadge({ category }: { category: string }) {
  const colorMap: Record<string, string> = {
    auth: CYAN, project: MINT, file: BLUE, comment: PURPLE, review: AMBER,
    invite: GREEN, feedback: PURPLE, report: AMBER, email: CYAN, system: textLabel,
  }
  return <StatusBadge status={category} color={colorMap[category] || textLabel} />
}

const thStyle: React.CSSProperties = {
  textAlign: 'left', padding: '10px 14px', fontSize: 11, fontWeight: 600,
  color: textLabel, textTransform: 'uppercase', letterSpacing: '0.05em',
  borderBottom: `1px solid ${cardBorder}`,
}

const tdStyle: React.CSSProperties = {
  padding: '10px 14px', fontSize: 13, color: textBody, borderBottom: `1px solid ${cardBorder}`,
}

function formatDate(d: string) {
  if (!d) return '-'
  try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) } catch { return d }
}

function formatTime(d: string) {
  if (!d) return '-'
  try { return new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) } catch { return d }
}

/* ── Main Admin Page ─────────────────────────────────────────────── */

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [authorized, setAuthorized] = useState<boolean | null>(null)

  /* data states */
  const [overview, setOverview] = useState<any>(null)
  const [activity, setActivity] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [reports, setReports] = useState<any[]>([])
  const [feedbackList, setFeedbackList] = useState<any[]>([])
  const [invites, setInvites] = useState<any[]>([])
  const [tabLoading, setTabLoading] = useState(false)

  /* filters */
  const [actCatFilter, setActCatFilter] = useState('all')

  /* invite form */
  const [invEmail, setInvEmail] = useState('')
  const [invRole, setInvRole] = useState('creator')
  const [bulkEmails, setBulkEmails] = useState('')
  const [invMsg, setInvMsg] = useState('')

  /* email testing */
  const [emailTo, setEmailTo] = useState('')
  const [emailMsg, setEmailMsg] = useState('')
  const [emailBusy, setEmailBusy] = useState<string | null>(null)

  /* testing panel */
  const [connStatus, setConnStatus] = useState<Record<string, 'checking' | 'ok' | 'error'>>({})

  /* ── Auth Guard ─────────────────────────────────────────────────── */
  useEffect(() => {
    if (!authLoading) {
      setAuthorized(isAdmin(user?.email))
    }
  }, [user, authLoading])

  /* ── Fetchers ───────────────────────────────────────────────────── */
  const fj = useCallback(async (url: string) => {
    const r = await fetch(url)
    if (!r.ok) throw new Error(`${r.status}`)
    return r.json()
  }, [])

  const loadOverview = useCallback(async () => {
    setTabLoading(true)
    try { setOverview(await fj('/api/admin/overview')) } catch { setOverview({}) }
    setTabLoading(false)
  }, [fj])

  const loadActivity = useCallback(async () => {
    setTabLoading(true)
    try {
      const d = await fj('/api/admin/activity-log')
      setActivity(Array.isArray(d) ? d : d.logs || d.data || [])
    } catch { setActivity([]) }
    setTabLoading(false)
  }, [fj])

  const loadUsers = useCallback(async () => {
    setTabLoading(true)
    try {
      const d = await fj('/api/admin/users')
      setUsers(Array.isArray(d) ? d : d.users || d.data || [])
    } catch { setUsers([]) }
    setTabLoading(false)
  }, [fj])

  const loadProjects = useCallback(async () => {
    setTabLoading(true)
    try {
      const d = await fj('/api/admin/projects')
      setProjects(Array.isArray(d) ? d : d.projects || d.data || [])
    } catch { setProjects([]) }
    setTabLoading(false)
  }, [fj])

  const loadReports = useCallback(async () => {
    setTabLoading(true)
    try {
      const d = await fj('/api/admin/reports')
      setReports(Array.isArray(d) ? d : d.reports || d.data || [])
    } catch { setReports([]) }
    setTabLoading(false)
  }, [fj])

  const loadFeedback = useCallback(async () => {
    setTabLoading(true)
    try {
      const d = await fj('/api/admin/feedback')
      setFeedbackList(Array.isArray(d) ? d : d.feedback || d.data || [])
    } catch { setFeedbackList([]) }
    setTabLoading(false)
  }, [fj])

  const loadInvites = useCallback(async () => {
    setTabLoading(true)
    try {
      const d = await fj('/api/admin/invite')
      setInvites(Array.isArray(d) ? d : d.invites || d.data || [])
    } catch { setInvites([]) }
    setTabLoading(false)
  }, [fj])

  /* ── Tab-based lazy loading ─────────────────────────────────────── */
  useEffect(() => {
    if (!authorized) return
    const loaders: Record<string, () => void> = {
      overview: loadOverview, activity: loadActivity, users: loadUsers,
      projects: loadProjects, reports: loadReports, feedback: loadFeedback, invites: loadInvites,
    }
    loaders[activeTab]?.()
  }, [activeTab, authorized, loadOverview, loadActivity, loadUsers, loadProjects, loadReports, loadFeedback, loadInvites])

  /* ── Report status update ───────────────────────────────────────── */
  const updateReportStatus = async (id: string, status: string) => {
    try {
      await fetch('/api/admin/reports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      setReports(prev => prev.map(r => r.id === id ? { ...r, status } : r))
    } catch (e) { console.error('Failed to update report', e) }
  }

  /* ── Invite helpers ─────────────────────────────────────────────── */
  const postInvite = async (email: string, role: string) => {
    const r = await fetch('/api/admin/invite', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role }),
    })
    return r.ok
  }

  const handleSingleInvite = async () => {
    if (!invEmail.trim()) return
    setInvMsg('')
    const ok = await postInvite(invEmail.trim(), invRole)
    setInvMsg(ok ? `Invited ${invEmail}` : `Failed to invite ${invEmail}`)
    if (ok) { setInvEmail(''); loadInvites() }
  }

  const handleBulkInvite = async () => {
    const emails = bulkEmails.split('\n').map(e => e.trim()).filter(Boolean)
    if (!emails.length) return
    setInvMsg('')
    let ok = 0
    for (const em of emails) { if (await postInvite(em, invRole)) ok++ }
    setInvMsg(`Invited ${ok}/${emails.length} users`)
    setBulkEmails('')
    loadInvites()
  }

  /* ── Email testing ──────────────────────────────────────────────── */
  const sendTestEmail = async (type: string) => {
    setEmailBusy(type)
    setEmailMsg('')
    try {
      const r = await fetch('/api/admin/test-email', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, to: emailTo || user?.email }),
      })
      if (r.ok) { setEmailMsg(`${type} email sent successfully`) }
      else { const d = await r.json().catch(() => ({})); setEmailMsg(`Failed: ${d.error || r.statusText}`) }
    } catch (e: any) { setEmailMsg(`Error: ${e.message}`) }
    setEmailBusy(null)
  }

  /* ── Testing panel ──────────────────────────────────────────────── */
  const checkConn = async (name: string, url: string) => {
    setConnStatus(p => ({ ...p, [name]: 'checking' }))
    try {
      const r = await fetch(url)
      setConnStatus(p => ({ ...p, [name]: r.ok ? 'ok' : 'error' }))
    } catch { setConnStatus(p => ({ ...p, [name]: 'error' })) }
  }

  const runAllChecks = () => {
    checkConn('Google Drive', '/api/google-drive/status')
    checkConn('Dropbox', '/api/dropbox/status')
    checkConn('OneDrive', '/api/onedrive/status')
    checkConn('Supabase', '/api/admin/overview')
    checkConn('Resend', '/api/admin/test-email')
  }

  /* ── Loading / 403 ──────────────────────────────────────────────── */
  if (authLoading || authorized === null) {
    return (
      <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 40, height: 40, border: `3px solid ${cardBorder}`, borderTopColor: CYAN,
            borderRadius: '50%', animation: 'adminspin 0.8s linear infinite', margin: '0 auto 16px',
          }} />
          <div style={{ color: textBody, fontSize: 14 }}>Checking authorization...</div>
          <style>{`@keyframes adminspin { to { transform: rotate(360deg) } }`}</style>
        </div>
      </div>
    )
  }

  if (!authorized) {
    return (
      <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: 48, fontWeight: 700, color: RED }}>403</div>
        <div style={{ fontSize: 16, color: textBody }}>Access denied. This page is restricted to administrators.</div>
        <Link href="/dashboard" style={{ color: CYAN, fontSize: 14, textDecoration: 'none', marginTop: 8 }}>
          Back to Dashboard
        </Link>
      </div>
    )
  }

  /* ── Tab renderers ──────────────────────────────────────────────── */

  const tabOverview = () => {
    if (tabLoading && !overview) return <Spinner />
    const o = overview || {}
    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
          <StatCard label="Total Users" value={o.total_users ?? '-'} color={CYAN} />
          <StatCard label="Total Projects" value={o.total_projects ?? '-'} color={MINT} />
          <StatCard label="Total Files" value={o.total_files ?? '-'} />
          <StatCard label="Total Comments" value={o.total_comments ?? '-'} />
          <StatCard label="Total Revisions" value={o.total_revisions ?? '-'} />
          <StatCard label="Clients Invited" value={o.clients_invited ?? '-'} />
          <StatCard label="Active Users (7d)" value={o.active_users_7d ?? '-'} color={BLUE} />
          <StatCard label="Activity Today" value={o.activity_today ?? '-'} />
          <StatCard label="Activity This Week" value={o.activity_week ?? '-'} />
          <StatCard label="Bug Reports" value={o.bug_reports ?? '-'} color={AMBER} />
          <StatCard label="Feedback Responses" value={o.feedback_responses ?? '-'} color={PURPLE} />
          <div style={{
            background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12,
            padding: '20px 24px', backdropFilter: 'blur(12px)', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: AMBER }} />
            <div style={{ fontSize: 13, color: textLabel, marginBottom: 8 }}>Avg Rating</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 28, fontWeight: 700, color: AMBER }}>
                {o.avg_rating != null ? Number(o.avg_rating).toFixed(1) : '-'}
              </span>
              {o.avg_rating != null && <StarDisplay rating={Number(o.avg_rating)} />}
            </div>
          </div>
        </div>

        {/* Projects by Status */}
        {o.projects_by_status && (
          <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12, padding: 24, marginBottom: 24 }}>
            <h3 style={{ color: textHeading, fontSize: 15, fontWeight: 600, marginBottom: 16, marginTop: 0 }}>Projects by Status</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {Object.entries(o.projects_by_status as Record<string, number>).map(([st, cnt]) => {
                const total = Object.values(o.projects_by_status as Record<string, number>).reduce((a, b) => a + Number(b), 0)
                const pct = total > 0 ? (Number(cnt) / total) * 100 : 0
                const sc: Record<string, string> = { active: CYAN, draft: textLabel, completed: MINT, archived: textMuted, review: AMBER, in_progress: BLUE }
                return (
                  <div key={st}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ color: textBody, fontSize: 13, textTransform: 'capitalize' }}>{st.replace(/_/g, ' ')}</span>
                      <span style={{ color: textLabel, fontSize: 12 }}>{cnt}</span>
                    </div>
                    <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, borderRadius: 3, background: sc[st] || CYAN, transition: 'width 0.5s' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Top 5 Creators */}
        {o.top_creators && o.top_creators.length > 0 && (
          <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12, padding: 24 }}>
            <h3 style={{ color: textHeading, fontSize: 15, fontWeight: 600, marginBottom: 16, marginTop: 0 }}>Top 5 Creators</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr><th style={thStyle}>Email</th><th style={thStyle}>Projects</th><th style={thStyle}>Files</th></tr></thead>
              <tbody>
                {o.top_creators.slice(0, 5).map((c: any, i: number) => (
                  <tr key={i}>
                    <td style={tdStyle}>{c.email}</td>
                    <td style={tdStyle}>{c.project_count ?? c.projects ?? '-'}</td>
                    <td style={tdStyle}>{c.file_count ?? c.files ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    )
  }

  const tabActivity = () => {
    if (tabLoading && !activity.length) return <Spinner />
    const cats = ['all', ...Array.from(new Set(activity.map(a => a.category).filter(Boolean)))]
    const list = actCatFilter === 'all' ? activity : activity.filter(a => a.category === actCatFilter)
    return (
      <div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={actCatFilter}
            onChange={e => setActCatFilter(e.target.value)}
            style={{ background: cardBg, color: textBody, border: `1px solid ${cardBorder}`, borderRadius: 8, padding: '8px 12px', fontSize: 13, outline: 'none' }}
          >
            {cats.map(c => <option key={c} value={c} style={{ background: BG }}>{c === 'all' ? 'All Categories' : c}</option>)}
          </select>
          <button onClick={loadActivity} style={{ background: 'rgba(21,243,236,0.1)', color: CYAN, border: '1px solid rgba(21,243,236,0.2)', borderRadius: 8, padding: '8px 16px', fontSize: 13, cursor: 'pointer' }}>
            Refresh
          </button>
          <span style={{ color: textMuted, fontSize: 12 }}>{list.length} entries</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {list.length === 0 && <div style={{ color: textMuted, padding: 24, textAlign: 'center' }}>No activity logs found</div>}
          {list.map((item: any, i: number) => (
            <div key={i} style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 10, padding: '14px 18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {item.category && <CategoryBadge category={item.category} />}
                  <span style={{ color: textHeading, fontSize: 13, fontWeight: 500 }}>{item.action}</span>
                </div>
                <span style={{ color: textMuted, fontSize: 11 }}>{formatTime(item.timestamp || item.created_at)}</span>
              </div>
              <div style={{ fontSize: 12, color: textLabel }}>
                {item.user_email && <span style={{ marginRight: 12 }}>{item.user_email}</span>}
                {item.resource_type && <span style={{ marginRight: 12 }}>Resource: {item.resource_type}</span>}
                {item.resource_id && <span style={{ marginRight: 12 }}>ID: {item.resource_id}</span>}
              </div>
              {item.metadata && typeof item.metadata === 'object' && Object.keys(item.metadata).length > 0 && (
                <div style={{ fontSize: 11, color: textMuted, marginTop: 6, fontFamily: 'monospace', wordBreak: 'break-all' }}>
                  {JSON.stringify(item.metadata)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const tabUsers = () => {
    if (tabLoading && !users.length) return <Spinner />
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ color: textLabel, fontSize: 13 }}>{users.length} users</span>
          <button
            onClick={() => setActiveTab('invites')}
            style={{ background: `linear-gradient(135deg, ${CYAN}, ${MINT})`, color: BG, border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >
            Invite Beta User
          </button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: cardBg, borderRadius: 12, overflow: 'hidden' }}>
            <thead>
              <tr>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Role</th>
                <th style={thStyle}>Projects</th>
                <th style={thStyle}>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u: any, i: number) => (
                <tr key={i}>
                  <td style={tdStyle}>{u.email}</td>
                  <td style={tdStyle}>{u.name || u.full_name || '-'}</td>
                  <td style={tdStyle}>
                    <StatusBadge status={u.role || 'creator'} color={u.role === 'admin' ? CYAN : u.role === 'client' ? MINT : BLUE} />
                  </td>
                  <td style={tdStyle}>{u.project_count ?? u.projects ?? '-'}</td>
                  <td style={tdStyle}>{formatDate(u.created_at || u.joined)}</td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={5} style={{ ...tdStyle, textAlign: 'center', color: textMuted }}>No users found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  const tabProjects = () => {
    if (tabLoading && !projects.length) return <Spinner />
    return (
      <div>
        <div style={{ marginBottom: 16 }}><span style={{ color: textLabel, fontSize: 13 }}>{projects.length} projects</span></div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: cardBg, borderRadius: 12, overflow: 'hidden' }}>
            <thead>
              <tr>
                <th style={thStyle}>Project</th>
                <th style={thStyle}>Creator</th>
                <th style={thStyle}>Client</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Files</th>
                <th style={thStyle}>Comments</th>
                <th style={thStyle}>Created</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p: any, i: number) => (
                <tr key={i}>
                  <td style={{ ...tdStyle, color: textHeading, fontWeight: 500 }}>{p.name || p.title}</td>
                  <td style={tdStyle}>{p.creator_email || p.owner_email || '-'}</td>
                  <td style={tdStyle}>{p.client_email || p.client || '-'}</td>
                  <td style={tdStyle}>
                    <StatusBadge
                      status={p.status || 'active'}
                      color={p.status === 'active' ? CYAN : p.status === 'completed' ? MINT : p.status === 'draft' ? textLabel : AMBER}
                    />
                  </td>
                  <td style={tdStyle}>{p.file_count ?? p.files ?? '-'}</td>
                  <td style={tdStyle}>{p.comment_count ?? p.comments ?? '-'}</td>
                  <td style={tdStyle}>{formatDate(p.created_at)}</td>
                </tr>
              ))}
              {projects.length === 0 && (
                <tr><td colSpan={7} style={{ ...tdStyle, textAlign: 'center', color: textMuted }}>No projects found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  const tabReports = () => {
    if (tabLoading && !reports.length) return <Spinner />
    return (
      <div>
        <div style={{ marginBottom: 16 }}><span style={{ color: textLabel, fontSize: 13 }}>{reports.length} bug reports</span></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {reports.length === 0 && <div style={{ color: textMuted, padding: 24, textAlign: 'center' }}>No bug reports</div>}
          {reports.map((r: any, i: number) => (
            <div key={i} style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '18px 22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  {r.category && <StatusBadge status={r.category} color={AMBER} />}
                  <StatusBadge
                    status={r.status || 'new'}
                    color={r.status === 'resolved' ? GREEN : r.status === 'investigating' ? BLUE : r.status === 'dismissed' ? textMuted : AMBER}
                  />
                </div>
                <select
                  value={r.status || 'new'}
                  onChange={e => updateReportStatus(r.id, e.target.value)}
                  style={{ background: cardBg, color: textBody, border: `1px solid ${cardBorder}`, borderRadius: 6, padding: '4px 8px', fontSize: 12, outline: 'none', cursor: 'pointer' }}
                >
                  <option value="new" style={{ background: BG }}>New</option>
                  <option value="investigating" style={{ background: BG }}>Investigating</option>
                  <option value="resolved" style={{ background: BG }}>Resolved</option>
                  <option value="dismissed" style={{ background: BG }}>Dismissed</option>
                </select>
              </div>
              <div style={{ color: textBody, fontSize: 13, marginBottom: 8, lineHeight: 1.5 }}>{r.description || r.message}</div>
              <div style={{ display: 'flex', gap: 16, fontSize: 12, color: textMuted, flexWrap: 'wrap' }}>
                {r.user_email && <span>{r.user_email}</span>}
                {(r.created_at || r.date) && <span>{formatDate(r.created_at || r.date)}</span>}
                {r.url && <a href={r.url} target="_blank" rel="noreferrer" style={{ color: CYAN, textDecoration: 'none' }}>{r.url}</a>}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const tabFeedback = () => {
    if (tabLoading && !feedbackList.length) return <Spinner />
    const total = feedbackList.length
    const avg = total > 0 ? feedbackList.reduce((s: number, f: any) => s + (Number(f.rating) || 0), 0) / total : 0
    const byType: Record<string, number> = {}
    feedbackList.forEach((f: any) => { const t = f.prompt_type || 'general'; byType[t] = (byType[t] || 0) + 1 })

    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
          <StatCard label="Total Responses" value={total} color={PURPLE} />
          <StatCard label="Avg Rating" value={avg > 0 ? avg.toFixed(1) : '-'} color={AMBER} />
          {Object.entries(byType).map(([t, c]) => <StatCard key={t} label={t} value={c} />)}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {feedbackList.length === 0 && <div style={{ color: textMuted, padding: 24, textAlign: 'center' }}>No feedback yet</div>}
          {feedbackList.map((f: any, i: number) => (
            <div key={i} style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 10, padding: '16px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {f.prompt_type && <StatusBadge status={f.prompt_type} color={PURPLE} />}
                  {f.rating != null && <StarDisplay rating={Number(f.rating)} />}
                </div>
                <span style={{ color: textMuted, fontSize: 11 }}>{formatDate(f.created_at || f.date)}</span>
              </div>
              {(f.feedback || f.text || f.message) && (
                <div style={{ color: textBody, fontSize: 13, lineHeight: 1.5, marginBottom: 6 }}>{f.feedback || f.text || f.message}</div>
              )}
              {f.user_email && <div style={{ color: textMuted, fontSize: 12 }}>{f.user_email}</div>}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const tabInvites = () => {
    if (tabLoading && !invites.length && !invMsg) return <Spinner />
    return (
      <div>
        {/* Invite form */}
        <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <h3 style={{ color: textHeading, fontSize: 15, fontWeight: 600, marginTop: 0, marginBottom: 16 }}>Send Invite</h3>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: 16 }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label style={{ display: 'block', color: textLabel, fontSize: 12, marginBottom: 4 }}>Email</label>
              <input
                type="email" value={invEmail} onChange={e => setInvEmail(e.target.value)}
                placeholder="user@example.com"
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', color: textHeading, border: `1px solid ${cardBorder}`, borderRadius: 8, padding: '8px 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', color: textLabel, fontSize: 12, marginBottom: 4 }}>Role</label>
              <select value={invRole} onChange={e => setInvRole(e.target.value)} style={{ background: 'rgba(255,255,255,0.05)', color: textBody, border: `1px solid ${cardBorder}`, borderRadius: 8, padding: '8px 12px', fontSize: 13, outline: 'none' }}>
                <option value="creator" style={{ background: BG }}>Creator</option>
                <option value="client" style={{ background: BG }}>Client</option>
              </select>
            </div>
            <button onClick={handleSingleInvite} style={{ background: `linear-gradient(135deg, ${CYAN}, ${MINT})`, color: BG, border: 'none', borderRadius: 8, padding: '8px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', height: 37 }}>
              Send Invite
            </button>
          </div>

          {/* Bulk */}
          <div style={{ borderTop: `1px solid ${cardBorder}`, paddingTop: 16 }}>
            <label style={{ display: 'block', color: textLabel, fontSize: 12, marginBottom: 6 }}>Bulk Invite (one email per line)</label>
            <textarea
              value={bulkEmails} onChange={e => setBulkEmails(e.target.value)} rows={4}
              placeholder={'user1@example.com\nuser2@example.com'}
              style={{ width: '100%', background: 'rgba(255,255,255,0.05)', color: textHeading, border: `1px solid ${cardBorder}`, borderRadius: 8, padding: '8px 12px', fontSize: 13, outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
            />
            <button onClick={handleBulkInvite} style={{ marginTop: 8, background: 'rgba(21,243,236,0.1)', color: CYAN, border: '1px solid rgba(21,243,236,0.2)', borderRadius: 8, padding: '8px 16px', fontSize: 13, cursor: 'pointer' }}>
              Send Bulk Invites
            </button>
          </div>

          {invMsg && (
            <div style={{
              marginTop: 12, padding: '8px 14px', borderRadius: 8, fontSize: 13,
              background: invMsg.startsWith('Failed') ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
              color: invMsg.startsWith('Failed') ? RED : GREEN,
              border: `1px solid ${invMsg.startsWith('Failed') ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)'}`,
            }}>
              {invMsg}
            </div>
          )}
        </div>

        {/* Invites list */}
        <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12, padding: 24 }}>
          <h3 style={{ color: textHeading, fontSize: 15, fontWeight: 600, marginTop: 0, marginBottom: 16 }}>Sent Invites ({invites.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {invites.length === 0 && <div style={{ color: textMuted, fontSize: 13 }}>No invites sent yet</div>}
            {invites.map((inv: any, i: number) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderBottom: `1px solid ${cardBorder}`, flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ color: textBody, fontSize: 13 }}>{inv.email}</span>
                  <StatusBadge status={inv.role || 'creator'} color={inv.role === 'client' ? MINT : BLUE} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <StatusBadge status={inv.status || 'pending'} color={inv.status === 'accepted' ? GREEN : inv.status === 'expired' ? RED : AMBER} />
                  <span style={{ color: textMuted, fontSize: 11 }}>{formatDate(inv.created_at || inv.sent_at)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const tabEmailTesting = () => {
    const types = [
      { key: 'client-invite', label: 'Client Invite Email' },
      { key: 'comment-notification', label: 'Comment Notification' },
      { key: 'file-approval', label: 'File Approval' },
      { key: 'changes-requested', label: 'Changes Requested' },
      { key: 'project-complete', label: 'Project Complete' },
      { key: 'review-ready', label: 'Review Ready' },
      { key: 'password-reset', label: 'Password Reset' },
    ]
    return (
      <div>
        <h3 style={{ color: textHeading, fontSize: 18, fontWeight: 600, marginTop: 0, marginBottom: 20 }}>Test Email System</h3>
        <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', color: textLabel, fontSize: 12, marginBottom: 6 }}>Send to (optional, defaults to your email)</label>
            <input
              type="email" value={emailTo} onChange={e => setEmailTo(e.target.value)}
              placeholder={user?.email || 'admin@example.com'}
              style={{ width: '100%', maxWidth: 400, background: 'rgba(255,255,255,0.05)', color: textHeading, border: `1px solid ${cardBorder}`, borderRadius: 8, padding: '8px 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
            {types.map(({ key, label }) => (
              <button
                key={key} onClick={() => sendTestEmail(key)} disabled={emailBusy !== null}
                style={{
                  background: emailBusy === key ? 'rgba(21,243,236,0.15)' : 'rgba(255,255,255,0.05)',
                  color: emailBusy === key ? CYAN : textBody,
                  border: `1px solid ${emailBusy === key ? 'rgba(21,243,236,0.3)' : cardBorder}`,
                  borderRadius: 8, padding: '12px 16px', fontSize: 13, cursor: 'pointer', textAlign: 'left',
                  opacity: emailBusy !== null && emailBusy !== key ? 0.5 : 1, transition: 'all 0.2s',
                }}
              >
                {emailBusy === key ? 'Sending...' : label}
              </button>
            ))}
          </div>
        </div>
        {emailMsg && (
          <div style={{
            padding: '12px 16px', borderRadius: 10, fontSize: 13, marginBottom: 16,
            background: emailMsg.startsWith('Failed') || emailMsg.startsWith('Error') ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
            color: emailMsg.startsWith('Failed') || emailMsg.startsWith('Error') ? RED : GREEN,
            border: `1px solid ${emailMsg.startsWith('Failed') || emailMsg.startsWith('Error') ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)'}`,
          }}>
            {emailMsg}
          </div>
        )}
        <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: textLabel, fontSize: 13 }}>RESEND_KEY status:</span>
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: AMBER }} />
            <span style={{ color: textMuted, fontSize: 12 }}>Check via test send</span>
          </div>
        </div>
      </div>
    )
  }

  const tabTesting = () => {
    const conns = [
      { name: 'Google Drive', url: '/api/google-drive/status' },
      { name: 'Dropbox', url: '/api/dropbox/status' },
      { name: 'OneDrive', url: '/api/onedrive/status' },
      { name: 'Supabase', url: '/api/admin/overview' },
      { name: 'Resend', url: '/api/admin/test-email' },
    ]
    const si = (s?: string) => {
      if (s === 'checking') return { bg: AMBER, label: 'Checking...' }
      if (s === 'ok') return { bg: GREEN, label: 'Connected' }
      if (s === 'error') return { bg: RED, label: 'Error' }
      return { bg: textMuted, label: 'Not checked' }
    }
    return (
      <div>
        <h3 style={{ color: textHeading, fontSize: 18, fontWeight: 600, marginTop: 0, marginBottom: 20 }}>Integration Testing</h3>

        {/* Connection status */}
        <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h4 style={{ color: textHeading, fontSize: 14, fontWeight: 600, margin: 0 }}>Connection Status</h4>
            <button onClick={runAllChecks} style={{ background: `linear-gradient(135deg, ${CYAN}, ${MINT})`, color: BG, border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              Run All Checks
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {conns.map(({ name, url }) => {
              const s = si(connStatus[name])
              return (
                <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: `1px solid ${cardBorder}` }}>
                  <span style={{ color: textBody, fontSize: 13 }}>{name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: s.bg }} />
                    <span style={{ color: textLabel, fontSize: 12 }}>{s.label}</span>
                    <button onClick={() => checkConn(name, url)} style={{ background: 'rgba(255,255,255,0.05)', color: textLabel, border: `1px solid ${cardBorder}`, borderRadius: 6, padding: '4px 10px', fontSize: 11, cursor: 'pointer' }}>
                      Check
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Quick Links */}
        <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <h4 style={{ color: textHeading, fontSize: 14, fontWeight: 600, margin: '0 0 14px 0' }}>Quick Links</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { label: 'Google Cloud Console', url: 'https://console.cloud.google.com' },
              { label: 'Vercel Dashboard', url: 'https://vercel.com/dashboard' },
              { label: 'Supabase Dashboard', url: 'https://supabase.com/dashboard' },
              { label: 'Resend Dashboard', url: 'https://resend.com' },
            ].map(({ label, url }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: textBody, fontSize: 13 }}>{label}</span>
                <span style={{ color: textMuted, fontSize: 12, fontFamily: 'monospace' }}>{url}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Environment */}
        <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12, padding: 24 }}>
          <h4 style={{ color: textHeading, fontSize: 14, fontWeight: 600, margin: '0 0 14px 0' }}>Environment</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: textLabel, fontSize: 13 }}>NEXT_PUBLIC_SITE_URL</span>
              <span style={{ color: textBody, fontSize: 13, fontFamily: 'monospace' }}>
                {typeof window !== 'undefined' ? (process.env.NEXT_PUBLIC_SITE_URL || window.location.origin) : '-'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: textLabel, fontSize: 13 }}>Environment</span>
              <span style={{ color: textBody, fontSize: 13, fontFamily: 'monospace' }}>{process.env.NODE_ENV || 'unknown'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: textLabel, fontSize: 13 }}>Current URL</span>
              <span style={{ color: textBody, fontSize: 13, fontFamily: 'monospace' }}>
                {typeof window !== 'undefined' ? window.location.href : '-'}
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ── Render ─────────────────────────────────────────────────────── */

  const renderTab = () => {
    switch (activeTab) {
      case 'overview': return tabOverview()
      case 'activity': return tabActivity()
      case 'users': return tabUsers()
      case 'projects': return tabProjects()
      case 'reports': return tabReports()
      case 'feedback': return tabFeedback()
      case 'invites': return tabInvites()
      case 'email-testing': return tabEmailTesting()
      case 'testing': return tabTesting()
      default: return null
    }
  }

  const allTabs: Tab[] = ['overview', 'activity', 'users', 'projects', 'reports', 'feedback', 'invites', 'email-testing', 'testing']

  return (
    <div style={{ minHeight: '100vh', background: BG, color: textBody, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      {/* Sticky Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(10,10,15,0.9)', backdropFilter: 'blur(16px)', borderBottom: `1px solid ${cardBorder}` }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '14px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Link href="/dashboard" style={{ color: textMuted, fontSize: 13, textDecoration: 'none' }}>
                &larr; Dashboard
              </Link>
              <span style={{ color: textMuted }}>|</span>
              <h1 style={{
                margin: 0, fontSize: 18, fontWeight: 700,
                background: `linear-gradient(135deg, ${CYAN}, ${MINT})`,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                WrkFlo Admin
              </h1>
            </div>
            <div style={{ color: textMuted, fontSize: 12 }}>{user?.email}</div>
          </div>
        </div>

        {/* Tab Bar */}
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px 10px', display: 'flex', gap: 4, overflowX: 'auto' }}>
          {allTabs.map(tab => (
            <TabBtn key={tab} tab={tab} active={activeTab === tab} onClick={setActiveTab} />
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 24px 60px' }}>
        {renderTab()}
      </div>
    </div>
  )
}
