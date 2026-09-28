import { afterEach, beforeEach, vi, type MockInstance } from 'vitest';

/**
 * "Næsta" ignores a press within 400 ms of appearing — the double-tap guard
 * (`useArmedAfter` in `@shared/utils`), so a second tap on "Athuga" cannot skip
 * the feedback. These tests press it at once, which no student does, so every
 * read of the clock here is half a second after the last and the guard never
 * drops a press. Call once at the top of a test file.
 */
export function clockPastNextGuard(): void {
  let spy: MockInstance<() => number> | undefined;
  beforeEach(() => {
    let now = 0;
    spy = vi.spyOn(performance, 'now').mockImplementation(() => (now += 500));
  });
  afterEach(() => {
    spy?.mockRestore();
  });
}
