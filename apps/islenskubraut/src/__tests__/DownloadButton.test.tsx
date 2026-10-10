// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { DownloadButton } from '../components/DownloadButton';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('DownloadButton', () => {
  it('reports a failed download beside the button, not in a dialog', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
    const alert = vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<DownloadButton categoryId="dyr" level="A1" color="#2D6A4F" />);
    expect(screen.getByRole('alert').textContent).toBe('');
    fireEvent.click(screen.getByRole('button', { name: 'Hlaða niður PDF' }));

    await waitFor(() =>
      expect(screen.getByRole('alert').textContent).toBe(
        'Villa kom upp við niðurhal. Reyndu aftur.'
      )
    );
    expect(alert).not.toHaveBeenCalled();
  });

  it('saves the file under the name the server gives it', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, blob: () => Promise.resolve(new Blob(['%PDF'])) })
    );
    URL.createObjectURL = vi.fn(() => 'blob:spjald');
    URL.revokeObjectURL = vi.fn();
    const names: string[] = [];
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement
    ) {
      names.push(this.download);
    });

    render(<DownloadButton categoryId="klaednadur" level="B1" color="#A6500C" />);
    fireEvent.click(screen.getByRole('button', { name: 'Hlaða niður PDF' }));

    // `server/src/index.ts` sends `spjald-${flokkur}-${stig}.pdf` in Content-Disposition.
    await waitFor(() => expect(names).toEqual(['spjald-klaednadur-B1.pdf']));
    expect(screen.getByRole('alert').textContent).toBe('');
  });
});
