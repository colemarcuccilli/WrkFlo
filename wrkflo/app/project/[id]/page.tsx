'use client';
import { useState, useCallback, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import FileBrowser from '@/components/FileBrowser';
import FilePreview from '@/components/FilePreview';
import CommentFeed from '@/components/CommentFeed';
import CommentInput from '@/components/CommentInput';
import ApprovalBar from '@/components/ApprovalBar';
import VersionHistory from '@/components/VersionHistory';
import ShareModal from '@/components/ShareModal';
import CompletionCelebration from '@/components/CompletionCelebration';

const statusColors: Record<string, string> = {
  'In Review': 'bg-orange-50 text-orange-700 border border-orange-200',
  'Approved': 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  'Changes Requested': 'bg-red-50 text-red-700 border border-red-200',
  'Draft': 'bg-gray-50 text-gray-600 border border-gray-200',
  'Locked': 'bg-purple-50 text-purple-700 border border-purple-200',
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
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [showShare, setShowShare] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading project...</p>
        </div>
      </div>
    );
  }

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

  const isProjectComplete = project.files.length > 0 && project.files.every(
    (f: any) => f.status === 'approved' || f.status === 'locked'
  );

  const handleFileSelect = (file: any) => {
    setSelectedFileId(file.id);
  };

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
      author: 'You',
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
          author_name: 'You',
          author_role: 'creator',
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
        setTimeout(() => setShowCelebration(true), 400);
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

  const badgeClass = statusColors[project.status] || '';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar */}
      <header className="border-b border-gray-200 bg-white/95 backdrop-blur-sm sticky top-0 z-40 flex-shrink-0">
        <div className="h-14 px-4 flex items-center gap-4">
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

          <div className="flex items-center gap-2 min-w-0">
            <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900 transition-colors flex-shrink-0">
              Dashboard
            </Link>
            <svg className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-sm font-medium text-gray-900 truncate">{project.name}</span>
          </div>

          <span className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${badgeClass}`}>
            {project.status}
          </span>

          <div className="hidden md:flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-gray-500">{approvedCount}/{project.files.length} approved</span>
            <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded-full"
                style={{ width: `${project.files.length > 0 ? (approvedCount / project.files.length) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div className="ml-auto flex items-center gap-3 flex-shrink-0">
            <span className="text-xs text-gray-500 hidden md:block">{project.client}</span>
            <button
              onClick={() => setShowShare(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-medium transition-colors"
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
        <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-emerald-50 border-b border-amber-200 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
            <span className="text-lg">🎉</span>
            <span className="text-sm font-medium text-gray-900">All files approved! Your project is complete.</span>
            <button
              onClick={() => setShowSummary(true)}
              className="ml-2 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
            >
              View Summary
            </button>
          </div>
        </div>
      )}

      {/* 3-panel layout */}
      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 56px)' }}>
        <div className="w-60 flex-shrink-0 border-r border-gray-200 bg-white overflow-hidden flex flex-col">
          <FileBrowser
            files={project.files}
            selectedFileId={selectedFileId}
            onSelectFile={handleFileSelect}
            projectId={projectId}
            onUploadComplete={handleUploadComplete}
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
            <h2 className="text-sm font-semibold text-gray-900">Feedback</h2>
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

      {/* Project Completion Summary Modal */}
      {showSummary && project && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 relative overflow-hidden">
            {/* Confetti dots */}
            <div className="confetti-dot" style={{ left: '10%', background: '#f97316', animationDelay: '0s' }} />
            <div className="confetti-dot" style={{ left: '20%', background: '#eab308', animationDelay: '0.5s' }} />
            <div className="confetti-dot" style={{ left: '30%', background: '#22c55e', animationDelay: '1s' }} />
            <div className="confetti-dot" style={{ left: '40%', background: '#f43f5e', animationDelay: '1.5s' }} />
            <div className="confetti-dot" style={{ left: '50%', background: '#8b5cf6', animationDelay: '0.3s' }} />
            <div className="confetti-dot" style={{ left: '60%', background: '#06b6d4', animationDelay: '0.8s' }} />
            <div className="confetti-dot" style={{ left: '70%', background: '#f97316', animationDelay: '1.2s' }} />
            <div className="confetti-dot" style={{ left: '80%', background: '#eab308', animationDelay: '1.7s' }} />
            <div className="confetti-dot" style={{ left: '90%', background: '#22c55e', animationDelay: '0.2s' }} />
            
            {/* Close button */}
            <button
              onClick={() => setShowSummary(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Content */}
            <div className="text-center relative z-10">
              {/* WrkFlo Logo */}
              <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>

              {/* Heading */}
              <h2 className="text-2xl font-bold text-emerald-600 mb-2">✅ Project Complete</h2>
              
              {/* Project name */}
              <h3 className="text-xl font-bold text-gray-900 mb-1">{project.name}</h3>
              
              {/* Client */}
              <p className="text-sm text-gray-500 mb-4">{project.client}</p>
              
              {/* Stats */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-center gap-6">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{approvedCount}/{project.files.length}</p>
                    <p className="text-xs text-gray-500">files approved</p>
                  </div>
                  <div className="w-px h-10 bg-gray-200" />
                  <div>
                    <p className="text-lg font-semibold text-gray-900">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    <p className="text-xs text-gray-500">completion date</p>
                  </div>
                </div>
              </div>

              {/* Quote */}
              <p className="text-gray-600 italic mb-6">"Another great project, delivered."</p>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const shareText = `Project ${project.name} has been approved by ${project.client}! ✅`;
                    if (navigator.share) {
                      navigator.share({ title: 'Project Complete', text: shareText }).catch(() => {});
                    } else {
                      navigator.clipboard.writeText(shareText);
                    }
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Share Summary
                </button>
                <Link
                  href="/dashboard"
                  className="flex-1 flex items-center justify-center px-4 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
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
