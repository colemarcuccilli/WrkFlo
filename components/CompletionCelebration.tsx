'use client';
import { useEffect, useRef, useState } from 'react';

interface CompletionCelebrationProps {
  project: any;
  onClose: () => void;
}

// Simple canvas confetti
function runConfetti(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles: Array<{
    x: number; y: number; vx: number; vy: number;
    color: string; size: number; rotation: number; rotationSpeed: number; opacity: number;
  }> = [];

  const colors = ['#15f3ec', '#16ffc0', '#0cc8c2', '#0aa09b', '#1ad4ce', '#12e0d8'];

  for (let i = 0; i < 150; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: -Math.random() * 200,
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * 3 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 8,
      opacity: 1,
    });
  }

  let frame = 0;
  const maxFrames = 180;

  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    frame++;

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;
      p.vy += 0.05; // gravity
      if (frame > maxFrames * 0.7) {
        p.opacity = Math.max(0, p.opacity - 0.02);
      }

      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    });

    if (frame < maxFrames) {
      requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  animate();
}

export default function CompletionCelebration({ project, onClose }: CompletionCelebrationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    if (canvasRef.current) {
      runConfetti(canvasRef.current);
    }
  }, []);

  const totalFiles = project.files?.length || 0;
  const totalComments = project.files?.reduce(
    (acc: number, f: any) => acc + (f.comments?.length || 0), 0
  ) || 0;

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 200);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`}
      onClick={handleClose}
    >
      {/* Confetti canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-50"
        style={{ width: '100vw', height: '100vh' }}
      />

      {/* Summary card */}
      <div
        className={`relative rounded-2xl shadow-2xl w-full max-w-md p-8 text-center transition-all duration-300 ${visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
        style={{ background: 'rgba(10,10,15,0.95)', border: '1px solid rgba(255,255,255,0.08)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 transition-colors"
          style={{ color: 'rgba(255,255,255,0.4)' }}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Trophy icon */}
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: 'linear-gradient(135deg, #15f3ec, #16ffc0)', boxShadow: '0 4px 14px rgba(21,243,236,0.3)' }}>
          <span className="text-4xl">🏆</span>
        </div>

        <h2 className="text-2xl font-bold mb-2" style={{ color: 'rgba(255,255,255,0.9)' }}>
          Project Complete!
        </h2>
        <p className="mb-6" style={{ color: 'rgba(255,255,255,0.5)' }}>
          <span className="font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>{project.name}</span> has been fully approved by{' '}
          <span className="font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>{project.client || project.client_name}</span>. 🎉
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="rounded-xl p-3" style={{ background: 'rgba(21,243,236,0.08)' }}>
            <p className="text-2xl font-bold" style={{ color: '#15f3ec' }}>{totalFiles}</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Files Approved</p>
          </div>
          <div className="rounded-xl p-3" style={{ background: 'rgba(22,255,192,0.08)' }}>
            <p className="text-2xl font-bold" style={{ color: '#16ffc0' }}>100%</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Completion</p>
          </div>
          <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <p className="text-2xl font-bold" style={{ color: 'rgba(255,255,255,0.7)' }}>{totalComments}</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Comments</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-1 text-xs mb-6" style={{ color: 'rgba(255,255,255,0.5)' }}>
          <svg className="w-4 h-4" style={{ color: '#16ffc0' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          All {totalFiles} file{totalFiles !== 1 ? 's' : ''} approved
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors"
            style={{ border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}
          >
            Close
          </button>
          <button
            onClick={() => {
              navigator.clipboard?.writeText(
                `${window.location.origin}/review/${project.reviewToken || project.review_token}`
              );
              handleClose();
            }}
            className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors"
            style={{ background: '#15f3ec', color: '#0a0a0f' }}
          >
            Share Link
          </button>
        </div>
      </div>
    </div>
  );
}
