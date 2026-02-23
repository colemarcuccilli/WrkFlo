'use client';
import { useState, useRef } from 'react';

export default function ImageViewer({ file, comments, onAddComment }) {
  const containerRef = useRef(null);
  const [pendingPin, setPendingPin] = useState(null);
  const [activePin, setActivePin] = useState(null);

  const imageComments = comments.filter(
    (c) => c.timestamp && typeof c.timestamp === 'object' && 'x' in c.timestamp
  );

  const handleImageClick = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPendingPin({ x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 });
    setActivePin(null);
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    const text = e.target.elements.commentText.value;
    if (!text.trim() || !pendingPin) return;
    onAddComment({ text, timestamp: pendingPin });
    setPendingPin(null);
    e.target.reset();
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Image container */}
      <div
        ref={containerRef}
        className="relative bg-gray-100 rounded-lg overflow-hidden cursor-crosshair border border-gray-200"
        style={{ minHeight: 400 }}
        onClick={handleImageClick}
      >
        {file.url ? (
          <img
            src={file.url}
            alt={file.name}
            className="w-full h-full object-contain block"
            style={{ maxHeight: 500 }}
            draggable={false}
          />
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-400">
            <div className="text-center">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm text-gray-600">{file.name}</p>
              <p className="text-xs text-gray-400 mt-1">Preview not available</p>
            </div>
          </div>
        )}

        {/* Existing comment pins */}
        {imageComments.map((c, idx) => (
          <div
            key={c.id}
            className="absolute z-10 group"
            style={{ left: `${c.timestamp.x}%`, top: `${c.timestamp.y}%`, transform: 'translate(-50%, -50%)' }}
            onClick={(e) => {
              e.stopPropagation();
              setActivePin(activePin === c.id ? null : c.id);
              setPendingPin(null);
            }}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 cursor-pointer shadow-lg transition-all ${
              activePin === c.id
                ? 'bg-orange-500 border-white text-white scale-125'
                : c.authorRole === 'client'
                ? 'bg-orange-500 border-orange-200 text-white hover:scale-110'
                : 'bg-gray-600 border-gray-300 text-white hover:scale-110'
            }`}>
              {idx + 1}
            </div>

            {/* Pin tooltip */}
            {activePin === c.id && (
              <div
                className="absolute z-20 bg-white border border-gray-200 rounded-lg p-3 shadow-xl w-56"
                style={{ left: '120%', top: '-8px' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-gray-900">{c.author}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${c.authorRole === 'client' ? 'bg-orange-50 text-orange-700' : 'bg-gray-100 text-gray-600'}`}>
                    {c.authorRole}
                  </span>
                </div>
                <p className="text-xs text-gray-600">{c.content}</p>
                <p className="text-xs text-gray-400 mt-2">{c.createdAt}</p>
              </div>
            )}
          </div>
        ))}

        {/* Pending pin */}
        {pendingPin && (
          <div
            className="absolute z-20 w-6 h-6 rounded-full bg-orange-400 border-2 border-orange-200 flex items-center justify-center shadow-lg animate-pulse"
            style={{ left: `${pendingPin.x}%`, top: `${pendingPin.y}%`, transform: 'translate(-50%, -50%)' }}
          >
            <span className="text-xs font-bold text-white">{imageComments.length + 1}</span>
          </div>
        )}

        {/* Hint */}
        <div className="absolute bottom-2 right-2 bg-black/40 backdrop-blur-sm text-xs text-white/80 px-2 py-1 rounded">
          Click image to pin a comment
        </div>
      </div>

      {/* Pending comment form */}
      {pendingPin && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <p className="text-xs text-orange-700 mb-2 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Pin #{imageComments.length + 1} at ({pendingPin.x}%, {pendingPin.y}%)
          </p>
          <form onSubmit={handleAddComment} className="flex gap-2">
            <input
              name="commentText"
              autoFocus
              placeholder="Add your comment about this area..."
              className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-400"
            />
            <button type="submit" className="px-3 py-2 bg-orange-600 hover:bg-orange-500 text-white text-sm rounded-lg transition-colors">Pin</button>
            <button type="button" onClick={() => setPendingPin(null)} className="px-3 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 text-sm rounded-lg transition-colors">Cancel</button>
          </form>
        </div>
      )}
    </div>
  );
}
