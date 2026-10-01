import { describe, expect, it } from 'vitest';

import {
  diagnoseDrawing,
  electronCount,
  targetElectrons,
  type DiagnosisStructure,
  type DrawingState,
} from '../utils/lewisDiagnosis';

/**
 * Stig 2's feedback on a wrong drawing names the rule the drawing breaks, not
 * the answer. It used to print the key ("O–H₂: Ekkert → ætti að vera Einfalt"),
 * which a student could copy back for full marks. Every case below checks the
 * message says what is wrong and never how to write the answer.
 */

const WATER: DiagnosisStructure = {
  centralAtom: 'O',
  surroundingAtoms: [
    { symbol: 'H', bondType: 'single', lonePairs: 0 },
    { symbol: 'H', bondType: 'single', lonePairs: 0 },
  ],
  centralLonePairs: 2,
};
const CO2: DiagnosisStructure = {
  centralAtom: 'C',
  surroundingAtoms: [
    { symbol: 'O', bondType: 'double', lonePairs: 2 },
    { symbol: 'O', bondType: 'double', lonePairs: 2 },
  ],
  centralLonePairs: 0,
};
const BF3: DiagnosisStructure = {
  centralAtom: 'B',
  surroundingAtoms: [
    { symbol: 'F', bondType: 'single', lonePairs: 3 },
    { symbol: 'F', bondType: 'single', lonePairs: 3 },
    { symbol: 'F', bondType: 'single', lonePairs: 3 },
  ],
  centralLonePairs: 0,
};
const NO: DiagnosisStructure = {
  centralAtom: 'N',
  surroundingAtoms: [{ symbol: 'O', bondType: 'double', lonePairs: 2 }],
  centralLonePairs: 1,
  centralUnpairedElectron: true,
};

const labels = (structure: DiagnosisStructure) => (i: number) => {
  const sym = structure.surroundingAtoms[i].symbol;
  const same = structure.surroundingAtoms.filter((a) => a.symbol === sym).length;
  return same === 1 ? sym : `${sym}${'₁₂₃₄₅₆'[i]}`;
};

const diagnose = (molecule: string, total: number, s: DiagnosisStructure, state: DrawingState) =>
  diagnoseDrawing(molecule, total, s, state, labels(s));

const correctState = (s: DiagnosisStructure): DrawingState => ({
  bonds: s.surroundingAtoms.map((a) => a.bondType),
  centralLP: s.centralLonePairs,
  surroundingLP: s.surroundingAtoms.map((a) => a.lonePairs),
});

describe('diagnoseDrawing', () => {
  it('says nothing about a correct drawing', () => {
    expect(diagnose('H₂O', 8, WATER, correctState(WATER))).toEqual([]);
    expect(diagnose('CO₂', 16, CO2, correctState(CO2))).toEqual([]);
    expect(diagnose('BF₃', 24, BF3, correctState(BF3))).toEqual([]);
    expect(diagnose('NO', 11, NO, correctState(NO))).toEqual([]);
  });

  it('names unbonded atoms and unspent electrons on an empty board', () => {
    const messages = diagnose('H₂O', 8, WATER, {
      bonds: ['none', 'none'],
      centralLP: 0,
      surroundingLP: [0, 0],
    });
    expect(messages).toEqual([
      'H₁ er ekki tengt O. Hvert ytra atóm þarf að minnsta kosti eitt tengi.',
      'H₂ er ekki tengt O. Hvert ytra atóm þarf að minnsta kosti eitt tengi.',
      '8 rafeindir eru enn ónotaðar. Allar gildisrafeindirnar eiga heima í formúlunni — í tengjum eða stökum pörum.',
    ]);
  });

  it('holds an atom to the octet by count, not by telling the pairs', () => {
    const messages = diagnose('H₂O', 8, WATER, {
      bonds: ['single', 'single'],
      centralLP: 0,
      surroundingLP: [0, 0],
    });
    expect(messages).toContain('O hefur 4 rafeindir í kringum sig — áttureglan krefst 8.');
  });

  it('caps hydrogen at two electrons', () => {
    const messages = diagnose('H₂O', 8, WATER, {
      bonds: ['double', 'single'],
      centralLP: 1,
      surroundingLP: [0, 0],
    });
    expect(messages).toContain(
      'H₁ hefur 4 rafeindir í kringum sig. Vetni rúmar aðeins 2 — eitt eintengi og engin stök pör.'
    );
  });

  it('says when more electrons are spent than the molecule has', () => {
    const messages = diagnose('H₂O', 8, WATER, {
      bonds: ['single', 'single'],
      centralLP: 3,
      surroundingLP: [0, 0],
    });
    expect(messages[0]).toBe(
      'Þú hefur notað 10 rafeindir, en H₂O hefur aðeins 8 gildisrafeindir til ráðstöfunar.'
    );
  });

  it('states an octet exception as the count this molecule needs', () => {
    // B=F gives boron an octet, which is exactly the mistake BF₃ exists to catch.
    const messages = diagnose('BF₃', 24, BF3, {
      bonds: ['double', 'single', 'single'],
      centralLP: 0,
      surroundingLP: [2, 3, 3],
    });
    expect(messages).toContain('B hefur 8 rafeindir í kringum sig, en í BF₃ á B að hafa 6.');
  });

  it('counts a radical’s odd electron, and says nothing when NO is drawn right', () => {
    expect(targetElectrons(NO)).toEqual({ central: 7, surrounding: [8] });
  });

  it('names a formal-charge problem when every count is already right', () => {
    // O≡C–O: all 16 electrons placed and every atom at 8, but not the structure.
    const messages = diagnose('CO₂', 16, CO2, {
      bonds: ['triple', 'single'],
      centralLP: 0,
      surroundingLP: [1, 3],
    });
    expect(messages).toHaveLength(1);
    expect(messages[0]).toMatch(/formleg hleðsla hvers atóms er sem næst núlli/);
  });

  it('never prints the answer key', () => {
    const states: [string, number, DiagnosisStructure, DrawingState][] = [
      ['H₂O', 8, WATER, { bonds: ['none', 'single'], centralLP: 0, surroundingLP: [0, 0] }],
      ['CO₂', 16, CO2, { bonds: ['single', 'single'], centralLP: 0, surroundingLP: [3, 3] }],
      [
        'BF₃',
        24,
        BF3,
        { bonds: ['single', 'single', 'single'], centralLP: 1, surroundingLP: [3, 3, 2] },
      ],
      ['NO', 11, NO, { bonds: ['single'], centralLP: 2, surroundingLP: [3] }],
    ];
    for (const [molecule, total, s, state] of states) {
      const messages = diagnose(molecule, total, s, state);
      expect(messages.length, molecule).toBeGreaterThan(0);
      for (const m of messages) {
        expect(m).not.toMatch(/ætti að vera|Einfalt|Tvöfalt|Þrefalt/);
        expect(m).not.toMatch(/\d+ (stök )?(par|pör)\b/);
      }
    }
  });
});

describe('electronCount', () => {
  it('agrees with the last digit, as Icelandic counts do', () => {
    expect(electronCount(1)).toBe('1 rafeind');
    expect(electronCount(2)).toBe('2 rafeindir');
    expect(electronCount(11)).toBe('11 rafeindir');
    expect(electronCount(21)).toBe('21 rafeind');
  });
});
