/**
 * Recorded navigation paths to every main screen of every game, replayed by
 * mobile-games.spec.ts at phone width. Keyed `<year>/<slug>`, matching
 * scripts/build-games.mjs.
 *
 * Each path starts from a freshly loaded game (empty localStorage) and uses
 * stable navigation labels, never the text of a shuffled question. When a
 * game's navigation changes, re-record its paths rather than deleting them.
 */

export type ScreenStep =
  | { click: string }
  | { clickRole: [Parameters<import('@playwright/test').Page['getByRole']>[0], string] }
  | { css: string }
  | { fill: [string, string] }
  | { press: string }
  | { wait: number };

/**
 * How a `LoopCheck` names an element: by role and accessible name, by CSS, or
 * by visible text. Like the paths, use visible labels and accessible names —
 * a rename (a terminology sweep included) updates the spec in the same change.
 */
export type LocatorSpec =
  | { role: Parameters<import('@playwright/test').Page['getByRole']>[0]; name: string }
  | { css: string }
  | { text: string };

/** The phone viewports mobile-vertical.spec.ts knows by name. */
export type LoopViewport = 'android' | 'iphone' | 'se' | 'landscape';

/**
 * One play loop on a screen — prompt, control, commit, verdict, next — that
 * mobile-vertical.spec.ts holds to the vertical-scroll guarantees
 * (docs/plans/2026-09-23-vertical-scroll-design.md §6). Replayed after the
 * screen's own `steps`, from the state those steps leave.
 */
export interface LoopCheck {
  /** Accessible name / selector of the element that states the question or target. */
  prompt: LocatorSpec;
  /** The primary action before commit (Athuga/Svara/Staðfesta/Leysa…). */
  action: LocatorSpec;
  /** Steps that answer (any answer; wrong preferred, it yields the longest feedback). */
  answer: ScreenStep[];
  /** The verdict element that appears after commit. */
  verdict: LocatorSpec;
  /** The next action after commit (Næsta…). */
  next: LocatorSpec;
  /** Elements that must be co-visible for the loop to be playable (e.g. target + running sum). */
  together?: LocatorSpec[][];
  /** Viewports where the guarantees hold; default ['android','iphone']. SE/landscape opt in. */
  viewports?: LoopViewport[];
  /** Landscape always gets the weaker "usable" check (§6.2.10), opt-in or not. Default 3. */
  landscapeScrollsToAction?: number;
  /** Allowed manual scrolls before the action is reachable; default 0. */
  scrollsToAction?: number;
  /** Skips pinned assertions, adds keyboard ones. The answer must include a `fill` step. */
  typed?: boolean;
  /**
   * The feedback is teaching-length (§3 Feedback: read in full), so `next` may
   * be one scroll below the verdict after commit instead of on screen with it.
   */
  teachingFeedback?: boolean;
  /**
   * With `teachingFeedback`: how many manual scrolls `next` may be below the
   * verdict. Default 1. Only for feedback the design keeps as a long read
   * (§5: equilibrium-shifter's explanation), where Næsta stays at its foot.
   */
  teachingFeedbackScrolls?: number;
  /**
   * The commit swaps the whole screen for a separate feedback screen, so the
   * prompt leaves with it (gas-law-challenge). The anti-skip check then
   * asserts the prompt is gone — the feedback screen is still showing, not a
   * next item — instead of asserting it is unchanged.
   */
  commitLeavesScreen?: boolean;
  /**
   * The screen deliberately passes FeedbackPanel `defaultExpanded: false`
   * (molmassi Stig 2), so 'Af hverju?' is not required to open expanded.
   */
  collapsedWhy?: boolean;
  /**
   * For a loop whose `next` is not the item swap (a retry, a second check in the
   * same item, a choice on an explore screen): the steps that lead on from
   * pressing `next` to the real Næsta, and that Næsta. The item-swap check
   * (§3: the new item's top on screen, focus on it, never on <body>) then runs
   * on it. Every loop's `next` is pressed and must leave focus off <body>; this
   * adds the swap for the loops whose `next` does not swap.
   */
  advance?: { steps: ScreenStep[]; next: LocatorSpec };
  /**
   * A typed loop must name in `together` (or `typedTogether`) the data the
   * answer is typed from and the input, so §6.2.8 (both within the 352 px a soft keyboard leaves) is
   * checked. Where the design keeps them further apart, this is the reason,
   * citing the design section that accepts it; the loop then names no pair.
   */
  typedDataApart?: string;
  /**
   * The §6.2.8 pairs for a typed loop, where they differ from `together`: they
   * are measured once the answer steps have run, so on a multi-step screen they
   * can name a field (and the data it is typed from) that only the answer
   * brings up, which `together`, checked on arrival, cannot. Defaults to
   * `together`.
   */
  typedTogether?: LocatorSpec[][];
}

export interface GameScreen {
  name: string;
  steps: ScreenStep[];
  loop?: LoopCheck;
}

export const GAME_SCREENS: Record<string, GameScreen[]> = {
  '1-ar/dimensional-analysis': [
    {
      name: 'Valmynd',
      steps: [
        {
          wait: 200,
        },
      ],
    },
    {
      name: 'Stig 0 — reglurnar',
      steps: [
        {
          click: 'Markverðir stafir',
        },
      ],
    },
    {
      name: 'Stig 0 — talning, endurgjöf',
      steps: [
        {
          click: 'Markverðir stafir',
        },
        {
          click: 'Áfram í æfingu',
        },
        {
          css: 'button[aria-label="1"]',
        },
      ],
    },
    {
      name: 'Stig 1 — kynning',
      steps: [
        {
          click: 'Hugtök',
        },
      ],
    },
    {
      name: 'Stig 1 — vogin (jafngildi)',
      steps: [
        {
          click: 'Hugtök',
        },
        {
          click: 'Byrja!',
        },
        {
          css: 'button[aria-label="Draga frá 1 lítra"]',
        },
      ],
    },
    {
      name: 'Stig 1 — brotið (C2), villa',
      steps: [
        {
          click: 'Hugtök',
        },
        {
          click: 'Byrja!',
        },
        {
          css: 'button[aria-label="Bæta við 1 lítra"]',
        },
        {
          wait: 300,
        },
        {
          click: 'Næsta áskorun',
        },
        {
          clickRole: ['button', '1000 mL'],
        },
        {
          clickRole: ['button', '500 mL'],
        },
      ],
    },
    {
      name: 'Stig 2 — verkefni',
      steps: [
        {
          click: 'Beiting',
        },
        {
          click: 'Byrja æfingar',
        },
      ],
    },
    {
      name: 'Stig 2 — stuðull settur í keðju',
      steps: [
        {
          click: 'Beiting',
        },
        {
          click: 'Byrja æfingar',
        },
        {
          css: '.items-pool [data-item-id]',
        },
        {
          css: '[data-zone-id="conversion-chain"]',
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 2 — endurgjöf (smella-hamur)',
      steps: [
        {
          click: 'Beiting',
        },
        {
          click: 'Byrja æfingar',
        },
        {
          click: 'Skipta í smella-ham',
        },
        {
          css: 'button:has(div.text-blue-600)',
        },
        {
          fill: ['input[placeholder="Sláðu inn svar"]', '999'],
        },
        {
          click: 'Athuga svar',
        },
      ],
    },
    {
      name: 'Stig 3 — kynning',
      steps: [
        {
          click: 'Fullir útreikningar',
        },
      ],
    },
    {
      name: 'Stig 3 — áskorun',
      steps: [
        {
          click: 'Fullir útreikningar',
        },
        {
          click: 'Byrja áskoranir',
        },
      ],
    },
    {
      name: 'Stig 3 — endurgjöf',
      steps: [
        {
          click: 'Fullir útreikningar',
        },
        {
          click: 'Byrja áskoranir',
        },
        {
          css: 'main button.text-left, main label',
        },
        // The first problem is drawn at random, and a route-choice item has no
        // number field: then this fills the explanation, which the next step
        // overwrites.
        {
          fill: ['main input, main textarea', '999'],
        },
        {
          fill: ['main textarea', 'Ég umbreytti einingunum með stuðli.'],
        },
        {
          click: 'Senda inn',
        },
      ],
    },
    {
      name: 'Stig 0 — talning, leikur',
      steps: [
        {
          click: 'Markverðir stafir',
        },
        {
          click: 'Áfram í æfingu',
        },
      ],
      loop: {
        prompt: { css: '[data-item-start]' },
        action: { css: 'button[aria-label="1"]' },
        answer: [],
        verdict: { css: '#da-l0-verdict' },
        next: { role: 'button', name: 'Næsta' },
        viewports: ['android', 'iphone', 'se', 'landscape'],
      },
    },
    {
      name: 'Stig 0 — námundun, leikur',
      steps: [
        {
          click: 'Markverðir stafir',
        },
        {
          click: 'Áfram í æfingu',
        },
        {
          css: 'button[aria-label="1"]',
        },
        // "Næsta" ignores a press within 400 ms of appearing (P3's double-tap guard).
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Næsta'],
        },
        {
          css: 'button[aria-label="1"]',
        },
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Næsta'],
        },
        {
          css: 'button[aria-label="1"]',
        },
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Næsta'],
        },
        {
          css: 'button[aria-label="1"]',
        },
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Næsta'],
        },
        {
          css: 'button[aria-label="1"]',
        },
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Næsta'],
        },
        {
          css: 'button[aria-label="1"]',
        },
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Áfram'],
        },
      ],
      loop: {
        prompt: { css: '[data-item-start]' },
        action: { role: 'button', name: 'Svara' },
        answer: [{ fill: ['input[aria-label="Svarið þitt"]', '1200'] }],
        verdict: { css: '#da-l0-verdict' },
        next: { role: 'button', name: 'Næsta' },
        together: [[{ css: '[data-item-start]' }, { css: 'input[aria-label="Svarið þitt"]' }]],
        viewports: ['android', 'iphone', 'se', 'landscape'],
        typed: true,
      },
    },
    {
      name: 'Stig 1 — vogin (C1), leikur',
      steps: [
        {
          click: 'Hugtök',
        },
        {
          click: 'Byrja!',
        },
      ],
      loop: {
        prompt: { css: '[data-item-start]' },
        action: { css: 'button[aria-label="Bæta við 1 lítra"]' },
        answer: [],
        verdict: { css: '#da-l1-verdict' },
        next: { role: 'button', name: 'Næsta áskorun' },
        viewports: ['android', 'iphone', 'se'],
        // None at 360x640 and 390x664; the SE needs one.
        scrollsToAction: 1,
      },
    },
    {
      name: 'Stig 2 — verkefni, leikur',
      steps: [
        {
          click: 'Beiting',
        },
        {
          click: 'Byrja æfingar',
        },
      ],
      loop: {
        prompt: { css: '[data-item-start]' },
        action: { role: 'button', name: 'Athuga svar' },
        // Drag mode, the default: a factor tapped in the pool, then the chain.
        // The units then cancel on their own for 1,5 s, and the visualiser
        // changes height while they do; a student reads the result before
        // typing a value, so the loop does too.
        answer: [
          { css: '.items-pool [data-item-id]' },
          { css: '[data-zone-id="conversion-chain"]' },
          { wait: 1600 },
          { fill: ['input[placeholder="Sláðu inn svar"]', '999'] },
        ],
        // The verdict line itself. In landscape the whole panel is taller than
        // the half-screen revealSpan leaves a verdict in, so the panel's foot
        // can sit under the bottom edge while its verdict is being read.
        verdict: { css: '.feedback-panel p' },
        next: { role: 'button', name: 'Næsta verkefni' },
        viewports: ['android', 'iphone', 'se'],
        // The factors, the chain and the unit visualiser all sit above the
        // answer row: one scroll at 360x640 and 390x664, two on the SE.
        scrollsToAction: 2,
        typed: true,
        typedDataApart:
          'The factors the answer is computed from are the chain, at page y 602-652 at 360x640 once ' +
          'built, and the answer field is at 1 086-1 142, 540 px apart, with the Einingagreining ' +
          'panel between them. What Stig 2 shows on a phone is design §7.2, open for Siggi.',
      },
    },
    {
      name: 'Stig 3 — áskorun, leikur',
      steps: [
        {
          click: 'Fullir útreikningar',
        },
        {
          click: 'Byrja áskoranir',
        },
      ],
      loop: {
        prompt: { css: '[data-item-start]' },
        action: { role: 'button', name: 'Senda inn' },
        // With the seeded shuffle the first problem is a reverse item: a route
        // to choose, and no number to type.
        answer: [
          { css: 'main button.text-left' },
          { fill: ['main textarea', 'Ég umbreytti einingunum með stuðli.'] },
        ],
        verdict: { css: '#da-l3-verdict' },
        next: { role: 'button', name: 'Næsta áskorun' },
        viewports: ['android', 'iphone', 'se'],
        // One at 360x640 and 390x664, two on the shorter SE screen. Where
        // "Sýna vísbendingu" and "Senda inn" do not fit one line, "Senda inn"
        // wraps under the hint rather than squeezing, which costs a row.
        scrollsToAction: 2,
        // The feedback is the worked solution, read in full (§3 Feedback).
        teachingFeedback: true,
      },
    },
  ],
  '1-ar/lotukerfid': [
    {
      name: 'Valmynd',
      steps: [
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 1 — kennsla',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Þekkja frumefni'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 1 — spurning (lotukerfið eða valkostir)',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Þekkja frumefni'],
        },
        {
          clickRole: ['button', 'Byrja æfingar →'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 1 — vísbending',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Þekkja frumefni'],
        },
        {
          clickRole: ['button', 'Byrja æfingar →'],
        },
        {
          click: 'Vísbending',
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 1 — endurgjöf',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Þekkja frumefni'],
        },
        {
          clickRole: ['button', 'Byrja æfingar →'],
        },
        // A question ignores an answer within 400 ms of appearing (the guard against a
        // double tap on "Byrja æfingar" or "Næsta" answering it unread).
        {
          wait: 300,
        },
        {
          css: 'button.element-cell:not([disabled]), div.grid.grid-cols-2.max-w-lg > button',
        },
        {
          wait: 800,
        },
      ],
    },
    {
      name: 'Stig 1 — næsta spurning',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Þekkja frumefni'],
        },
        {
          clickRole: ['button', 'Byrja æfingar →'],
        },
        // A question ignores an answer within 400 ms of appearing (the guard against a
        // double tap on "Byrja æfingar" or "Næsta" answering it unread).
        {
          wait: 300,
        },
        {
          css: 'button.element-cell:not([disabled]), div.grid.grid-cols-2.max-w-lg > button',
        },
        {
          wait: 800,
        },
        {
          clickRole: ['button', 'Næsta spurning →'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 2 — kennsla',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Flokkar og lotubundnir eiginleikar'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 2 — spurning með vísbendingu',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Flokkar og lotubundnir eiginleikar'],
        },
        {
          clickRole: ['button', 'Byrja æfingar →'],
        },
        {
          click: 'Vísbending',
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 2 — endurgjöf',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Flokkar og lotubundnir eiginleikar'],
        },
        {
          clickRole: ['button', 'Byrja æfingar →'],
        },
        // A question ignores an answer within 400 ms of appearing (the guard against a
        // double tap on "Byrja æfingar" or "Næsta" answering it unread).
        {
          wait: 300,
        },
        {
          css: 'button.rounded-xl.border-2',
        },
        {
          wait: 800,
        },
      ],
    },
    {
      name: 'Stig 3 — kennsla',
      steps: [
        {
          clickRole: ['button', 'Stig 3: Atómbygging'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 3 — spurning',
      steps: [
        {
          clickRole: ['button', 'Stig 3: Atómbygging'],
        },
        {
          clickRole: ['button', 'Byrja æfingar →'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 3 — vísbending',
      steps: [
        {
          clickRole: ['button', 'Stig 3: Atómbygging'],
        },
        {
          clickRole: ['button', 'Byrja æfingar →'],
        },
        {
          click: 'Vísbending',
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 3 — endurgjöf',
      steps: [
        {
          clickRole: ['button', 'Stig 3: Atómbygging'],
        },
        {
          clickRole: ['button', 'Byrja æfingar →'],
        },
        // A question ignores an answer within 400 ms of appearing (the guard against a
        // double tap on "Byrja æfingar" or "Næsta" answering it unread).
        {
          wait: 300,
        },
        {
          css: 'input[type=number], button.element-cell:not([disabled])',
        },
        {
          press: '9',
        },
        {
          press: 'Enter',
        },
        {
          wait: 800,
        },
      ],
    },
    // The play loops (design §6.1). Math.random is seeded in mobile-vertical.spec.ts, so each
    // level opens on the same question every run: Stig 1 asks where kolefni (C) is, and the
    // loop taps vetni (H), a wrong cell; Stig 2 asks for an order by mass, and the loop picks
    // the first option, a wrong order; Stig 3 asks for the neutrons in helíum-4 and the loop
    // types 9.
    {
      name: 'Stig 1 — leikur',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Þekkja frumefni'],
        },
        {
          clickRole: ['button', 'Byrja æfingar →'],
        },
        // The answer is a tap, which the question ignores for 400 ms after it appears.
        {
          wait: 300,
        },
      ],
      loop: {
        prompt: { css: '[data-item-start]' },
        action: { css: 'button[aria-label^="Vetni (H)"]' },
        answer: [],
        verdict: { css: '.feedback-panel' },
        next: { role: 'button', name: 'Næsta spurning' },
        // The question and every period of the table on one screen.
        together: [[{ css: '[data-item-start]' }, { role: 'grid', name: 'Lotukerfið' }]],
        viewports: ['android', 'iphone', 'se', 'landscape'],
      },
    },
    {
      name: 'Stig 2 — leikur',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Flokkar og lotubundnir eiginleikar'],
        },
        {
          clickRole: ['button', 'Byrja æfingar →'],
        },
        // The answer is a tap, which the question ignores for 400 ms after it appears.
        {
          wait: 300,
        },
      ],
      loop: {
        prompt: { css: '[data-item-start]' },
        action: { css: 'div.max-w-2xl.grid > button' },
        answer: [],
        verdict: { css: '.feedback-panel' },
        next: { role: 'button', name: 'Næsta spurning' },
        viewports: ['android', 'iphone', 'se', 'landscape'],
        // On a phone the table sits between the question and the options, where it is read:
        // one downward scroll past it to the options.
        scrollsToAction: 1,
      },
    },
    {
      name: 'Stig 3 — leikur',
      steps: [
        {
          clickRole: ['button', 'Stig 3: Atómbygging'],
        },
        {
          clickRole: ['button', 'Byrja æfingar →'],
        },
      ],
      loop: {
        prompt: { css: '.animate-fade-in-up > p.font-bold' },
        action: { role: 'button', name: 'Athuga' },
        answer: [{ fill: ['input[type=number]', '9'] }],
        verdict: { css: '.feedback-panel' },
        next: { role: 'button', name: 'Næsta spurning' },
        together: [[{ css: '.animate-fade-in-up > p.font-bold' }, { css: 'input[type=number]' }]],
        viewports: ['android', 'iphone', 'se', 'landscape'],
        typed: true,
      },
    },
  ],
  '1-ar/nafnakerfid': [
    {
      name: 'Valmynd',
      steps: [
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 1 — regla 4 (dæmi)',
      steps: [
        {
          clickRole: ['button', 'Grunnreglur'],
        },
        {
          clickRole: ['button', 'Regla 4'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Stig 1 — upphitun, rangt svar',
      steps: [
        {
          clickRole: ['button', 'Grunnreglur'],
        },
        {
          clickRole: ['button', 'Regla 4'],
        },
        {
          clickRole: ['button', 'Hefja próf'],
        },
        {
          clickRole: ['button', 'Málmleysingi'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Stig 2 — skref 1',
      steps: [
        {
          clickRole: ['button', 'Æfing með leiðsögn'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 2 — skref 2',
      steps: [
        {
          clickRole: ['button', 'Æfing með leiðsögn'],
        },
        {
          clickRole: ['button', 'Sameind'],
        },
        {
          wait: 1900,
        },
      ],
    },
    {
      name: 'Stig 2 — skref 3 með vísbendingu',
      steps: [
        {
          clickRole: ['button', 'Æfing með leiðsögn'],
        },
        {
          clickRole: ['button', 'Sameind'],
        },
        {
          wait: 1900,
        },
        {
          clickRole: ['button', 'Ég skil'],
        },
        {
          clickRole: ['button', 'Vísbending'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 2 — rangt svar',
      steps: [
        {
          clickRole: ['button', 'Æfing með leiðsögn'],
        },
        {
          clickRole: ['button', 'Sameind'],
        },
        {
          wait: 1900,
        },
        {
          clickRole: ['button', 'Ég skil'],
        },
        {
          fill: ['input[type=text]', 'Brennisteinsheksaflúoríð'],
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Stig 3 — nafnareglur opnar',
      steps: [
        {
          clickRole: ['button', 'Byggja nöfn'],
        },
        {
          clickRole: ['button', 'Nafnareglur'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 3 — fjórir partar valdir',
      steps: [
        {
          clickRole: ['button', 'Byggja nöfn'],
        },
        {
          css: 'div.flex.flex-wrap.gap-2:not(.border-dashed) > button',
        },
        {
          css: 'div.flex.flex-wrap.gap-2:not(.border-dashed) > button',
        },
        {
          css: 'div.flex.flex-wrap.gap-2:not(.border-dashed) > button',
        },
        {
          css: 'div.flex.flex-wrap.gap-2:not(.border-dashed) > button',
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 3 — rangt svar',
      steps: [
        {
          clickRole: ['button', 'Byggja nöfn'],
        },
        {
          css: 'div.flex.flex-wrap.gap-2:not(.border-dashed) > button',
        },
        {
          clickRole: ['button', 'Athuga'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Stig 1 — upphitun, leikur',
      steps: [
        { clickRole: ['button', 'Grunnreglur'] },
        { clickRole: ['button', 'Regla 4'] },
        { clickRole: ['button', 'Hefja próf'] },
      ],
      loop: {
        prompt: { css: '[data-item-start]' },
        // The choice is the commit. The first element is a metal: a wrong answer.
        action: { role: 'button', name: 'Málmleysingi' },
        answer: [],
        verdict: { css: '#nk-wu-verdict' },
        next: { role: 'button', name: 'Næsta frumefni' },
        viewports: ['android', 'iphone', 'se', 'landscape'],
      },
    },
    {
      name: 'Stig 1 — próf, leikur',
      steps: [
        { clickRole: ['button', 'Grunnreglur'] },
        { clickRole: ['button', 'Regla 4'] },
        { clickRole: ['button', 'Hefja próf'] },
        // Eight warm-up elements, each answered and moved on from. "Næsta"
        // ignores a press within 400 ms of appearing (P3's double-tap guard).
        { clickRole: ['button', 'Málmur'] },
        { wait: 300 },
        { clickRole: ['button', 'Næsta frumefni'] },
        { clickRole: ['button', 'Málmur'] },
        { wait: 300 },
        { clickRole: ['button', 'Næsta frumefni'] },
        { clickRole: ['button', 'Málmur'] },
        { wait: 300 },
        { clickRole: ['button', 'Næsta frumefni'] },
        { clickRole: ['button', 'Málmur'] },
        { wait: 300 },
        { clickRole: ['button', 'Næsta frumefni'] },
        { clickRole: ['button', 'Málmur'] },
        { wait: 300 },
        { clickRole: ['button', 'Næsta frumefni'] },
        { clickRole: ['button', 'Málmur'] },
        { wait: 300 },
        { clickRole: ['button', 'Næsta frumefni'] },
        { clickRole: ['button', 'Málmur'] },
        { wait: 300 },
        { clickRole: ['button', 'Næsta frumefni'] },
        { clickRole: ['button', 'Málmur'] },
        { wait: 300 },
        { clickRole: ['button', 'Hefja próf'] },
      ],
      loop: {
        prompt: { css: '[data-item-start]' },
        // The choice is the commit, as in the warm-up.
        action: { role: 'button', name: 'B.' },
        answer: [],
        verdict: { css: '.feedback-panel p' },
        next: { role: 'button', name: 'Næsta spurning' },
        // On its side the feedback fills the screen and Næsta is one short
        // scroll below it (design §5); the landscape check still runs.
        viewports: ['android', 'iphone', 'se'],
      },
    },
    {
      name: 'Stig 2 — skref 3, leikur',
      steps: [
        { clickRole: ['button', 'Æfing með leiðsögn'] },
        { clickRole: ['button', 'Sameind'] },
        { wait: 1900 },
        { clickRole: ['button', 'Ég skil'] },
      ],
      loop: {
        prompt: { css: '[data-item-start]' },
        action: { role: 'button', name: 'Athuga svar' },
        answer: [{ fill: ['input[type=text]', 'Brennisteinsheksaflúoríð'] }],
        verdict: { css: '#nk-l2-verdict' },
        next: { role: 'button', name: 'Næsta efnasamband' },
        together: [[{ css: '[data-item-start]' }, { css: 'input[type=text]' }]],
        viewports: ['android', 'iphone', 'se', 'landscape'],
        typed: true,
      },
    },
    {
      name: 'Stig 3 — leikur',
      steps: [{ clickRole: ['button', 'Byggja nöfn'] }],
      loop: {
        prompt: { css: '[data-item-start]' },
        action: { role: 'button', name: 'Athuga' },
        answer: [
          { css: 'div.flex.flex-wrap.gap-2:not(.border-dashed) > button' },
          { css: 'div.flex.flex-wrap.gap-2:not(.border-dashed) > button' },
          { css: 'div.flex.flex-wrap.gap-2:not(.border-dashed) > button' },
        ],
        verdict: { css: '.feedback-panel p' },
        next: { role: 'button', name: 'Næsta efni' },
        viewports: ['android', 'iphone', 'se', 'landscape'],
      },
    },
  ],
  '1-ar/molmassi': [
    {
      name: 'Valmynd',
      steps: [
        {
          wait: 200,
        },
      ],
    },
    {
      name: 'Stig 1 — kennsla',
      steps: [
        {
          click: 'Stig 1: Mólmassi',
        },
        {
          click: 'Sjáum dæmi',
        },
        {
          click: 'Eitt dæmi til',
        },
      ],
    },
    {
      name: 'Stig 1 — leikur',
      steps: [
        {
          click: 'Stig 1: Mólmassi',
        },
        {
          click: 'Sjáum dæmi',
        },
        {
          click: 'Eitt dæmi til',
        },
        {
          click: 'byrja æfingar',
        },
      ],
      loop: {
        prompt: { css: '#molmassi-compound' },
        action: { role: 'button', name: 'Athuga' },
        answer: [{ fill: ['input[placeholder="t.d. 18,02"]', '1'] }],
        verdict: { css: '.feedback-panel' },
        next: { role: 'button', name: 'Næsta dæmi' },
        together: [[{ css: '#molmassi-compound' }, { css: 'input[placeholder="t.d. 18,02"]' }]],
        // On its side the phone shows the verdict at the top of the answer
        // column and the student reads down the breakdown to Næsta (a §5
        // landscape residual); the "stays usable" check still runs there.
        viewports: ['android', 'iphone', 'se'],
        typed: true,
      },
    },
    {
      name: 'Stig 1 — dæmi með vísbendingu',
      steps: [
        {
          click: 'Stig 1: Mólmassi',
        },
        {
          click: 'Sjáum dæmi',
        },
        {
          click: 'Eitt dæmi til',
        },
        {
          click: 'byrja æfingar',
        },
        {
          click: 'Vísbending',
        },
      ],
    },
    {
      name: 'Stig 1 — endurgjöf og útreikningur',
      steps: [
        {
          click: 'Stig 1: Mólmassi',
        },
        {
          click: 'Sjáum dæmi',
        },
        {
          click: 'Eitt dæmi til',
        },
        {
          click: 'byrja æfingar',
        },
        {
          fill: ['input[placeholder="t.d. 18,02"]', '1'],
        },
        {
          clickRole: ['button', 'Athuga'],
        },
      ],
    },
    {
      name: 'Stig 1 — lotukerfið, frumefni valið',
      steps: [
        {
          click: 'Stig 1: Mólmassi',
        },
        {
          click: 'Sjáum dæmi',
        },
        {
          click: 'Eitt dæmi til',
        },
        {
          click: 'byrja æfingar',
        },
        {
          clickRole: ['button', 'Lotukerfið'],
        },
        {
          css: '[role=dialog] .aspect-square button',
        },
      ],
    },
    {
      name: 'Stig 1 — lotukerfið, listi',
      steps: [
        {
          click: 'Stig 1: Mólmassi',
        },
        {
          click: 'Sjáum dæmi',
        },
        {
          click: 'Eitt dæmi til',
        },
        {
          click: 'byrja æfingar',
        },
        {
          clickRole: ['button', 'Lotukerfið'],
        },
        {
          click: 'Listi',
        },
      ],
    },
    {
      name: 'Stig 2 — kennsla',
      steps: [
        {
          click: 'Stig 2: Mól-umbreytingar',
        },
      ],
    },
    {
      name: 'Stig 2 — dæmi',
      steps: [
        {
          click: 'Stig 2: Mól-umbreytingar',
        },
        {
          click: 'Byrja æfingar',
        },
      ],
      loop: {
        prompt: { css: '#molmassi-l2-question' },
        action: { role: 'button', name: 'Svara' },
        answer: [{ fill: ['input[placeholder="Svar..."]', '99999'] }],
        verdict: { css: '.feedback-panel' },
        next: { role: 'button', name: 'Næsta dæmi' },
        together: [[{ css: '#molmassi-l2-question' }, { css: 'input[placeholder="Svar..."]' }]],
        // On its side the phone shows the verdict at the top of the question
        // column and Næsta one short scroll below the worked solution (a §5
        // landscape residual); the "stays usable" check still runs there.
        viewports: ['android', 'iphone', 'se'],
        typed: true,
        collapsedWhy: true,
      },
    },
    {
      name: 'Stig 2 — endurgjöf',
      steps: [
        {
          click: 'Stig 2: Mól-umbreytingar',
        },
        {
          click: 'Byrja æfingar',
        },
        {
          fill: ['input[placeholder="Svar..."]', '99999'],
        },
        {
          clickRole: ['button', 'Svara'],
        },
      ],
    },
    {
      name: 'Stig 3 — leikur',
      steps: [
        {
          click: 'Stig 3: Samþætt æfing',
        },
      ],
      loop: {
        prompt: { css: '[data-item-start]' },
        action: { role: 'button', name: 'Svara' },
        answer: [{ fill: ['input[placeholder^="t.d. 2,5e20"]', '99999'] }],
        verdict: { css: '.feedback-panel' },
        next: { role: 'button', name: 'Næsta' },
        together: [[{ css: '[data-item-start]' }, { css: 'input[placeholder^="t.d. 2,5e20"]' }]],
        viewports: ['android', 'iphone', 'se', 'landscape'],
        typed: true,
      },
    },
    {
      name: 'Stig 3 — dæmi, ógilt svar',
      steps: [
        {
          click: 'Stig 3: Samþætt æfing',
        },
        {
          fill: ['input[placeholder^="t.d. 2,5e20"]', 'abc'],
        },
        {
          clickRole: ['button', 'Svara'],
        },
      ],
    },
    {
      name: 'Stig 3 — endurgjöf og lausnarleið',
      steps: [
        {
          click: 'Stig 3: Samþætt æfing',
        },
        {
          fill: ['input[placeholder^="t.d. 2,5e20"]', '99999'],
        },
        {
          clickRole: ['button', 'Svara'],
        },
      ],
    },
    {
      name: 'Stig 3 — lotukerfið',
      steps: [
        {
          click: 'Stig 3: Samþætt æfing',
        },
        {
          clickRole: ['button', 'Lotukerfið'],
        },
      ],
    },
  ],
  '1-ar/reynsluformulur': [
    {
      name: 'Valmynd',
      steps: [
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Kanna — tafla',
      steps: [
        {
          clickRole: ['button', 'Kanna'],
        },
      ],
      loop: {
        prompt: { css: 'main h2' },
        // The last compound in the list; the table and its sentence open under it.
        action: { role: 'button', name: 'Magnesíumfosfat' },
        answer: [],
        verdict: { text: 'Hér fer það saman' },
        // The list stays on screen with the table and the sentence, for the next
        // compound. On the SE only the table and the sentence fit (design §5).
        next: { role: 'button', name: 'Vetnisperoxíð' },
        viewports: ['android', 'iphone', 'landscape'],
      },
    },
    {
      name: 'Kanna — Magnesíumfosfat valið',
      steps: [
        {
          clickRole: ['button', 'Kanna'],
        },
        {
          clickRole: ['button', 'Magnesíumfosfat'],
        },
      ],
    },
    {
      name: 'Valmynd eftir Kanna (Lokið)',
      steps: [
        {
          clickRole: ['button', 'Kanna'],
        },
        {
          clickRole: ['button', 'Áfram í Skilja'],
        },
      ],
    },
    {
      name: 'Skilja — fyrsta súla',
      steps: [
        {
          clickRole: ['button', 'Skilja'],
        },
        // "Næsta súla" ignores a press within 400 ms of appearing or of opening a
        // column, as every Næsta does; a student reads the column first.
        {
          wait: 300,
        },
      ],
      loop: {
        prompt: { css: 'main h2' },
        action: { role: 'button', name: 'Næsta súla' },
        answer: [],
        // The caption of the column just added, which focus moves to.
        verdict: { text: 'Deildu massanum með mólmassa' },
        next: { role: 'button', name: 'Næsta súla' },
        viewports: ['android', 'iphone', 'se', 'landscape'],
      },
    },
    {
      name: 'Skilja — þriðja súla (1,5-gildran)',
      steps: [
        {
          clickRole: ['button', 'Skilja'],
        },
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Næsta súla'],
        },
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Næsta súla'],
        },
        {
          wait: 300,
        },
      ],
      // The last column: "Áfram í Æfa" takes the place of "Næsta súla", so a
      // double tap here is the one that could skip the answer column.
      loop: {
        prompt: { css: 'main h2' },
        action: { role: 'button', name: 'Næsta súla' },
        answer: [],
        verdict: { text: 'Margfaldaðu upp þangað til' },
        next: { role: 'button', name: 'Áfram í Æfa' },
      },
    },
    {
      name: 'Skilja — fjórar súlur (tafla skrunar)',
      steps: [
        {
          clickRole: ['button', 'Skilja'],
        },
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Næsta súla'],
        },
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Næsta súla'],
        },
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Næsta súla'],
        },
      ],
    },
    {
      name: 'Æfa — Mól',
      steps: [
        {
          clickRole: ['button', 'Æfa'],
        },
      ],
      loop: {
        prompt: { css: '[data-item-start]' },
        action: { role: 'button', name: 'Athuga' },
        answer: [
          { fill: ['input[aria-label="Mól fyrir H"]', '0'] },
          { fill: ['input[aria-label="Mól fyrir O"]', '0'] },
        ],
        verdict: { css: '#aefa-verdict' },
        next: { role: 'button', name: 'Reyna aftur' },
        together: [[{ css: '[data-item-start]' }, { css: 'input[aria-label="Mól fyrir O"]' }]],
        viewports: ['android', 'iphone', 'se', 'landscape'],
        typed: true,
      },
    },
    {
      name: 'Æfa — Mól rétt',
      steps: [
        {
          clickRole: ['button', 'Æfa'],
        },
      ],
      // A right column opens no verdict box: the ticks beside the fields are the
      // verdict, and "Næsta súla" takes the place of "Athuga".
      loop: {
        prompt: { css: '[data-item-start]' },
        action: { role: 'button', name: 'Athuga' },
        answer: [
          { fill: ['input[aria-label="Mól fyrir H"]', '5,883'] },
          { fill: ['input[aria-label="Mól fyrir O"]', '5,880'] },
        ],
        verdict: { css: '[role="group"][aria-labelledby="aefa-prompt"]' },
        next: { role: 'button', name: 'Næsta súla' },
        together: [[{ css: '[data-item-start]' }, { css: 'input[aria-label="Mól fyrir O"]' }]],
        viewports: ['android', 'iphone', 'se', 'landscape'],
        typed: true,
      },
    },
    {
      name: 'Æfa — Mól, röng svör',
      steps: [
        {
          clickRole: ['button', 'Æfa'],
        },
        {
          fill: ['input[aria-label="Mól fyrir H"]', '0'],
        },
        {
          fill: ['input[aria-label="Mól fyrir O"]', '0'],
        },
        {
          clickRole: ['button', 'Athuga'],
        },
      ],
    },
    {
      name: 'Æfa — Hlutfall, röng svör',
      steps: [
        {
          clickRole: ['button', 'Æfa'],
        },
        {
          fill: ['input[aria-label="Mól fyrir H"]', '5,883'],
        },
        {
          fill: ['input[aria-label="Mól fyrir O"]', '5,880'],
        },
        {
          clickRole: ['button', 'Athuga'],
        },
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Næsta súla'],
        },
        {
          fill: ['input[aria-label="Hlutfall fyrir H"]', '0'],
        },
        {
          fill: ['input[aria-label="Hlutfall fyrir O"]', '0'],
        },
        {
          clickRole: ['button', 'Athuga'],
        },
      ],
    },
    {
      name: 'Æfa — Vísitala rétt, reynsluformúla sýnd',
      steps: [
        {
          clickRole: ['button', 'Æfa'],
        },
        {
          fill: ['input[aria-label="Mól fyrir H"]', '5,883'],
        },
        {
          fill: ['input[aria-label="Mól fyrir O"]', '5,880'],
        },
        {
          clickRole: ['button', 'Athuga'],
        },
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Næsta súla'],
        },
        {
          fill: ['input[aria-label="Hlutfall fyrir H"]', '1'],
        },
        {
          fill: ['input[aria-label="Hlutfall fyrir O"]', '1'],
        },
        {
          clickRole: ['button', 'Athuga'],
        },
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Næsta súla'],
        },
        {
          fill: ['input[aria-label="Vísitala fyrir H"]', '1'],
        },
        {
          fill: ['input[aria-label="Vísitala fyrir O"]', '1'],
        },
        {
          clickRole: ['button', 'Athuga'],
        },
      ],
    },
    {
      name: 'Beita — spurning',
      steps: [
        {
          clickRole: ['button', 'Beita'],
        },
      ],
      loop: {
        prompt: { css: '[data-item-start]' },
        action: { role: 'button', name: 'Svara' },
        answer: [{ fill: ['#n-input', '3'] }],
        verdict: { css: '#beita-verdict' },
        next: { role: 'button', name: 'Næsta dæmi' },
        together: [[{ css: '[data-item-start]' }, { css: '#n-input' }]],
        viewports: ['android', 'iphone', 'se', 'landscape'],
        typed: true,
      },
    },
    {
      name: 'Beita — rangt svar',
      steps: [
        {
          clickRole: ['button', 'Beita'],
        },
        {
          fill: ['#n-input', '3'],
        },
        {
          clickRole: ['button', 'Svara'],
        },
      ],
    },
    {
      name: 'Beita — síðasta dæmi svarað (Klára)',
      steps: [
        {
          clickRole: ['button', 'Beita'],
        },
        {
          fill: ['#n-input', '2'],
        },
        {
          clickRole: ['button', 'Svara'],
        },
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Næsta dæmi'],
        },
        {
          fill: ['#n-input', '6'],
        },
        {
          clickRole: ['button', 'Svara'],
        },
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Næsta dæmi'],
        },
        {
          fill: ['#n-input', '6'],
        },
        {
          clickRole: ['button', 'Svara'],
        },
      ],
    },
  ],
  '1-ar/utfellingarhvorf': [
    {
      name: 'Valmynd',
      steps: [
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Kanna — áður en hellt er',
      steps: [
        {
          clickRole: ['button', 'Kanna'],
        },
      ],
      // The first look at the screen reads the list of pairs down to the pour
      // button; after a pour the list, the beakers and the result share the
      // screen, so the next pair is one tap away. On the SE only the beakers and
      // the result fit (design §5).
      loop: {
        prompt: { css: 'main h2' },
        action: { role: 'button', name: 'Helltu saman' },
        answer: [],
        verdict: { css: '#kanna-outcome' },
        next: { role: 'button', name: 'NaCl + KNO₃' },
        scrollsToAction: 1,
        viewports: ['android', 'iphone', 'landscape'],
      },
    },
    {
      name: 'Kanna — botnfall myndast',
      steps: [
        {
          clickRole: ['button', 'Kanna'],
        },
        {
          clickRole: ['button', 'Helltu saman'],
        },
      ],
    },
    {
      name: 'Kanna — ekkert botnfall',
      steps: [
        {
          clickRole: ['button', 'Kanna'],
        },
        {
          clickRole: ['button', 'NaCl + KNO₃'],
        },
        {
          clickRole: ['button', 'Helltu saman'],
        },
      ],
    },
    {
      name: 'Valmynd — Kanna lokið',
      steps: [
        {
          clickRole: ['button', 'Kanna'],
        },
        {
          clickRole: ['button', 'Helltu saman'],
        },
        {
          clickRole: ['button', 'NaCl + KNO₃'],
        },
        {
          clickRole: ['button', 'Helltu saman'],
        },
        {
          clickRole: ['button', 'Áfram í Skilja'],
        },
        {
          clickRole: ['button', 'Til baka'],
        },
      ],
    },
    {
      name: 'Skilja — fyrsta skref',
      steps: [
        {
          clickRole: ['button', 'Skilja'],
        },
        // "Næsta skref" ignores a press within 400 ms of appearing or of opening
        // a rung, as every Næsta does; a student reads the rung first.
        {
          wait: 500,
        },
      ],
      // The first look reads the ladder's first rung down to the button.
      loop: {
        prompt: { css: 'main h2' },
        action: { role: 'button', name: 'Næsta skref' },
        answer: [],
        verdict: { text: 'Uppleyst jónaefni er ekki heilt í vatninu' },
        next: { role: 'button', name: 'Næsta skref' },
        scrollsToAction: 1,
        viewports: ['android', 'iphone', 'se', 'landscape'],
      },
    },
    {
      name: 'Skilja — síðasta skref',
      steps: [
        {
          clickRole: ['button', 'Skilja'],
        },
        {
          wait: 500,
        },
        {
          clickRole: ['button', 'Næsta skref'],
        },
        {
          wait: 500,
        },
      ],
    },
    {
      name: 'Skilja — þrjú skref og leysnireglurnar opnar',
      steps: [
        {
          clickRole: ['button', 'Skilja'],
        },
        {
          wait: 500,
        },
        {
          clickRole: ['button', 'Næsta skref'],
        },
        {
          wait: 500,
        },
        {
          clickRole: ['button', 'Næsta skref'],
        },
        {
          css: 'summary',
        },
      ],
    },
    {
      name: 'Æfa — spurning',
      steps: [
        {
          clickRole: ['button', 'Æfa'],
        },
      ],
      // "Athuga" is pinned to the foot of a portrait phone (design §4, P8).
      loop: {
        prompt: { css: '[data-item-start]' },
        action: { role: 'button', name: 'Athuga' },
        answer: [
          { css: 'fieldset button' },
          { clickRole: ['button', 'Öll nítröt (NO₃⁻) eru leysanleg.'] },
        ],
        verdict: { css: '#aefa-verdict' },
        next: { role: 'button', name: 'Næsta' },
        viewports: ['android', 'iphone', 'se', 'landscape'],
        landscapeScrollsToAction: 2,
      },
    },
    {
      name: 'Æfa — endurgjöf',
      steps: [
        {
          clickRole: ['button', 'Æfa'],
        },
        {
          css: 'fieldset button',
        },
        // The rules sit beside the compound in landscape, so they are no longer
        // the second fieldset among siblings; name the rule instead.
        {
          clickRole: ['button', 'Öll nítröt (NO₃⁻) eru leysanleg.'],
        },
        {
          clickRole: ['button', 'Athuga'],
        },
      ],
    },
    {
      name: 'Beita — myndast botnfall?',
      steps: [
        {
          clickRole: ['button', 'Beita'],
        },
        // A question's buttons ignore a press within 400 ms of appearing, so a
        // double tap cannot answer the next one unread.
        {
          wait: 500,
        },
      ],
      loop: {
        prompt: { css: '[data-item-start]' },
        action: { role: 'button', name: 'Nei, ekkert gerist' },
        answer: [],
        verdict: { css: '#beita-verdict' },
        next: { role: 'button', name: 'Næsta dæmi' },
        viewports: ['android', 'iphone', 'se', 'landscape'],
      },
    },
    {
      name: 'Beita — hvort efnið fellur út?',
      steps: [
        {
          clickRole: ['button', 'Beita'],
        },
        {
          wait: 500,
        },
        {
          clickRole: ['button', 'Já, botnfall myndast'],
        },
      ],
    },
    {
      name: 'Beita — byggja nettójónajöfnu',
      steps: [
        {
          clickRole: ['button', 'Beita'],
        },
        {
          wait: 500,
        },
        {
          clickRole: ['button', 'Já, botnfall myndast'],
        },
        {
          wait: 500,
        },
        {
          clickRole: ['button', 'AgCl'],
        },
        {
          wait: 500,
        },
        {
          clickRole: ['button', 'Fjölga Ag⁺'],
        },
        {
          clickRole: ['button', 'Fjölga Cl⁻'],
        },
      ],
      loop: {
        prompt: { css: '[data-item-start]' },
        action: { role: 'button', name: 'Athuga jöfnuna' },
        answer: [{ clickRole: ['button', 'Fjölga Ag⁺'] }],
        verdict: { css: '#beita-verdict' },
        next: { role: 'button', name: 'Næsta dæmi' },
        // In landscape the scenario card is above the screen by the third
        // question; the §6.2.10 check still runs (design §5).
        viewports: ['android', 'iphone', 'se'],
      },
    },
    {
      name: 'Beita — rétt jafna',
      steps: [
        {
          clickRole: ['button', 'Beita'],
        },
        {
          wait: 500,
        },
        {
          clickRole: ['button', 'Já, botnfall myndast'],
        },
        {
          wait: 500,
        },
        {
          clickRole: ['button', 'AgCl'],
        },
        {
          wait: 500,
        },
        {
          clickRole: ['button', 'Fjölga Ag⁺'],
        },
        {
          clickRole: ['button', 'Fjölga Cl⁻'],
        },
        {
          clickRole: ['button', 'Athuga jöfnuna'],
        },
      ],
    },
    {
      name: 'Beita — rangt spáð',
      steps: [
        {
          clickRole: ['button', 'Beita'],
        },
        {
          wait: 500,
        },
        {
          clickRole: ['button', 'Nei, ekkert gerist'],
        },
      ],
    },
  ],
  '1-ar/stilla-efnajofnur': [
    {
      name: 'Valmynd',
      steps: [
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 1 — kynning',
      steps: [
        {
          clickRole: ['button', 'Stig 1'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 1 — æfing',
      steps: [
        {
          clickRole: ['button', 'Stig 1'],
        },
        {
          click: 'Byrja æfingar',
        },
        {
          wait: 300,
        },
      ],
      loop: {
        prompt: { css: '[data-item-start]' },
        action: { role: 'button', name: 'Athuga' },
        answer: [{ css: 'button[aria-label^="Hækka"]' }],
        verdict: { css: '.feedback-panel' },
        next: { role: 'button', name: 'Næsta efnajafna' },
        together: [[{ css: '[data-item-start]' }, { css: 'table' }]],
        // On the SE the action row is pinned (design §4). On a phone on its
        // side Athuga is one short scroll below the atom table (a §5 landscape
        // residual); the "stays usable" check still runs there.
        viewports: ['android', 'iphone', 'se'],
      },
    },
    {
      name: 'Stig 1 — vísbending',
      steps: [
        {
          clickRole: ['button', 'Stig 1'],
        },
        {
          click: 'Byrja æfingar',
        },
        {
          clickRole: ['button', 'Vísbending'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 1 — endurgjöf',
      steps: [
        {
          clickRole: ['button', 'Stig 1'],
        },
        {
          click: 'Byrja æfingar',
        },
        {
          clickRole: ['button', 'Athuga'],
        },
        {
          wait: 600,
        },
      ],
    },
    {
      name: 'Stig 2 — æfing',
      steps: [
        {
          clickRole: ['button', 'Stig 2'],
        },
        {
          wait: 300,
        },
      ],
      loop: {
        prompt: { css: '[data-item-start]' },
        action: { role: 'button', name: 'Athuga' },
        answer: [{ css: 'button[aria-label^="Hækka"]' }],
        verdict: { css: '.feedback-panel' },
        next: { role: 'button', name: 'Næsta efnajafna' },
        together: [[{ css: '[data-item-start]' }, { css: 'table' }]],
        // On the SE the action row is pinned (design §4). On a phone on its
        // side Athuga is one short scroll below the atom table (a §5 landscape
        // residual); the "stays usable" check still runs there.
        viewports: ['android', 'iphone', 'se'],
      },
    },
    {
      name: 'Stig 2 — vísbending',
      steps: [
        {
          clickRole: ['button', 'Stig 2'],
        },
        {
          clickRole: ['button', 'Vísbending'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 2 — endurgjöf',
      steps: [
        {
          clickRole: ['button', 'Stig 2'],
        },
        {
          clickRole: ['button', 'Athuga'],
        },
        {
          wait: 600,
        },
      ],
    },
    {
      name: 'Stig 3 — æfing',
      steps: [
        {
          clickRole: ['button', 'Stig 3'],
        },
        {
          wait: 300,
        },
      ],
      loop: {
        prompt: { css: '[data-item-start]' },
        action: { role: 'button', name: 'Athuga' },
        answer: [{ css: 'button[aria-label^="Hækka"]' }],
        verdict: { css: '.feedback-panel' },
        next: { role: 'button', name: 'Næsta efnajafna' },
        together: [[{ css: '[data-item-start]' }, { css: 'table' }]],
        // On the SE the action row is pinned (design §4). On a phone on its
        // side Athuga is one short scroll below the atom table (a §5 landscape
        // residual); the "stays usable" check still runs there.
        viewports: ['android', 'iphone', 'se'],
      },
    },
    {
      name: 'Stig 3 — vísbending',
      steps: [
        {
          clickRole: ['button', 'Stig 3'],
        },
        {
          clickRole: ['button', 'Vísbending'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 3 — endurgjöf',
      steps: [
        {
          clickRole: ['button', 'Stig 3'],
        },
        {
          css: 'button[aria-label^="Hækka"]',
        },
        {
          clickRole: ['button', 'Athuga'],
        },
        {
          wait: 600,
        },
      ],
    },
    {
      name: 'Stig 3 — næsta efnajafna',
      steps: [
        {
          clickRole: ['button', 'Stig 3'],
        },
        {
          clickRole: ['button', 'Athuga'],
        },
        {
          // Næsta ignores a press within 400 ms of appearing (the double-tap guard).
          wait: 500,
        },
        {
          clickRole: ['button', 'Næsta efnajafna'],
        },
        {
          wait: 300,
        },
      ],
    },
  ],
  '1-ar/takmarkandi': [
    {
      name: 'Valmynd',
      steps: [
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Valmynd — enska',
      steps: [
        {
          clickRole: ['button', 'English'],
        },
      ],
    },
    {
      name: 'Stig 1 — kynning',
      steps: [
        {
          clickRole: ['button', 'Stig 1'],
        },
      ],
    },
    {
      name: 'Stig 1 — spurning',
      steps: [
        {
          clickRole: ['button', 'Stig 1'],
        },
        {
          click: 'Byrja æfingar',
        },
      ],
      loop: {
        prompt: { css: '#takmarkandi-l1-equation' },
        // Tapping a reactant is the answer: there is no separate Athuga.
        action: { css: 'button:has-text("sameindir")' },
        answer: [],
        verdict: { css: '.feedback-panel' },
        next: { role: 'button', name: 'Næsta spurning' },
        together: [[{ css: '#takmarkandi-l1-equation' }, { css: 'button:has-text("sameindir")' }]],
        viewports: ['android', 'iphone', 'se', 'landscape'],
      },
    },
    {
      name: 'Stig 1 — endurgjöf',
      steps: [
        {
          clickRole: ['button', 'Stig 1'],
        },
        {
          click: 'Byrja æfingar',
        },
        {
          css: 'button:has-text("sameindir")',
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Stig 2 — spurning',
      steps: [
        {
          clickRole: ['button', 'Stig 2'],
        },
      ],
      loop: {
        prompt: { css: '#takmarkandi-l2-equation' },
        action: { role: 'button', name: 'Athuga' },
        answer: [{ fill: ['input', '9999'] }],
        verdict: { css: '.feedback-panel' },
        next: { role: 'button', name: 'Næsta spurning' },
        together: [[{ css: 'h2' }, { css: 'input' }]],
        // On the SE, Athuga sits about 30 px below the screen, and on a phone
        // on its side the student reads the worked solution down to Næsta:
        // both are design §5 residuals. The "stays usable" check still runs.
        viewports: ['android', 'iphone'],
        typed: true,
      },
    },
    {
      name: 'Stig 2 — endurgjöf',
      steps: [
        {
          clickRole: ['button', 'Stig 2'],
        },
        {
          fill: ['input', '9999'],
        },
        {
          clickRole: ['button', 'Athuga'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Stig 3 — takmarkandi',
      steps: [
        {
          clickRole: ['button', 'Stig 3'],
        },
      ],
      loop: {
        prompt: { css: '#takmarkandi-l3-question' },
        action: { role: 'button', name: 'Athuga' },
        answer: [{ css: 'button.font-mono' }],
        verdict: { css: '.feedback-panel' },
        next: { role: 'button', name: 'Áfram' },
        together: [[{ css: '#takmarkandi-l3-equation' }, { role: 'button', name: 'Athuga' }]],
        // On a phone on its side the verdict opens at the top of the task
        // column and "Áfram" is one short scroll below it (a §5 landscape
        // residual); the "stays usable" check still runs there.
        viewports: ['android', 'iphone', 'se'],
      },
    },
    {
      name: 'Stig 3 — fræðilegar heimtur',
      steps: [
        {
          clickRole: ['button', 'Stig 3'],
        },
        {
          css: 'button.font-mono',
        },
        {
          clickRole: ['button', 'Athuga'],
        },
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Áfram'],
        },
      ],
      loop: {
        prompt: { css: '#takmarkandi-l3-question' },
        action: { role: 'button', name: 'Athuga' },
        answer: [{ fill: ['input', '1'] }],
        verdict: { css: '.feedback-panel' },
        next: { role: 'button', name: 'Áfram' },
        together: [[{ css: '#takmarkandi-l3-equation' }, { css: 'input' }]],
        viewports: ['android', 'iphone', 'se'],
        typed: true,
      },
    },
    {
      name: 'Stig 3 — endurgjöf',
      steps: [
        {
          clickRole: ['button', 'Stig 3'],
        },
        {
          css: 'button.font-mono',
        },
        {
          clickRole: ['button', 'Athuga'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Stig 3 — fræðilegar heimtur, röng',
      steps: [
        {
          clickRole: ['button', 'Stig 3'],
        },
        {
          css: 'button.font-mono',
        },
        {
          clickRole: ['button', 'Athuga'],
        },
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Áfram'],
        },
        {
          fill: ['input', '1'],
        },
        {
          clickRole: ['button', 'Athuga'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Stig 3 — prósentuheimtur, röng',
      steps: [
        {
          clickRole: ['button', 'Stig 3'],
        },
        {
          css: 'button.font-mono',
        },
        {
          clickRole: ['button', 'Athuga'],
        },
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Áfram'],
        },
        {
          fill: ['input', '1'],
        },
        {
          clickRole: ['button', 'Athuga'],
        },
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Áfram'],
        },
        {
          fill: ['input', '1'],
        },
        {
          clickRole: ['button', 'Athuga'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Stig 3 — yfirlit verkefnis',
      steps: [
        {
          clickRole: ['button', 'Stig 3'],
        },
        {
          css: 'button.font-mono',
        },
        {
          clickRole: ['button', 'Athuga'],
        },
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Áfram'],
        },
        {
          fill: ['input', '1'],
        },
        {
          clickRole: ['button', 'Athuga'],
        },
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Áfram'],
        },
        {
          fill: ['input', '1'],
        },
        {
          clickRole: ['button', 'Athuga'],
        },
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Áfram'],
        },
        {
          wait: 300,
        },
      ],
    },
  ],
  '1-ar/lausnir': [
    {
      name: 'Valmynd',
      steps: [
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 0 — kennsla',
      steps: [
        {
          clickRole: ['button', 'Rafkleyfi'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 0 — endurgjöf',
      steps: [
        {
          clickRole: ['button', 'Rafkleyfi'],
        },
        {
          clickRole: ['button', 'Byrja að flokka'],
        },
        {
          clickRole: ['button', 'Sterkur rafkleyfi'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 0 — flokkun',
      steps: [
        {
          clickRole: ['button', 'Rafkleyfi'],
        },
        {
          clickRole: ['button', 'Byrja að flokka'],
        },
        {
          wait: 300,
        },
      ],
      loop: {
        prompt: { css: 'p[data-item-start]' },
        action: { role: 'button', name: 'Veikur rafkleyfi' },
        answer: [],
        verdict: { css: '#lausnir-l0-verdict' },
        next: { role: 'button', name: 'Næsta' },
        viewports: ['android', 'iphone', 'se'],
      },
    },
    {
      name: 'Stig 1 — spá',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Hugtök'],
        },
        {
          wait: 300,
        },
      ],
      loop: {
        prompt: { text: 'Ef þú bætir við vatni' },
        action: { role: 'button', name: 'Athuga spá' },
        answer: [{ clickRole: ['button', 'Minnkar'] }],
        verdict: { css: '.feedback-panel' },
        next: { role: 'button', name: 'Áfram í verkefni' },
        viewports: ['android', 'iphone', 'se'],
        // Verkefni 1 carries the note on the units the level uses, above the
        // question: one scroll to "Athuga spá". Later challenges need none.
        scrollsToAction: 1,
      },
    },
    {
      name: 'Stig 1 — röng spá',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Hugtök'],
        },
        {
          clickRole: ['button', 'Eykst'],
        },
        {
          clickRole: ['button', 'Athuga spá'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 1 — verkefni',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Hugtök'],
        },
        {
          clickRole: ['button', 'Minnkar'],
        },
        {
          clickRole: ['button', 'Athuga spá'],
        },
        {
          // "Áfram í verkefni" ignores a press within 400 ms of appearing.
          wait: 500,
        },
        {
          clickRole: ['button', 'Áfram í verkefni'],
        },
        {
          wait: 500,
        },
      ],
    },
    {
      name: 'Stig 1 — verkefni 2 (sameindir)',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Hugtök'],
        },
        {
          clickRole: ['button', '2'],
        },
        {
          clickRole: ['button', 'Eykst'],
        },
        {
          clickRole: ['button', 'Athuga spá'],
        },
        {
          // "Áfram í verkefni" ignores a press within 400 ms of appearing.
          wait: 500,
        },
        {
          clickRole: ['button', 'Áfram í verkefni'],
        },
        {
          wait: 500,
        },
      ],
      loop: {
        prompt: { text: 'Verkefni 2:' },
        action: { role: 'button', name: 'Athuga lausn' },
        // +10 makes 30 sameindir in 200 mL, the 1,5 M asked for: "Athuga
        // lausn" answers only a solution that is right.
        answer: [{ clickRole: ['button', '+10'] }],
        verdict: { css: '.feedback-panel' },
        // No Næsta: after a right answer the next challenge follows by itself
        // (design §7.7, kept), and this disabled button says so meanwhile.
        next: { role: 'button', name: 'Sæki næsta verkefni' },
        together: [
          [
            { css: 'svg[aria-label^="Bikarglas"]' },
            { css: '[data-concentration-indicator]' },
            { role: 'button', name: '+10' },
          ],
        ],
        viewports: ['android', 'iphone', 'se'],
        scrollsToAction: 1,
      },
    },
    {
      name: 'Stig 2 — atburðarás',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Rökstuðningur'],
        },
        {
          wait: 300,
        },
      ],
      loop: {
        prompt: { text: 'Hvað gerist við styrkinn' },
        action: { role: 'button', name: 'Staðfesta svar' },
        answer: [{ css: 'button.rounded-xl.border-2' }],
        verdict: { css: '#lausnir-l2-verdict' },
        next: { role: 'button', name: 'Næsta spurning' },
        viewports: ['android', 'iphone', 'se'],
        // The before/after picture sits between the setup and the question.
        scrollsToAction: 1,
      },
    },
    {
      name: 'Stig 2 — atburðarás og vísbending',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Rökstuðningur'],
        },
        {
          clickRole: ['button', 'Vísbending'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 2 — niðurstaða',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Rökstuðningur'],
        },
        {
          css: 'button.rounded-xl.border-2',
        },
        {
          clickRole: ['button', 'Staðfesta svar'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 2 — hitastig, niðurstaða',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Rökstuðningur'],
        },
        {
          css: 'button.rounded-xl.border-2',
        },
        {
          clickRole: ['button', 'Staðfesta svar'],
        },
        {
          // Næsta ignores a press within 400 ms of appearing.
          wait: 500,
        },
        {
          clickRole: ['button', 'Næsta spurning'],
        },
        {
          css: 'button.rounded-xl.border-2',
        },
        {
          clickRole: ['button', 'Staðfesta svar'],
        },
        {
          // Næsta ignores a press within 400 ms of appearing.
          wait: 500,
        },
        {
          clickRole: ['button', 'Næsta spurning'],
        },
        {
          css: 'button.rounded-xl.border-2',
        },
        {
          clickRole: ['button', 'Staðfesta svar'],
        },
        {
          // Næsta ignores a press within 400 ms of appearing.
          wait: 500,
        },
        {
          clickRole: ['button', 'Næsta spurning'],
        },
        {
          css: 'button.rounded-xl.border-2',
        },
        {
          clickRole: ['button', 'Staðfesta svar'],
        },
      ],
    },
    {
      name: 'Stig 2 — Kanna leysni',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Rökstuðningur'],
        },
        {
          clickRole: ['button', 'Kanna'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Stig 3 — dæmi og ábendingar',
      steps: [
        {
          clickRole: ['button', 'Stig 3: Útreikningar'],
        },
        {
          clickRole: ['button', 'Ábending 1'],
        },
        {
          clickRole: ['button', 'Ábending 2'],
        },
        {
          clickRole: ['button', 'Ábending 3'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 3 — dæmi',
      steps: [
        {
          clickRole: ['button', 'Stig 3: Útreikningar'],
        },
        {
          wait: 300,
        },
      ],
      loop: {
        prompt: { css: 'p.text-lg.font-medium' },
        action: { role: 'button', name: 'Athuga' },
        answer: [{ fill: ['input[inputmode=decimal]', '1'] }],
        verdict: { css: '.feedback-panel' },
        next: { role: 'button', name: 'Næsta dæmi' },
        together: [[{ css: 'p.text-lg.font-medium' }, { css: 'input[inputmode=decimal]' }]],
        viewports: ['android', 'iphone', 'se'],
        typed: true,
        // The worked solution follows the verdict and is read in full (§5).
        teachingFeedback: true,
      },
    },
    {
      name: 'Stig 3 — endurgjöf',
      steps: [
        {
          clickRole: ['button', 'Stig 3: Útreikningar'],
        },
        {
          fill: ['input[inputmode=decimal]', '1'],
        },
        {
          clickRole: ['button', 'Athuga'],
        },
        {
          wait: 300,
        },
      ],
    },
  ],
  '1-ar/einingakedjan': [
    {
      name: 'Valmynd',
      steps: [
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Kanna — fimm spjöld og snúið spjald',
      steps: [
        {
          clickRole: ['button', 'Kanna'],
        },
        {
          css: 'button[aria-label^="Bæta við hlutfalli"][aria-label*=": 24,31 g Mg"]',
        },
        {
          css: 'button[aria-label^="Bæta við hlutfalli"][aria-label*="atóm Mg jafngildir"]',
        },
        {
          css: 'button[aria-label^="Bæta við hlutfalli"][aria-label*=": 40,3 g MgO"]',
        },
        {
          css: 'button[aria-label^="Bæta við hlutfalli"][aria-label*="2 mól Mg jafngildir 2 mól MgO"]',
        },
        {
          css: 'button[aria-label^="Bæta við hlutfalli"][aria-label*=": 1000 g jafngildir"]',
        },
        {
          css: 'button[aria-label="Snúa við hlutfalli númer 1"]',
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Kanna lokið — valmynd',
      steps: [
        {
          clickRole: ['button', 'Kanna'],
        },
        {
          css: 'button[aria-label^="Bæta við hlutfalli"][aria-label*=": 24,31 g Mg"]',
        },
        {
          clickRole: ['button', 'Áfram'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Skilja — hlutfall snúið við',
      steps: [
        {
          clickRole: ['button', 'Skilja'],
        },
        {
          clickRole: ['button', 'Snúa hlutfallinu við'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Æfa — keðja í smíðum með vísbendingu',
      steps: [
        {
          clickRole: ['button', 'Æfa'],
        },
        {
          css: 'button[aria-label^="Bæta við hlutfalli"][aria-label*=": 24,31 g Mg"]',
        },
        {
          clickRole: ['button', 'Vísbending'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Æfa — spá valin',
      steps: [
        {
          clickRole: ['button', 'Æfa'],
        },
        {
          css: 'button[aria-label^="Bæta við hlutfalli"]',
        },
        {
          clickRole: ['button', 'Leysa'],
        },
        // The prediction's options ignore a press within 400 ms of appearing,
        // so the second tap of a double tap on "Leysa" cannot answer unread.
        {
          wait: 300,
        },
        {
          css: 'main .grid button',
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Æfa — leiðrétting eftir ranga keðju',
      steps: [
        {
          clickRole: ['button', 'Æfa'],
        },
        {
          css: 'button[aria-label^="Bæta við hlutfalli"][aria-label*=": 24,31 g Mg"]',
        },
        {
          clickRole: ['button', 'Leysa'],
        },
        // The prediction's options ignore a press within 400 ms of appearing,
        // so the second tap of a double tap on "Leysa" cannot answer unread.
        {
          wait: 300,
        },
        {
          css: 'main .grid button',
        },
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Sýna útreikninginn'],
        },
        {
          wait: 2500,
        },
        {
          css: '.border-amber-400 .grid button',
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Æfa — keðjan gengur upp',
      steps: [
        {
          clickRole: ['button', 'Æfa'],
        },
        {
          css: 'button[aria-label^="Bæta við hlutfalli"][aria-label*=": 24,31 g Mg"]',
        },
        {
          css: 'button[aria-label="Snúa við hlutfalli númer 1"]',
        },
        {
          css: 'button[aria-label^="Bæta við hlutfalli"][aria-label*="atóm Mg jafngildir"]',
        },
        {
          clickRole: ['button', 'Leysa'],
        },
        // The prediction's options ignore a press within 400 ms of appearing,
        // so the second tap of a double tap on "Leysa" cannot answer unread.
        {
          wait: 300,
        },
        {
          css: 'main .grid button',
        },
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Sýna útreikninginn'],
        },
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Sýna öll skrefin strax'],
        },
        {
          wait: 1000,
        },
      ],
    },
    {
      name: 'Beita — þriggja skrefa lausn með efnajöfnu',
      steps: [
        {
          clickRole: ['button', 'Beita'],
        },
        {
          css: 'button[aria-label^="Bæta við hlutfalli"][aria-label*=": 24,31 g Mg"]',
        },
        {
          css: 'button[aria-label="Snúa við hlutfalli númer 1"]',
        },
        {
          css: 'button[aria-label^="Bæta við hlutfalli"][aria-label*="2 mól Mg jafngildir 2 mól MgO"]',
        },
        {
          css: 'button[aria-label="Snúa við hlutfalli númer 2"]',
        },
        {
          css: 'button[aria-label^="Bæta við hlutfalli"][aria-label*=": 40,3 g MgO"]',
        },
        {
          clickRole: ['button', 'Leysa'],
        },
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Sýna öll skrefin strax'],
        },
        {
          wait: 1000,
        },
      ],
    },
    {
      name: 'Beita — næsta dæmi',
      steps: [
        {
          clickRole: ['button', 'Beita'],
        },
        {
          css: 'button[aria-label^="Bæta við hlutfalli"][aria-label*=": 24,31 g Mg"]',
        },
        {
          css: 'button[aria-label="Snúa við hlutfalli númer 1"]',
        },
        {
          css: 'button[aria-label^="Bæta við hlutfalli"][aria-label*="2 mól Mg jafngildir 2 mól MgO"]',
        },
        {
          css: 'button[aria-label="Snúa við hlutfalli númer 2"]',
        },
        {
          css: 'button[aria-label^="Bæta við hlutfalli"][aria-label*=": 40,3 g MgO"]',
        },
        {
          clickRole: ['button', 'Leysa'],
        },
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Sýna öll skrefin strax'],
        },
        {
          wait: 1000,
        },
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Næsta dæmi'],
        },
        {
          wait: 400,
        },
      ],
    },
    // Play loops (design §6.1): one per phase.
    {
      name: 'Kanna — spjald sett í keðjuna',
      steps: [
        {
          clickRole: ['button', 'Kanna'],
        },
      ],
      // The pool sits under the intro, the three suggestions and the chain:
      // read first, one or two scrolls down (design §5, explore).
      loop: {
        prompt: { css: 'main h2' },
        action: {
          css: 'button[aria-label^="Bæta við hlutfalli"][aria-label*=": 24,31 g Mg"]',
        },
        answer: [],
        verdict: { text: 'Þú ert núna með' },
        next: { role: 'button', name: 'Hreinsa keðjuna' },
        scrollsToAction: 2,
        viewports: ['android', 'iphone', 'se', 'landscape'],
      },
    },
    {
      name: 'Skilja — mólmassa snúið',
      steps: [
        {
          clickRole: ['button', 'Skilja'],
        },
      ],
      // A teaching page (design §5): the first lesson's ratio is one short
      // scroll down, and the next lesson one more below its sentence.
      loop: {
        prompt: { css: 'main h2' },
        action: { role: 'button', name: 'Snúa hlutfallinu við' },
        answer: [],
        verdict: { text: 'Svona snúið stendur' },
        next: { css: 'main .space-y-5 > [role=group]:nth-child(2) button' },
        scrollsToAction: 1,
        teachingFeedback: true,
        viewports: ['android', 'iphone', 'se', 'landscape'],
      },
    },
    {
      name: 'Æfa — Leysa og spáin',
      steps: [
        {
          clickRole: ['button', 'Æfa'],
        },
        {
          wait: 300,
        },
      ],
      loop: {
        prompt: { css: '[data-item-start]' },
        action: { role: 'button', name: 'Leysa' },
        answer: [
          {
            css: 'button[aria-label^="Bæta við hlutfalli"][aria-label*=": 24,31 g Mg"]',
          },
          {
            css: 'button[aria-label="Snúa við hlutfalli númer 1"]',
          },
          {
            css: 'button[aria-label^="Bæta við hlutfalli"][aria-label*="atóm Mg jafngildir"]',
          },
        ],
        verdict: { text: 'Áður en við reiknum' },
        next: { css: 'main .grid button' },
        advance: {
          steps: [
            // Past the 400 ms guard on what `next` brought up.
            { wait: 450 },
            { clickRole: ['button', 'Sýna útreikninginn'] },
            { clickRole: ['button', 'Sýna öll skrefin strax'] },
          ],
          next: { role: 'button', name: 'Næsta dæmi' },
        },
        viewports: ['android', 'iphone', 'se', 'landscape'],
      },
    },
    {
      name: 'Beita — Leysa og útreikningurinn',
      steps: [
        {
          clickRole: ['button', 'Beita'],
        },
        {
          wait: 300,
        },
      ],
      loop: {
        prompt: { css: '[data-item-start]' },
        action: { role: 'button', name: 'Leysa' },
        answer: [
          {
            css: 'button[aria-label^="Bæta við hlutfalli"][aria-label*=": 24,31 g Mg"]',
          },
          {
            css: 'button[aria-label="Snúa við hlutfalli númer 1"]',
          },
          {
            css: 'button[aria-label^="Bæta við hlutfalli"][aria-label*="2 mól Mg jafngildir 2 mól MgO"]',
          },
          {
            css: 'button[aria-label="Snúa við hlutfalli númer 2"]',
          },
          {
            css: 'button[aria-label^="Bæta við hlutfalli"][aria-label*=": 40,3 g MgO"]',
          },
        ],
        verdict: { css: 'main ol' },
        next: { role: 'button', name: 'Sýna öll skrefin strax' },
        advance: { steps: [], next: { role: 'button', name: 'Næsta dæmi' } },
        // On the SE the Beita statement, with its equation, runs 450 px, so the
        // pinned chain starts in the flow below the first screen and pins once
        // the student scrolls to the pool; the §6.2.2 "pinned region on screen
        // at scrollY 0" check does not hold there (design §5, SE residual).
        viewports: ['android', 'iphone', 'landscape'],
      },
    },
  ],
  '2-ar/hess-law': [
    {
      name: 'Valmynd',
      steps: [
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 1 — kynning',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Skilningur'],
        },
      ],
    },
    {
      name: 'Stig 1 — endurgjöf',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Skilningur'],
        },
        {
          clickRole: ['button', 'Byrja'],
        },
        {
          css: 'div.space-y-3 > button',
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
      ],
    },
    {
      name: 'Stig 1 — snúa við og margfalda',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Skilningur'],
        },
        {
          clickRole: ['button', 'Byrja'],
        },
        {
          css: 'button.rounded-full:nth-child(2)',
        },
        {
          clickRole: ['button', 'Snúa við'],
        },
        {
          css: 'button.w-10.rounded-lg:nth-of-type(3)',
        },
      ],
    },
    {
      name: 'Stig 1 — ástandsfall',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Skilningur'],
        },
        {
          clickRole: ['button', 'Byrja'],
        },
        {
          clickRole: ['button', 'Myndun NH₃'],
        },
        {
          clickRole: ['switch', 'Sýna saman'],
        },
      ],
    },
    {
      name: 'Valmynd — framvinda',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Skilningur'],
        },
        {
          clickRole: ['button', 'Byrja'],
        },
        {
          css: 'button.rounded-full:nth-child(6)',
        },
        {
          css: 'div.space-y-3 > button',
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
        // Næsta / Ljúka stigi ignores a press within 400 ms of appearing (P3's
        // double-tap guard); a student never reaches it that fast.
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Ljúka stigi'],
        },
      ],
    },
    {
      name: 'Stig 2 — orkuferill',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Þrautir'],
        },
        {
          css: 'div[role=button] div.font-mono',
        },
        {
          clickRole: ['button', 'Snúa við jöfnu'],
        },
        {
          clickRole: ['button', 'Sýna vísbendingu'],
        },
      ],
    },
    {
      name: 'Stig 2 — endurgjöf',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Þrautir'],
        },
        {
          css: 'div[role=button] div.font-mono',
        },
        {
          clickRole: ['button', 'Athuga lausn'],
        },
      ],
    },
    {
      name: 'Stig 3 — kynning',
      steps: [
        {
          clickRole: ['button', 'Stig 3: Útreikningar'],
        },
      ],
    },
    {
      name: 'Stig 3 — tafla og vísbending',
      steps: [
        {
          clickRole: ['button', 'Stig 3: Útreikningar'],
        },
        {
          clickRole: ['button', 'Byrja æfingar'],
        },
        {
          clickRole: ['button', 'Sýna ΔH°f töflu'],
        },
        {
          clickRole: ['button', 'Sýna vísbendingu'],
        },
      ],
    },
    {
      name: 'Stig 3 — endurgjöf',
      steps: [
        {
          clickRole: ['button', 'Stig 3: Útreikningar'],
        },
        {
          clickRole: ['button', 'Byrja æfingar'],
        },
        {
          fill: ['#hess-l3-answer', '5'],
        },
        {
          clickRole: ['button', 'Athuga'],
        },
      ],
    },
    {
      name: 'Stig 1 — leikur',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Skilningur'],
        },
        {
          clickRole: ['button', 'Byrja'],
        },
      ],
      loop: {
        prompt: { css: '[data-item-start]' },
        action: { role: 'button', name: 'Athuga svar' },
        answer: [{ css: 'div.space-y-3 > button' }],
        verdict: { css: '.feedback-panel' },
        next: { role: 'button', name: 'Næsta verkefni' },
        viewports: ['android', 'iphone', 'se'],
        scrollsToAction: 1,
      },
    },
    {
      name: 'Stig 2 — leikur',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Þrautir'],
        },
        {
          css: 'div[role=button] div.font-mono',
        },
      ],
      loop: {
        prompt: { text: 'Markmiðsjafna' },
        action: { role: 'button', name: 'Athuga lausn' },
        answer: [],
        verdict: { css: '#hess-l2-result' },
        next: { role: 'button', name: 'Næsta þraut' },
        // The target and the running ΔH on screen together: the target pinned
        // at the top, the running ΔH in the pinned action bar (portrait only).
        together: [
          [
            { text: 'Markmiðsjafna' },
            { css: '[data-pinned-bottom] > [aria-hidden="true"]' },
            { role: 'button', name: 'Athuga lausn' },
          ],
        ],
      },
    },
    {
      name: 'Stig 3 — leikur',
      steps: [
        {
          clickRole: ['button', 'Stig 3: Útreikningar'],
        },
        {
          clickRole: ['button', 'Byrja æfingar'],
        },
      ],
      loop: {
        prompt: { css: '[data-item-start]' },
        action: { role: 'button', name: 'Athuga' },
        answer: [{ fill: ['#hess-l3-answer', '5'] }],
        verdict: { css: '#hess-l3-verdict' },
        next: { role: 'button', name: 'Næsta þraut' },
        together: [[{ text: 'Samtals hvarfefni' }, { css: '#hess-l3-answer' }]],
        viewports: ['android', 'iphone', 'se', 'landscape'],
        scrollsToAction: 1,
        typed: true,
      },
    },
  ],
  '2-ar/kinetics': [
    {
      name: 'Valmynd',
      steps: [
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 1 — spurning',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Hraðahugtök'],
        },
        {
          clickRole: ['button', 'Sýna vísbendingu'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 1 — endurgjöf',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Hraðahugtök'],
        },
        {
          css: 'button.text-left.border-2',
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Stig 1 — hvataáhrif',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Hraðahugtök'],
        },
        {
          clickRole: ['button', 'Sýna hreyfingu'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Stig 2 — kynning',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Hraðalögmál'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 2 — spurning',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Hraðalögmál'],
        },
        {
          clickRole: ['button', 'Byrja æfingar'],
        },
        {
          clickRole: ['button', 'Sýna vísbendingu'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 2 — endurgjöf',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Hraðalögmál'],
        },
        {
          clickRole: ['button', 'Byrja æfingar'],
        },
        {
          css: 'button.w-12.h-12',
        },
        {
          css: 'div.space-y-4 > div:nth-child(2) button.w-12',
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Stig 3 — kynning',
      steps: [
        {
          clickRole: ['button', 'Stig 3: Hvarfgangur'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 3 — spurning',
      steps: [
        {
          clickRole: ['button', 'Stig 3: Hvarfgangur'],
        },
        {
          clickRole: ['button', 'Byrja æfingar'],
        },
        {
          clickRole: ['button', 'Sýna vísbendingu'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 3 — endurgjöf',
      steps: [
        {
          clickRole: ['button', 'Stig 3: Hvarfgangur'],
        },
        {
          clickRole: ['button', 'Byrja æfingar'],
        },
        {
          css: 'button.text-left.border-2',
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Stig 1 — leikur',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Hraðahugtök'],
        },
      ],
      loop: {
        prompt: { css: '[data-item-start]' },
        action: { role: 'button', name: 'Athuga svar' },
        answer: [{ css: 'button.text-left.border-2:nth-child(2)' }],
        verdict: { css: '.feedback-panel' },
        next: { role: 'button', name: 'Næsta þraut' },
        // In landscape the feedback (FeedbackPanel and Hugtak, across both columns) is taller
        // than the screen, so Næsta is one scroll below the verdict: an accepted residual
        // (design §5). The §6.2.10 landscape check still runs.
        viewports: ['android', 'iphone', 'se'],
      },
    },
    {
      name: 'Stig 2 — leikur',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Hraðalögmál'],
        },
        {
          clickRole: ['button', 'Byrja æfingar'],
        },
      ],
      loop: {
        prompt: { css: '[data-item-start]' },
        action: { role: 'button', name: 'Athuga svar' },
        answer: [
          { css: 'button.w-12.h-12' },
          { css: 'div.space-y-4 > div:nth-child(2) button.w-12' },
        ],
        verdict: { css: '#kinetics-l2-verdict' },
        next: { role: 'button', name: 'Næsta þraut' },
        // The data and the order buttons worked from it, on one screen.
        together: [[{ css: 'table' }, { text: 'Röð í [B]:' }]],
        // On the SE Athuga is about 90 px below the screen: the SE is the stretch target (§5).
        viewports: ['android', 'iphone', 'landscape'],
      },
    },
    {
      name: 'Stig 3 — leikur',
      steps: [
        {
          clickRole: ['button', 'Stig 3: Hvarfgangur'],
        },
        {
          clickRole: ['button', 'Byrja æfingar'],
        },
      ],
      loop: {
        prompt: { css: '[data-item-start]' },
        action: { role: 'button', name: 'Athuga svar' },
        answer: [{ css: 'button.text-left.border-2:nth-child(2)' }],
        verdict: { css: '[aria-labelledby="kinetics-l3-verdict"]' },
        next: { role: 'button', name: 'Næsta þraut' },
        // The mechanism, the question, the options and Athuga, after one reading scroll past
        // the title and overall reaction (§3, multiple choice with a stimulus).
        together: [[{ text: 'Hvarfgangur:' }, { role: 'button', name: 'Athuga svar' }]],
        scrollsToAction: 1,
        // On the SE a second scroll is needed: the stretch target (§5).
        viewports: ['android', 'iphone', 'landscape'],
      },
    },
  ],
  '2-ar/lewis-structures': [
    {
      name: 'Stig 1 — spurning',
      steps: [
        {
          click: 'Stig 1: Gildisrafeindir',
        },
      ],
    },
    {
      name: 'Stig 1 — vísbendingar opnaðar',
      steps: [
        {
          click: 'Stig 1: Gildisrafeindir',
        },
        {
          clickRole: ['button', 'Vísbending 1/4'],
        },
        {
          clickRole: ['button', 'Vísbending 2/4'],
        },
      ],
    },
    {
      name: 'Stig 1 — rangt svar, endurgjöf',
      steps: [
        {
          click: 'Stig 1: Gildisrafeindir',
        },
        {
          fill: ['input[type=number]', '99'],
        },
        {
          click: 'Athuga svar',
        },
      ],
    },
    {
      name: 'Stig 1 — rétt svar, endurgjöf',
      steps: [
        {
          click: 'Stig 1: Gildisrafeindir',
        },
        {
          fill: ['input[type=number]', '4'],
        },
        {
          click: 'Athuga svar',
        },
      ],
    },
    {
      name: 'Stig 2 — teikniborð',
      steps: [
        {
          click: 'Stig 2: Teikna Lewis',
        },
      ],
    },
    {
      name: 'Stig 2 — rangt teiknað, endurgjöf',
      steps: [
        {
          click: 'Stig 2: Teikna Lewis',
        },
        {
          css: 'svg g[role=button]',
        },
        {
          click: 'Athuga',
        },
      ],
    },
    {
      name: 'Stig 2 — of margar rafeindir',
      steps: [
        {
          click: 'Stig 2: Teikna Lewis',
        },
        {
          css: 'svg g[role=button]:nth-of-type(1)',
        },
        {
          css: 'svg g[role=button]:nth-of-type(1)',
        },
        {
          css: 'svg g[role=button]:nth-of-type(1)',
        },
        {
          css: 'svg g[role=button]:nth-of-type(2)',
        },
        {
          css: 'svg g[role=button]:nth-of-type(2)',
        },
        {
          css: 'svg g[role=button]:nth-of-type(2)',
        },
      ],
    },
    {
      name: 'Stig 2 — vísbendingar opnaðar',
      steps: [
        {
          click: 'Stig 2: Teikna Lewis',
        },
        {
          click: 'Sýna vísbendingu',
        },
        {
          click: 'Sýna fleiri vísbendingar',
        },
        {
          click: 'Sýna fleiri vísbendingar',
        },
      ],
    },
    {
      name: 'Stig 2 — rétt teiknað, Lewis-formúla',
      steps: [
        {
          click: 'Stig 2: Teikna Lewis',
        },
        {
          css: 'svg g[role=button]:nth-of-type(1)',
        },
        {
          css: 'svg g[role=button]:nth-of-type(2)',
        },
        {
          clickRole: ['button', 'Bæta stöku pari við O (miðatóm)'],
        },
        {
          clickRole: ['button', 'Bæta stöku pari við O (miðatóm)'],
        },
        {
          click: 'Athuga',
        },
      ],
    },
    {
      name: 'Stig 2 — rétt teiknað, þrívíddarlögun',
      steps: [
        {
          click: 'Stig 2: Teikna Lewis',
        },
        {
          css: 'svg g[role=button]:nth-of-type(1)',
        },
        {
          css: 'svg g[role=button]:nth-of-type(2)',
        },
        {
          clickRole: ['button', 'Bæta stöku pari við O (miðatóm)'],
        },
        {
          clickRole: ['button', 'Bæta stöku pari við O (miðatóm)'],
        },
        {
          click: 'Athuga',
        },
        {
          click: '3D lögun',
        },
        {
          wait: 500,
        },
      ],
    },
    {
      name: 'Stig 2 — leiðsögn, dreifing rafeinda',
      steps: [
        {
          click: 'Stig 2: Teikna Lewis',
        },
        {
          click: 'Opna leiðsögn',
        },
        {
          fill: ['input[type=number]', '8'],
        },
        {
          click: 'Athuga',
        },
        // Næsta ignores a press within 400 ms of appearing (P3's double-tap
        // guard); a student never reaches it that fast.
        {
          wait: 300,
        },
        {
          click: 'Næsta skref',
        },
        {
          click: 'Ég skil',
        },
        // Næsta ignores a press within 400 ms of appearing (P3's double-tap
        // guard); a student never reaches it that fast.
        {
          wait: 300,
        },
        {
          click: 'Næsta skref',
        },
        {
          fill: ['input[type=number]', '2'],
        },
        {
          click: 'Athuga',
        },
        {
          wait: 700,
        },
        {
          click: 'Næsta skref',
        },
      ],
    },
    {
      name: 'Stig 3 — spurning, vísbending og rangt svar',
      steps: [
        {
          click: 'Stig 3: Formhleðsla',
        },
        {
          click: 'Sýna vísbendingu',
        },
        {
          click: 'FC = Gildisraf. + óbundnar - bundnar',
        },
        {
          click: 'Athuga svar',
        },
      ],
    },
    {
      name: 'Stig 3 — formhleðsla atóms, niðurstaða',
      steps: [
        {
          click: 'Stig 3: Formhleðsla',
        },
        {
          click: 'FC = Gildisraf. - (óbundnar + ½ bundnar)',
        },
        {
          click: 'Athuga svar',
        },
        // Næsta ignores a press within 400 ms of appearing (P3's double-tap
        // guard); a student never reaches it that fast.
        {
          wait: 300,
        },
        {
          click: 'Næsta þraut',
        },
        {
          clickRole: ['button', '+1'],
        },
        {
          click: 'Athuga svar',
        },
      ],
    },
    {
      name: 'Stig 3 — samanburður Lewis-formúla (CO)',
      steps: [
        {
          click: 'Stig 3: Formhleðsla',
        },
        {
          click: 'FC = Gildisraf. - (óbundnar + ½ bundnar)',
        },
        {
          click: 'Athuga svar',
        },
        // Næsta ignores a press within 400 ms of appearing (P3's double-tap
        // guard); a student never reaches it that fast.
        {
          wait: 300,
        },
        {
          click: 'Næsta þraut',
        },
        {
          clickRole: ['button', '+1'],
        },
        {
          click: 'Athuga svar',
        },
        // Næsta ignores a press within 400 ms of appearing (P3's double-tap
        // guard); a student never reaches it that fast.
        {
          wait: 300,
        },
        {
          click: 'Næsta þraut',
        },
        {
          clickRole: ['button', '+1'],
        },
        {
          click: 'Athuga svar',
        },
        // Næsta ignores a press within 400 ms of appearing (P3's double-tap
        // guard); a student never reaches it that fast.
        {
          wait: 300,
        },
        {
          click: 'Næsta þraut',
        },
      ],
    },
    {
      name: 'Stig 1 — leikur',
      steps: [
        {
          click: 'Stig 1: Gildisrafeindir',
        },
      ],
      loop: {
        prompt: { css: '[data-item-start]' },
        action: { role: 'button', name: 'Athuga svar' },
        answer: [{ fill: ['input[type=number]', '99'] }],
        verdict: { css: '.feedback-panel' },
        next: { role: 'button', name: 'Næsta þraut' },
        together: [[{ text: 'Hversu margar gildisrafeindir' }, { css: 'input[type=number]' }]],
        // Landscape keeps the weaker "usable" check (§6.2.10): the feedback is
        // taller than the screen there, and its top stays where it opened (§5).
        viewports: ['android', 'iphone', 'se'],
        landscapeScrollsToAction: 1,
        typed: true,
      },
    },
    {
      name: 'Stig 2 — teikning',
      steps: [
        {
          click: 'Stig 2: Teikna Lewis',
        },
      ],
      loop: {
        prompt: { css: '[data-item-start]' },
        action: { role: 'button', name: 'Athuga' },
        // A right drawing of H₂O: the only way to a Næsta. Both bonds single,
        // two pairs on O.
        answer: [
          { css: 'svg g[role=button]:nth-of-type(1)' },
          { css: 'svg g[role=button]:nth-of-type(2)' },
          { clickRole: ['button', 'Bæta stöku pari við O (miðatóm)'] },
          { clickRole: ['button', 'Bæta stöku pari við O (miðatóm)'] },
        ],
        verdict: { css: '#lewis-l2-verdict' },
        next: { role: 'button', name: 'Næsta sameind' },
        // The board and its action on screen together: Athuga pinned to the
        // bottom of a portrait phone, beside the board on its side.
        together: [[{ css: 'svg[aria-label^="Teikniborð"]' }, { role: 'button', name: 'Athuga' }]],
        viewports: ['android', 'iphone', 'se', 'landscape'],
        landscapeScrollsToAction: 1,
      },
    },
    {
      name: 'Stig 2 — leiðsögn, leikur',
      steps: [
        {
          click: 'Stig 2: Teikna Lewis',
        },
        {
          click: 'Opna leiðsögn',
        },
      ],
      loop: {
        prompt: { css: '[data-item-start]' },
        action: { role: 'button', name: 'Athuga' },
        answer: [{ fill: ['input[type=number]', '5'] }],
        verdict: { text: 'Ekki rétt' },
        next: { role: 'button', name: 'Reyna aftur' },
        advance: {
          steps: [
            // Past the 400 ms guard on what `next` brought up.
            { wait: 450 },
            { fill: ['input[type=number]', '8'] },
            { clickRole: ['button', 'Athuga'] },
          ],
          next: { role: 'button', name: 'Næsta skref →' },
        },
        together: [[{ text: 'Útreikningur' }, { css: 'input[type=number]' }]],
        viewports: ['android', 'iphone', 'se'],
        typed: true,
      },
    },
    {
      name: 'Stig 3 — leikur',
      steps: [
        {
          click: 'Stig 3: Formhleðsla',
        },
      ],
      loop: {
        prompt: { css: '[data-item-start]' },
        action: { role: 'button', name: 'Athuga svar' },
        answer: [{ click: 'FC = Gildisraf. + óbundnar - bundnar' }],
        verdict: { css: '#lewis-l3-verdict' },
        next: { role: 'button', name: 'Næsta þraut' },
        viewports: ['android', 'iphone'],
      },
    },
  ],
  '2-ar/vsepr-geometry': [
    {
      name: 'Valmynd',
      steps: [
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 1 — könnun',
      steps: [
        {
          clickRole: ['button', 'Stig 1: VSEPR Kenning'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 1 — valin lögun',
      steps: [
        {
          clickRole: ['button', 'Stig 1: VSEPR Kenning'],
        },
        {
          // The shape picker is a radio group on a phone and a grid of buttons elsewhere
          // (desktop-compare replays this path at 1280 px), so the chip is found by its label.
          css: 'button:has-text("Octahedral")',
        },
        {
          wait: 500,
        },
      ],
    },
    {
      name: 'Stig 1 — spurning með vísbendingu',
      steps: [
        {
          clickRole: ['button', 'Stig 1: VSEPR Kenning'],
        },
        {
          clickRole: ['button', 'Hefja spurningar'],
        },
        {
          css: 'button.underline',
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 1 — endurgjöf',
      steps: [
        {
          clickRole: ['button', 'Stig 1: VSEPR Kenning'],
        },
        {
          clickRole: ['button', 'Hefja spurningar'],
        },
        {
          css: 'button:has(span.uppercase)',
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 1 — leikur',
      steps: [
        {
          clickRole: ['button', 'Stig 1: VSEPR Kenning'],
        },
        {
          clickRole: ['button', 'Hefja spurningar'],
        },
      ],
      loop: {
        prompt: { css: '[data-item-start]' },
        action: { role: 'button', name: 'Athuga svar' },
        answer: [{ css: 'button:has(span.uppercase)' }],
        verdict: { css: '.feedback-panel' },
        next: { role: 'button', name: 'Næsta spurning' },
        // In landscape the feedback, with its misconception note, is taller than the screen,
        // so Næsta is one scroll below the verdict there (design §5); §6.2.10 still holds the
        // loop usable.
        viewports: ['android', 'iphone', 'se'],
        scrollsToAction: 1,
      },
    },
    {
      name: 'Stig 2 — telja rafeindasvið',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Spá fyrir um lögun'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 2 — leikur',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Spá fyrir um lögun'],
        },
      ],
      loop: {
        prompt: { css: '[data-item-start]' },
        action: { role: 'button', name: 'Athuga svar' },
        // H₂O has two lone pairs: one is wrong, and shows the right count as well.
        answer: [
          { fill: ['div:nth-child(1) > input[type=number]', '2'] },
          { fill: ['div:nth-child(2) > input[type=number]', '1'] },
        ],
        verdict: { css: '#vsepr-l2-verdict' },
        next: { role: 'button', name: 'Næsta skref' },
        viewports: ['android', 'iphone', 'se', 'landscape'],
        scrollsToAction: 1,
        typed: true,
        together: [
          [{ css: '[data-item-start]' }, { css: 'div:nth-child(2) > input[type=number]' }],
        ],
      },
    },
    {
      name: 'Stig 2 — röng talning',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Spá fyrir um lögun'],
        },
        {
          fill: ['div:nth-child(1) > input[type=number]', '5'],
        },
        {
          fill: ['div:nth-child(2) > input[type=number]', '0'],
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 2 — lögun opinberuð',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Spá fyrir um lögun'],
        },
        {
          fill: ['div:nth-child(1) > input[type=number]', '2'],
        },
        {
          fill: ['div:nth-child(2) > input[type=number]', '2'],
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
        {
          // Næsta ignores a press within 400 ms of appearing.
          wait: 500,
        },
        {
          clickRole: ['button', 'Næsta skref'],
        },
        {
          clickRole: ['button', 'Beygð'],
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
        {
          wait: 800,
        },
      ],
    },
    {
      name: 'Stig 2 — tengihorn',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Spá fyrir um lögun'],
        },
        {
          fill: ['div:nth-child(1) > input[type=number]', '2'],
        },
        {
          fill: ['div:nth-child(2) > input[type=number]', '2'],
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
        {
          // Næsta ignores a press within 400 ms of appearing.
          wait: 500,
        },
        {
          clickRole: ['button', 'Næsta skref'],
        },
        {
          clickRole: ['button', 'Beygð'],
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
        {
          // Næsta ignores a press within 400 ms of appearing.
          wait: 500,
        },
        {
          clickRole: ['button', 'Næsta skref'],
        },
        {
          fill: ['input[type=text]', '50'],
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
        {
          wait: 500,
        },
      ],
    },
    {
      name: 'Stig 3 — spurning',
      steps: [
        {
          clickRole: ['button', 'Stig 3: Blendni og skautun'],
        },
        {
          wait: 300,
        },
      ],
      loop: {
        prompt: { css: '[data-item-start]' },
        action: { role: 'button', name: 'Athuga svar' },
        answer: [{ css: 'button:has(span.uppercase)' }],
        verdict: { css: '#vsepr-l3-verdict' },
        next: { role: 'button', name: 'Næsta spurning' },
        viewports: ['android', 'iphone', 'se', 'landscape'],
        scrollsToAction: 1,
        // A hybridization question's verdict is followed by the orbital diagram that explains
        // it; on the SE and in landscape Næsta is one scroll below it (design §5).
        teachingFeedback: true,
      },
    },
    {
      name: 'Stig 3 — endurgjöf og blendnirit',
      steps: [
        {
          clickRole: ['button', 'Stig 3: Blendni og skautun'],
        },
        {
          css: 'button:has(span.uppercase)',
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
        {
          clickRole: ['button', 'Skoða hugtakaútskýringu'],
        },
        {
          wait: 300,
        },
      ],
    },
  ],
  '2-ar/intermolecular-forces': [
    {
      name: 'Valmynd',
      steps: [
        {
          wait: 200,
        },
      ],
    },
    {
      name: 'Stig 1 — kynning',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Greina IMF tegundir'],
        },
      ],
    },
    {
      name: 'Stig 1 — samanburður krafta',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Greina IMF tegundir'],
        },
        {
          clickRole: ['button', 'Bera saman'],
        },
      ],
    },
    {
      name: 'Stig 1 — valinn kraftur',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Greina IMF tegundir'],
        },
        {
          css: '[aria-label="Veldu krafttegund"] button:nth-child(2)',
        },
      ],
    },
    {
      name: 'Stig 1 — spurning með vísbendingu',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Greina IMF tegundir'],
        },
        {
          clickRole: ['button', 'Hefja æfingar'],
        },
        {
          clickRole: ['button', 'Sýna vísbendingu'],
        },
      ],
    },
    {
      name: 'Stig 1 — endurgjöf',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Greina IMF tegundir'],
        },
        {
          clickRole: ['button', 'Hefja æfingar'],
        },
        {
          clickRole: ['button', 'London dreifikraftar'],
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
      ],
    },
    {
      name: 'Stig 1 — leikur',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Greina IMF tegundir'],
        },
        {
          clickRole: ['button', 'Hefja æfingar'],
        },
      ],
      loop: {
        prompt: { text: 'Hvaða millisameindakraftar eru til staðar' },
        action: { role: 'button', name: 'Athuga svar' },
        // H₂O comes first, and London alone is wrong for it: the longest feedback, with
        // the misconception note.
        answer: [{ clickRole: ['button', 'London dreifikraftar'] }],
        verdict: { css: '.feedback-panel p' },
        next: { role: 'button', name: 'Næsta sameind' },
        // In landscape the feedback is taller than the screen, so Næsta is one scroll
        // below the verdict there (design §5); §6.2.10 still holds the loop usable.
        viewports: ['android', 'iphone', 'se'],
        scrollsToAction: 1,
      },
    },
    {
      name: 'Stig 2 — röðun',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Raða eftir eiginleikum'],
        },
        {
          css: 'div:has(> div:text-is("Tiltæk efni:")) button',
        },
        {
          css: 'div:has(> div:text-is("Tiltæk efni:")) button',
        },
        {
          css: 'div:has(> div:text-is("Tiltæk efni:")) button',
        },
      ],
    },
    {
      name: 'Stig 2 — leikur',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Raða eftir eiginleikum'],
        },
      ],
      loop: {
        prompt: { css: '[data-item-start]' },
        action: { role: 'button', name: 'Athuga röðun' },
        // Each tap moves the first compound left in the pool into the next slot.
        answer: [
          { css: 'div:has(> div:text-is("Tiltæk efni:")) button' },
          { css: 'div:has(> div:text-is("Tiltæk efni:")) button' },
          { css: 'div:has(> div:text-is("Tiltæk efni:")) button' },
        ],
        verdict: { css: '#imf-l2-verdict' },
        next: { role: 'button', name: 'Næsta verkefni' },
        // In landscape the feedback is taller than the screen, so Næsta is one scroll
        // below the verdict there (design §5); §6.2.10 still holds the loop usable.
        viewports: ['android', 'iphone', 'se'],
        scrollsToAction: 1,
      },
    },
    {
      name: 'Stig 2 — endurgjöf',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Raða eftir eiginleikum'],
        },
        {
          css: 'div:has(> div:text-is("Tiltæk efni:")) button',
        },
        {
          css: 'div:has(> div:text-is("Tiltæk efni:")) button',
        },
        {
          css: 'div:has(> div:text-is("Tiltæk efni:")) button',
        },
        {
          clickRole: ['button', 'Athuga röðun'],
        },
      ],
    },
    {
      name: 'Stig 2 — leysni, niðurstaða',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Raða eftir eiginleikum'],
        },
        {
          clickRole: ['button', 'NaCl'],
        },
        {
          clickRole: ['button', '(Skautað)'],
        },
        {
          clickRole: ['button', 'Nei, leysist ekki'],
        },
        {
          wait: 1800,
        },
      ],
    },
    {
      name: 'Stig 3 — spurning',
      steps: [
        {
          clickRole: ['button', 'Stig 3: Flókin greining'],
        },
      ],
      loop: {
        prompt: { css: '[data-item-start]' },
        action: { role: 'button', name: 'Athuga svar' },
        answer: [{ css: '.space-y-3 > button' }],
        verdict: { css: '#imf-l3-verdict' },
        next: { role: 'button', name: 'Næsta spurning' },
        viewports: ['android', 'iphone', 'se', 'landscape'],
        scrollsToAction: 1,
      },
    },
    {
      name: 'Stig 3 — endurgjöf og dýpri skilningur',
      steps: [
        {
          clickRole: ['button', 'Stig 3: Flókin greining'],
        },
        {
          css: '.space-y-3 > button',
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
        {
          clickRole: ['button', 'Dýpri skilningur'],
        },
      ],
    },
  ],
  '2-ar/organic-nomenclature': [
    {
      name: 'Valmynd',
      steps: [
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 1 — forskeyti, 10 kolefni',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Grunnreglur'],
        },
        {
          clickRole: ['button', 'Næsta →'],
        },
        {
          clickRole: ['button', 'Næsta →'],
        },
        {
          clickRole: ['button', 'Næsta →'],
        },
        {
          clickRole: ['button', 'Næsta →'],
        },
        {
          clickRole: ['button', 'Næsta →'],
        },
        {
          clickRole: ['button', 'Næsta →'],
        },
        {
          clickRole: ['button', 'Næsta →'],
        },
        {
          clickRole: ['button', 'Næsta →'],
        },
        {
          clickRole: ['button', 'Næsta →'],
        },
      ],
    },
    {
      name: 'Stig 1 — viðskeyti',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Grunnreglur'],
        },
        {
          clickRole: ['button', 'Næsta →'],
        },
        {
          clickRole: ['button', 'Næsta →'],
        },
        {
          clickRole: ['button', 'Næsta →'],
        },
        {
          clickRole: ['button', 'Næsta →'],
        },
        {
          clickRole: ['button', 'Næsta →'],
        },
        {
          clickRole: ['button', 'Næsta →'],
        },
        {
          clickRole: ['button', 'Næsta →'],
        },
        {
          clickRole: ['button', 'Næsta →'],
        },
        {
          clickRole: ['button', 'Næsta →'],
        },
        {
          clickRole: ['button', 'Viðskeyti →'],
        },
      ],
    },
    {
      name: 'Stig 2 — val á ham',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Nefna sameindir'],
        },
      ],
    },
    {
      name: 'Stig 2 — nafnasmiður',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Nefna sameindir'],
        },
        {
          clickRole: ['button', 'Nefna sameindir'],
        },
      ],
    },
    {
      name: 'Stig 2 — nafnasmiður með hlutum í reitum',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Nefna sameindir'],
        },
        {
          clickRole: ['button', 'Nefna sameindir'],
        },
        {
          css: '[data-drop-pool] [data-item-id="prefix-prop"]',
        },
        {
          css: '[data-zone-id="zone-prefix"]',
        },
        {
          css: '[data-drop-pool] [data-item-id="suffix-en"]',
        },
        {
          css: '[data-zone-id="zone-suffix"]',
        },
      ],
    },
    {
      name: 'Stig 2 — endurgjöf í draga-ham',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Nefna sameindir'],
        },
        {
          clickRole: ['button', 'Nefna sameindir'],
        },
        {
          css: '[data-drop-pool] [data-item-id="prefix-prop"]',
        },
        {
          css: '[data-zone-id="zone-prefix"]',
        },
        {
          css: '[data-drop-pool] [data-item-id="suffix-en"]',
        },
        {
          css: '[data-zone-id="zone-suffix"]',
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
        {
          wait: 600,
        },
      ],
    },
    {
      name: 'Stig 2 — skrifa-hamur, endurgjöf',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Nefna sameindir'],
        },
        {
          clickRole: ['button', 'Nefna sameindir'],
        },
        {
          clickRole: ['button', 'Skipta í skrifa-ham'],
        },
        {
          fill: ['input[type=text]', 'x'],
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
        {
          wait: 600,
        },
      ],
    },
    {
      name: 'Stig 2 — byggja sameind, 8 kolefni',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Nefna sameindir'],
        },
        {
          clickRole: ['button', 'Byggja sameindir'],
        },
        {
          clickRole: ['button', 'Bæta við kolefni'],
        },
        {
          clickRole: ['button', 'Bæta við kolefni'],
        },
        {
          clickRole: ['button', 'Bæta við kolefni'],
        },
        {
          clickRole: ['button', 'Bæta við kolefni'],
        },
      ],
    },
    {
      name: 'Stig 2 — byggja sameind, endurgjöf',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Nefna sameindir'],
        },
        {
          clickRole: ['button', 'Byggja sameindir'],
        },
        {
          clickRole: ['button', 'Sýna vísbendingu'],
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
        {
          wait: 600,
        },
      ],
    },
    {
      name: 'Stig 3 — hóptengi, karboxýlsýra',
      steps: [
        {
          clickRole: ['button', 'Stig 3: Hagnýtar sameindir'],
        },
        {
          clickRole: ['button', 'Næsta →'],
        },
        {
          clickRole: ['button', 'Næsta →'],
        },
        {
          clickRole: ['button', 'Næsta →'],
        },
      ],
    },
    {
      name: 'Stig 3 — áskorun',
      steps: [
        {
          clickRole: ['button', 'Stig 3: Hagnýtar sameindir'],
        },
        {
          clickRole: ['button', 'Næsta →'],
        },
        {
          clickRole: ['button', 'Næsta →'],
        },
        {
          clickRole: ['button', 'Næsta →'],
        },
        {
          clickRole: ['button', 'Byrja áskoranir'],
        },
      ],
    },
    {
      name: 'Stig 3 — endurgjöf',
      steps: [
        {
          clickRole: ['button', 'Stig 3: Hagnýtar sameindir'],
        },
        {
          clickRole: ['button', 'Næsta →'],
        },
        {
          clickRole: ['button', 'Næsta →'],
        },
        {
          clickRole: ['button', 'Næsta →'],
        },
        {
          clickRole: ['button', 'Byrja áskoranir'],
        },
        {
          css: 'button.border-purple-300',
        },
        {
          wait: 600,
        },
      ],
    },
    {
      name: 'Stig 1 — próf, leikur',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Grunnreglur'],
        },
        {
          clickRole: ['button', 'Næsta →'],
        },
        {
          clickRole: ['button', 'Næsta →'],
        },
        {
          clickRole: ['button', 'Næsta →'],
        },
        {
          clickRole: ['button', 'Næsta →'],
        },
        {
          clickRole: ['button', 'Næsta →'],
        },
        {
          clickRole: ['button', 'Næsta →'],
        },
        {
          clickRole: ['button', 'Næsta →'],
        },
        {
          clickRole: ['button', 'Næsta →'],
        },
        {
          clickRole: ['button', 'Næsta →'],
        },
        {
          clickRole: ['button', 'Viðskeyti →'],
        },
        {
          clickRole: ['button', 'Næsta →'],
        },
        {
          clickRole: ['button', 'Næsta →'],
        },
        {
          clickRole: ['button', 'Sameindasmiður →'],
        },
        {
          clickRole: ['button', 'Byrja próf'],
        },
      ],
      loop: {
        prompt: { css: '[data-item-start]' },
        // An option is the commit: tapping one answers.
        action: { css: 'button.border-emerald-300' },
        answer: [],
        verdict: { css: '.feedback-panel' },
        next: { role: 'button', name: 'Næsta spurning' },
        // In landscape the verdict comes to the top and Næsta is one short
        // scroll below the feedback (§5 residual); §6.2.10 still runs.
        viewports: ['android', 'iphone', 'se'],
      },
    },
    {
      name: 'Stig 2 — nafnasmiður, leikur',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Nefna sameindir'],
        },
        {
          clickRole: ['button', 'Nefna sameindir'],
        },
      ],
      loop: {
        prompt: { css: '[data-item-start]' },
        // Pinned to the bottom of a portrait phone (PIN_USES in mobile-vertical.spec.ts).
        action: { role: 'button', name: 'Athuga svar' },
        // A wrong name, prop- + -en for etan: the longest feedback.
        answer: [
          { css: '[data-drop-pool] [data-item-id="prefix-prop"]' },
          { css: '[data-zone-id="zone-prefix"]' },
          { css: '[data-drop-pool] [data-item-id="suffix-en"]' },
          { css: '[data-zone-id="zone-suffix"]' },
        ],
        verdict: { css: '.feedback-panel' },
        next: { role: 'button', name: 'Halda áfram' },
        // The molecule and the pinned Athuga on screen together on arrival.
        together: [[{ css: '[data-item-start]' }, { role: 'button', name: 'Athuga svar' }]],
        viewports: ['android', 'iphone', 'se'],
      },
    },
    {
      name: 'Stig 2 — skrifa-hamur, leikur',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Nefna sameindir'],
        },
        {
          clickRole: ['button', 'Nefna sameindir'],
        },
        {
          clickRole: ['button', 'Skipta í skrifa-ham'],
        },
      ],
      loop: {
        prompt: { css: '[data-item-start]' },
        action: { role: 'button', name: 'Athuga svar' },
        answer: [{ fill: ['input[type=text]', 'x'] }],
        verdict: { css: '#organic-l2-verdict' },
        next: { role: 'button', name: 'Halda áfram' },
        // The formula being named sits close above the field.
        together: [[{ text: 'C₂H₆' }, { css: 'input[type=text]' }]],
        viewports: ['android', 'iphone', 'se', 'landscape'],
        typed: true,
      },
    },
    {
      name: 'Stig 2 — byggja sameind, leikur',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Nefna sameindir'],
        },
        {
          clickRole: ['button', 'Byggja sameindir'],
        },
      ],
      loop: {
        prompt: { css: '[data-item-start]' },
        action: { role: 'button', name: 'Athuga svar' },
        // Four carbons, as the chain starts, for própan: wrong.
        answer: [],
        // The verdict line itself. In landscape the whole panel is taller than
        // the half-screen revealSpan leaves a verdict in, so the panel's foot
        // can sit under the bottom edge while its verdict is being read.
        verdict: { css: '.feedback-panel p' },
        next: { role: 'button', name: 'Næsta áskorun' },
        viewports: ['android', 'iphone', 'se'],
        // None at 360x640 and 390x664; the SE needs one.
        scrollsToAction: 1,
      },
    },
    {
      name: 'Stig 3 — áskorun, leikur',
      steps: [
        {
          clickRole: ['button', 'Stig 3: Hagnýtar sameindir'],
        },
        {
          clickRole: ['button', 'Næsta →'],
        },
        {
          clickRole: ['button', 'Næsta →'],
        },
        {
          clickRole: ['button', 'Næsta →'],
        },
        {
          clickRole: ['button', 'Byrja áskoranir'],
        },
      ],
      loop: {
        prompt: { css: '[data-item-start]' },
        // An option is the commit: tapping one answers.
        action: { css: 'button.border-purple-300' },
        answer: [],
        verdict: { css: '#organic-l3-verdict' },
        next: { role: 'button', name: 'Næsta áskorun' },
        viewports: ['android', 'iphone', 'se', 'landscape'],
      },
    },
  ],
  '2-ar/redox-reactions': [
    {
      name: 'Valmynd',
      steps: [
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 1 — regla',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Oxunartölur'],
        },
      ],
    },
    {
      name: 'Stig 1 — spurning',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Oxunartölur'],
        },
        {
          clickRole: ['button', 'Næsta'],
        },
        {
          clickRole: ['button', 'Næsta'],
        },
        {
          clickRole: ['button', 'Næsta'],
        },
        {
          clickRole: ['button', 'Næsta'],
        },
        {
          clickRole: ['button', 'Næsta'],
        },
        {
          clickRole: ['button', 'Byrja æfingar'],
        },
      ],
      loop: {
        prompt: { css: '[data-item-start]' },
        action: { role: 'button', name: 'Athuga svar' },
        answer: [{ fill: ['input[type="number"]', '99'] }],
        verdict: { css: '.feedback-panel p' },
        next: { role: 'button', name: 'Halda áfram' },
        together: [[{ css: '[data-item-start]' }, { css: 'input[type="number"]' }]],
        // In landscape the feedback is taller than the half-screen column, so Halda áfram
        // is one scroll below the verdict (accepted residual, design §5); the §6.2.10
        // landscape check still runs.
        viewports: ['android', 'iphone', 'se'],
        typed: true,
      },
    },
    {
      name: 'Stig 1 — endurgjöf (rangt svar)',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Oxunartölur'],
        },
        {
          clickRole: ['button', 'Næsta'],
        },
        {
          clickRole: ['button', 'Næsta'],
        },
        {
          clickRole: ['button', 'Næsta'],
        },
        {
          clickRole: ['button', 'Næsta'],
        },
        {
          clickRole: ['button', 'Næsta'],
        },
        {
          clickRole: ['button', 'Byrja æfingar'],
        },
        {
          fill: ['input[type="number"]', '99'],
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
      ],
    },
    {
      name: 'Stig 2 — kennsla',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Greina hvörf'],
        },
      ],
    },
    {
      name: 'Stig 2 — leikur',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Greina hvörf'],
        },
        {
          clickRole: ['button', 'Byrja æfingar'],
        },
      ],
      loop: {
        prompt: { css: '[data-item-start]' },
        // An answer is its own commit: tapping an option grades it.
        action: { css: 'button.border-green-300' },
        answer: [],
        verdict: { css: '#redox-l2-verdict' },
        next: { role: 'button', name: 'Næsta spurning' },
        viewports: ['android', 'iphone', 'se', 'landscape'],
      },
    },
    {
      name: 'Stig 2 — endurgjöf',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Greina hvörf'],
        },
        {
          clickRole: ['button', 'Byrja æfingar'],
        },
        {
          css: 'button.border-green-300',
        },
      ],
    },
    {
      name: 'Stig 2 — hálfhvarf stillt',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Greina hvörf'],
        },
        {
          clickRole: ['button', 'Byrja æfingar'],
        },
        {
          clickRole: ['button', 'MnO₄⁻ → Mn²⁺'],
        },
        {
          clickRole: ['button', 'Næsta skref'],
        },
        {
          clickRole: ['button', 'Næsta skref'],
        },
        {
          clickRole: ['button', 'Næsta skref'],
        },
        {
          clickRole: ['button', 'Næsta skref'],
        },
        {
          clickRole: ['button', 'Næsta skref'],
        },
      ],
    },
    {
      name: 'Stig 2 — galvaníhlað í gangi',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Greina hvörf'],
        },
        {
          clickRole: ['button', 'Byrja æfingar'],
        },
        {
          clickRole: ['button', 'Mg-Cu'],
        },
        {
          clickRole: ['button', 'Keyra'],
        },
        {
          wait: 1000,
        },
      ],
    },
    {
      name: 'Stig 3 — kennsla',
      steps: [
        {
          clickRole: ['button', 'Stig 3: Stilla hvörf'],
        },
      ],
    },
    {
      name: 'Stig 3 — leikur',
      steps: [
        {
          clickRole: ['button', 'Stig 3: Stilla hvörf'],
        },
        {
          clickRole: ['button', 'Byrja æfingar'],
        },
      ],
      loop: {
        prompt: { css: '[data-item-start]' },
        action: { role: 'button', name: 'Staðfesta' },
        answer: [{ fill: ['#oxidized-input', 'Xx'] }, { fill: ['#reduced-input', 'Yy'] }],
        verdict: { css: '#redox-l3-verdict' },
        next: { role: 'button', name: 'Næsta' },
        // The line typed from is the reaction itself, the equation in the problem box.
        together: [[{ css: '[data-item-start] .font-mono' }, { css: '#reduced-input' }]],
        // Stig 3 keeps its layout (design §4); only its chrome is tighter on a phone. In
        // landscape Staðfesta is two short scrolls below the opening heading (the §6.2.10
        // check still runs).
        viewports: ['android', 'iphone', 'se'],
        typed: true,
      },
    },
    {
      name: 'Stig 3 — endurgjöf (rangt svar)',
      steps: [
        {
          clickRole: ['button', 'Stig 3: Stilla hvörf'],
        },
        {
          clickRole: ['button', 'Byrja æfingar'],
        },
        {
          fill: ['#oxidized-input', 'Xx'],
        },
        {
          fill: ['#reduced-input', 'Yy'],
        },
        {
          clickRole: ['button', 'Staðfesta'],
        },
      ],
    },
    {
      name: 'Stig 3 — skref 4 (margfaldarar)',
      steps: [
        {
          clickRole: ['button', 'Stig 3: Stilla hvörf'],
        },
        {
          clickRole: ['button', 'Byrja æfingar'],
        },
        {
          fill: ['#oxidized-input', 'Xx'],
        },
        {
          fill: ['#reduced-input', 'Yy'],
        },
        {
          clickRole: ['button', 'Staðfesta'],
        },
        // Næsta ignores a press within 400 ms of appearing (P3's double-tap guard); a
        // student never reaches it that fast.
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Næsta'],
        },
        {
          fill: ['input[type="number"]', '9'],
        },
        {
          clickRole: ['button', 'Staðfesta'],
        },
        // Næsta ignores a press within 400 ms of appearing (P3's double-tap guard); a
        // student never reaches it that fast.
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Næsta'],
        },
        {
          fill: ['input[type="number"]', '9'],
        },
        {
          clickRole: ['button', 'Staðfesta'],
        },
        // Næsta ignores a press within 400 ms of appearing (P3's double-tap guard); a
        // student never reaches it that fast.
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Næsta'],
        },
      ],
    },
  ],
  '2-ar/rafeindabygging': [
    {
      name: 'Valmynd',
      steps: [
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 1 — kennsla',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Skammtatölur'],
        },
      ],
    },
    {
      name: 'Stig 1 — kennsla 3/3',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Skammtatölur'],
        },
        {
          clickRole: ['button', 'Sjáum dæmi'],
        },
        {
          clickRole: ['button', 'Eitt dæmi til'],
        },
      ],
    },
    {
      name: 'Stig 1 — endurgjöf',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Skammtatölur'],
        },
        {
          clickRole: ['button', 'Sjáum dæmi'],
        },
        {
          clickRole: ['button', 'Eitt dæmi til'],
        },
        {
          clickRole: ['button', 'byrja æfingar'],
        },
        {
          css: 'button.quantum-card',
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
        {
          wait: 600,
        },
      ],
    },
    {
      name: 'Stig 1 — spurning 2',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Skammtatölur'],
        },
        {
          clickRole: ['button', 'Sjáum dæmi'],
        },
        {
          clickRole: ['button', 'Eitt dæmi til'],
        },
        {
          clickRole: ['button', 'byrja æfingar'],
        },
        {
          css: 'button.quantum-card',
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
        // Næsta ignores a press within 400 ms of appearing (P3's double-tap guard); a
        // student never reaches it that fast.
        {
          wait: 500,
        },
        {
          clickRole: ['button', 'Næsta spurning'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 1 — leikur',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Skammtatölur'],
        },
        {
          clickRole: ['button', 'Sjáum dæmi'],
        },
        {
          clickRole: ['button', 'Eitt dæmi til'],
        },
        {
          clickRole: ['button', 'byrja æfingar'],
        },
      ],
      loop: {
        prompt: { css: '[data-item-start]' },
        action: { role: 'button', name: 'Athuga svar' },
        // The first card of the first question, n = 1: one of four.
        answer: [{ css: 'button.quantum-card' }],
        verdict: { css: '#rafeind-l1-verdict' },
        next: { role: 'button', name: 'Næsta spurning' },
        // On the SE, and on a phone on its side before the static header scrolls
        // away, Athuga is one short scroll below the cards (design §5: the
        // 5-option questions); §6.2.10 still holds landscape usable.
      },
    },
    {
      name: 'Stig 2 — kennsla',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Rafeindasmíð'],
        },
      ],
    },
    {
      name: 'Stig 2 — endurgjöf og svigrúmamynd',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Rafeindasmíð'],
        },
        {
          clickRole: ['button', 'Byrja æfingar'],
        },
        {
          fill: ['input.config-input', '1s2'],
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
        {
          wait: 600,
        },
      ],
    },
    {
      name: 'Stig 2 — leikur',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Rafeindasmíð'],
        },
        {
          clickRole: ['button', 'Byrja æfingar'],
        },
      ],
      loop: {
        prompt: { css: '[data-item-start]' },
        action: { role: 'button', name: 'Athuga svar' },
        // Wrong for hydrogen: the longest feedback, with the electron count.
        answer: [{ fill: ['input.config-input', '1s2'] }],
        verdict: { css: '#rafeind-l2-verdict' },
        next: { role: 'button', name: 'Næsta frumefni' },
        typed: true,
        together: [[{ css: '[data-item-start]' }, { css: 'input.config-input' }]],
        viewports: ['android', 'iphone', 'se'],
      },
    },
    {
      name: 'Stig 3 — kennsla',
      steps: [
        {
          clickRole: ['button', 'Stig 3: Lotukerfi og rafeindir'],
        },
      ],
    },
    {
      name: 'Stig 3 — endurgjöf',
      steps: [
        {
          clickRole: ['button', 'Stig 3: Lotukerfi og rafeindir'],
        },
        {
          clickRole: ['button', 'Byrja æfingar'],
        },
        {
          css: 'button.mc-option',
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
        {
          wait: 600,
        },
      ],
    },
    {
      name: 'Stig 3 — leikur',
      steps: [
        {
          clickRole: ['button', 'Stig 3: Lotukerfi og rafeindir'],
        },
        {
          clickRole: ['button', 'Byrja æfingar'],
        },
      ],
      loop: {
        prompt: { css: '[data-item-start]' },
        action: { role: 'button', name: 'Athuga svar' },
        answer: [{ css: 'button.mc-option' }],
        verdict: { css: '#rafeind-l3-verdict' },
        next: { role: 'button', name: 'Næsta frumefni' },
        viewports: ['android', 'iphone', 'se'],
      },
    },
    {
      name: 'Stig 3 — undantekning (Cr) endurgjöf',
      steps: [
        {
          clickRole: ['button', 'Stig 3: Lotukerfi og rafeindir'],
        },
        {
          clickRole: ['button', 'Byrja æfingar'],
        },
        {
          css: 'button.mc-option',
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
        {
          wait: 500,
        },
        {
          clickRole: ['button', 'Næsta frumefni'],
        },
        {
          css: 'button.mc-option',
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
        {
          wait: 500,
        },
        {
          clickRole: ['button', 'Næsta frumefni'],
        },
        {
          css: 'button.mc-option',
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
        {
          wait: 600,
        },
      ],
    },
  ],
  '3-ar/ph-titration': [
    {
      name: 'Valmynd',
      steps: [
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 1 — kynning',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Skilningur'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Stig 1 — spurning',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Skilningur'],
        },
        {
          wait: 400,
        },
        {
          clickRole: ['button', 'Byrja æfingu'],
        },
        {
          wait: 400,
        },
      ],
      // The play loops (design §6.1), one per level. Stig 1: the curve is kept at its
      // 240 px floor (design §4), so Staðfesta is one flick below the options on a phone.
      // Not held in landscape, where the feedback is taller than the screen: design §5
      // accepts that residual, and the §6.2.10 landscape check still runs.
      loop: {
        prompt: { css: '[data-item-start]' },
        action: { role: 'button', name: 'Staðfesta' },
        answer: [{ css: 'div.space-y-3 > button' }],
        verdict: { css: '.feedback-panel p' },
        next: { role: 'button', name: 'Næsta' },
        viewports: ['android', 'iphone', 'se'],
        scrollsToAction: 1,
      },
    },
    {
      name: 'Stig 1 — spurning og vísbending',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Skilningur'],
        },
        {
          wait: 400,
        },
        {
          clickRole: ['button', 'Byrja æfingu'],
        },
        {
          wait: 400,
        },
        {
          clickRole: ['button', 'Vísbending 1/4'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Stig 1 — endurgjöf',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Skilningur'],
        },
        {
          wait: 400,
        },
        {
          clickRole: ['button', 'Byrja æfingu'],
        },
        {
          wait: 400,
        },
        {
          css: 'div.space-y-3 > button',
        },
        {
          clickRole: ['button', 'Staðfesta'],
        },
        {
          wait: 500,
        },
      ],
    },
    {
      name: 'Stig 2 — títrun',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Framkvæmd'],
        },
        {
          wait: 400,
        },
        {
          clickRole: ['button', 'Bæta við 5 mL títrant'],
        },
        {
          clickRole: ['button', 'Sýna vísbendingu'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Stig 2 — merkja jafngildispunkt',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Framkvæmd'],
        },
        {
          wait: 400,
        },
        {
          clickRole: ['button', 'Bæta við 5 mL títrant'],
        },
        {
          clickRole: ['button', 'Bæta við 5 mL títrant'],
        },
        {
          clickRole: ['button', 'Bæta við 5 mL títrant'],
        },
        {
          clickRole: ['button', 'Bæta við 5 mL títrant'],
        },
        {
          clickRole: ['button', 'Bæta við 5 mL títrant'],
        },
        {
          clickRole: ['button', 'merkja jafngildispunkt'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Stig 2 — velja vísi',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Framkvæmd'],
        },
        {
          wait: 400,
        },
        {
          clickRole: ['button', 'Bæta við 5 mL títrant'],
        },
        {
          clickRole: ['button', 'Bæta við 5 mL títrant'],
        },
        {
          clickRole: ['button', 'Bæta við 5 mL títrant'],
        },
        {
          clickRole: ['button', 'Bæta við 5 mL títrant'],
        },
        {
          clickRole: ['button', 'Bæta við 5 mL títrant'],
        },
        {
          clickRole: ['button', 'merkja jafngildispunkt'],
        },
        {
          wait: 400,
        },
        {
          clickRole: ['button', 'Staðfesta:'],
        },
        {
          clickRole: ['button', 'Brómþýmólblátt'],
        },
        {
          wait: 400,
        },
      ],
      // Stig 2's commit is the indicator: the steps pour, mark and choose one, and the
      // list (the stage's [data-item-start]) is what the screen opens at. Not held on the
      // SE or in landscape: there the five indicators and Staðfesta val are taller than the
      // screen, so the list's heading scrolls off when the chosen one and the button are
      // brought on screen together. The §6.2.10 landscape check still runs.
      loop: {
        prompt: { css: '[data-item-start]' },
        action: { role: 'button', name: 'Staðfesta val' },
        answer: [],
        verdict: { css: '#ph-l2-verdict' },
        next: { role: 'button', name: 'Næsta' },
      },
    },
    {
      name: 'Stig 2 — niðurstaða',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Framkvæmd'],
        },
        {
          wait: 400,
        },
        {
          clickRole: ['button', 'Bæta við 5 mL títrant'],
        },
        {
          clickRole: ['button', 'Bæta við 5 mL títrant'],
        },
        {
          clickRole: ['button', 'Bæta við 5 mL títrant'],
        },
        {
          clickRole: ['button', 'Bæta við 5 mL títrant'],
        },
        {
          clickRole: ['button', 'Bæta við 5 mL títrant'],
        },
        {
          clickRole: ['button', 'merkja jafngildispunkt'],
        },
        {
          clickRole: ['button', 'Staðfesta:'],
        },
        {
          clickRole: ['button', 'Brómþýmólblátt'],
        },
        {
          clickRole: ['button', 'Staðfesta val'],
        },
        {
          wait: 500,
        },
      ],
    },
    {
      name: 'Stig 3 — spurning',
      steps: [
        {
          clickRole: ['button', 'Stig 3: Útreikningar'],
        },
        {
          wait: 400,
        },
        {
          clickRole: ['button', 'Sýna vísbendingu'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Stig 3 — svar',
      steps: [
        {
          clickRole: ['button', 'Stig 3: Útreikningar'],
        },
        {
          wait: 400,
        },
      ],
      loop: {
        prompt: { css: '[data-item-start]' },
        action: { role: 'button', name: 'Staðfesta svar' },
        answer: [{ fill: ['#ph-titration-l3-answer', '999'] }],
        verdict: { css: '#ph-l3-verdict' },
        next: { role: 'button', name: 'Næsta' },
        // The data the answer is worked from sits within a keyboard's height of the field.
        together: [[{ text: 'Gefið:' }, { css: '#ph-titration-l3-answer' }]],
        viewports: ['android', 'iphone', 'se', 'landscape'],
        typed: true,
      },
    },
    {
      name: 'Stig 3 — endurgjöf og útreikningur',
      steps: [
        {
          clickRole: ['button', 'Stig 3: Útreikningar'],
        },
        {
          wait: 400,
        },
        {
          fill: ['#ph-titration-l3-answer', '999'],
        },
        {
          clickRole: ['button', 'Staðfesta svar'],
        },
        {
          wait: 400,
        },
        {
          clickRole: ['button', 'Sýna útreikningsgang'],
        },
        {
          wait: 400,
        },
      ],
    },
  ],
  '3-ar/gas-law-challenge': [
    {
      name: 'Valmynd',
      steps: [
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 1 — spurning',
      steps: [
        {
          clickRole: ['button', 'Byrja að Æfa'],
        },
        {
          wait: 400,
        },
      ],
      // The play loops (design §6.1): one per level and one for Keppnishamur. Stig 2 and 3
      // skip the law step to reach the answer; the law step itself has no Næsta.
      loop: {
        prompt: { css: '[data-item-start]' },
        action: { role: 'button', name: 'Athuga Svar' },
        answer: [{ fill: ['#gas-law-answer', '999999'] }],
        verdict: { css: '#gas-law-verdict' },
        next: { role: 'button', name: 'Næsta spurning' },
        // The data the answer is worked from sits within a keyboard's height of the field.
        together: [[{ text: 'Gefnar upplýsingar:' }, { css: '#gas-law-answer' }]],
        viewports: ['android', 'iphone', 'se', 'landscape'],
        typed: true,
        // The feedback is its own screen, and its worked solution is read in full (design
        // §5): Næsta spurning stays at its foot, one flick below at 360x640 and 390x664,
        // two on the SE and on its side.
        commitLeavesScreen: true,
        teachingFeedback: true,
        teachingFeedbackScrolls: 2,
      },
    },
    {
      name: 'Stig 1 — vísbendingar og lausn',
      steps: [
        {
          clickRole: ['button', 'Byrja að Æfa'],
        },
        {
          wait: 400,
        },
        {
          clickRole: ['button', 'Vísbending (H)'],
        },
        {
          clickRole: ['button', 'Vísbending (H)'],
        },
        {
          clickRole: ['button', 'Sýna lausn'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Stig 1 — villuboð um ógilt svar',
      steps: [
        {
          clickRole: ['button', 'Byrja að Æfa'],
        },
        {
          wait: 400,
        },
        {
          fill: ['#gas-law-answer', 'abc'],
        },
        {
          clickRole: ['button', 'Athuga Svar'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Endurgjöf — rangt svar',
      steps: [
        {
          clickRole: ['button', 'Byrja að Æfa'],
        },
        {
          wait: 400,
        },
        {
          fill: ['#gas-law-answer', '999999'],
        },
        {
          clickRole: ['button', 'Athuga Svar'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Valmynd með árangri',
      steps: [
        {
          clickRole: ['button', 'Byrja að Æfa'],
        },
        {
          wait: 400,
        },
        {
          fill: ['#gas-law-answer', '999999'],
        },
        {
          clickRole: ['button', 'Athuga Svar'],
        },
        {
          wait: 400,
        },
        {
          clickRole: ['button', 'Valmynd'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Stig 2 — skref 1: hvaða lögmál á við',
      steps: [
        {
          clickRole: ['button', 'Stig 2 — Sérstök tilvik'],
        },
        {
          clickRole: ['button', 'Byrja að Æfa'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Stig 2 — rangt lögmál valið',
      steps: [
        {
          clickRole: ['button', 'Stig 2 — Sérstök tilvik'],
        },
        {
          clickRole: ['button', 'Byrja að Æfa'],
        },
        {
          wait: 400,
        },
        {
          clickRole: ['button', 'Kjörgaslögmálið'],
        },
        {
          clickRole: ['button', 'Athuga lögmál'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Stig 3 — lausnarskref með vísbendingum og lausn',
      steps: [
        {
          clickRole: ['button', 'Stig 3 — Samanburður'],
        },
        {
          clickRole: ['button', 'Byrja að Æfa'],
        },
        {
          wait: 400,
        },
        {
          clickRole: ['button', 'Sleppa'],
        },
        {
          wait: 400,
        },
        {
          clickRole: ['button', 'Vísbending (H)'],
        },
        {
          clickRole: ['button', 'Vísbending (H)'],
        },
        {
          clickRole: ['button', 'Sýna lausn'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Stig 2 — lausnarskref',
      steps: [
        {
          clickRole: ['button', 'Stig 2 — Sérstök tilvik'],
        },
        {
          clickRole: ['button', 'Byrja að Æfa'],
        },
        {
          wait: 400,
        },
        {
          clickRole: ['button', 'Sleppa'],
        },
        {
          wait: 400,
        },
      ],
      // The play loops (design §6.1): one per level and one for Keppnishamur. Stig 2 and 3
      // skip the law step to reach the answer; the law step itself has no Næsta.
      loop: {
        prompt: { css: '[data-item-start]' },
        action: { role: 'button', name: 'Athuga Svar' },
        answer: [{ fill: ['#gas-law-answer', '999999'] }],
        verdict: { css: '#gas-law-verdict' },
        next: { role: 'button', name: 'Næsta spurning' },
        // The data the answer is worked from sits within a keyboard's height of the field.
        together: [[{ text: 'Gefnar upplýsingar:' }, { css: '#gas-law-answer' }]],
        viewports: ['android', 'iphone', 'se', 'landscape'],
        typed: true,
        // The feedback is its own screen, and its worked solution is read in full (design
        // §5): Næsta spurning stays at its foot, one flick below at 360x640 and 390x664,
        // two on the SE and on its side.
        commitLeavesScreen: true,
        teachingFeedback: true,
        teachingFeedbackScrolls: 2,
      },
    },
    {
      name: 'Stig 3 — lausnarskref',
      steps: [
        {
          clickRole: ['button', 'Stig 3 — Samanburður'],
        },
        {
          clickRole: ['button', 'Byrja að Æfa'],
        },
        {
          wait: 400,
        },
        {
          clickRole: ['button', 'Sleppa'],
        },
        {
          wait: 400,
        },
      ],
      // The play loops (design §6.1): one per level and one for Keppnishamur. Stig 2 and 3
      // skip the law step to reach the answer; the law step itself has no Næsta.
      loop: {
        prompt: { css: '[data-item-start]' },
        action: { role: 'button', name: 'Athuga Svar' },
        answer: [{ fill: ['#gas-law-answer', '999999'] }],
        verdict: { css: '#gas-law-verdict' },
        next: { role: 'button', name: 'Næsta spurning' },
        // The data the answer is worked from sits within a keyboard's height of the field.
        together: [[{ text: 'Gefnar upplýsingar:' }, { css: '#gas-law-answer' }]],
        viewports: ['android', 'iphone', 'se', 'landscape'],
        typed: true,
        // The feedback is its own screen, and its worked solution is read in full (design
        // §5): Næsta spurning stays at its foot, one flick below at 360x640 and 390x664,
        // two on the SE and on its side.
        commitLeavesScreen: true,
        teachingFeedback: true,
        teachingFeedbackScrolls: 2,
      },
    },
    {
      name: 'Keppnishamur — spurning',
      steps: [
        {
          clickRole: ['button', 'Byrja Keppni'],
        },
        {
          wait: 400,
        },
      ],
      // The 90 s clock runs through the loop; the answer is typed well inside it.
      loop: {
        prompt: { css: '[data-item-start]' },
        action: { role: 'button', name: 'Athuga Svar' },
        answer: [{ fill: ['#gas-law-answer', '999999'] }],
        verdict: { css: '#gas-law-verdict' },
        next: { role: 'button', name: 'Næsta spurning' },
        // The data the answer is worked from sits within a keyboard's height of the field.
        together: [[{ text: 'Gefnar upplýsingar:' }, { css: '#gas-law-answer' }]],
        viewports: ['android', 'iphone', 'se', 'landscape'],
        typed: true,
        // The feedback is its own screen, and its worked solution is read in full (design
        // §5): Næsta spurning stays at its foot, one flick below at 360x640 and 390x664,
        // two on the SE and on its side.
        commitLeavesScreen: true,
        teachingFeedback: true,
        teachingFeedbackScrolls: 2,
      },
    },
    {
      name: 'Keppnishamur — endurgjöf',
      steps: [
        {
          clickRole: ['button', 'Byrja Keppni'],
        },
        {
          wait: 400,
        },
        {
          fill: ['#gas-law-answer', '999999'],
        },
        {
          clickRole: ['button', 'Athuga Svar'],
        },
        {
          wait: 400,
        },
      ],
    },
  ],
  '3-ar/jafnvaegisfasti': [
    {
      name: 'Valmynd',
      steps: [
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Kanna — allar fjórar blöndur',
      steps: [
        {
          clickRole: ['button', 'Kanna'],
        },
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Bara myndefni'],
        },
        {
          clickRole: ['button', 'Mikið af myndefnum'],
        },
        {
          clickRole: ['button', 'Tífalt þynnra'],
        },
        {
          clickRole: ['button', 'Bara hvarfefni'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Valmynd — Kanna lokið',
      steps: [
        {
          clickRole: ['button', 'Kanna'],
        },
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Bara myndefni'],
        },
        {
          clickRole: ['button', 'Mikið af myndefnum'],
        },
        {
          clickRole: ['button', 'Tífalt þynnra'],
        },
        {
          clickRole: ['button', 'Bara hvarfefni'],
        },
        // "Áfram" ignores a press within 400 ms of the fourth mixture.
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Áfram'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Skilja — skref 5',
      steps: [
        {
          clickRole: ['button', 'Skilja'],
        },
        // "Næsta" ignores a press within 400 ms of appearing (the double-tap
        // guard); a student reads the step first.
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Næsta'],
        },
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Næsta'],
        },
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Næsta'],
        },
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Næsta'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Æfa — Skrifa stæðuna, endurgjöf',
      steps: [
        {
          clickRole: ['button', 'Æfa'],
        },
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Athuga'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Æfa — Spá fyrir um stefnu, endurgjöf',
      steps: [
        {
          clickRole: ['button', 'Æfa'],
        },
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Spá fyrir um stefnu'],
        },
        {
          clickRole: ['button', 'Þegar í jafnvægi'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Æfa — Kc yfir í Kp, endurgjöf',
      steps: [
        {
          clickRole: ['button', 'Æfa'],
        },
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Kc yfir í Kp'],
        },
        {
          fill: ['input[aria-label="Tala"]', '9,9'],
        },
        {
          fill: ['input[aria-label="Veldisvísir"]', '9'],
        },
        {
          clickRole: ['button', 'Athuga'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Æfa — Tengd jafnvægi, röng jafna',
      steps: [
        {
          clickRole: ['button', 'Æfa'],
        },
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Tengd jafnvægi'],
        },
        {
          clickRole: ['button', 'Athuga jöfnuna'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Æfa — Tengd jafnvægi, fastinn rangur',
      steps: [
        {
          clickRole: ['button', 'Æfa'],
        },
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Tengd jafnvægi'],
        },
        {
          clickRole: ['button', 'Snúa við'],
        },
        {
          clickRole: ['button', 'Athuga jöfnuna'],
        },
        {
          fill: ['input[aria-label="Tala"]', '9,9'],
        },
        {
          fill: ['input[aria-label="Veldisvísir"]', '9'],
        },
        {
          clickRole: ['button', 'Athuga'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Beita — ICE-tafla, x',
      steps: [
        {
          clickRole: ['button', 'Beita'],
        },
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Áfram — myndefnin aukast'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Beita — rangt x, endurgjöf',
      steps: [
        {
          clickRole: ['button', 'Beita'],
        },
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Áfram — myndefnin aukast'],
        },
        {
          fill: ['input[aria-label="Tala"]', '9,9'],
        },
        {
          fill: ['input[aria-label="Veldisvísir"]', '9'],
        },
        {
          clickRole: ['button', 'Athuga'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Beita — 5 % reglan, niðurstaða',
      steps: [
        {
          clickRole: ['button', 'Beita'],
        },
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Áfram — myndefnin aukast'],
        },
        {
          clickRole: ['button', 'Athuga'],
        },
        // "Sýna svarið" ignores a press within 400 ms of the check.
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Sýna svarið og halda áfram'],
        },
        {
          clickRole: ['button', 'Nei — það verður að leysa'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Kanna — blanda valin',
      steps: [
        {
          clickRole: ['button', 'Kanna'],
        },
      ],
      loop: {
        prompt: { css: 'main h2' },
        // Picking a mixture brings its result on screen with the mixtures, and
        // focus to the settled mixture; the mixtures stay in view for the next.
        action: { role: 'button', name: 'Bara myndefni' },
        answer: [],
        verdict: { role: 'heading', name: 'Í jafnvægi' },
        next: { role: 'button', name: 'Mikið af myndefnum' },
        viewports: ['android', 'iphone', 'se', 'landscape'],
      },
    },
    {
      name: 'Skilja — næsta skref',
      steps: [
        {
          clickRole: ['button', 'Skilja'],
        },
        {
          wait: 300,
        },
      ],
      loop: {
        prompt: { css: 'main h2' },
        action: { role: 'button', name: 'Næsta' },
        answer: [],
        verdict: { text: 'Fast efni og hreinn vökvi fara' },
        next: { role: 'button', name: 'Næsta' },
        // A teaching step: "Næsta" sits at its foot, a reading scroll down.
        scrollsToAction: 1,
        teachingFeedback: true,
        viewports: ['android', 'iphone', 'se', 'landscape'],
      },
    },
    {
      name: 'Æfa — Skrifa stæðuna, dæmi 1',
      steps: [
        {
          clickRole: ['button', 'Æfa'],
        },
      ],
      loop: {
        prompt: { css: '[data-item-start]' },
        action: { role: 'button', name: 'Athuga' },
        answer: [{ css: 'main button[aria-pressed]' }],
        verdict: { text: 'Ekki alveg.' },
        next: { role: 'button', name: 'Næsta dæmi' },
        viewports: ['android', 'iphone', 'se', 'landscape'],
      },
    },
    {
      name: 'Æfa — Spá fyrir um stefnu, dæmi 1',
      steps: [
        {
          clickRole: ['button', 'Æfa'],
        },
        {
          clickRole: ['button', 'Spá fyrir um stefnu'],
        },
      ],
      loop: {
        prompt: { css: '[data-item-start]' },
        action: { role: 'button', name: 'Þegar í jafnvægi' },
        answer: [],
        verdict: { text: 'Rangt.' },
        next: { role: 'button', name: 'Næsta dæmi' },
        viewports: ['android', 'iphone', 'se', 'landscape'],
      },
    },
    {
      name: 'Æfa — Kc yfir í Kp, dæmi 1',
      steps: [
        {
          clickRole: ['button', 'Æfa'],
        },
        {
          clickRole: ['button', 'Kc yfir í Kp'],
        },
      ],
      loop: {
        prompt: { css: '[data-item-start]' },
        action: { role: 'button', name: 'Athuga' },
        answer: [
          { fill: ['input[aria-label="Tala"]', '9,9'] },
          { fill: ['input[aria-label="Veldisvísir"]', '9'] },
        ],
        verdict: { text: 'Hvorugt stemmir' },
        next: { role: 'button', name: 'Næsta dæmi' },
        together: [[{ css: '[data-item-start]' }, { css: 'input[aria-label="Tala"]' }]],
        viewports: ['android', 'iphone', 'se', 'landscape'],
        typed: true,
      },
    },
    {
      name: 'Æfa — Tengd jafnvægi, dæmi 1',
      steps: [
        {
          clickRole: ['button', 'Æfa'],
        },
        {
          clickRole: ['button', 'Tengd jafnvægi'],
        },
        {
          clickRole: ['button', 'Snúa við'],
        },
      ],
      loop: {
        prompt: { css: '[data-item-start]' },
        // The target and the equation being built are on screen together
        // (pinned together on a portrait phone). A match opens the constant:
        // focus goes to its number field, and its Athuga is the next action.
        action: { role: 'button', name: 'Athuga jöfnuna' },
        answer: [],
        verdict: { text: 'Jafnan stemmir' },
        next: { role: 'button', name: 'Athuga' },
        advance: {
          steps: [
            // Past the 400 ms guard on what `next` brought up.
            { wait: 450 },
            { clickRole: ['button', 'Sýna svarið og halda áfram'] },
          ],
          next: { role: 'button', name: 'Næsta dæmi' },
        },
        together: [[{ css: '[data-item-start]' }, { text: 'Jafnan eins og þú stilltir hana' }]],
        viewports: ['android', 'iphone', 'se', 'landscape'],
      },
    },
    {
      name: 'Beita — x',
      steps: [
        {
          clickRole: ['button', 'Beita'],
        },
        {
          clickRole: ['button', 'Áfram — myndefnin aukast'],
        },
      ],
      loop: {
        prompt: { css: '[data-item-start]' },
        action: { role: 'button', name: 'Athuga' },
        answer: [
          { fill: ['input[aria-label="Tala"]', '9,9'] },
          { fill: ['input[aria-label="Veldisvísir"]', '9'] },
        ],
        verdict: { text: 'Hvorugt stemmir enn' },
        next: { role: 'button', name: 'Sýna svarið og halda áfram' },
        together: [[{ css: 'main table' }, { css: 'input[aria-label="Tala"]' }]],
        // On the SE (375x548) the step opens from the table down to its
        // button, and the problem above it is one short scroll up (design §5:
        // the SE is the stretch target).
        viewports: ['android', 'iphone', 'landscape'],
        typed: true,
      },
    },
    {
      name: 'Beita — 5 % reglan',
      steps: [
        {
          clickRole: ['button', 'Beita'],
        },
        {
          clickRole: ['button', 'Áfram — myndefnin aukast'],
        },
        {
          clickRole: ['button', 'Athuga'],
        },
        // "Sýna svarið" ignores a press within 400 ms of the check.
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Sýna svarið og halda áfram'],
        },
      ],
      loop: {
        prompt: { css: '[data-item-start]' },
        action: { role: 'button', name: 'Nei — það verður að leysa' },
        answer: [],
        verdict: { text: 'Stærsta breytingin er' },
        next: { role: 'button', name: 'Næsta dæmi' },
        // On the SE (375x548) the step opens from the table down to its
        // button, and the problem above it is one short scroll up (design §5:
        // the SE is the stretch target).
        viewports: ['android', 'iphone', 'landscape'],
      },
    },
  ],
  '3-ar/equilibrium-shifter': [
    {
      name: 'Valmynd',
      steps: [
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Lærdómshamur — veldu álag',
      steps: [
        {
          clickRole: ['button', 'Lærdómshamur'],
        },
        {
          wait: 600,
        },
      ],
    },
    {
      name: 'Lærdómshamur — álag valið, spá',
      steps: [
        {
          clickRole: ['button', 'Lærdómshamur'],
        },
        {
          wait: 600,
        },
        {
          css: '.stress-btn',
        },
        {
          wait: 400,
        },
      ],
      loop: {
        // The stress stays on screen through the answer; the question does not.
        prompt: { text: 'Álag sem beitt er:' },
        action: { role: 'button', name: 'Til vinstri' },
        answer: [],
        verdict: { css: '.explanation-box > [id]' },
        next: { role: 'button', name: 'Næsta jafnvægi' },
        // The reaction, its ΔH, the stress and the answer buttons together.
        together: [
          [
            { css: '[data-item-start]' },
            { text: 'Álag sem beitt er:' },
            { role: 'button', name: 'Til vinstri' },
          ],
        ],
        viewports: ['android', 'iphone', 'se'],
        // The explanation (Q vs K, the numbers, the reasoning) is read in full
        // (design §5): Næsta stays at its foot, about 1 000–1 300 px below
        // the verdict, so it is more than one scroll away by design.
        teachingFeedback: true,
        teachingFeedbackScrolls: 3,
      },
    },
    {
      name: 'Lærdómshamur — allar vísbendingar opnar',
      steps: [
        {
          clickRole: ['button', 'Lærdómshamur'],
        },
        {
          wait: 600,
        },
        {
          css: '.stress-btn',
        },
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Vísbending'],
        },
        {
          clickRole: ['button', 'Vísbending'],
        },
        {
          clickRole: ['button', 'Vísbending'],
        },
        {
          clickRole: ['button', 'Vísbending'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Lærdómshamur — endurgjöf (Q/K og tölur)',
      steps: [
        {
          clickRole: ['button', 'Lærdómshamur'],
        },
        {
          wait: 600,
        },
        {
          css: '.stress-btn',
        },
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Engin hliðrun'],
        },
        {
          wait: 800,
        },
      ],
    },
    {
      name: 'Lærdómshamur — Prófa annað álag',
      steps: [
        {
          clickRole: ['button', 'Lærdómshamur'],
        },
        {
          wait: 600,
        },
        {
          css: '.stress-btn',
        },
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Engin hliðrun'],
        },
        {
          wait: 800,
        },
        {
          clickRole: ['button', 'Prófa annað álag'],
        },
        {
          wait: 500,
        },
      ],
    },
    {
      name: 'Lærdómshamur — næsta jafnvægi',
      steps: [
        {
          clickRole: ['button', 'Lærdómshamur'],
        },
        {
          wait: 600,
        },
        {
          css: '.stress-btn',
        },
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Til vinstri'],
        },
        {
          wait: 800,
        },
        {
          clickRole: ['button', 'Næsta jafnvægi'],
        },
        {
          wait: 600,
        },
      ],
    },
    {
      name: 'Há birtuskil — endurgjöf',
      // On a phone Aðgengisval starts closed (a PhoneDisclosure): the first
      // step opens it and the second ticks the box. Off a phone there is no
      // disclosure button, so the first step ticks the box and the second
      // lands on the footer, which does nothing — desktop-compare replays
      // these paths at 1280x800.
      steps: [
        {
          css: 'main button[aria-controls][aria-expanded="false"], main input[type=checkbox]:not(:checked)',
        },
        {
          css: 'main input[type=checkbox]:not(:checked), footer',
        },
        {
          wait: 200,
        },
        {
          clickRole: ['button', 'Lærdómshamur'],
        },
        {
          wait: 600,
        },
        {
          css: '.stress-btn',
        },
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Til hægri'],
        },
        {
          wait: 800,
        },
      ],
    },
    {
      name: 'Til baka í valmynd',
      steps: [
        {
          clickRole: ['button', 'Lærdómshamur'],
        },
        {
          wait: 600,
        },
        {
          clickRole: ['button', 'Til baka'],
        },
        {
          wait: 600,
        },
      ],
    },
  ],
  '3-ar/syrufastinn': [
    {
      name: 'Valmynd',
      steps: [
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Kanna — útskýring',
      steps: [
        {
          clickRole: ['button', 'Kanna'],
        },
        {
          css: 'main button.game-btn:not([disabled])',
        },
        {
          css: 'main button.game-btn:not([disabled])',
        },
        {
          css: 'main button.game-btn:not([disabled])',
        },
        // The answers ignore a press within 400 ms of the question appearing.
        {
          wait: 300,
        },
        {
          click: 'Hann helst sá sami',
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Skilja — ICE-taflan',
      steps: [
        {
          clickRole: ['button', 'Skilja'],
        },
        {
          clickRole: ['button', '2. ICE-taflan'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Skilja — 5 % reglan',
      steps: [
        {
          clickRole: ['button', 'Skilja'],
        },
        {
          clickRole: ['button', '5. 5 % reglan'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Æfa — skref 1 með vísbendingum',
      steps: [
        {
          clickRole: ['button', 'Æfa'],
        },
        {
          click: 'Vísbending 1 af 3',
        },
        {
          click: 'Vísbending 2 af 3',
        },
        {
          click: 'Vísbending 3 af 3',
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Æfa — skref 1, rangt svar',
      steps: [
        {
          clickRole: ['button', 'Æfa'],
        },
        {
          fill: ['#answer', '5'],
        },
        {
          click: 'Athuga',
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Æfa — skref 2, 5 % athugun',
      steps: [
        {
          clickRole: ['button', 'Æfa'],
        },
        {
          fill: ['#answer', '5'],
        },
        {
          click: 'Athuga',
        },
        // Áfram / Næsta ignores a press within 400 ms of appearing (P3's
        // double-tap guard); a student never reaches it that fast.
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Áfram'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Æfa — skref 3, rangt pH',
      steps: [
        {
          clickRole: ['button', 'Æfa'],
        },
        {
          fill: ['#answer', '5'],
        },
        {
          click: 'Athuga',
        },
        // Áfram / Næsta ignores a press within 400 ms of appearing (P3's
        // double-tap guard); a student never reaches it that fast.
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Áfram'],
        },
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Áfram'],
        },
        {
          fill: ['#answer', '9'],
        },
        {
          click: 'Athuga',
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Beita — dæmi 1, rangt svar',
      steps: [
        {
          clickRole: ['button', 'Beita'],
        },
        {
          fill: ['#apply-answer', '0'],
        },
        {
          click: 'Svara',
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Beita — dæmi 2 (Ka), rangt svar',
      steps: [
        {
          clickRole: ['button', 'Beita'],
        },
        {
          fill: ['#apply-answer', '0'],
        },
        {
          click: 'Svara',
        },
        // Áfram / Næsta ignores a press within 400 ms of appearing (P3's
        // double-tap guard); a student never reaches it that fast.
        {
          wait: 300,
        },
        {
          click: 'Næsta dæmi',
        },
        {
          fill: ['#apply-answer', '0'],
        },
        {
          click: 'Svara',
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Kanna — mæling',
      steps: [
        {
          clickRole: ['button', 'Kanna'],
        },
      ],
      loop: {
        prompt: { css: 'main h2' },
        action: { role: 'button', name: '1,000 M' },
        answer: [],
        verdict: { css: 'tbody tr' },
        // The concentrations stay on screen with the new row, for the next one.
        next: { role: 'button', name: '0,500 M' },
        viewports: ['android', 'iphone', 'se', 'landscape'],
      },
    },
    {
      name: 'Skilja — næsta skref',
      steps: [
        {
          clickRole: ['button', 'Skilja'],
        },
        // "Næsta skref" ignores a press within 400 ms of appearing, as every
        // Næsta does; a student reads the step first.
        {
          wait: 300,
        },
      ],
      loop: {
        prompt: { css: 'main h2' },
        action: { role: 'button', name: 'Næsta skref →' },
        answer: [],
        verdict: { text: 'ICE: byrjun, breyting, jafnvægi' },
        next: { role: 'button', name: 'Næsta skref →' },
        // A teaching step: "Næsta skref" sits at its foot, one reading scroll down.
        scrollsToAction: 1,
        teachingFeedback: true,
        viewports: ['android', 'iphone', 'se', 'landscape'],
      },
    },
    {
      name: 'Æfa — skref 1',
      steps: [
        {
          clickRole: ['button', 'Æfa'],
        },
      ],
      loop: {
        prompt: { css: '[data-item-start]' },
        action: { role: 'button', name: 'Athuga' },
        answer: [{ fill: ['#answer', '5'] }],
        verdict: { css: '.feedback-panel' },
        next: { role: 'button', name: 'Áfram' },
        together: [[{ css: '[data-item-start]' }, { css: '#answer' }]],
        viewports: ['android', 'iphone', 'se', 'landscape'],
        typed: true,
      },
    },
    {
      name: 'Beita — dæmi 1',
      steps: [
        {
          clickRole: ['button', 'Beita'],
        },
      ],
      loop: {
        prompt: { css: '[data-item-start]' },
        action: { role: 'button', name: 'Svara' },
        answer: [{ fill: ['#apply-answer', '0'] }],
        verdict: { css: '.feedback-panel' },
        next: { role: 'button', name: 'Næsta dæmi' },
        together: [[{ css: '[data-item-start]' }, { css: '#apply-answer' }]],
        viewports: ['android', 'iphone', 'se', 'landscape'],
        typed: true,
      },
    },
  ],
  '3-ar/thermodynamics-predictor': [
    {
      name: 'Valmynd',
      steps: [
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Könnun',
      steps: [
        {
          clickRole: ['button', 'Könnun'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Könnun — hátt hitastig (ekki sjálfgengt)',
      steps: [
        {
          clickRole: ['button', 'Könnun'],
        },
        {
          wait: 400,
        },
        {
          css: '#thermo-discover-temp',
        },
        {
          press: 'End',
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Æfingarhamur — spurning',
      steps: [
        {
          clickRole: ['button', 'Æfingarhamur'],
        },
        {
          wait: 400,
        },
      ],
      loop: {
        prompt: { css: '[data-item-start]' },
        action: { role: 'button', name: 'Athuga svar' },
        answer: [{ fill: ['#thermo-delta-g', '99999'] }, { clickRole: ['radio', 'Jafnvægi'] }],
        verdict: { css: '#thermo-feedback' },
        next: { role: 'button', name: 'Næsta spurning' },
        viewports: ['android', 'iphone', 'se', 'landscape'],
        typed: true,
        typedDataApart:
          'Design §4 (thermodynamics-predictor) orders the problem, the temperature slider, the graph ' +
          'and then the answer card, and the Outcome accepts Athuga two flicks down. At 360x640 ' +
          'ΔH° and ΔS° sit at page y 220-278 and the ΔG° field at about 1 120-1 165, some 945 px ' +
          "apart; the field's label restates the temperature only.",
        // In play order the slider's graph sits between the problem and the answer, so
        // "Athuga svar" is below the first screen: two flicks at 360x640, 390x664 and the SE.
        scrollsToAction: 2,
      },
    },
    {
      name: 'Æfingarhamur — svar slegið inn',
      steps: [
        {
          clickRole: ['button', 'Æfingarhamur'],
        },
        {
          wait: 400,
        },
        {
          fill: ['#thermo-delta-g', '99999'],
        },
        {
          clickRole: ['radio', 'Jafnvægi'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Æfingarhamur — lausn og endurgjöf',
      steps: [
        {
          clickRole: ['button', 'Æfingarhamur'],
        },
        {
          wait: 400,
        },
        {
          fill: ['#thermo-delta-g', '99999'],
        },
        {
          clickRole: ['radio', 'Jafnvægi'],
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
        {
          wait: 800,
        },
      ],
    },
    {
      name: 'Æfingarhamur — næsta spurning',
      steps: [
        {
          clickRole: ['button', 'Æfingarhamur'],
        },
        {
          wait: 400,
        },
        {
          fill: ['#thermo-delta-g', '99999'],
        },
        {
          clickRole: ['radio', 'Jafnvægi'],
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
        {
          wait: 800,
        },
        {
          clickRole: ['button', 'Næsta spurning'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Æfingarhamur — Erfitt með áskorun',
      steps: [
        {
          clickRole: ['button', 'Erfitt'],
        },
        {
          clickRole: ['button', 'Æfingarhamur'],
        },
        {
          wait: 400,
        },
      ],
      // The hardest difficulty adds the 'Áskorun' box, the tallest prompt the game has. At the
      // SE that costs a third flick to "Athuga svar", the SE residual §5 accepts, so the SE is
      // left to the default-difficulty loops above.
      loop: {
        prompt: { css: '[data-item-start]' },
        action: { role: 'button', name: 'Athuga svar' },
        answer: [{ fill: ['#thermo-delta-g', '99999'] }, { clickRole: ['radio', 'Jafnvægi'] }],
        verdict: { css: '#thermo-feedback' },
        next: { role: 'button', name: 'Næsta spurning' },
        viewports: ['android', 'iphone', 'landscape'],
        typed: true,
        typedDataApart:
          'Design §4 (thermodynamics-predictor) orders the problem, the temperature slider, the graph ' +
          'and then the answer card, and the Outcome accepts Athuga two flicks down. At 360x640 ' +
          'ΔH° and ΔS° sit at page y 220-278 and the ΔG° field at about 1 120-1 165, some 945 px ' +
          "apart; the field's label restates the temperature only.",
        scrollsToAction: 2,
      },
    },
    {
      name: 'Keppnishamur — spurning',
      steps: [
        {
          clickRole: ['button', 'Keppnishamur'],
        },
        {
          wait: 400,
        },
      ],
      loop: {
        prompt: { css: '[data-item-start]' },
        action: { role: 'button', name: 'Athuga svar' },
        answer: [{ fill: ['#thermo-delta-g', '99999'] }, { clickRole: ['radio', 'Jafnvægi'] }],
        verdict: { css: '#thermo-feedback' },
        next: { role: 'button', name: 'Næsta spurning' },
        viewports: ['android', 'iphone', 'se', 'landscape'],
        typed: true,
        typedDataApart:
          'Design §4 (thermodynamics-predictor) orders the problem, the temperature slider, the graph ' +
          'and then the answer card, and the Outcome accepts Athuga two flicks down. At 360x640 ' +
          'ΔH° and ΔS° sit at page y 220-278 and the ΔG° field at about 1 120-1 165, some 945 px ' +
          "apart; the field's label restates the temperature only.",
        // In play order the slider's graph sits between the problem and the answer, so
        // "Athuga svar" is below the first screen: two flicks at 360x640, 390x664 and the SE.
        scrollsToAction: 2,
      },
    },
    {
      name: 'Keppnishamur — lausn og endurgjöf',
      steps: [
        {
          clickRole: ['button', 'Keppnishamur'],
        },
        {
          wait: 400,
        },
        {
          fill: ['#thermo-delta-g', '99999'],
        },
        {
          clickRole: ['radio', 'Jafnvægi'],
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
        {
          wait: 800,
        },
      ],
    },
  ],
  '3-ar/buffer-recipe-creator': [
    {
      name: 'Valmynd',
      steps: [
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 1 — rangt svar (endurgjöf)',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Hugmyndafræði'],
        },
        {
          wait: 400,
        },
        {
          clickRole: ['button', 'Bæta við sýrusameind'],
        },
        {
          clickRole: ['button', 'Athuga stuðpúða'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Stig 1 — rétt svar og samanburður við vatn',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Hugmyndafræði'],
        },
        {
          wait: 400,
        },
        {
          clickRole: ['button', 'Athuga stuðpúða'],
        },
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Bæta við 0,01 M sterkri sýru'],
        },
        {
          clickRole: ['button', 'Sýna samanburð við vatn'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 2 — stefna, rangt svar',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Útreikningar'],
        },
        {
          wait: 400,
        },
        {
          clickRole: ['button', 'Lægra'],
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Stig 2 — allar vísbendingar',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Útreikningar'],
        },
        {
          wait: 400,
        },
        {
          clickRole: ['button', 'Vísbending'],
        },
        {
          clickRole: ['button', 'Vísbending'],
        },
        {
          clickRole: ['button', 'Vísbending'],
        },
        {
          clickRole: ['button', 'Vísbending'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Stig 2 — massi, rangt svar',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Útreikningar'],
        },
        {
          wait: 400,
        },
        {
          clickRole: ['button', 'Hærra'],
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
        {
          fill: ['input[inputmode=decimal]', '1,585'],
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
        {
          fill: ['div:has(> label:has-text("Sýrumassi")) > input', '1'],
        },
        {
          fill: ['div:has(> label:has-text("Basamassi")) > input', '1'],
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Stig 2 — lokið, útreikningur og stuðpúðageta',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Útreikningar'],
        },
        {
          wait: 400,
        },
        {
          clickRole: ['button', 'Hærra'],
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
        {
          fill: ['input[inputmode=decimal]', '1,585'],
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
        {
          fill: ['div:has(> label:has-text("Sýrumassi")) > input', '4,64'],
        },
        {
          fill: ['div:has(> label:has-text("Basamassi")) > input', '8,70'],
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
        {
          wait: 500,
        },
      ],
    },
    {
      name: 'Stig 3 — kynning',
      steps: [
        {
          clickRole: ['button', 'Stig 3: Hönnun'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Stig 3 — hlutfall, rangt svar',
      steps: [
        {
          clickRole: ['button', 'Stig 3: Hönnun'],
        },
        {
          wait: 400,
        },
        {
          clickRole: ['button', 'Byrja'],
        },
        {
          fill: ['input[inputmode=decimal]', '99'],
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Stig 3 — lokið, uppskrift',
      steps: [
        {
          clickRole: ['button', 'Stig 3: Hönnun'],
        },
        {
          clickRole: ['button', 'Byrja'],
        },
        {
          fill: ['input[inputmode=decimal]', '1,585'],
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
        {
          fill: ['div:has(> label:has-text("Mól sýru")) > input', '0,00387'],
        },
        {
          fill: ['div:has(> label:has-text("Mól basa")) > input', '0,00613'],
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
        {
          fill: ['div:has(> label:has-text("Rúmmál sýru")) > input', '7,76'],
        },
        {
          fill: ['div:has(> label:has-text("Rúmmál basa")) > input', '12,24'],
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
        {
          wait: 500,
        },
      ],
    },
    {
      name: 'Stig 1 — leikur',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Hugmyndafræði'],
        },
        {
          wait: 400,
        },
      ],
      loop: {
        prompt: { css: '[data-item-start]' },
        action: { role: 'button', name: 'Athuga stuðpúða' },
        // Challenge 1 starts at 5 : 5, inside its band: the check is correct.
        answer: [],
        verdict: { css: '.feedback-panel' },
        next: { role: 'button', name: 'Næsta verkefni' },
        // On a phone the pH, the ratio and its target sit right above the buttons that
        // change them (design §4: 680 px apart before).
        together: [
          [
            { text: 'Núverandi pH:' },
            { text: 'Markmið:' },
            { role: 'button', name: 'Bæta við basasameind' },
            { role: 'button', name: 'Athuga stuðpúða' },
          ],
        ],
        // On a phone on its side the flask card's own column, pH through Athuga, is
        // taller than the screen (a design §5 landscape residual); "stays usable" still runs.
        viewports: ['android', 'iphone', 'se'],
        scrollsToAction: 1,
      },
    },
    {
      name: 'Stig 2 — stefna, leikur',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Útreikningar'],
        },
        {
          wait: 400,
        },
      ],
      loop: {
        prompt: { css: '[data-item-start]' },
        action: { role: 'button', name: 'Athuga svar' },
        answer: [{ clickRole: ['button', 'Lægra'] }],
        verdict: { text: 'Ekki rétt' },
        // A wrong step is answered again: the choices and "Athuga svar" stay with the
        // feedback, which follows them on a phone.
        next: { role: 'button', name: 'Athuga svar' },
        advance: {
          steps: [
            // Past the 400 ms guard on what `next` brought up.
            { wait: 450 },
            { clickRole: ['button', 'Hærra'] },
            { clickRole: ['button', 'Athuga svar'] },
            { wait: 400 },
            { fill: ['input[inputmode=decimal]', '1,585'] },
            { clickRole: ['button', 'Athuga svar'] },
            { wait: 400 },
            { fill: ['div:has(> label:has-text("Sýrumassi")) > input', '4,64'] },
            { fill: ['div:has(> label:has-text("Basamassi")) > input', '8,70'] },
            { clickRole: ['button', 'Athuga svar'] },
          ],
          next: { role: 'button', name: 'Næsta verkefni' },
        },
        together: [
          [{ text: 'pKa' }, { text: 'Markmiðs-pH' }, { role: 'button', name: 'Athuga svar' }],
        ],
        viewports: ['android', 'iphone', 'se', 'landscape'],
        scrollsToAction: 1,
      },
    },
    {
      name: 'Stig 2 — heilt verkefni',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Útreikningar'],
        },
        {
          wait: 400,
        },
      ],
      loop: {
        prompt: { css: '[data-item-start]' },
        action: { role: 'button', name: 'Athuga svar' },
        // The whole puzzle, from its arrival: the direction, the ratio, then both masses.
        answer: [
          { clickRole: ['button', 'Hærra'] },
          { clickRole: ['button', 'Athuga svar'] },
          { wait: 400 },
          { fill: ['input[inputmode=decimal]', '1,585'] },
          { clickRole: ['button', 'Athuga svar'] },
          { wait: 400 },
          { fill: ['div:has(> label:has-text("Sýrumassi")) > input', '4,64'] },
          { fill: ['div:has(> label:has-text("Basamassi")) > input', '8,70'] },
        ],
        verdict: { role: 'heading', name: 'Rétt svar!' },
        next: { role: 'button', name: 'Næsta verkefni' },
        scrollsToAction: 1,
        // On a phone on its side the worked solution is read down to Næsta (a design §5
        // landscape residual); "stays usable" still runs.
        viewports: ['android', 'iphone', 'se'],
        typed: true,
        typedTogether: [
          [
            { text: 'Notaðu heildarstyrkinn' },
            { text: 'Mólmassi:' },
            { css: 'div:has(> label:has-text("Basamassi")) > input' },
          ],
        ],
      },
    },
    {
      name: 'Stig 3 — hlutfall, leikur',
      steps: [
        {
          clickRole: ['button', 'Stig 3: Hönnun'],
        },
        {
          wait: 400,
        },
        {
          clickRole: ['button', 'Byrja'],
        },
        {
          wait: 300,
        },
      ],
      loop: {
        prompt: { css: '[data-item-start]' },
        action: { role: 'button', name: 'Athuga svar' },
        answer: [{ fill: ['input[inputmode=decimal]', '99'] }],
        verdict: { text: 'Ekki rétt' },
        next: { role: 'button', name: 'Athuga svar' },
        advance: {
          steps: [
            // Past the 400 ms guard on what `next` brought up.
            { wait: 450 },
            { fill: ['input[inputmode=decimal]', '1,585'] },
            { clickRole: ['button', 'Athuga svar'] },
            { wait: 400 },
            { fill: ['div:has(> label:has-text("Mól sýru")) > input', '0,00387'] },
            { fill: ['div:has(> label:has-text("Mól basa")) > input', '0,00613'] },
            { clickRole: ['button', 'Athuga svar'] },
            { wait: 400 },
            { fill: ['div:has(> label:has-text("Rúmmál sýru")) > input', '7,76'] },
            { fill: ['div:has(> label:has-text("Rúmmál basa")) > input', '12,24'] },
            { clickRole: ['button', 'Athuga svar'] },
          ],
          next: { role: 'button', name: 'Næsta verkefni' },
        },
        together: [[{ text: 'Formúla:' }, { css: 'input[inputmode=decimal]' }]],
        viewports: ['android', 'iphone', 'se', 'landscape'],
        scrollsToAction: 1,
        typed: true,
      },
    },
    {
      name: 'Stig 3 — heilt verkefni',
      steps: [
        {
          clickRole: ['button', 'Stig 3: Hönnun'],
        },
        {
          wait: 400,
        },
        {
          clickRole: ['button', 'Byrja'],
        },
        {
          wait: 300,
        },
      ],
      loop: {
        prompt: { css: '[data-item-start]' },
        action: { role: 'button', name: 'Athuga svar' },
        // The whole puzzle, from its arrival: the ratio, the moles, then both volumes.
        answer: [
          { fill: ['input[inputmode=decimal]', '1,585'] },
          { clickRole: ['button', 'Athuga svar'] },
          { wait: 400 },
          { fill: ['div:has(> label:has-text("Mól sýru")) > input', '0,00387'] },
          { fill: ['div:has(> label:has-text("Mól basa")) > input', '0,00613'] },
          { clickRole: ['button', 'Athuga svar'] },
          { wait: 400 },
          { fill: ['div:has(> label:has-text("Rúmmál sýru")) > input', '7,76'] },
          { fill: ['div:has(> label:has-text("Rúmmál basa")) > input', '12,24'] },
        ],
        verdict: { role: 'heading', name: 'Rétt svar!' },
        next: { role: 'button', name: 'Næsta verkefni' },
        scrollsToAction: 1,
        viewports: ['android', 'iphone', 'se', 'landscape'],
        typed: true,
        typedTogether: [
          [{ text: 'Sýrubirgð er' }, { css: 'div:has(> label:has-text("Rúmmál basa")) > input' }],
        ],
        // The recipe is a worked solution, read in full: Næsta may be a scroll below it.
        teachingFeedback: true,
      },
    },
  ],
  '3-ar/leysnijafnvaegi': [
    {
      name: 'Valmynd',
      steps: [
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Kanna — sleðinn færður',
      steps: [
        {
          clickRole: ['button', 'Kanna'],
        },
        {
          fill: ['input[type=range]', '3'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Kanna — Mn(OH)₂ í mestu samjón',
      steps: [
        {
          clickRole: ['button', 'Kanna'],
        },
        {
          clickRole: ['button', 'Mn(OH)₂'],
        },
        {
          fill: ['input[type=range]', '5'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Valmynd — Kanna lokið',
      steps: [
        {
          clickRole: ['button', 'Kanna'],
        },
        {
          fill: ['input[type=range]', '3'],
        },
        {
          clickRole: ['button', 'Áfram í Skilja'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Skilja — öll skref og samjónahrif',
      steps: [
        {
          clickRole: ['button', 'Skilja'],
        },
        // "Næsta skref" ignores a press within 400 ms of appearing, as every
        // Næsta does; a student reads the step first.
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Næsta skref'],
        },
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Næsta skref'],
        },
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Næsta skref'],
        },
        {
          css: 'summary',
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Æfa — fyrsta dæmi',
      steps: [
        {
          clickRole: ['button', 'Æfa'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Æfa — endurgjöf við röngu svari',
      steps: [
        {
          clickRole: ['button', 'Æfa'],
        },
        {
          fill: ['input[aria-label="Tala"]', '9'],
        },
        {
          fill: ['input[aria-label="Veldisvísir"]', '-1'],
        },
        {
          clickRole: ['button', 'Athuga'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Æfa — endurgjöf á 1:2 salti',
      steps: [
        {
          clickRole: ['button', 'Æfa'],
        },
        {
          fill: ['input[aria-label="Tala"]', '9'],
        },
        {
          fill: ['input[aria-label="Veldisvísir"]', '-1'],
        },
        {
          clickRole: ['button', 'Athuga'],
        },
        // Næsta ignores a press within 400 ms of appearing (the double-tap
        // guard); a student reads the feedback first.
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Næsta dæmi'],
        },
        {
          fill: ['input[aria-label="Tala"]', '9'],
        },
        {
          fill: ['input[aria-label="Veldisvísir"]', '-1'],
        },
        {
          clickRole: ['button', 'Athuga'],
        },
        // Næsta ignores a press within 400 ms of appearing (the double-tap
        // guard); a student reads the feedback first.
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Næsta dæmi'],
        },
        {
          fill: ['input[aria-label="Tala"]', '9'],
        },
        {
          fill: ['input[aria-label="Veldisvísir"]', '-1'],
        },
        {
          clickRole: ['button', 'Athuga'],
        },
        // Næsta ignores a press within 400 ms of appearing (the double-tap
        // guard); a student reads the feedback first.
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Næsta dæmi'],
        },
        {
          fill: ['input[aria-label="Tala"]', '9'],
        },
        {
          fill: ['input[aria-label="Veldisvísir"]', '-1'],
        },
        {
          clickRole: ['button', 'Athuga'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Beita — myndast botnfall?',
      steps: [
        {
          clickRole: ['button', 'Beita'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Beita — endurgjöf eftir spá',
      steps: [
        {
          clickRole: ['button', 'Beita'],
        },
        {
          clickRole: ['button', 'Já, Q'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Beita — ójöfn rúmmál, endurgjöf',
      steps: [
        {
          clickRole: ['button', 'Beita'],
        },
        {
          clickRole: ['button', 'Nei, Q'],
        },
        // Næsta ignores a press within 400 ms of appearing (the double-tap
        // guard); a student reads the feedback first.
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Næsta dæmi'],
        },
        {
          clickRole: ['button', 'Nei, Q'],
        },
        // Næsta ignores a press within 400 ms of appearing (the double-tap
        // guard); a student reads the feedback first.
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Næsta dæmi'],
        },
        {
          clickRole: ['button', 'Nei, Q'],
        },
        // Næsta ignores a press within 400 ms of appearing (the double-tap
        // guard); a student reads the feedback first.
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Næsta dæmi'],
        },
        {
          clickRole: ['button', 'Nei, Q'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Kanna — salt valið',
      steps: [
        {
          clickRole: ['button', 'Kanna'],
        },
      ],
      loop: {
        prompt: { css: 'main h2' },
        // Picking a salt brings its card on screen with the list, and focus to
        // the card; the list stays in view for the next pick. The verdict is
        // the card's Ksp and molar solubility, whichever salt is picked: the
        // pick moves the list, so a second tap of a double tap can land on a
        // neighbouring salt, which is a second pick, not a skipped answer.
        action: { role: 'button', name: 'AgBr' },
        answer: [],
        verdict: { css: 'main dl' },
        next: { role: 'button', name: 'AgI' },
        viewports: ['android', 'iphone', 'se', 'landscape'],
      },
    },
    {
      name: 'Skilja — næsta skref',
      steps: [
        {
          clickRole: ['button', 'Skilja'],
        },
        // "Næsta skref" ignores a press within 400 ms of appearing.
        {
          wait: 300,
        },
      ],
      loop: {
        prompt: { css: 'main h2' },
        action: { role: 'button', name: 'Næsta skref' },
        answer: [],
        verdict: { text: 'Hver jón fer í veldi' },
        next: { role: 'button', name: 'Næsta skref' },
        // A teaching step: "Næsta skref" sits at the foot of the four rungs,
        // one reading scroll down.
        scrollsToAction: 1,
        teachingFeedback: true,
        viewports: ['android', 'iphone', 'se', 'landscape'],
      },
    },
    {
      name: 'Æfa — dæmi 1',
      steps: [
        {
          clickRole: ['button', 'Æfa'],
        },
      ],
      loop: {
        prompt: { css: '[data-item-start]' },
        action: { role: 'button', name: 'Athuga' },
        answer: [
          { fill: ['input[aria-label="Tala"]', '9'] },
          { fill: ['input[aria-label="Veldisvísir"]', '-1'] },
        ],
        verdict: { text: 'Hvorki tölustafirnir né veldisvísirinn stemma.' },
        next: { role: 'button', name: 'Næsta dæmi' },
        together: [[{ css: '[data-item-start]' }, { css: 'input[aria-label="Tala"]' }]],
        viewports: ['android', 'iphone', 'se', 'landscape'],
        typed: true,
      },
    },
    {
      name: 'Beita — dæmi 1',
      steps: [
        {
          clickRole: ['button', 'Beita'],
        },
      ],
      loop: {
        prompt: { css: '[data-item-start]' },
        action: { role: 'button', name: 'Nei, Q' },
        answer: [],
        verdict: { text: 'Eftir þynningu' },
        next: { role: 'button', name: 'Næsta dæmi' },
        viewports: ['android', 'iphone', 'se', 'landscape'],
      },
    },
  ],
};
