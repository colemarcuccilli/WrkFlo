'use client';
import { useState, useRef, useEffect, useCallback } from 'react';

function formatTime(seconds) {
  if (!seconds && seconds !== 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function WaveformPlayer({ file, comments, onAddComment, onSeekToComment }) {
  const waveContainerRef = useRef(null);
  const wavesurferRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(file.duration || 0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [pendingTimestamp, setPendingTimestamp] = useState(null);
  const progressBarRef = useRef(null);

  useEffect(() => {
    let ws = null;
    const initWavesurfer = async () => {
      try {
        const WaveSurfer = (await import('wavesurfer.js')).default;
        if (!waveContainerRef.current) return;
        ws = WaveSurfer.create({
          container: waveContainerRef.current,
          waveColor: '#f97316',
          progressColor: '#ea580c',
          cursorColor: '#c2410c',
          barWidth: 2,
          barGap: 1,
          barRadius: 2,
          height: 80,
          normalize: true,
          backend: 'WebAudio',
        });
        ws.on('ready', () => { setDuration(ws.getDuration()); setIsLoaded(true); });
        ws.on('timeupdate', (t) => setCurrentTime(t));
        ws.on('play', () => setIsPlaying(true));
        ws.on('pause', () => setIsPlaying(false));
        ws.on('finish', () => setIsPlaying(false));
        ws.on('error', () => { setLoadError(true); setIsLoaded(true); });

        if (file.url) {
          try {
            ws.load(file.url);
          } catch (loadErr) {
            console.warn('WaveSurfer load error:', loadErr);
            setLoadError(true);
            setIsLoaded(true);
          }
        } else {
          setLoadError(true);
          setIsLoaded(true);
        }

        wavesurferRef.current = ws;
      } catch (err) {
        console.error('WaveSurfer init error:', err);
        setLoadError(true);
        setIsLoaded(true);
      }
    };
    initWavesurfer();
    return () => {
      if (ws) { try { ws.destroy(); } catch (e) {} }
      wavesurferRef.current = null;
    };
  }, [file.url]);

  useEffect(() => {
    if (onSeekToComment) {
      window.__wrkflo_seek = (ts) => {
        if (wavesurferRef.current && duration > 0) {
          wavesurferRef.current.seekTo(ts / duration);
        }
        setCurrentTime(ts);
      };
    }
  }, [onSeekToComment, duration]);

  const togglePlay = () => {
    if (!wavesurferRef.current || !isLoaded || loadError) return;
    wavesurferRef.current.playPause();
  };

  const handleProgressBarClick = useCallback((e) => {
    if (!progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, x / rect.width));
    const ts = ratio * (duration || 1);
    if (wavesurferRef.current && isLoaded && !loadError) wavesurferRef.current.seekTo(ratio);
    setCurrentTime(ts);
    setPendingTimestamp(Math.round(ts));
  }, [duration, isLoaded, loadError]);

  const seekTo = (ts) => {
    if (wavesurferRef.current && duration > 0 && isLoaded && !loadError) {
      wavesurferRef.current.seekTo(ts / duration);
    }
    setCurrentTime(ts);
    if (onSeekToComment) onSeekToComment(ts);
  };

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;
  const audioComments = comments.filter((c) => typeof c.timestamp === 'number');

  return (
    <div className="flex flex-col gap-3">
      {/* Waveform display */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
          <span className="text-sm text-gray-700 font-medium">{file.name}</span>
          {loadError && (
            <span className="text-xs text-orange-600 ml-auto bg-orange-50 border border-orange-200 px-2 py-0.5 rounded">
              ⚠ Audio preview unavailable
            </span>
          )}
        </div>
        {!loadError && (
          <div ref={waveContainerRef} className="w-full rounded overflow-hidden" style={{ minHeight: 80 }} />
        )}
        {!isLoaded && (
          <div className="flex items-center justify-center h-20 text-gray-400 text-sm">
            <span className="animate-pulse">Loading waveform...</span>
          </div>
        )}
        {isLoaded && loadError && (
          <div className="flex items-center justify-center h-20 text-gray-400 text-sm bg-gray-100 rounded-lg mt-1">
            <div className="text-center">
              <svg className="w-8 h-8 text-gray-300 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
              <p className="text-xs text-gray-400">Audio preview unavailable</p>
            </div>
          </div>
        )}
      </div>

      {/* Custom timeline bar with comment markers */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2">
        <div
          ref={progressBarRef}
          className="relative h-8 flex items-center cursor-pointer"
          onClick={handleProgressBarClick}
          title="Click to seek or drop a comment"
        >
          <div className="absolute inset-x-0 h-2 bg-gray-200 rounded-full overflow-hidden" style={{ top: '50%', transform: 'translateY(-50%)' }}>
            <div className="h-full bg-orange-500 rounded-full" style={{ width: `${progressPct}%` }} />
          </div>
          {audioComments.map((c) => {
            const pct = duration > 0 ? (c.timestamp / duration) * 100 : 0;
            return (
              <div
                key={c.id}
                className="absolute z-10"
                style={{ left: `${pct}%`, top: '50%', transform: 'translateX(-50%) translateY(-50%)' }}
                onClick={(e) => { e.stopPropagation(); seekTo(c.timestamp); }}
                title={`${formatTime(c.timestamp)} — ${c.author}: ${c.content}`}
              >
                <div className={`w-2 h-5 rounded-sm cursor-pointer transition-opacity hover:opacity-100 opacity-80 ${c.authorRole === 'client' ? 'bg-orange-500' : 'bg-gray-500'}`} />
              </div>
            );
          })}
          <div className="absolute w-3 h-3 bg-orange-600 rounded-full shadow-lg z-20 -translate-x-1/2 -translate-y-1/2" style={{ left: `${progressPct}%`, top: '50%' }} />
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <span>{formatTime(currentTime)}</span>
          <span className="text-gray-400">Click timeline to drop comment</span>
          <span>{formatTime(duration)}</span>
        </div>
        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={togglePlay}
            disabled={!isLoaded || loadError}
            className="w-8 h-8 flex items-center justify-center bg-orange-600 hover:bg-orange-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-full transition-colors"
            title={loadError ? 'Audio unavailable' : isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
            ) : (
              <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            )}
          </button>
          <span className="text-xs text-gray-500 ml-auto font-mono">{formatTime(currentTime)} / {formatTime(duration)}</span>
        </div>
      </div>

      {/* Pending comment */}
      {pendingTimestamp !== null && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <p className="text-xs text-orange-700 mb-2">
            Comment at <span className="font-mono font-bold">{formatTime(pendingTimestamp)}</span>
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const text = e.target.elements.commentText.value;
              if (!text.trim()) return;
              onAddComment({ text, timestamp: pendingTimestamp });
              setPendingTimestamp(null);
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
