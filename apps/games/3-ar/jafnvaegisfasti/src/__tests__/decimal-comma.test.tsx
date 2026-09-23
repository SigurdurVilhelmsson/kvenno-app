import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { AefaScreen } from '../components/AefaScreen';
import { BeitaScreen } from '../components/BeitaScreen';
import { KannaScreen } from '../components/KannaScreen';
import { SkiljaScreen } from '../components/SkiljaScreen';

/**
 * Every number a student reads in this game is written with the decimal comma.
 *
 * **Why this exists.** The gas constant was the one number on screen with a
 * full stop: the Kc→Kp prompt interpolated the literal `{0.0821}` and Skilja's
 * Kp step interpolated `{R_GAS}`, so both printed `R = 0.0821` two lines from
 * `273,15`, in the one task where a student copies R into a calculation.
 * `formatDecimal` from `@shared/utils` is the route.
 *
 * The render checks walk every screen and step a student reaches without
 * answering; the source check refuses the two shapes that print a full stop.
 */

afterEach(cleanup);

/** A digit, a full stop, a digit: a number written the English way. */
const FULL_STOP_DECIMAL = /\d\.\d/;

function expectCommaOnly(where: string) {
  const text = document.body.textContent ?? '';
  const hit = text.match(new RegExp(`.{0,30}${FULL_STOP_DECIMAL.source}.{0,30}`));
  expect(hit?.[0], `${where} prints a decimal with a full stop`).toBeUndefined();
}

describe('the decimal comma on screen', () => {
  it('Skilja writes R with a comma, and so does every other step', () => {
    render(<SkiljaScreen onComplete={() => {}} onBack={() => {}} />);
    for (let step = 0; step < 5; step += 1) {
      expectCommaOnly(`Skilja step ${step + 1}`);
      if (step === 2) expect(document.body.textContent).toContain('R = 0,0821');
      fireEvent.click(screen.getByText(step === 4 ? 'Ljúka' : 'Næsta'));
    }
  });

  it('the Kc→Kp prompt writes R with a comma', () => {
    render(<AefaScreen onComplete={() => {}} onBack={() => {}} />);
    fireEvent.click(screen.getByText('Kc yfir í Kp'));
    expect(document.body.textContent).toContain('R = 0,0821');
    expectCommaOnly('Æfa, Kc yfir í Kp');
  });

  it('the other Æfa tasks, Kanna and Beita print no full-stop decimal', () => {
    render(<AefaScreen onComplete={() => {}} onBack={() => {}} />);
    for (const tab of ['Skrifa stæðuna', 'Spá fyrir um stefnu', 'Tengd jafnvægi']) {
      fireEvent.click(screen.getByText(tab));
      expectCommaOnly(`Æfa, ${tab}`);
    }
    cleanup();

    render(<KannaScreen onComplete={() => {}} onBack={() => {}} />);
    for (const preset of ['Bara myndefni', 'Mikið af myndefnum', 'Tífalt þynnra']) {
      fireEvent.click(screen.getByText(preset));
      expectCommaOnly(`Kanna, ${preset}`);
    }
    cleanup();

    render(<BeitaScreen onComplete={() => {}} onBack={() => {}} />);
    expectCommaOnly('Beita, direction step');
    fireEvent.click(screen.getByText('Áfram — myndefnin aukast'));
    expectCommaOnly('Beita, extent step');
  });
});

describe('the decimal comma in source', () => {
  const dir = join(__dirname, '..', 'components');
  const files = readdirSync(dir).filter((f) => f.endsWith('.tsx'));

  it('finds the components to check', () => {
    expect(files.length).toBeGreaterThanOrEqual(5);
  });

  it('interpolates no decimal literal and no bare gas constant into JSX', () => {
    for (const file of files) {
      readFileSync(join(dir, file), 'utf8')
        .split('\n')
        .forEach((line, i) => {
          expect(line, `${file}:${i + 1} interpolates a decimal literal`).not.toMatch(
            /\{\s*\d+\.\d+\s*\}/
          );
          expect(line, `${file}:${i + 1} interpolates R_GAS raw`).not.toMatch(/\{\s*R_GAS\s*\}/);
        });
    }
  });
});
