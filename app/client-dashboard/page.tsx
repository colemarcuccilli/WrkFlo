'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { createClient } from '@/lib/supabase/client';

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

export default function ClientDashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch('/api/projects')
      .then((r) => r.json())
      .then((data) => {
        setProjects(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const projectStatusBadge = (status: string) => {
    if (status === 'Approved') {
      return { background: 'rgba(22,255,192,0.1)', color: MINT, border: '1px solid rgba(22,255,192,0.2)' };
    }
    if (status === 'In Review') {
      return { background: 'rgba(21,243,236,0.1)', color: CYAN, border: `1px solid rgba(21,243,236,0.2)` };
    }
    return { background: 'rgba(255,255,255,0.05)', color: TEXT_SECONDARY, border: '1px solid rgba(255,255,255,0.08)' };
  };

  return (
    <div className="min-h-screen" style={{ background: BG }}>
      {/* Dark header for clients */}
      <header
        className="sticky top-0 z-40"
        style={{ background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(16px)', borderBottom: `1px solid ${CARD_BORDER}` }}
      >
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${CYAN}, ${MINT})` }}
            >
              <svg className="w-5 h-5" style={{ color: '#0a0a0f' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <span
              className="font-bold text-lg tracking-tight"
              style={{ background: `linear-gradient(135deg, ${CYAN}, ${BLUE}, ${MINT})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              WrkFlo
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm" style={{ color: TEXT_SECONDARY }}>{user?.email}</span>
            <button
              onClick={handleSignOut}
              className="px-3 py-1.5 text-sm font-medium rounded-xl transition-all"
              style={{ border: `1px solid rgba(255,255,255,0.1)`, color: TEXT_SECONDARY, background: 'transparent' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: TEXT_PRIMARY }}>Your Projects</h1>
            <p className="mt-1" style={{ color: TEXT_SECONDARY }}>Projects shared with you for review.</p>
          </div>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl p-5 animate-pulse" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
                <div className="h-4 rounded w-3/4 mb-2" style={{ background: 'rgba(255,255,255,0.06)' }} />
                <div className="h-3 rounded w-1/2 mb-4" style={{ background: 'rgba(255,255,255,0.04)' }} />
                <div className="h-2 rounded w-full" style={{ background: 'rgba(255,255,255,0.03)' }} />
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-2xl p-12 text-center" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(21,243,236,0.08)' }}>
              <svg className="w-8 h-8" style={{ color: CYAN }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold mb-1" style={{ color: TEXT_PRIMARY }}>No projects yet</h3>
            <p className="text-sm" style={{ color: TEXT_SECONDARY }}>No projects have been shared with you yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project: any) => (
              <Link key={project.id} href={project.review_token ? `/review/${project.review_token}` : '#'} className="block group">
                <div
                  className="rounded-2xl p-5 transition-all"
                  style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(21,243,236,0.25)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(21,243,236,0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = CARD_BORDER;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <h3
                    className="font-semibold text-base truncate transition-colors"
                    style={{ color: TEXT_PRIMARY }}
                  >
                    {project.name}
                  </h3>
                  <p className="text-sm mt-0.5 truncate" style={{ color: TEXT_TERTIARY }}>{project.client_name || 'Project'}</p>
                  <div className="flex items-center gap-4 text-xs mt-3" style={{ color: TEXT_TERTIARY }}>
                    <span>{(project.files || []).length} file{(project.files || []).length !== 1 ? 's' : ''}</span>
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={projectStatusBadge(project.status)}
                    >
                      {project.status}
                    </span>
                  </div>
                  <div className="mt-3 text-xs transition-colors" style={{ color: CYAN }}>
                    Open Review →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

    </div>
  );
}
