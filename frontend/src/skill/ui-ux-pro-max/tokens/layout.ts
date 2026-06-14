/**
 * UI-UX PRO MAX SKILL
 * Spacing, Radius, Shadow & Motion Tokens — Fitness Gym Theme
 */

// ── Spacing Scale (8-point grid) ──────────────────────────────────────────────
export const spacing = {
  px:   '1px',
  0:    '0',
  1:    '0.25rem',   // 4px
  2:    '0.5rem',    // 8px
  3:    '0.75rem',   // 12px
  4:    '1rem',      // 16px
  5:    '1.25rem',   // 20px
  6:    '1.5rem',    // 24px
  8:    '2rem',      // 32px
  10:   '2.5rem',    // 40px
  12:   '3rem',      // 48px
  16:   '4rem',      // 64px
  20:   '5rem',      // 80px
  24:   '6rem',      // 96px
  32:   '8rem',      // 128px
} as const;

// ── Border Radius ─────────────────────────────────────────────────────────────
export const radii = {
  none:   '0',
  sm:     '4px',
  md:     '8px',
  lg:     '12px',
  xl:     '16px',
  '2xl':  '24px',
  '3xl':  '32px',
  full:   '9999px',
} as const;

// ── Shadows ───────────────────────────────────────────────────────────────────
export const shadows = {
  sm:      '0 1px 2px rgba(0,0,0,0.4)',
  md:      '0 4px 16px rgba(0,0,0,0.5)',
  lg:      '0 8px 32px rgba(0,0,0,0.6)',
  xl:      '0 16px 48px rgba(0,0,0,0.7)',
  glow: {
    fire:    '0 0 40px rgba(255,77,0,0.35)',
    electric:'0 0 40px rgba(0,229,255,0.25)',
    purple:  '0 0 40px rgba(139,92,246,0.3)',
    accent:  '0 0 20px rgba(255,77,0,0.5)',
  },
  card:     '0 4px 24px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
} as const;

// ── Motion / Animation ────────────────────────────────────────────────────────
export const motion = {
  durations: {
    instant:   '50ms',
    fast:      '150ms',
    normal:    '250ms',
    slow:      '400ms',
    slower:    '600ms',
    slowest:   '1000ms',
  },
  easings: {
    linear:       'linear',
    easeIn:       'cubic-bezier(0.4, 0, 1, 1)',
    easeOut:      'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut:    'cubic-bezier(0.4, 0, 0.2, 1)',
    spring:       'cubic-bezier(0.34, 1.56, 0.64, 1)',
    bounce:       'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
} as const;

// ── Breakpoints ───────────────────────────────────────────────────────────────
export const breakpoints = {
  sm:  '640px',
  md:  '768px',
  lg:  '1024px',
  xl:  '1280px',
  '2xl':'1536px',
} as const;

// ── Z-index ───────────────────────────────────────────────────────────────────
export const zIndex = {
  hide:    -1,
  base:     0,
  raised:   1,
  dropdown: 10,
  sticky:   20,
  overlay:  30,
  modal:    40,
  toast:    50,
} as const;
