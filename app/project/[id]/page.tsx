'use client';
import { useState, useCallback, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import FileBrowser from '@/components/FileBrowser';
import FilePreview from '@/components/FilePreview';
import CommentFeed from '@/components/CommentFeed';
import CommentInput from '@/components/CommentInput';
import ApprovalBar from '@/components/ApprovalBar';
import VersionHistory from '@/components/VersionHistory';
import ShareModal from '@/components/ShareModal';
import CompletionCelebration from '@/components/CompletionCelebration';
import VersionUpload from '@/components/VersionUpload';
import FeedbackSummarizer from '@/components/FeedbackSummarizer';
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

const statusStyles: Record<string, React.CSSProperties> = {
  'In Review': { background: 'rgba(21,243,236,0.1)', color: CYAN, border: '1px solid rgba(21,243,236,0.2)' },
  'Approved': { background: 'rgba(22,255,192,0.1)', color: MINT, border: '1px solid rgba(22,255,192,0.2)' },
  'Changes Requested': { background: 'rgba(255,80,80,0.1)', color: '#ff6b6b', border: '1px solid rgba(255,80,80,0.2)' },
  'Draft': { background: 'rgba(255,255,255,0.05)', color: TEXT_SECONDARY, border: '1px solid rgba(255,255,255,0.08)' },
  'Locked': { background: 'rgba(139,92,246,0.1)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.2)' },
};

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

export default function ProjectPage() {
  const { user } = useAuth();
  const params = useParams();
  const projectId = params.id as string;
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'You';

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [showShare, setShowShare] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showVersionUpload, setShowVersionUpload] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    fetch(`/api/projects/${projectId}`)
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
  }, [projectId]);

  const selectedFile = project?.files?.find((f: any) => f.id === selectedFileId) || project?.files?.[0];
  const fileComments = selectedFile?.comments || [];

  const approvedCount = (project?.files || []).filter(
    (f: any) => f.status === 'approved' || f.status === 'locked'
  ).length;

  const isProjectComplete = (project?.files?.length ?? 0) > 0 && (project?.files || []).every(
    (f: any) => f.status === 'approved' || f.status === 'locked'
  );

  const handleFileSelect = (file: any) => {
    setSelectedFileId(file.id);
  };

  // Handle incoming realtime comments (from other users)
  const handleRealtimeComment = useCallback((newComment: any) => {
    setProject((prev: any) => {
      if (!prev) return prev;
      // Check if comment already exists (avoid duplicates from own POST)
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
  }, [selectedFileId]);

  const handleVersionUploaded = useCallback((updatedFile: any) => {
    const normalized = normalizeFile(updatedFile);
    setProject((prev: any) => ({
      ...prev,
      files: prev.files.map((f: any) => f.id === normalized.id ? { ...f, ...normalized } : f),
    }));
  }, []);

  const handleUploadComplete = useCallback((newFile: any) => {
    const normalized = normalizeFile(newFile);
    setProject((prev: any) => ({
      ...prev,
      files: [...prev.files, normalized],
    }));
    setSelectedFileId(normalized.id);
  }, []);

  const handleAddComment = useCallback(async ({ text, timestamp }: { text: string; timestamp: any }) => {
    const newComment = {
      id: `c-new-${Date.now()}`,
      author: userName,
      authorRole: 'creator',
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
          author_name: userName,
          author_role: 'creator',
          content: text,
          timestamp_data: timestamp,
        }),
      });
    } catch (e) {
      console.error('Failed to save comment:', e);
    }
  }, [selectedFileId, userName]);

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
        setTimeout(() => setShowCelebration(true), 400);
      }
      return updated;
    });
    // Persist file status to DB
    try {
      await fetch(`/api/files/${selectedFileId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      // Also update project status if all approved
      const currentProject = project;
      if (currentProject) {
        const updatedFiles = currentProject.files.map((f: any) =>
          f.id === selectedFileId ? { ...f, status: newStatus } : f
        );
        const allDone = updatedFiles.every(
          (f: any) => f.status === 'approved' || f.status === 'locked'
        );
        if (allDone && updatedFiles.length > 0) {
          await fetch(`/api/projects/${projectId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'Approved' }),
          }).catch(() => {});
        }
      }
    } catch (e) {
      console.error('Failed to save status:', e);
    }
  }, [selectedFileId, project, projectId]);

  const handleSeekToTimestamp = (ts: number) => {
    if (typeof window !== 'undefined' && (window as any).__wrkflo_seek) {
      (window as any).__wrkflo_seek(ts);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: BG }}>
        <div className="text-center">
          <div
            className="w-8 h-8 rounded-full animate-spin mx-auto mb-4"
            style={{ border: `2px solid ${CYAN}`, borderTopColor: 'transparent' }}
          />
          <p style={{ color: TEXT_SECONDARY }}>Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: BG }}>
        <div className="text-center">
          <p className="text-lg mb-4" style={{ color: TEXT_SECONDARY }}>Project not found</p>
          <Link href="/dashboard" style={{ color: CYAN }}>
            &larr; Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const badgeStyle = statusStyles[project.status] || {};

  return (
    <div className="min-h-screen flex flex-col" style={{ background: BG }}>
      {/* Top bar */}
      <header
        className="backdrop-blur-sm sticky top-0 z-40 flex-shrink-0"
        style={{ background: 'rgba(10,10,15,0.95)', borderBottom: `1px solid ${CARD_BORDER}` }}
      >
        <div className="h-14 px-4 flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2 flex-shrink-0 hover:opacity-80 transition-opacity">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: `linear-gradient(to right, ${CYAN}, ${MINT})` }}
            >
              <svg className="w-4 h-4" style={{ color: BG }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <span
              className="font-bold text-base tracking-tight"
              style={{
                backgroundImage: `linear-gradient(to right, ${CYAN}, ${MINT})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              WrkFlo
            </span>
          </Link>

          <svg className="w-4 h-4 flex-shrink-0" style={{ color: TEXT_TERTIARY }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>

          <div className="flex items-center gap-2 min-w-0">
            <Link
              href="/dashboard"
              className="text-sm transition-colors flex-shrink-0"
              style={{ color: TEXT_SECONDARY }}
            >
              Dashboard
            </Link>
            <svg className="w-3.5 h-3.5 flex-shrink-0" style={{ color: TEXT_TERTIARY }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-sm font-medium truncate" style={{ color: TEXT_PRIMARY }}>{project.name}</span>
          </div>

          <span
            className="flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-medium"
            style={badgeStyle}
          >
            {project.status}
          </span>

          <div className="hidden md:flex items-center gap-2 flex-shrink-0">
            <span className="text-xs" style={{ color: TEXT_SECONDARY }}>{approvedCount}/{project.files.length} approved</span>
            <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div
                className="h-full rounded-full"
                style={{
                  background: CYAN,
                  width: `${project.files.length > 0 ? (approvedCount / project.files.length) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2 flex-shrink-0">
            <span className="text-xs hidden md:block" style={{ color: TEXT_SECONDARY }}>{project.client}</span>
            {!isProjectComplete && approvedCount < project.files.length && (
              <button
                onClick={async () => {
                  const unapproved = project.files.filter(
                    (f: any) => f.status !== 'approved' && f.status !== 'locked'
                  );
                  for (const f of unapproved) {
                    setProject((prev: any) => ({
                      ...prev,
                      files: prev.files.map((pf: any) =>
                        pf.id === f.id ? { ...pf, status: 'approved' } : pf
                      ),
                    }));
                    await fetch(`/api/files/${f.id}/status`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ status: 'approved' }),
                    }).catch(() => {});
                  }
                  setTimeout(() => setShowCelebration(true), 400);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                style={{
                  background: `linear-gradient(to right, ${CYAN}, ${MINT})`,
                  color: BG,
                  boxShadow: `0 4px 14px rgba(21,243,236,0.3)`,
                }}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                Approve All
              </button>
            )}
            <button
              onClick={() => setShowShare(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
              style={{
                background: `linear-gradient(to right, ${CYAN}, ${MINT})`,
                color: BG,
                boxShadow: `0 4px 14px rgba(21,243,236,0.25)`,
              }}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share with Client
            </button>
          </div>
        </div>
      </header>

      {/* Completion Banner */}
      {isProjectComplete && (
        <div
          className="px-4 py-3"
          style={{
            background: `linear-gradient(to right, rgba(21,243,236,0.08), rgba(22,255,192,0.08), rgba(91,199,249,0.08))`,
            borderBottom: `1px solid rgba(21,243,236,0.15)`,
          }}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
            <span className="text-lg">&#127881;</span>
            <span className="text-sm font-medium" style={{ color: TEXT_PRIMARY }}>All files approved! Your project is complete.</span>
            <button
              onClick={() => setShowSummary(true)}
              className="ml-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
              style={{
                background: `linear-gradient(to right, ${CYAN}, ${MINT})`,
                color: BG,
                boxShadow: `0 4px 14px rgba(21,243,236,0.25)`,
              }}
            >
              View Summary
            </button>
          </div>
        </div>
      )}

      {/* 3-panel layout */}
      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 56px)' }}>
        <div
          className="w-60 flex-shrink-0 overflow-hidden flex flex-col"
          style={{ background: BG, borderRight: `1px solid ${CARD_BORDER}` }}
        >
          <FileBrowser
            files={project.files}
            selectedFileId={selectedFileId}
            onSelectFile={handleFileSelect}
            projectId={projectId}
            onUploadComplete={handleUploadComplete}
          />
        </div>

        <div className="flex-1 overflow-hidden flex flex-col" style={{ background: BG }}>
          {selectedFile && (
            <div
              className="flex items-center gap-3 px-4 py-2.5 flex-shrink-0"
              style={{ background: BG, borderBottom: `1px solid ${CARD_BORDER}` }}
            >
              <span className="text-sm font-medium truncate" style={{ color: TEXT_PRIMARY }}>{selectedFile.name}</span>
              <div className="ml-auto flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => setShowVersionUpload(true)}
                  title="Upload new version"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors"
                  style={{
                    color: TEXT_SECONDARY,
                    background: CARD_BG,
                    border: `1px solid ${CARD_BORDER}`,
                  }}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  New Version
                </button>
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
          <div className="px-4 py-3 flex-shrink-0" style={{ borderBottom: `1px solid ${CARD_BORDER}` }}>
            <h2 className="text-sm font-semibold" style={{ color: TEXT_PRIMARY }}>Feedback</h2>
            <p className="text-xs mt-0.5" style={{ color: TEXT_SECONDARY }}>
              {fileComments.length} comment{fileComments.length !== 1 ? 's' : ''}
            </p>
          </div>

          {selectedFile && (
            <div className="px-4 pt-3 flex-shrink-0">
              <ApprovalBar
                file={selectedFile}
                onStatusChange={handleStatusChange}
                clientName={project.client}
              />
              <FeedbackSummarizer project={project} />
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-4 py-3">
            <CommentFeed
              comments={fileComments}
              fileType={selectedFile?.type}
              onSeekToTimestamp={handleSeekToTimestamp}
            />
          </div>

          <div className="px-4 pb-4 pt-2 flex-shrink-0" style={{ borderTop: `1px solid ${CARD_BORDER}` }}>
            <CommentInput
              onSubmit={handleAddComment}
              disabled={selectedFile?.status === 'locked'}
            />
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShare && project && (
        <ShareModal project={project} onClose={() => setShowShare(false)} />
      )}
      {showCelebration && project && (
        <CompletionCelebration project={project} onClose={() => setShowCelebration(false)} />
      )}
      {/* Realtime comment listener */}
      <RealtimeComments
        fileId={selectedFileId}
        onNewComment={handleRealtimeComment}
      />

      {showVersionUpload && selectedFile && (
        <VersionUpload
          fileId={selectedFile.id}
          fileName={selectedFile.name}
          currentVersion={selectedFile.version || 'V1'}
          onVersionUploaded={handleVersionUploaded}
          onClose={() => setShowVersionUpload(false)}
        />
      )}

      {/* Project Completion Summary Modal */}
      {showSummary && project && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <style>{`
            @keyframes confetti-fall {
              0% { transform: translateY(-100px) rotate(0deg); opacity: 1; }
              100% { transform: translateY(400px) rotate(720deg); opacity: 0; }
            }
            .confetti-dot {
              position: absolute;
              width: 8px;
              height: 8px;
              border-radius: 50%;
              animation: confetti-fall 3s ease-out infinite;
            }
          `}</style>
          <div
            className="rounded-2xl w-full max-w-lg p-8 relative overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${CARD_BORDER}`,
              boxShadow: `0 25px 50px rgba(0,0,0,0.5), 0 0 80px rgba(21,243,236,0.08)`,
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* Confetti dots */}
            <div className="confetti-dot" style={{ left: '10%', background: CYAN, animationDelay: '0s' }} />
            <div className="confetti-dot" style={{ left: '20%', background: MINT, animationDelay: '0.5s' }} />
            <div className="confetti-dot" style={{ left: '30%', background: BLUE, animationDelay: '1s' }} />
            <div className="confetti-dot" style={{ left: '40%', background: '#ff6b6b', animationDelay: '1.5s' }} />
            <div className="confetti-dot" style={{ left: '50%', background: '#a78bfa', animationDelay: '0.3s' }} />
            <div className="confetti-dot" style={{ left: '60%', background: CYAN, animationDelay: '0.8s' }} />
            <div className="confetti-dot" style={{ left: '70%', background: MINT, animationDelay: '1.2s' }} />
            <div className="confetti-dot" style={{ left: '80%', background: BLUE, animationDelay: '1.7s' }} />
            <div className="confetti-dot" style={{ left: '90%', background: MINT, animationDelay: '0.2s' }} />

            {/* Close button */}
            <button
              onClick={() => setShowSummary(false)}
              className="absolute top-4 right-4 transition-colors"
              style={{ color: TEXT_TERTIARY }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Content */}
            <div className="text-center relative z-10">
              {/* WrkFlo Logo */}
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4"
                style={{ background: `linear-gradient(to right, ${CYAN}, ${MINT})` }}
              >
                <svg className="w-8 h-8" style={{ color: BG }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>

              {/* Heading */}
              <h2 className="text-2xl font-bold mb-2" style={{ color: MINT }}>&#10003; Project Complete</h2>

              {/* Project name */}
              <h3 className="text-xl font-bold mb-1" style={{ color: TEXT_PRIMARY }}>{project.name}</h3>

              {/* Client */}
              <p className="text-sm mb-4" style={{ color: TEXT_SECONDARY }}>{project.client}</p>

              {/* Stats */}
              <div className="rounded-lg p-4 mb-4" style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${CARD_BORDER}` }}>
                <div className="flex items-center justify-center gap-6">
                  <div>
                    <p className="text-2xl font-bold" style={{ color: TEXT_PRIMARY }}>{approvedCount}/{project.files.length}</p>
                    <p className="text-xs" style={{ color: TEXT_SECONDARY }}>files approved</p>
                  </div>
                  <div className="w-px h-10" style={{ background: CARD_BORDER }} />
                  <div>
                    <p className="text-lg font-semibold" style={{ color: TEXT_PRIMARY }}>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    <p className="text-xs" style={{ color: TEXT_SECONDARY }}>completion date</p>
                  </div>
                </div>
              </div>

              {/* Quote */}
              <p className="italic mb-6" style={{ color: TEXT_SECONDARY }}>&ldquo;Another great project, delivered.&rdquo;</p>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const shareText = `Project ${project.name} has been approved by ${project.client}! \u2705`;
                    if (navigator.share) {
                      navigator.share({ title: 'Project Complete', text: shareText }).catch(() => {});
                    } else {
                      navigator.clipboard.writeText(shareText);
                    }
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors"
                  style={{
                    background: `linear-gradient(to right, ${CYAN}, ${MINT})`,
                    color: BG,
                    boxShadow: `0 4px 14px rgba(21,243,236,0.25)`,
                  }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Share Summary
                </button>
                <Link
                  href="/dashboard"
                  className="flex-1 flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors"
                  style={{ border: `1px solid ${CARD_BORDER}`, color: TEXT_SECONDARY }}
                >
                  Back to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
