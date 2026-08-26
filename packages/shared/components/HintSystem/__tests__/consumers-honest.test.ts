import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, it, expect } from 'vitest';

// HintSystem's "Stig: x / y" indicator tells a student what the tiers they opened
// have cost them. It is only honest in a game that applies the multiplier it
// reports back through `onPointsChange`.
//
// Four games got this wrong in four different ways during Aug 2026, and two of
// them were mis-recorded in the docs before anyone read the code. Rather than fix
// the fourth call site and wait for a fifth, this encodes the rule:
//
//   a call site either applies the multiplier, or it opts out of showing a cost.
//
// A game that captures the multiplier write-only — `const [, setX] = useState(1.0)`,
// which is how both phantom cases were written — cannot be applying it.

const GAMES = join(__dirname, '..', '..', '..', '..', '..', 'apps', 'games');

function tsxFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      return entry.name === 'node_modules' || entry.name === 'dist' ? [] : tsxFiles(full);
    }
    return entry.name.endsWith('.tsx') ? [full] : [];
  });
}

const callSites = tsxFiles(GAMES)
  .map((file) => ({ file, text: readFileSync(file, 'utf-8') }))
  .filter(({ text }) => text.includes('<HintSystem'))
  .map(({ file, text }) => ({ label: file.slice(GAMES.length + 1), text }));

describe('HintSystem consumers', () => {
  it('finds the call sites at all (guards against this test silently covering nothing)', () => {
    expect(callSites.length).toBeGreaterThan(0);
  });

  it.each(callSites.map((c) => [c.label, c.text]))(
    '%s either applies the hint multiplier or hides the cost',
    (_label, text) => {
      const optsOut = /showPointCost=\{false\}/.test(text);
      if (optsOut) return;

      // Still showing a cost, so it must genuinely read the multiplier back.
      const handler = /onPointsChange=\{(\w+)\}/.exec(text);
      expect(handler, 'shows a cost but never receives the multiplier').not.toBeNull();

      const setter = handler![1];
      // `const [, setFoo] = useState(...)` — the value is discarded, so no code can
      // apply it. `const [foo, setFoo]` is the shape that can.
      const writeOnly = new RegExp(String.raw`\[\s*,\s*${setter}\s*\]`).test(text);
      expect(writeOnly, `${setter} is write-only, so the displayed cost is never charged`).toBe(
        false
      );
    }
  );
});
