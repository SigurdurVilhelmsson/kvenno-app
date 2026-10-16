// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { DrogContext, HljodCredit, Hlusta } from '../components/Hlusta';

// One approved recording and one draft.
vi.mock('../data/hljod', () => ({
  HLJOD_VOICE: 'Rödd C, CC BY 4.0',
  hljod: {
    feldur: { file: 'a.mp3', approved: true },
    hali: { file: 'b.mp3', approved: false },
  },
}));

const played: string[] = [];
class FakeAudio {
  constructor(public src: string) {}
  play() {
    played.push(this.src);
    return Promise.resolve();
  }
  pause() {}
}
vi.stubGlobal('Audio', FakeAudio);
afterEach(() => {
  played.length = 0;
});

describe('Hlusta', () => {
  it('plays an approved recording, named for its text', () => {
    render(<Hlusta text="feldur" color="#000" />);
    fireEvent.click(screen.getByRole('button', { name: 'Hlusta: feldur' }));
    expect(played).toEqual(['/hljod/a.mp3']);
  });

  it('shows nothing for a draft, or for a text with no recording', () => {
    const { container } = render(
      <>
        <Hlusta text="hali" color="#000" />
        <Hlusta text="hreistur" color="#000" />
      </>
    );
    expect(container.innerHTML).toBe('');
  });

  it('plays a draft under ?drog', () => {
    render(
      <DrogContext.Provider value={true}>
        <Hlusta text="hali" color="#000" />
      </DrogContext.Provider>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Hlusta: hali' }));
    expect(played).toEqual(['/hljod/b.mp3']);
  });

  it('credits the voice', () => {
    render(<HljodCredit />);
    expect(screen.getByText(/Rödd C, CC BY 4\.0/)).toBeDefined();
  });
});
