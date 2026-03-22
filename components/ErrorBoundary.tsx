'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  handleReport = () => {
    // Dispatch custom event to open BugReportModal with pre-filled error
    const event = new CustomEvent('wrkflo:open-bug-report', {
      detail: {
        category: 'Bug',
        description: this.state.error
          ? `[Auto-captured error]\n${this.state.error.name}: ${this.state.error.message}\n\nStack trace:\n${this.state.error.stack || 'N/A'}`
          : 'An unexpected error occurred in the application.',
      },
    })
    window.dispatchEvent(event)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            background: '#0a0a0f',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
        >
          <div
            style={{
              maxWidth: '480px',
              width: '100%',
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '20px',
              padding: '48px 36px',
              textAlign: 'center',
            }}
          >
            {/* WrkFlo branding */}
            <div
              style={{
                fontSize: '28px',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                marginBottom: '8px',
                background: 'linear-gradient(135deg, #15f3ec, #16ffc0)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              WrkFlo
            </div>

            {/* Error icon */}
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(255, 107, 107, 0.1)',
                border: '1px solid rgba(255, 107, 107, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '24px auto',
                fontSize: '28px',
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>

            <h1
              style={{
                color: '#ffffff',
                fontSize: '22px',
                fontWeight: 600,
                margin: '0 0 12px',
              }}
            >
              Something went wrong
            </h1>

            <p
              style={{
                color: 'rgba(255, 255, 255, 0.5)',
                fontSize: '14px',
                lineHeight: '1.6',
                margin: '0 0 32px',
              }}
            >
              An unexpected error occurred. You can try reloading the page or report this issue to help us fix it.
            </p>

            {/* Error details (collapsed) */}
            {this.state.error && (
              <details
                style={{
                  textAlign: 'left',
                  marginBottom: '28px',
                  background: 'rgba(255, 107, 107, 0.05)',
                  border: '1px solid rgba(255, 107, 107, 0.1)',
                  borderRadius: '10px',
                  padding: '12px 16px',
                }}
              >
                <summary
                  style={{
                    color: 'rgba(255, 255, 255, 0.4)',
                    fontSize: '12px',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  Error details
                </summary>
                <pre
                  style={{
                    color: '#ff6b6b',
                    fontSize: '11px',
                    marginTop: '8px',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    maxHeight: '120px',
                    overflow: 'auto',
                    fontFamily: 'monospace',
                  }}
                >
                  {this.state.error.message}
                </pre>
              </details>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={this.handleReport}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  borderRadius: '10px',
                  border: '1px solid rgba(21, 243, 236, 0.3)',
                  background: 'rgba(21, 243, 236, 0.05)',
                  color: '#15f3ec',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(21, 243, 236, 0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(21, 243, 236, 0.05)'
                }}
              >
                Report this issue
              </button>
              <button
                onClick={this.handleReload}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #15f3ec, #16ffc0)',
                  color: '#0a0a0f',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.85'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1'
                }}
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
