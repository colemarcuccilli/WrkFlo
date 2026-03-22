'use client';
import { useState, useEffect } from 'react';

const CYAN = '#15f3ec';
const BG = '#0a0a0f';
const CARD_BORDER = 'rgba(255,255,255,0.06)';

interface TooltipStep {
  id: string;
  targetSelector: string;
  title: string;
  description: string;
  position: 'bottom' | 'left' | 'top';
}

const STEPS: TooltipStep[] = [
  {
    id: 'new-project',
    targetSelector: '[data-onboarding="new-project"]',
    title: 'Start here',
    description: 'Create your first project to begin the review workflow.',
  position: 'bottom',
  },
  {
    id: 'share-client',
    targetSelector: '[data-onboarding="share-client"]',
    title: 'Share with your client',
    description: 'Send your review link to get client feedback.',
    position: 'bottom',
  },
  {
    id: 'comment-panel',
    targetSelector: '[data-onboarding="comment-panel"]',
    title: 'Real-time feedback',
    description: "Your client's feedback will appear here in real-time.",
    position: 'left',
  },
];

export default function OnboardingTooltips({ step }: { step?: 'dashboard' | 'project' }) {
  const [currentStep, setCurrentStep] = useState(-1);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const done = localStorage.getItem('wrkflo_onboarding_complete');
    if (done === 'true') {
      setDismissed(true);
      return;
    }

    // Determine starting step based on page context
    if (step === 'dashboard') {
      setCurrentStep(0);
    } else if (step === 'project') {
      const savedStep = localStorage.getItem('wrkflo_onboarding_step');
      if (savedStep === '1') setCurrentStep(1);
      else if (savedStep === '2') setCurrentStep(2);
      else setCurrentStep(1);
    }
  }, [step]);

  useEffect(() => {
    if (dismissed || currentStep < 0 || currentStep >= STEPS.length) return;

    const find = () => {
      const target = document.querySelector(STEPS[currentStep].targetSelector);
      if (target) {
        const rect = target.getBoundingClientRect();
        const stepDef = STEPS[currentStep];
        let top = 0;
        let left = 0;

        if (stepDef.position === 'bottom') {
          top = rect.bottom + 12;
          left = rect.left + rect.width / 2 - 140;
        } else if (stepDef.position === 'left') {
          top = rect.top + rect.height / 2 - 40;
          left = rect.left - 292;
        } else {
          top = rect.top - 100;
          left = rect.left + rect.width / 2 - 140;
        }

        // Clamp
        left = Math.max(8, Math.min(left, window.innerWidth - 296));
        top = Math.max(8, top);

        setPosition({ top, left });
      } else {
        setPosition(null);
      }
    };

    find();
    const interval = setInterval(find, 1000);
    return () => clearInterval(interval);
  }, [currentStep, dismissed]);

  const handleGotIt = () => {
    const next = currentStep + 1;
    if (next >= STEPS.length) {
      localStorage.setItem('wrkflo_onboarding_complete', 'true');
      localStorage.removeItem('wrkflo_onboarding_step');
      setDismissed(true);
    } else {
      localStorage.setItem('wrkflo_onboarding_step', String(next));
      setCurrentStep(next);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('wrkflo_onboarding_complete', 'true');
    localStorage.removeItem('wrkflo_onboarding_step');
    setDismissed(true);
  };

  if (dismissed || currentStep < 0 || currentStep >= STEPS.length || !position) return null;

  const stepDef = STEPS[currentStep];

  return (
    <>
      {/* Pulsing dot on target element */}
      <div
        style={{
          position: 'fixed',
          top: stepDef.position === 'bottom' ? position.top - 18 : position.top + 34,
          left: stepDef.position === 'left' ? position.left + 284 : position.left + 140,
          zIndex: 9998,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: CYAN,
            boxShadow: `0 0 0 0 ${CYAN}`,
            animation: 'onboardingPulse 1.5s infinite',
          }}
        />
      </div>

      {/* Tooltip card */}
      <div
        style={{
          position: 'fixed',
          top: position.top,
          left: position.left,
          zIndex: 9999,
          width: 280,
          background: 'rgba(10,10,15,0.96)',
          border: `1px solid rgba(21,243,236,0.3)`,
          borderRadius: 12,
          padding: '14px 16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          backdropFilter: 'blur(12px)',
        }}
      >
        {/* Arrow */}
        {stepDef.position === 'bottom' && (
          <div
            style={{
              position: 'absolute',
              top: -6,
              left: '50%',
              transform: 'translateX(-50%) rotate(45deg)',
              width: 12,
              height: 12,
              background: 'rgba(10,10,15,0.96)',
              borderLeft: `1px solid rgba(21,243,236,0.3)`,
              borderTop: `1px solid rgba(21,243,236,0.3)`,
            }}
          />
        )}
        {stepDef.position === 'left' && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              right: -6,
              transform: 'translateY(-50%) rotate(45deg)',
              width: 12,
              height: 12,
              background: 'rgba(10,10,15,0.96)',
              borderRight: `1px solid rgba(21,243,236,0.3)`,
              borderTop: `1px solid rgba(21,243,236,0.3)`,
            }}
          />
        )}

        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
          {stepDef.title}
        </p>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, lineHeight: 1.5, marginBottom: 12 }}>
          {stepDef.description}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={handleSkip}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.35)',
              fontSize: 11,
              cursor: 'pointer',
              padding: 0,
            }}
          >
            Skip all
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>
              {currentStep + 1}/{STEPS.length}
            </span>
            <button
              onClick={handleGotIt}
              style={{
                background: `linear-gradient(135deg, ${CYAN}, #16ffc0)`,
                color: BG,
                border: 'none',
                borderRadius: 6,
                padding: '5px 14px',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Got it
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes onboardingPulse {
          0% { box-shadow: 0 0 0 0 rgba(21,243,236,0.5); }
          70% { box-shadow: 0 0 0 10px rgba(21,243,236,0); }
          100% { box-shadow: 0 0 0 0 rgba(21,243,236,0); }
        }
      `}</style>
    </>
  );
}
