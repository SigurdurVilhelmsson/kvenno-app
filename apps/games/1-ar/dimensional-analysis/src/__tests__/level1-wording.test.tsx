// @vitest-environment jsdom
/**
 * Stig 1's promise that there is no arithmetic, said grammatically.
 *
 * `útreikningur` and `lærdómur` are both masculine, so "no calculations" is
 * `engir útreikningar` (nominative plural) and "visual learning" is `sjónrænn
 * lærdómur`. The level said `Engar útreikninga` — a feminine determiner on a
 * masculine noun, in the accusative — on its intro card and in its footer, and
 * the menu card said `Sjónræn lærdómur - engar útreikninga`. The English and
 * Polish blocks are untouched.
 */

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { challenges } from '../components/challenges/challengeData';
import { Level1Conceptual } from '../components/Level1Conceptual';
import { gameTranslations } from '../i18n';

afterEach(cleanup);

const SRC = join(__dirname, '..');
const CARD = 'Sjónrænn lærdómur – engir útreikningar';

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === '__tests__' ? [] : sourceFiles(full);
    return /\.tsx?$/.test(entry.name) ? [full] : [];
  });
}

describe('Stig 1 says "no calculations" grammatically', () => {
  it('on its intro card and in its footer', () => {
    const { container } = render(<Level1Conceptual onComplete={vi.fn()} onBack={vi.fn()} />);
    const ui = within(container);
    expect(ui.getByText('Engir útreikningar!')).toBeTruthy();
    expect(ui.getByText(`${challenges.length} áskoranir`)).toBeTruthy();

    fireEvent.click(ui.getByRole('button', { name: /Byrja/ }));
    expect(container.textContent).toContain('skilja hugtökin - engir útreikningar!');
  });

  it('on the menu card, in the Icelandic block and in the fallback', () => {
    const levels = gameTranslations.is.levels as { level1: { description: string } };
    expect(levels.level1.description).toBe(CARD);
    const app = readFileSync(join(SRC, 'App.tsx'), 'utf8');
    expect(app).toContain(`t('levels.level1.description', '${CARD}')`);
  });

  it.each(sourceFiles(SRC).map((f) => [f.slice(SRC.length + 1), f]))(
    '%s carries neither ungrammatical form',
    (_name, file) => {
      const text = readFileSync(file, 'utf8');
      expect(text.match(/engar útreikning\w*/i)?.[0]).toBeUndefined();
      expect(text.match(/sjónræn lærdóm\w*/i)?.[0]).toBeUndefined();
    }
  );
});
