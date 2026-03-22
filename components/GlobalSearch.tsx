'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const CYAN = '#15f3ec';
const MINT = '#16ffc0';
const BG = 'rgba(10,10,15,0.98)';
const CARD_BORDER = 'rgba(255,255,255,0.06)';
const TEXT_PRIMARY = 'rgba(255,255,255,0.9)';
const TEXT_SECONDARY = 'rgba(255,255,255,0.6)';
const TEXT_TERTIARY = 'rgba(255,255,255,0.4)';

interface SearchResults {
  projects: any[];
  files: any[];
  comments: any[];
}

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Cmd+K / Ctrl+K listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Focus input on open
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults(null);
    }
  }, [open]);

  // Debounced search
  const doSearch = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q.trim()) {
      setResults(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setResults(data);
      } catch {
        setResults({ projects: [], files: [], comments: [] });
      }
      setLoading(false);
    }, 300);
  }, []);

  const handleInputChange = (val: string) => {
    setQuery(val);
    doSearch(val);
  };

  const navigate = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  if (!open) return null;

  const hasResults = results && (results.projects.length > 0 || results.files.length > 0 || results.comments.length > 0);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: 120,
      }}
    >
      {/* Backdrop */}
      <div
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
        onClick={() => setOpen(false)}
      />

      {/* Modal */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 560,
          margin: '0 16px',
          background: BG,
          border: `1px solid rgba(21,243,236,0.15)`,
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        }}
      >
        {/* Search input */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px', borderBottom: `1px solid ${CARD_BORDER}` }}>
          <svg style={{ width: 18, height: 18, color: TEXT_TERTIARY, flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Search projects, files, and comments..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              padding: '14px 12px',
              color: TEXT_PRIMARY,
              fontSize: 14,
              caretColor: CYAN,
            }}
          />
          <kbd
            style={{
              fontSize: 11,
              color: TEXT_TERTIARY,
              background: 'rgba(255,255,255,0.06)',
              borderRadius: 4,
              padding: '2px 6px',
              border: `1px solid ${CARD_BORDER}`,
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Results area */}
        <div style={{ maxHeight: 400, overflowY: 'auto', padding: '8px 0' }}>
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  border: `2px solid ${CYAN}`,
                  borderTopColor: 'transparent',
                  animation: 'spin 0.6s linear infinite',
                }}
              />
            </div>
          )}

          {!loading && !query.trim() && (
            <div style={{ padding: '32px 16px', textAlign: 'center' }}>
              <svg style={{ width: 32, height: 32, color: TEXT_TERTIARY, margin: '0 auto 12px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p style={{ color: TEXT_SECONDARY, fontSize: 13 }}>Search across all your projects, files, and comments</p>
              <p style={{ color: TEXT_TERTIARY, fontSize: 12, marginTop: 4 }}>Type to start searching</p>
            </div>
          )}

          {!loading && query.trim() && !hasResults && results && (
            <div style={{ padding: '32px 16px', textAlign: 'center' }}>
              <p style={{ color: TEXT_SECONDARY, fontSize: 13 }}>No results for &ldquo;{query}&rdquo;</p>
            </div>
          )}

          {!loading && hasResults && (
            <>
              {results!.projects.length > 0 && (
                <ResultSection
                  title="Projects"
                  icon={
                    <svg style={{ width: 14, height: 14 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  }
                  items={results!.projects.map((p) => ({
                    label: p.name,
                    sublabel: p.client_name || 'No client',
                    badge: p.status,
                    onClick: () => navigate(`/project/${p.id}`),
                  }))}
                />
              )}
              {results!.files.length > 0 && (
                <ResultSection
                  title="Files"
                  icon={
                    <svg style={{ width: 14, height: 14 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  }
                  items={results!.files.map((f) => ({
                    label: f.name,
                    sublabel: f.project_name || 'Unknown project',
                    onClick: () => navigate(`/project/${f.project_id}`),
                  }))}
                />
              )}
              {results!.comments.length > 0 && (
                <ResultSection
                  title="Comments"
                  icon={
                    <svg style={{ width: 14, height: 14 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  }
                  items={results!.comments.map((c) => ({
                    label: c.content.length > 80 ? c.content.slice(0, 80) + '...' : c.content,
                    sublabel: `by ${c.author_name || 'Unknown'} on ${c.file_name || 'a file'}`,
                    onClick: () => navigate(`/project/${c.project_id}`),
                  }))}
                />
              )}
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function ResultSection({ title, icon, items }: {
  title: string;
  icon: React.ReactNode;
  items: { label: string; sublabel: string; badge?: string; onClick: () => void }[];
}) {
  return (
    <div style={{ padding: '4px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 16px', color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {icon}
        {title}
      </div>
      {items.map((item, i) => (
        <button
          key={i}
          onClick={item.onClick}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '8px 16px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(21,243,236,0.06)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          <div style={{ minWidth: 0 }}>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 1 }}>{item.sublabel}</p>
          </div>
          {item.badge && (
            <span style={{
              flexShrink: 0,
              marginLeft: 8,
              fontSize: 10,
              padding: '2px 8px',
              borderRadius: 999,
              background: 'rgba(255,255,255,0.05)',
              color: 'rgba(255,255,255,0.5)',
              border: `1px solid rgba(255,255,255,0.08)`,
            }}>
              {item.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
