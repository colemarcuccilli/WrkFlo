'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';

const CYAN = '#15f3ec';
const BLUE = '#5bc7f9';
const MINT = '#16ffc0';
const BG = '#0a0a0f';
const CARD_BG = 'rgba(255,255,255,0.03)';
const CARD_BORDER = 'rgba(255,255,255,0.06)';
const TEXT_PRIMARY = 'rgba(255,255,255,0.9)';
const TEXT_SECONDARY = 'rgba(255,255,255,0.6)';
const TEXT_TERTIARY = 'rgba(255,255,255,0.4)';

const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: TEXT_PRIMARY,
};

const inputFocusHandler = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
  e.target.style.borderColor = CYAN;
  e.target.style.boxShadow = `0 0 0 2px rgba(21,243,236,0.15)`;
};

const inputBlurHandler = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
  e.target.style.borderColor = 'rgba(255,255,255,0.1)';
  e.target.style.boxShadow = 'none';
};

export default function NewProjectPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [form, setForm] = useState({ name: '', client_name: '', status: 'Draft', description: '', due_date: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cancelHovered, setCancelHovered] = useState(false);
  const [submitHovered, setSubmitHovered] = useState(false);
  const [navHovered, setNavHovered] = useState<string | null>(null);
  const userInitial = user?.user_metadata?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || '?';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.client_name.trim()) {
      setError('Project name and client name are required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create project');
      }
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: BG }}>
      {/* Header */}
      <header
        className="sticky top-0 z-40"
        style={{
          background: 'rgba(10,10,15,0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${CARD_BORDER}`,
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${CYAN}, ${MINT})` }}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: BG }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <span
                className="font-bold text-lg tracking-tight"
                style={{
                  background: `linear-gradient(135deg, ${CYAN}, ${MINT})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                WrkFlo
              </span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            {[
              { href: '/dashboard', label: 'Dashboard' },
              { href: '/team', label: 'Team' },
              { href: '/settings', label: 'Settings' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm transition-colors"
                style={{ color: navHovered === link.href ? TEXT_PRIMARY : TEXT_SECONDARY }}
                onMouseEnter={() => setNavHovered(link.href)}
                onMouseLeave={() => setNavHovered(null)}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
            style={{ background: 'rgba(21,243,236,0.12)', color: CYAN }}
          >
            {userInitial}
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-6">
          <Link
            href="/dashboard"
            className="transition-colors hover:underline"
            style={{ color: TEXT_SECONDARY }}
          >
            Dashboard
          </Link>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: TEXT_TERTIARY }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="font-medium" style={{ color: TEXT_PRIMARY }}>New Project</span>
        </div>

        <div
          className="rounded-2xl p-8"
          style={{
            background: CARD_BG,
            border: `1px solid ${CARD_BORDER}`,
          }}
        >
          <div className="mb-6">
            <h1 className="text-xl font-bold" style={{ color: TEXT_PRIMARY }}>Create a New Project</h1>
            <p className="text-sm mt-1" style={{ color: TEXT_SECONDARY }}>Start a new creative project and invite your client to review.</p>
          </div>

          {error && (
            <div
              className="mb-4 p-3 rounded-lg"
              style={{
                background: 'rgba(255,80,80,0.1)',
                border: '1px solid rgba(255,80,80,0.2)',
              }}
            >
              <p className="text-sm" style={{ color: '#ff6b6b' }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: TEXT_SECONDARY }}>
                Project Name <span style={{ color: '#ff6b6b' }}>*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Brand Identity Package"
                className="w-full rounded-lg px-4 py-2.5 text-sm placeholder-gray-500 focus:outline-none"
                style={inputStyle}
                onFocus={inputFocusHandler}
                onBlur={inputBlurHandler}
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: TEXT_SECONDARY }}>
                Client Name <span style={{ color: '#ff6b6b' }}>*</span>
              </label>
              <input
                type="text"
                value={form.client_name}
                onChange={(e) => setForm((p) => ({ ...p, client_name: e.target.value }))}
                placeholder="e.g. Northside Coffee Co."
                className="w-full rounded-lg px-4 py-2.5 text-sm placeholder-gray-500 focus:outline-none"
                style={inputStyle}
                onFocus={inputFocusHandler}
                onBlur={inputBlurHandler}
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: TEXT_SECONDARY }}>Initial Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                className="w-full rounded-lg px-4 py-2.5 text-sm focus:outline-none"
                style={{ ...inputStyle, appearance: 'auto' as any }}
                onFocus={inputFocusHandler as any}
                onBlur={inputBlurHandler as any}
                disabled={loading}
              >
                <option value="Draft">Draft</option>
                <option value="In Review">In Review</option>
                <option value="Approved">Approved</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: TEXT_SECONDARY }}>
                Description <span style={{ color: TEXT_TERTIARY }}>(optional)</span>
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Brief overview of deliverables, scope, or notes..."
                rows={3}
                className="w-full rounded-lg px-4 py-2.5 text-sm placeholder-gray-500 focus:outline-none resize-none"
                style={inputStyle}
                onFocus={inputFocusHandler as any}
                onBlur={inputBlurHandler as any}
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: TEXT_SECONDARY }}>
                Due Date <span style={{ color: TEXT_TERTIARY }}>(optional)</span>
              </label>
              <input
                type="date"
                value={form.due_date}
                onChange={(e) => setForm((p) => ({ ...p, due_date: e.target.value }))}
                className="w-full rounded-lg px-4 py-2.5 text-sm focus:outline-none"
                style={inputStyle}
                onFocus={inputFocusHandler}
                onBlur={inputBlurHandler}
                disabled={loading}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Link href="/dashboard" className="flex-1">
                <button
                  type="button"
                  className="w-full px-4 py-2.5 text-sm font-medium rounded-lg transition-colors"
                  style={{
                    background: cancelHovered ? 'rgba(255,255,255,0.05)' : 'transparent',
                    border: `1px solid ${CARD_BORDER}`,
                    color: TEXT_SECONDARY,
                  }}
                  onMouseEnter={() => setCancelHovered(true)}
                  onMouseLeave={() => setCancelHovered(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: `linear-gradient(135deg, ${CYAN}, ${MINT})`,
                  color: BG,
                  boxShadow: submitHovered ? `0 4px 20px rgba(21,243,236,0.35)` : `0 2px 12px rgba(21,243,236,0.2)`,
                }}
                onMouseEnter={() => setSubmitHovered(true)}
                onMouseLeave={() => setSubmitHovered(false)}
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Project
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
