import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { GameScreen } from '../components/GameScreen';
import { questions } from '../data';
import type { GameStats, Variable } from '../types';

/**
 * Misspellings, wrong words and broken agreement that shipped in this game's Icelandic.
 *
 * **Why this exists.** `icelandic-text.test.ts` catches English and the decimal point, and
 * the platform guards catch governed terms and stripped accents. None of them reads
 * grammar, so these sat in front of students until the mobile pass read the screens:
 *
 * - `við fast þrýsðing` in four scenarios — a typo for `þrýsting`, and `þrýstingur` is
 *   masculine, so the adjective is `fastan`, as the textbook writes it.
 * - `fleiri árekstur`: `fleiri` takes a plural, and the plural is `árekstrar`.
 * - `ein breyta er fastlagt`: neuter on the feminine `breyta`.
 * - `Tíma bónus`: a compound written as two words.
 * - `loftbólga` ("air swelling") for `loftbóla` (air bubble); `sprenga loftkútar` for the
 *   intransitive `springa`; `hjólreiðarinnar` (a singular of the plural-only `hjólreiðar`,
 *   cycling) for `reiðhjólsins` (the bicycle).
 * - `lofteinangrun` ("air insulation"), a mistranslation of "gas sample", in a question
 *   that also claimed standard conditions while its answer is 305 K.
 * - `frá réttum svari` (`svar` is neuter: `réttu`) and `15 spurningar svaraðar`
 *   (`svara` governs the dative: `spurningum svarað`).
 * - `10,000m` — a comma as a thousands separator, which Icelandic reads as ten metres.
 * - `tilvalið gas` and `staðalskilyrði`, where `ordabok.md` has `kjörgas` and
 *   `staðalaðstæður`.
 * - `Sameinuð gaslögmál`, a plural, as the name of one law — under
 *   `Af hverju virkar …?`. The textbook defines it as `sameinaða gaslögmálið`.
 */

const BANNED: { pattern: RegExp; why: string }[] = [
  { pattern: /þrýsðing/, why: 'typo for þrýsting' },
  { pattern: /við fast þrýst/, why: 'þrýstingur is masculine: við fastan þrýsting' },
  { pattern: /fleiri\s+árekstur/, why: 'fleiri takes the plural árekstrar' },
  { pattern: /breyta er fastlagt/, why: 'breyta is feminine' },
  { pattern: /Tíma bónus/, why: 'one word: Tímabónus' },
  { pattern: /loftbólg|bólgan/, why: 'a bubble is loftbóla, not bólga (swelling)' },
  { pattern: /sprenga/, why: 'intransitive: springa' },
  { pattern: /hjólreiðarinnar/, why: 'hjólreiðar is plural-only; the bicycle is reiðhjólið' },
  { pattern: /lofteinangrun/, why: 'mistranslation of gas sample: gassýni' },
  { pattern: /réttum svari/, why: 'svar is neuter: réttu svari' },
  { pattern: /spurningar svaraðar/, why: 'svara governs the dative: spurningum svarað' },
  {
    pattern: /\d,\d{3}m\b/,
    why: 'a comma is a decimal comma in Icelandic, not a thousands separator',
  },
  { pattern: /tilvalið gas/, why: 'ordabok.md: ideal gas;kjörgas' },
  { pattern: /staðalskilyrð/, why: 'ordabok.md: STP;staðalaðstæður' },
  { pattern: /Sameinuð gaslögmál/, why: 'one law: Sameinaða gaslögmálið' },
];

const SRC = join(__dirname, '..');

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === '__tests__' ? [] : sourceFiles(path);
    return /\.tsx?$/.test(name) ? [path] : [];
  });
}

describe('Icelandic in this game', () => {
  const files = sourceFiles(SRC);

  it('finds the source files to check', () => {
    expect(files.length).toBeGreaterThanOrEqual(8);
  });

  it.each(BANNED.map((b) => [b.why, b.pattern] as const))('%s', (_why, pattern) => {
    for (const file of files) {
      // JSX wraps prose across lines, so a phrase can straddle a line break: `frá réttum`
      // and `svari` sat on two lines and a line-by-line scan passed them. Runs of
      // whitespace are collapsed first, as the browser renders them.
      const text = readFileSync(file, 'utf8').replace(/\s+/g, ' ');
      expect(text.match(pattern)?.[0] ?? null, relative(SRC, file)).toBeNull();
    }
  });
});

describe('the answer label', () => {
  const STATS: GameStats = {
    score: 0,
    questionsAnswered: 0,
    correctAnswers: 0,
    streak: 0,
    bestStreak: 0,
    hintsUsed: 0,
  };
  const noop = () => {};

  beforeEach(() => {
    // jsdom has no canvas; the particle simulation copes with a missing context.
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // `Finndu` and `Svar fyrir` both govern the accusative. Temperature is `hitastig`, as
  // `ordabok.md` has it and the game's own hints write it; the label used the everyday `hiti`.
  const EXPECTED: Record<Variable, string> = {
    P: 'Finndu þrýsting (P):',
    V: 'Finndu rúmmál (V):',
    T: 'Finndu hitastig (T):',
    n: 'Finndu mólfjölda (n):',
  };

  it.each(Object.entries(EXPECTED))('asks for %s in the accusative', (variable, label) => {
    const question = questions.find((q) => q.find === variable)!;
    render(
      <GameScreen
        currentQuestion={question}
        selectedLevel={1}
        gameMode="practice"
        gameStep="solve"
        selectedLaw={null}
        setSelectedLaw={noop}
        timeRemaining={null}
        userAnswer=""
        setUserAnswer={noop}
        showHint={0}
        showSolution={false}
        setShowSolution={noop}
        validationError={null}
        lawFeedback={null}
        stats={STATS}
        isGameScreenActive={false}
        simulatorShowAnswer={false}
        onCheckAnswer={noop}
        onGetHint={noop}
        onCheckLaw={noop}
        onSkipLaw={noop}
        onBackToMenu={noop}
      />
    );
    const field = screen.getByRole('textbox') as HTMLInputElement;
    expect(field.labels?.[0]?.textContent).toBe(label);
    expect(field.getAttribute('aria-label')).toMatch(
      new RegExp(`^Svar fyrir ${label.slice('Finndu '.length).split(' (')[0]} í einingunni`)
    );
  });
});
