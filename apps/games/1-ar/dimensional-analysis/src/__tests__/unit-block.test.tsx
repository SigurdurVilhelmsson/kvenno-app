// @vitest-environment jsdom
/**
 * The unit blocks print numbers the way an Icelandic student reads them.
 *
 * `UnitBlock` and `ConversionFactorBlock` interpolated their numbers raw, so
 * the Stig 1 balance showed `0.5 L` — through `EquivalenceDisplay` — while the
 * game asks for, and reads, `0,5`. Level 2's start block (`2.5 kg`, `0.5 km`,
 * `1.5 g/mL`) went through the same component.
 */

import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';

import { ConversionFactorBlock, EquivalenceDisplay, UnitBlock } from '../components/UnitBlock';

afterEach(cleanup);

describe('unit blocks print a decimal comma', () => {
  it('on the Stig 1 balance', () => {
    const { container } = render(
      <EquivalenceDisplay
        leftValue={1000}
        leftUnit="mL"
        rightValue={0.5}
        rightUnit="L"
        isEqual={false}
        comparison={-500}
      />
    );
    expect(screen.getByText('0,5')).toBeTruthy();
    expect(container.textContent).not.toMatch(/\d\.\d/);
  });

  it('on a single block', () => {
    const { container } = render(<UnitBlock value={2.5} unit="kg" useStrikethrough />);
    expect(container.textContent).toBe('2,5kg');
  });

  it('on a conversion factor', () => {
    const { container } = render(
      <ConversionFactorBlock
        numeratorValue={0.5}
        numeratorUnit="L"
        denominatorValue={500}
        denominatorUnit="mL"
      />
    );
    expect(container.textContent).toBe('0,5 L500 mL');
  });
});

describe('a conversion factor used as a toggle', () => {
  it('announces whether it is on', () => {
    render(
      <ConversionFactorBlock
        numeratorValue={1}
        numeratorUnit="g"
        denominatorValue={1000}
        denominatorUnit="mg"
        onClick={() => {}}
        pressed
      />
    );
    expect(screen.getByRole('button', { pressed: true })).toBeTruthy();
  });

  it('says nothing about state when it is not a toggle', () => {
    render(
      <ConversionFactorBlock
        numeratorValue={1}
        numeratorUnit="g"
        denominatorValue={1000}
        denominatorUnit="mg"
        onClick={() => {}}
      />
    );
    expect(screen.getByRole('button').hasAttribute('aria-pressed')).toBe(false);
  });
});
