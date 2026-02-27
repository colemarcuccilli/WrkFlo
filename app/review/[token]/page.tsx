'use client';
import { useState, useCallback, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth, useUserRole } from '@/components/AuthProvider';
import FileBrowser from '@/components/FileBrowser';
import FilePreview from '@/components/FilePreview';
import CommentFeed from '@/components/CommentFeed';
import CommentInput from '@/components/CommentInput';
import ApprovalBar from '@/components/ApprovalBar';
import VersionHistory from '@/components/VersionHistory';
import CompletionCelebration from '@/components/CompletionCelebration';
import MobileCommentSheet from '@/components/MobileCommentSheet';
import RealtimeComments from '@/components/RealtimeComments';

const CYAN = '#15f3ec';
const BLUE = '#5bc7f9';
const MINT = '#16ffc0';
const BG = '#0a0a0f';
const CARD_BG = 'rgba(255,255,255,0.03)';
const CARD_BORDER = 'rgba(255,255,255,0.06)';
const TEXT_PRIMARY = 'rgba(255,255,255,0.9)';
const TEXT_SECONDARY = 'rgba(255,255,255,0.6)';
const TEXT_TERTIARY = 'rgba(255,255,255,0.4)';

function normalizeFile(f: any) {
  return {
    ...f,
    currentRound: f.current_round || 1,
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
      revisionRound: c.revision_round || 1,
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
  const router = useRouter();
  const { user } = useAuth();
  const userRole = useUserRole();
  const token = params.token as string;

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [allApproved, setAllApproved] = useState(false);
  const [showMobileComment, setShowMobileComment] = useState(false);
  const [authError, setAuthError] = useState(false);

  // Get display name from authenticated user
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Reviewer';

  useEffect(() => {
    fetch(`/api/review/${token}`)
      .then((r) => {
        if (r.status === 401) {
          setAuthError(true);
          setLoading(false);
          return null;
        }
        if (r.status === 403) {
          setLoading(false);
          return null;
        }
        return r.json();
      })
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

  // Handle auth redirect
  useEffect(() => {
    if (authError) {
      router.push(`/login?redirect=/review/${token}`);
    }
  }, [authError, router, token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: BG }}>
        <div className="text-center">
          <div
            className="w-8 h-8 rounded-full animate-spin mx-auto mb-4"
            style={{ border: `2px solid ${CYAN}`, borderTopColor: 'transparent' }}
          />
          <p style={{ color: TEXT_SECONDARY }}>Loading review...</p>
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: BG }}>
        <div className="text-center">
          <p style={{ color: TEXT_SECONDARY }}>Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: BG }}>
        <div className="text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: CARD_BG }}
          >
            <svg className="w-8 h-8" style={{ color: TEXT_TERTIARY }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold mb-2" style={{ color: TEXT_PRIMARY }}>Review link not found</h1>
          <p style={{ color: TEXT_SECONDARY }}>This review link may have expired, been removed, or you don&apos;t have access.</p>
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

  const handleAddComment = async ({ text, timestamp }: { text: string; timestamp: any }) => {
    const fileRound = selectedFile?.currentRound || 1;
    const newComment = {
      id: `c-client-${Date.now()}`,
      author: displayName,
      authorRole: 'client',
      content: text,
      timestamp: timestamp,
      revisionRound: fileRound,
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
          author_name: displayName,
          author_role: 'client',
          content: text,
          timestamp_data: timestamp,
        }),
      });
    } catch (e) {
      console.error('Failed to save comment:', e);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    // Optimistic update
    setProject((prev: any) => {
      const updated = {
        ...prev,
        files: prev.files.map((f: any) => {
          if (f.id !== selectedFileId) return f;
          // Increment round when going from changes-requested → in-review
          const newRound = (f.status === 'changes-requested' && newStatus === 'in-review')
            ? (f.currentRound || 1) + 1
            : (f.currentRound || 1);
          return { ...f, status: newStatus, currentRound: newRound };
        }),
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
  };

  const handleSeekToTimestamp = (ts: any) => {
    if (typeof window !== 'undefined' && (window as any).__wrkflo_seek) {
      (window as any).__wrkflo_seek(ts);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: BG }}>
      {/* Invite banner */}
      <div
        className="flex-shrink-0"
        style={{
          background: 'rgba(21,243,236,0.06)',
          borderBottom: `1px solid rgba(21,243,236,0.15)`,
        }}
      >
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${CYAN}, ${MINT})` }}
            >
              <svg className="w-4 h-4" style={{ color: BG }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: TEXT_PRIMARY }}>
                You&apos;re reviewing <span className="font-bold">{project.name}</span> by{' '}
                <span className="font-bold">{project.creatorName}</span>
              </p>
              <p className="text-xs mt-0.5" style={{ color: TEXT_SECONDARY }}>
                Signed in as {displayName} · {approvedCount}/{totalFiles} files approved
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            <div className="flex items-center gap-2">
              <div
                className="w-32 h-1.5 rounded-full overflow-hidden"
                style={{ background: 'rgba(21,243,236,0.15)' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${totalFiles > 0 ? (approvedCount / totalFiles) * 100 : 0}%`,
                    background: CYAN,
                  }}
                />
              </div>
              <span className="text-xs" style={{ color: CYAN }}>{approvedCount}/{totalFiles}</span>
            </div>
          </div>
        </div>
      </div>

      {allApproved && (
        <CompletionCelebration project={project} onClose={() => setAllApproved(false)} />
      )}

      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 68px)' }}>
        <div
          className="w-60 flex-shrink-0 overflow-hidden flex flex-col"
          style={{ background: BG, borderRight: `1px solid ${CARD_BORDER}` }}
        >
          <FileBrowser
            files={project.files}
            selectedFileId={selectedFileId}
            onSelectFile={handleFileSelect}
          />
        </div>

        <div className="flex-1 overflow-hidden flex flex-col" style={{ background: BG }}>
          {selectedFile && (
            <div
              className="flex items-center gap-3 px-4 py-2.5 flex-shrink-0"
              style={{ background: BG, borderBottom: `1px solid ${CARD_BORDER}` }}
            >
              <span className="text-sm font-medium truncate" style={{ color: TEXT_PRIMARY }}>{selectedFile.name}</span>
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

        <div
          className="w-80 flex-shrink-0 flex flex-col overflow-hidden"
          style={{ background: BG, borderLeft: `1px solid ${CARD_BORDER}` }}
        >
          <div
            className="px-4 py-3 flex-shrink-0"
            style={{ borderBottom: `1px solid ${CARD_BORDER}` }}
          >
            <h2 className="text-sm font-semibold" style={{ color: TEXT_PRIMARY }}>Your Feedback</h2>
            <p className="text-xs mt-0.5" style={{ color: TEXT_SECONDARY }}>
              {fileComments.length} comment{fileComments.length !== 1 ? 's' : ''}
            </p>
          </div>

          {selectedFile && (
            <div className="px-4 pt-3 flex-shrink-0">
              <ApprovalBar
                file={selectedFile}
                onStatusChange={handleStatusChange}
                viewerRole={userRole}
                currentRound={selectedFile?.currentRound || 1}
              />
            </div>
          )}

          <div
            className="mx-4 mt-3 rounded-lg p-3 flex-shrink-0"
            style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
          >
            <p className="text-xs leading-relaxed" style={{ color: TEXT_SECONDARY }}>
              Leave comments below or click directly on the {selectedFile?.type === 'image' ? 'image to pin feedback' : selectedFile?.type === 'video' || selectedFile?.type === 'audio' ? 'timeline to timestamp your feedback' : 'file to annotate'}.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3">
            <CommentFeed
              comments={fileComments}
              fileType={selectedFile?.type}
              onSeekToTimestamp={handleSeekToTimestamp}
              currentRound={selectedFile?.currentRound || 1}
            />
          </div>

          <div
            className="px-4 pb-4 pt-2 flex-shrink-0"
            style={{ borderTop: `1px solid ${CARD_BORDER}` }}
          >
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
        className="fixed bottom-6 right-6 z-30 md:hidden flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-full transition-all active:scale-95"
        style={{
          background: `linear-gradient(135deg, ${CYAN}, ${MINT})`,
          color: BG,
          boxShadow: `0 10px 25px -5px rgba(21,243,236,0.3)`,
        }}
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

      {/* Realtime — listen for new comments from the creator side */}
      <RealtimeComments
        fileId={selectedFileId}
        onNewComment={(newComment) => {
          setProject((prev: any) => {
            if (!prev) return prev;
            const alreadyExists = prev.files.some((f: any) =>
              (f.comments || []).some((c: any) => c.id === newComment.id)
            );
            if (alreadyExists) return prev;
            return {
              ...prev,
              files: prev.files.map((f: any) =>
                f.id === selectedFileId
                  ? { ...f, comments: [...(f.comments || []), newComment] }
                  : f
              ),
            };
          });
        }}
      />
    </div>
  );
}
