'use client';
import { fileStatusLabels } from '@/lib/mock-data';

const statusConfig = {
  'draft': { color: 'bg-gray-100 text-gray-500 border-gray-200', label: 'Draft', icon: '○' },
  'in-review': { color: 'bg-blue-50 text-blue-600 border-blue-200', label: 'In Review', icon: '◷' },
  'changes-requested': { color: 'bg-orange-50 text-orange-600 border-orange-200', label: 'Changes Requested', icon: '◎' },
  'approved': { color: 'bg-emerald-50 text-emerald-600 border-emerald-200', label: 'Approved', icon: '✓' },
  'locked': { color: 'bg-purple-50 text-purple-600 border-purple-200', label: 'Locked', icon: '🔒' },
};

export default function ApprovalBar({ file, onStatusChange }) {
  const config = statusConfig[file.status] || statusConfig['draft'];
  const isLocked = file.status === 'locked';

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">File Status</span>
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
          {config.icon} {config.label}
        </span>
      </div>

      {isLocked ? (
        <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-lg p-3">
          <svg className="w-4 h-4 text-purple-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <p className="text-sm text-purple-700">This file is locked and cannot be modified.</p>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={() => onStatusChange('approved')}
            disabled={file.status === 'approved'}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-150 ${
              file.status === 'approved'
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-default'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/20'
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
                ? 'bg-orange-50 text-orange-600 border border-orange-200 cursor-default'
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
              <div className={`px-1.5 py-0.5 rounded text-xs ${isActive ? `${statusCfg.color} border font-semibold` : 'text-gray-400'}`}>
                {fileStatusLabels[s] || s}
              </div>
              {idx < arr.length - 1 && (
                <svg className="w-3 h-3 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
