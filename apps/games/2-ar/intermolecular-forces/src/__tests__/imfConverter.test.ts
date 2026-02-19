import { describe, it, expect } from 'vitest';
import {
  imfToMolecule,
  type IMFMolecule,
} from '../utils/imfConverter';

describe('imfToMolecule', () => {
  describe('with visualization data', () => {
    it('creates atoms from visualization with partial charges', () => {
      const hcl: IMFMolecule = {
        formula: 'HCl',
        name: 'vetnissklorið',
        isPolar: true,
        hasHBond: false,
        visualization: {
          atoms: [
            { symbol: 'H', partialCharge: 'positive', position: 'left' },
            { symbol: 'Cl', partialCharge: 'negative', position: 'right' },
          ],
          bonds: [
            { from: 'left', to: 'right', type: 'single', polar: true },
          ],
          shape: 'diatomic',
          dipoleMoment: 'right',
        },
      };

      const molecule = imfToMolecule(hcl);

      expect(molecule.atoms).toHaveLength(2);
      expect(molecule.atoms[0].partialCharge).toBe('positive');
      expect(molecule.atoms[1].partialCharge).toBe('negative');
    });

    it('creates bonds from visualization with polarity', () => {
      const hcl: IMFMolecule = {
        formula: 'HCl',
        isPolar: true,
        hasHBond: false,
        visualization: {
          atoms: [
            { symbol: 'H', partialCharge: 'positive', position: 'left' },
            { symbol: 'Cl', partialCharge: 'negative', position: 'right' },
          ],
          bonds: [
            { from: 'left', to: 'right', type: 'single', polar: true },
          ],
          shape: 'diatomic',
        },
      };

      const molecule = imfToMolecule(hcl);

      expect(molecule.bonds).toHaveLength(1);
      expect(molecule.bonds[0].type).toBe('single');
      expect(molecule.bonds[0].polar).toBe(true);
    });

    it('maps dipole moment direction', () => {
      const hf: IMFMolecule = {
        formula: 'HF',
        isPolar: true,
        hasHBond: true,
        visualization: {
          atoms: [
            { symbol: 'H', partialCharge: 'positive', position: 'left' },
            { symbol: 'F', partialCharge: 'negative', position: 'right' },
          ],
          bonds: [
            { from: 'left', to: 'right', type: 'single', polar: true },
          ],
          shape: 'diatomic',
          dipoleMoment: 'right',
        },
      };

      const molecule = imfToMolecule(hf);

      expect(molecule.dipoleMoment).toBeDefined();
      expect(molecule.dipoleMoment?.direction).toBe('right');
    });

    it('does not set dipole moment when direction is none', () => {
      const co2: IMFMolecule = {
        formula: 'CO₂',
        isPolar: false,
        hasHBond: false,
        visualization: {
          atoms: [
            { symbol: 'O', partialCharge: 'negative', position: 'left' },
            { symbol: 'C', partialCharge: 'positive', position: 'center' },
            { symbol: 'O', partialCharge: 'negative', position: 'right' },
          ],
          bonds: [
            { from: 'left', to: 'center', type: 'double', polar: true },
            { from: 'center', to: 'right', type: 'double', polar: true },
          ],
          shape: 'linear',
          dipoleMoment: 'none',
        },
      };

      const molecule = imfToMolecule(co2);

      expect(molecule.dipoleMoment).toBeUndefined();
    });

    it('preserves isPolar property', () => {
      const h2o: IMFMolecule = {
        formula: 'H₂O',
        isPolar: true,
        hasHBond: true,
        visualization: {
          atoms: [
            { symbol: 'H', partialCharge: 'positive', position: 'left' },
            { symbol: 'O', partialCharge: 'negative', position: 'center' },
            { symbol: 'H', partialCharge: 'positive', position: 'right' },
          ],
          bonds: [
            { from: 'left', to: 'center', type: 'single', polar: true },
            { from: 'center', to: 'right', type: 'single', polar: true },
          ],
          shape: 'bent',
          dipoleMoment: 'down',
        },
      };

      const molecule = imfToMolecule(h2o);

      expect(molecule.isPolar).toBe(true);
    });

    it('handles atoms with no partial charge as none', () => {
      const cl2: IMFMolecule = {
        formula: 'Cl₂',
        isPolar: false,
        hasHBond: false,
        visualization: {
          atoms: [
            { symbol: 'Cl', partialCharge: 'none', position: 'left' },
            { symbol: 'Cl', partialCharge: 'none', position: 'right' },
          ],
          bonds: [
            { from: 'left', to: 'right', type: 'single' },
          ],
          shape: 'diatomic',
        },
      };

      const molecule = imfToMolecule(cl2);

      expect(molecule.atoms[0].partialCharge).toBe('none');
      expect(molecule.atoms[1].partialCharge).toBe('none');
    });
  });

  describe('fallback behavior (no visualization)', () => {
    it('returns a minimal molecule when visualization is absent', () => {
      const simple: IMFMolecule = {
        formula: 'CH₄',
        name: 'metan',
        isPolar: false,
        hasHBond: false,
      };

      const molecule = imfToMolecule(simple);

      expect(molecule.atoms).toHaveLength(1);
      expect(molecule.atoms[0].symbol).toBe('C');
      expect(molecule.bonds).toHaveLength(0);
    });

    it('preserves isPolar in fallback mode', () => {
      const simple: IMFMolecule = {
        formula: 'HF',
        isPolar: true,
        hasHBond: true,
      };

      const molecule = imfToMolecule(simple);

      expect(molecule.isPolar).toBe(true);
    });

    it('generates id from formula without subscripts in fallback', () => {
      const simple: IMFMolecule = {
        formula: 'H₂O',
        isPolar: true,
        hasHBond: true,
      };

      const molecule = imfToMolecule(simple);

      expect(molecule.id).toBe('ho');
    });
  });

  describe('shape-to-geometry mapping', () => {
    it('maps linear shape to linear geometry', () => {
      const mol: IMFMolecule = {
        formula: 'CO₂',
        isPolar: false,
        hasHBond: false,
        visualization: {
          atoms: [
            { symbol: 'O', position: 'left', partialCharge: 'negative' },
            { symbol: 'C', position: 'center', partialCharge: 'positive' },
            { symbol: 'O', position: 'right', partialCharge: 'negative' },
          ],
          bonds: [
            { from: 'left', to: 'center', type: 'double' },
            { from: 'center', to: 'right', type: 'double' },
          ],
          shape: 'linear',
        },
      };

      const molecule = imfToMolecule(mol);

      expect(molecule.geometry).toBe('linear');
    });

    it('maps diatomic shape to linear geometry', () => {
      const mol: IMFMolecule = {
        formula: 'HCl',
        isPolar: true,
        hasHBond: false,
        visualization: {
          atoms: [
            { symbol: 'H', position: 'left', partialCharge: 'positive' },
            { symbol: 'Cl', position: 'right', partialCharge: 'negative' },
          ],
          bonds: [
            { from: 'left', to: 'right', type: 'single' },
          ],
          shape: 'diatomic',
        },
      };

      const molecule = imfToMolecule(mol);

      expect(molecule.geometry).toBe('linear');
    });

    it('maps bent shape to bent geometry', () => {
      const mol: IMFMolecule = {
        formula: 'H₂O',
        isPolar: true,
        hasHBond: true,
        visualization: {
          atoms: [
            { symbol: 'H', position: 'left', partialCharge: 'positive' },
            { symbol: 'O', position: 'center', partialCharge: 'negative' },
            { symbol: 'H', position: 'right', partialCharge: 'positive' },
          ],
          bonds: [
            { from: 'left', to: 'center', type: 'single' },
            { from: 'center', to: 'right', type: 'single' },
          ],
          shape: 'bent',
        },
      };

      const molecule = imfToMolecule(mol);

      expect(molecule.geometry).toBe('bent');
    });

    it('maps trigonal shape to trigonal-planar geometry', () => {
      const mol: IMFMolecule = {
        formula: 'BF₃',
        isPolar: false,
        hasHBond: false,
        visualization: {
          atoms: [
            { symbol: 'B', position: 'center', partialCharge: 'none' },
            { symbol: 'F', position: 'top', partialCharge: 'negative' },
            { symbol: 'F', position: 'bottom-left', partialCharge: 'negative' },
            { symbol: 'F', position: 'bottom-right', partialCharge: 'negative' },
          ],
          bonds: [
            { from: 'center', to: 'top', type: 'single' },
            { from: 'center', to: 'bottom-left', type: 'single' },
            { from: 'center', to: 'bottom-right', type: 'single' },
          ],
          shape: 'trigonal',
        },
      };

      const molecule = imfToMolecule(mol);

      expect(molecule.geometry).toBe('trigonal-planar');
    });

    it('maps tetrahedral shape to tetrahedral geometry', () => {
      const mol: IMFMolecule = {
        formula: 'CH₄',
        isPolar: false,
        hasHBond: false,
        visualization: {
          atoms: [
            { symbol: 'C', position: 'center', partialCharge: 'none' },
            { symbol: 'H', position: 'top', partialCharge: 'none' },
            { symbol: 'H', position: 'bottom', partialCharge: 'none' },
            { symbol: 'H', position: 'left', partialCharge: 'none' },
            { symbol: 'H', position: 'right', partialCharge: 'none' },
          ],
          bonds: [
            { from: 'center', to: 'top', type: 'single' },
            { from: 'center', to: 'bottom', type: 'single' },
            { from: 'center', to: 'left', type: 'single' },
            { from: 'center', to: 'right', type: 'single' },
          ],
          shape: 'tetrahedral',
        },
      };

      const molecule = imfToMolecule(mol);

      expect(molecule.geometry).toBe('tetrahedral');
    });
  });
});
