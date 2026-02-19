/**
 * Shared accessibility test helpers for jest-axe / vitest.
 *
 * Usage:
 *   import { expectNoAxeViolations, setupAxeMatchers } from '@shared/utils/a11y-test-helpers';
 *
 *   setupAxeMatchers();          // call once per file (extends expect)
 *   await expectNoAxeViolations(container);
 */
import { axe, toHaveNoViolations } from 'jest-axe';
import { expect } from 'vitest';

/**
 * Extend vitest's expect with the `toHaveNoViolations` matcher.
 * Safe to call multiple times — idempotent.
 */
export function setupAxeMatchers(): void {
  expect.extend(toHaveNoViolations);
}

/**
 * Run axe-core against an HTMLElement and assert zero violations.
 *
 * @param container - the root DOM element to audit (typically from render().container)
 * @param options   - optional axe-core RunOptions (rules to disable, etc.)
 */
export async function expectNoAxeViolations(
  container: HTMLElement,
  options?: Parameters<typeof axe>[1],
): Promise<void> {
  const results = await axe(container, options);
  expect(results).toHaveNoViolations();
}
