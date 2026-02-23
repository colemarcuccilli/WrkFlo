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

  const colors = ['#f97316', '#ef4444', '#f59e0b', '#10b981', '#fb923c', '#fbbf24'];
  
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
        className={`relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center transition-all duration-300 ${visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Trophy icon */}
        <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-orange-500/30">
          <span className="text-4xl">🏆</span>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Project Complete!
        </h2>
        <p className="text-gray-500 mb-6">
          <span className="font-semibold text-gray-700">{project.name}</span> has been fully approved by{' '}
          <span className="font-semibold text-gray-700">{project.client || project.client_name}</span>. 🎉
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-orange-50 rounded-xl p-3">
            <p className="text-2xl font-bold text-orange-600">{totalFiles}</p>
            <p className="text-xs text-gray-500 mt-0.5">Files Approved</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-3">
            <p className="text-2xl font-bold text-emerald-600">100%</p>
            <p className="text-xs text-gray-500 mt-0.5">Completion</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-2xl font-bold text-gray-700">{totalComments}</p>
            <p className="text-xs text-gray-500 mt-0.5">Comments</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mb-6">
          <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          All {totalFiles} file{totalFiles !== 1 ? 's' : ''} approved
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
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
            className="flex-1 px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Share Link
          </button>
        </div>
      </div>
    </div>
  );
}
