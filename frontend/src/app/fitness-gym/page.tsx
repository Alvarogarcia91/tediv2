'use client';

import React, { useEffect, useRef, useState } from 'react';
import '../../skill/ui-ux-pro-max/fitness-gym.css';

/* ─────────────────────────────────────────────
   SVG Icon helpers (no external deps needed)
───────────────────────────────────────────── */
const Icon = {
  Zap: () => (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  Play: () => (
    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
      <path d="M5 3l14 9-14 9V3z" />
    </svg>
  ),
  Check: () => (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  ),
  Star: () => (
    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  ),
  Users: () => (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Brain: () => (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
    </svg>
  ),
  Chart: () => (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" />
    </svg>
  ),
  Video: () => (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <rect x="2" y="7" width="15" height="10" rx="2"/><polygon points="17 8 21 5 21 19 17 16"/>
    </svg>
  ),
  Apple: () => (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"/>
      <path d="M10 2c1 .5 2 2 2 5"/>
    </svg>
  ),
  ArrowRight: () => (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  ),
  Menu: () => (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M4 6h16M4 12h16M4 18h16"/>
    </svg>
  ),
  X: () => (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M18 6 6 18M6 6l12 12"/>
    </svg>
  ),
  Instagram: () => (
    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="2"/>
      <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2"/>
      <circle cx="17.5" cy="6.5" r="1.5"/>
    </svg>
  ),
  Twitter: () => (
    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
    </svg>
  ),
  YouTube: () => (
    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20.06 12 20.06 12 20.06s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
      <polygon fill="#0A0A0F" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
    </svg>
  ),
  TikTok: () => (
    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.77 1.52V6.76a4.85 4.85 0 0 1-1-.07z"/>
    </svg>
  ),
};

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
const workouts = [
  { id: 1, name: 'HIIT Cardio', level: 'Intermediate', duration: '30 min', calories: '400 cal', category: 'Cardio', color: '#FF4D00' },
  { id: 2, name: 'Strength Training', level: 'Advanced', duration: '45 min', calories: '350 cal', category: 'Strength', color: '#8B5CF6' },
  { id: 3, name: 'Yoga Flow', level: 'Beginner', duration: '40 min', calories: '200 cal', category: 'Flexibility', color: '#00E5FF' },
  { id: 4, name: 'Boxing', level: 'Intermediate', duration: '35 min', calories: '450 cal', category: 'Combat', color: '#FF8C00' },
];

const features = [
  { icon: <Icon.Brain />, title: 'AI Personal Trainer', desc: 'Adaptive workouts powered by machine learning that evolve as you improve.', color: '#FF4D00' },
  { icon: <Icon.Chart />, title: 'Progress Tracking', desc: 'Real-time analytics on strength, endurance, and body composition goals.', color: '#00E5FF' },
  { icon: <Icon.Video />, title: 'Live Classes', desc: '500+ instructor-led sessions streamed daily from world-class studios.', color: '#8B5CF6' },
  { icon: <Icon.Apple />, title: 'Nutrition Plans', desc: 'Personalized meal plans synced with your training schedule and goals.', color: '#FFD600' },
];

const trainers = [
  { id: 1, name: 'Alex Rivera', role: 'HIIT & Cardio Expert', exp: '8 years', rating: 4.9, clients: 1200, emoji: '💪' },
  { id: 2, name: 'Sarah Chen', role: 'Yoga & Mindfulness', exp: '6 years', rating: 4.8, clients: 980, emoji: '🧘' },
  { id: 3, name: 'Marcus Johnson', role: 'Strength & Power', exp: '10 years', rating: 5.0, clients: 1500, emoji: '🏋️' },
  { id: 4, name: 'Emma Wilson', role: 'Nutrition Coach', exp: '7 years', rating: 4.9, clients: 860, emoji: '🥗' },
];

const plans = [
  {
    name: 'Basic',
    price: '$9.99',
    period: '/mo',
    features: ['50+ Workout Videos', 'Basic Progress Tracking', 'Community Access', 'Mobile App'],
    featured: false,
    cta: 'Start Free Trial',
  },
  {
    name: 'Pro',
    price: '$19.99',
    period: '/mo',
    features: ['1,000+ Workout Videos', 'AI Personal Trainer', 'Advanced Analytics', 'Live Classes', 'Nutrition Plans', 'Priority Support'],
    featured: true,
    cta: 'Start Free Trial',
    badge: 'Most Popular',
  },
  {
    name: 'Elite',
    price: '$39.99',
    period: '/mo',
    features: ['Everything in Pro', '1-on-1 Trainer Sessions', 'Custom Meal Plans', 'Body Composition Analysis', 'Exclusive Masterclasses', 'Dedicated Coach'],
    featured: false,
    cta: 'Go Elite',
  },
];

const progressItems = [
  { label: 'HIIT Training', done: true },
  { label: 'Warm Up', done: true },
  { label: 'Circuit 1: Upper Body', done: true },
  { label: 'Circuit 2: Core Blast', done: false },
  { label: 'Cool Down Stretch', done: false },
];

/* ─────────────────────────────────────────────
   COMPONENT: Navbar
───────────────────────────────────────────── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      transition: 'all 0.3s ease',
      background: scrolled ? 'rgba(10,10,15,0.9)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
    }}>
      <div className="pf-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
        {/* Logo */}
        <a href="#" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'var(--gradient-fire)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--shadow-glow-fire)',
          }}>
            <Icon.Zap />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem', color: 'white' }}>
            PULSE<span style={{ color: 'var(--color-primary)' }}>FIT</span>
          </span>
        </a>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', gap: '2rem' }}>
          {['Workouts', 'Trainers', 'Pricing', 'Community'].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`} style={{
              color: 'var(--color-text-secondary)', textDecoration: 'none',
              fontSize: '0.9375rem', fontWeight: 500,
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'white')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
            >{item}</a>
          ))}
        </div>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button id="nav-login" className="pf-btn pf-btn-ghost pf-btn-sm" style={{ display: 'flex' }}>Log In</button>
          <button id="nav-cta" className="pf-btn pf-btn-primary pf-btn-sm">Start Free Trial</button>
          <button
            id="nav-mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'none', padding: 4 }}
          >
            {mobileOpen ? <Icon.X /> : <Icon.Menu />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{
          background: 'var(--color-elevated)', borderTop: '1px solid var(--color-border)',
          padding: '1rem 1.5rem 1.5rem',
        }}>
          {['Workouts', 'Trainers', 'Pricing', 'Community'].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`}
              onClick={() => setMobileOpen(false)}
              style={{ display: 'block', color: 'var(--color-text-secondary)', padding: '0.75rem 0', textDecoration: 'none', fontWeight: 500, borderBottom: '1px solid var(--color-border)' }}
            >{item}</a>
          ))}
        </div>
      )}
    </nav>
  );
}

/* ─────────────────────────────────────────────
   COMPONENT: Hero Section
───────────────────────────────────────────── */
function HeroSection() {
  const [progress] = useState(50);

  return (
    <section id="hero" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      paddingTop: '80px',
      position: 'relative',
      overflow: 'hidden',
      background: 'var(--color-bg)',
    }}>
      {/* Background glows */}
      <div style={{
        position: 'absolute', top: '20%', left: '55%',
        width: 600, height: 600,
        background: 'radial-gradient(circle, rgba(255,77,0,0.18) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', right: '5%',
        width: 300, height: 300,
        background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      <div className="pf-container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center', position: 'relative' }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="pf-badge pf-badge-fire" style={{ width: 'fit-content' }}>
            <Icon.Zap />
            New: AI-Powered Training
          </div>

          <h1 className="pf-hero-title">
            Transform Your Body,{' '}
            <span className="pf-text-gradient-fire">Transform Your Life</span>
          </h1>

          <p style={{ fontSize: '1.125rem', color: 'var(--color-text-secondary)', lineHeight: 1.7, maxWidth: '480px' }}>
            Science-backed workouts, real-time AI coaching, and a community that pushes you to be your best.
            Your transformation starts today.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button id="hero-trial-cta" className="pf-btn pf-btn-primary pf-btn-lg">
              Start 7-Day Free Trial
              <Icon.ArrowRight />
            </button>
            <button id="hero-watch-demo" className="pf-btn pf-btn-secondary pf-btn-lg" style={{ gap: '0.5rem' }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'rgba(255,77,0,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--color-primary)',
              }}>
                <Icon.Play />
              </div>
              Watch Demo
            </button>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: '2.5rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)', flexWrap: 'wrap' }}>
            {[['500K+', 'Active Members'], ['1,000+', 'Workouts'], ['50+', 'Expert Trainers']].map(([val, lbl]) => (
              <div key={lbl} className="pf-stat">
                <span className="pf-stat-value">{val}</span>
                <span className="pf-stat-label">{lbl}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column — Live Workout Dashboard Card */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div className="pf-card pf-animate-float" style={{
            width: '100%', maxWidth: '360px',
            background: 'var(--color-elevated)',
            borderRadius: 'var(--radius-2xl)',
            padding: '1.5rem',
            border: '1px solid rgba(255,77,0,0.2)',
            boxShadow: 'var(--shadow-xl), var(--shadow-glow-fire)',
          }}>
            {/* Card Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>TODAY'S WORKOUT</p>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.125rem', color: 'white', marginTop: 2 }}>HIIT Circuit</p>
              </div>
              <div className="pf-badge pf-badge-fire" style={{ fontSize: '0.7rem' }}>LIVE</div>
            </div>

            {/* Progress bar */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>Progress</span>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-primary)' }}>{progress}% Complete</span>
              </div>
              <div className="pf-progress">
                <div className="pf-progress-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>

            {/* Workout items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {progressItems.map((item, i) => (
                <div key={i} id={`workout-item-${i}`} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.625rem 0.875rem',
                  borderRadius: 'var(--radius-lg)',
                  background: item.done ? 'rgba(255,77,0,0.08)' : 'var(--color-glass)',
                  border: `1px solid ${item.done ? 'rgba(255,77,0,0.2)' : 'var(--color-border)'}`,
                }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: item.done ? 'var(--color-primary)' : 'var(--color-border)',
                    color: 'white',
                  }}>
                    {item.done ? <Icon.Check /> : null}
                  </div>
                  <span style={{
                    fontSize: '0.875rem', fontWeight: 500,
                    color: item.done ? 'white' : 'var(--color-text-muted)',
                    textDecoration: item.done ? 'none' : 'none',
                  }}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Bottom stats */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--color-border)' }}>
              {[['🔥', '320', 'kcal'], ['⏱', '22', 'min left'], ['💪', '3/5', 'circuits']].map(([emoji, val, unit]) => (
                <div key={unit} style={{ flex: 1, textAlign: 'center' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{emoji}</p>
                  <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'white' }}>{val}</p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{unit}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   COMPONENT: Workouts Section
───────────────────────────────────────────── */
function WorkoutsSection() {
  return (
    <section id="workouts" className="pf-section" style={{ background: 'var(--color-surface)' }}>
      <div className="pf-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p className="pf-eyebrow">Programs</p>
            <h2 className="pf-section-title">
              Popular <span className="pf-text-gradient-fire">Workouts</span>
            </h2>
          </div>
          <button id="workouts-view-all" className="pf-btn pf-btn-secondary">View All Workouts</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {workouts.map(w => (
            <div key={w.id} id={`workout-card-${w.id}`} className="pf-card" style={{ padding: '1.5rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Colored header */}
              <div style={{
                height: 120, borderRadius: 'var(--radius-lg)',
                background: `linear-gradient(135deg, ${w.color}22 0%, ${w.color}44 100%)`,
                border: `1px solid ${w.color}33`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2.5rem',
              }}>
                {w.category === 'Cardio' ? '🏃' : w.category === 'Strength' ? '🏋️' : w.category === 'Flexibility' ? '🧘' : '🥊'}
              </div>

              {/* Meta */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span className="pf-badge" style={{ color: w.color, background: `${w.color}15`, borderColor: `${w.color}30`, fontSize: '0.7rem' }}>{w.category}</span>
                <span className="pf-badge pf-badge-fire" style={{ fontSize: '0.7rem' }}>{w.level}</span>
              </div>

              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.125rem', color: 'white' }}>{w.name}</h3>

              <div style={{ display: 'flex', gap: '1.5rem', marginTop: 'auto' }}>
                {[['⏱', w.duration], ['🔥', w.calories]].map(([icon, val]) => (
                  <span key={val} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                    <span>{icon}</span>{val}
                  </span>
                ))}
              </div>

              <button
                id={`workout-start-${w.id}`}
                className="pf-btn pf-btn-primary"
                style={{ width: '100%', marginTop: 'auto' }}
              >
                Start Workout
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   COMPONENT: Progress Tracking Demo
───────────────────────────────────────────── */
function ProgressSection() {
  const metrics = [
    { label: 'Strength', value: 78, color: 'var(--color-primary)' },
    { label: 'Endurance', value: 65, color: 'var(--color-electric)' },
    { label: 'Flexibility', value: 45, color: 'var(--color-purple)' },
    { label: 'Recovery', value: 88, color: 'var(--color-success)' },
  ];

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const activity = [60, 85, 40, 90, 75, 50, 30]; // percent heights

  return (
    <section id="tracking" className="pf-section" style={{ background: 'var(--color-bg)' }}>
      <div className="pf-container">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
          {/* Text */}
          <div>
            <p className="pf-eyebrow">Analytics</p>
            <h2 className="pf-section-title" style={{ marginBottom: '1rem' }}>
              Track Every Rep,{' '}
              <span className="pf-text-gradient-electric">Every Gain</span>
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, fontSize: '1rem', marginBottom: '2rem' }}>
              Real-time dashboards show your progress across all fitness dimensions.
              Watch yourself improve week over week with science-backed metrics.
            </p>
            <button id="tracking-cta" className="pf-btn pf-btn-primary">View My Progress</button>
          </div>

          {/* Live Dashboard Card */}
          <div className="pf-card" style={{
            background: 'var(--color-elevated)', padding: '2rem',
            borderRadius: 'var(--radius-2xl)',
            border: '1px solid rgba(0,229,255,0.15)',
            boxShadow: 'var(--shadow-xl), var(--shadow-glow-electric)',
          }}>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'white', marginBottom: '1.5rem' }}>
              📊 Weekly Overview
            </p>

            {/* Bar chart */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: 80, marginBottom: '0.5rem' }}>
              {weekDays.map((day, i) => (
                <div key={day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem' }}>
                  <div style={{
                    width: '100%', height: `${activity[i]}%`,
                    background: i === 3 ? 'var(--gradient-fire)' : 'var(--color-border)',
                    borderRadius: '4px 4px 0 0',
                    transition: 'all 0.3s ease',
                    boxShadow: i === 3 ? 'var(--shadow-glow-fire)' : 'none',
                  }} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {weekDays.map(day => (
                <div key={day} style={{ flex: 1, textAlign: 'center', fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{day}</div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid var(--color-border)', marginTop: '1.5rem', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {metrics.map(m => (
                <div key={m.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>{m.label}</span>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: m.color }}>{m.value}%</span>
                  </div>
                  <div className="pf-progress pf-progress-thin">
                    <div style={{
                      height: '100%', width: `${m.value}%`,
                      background: m.color, borderRadius: 'var(--radius-full)',
                      transition: 'width 1s ease',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   COMPONENT: Features Grid
───────────────────────────────────────────── */
function FeaturesSection() {
  return (
    <section id="features" className="pf-section" style={{ background: 'var(--color-surface)' }}>
      <div className="pf-container">
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <p className="pf-eyebrow" style={{ justifyContent: 'center' }}>Features</p>
          <h2 className="pf-section-title">
            Everything You Need to{' '}
            <span className="pf-text-gradient-fire">Win</span>
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {features.map((f, i) => (
            <div key={i} id={`feature-card-${i}`} className="pf-card" style={{
              padding: '2rem',
              background: 'var(--color-elevated)',
              transition: 'all 0.3s ease',
            }}>
              <div className="pf-icon-wrap" style={{ background: `${f.color}18`, color: f.color, marginBottom: '1.25rem' }}>
                {f.icon}
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.0625rem', color: 'white', marginBottom: '0.625rem' }}>{f.title}</h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   COMPONENT: Trainers
───────────────────────────────────────────── */
function TrainersSection() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section id="trainers" className="pf-section" style={{ background: 'var(--color-bg)' }}>
      <div className="pf-container">
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <p className="pf-eyebrow" style={{ justifyContent: 'center' }}>Our Team</p>
          <h2 className="pf-section-title">
            World-Class <span className="pf-text-gradient-fire">Trainers</span>
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
          {trainers.map(t => (
            <div
              key={t.id}
              id={`trainer-card-${t.id}`}
              className="pf-card"
              onMouseEnter={() => setHovered(t.id)}
              onMouseLeave={() => setHovered(null)}
              style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer' }}
            >
              {/* Avatar */}
              <div style={{
                height: 200,
                background: `linear-gradient(135deg, ${t.id % 2 === 0 ? '#8B5CF622' : '#FF4D0022'} 0%, ${t.id % 2 === 0 ? '#00E5FF22' : '#FF8C0022'} 100%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '4rem',
                borderBottom: '1px solid var(--color-border)',
              }}>
                {t.emoji}
              </div>

              {/* Info */}
              <div style={{ padding: '1.25rem' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.0625rem', color: 'white', marginBottom: '0.25rem' }}>{t.name}</h3>
                <p style={{ color: 'var(--color-primary)', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.875rem' }}>{t.role}</p>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'white', fontSize: '1rem' }}>{t.rating}</div>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>Rating</div>
                  </div>
                  <div style={{ width: 1, background: 'var(--color-border)' }} />
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'white', fontSize: '1rem' }}>{t.clients.toLocaleString()}</div>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>Clients</div>
                  </div>
                  <div style={{ width: 1, background: 'var(--color-border)' }} />
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'white', fontSize: '1rem' }}>{t.exp}</div>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>Experience</div>
                  </div>
                </div>
              </div>

              {/* Hover overlay */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(255,77,0,0.95) 0%, rgba(255,77,0,0.7) 40%, transparent 100%)',
                display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                paddingBottom: '1.5rem',
                opacity: hovered === t.id ? 1 : 0,
                transition: 'opacity 0.3s ease',
              }}>
                <button id={`trainer-profile-${t.id}`} className="pf-btn pf-btn-secondary" style={{ background: 'white', color: '#0A0A0F', border: 'none' }}>
                  View Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   COMPONENT: Pricing
───────────────────────────────────────────── */
function PricingSection() {
  return (
    <section id="pricing" className="pf-section" style={{ background: 'var(--color-surface)' }}>
      <div className="pf-container">
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <p className="pf-eyebrow" style={{ justifyContent: 'center' }}>Pricing</p>
          <h2 className="pf-section-title">
            Choose Your <span className="pf-text-gradient-fire">Plan</span>
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: '1rem', fontSize: '1rem' }}>
            All plans include a 7-day free trial. No credit card required.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', maxWidth: 960, margin: '0 auto' }}>
          {plans.map((p, i) => (
            <div
              key={i}
              id={`pricing-plan-${p.name.toLowerCase()}`}
              className="pf-card"
              style={{
                padding: '2rem',
                background: p.featured ? 'var(--color-elevated)' : 'var(--color-surface)',
                border: p.featured ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                boxShadow: p.featured ? 'var(--shadow-xl), var(--shadow-glow-fire)' : 'var(--shadow-card)',
                position: 'relative',
                transform: p.featured ? 'scale(1.03)' : 'none',
              }}
            >
              {p.badge && (
                <div style={{
                  position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
                  background: 'var(--gradient-fire)',
                  color: 'white', fontSize: '0.75rem', fontWeight: 700,
                  padding: '0.25rem 1rem', borderRadius: 'var(--radius-full)',
                  whiteSpace: 'nowrap',
                }}>
                  {p.badge}
                </div>
              )}

              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem', color: 'white', marginBottom: '0.5rem' }}>{p.name}</h3>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginBottom: '1.5rem' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '2.5rem', color: p.featured ? 'var(--color-primary)' : 'white' }}>{p.price}</span>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>{p.period}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                {p.features.map(feat => (
                  <div key={feat} style={{ display: 'flex', gap: '0.625rem', alignItems: 'flex-start' }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                      background: p.featured ? 'var(--color-primary)' : 'var(--color-border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginTop: 2,
                    }}>
                      <Icon.Check />
                    </div>
                    <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{feat}</span>
                  </div>
                ))}
              </div>

              <button
                id={`pricing-cta-${p.name.toLowerCase()}`}
                className={`pf-btn pf-w-full ${p.featured ? 'pf-btn-primary' : 'pf-btn-secondary'}`}
                style={{ width: '100%' }}
              >
                {p.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   COMPONENT: CTA Banner
───────────────────────────────────────────── */
function CTASection() {
  return (
    <section className="pf-section" style={{
      background: 'var(--color-bg)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at center, rgba(255,77,0,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="pf-container" style={{ textAlign: 'center', position: 'relative' }}>
        <p className="pf-eyebrow" style={{ justifyContent: 'center', marginBottom: '1.5rem' }}>Get Started Today</p>
        <h2 className="pf-section-title" style={{ marginBottom: '1rem' }}>
          Ready to <span className="pf-text-gradient-fire">Transform?</span>
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.0625rem', marginBottom: '2.5rem', maxWidth: 500, margin: '0 auto 2.5rem' }}>
          Join 500,000+ members who've already changed their lives. Start your free 7-day trial today.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button id="cta-final-trial" className="pf-btn pf-btn-primary pf-btn-lg">
            Start Free 7-Day Trial
            <Icon.ArrowRight />
          </button>
          <button id="cta-final-plans" className="pf-btn pf-btn-ghost pf-btn-lg">
            View All Plans
          </button>
        </div>

        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem', marginTop: '1rem' }}>
          No credit card required · Cancel anytime · 30-day money-back guarantee
        </p>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   COMPONENT: Footer
───────────────────────────────────────────── */
function Footer() {
  return (
    <footer style={{
      background: 'var(--color-surface)',
      borderTop: '1px solid var(--color-border)',
      paddingTop: '3.5rem',
      paddingBottom: '2rem',
    }}>
      <div className="pf-container">
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '2rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
          {/* Brand */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'var(--gradient-fire)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon.Zap />
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.125rem', color: 'white' }}>
                PULSE<span style={{ color: 'var(--color-primary)' }}>FIT</span>
              </span>
            </div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', lineHeight: 1.65, maxWidth: 260 }}>
              The world's most energizing fitness platform. Science-backed. AI-powered. Community-driven.
            </p>
            <div style={{ display: 'flex', gap: '0.875rem' }}>
              {[
                { icon: <Icon.Instagram />, id: 'footer-instagram', label: 'Instagram' },
                { icon: <Icon.Twitter />, id: 'footer-twitter', label: 'Twitter' },
                { icon: <Icon.YouTube />, id: 'footer-youtube', label: 'YouTube' },
                { icon: <Icon.TikTok />, id: 'footer-tiktok', label: 'TikTok' },
              ].map(s => (
                <a key={s.id} id={s.id} href="#" aria-label={s.label} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 36, height: 36, borderRadius: 'var(--radius-md)',
                  background: 'var(--color-elevated)', border: '1px solid var(--color-border)',
                  color: 'var(--color-text-secondary)', textDecoration: 'none',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.color = 'var(--color-primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-secondary)'; }}
                >{s.icon}</a>
              ))}
            </div>
          </div>

          {/* Links */}
          {[
            { title: 'Workouts', links: ['HIIT', 'Strength', 'Yoga', 'Boxing', 'Cardio'] },
            { title: 'Company', links: ['About', 'Blog', 'Careers', 'Press', 'Partners'] },
            { title: 'Support', links: ['Help Center', 'Contact', 'Privacy Policy', 'Terms', 'Cookie Policy'] },
          ].map(col => (
            <div key={col.title}>
              <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9375rem', color: 'white', marginBottom: '1.125rem' }}>{col.title}</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {col.links.map(link => (
                  <a key={link} href="#" style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'white')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}
                  >{link}</a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="pf-divider pf-divider-gradient" style={{ marginBottom: '1.5rem' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>
            © {new Date().getFullYear()} PulseFit. All rights reserved.
          </p>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>
            Built with{' '}
            <span style={{ color: 'var(--color-primary)' }}>❤️</span>{' '}
            using UI-UX Pro Max Skill
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────────────────────────────────
   PAGE: Fitness Gym Landing
───────────────────────────────────────────── */
export default function FitnessGymPage() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <WorkoutsSection />
      <ProgressSection />
      <FeaturesSection />
      <TrainersSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </>
  );
}
