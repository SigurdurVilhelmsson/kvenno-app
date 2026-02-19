import { describe, it, expect } from 'vitest';
import {
  lewisToMolecule,
  createDiatomic,
  type LewisStructure,
} from '../utils/lewisConverter';

describe('lewisToMolecule', () => {
  it('creates a simple water molecule (bent, 2 lone pairs on central)', () => {
    const water: LewisStructure = {
      centralAtom: 'O',
      surroundingAtoms: [
        { symbol: 'H', bondType: 'single', lonePairs: 0 },
        { symbol: 'H', bondType: 'single', lonePairs: 0 },
      ],
      centralLonePairs: 2,
    };

    const molecule = lewisToMolecule(water, 'H\u2082O', 'vatn');

    expect(molecule.formula).toBe('H\u2082O');
    expect(molecule.name).toBe('vatn');
    expect(molecule.atoms).toHaveLength(3); // O + 2 H
    expect(molecule.bonds).toHaveLength(2); // 2 O-H bonds
    expect(molecule.geometry).toBe('bent'); // 2 bonding + 2 lone = 4 domains, 2 LP = bent
  });

  it('creates CO2 with linear geometry', () => {
    const co2: LewisStructure = {
      centralAtom: 'C',
      surroundingAtoms: [
        { symbol: 'O', bondType: 'double', lonePairs: 2 },
        { symbol: 'O', bondType: 'double', lonePairs: 2 },
      ],
      centralLonePairs: 0,
    };

    const molecule = lewisToMolecule(co2, 'CO\u2082');

    expect(molecule.atoms).toHaveLength(3);
    expect(molecule.bonds).toHaveLength(2);
    expect(molecule.bonds[0].type).toBe('double');
    expect(molecule.geometry).toBe('linear'); // 2 domains, 0 LP
  });

  it('creates ammonia with trigonal-pyramidal geometry', () => {
    const nh3: LewisStructure = {
      centralAtom: 'N',
      surroundingAtoms: [
        { symbol: 'H', bondType: 'single', lonePairs: 0 },
        { symbol: 'H', bondType: 'single', lonePairs: 0 },
        { symbol: 'H', bondType: 'single', lonePairs: 0 },
      ],
      centralLonePairs: 1,
    };

    const molecule = lewisToMolecule(nh3, 'NH\u2083');

    expect(molecule.atoms).toHaveLength(4);
    expect(molecule.bonds).toHaveLength(3);
    expect(molecule.geometry).toBe('trigonal-pyramidal'); // 3 bonding + 1 LP = 4 domains, 1 LP
  });

  it('creates methane with tetrahedral geometry', () => {
    const ch4: LewisStructure = {
      centralAtom: 'C',
      surroundingAtoms: [
        { symbol: 'H', bondType: 'single', lonePairs: 0 },
        { symbol: 'H', bondType: 'single', lonePairs: 0 },
        { symbol: 'H', bondType: 'single', lonePairs: 0 },
        { symbol: 'H', bondType: 'single', lonePairs: 0 },
      ],
      centralLonePairs: 0,
    };

    const molecule = lewisToMolecule(ch4, 'CH\u2084');

    expect(molecule.geometry).toBe('tetrahedral'); // 4 domains, 0 LP
  });

  it('creates trigonal-planar BF3', () => {
    const bf3: LewisStructure = {
      centralAtom: 'B',
      surroundingAtoms: [
        { symbol: 'F', bondType: 'single', lonePairs: 3 },
        { symbol: 'F', bondType: 'single', lonePairs: 3 },
        { symbol: 'F', bondType: 'single', lonePairs: 3 },
      ],
      centralLonePairs: 0,
    };

    const molecule = lewisToMolecule(bf3, 'BF\u2083');

    expect(molecule.geometry).toBe('trigonal-planar'); // 3 domains, 0 LP
  });

  it('preserves formal charges', () => {
    const lewis: LewisStructure = {
      centralAtom: 'N',
      surroundingAtoms: [
        { symbol: 'H', bondType: 'single', lonePairs: 0 },
        { symbol: 'H', bondType: 'single', lonePairs: 0 },
        { symbol: 'H', bondType: 'single', lonePairs: 0 },
        { symbol: 'H', bondType: 'single', lonePairs: 0 },
      ],
      centralLonePairs: 0,
      centralFormalCharge: 1,
    };

    const molecule = lewisToMolecule(lewis, 'NH\u2084\u207a');
    const centralAtom = molecule.atoms.find(
      (a) => a.id === 'n-central'
    );

    expect(centralAtom?.formalCharge).toBe(1);
  });

  it('creates unique atom IDs', () => {
    const water: LewisStructure = {
      centralAtom: 'O',
      surroundingAtoms: [
        { symbol: 'H', bondType: 'single', lonePairs: 0 },
        { symbol: 'H', bondType: 'single', lonePairs: 0 },
      ],
      centralLonePairs: 2,
    };

    const molecule = lewisToMolecule(water, 'H\u2082O');
    const ids = molecule.atoms.map((a) => a.id);
    const uniqueIds = new Set(ids);

    expect(uniqueIds.size).toBe(ids.length);
  });

  it('handles expanded octet octahedral geometry (SF6)', () => {
    const sf6: LewisStructure = {
      centralAtom: 'S',
      surroundingAtoms: [
        { symbol: 'F', bondType: 'single', lonePairs: 3 },
        { symbol: 'F', bondType: 'single', lonePairs: 3 },
        { symbol: 'F', bondType: 'single', lonePairs: 3 },
        { symbol: 'F', bondType: 'single', lonePairs: 3 },
        { symbol: 'F', bondType: 'single', lonePairs: 3 },
        { symbol: 'F', bondType: 'single', lonePairs: 3 },
      ],
      centralLonePairs: 0,
    };

    const molecule = lewisToMolecule(sf6, 'SF\u2086');

    expect(molecule.geometry).toBe('octahedral');
  });
});

describe('createDiatomic', () => {
  it('creates a diatomic molecule with correct structure', () => {
    const o2 = createDiatomic('O', 'O', 'double', 2, 2, undefined, undefined, 'O\u2082');

    expect(o2.formula).toBe('O\u2082');
    expect(o2.atoms).toHaveLength(2);
    expect(o2.bonds).toHaveLength(1);
    expect(o2.bonds[0].type).toBe('double');
    expect(o2.geometry).toBe('linear');
  });

  it('creates HCl with single bond', () => {
    const hcl = createDiatomic('H', 'Cl', 'single', 0, 3);

    expect(hcl.atoms).toHaveLength(2);
    expect(hcl.bonds[0].type).toBe('single');
    expect(hcl.atoms[0].lonePairs).toBe(0);
    expect(hcl.atoms[1].lonePairs).toBe(3);
  });

  it('creates N2 with triple bond', () => {
    const n2 = createDiatomic('N', 'N', 'triple', 1, 1, undefined, undefined, 'N\u2082');

    expect(n2.bonds[0].type).toBe('triple');
    expect(n2.atoms[0].lonePairs).toBe(1);
    expect(n2.atoms[1].lonePairs).toBe(1);
  });

  it('generates default formula when not provided', () => {
    const mol = createDiatomic('H', 'F', 'single', 0, 3);

    expect(mol.formula).toBe('HF');
  });
});
