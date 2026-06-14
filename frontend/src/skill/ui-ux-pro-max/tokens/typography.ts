/**
 * UI-UX PRO MAX SKILL
 * Typography Tokens — Fitness Gym Theme
 */

export const typography = {
  // ── Font Families ─────────────────────────────────────────────────
  fonts: {
    display:  '"Space Grotesk", sans-serif',   // Headlines, hero titles
    body:     '"DM Sans", sans-serif',          // Body text, UI elements
    mono:     '"JetBrains Mono", monospace',    // Stats, counters, code
  },

  // ── Font Sizes (rem scale) ────────────────────────────────────────
  sizes: {
    xs:   '0.75rem',    // 12px
    sm:   '0.875rem',   // 14px
    base: '1rem',       // 16px
    lg:   '1.125rem',   // 18px
    xl:   '1.25rem',    // 20px
    '2xl':'1.5rem',     // 24px
    '3xl':'1.875rem',   // 30px
    '4xl':'2.25rem',    // 36px
    '5xl':'3rem',       // 48px
    '6xl':'3.75rem',    // 60px
    '7xl':'4.5rem',     // 72px
    '8xl':'6rem',       // 96px
  },

  // ── Font Weights ──────────────────────────────────────────────────
  weights: {
    regular: 400,
    medium:  500,
    semibold:600,
    bold:    700,
    black:   900,
  },

  // ── Line Heights ──────────────────────────────────────────────────
  lineHeights: {
    tight:   1.1,
    snug:    1.25,
    normal:  1.5,
    relaxed: 1.625,
  },

  // ── Letter Spacing ────────────────────────────────────────────────
  tracking: {
    tighter: '-0.05em',
    tight:   '-0.025em',
    normal:   '0em',
    wide:     '0.05em',
    wider:    '0.1em',
    widest:   '0.25em',
  },
} as const;

/** Google Fonts import string — add to <head> */
export const googleFontsUrl =
  'https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700;1,9..40,400&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap';
