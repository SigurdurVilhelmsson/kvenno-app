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

export interface GameScreen {
  name: string;
  steps: ScreenStep[];
}

export const GAME_SCREENS: Record<string, GameScreen[]> = {};
