'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/components/AuthProvider'

type Category = 'Bug' | 'Feature Request' | 'UI Issue' | 'Performance' | 'General Feedback' | 'Other'

const CATEGORIES: Category[] = ['Bug', 'Feature Request', 'General Feedback', 'UI Issue', 'Performance', 'Other']

interface Metadata {
  url: string
  browser: string
  viewport: string
  userEmail: string | null
  timestamp: string
}

function collectMetadata(email: string | null): Metadata {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown'
  const vw = typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'Unknown'
  const url = typeof window !== 'undefined' ? window.location.href : 'Unknown'

  return {
    url,
    browser: ua,
    viewport: vw,
    userEmail: email,
    timestamp: new Date().toISOString(),
  }
}

export function BugReportModal() {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [category, setCategory] = useState<Category>('Bug')
  const [description, setDescription] = useState('')
  const [includeScreenshot, setIncludeScreenshot] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [metadata, setMetadata] = useState<Metadata | null>(null)
  const [fabVisible, setFabVisible] = useState(true)
  const modalRef = useRef<HTMLDivElement>(null)

  const openModal = useCallback((prefill?: { category?: string; description?: string }) => {
    if (prefill?.category && CATEGORIES.includes(prefill.category as Category)) {
      setCategory(prefill.category as Category)
    }
    if (prefill?.description) {
      setDescription(prefill.description)
    }
    setMetadata(collectMetadata(user?.email ?? null))
    setIsOpen(true)
    setSubmitted(false)
    setError(null)
  }, [user])

  // Listen for custom event from ErrorBoundary / ErrorToast
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail
      openModal(detail)
    }
    window.addEventListener('wrkflo:open-bug-report', handler)
    return () => window.removeEventListener('wrkflo:open-bug-report', handler)
  }, [openModal])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen])

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    // Delay to avoid the FAB click triggering immediate close
    const timeout = setTimeout(() => {
      window.addEventListener('mousedown', handler)
    }, 100)
    return () => {
      clearTimeout(timeout)
      window.removeEventListener('mousedown', handler)
    }
  }, [isOpen])

  const handleSubmit = async () => {
    if (description.trim().length < 10) {
      setError('Description must be at least 10 characters.')
      return
    }

    setSubmitting(true)
    setError(null)

    const meta = metadata || collectMetadata(user?.email ?? null)

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          description: description.trim(),
          url: meta.url,
          browser_info: meta.browser,
          viewport: meta.viewport,
          user_email: meta.userEmail,
          user_id: user?.id ?? null,
          metadata: {
            includeScreenshot,
            timestamp: meta.timestamp,
          },
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to submit report')
      }

      setSubmitted(true)
      // Reset form after delay
      setTimeout(() => {
        setIsOpen(false)
        setCategory('Bug')
        setDescription('')
        setIncludeScreenshot(false)
        setShowDetails(false)
        setSubmitted(false)
      }, 2500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    // Reset state after animation
    setTimeout(() => {
      if (!isOpen) {
        setCategory('Bug')
        setDescription('')
        setIncludeScreenshot(false)
        setShowDetails(false)
        setSubmitted(false)
        setError(null)
      }
    }, 300)
  }

  return (
    <>
      {/* FAB - bottom left */}
      {fabVisible && !isOpen && (
        <button
          onClick={() => openModal()}
          aria-label="Report a bug"
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '24px',
            zIndex: 9998,
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(255, 255, 255, 0.04)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            color: 'rgba(255, 255, 255, 0.4)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(21, 243, 236, 0.08)'
            e.currentTarget.style.borderColor = 'rgba(21, 243, 236, 0.2)'
            e.currentTarget.style.color = '#15f3ec'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.4)'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 2l1.88 1.88" />
            <path d="M14.12 3.88L16 2" />
            <path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1" />
            <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6" />
            <path d="M12 20v2" />
            <path d="M6 13H2" />
            <path d="M22 13h-4" />
            <path d="m6.53 9-1.72-1.01" />
            <path d="m19.19 7.99L17.47 9" />
            <path d="m6.53 17-.53.31" />
            <path d="m17.47 17 .53.31" />
          </svg>
        </button>
      )}

      {/* Modal overlay */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            animation: 'wrkflo-fade-in 0.2s ease',
          }}
        >
          <div
            ref={modalRef}
            style={{
              width: '100%',
              maxWidth: '460px',
              background: 'rgba(16, 16, 24, 0.95)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '20px',
              padding: '32px',
              animation: 'wrkflo-slide-up 0.25s ease',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            {submitted ? (
              /* Success state */
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'rgba(22, 255, 192, 0.1)',
                    border: '1px solid rgba(22, 255, 192, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16ffc0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3 style={{ color: '#ffffff', fontSize: '18px', fontWeight: 600, margin: '0 0 8px' }}>
                  Thanks for the report!
                </h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '14px', margin: 0 }}>
                  We&apos;ll look into it.
                </p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h2 style={{ color: '#ffffff', fontSize: '18px', fontWeight: 600, margin: 0 }}>
                    Report an Issue
                  </h2>
                  <button
                    onClick={handleClose}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'rgba(255, 255, 255, 0.3)',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                {/* Category */}
                <label style={{ display: 'block', marginBottom: '16px' }}>
                  <span style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '6px' }}>
                    Category
                  </span>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      background: 'rgba(255, 255, 255, 0.04)',
                      color: '#ffffff',
                      fontSize: '14px',
                      outline: 'none',
                      appearance: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c} style={{ background: '#10101a', color: '#fff' }}>
                        {c}
                      </option>
                    ))}
                  </select>
                </label>

                {/* Description */}
                <label style={{ display: 'block', marginBottom: '16px' }}>
                  <span style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '6px' }}>
                    Description <span style={{ color: '#ff6b6b' }}>*</span>
                  </span>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the issue or suggestion..."
                    rows={5}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      background: 'rgba(255, 255, 255, 0.04)',
                      color: '#ffffff',
                      fontSize: '14px',
                      lineHeight: '1.5',
                      outline: 'none',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                      minHeight: '100px',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(21, 243, 236, 0.3)'
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'
                    }}
                  />
                  {description.length > 0 && description.trim().length < 10 && (
                    <span style={{ color: '#ff6b6b', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                      Minimum 10 characters required ({description.trim().length}/10)
                    </span>
                  )}
                </label>

                {/* Screenshot toggle */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '16px',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  <div
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '4px',
                      border: `1px solid ${includeScreenshot ? '#15f3ec' : 'rgba(255, 255, 255, 0.15)'}`,
                      background: includeScreenshot ? 'rgba(21, 243, 236, 0.15)' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s',
                      flexShrink: 0,
                    }}
                  >
                    {includeScreenshot && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#15f3ec" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <input
                    type="checkbox"
                    checked={includeScreenshot}
                    onChange={(e) => setIncludeScreenshot(e.target.checked)}
                    style={{ display: 'none' }}
                  />
                  <span style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '13px' }}>
                    Include page URL & browser info in report
                  </span>
                </label>

                {/* Technical details */}
                {metadata && (
                  <details
                    open={showDetails}
                    onToggle={(e) => setShowDetails((e.target as HTMLDetailsElement).open)}
                    style={{
                      marginBottom: '20px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      borderRadius: '10px',
                      padding: '10px 14px',
                    }}
                  >
                    <summary
                      style={{
                        color: 'rgba(255, 255, 255, 0.35)',
                        fontSize: '12px',
                        cursor: 'pointer',
                        userSelect: 'none',
                      }}
                    >
                      Technical Details (auto-collected)
                    </summary>
                    <div style={{ marginTop: '10px', fontSize: '11px', color: 'rgba(255, 255, 255, 0.3)', fontFamily: 'monospace', lineHeight: '1.8' }}>
                      <div><strong style={{ color: 'rgba(255, 255, 255, 0.45)' }}>URL:</strong> {metadata.url}</div>
                      <div><strong style={{ color: 'rgba(255, 255, 255, 0.45)' }}>Browser:</strong> {metadata.browser.length > 80 ? metadata.browser.substring(0, 80) + '...' : metadata.browser}</div>
                      <div><strong style={{ color: 'rgba(255, 255, 255, 0.45)' }}>Viewport:</strong> {metadata.viewport}</div>
                      {metadata.userEmail && (
                        <div><strong style={{ color: 'rgba(255, 255, 255, 0.45)' }}>Email:</strong> {metadata.userEmail}</div>
                      )}
                      <div><strong style={{ color: 'rgba(255, 255, 255, 0.45)' }}>Time:</strong> {metadata.timestamp}</div>
                    </div>
                  </details>
                )}

                {/* Error message */}
                {error && (
                  <div style={{
                    background: 'rgba(255, 107, 107, 0.08)',
                    border: '1px solid rgba(255, 107, 107, 0.15)',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    marginBottom: '16px',
                    color: '#ff6b6b',
                    fontSize: '13px',
                  }}>
                    {error}
                  </div>
                )}

                {/* Submit button */}
                <button
                  onClick={handleSubmit}
                  disabled={submitting || description.trim().length < 10}
                  style={{
                    width: '100%',
                    padding: '12px 20px',
                    borderRadius: '10px',
                    border: 'none',
                    background: submitting || description.trim().length < 10
                      ? 'rgba(255, 255, 255, 0.06)'
                      : 'linear-gradient(135deg, #15f3ec, #16ffc0)',
                    color: submitting || description.trim().length < 10
                      ? 'rgba(255, 255, 255, 0.25)'
                      : '#0a0a0f',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: submitting || description.trim().length < 10 ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {submitting ? 'Submitting...' : 'Submit Report'}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Keyframe animations (injected once) */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes wrkflo-fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes wrkflo-slide-up {
            from { opacity: 0; transform: translateY(12px) scale(0.97); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
        `,
      }} />
    </>
  )
}
