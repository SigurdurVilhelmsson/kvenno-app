import { Fragment } from 'react';

/**
 * Where a worked expression may wrap: between two bracketed factors, as in
 * `(0,15)(0,08206)`, and after a division slash. The hints and solutions write their
 * substitutions without spaces, so on a phone a line such as `V = (0,15)(0,08206)(310)/(1,0)`
 * is wider than the box and the browser used to split it wherever the line ran out,
 * including inside a number (`0,0` on one line and `8206` on the next).
 */
export function splitExpression(text: string): string[] {
  // A loop rather than a lookbehind regex, which older iOS Safari cannot parse.
  const parts: string[] = [];
  let start = 0;
  for (let i = 1; i < text.length; i++) {
    const prev = text[i - 1];
    const next = text[i];
    const betweenFactors = (prev === ')' || prev === ']') && (next === '(' || next === '[');
    const afterSlash = prev === '/' && next.trim() !== '';
    if (betweenFactors || afterSlash) {
      parts.push(text.slice(start, i));
      start = i;
    }
  }
  parts.push(text.slice(start));
  return parts;
}

/** Renders `text` unchanged, with a line-break opportunity at each factor boundary. */
export function FormulaText({ text }: { text: string }) {
  return (
    <>
      {splitExpression(text).map((part, i) => (
        <Fragment key={i}>
          {i > 0 && <wbr />}
          {part}
        </Fragment>
      ))}
    </>
  );
}
