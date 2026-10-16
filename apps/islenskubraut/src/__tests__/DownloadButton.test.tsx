// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DownloadButton, GameButton, WordListButton } from '../components/DownloadButton';

describe('DownloadButton', () => {
  it('links to the card the build rendered, under the name the file is saved as', () => {
    render(<DownloadButton categoryId="klaednadur" level="B1" color="#A6500C" />);
    const link = screen.getByRole('link', { name: 'Hlaða niður PDF' });
    // `server/src/scripts/render-spjold.ts` writes spjald-<flokkur>-<stig>.pdf into spjold/.
    expect(link.getAttribute('href')).toBe('/spjold/spjald-klaednadur-B1.pdf');
    expect(link.hasAttribute('download')).toBe(true);
  });

  it('links to the level’s word list, rendered beside the cards', () => {
    render(<WordListButton categoryId="klaednadur" level="B1" color="#A6500C" />);
    const link = screen.getByRole('link', { name: 'Orðalisti (PDF)' });
    // The same script writes ordalisti-<flokkur>-<stig>.pdf beside each card.
    expect(link.getAttribute('href')).toBe('/spjold/ordalisti-klaednadur-B1.pdf');
    expect(link.hasAttribute('download')).toBe(true);
  });

  it('links to the level’s guessing game, rendered beside the cards', () => {
    render(<GameButton categoryId="klaednadur" level="B1" color="#A6500C" />);
    const link = screen.getByRole('link', { name: 'Hvað er þetta? (PDF)' });
    expect(link.getAttribute('href')).toBe('/spjold/giskaleikur-klaednadur-B1.pdf');
    expect(link.hasAttribute('download')).toBe(true);
  });
});
