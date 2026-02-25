'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import AppHeader from '@/components/AppHeader';

const CYAN = '#15f3ec';
const BLUE = '#5bc7f9';
const MINT = '#16ffc0';
const BG = '#0a0a0f';
const CARD_BG = 'rgba(255,255,255,0.03)';
const CARD_BORDER = 'rgba(255,255,255,0.06)';

const teamMembers = [
  {
    name: 'Sarah Chen',
    role: 'Creative Director',
    initials: 'SC',
    projects: 12,
    status: 'Active',
    bio: 'Leads visual strategy and brand identity projects. 8 years of experience in motion and print design.',
    color: CYAN,
  },
  {
    name: 'Marcus Rivera',
    role: 'Video Producer',
    initials: 'MR',
    projects: 8,
    status: 'Active',
    bio: 'Specializes in commercial video production, color grading, and motion graphics.',
    color: BLUE,
  },
  {
    name: 'Priya Sharma',
    role: 'Graphic Designer',
    initials: 'PS',
    projects: 15,
    status: 'Active',
    bio: 'Expert in social media content, brand systems, and digital illustration.',
    color: MINT,
  },
  {
    name: 'DJ Nomad',
    role: 'Audio Engineer',
    initials: 'DN',
    projects: 6,
    status: 'Active',
    bio: 'Podcast production, music mixing, sound design, and audio post-production.',
    color: CYAN,
  },
];

function InviteModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Creative Director');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    // Simulate sending invite (no backend yet)
    await new Promise((r) => setTimeout(r, 800));
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }} onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl p-6"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: `1px solid rgba(255,255,255,0.08)`,
          backdropFilter: 'blur(24px)',
          boxShadow: `0 0 40px rgba(21,243,236,0.08), 0 24px 48px rgba(0,0,0,0.4)`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold" style={{ color: 'rgba(255,255,255,0.9)' }}>Invite Team Member</h2>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>They'll get an email with a link to join.</p>
          </div>
          <button onClick={onClose} className="transition-colors" style={{ color: 'rgba(255,255,255,0.3)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {sent ? (
          <div className="text-center py-6">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: `rgba(22,255,192,0.1)` }}>
              <svg className="w-7 h-7" style={{ color: MINT }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-base font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.9)' }}>Invite Sent!</h3>
            <p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.5)' }}>
              An invitation has been sent to <span className="font-medium" style={{ color: CYAN }}>{email}</span>.
            </p>
            <div className="rounded-lg p-3 text-left mb-5" style={{ background: 'rgba(91,199,249,0.08)', border: '1px solid rgba(91,199,249,0.15)' }}>
              <p className="text-xs" style={{ color: BLUE }}>
                <span className="font-semibold">Coming soon:</span> Email delivery is in development. Share the workspace link manually for now.
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-medium rounded-lg transition-all"
              style={{
                background: `linear-gradient(135deg, ${CYAN}, ${MINT})`,
                color: BG,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                boxShadow: `0 0 20px rgba(21,243,236,0.25)`,
              }}
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleInvite} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.6)' }}>
                Email Address <span style={{ color: '#f87171' }}>*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teammate@studio.com"
                className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.9)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = `rgba(21,243,236,0.4)`;
                  e.currentTarget.style.boxShadow = `0 0 0 3px rgba(21,243,236,0.08)`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.6)' }}>Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.9)',
                }}
              >
                <option style={{ background: '#1a1a24', color: 'white' }}>Creative Director</option>
                <option style={{ background: '#1a1a24', color: 'white' }}>Video Producer</option>
                <option style={{ background: '#1a1a24', color: 'white' }}>Graphic Designer</option>
                <option style={{ background: '#1a1a24', color: 'white' }}>Audio Engineer</option>
                <option style={{ background: '#1a1a24', color: 'white' }}>Editor</option>
                <option style={{ background: '#1a1a24', color: 'white' }}>Motion Designer</option>
              </select>
            </div>
            <div className="rounded-lg p-3" style={{ background: 'rgba(91,199,249,0.08)', border: '1px solid rgba(91,199,249,0.12)' }}>
              <p className="text-xs" style={{ color: BLUE }}>
                They'll be able to view all projects and upload files. You can adjust permissions later.
              </p>
            </div>
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.6)',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: `linear-gradient(135deg, ${CYAN}, ${MINT})`,
                  color: BG,
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: `0 0 20px rgba(21,243,236,0.25)`,
                }}
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Sending...
                  </>
                ) : (
                  'Send Invite'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function TeamPage() {
  const { user } = useAuth();
  const [showInvite, setShowInvite] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const userInitial = user?.user_metadata?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || '?';

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(data => setStats(data))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen" style={{ background: BG }}>
      <AppHeader />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'rgba(255,255,255,0.9)' }}>Team</h1>
          <p className="mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Your creative crew — the people making it happen.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="rounded-2xl p-4" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
            <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Team Members</p>
            <p className="text-2xl font-bold" style={{ color: CYAN }}>{teamMembers.length}</p>
          </div>
          <div className="rounded-2xl p-4" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
            <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Active Projects</p>
            <p className="text-2xl font-bold" style={{ color: BLUE }}>{stats?.activeProjects ?? '—'}</p>
          </div>
          <div className="rounded-2xl p-4" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
            <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Deliverables This Month</p>
            <p className="text-2xl font-bold" style={{ color: MINT }}>{stats?.deliverableThisMonth ?? '—'}</p>
          </div>
        </div>

        {/* Team cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {teamMembers.map((member) => {
            const isHovered = hoveredCard === member.name;
            return (
              <div
                key={member.name}
                className="rounded-2xl p-5 transition-all duration-300"
                style={{
                  background: CARD_BG,
                  border: `1px solid ${isHovered ? `${member.color}33` : CARD_BORDER}`,
                  boxShadow: isHovered ? `0 0 24px ${member.color}15, 0 8px 32px rgba(0,0,0,0.3)` : 'none',
                }}
                onMouseEnter={() => setHoveredCard(member.name)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold"
                    style={{
                      background: `${member.color}15`,
                      color: member.color,
                      border: `1px solid ${member.color}30`,
                    }}
                  >
                    {member.initials}
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: 'rgba(255,255,255,0.9)' }}>{member.name}</p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{member.role}</p>
                  </div>
                </div>
                <p className="text-xs leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>{member.bio}</p>
                <div className="flex items-center justify-between pt-3" style={{ borderTop: `1px solid ${CARD_BORDER}` }}>
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{member.projects} projects</span>
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{
                      background: `rgba(22,255,192,0.1)`,
                      color: MINT,
                      border: `1px solid rgba(22,255,192,0.2)`,
                    }}
                  >
                    {member.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Invite CTA */}
        <div
          className="mt-8 rounded-2xl p-6 flex items-center justify-between"
          style={{
            background: `linear-gradient(135deg, ${CYAN}18, ${MINT}12)`,
            border: `1px solid ${CYAN}25`,
            boxShadow: `0 0 32px ${CYAN}10`,
          }}
        >
          <div>
            <h3 className="font-extrabold tracking-tight" style={{ color: 'rgba(255,255,255,0.9)' }}>Grow your team</h3>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Invite collaborators to join your WrkFlo workspace.</p>
          </div>
          <button
            onClick={() => setShowInvite(true)}
            className="px-5 py-2.5 text-sm font-semibold rounded-xl transition-all"
            style={{
              background: `linear-gradient(135deg, ${CYAN}, ${MINT})`,
              color: BG,
              border: 'none',
              cursor: 'pointer',
              boxShadow: `0 0 20px rgba(21,243,236,0.3)`,
              fontWeight: 700,
            }}
          >
            Invite Member
          </button>
        </div>
      </main>

      {showInvite && <InviteModal onClose={() => setShowInvite(false)} />}
    </div>
  );
}
