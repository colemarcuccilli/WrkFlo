'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProjectCard from '@/components/ProjectCard';
import ActivityFeed from '@/components/ActivityFeed';
import { useAuth } from '@/components/AuthProvider';
import AppHeader from '@/components/AppHeader';

function normalizeProject(p: any) {
  return {
    ...p,
    client: p.client_name || p.client || 'Unknown Client',
    creatorName: p.creator_name || 'Creator',
    lastActivity: p.updated_at ? new Date(p.updated_at).toLocaleDateString() : 'Recently',
    files: (p.files || []).map((f: any) => ({
      ...f,
      uploadDate: f.upload_date || f.uploadDate || '',
    })),
  };
}

/* ── Brand palette ─────────────────────────────────── */
const CYAN  = '#15f3ec';
const BLUE  = '#5bc7f9';
const MINT  = '#16ffc0';
const BG    = '#0a0a0f';

const cardBg     = 'rgba(255,255,255,0.03)';
const cardBorder = 'rgba(255,255,255,0.06)';

const textHeading = 'rgba(255,255,255,0.9)';
const textBody    = 'rgba(255,255,255,0.6)';
const textLabel   = 'rgba(255,255,255,0.4)';
const textMuted   = 'rgba(255,255,255,0.5)';

export default function DashboardPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const userInitial = user?.user_metadata?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || '?';

  useEffect(() => {
    fetch('/api/projects')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProjects(data.map(normalizeProject));
        } else {
          setError('Failed to load projects');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Could not connect to server');
        setLoading(false);
      });
  }, []);

  const filters = ['All', 'In Review', 'Changes Requested', 'Approved', 'Draft'];

  const filtered = projects
    .filter((p) => filter === 'All' || p.status === filter)
    .filter((p) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        p.name?.toLowerCase().includes(q) ||
        p.client?.toLowerCase().includes(q) ||
        p.creatorName?.toLowerCase().includes(q)
      );
    });

  const totalProjects = projects.length;
  const inReview = projects.filter((p) => p.status === 'In Review').length;
  const approved = projects.filter((p) => p.status === 'Approved').length;
  const changesReq = projects.filter((p) => p.status === 'Changes Requested').length;

  /* ── Stat colours per card ───────────────────────── */
  const stats = [
    { label: 'Total Projects', value: loading ? '—' : totalProjects, valueColor: textHeading },
    { label: 'In Review',      value: loading ? '—' : inReview,      valueColor: CYAN },
    { label: 'Changes Requested', value: loading ? '—' : changesReq, valueColor: '#f87171' },
    { label: 'Approved',       value: loading ? '—' : approved,      valueColor: MINT },
  ];

  return (
    <div className="min-h-screen" style={{ background: BG, color: '#fff' }}>
      <AppHeader />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* ── Page heading ──────────────────────────── */}
        <div className="mb-8">
          <h1
            className="text-2xl font-extrabold tracking-tight"
            style={{ color: textHeading }}
          >
            Projects
          </h1>
          <p className="mt-1" style={{ color: textBody }}>
            Manage and review all your creative deliverables.
          </p>
        </div>

        {/* ── Stats row ─────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl p-4"
              style={{
                background: cardBg,
                border: `1px solid ${cardBorder}`,
                backdropFilter: 'blur(12px)',
              }}
            >
              <p className="text-xs mb-1" style={{ color: textLabel }}>{stat.label}</p>
              <p className="text-2xl font-bold" style={{ color: stat.valueColor }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* ── Search ────────────────────────────────── */}
        <div className="relative mb-4">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: textLabel }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects by name or client..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-sm focus:outline-none"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${cardBorder}`,
              color: textHeading,
              caretColor: CYAN,
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = CYAN;
              e.currentTarget.style.boxShadow = `0 0 0 2px rgba(21,243,236,0.15)`;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = cardBorder;
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: textMuted }}
              onMouseEnter={(e) => { e.currentTarget.style.color = textHeading; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = textMuted; }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* ── Filter tabs ───────────────────────────── */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
          {filters.map((f) => {
            const isActive = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                style={
                  isActive
                    ? {
                        background: `linear-gradient(135deg, ${CYAN}, ${MINT})`,
                        color: '#0a0a0f',
                        boxShadow: `0 4px 14px rgba(21,243,236,0.25)`,
                      }
                    : {
                        background: 'rgba(255,255,255,0.03)',
                        border: `1px solid ${cardBorder}`,
                        color: textMuted,
                      }
                }
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                    e.currentTarget.style.color = textHeading;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = cardBorder;
                    e.currentTarget.style.color = textMuted;
                  }
                }}
              >
                {f}
              </button>
            );
          })}
        </div>

        {/* ── Content grid ──────────────────────────── */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {loading ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="rounded-2xl p-5 animate-pulse"
                    style={{
                      background: cardBg,
                      border: `1px solid ${cardBorder}`,
                    }}
                  >
                    <div className="h-4 rounded mb-2 w-3/4" style={{ background: 'rgba(255,255,255,0.06)' }} />
                    <div className="h-3 rounded mb-4 w-1/2" style={{ background: 'rgba(255,255,255,0.04)' }} />
                    <div className="h-2 rounded w-full"      style={{ background: 'rgba(255,255,255,0.04)' }} />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div
                className="flex flex-col items-center justify-center py-16 rounded-2xl text-center"
                style={{
                  background: cardBg,
                  border: '1px solid rgba(248,113,113,0.2)',
                }}
              >
                <p className="mb-2" style={{ color: '#f87171' }}>&#9888; {error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="text-sm"
                  style={{ color: CYAN }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = MINT; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = CYAN; }}
                >
                  Retry
                </button>
              </div>
            ) : filtered.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-16 rounded-2xl text-center"
                style={{
                  background: cardBg,
                  border: `1px solid ${cardBorder}`,
                }}
              >
                <p style={{ color: textMuted }}>No projects with status &ldquo;{filter}&rdquo;</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {filtered.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <ActivityFeed />

            {/* ── Quick links ─────────────────────────── */}
            {!loading && projects.length > 0 && (
              <div
                className="mt-4 rounded-2xl p-5"
                style={{
                  background: cardBg,
                  border: `1px solid ${cardBorder}`,
                }}
              >
                <h3
                  className="text-sm font-semibold mb-3"
                  style={{ color: textHeading }}
                >
                  Quick Review Links
                </h3>
                <div className="space-y-2">
                  {projects.slice(0, 3).map((p) => (
                    <Link
                      key={p.id}
                      href={`/review/${p.review_token || p.reviewToken}`}
                      className="flex items-center justify-between p-2 rounded-lg transition-colors group"
                      style={{ color: textBody }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <div>
                        <p
                          className="text-xs font-medium transition-colors"
                          style={{ color: textBody }}
                        >
                          {p.name}
                        </p>
                        <p className="text-xs" style={{ color: textLabel }}>
                          {p.client}
                        </p>
                      </div>
                      <svg
                        className="w-3.5 h-3.5 transition-colors"
                        style={{ color: textLabel }}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
