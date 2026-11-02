// @vitest-environment jsdom
/**
 * The PDF.js worker refuses to run for a library of another version ("The API version … does not
 * match the Worker version …"). Production builds live under a subpath, so they always load the
 * worker from cdnjs, and that URL must name the version of the library actually bundled. It was a
 * hand-typed '5.5.207', which the pdfjs-dist 6 bump would have left behind, breaking every upload.
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('pdfjs-dist', () => ({
  version: '9.8.7',
  GlobalWorkerOptions: { workerSrc: '' },
  getDocument: vi.fn(),
}));
vi.mock('pdfjs-dist/build/pdf.worker.min.mjs?url', () => ({
  default: '/assets/pdf.worker.min.mjs',
}));

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('PDF.js worker URL', () => {
  it('names the library version, not a typed one', async () => {
    const { getCdnWorkerUrl } = await import('@/utils/fileProcessing');
    expect(getCdnWorkerUrl()).toBe(
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/9.8.7/pdf.worker.min.mjs'
    );
  });

  it('is what a production subpath build uses', async () => {
    vi.stubEnv('PROD', true);
    vi.stubEnv('BASE_URL', '/efnafraedi/2-ar/lab-reports/');
    await import('@/utils/fileProcessing');
    const pdfjs = await import('pdfjs-dist');
    expect(pdfjs.GlobalWorkerOptions.workerSrc).toBe(
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/9.8.7/pdf.worker.min.mjs'
    );
  });

  it('holds no version string of its own', () => {
    const source = readFileSync(
      createRequire(import.meta.url).resolve('../utils/fileProcessing.ts'),
      'utf8'
    );
    expect(source).not.toMatch(/\b\d+\.\d+\.\d+\b/);
  });
});
