'use client';
import { useState, useRef, useEffect, useCallback } from 'react';

const CYAN = '#15f3ec';
const MINT = '#16ffc0';
const BG = '#0a0a0f';
const PIN_WINDOW = 2; // seconds ± to show pins

function formatTime(seconds) {
  if (!seconds && seconds !== 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function VideoPlayer({ file, comments, onAddComment, onSeekToComment }) {
  const videoRef = useRef(null);
  const progressRef = useRef(null);
  const videoContainerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(file.duration || 0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [pendingTimestamp, setPendingTimestamp] = useState(null); // number (time-only)
  const [pendingPin, setPendingPin] = useState(null); // { x, y, time }
  const [activePin, setActivePin] = useState(null); // comment id
  const [showPinHint, setShowPinHint] = useState(true);

  // Seek handler for external components
  useEffect(() => {
    if (onSeekToComment) {
      window.__wrkflo_seek = (ts) => {
        const time = typeof ts === 'object' ? ts.time : ts;
        if (videoRef.current && typeof time === 'number') {
          videoRef.current.currentTime = time;
          setCurrentTime(time);
        }
      };
    }
  }, [onSeekToComment]);

  // Hide pin hint after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowPinHint(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
        case 'j':
          e.preventDefault();
          if (videoRef.current) {
            videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 5);
            setCurrentTime(videoRef.current.currentTime);
          }
          break;
        case 'ArrowRight':
        case 'l':
          e.preventDefault();
          if (videoRef.current) {
            videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 5);
            setCurrentTime(videoRef.current.currentTime);
          }
          break;
        case 'm':
          toggleMute();
          break;
        case 'f':
          if (videoRef.current) videoRef.current.requestFullscreen?.();
          break;
        case 'Escape':
          setPendingPin(null);
          setPendingTimestamp(null);
          setActivePin(null);
          break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [duration, isPlaying, togglePlay, toggleMute]);

  const handleTimeUpdate = () => {
    if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) setDuration(videoRef.current.duration);
  };

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (isPlaying) { videoRef.current.pause(); } else { videoRef.current.play(); }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    const newMuted = !isMuted;
    videoRef.current.muted = newMuted;
    setIsMuted(newMuted);
  }, [isMuted]);

  // Click on video frame to place a spatial + temporal pin
  const handleVideoClick = useCallback((e) => {
    if (!videoContainerRef.current || !videoRef.current) return;

    // Don't place pin if clicking on a pin tooltip or existing pin
    if (e.target.closest('[data-pin]') || e.target.closest('[data-pin-tooltip]')) return;

    const rect = videoContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const time = videoRef.current.currentTime;

    // Pause video when placing a pin
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    }

    setPendingPin({
      x: Math.round(x * 10) / 10,
      y: Math.round(y * 10) / 10,
      time: Math.round(time * 10) / 10,
    });
    setPendingTimestamp(null);
    setActivePin(null);
  }, [isPlaying]);

  // Click on timeline for time-only comment
  const handleProgressClick = useCallback((e) => {
    if (!progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, x / rect.width));
    const ts = ratio * (duration || 1);
    if (videoRef.current) { videoRef.current.currentTime = ts; setCurrentTime(ts); }
    setPendingTimestamp(Math.round(ts));
    setPendingPin(null);
    setActivePin(null);
  }, [duration]);

  const handleVolumeChange = (e) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (videoRef.current) videoRef.current.volume = v;
    setIsMuted(v === 0);
  };

  const handleAddPinComment = (text) => {
    if (!text.trim() || !pendingPin) return;
    onAddComment({ text, timestamp: pendingPin });
    setPendingPin(null);
  };

  const handleAddTimeComment = (text) => {
    if (!text.trim()) return;
    onAddComment({ text, timestamp: pendingTimestamp });
    setPendingTimestamp(null);
  };

  const seekTo = (ts) => {
    const time = typeof ts === 'object' ? ts.time : ts;
    if (videoRef.current && typeof time === 'number') {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
    if (onSeekToComment) onSeekToComment(ts);
  };

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Separate pin comments (spatial + temporal) from time-only comments
  const pinComments = comments.filter(
    (c) => c.timestamp && typeof c.timestamp === 'object' && 'x' in c.timestamp && 'time' in c.timestamp
  );
  const timeComments = comments.filter((c) => typeof c.timestamp === 'number');
  // All comments with any time reference (for timeline markers)
  const allTimedComments = [
    ...timeComments.map((c) => ({ ...c, markerTime: c.timestamp })),
    ...pinComments.map((c) => ({ ...c, markerTime: c.timestamp.time })),
  ];

  // Visible pins: within PIN_WINDOW of current time, or when paused show pins at current frame
  const visiblePins = pinComments.filter((c) => {
    const pinTime = c.timestamp.time;
    if (!isPlaying) {
      // When paused, show pins within a wider window
      return Math.abs(pinTime - currentTime) <= PIN_WINDOW * 2;
    }
    return Math.abs(pinTime - currentTime) <= PIN_WINDOW;
  });

  return (
    <div className="flex flex-col gap-3">
      {/* Video with pin overlay */}
      <div
        ref={videoContainerRef}
        className="relative rounded-lg overflow-hidden cursor-crosshair"
        style={{ background: '#000' }}
        onClick={handleVideoClick}
      >
        <video
          ref={videoRef}
          src={file.url}
          className="w-full h-full object-contain aspect-video"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />

        {/* Play button overlay (only when paused and no pending pin) */}
        {!isPlaying && !pendingPin && !activePin && (
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ background: 'rgba(0,0,0,0.2)' }}
          >
            <div className="w-16 h-16 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center">
              <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}

        {/* Existing video pins */}
        {visiblePins.map((c, idx) => {
          const pinIdx = pinComments.findIndex((p) => p.id === c.id) + 1;
          const isActive = activePin === c.id;
          const opacity = Math.max(0.3, 1 - Math.abs(c.timestamp.time - currentTime) / (PIN_WINDOW * 2));

          return (
            <div
              key={c.id}
              data-pin="true"
              className="absolute z-10 transition-all duration-300"
              style={{
                left: `${c.timestamp.x}%`,
                top: `${c.timestamp.y}%`,
                transform: 'translate(-50%, -50%)',
                opacity: isActive ? 1 : opacity,
              }}
              onClick={(e) => {
                e.stopPropagation();
                seekTo(c.timestamp);
                setActivePin(isActive ? null : c.id);
                setPendingPin(null);
              }}
            >
              {/* Pin dot */}
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 cursor-pointer shadow-lg transition-all"
                style={
                  isActive
                    ? { background: CYAN, borderColor: 'white', color: BG, transform: 'scale(1.3)', boxShadow: `0 0 16px ${CYAN}60` }
                    : c.authorRole === 'client'
                      ? { background: CYAN, borderColor: `${CYAN}50`, color: BG, boxShadow: `0 0 8px ${CYAN}40` }
                      : { background: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.3)', color: BG }
                }
              >
                {pinIdx}
              </div>

              {/* Timestamp badge */}
              <div
                className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-mono whitespace-nowrap px-1 rounded"
                style={{ background: 'rgba(0,0,0,0.7)', color: CYAN }}
              >
                {formatTime(c.timestamp.time)}
              </div>

              {/* Pin tooltip */}
              {isActive && (
                <div
                  data-pin-tooltip="true"
                  className="absolute z-30 rounded-xl p-3 shadow-2xl w-60"
                  style={{
                    left: c.timestamp.x > 60 ? 'auto' : '120%',
                    right: c.timestamp.x > 60 ? '120%' : 'auto',
                    top: '-8px',
                    background: 'rgba(10,10,15,0.95)',
                    border: `1px solid rgba(21,243,236,0.15)`,
                    backdropFilter: 'blur(12px)',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                        style={
                          c.authorRole === 'client'
                            ? { background: 'rgba(21,243,236,0.15)', color: CYAN }
                            : { background: CYAN, color: BG }
                        }
                      >
                        {c.author?.charAt(0) || '?'}
                      </div>
                      <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.9)' }}>{c.author}</span>
                    </div>
                    <span
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                      style={{ background: 'rgba(21,243,236,0.1)', color: CYAN }}
                    >
                      {formatTime(c.timestamp.time)}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>{c.content}</p>
                  <p className="text-[10px] mt-2" style={{ color: 'rgba(255,255,255,0.3)' }}>{c.createdAt}</p>
                </div>
              )}
            </div>
          );
        })}

        {/* Pending pin (pulsing) */}
        {pendingPin && (
          <div
            data-pin="true"
            className="absolute z-20"
            style={{
              left: `${pendingPin.x}%`,
              top: `${pendingPin.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div
              className="w-7 h-7 rounded-full border-2 flex items-center justify-center shadow-lg animate-pulse"
              style={{ background: `${CYAN}B3`, borderColor: `${CYAN}50`, boxShadow: `0 0 20px ${CYAN}60` }}
            >
              <span className="text-xs font-bold" style={{ color: BG }}>{pinComments.length + 1}</span>
            </div>
            <div
              className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-mono whitespace-nowrap px-1 rounded"
              style={{ background: 'rgba(0,0,0,0.7)', color: CYAN }}
            >
              {formatTime(pendingPin.time)}
            </div>
          </div>
        )}

        {/* Pin hint */}
        {showPinHint && !pendingPin && (
          <div
            className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-opacity"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', color: 'rgba(255,255,255,0.7)' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={CYAN} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            Click video to pin feedback
          </div>
        )}

        {/* Pin count badge */}
        {pinComments.length > 0 && (
          <div
            className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={CYAN} strokeWidth={2.5}>
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span style={{ color: CYAN }}>{pinComments.length}</span>
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>pin{pinComments.length !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="rounded-lg p-3 space-y-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
        {/* Timeline */}
        <div className="relative">
          <div
            ref={progressRef}
            className="relative h-8 flex items-center cursor-pointer group"
            onClick={handleProgressClick}
            title="Click to seek or drop a time comment"
          >
            <div className="absolute inset-x-0 h-2 rounded-full overflow-hidden" style={{ top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.08)' }}>
              <div className="h-full rounded-full transition-none" style={{ width: `${progressPct}%`, background: CYAN }} />
            </div>

            {/* Timeline markers for ALL timed comments */}
            {allTimedComments.map((c) => {
              const pct = duration > 0 ? (c.markerTime / duration) * 100 : 0;
              const isPin = typeof c.timestamp === 'object';
              return (
                <div
                  key={c.id}
                  className="absolute -translate-x-1/2 cursor-pointer z-10"
                  style={{ left: `${pct}%`, top: '50%', transform: 'translateX(-50%) translateY(-50%)' }}
                  onClick={(e) => { e.stopPropagation(); seekTo(c.timestamp); if (isPin) setActivePin(c.id); }}
                  title={`${c.author}: ${c.content}`}
                >
                  {isPin ? (
                    // Pin marker: small circle
                    <div className="w-3 h-3 rounded-full border" style={{ background: `${CYAN}80`, borderColor: CYAN }} />
                  ) : (
                    // Time comment marker: bar
                    <div className="w-2 h-5 rounded-sm opacity-80 hover:opacity-100 transition-opacity" style={{ background: c.authorRole === 'client' ? CYAN : 'rgba(255,255,255,0.5)' }} />
                  )}
                </div>
              );
            })}

            {/* Playhead */}
            <div className="absolute w-3 h-3 rounded-full shadow-lg -translate-x-1/2 -translate-y-1/2 z-20" style={{ left: `${progressPct}%`, top: '50%', background: CYAN }} />
          </div>
          <div className="flex justify-between text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
            <span>{formatTime(currentTime)}</span>
            <span className="text-xs">Click timeline for time comment · Click video for pin</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Playback controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-colors"
            style={{ background: CYAN }}
          >
            {isPlaying ? (
              <svg className="w-4 h-4" style={{ color: BG }} fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
            ) : (
              <svg className="w-4 h-4 ml-0.5" style={{ color: BG }} fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            )}
          </button>
          <button onClick={toggleMute} className="transition-colors" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {isMuted || volume === 0 ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6a7 7 0 010 12M9 9v6l4-3-4-3z" /></svg>
            )}
          </button>
          <input type="range" min="0" max="1" step="0.05" value={isMuted ? 0 : volume} onChange={handleVolumeChange} className="w-20 h-1" style={{ accentColor: CYAN }} />
          <span className="text-xs ml-auto" style={{ color: 'rgba(255,255,255,0.5)' }}>{formatTime(currentTime)} / {formatTime(duration)}</span>
          <button
            onClick={() => videoRef.current?.requestFullscreen?.()}
            title="Fullscreen (F)"
            className="ml-1 transition-colors"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
          <span className="ml-1 hidden sm:inline text-xs" style={{ color: 'rgba(255,255,255,0.4)' }} title="Space=play, ←→=seek 5s, M=mute, F=fullscreen, Esc=cancel pin">⌨</span>
        </div>
      </div>

      {/* Pending video pin comment form */}
      {pendingPin && (
        <div className="rounded-lg p-3" style={{ background: 'rgba(21,243,236,0.08)', border: `1px solid rgba(21,243,236,0.2)` }}>
          <p className="text-xs mb-2 flex items-center gap-2" style={{ color: CYAN }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            Pin #{pinComments.length + 1} at <span className="font-mono font-bold">{formatTime(pendingPin.time)}</span>
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const text = e.target.elements.commentText.value;
              handleAddPinComment(text);
              e.target.reset();
            }}
            className="flex gap-2"
          >
            <input
              name="commentText"
              autoFocus
              placeholder="What feedback do you have at this spot?"
              className="flex-1 rounded-lg px-3 py-2 text-sm focus:outline-none"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.9)' }}
            />
            <button type="submit" className="px-3 py-2 text-sm font-medium rounded-lg transition-colors" style={{ background: CYAN, color: BG }}>Pin</button>
            <button type="button" onClick={() => setPendingPin(null)} className="px-3 py-2 text-sm rounded-lg transition-colors" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>Cancel</button>
          </form>
        </div>
      )}

      {/* Pending time-only comment form */}
      {pendingTimestamp !== null && !pendingPin && (
        <div className="rounded-lg p-3" style={{ background: 'rgba(21,243,236,0.08)', border: `1px solid rgba(21,243,236,0.2)` }}>
          <p className="text-xs mb-2 flex items-center gap-1" style={{ color: CYAN }}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            Comment at <span className="font-mono font-bold">{formatTime(pendingTimestamp)}</span>
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const text = e.target.elements.commentText.value;
              handleAddTimeComment(text);
              e.target.reset();
            }}
            className="flex gap-2"
          >
            <input
              name="commentText"
              autoFocus
              placeholder="Add your comment..."
              className="flex-1 rounded-lg px-3 py-2 text-sm focus:outline-none"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.9)' }}
            />
            <button type="submit" className="px-3 py-2 text-sm rounded-lg transition-colors" style={{ background: CYAN, color: BG }}>Post</button>
            <button type="button" onClick={() => setPendingTimestamp(null)} className="px-3 py-2 text-sm rounded-lg transition-colors" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>Cancel</button>
          </form>
        </div>
      )}
    </div>
  );
}
