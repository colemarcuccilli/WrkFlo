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
          waveColor: '#15f3ec',
          progressColor: '#0cc8c2',
          cursorColor: '#0aa09b',
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
      <div className="rounded-lg p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-4 h-4" style={{ color: '#15f3ec' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
          <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>{file.name}</span>
          {loadError && (
            <span className="text-xs ml-auto px-2 py-0.5 rounded" style={{ color: '#15f3ec', background: 'rgba(21,243,236,0.08)', border: '1px solid rgba(21,243,236,0.2)' }}>
              ⚠ Audio preview unavailable
            </span>
          )}
        </div>
        {!loadError && (
          <div ref={waveContainerRef} className="w-full rounded overflow-hidden" style={{ minHeight: 80 }} />
        )}
        {!isLoaded && (
          <div className="flex items-center justify-center h-20 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
            <span className="animate-pulse">Loading waveform...</span>
          </div>
        )}
        {isLoaded && loadError && (
          <div className="flex items-center justify-center h-20 text-sm rounded-lg mt-1" style={{ color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.06)' }}>
            <div className="text-center">
              <svg className="w-8 h-8 mx-auto mb-1" style={{ color: 'rgba(255,255,255,0.15)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Audio preview unavailable</p>
            </div>
          </div>
        )}
      </div>

      {/* Custom timeline bar with comment markers */}
      <div className="rounded-lg p-3 space-y-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div
          ref={progressBarRef}
          className="relative h-8 flex items-center cursor-pointer"
          onClick={handleProgressBarClick}
          title="Click to seek or drop a comment"
        >
          <div className="absolute inset-x-0 h-2 rounded-full overflow-hidden" style={{ top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.08)' }}>
            <div className="h-full rounded-full" style={{ width: `${progressPct}%`, background: '#15f3ec' }} />
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
                <div className="w-2 h-5 rounded-sm cursor-pointer transition-opacity hover:opacity-100 opacity-80" style={{ background: c.authorRole === 'client' ? '#15f3ec' : 'rgba(255,255,255,0.5)' }} />
              </div>
            );
          })}
          <div className="absolute w-3 h-3 rounded-full shadow-lg z-20 -translate-x-1/2 -translate-y-1/2" style={{ left: `${progressPct}%`, top: '50%', background: '#15f3ec' }} />
        </div>
        <div className="flex justify-between text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
          <span>{formatTime(currentTime)}</span>
          <span>Click timeline to drop comment</span>
          <span>{formatTime(duration)}</span>
        </div>
        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={togglePlay}
            disabled={!isLoaded || loadError}
            className="w-8 h-8 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed rounded-full transition-colors"
            style={{ background: '#15f3ec' }}
            title={loadError ? 'Audio unavailable' : isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg className="w-4 h-4" style={{ color: '#0a0a0f' }} fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
            ) : (
              <svg className="w-4 h-4 ml-0.5" style={{ color: '#0a0a0f' }} fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            )}
          </button>
          <span className="text-xs ml-auto font-mono" style={{ color: 'rgba(255,255,255,0.5)' }}>{formatTime(currentTime)} / {formatTime(duration)}</span>
        </div>
      </div>

      {/* Pending comment */}
      {pendingTimestamp !== null && (
        <div className="rounded-lg p-3" style={{ background: 'rgba(21,243,236,0.08)', border: '1px solid rgba(21,243,236,0.2)' }}>
          <p className="text-xs mb-2" style={{ color: '#15f3ec' }}>
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
              className="flex-1 rounded-lg px-3 py-2 text-sm focus:outline-none"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.9)', placeholder: 'rgba(255,255,255,0.4)' }}
            />
            <button type="submit" className="px-3 py-2 text-sm rounded-lg transition-colors" style={{ background: '#15f3ec', color: '#0a0a0f' }}>Post</button>
            <button type="button" onClick={() => setPendingTimestamp(null)} className="px-3 py-2 text-sm rounded-lg transition-colors" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>Cancel</button>
          </form>
        </div>
      )}
    </div>
  );
}
