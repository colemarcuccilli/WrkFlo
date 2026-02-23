'use client';
import { useState, useRef, useEffect, useCallback } from 'react';

function formatTime(seconds) {
  if (!seconds && seconds !== 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function VideoPlayer({ file, comments, onAddComment, onSeekToComment }) {
  const videoRef = useRef(null);
  const progressRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(file.duration || 0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [pendingTimestamp, setPendingTimestamp] = useState(null);

  useEffect(() => {
    if (onSeekToComment) {
      window.__wrkflo_seek = (ts) => {
        if (videoRef.current) {
          videoRef.current.currentTime = ts;
          setCurrentTime(ts);
        }
      };
    }
  }, [onSeekToComment]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e) => {
      // Only handle if not typing in an input
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

  const handleProgressClick = useCallback((e) => {
    if (!progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, x / rect.width));
    const ts = ratio * (duration || 1);
    if (videoRef.current) { videoRef.current.currentTime = ts; setCurrentTime(ts); }
    setPendingTimestamp(Math.round(ts));
  }, [duration]);

  const handleVolumeChange = (e) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (videoRef.current) videoRef.current.volume = v;
    setIsMuted(v === 0);
  };

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    const newMuted = !isMuted;
    videoRef.current.muted = newMuted;
    setIsMuted(newMuted);
  }, [isMuted]);

  const handleAddCommentAtTimestamp = (text) => {
    if (!text.trim()) return;
    onAddComment({ text, timestamp: pendingTimestamp });
    setPendingTimestamp(null);
  };

  const seekTo = (ts) => {
    if (videoRef.current) { videoRef.current.currentTime = ts; setCurrentTime(ts); }
    if (onSeekToComment) onSeekToComment(ts);
  };

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;
  const videoComments = comments.filter((c) => typeof c.timestamp === 'number');

  return (
    <div className="flex flex-col gap-3">
      {/* Video */}
      <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
        <video
          ref={videoRef}
          src={file.url}
          className="w-full h-full object-contain"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/20" onClick={togglePlay}>
            <div className="w-16 h-16 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
              <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2">
        {/* Timeline */}
        <div className="relative">
          <div
            ref={progressRef}
            className="relative h-8 flex items-center cursor-pointer group"
            onClick={handleProgressClick}
            title="Click to seek or drop a comment"
          >
            <div className="absolute inset-x-0 h-2 bg-gray-200 rounded-full overflow-hidden" style={{ top: '50%', transform: 'translateY(-50%)' }}>
              <div className="h-full bg-orange-500 rounded-full transition-none" style={{ width: `${progressPct}%` }} />
            </div>
            {videoComments.map((c) => {
              const pct = duration > 0 ? (c.timestamp / duration) * 100 : 0;
              return (
                <div
                  key={c.id}
                  className="absolute w-2 h-5 -translate-x-1/2 cursor-pointer z-10"
                  style={{ left: `${pct}%`, top: '50%', transform: 'translateX(-50%) translateY(-50%)' }}
                  onClick={(e) => { e.stopPropagation(); seekTo(c.timestamp); }}
                  title={`${c.author}: ${c.content}`}
                >
                  <div className={`w-2 h-5 rounded-sm ${c.authorRole === 'client' ? 'bg-orange-500' : 'bg-gray-500'} opacity-80 hover:opacity-100 transition-opacity`} />
                </div>
              );
            })}
            <div className="absolute w-3 h-3 bg-orange-600 rounded-full shadow-lg -translate-x-1/2 -translate-y-1/2 z-20" style={{ left: `${progressPct}%`, top: '50%' }} />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-0.5">
            <span>{formatTime(currentTime)}</span>
            <span className="text-gray-400 text-xs">Click timeline to drop a comment</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Playback controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="w-8 h-8 flex items-center justify-center bg-orange-600 hover:bg-orange-500 rounded-full transition-colors"
          >
            {isPlaying ? (
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
            ) : (
              <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            )}
          </button>
          <button onClick={toggleMute} className="text-gray-500 hover:text-gray-900 transition-colors">
            {isMuted || volume === 0 ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6a7 7 0 010 12M9 9v6l4-3-4-3z" /></svg>
            )}
          </button>
          <input type="range" min="0" max="1" step="0.05" value={isMuted ? 0 : volume} onChange={handleVolumeChange} className="w-20 h-1 accent-orange-500" />
          <span className="text-xs text-gray-500 ml-auto">{formatTime(currentTime)} / {formatTime(duration)}</span>
          <button
            onClick={() => videoRef.current?.requestFullscreen?.()}
            title="Fullscreen (F)"
            className="ml-1 text-gray-400 hover:text-gray-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
          <span className="ml-1 hidden sm:inline text-xs text-gray-400" title="Space=play, ←→=seek 5s, M=mute, F=fullscreen">⌨</span>
        </div>
      </div>

      {/* Pending comment */}
      {pendingTimestamp !== null && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <p className="text-xs text-orange-700 mb-2 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            Comment at <span className="font-mono font-bold">{formatTime(pendingTimestamp)}</span>
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const text = e.target.elements.commentText.value;
              handleAddCommentAtTimestamp(text);
              e.target.reset();
            }}
            className="flex gap-2"
          >
            <input
              name="commentText"
              autoFocus
              placeholder="Add your comment..."
              className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-400"
            />
            <button type="submit" className="px-3 py-2 bg-orange-600 hover:bg-orange-500 text-white text-sm rounded-lg transition-colors">Post</button>
            <button type="button" onClick={() => setPendingTimestamp(null)} className="px-3 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 text-sm rounded-lg transition-colors">Cancel</button>
          </form>
        </div>
      )}
    </div>
  );
}
