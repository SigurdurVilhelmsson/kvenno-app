// @vitest-environment jsdom
import { fireEvent, render, within } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';

import { allStrings, playLevel1, playLevel2, playLevel3, readable } from './playthrough';
import App from '../App';
import { CatalystEffectDemo } from '../components/CatalystEffectDemo';
import { CollisionDemo } from '../components/CollisionDemo';
import { ConcentrationTimeGraph } from '../components/ConcentrationTimeGraph';
import { MaxwellBoltzmann } from '../components/MaxwellBoltzmann';
import { challenges as level1 } from '../data/level1-questions';
import { challenges as level2 } from '../data/level2-questions';
import { challenges as level3 } from '../data/level3-questions';

/**
 * Everything a student reads in this game, gathered by playing it: all three levels to the end
 * (right answers and wrong ones, hints open), the menu, the completion screen, and the three
 * demos at several settings — plus every string in the question data, including hint tiers no
 * screen shows yet, since a string parked there ships the moment someone wires it up.
 *
 * Each rule below is a defect this game actually shipped.
 */

const RULES: { name: string; pattern: RegExp }[] = [
  // The platform writes the Icelandic decimal comma (formatDecimal / formatScientific).
  { name: 'a decimal point', pattern: /\d\.\d/ },
  { name: 'JavaScript exponent notation (1.1e-4)', pattern: /\de[+-]?\d/ },
  // English inside the Icelandic UI.
  { name: 'the English formula word "Rate"', pattern: /\bRate/ },
  { name: 'English "Products"', pattern: /Products/ },
  { name: 'English "Catalyst Effect"', pattern: /Catalyst/ },
  { name: 'English "Zero/First/Second Order"', pattern: /Order/ },
  { name: 'English "(Intermediate)" in a title', pattern: /Intermediate/ },
  { name: 'English "order=1"', pattern: /order\s*=/ },
  { name: 'English "Rate_new / Rate_old"', pattern: /_new|_old/ },
  { name: 'an English accessible name', pattern: /simulation|particles/i },
  { name: 'the English abbreviation RDS', pattern: /\bRDS\b/ },
  { name: 'English "vs"', pattern: /\bvs\b/ },
  { name: 'literal markdown', pattern: /\*\*/ },
  // Misspellings.
  { name: '"sameidir" for sameindir', pattern: /sameid/i },
  { name: '"kennning" with three n', pattern: /kennning/i },
  { name: '"Heterogens" for misleit', pattern: /heterogen/i },
  { name: '"flúoratom" without its accent', pattern: /atom\b/ },
  // Grammar: the Stig 1 menu card listed the four factors with the first one in the accusative
  // ("Styrk, hitastig, hvatar, yfirborð") beside three nominatives.
  { name: '"Styrk," heading a nominative list', pattern: /\bStyrk, hitastig/ },
  // One word per concept, and the one ordabok.md governs.
  { name: 'hvarfgangsháttur (ordabok: hvarfgangur)', pattern: /hvarfgangsh/i },
  { name: 'gangvegur (ordabok: hvarfgangur)', pattern: /gangveg/i },
  { name: 'millistig (ordabok: milliefni)', pattern: /millistig/i },
  { name: 'frumskref (ordabok: grunnskref)', pattern: /frumskref/i },
  { name: 'árekstrar-kenning (ordabok: árekstrakenning)', pattern: /árekstrarkenn/i },
  { name: 'hraðaákveðandi beside hraðaákvarðandi', pattern: /hraðaákveð/i },
  { name: 'jafnvægisstuðull (ordabok: jafnvægisfasti)', pattern: /jafnvægisstuð/i },
  { name: 'hvarfgangur as the energy-diagram axis', pattern: /^Hvarfgangur$/m },
];

function violations(text: string): string[] {
  return RULES.filter((r) => r.pattern.test(text)).map((r) => {
    const m = r.pattern.exec(text)!;
    const at = Math.max(0, m.index - 40);
    return `${r.name}: …${text.slice(at, m.index + 40).replace(/\s+/g, ' ')}…`;
  });
}

describe('what a student reads in Hvarfhraði', () => {
  beforeEach(() => localStorage.removeItem('kinetics-progress'));

  it('Stig 1, every screen', () => {
    const text = [playLevel1('correct', { useHints: true }), playLevel1('wrong')]
      .map((p) => p.text)
      .join('\n');
    expect(violations(text)).toEqual([]);
  });

  it('Stig 2, every screen', () => {
    const text = [playLevel2('correct'), playLevel2('wrong')].map((p) => p.text).join('\n');
    expect(violations(text)).toEqual([]);
  });

  it('Stig 3, every screen', () => {
    const text = [playLevel3('correct'), playLevel3('wrong')].map((p) => p.text).join('\n');
    expect(violations(text)).toEqual([]);
  });

  it('the menu and the completion screen', () => {
    localStorage.setItem(
      'kinetics-progress',
      JSON.stringify({
        level1Completed: true,
        level1Score: 120,
        level2Completed: true,
        level2Score: 120,
        level3Completed: true,
        level3Score: 120,
        totalGamesPlayed: 3,
      })
    );
    const { container, unmount } = render(<App />);
    const seen = [readable(container)];
    // Finishing Stig 3 with the other two done lands on the completion screen.
    const ui = within(container);
    fireEvent.click(ui.getByText(/^Stig 3:/));
    fireEvent.click(ui.getByRole('button', { name: /Byrja æfingar/ }));
    for (const challenge of level3) {
      const button = Array.from(container.querySelectorAll('button')).find((b) =>
        b.textContent?.includes(challenge.options[0].text)
      )!;
      fireEvent.click(button);
      fireEvent.click(ui.getByRole('button', { name: 'Athuga svar' }));
      const next = ui.queryByRole('button', { name: 'Næsta þraut' });
      fireEvent.click(next ?? ui.getByRole('button', { name: 'Ljúka stigi 3' }));
    }
    seen.push(readable(container));
    expect(container.textContent).toContain('Til hamingju');
    expect(violations(seen.join('\n'))).toEqual([]);
    unmount();
  });

  it('the three demos, across their ranges', () => {
    const seen: string[] = [];
    for (const [temperature, activationEnergy] of [
      [250, 80],
      [350, 40],
      [500, 20],
    ]) {
      const mb = render(
        <MaxwellBoltzmann temperature={temperature} activationEnergy={activationEnergy} />
      );
      seen.push(readable(mb.container));
      mb.unmount();
      const cat = render(
        <CatalystEffectDemo
          temperature={temperature}
          baseActivationEnergy={activationEnergy + 20}
          catalyzedActivationEnergy={activationEnergy}
        />
      );
      seen.push(readable(cat.container));
      cat.unmount();
    }
    for (const showComparison of [false, true]) {
      const graph = render(<ConcentrationTimeGraph showComparison={showComparison} />);
      const ui = within(graph.container);
      for (const order of [0, 1, 2]) {
        fireEvent.click(ui.getByRole('button', { name: `${order}. stig` }));
        seen.push(readable(graph.container));
      }
      graph.unmount();
    }
    const collisions = render(<CollisionDemo />);
    seen.push(readable(collisions.container));
    collisions.unmount();
    expect(violations(seen.join('\n'))).toEqual([]);
  });

  it('every string in the question data, shown yet or not', () => {
    const text = [level1, level2, level3].flatMap(allStrings).join('\n');
    expect(violations(text)).toEqual([]);
  });
});

describe('the Maxwell–Boltzmann readout', () => {
  /**
   * At every setting of Level 1's sliders the fraction above Ea is below 0,05 %, and the readout
   * printed it with toFixed(1) — so it said "0.0%" across the whole range and never moved. The
   * number exists to show that fraction rising with temperature.
   */
  const shown = (temperature: number) => {
    const { container, unmount } = render(
      <MaxwellBoltzmann temperature={temperature} activationEnergy={40} />
    );
    const text = container.textContent ?? '';
    unmount();
    return /([\d.,]+(?: × 10[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+)?) ?% sameinda/.exec(text)?.[1];
  };

  it('is never a rounded-off zero, and changes when the temperature does', () => {
    const cold = shown(300);
    const hot = shown(400);
    expect(cold).toBeDefined();
    expect(cold).not.toMatch(/^0([.,]0+)?$/);
    expect(hot).not.toMatch(/^0([.,]0+)?$/);
    expect(hot).not.toBe(cold);
  });
});
