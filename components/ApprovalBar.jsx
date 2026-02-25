'use client';

const fileStatusLabels = {
  'draft': 'Draft',
  'in-review': 'In Review',
  'changes-requested': 'Changes Requested',
  'approved': 'Approved',
  'locked': 'Locked',
};

const statusConfig = {
  'draft': { color: '', label: 'Draft', icon: '○', style: { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' } },
  'in-review': { color: '', label: 'In Review', icon: '◷', style: { background: 'rgba(21,243,236,0.08)', color: '#15f3ec', border: '1px solid rgba(21,243,236,0.2)' } },
  'changes-requested': { color: '', label: 'Changes Requested', icon: '◎', style: { background: 'rgba(255,80,80,0.08)', color: 'rgba(255,80,80,0.9)', border: '1px solid rgba(255,80,80,0.2)' } },
  'approved': { color: '', label: 'Approved', icon: '✓', style: { background: 'rgba(22,255,192,0.08)', color: '#16ffc0', border: '1px solid rgba(22,255,192,0.2)' } },
  'locked': { color: 'bg-purple-50 text-purple-600 border-purple-200', label: 'Locked', icon: '🔒', style: { background: 'rgba(147,51,234,0.08)', color: '#a855f7', border: '1px solid rgba(147,51,234,0.2)' } },
};

export default function ApprovalBar({ file, onStatusChange, clientName = 'Client' }) {
  const config = statusConfig[file?.status] || statusConfig['draft'];
  const isLocked = file?.status === 'locked';

  return (
    <div className="rounded-lg p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>File Status</span>
        <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={config.style}>
          {config.icon} {config.label}
        </span>
      </div>

      {isLocked ? (
        <div className="flex items-center gap-2 rounded-lg p-3" style={{ background: 'rgba(147,51,234,0.08)', border: '1px solid rgba(147,51,234,0.2)' }}>
          <svg className="w-4 h-4 flex-shrink-0" style={{ color: '#a855f7' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <p className="text-sm" style={{ color: '#a855f7' }}>This file is locked and cannot be modified.</p>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={() => onStatusChange('approved')}
            disabled={file?.status === 'approved'}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-150"
            style={
              file?.status === 'approved'
                ? { background: 'rgba(22,255,192,0.08)', color: '#16ffc0', border: '1px solid rgba(22,255,192,0.2)', cursor: 'default' }
                : { background: '#16ffc0', color: '#0a0a0f', border: '1px solid #16ffc0' }
            }
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            {file?.status === 'approved' ? 'Approved' : 'Approve'}
          </button>

          <button
            onClick={() => onStatusChange('changes-requested')}
            disabled={file?.status === 'changes-requested'}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-150"
            style={
              file?.status === 'changes-requested'
                ? { background: 'rgba(21,243,236,0.08)', color: '#15f3ec', border: '1px solid rgba(21,243,236,0.2)', cursor: 'default' }
                : { background: '#15f3ec', color: '#0a0a0f', border: '1px solid #15f3ec' }
            }
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            {file?.status === 'changes-requested' ? 'Changes Requested' : 'Request Changes'}
          </button>
        </div>
      )}

      {/* Approval badge download (for approved files) */}
      {(file?.status === 'approved' || file?.status === 'locked') && (
        <a
          href={`/api/badge?fileName=${encodeURIComponent(file?.name || 'File')}&clientName=${encodeURIComponent(clientName)}&date=${encodeURIComponent(new Date().toLocaleDateString())}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 flex items-center justify-center gap-1.5 w-full px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
          style={{ color: '#16ffc0', background: 'rgba(22,255,192,0.08)', border: '1px solid rgba(22,255,192,0.2)' }}
          title="Download approval badge for portfolio use"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download Approval Badge
        </a>
      )}

      {/* Status workflow indicator */}
      <div className="mt-3 flex items-center gap-1 overflow-x-auto">
        {['draft', 'in-review', 'changes-requested', 'approved', 'locked'].map((s, idx, arr) => {
          const isActive = file?.status === s;
          const statusCfg = statusConfig[s];
          return (
            <div key={s} className="flex items-center gap-1 flex-shrink-0">
              <div
                className="px-1.5 py-0.5 rounded text-xs"
                style={
                  isActive
                    ? { ...statusCfg.style, fontWeight: 600 }
                    : { color: 'rgba(255,255,255,0.4)' }
                }
              >
                {fileStatusLabels[s] || s}
              </div>
              {idx < arr.length - 1 && (
                <svg className="w-3 h-3 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.15)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
