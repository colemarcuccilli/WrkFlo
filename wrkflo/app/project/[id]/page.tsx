'use client';
import { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getProjectById, statusColors } from '@/lib/mock-data';
import FileBrowser from '@/components/FileBrowser';
import FilePreview from '@/components/FilePreview';
import CommentFeed from '@/components/CommentFeed';
import CommentInput from '@/components/CommentInput';
import ApprovalBar from '@/components/ApprovalBar';
import VersionHistory from '@/components/VersionHistory';

export default function ProjectPage() {
  const params = useParams();
  const projectId = params.id as string;

  const baseProject = getProjectById(projectId);

  const [project, setProject] = useState(baseProject);
  const [selectedFileId, setSelectedFileId] = useState(
    baseProject?.files?.[0]?.id || null
  );

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">Project not found</p>
          <Link href="/dashboard" className="text-orange-500 hover:text-orange-600">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const selectedFile = project.files.find((f: any) => f.id === selectedFileId) || project.files[0];
  const fileComments = selectedFile?.comments || [];

  const approvedCount = project.files.filter(
    (f: any) => f.status === 'approved' || f.status === 'locked'
  ).length;

  const handleFileSelect = (file: any) => {
    setSelectedFileId(file.id);
  };

  const handleAddComment = useCallback(({ text, timestamp }: { text: string; timestamp: any }) => {
    const newComment = {
      id: `c-new-${Date.now()}`,
      author: 'You',
      authorRole: 'creator',
      content: text,
      timestamp: timestamp,
      createdAt: new Date().toLocaleString(),
    };
    setProject((prev: any) => ({
      ...prev,
      files: prev.files.map((f: any) =>
        f.id === selectedFileId
          ? { ...f, comments: [...f.comments, newComment] }
          : f
      ),
    }));
  }, [selectedFileId]);

  const handleStatusChange = useCallback((newStatus: string) => {
    setProject((prev: any) => ({
      ...prev,
      files: prev.files.map((f: any) =>
        f.id === selectedFileId ? { ...f, status: newStatus } : f
      ),
    }));
  }, [selectedFileId]);

  const handleSeekToTimestamp = (ts: number) => {
    if (typeof window !== 'undefined' && (window as any).__wrkflo_seek) {
      (window as any).__wrkflo_seek(ts);
    }
  };

  const badgeClass = (statusColors as Record<string, string>)[project.status] || '';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar */}
      <header className="border-b border-gray-200 bg-white/95 backdrop-blur-sm sticky top-0 z-40 flex-shrink-0">
        <div className="h-14 px-4 flex items-center gap-4">
          {/* Logo + back */}
          <Link href="/dashboard" className="flex items-center gap-2 flex-shrink-0 hover:opacity-80 transition-opacity">
            <div className="w-7 h-7 bg-orange-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <span className="font-bold text-base tracking-tight text-gray-900">WrkFlo</span>
          </Link>

          <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 min-w-0">
            <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900 transition-colors flex-shrink-0">
              Dashboard
            </Link>
            <svg className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-sm font-medium text-gray-900 truncate">{project.name}</span>
          </div>

          {/* Status badge */}
          <span className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${badgeClass}`}>
            {project.status}
          </span>

          {/* Progress */}
          <div className="hidden md:flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-gray-500">{approvedCount}/{project.files.length} approved</span>
            <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded-full"
                style={{ width: `${(approvedCount / project.files.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Right: client info + share */}
          <div className="ml-auto flex items-center gap-3 flex-shrink-0">
            <span className="text-xs text-gray-500 hidden md:block">{project.client}</span>
            <Link
              href={`/review/${project.reviewToken}`}
              target="_blank"
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg text-xs text-gray-600 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Client Review
            </Link>
          </div>
        </div>
      </header>

      {/* 3-panel layout */}
      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 56px)' }}>
        {/* LEFT: File browser */}
        <div className="w-60 flex-shrink-0 border-r border-gray-200 bg-white overflow-hidden flex flex-col">
          <FileBrowser
            files={project.files}
            selectedFileId={selectedFileId}
            onSelectFile={handleFileSelect}
          />
        </div>

        {/* CENTER: Preview */}
        <div className="flex-1 overflow-hidden flex flex-col bg-gray-50">
          {/* File toolbar */}
          {selectedFile && (
            <div className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-200 bg-white flex-shrink-0">
              <span className="text-sm font-medium text-gray-900 truncate">{selectedFile.name}</span>
              <div className="ml-auto flex-shrink-0">
                <VersionHistory file={selectedFile} />
              </div>
            </div>
          )}

          <div className="flex-1 overflow-hidden">
            <FilePreview
              file={selectedFile}
              comments={fileComments}
              onAddComment={handleAddComment}
              onSeekToTimestamp={handleSeekToTimestamp}
            />
          </div>
        </div>

        {/* RIGHT: Feedback panel */}
        <div className="w-80 flex-shrink-0 border-l border-gray-200 bg-white flex flex-col overflow-hidden">
          {/* Panel header */}
          <div className="px-4 py-3 border-b border-gray-200 flex-shrink-0">
            <h2 className="text-sm font-semibold text-gray-900">Feedback</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {fileComments.length} comment{fileComments.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Approval bar */}
          {selectedFile && (
            <div className="px-4 pt-3 flex-shrink-0">
              <ApprovalBar
                file={selectedFile}
                onStatusChange={handleStatusChange}
              />
            </div>
          )}

          {/* Comments list */}
          <div className="flex-1 overflow-y-auto px-4 py-3">
            <CommentFeed
              comments={fileComments}
              fileType={selectedFile?.type}
              onSeekToTimestamp={handleSeekToTimestamp}
            />
          </div>

          {/* Comment input */}
          <div className="px-4 pb-4 pt-2 border-t border-gray-200 flex-shrink-0">
            <CommentInput
              onSubmit={handleAddComment}
              disabled={selectedFile?.status === 'locked'}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
