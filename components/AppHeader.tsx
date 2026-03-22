'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import GlobalSearch from '@/components/GlobalSearch';
import { isAdmin } from '@/lib/admin';

const CYAN = '#15f3ec';
const MINT = '#16ffc0';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/clients', label: 'Clients' },
  { href: '/team', label: 'Team' },
  { href: '/settings', label: 'Settings' },
];

export default function AppHeader() {
  const { user } = useAuth();
  const pathname = usePathname();
  const userInitial = user?.user_metadata?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || '?';

  return (
    <header style={{
      borderBottom: '1px solid rgba(21,243,236,0.1)',
      background: 'rgba(10,10,15,0.95)',
      backdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 40,
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', transition: 'opacity 0.2s' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: `linear-gradient(135deg, ${CYAN}, ${MINT})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg style={{ width: 20, height: 20, color: '#0a0a0f' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <span style={{
            fontWeight: 800, fontSize: 18, letterSpacing: '-0.02em',
            background: `linear-gradient(135deg, ${CYAN}, ${MINT})`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>WrkFlo</span>
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
            return (
              <Link key={link.href} href={link.href} style={{
                fontSize: 14, textDecoration: 'none', transition: 'color 0.2s',
                color: isActive ? CYAN : 'rgba(255,255,255,0.5)',
                fontWeight: isActive ? 600 : 400,
                borderBottom: isActive ? `2px solid ${CYAN}` : '2px solid transparent',
                paddingBottom: 2,
              }}>
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {isAdmin(user?.email) && (
            <Link href="/admin" style={{
              display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8,
              background: 'rgba(21,243,236,0.06)', border: '1px solid rgba(21,243,236,0.15)',
              color: CYAN, fontSize: 12, fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Admin
            </Link>
          )}
          <button
            onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.4)', fontSize: 12, cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(21,243,236,0.3)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
          >
            <svg style={{ width: 14, height: 14 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span style={{ fontSize: 11, opacity: 0.7 }}>&#8984;K</span>
          </button>
          <Link href="/projects/new" data-onboarding="new-project">
            <button style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 8,
              background: `linear-gradient(135deg, ${CYAN}, ${MINT})`,
              color: '#0a0a0f', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer',
              boxShadow: `0 0 16px rgba(21,243,236,0.25)`, transition: 'all 0.2s',
            }}>
              <svg style={{ width: 16, height: 16 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Project
            </button>
          </Link>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: `rgba(21,243,236,0.12)`, border: `1px solid rgba(21,243,236,0.3)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: CYAN,
          }}>
            {userInitial}
          </div>
        </div>
      </div>
      <GlobalSearch />
    </header>
  );
}
