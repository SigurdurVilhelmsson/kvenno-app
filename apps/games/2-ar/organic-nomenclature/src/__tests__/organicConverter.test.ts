import { describe, it, expect } from 'vitest';
import {
  organicToMolecule,
  type OrganicMolecule,
} from '../utils/organicConverter';

describe('organicToMolecule', () => {
  describe('alkane molecules (all single bonds)', () => {
    it('creates propane with 3 carbon atoms', () => {
      const propane: OrganicMolecule = {
        id: 1,
        type: 'alkane',
        carbons: 3,
        formula: 'C₃H₈',
        correctName: 'própan',
      };

      const molecule = organicToMolecule(propane);

      expect(molecule.atoms).toHaveLength(3);
      expect(molecule.atoms.every((a) => a.symbol === 'C')).toBe(true);
    });

    it('creates all single bonds for alkane', () => {
      const butane: OrganicMolecule = {
        id: 2,
        type: 'alkane',
        carbons: 4,
        formula: 'C₄H₁₀',
        correctName: 'bútan',
      };

      const molecule = organicToMolecule(butane);

      expect(molecule.bonds).toHaveLength(3); // 4 carbons = 3 bonds
      expect(molecule.bonds.every((b) => b.type === 'single')).toBe(true);
    });

    it('does not highlight any bonds in alkane', () => {
      const ethane: OrganicMolecule = {
        id: 3,
        type: 'alkane',
        carbons: 2,
        formula: 'C₂H₆',
        correctName: 'etan',
      };

      const molecule = organicToMolecule(ethane);

      expect(molecule.bonds.every((b) => b.highlight === false)).toBe(true);
    });
  });

  describe('alkene molecules (double bond)', () => {
    it('creates double bond at the correct position', () => {
      const propene: OrganicMolecule = {
        id: 4,
        type: 'alkene',
        carbons: 3,
        formula: 'C₃H₆',
        correctName: 'própen',
        doublePosition: 1,
      };

      const molecule = organicToMolecule(propene);

      // Bond at index 0 is between c-0 and c-1 (position 1)
      expect(molecule.bonds[0].type).toBe('double');
      // Bond at index 1 is between c-1 and c-2 (position 2) - should be single
      expect(molecule.bonds[1].type).toBe('single');
    });

    it('highlights the double bond', () => {
      const butene: OrganicMolecule = {
        id: 5,
        type: 'alkene',
        carbons: 4,
        formula: 'C₄H₈',
        correctName: 'bút-2-en',
        doublePosition: 2,
      };

      const molecule = organicToMolecule(butene);

      // Bond at position 2 (index 1) should be highlighted
      expect(molecule.bonds[1].highlight).toBe(true);
      // Single bonds should not be highlighted
      expect(molecule.bonds[0].highlight).toBe(false);
    });

    it('creates correct carbon count for alkene', () => {
      const pentene: OrganicMolecule = {
        id: 6,
        type: 'alkene',
        carbons: 5,
        formula: 'C₅H₁₀',
        correctName: 'pent-1-en',
        doublePosition: 1,
      };

      const molecule = organicToMolecule(pentene);

      expect(molecule.atoms).toHaveLength(5);
      expect(molecule.carbonChainLength).toBe(5);
    });
  });

  describe('alkyne molecules (triple bond)', () => {
    it('creates triple bond at the correct position', () => {
      const propyne: OrganicMolecule = {
        id: 7,
        type: 'alkyne',
        carbons: 3,
        formula: 'C₃H₄',
        correctName: 'própýn',
        triplePosition: 1,
      };

      const molecule = organicToMolecule(propyne);

      expect(molecule.bonds[0].type).toBe('triple');
      expect(molecule.bonds[1].type).toBe('single');
    });

    it('highlights the triple bond', () => {
      const butyne: OrganicMolecule = {
        id: 8,
        type: 'alkyne',
        carbons: 4,
        formula: 'C₄H₆',
        correctName: 'bút-1-ýn',
        triplePosition: 1,
      };

      const molecule = organicToMolecule(butyne);

      expect(molecule.bonds[0].highlight).toBe(true);
      // Remaining bonds should not be highlighted
      expect(molecule.bonds[1].highlight).toBe(false);
      expect(molecule.bonds[2].highlight).toBe(false);
    });
  });

  describe('common properties', () => {
    it('assigns sequential carbon labels starting at 1', () => {
      const propane: OrganicMolecule = {
        id: 9,
        type: 'alkane',
        carbons: 3,
        formula: 'C₃H₈',
        correctName: 'própan',
      };

      const molecule = organicToMolecule(propane);

      expect(molecule.atoms[0].label).toBe('1');
      expect(molecule.atoms[1].label).toBe('2');
      expect(molecule.atoms[2].label).toBe('3');
    });

    it('sets molecule id to lowercase correct name', () => {
      const molecule = organicToMolecule({
        id: 10,
        type: 'alkane',
        carbons: 2,
        formula: 'C₂H₆',
        correctName: 'Etan',
      });

      expect(molecule.id).toBe('etan');
    });

    it('preserves formula and name in output', () => {
      const pentane: OrganicMolecule = {
        id: 11,
        type: 'alkane',
        carbons: 5,
        formula: 'C₅H₁₂',
        correctName: 'pentan',
      };

      const molecule = organicToMolecule(pentane);

      expect(molecule.formula).toBe('C₅H₁₂');
      expect(molecule.name).toBe('pentan');
    });

    it('sets carbonChainLength from carbons count', () => {
      const hexane: OrganicMolecule = {
        id: 12,
        type: 'alkane',
        carbons: 6,
        formula: 'C₆H₁₄',
        correctName: 'hexan',
      };

      const molecule = organicToMolecule(hexane);

      expect(molecule.carbonChainLength).toBe(6);
    });
  });
});
