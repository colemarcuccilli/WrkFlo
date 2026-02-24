'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';

// ── Icons (inline SVGs, no external deps) ────────────────────────────────────

function FlameIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C12 2 9 7 9 10c0 1.657 1.343 3 3 3s3-1.343 3-3c0-.88-.3-1.7-.8-2.35C15.1 9.1 16 10.9 16 13c0 2.21-1.79 4-4 4s-4-1.79-4-4c0-3.5 4-11 4-11z" />
    </svg>
  );
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function LinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function ZapIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function MessageSquareIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  );
}

function FileIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" />
      <polyline points="13 2 13 9 20 9" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  );
}

// ── Main Landing Page ─────────────────────────────────────────────────────────

export default function LandingPage() {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  async function handleWaitlist(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-red-600">
              <FlameIcon className="h-5 w-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-xl font-bold tracking-tight text-transparent">
              WrkFlo
            </span>
          </div>
          <div className="hidden items-center gap-6 text-sm font-medium text-gray-600 sm:flex">
            <a href="#features" className="hover:text-orange-600 transition-colors">Features</a>
            <a href="#compare" className="hover:text-orange-600 transition-colors">Compare</a>
            <a href="#waitlist" className="hover:text-orange-600 transition-colors">Early Access</a>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:border-orange-400 hover:text-orange-600 transition-colors"
                >
                  Dashboard
                </Link>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-700">
                  {user.user_metadata?.full_name?.[0] || user.email?.[0]?.toUpperCase() || '?'}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:border-orange-400 hover:text-orange-600 transition-colors"
                >
                  Login
                </Link>
                <a
                  href="#waitlist"
                  className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-500 transition-colors"
                >
                  Get Early Access
                </a>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-white px-4 pb-24 pt-20 text-center">
        {/* Subtle animated fire gradient blob */}
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          aria-hidden="true"
        >
          <div className="fire-blob absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/4 rounded-full opacity-[0.07] blur-3xl" />
        </div>

        <div className="mx-auto max-w-3xl">
          {/* Logo mark */}
          <div className="mb-6 flex justify-center">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 shadow-lg shadow-orange-500/30">
                <FlameIcon className="h-7 w-7 text-white" />
              </div>
              <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent">
                WrkFlo
              </span>
            </div>
          </div>

          <h1 className="mb-5 text-5xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-6xl">
            Creative Review,{' '}
            <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
              Without the Chaos
            </span>
          </h1>

          <p className="mx-auto mb-8 max-w-xl text-lg text-gray-600">
            WrkFlo is the Frame.io alternative built for indie creators and small studios.
            Share a review link, get client feedback instantly — no account required, no back-and-forth.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="#waitlist"
              className="flex items-center gap-2 rounded-lg bg-orange-600 px-7 py-3.5 text-base font-semibold text-white shadow-md shadow-orange-500/25 hover:bg-orange-500 transition-all hover:shadow-lg hover:shadow-orange-500/30"
            >
              <FlameIcon className="h-4 w-4" />
              Get Early Access
            </a>
            <a
              href="#how-it-works"
              className="rounded-lg border border-gray-300 px-7 py-3.5 text-base font-semibold text-gray-700 hover:border-orange-400 hover:text-orange-600 transition-colors"
            >
              See How It Works
            </a>
          </div>

          {/* Social proof pill */}
          <div className="mt-10 flex justify-center">
            <div className="flex items-center gap-2 rounded-full border border-gray-100 bg-gray-50 px-4 py-2 text-sm text-gray-500 shadow-sm">
              <span className="text-orange-500">🔥</span>
              <span>Join 500+ creators on the early access list</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust Bar ── */}
      <section className="border-y border-gray-100 bg-gray-50 px-4 py-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-5 text-sm font-medium uppercase tracking-widest text-gray-400">
            Trusted by indie creators, video editors, photographers, and studios
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-gray-600">
            <span className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm border border-gray-100">
              <span>🎬</span> Video Editors
            </span>
            <span className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm border border-gray-100">
              <span>📸</span> Photographers
            </span>
            <span className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm border border-gray-100">
              <span>🎵</span> Music Producers
            </span>
            <span className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm border border-gray-100">
              <span>🎨</span> Motion Designers
            </span>
            <span className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm border border-gray-100">
              <span>🏢</span> Small Studios
            </span>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="bg-white px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-orange-600">How It Works</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Approvals in 3 simple steps
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                step: '01',
                icon: <UploadIcon className="h-6 w-6" />,
                title: 'Upload your files',
                desc: 'Drop in videos, images, audio, PDFs, or design files — WrkFlo handles any format your clients need to review.',
              },
              {
                step: '02',
                icon: <LinkIcon className="h-6 w-6" />,
                title: 'Share a review link',
                desc: 'Send one link to your client. No account, no login, no friction — they click and review instantly.',
              },
              {
                step: '03',
                icon: <CheckCircleIcon className="h-6 w-6" />,
                title: 'Get approvals fast',
                desc: 'Clients leave timestamped comments and approve directly in WrkFlo — all feedback in one place, never in email.',
              },
            ].map(({ step, icon, title, desc }) => (
              <div
                key={step}
                className="group relative rounded-2xl border border-gray-100 bg-white p-7 shadow-sm transition-all hover:shadow-md"
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-50 to-red-50 text-orange-500 ring-1 ring-orange-100 group-hover:from-orange-100 group-hover:to-red-100 transition-colors">
                    {icon}
                  </div>
                  <span className="text-3xl font-extrabold text-gray-100">{step}</span>
                </div>
                <h3 className="mb-2 text-lg font-bold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="bg-gray-50 px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-orange-600">Features</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need, nothing you don&apos;t
            </h2>
            <p className="mt-3 text-gray-600">Built for the way indie creators actually work — not for enterprise teams with IT departments.</p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <ZapIcon className="h-5 w-5" />,
                title: 'No Client Sign-Up',
                desc: 'Clients click your link and review instantly. Zero friction means faster approvals and happier clients.',
              },
              {
                icon: <MessageSquareIcon className="h-5 w-5" />,
                title: 'Real-Time Feedback',
                desc: 'Comments sync live between you and your client. No more email chains or version confusion.',
              },
              {
                icon: <FileIcon className="h-5 w-5" />,
                title: 'All File Types',
                desc: 'Video, audio, images, PDFs, design files — WrkFlo handles every format your creative workflow demands.',
              },
              {
                icon: <ClockIcon className="h-5 w-5" />,
                title: 'Timestamped Comments',
                desc: 'Pin feedback to exact moments in video or audio. Clients say "fix at 0:42" instead of vague descriptions.',
              },
              {
                icon: <LockIcon className="h-5 w-5" />,
                title: 'Password-Protected Links',
                desc: 'Share work securely with password protection. Keep sensitive projects private without complicating the workflow.',
              },
              {
                icon: <HeartIcon className="h-5 w-5" />,
                title: 'Built for Indie Creators',
                desc: 'Affordable, simple, and focused on what solo creators and small studios actually need — not enterprise bloat.',
              },
            ].map(({ icon, title, desc }) => (
              <div
                key={title}
                className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-orange-500 ring-1 ring-orange-100 group-hover:bg-orange-100 transition-colors">
                  {icon}
                </div>
                <h3 className="mb-2 text-base font-bold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Comparison Table ── */}
      <section id="compare" className="bg-white px-4 py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-12 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-orange-600">Compare</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              WrkFlo vs Frame.io
            </h2>
            <p className="mt-3 text-gray-600">Frame.io was built for Hollywood studios. WrkFlo was built for you.</p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-6 py-4 font-semibold text-gray-700">Feature</th>
                  <th className="px-6 py-4 text-center font-bold text-orange-600">
                    <span className="flex items-center justify-center gap-1.5">
                      <FlameIcon className="h-4 w-4" /> WrkFlo
                    </span>
                  </th>
                  <th className="px-6 py-4 text-center font-semibold text-gray-500">Frame.io</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 bg-white">
                {[
                  { feature: 'Client sign-up required', wrkflo: '✅ No', frameio: '❌ Yes' },
                  { feature: 'Free tier', wrkflo: '✅ Yes', frameio: '⚠️ Limited' },
                  { feature: 'No-account review links', wrkflo: '✅ Yes', frameio: '❌ No' },
                  { feature: 'Built for indie creators', wrkflo: '✅ Yes', frameio: '❌ Enterprise-focused' },
                  { feature: 'Timestamped comments', wrkflo: '✅ Yes', frameio: '✅ Yes' },
                  { feature: 'Password-protected links', wrkflo: '✅ Yes', frameio: '✅ Yes' },
                  { feature: 'Affordable pricing', wrkflo: '✅ Yes', frameio: '❌ Premium' },
                ].map(({ feature, wrkflo, frameio }, i) => (
                  <tr
                    key={feature}
                    className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}
                  >
                    <td className="px-6 py-4 font-medium text-gray-700">{feature}</td>
                    <td className="px-6 py-4 text-center font-medium text-gray-900">{wrkflo}</td>
                    <td className="px-6 py-4 text-center text-gray-500">{frameio}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Waitlist / Early Access ── */}
      <section id="waitlist" className="bg-gradient-to-br from-orange-50 to-red-50 px-4 py-20">
        <div className="mx-auto max-w-xl text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 shadow-lg shadow-orange-500/30">
              <FlameIcon className="h-6 w-6 text-white" />
            </div>
          </div>
          <h2 className="mb-3 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Join the Early Access List
          </h2>
          <p className="mb-8 text-gray-600">
            WrkFlo is currently in private beta. Sign up to get notified when we launch and{' '}
            <strong className="text-orange-600">get 3 months free</strong> as a founding creator.
          </p>

          {submitted ? (
            <div className="rounded-2xl border border-orange-200 bg-white px-8 py-8 shadow-sm">
              <div className="mb-3 text-4xl">🔥</div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">You&apos;re on the list!</h3>
              <p className="text-gray-600">We&apos;ll be in touch when WrkFlo launches. Get ready to move fast.</p>
            </div>
          ) : (
            <form onSubmit={handleWaitlist} className="flex flex-col gap-3">
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 shadow-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-colors"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-6 py-3 font-semibold text-white shadow-md shadow-orange-500/25 hover:bg-orange-500 transition-all disabled:opacity-60"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Joining...
                    </span>
                  ) : (
                    <>
                      <FlameIcon className="h-4 w-4" />
                      Get Early Access
                    </>
                  )}
                </button>
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <p className="text-xs text-gray-400">No spam. Unsubscribe anytime. We&apos;ll only email you about WrkFlo.</p>
            </form>
          )}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 bg-white px-4 py-10">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col items-center gap-2 sm:items-start">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-red-600">
                  <FlameIcon className="h-4 w-4 text-white" />
                </div>
                <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-lg font-bold text-transparent">
                  WrkFlo
                </span>
              </div>
              <p className="text-xs text-gray-400">Creative review, without the agency markup.</p>
            </div>

            <nav className="flex flex-wrap justify-center gap-5 text-sm text-gray-500 sm:justify-end">
              <Link href={user ? "/dashboard" : "/login"} className="hover:text-orange-600 transition-colors">{user ? 'Dashboard' : 'Login'}</Link>
              <a href="#features" className="hover:text-orange-600 transition-colors">Features</a>
              <a href="#" className="hover:text-orange-600 transition-colors">Privacy</a>
              <a href="#" className="hover:text-orange-600 transition-colors">Terms</a>
            </nav>
          </div>

          <div className="mt-6 border-t border-gray-50 pt-6 text-center text-xs text-gray-400">
            © 2026 WrkFlo. Built for creators.
          </div>
        </div>
      </footer>

      {/* ── CSS ── */}
      <style jsx>{`
        @keyframes fire-pulse {
          0%, 100% { transform: translateX(-50%) translateY(-25%) scale(1); opacity: 0.07; }
          50% { transform: translateX(-50%) translateY(-28%) scale(1.08); opacity: 0.10; }
        }
        .fire-blob {
          background: radial-gradient(ellipse, #f97316 0%, #ef4444 50%, #dc2626 100%);
          animation: fire-pulse 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
