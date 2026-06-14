/**
 * UI-UX PRO MAX SKILL
 * Central export barrel — import everything from here
 *
 * Usage:
 *   import { colors, typography, spacing, shadows, motion } from '@/skill/ui-ux-pro-max';
 */

export { colors }      from './tokens/colors';
export { typography, googleFontsUrl } from './tokens/typography';
export { spacing, radii, shadows, motion, breakpoints, zIndex } from './tokens/layout';

export type { ColorToken } from './tokens/colors';

// ── Skill Metadata ─────────────────────────────────────────────────────────────
export const SKILL_META = {
  name:        'UI-UX Pro Max',
  version:     '1.0.0',
  theme:       'fitness-gym',
  source:      'https://ui-ux-pro-max-skill.nextlevelbuilder.io/demo/fitness-gym',
  installedAt: new Date().toISOString(),
  description: 'Energetic fitness app design system: dark mode, bold colors, glassmorphism cards',
} as const;
