'use client';
import { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getProjectByToken } from '@/lib/mock-data';
import FileBrowser from '@/components/FileBrowser';
import FilePreview from '@/components/FilePreview';
import CommentFeed from '@/components/CommentFeed';
import CommentInput from '@/components/CommentInput';
import ApprovalBar from '@/components/ApprovalBar';
import VersionHistory from '@/components/VersionHistory';

export default function ReviewPage() {
  const params = useParams();
  const token = params.token as string;

  const baseProject = getProjectByToken(token);
  const [project, setProject] = useState(baseProject);
  const [selectedFileId, setSelectedFileId] = useState(
    baseProject?.files?.[0]?.id || null
  );
  const [allApproved, setAllApproved] = useState(false);

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Review link not found</h1>
          <p className="text-gray-500">This review link may have expired or been removed.</p>
        </div>
      </div>
    );
  }

  const selectedFile = project.files.find((f: any) => f.id === selectedFileId) || project.files[0];
  const fileComments = selectedFile?.comments || [];

  const approvedCount = project.files.filter(
    (f: any) => f.status === 'approved' || f.status === 'locked'
  ).length;
  const totalFiles = project.files.length;

  const handleFileSelect = (file: any) => {
    setSelectedFileId(file.id);
  };

  const handleAddComment = useCallback(({ text, timestamp }: { text: string; timestamp: any }) => {
    const newComment = {
      id: `c-client-${Date.now()}`,
      author: 'You (Client)',
      authorRole: 'client',
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
    setProject((prev: any) => {
      const updated = {
        ...prev,
        files: prev.files.map((f: any) =>
          f.id === selectedFileId ? { ...f, status: newStatus } : f
        ),
      };
      const allDone = updated.files.every(
        (f: any) => f.status === 'approved' || f.status === 'locked'
      );
      if (allDone) setAllApproved(true);
      return updated;
    });
  }, [selectedFileId]);

  const handleSeekToTimestamp = (ts: number) => {
    if (typeof window !== 'undefined' && (window as any).__wrkflo_seek) {
      (window as any).__wrkflo_seek(ts);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Invite banner */}
      <div className="bg-orange-50 border-b border-orange-200 flex-shrink-0">
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-orange-900">
                You've been invited to review <span className="font-bold">{project.name}</span> by{' '}
                <span className="font-bold">{project.creatorName}</span>
              </p>
              <p className="text-xs text-orange-600 mt-0.5">
                Client: {project.client} · {approvedCount}/{totalFiles} files approved
              </p>
            </div>
          </div>

          {/* Progress pill */}
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-32 h-1.5 bg-orange-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${totalFiles > 0 ? (approvedCount / totalFiles) * 100 : 0}%` }}
                />
              </div>
              <span className="text-xs text-orange-700">{approvedCount}/{totalFiles}</span>
            </div>
          </div>
        </div>
      </div>

      {/* All approved celebration */}
      {allApproved && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-3 flex items-center gap-3">
          <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-emerald-700 font-medium">
            🎉 All files approved! {project.creatorName} has been notified.
          </p>
        </div>
      )}

      {/* 3-panel layout */}
      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 68px)' }}>
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
          <div className="px-4 py-3 border-b border-gray-200 flex-shrink-0">
            <h2 className="text-sm font-semibold text-gray-900">Your Feedback</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {fileComments.length} comment{fileComments.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Approval actions */}
          {selectedFile && (
            <div className="px-4 pt-3 flex-shrink-0">
              <ApprovalBar
                file={selectedFile}
                onStatusChange={handleStatusChange}
              />
            </div>
          )}

          {/* Comment callout */}
          <div className="mx-4 mt-3 bg-gray-50 border border-gray-200 rounded-lg p-3 flex-shrink-0">
            <p className="text-xs text-gray-500 leading-relaxed">
              Leave comments below or click directly on the {selectedFile?.type === 'image' ? 'image to pin feedback' : selectedFile?.type === 'video' || selectedFile?.type === 'audio' ? 'timeline to timestamp your feedback' : 'file to annotate'}.
            </p>
          </div>

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
              placeholder="Share your thoughts..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
