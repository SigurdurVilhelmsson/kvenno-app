# Shared styles: phone variants and recipes

`theme.css` is imported by every app after `@import "tailwindcss"`. Beyond the `@theme` tokens it
defines three custom variants for the vertical-scroll pass
(`docs/plans/2026-09-23-vertical-scroll-design.md`). This file is the recipe book for them.

**Desktop (at least 640 px wide and taller than 500 px) never matches any of the three**, so a
class behind one of them cannot change a desktop layout.

| Variant       | Query                                                | Use it for                                                             |
| ------------- | ---------------------------------------------------- | ---------------------------------------------------------------------- |
| `phone:`      | `(max-width: 639.98px)` **or** `(max-height: 500px)` | Compaction on any phone, portrait or on its side                       |
| `phone-land:` | `(orientation: landscape) and (max-height: 500px)`   | Switching a desktop two-column layout on early for a phone on its side |
| `pin:`        | `(max-width: 639.98px) and (min-height: 501px)`      | Only the pinned forms inside `TaskStrip` / `PinnedActions`             |

Scripts use the same queries: `PHONE_QUERY`, `PHONE_LAND_QUERY` and `PIN_QUERY` from
`@shared/utils`. `__tests__/phone-variant.test.ts` compiles `theme.css` with the repo's Tailwind
and holds the CSS and the constants together.

- **Keep the block form** (`@custom-variant name { @media … { @slot; } }`). The comma shorthand
  `(@media a, b)` compiles without a warning and silently drops the second query.
- All three are emitted after `sm:`/`md:`/`lg:` and after `max-md:`/`max-lg:`, in the order
  `phone:` → `phone-land:` → `pin:`, so each wins over the built-in breakpoints.
- Keep `pointer-coarse:` for touch-only target growth. `phone:` is layout.
- Visually removed headings and subtitles use `phone:sr-only`, never `phone:hidden`.
- `phone:contents` only on a role-less `div`. CSS `order` only on non-focusable blocks.

## Level/phase header fold (design P4)

Apply these classes to the **existing** header. Never duplicate the header for phones.

| Part                                      | Classes                                    |
| ----------------------------------------- | ------------------------------------------ |
| the header card                           | `phone:px-3 phone:py-2 phone:mb-3`         |
| the row                                   | `phone:flex-nowrap phone:gap-3`            |
| a controls wrapper (role-less `div` only) | `phone:contents`                           |
| the back link / `Til baka`                | `phone:order-1 phone:shrink-0`             |
| the title block                           | `phone:order-2 phone:flex-1 phone:min-w-0` |
| counters (`Dæmi n af N`, score)           | `phone:order-3`                            |
| the `h1`/`h2`                             | `phone:text-base`                          |
| a repeated subtitle or tagline            | `phone:sr-only`                            |
| the progress bar                          | `phone:h-1.5`                              |

Target: one row, at most 70 px tall (hess measured 208 → 82). The title **wraps** rather than
truncating, and counters stay, only smaller.

`order` moves the back link visually but not in the tab order. Where the back link is a button that
comes _after_ the title in the DOM, leave its position alone rather than reorder it with CSS
(focus order would then disagree with what is seen, WCAG 2.4.3); fold the rest.

**There is no shared `PhaseHeader` component.** The design assumed one for the six four-phase games
(einingakedjan, reynsluformulur, utfellingarhvorf, jafnvaegisfasti, syrufastinn, leysnijafnvaegi),
but each carries its own markup, and not all the same shape. reynsluformulur, utfellingarhvorf,
jafnvaegisfasti and leysnijafnvaegi put an `h2` and a `Til baka` button after it in one
`flex items-baseline justify-between` row (leysnijafnvaegi factors the button into
`src/components/BackButton.tsx`); syrufastinn (`← Til baka`) and einingakedjan (`← Aftur í
valmynd`) put the back button on its own line above the card. Fold each game's own markup with the
table above when that game is migrated. Extracting a shared component would change markup in six games at once for no layout
gain.

### The four-phase menu

- tagline `phone:text-base phone:mb-3`;
- phase cards `phone:p-3`, descriptions `phone:text-sm`;
- `Lokið` as an inline badge;
- in landscape a 2×2 grid, `phone-land:grid-cols-2`;
- an intro paragraph may move after the grid with `phone:order-last` **only if it is not teaching**
  and contains nothing focusable. A teaching blurb stays first and costs one scroll. Check each
  game's text before moving it: a screen reader still reads it first (WCAG 1.3.2).

## Pinned target and actions (design P7, P8)

`TaskStrip` and `PinnedActions` from `@shared/components` wrap the game's **own** elements — never
a copy. They pin only on a portrait phone (`pin:`), and only while all of these hold:

- the strip and the bar together take at most **28 %** of `visualViewport.height`
  (`PIN_BUDGET`). Re-measured with a `ResizeObserver` and on `visualViewport` resize, so large text,
  a short screen, the keyboard and pinch-zoom all unpin them;
- the screen has **no text input** (`input` other than range/checkbox/radio/button, `textarea`,
  `[contenteditable]`). Pinning on a typed screen **throws in development and tests** and renders
  unpinned in production.

Anywhere else — desktop, landscape, jsdom — the wrapper is `display: contents` and the layout is
exactly what it was without it.

While pinned:

- the strip is `position: sticky` under the site header and carries `data-pinned-top`; the bar is
  `position: sticky; bottom: 0` inside the task card and carries `data-pinned-bottom`.
  `usableArea()` in `@shared/utils` subtracts both;
- `<html>` gets `--pin-header-h`, `--pin-strip-h` and `--pin-bar-h`, and `theme.css` turns them into
  `scroll-padding-top`/`-bottom` under `pin:`, so Tab never leaves focus under a pin (WCAG 2.4.11).
  They are removed as soon as nothing is pinned;
- `PinnedActions`' `status` renders as an `aria-hidden` copy of the running quantity. **Values
  only, never a verdict.** It does not exist when unpinned, so tests and screen readers see the
  in-flow readout only.

Pass extra pinned-only classes through `pinnedClassName`, each prefixed with `pin:` so turning the
phone drops them before React re-renders.

**Use them only where the design names them** (§4) and the measurement justifies it: the primary
action still more than one screen from its question after compaction and anchoring, no text input,
and short feedback — never pin a Næsta over unread teaching feedback. No pins in landscape.

`env(safe-area-inset-bottom)` in the bar resolves to 0 today: no game's viewport meta has
`viewport-fit=cover`, and the design keeps it that way.

Wrap **elements**, not bare text: unpinned, the wrapper has no box of its own, so its height in the
flow is measured as the span of its child elements' boxes, and a bare text node is not counted.
