/**
 * UI-UX PRO MAX SKILL
 * Design Token System — Fitness Gym Theme
 * Source: https://ui-ux-pro-max-skill.nextlevelbuilder.io/demo/fitness-gym
 *
 * Color Palette: "Energize Dark"
 * Mood: Bold, motivating, high-energy fitness brand
 */

export const colors = {
  // ── Brand Core ──────────────────────────────────────────────────
  brand: {
    primary:    '#FF4D00',   // Volcanic orange — CTAs, highlights
    secondary:  '#FF8C00',   // Amber flame — gradients, accents
    accent:     '#FFD600',   // Energy yellow — badges, sparks
    electric:   '#00E5FF',   // Electric cyan — progress, tech elements
    purple:     '#8B5CF6',   // Power purple — AI / premium tier
  },

  // ── Dark Mode Backgrounds ────────────────────────────────────────
  dark: {
    bg:         '#0A0A0F',   // Deep black — page background
    surface:    '#111118',   // Card surfaces
    elevated:   '#1A1A24',   // Elevated cards / modals
    border:     '#2A2A38',   // Subtle borders
    hover:      '#242430',   // Hover states
    glass:      'rgba(255,255,255,0.04)', // Glassmorphism fill
  },

  // ── Text ─────────────────────────────────────────────────────────
  text: {
    primary:    '#FFFFFF',
    secondary:  '#A0A0B4',
    muted:      '#5A5A70',
    inverse:    '#0A0A0F',
  },

  // ── Semantic ─────────────────────────────────────────────────────
  semantic: {
    success:    '#22C55E',
    warning:    '#F59E0B',
    error:      '#EF4444',
    info:       '#3B82F6',
  },

  // ── Gradients ────────────────────────────────────────────────────
  gradients: {
    fire:       'linear-gradient(135deg, #FF4D00 0%, #FF8C00 50%, #FFD600 100%)',
    electric:   'linear-gradient(135deg, #00E5FF 0%, #8B5CF6 100%)',
    dark:       'linear-gradient(180deg, #0A0A0F 0%, #111118 100%)',
    card:       'linear-gradient(135deg, rgba(255,77,0,0.1) 0%, rgba(139,92,246,0.1) 100%)',
    hero:       'radial-gradient(ellipse at 60% 50%, rgba(255,77,0,0.15) 0%, transparent 70%)',
    glow:       'radial-gradient(circle at center, rgba(255,77,0,0.4) 0%, transparent 70%)',
  },
} as const;

export type ColorToken = typeof colors;
