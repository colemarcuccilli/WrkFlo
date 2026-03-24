'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/components/AuthProvider'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type MilestoneType =
  | 'first_project'
  | 'third_project'
  | 'first_client_invite'
  | 'first_review_shared'
  | 'first_revision'
  | 'fifth_comment'
  | 'first_approval'
  | 'weekly_checkin'

interface MilestoneConfig {
  title: string
  question: string
}

interface FeedbackPayload {
  user_id: string
  user_email: string | null
  prompt_type: MilestoneType
  rating: number
  feedback: string
}

// ---------------------------------------------------------------------------
// Milestone configuration
// ---------------------------------------------------------------------------

const MILESTONE_CONFIG: Record<MilestoneType, MilestoneConfig> = {
  first_project: {
    title: 'First project created!',
    question: 'How was creating your first project?',
  },
  third_project: {
    title: 'Three projects and counting!',
    question: 'You\'re getting the hang of it! How has project management felt so far?',
  },
  first_client_invite: {
    title: 'Your first client invite sent!',
    question: 'How was the experience of inviting a client?',
  },
  first_review_shared: {
    title: 'First review link shared!',
    question: 'How\'s the review sharing experience?',
  },
  first_revision: {
    title: 'First new version uploaded!',
    question: 'How did uploading a revision feel? Was it straightforward?',
  },
  fifth_comment: {
    title: 'Five comments made!',
    question: 'How\'s the commenting experience working for you?',
  },
  first_approval: {
    title: 'First file approved!',
    question: 'How was the approval workflow?',
  },
  weekly_checkin: {
    title: 'One week with WrkFlo!',
    question: 'You\'ve been with us a week — how are you liking WrkFlo so far?',
  },
}

const STORAGE_PREFIX = 'wrkflo_milestone_'
const SIGNUP_DATE_KEY = 'wrkflo_signup_date'
const WEEKLY_CHECK_INTERVAL = 60 * 60 * 1000 // check every hour

// ---------------------------------------------------------------------------
// Helper: dispatch a milestone event from anywhere in the app
// ---------------------------------------------------------------------------

export function triggerMilestone(type: MilestoneType | string) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(
    new CustomEvent('wrkflo:milestone', { detail: { type } })
  )
}

// ---------------------------------------------------------------------------
// Helper: localStorage utilities
// ---------------------------------------------------------------------------

function isMilestoneCompleted(type: string): boolean {
  if (typeof window === 'undefined') return true
  return localStorage.getItem(`${STORAGE_PREFIX}${type}`) === 'done'
}

function markMilestoneCompleted(type: string) {
  if (typeof window === 'undefined') return
  localStorage.setItem(`${STORAGE_PREFIX}${type}`, 'done')
}

// ---------------------------------------------------------------------------
// Star rating component
// ---------------------------------------------------------------------------

function StarRating({
  rating,
  onRate,
}: {
  rating: number
  onRate: (r: number) => void
}) {
  const [hovered, setHovered] = useState(0)

  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hovered || rating)
        return (
          <button
            key={star}
            type="button"
            onClick={() => onRate(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 28,
              lineHeight: 1,
              color: filled ? '#15f3ec' : 'rgba(255,255,255,0.2)',
              transition: 'color 0.15s ease, transform 0.15s ease',
              transform: filled ? 'scale(1.15)' : 'scale(1)',
              padding: 2,
            }}
          >
            ★
          </button>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function FeedbackPrompt() {
  const { user, userProfile } = useAuth()
  const [activeMilestone, setActiveMilestone] = useState<MilestoneType | null>(null)
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [visible, setVisible] = useState(false)
  const weeklyTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // ---- Reset form state when a new milestone appears ----
  const openMilestone = useCallback((type: MilestoneType) => {
    if (isMilestoneCompleted(type)) return
    setRating(0)
    setFeedback('')
    setSubmitting(false)
    setActiveMilestone(type)
    // Trigger animation on next frame
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true))
    })
  }, [])

  // ---- Close / dismiss ----
  const close = useCallback((markDone: boolean) => {
    if (markDone && activeMilestone) {
      markMilestoneCompleted(activeMilestone)
    }
    setVisible(false)
    // Wait for exit animation before unmounting
    setTimeout(() => setActiveMilestone(null), 250)
  }, [activeMilestone])

  // ---- Submit feedback ----
  const handleSubmit = useCallback(async () => {
    if (!activeMilestone || !user) return
    setSubmitting(true)

    const payload: FeedbackPayload = {
      user_id: user.id,
      user_email: userProfile?.email ?? user.email ?? null,
      prompt_type: activeMilestone,
      rating,
      feedback: feedback.trim(),
    }

    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } catch {
      // Silently fail — we don't want feedback collection to block the user
    }

    close(true)
  }, [activeMilestone, user, userProfile, rating, feedback, close])

  // ---- Listen for milestone events ----
  useEffect(() => {
    function onMilestone(e: Event) {
      const detail = (e as CustomEvent).detail as { type: string } | undefined
      if (!detail?.type) return
      const type = detail.type as MilestoneType
      if (MILESTONE_CONFIG[type] && !isMilestoneCompleted(type)) {
        openMilestone(type)
      }
    }

    window.addEventListener('wrkflo:milestone', onMilestone)
    return () => window.removeEventListener('wrkflo:milestone', onMilestone)
  }, [openMilestone])

  // ---- Weekly check-in timer ----
  useEffect(() => {
    if (!user) return

    function checkWeekly() {
      if (isMilestoneCompleted('weekly_checkin')) return

      const signupRaw = localStorage.getItem(SIGNUP_DATE_KEY)
      if (!signupRaw) return

      const signupDate = new Date(signupRaw)
      const now = new Date()
      const diffMs = now.getTime() - signupDate.getTime()
      const diffDays = diffMs / (1000 * 60 * 60 * 24)

      if (diffDays >= 7) {
        openMilestone('weekly_checkin')
      }
    }

    // Check on mount
    checkWeekly()

    // Re-check periodically
    weeklyTimerRef.current = setInterval(checkWeekly, WEEKLY_CHECK_INTERVAL)
    return () => {
      if (weeklyTimerRef.current) clearInterval(weeklyTimerRef.current)
    }
  }, [user, openMilestone])

  // ---- Don't render when there's no active milestone or no user ----
  if (!activeMilestone || !user) return null

  const config = MILESTONE_CONFIG[activeMilestone]
  if (!config) return null

  // ---- Styles ----
  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(6px)',
    WebkitBackdropFilter: 'blur(6px)',
    opacity: visible ? 1 : 0,
    transition: 'opacity 0.25s ease',
  }

  const modalStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    maxWidth: 440,
    margin: '0 16px',
    padding: '32px 28px 28px',
    borderRadius: 16,
    background: 'rgba(16, 16, 24, 0.85)',
    border: '1px solid rgba(21, 243, 236, 0.15)',
    boxShadow: '0 24px 80px rgba(0, 0, 0, 0.5), 0 0 40px rgba(21, 243, 236, 0.06)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    transform: visible ? 'scale(1)' : 'scale(0.92)',
    opacity: visible ? 1 : 0,
    transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease',
  }

  const titleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: 20,
    fontWeight: 700,
    color: '#15f3ec',
    textAlign: 'center',
    letterSpacing: '-0.01em',
  }

  const questionStyle: React.CSSProperties = {
    margin: '12px 0 20px',
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.75)',
    textAlign: 'center',
    lineHeight: 1.5,
  }

  const textareaStyle: React.CSSProperties = {
    width: '100%',
    minHeight: 90,
    padding: '12px 14px',
    borderRadius: 10,
    border: '1px solid rgba(255, 255, 255, 0.08)',
    background: 'rgba(255, 255, 255, 0.04)',
    color: '#fff',
    fontSize: 14,
    lineHeight: 1.5,
    resize: 'vertical',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  }

  const buttonBase: React.CSSProperties = {
    flex: 1,
    padding: '10px 0',
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    border: 'none',
    fontFamily: 'inherit',
  }

  const submitBtnStyle: React.CSSProperties = {
    ...buttonBase,
    background: 'linear-gradient(135deg, #15f3ec 0%, #16ffc0 100%)',
    color: '#0a0a0f',
    opacity: submitting ? 0.6 : 1,
    pointerEvents: submitting ? 'none' : 'auto',
  }

  const skipBtnStyle: React.CSSProperties = {
    ...buttonBase,
    background: 'rgba(255, 255, 255, 0.06)',
    color: 'rgba(255, 255, 255, 0.5)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 12,
    fontWeight: 500,
    color: 'rgba(255, 255, 255, 0.4)',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  }

  return (
    <div
      style={overlayStyle}
      onClick={(e) => {
        if (e.target === e.currentTarget) close(false)
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Feedback prompt"
    >
      <div style={modalStyle}>
        {/* Accent glow line at top */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '60%',
            height: 2,
            borderRadius: 2,
            background: 'linear-gradient(90deg, transparent, #15f3ec, #16ffc0, transparent)',
          }}
        />

        <h2 style={titleStyle}>{config.title}</h2>
        <p style={questionStyle}>{config.question}</p>

        {/* Star Rating */}
        <div style={{ marginBottom: 20 }}>
          <span style={labelStyle}>Your rating</span>
          <StarRating rating={rating} onRate={setRating} />
        </div>

        {/* Feedback textarea */}
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle} htmlFor="wrkflo-feedback-text">
            Tell us more (optional)
          </label>
          <textarea
            id="wrkflo-feedback-text"
            style={textareaStyle}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Anything we could improve?"
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'rgba(21, 243, 236, 0.35)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'
            }}
          />
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            style={skipBtnStyle}
            onClick={() => close(true)}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)'
            }}
          >
            Skip
          </button>
          <button
            type="button"
            style={submitBtnStyle}
            onClick={handleSubmit}
            disabled={submitting}
            onMouseEnter={(e) => {
              if (!submitting) e.currentTarget.style.opacity = '0.85'
            }}
            onMouseLeave={(e) => {
              if (!submitting) e.currentTarget.style.opacity = '1'
            }}
          >
            {submitting ? 'Sending...' : 'Send Feedback'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default FeedbackPrompt
