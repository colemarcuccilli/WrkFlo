'use client';
import { useState, useEffect } from 'react';

interface GuestNameModalProps {
  projectName: string;
  onNameSet: (name: string) => void;
}

export default function GuestNameModal({ projectName, onNameSet }: GuestNameModalProps) {
  const [name, setName] = useState('');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check if guest has already entered their name this session
    const savedName = sessionStorage.getItem('wrkflo_guest_name');
    if (savedName) {
      onNameSet(savedName);
    } else {
      setVisible(true);
    }
  }, [onNameSet]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = name.trim() || 'Client';
    sessionStorage.setItem('wrkflo_guest_name', finalName);
    onNameSet(finalName);
    setVisible(false);
  };

  const handleSkip = () => {
    sessionStorage.setItem('wrkflo_guest_name', 'Client');
    onNameSet('Client');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <span className="font-bold text-gray-900">WrkFlo</span>
        </div>

        <h2 className="text-lg font-bold text-gray-900 mb-1">
          Welcome! 👋
        </h2>
        <p className="text-sm text-gray-500 mb-5">
          You're reviewing <span className="font-semibold text-gray-700">{projectName}</span>. What should we call you?
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name (e.g. Sarah)"
            autoFocus
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          />
          <button
            type="submit"
            className="w-full px-4 py-3 bg-orange-600 hover:bg-orange-500 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            Start Reviewing →
          </button>
        </form>

        <button
          onClick={handleSkip}
          className="w-full mt-2 text-xs text-gray-400 hover:text-gray-600 transition-colors py-1"
        >
          Skip — review anonymously
        </button>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center">
            ✓ No account required — just click and review
          </p>
        </div>
      </div>
    </div>
  );
}
