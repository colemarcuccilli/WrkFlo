'use client';
import { fileStatusLabels } from '@/lib/mock-data';

const statusConfig = {
  'draft': { color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', label: 'Draft', icon: '○' },
  'in-review': { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', label: 'In Review', icon: '◷' },
  'changes-requested': { color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', label: 'Changes Requested', icon: '◎' },
  'approved': { color: 'bg-green-500/20 text-green-400 border-green-500/30', label: 'Approved', icon: '✓' },
  'locked': { color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', label: 'Locked', icon: '🔒' },
};

export default function ApprovalBar({ file, onStatusChange }) {
  const config = statusConfig[file.status] || statusConfig['draft'];
  const isLocked = file.status === 'locked';

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">File Status</span>
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
          {config.icon} {config.label}
        </span>
      </div>

      {isLocked ? (
        <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
          <svg className="w-4 h-4 text-purple-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <p className="text-sm text-purple-300">This file is locked and cannot be modified.</p>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={() => onStatusChange('approved')}
            disabled={file.status === 'approved'}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-150 ${
              file.status === 'approved'
                ? 'bg-green-500/20 text-green-400 border border-green-500/30 cursor-default'
                : 'bg-green-600 hover:bg-green-500 text-white border border-green-500 hover:shadow-lg hover:shadow-green-500/20'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            {file.status === 'approved' ? 'Approved' : 'Approve'}
          </button>

          <button
            onClick={() => onStatusChange('changes-requested')}
            disabled={file.status === 'changes-requested'}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-150 ${
              file.status === 'changes-requested'
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30 cursor-default'
                : 'bg-orange-600 hover:bg-orange-500 text-white border border-orange-500 hover:shadow-lg hover:shadow-orange-500/20'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            {file.status === 'changes-requested' ? 'Changes Requested' : 'Request Changes'}
          </button>
        </div>
      )}

      {/* Status workflow indicator */}
      <div className="mt-3 flex items-center gap-1 overflow-x-auto">
        {['draft', 'in-review', 'changes-requested', 'approved', 'locked'].map((s, idx, arr) => {
          const isActive = file.status === s;
          const statusCfg = statusConfig[s];
          return (
            <div key={s} className="flex items-center gap-1 flex-shrink-0">
              <div className={`px-1.5 py-0.5 rounded text-xs ${isActive ? `${statusCfg.color} font-semibold` : 'text-slate-600'}`}>
                {fileStatusLabels[s] || s}
              </div>
              {idx < arr.length - 1 && (
                <svg className="w-3 h-3 text-slate-700 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
