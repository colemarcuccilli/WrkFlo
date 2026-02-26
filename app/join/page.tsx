'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const CYAN = '#15f3ec';
const MINT = '#16ffc0';

export default function JoinPage() {
  const searchParams = useSearchParams()
  const inviteEmail = searchParams.get('email') || ''
  const from = searchParams.get('from') || ''

  const [mode, setMode] = useState<'login' | 'signup'>('signup')
  const [email, setEmail] = useState(inviteEmail)
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const supabase = createClient()

  // Check if user is already logged in
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        // Already logged in — link them as client and redirect
        fetch('/api/join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email }),
        }).then(() => {
          window.location.href = '/client-dashboard'
        })
      }
    })
  }, [])

  async function handleGoogleLogin() {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/client-dashboard&role=client`,
      },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true)
    setError('')
    setMessage('')

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role: 'client', full_name: name || email.split('@')[0] },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/client-dashboard&role=client`,
        },
      })
      if (error) {
        setError(error.message)
      } else {
        setMessage('Check your email for a confirmation link to complete your account.')
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) {
        setError(signInError.message)
      } else {
        // Link as client and redirect
        await fetch('/api/join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        })
        window.location.href = '/client-dashboard'
        return
      }
    }
    setLoading(false)
  }

  return (
    <div style={{ background: '#0a0a0f', color: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', overflow: 'hidden' }}>
      {/* Background orbs */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }} aria-hidden="true">
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', filter: 'blur(80px)', opacity: 0.1, background: CYAN, top: '-10%', left: '-10%' }} />
        <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', filter: 'blur(80px)', opacity: 0.08, background: MINT, bottom: '-5%', right: '-5%' }} />
      </div>
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `radial-gradient(ellipse 60% 40% at 50% 30%, rgba(21,243,236,0.05) 0%, transparent 70%)`,
      }} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 10 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 16,
              background: `linear-gradient(135deg, ${CYAN}, ${MINT})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 0 24px rgba(21,243,236,0.3)`,
            }}>
              <svg style={{ width: 28, height: 28, color: '#0a0a0f' }} viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C12 2 9 7 9 10c0 1.657 1.343 3 3 3s3-1.343 3-3c0-.88-.3-1.7-.8-2.35C15.1 9.1 16 10.9 16 13c0 2.21-1.79 4-4 4s-4-1.79-4-4c0-3.5 4-11 4-11z" />
              </svg>
            </div>
            <span style={{
              fontSize: 32, fontWeight: 900, letterSpacing: '-0.03em',
              background: `linear-gradient(135deg, ${CYAN}, ${MINT})`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>WrkFlo</span>
          </Link>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20, padding: 32, backdropFilter: 'blur(20px)',
        }}>
          {/* Invite badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center',
            marginBottom: 20, padding: '8px 16px', borderRadius: 100,
            background: 'rgba(21,243,236,0.06)', border: '1px solid rgba(21,243,236,0.15)',
            width: 'fit-content', margin: '0 auto 20px',
          }}>
            <svg style={{ width: 14, height: 14, color: CYAN }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span style={{ fontSize: 12, fontWeight: 600, color: CYAN }}>You&apos;ve been invited to review</span>
          </div>

          <h1 style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.02em', textAlign: 'center', marginBottom: 4, color: 'rgba(255,255,255,0.95)' }}>
            {mode === 'signup' ? 'Create your client account' : 'Sign in to review'}
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginBottom: 24 }}>
            {mode === 'signup'
              ? 'Set up your account to review and approve creative work.'
              : 'Sign in with your existing account to continue.'}
          </p>
          {from && (
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginBottom: 20, marginTop: -16 }}>
              Invited by <strong style={{ color: CYAN }}>{from}</strong>
            </p>
          )}

          {/* Google OAuth */}
          <button onClick={handleGoogleLogin} disabled={loading} style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
            padding: '12px 16px', borderRadius: 12,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff', fontSize: 14, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s', opacity: loading ? 0.5 : 1,
          }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; } }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
          >
            <svg style={{ width: 20, height: 20 }} viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', gap: 12 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {mode === 'signup' && (
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>Your Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Full name" disabled={loading}
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: 10,
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff', fontSize: 14, outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = `rgba(21,243,236,0.5)`; e.currentTarget.style.boxShadow = `0 0 0 3px rgba(21,243,236,0.1)`; }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
                />
              </div>
            )}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" required disabled={loading}
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: 10,
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff', fontSize: 14, outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = `rgba(21,243,236,0.5)`; e.currentTarget.style.boxShadow = `0 0 0 3px rgba(21,243,236,0.1)`; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'signup' ? 'Create a password (min 6 chars)' : 'Your password'}
                required minLength={6} disabled={loading}
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: 10,
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff', fontSize: 14, outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = `rgba(21,243,236,0.5)`; e.currentTarget.style.boxShadow = `0 0 0 3px rgba(21,243,236,0.1)`; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
              />
            </div>

            {error && (
              <div style={{ padding: 12, background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.2)', borderRadius: 12 }}>
                <p style={{ fontSize: 13, color: '#ff6b6b' }}>{error}</p>
              </div>
            )}
            {message && (
              <div style={{ padding: 12, background: `rgba(22,255,192,0.08)`, border: `1px solid rgba(22,255,192,0.2)`, borderRadius: 12 }}>
                <p style={{ fontSize: 13, color: MINT }}>{message}</p>
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '12px 16px', borderRadius: 10, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              background: `linear-gradient(135deg, ${CYAN}, ${MINT})`,
              color: '#0a0a0f', fontSize: 14, fontWeight: 700,
              boxShadow: `0 0 20px rgba(21,243,236,0.3)`, transition: 'all 0.25s',
              opacity: loading ? 0.6 : 1,
            }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.boxShadow = `0 0 36px rgba(21,243,236,0.55)`; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = `0 0 20px rgba(21,243,236,0.3)`; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {loading ? 'Please wait...' : mode === 'signup' ? 'Create Client Account' : 'Sign In'}
            </button>
          </form>

          <p style={{ marginTop: 20, textAlign: 'center', fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>
            {mode === 'signup' ? (
              <>
                Already have an account?{' '}
                <button onClick={() => { setMode('login'); setError(''); setMessage(''); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, color: CYAN, padding: 0 }}
                >Sign in</button>
              </>
            ) : (
              <>
                Need an account?{' '}
                <button onClick={() => { setMode('signup'); setError(''); setMessage(''); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, color: CYAN, padding: 0 }}
                >Sign up</button>
              </>
            )}
          </p>
        </div>

        <p style={{ marginTop: 24, textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>
          This is a <strong style={{ color: 'rgba(255,255,255,0.35)' }}>client</strong> account — for reviewing creative work shared with you.
          <br />
          Are you a creator? <Link href="/login" style={{ color: CYAN, textDecoration: 'none' }}>Sign in here instead</Link>.
        </p>
      </div>
    </div>
  )
}
