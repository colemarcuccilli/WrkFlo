'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getVersionColor } from '@/lib/version-colors';

const CYAN = '#15f3ec';
const MINT = '#16ffc0';
const BLUE = '#5bc7f9';
const BG = '#0a0a0f';
const CARD_BG = 'rgba(255,255,255,0.03)';
const CARD_BORDER = 'rgba(255,255,255,0.06)';
const TEXT_PRIMARY = 'rgba(255,255,255,0.9)';
const TEXT_SECONDARY = 'rgba(255,255,255,0.6)';
const TEXT_TERTIARY = 'rgba(255,255,255,0.4)';

function fileTypeIcon(type: string, size = 'w-6 h-6') {
  switch (type) {
    case 'video':
      return (
        <svg className={size} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      );
    case 'audio':
      return (
        <svg className={size} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      );
    case 'image':
      return (
        <svg className={size} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    default:
      return (
        <svg className={size} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
  }
}

export default function DeliveryPage() {
  const params = useParams();
  const token = params.token as string;

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/delivery/${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data && data.id) setProject(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: BG }}>
        <div className="text-center">
          <div
            className="w-8 h-8 rounded-full animate-spin mx-auto mb-4"
            style={{ border: `2px solid ${CYAN}`, borderTopColor: 'transparent' }}
          />
          <p style={{ color: TEXT_SECONDARY }}>Loading delivery...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: BG }}>
        <div className="text-center">
          <p className="text-lg mb-2" style={{ color: TEXT_PRIMARY }}>Delivery not found</p>
          <p className="text-sm" style={{ color: TEXT_SECONDARY }}>This link may have expired or the project doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }

  const allApproved = project.files?.length > 0 && project.files.every((f: any) => f.status === 'approved' || f.status === 'locked');
  const approvedCount = project.files?.filter((f: any) => f.status === 'approved' || f.status === 'locked').length || 0;
  const totalFiles = project.files?.length || 0;
  const completionDate = (project.updated_at ? new Date(project.updated_at) : new Date()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="min-h-screen" style={{ background: BG }}>
      <style>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes float-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .delivery-card {
          animation: float-in 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>

      {/* Gradient top accent */}
      <div
        className="h-1"
        style={{
          background: `linear-gradient(90deg, ${CYAN}, ${MINT}, #a855f7, #ff6b9d, ${CYAN})`,
          backgroundSize: '200% 100%',
          animation: 'gradient-shift 4s ease infinite',
        }}
      />

      {/* Header */}
      <header className="pt-12 pb-8 px-6 text-center relative overflow-hidden">
        {/* Subtle gradient orbs */}
        <div
          className="absolute top-0 left-1/4 w-64 h-64 rounded-full blur-3xl opacity-10"
          style={{ background: CYAN }}
        />
        <div
          className="absolute top-0 right-1/4 w-64 h-64 rounded-full blur-3xl opacity-10"
          style={{ background: '#a855f7' }}
        />

        <div className="relative z-10">
          {/* WrkFlo logo */}
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-5"
            style={{ background: `linear-gradient(135deg, ${CYAN}, ${MINT})` }}
          >
            <svg className="w-7 h-7" style={{ color: BG }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>

          {/* Project title */}
          <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: TEXT_TERTIARY }}>
            Final Delivery
          </p>
          <h1
            className="text-3xl font-bold mb-2"
            style={{
              backgroundImage: `linear-gradient(135deg, ${CYAN}, ${MINT}, #a855f7)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {project.name}
          </h1>

          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: CYAN, color: BG }}>
                {project.creator_name?.charAt(0) || 'C'}
              </div>
              <span className="text-sm" style={{ color: TEXT_SECONDARY }}>by {project.creator_name || 'Creator'}</span>
            </div>
            <span style={{ color: TEXT_TERTIARY }}>·</span>
            <span className="text-sm" style={{ color: TEXT_SECONDARY }}>for {project.client_name || 'Client'}</span>
            <span style={{ color: TEXT_TERTIARY }}>·</span>
            <span className="text-sm" style={{ color: TEXT_SECONDARY }}>{completionDate}</span>
          </div>

          {/* Status */}
          {allApproved ? (
            <div
              className="inline-flex items-center gap-2 mt-5 px-4 py-2 rounded-full text-sm font-semibold"
              style={{ background: `${MINT}18`, color: MINT, border: `1px solid ${MINT}30` }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              All {totalFiles} files approved
            </div>
          ) : (
            <div
              className="inline-flex items-center gap-2 mt-5 px-4 py-2 rounded-full text-sm font-medium"
              style={{ background: `${CYAN}18`, color: CYAN, border: `1px solid ${CYAN}30` }}
            >
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: CYAN }} />
              {approvedCount}/{totalFiles} files approved — delivery in progress
            </div>
          )}
        </div>
      </header>

      {/* Files grid */}
      <div className="max-w-5xl mx-auto px-6 pb-16">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {project.files?.map((file: any, idx: number) => {
            const vColor = getVersionColor(file.version || 'V1');
            const isApproved = file.status === 'approved' || file.status === 'locked';

            return (
              <div
                key={file.id}
                className="delivery-card rounded-2xl overflow-hidden group"
                style={{
                  animationDelay: `${idx * 0.1}s`,
                  background: CARD_BG,
                  border: `1px solid ${CARD_BORDER}`,
                  boxShadow: isApproved ? `0 0 30px ${MINT}08` : 'none',
                }}
              >
                {/* Thumbnail / preview area */}
                <div
                  className="relative h-40 flex items-center justify-center overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${vColor}10, ${BG})`,
                    borderBottom: `1px solid ${CARD_BORDER}`,
                  }}
                >
                  {/* File type icon as thumbnail placeholder */}
                  <div style={{ color: `${vColor}50` }}>
                    {fileTypeIcon(file.type, 'w-16 h-16')}
                  </div>

                  {/* Version badge */}
                  <div
                    className="absolute top-3 left-3 px-2 py-1 rounded-lg text-xs font-mono font-bold"
                    style={{ background: `${vColor}20`, color: vColor, border: `1px solid ${vColor}30`, backdropFilter: 'blur(8px)' }}
                  >
                    {file.version || 'V1'}
                  </div>

                  {/* Status badge */}
                  <div
                    className="absolute top-3 right-3 px-2 py-1 rounded-lg text-xs font-medium"
                    style={
                      isApproved
                        ? { background: `${MINT}20`, color: MINT, border: `1px solid ${MINT}30` }
                        : { background: 'rgba(255,255,255,0.06)', color: TEXT_TERTIARY, border: '1px solid rgba(255,255,255,0.08)' }
                    }
                  >
                    {isApproved ? 'Approved' : file.status?.replace('-', ' ') || 'Draft'}
                  </div>

                  {/* Revision count */}
                  {file.versionCount > 1 && (
                    <div
                      className="absolute bottom-3 left-3 px-2 py-1 rounded-lg text-[10px] font-medium"
                      style={{ background: 'rgba(0,0,0,0.5)', color: TEXT_SECONDARY, backdropFilter: 'blur(8px)' }}
                    >
                      {file.versionCount} versions · {file.commentCount} comments
                    </div>
                  )}
                </div>

                {/* File info */}
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5" style={{ color: vColor }}>
                      {fileTypeIcon(file.type, 'w-5 h-5')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold truncate" style={{ color: TEXT_PRIMARY }}>{file.name}</h3>
                      <p className="text-xs mt-0.5" style={{ color: TEXT_TERTIARY }}>
                        {file.type?.charAt(0).toUpperCase() + file.type?.slice(1)} · {file.upload_date || ''}
                      </p>
                    </div>
                  </div>

                  {/* Latest version notes */}
                  {file.latestNotes && (
                    <div
                      className="mt-3 rounded-lg p-2.5"
                      style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${CARD_BORDER}` }}
                    >
                      <p className="text-xs leading-relaxed" style={{ color: TEXT_SECONDARY }}>
                        {file.latestNotes}
                      </p>
                    </div>
                  )}

                  {/* Round info */}
                  {file.current_round > 1 && (
                    <div className="flex items-center gap-1.5 mt-3">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={vColor} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="23 4 23 10 17 10" />
                        <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
                      </svg>
                      <span className="text-[10px] font-medium" style={{ color: vColor }}>
                        {file.current_round} revision rounds
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs"
            style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, color: TEXT_TERTIARY }}
          >
            <div
              className="w-4 h-4 rounded flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${CYAN}, ${MINT})` }}
            >
              <svg className="w-2.5 h-2.5" style={{ color: BG }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            Delivered via WrkFlo
          </div>
        </div>
      </div>
    </div>
  );
}
