'use client';
import { useState } from 'react';

interface FeedbackSummarizerProps {
  project: any;
}

export default function FeedbackSummarizer({ project }: FeedbackSummarizerProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiGenerated, setAiGenerated] = useState(false);
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const allComments = (project.files || []).flatMap((f: any) =>
    (f.comments || []).map((c: any) => ({
      ...c,
      fileName: f.name,
      authorRole: c.authorRole || c.author_role || 'client',
    }))
  );

  const clientCommentCount = allComments.filter(
    (c: any) => c.authorRole === 'client'
  ).length;

  const handleSummarize = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comments: allComments,
          projectName: project.name,
        }),
      });
      if (!res.ok) throw new Error('Failed to summarize');
      const data = await res.json();
      setSummary(data.summary);
      setAiGenerated(data.aiGenerated);
      setIsOpen(true);
    } catch (e) {
      setError('Could not generate summary. Please try again.');
    }
    setLoading(false);
  };

  if (clientCommentCount === 0) return null;

  return (
    <div className="mt-3">
      {!isOpen ? (
        <button
          onClick={handleSummarize}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-gray-200 bg-white hover:bg-orange-50 hover:border-orange-200 text-xs font-medium text-gray-600 hover:text-orange-700 rounded-lg transition-colors"
        >
          {loading ? (
            <>
              <svg className="w-3.5 h-3.5 animate-spin text-orange-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Summarizing...
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Summarize all feedback ({clientCommentCount} comment{clientCommentCount !== 1 ? 's' : ''})
            </>
          )}
        </button>
      ) : (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span className="text-xs font-semibold text-orange-800">
                Feedback Summary {aiGenerated && <span className="text-orange-500 ml-1">✨ AI</span>}
              </span>
            </div>
            <button
              onClick={() => { setIsOpen(false); setSummary(null); }}
              className="text-orange-400 hover:text-orange-600 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-xs text-orange-900 leading-relaxed whitespace-pre-line">{summary}</p>
        </div>
      )}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
