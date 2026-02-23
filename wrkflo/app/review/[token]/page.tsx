'use client';
import { useState, useCallback, useEffect } from 'react';
import { useParams } from 'next/navigation';
import FileBrowser from '@/components/FileBrowser';
import FilePreview from '@/components/FilePreview';
import CommentFeed from '@/components/CommentFeed';
import CommentInput from '@/components/CommentInput';
import ApprovalBar from '@/components/ApprovalBar';
import VersionHistory from '@/components/VersionHistory';
import CompletionCelebration from '@/components/CompletionCelebration';
import MobileCommentSheet from '@/components/MobileCommentSheet';

function normalizeFile(f: any) {
  return {
    ...f,
    uploadDate: f.upload_date || f.uploadDate || '',
    versions: (f.file_versions || f.versions || []).map((v: any) => ({
      version: v.version_label || v.version,
      date: v.created_at ? new Date(v.created_at).toLocaleDateString() : '',
      notes: v.notes || '',
    })),
    comments: (f.comments || []).map((c: any) => ({
      ...c,
      id: c.id,
      author: c.author_name || c.author || 'Unknown',
      authorRole: c.author_role || c.authorRole || 'client',
      content: c.content,
      timestamp: c.timestamp_data || c.timestamp || null,
      createdAt: c.created_at ? new Date(c.created_at).toLocaleString() : c.createdAt || '',
    })),
  };
}

function normalizeProject(p: any) {
  return {
    ...p,
    client: p.client_name || p.client || 'Unknown Client',
    creatorName: p.creator_name || 'Creator',
    reviewToken: p.review_token || p.reviewToken || '',
    files: (p.files || []).map(normalizeFile),
  };
}

export default function ReviewPage() {
  const params = useParams();
  const token = params.token as string;

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [allApproved, setAllApproved] = useState(false);
  const [showMobileComment, setShowMobileComment] = useState(false);

  useEffect(() => {
    fetch(`/api/review/${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data && data.id) {
          const normalized = normalizeProject(data);
          setProject(normalized);
          setSelectedFileId(normalized.files?.[0]?.id || null);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading review...</p>
        </div>
      </div>
    );
  }

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

  const handleAddComment = useCallback(async ({ text, timestamp }: { text: string; timestamp: any }) => {
    const newComment = {
      id: `c-client-${Date.now()}`,
      author: 'You (Client)',
      authorRole: 'client',
      content: text,
      timestamp: timestamp,
      createdAt: new Date().toLocaleString(),
    };
    // Optimistic update
    setProject((prev: any) => ({
      ...prev,
      files: prev.files.map((f: any) =>
        f.id === selectedFileId
          ? { ...f, comments: [...f.comments, newComment] }
          : f
      ),
    }));
    // Persist to DB
    try {
      await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file_id: selectedFileId,
          author_name: 'Client',
          author_role: 'client',
          content: text,
          timestamp_data: timestamp,
        }),
      });
    } catch (e) {
      console.error('Failed to save comment:', e);
    }
  }, [selectedFileId]);

  const handleStatusChange = useCallback(async (newStatus: string) => {
    // Optimistic update
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
      if (allDone && updated.files.length > 0) {
        setTimeout(() => setAllApproved(true), 400);
      }
      return updated;
    });
    // Persist to DB
    try {
      await fetch(`/api/files/${selectedFileId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (e) {
      console.error('Failed to save status:', e);
    }
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

      {allApproved && (
        <CompletionCelebration project={project} onClose={() => setAllApproved(false)} />
      )}

      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 68px)' }}>
        <div className="w-60 flex-shrink-0 border-r border-gray-200 bg-white overflow-hidden flex flex-col">
          <FileBrowser
            files={project.files}
            selectedFileId={selectedFileId}
            onSelectFile={handleFileSelect}
          />
        </div>

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

        <div className="w-80 flex-shrink-0 border-l border-gray-200 bg-white flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 flex-shrink-0">
            <h2 className="text-sm font-semibold text-gray-900">Your Feedback</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {fileComments.length} comment{fileComments.length !== 1 ? 's' : ''}
            </p>
          </div>

          {selectedFile && (
            <div className="px-4 pt-3 flex-shrink-0">
              <ApprovalBar
                file={selectedFile}
                onStatusChange={handleStatusChange}
              />
            </div>
          )}

          <div className="mx-4 mt-3 bg-gray-50 border border-gray-200 rounded-lg p-3 flex-shrink-0">
            <p className="text-xs text-gray-500 leading-relaxed">
              Leave comments below or click directly on the {selectedFile?.type === 'image' ? 'image to pin feedback' : selectedFile?.type === 'video' || selectedFile?.type === 'audio' ? 'timeline to timestamp your feedback' : 'file to annotate'}.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3">
            <CommentFeed
              comments={fileComments}
              fileType={selectedFile?.type}
              onSeekToTimestamp={handleSeekToTimestamp}
            />
          </div>

          <div className="px-4 pb-4 pt-2 border-t border-gray-200 flex-shrink-0">
            <CommentInput
              onSubmit={handleAddComment}
              disabled={selectedFile?.status === 'locked'}
              placeholder="Share your thoughts..."
            />
          </div>
        </div>
      </div>
      {/* Mobile floating comment button */}
      <button
        onClick={() => setShowMobileComment(true)}
        className="fixed bottom-6 right-6 z-30 md:hidden flex items-center gap-2 px-4 py-3 bg-orange-600 hover:bg-orange-500 text-white text-sm font-semibold rounded-full shadow-lg shadow-orange-600/30 transition-all active:scale-95"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        Comment
      </button>

      <MobileCommentSheet
        isOpen={showMobileComment}
        onClose={() => setShowMobileComment(false)}
        onSubmit={handleAddComment}
        disabled={selectedFile?.status === 'locked'}
        fileType={selectedFile?.type}
      />
    </div>
  );
}
