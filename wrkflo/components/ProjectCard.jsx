'use client';
import Link from 'next/link';
import { statusColors } from '@/lib/mock-data';

function getApprovedCount(files) {
  return files.filter((f) => f.status === 'approved' || f.status === 'locked').length;
}

export default function ProjectCard({ project }) {
  const approved = getApprovedCount(project.files);
  const total = project.files.length;
  const progressPct = total > 0 ? (approved / total) * 100 : 0;

  const badgeClass = statusColors[project.status] || statusColors['Draft'];

  return (
    <Link href={`/project/${project.id}`} className="block">
      <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-orange-300 hover:shadow-md transition-all duration-200 cursor-pointer group">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-gray-900 font-semibold text-base truncate group-hover:text-orange-600 transition-colors">
              {project.name}
            </h3>
            <p className="text-gray-500 text-sm mt-0.5 truncate">{project.client}</p>
          </div>
          <span className={`ml-3 flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${badgeClass}`}>
            {project.status}
          </span>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
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
            {project.lastActivity}
          </span>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs text-gray-500">Approval progress</span>
            <span className="text-xs font-medium text-gray-700">
              {approved}/{total} approved
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-1.5 rounded-full transition-all duration-500 ${
                progressPct === 100 ? 'bg-emerald-500' : 'bg-orange-500'
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Creator */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-xs font-bold text-orange-700">
              {project.creatorName.charAt(0)}
            </div>
            <span className="text-xs text-gray-500">{project.creatorName}</span>
          </div>
          <span className="text-xs text-orange-500 group-hover:text-orange-600 transition-colors">
            Open →
          </span>
        </div>
      </div>
    </Link>
  );
}