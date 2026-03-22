'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface ToastItem {
  id: string
  message: string
  visible: boolean
}

export function ErrorToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const toastCountRef = useRef(0)

  const addToast = useCallback((message: string) => {
    // Limit simultaneous toasts
    if (toastCountRef.current >= 3) return

    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    toastCountRef.current += 1

    setToasts((prev) => [...prev, { id, message, visible: true }])

    // Auto dismiss after 8 seconds
    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, visible: false } : t))
      )
      // Remove from DOM after fade-out
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
        toastCountRef.current -= 1
      }, 300)
    }, 8000)
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, visible: false } : t))
    )
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
      toastCountRef.current -= 1
    }, 300)
  }, [])

  const openReport = useCallback((message: string, toastId: string) => {
    dismissToast(toastId)
    const event = new CustomEvent('wrkflo:open-bug-report', {
      detail: {
        category: 'Bug',
        description: `[Auto-captured error]\n${message}`,
      },
    })
    window.dispatchEvent(event)
  }, [dismissToast])

  useEffect(() => {
    // Listen for unhandled promise rejections
    const rejectionHandler = (event: PromiseRejectionEvent) => {
      const msg = event.reason instanceof Error
        ? event.reason.message
        : String(event.reason)
      addToast(msg)
    }

    // Listen for global errors
    const errorHandler = (event: ErrorEvent) => {
      addToast(event.message || 'An unexpected error occurred')
    }

    // Intercept console.error
    const originalError = console.error
    console.error = (...args: unknown[]) => {
      originalError.apply(console, args)
      // Only show toast for meaningful errors, skip React internals
      const firstArg = args[0]
      if (typeof firstArg === 'string' && !firstArg.startsWith('Warning:') && !firstArg.includes('React')) {
        addToast(firstArg.substring(0, 200))
      }
    }

    window.addEventListener('unhandledrejection', rejectionHandler)
    window.addEventListener('error', errorHandler)

    return () => {
      window.removeEventListener('unhandledrejection', rejectionHandler)
      window.removeEventListener('error', errorHandler)
      console.error = originalError
    }
  }, [addToast])

  if (toasts.length === 0) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '80px',
        left: '24px',
        zIndex: 9997,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        maxWidth: '420px',
      }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          style={{
            background: 'rgba(16, 16, 24, 0.95)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 107, 107, 0.2)',
            borderLeft: '3px solid #ff6b6b',
            borderRadius: '10px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            opacity: toast.visible ? 1 : 0,
            transform: toast.visible ? 'translateX(0)' : 'translateX(-12px)',
            transition: 'all 0.3s ease',
            animation: 'wrkflo-toast-in 0.3s ease',
          }}
        >
          {/* Error icon */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ff6b6b"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ flexShrink: 0 }}
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '13px',
                lineHeight: '1.4',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              Something went wrong.{' '}
              <button
                onClick={() => openReport(toast.message, toast.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#15f3ec',
                  fontSize: '13px',
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'underline',
                  textUnderlineOffset: '2px',
                }}
              >
                Report it
              </button>
            </div>
          </div>

          {/* Dismiss */}
          <button
            onClick={() => dismissToast(toast.id)}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.2)',
              cursor: 'pointer',
              padding: '2px',
              display: 'flex',
              flexShrink: 0,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      ))}

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes wrkflo-toast-in {
            from { opacity: 0; transform: translateX(-12px); }
            to { opacity: 1; transform: translateX(0); }
          }
        `,
      }} />
    </div>
  )
}
