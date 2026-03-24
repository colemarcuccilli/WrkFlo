'use client';
import { getVersionColor } from '@/lib/version-colors';

const CYAN = '#15f3ec';
const MINT = '#16ffc0';
const RED = 'rgba(255,80,80,0.9)';
const PURPLE = '#a855f7';
const BG = '#0a0a0f';

const steps = [
  {
    key: 'draft',
    label: 'Upload',
    icon: (color) => (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    ),
  },
  {
    key: 'in-review',
    label: 'In Review',
    icon: (color) => (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    key: 'changes-requested',
    label: 'Feedback',
    icon: (color) => (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
  },
  {
    key: 'approved',
    label: 'Approved',
    icon: (color) => (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
];

function getStepIndex(status) {
  const idx = steps.findIndex((s) => s.key === status);
  return idx >= 0 ? idx : 0;
}

function getStepColor(status) {
  switch (status) {
    case 'draft': return 'rgba(255,255,255,0.4)';
    case 'in-review': return CYAN;
    case 'changes-requested': return RED;
    case 'approved': return MINT;
    case 'locked': return PURPLE;
    default: return 'rgba(255,255,255,0.4)';
  }
}

export default function ApprovalBar({ file, onStatusChange, viewerRole = 'client', currentRound = 1 }) {
  const status = file?.status || 'draft';
  const activeIdx = getStepIndex(status === 'locked' ? 'approved' : status);
  const activeColor = getStepColor(status);
  const isLocked = status === 'locked';

  return (
    <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>

      {/* ── Visual Status Stepper ── */}
      <div className="flex items-center justify-between mb-4 px-1">
        {steps.map((step, idx) => {
          const isActive = idx === activeIdx;
          const isPast = idx < activeIdx;
          const isFuture = idx > activeIdx;

          let dotBg, dotBorder, iconColor, labelColor;
          if (isActive) {
            dotBg = activeColor;
            dotBorder = activeColor;
            iconColor = BG;
            labelColor = activeColor;
          } else if (isPast) {
            dotBg = 'rgba(22,255,192,0.15)';
            dotBorder = 'rgba(22,255,192,0.3)';
            iconColor = MINT;
            labelColor = 'rgba(255,255,255,0.5)';
          } else {
            dotBg = 'rgba(255,255,255,0.04)';
            dotBorder = 'rgba(255,255,255,0.1)';
            iconColor = 'rgba(255,255,255,0.2)';
            labelColor = 'rgba(255,255,255,0.25)';
          }

          return (
            <div key={step.key} className="flex items-center" style={{ flex: idx < steps.length - 1 ? 1 : 'none' }}>
              {/* Step dot */}
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300"
                  style={{
                    background: dotBg,
                    border: `2px solid ${dotBorder}`,
                    boxShadow: isActive ? `0 0 12px ${activeColor}40` : 'none',
                  }}
                >
                  {step.icon(iconColor)}
                </div>
                <span
                  className="text-[10px] font-medium whitespace-nowrap"
                  style={{ color: labelColor }}
                >
                  {step.label}
                </span>
              </div>

              {/* Connecting line */}
              {idx < steps.length - 1 && (
                <div
                  className="flex-1 h-0.5 mx-1 rounded-full mt-[-18px]"
                  style={{
                    background: isPast
                      ? `linear-gradient(90deg, rgba(22,255,192,0.3), rgba(22,255,192,0.3))`
                      : isActive
                        ? `linear-gradient(90deg, ${activeColor}60, rgba(255,255,255,0.08))`
                        : 'rgba(255,255,255,0.06)',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* ── Revision Round Badge ── */}
      {currentRound > 1 && (() => {
        const roundColor = getVersionColor(currentRound);
        return (
          <div
            className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg"
            style={{ background: `${roundColor}10`, border: `1px solid ${roundColor}20` }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={roundColor} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
            </svg>
            <span className="text-xs font-medium" style={{ color: roundColor }}>
              V{currentRound} · Revision Round {currentRound}
            </span>
          </div>
        );
      })()}

      {/* ── Action Buttons ── */}
      {isLocked ? (
        <div className="flex items-center gap-2 rounded-lg p-3" style={{ background: 'rgba(147,51,234,0.08)', border: '1px solid rgba(147,51,234,0.2)' }}>
          <svg className="w-4 h-4 flex-shrink-0" style={{ color: PURPLE }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <p className="text-sm" style={{ color: PURPLE }}>This file is locked and cannot be modified.</p>
        </div>
      ) : viewerRole === 'creator' ? (
        /* ── Creator Buttons ── */
        <div>
          {(status === 'draft' || status === 'changes-requested') && (
            <button
              onClick={() => onStatusChange('in-review')}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200"
              style={{
                background: `linear-gradient(135deg, ${CYAN}, ${MINT})`,
                color: BG,
                boxShadow: `0 4px 14px rgba(21,243,236,0.25)`,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
              {status === 'changes-requested' ? 'Send for Approval' : 'Send for Review'}
            </button>
          )}

          {status === 'in-review' && (
            <div
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium"
              style={{ background: 'rgba(21,243,236,0.08)', color: CYAN, border: `1px solid rgba(21,243,236,0.2)` }}
            >
              <div
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ background: CYAN }}
              />
              Awaiting Client Feedback
            </div>
          )}

          {status === 'approved' && (
            <div
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold"
              style={{ background: 'rgba(22,255,192,0.1)', color: MINT, border: `1px solid rgba(22,255,192,0.2)` }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              Client Approved
            </div>
          )}
        </div>
      ) : viewerRole === 'viewer' ? (
        /* ── Viewer Status (view-only, no approval) ── */
        <div>
          {status === 'in-review' && (
            <div
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium"
              style={{ background: 'rgba(168,85,247,0.08)', color: '#a855f7', border: '1px solid rgba(168,85,247,0.2)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              Viewing Only — Approval by Client
            </div>
          )}
          {status === 'draft' && (
            <div
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium"
              style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="w-2 h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.3)' }} />
              Draft — Awaiting Upload
            </div>
          )}
          {status === 'changes-requested' && (
            <div
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium"
              style={{ background: 'rgba(255,80,80,0.08)', color: '#ff5050', border: '1px solid rgba(255,80,80,0.2)' }}
            >
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#ff5050' }} />
              Changes Requested
            </div>
          )}
          {status === 'approved' && (
            <div
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold"
              style={{ background: 'rgba(22,255,192,0.1)', color: '#16ffc0', border: '1px solid rgba(22,255,192,0.2)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              Approved
            </div>
          )}
        </div>
      ) : (
        /* ── Client Buttons ── */
        <div>
          {status === 'in-review' && (
            <div className="flex gap-2">
              <button
                onClick={() => onStatusChange('approved')}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200"
                style={{
                  background: MINT,
                  color: BG,
                  boxShadow: `0 4px 14px rgba(22,255,192,0.25)`,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Approve
              </button>

              <button
                onClick={() => onStatusChange('changes-requested')}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200"
                style={{
                  background: 'rgba(255,80,80,0.12)',
                  color: RED,
                  border: `1px solid rgba(255,80,80,0.25)`,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Request Changes
              </button>
            </div>
          )}

          {status === 'draft' && (
            <div
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium"
              style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="w-2 h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.3)' }} />
              Awaiting Upload
            </div>
          )}

          {status === 'changes-requested' && (
            <div
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium"
              style={{ background: 'rgba(255,80,80,0.08)', color: RED, border: '1px solid rgba(255,80,80,0.2)' }}
            >
              <div
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ background: RED }}
              />
              Changes Requested — Awaiting Revision
            </div>
          )}

          {status === 'approved' && (
            <div
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold"
              style={{ background: 'rgba(22,255,192,0.1)', color: MINT, border: '1px solid rgba(22,255,192,0.2)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              Approved
            </div>
          )}
        </div>
      )}

    </div>
  );
}
