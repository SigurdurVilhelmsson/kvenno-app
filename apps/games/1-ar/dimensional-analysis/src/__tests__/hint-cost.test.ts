import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, it, expect } from 'vitest';

// The April 2026 restructure made hint use free: Level3.tsx computes `efficiencyScore`
// from the number of conversion steps the student chose, never from hints, and the
// level's own intro promises "Þú getur alltaf beðið um vísbendingu án þess að það hafi
// áhrif á einkunn."
//
// Until Aug 2026 the level nonetheless advertised two different penalties that no code
// applied — "⚠️ 10% dregið frá heildareinkunn" on the open hint panel and "(kostar 15%
// af einkunn)" on the button that opens it. Both discouraged exactly the hint use the
// restructure set out to make free, and they did not even agree with each other.
//
// This scans source rather than rendering, because a penalty string can reappear on any
// of the level's screens, not just the one a render test happens to drive.

const SRC = join(__dirname, '..');

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === '__tests__' ? [] : sourceFiles(full);
    return /\.tsx?$/.test(entry.name) ? [full] : [];
  });
}

// Icelandic phrasings for "this costs you marks". `dregið frá` covers "deducted from",
// `kostar ... einkunn` covers "costs ... grade", and the bare percent-of-grade form
// catches a reworded variant of either.
const PENALTY_WORDING = [
  /dregi[ðd]\s+frá/i,
  /kostar[^.\n]{0,40}einkunn/i,
  /\d+\s*%[^.\n]{0,20}einkunn/i,
];

describe('hint affordances in dimensional-analysis', () => {
  it.each(sourceFiles(SRC).map((f) => [f.slice(SRC.length + 1), f]))(
    '%s advertises no grade penalty for using a hint',
    (_label, file) => {
      const text = readFileSync(file, 'utf-8');
      const offenders = text
        .split('\n')
        .map((line, i) => [i + 1, line] as const)
        .filter(([, line]) => PENALTY_WORDING.some((re) => re.test(line)))
        .map(([n, line]) => `${n}: ${line.trim()}`);

      expect(offenders).toEqual([]);
    }
  );

  it('still tells the student hints are free', () => {
    const level3 = readFileSync(join(SRC, 'components', 'Level3.tsx'), 'utf-8');
    expect(level3).toContain('án þess að það hafi');
    expect(level3).toContain('áhrif á einkunn');
  });
});
