import { Fragment, type ReactNode } from 'react';

import { allRatios } from '../data/ratios';

/**
 * Prose that names units, laid out so a unit never wraps away from its substance.
 *
 * The correction prompt and the prediction options are sentences built around
 * units like `g Mg·g Mg / mol Mg`. The space inside `g Mg` was an ordinary one,
 * so on a phone a line could end on `Útkoman verður g` and the next begin with
 * `Mg·g Mg / mol Mg` — a unit and a substance read as two different things.
 *
 * Every `unit substance` pair is held in a no-wrap span, and a break is allowed
 * after each `·` so a long product of units can still wrap between two units
 * (the same rule `UnitsDisplay` follows). Not one character changes: the text a
 * student reads, a screen reader speaks and a test queries is the string as
 * built.
 */

const escape = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Longest first, so `g MgO` is held whole rather than as `g Mg` plus `O`. */
const alternation = (words: string[]): string =>
  [...new Set(words)]
    .sort((a, b) => b.length - a.length)
    .map(escape)
    .join('|');

const sides = allRatios.flatMap((r) => [r.left, r.right]);

/**
 * Every unit and every substance the pool knows, in any pairing: an untagged
 * metric card takes the substance of the quantity it meets, so `L NaOH(aq)`
 * appears in prose although no card states it.
 */
const UNIT_WITH_SUBSTANCE = new RegExp(
  `(?:${alternation(sides.map((s) => s.unit))}) (?:${alternation(
    sides.flatMap((s) => (s.species ? [s.species] : []))
  )})(?![\\p{L}\\p{N}])`,
  'gu'
);

export interface TextRun {
  text: string;
  /** A `unit substance` pair, to be kept on one line. */
  unit: boolean;
}

/** Split `text` into the unit pairs it names and the prose between them. */
export function unitRuns(text: string): TextRun[] {
  const runs: TextRun[] = [];
  let last = 0;
  for (const match of text.matchAll(UNIT_WITH_SUBSTANCE)) {
    const start = match.index ?? 0;
    if (start > last) runs.push({ text: text.slice(last, start), unit: false });
    runs.push({ text: match[0], unit: true });
    last = start + match[0].length;
  }
  if (last < text.length) runs.push({ text: text.slice(last), unit: false });
  return runs;
}

/** Prose between units, with a break allowed after each `·`. */
function breakAfterDots(text: string): ReactNode {
  const parts = text.split('·');
  return parts.map((part, i) => (
    <Fragment key={i}>
      {part}
      {i < parts.length - 1 && (
        <>
          ·<wbr />
        </>
      )}
    </Fragment>
  ));
}

export function UnitText({ text }: { text: string }) {
  return (
    <>
      {unitRuns(text).map((run, i) =>
        run.unit ? (
          <span key={i} className="whitespace-nowrap">
            {run.text}
          </span>
        ) : (
          <Fragment key={i}>{breakAfterDots(run.text)}</Fragment>
        )
      )}
    </>
  );
}
