import type { Locator, Page } from '@playwright/test';

import type { LocatorSpec, ScreenStep } from './mobile-game-screens';

/**
 * Replaying a recorded path from mobile-game-screens.ts, shared by
 * mobile-games.spec.ts and mobile-vertical.spec.ts so the two can never
 * disagree about what a step means.
 *
 * The step semantics must stay identical to the harness the paths were verified
 * with: `click` is a button, then a link, then any text containing the label,
 * and every step settles for 200 ms.
 */
export async function runStep(page: Page, step: ScreenStep): Promise<void> {
  if ('click' in step) {
    await page
      .getByRole('button', { name: step.click })
      .or(page.getByRole('link', { name: step.click }))
      .or(page.getByText(step.click, { exact: false }))
      .first()
      .click();
  } else if ('clickRole' in step) {
    const [role, name] = step.clickRole;
    await page.getByRole(role, { name }).first().click();
  } else if ('css' in step) {
    await page.locator(step.css).first().click();
  } else if ('fill' in step) {
    await page.locator(step.fill[0]).first().fill(step.fill[1]);
  } else if ('press' in step) {
    await page.keyboard.press(step.press);
  } else {
    await page.waitForTimeout(step.wait);
  }
  await page.waitForTimeout(200);
}

/** The element a `LoopCheck` names, as a Playwright locator (first match). */
export function locate(page: Page, spec: LocatorSpec): Locator {
  if ('role' in spec) return page.getByRole(spec.role, { name: spec.name }).first();
  if ('css' in spec) return page.locator(spec.css).first();
  return page.getByText(spec.text, { exact: false }).first();
}

/** A short human label for a locator spec, for assertion messages. */
export function describeSpec(spec: LocatorSpec): string {
  if ('role' in spec) return `${spec.role} "${spec.name}"`;
  if ('css' in spec) return `css ${spec.css}`;
  return `text "${spec.text}"`;
}
