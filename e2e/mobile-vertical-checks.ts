import { readFileSync } from 'node:fs';

import { test, expect, type Locator, type Page } from '@playwright/test';
import ts from 'typescript';

import type { GameScreen, LoopCheck, LoopViewport, ScreenStep } from './mobile-game-screens';
import { describeSpec, locate, runStep } from './screen-steps';

/**
 * The vertical-scroll guarantees of docs/plans/2026-09-23-vertical-scroll-design.md
 * §6.2, as a function that declares the tests for a set of recorded screens.
 * mobile-vertical.spec.ts calls it with GAME_SCREENS; it lives outside the spec
 * so a scratch copy of the screens (a loop written only to prove an assertion
 * can fail) can be run through exactly the same checks.
 *
 * Every screen with a `loop` is replayed from a fresh load at the phone
 * viewports, with touch and reduced motion, and `Math.random` seeded so a
 * shuffle is the same on every run.
 *
 * "Visible" means at least 90 % of the element's box lies inside the usable
 * area — the band `usableArea()` in packages/shared/utils/reveal.ts computes,
 * below the sticky header and anything pinned. That function is not copied: its
 * source is read from reveal.ts and injected into the page, so the test and the
 * games measure with one ruler. Two refinements, both needed for the rule to
 * mean anything: an element taller than the band counts as visible when it fills
 * 90 % of the band, and an element inside the header or a pinned region is
 * measured against the whole viewport, since the usable area is by definition
 * what those cover.
 */

export const VIEWPORTS: Record<LoopViewport, { width: number; height: number }> = {
  android: { width: 360, height: 640 },
  iphone: { width: 390, height: 664 },
  se: { width: 375, height: 548 },
  landscape: { width: 740, height: 340 },
};

/**
 * Landscape phones wider than `md` (iPhone 14/15 on its side): the desktop
 * two-column layouts turn on by width here while `phone:` also matches. A smoke
 * run — reachable and no sideways scroll — not a loop guarantee (§2 P1 Critic).
 */
export const SMOKE_VIEWPORT = { width: 844, height: 390 };

/** The `pin:` variant's layout: a portrait phone. Where pinned regions may stick. */
const isPinViewport = (vp: { width: number; height: number }) => vp.width < 640 && vp.height > 500;

/** Height the typed-screen data must fit in above the input (§6.2.8): 640 minus a soft keyboard. */
const TYPED_BUDGET = 352;

/** Share of the viewport pinned regions may take at 200 % text (P8). */
const PIN_BUDGET = 0.28;

const CHROMIUM_ONLY = '@chromium-only';

/** How long to wait for an element a loop names before failing, not the test's 30 s. */
const SHORT = 5000;

/** One manual scroll: a flick of this share of the usable band. */
const FLICK = 0.8;

// ─── the page-side ruler ────────────────────────────────────────────────────

/**
 * `isPinned` and `usableArea` from reveal.ts, transpiled to plain JS. Throws
 * if reveal.ts no longer has them where expected, rather than measuring with
 * a stale copy.
 */
function usableAreaSource(): string {
  const file = new URL('../packages/shared/utils/reveal.ts', import.meta.url);
  const src = readFileSync(file, 'utf8');
  const start = src.indexOf('function isPinned(');
  const end = src.indexOf('\ntype Target =');
  if (start < 0 || end < 0 || !src.slice(start, end).includes('export function usableArea(')) {
    throw new Error('reveal.ts: could not find isPinned/usableArea to inject into the page');
  }
  const ts_ = src.slice(start, end).replace('export function usableArea(', 'function usableArea(');
  return ts.transpileModule(ts_, { compilerOptions: { target: ts.ScriptTarget.ES2020 } })
    .outputText;
}

/** A small deterministic PRNG (mulberry32), so shuffles repeat run to run. */
const SEED_RANDOM = `
  (() => {
    let s = 0x2f6b2e1d;
    Math.random = () => {
      s |= 0; s = (s + 0x6d2b79f5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  })();
`;

function rulerScript(): string {
  return `
  (() => {
    ${usableAreaSource()}
    const PINNED = '[data-pinned-top],[data-pinned-bottom],header';
    function band(el) {
      const vv = window.visualViewport;
      if (el.closest(PINNED)) {
        const top = vv ? vv.offsetTop : 0;
        return { top, bottom: top + (vv ? vv.height : window.innerHeight) };
      }
      return usableArea();
    }
    function visible(el) {
      if (!el || !el.isConnected) return false;
      if (el.checkVisibility && !el.checkVisibility({ visibilityProperty: true })) return false;
      const r = el.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0) return false;
      const b = band(el);
      const vv = window.visualViewport;
      const left = vv ? vv.offsetLeft : 0;
      const right = left + (vv ? vv.width : window.innerWidth);
      const h = Math.max(0, Math.min(r.bottom, b.bottom) - Math.max(r.top, b.top));
      const w = Math.max(0, Math.min(r.right, right) - Math.max(r.left, left));
      const bandH = b.bottom - b.top;
      const fy = r.height > bandH ? h / bandH : h / r.height;
      const fx = r.width > right - left ? w / (right - left) : w / r.width;
      return fx >= 0.9 && fy >= 0.9;
    }
    /** One flick towards el; false when the page cannot move that way. */
    function flickTowards(el, share) {
      const a = usableArea();
      const r = el.getBoundingClientRect();
      const step = share * (a.bottom - a.top);
      let dy = 0;
      if (r.bottom > a.bottom) dy = Math.min(step, r.bottom - a.bottom + 8);
      else if (r.top < a.top) dy = Math.max(-step, r.top - a.top - 8);
      const before = window.scrollY;
      window.scrollBy({ top: dy, behavior: 'instant' });
      return Math.abs(window.scrollY - before) >= 1;
    }
    function describe(el) {
      if (!el || el === document.body) return 'body';
      const role = el.getAttribute('role');
      const text = (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 40);
      return el.tagName.toLowerCase() + (role ? '[role=' + role + ']' : '') + ' "' + text + '"';
    }
    window.__vs = { usableArea, visible, flickTowards, describe };
  })();
  `;
}

interface Ruler {
  usableArea(): { top: number; bottom: number };
  visible(el: Element | null): boolean;
  flickTowards(el: Element, share: number): boolean;
  describe(el: Element | null): string;
}

declare global {
  interface Window {
    __vs: Ruler;
  }
}

// ─── node-side helpers ──────────────────────────────────────────────────────

const frames = (page: Page) =>
  page.evaluate(
    () => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())))
  );

async function isVisible(loc: Locator): Promise<boolean> {
  if ((await loc.count()) === 0) return false;
  return loc.evaluate((el) => window.__vs.visible(el));
}

/**
 * Manual scrolls needed to bring `loc` into the usable area, or -1 when it is
 * still not visible after `max` of them (or the page cannot move further).
 */
async function scrollsToReach(page: Page, loc: Locator, max: number): Promise<number> {
  for (let moves = 0; ; moves++) {
    if (await isVisible(loc)) return moves;
    if (moves >= max || (await loc.count()) === 0) return -1;
    const moved = await loc.evaluate((el, share) => window.__vs.flickTowards(el, share), FLICK);
    if (!moved) return -1;
    await frames(page);
  }
}

function horizontalOverflow(page: Page): Promise<number> {
  return page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
}

/** §6.2.9: no sideways page scroll, re-checked after every step. */
async function stepChecked(page: Page, step: ScreenStep, where: string): Promise<void> {
  await runStep(page, step);
  expect(
    await horizontalOverflow(page),
    `Sideways page scroll after ${JSON.stringify(step)} — ${where}`
  ).toBeLessThanOrEqual(1);
}

/** §6.2.9 after an action that is not a recorded step (a raw tap, a key). */
async function noSideways(page: Page, after: string, where: string): Promise<void> {
  expect(
    await horizontalOverflow(page),
    `Sideways page scroll after ${after} — ${where}`
  ).toBeLessThanOrEqual(1);
}

async function replay(page: Page, steps: ScreenStep[], where: string): Promise<void> {
  for (const step of steps) await stepChecked(page, step, where);
}

async function open(page: Page, url: string): Promise<void> {
  await page.addInitScript(SEED_RANDOM);
  await page.addInitScript(rulerScript());
  await page.goto(url);
  await page.waitForLoadState('networkidle');
}

/** Scrolls `loc` into the middle of the usable area if it is not in it, then returns its centre. */
async function centreOf(page: Page, loc: Locator): Promise<{ x: number; y: number }> {
  await loc.evaluate(
    (el) => {
      if (window.__vs.visible(el)) return;
      const a = window.__vs.usableArea();
      const r = el.getBoundingClientRect();
      window.scrollBy({ top: r.top + r.height / 2 - (a.top + a.bottom) / 2, behavior: 'instant' });
    },
    undefined,
    { timeout: SHORT }
  );
  await frames(page);
  const box = await loc.boundingBox({ timeout: SHORT });
  if (!box) throw new Error('No box to tap');
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

/**
 * A raw tap at a point: `page.touchscreen.tap`, never `locator.tap()`, which
 * scrolls sticky elements and honours scroll-padding before it taps. Firefox has
 * no touch emulation, so it clicks at the same point with the mouse.
 */
async function tapAt(page: Page, p: { x: number; y: number }, touch: boolean): Promise<void> {
  if (touch) await page.touchscreen.tap(p.x, p.y);
  else await page.mouse.click(p.x, p.y);
}

/** What identifies the current item: the prompt's text and the item heading's. */
function itemSignature(page: Page, loop: LoopCheck): Promise<string> {
  return locate(page, loop.prompt)
    .evaluate(
      (prompt) => {
        const start = document.querySelector('[data-item-start]');
        return `${prompt.textContent ?? ''}\u0000${start?.textContent ?? ''}`;
      },
      undefined,
      { timeout: SHORT }
    )
    .catch(() => '(prompt gone)');
}

async function pollVisible(loc: Locator, ms = 3000): Promise<boolean> {
  const until = Date.now() + ms;
  for (;;) {
    if (await isVisible(loc).catch(() => false)) return true;
    if (Date.now() > until) return false;
    await new Promise((r) => setTimeout(r, 50));
  }
}

/** Vertically sticky elements outside the shared Header (a column pinned sideways does not count). */
function verticalStickies(page: Page): Promise<string[]> {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll('body *'))
      .filter((el) => {
        if (el.closest('header')) return false;
        const cs = getComputedStyle(el);
        return cs.position === 'sticky' && (cs.top !== 'auto' || cs.bottom !== 'auto');
      })
      .map((el) => window.__vs.describe(el))
  );
}

// ─── the assertions, one function per §6.2 item ─────────────────────────────

/** §6.2.1: the screen opens at its heading, and focus is somewhere. */
async function checkArrival(page: Page, where: string): Promise<void> {
  const a = await page.evaluate(() => {
    const start = document.querySelector('[data-item-start]');
    let heading: Element | null = null;
    for (const h of Array.from(document.querySelectorAll('h1, h2'))) {
      if (!h.closest('header')) {
        heading = h;
        break;
      }
    }
    const active = document.activeElement;
    return {
      startVisible: start ? window.__vs.visible(start) : false,
      headingVisible: heading ? window.__vs.visible(heading) : false,
      what: window.__vs.describe(start ?? heading),
      active: window.__vs.describe(active),
      onBody: !active || active === document.body,
    };
  });
  expect(
    a.startVisible || a.headingVisible,
    `On arrival the screen heading / [data-item-start] (${a.what}) is not on screen — ${where}`
  ).toBe(true);
  expect(a.onBody, `On arrival focus is on <body> — ${where}`).toBe(false);
}

/** §6.2.2: the action within `max` manual scrolls; a pinned bar is sticky and on screen at the top. */
async function checkActionReachable(
  page: Page,
  loop: LoopCheck,
  max: number,
  pinLayout: boolean,
  where: string
): Promise<void> {
  if (pinLayout) {
    const bars = await page.evaluate(() => {
      const y = window.scrollY;
      window.scrollTo({ top: 0, behavior: 'instant' });
      const out = Array.from(
        document.querySelectorAll('[data-pinned-top],[data-pinned-bottom]')
      ).map((el) => {
        const r = el.getBoundingClientRect();
        return {
          what: window.__vs.describe(el),
          sticky: getComputedStyle(el).position === 'sticky',
          inside: r.top >= 0 && r.bottom <= window.innerHeight,
        };
      });
      window.scrollTo({ top: y, behavior: 'instant' });
      return out;
    });
    for (const b of bars) {
      expect(b.sticky, `Pinned region ${b.what} is not position: sticky — ${where}`).toBe(true);
      expect(b.inside, `Pinned region ${b.what} is off screen at scrollY 0 — ${where}`).toBe(true);
    }
  }
  const used = await scrollsToReach(page, locate(page, loop.action), max);
  expect(
    used,
    `Action ${describeSpec(loop.action)} not reachable within ${max} scroll(s) — ${where}`
  ).toBeGreaterThanOrEqual(0);
}

/** §6.2.3: each `together` group fits on screen at once. */
async function checkTogether(page: Page, loop: LoopCheck, where: string): Promise<void> {
  for (const group of loop.together ?? []) {
    const locs = group.map((s) => locate(page, s));
    for (const [i, l] of locs.entries()) {
      expect(await l.count(), `together: ${describeSpec(group[i])} not found — ${where}`).toBe(1);
    }
    const handles = await Promise.all(locs.map((l) => l.elementHandle()));
    await page.evaluate((els) => {
      const inFlow = els.filter(
        (el): el is NonNullable<typeof el> =>
          !!el && !el.closest('[data-pinned-top],[data-pinned-bottom]')
      );
      if (!inFlow.length) return;
      const top = Math.min(...inFlow.map((el) => el.getBoundingClientRect().top));
      window.scrollBy({ top: top - window.__vs.usableArea().top - 8, behavior: 'instant' });
    }, handles);
    await frames(page);
    const missing: string[] = [];
    for (const [i, l] of locs.entries())
      if (!(await isVisible(l))) missing.push(describeSpec(group[i]));
    expect(
      missing,
      `together: not on screen with the rest of [${group.map(describeSpec).join(', ')}] — ${where}`
    ).toEqual([]);
  }
}

/**
 * §6.2.4: after a raw tap on the action, the verdict and Næsta are on screen,
 * focus is in the feedback, 'Af hverju?' is open and the misconception shows.
 */
async function checkAfterCommit(
  page: Page,
  loop: LoopCheck,
  touch: boolean,
  where: string
): Promise<void> {
  for (const step of loop.answer) await stepChecked(page, step, where);
  await tapAt(page, await centreOf(page, locate(page, loop.action)), touch);
  await frames(page);
  await noSideways(page, 'commit', where);

  const verdict = locate(page, loop.verdict);
  const next = locate(page, loop.next);
  expect(
    await pollVisible(verdict),
    `After commit the verdict ${describeSpec(loop.verdict)} is not on screen — ${where}`
  ).toBe(true);

  // Focus is moved in a frame (or after an exit animation): poll for it.
  let focus = { ok: false, what: '' };
  const until = Date.now() + 3000;
  while (!focus.ok && Date.now() < until) {
    focus = await verdict.evaluate(
      (v, n) => {
        const a = document.activeElement;
        const region = v.closest('[role=group],[role=alert],[role=status],.feedback-panel') ?? v;
        const onBody = !a || a === document.body;
        const onNext = !!n && !!a && (a === n || n.contains(a));
        const inFeedback = !!a && (a.contains(v) || region.contains(a));
        return { ok: !onBody && !onNext && inFeedback, what: window.__vs.describe(a) };
      },
      await next.elementHandle({ timeout: 1000 }).catch(() => null),
      { timeout: SHORT }
    );
    if (!focus.ok) await page.waitForTimeout(50);
  }
  expect(
    focus.ok,
    `After commit focus is on ${focus.what}, not in the feedback region — ${where}`
  ).toBe(true);

  if (!loop.collapsedWhy) {
    const why = page.locator('.feedback-panel button[aria-expanded]', { hasText: 'Af hverju?' });
    for (let i = 0; i < (await why.count()); i++) {
      await expect(why.nth(i), `'Af hverju?' opened collapsed — ${where}`).toHaveAttribute(
        'aria-expanded',
        'true'
      );
    }
  }
  const misconception = page.locator('.feedback-panel div', {
    has: page.locator('> span', { hasText: 'Algeng villa' }),
  });
  for (let i = 0; i < (await misconception.count()); i++) {
    await expect(misconception.nth(i), `Misconception hidden — ${where}`).toBeVisible();
  }

  if (loop.teachingFeedback) {
    expect(
      await scrollsToReach(page, next, 1),
      `After commit ${describeSpec(loop.next)} is more than one scroll below the feedback — ${where}`
    ).toBeGreaterThanOrEqual(0);
  } else {
    expect(
      await pollVisible(next, 1000),
      `After commit ${describeSpec(loop.next)} is not on screen with the verdict — ${where}`
    ).toBe(true);
  }
}

/** §6.2.6: tabbing never puts the focused element under a pinned region. */
async function checkPinsNeverHideFocus(page: Page, where: string): Promise<void> {
  if ((await page.locator('[data-pinned-top],[data-pinned-bottom]').count()) === 0) return;
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur?.());
  const seen = new Set<string>();
  for (let i = 0; i < 80; i++) {
    await page.keyboard.press('Tab');
    await frames(page);
    const r = await page.evaluate(() => {
      const a = document.activeElement;
      if (!a || a === document.body) return { key: 'body', hidden: [] as string[] };
      const ar = a.getBoundingClientRect();
      const key = window.__vs.describe(a) + `@${Math.round(ar.top + window.scrollY)}`;
      const hidden = Array.from(document.querySelectorAll('[data-pinned-top],[data-pinned-bottom]'))
        .filter((p) => !p.contains(a))
        .filter((p) => {
          const pr = p.getBoundingClientRect();
          return (
            pr.height > 0 &&
            ar.top < pr.bottom &&
            ar.bottom > pr.top &&
            ar.left < pr.right &&
            ar.right > pr.left
          );
        })
        .map((p) => `${window.__vs.describe(a)} under ${window.__vs.describe(p)}`);
      return { key, hidden };
    });
    expect(r.hidden, `Pinned region hides the focused element — ${where}`).toEqual([]);
    if (seen.has(r.key)) break;
    seen.add(r.key);
  }
}

/** §6.2.7: at 200 % text, pinned regions stay within 28 % of the screen or unpin. */
async function checkPinBudget(page: Page, where: string): Promise<void> {
  if ((await page.locator('[data-pinned-top],[data-pinned-bottom]').count()) === 0) return;
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%';
  });
  await frames(page);
  await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const stuck = Array.from(
      document.querySelectorAll('[data-pinned-top],[data-pinned-bottom]')
    ).filter((el) => getComputedStyle(el).position === 'sticky');
    const total = stuck.reduce((s, el) => s + el.getBoundingClientRect().height, 0);
    return { total, limit: window.innerHeight };
  });
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '';
  });
  expect(
    r.total,
    `At 200 % text sticky pinned regions take ${Math.round(r.total)} px of ${r.limit} — ${where}`
  ).toBeLessThanOrEqual(PIN_BUDGET * r.limit);
}

/** §6.2.5: a double Enter or a double tap on the action never skips the feedback. */
async function checkAntiSkip(
  page: Page,
  loop: LoopCheck,
  how: 'enter' | 'tap',
  touch: boolean,
  where: string
): Promise<void> {
  for (const step of loop.answer) await stepChecked(page, step, where);
  const before = await itemSignature(page, loop);
  const action = locate(page, loop.action);
  if (how === 'enter') {
    await action.focus({ timeout: SHORT });
    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter');
  } else {
    const p = await centreOf(page, action);
    await tapAt(page, p, touch);
    await page.waitForTimeout(150);
    await tapAt(page, p, touch);
  }
  const verdict = locate(page, loop.verdict);
  expect(
    await pollVisible(verdict, 1500),
    `Double ${how}: the verdict ${describeSpec(loop.verdict)} never came on screen — ${where}`
  ).toBe(true);
  const until = Date.now() + 450;
  while (Date.now() < until) {
    expect(
      await isVisible(verdict),
      `Double ${how}: the verdict left the screen within 400 ms — ${where}`
    ).toBe(true);
    await page.waitForTimeout(50);
  }
  expect(await itemSignature(page, loop), `Double ${how} advanced the item — ${where}`).toBe(
    before
  );
  await noSideways(page, `double ${how}`, where);
}

/** §6.2.8: typed screens carry no pins, the data sits close above the input, Enter commits. */
async function checkTyped(page: Page, loop: LoopCheck, where: string): Promise<void> {
  expect(
    await page.locator('[data-pinned-top],[data-pinned-bottom]').count(),
    `A typed screen carries a pinned region — ${where}`
  ).toBe(0);
  for (const group of loop.together ?? []) {
    const boxes = await Promise.all(
      group.map((s) => locate(page, s).boundingBox({ timeout: SHORT }))
    );
    const present = boxes.filter((b): b is NonNullable<typeof b> => !!b);
    expect(present.length, `together: an element is missing — ${where}`).toBe(group.length);
    const span =
      Math.max(...present.map((b) => b.y + b.height)) - Math.min(...present.map((b) => b.y));
    expect(
      span,
      `Typed: [${group.map(describeSpec).join(', ')}] span ${Math.round(span)} px, over the ${TYPED_BUDGET} px a keyboard leaves — ${where}`
    ).toBeLessThanOrEqual(TYPED_BUDGET);
  }
  const fills = loop.answer.filter((s): s is { fill: [string, string] } => 'fill' in s);
  expect(fills.length, `A typed loop's answer has no fill step — ${where}`).toBeGreaterThan(0);
  for (const step of loop.answer) await stepChecked(page, step, where);
  await page
    .locator(fills[fills.length - 1].fill[0])
    .first()
    .focus();
  await page.keyboard.press('Enter');
  expect(
    await pollVisible(locate(page, loop.verdict)),
    `Typed: Enter in the input did not commit — ${where}`
  ).toBe(true);
  await noSideways(page, 'Enter in the input', where);
}

// ─── the test declarations ──────────────────────────────────────────────────

function useViewport(vp: { width: number; height: number }): void {
  test.use({
    viewport: vp,
    contextOptions: { reducedMotion: 'reduce' },
    // Firefox cannot emulate isMobile (or touch); it replays with the mouse.
    isMobile: async ({ browserName }, provide) => provide(browserName === 'chromium'),
    hasTouch: async ({ browserName }, provide) => provide(browserName === 'chromium'),
  });
}

/** Declares the §6.2 tests for every screen in `screens` that has a `loop`. */
export function describeVerticalLoops(screens: Record<string, GameScreen[]>): void {
  for (const [game, gameScreens] of Object.entries(screens)) {
    const [year, slug] = game.split('/');
    const url = `/efnafraedi/${year}/games/${slug}.html`;
    let firefoxSampled = false;

    for (const screen of gameScreens) {
      const loop = screen.loop;
      if (!loop) continue;
      const viewports = loop.viewports ?? ['android', 'iphone'];

      test.describe(`${game}: ${screen.name}`, () => {
        test.describe.configure({ mode: 'parallel' });

        for (const name of viewports) {
          const vp = VIEWPORTS[name];
          test.describe(name, () => {
            useViewport(vp);
            // Firefox replays one loop per game: its first loop, first viewport.
            const tag = firefoxSampled ? [CHROMIUM_ONLY] : [];
            firefoxSampled = true;
            test('loop fits', { tag }, async ({ page, browserName }) => {
              const where = `${game} — ${screen.name} @ ${name}`;
              const pin = isPinViewport(vp) && !loop.typed;
              await open(page, url);
              await replay(page, screen.steps, where);
              await checkArrival(page, where);
              const max =
                name === 'landscape'
                  ? (loop.landscapeScrollsToAction ?? 3)
                  : (loop.scrollsToAction ?? 0);
              await checkActionReachable(page, loop, max, pin, where);
              await checkTogether(page, loop, where);
              await checkAfterCommit(page, loop, browserName === 'chromium', where);
              if (name === 'landscape') {
                expect(await verticalStickies(page), `Sticky in landscape — ${where}`).toEqual([]);
              }
              if (pin) {
                await checkPinsNeverHideFocus(page, where);
                await checkPinBudget(page, where);
              }
            });
          });
        }

        test.describe('anti-skip', () => {
          useViewport(VIEWPORTS[viewports[0]]);
          for (const how of ['enter', 'tap'] as const) {
            test(`double ${how}`, { tag: [CHROMIUM_ONLY] }, async ({ page, browserName }) => {
              const where = `${game} — ${screen.name} @ ${viewports[0]}, double ${how}`;
              await open(page, url);
              await replay(page, screen.steps, where);
              await checkAntiSkip(page, loop, how, browserName === 'chromium', where);
            });
          }
        });

        if (loop.typed) {
          test.describe('typed', () => {
            useViewport(VIEWPORTS.android);
            test(
              'no pins, data near the input, Enter commits',
              { tag: [CHROMIUM_ONLY] },
              async ({ page }) => {
                const where = `${game} — ${screen.name} @ android, typed`;
                await open(page, url);
                await replay(page, screen.steps, where);
                await checkTyped(page, loop, where);
              }
            );
          });
        }

        if (!viewports.includes('landscape')) {
          test.describe('landscape', () => {
            useViewport(VIEWPORTS.landscape);
            test('stays usable', { tag: [CHROMIUM_ONLY] }, async ({ page, browserName }) => {
              const where = `${game} — ${screen.name} @ landscape (usable)`;
              await open(page, url);
              await replay(page, screen.steps, where);
              const used = await scrollsToReach(
                page,
                locate(page, loop.action),
                loop.landscapeScrollsToAction ?? 3
              );
              expect(used, `Action not reachable in landscape — ${where}`).toBeGreaterThanOrEqual(
                0
              );
              for (const step of loop.answer) await stepChecked(page, step, where);
              await tapAt(
                page,
                await centreOf(page, locate(page, loop.action)),
                browserName === 'chromium'
              );
              expect(
                await pollVisible(locate(page, loop.verdict)),
                `Verdict not on screen after commit — ${where}`
              ).toBe(true);
              await noSideways(page, 'commit', where);
              expect(await verticalStickies(page), `Sticky in landscape — ${where}`).toEqual([]);
            });
          });
        }

        test.describe('844x390', () => {
          useViewport(SMOKE_VIEWPORT);
          test('smoke', { tag: [CHROMIUM_ONLY] }, async ({ page, browserName }) => {
            const where = `${game} — ${screen.name} @ 844x390`;
            await open(page, url);
            await replay(page, screen.steps, where);
            const used = await scrollsToReach(
              page,
              locate(page, loop.action),
              loop.landscapeScrollsToAction ?? 3
            );
            expect(used, `Action not reachable — ${where}`).toBeGreaterThanOrEqual(0);
            for (const step of loop.answer) await stepChecked(page, step, where);
            await tapAt(
              page,
              await centreOf(page, locate(page, loop.action)),
              browserName === 'chromium'
            );
            await expect(locate(page, loop.verdict), `No verdict — ${where}`).toBeVisible();
            await noSideways(page, 'commit', where);
          });
        });
      });
    }
  }
}
