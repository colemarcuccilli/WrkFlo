'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';

const teamMembers = [
  {
    name: 'Sarah Chen',
    role: 'Creative Director',
    initials: 'SC',
    projects: 12,
    status: 'Active',
    bio: 'Leads visual strategy and brand identity projects. 8 years of experience in motion and print design.',
    color: 'bg-orange-100 text-orange-700',
  },
  {
    name: 'Marcus Rivera',
    role: 'Video Producer',
    initials: 'MR',
    projects: 8,
    status: 'Active',
    bio: 'Specializes in commercial video production, color grading, and motion graphics.',
    color: 'bg-red-100 text-red-700',
  },
  {
    name: 'Priya Sharma',
    role: 'Graphic Designer',
    initials: 'PS',
    projects: 15,
    status: 'Active',
    bio: 'Expert in social media content, brand systems, and digital illustration.',
    color: 'bg-amber-100 text-amber-700',
  },
  {
    name: 'DJ Nomad',
    role: 'Audio Engineer',
    initials: 'DN',
    projects: 6,
    status: 'Active',
    bio: 'Podcast production, music mixing, sound design, and audio post-production.',
    color: 'bg-orange-100 text-orange-800',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-gray-900">Invite Team Member</h2>
            <p className="text-xs text-gray-500 mt-0.5">They'll get an email with a link to join.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {sent ? (
          <div className="text-center py-6">
            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">Invite Sent!</h3>
            <p className="text-sm text-gray-500 mb-5">
              An invitation has been sent to <span className="font-medium text-gray-700">{email}</span>.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-left mb-5">
              <p className="text-xs text-amber-700">
                <span className="font-semibold">Coming soon:</span> Email delivery is in development. Share the workspace link manually for now.
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleInvite} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teammate@studio.com"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-orange-400 bg-white"
              >
                <option>Creative Director</option>
                <option>Video Producer</option>
                <option>Graphic Designer</option>
                <option>Audio Engineer</option>
                <option>Editor</option>
                <option>Motion Designer</option>
              </select>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <p className="text-xs text-orange-700">
                They'll be able to view all projects and upload files. You can adjust permissions later.
              </p>
            </div>
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
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
  const userInitial = user?.user_metadata?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || '?';

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(data => setStats(data))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <span className="font-bold text-lg tracking-tight text-gray-900">WrkFlo</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Dashboard</Link>
            <Link href="/team" className="text-sm font-medium text-gray-900 border-b-2 border-orange-500 pb-0.5">Team</Link>
            <Link href="/settings" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Settings</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/projects/new">
              <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-sm font-medium rounded-lg transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Project
              </button>
            </Link>
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-sm font-bold text-orange-700">
              {userInitial}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Team</h1>
          <p className="text-gray-500 mt-1">Your creative crew — the people making it happen.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">Team Members</p>
            <p className="text-2xl font-bold text-gray-900">{teamMembers.length}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">Active Projects</p>
            <p className="text-2xl font-bold text-orange-600">{stats?.activeProjects ?? '—'}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">Deliverables This Month</p>
            <p className="text-2xl font-bold text-emerald-600">{stats?.deliverableThisMonth ?? '—'}</p>
          </div>
        </div>

        {/* Team cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {teamMembers.map((member) => (
            <div key={member.name} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-base font-bold ${member.color}`}>
                  {member.initials}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{member.name}</p>
                  <p className="text-xs text-gray-500">{member.role}</p>
                </div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed mb-4">{member.bio}</p>
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-500">{member.projects} projects</span>
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{member.status}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Invite CTA */}
        <div className="mt-8 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-6 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Grow your team</h3>
            <p className="text-sm text-gray-600 mt-1">Invite collaborators to join your WrkFlo workspace.</p>
          </div>
          <button
            onClick={() => setShowInvite(true)}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Invite Member
          </button>
        </div>
      </main>

      {showInvite && <InviteModal onClose={() => setShowInvite(false)} />}
    </div>
  );
}
