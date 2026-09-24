import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ALL_PROBLEMS, answer, openProblem, VERDICT } from './play-helpers';
import App from '../App';

/**
 * The Icelandic a student reads.
 *
 * **Why this exists.** The game named one concept several ways and carried grammar slips and
 * English, found reading it through on 2026-09-23. Terms follow
 * `packages/shared/i18n/ordabok.md` (`vermi`, `vermibreyting`, `óreiða`, `útvermið`,
 * `innvermið`, `fast efni`, `vökvi`) and, where it is silent, the school's textbook
 * (`óreiðubreyting`, `örástand`, `vetnisperoxíð`, `við háan hita`, `tvíliðun`).
 *
 * The screens are rendered and read as a student reads them, so a comment in the source that
 * explains a change is not mistaken for the thing it explains.
 */

beforeEach(() => {
  localStorage.clear();
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  Element.prototype.scrollIntoView = () => {};
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

/** What each screen said, and what it says now. */
const REPLACED: [string, string][] = [
  // Terms the glossary settles.
  ['ΔH (entalpía)', 'ΔH (vermi)'],
  ['ΔS (óregla/entrópia)', 'ΔS (óreiða)'],
  ['meiri óreglu', 'meiri óreiðu'],
  ['óreguáhrif', 'óreiðuáhrif'],
  ['en entrópía minnkar', 'en óreiða minnkar'],
  ['ΔH° (varmamismunur)', 'ΔH° (vermibreyting)'],
  ['ΔS° (óreiðumismunur)', 'ΔS° (óreiðubreyting)'],
  ['Entalpía (ΔH°)', 'Vermi (ΔH°)'],
  ['Varmalosandi', 'Útvermið'],
  ['Varmabindandi', 'Innvermið'],
  ['entrópía eykst', 'óreiða eykst'],
  ['entrópía minnkar', 'óreiða minnkar'],
  ['vinnur entrópía', 'vinnur óreiða'],
  ['örstaður', 'örástönd'],
  // English.
  ['Óreiða (Entropy)', 'Óreiða'],
  ['solid → liquid → gas', 'fast efni → vökvi → gas'],
  ['gas → liquid → solid', 'gas → vökvi → fast efni'],
  // Grammar.
  ['tvær drifkraftir', 'tvo drifkrafta'],
  ['ræður orkuáhrifin', 'ráða orkuáhrifin'],
  ['Byrja æfingarhamur', 'Byrja æfingarham'],
  ['Fjögur Atburðarás', 'Fjórar atburðarásir'],
  ['Lofttegundir hvarf', 'Lofttegundir hverfa'],
  // A promise the game does not keep: Æfingarhamur has no hints.
  ['Ótakmarkaður tími, vísbendingar', 'Ótakmarkaður tími'],
];

/** Everything a student can read: the menu, Könnun, and one problem of each ΔS° sign. */
function everyScreen(): string {
  const seen: string[] = [];
  render(<App />);
  seen.push(document.body.textContent ?? '');
  fireEvent.click(screen.getByRole('button', { name: /Könnun/ }));
  seen.push(document.body.textContent ?? '');
  cleanup();
  // Id 9 has ΔS° > 0 and id 10 ΔS° < 0; both scenarios' reasoning follows a wrong verdict.
  for (const id of [9, 10, 3, 4]) {
    openProblem(id);
    answer('99999', VERDICT.equilibrium);
    seen.push(document.body.textContent ?? '');
    cleanup();
  }
  return seen.join('\n');
}

/** Rendered once, on first use, after `beforeEach` has stubbed what jsdom lacks. */
let cached: string | undefined;
const screens = () => (cached ??= everyScreen());

describe('Icelandic on screen', () => {
  it.each(REPLACED)('no longer says "%s"', (old) => {
    expect(screens()).not.toContain(old);
  });

  it.each(REPLACED)('says "%s" as "%s"', (_, now) => {
    expect(screens()).toContain(now);
  });
});

describe('Icelandic in the problem data', () => {
  const strings = ALL_PROBLEMS.flatMap(({ problem }) => [
    problem.name,
    problem.reaction,
    problem.advancedTask ?? '',
  ]);
  const all = strings.join('\n');

  it.each([
    ['vetnisproxíð', 'vetnisperoxíð'],
    ['Próteín', 'Prótín'],
    ['(felltur)', '(fellt)'],
    ['(óvafinn)', '(óvafið)'],
    ['við háum hita', 'við háan hita'],
    ['E° = 1.10 V', 'E° = 1,10 V'],
    // The textbook's word for this very reaction (ch. 18: "tvíliðun NO₂"); `Dímun` is in
    // neither it nor the glossary.
    ['Dímun NO₂', 'Tvíliðun NO₂'],
  ])('"%s" is now "%s"', (old, now) => {
    expect(all).not.toContain(old);
    expect(all).toContain(now);
  });

  it('names melting ice in the genitive', () => {
    expect(strings).not.toContain('Bræðsla ís');
    expect(strings).toContain('Bræðsla íss');
  });
});
