import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import App from '../App';

/**
 * Icelandic this game shipped wrong after the September sweep, found in the
 * 2026-09 mobile pass, plus the menu text that had stopped describing Stig 3.
 *
 * Each pattern is written so that it does not itself spell the wrong form —
 * character classes instead — because the platform's text guards scan test
 * files too, and a list of flattened words would trip the guard it sits beside.
 */

const SRC = join(__dirname, '..');
const REPO = join(SRC, '..', '..', '..', '..', '..');

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === '__tests__' ? [] : sourceFiles(path);
    return /\.tsx?$/.test(name) ? [path] : [];
  });
}

const WRONG: { pattern: RegExp; why: string }[] = [
  { pattern: /Sj[o]nr[a]en/, why: 'flattened: "Sjónræn"' },
  { pattern: /St[u]d[u]ll/, why: 'flattened: "Stuðull"' },
  { pattern: /\bkl[a]rast\b/, why: 'flattened: "klárast"' },
  { pattern: /[Þþ]a[d] (er|sem)\b/, why: 'flattened: "Það", "það"' },
  { pattern: /skipta m[a]li\b/, why: 'flattened: "skipta máli"' },
  { pattern: /skiptir m[a]xi\b/, why: 'not a word: "skiptir máli"' },
  { pattern: /hvarfi[d] [a]tt s[e]r st[a]d/, why: 'flattened: "hvarfið átt sér stað"' },
  { pattern: /Hversu mi[k]i[d]\b/, why: 'flattened: "Hversu mikið"' },
  { pattern: /\bf[a]e[r]ri\b/, why: 'flattened: "færri"' },
  { pattern: /\bsameind[u]r\b/, why: 'the plural of sameind is "sameindir"' },
  {
    pattern: /\bheimt[i]r\b/,
    why: 'yield is "heimtur" (ordabok.md), not a form of the verb heimta',
  },
  { pattern: /Heildar[ ]stig/, why: 'a compound: "Heildarstig"' },
  { pattern: /Takmarkandi [H]varfefni/, why: 'Icelandic takes no mid-title capital (hub card)' },
  { pattern: /kepptu við tímann/, why: 'no timers (CLAUDE.md), and Stig 3 has none' },
];

describe('the game source does not carry Icelandic it shipped wrong', () => {
  const files = sourceFiles(SRC);

  it('scans the game source', () => {
    expect(files.length).toBeGreaterThan(10);
    expect(files.some((f) => f.endsWith('i18n.ts'))).toBe(true);
  });

  it.each(WRONG.map((w) => [w.why, w.pattern] as const))('%s', (_why, pattern) => {
    const hits: string[] = [];
    for (const file of files) {
      readFileSync(file, 'utf8')
        .split('\n')
        .forEach((line, i) => {
          if (pattern.test(line))
            hits.push(`${file.slice(SRC.length + 1)}:${i + 1}: ${line.trim()}`);
        });
    }
    expect(hits).toEqual([]);
  });

  it('keeps the diacritics in the Polish block', () => {
    // The Polish title and description render when a student picks the flag.
    const i18n = readFileSync(join(SRC, 'i18n.ts'), 'utf8');
    const pl = i18n.slice(i18n.indexOf('  pl: {'));
    for (const flattened of [/ograniczaj[a]c/, /\bs[i]e\b/, /wydajnos[c]\b/, /\bpojeci[a]\b/]) {
      expect(pl).not.toMatch(flattened);
    }
  });
});

describe('the menu', () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  const hubTitle = () => {
    const hub = readFileSync(join(REPO, 'apps/landing/src/pages/GamesHub.tsx'), 'utf8');
    return hub.match(/title:\s*'([^']+)',\s*\n\s*description:[^\n]*\n\s*slug:\s*'takmarkandi'/)![1];
  };

  it('names the game in the header exactly as its hub card does', () => {
    // game-titles-agree.test.ts reads only a literal gameTitle="…", and this
    // game passes it through t(), so the platform test never saw it.
    const { container } = render(<App />);
    expect(container.querySelector('header h1')?.textContent).toBe(hubTitle());
  });

  it('describes what Stig 3 now asks for', () => {
    const { getByText } = render(<App />);
    const card = getByText('Meistarapróf').closest('button')!;
    expect(card.textContent).toMatch(/í grömmum/);
    expect(card.textContent).toMatch(/fræðilegar heimtur/);
    expect(card.textContent).toMatch(/prósentuheimtur/);
    // Stig 3 never asks for the excess reactant; its review only shows it.
    expect(card.textContent).not.toMatch(/afgang/);
  });
});
