import { describe, expect, it } from 'vitest';

import {
  countElectrons,
  formatQuantum,
  hundFilling,
  rafeindir,
  valenceOf,
} from '../utils/electrons';

describe('countElectrons', () => {
  it('reads spaced, unspaced, superscript and mixed answers alike', () => {
    expect(countElectrons('1s2 2s2 2p4')).toBe(8);
    expect(countElectrons('1s22s22p4')).toBe(8);
    expect(countElectrons('1s² 2s² 2p⁴')).toBe(8);
    expect(countElectrons('1s²2s²2p⁴')).toBe(8);
    expect(countElectrons('1S2 2S2 2P4')).toBe(8);
  });

  it('keeps two-digit exponents whole', () => {
    expect(countElectrons('1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6')).toBe(36);
    expect(countElectrons('1s22s22p63s23p64s23d104p6')).toBe(36);
    expect(countElectrons('3d14s2')).toBe(3);
  });

  it('refuses what is not a list of subshells rather than guess', () => {
    expect(countElectrons('[Ne] 3s1')).toBeNull();
    expect(countElectrons('1s2 2s2 2p4...')).toBeNull();
    expect(countElectrons('vetni')).toBeNull();
    expect(countElectrons('   ')).toBeNull();
  });
});

describe('hundFilling', () => {
  it('puts one electron in every orbital before any pair', () => {
    expect(hundFilling(1, 1)).toEqual([1]);
    expect(hundFilling(2, 1)).toEqual([2]);
    expect(hundFilling(2, 3)).toEqual([1, 1, 0]);
    expect(hundFilling(3, 3)).toEqual([1, 1, 1]);
    expect(hundFilling(4, 3)).toEqual([2, 1, 1]);
    expect(hundFilling(5, 3)).toEqual([2, 2, 1]);
    expect(hundFilling(6, 5)).toEqual([2, 1, 1, 1, 1]);
    expect(hundFilling(10, 5)).toEqual([2, 2, 2, 2, 2]);
    expect(hundFilling(0, 3)).toEqual([0, 0, 0]);
  });
});

describe('rafeindir', () => {
  it('takes the singular after one and after compounds ending in one, but not after 11', () => {
    expect([1, 21, 31, 101].map(rafeindir)).toEqual(Array(4).fill('rafeind'));
    expect([0, 2, 5, 11, 12, 111].map(rafeindir)).toEqual(Array(6).fill('rafeindir'));
  });
});

describe('formatQuantum', () => {
  it('writes halves as ½ with a true minus sign, and signs a spin', () => {
    expect(formatQuantum(0.5, { signed: true })).toBe('+½');
    expect(formatQuantum(-0.5, { signed: true })).toBe('−½');
    expect(formatQuantum(1, { signed: true })).toBe('+1');
    expect(formatQuantum(0, { signed: true })).toBe('0');
    expect(formatQuantum(-3)).toBe('−3');
    expect(formatQuantum(2)).toBe('2');
  });
});

describe('valenceOf', () => {
  it('follows the textbook: highest n for main-group elements, ns + (n − 1)d otherwise', () => {
    expect(valenceOf('[Ar] 4s² 3d¹⁰ 4p⁵')).toEqual({ valence: '4s² 4p⁵', core: ['3d¹⁰'] });
    // The textbook's own worked example, gallium: three valence electrons.
    expect(valenceOf('[Ar] 4s² 3d¹⁰ 4p¹')).toEqual({ valence: '4s² 4p¹', core: ['3d¹⁰'] });
    expect(valenceOf('[Ar] 4s² 3d⁶')).toEqual({ valence: '4s² 3d⁶', core: [] });
    expect(valenceOf('[Ar] 4s¹ 3d¹⁰')).toEqual({ valence: '4s¹ 3d¹⁰', core: [] });
    expect(valenceOf('[Kr] 5s²')).toEqual({ valence: '5s²', core: [] });
    expect(valenceOf('[Ne] 3s² 3p⁵')).toEqual({ valence: '3s² 3p⁵', core: [] });
  });
});
