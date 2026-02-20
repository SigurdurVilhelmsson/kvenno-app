# kvenno.app Design System

Unified design tokens and component patterns for the kvenno.app education platform.

## Color Palette

### Brand Colors
| Token | Value | Usage |
|-------|-------|-------|
| `kvenno-orange` | `#f36b22` | Primary brand, CTAs, active states |
| `kvenno-orange-dark` | `#c55113` | Hover states, emphasis |
| `kvenno-orange-light` | `#ff8c4d` | Backgrounds, subtle accents |

### Semantic Colors
| Token | Value | Usage |
|-------|-------|-------|
| `success` | `#10b981` | Correct answers, saved state |
| `warning` | `#f59e0b` | Caution, partial results |
| `error` | `#ef4444` | Errors, destructive actions |
| `info` | `#3b82f6` | Informational, help text |

### Neutral Palette (Slate)
Standardized on `slate-*` across all apps for a modern, slightly blue-tinted feel.

| Token | Value | Usage |
|-------|-------|-------|
| `slate-50` | `#f8fafc` | Page backgrounds |
| `slate-100` | `#f1f5f9` | Card backgrounds, subtle sections |
| `slate-200` | `#e2e8f0` | Borders, dividers |
| `slate-300` | `#cbd5e1` | Disabled borders |
| `slate-400` | `#94a3b8` | Placeholder text |
| `slate-500` | `#64748b` | Secondary text |
| `slate-600` | `#475569` | Body text |
| `slate-700` | `#334155` | Headings |
| `slate-800` | `#1e293b` | High-emphasis text |
| `slate-900` | `#0f172a` | Maximum contrast |

### Year Theme Colors
| Year | Primary | Gradient |
|------|---------|----------|
| 1-ár | Orange/Amber | `from-orange-50 to-amber-100` |
| 2-ár | Teal/Cyan | `from-teal-50 to-cyan-100` |
| 3-ár | Purple/Indigo | `from-purple-50 to-indigo-100` |

### Level Colors
| Level | Color | Badge |
|-------|-------|-------|
| 1 | Blue | `bg-blue-500` |
| 2 | Green | `bg-green-500` |
| 3 | Amber | `bg-amber-500` |

### Special Colors
- **Student mode:** `bg-green-600` — semantic distinction from teacher mode
- **High contrast mode:** Black bg (`#000`), white text (`#fff`), yellow borders (`#ff0`)

---

## Typography

### Font: Inter (self-hosted)
Self-hosted Inter font, weights 400–700. Already used in 18/20 CSS entry points. Self-hosting eliminates Google Fonts network dependency.

### Font Scale
| Name | Size | Usage |
|------|------|-------|
| `xs` | 0.75rem (12px) | Fine print, badges |
| `sm` | 0.875rem (14px) | Secondary text, labels |
| `base` | 1rem (16px) | Body text |
| `lg` | 1.125rem (18px) | Subtitles, emphasis |
| `xl` | 1.25rem (20px) | Section headings |
| `2xl` | 1.5rem (24px) | Page headings |
| `3xl` | 1.875rem (30px) | Hero headings |

### Font Weights
- `400` — Regular body text
- `500` — Medium emphasis
- `600` — Semibold headings
- `700` — Bold emphasis, CTAs

---

## Spacing

Standard Tailwind spacing scale. Key reference points:

| Token | Value | Common usage |
|-------|-------|-------------|
| `1` | 0.25rem (4px) | Tight gaps |
| `2` | 0.5rem (8px) | Icon spacing |
| `4` | 1rem (16px) | Standard padding |
| `6` | 1.5rem (24px) | Section padding |
| `8` | 2rem (32px) | Card padding |
| `12` | 3rem (48px) | Section gaps |
| `16` | 4rem (64px) | Page sections |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `rounded-lg` | 8px | Buttons, inputs |
| `rounded-xl` | 12px | Cards |
| `rounded-2xl` | 16px | Large cards, modals |
| `rounded-full` | 9999px | Badges, avatars |

---

## Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-sm` | `0 1px 2px rgb(0 0 0 / 0.05)` | Subtle depth |
| `shadow-card` | `0 2px 4px rgb(0 0 0 / 0.1)` | Default cards |
| `shadow-card-hover` | `0 4px 12px rgb(243 107 34 / 0.3)` | Card hover (orange glow) |
| `shadow-lg` | `0 10px 15px rgb(0 0 0 / 0.1)` | Elevated cards, modals |
| `shadow-xl` | `0 20px 25px rgb(0 0 0 / 0.1)` | Full overlays |

---

## Transitions

| Token | Duration | Usage |
|-------|----------|-------|
| `fast` | 150ms | Hover color changes |
| `normal` | 300ms | Card lifts, menu opens |
| `slow` | 500ms | Page transitions |

Default easing: `ease-in-out`

---

## Container

Standard container: `max-w-6xl` (1152px) with responsive horizontal padding:
- Mobile: `px-4`
- Tablet: `sm:px-6`
- Desktop: `lg:px-8`

---

## Component Patterns

### Card
Variants: `default`, `elevated`, `outlined`, `interactive`
- Default radius: `rounded-xl` (12px)
- Default shadow: `shadow-card`
- Interactive: hover lift (`-translate-y-1`) + `shadow-card-hover`

### Button
Variants: `primary`, `secondary`, `ghost`, `outline`, `danger`
- Sizes: `sm` (px-3 py-1.5 text-sm), `md` (px-4 py-2), `lg` (px-6 py-3 text-lg)
- Radius: `rounded-lg` (8px)
- Transition: `300ms`

### Badge
Small inline labels for levels, status, categories.
- Radius: `rounded-full`
- Padding: `px-2.5 py-0.5`

### PageBackground
Standardized page wrapper:
- Default: `bg-slate-50`
- Year-specific: year theme gradients

### SkipLink
Centralized accessibility skip-to-content link:
- Orange background, white text
- Hidden until focused (keyboard navigation)
- Icelandic label: "Fara beint í efni"

---

## Accessibility

### Focus Visible
All interactive elements: `outline: 2px solid #f36b22; outline-offset: 2px`

### High Contrast Mode
CSS class `.high-contrast` toggles:
- Dark backgrounds (`#000`, `#1a1a1a`, `#2a2a2a`)
- Light text (`#fff`, `#e0e0e0`)
- Yellow borders (`#ffff00`)

### Reduced Motion
CSS class `.reduced-motion` disables all animations and transitions.

### Text Size
Classes `.text-small` (14px), `.text-medium` (16px), `.text-large` (18px) for user-adjustable text.

---

## File Structure

```
packages/shared/styles/
├── theme.css          # Tailwind v4 @theme tokens + accessibility CSS
├── theme.ts           # TypeScript token exports (colors, spacing, year themes)
├── game-base.css      # Shared game CSS (font, a11y, brand utilities)
└── tailwind-preset.ts # TW3 JS preset (legacy, phasing out)
```
