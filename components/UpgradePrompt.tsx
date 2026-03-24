'use client'

import { useState } from 'react'

const CYAN = '#15f3ec'
const MINT = '#16ffc0'

interface UpgradePromptProps {
  isOpen: boolean
  onClose: () => void
}

export function UpgradePrompt({ isOpen, onClose }: UpgradePromptProps) {
  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'rgba(15,15,25,0.95)',
          border: '1px solid rgba(21,243,236,0.15)',
          borderRadius: 20,
          padding: 40,
          maxWidth: 440,
          width: '90%',
          textAlign: 'center',
          boxShadow: '0 0 60px rgba(21,243,236,0.08), 0 20px 60px rgba(0,0,0,0.5)',
          animation: 'upgradeIn 0.3s ease-out',
        }}
      >
        <style>{`
          @keyframes upgradeIn {
            from { opacity: 0; transform: scale(0.9) translateY(10px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>

        {/* Icon */}
        <div style={{
          width: 64, height: 64, borderRadius: 16, margin: '0 auto 20px',
          background: `linear-gradient(135deg, ${CYAN}20, ${MINT}20)`,
          border: `1px solid ${CYAN}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 0 30px ${CYAN}15`,
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={CYAN} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </div>

        <h2 style={{
          margin: '0 0 8px', fontSize: 24, fontWeight: 800,
          background: `linear-gradient(135deg, ${CYAN}, ${MINT})`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>
          Unlock Creator Mode
        </h2>

        <p style={{ margin: '0 0 24px', fontSize: 15, lineHeight: 1.6, color: 'rgba(255,255,255,0.6)' }}>
          Create projects, import files from cloud storage, share review links, and manage client feedback — all in one place.
        </p>

        {/* Features list */}
        <div style={{
          background: 'rgba(21,243,236,0.04)',
          border: '1px solid rgba(21,243,236,0.1)',
          borderRadius: 12,
          padding: '16px 20px',
          marginBottom: 24,
          textAlign: 'left',
        }}>
          {[
            'Unlimited projects & file imports',
            'Cloud storage (Google Drive, Dropbox, OneDrive)',
            'Branded review links for clients',
            'Version control & revision tracking',
            'Real-time comments & approvals',
          ].map((feature, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '6px 0',
              color: 'rgba(255,255,255,0.7)',
              fontSize: 13,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={MINT} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {feature}
            </div>
          ))}
        </div>

        {/* CTA */}
        <a
          href="/join?role=creator&trial=true"
          style={{
            display: 'block',
            padding: '14px 24px',
            borderRadius: 12,
            background: `linear-gradient(135deg, ${CYAN}, ${MINT})`,
            color: '#0a0a0f',
            fontSize: 16,
            fontWeight: 700,
            textDecoration: 'none',
            boxShadow: `0 4px 20px rgba(21,243,236,0.3), 0 0 40px rgba(21,243,236,0.1)`,
            transition: 'all 0.2s',
            marginBottom: 12,
          }}
        >
          Start 14-Day Free Trial
        </a>

        <button
          onClick={onClose}
          style={{
            background: 'none', border: 'none',
            color: 'rgba(255,255,255,0.4)',
            fontSize: 13, cursor: 'pointer',
            padding: '8px 16px',
          }}
        >
          Maybe later
        </button>
      </div>
    </div>
  )
}

export default UpgradePrompt
