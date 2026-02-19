import { describe, it, expect } from 'vitest';
import {
  vseprToMolecule,
  geometryToMolecule,
  type VSEPRMolecule,
  type VSEPRGeometry,
} from '../utils/vseprConverter';

describe('vseprToMolecule', () => {
  it('maps tetrahedral geometry correctly for CH4', () => {
    const ch4: VSEPRMolecule = {
      formula: 'CH₄',
      centralAtom: 'C',
      bondingPairs: 4,
      lonePairs: 0,
      electronDomains: 4,
      correctGeometryId: 'tetrahedral',
    };

    const molecule = vseprToMolecule(ch4);

    expect(molecule.geometry).toBe('tetrahedral');
  });

  it('maps linear geometry correctly for CO2', () => {
    const co2: VSEPRMolecule = {
      formula: 'CO₂',
      centralAtom: 'C',
      bondingPairs: 2,
      lonePairs: 0,
      electronDomains: 2,
      correctGeometryId: 'linear',
    };

    const molecule = vseprToMolecule(co2, 'double');

    expect(molecule.geometry).toBe('linear');
    expect(molecule.bonds.every((b) => b.type === 'double')).toBe(true);
  });

  it('maps bent geometry correctly for H2O', () => {
    const h2o: VSEPRMolecule = {
      formula: 'H₂O',
      centralAtom: 'O',
      bondingPairs: 2,
      lonePairs: 2,
      electronDomains: 4,
      correctGeometryId: 'bent',
    };

    const molecule = vseprToMolecule(h2o);

    expect(molecule.geometry).toBe('bent');
  });

  it('maps trigonal-planar geometry correctly for BF3', () => {
    const bf3: VSEPRMolecule = {
      formula: 'BF₃',
      centralAtom: 'B',
      bondingPairs: 3,
      lonePairs: 0,
      electronDomains: 3,
      correctGeometryId: 'trigonal-planar',
    };

    const molecule = vseprToMolecule(bf3);

    expect(molecule.geometry).toBe('trigonal-planar');
  });

  it('creates central atom with correct symbol', () => {
    const nh3: VSEPRMolecule = {
      formula: 'NH₃',
      centralAtom: 'N',
      bondingPairs: 3,
      lonePairs: 1,
      electronDomains: 4,
      correctGeometryId: 'trigonal-pyramidal',
    };

    const molecule = vseprToMolecule(nh3);

    const centralAtom = molecule.atoms.find((a) => a.id === 'n-central');
    expect(centralAtom).toBeDefined();
    expect(centralAtom?.symbol).toBe('N');
  });

  it('creates surrounding atoms from parsed formula', () => {
    const ch4: VSEPRMolecule = {
      formula: 'CH₄',
      centralAtom: 'C',
      bondingPairs: 4,
      lonePairs: 0,
      electronDomains: 4,
      correctGeometryId: 'tetrahedral',
    };

    const molecule = vseprToMolecule(ch4);

    // 1 central C + 4 surrounding H = 5 atoms
    expect(molecule.atoms).toHaveLength(5);
    // 4 bonds from central to each surrounding
    expect(molecule.bonds).toHaveLength(4);

    const hAtoms = molecule.atoms.filter((a) => a.symbol === 'H');
    expect(hAtoms).toHaveLength(4);
  });

  it('propagates lone pairs to central atom', () => {
    const h2o: VSEPRMolecule = {
      formula: 'H₂O',
      centralAtom: 'O',
      bondingPairs: 2,
      lonePairs: 2,
      electronDomains: 4,
      correctGeometryId: 'bent',
    };

    const molecule = vseprToMolecule(h2o);

    const centralAtom = molecule.atoms.find((a) => a.id === 'o-central');
    expect(centralAtom?.lonePairs).toBe(2);
  });

  it('sets surrounding atom lone pairs to 0', () => {
    const h2o: VSEPRMolecule = {
      formula: 'H₂O',
      centralAtom: 'O',
      bondingPairs: 2,
      lonePairs: 2,
      electronDomains: 4,
      correctGeometryId: 'bent',
    };

    const molecule = vseprToMolecule(h2o);

    const surroundingAtoms = molecule.atoms.filter((a) => a.id !== 'o-central');
    for (const atom of surroundingAtoms) {
      expect(atom.lonePairs).toBe(0);
    }
  });

  it('passes isPolar property through', () => {
    const h2o: VSEPRMolecule = {
      formula: 'H₂O',
      centralAtom: 'O',
      bondingPairs: 2,
      lonePairs: 2,
      electronDomains: 4,
      correctGeometryId: 'bent',
      isPolar: true,
    };

    const molecule = vseprToMolecule(h2o);

    expect(molecule.isPolar).toBe(true);
  });

  it('maps seesaw geometry alias correctly', () => {
    const sf4: VSEPRMolecule = {
      formula: 'SF₄',
      centralAtom: 'S',
      bondingPairs: 4,
      lonePairs: 1,
      electronDomains: 5,
      correctGeometryId: 'seesaw',
    };

    const molecule = vseprToMolecule(sf4);

    expect(molecule.geometry).toBe('see-saw');
  });

  it('uses default single bond type when none specified', () => {
    const ch4: VSEPRMolecule = {
      formula: 'CH₄',
      centralAtom: 'C',
      bondingPairs: 4,
      lonePairs: 0,
      electronDomains: 4,
      correctGeometryId: 'tetrahedral',
    };

    const molecule = vseprToMolecule(ch4);

    expect(molecule.bonds.every((b) => b.type === 'single')).toBe(true);
  });
});

describe('geometryToMolecule', () => {
  it('creates a molecule from a simple tetrahedral geometry', () => {
    const geo: VSEPRGeometry = {
      id: 'tetrahedral',
      example: 'CH₄',
      exampleName: 'metan',
      bondingPairs: 4,
      lonePairs: 0,
    };

    const molecule = geometryToMolecule(geo);

    expect(molecule.geometry).toBe('tetrahedral');
    expect(molecule.name).toBe('metan');
    expect(molecule.atoms).toHaveLength(5);
    expect(molecule.bonds).toHaveLength(4);
  });

  it('creates a molecule from linear geometry', () => {
    const geo: VSEPRGeometry = {
      id: 'linear',
      example: 'CO₂',
      bondingPairs: 2,
      lonePairs: 0,
    };

    const molecule = geometryToMolecule(geo);

    expect(molecule.geometry).toBe('linear');
    expect(molecule.atoms).toHaveLength(3);
    expect(molecule.bonds).toHaveLength(2);
    // geometryToMolecule always uses single bonds
    expect(molecule.bonds.every((b) => b.type === 'single')).toBe(true);
  });

  it('preserves lone pairs from geometry definition', () => {
    const geo: VSEPRGeometry = {
      id: 'bent',
      example: 'H₂O',
      bondingPairs: 2,
      lonePairs: 2,
    };

    const molecule = geometryToMolecule(geo);

    const centralAtom = molecule.atoms.find((a) => a.id.includes('central'));
    expect(centralAtom?.lonePairs).toBe(2);
  });

  it('generates molecule id from formula without subscripts', () => {
    const geo: VSEPRGeometry = {
      id: 'tetrahedral',
      example: 'CH₄',
      bondingPairs: 4,
      lonePairs: 0,
    };

    const molecule = geometryToMolecule(geo);

    expect(molecule.id).toBe('ch');
  });
});
