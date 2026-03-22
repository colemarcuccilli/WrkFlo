'use client';
import { useState } from 'react';
import Link from 'next/link';

const CYAN = '#15f3ec';
const BLUE = '#5bc7f9';
const MINT = '#16ffc0';
const BG = '#0a0a0f';
const CARD_BG = 'rgba(255,255,255,0.03)';
const CARD_BORDER = 'rgba(255,255,255,0.06)';
const TEXT_PRIMARY = 'rgba(255,255,255,0.9)';
const TEXT_SECONDARY = 'rgba(255,255,255,0.6)';
const TEXT_TERTIARY = 'rgba(255,255,255,0.4)';

const statusStyles = {
  'In Review': { background: 'rgba(21,243,236,0.1)', color: CYAN, border: '1px solid rgba(21,243,236,0.2)' },
  'Approved': { background: 'rgba(22,255,192,0.1)', color: MINT, border: '1px solid rgba(22,255,192,0.2)' },
  'Changes Requested': { background: 'rgba(255,80,80,0.1)', color: '#ff6b6b', border: '1px solid rgba(255,80,80,0.2)' },
  'Draft': { background: 'rgba(255,255,255,0.05)', color: TEXT_SECONDARY, border: '1px solid rgba(255,255,255,0.08)' },
  'Locked': { background: 'rgba(139,92,246,0.1)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.2)' },
};

function getApprovedCount(files) {
  return (files || []).filter((f) => f.status === 'approved' || f.status === 'locked').length;
}

export default function ProjectCard({ project }) {
  const [hovered, setHovered] = useState(false);

  const files = project.files || [];
  const approved = getApprovedCount(files);
  const total = files.length;
  const progressPct = total > 0 ? (approved / total) * 100 : 0;

  const badgeStyle = statusStyles[project.status] || statusStyles['Draft'];
  const creatorName = project.creatorName || project.creator_name || 'Creator';
  const client = project.client_name || project.client || 'Unknown Client';
  const lastActivity = project.lastActivity || (project.updated_at ? new Date(project.updated_at).toLocaleDateString() : 'Recently');

  return (
    <Link href={`/project/${project.id}`} className="block">
      <div
        className="rounded-2xl p-5 transition-all duration-200 cursor-pointer"
        style={{
          background: CARD_BG,
          border: `1px solid ${hovered ? 'rgba(21,243,236,0.25)' : CARD_BORDER}`,
          boxShadow: hovered ? '0 4px 24px rgba(21,243,236,0.12)' : 'none',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3
              className="font-semibold text-base truncate transition-colors"
              style={{ color: hovered ? CYAN : TEXT_PRIMARY }}
            >
              {project.name}
            </h3>
            <p className="text-sm mt-0.5 truncate" style={{ color: TEXT_SECONDARY }}>
              {client}
            </p>
          </div>
          {project.status === 'Approved' ? (
            <span
              className="ml-3 flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1"
              style={{ background: 'rgba(22,255,192,0.12)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.25)' }}
            >
              <svg style={{ width: 12, height: 12 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Complete
            </span>
          ) : (
            <span
              className="ml-3 flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-medium"
              style={badgeStyle}
            >
              {project.status}
            </span>
          )}
          {progressPct === 100 && project.status !== 'Approved' && (
            <span
              className="ml-2 flex-shrink-0 px-2 py-0.5 rounded text-xs font-medium"
              style={{
                background: 'rgba(22,255,192,0.1)',
                color: MINT,
                border: '1px solid rgba(22,255,192,0.2)',
              }}
            >
              &#10003; Complete
            </span>
          )}
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 text-xs mb-4" style={{ color: TEXT_TERTIARY }}>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {total} file{total !== 1 ? 's' : ''}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {lastActivity}
          </span>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs" style={{ color: TEXT_TERTIARY }}>Approval progress</span>
            <span className="text-xs font-medium" style={{ color: TEXT_SECONDARY }}>
              {approved}/{total} approved
            </span>
          </div>
          <div
            className="w-full rounded-full h-1.5 overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.08)' }}
          >
            <div
              className="h-1.5 rounded-full transition-all duration-500"
              style={{
                width: `${progressPct}%`,
                background: progressPct === 100 ? MINT : CYAN,
              }}
            />
          </div>
        </div>

        {/* Creator */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: 'rgba(21,243,236,0.12)', color: CYAN }}
            >
              {creatorName.charAt(0)}
            </div>
            <span className="text-xs" style={{ color: TEXT_TERTIARY }}>{creatorName}</span>
          </div>
          <span
            className="text-xs transition-colors"
            style={{ color: CYAN }}
          >
            Open →
          </span>
        </div>
      </div>
    </Link>
  );
}
