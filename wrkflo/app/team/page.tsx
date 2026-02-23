import Link from 'next/link';

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

export default function TeamPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <span className="font-bold text-lg tracking-tight text-gray-900">WrkFlo</span>
          </div>

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
              S
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
            <p className="text-2xl font-bold text-orange-600">6</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">Deliverables This Month</p>
            <p className="text-2xl font-bold text-emerald-600">41</p>
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
          <button className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-sm font-medium rounded-lg transition-colors">
            Invite Member
          </button>
        </div>
      </main>
    </div>
  );
}
