'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ── Brand Colors ──────────────────────────────────────────────────────────────
const CYAN = '#15f3ec';
const BLUE = '#5bc7f9';
const MINT = '#16ffc0';

const PATH_COLORS = [CYAN, BLUE, MINT, CYAN, BLUE, MINT, CYAN, BLUE, MINT, CYAN];

// ── WrkFlo SVG Logo ───────────────────────────────────────────────────────────
function WrkFloLogo({
  logoRef,
  size = 'hero',
}: {
  logoRef?: React.Ref<SVGSVGElement>;
  size?: 'hero' | 'footer';
}) {
  const strokeW = size === 'hero' ? 14 : 10;
  return (
    <svg
      ref={logoRef}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 800 300"
      width="100%"
      height="100%"
      style={{ display: 'block' }}
    >
      <path fill="none" stroke={PATH_COLORS[0]} strokeWidth={strokeW} strokeLinecap="butt" strokeLinejoin="miter" d="M 180,135 L 210,203 L 240,135 L 270,203 L 300,135" />
      <path fill="none" stroke={PATH_COLORS[1]} strokeWidth={strokeW} strokeLinecap="butt" strokeLinejoin="miter" d="M 320,135 L 320,215" />
      <path fill="none" stroke={PATH_COLORS[2]} strokeWidth={strokeW} strokeLinecap="butt" strokeLinejoin="miter" d="M 320,175 C 320,145 340,135 365,135" />
      <path fill="none" stroke={PATH_COLORS[3]} strokeWidth={strokeW} strokeLinecap="butt" strokeLinejoin="miter" d="M 390,85 L 390,215" />
      <path fill="none" stroke={PATH_COLORS[4]} strokeWidth={strokeW} strokeLinecap="butt" strokeLinejoin="miter" d="M 430,135 L 390,175" />
      <path fill="none" stroke={PATH_COLORS[5]} strokeWidth={strokeW} strokeLinecap="butt" strokeLinejoin="miter" d="M 405,160 L 440,215" />
      <path fill="none" stroke={PATH_COLORS[6]} strokeWidth={strokeW} strokeLinecap="butt" strokeLinejoin="miter" d="M 470,215 L 470,115 C 470,95 480,85 500,85" />
      <path fill="none" stroke={PATH_COLORS[7]} strokeWidth={strokeW} strokeLinecap="butt" strokeLinejoin="miter" d="M 455,135 L 490,135" />
      <path fill="none" stroke={PATH_COLORS[8]} strokeWidth={strokeW} strokeLinecap="butt" strokeLinejoin="miter" d="M 520,85 L 520,215" />
      <path fill="none" stroke={PATH_COLORS[9]} strokeWidth={strokeW} strokeLinecap="butt" strokeLinejoin="miter" d="M 606,206 A 40 40 0 1 1 620,175" />
      <polygon fill={MINT} points="604,174 636,174 620,198" />
    </svg>
  );
}

// ── Inline Icons ──────────────────────────────────────────────────────────────
function IconZap() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={32} height={32}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}
function IconSync() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={32} height={32}>
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
    </svg>
  );
}
function IconFile() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={32} height={32}>
      <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" />
      <polyline points="13 2 13 9 20 9" />
    </svg>
  );
}
function IconUpload() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={48} height={48}>
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}
function IconLink() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={48} height={48}>
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
    </svg>
  );
}
function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={48} height={48}>
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
function IconCheckmark() {
  return (
    <svg className="success-check" viewBox="0 0 52 52" fill="none" width={64} height={64}>
      <circle cx="26" cy="26" r="25" stroke={MINT} strokeWidth="2" />
      <path className="check-path" stroke={MINT} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M14 27l8 8 16-16" />
    </svg>
  );
}

// ── Floating Orbs ─────────────────────────────────────────────────────────────
function FloatingOrbs() {
  return (
    <div className="orbs-container" aria-hidden="true">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <div className="orb orb-4" />
      <div className="orb orb-5" />
    </div>
  );
}

// ── Main Landing Page ─────────────────────────────────────────────────────────
export default function AnimatedLandingPage() {
  const logoRef = useRef<SVGSVGElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const sublineRef = useRef<HTMLParagraphElement>(null);
  const ctasRef = useRef<HTMLDivElement>(null);
  const scrollArrowRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLElement>(null);
  const howRef = useRef<HTMLElement>(null);
  const compareRef = useRef<HTMLElement>(null);
  const waitlistRef = useRef<HTMLElement>(null);

  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // ── Logo draw-on + hero entrance animations ────────────────────────────────
  useEffect(() => {
    const svg = logoRef.current;
    if (!svg) return;

    const paths = svg.querySelectorAll('path');
    const polygons = svg.querySelectorAll('polygon');

    paths.forEach((path) => {
      const length = (path as SVGPathElement).getTotalLength?.() || 100;
      gsap.set(path, { strokeDasharray: length, strokeDashoffset: length, opacity: 1 });
    });
    polygons.forEach((poly) => {
      gsap.set(poly, { opacity: 0, scale: 0, transformOrigin: 'center' });
    });

    gsap.set([headlineRef.current, sublineRef.current, ctasRef.current, scrollArrowRef.current], {
      opacity: 0, y: 30,
    });

    const tl = gsap.timeline();

    tl.to(paths, {
      strokeDashoffset: 0, duration: 0.4, stagger: 0.15, ease: 'power2.inOut',
    });
    tl.to(polygons, {
      opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(1.7)',
    }, '-=0.1');
    tl.to(headlineRef.current, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.1');
    tl.to(sublineRef.current, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.4');
    tl.to(ctasRef.current, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.3');
    tl.to(scrollArrowRef.current, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, '-=0.2');

    return () => { tl.kill(); };
  }, []);

  // ── ScrollTrigger animations ───────────────────────────────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.feature-card',
        { opacity: 0, y: 60 },
        { opacity: 1, y: 0, stagger: 0.2, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: '.features-section', start: 'top 75%' } }
      );
      gsap.fromTo('.step-item',
        { opacity: 0, x: -40 },
        { opacity: 1, x: 0, stagger: 0.25, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: '.how-section', start: 'top 75%' } }
      );
      gsap.fromTo('.connector-line',
        { scaleX: 0, transformOrigin: 'left center' },
        { scaleX: 1, stagger: 0.3, duration: 0.8, ease: 'power2.inOut',
          scrollTrigger: { trigger: '.how-section', start: 'top 65%' } }
      );
      document.querySelectorAll('.compare-row').forEach((row, i) => {
        gsap.fromTo(row,
          { opacity: 0, x: i % 2 === 0 ? -50 : 50 },
          { opacity: 1, x: 0, duration: 0.7, ease: 'power3.out',
            scrollTrigger: { trigger: row, start: 'top 85%' } }
        );
      });
      gsap.fromTo('.step-number',
        { opacity: 0.1 },
        { opacity: 1, stagger: 0.25, duration: 0.7, ease: 'power2.out',
          scrollTrigger: { trigger: '.how-section', start: 'top 75%' } }
      );
      gsap.fromTo('.waitlist-content',
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: '.waitlist-section', start: 'top 75%' } }
      );
    });

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  async function handleWaitlist(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) { setSubmitted(true); }
      else { setError('Something went wrong. Please try again.'); }
    } catch { setError('Something went wrong. Please try again.'); }
    finally { setSubmitting(false); }
  }

  const marqueeText = 'Video Editors · Motion Designers · Photographers · Music Producers · Podcast Creators · Small Studios · Indie Filmmakers · Animators · Sound Designers · Color Graders ·';

  const compareRows = [
    { feature: 'Client sign-up required', wrkflo: false, others: true },
    { feature: 'No-account review links', wrkflo: true, others: false },
    { feature: 'Free tier available', wrkflo: true, others: false },
    { feature: 'Built for indie creators', wrkflo: true, others: false },
    { feature: 'Timestamped comments', wrkflo: true, others: true },
    { feature: 'Simple client accounts', wrkflo: true, others: true },
    { feature: 'Affordable pricing', wrkflo: true, others: false },
    { feature: 'Real-time collaboration', wrkflo: true, others: true },
  ];

  return (
    <div style={{ background: '#0a0a0f', color: '#fff', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ── Navbar ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(16px)',
        borderBottom: `1px solid rgba(21,243,236,0.1)`, padding: '0 24px',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <div style={{ width: 180, display: 'flex', alignItems: 'center' }}>
            <WrkFloLogo size="footer" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 32, fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.6)' }}>
            <a href="#features" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = CYAN)}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}>
              Features
            </a>
            <a href="#compare" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = CYAN)}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}>
              Compare
            </a>
            <a href="#waitlist" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = CYAN)}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}>
              Early Access
            </a>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link href="/login" style={{
              padding: '8px 20px', borderRadius: 8, border: `1px solid rgba(21,243,236,0.3)`,
              color: CYAN, textDecoration: 'none', fontSize: 14, fontWeight: 500, transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(21,243,236,0.08)'; e.currentTarget.style.borderColor = CYAN; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(21,243,236,0.3)'; }}>
              Login
            </Link>
            <a href="#waitlist" style={{
              padding: '8px 20px', borderRadius: 8,
              background: `linear-gradient(135deg, ${CYAN}, ${MINT})`,
              color: '#0a0a0f', fontSize: 14, fontWeight: 700, textDecoration: 'none',
              transition: 'all 0.2s', boxShadow: `0 0 20px rgba(21,243,236,0.3)`,
            }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 0 32px rgba(21,243,236,0.55)`; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = `0 0 20px rgba(21,243,236,0.3)`; e.currentTarget.style.transform = 'translateY(0)'; }}>
              Get Early Access
            </a>
          </div>
        </div>
      </nav>

      {/* ── Section 1: Hero ── */}
      <section ref={heroRef} style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
        padding: '80px 24px 120px', background: '#0a0a0f',
      }}>
        <FloatingOrbs />
        <div aria-hidden="true" style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `radial-gradient(ellipse 70% 50% at 50% 40%, rgba(21,243,236,0.06) 0%, transparent 70%)`,
        }} />
        <div style={{ width: '100%', maxWidth: 700, marginBottom: 48 }}>
          <WrkFloLogo logoRef={logoRef} size="hero" />
        </div>
        <h1 ref={headlineRef} style={{
          fontSize: 'clamp(2.4rem, 5vw, 4.2rem)',
          fontWeight: 900, lineHeight: 1.08, letterSpacing: '-0.03em',
          textAlign: 'center', marginBottom: 20,
          background: `linear-gradient(135deg, #fff 30%, ${CYAN} 70%, ${MINT} 100%)`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>
          Creative Review, Reimagined.
        </h1>
        <p ref={sublineRef} style={{
          fontSize: 'clamp(1rem, 2vw, 1.25rem)',
          color: 'rgba(255,255,255,0.6)', textAlign: 'center', maxWidth: 520,
          marginBottom: 44, lineHeight: 1.65,
        }}>
          Share files. Get feedback. Ship faster.<br />
          The creative review platform built for indie creators and small studios.
        </p>
        <div ref={ctasRef} style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          <a href="#waitlist" style={{
            padding: '14px 32px', borderRadius: 10,
            background: `linear-gradient(135deg, ${CYAN}, ${MINT})`,
            color: '#0a0a0f', fontSize: 16, fontWeight: 700, textDecoration: 'none',
            boxShadow: `0 0 30px rgba(21,243,236,0.35)`, transition: 'all 0.25s',
          }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 0 50px rgba(21,243,236,0.6)`; e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = `0 0 30px rgba(21,243,236,0.35)`; e.currentTarget.style.transform = 'translateY(0) scale(1)'; }}>
            Get Early Access
          </a>
          <Link href="/dashboard" style={{
            padding: '14px 32px', borderRadius: 10,
            border: `1px solid rgba(255,255,255,0.15)`,
            color: 'rgba(255,255,255,0.8)', fontSize: 16, fontWeight: 600, textDecoration: 'none',
            transition: 'all 0.25s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; e.currentTarget.style.background = 'transparent'; }}>
            Enter Dashboard &rarr;
          </Link>
        </div>
        <div ref={scrollArrowRef} className="scroll-bounce" style={{
          position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)',
          color: 'rgba(21,243,236,0.5)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase',
        }}>
          <span style={{ fontSize: 10 }}>Scroll</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </div>
      </section>

      {/* ── Section 2: Features ── */}
      <section id="features" ref={featuresRef} className="features-section" style={{
        padding: '100px 24px', background: '#0d0d18', position: 'relative',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{ color: CYAN, fontSize: 12, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>
              Features
            </p>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 3rem)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.15 }}>
              Everything you need to{' '}
              <span style={{ color: MINT }}>move fast</span>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            {[
              { icon: <IconZap />, color: CYAN, title: 'Zero-Friction Review', desc: 'Clients click your link and review instantly. No account, no app download, no friction. Faster approvals, happier clients.' },
              { icon: <IconSync />, color: BLUE, title: 'Real-Time Sync', desc: 'Comments sync live between you and your client. Timestamped feedback pins to exact moments. No more email chains.' },
              { icon: <IconFile />, color: MINT, title: 'All Creative File Types', desc: 'Video, audio, images, PDFs, design files — WrkFlo handles every format your creative workflow demands.' },
            ].map(({ icon, color, title, desc }) => (
              <div key={title} className="feature-card" style={{
                background: 'rgba(255,255,255,0.02)', border: `1px solid rgba(255,255,255,0.06)`,
                borderRadius: 16, padding: 36, transition: 'all 0.3s', position: 'relative', overflow: 'hidden',
              }}
                onMouseEnter={e => { const el = e.currentTarget; el.style.border = `1px solid ${color}40`; el.style.boxShadow = `0 0 30px ${color}15, inset 0 0 30px ${color}05`; el.style.transform = 'translateY(-4px)'; }}
                onMouseLeave={e => { const el = e.currentTarget; el.style.border = '1px solid rgba(255,255,255,0.06)'; el.style.boxShadow = 'none'; el.style.transform = 'translateY(0)'; }}
              >
                <div style={{ color, marginBottom: 20 }}>{icon}</div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 12 }}>{title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, fontSize: 15 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 3: How It Works ── */}
      <section id="how-it-works" ref={howRef} className="how-section" style={{
        padding: '100px 24px', background: '#050508',
      }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 72 }}>
            <p style={{ color: MINT, fontSize: 12, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>
              How It Works
            </p>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 3rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Approvals in 3 simple steps
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, position: 'relative', flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              { num: '01', icon: <IconUpload />, color: CYAN, title: 'Upload', desc: 'Drop in any creative file — video, audio, images, PDFs, or design files.' },
              { num: '02', icon: <IconLink />, color: BLUE, title: 'Share Link', desc: 'Send one magic link to your client. They click, they review. No account needed.' },
              { num: '03', icon: <IconCheck />, color: MINT, title: 'Approve', desc: 'Client leaves timestamped comments and approves right in WrkFlo. Done.' },
            ].map(({ num, icon, color, title, desc }, i) => (
              <div key={num} style={{ display: 'flex', alignItems: 'center', flex: '1 1 280px' }}>
                <div className="step-item" style={{ flex: 1, textAlign: 'center', padding: '0 24px', position: 'relative' }}>
                  <div className="step-number" style={{
                    fontSize: 80, fontWeight: 900, lineHeight: 1, color: 'transparent',
                    WebkitTextStroke: `2px ${color}`, marginBottom: 16, fontVariantNumeric: 'tabular-nums',
                  }}>{num}</div>
                  <div style={{ color, marginBottom: 16, display: 'flex', justifyContent: 'center' }}>{icon}</div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 10 }}>{title}</h3>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.7 }}>{desc}</p>
                </div>
                {i < 2 && (
                  <div className="connector-line" style={{
                    width: 60, height: 2,
                    background: `linear-gradient(to right, ${i === 0 ? CYAN : BLUE}, ${i === 0 ? BLUE : MINT})`,
                    flexShrink: 0, borderRadius: 2, boxShadow: `0 0 8px ${i === 0 ? CYAN : BLUE}80`,
                  }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 4: Comparison ── */}
      <section id="compare" ref={compareRef} style={{
        padding: '100px 24px', background: '#0d0d18',
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ color: BLUE, fontSize: 12, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>
              Compare
            </p>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 3rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>
              WrkFlo vs Competitors
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: 12, fontSize: 15 }}>
              Enterprise tools were built for big teams. WrkFlo was built for you.
            </p>
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 120px 120px',
            padding: '14px 24px', marginBottom: 8,
            borderBottom: `1px solid rgba(255,255,255,0.06)`,
          }}>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Feature</span>
            <span style={{ textAlign: 'center', fontWeight: 700, color: CYAN, fontSize: 14 }}>WrkFlo</span>
            <span style={{ textAlign: 'center', fontWeight: 600, color: 'rgba(255,255,255,0.35)', fontSize: 14 }}>Others</span>
          </div>
          {compareRows.map(({ feature, wrkflo, others }, i) => (
            <div key={feature} className="compare-row" style={{
              display: 'grid', gridTemplateColumns: '1fr 120px 120px',
              padding: '16px 24px', background: i % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'transparent',
              borderRadius: 8, borderLeft: wrkflo && !others ? `2px solid ${CYAN}30` : '2px solid transparent',
              alignItems: 'center',
            }}>
              <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)' }}>{feature}</span>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                {wrkflo ? (
                  <span style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 28, height: 28, borderRadius: '50%',
                    background: `rgba(22,255,192,0.12)`, border: `1px solid ${MINT}40`,
                    color: MINT, fontSize: 13, fontWeight: 700,
                  }}>&#10003;</span>
                ) : (
                  <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 18 }}>&mdash;</span>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                {others ? (
                  <span style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: 700,
                  }}>&#10003;</span>
                ) : (
                  <span style={{ color: 'rgba(255,80,80,0.5)', fontSize: 18 }}>&#10005;</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 5: Marquee ── */}
      <section style={{ padding: '64px 0', background: '#0a0a0f', overflow: 'hidden' }}>
        <div style={{ marginBottom: 20 }}>
          <div className="marquee-track" style={{ display: 'flex', gap: 0, whiteSpace: 'nowrap' }}>
            {[0, 1].map(i => (
              <span key={i} style={{ color: `${CYAN}70`, fontSize: 15, fontWeight: 600, letterSpacing: '0.04em', paddingRight: 40, flexShrink: 0 }}>
                {marqueeText}&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
            ))}
          </div>
        </div>
        <div>
          <div className="marquee-track-reverse" style={{ display: 'flex', gap: 0, whiteSpace: 'nowrap' }}>
            {[0, 1].map(i => (
              <span key={i} style={{ color: `${MINT}60`, fontSize: 15, fontWeight: 600, letterSpacing: '0.04em', paddingRight: 40, flexShrink: 0 }}>
                {marqueeText}&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 6: Waitlist CTA ── */}
      <section id="waitlist" ref={waitlistRef} className="waitlist-section" style={{
        padding: '120px 24px', position: 'relative', overflow: 'hidden',
      }}>
        <div aria-hidden="true" className="waitlist-bg" style={{ position: 'absolute', inset: 0, zIndex: 0 }} />
        <div className="waitlist-content" style={{
          maxWidth: 560, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1,
        }}>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 16,
          }}>
            You&rsquo;re Early.{' '}
            <span style={{
              background: `linear-gradient(135deg, ${CYAN}, ${MINT})`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>That&rsquo;s Good.</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 17, lineHeight: 1.65, marginBottom: 48 }}>
            Join the waitlist. Get 3 months free when we launch.
          </p>
          {submitted ? (
            <div style={{
              background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)',
              border: `1px solid ${MINT}30`, borderRadius: 20, padding: '48px 32px',
            }}>
              <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'center' }}><IconCheckmark /></div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 10, color: MINT }}>You&rsquo;re on the list</h3>
              <p style={{ color: 'rgba(255,255,255,0.5)' }}>We&rsquo;ll reach out when WrkFlo launches. Get ready to move fast.</p>
            </div>
          ) : (
            <form onSubmit={handleWaitlist} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com" style={{
                    flex: '1 1 260px', minWidth: 0, padding: '16px 20px', borderRadius: 10,
                    background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)',
                    border: `1px solid rgba(21,243,236,0.25)`, color: '#fff', fontSize: 15, outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = CYAN; e.currentTarget.style.boxShadow = `0 0 0 3px rgba(21,243,236,0.15)`; }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'rgba(21,243,236,0.25)'; e.currentTarget.style.boxShadow = 'none'; }}
                />
                <button type="submit" disabled={submitting} style={{
                  padding: '16px 32px', borderRadius: 10, border: 'none', cursor: submitting ? 'not-allowed' : 'pointer',
                  background: `linear-gradient(135deg, ${CYAN}, ${MINT})`,
                  color: '#0a0a0f', fontWeight: 700, fontSize: 15,
                  boxShadow: `0 0 24px rgba(21,243,236,0.35)`, transition: 'all 0.25s', opacity: submitting ? 0.7 : 1,
                }}
                  onMouseEnter={e => { if (!submitting) { e.currentTarget.style.boxShadow = `0 0 40px rgba(21,243,236,0.6)`; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = `0 0 24px rgba(21,243,236,0.35)`; e.currentTarget.style.transform = 'translateY(0)'; }}>
                  {submitting ? 'Joining...' : 'Join Waitlist'}
                </button>
              </div>
              {error && <p style={{ color: '#ff6b6b', fontSize: 13 }}>{error}</p>}
              <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>No spam. Unsubscribe anytime.</p>
            </form>
          )}
        </div>
      </section>

      {/* ── Section 7: Footer ── */}
      <footer style={{
        padding: '48px 24px 32px', background: '#050508',
        borderTop: `1px solid rgba(21,243,236,0.08)`, boxShadow: `0 -1px 0 ${CYAN}15`,
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 }}>
            <div>
              <div style={{ width: 200, marginBottom: 12 }}><WrkFloLogo size="footer" /></div>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Built for creators who move fast.</p>
            </div>
            <nav style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
              {[
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Features', href: '#features' },
                { label: 'Privacy', href: '#' },
                { label: 'Terms', href: '#' },
              ].map(({ label, href }) => (
                <a key={label} href={href} style={{
                  color: 'rgba(255,255,255,0.35)', fontSize: 14, textDecoration: 'none', transition: 'color 0.2s',
                }}
                  onMouseEnter={e => (e.currentTarget.style.color = CYAN)}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}>
                  {label}
                </a>
              ))}
            </nav>
          </div>
          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 24,
            display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
          }}>
            <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>&copy; 2026 WrkFlo. All rights reserved.</span>
            <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 13 }}>Built for creators.</span>
          </div>
        </div>
      </footer>

      {/* ── Global Styles ── */}
      <style jsx global>{`
        @keyframes float-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -40px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.97); }
        }
        @keyframes float-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-35px, 30px) scale(0.95); }
          66% { transform: translate(25px, -25px) scale(1.04); }
        }
        @keyframes float-3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, 40px) scale(1.06); }
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes marquee-reverse {
          from { transform: translateX(-50%); }
          to { transform: translateX(0); }
        }
        @keyframes scroll-bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(8px); }
        }
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.04; transform: scale(1); }
          50% { opacity: 0.09; transform: scale(1.08); }
        }
        .orbs-container { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
        .orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.12; }
        .orb-1 { width: 500px; height: 500px; background: ${CYAN}; top: -150px; left: -150px; animation: float-1 18s ease-in-out infinite; }
        .orb-2 { width: 400px; height: 400px; background: ${BLUE}; bottom: -100px; right: -100px; animation: float-2 22s ease-in-out infinite; }
        .orb-3 { width: 350px; height: 350px; background: ${MINT}; top: 40%; left: 60%; animation: float-3 15s ease-in-out infinite; }
        .orb-4 { width: 200px; height: 200px; background: ${CYAN}; top: 30%; left: 20%; animation: float-2 20s ease-in-out infinite reverse; opacity: 0.07; }
        .orb-5 { width: 300px; height: 300px; background: ${BLUE}; top: 70%; left: 40%; animation: float-1 25s ease-in-out infinite reverse; opacity: 0.06; }
        .scroll-bounce { animation: scroll-bounce 2s ease-in-out infinite; }
        .marquee-track { display: inline-flex; animation: marquee 30s linear infinite; }
        .marquee-track-reverse { display: inline-flex; animation: marquee-reverse 35s linear infinite; }
        .waitlist-bg {
          background: linear-gradient(135deg, rgba(21,243,236,0.06) 0%, rgba(91,199,249,0.06) 33%, rgba(22,255,192,0.06) 66%, rgba(21,243,236,0.06) 100%);
          background-size: 400% 400%; animation: gradient-shift 10s ease infinite;
        }
        .success-check circle { stroke-dasharray: 157; stroke-dashoffset: 0; animation: draw-circle 0.6s ease-out forwards; }
        .check-path { stroke-dasharray: 50; stroke-dashoffset: 50; animation: draw-check 0.4s 0.5s ease-out forwards; }
        @keyframes draw-circle { from { stroke-dashoffset: 157; } to { stroke-dashoffset: 0; } }
        @keyframes draw-check { to { stroke-dashoffset: 0; } }
        * { box-sizing: border-box; }
        body { margin: 0; }
      `}</style>
    </div>
  );
}
