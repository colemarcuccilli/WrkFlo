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
import RealtimeFiles from '@/components/RealtimeFiles';

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
      parentId: c.parent_id || c.parentId || null,
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
  const [updateBanner, setUpdateBanner] = useState<string | null>(null);
  const [mobilePanel, setMobilePanel] = useState<'files' | 'preview' | 'feedback'>('preview');
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [passwordProjectName, setPasswordProjectName] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Get display name from authenticated user
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Reviewer';

  const fetchProject = useCallback((passwordOverride?: string) => {
    const headers: Record<string, string> = {};
    const storedPw = passwordOverride || (typeof window !== 'undefined' ? sessionStorage.getItem(`wrkflo-review-pw-${token}`) : null);
    if (storedPw) headers['X-Review-Password'] = storedPw;

    fetch(`/api/review/${token}`, { headers })
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
        if (!data) return;
        if (data.passwordRequired) {
          setPasswordRequired(true);
          setPasswordProjectName(data.projectName || '');
          if (data.error) setPasswordError(data.error);
          setLoading(false);
          return;
        }
        if (data.id) {
          setPasswordRequired(false);
          const normalized = normalizeProject(data);
          setProject(normalized);
          if (!selectedFileId) {
            setSelectedFileId(normalized.files?.[0]?.id || null);
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token, selectedFileId]);

  useEffect(() => {
    fetchProject();
  }, [token]);

  // Handle realtime file changes (new versions, status updates)
  const handleFileChanged = useCallback(({ fileId, newData, eventType }: { fileId: string; newData: any; eventType: string }) => {
    if (eventType === 'INSERT') {
      setUpdateBanner('A new file was added to this project');
      fetchProject();
      return;
    }
    // Check if version changed (new version uploaded by creator)
    setProject((prev: any) => {
      if (!prev) return prev;
      const existingFile = prev.files.find((f: any) => f.id === fileId);
      if (existingFile && newData.version && newData.version !== existingFile.version) {
        setUpdateBanner(`New version ${newData.version} uploaded — refreshing...`);
        fetchProject();
        return prev;
      }
      // Status change from the other side
      if (existingFile && newData.status && newData.status !== existingFile.status) {
        return {
          ...prev,
          files: prev.files.map((f: any) =>
            f.id === fileId
              ? { ...f, status: newData.status, currentRound: newData.current_round || f.currentRound }
              : f
          ),
        };
      }
      return prev;
    });
  }, [fetchProject]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim()) return;
    setPasswordLoading(true);
    setPasswordError('');
    const pw = passwordInput.trim();
    const headers: Record<string, string> = { 'X-Review-Password': pw };
    try {
      const r = await fetch(`/api/review/${token}`, { headers });
      const data = await r.json();
      if (data.passwordRequired) {
        setPasswordError(data.error || 'Incorrect password');
        setPasswordLoading(false);
        return;
      }
      if (data.id) {
        sessionStorage.setItem(`wrkflo-review-pw-${token}`, pw);
        setPasswordRequired(false);
        const normalized = normalizeProject(data);
        setProject(normalized);
        if (!selectedFileId) {
          setSelectedFileId(normalized.files?.[0]?.id || null);
        }
      }
    } catch {
      setPasswordError('Something went wrong. Try again.');
    }
    setPasswordLoading(false);
  };

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

  if (passwordRequired) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: BG }}>
        <div
          className="w-full max-w-sm rounded-2xl p-8 text-center"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
          }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-4"
            style={{ background: `linear-gradient(135deg, ${CYAN}, ${MINT})` }}
          >
            <svg className="w-5 h-5" style={{ color: BG }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold mb-1" style={{ color: TEXT_PRIMARY }}>Password Required</h2>
          {passwordProjectName && (
            <p className="text-sm mb-5" style={{ color: TEXT_SECONDARY }}>
              Enter the password to access <span className="font-medium" style={{ color: TEXT_PRIMARY }}>{passwordProjectName}</span>
            </p>
          )}
          {!passwordProjectName && (
            <p className="text-sm mb-5" style={{ color: TEXT_SECONDARY }}>This review link is password protected</p>
          )}
          <form onSubmit={handlePasswordSubmit}>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => { setPasswordInput(e.target.value); setPasswordError(''); }}
              placeholder="Enter password"
              autoFocus
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all mb-3"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: passwordError ? '1px solid rgba(255,80,80,0.5)' : '1px solid rgba(255,255,255,0.1)',
                color: TEXT_PRIMARY,
              }}
            />
            {passwordError && (
              <p className="text-xs mb-3 text-left" style={{ color: '#ff5050' }}>{passwordError}</p>
            )}
            <button
              type="submit"
              disabled={passwordLoading || !passwordInput.trim()}
              className="w-full py-3 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: passwordInput.trim() ? `linear-gradient(135deg, ${CYAN}, ${MINT})` : 'rgba(255,255,255,0.06)',
                color: passwordInput.trim() ? BG : TEXT_TERTIARY,
                opacity: passwordLoading ? 0.7 : 1,
              }}
            >
              {passwordLoading ? 'Verifying...' : 'Access Review'}
            </button>
          </form>
          <p className="text-xs mt-4" style={{ color: TEXT_TERTIARY }}>
            Powered by <span style={{ color: CYAN }}>WrkFlo</span>
          </p>
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

  const handleReply = async (parentId: string, text: string) => {
    const fileRound = selectedFile?.currentRound || 1;
    const newReply = {
      id: `r-client-${Date.now()}`,
      author: displayName,
      authorRole: 'client',
      content: text,
      timestamp: null,
      revisionRound: fileRound,
      parentId,
      createdAt: new Date().toLocaleString(),
    };
    setProject((prev: any) => ({
      ...prev,
      files: prev.files.map((f: any) =>
        f.id === selectedFileId
          ? { ...f, comments: [...f.comments, newReply] }
          : f
      ),
    }));
    try {
      await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file_id: selectedFileId,
          author_name: displayName,
          author_role: 'client',
          content: text,
          parent_id: parentId,
        }),
      });
    } catch (e) {
      console.error('Failed to save reply:', e);
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
            <button
              onClick={() => router.push('/client-dashboard')}
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-opacity hover:opacity-80"
              style={{ background: `linear-gradient(135deg, ${CYAN}, ${MINT})` }}
              title="Back to projects"
            >
              <svg className="w-4 h-4" style={{ color: BG }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
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

      {/* Update banner — shown when creator uploads new version */}
      {updateBanner && (
        <div
          className="px-4 py-2.5 flex items-center justify-center gap-3"
          style={{
            background: 'linear-gradient(to right, rgba(22,255,192,0.1), rgba(21,243,236,0.1))',
            borderBottom: '1px solid rgba(22,255,192,0.2)',
          }}
        >
          <svg className="w-4 h-4 flex-shrink-0" style={{ color: MINT }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span className="text-sm font-medium" style={{ color: MINT }}>{updateBanner}</span>
          <button
            onClick={() => setUpdateBanner(null)}
            className="ml-2 text-xs px-2 py-1 rounded transition-colors"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            Dismiss
          </button>
        </div>
      )}

      {allApproved && (
        <CompletionCelebration project={project} onClose={() => setAllApproved(false)} />
      )}

      <div className="flex flex-1 overflow-hidden relative" style={{ height: 'calc(100vh - 68px)' }}>
        {/* File browser sidebar -- mobile fullscreen overlay, hidden on tablet, fixed on desktop */}
        <div
          className={`
            ${mobilePanel === 'files' ? 'flex' : 'hidden'}
            md:hidden
            absolute inset-0 z-20 flex-col
          `}
          style={{ background: BG }}
        >
          <FileBrowser
            files={project.files}
            selectedFileId={selectedFileId}
            onSelectFile={(file: any) => {
              handleFileSelect(file);
              setMobilePanel('preview');
            }}
          />
        </div>
        <div
          className="hidden md:flex w-60 flex-shrink-0 overflow-hidden flex-col"
          style={{ background: BG, borderRight: `1px solid ${CARD_BORDER}` }}
        >
          <FileBrowser
            files={project.files}
            selectedFileId={selectedFileId}
            onSelectFile={handleFileSelect}
          />
        </div>

        {/* Preview panel */}
        <div
          className={`
            ${mobilePanel === 'preview' ? 'flex' : 'hidden'}
            md:flex flex-1 overflow-hidden flex-col
          `}
          style={{ background: BG }}
        >
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

        {/* Feedback panel */}
        <div
          className={`
            ${mobilePanel === 'feedback' ? 'flex' : 'hidden'}
            md:flex
            absolute inset-0 z-20 md:relative md:inset-auto
            md:w-80 flex-shrink-0 flex-col overflow-hidden
          `}
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
              onReply={handleReply}
            />
          </div>

          <div
            className="px-4 pb-16 md:pb-4 pt-2 flex-shrink-0"
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

      {/* Mobile tab bar */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around"
        style={{
          background: '#0a0a0f',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {([
          { key: 'files' as const, label: 'Files', icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          )},
          { key: 'preview' as const, label: 'Preview', icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )},
          { key: 'feedback' as const, label: 'Feedback', icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          )},
        ]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setMobilePanel(tab.key)}
            className="flex flex-col items-center gap-0.5 py-2 px-4 transition-colors relative"
            style={{
              color: mobilePanel === tab.key ? '#15f3ec' : 'rgba(255,255,255,0.4)',
              ...(mobilePanel === tab.key ? {
                background: 'linear-gradient(to top, rgba(21,243,236,0.12), transparent)',
              } : {}),
            }}
          >
            <div style={mobilePanel === tab.key ? {
              filter: 'drop-shadow(0 0 6px rgba(21,243,236,0.5))',
            } : {}}>
              {tab.icon}
            </div>
            <span className="text-[10px] font-medium">{tab.label}</span>
            {mobilePanel === tab.key && (
              <div
                className="absolute top-0 w-8 h-0.5 rounded-full"
                style={{ background: 'linear-gradient(to right, #15f3ec, #16ffc0)' }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Mobile floating comment button -- only show on preview tab */}
      {mobilePanel === 'preview' && (
        <button
          onClick={() => setShowMobileComment(true)}
          className="fixed bottom-16 right-6 z-30 md:hidden flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-full transition-all active:scale-95"
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
      )}

      <MobileCommentSheet
        isOpen={showMobileComment}
        onClose={() => setShowMobileComment(false)}
        onSubmit={handleAddComment}
        disabled={selectedFile?.status === 'locked'}
        fileType={selectedFile?.type}
      />

      {/* Realtime — listen for file changes (new versions, status) */}
      <RealtimeFiles
        projectId={project.id}
        fileIds={project.files.map((f: any) => f.id)}
        onFileChanged={handleFileChanged}
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
