#!/usr/bin/env node
/**
 * Desktop invariance for the vertical-scroll pass
 * (docs/plans/2026-09-23-vertical-scroll-design.md §6.3).
 *
 * The phone work must leave a 1280×800 desktop exactly as it was. This serves
 * two builds side by side — the base (the branch the PR starts from) and the
 * head — replays the same seeded states in both, and compares:
 *
 *  - **Geometry**: every element that carries its own text, plus every button,
 *    input, svg and img — tag, text, rounded box, font size and colour — and
 *    the document height. Must be identical.
 *  - **Pixels**: a full-page screenshot, live canvases masked. Must be
 *    byte-identical (skip with --no-png where a machine's font rendering is not
 *    stable between two runs).
 *  - **Behaviour**, which geometry cannot see: the page's scrollY once the
 *    state is reached, and the focused element. A changed scrollY fails — that
 *    is the P2 regression, a reveal that stopped (or started) moving a desktop
 *    page. A changed focus is reported, not failed: P3 deliberately moves focus
 *    to the feedback and to screen headings at every width; the report lists
 *    each change so it can be checked against that decision. Focus falling to
 *    <body> where the base had it somewhere does fail.
 *  - **Loops**: for every recorded screen with a `loop`, the loop is played at
 *    1280×800 (answer, click the action) and scrollY after the commit must match
 *    the base; the head's focus must be inside the feedback region (P3).
 *
 * Both builds are compared live in one run, on one machine, rather than
 * against a committed baseline: a committed PNG or geometry file breaks across
 * machines (font hinting, Chromium build) and would be regenerated on the PR
 * branch, where it proves nothing.
 *
 * The seeded states are the recorded paths in e2e/mobile-game-screens.ts —
 * every game's menu, level starts and answered states — replayed with the same
 * step semantics as the phone specs (e2e/screen-steps.ts) and `Math.random`
 * seeded, so a shuffle is the same in both builds.
 *
 * Usage (not in CI yet):
 *   pnpm build   # the head, into dist/
 *   git worktree add ../base <base-commit> && (cd ../base && pnpm install && pnpm build:games)
 *   node scripts/desktop-compare.mjs --base ../base/dist [--head dist]
 *        [--game 2-ar/hess-law] [--no-png] [--out <dir>] [--jobs 4]
 *
 * Exits 1 when any state differs, 0 when all are identical.
 */
import { createServer } from 'node:http';
import { createReadStream, existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

import { chromium } from '@playwright/test';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));
// Node strips the types from these two .ts modules; both have type-only imports.
const { GAME_SCREENS } = await import(join(repoRoot, 'e2e', 'mobile-game-screens.ts'));
const { runStep, locate } = await import(join(repoRoot, 'e2e', 'screen-steps.ts'));

const { values: args } = parseArgs({
  options: {
    base: { type: 'string' },
    head: { type: 'string', default: join(repoRoot, 'dist') },
    game: { type: 'string', multiple: true },
    'no-png': { type: 'boolean', default: false },
    out: { type: 'string', default: join(tmpdir(), 'desktop-compare') },
    jobs: { type: 'string', default: '4' },
    chromium: { type: 'string' },
  },
});

if (!args.base) {
  console.error('Usage: node scripts/desktop-compare.mjs --base <dist> [--head <dist>] …');
  process.exit(2);
}

const DESKTOP = { width: 1280, height: 800 };

/** Re-captures of a differing state before the difference counts. */
const RETRIES = 2;

/** Same PRNG as e2e/mobile-vertical-checks.ts, so the two builds shuffle alike. */
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

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

/** A static server for one dist/ directory on a free port. Games are plain files. */
function serve(dir) {
  const root = resolve(dir);
  if (!existsSync(join(root, 'efnafraedi'))) {
    throw new Error(`${root} does not look like a built dist/ (no efnafraedi/)`);
  }
  const server = createServer((req, res) => {
    const path = decodeURIComponent((req.url ?? '/').split('?')[0]);
    let file = resolve(root, `.${path}`);
    if (!file.startsWith(root)) {
      res.writeHead(403).end();
      return;
    }
    if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
    if (!existsSync(file)) {
      res.writeHead(404).end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME[extname(file)] ?? 'application/octet-stream' });
    createReadStream(file).pipe(res);
  });
  return new Promise((ok) =>
    server.listen(0, '127.0.0.1', () =>
      ok({ server, url: `http://127.0.0.1:${server.address().port}` })
    )
  );
}

/** Geometry of every element that carries its own text, or is a control/svg/img. */
function geometry(page) {
  return page.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll('body *')) {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
      if (!own && !/^(BUTTON|INPUT|SELECT|TEXTAREA|svg|IMG|CANVAS)$/.test(el.tagName)) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none') continue;
      out.push(
        `${el.tagName}|${(el.textContent || '').trim().slice(0, 24)}|` +
          `${Math.round(r.x)},${Math.round(r.y + scrollY)},${Math.round(r.width)}x${Math.round(r.height)}|` +
          `${cs.fontSize}|${cs.color}`
      );
    }
    return { list: out, docH: document.documentElement.scrollHeight };
  });
}

/**
 * Waits until scrollY has held still for three samples. Several games scroll
 * with `behavior: 'smooth'` whatever the reduced-motion setting, so a reading
 * taken mid-animation would differ between two identical builds.
 */
async function settleScroll(page) {
  let last = -1;
  let still = 0;
  for (let i = 0; i < 40 && still < 3; i++) {
    const y = await page.evaluate(() => window.scrollY);
    still = y === last ? still + 1 : 0;
    last = y;
    await page.waitForTimeout(100);
  }
}

/** scrollY and a description of the focused element. */
function behaviour(page) {
  return page.evaluate(() => {
    const a = document.activeElement;
    const onBody = !a || a === document.body;
    const text = onBody ? '' : (a.getAttribute('aria-label') || a.textContent || '').trim();
    const role = onBody ? '' : a.getAttribute('role') || '';
    return {
      scrollY: Math.round(window.scrollY),
      onBody,
      focus: onBody
        ? 'body'
        : `${a.tagName.toLowerCase()}${role ? `[role=${role}]` : ''} "${text.slice(0, 30)}"`,
    };
  });
}

/** Whether focus is inside the feedback region around the verdict (the P3 decision). */
function focusInFeedback(page, loop) {
  return locate(page, loop.verdict)
    .evaluate((v) => {
      const a = document.activeElement;
      if (!a || a === document.body) return false;
      const region = v.closest('[role=group],[role=alert],[role=status],.feedback-panel') ?? v;
      return a.contains(v) || region.contains(a);
    })
    .catch(() => false);
}

async function capture(browser, baseUrl, state, png) {
  const context = await browser.newContext({ viewport: DESKTOP, reducedMotion: 'reduce' });
  await context.addInitScript(SEED_RANDOM);
  const page = await context.newPage();
  const result = { error: null };
  try {
    await page.goto(`${baseUrl}${state.url}`);
    await page.waitForLoadState('networkidle');
    for (const [i, step] of state.steps.entries()) {
      try {
        await runStep(page, step);
      } catch (e) {
        throw new Error(`step ${i + 1} ${JSON.stringify(step)}: ${e.message.split('\n')[0]}`);
      }
    }
    await page.waitForTimeout(400);
    await settleScroll(page);
    result.behaviour = await behaviour(page);
    await page.mouse.move(1, 1); // no hover left on whatever was clicked last
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForTimeout(200);
    result.geometry = await geometry(page);
    if (png) {
      result.png = await page.screenshot({
        fullPage: true,
        animations: 'disabled',
        mask: [page.locator('canvas')],
      });
    }
    if (state.loop) {
      // Back where the state left the page, then play the loop as a mouse user would.
      await page.evaluate(
        (y) => window.scrollTo({ top: y, behavior: 'instant' }),
        result.behaviour.scrollY
      );
      for (const step of state.loop.answer) await runStep(page, step);
      await locate(page, state.loop.action).click();
      await page.waitForTimeout(600);
      await settleScroll(page);
      result.loop = {
        ...(await behaviour(page)),
        inFeedback: await focusInFeedback(page, state.loop),
      };
    }
  } catch (e) {
    result.error = e.message.split('\n')[0];
  } finally {
    await context.close();
  }
  return result;
}

function compare(state, base, head) {
  const problems = [];
  const notes = [];
  if (base.error || head.error) {
    if (base.error !== head.error) {
      problems.push(`replay: base ${base.error ?? 'ok'} / head ${head.error ?? 'ok'}`);
    } else notes.push(`replay failed in both builds: ${base.error}`);
    return { problems, notes };
  }
  const a = base.geometry.list;
  const b = head.geometry.list;
  const diffs = [];
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if (a[i] !== b[i]) diffs.push(`    - ${a[i] ?? '(none)'}\n    + ${b[i] ?? '(none)'}`);
  }
  if (diffs.length || base.geometry.docH !== head.geometry.docH) {
    problems.push(
      `geometry: ${diffs.length} element(s) differ, docH ${base.geometry.docH}/${head.geometry.docH}\n` +
        diffs.slice(0, 6).join('\n')
    );
  }
  if (base.png && head.png && Buffer.compare(base.png, head.png) !== 0) {
    problems.push('pixels: full-page PNG differs');
  }
  if (base.behaviour.scrollY !== head.behaviour.scrollY) {
    problems.push(`scrollY: base ${base.behaviour.scrollY}, head ${head.behaviour.scrollY}`);
  }
  if (base.behaviour.focus !== head.behaviour.focus) {
    (head.behaviour.onBody && !base.behaviour.onBody ? problems : notes).push(
      `focus: base ${base.behaviour.focus}, head ${head.behaviour.focus}`
    );
  }
  if (state.loop && base.loop && head.loop) {
    if (base.loop.scrollY !== head.loop.scrollY) {
      problems.push(
        `loop scrollY after commit: base ${base.loop.scrollY}, head ${head.loop.scrollY}`
      );
    }
    if (!head.loop.inFeedback) {
      problems.push(
        `loop focus after commit is ${head.loop.focus}, not in the feedback region (P3)`
      );
    }
  }
  return { problems, notes };
}

async function main() {
  const games = Object.entries(GAME_SCREENS).filter(
    ([game]) => !args.game?.length || args.game.includes(game)
  );
  const states = games.flatMap(([game, screens]) => {
    const [year, slug] = game.split('/');
    return screens.map((s) => ({
      game,
      name: s.name,
      url: `/efnafraedi/${year}/games/${slug}.html`,
      steps: s.steps,
      loop: s.loop,
    }));
  });
  if (!states.length) {
    console.error('No states selected.');
    process.exit(2);
  }

  const [base, head] = await Promise.all([serve(args.base), serve(args.head)]);
  const browser = await chromium.launch(
    args.chromium ? { executablePath: args.chromium } : undefined
  );
  mkdirSync(args.out, { recursive: true });
  const png = !args['no-png'];
  const jobs = Math.max(1, Number(args.jobs) || 1);
  const report = [];
  let next = 0;

  async function worker() {
    while (next < states.length) {
      const state = states[next++];
      let [b, h] = await Promise.all([
        capture(browser, base.url, state, png),
        capture(browser, head.url, state, png),
      ]);
      let { problems, notes } = compare(state, b, h);
      // A few recorded paths do not land on the same scroll position every run
      // in either build (a drag, an animation racing a click). A difference
      // counts only if it reproduces; one that goes away is reported as a note.
      for (let retry = 0; retry < RETRIES && problems.length; retry++) {
        const first = problems.map((p) => p.split('\n')[0]).join('; ');
        [b, h] = await Promise.all([
          capture(browser, base.url, state, png),
          capture(browser, head.url, state, png),
        ]);
        const again = compare(state, b, h);
        if (!again.problems.length) {
          problems = [];
          notes = [
            ...again.notes,
            `unstable: differed on an earlier run (${first}), same on retry`,
          ];
        } else ({ problems, notes } = again);
      }
      const label = `${state.game} — ${state.name}`;
      if (problems.length) {
        const stem = label.replace(/[^\w-]+/g, '_');
        if (b.png) writeFileSync(join(args.out, `${stem}.base.png`), b.png);
        if (h.png) writeFileSync(join(args.out, `${stem}.head.png`), h.png);
      }
      console.log(`${problems.length ? 'DIFFERS' : 'same   '}  ${label}`);
      for (const p of problems) console.log(`    ${p}`);
      for (const n of notes) console.log(`    note: ${n}`);
      report.push({ game: state.game, name: state.name, problems, notes });
    }
  }
  await Promise.all(Array.from({ length: jobs }, worker));
  await browser.close();
  base.server.close();
  head.server.close();

  report.sort((x, y) => `${x.game}${x.name}`.localeCompare(`${y.game}${y.name}`));
  writeFileSync(join(args.out, 'report.json'), JSON.stringify(report, null, 2));
  const differ = report.filter((r) => r.problems.length).length;
  const unstable = report.filter((r) => r.notes.some((n) => n.startsWith('unstable'))).length;
  const focusNotes = report.filter((r) => r.notes.some((n) => n.startsWith('focus'))).length;
  console.log(
    `\n${report.length} states, ${differ} differ, ${unstable} unstable, ${focusNotes} with a focus change to review` +
      ` (report and PNGs of differing states in ${args.out})`
  );
  process.exit(differ ? 1 : 0);
}

await main();
