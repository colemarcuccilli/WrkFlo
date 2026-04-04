'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const CYAN = '#15f3ec'
const MINT = '#16ffc0'
const BG = '#0a0a0f'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setError(updateError.message)
    } else {
      setSuccess(true)
      // Redirect based on role
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).maybeSingle()
        setTimeout(() => router.push(profile?.role === 'client' ? '/client-dashboard' : '/dashboard'), 2000)
      } else {
        setTimeout(() => router.push('/login'), 2000)
      }
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 400, width: '100%' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-block', width: 48, height: 48, borderRadius: 12, background: `linear-gradient(135deg, ${CYAN}, ${MINT})`, textAlign: 'center', lineHeight: '48px' }}>
            <span style={{ fontSize: 24, color: '#0a0a0f', fontWeight: 'bold' }}>W</span>
          </div>
          <div style={{ marginTop: 12 }}>
            <span style={{ fontSize: 22, fontWeight: 700, background: `linear-gradient(135deg, ${CYAN}, ${MINT})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>WrkFlo</span>
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 32 }}>
          {success ? (
            <>
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={MINT} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto' }}>
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h1 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 700, color: 'rgba(255,255,255,0.95)', textAlign: 'center' }}>Password Updated</h1>
              <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>
                Redirecting to your dashboard...
              </p>
            </>
          ) : (
            <>
              <h1 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 700, color: 'rgba(255,255,255,0.95)' }}>Set new password</h1>
              <p style={{ margin: '0 0 24px', fontSize: 14, lineHeight: 1.6, color: 'rgba(255,255,255,0.5)' }}>
                Enter your new password below.
              </p>

              {error && (
                <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: 13, marginBottom: 16 }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>New Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="At least 6 characters"
                    style={{
                      width: '100%', padding: '12px 14px', borderRadius: 10,
                      border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)',
                      color: 'rgba(255,255,255,0.9)', fontSize: 14, outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Confirm your password"
                    style={{
                      width: '100%', padding: '12px 14px', borderRadius: 10,
                      border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)',
                      color: 'rgba(255,255,255,0.9)', fontSize: 14, outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%', padding: '12px 24px', borderRadius: 10,
                    border: 'none', background: `linear-gradient(135deg, ${CYAN}, ${MINT})`,
                    color: '#0a0a0f', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.6 : 1, boxShadow: '0 4px 20px rgba(21,243,236,0.2)',
                  }}
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
