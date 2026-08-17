# Design System — kvenno.app

> **Status:** Phase 1 — awaiting approval before implementation
> **Last updated:** 2026-02-20
> **Replaces:** Previous minimal design system doc

---

## 1. Design Philosophy

**For whom:** Students aged 15–18 at Kvennaskólinn í Reykjavík, using chemistry games, lab report tools, and Icelandic language learning materials — often on phones.

**Guiding principles:**

1. **Warm, not institutional.** The school's identity is the foundation, but this isn't the school website. It should feel like a tool students _choose_ to use.
2. **Clear, not boring.** Every element earns its space. Information hierarchy is always obvious.
3. **Unified, not uniform.** Chemistry games, lab reports, and Íslenskubraut share a common visual language but each section has its own personality through accent colors.
4. **Mobile-first, always.** Students use phones. Every interaction must work with thumbs.

---

## 2. Color System

### 2.1 Brand Primary — Kvenno Orange

Derived from the school's brand color at [kvenno.is](https://kvenno.is). A full scale built around `#f36b22`:

| Token        | Hex           | Usage                                                  |
| ------------ | ------------- | ------------------------------------------------------ |
| `orange-50`  | `#fff7f0`     | Warm page backgrounds, hover tints                     |
| `orange-100` | `#ffead8`     | Light backgrounds, selected states                     |
| `orange-200` | `#ffd4b0`     | Subtle borders, background accents                     |
| `orange-300` | `#ffb678`     | Medium accents, progress bars                          |
| `orange-400` | `#ff9545`     | Icons, decorative accents                              |
| `orange-500` | **`#f36b22`** | **THE brand color.** Buttons, active tabs, key accents |
| `orange-600` | `#d35a15`     | Button hover, interactive emphasis                     |
| `orange-700` | `#b04510`     | Text on light backgrounds (WCAG AA compliant)          |
| `orange-800` | `#8c370d`     | High-contrast text, dark UI elements                   |
| `orange-900` | `#6a2a0a`     | Darkest accent, rare                                   |

**Accessibility note:** `orange-500` (#f36b22) on white has ~2.9:1 contrast — it fails WCAG AA for text. Rules:

- **Large text (≥18px bold, ≥24px normal):** Use `orange-500` freely.
- **Body text, links, labels:** Use `orange-700` (#b04510) — 5.2:1 contrast, passes AA.
- **Buttons:** `orange-500` background with white text is an accepted brand compromise at button sizes (16px+ semibold). Hover state uses `orange-600` for improved contrast.

### 2.2 Warm Neutrals

Cold slate grays are replaced with warm stone tones. These give the interface its "inviting" character.

| Token      | Hex       | Usage                                 |
| ---------- | --------- | ------------------------------------- |
| `warm-50`  | `#faf9f7` | Page backgrounds                      |
| `warm-100` | `#f5f3f0` | Section backgrounds, alternating rows |
| `warm-200` | `#e8e4df` | Borders, dividers                     |
| `warm-300` | `#d4cec7` | Disabled borders, subtle UI           |
| `warm-400` | `#a69d93` | Placeholder text, disabled text       |
| `warm-500` | `#7a7168` | Secondary text, captions              |
| `warm-600` | `#5c534a` | Body text                             |
| `warm-700` | `#443d36` | Headings, emphasis                    |
| `warm-800` | `#2e2823` | High-emphasis text, dark surfaces     |
| `warm-900` | `#1c1813` | Maximum contrast, near-black          |

### 2.3 Semantic Colors

| Token     | Hex       | Light variant | Usage                                           |
| --------- | --------- | ------------- | ----------------------------------------------- |
| `success` | `#16a34a` | `#dcfce7`     | Correct answers, completion, save confirmations |
| `warning` | `#d97706` | `#fef3c7`     | Partial results, hints used, caution states     |
| `error`   | `#dc2626` | `#fee2e2`     | Wrong answers, form errors, destructive actions |
| `info`    | `#2563eb` | `#dbeafe`     | Help text, informational messages, links        |

All semantic colors pass WCAG AA 4.5:1 contrast on white.

### 2.4 Year Theme Accents

Used as accent colors within games and year hub pages. The base warm palette stays consistent — year colors appear in headers, badges, progress indicators, and subtle background tints.

| Year      | Accent                 | Accent Light | Gradient (bg)                 | Personality             |
| --------- | ---------------------- | ------------ | ----------------------------- | ----------------------- |
| **1. ár** | `#f36b22` (orange-500) | `#fff7f0`    | `from-[#fff7f0] to-[#ffead8]` | Warm, foundational      |
| **2. ár** | `#0d9488` (teal-600)   | `#f0fdfa`    | `from-[#f0fdfa] to-[#ccfbf1]` | Fresh, progressing      |
| **3. ár** | `#7c3aed` (violet-600) | `#f5f3ff`    | `from-[#f5f3ff] to-[#ede9fe]` | Advanced, sophisticated |

Year accent colors are used for:

- Year hub page header accent bar
- Game level badges and progress bars
- Active tab indicators within that year's section
- Subtle page background tint

They are NOT used for: buttons (always brand orange), text body, card backgrounds, or navigation elements.

### 2.5 Íslenskubraut Category Colors

Each language category retains a distinct color for pedagogical clarity. Harmonized for consistent saturation/lightness:

| Category              | Color     | Token                 |
| --------------------- | --------- | --------------------- |
| Dýr (Animals)         | `#2d6a4f` | `category-dyr`        |
| Matur (Food)          | `#92400e` | `category-matur`      |
| Farartæki (Transport) | `#1e40af` | `category-fartaeki`   |
| Manneskja (People)    | `#9a3412` | `category-manneskja`  |
| Staðir (Places)       | `#5b21b6` | `category-stadir`     |
| Klæðnaður (Clothing)  | `#0e7490` | `category-klaednadur` |

All category colors pass 4.5:1 contrast against white. They're used for category card backgrounds, section accents, and badge colors.

### 2.6 Surface System

| Token             | Hex                     | Usage                            |
| ----------------- | ----------------------- | -------------------------------- |
| `surface-page`    | `#faf9f7`               | Main page background (warm-50)   |
| `surface-raised`  | `#ffffff`               | Cards, modals, dropdowns         |
| `surface-sunken`  | `#f5f3f0`               | Input backgrounds, inset areas   |
| `surface-overlay` | `rgba(28, 24, 19, 0.5)` | Modal/dialog backdrop            |
| `surface-hover`   | `#f5f3f0`               | Hover state for list items, rows |

---

## 3. Typography

### 3.1 Font Stack

| Role         | Font                  | Weights       | Fallback              |
| ------------ | --------------------- | ------------- | --------------------- |
| **Headings** | **Plus Jakarta Sans** | 600, 700, 800 | system-ui, sans-serif |
| **Body**     | **DM Sans**           | 400, 500, 700 | system-ui, sans-serif |

Both fonts loaded from Google Fonts. For games (single-file HTML builds), fonts are inlined via `vite-plugin-singlefile`.

**Why these fonts:**

- **Plus Jakarta Sans** — geometric, friendly, distinctive headings. Slightly rounded terminals give warmth without being childish. Supports Latin Extended-A (full Icelandic coverage including þ, ð, æ, ö).
- **DM Sans** — clean, highly readable body text. Low-contrast letterforms reduce eye strain for extended reading. Supports Latin Extended (full Icelandic coverage).

### 3.2 Type Scale

Based on a modular scale with 1rem (16px) base:

| Token       | Size            | Line Height    | Weight  | Usage                                   |
| ----------- | --------------- | -------------- | ------- | --------------------------------------- |
| `text-xs`   | 0.75rem (12px)  | 1rem (16px)    | 400–500 | Fine print, timestamps, badges          |
| `text-sm`   | 0.875rem (14px) | 1.25rem (20px) | 400–500 | Captions, secondary labels, breadcrumbs |
| `text-base` | 1rem (16px)     | 1.5rem (24px)  | 400     | Body text (default)                     |
| `text-lg`   | 1.125rem (18px) | 1.75rem (28px) | 400–500 | Lead paragraphs, emphasis               |
| `text-xl`   | 1.25rem (20px)  | 1.75rem (28px) | 600     | Section headings (h4)                   |
| `text-2xl`  | 1.5rem (24px)   | 2rem (32px)    | 600–700 | Page sub-headings (h3)                  |
| `text-3xl`  | 1.875rem (30px) | 2.25rem (36px) | 700     | Page headings (h2)                      |
| `text-4xl`  | 2.25rem (36px)  | 2.5rem (40px)  | 700–800 | Hero headings (h1)                      |
| `text-5xl`  | 3rem (48px)     | 1.1            | 800     | Display (landing page hero only)        |

### 3.3 Font Weight Usage

| Weight | Name      | Font              | Usage                                                 |
| ------ | --------- | ----------------- | ----------------------------------------------------- |
| 400    | Regular   | DM Sans           | Body text, descriptions, form inputs                  |
| 500    | Medium    | DM Sans           | Labels, emphasis, navigation items, secondary buttons |
| 600    | Semibold  | Plus Jakarta Sans | Sub-headings, card titles, active nav items           |
| 700    | Bold      | Both              | Page headings, hero text, strong emphasis             |
| 800    | Extrabold | Plus Jakarta Sans | Display headings only                                 |

### 3.4 Icelandic Typography Notes

Icelandic has many long compound words (e.g., "tilraunaskýrslur", "efnafræðikennari", "millimólekúlkraftar"). Guidelines:

- Use `hyphens: auto` with `lang="is"` on the HTML root for automatic word breaking
- Avoid fixed-width containers for headings — use fluid widths or allow wrapping
- Test all headings with the longest expected Icelandic words
- Game names in menus should use `overflow-wrap: break-word` as fallback

---

## 4. Spacing & Layout

### 4.1 Spacing Scale

Standard 4px-based scale (Tailwind compatible):

| Token | Value | Common Usage                         |
| ----- | ----- | ------------------------------------ |
| `0.5` | 2px   | Hairline gaps                        |
| `1`   | 4px   | Tight internal gaps                  |
| `1.5` | 6px   | Badge padding                        |
| `2`   | 8px   | Icon-to-text gap, inline spacing     |
| `3`   | 12px  | Compact card padding, input padding  |
| `4`   | 16px  | Standard internal padding            |
| `5`   | 20px  | Medium padding                       |
| `6`   | 24px  | Card padding (default), section gaps |
| `8`   | 32px  | Large card padding, section spacing  |
| `10`  | 40px  | Page section margins                 |
| `12`  | 48px  | Major section breaks                 |
| `16`  | 64px  | Page-level spacing                   |
| `20`  | 80px  | Hero sections                        |

### 4.2 Border Radius

Reduced to 4 intentional sizes plus full:

| Token         | Value  | Usage                                                    |
| ------------- | ------ | -------------------------------------------------------- |
| `radius-sm`   | 6px    | Badges, tooltips, small UI elements                      |
| `radius-md`   | 10px   | Buttons, inputs, form elements                           |
| `radius-lg`   | 14px   | Cards, modals, containers                                |
| `radius-xl`   | 20px   | Large feature cards, hero elements, bottom sheet corners |
| `radius-full` | 9999px | Circular avatars, pill badges                            |

**Rule:** No mixing. Cards = `radius-lg`. Buttons = `radius-md`. Always.

### 4.3 Shadows

Warm-tinted shadow system (shadows carry slight warm color instead of pure black):

| Token           | Value                                    | Usage                                      |
| --------------- | ---------------------------------------- | ------------------------------------------ |
| `shadow-sm`     | `0 1px 2px rgba(28, 24, 19, 0.06)`       | Subtle depth (inputs, badges)              |
| `shadow-md`     | `0 2px 8px rgba(28, 24, 19, 0.08)`       | Default card shadow                        |
| `shadow-lg`     | `0 4px 16px rgba(28, 24, 19, 0.10)`      | Elevated cards, dropdowns                  |
| `shadow-xl`     | `0 8px 24px rgba(28, 24, 19, 0.12)`      | Modals, popovers                           |
| `shadow-orange` | `0 4px 14px rgba(243, 107, 34, 0.20)`    | Hover state on interactive orange elements |
| `shadow-inner`  | `inset 0 2px 4px rgba(28, 24, 19, 0.06)` | Sunken inputs, inner containers            |

### 4.4 Containers & Breakpoints

| Token          | Value  | Usage                         |
| -------------- | ------ | ----------------------------- |
| `container-sm` | 640px  | Narrow content (login, forms) |
| `container-md` | 768px  | Medium content                |
| `container-lg` | 1024px | Wide content (game layouts)   |
| `container-xl` | 1200px | Max content width (default)   |

**Responsive breakpoints** (mobile-first, standard Tailwind):

| Prefix    | Min-width | Typical device               |
| --------- | --------- | ---------------------------- |
| (default) | 0px       | Small phones                 |
| `sm:`     | 640px     | Large phones / small tablets |
| `md:`     | 768px     | Tablets                      |
| `lg:`     | 1024px    | Laptops                      |
| `xl:`     | 1280px    | Desktops                     |

**Container padding:** `px-4` → `sm:px-6` → `lg:px-8`

### 4.5 Touch Target Minimums

All interactive elements must meet **44×44px minimum touch target size** on mobile:

| Element         | Minimum Height | Notes                                     |
| --------------- | -------------- | ----------------------------------------- |
| Button (sm)     | 36px           | Desktop only — use `md` or `lg` on mobile |
| Button (md)     | 44px           | Default — meets minimum                   |
| Button (lg)     | 52px           | Comfortable touch target                  |
| Nav item        | 44px           | `min-h-[44px]`                            |
| Bottom nav item | 56px           | Includes icon + label                     |
| Checkbox/Radio  | 44px           | Clickable area, not visual size           |

---

## 5. Component Specifications

### 5.1 Button

```
Variants: primary | secondary | ghost | outline | danger
Sizes:    sm (36px) | md (44px) | lg (52px)
Radius:   radius-md (10px)
Font:     DM Sans, 500 weight
```

| Variant     | Default                                               | Hover                         | Active         | Disabled                         |
| ----------- | ----------------------------------------------------- | ----------------------------- | -------------- | -------------------------------- |
| `primary`   | bg: orange-500, text: white                           | bg: orange-600                | bg: orange-700 | bg: warm-300, text: warm-500     |
| `secondary` | bg: transparent, border: orange-500, text: orange-700 | bg: orange-50                 | bg: orange-100 | border: warm-300, text: warm-400 |
| `ghost`     | bg: transparent, text: warm-700                       | bg: warm-100                  | bg: warm-200   | text: warm-400                   |
| `outline`   | bg: transparent, border: warm-300, text: warm-700     | bg: warm-50, border: warm-400 | bg: warm-100   | border: warm-200, text: warm-400 |
| `danger`    | bg: error, text: white                                | bg: red-700                   | bg: red-800    | bg: warm-300, text: warm-500     |

**Focus state (all):** 2px outline, `orange-500`, 2px offset.
**Transition:** 200ms ease-out.

### 5.2 Card

```
Variants: default | elevated | outlined | interactive
Padding:  none | sm (16px) | md (24px) | lg (32px)
Radius:   radius-lg (14px)
Surface:  surface-raised (#ffffff)
```

| Variant       | Shadow    | Border         | Hover                              |
| ------------- | --------- | -------------- | ---------------------------------- |
| `default`     | shadow-md | none           | —                                  |
| `elevated`    | shadow-lg | none           | —                                  |
| `outlined`    | none      | 1.5px warm-200 | —                                  |
| `interactive` | shadow-md | none           | shadow-lg, translateY(-2px), 200ms |

### 5.3 Badge

```
Radius:   radius-full (pill)
Padding:  px-2.5 py-1
Font:     DM Sans, 500 weight, text-xs (12px)
```

| Variant   | Background | Text       |
| --------- | ---------- | ---------- |
| `default` | warm-100   | warm-700   |
| `success` | `#dcfce7`  | `#15803d`  |
| `warning` | `#fef3c7`  | `#a16207`  |
| `error`   | `#fee2e2`  | `#b91c1c`  |
| `info`    | `#dbeafe`  | `#1d4ed8`  |
| `level1`  | `#dbeafe`  | `#1e40af`  |
| `level2`  | `#dcfce7`  | `#166534`  |
| `level3`  | `#fef3c7`  | `#92400e`  |
| `orange`  | orange-100 | orange-800 |

### 5.4 Input / Form Elements

```
Height:    44px minimum (touch target)
Radius:    radius-md (10px)
Border:    1.5px warm-300
Font:      DM Sans, 400, text-base (16px)
Padding:   px-3.5 py-2.5
```

| State    | Border           | Background     | Ring                                 |
| -------- | ---------------- | -------------- | ------------------------------------ |
| Default  | warm-300         | surface-raised | none                                 |
| Hover    | warm-400         | surface-raised | none                                 |
| Focus    | orange-500 (2px) | surface-raised | `0 0 0 3px rgba(243, 107, 34, 0.15)` |
| Error    | error            | surface-raised | `0 0 0 3px rgba(220, 38, 38, 0.15)`  |
| Disabled | warm-200         | warm-50        | none                                 |

**Label:** DM Sans, 500, text-sm, warm-700. Above input, 6px gap.
**Error text:** DM Sans, 400, text-sm, error. Below input, 4px gap.

### 5.5 Modal / Dialog

```
Overlay:   surface-overlay (rgba(28, 24, 19, 0.5))
Surface:   surface-raised (#ffffff)
Radius:    radius-xl (20px)
Shadow:    shadow-xl
Max-width: 480px (sm) | 640px (md) | 800px (lg)
Padding:   24px body, 20px header/footer
```

- Header: Plus Jakarta Sans, 600, text-xl. Optional close button (top-right, 44px target).
- Footer: Right-aligned buttons. Primary action rightmost.
- Animation: Fade in overlay (150ms), scale up content 95%→100% (200ms ease-out).
- Escape key and click-outside dismiss.

### 5.6 Toast / Notification

```
Position:  bottom-center (mobile), bottom-right (desktop)
Surface:   surface-raised (#ffffff)
Radius:    radius-lg (14px)
Shadow:    shadow-lg
Width:     min 300px, max 420px
```

| Variant   | Left accent (3px) | Icon             |
| --------- | ----------------- | ---------------- |
| `success` | success           | Checkmark circle |
| `warning` | warning           | Warning triangle |
| `error`   | error             | X circle         |
| `info`    | info              | Info circle      |

Auto-dismiss after 4 seconds. Slide up from bottom (200ms). Max 3 stacked.

### 5.7 Game Container

Standardized layout wrapper for all 17 chemistry games:

```
┌─────────────────────────────────────────┐
│ Game Header (title + back link + tools) │
├─────────────────────────────────────────┤
│                                         │
│           Game Content Area             │
│         (full remaining height)         │
│                                         │
├─────────────────────────────────────────┤
│ Game Footer (score, hints, language)    │
└─────────────────────────────────────────┘
```

- **Header:** Game title (Plus Jakarta Sans, 600), back-to-hub link (left), AchievementsButton + LanguageSwitcher (right). Height: 56px. Year accent color as subtle bottom border.
- **Content:** Flex-grow, min-height: calc(100vh - header - footer). Responsive padding.
- **Footer:** Score display, HintSystem trigger, level indicator. Height: 48px. warm-100 background.
- **Background:** Year-specific subtle gradient tint.

---

## 6. Navigation Architecture

### 6.1 Desktop — Top Bar

```
┌──────────────────────────────────────────────────────────────┐
│ 🔶 Námsvefur Kvennó  │ Efnafræði  Íslenskubraut │  Kennarar │
│                      │  ─────────               │           │
│  (logo/home link)    │  (track tabs, active      │  (utility │
│                      │   underlined)              │   links)  │
└──────────────────────────────────────────────────────────────┘
```

- **Left:** Logo text "Námsvefur Kvennó" — links to `/`. Plus Jakarta Sans, 700, orange-500.
- **Center:** Track tabs — "Efnafræði" and "Íslenskubraut". Active tab: 3px orange-500 bottom border, warm-900 text. Inactive: warm-500 text, hover warm-700.
- **Right:** "Kennarar" link, auth slot (when applicable). DM Sans, 500.
- **Height:** 64px.
- **Background:** white, `shadow-sm` bottom edge.
- **Sticky:** `position: sticky; top: 0; z-index: 50`.

Inside games: logo becomes "← Til baka" link to year hub, track tabs hide, game title shows center.

### 6.2 Mobile — Bottom Tab Bar

Visible below `md:` breakpoint (< 768px). Top bar on mobile shows only logo/back link.

```
┌──────────────────────────────┐
│  🏠 Heim   🧪 Efna   📚 Ísl │
│  (active)                    │
└──────────────────────────────┘
```

- **Items:** 3 tabs:
  1. **Heim** (Home icon) → `/`
  2. **Efnafræði** (Flask icon) → `/efnafraedi`
  3. **Íslenskubraut** (Book icon) → `/islenskubraut/`
- **Height:** 56px + safe area bottom inset.
- **Background:** white, 1px warm-200 top border.
- **Active:** orange-500 icon + text, orange-50 background pill.
- **Inactive:** warm-400 icon, warm-500 text.
- **Position:** Fixed bottom, z-index 50.
- **Touch target:** Each tab is min 44px wide × 56px tall.

**Important:** Page content needs `padding-bottom: 72px` when bottom nav is present (56px nav + 16px space).

### 6.3 Breadcrumbs

Below header on all non-root pages:

```
Heim  ›  Efnafræði  ›  2. ár  ›  Tilraunaskýrslur
```

- Font: DM Sans, 400, text-sm.
- Separator: ChevronRight icon, 14px, warm-400.
- Link color: orange-700 (WCAG compliant).
- Current page: warm-900, 500 weight, `aria-current="page"`.
- Margin: 16px below header, 16px bottom.

### 6.4 Game Navigation

Inside games, navigation simplifies for maximum play area:

- **Top:** Game title + "← Til baka" link to year hub (always visible).
- **Bottom nav:** Hidden inside games. Floating "home" button (44px circle, bottom-right, semi-transparent) instead.
- **Level navigation:** Handled by game's own menu system.

---

## 7. Page Layout Templates

### 7.1 Landing / Hub Pages

```
┌─────────────── Header ────────────────┐
│   Breadcrumbs (if not root)           │
│                                       │
│   ┌─── Hero Card (optional) ───────┐  │
│   │  Title + description            │  │
│   └──────────────────────────────────┘  │
│                                       │
│   ┌────┐  ┌────┐  ┌────┐            │
│   │Card│  │Card│  │Card│            │
│   └────┘  └────┘  └────┘            │
│   ┌────┐  ┌────┐                    │
│   │Card│  │Card│                    │
│   └────┘  └────┘                    │
│                                       │
│                Footer                 │
└─────────── Bottom Nav (mobile) ───────┘
```

- Container: max-w-[1200px], centered.
- Background: surface-page (warm-50).
- Grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`, gap-6.
- Hero card: Card variant="elevated", padding="lg", text-center.

### 7.2 Tool Pages (Lab Reports)

- Single column, max-w-[900px].
- Main content in Card variant="elevated", padding="lg".

### 7.3 Category Browser (Íslenskubraut)

Same as hub grid layout but with category-colored cards. Each card uses its category color as background accent.

### 7.4 Game Page

- No bottom nav (maximize game area).
- Minimal chrome — the game owns the viewport.
- Year-specific gradient background tint.

---

## 8. Motion & Animation

### 8.1 Principles

1. **Purpose over decoration.** Every animation communicates state change, guides attention, or provides feedback.
2. **Fast and light.** Most interactions: 150–300ms. Celebration effects can be longer (800ms–3s).
3. **Respect preferences.** All motion disabled when `prefers-reduced-motion: reduce`.
4. **Spring physics over linear easing.** Use spring curves for organic, satisfying motion.
5. **Zero external dependencies.** All animations are pure CSS keyframes, Canvas 2D, or Web Audio API.

### 8.2 Timing & Easing Tokens

| Token               | Duration | Easing        | Usage                      |
| ------------------- | -------- | ------------- | -------------------------- |
| `duration-fast`     | 100ms    | ease-out      | Opacity, color changes     |
| `duration-normal`   | 200ms    | ease-out      | Most interactions          |
| `duration-slow`     | 300ms    | ease-out      | Page transitions, modals   |
| `duration-emphasis` | 400ms    | `ease-spring` | Celebrations, achievements |

| Easing Token         | Value                                     | Character                      |
| -------------------- | ----------------------------------------- | ------------------------------ |
| `ease-spring`        | `cubic-bezier(0.34, 1.56, 0.64, 1)`       | Standard spring with overshoot |
| `ease-spring-gentle` | `cubic-bezier(0.25, 1.2, 0.5, 1)`         | Subtle bounce                  |
| `ease-spring-bouncy` | `cubic-bezier(0.68, -0.55, 0.27, 1.55)`   | Elastic snap                   |
| `ease-overshoot`     | `cubic-bezier(0.175, 0.885, 0.32, 1.275)` | Scale bounce                   |

### 8.3 Standard Animations (Keyframes)

| Animation         | Description                                                   | Usage                                       |
| ----------------- | ------------------------------------------------------------- | ------------------------------------------- |
| `fade-in`         | opacity 0→1 (200ms)                                           | Page content, card reveal                   |
| `slide-up`        | translateY(8px) + opacity 0→1 (200ms)                         | List items, staggered cards (delay: N×50ms) |
| `scale-in`        | scale(0.95) + opacity 0→1 (200ms)                             | Modals, popovers                            |
| `slide-in-bottom` | translateY(100%) → 0 (250ms)                                  | Bottom sheet, mobile nav                    |
| `pop`             | scale(0) → 1.1 → 1 (300ms, bounce)                            | Achievement unlocks, scores                 |
| `shake`           | translateX(±4px) ×3 (300ms)                                   | Error feedback, wrong answers               |
| `spring-in`       | scale(0) → scale(1.15) → scale(1) (400ms, spring)             | Element entrance with bounce                |
| `spring-bounce`   | scale(1) → scale(1.08) → scale(1) (300ms)                     | Attention pulse                             |
| `elastic-pop`     | scale(0.5) → scale(1.1) → scale(0.97) → scale(1) (500ms)      | Achievement reveal                          |
| `error-shake`     | translateX oscillation ±6px (400ms)                           | Wrong answer, violent shake                 |
| `success-flash`   | green border flash (400ms)                                    | Correct answer container feedback           |
| `error-vignette`  | red radial gradient flash (400ms)                             | Wrong answer container feedback             |
| `shimmer`         | translateX(-100%) → translateX(100%) via pseudo-element       | Gold sweep effect on headers                |
| `float-up`        | translateY(0) → translateY(-40px) + fade (800ms)              | Score popup "+10" indicators                |
| `confetti-fall`   | translateY(-100%) → translateY(100vh) + rotate (CSS fallback) | Simple confetti                             |
| `pulse-glow`      | box-shadow breathing (2s, infinite)                           | Streak badge at 10+                         |
| `gold-shimmer`    | linear-gradient sweep left→right (1.5s)                       | Perfect round header effect                 |

### 8.4 Microinteraction Utility Classes

Defined in `packages/shared/styles/game-base.css`:

| Class              | Effect                                                | Usage                                         |
| ------------------ | ----------------------------------------------------- | --------------------------------------------- |
| `game-btn`         | Press squish (scale 0.95) → spring back               | Primary action buttons                        |
| `game-card`        | Hover lift (-2px) + shadow growth                     | Level selection cards                         |
| `game-card-tilt`   | Perspective tilt toward cursor via CSS vars           | Interactive cards (set `--tilt-x`/`--tilt-y`) |
| `game-correct`     | Spring bounce + green border flash                    | Correct answer element                        |
| `game-wrong`       | Violent shake + red vignette flash                    | Wrong answer element                          |
| `game-score-popup` | Float up + fade (absolute positioned)                 | "+N" score indicators                         |
| `game-shimmer`     | Gold gradient sweep via ::after pseudo                | Perfect round header                          |
| `game-pulse-glow`  | Breathing box-shadow (2s infinite)                    | Streak indicator at 10+                       |
| `game-glass`       | Glassmorphism panel (backdrop-blur, semi-transparent) | Frosted glass overlays                        |
| `game-glass-dark`  | Dark variant of glassmorphism                         | Dark theme overlays                           |
| `game-streak-fire` | CSS variable-based fire emoji                         | Streak indicator icon                         |
| `game-stagger`     | Staggered entrance (nth-child delays 50ms apart)      | Card grid entrance                            |

### 8.5 Canvas-Based Animations

> **Deleted Aug 2026** (zero importers after the April 2026 restructure stripped the chrome from every game) — `packages/shared/components/ParticleCelebration/` and `packages/shared/components/AnimatedBackground/` no longer exist. Retained below as design history. See CLAUDE.md "Removed (Aug 2026)".

**ParticleCelebration** (`packages/shared/components/ParticleCelebration/`):
Canvas-based particle effects with physics (gravity, velocity damping). Six presets:

| Preset           | Particles                 | Duration | Trigger             |
| ---------------- | ------------------------- | -------- | ------------------- |
| `burst`          | 25, outward from origin   | 800ms    | Correct answer      |
| `confetti`       | 70, rain from top         | 2s       | General celebration |
| `streak-3`       | 15, single color          | 800ms    | 3-answer streak     |
| `streak-5`       | 30, two-tone              | 1s       | 5-answer streak     |
| `streak-10`      | 50, circles + stars       | 1.5s     | 10+ answer streak   |
| `level-complete` | 100, starburst + confetti | 3s       | Level completion    |

Year-theme color palettes: 1-ar warm oranges, 2-ar cool teals, 3-ar rich purples.
Particles use radial gradient rendering for sphere-like depth. Respects `prefers-reduced-motion`.

**AnimatedBackground** (`packages/shared/components/AnimatedBackground/`):
Three drifting gradient blobs (CSS radial-gradient + `filter: blur(80px)`) with figure-8, circular, and diagonal drift paths. Optional floating chemistry SVG symbols (atom, beaker, flask, molecule, hexring, test tube) at low opacity. GPU-composited transforms only.

### 8.6 Sound Design

> **Deleted Aug 2026** (zero importers after the April 2026 restructure) — `packages/shared/hooks/useGameSounds.ts` and the `SoundToggle` component no longer exist. Retained below as design history. See CLAUDE.md "Removed (Aug 2026)".

**useGameSounds** (`packages/shared/hooks/useGameSounds.ts`):
Web Audio API oscillator-based sounds — no audio files needed. Six synthesized effects:

| Sound               | Description                            | Trigger            |
| ------------------- | -------------------------------------- | ------------------ |
| `playClick`         | Triangle wave 800 Hz, 40ms             | Button press       |
| `playCorrect`       | Ascending C5→E5 sine two-tone          | Correct answer     |
| `playWrong`         | Detuned 150/153 Hz sawtooth buzz       | Wrong answer       |
| `playLevelComplete` | C5→E5→G5 arpeggio with delay effect    | Level complete     |
| `playAchievement`   | C5→E5→G5→C6 arpeggio + sparkle flutter | Achievement unlock |
| `playStreak(count)` | Pitch-shifted two-tone (+200/+400 Hz)  | Answer streak      |

Master volume: 0.3. Default: OFF. Persisted in localStorage (`kvenno-sound-enabled`). Lazy `AudioContext` creation respects browser autoplay policy.

---

## 9. Accessibility Requirements

### 9.1 Non-Negotiable

| Requirement                 | Standard        | Implementation                               |
| --------------------------- | --------------- | -------------------------------------------- |
| Color contrast (text)       | WCAG AA 4.5:1   | Use orange-700 for text on light backgrounds |
| Color contrast (large text) | WCAG AA 3:1     | orange-500 acceptable for ≥18px bold         |
| Touch targets               | 44×44px minimum | Enforced on all interactive elements         |
| Keyboard navigation         | Full tab order  | All interactive elements focusable           |
| Focus visibility            | 2px ring        | orange-500 ring, 2px offset                  |
| Skip link                   | All pages       | "Fara beint í efni" → `#main-content`        |
| Screen reader landmarks     | Always          | `<header>`, `<main>`, `<nav>`, `<footer>`    |
| Language declaration        | Always          | `<html lang="is">`                           |
| Reduced motion              | Always          | All animations disabled when preference set  |

### 9.2 High Contrast Mode

Maintained from current implementation via `useAccessibility` hook:

- Background: `#000000`
- Text: `#ffffff`, secondary `#e0e0e0`
- Borders/focus: `#ffff00`

### 9.3 Text Size Options

Three tiers (maintained from current):

- Small: base 14px
- Medium: base 16px (default)
- Large: base 18px

---

## 10. Implementation — CSS Tokens

All tokens defined in `packages/shared/styles/theme.css` via Tailwind v4 `@theme`:

```css
@theme {
  /* Brand orange scale */
  --color-kvenno-orange-50: #fff7f0;
  --color-kvenno-orange-100: #ffead8;
  --color-kvenno-orange-200: #ffd4b0;
  --color-kvenno-orange-300: #ffb678;
  --color-kvenno-orange-400: #ff9545;
  --color-kvenno-orange: #f36b22;
  --color-kvenno-orange-600: #d35a15;
  --color-kvenno-orange-700: #b04510;
  --color-kvenno-orange-800: #8c370d;
  --color-kvenno-orange-900: #6a2a0a;

  /* Warm neutrals */
  --color-warm-50: #faf9f7;
  --color-warm-100: #f5f3f0;
  --color-warm-200: #e8e4df;
  --color-warm-300: #d4cec7;
  --color-warm-400: #a69d93;
  --color-warm-500: #7a7168;
  --color-warm-600: #5c534a;
  --color-warm-700: #443d36;
  --color-warm-800: #2e2823;
  --color-warm-900: #1c1813;

  /* Semantic */
  --color-success: #16a34a;
  --color-success-light: #dcfce7;
  --color-warning: #d97706;
  --color-warning-light: #fef3c7;
  --color-error: #dc2626;
  --color-error-light: #fee2e2;
  --color-info: #2563eb;
  --color-info-light: #dbeafe;

  /* Typography */
  --font-heading: 'Plus Jakarta Sans', system-ui, sans-serif;
  --font-sans: 'DM Sans', system-ui, sans-serif;

  /* Radius */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 20px;

  /* Shadows (warm-tinted) */
  --shadow-sm: 0 1px 2px rgba(28, 24, 19, 0.06);
  --shadow-md: 0 2px 8px rgba(28, 24, 19, 0.08);
  --shadow-lg: 0 4px 16px rgba(28, 24, 19, 0.1);
  --shadow-xl: 0 8px 24px rgba(28, 24, 19, 0.12);
  --shadow-orange: 0 4px 14px rgba(243, 107, 34, 0.2);

  /* Transitions */
  --transition-fast: 100ms;
  --transition-normal: 200ms;
  --transition-slow: 300ms;
}
```

### 10.2 Font Loading

**SPAs** (landing, lab-reports, islenskubraut) — preconnect + Google Fonts link:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap"
  rel="stylesheet"
/>
```

**Games** (single-file HTML) — imported in `game-base.css`, inlined by vite-plugin-singlefile. Expected ~80–120KB per game.

### 10.3 Migration Map

| Current class/token | New class/token               | Notes                              |
| ------------------- | ----------------------------- | ---------------------------------- |
| `text-slate-*`      | `text-warm-*`                 | All slate → warm                   |
| `bg-slate-*`        | `bg-warm-*`                   | All slate → warm                   |
| `border-slate-*`    | `border-warm-*`               | All slate → warm                   |
| `rounded-xl` (12px) | `rounded-lg` (14px via token) | Cards get slightly larger radius   |
| `rounded-btn` (8px) | `rounded-md` (10px via token) | Buttons get slightly larger radius |
| `shadow-card`       | `shadow-md`                   | Standardized names                 |
| `shadow-card-hover` | `shadow-orange`               | Orange hover glow                  |
| `shadow-elevated`   | `shadow-lg`                   | Elevated surfaces                  |
| `font-sans` (Inter) | `font-sans` (DM Sans)         | Automatic via theme                |
| N/A                 | `font-heading`                | New: Plus Jakarta Sans             |
| `duration-300`      | `duration-normal` (200ms)     | Faster transitions                 |

### 10.4 What Stays the Same

- All application logic, game mechanics, API endpoints
- React component structure (only className props change)
- Build system (Vite, vite-plugin-singlefile)
- Routing architecture
- LocalStorage keys/data
- Server-side code
- Azure AD auth flow

---

## Appendix: Visual Reference

### Color Palette Overview

```
BRAND ORANGE
  50 ░░░░ #fff7f0    100 ░░░░ #ffead8    200 ▒▒▒▒ #ffd4b0
 300 ▒▒▒▒ #ffb678    400 ▓▓▓▓ #ff9545    500 ████ #f36b22 ← PRIMARY
 600 ████ #d35a15    700 ████ #b04510    800 ████ #8c370d
 900 ████ #6a2a0a

WARM NEUTRALS
  50 ░░░░ #faf9f7    100 ░░░░ #f5f3f0    200 ▒▒▒▒ #e8e4df
 300 ▒▒▒▒ #d4cec7    400 ▓▓▓▓ #a69d93    500 ████ #7a7168
 600 ████ #5c534a    700 ████ #443d36    800 ████ #2e2823
 900 ████ #1c1813

SEMANTIC
 success ████ #16a34a    warning ████ #d97706
   error ████ #dc2626       info ████ #2563eb

YEAR ACCENTS
   1. ár ████ #f36b22 (orange)
   2. ár ████ #0d9488 (teal)
   3. ár ████ #7c3aed (violet)

ÍSLENSKUBRAUT CATEGORIES
     Dýr ████ #2d6a4f    Matur ████ #92400e
   Farar ████ #1e40af  Manneskja ████ #9a3412
   Staðir ████ #5b21b6  Klæðnaður ████ #0e7490
```

### Typography Specimen

```
Plus Jakarta Sans 800 — Námsvefur Kvennó (Display)
Plus Jakarta Sans 700 — Efnafræðileikir (Page Heading)
Plus Jakarta Sans 600 — Takmarkandi hvarfefni (Section)

DM Sans 400 — Velkomin á námsvef Kvennaskólans. Hér eru
verkfæri og leikir til að styrkja nám í efnafræði og íslensku.
Þetta er textapróf með séríslenskum stöfum: þ, ð, æ, ö.

DM Sans 500 — Labels, navigation items, emphasis
DM Sans 700 — Strong emphasis within body text
```
