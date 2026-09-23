// @vitest-environment jsdom
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { fireEvent, render, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { Level3 } from '../components/Level3';

/**
 * The student-facing Icelandic in this game, held to the textbook and to `ordabok.md`.
 *
 * - **Functional group is `virknihópur`** — `ordabok.md` (`functional group;virknihópur`) and
 *   the textbook's own glossary headword (ch. 20, m68846). The game said `hóptengi`, which has
 *   no occurrence in the textbook, on every Stig 3 screen and as a Stig 1 answer option.
 * - **Names keep their accents**: própan, própen, própýn, búten, bútýn, pentýn, etýn, nónan and
 *   the ending `-ýn` (textbook ch. 20: "viðskeytið -ýn … 1-bútýn"). The game spelled the same
 *   names both ways, sometimes inside one question's four options.
 * - **`forskeyti` and `viðskeyti` are neuter**, plural `forskeyti`/`viðskeyti`; the game wrote
 *   `Forskeytir`/`Viðskeytir` in eight headings. `alkan` is masculine (`alkanar`, `alkönum`), so
 *   the plural is not `Alkön`, and the alkene class is `alken`, not `alkén`.
 * - **Formula questions read `Hvaða formúlu hefur X?`**; `Hvaða formúla á X?` had a nominative
 *   where `eiga` takes an accusative. `Heildarstig` is one word, as the completion screen writes
 *   it. A named prefix takes the article, `forskeytið 'meth-'`, as the quiz's own
 *   `viðskeytið '-an'` does two questions later.
 * - **No subscript minus** (`C₋₄H₁₀`) and **no English**: Stig 3's learn cards carried
 *   `(Functional Groups)` and `(Alcohol)`/`(Aldehyde)`/`(Ketone)`/`(Carboxylic Acid)`.
 *
 * Test files are not scanned, so this header can name the wrong forms it guards against.
 */

const gameRoot = join(__dirname, '..', '..');

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === '__tests__' ? [] : sourceFiles(full);
    return /\.(tsx?|html)$/.test(entry.name) ? [full] : [];
  });
}

const BANNED: { wrong: RegExp; right: string }[] = [
  { wrong: /hóptengi/i, right: 'virknihópur (ordabok.md)' },
  { wrong: /\b(forskeytir|viðskeytir)\b/i, right: 'forskeyti / viðskeyti (neuter plural)' },
  { wrong: /\bAlkön\b/, right: 'Alkanar' },
  { wrong: /\balkén/i, right: 'alken' },
  { wrong: /\balkyn(ar|a)?\b/i, right: 'alkýn' },
  {
    wrong: /\b(propan|propen|propyn|propanól|propanal|etyn|buten|butyn|bútyn|pentyn|nonan)\b/i,
    right: 'the accented name (própan, búten, etýn, …)',
  },
  { wrong: /(^|[^a-z-])-yn\b/, right: '-ýn' },
  { wrong: /Hvaða formúla á /, right: 'Hvaða formúlu hefur …' },
  { wrong: /táknar forskeyti '/, right: "táknar forskeytið '…' (as viðskeytið '-an' beside it)" },
  { wrong: /Heildar stig/, right: 'Heildarstig' },
  { wrong: /₋/, right: 'a plain subscript count' },
  { wrong: /Functional Groups|\b(Alcohol|Aldehyde|Ketone|Carboxylic Acid)\b/, right: 'Icelandic' },
];

describe('organic-nomenclature: Icelandic text', () => {
  it('ships none of the wrong forms, anywhere in the game source or index.html', () => {
    const files = [...sourceFiles(join(gameRoot, 'src')), join(gameRoot, 'index.html')];
    const offences: string[] = [];
    for (const file of files) {
      readFileSync(file, 'utf8')
        .split('\n')
        .forEach((line, i) => {
          for (const { wrong, right } of BANNED) {
            const hit = line.match(wrong);
            if (hit)
              offences.push(`${file.slice(gameRoot.length + 1)}:${i + 1} "${hit[0]}" → ${right}`);
          }
        });
    }
    expect(offences, offences.join('\n')).toEqual([]);
  });

  it('shows no English on the Stig 3 learn cards', () => {
    const rendered = render(<Level3 onComplete={vi.fn()} onBack={vi.fn()} />);
    const ui = within(rendered.container);
    for (let card = 0; card < 4; card++) {
      expect(rendered.container.textContent).not.toMatch(
        /Functional|Alcohol|Aldehyde|Ketone|Carboxylic/
      );
      if (card < 3) fireEvent.click(ui.getByRole('button', { name: /^Næsta/ }));
    }
    expect(ui.getByRole('button', { name: /Byrja áskoranir/ })).toBeTruthy();
  });
});
