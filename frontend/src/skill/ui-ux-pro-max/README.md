# 🏋️ UI-UX Pro Max Skill — Fitness Gym Theme
> Installed locally from: https://ui-ux-pro-max-skill.nextlevelbuilder.io/demo/fitness-gym

## 📁 Estructura de archivos

```
frontend/src/
├── skill/
│   └── ui-ux-pro-max/
│       ├── index.ts                ← Barrel export (import todo desde aquí)
│       ├── fitness-gym.css         ← Design system CSS completo
│       └── tokens/
│           ├── colors.ts           ← Paleta de colores "Energize Dark"
│           ├── typography.ts       ← Fuentes: Space Grotesk + DM Sans
│           └── layout.ts           ← Spacing, radii, shadows, motion, zIndex
└── app/
    └── fitness-gym/
        └── page.tsx                ← Landing page completa
```

## 🎨 Design Tokens

### Colores de Marca
| Token | Valor | Uso |
|-------|-------|-----|
| `--color-primary` | `#FF4D00` | CTAs, highlights, glow effects |
| `--color-secondary` | `#FF8C00` | Gradientes, acentos |
| `--color-accent` | `#FFD600` | Badges, elementos de energía |
| `--color-electric` | `#00E5FF` | Progreso, tech, datos |
| `--color-purple` | `#8B5CF6` | AI / tier premium |

### Superficies Oscuras
| Token | Valor | Uso |
|-------|-------|-----|
| `--color-bg` | `#0A0A0F` | Fondo de página |
| `--color-surface` | `#111118` | Tarjetas base |
| `--color-elevated` | `#1A1A24` | Tarjetas elevadas / modals |
| `--color-border` | `#2A2A38` | Bordes sutiles |

### Tipografía
- **Display:** `Space Grotesk` — Títulos, hero, headings
- **Body:** `DM Sans` — Cuerpo, UI elements
- **Mono:** `JetBrains Mono` — Stats, contadores

## 🧱 Componentes CSS

```css
/* Botones */
.pf-btn              /* Base button */
.pf-btn-primary      /* Fire gradient CTA */
.pf-btn-secondary    /* Outlined ghost */
.pf-btn-ghost        /* Glassmorphism */
.pf-btn-lg / .pf-btn-sm

/* Tarjetas */
.pf-card             /* Base + hover effects */
.pf-card-elevated    /* Darker surface */
.pf-card-glass       /* Glassmorphism blur */
.pf-card-gradient    /* Fire gradient overlay */

/* Badges */
.pf-badge-fire       /* Orange accent */
.pf-badge-electric   /* Cyan accent */
.pf-badge-purple     /* Purple accent */
.pf-badge-success    /* Green accent */

/* Progress */
.pf-progress         /* Bar wrapper */
.pf-progress-fill    /* Animated fill */
.pf-progress-thin    /* 4px variant */

/* Typography */
.pf-hero-title       /* Fluid clamp hero size */
.pf-section-title    /* Section headings */
.pf-eyebrow          /* Uppercase label + line */
.pf-text-gradient-fire     /* Fire text gradient */
.pf-text-gradient-electric /* Electric text gradient */

/* Animaciones */
.pf-animate-float    /* Floating bob effect */
.pf-animate-glow     /* Pulsing glow shadow */
.pf-animate-slide-up /* Entrance from bottom */
.pf-animate-pulse    /* Opacity pulse */
```

## 🚀 Uso en código

```tsx
// Importar tokens TypeScript
import { colors, typography, shadows, motion } from '@/skill/ui-ux-pro-max';

// Usar clases CSS
import '@/skill/ui-ux-pro-max/fitness-gym.css';

// Ejemplo de botón CTA
<button className="pf-btn pf-btn-primary pf-btn-lg">
  Start Free Trial
</button>

// Ejemplo de tarjeta
<div className="pf-card pf-card-gradient">
  <span className="pf-badge pf-badge-fire">New</span>
  <h3 className="pf-section-title pf-text-gradient-fire">HIIT Cardio</h3>
</div>
```

## 🌐 URL de la landing page

Una vez corriendo `npm run dev`:
```
http://localhost:3000/fitness-gym
```

---

*Skill instalado el: 2026-06-14 · UI-UX Pro Max v1.0.0*
