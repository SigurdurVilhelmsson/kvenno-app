/**
 * Tests for the lab-reports experiment configuration files.
 * Verifies that all experiment configs have required fields, correct structure,
 * consistent point totals, and that lookup helpers work correctly.
 */
import { describe, it, expect } from 'vitest';

import {
  experimentConfigs,
  experimentConfigs2,
  getExperiments,
  getExperiments2,
  getExperiment,
  getExperiment2,
} from '@/config/experiments';

describe('experiment configs - required fields', () => {
  it('all 3rd year configs have id, title, and year', () => {
    for (const [key, config] of Object.entries(experimentConfigs)) {
      expect(config.id, `${key} missing id`).toBeDefined();
      expect(config.title, `${key} missing title`).toBeDefined();
      expect(config.year, `${key} missing year`).toBeDefined();
      expect(typeof config.id).toBe('string');
      expect(typeof config.title).toBe('string');
      expect(typeof config.year).toBe('number');
    }
  });

  it('all 2nd year configs have id, title, and year', () => {
    for (const [key, config] of Object.entries(experimentConfigs2)) {
      expect(config.id, `${key} missing id`).toBeDefined();
      expect(config.title, `${key} missing title`).toBeDefined();
      expect(config.year, `${key} missing year`).toBeDefined();
      expect(typeof config.id).toBe('string');
      expect(typeof config.title).toBe('string');
      expect(typeof config.year).toBe('number');
    }
  });

  it('all config ids match their keys in experimentConfigs', () => {
    for (const [key, config] of Object.entries(experimentConfigs)) {
      expect(config.id).toBe(key);
    }
  });

  it('all config ids match their keys in experimentConfigs2', () => {
    for (const [key, config] of Object.entries(experimentConfigs2)) {
      expect(config.id).toBe(key);
    }
  });
});

describe('3rd year configs - sections structure', () => {
  it('each 3rd year config has a non-empty sections array', () => {
    for (const [key, config] of Object.entries(experimentConfigs)) {
      expect(Array.isArray(config.sections), `${key} sections is not an array`).toBe(true);
      expect(config.sections.length, `${key} has no sections`).toBeGreaterThan(0);
    }
  });

  it('each section has id, name, and maxPoints', () => {
    for (const [key, config] of Object.entries(experimentConfigs)) {
      for (const section of config.sections) {
        expect(section.id, `${key} section missing id`).toBeDefined();
        expect(section.name, `${key} section ${section.id} missing name`).toBeDefined();
        expect(section.maxPoints, `${key} section ${section.id} missing maxPoints`).toBeDefined();
        expect(typeof section.maxPoints).toBe('number');
      }
    }
  });

  it('section maxPoints sum to 50 for each 3rd year config', () => {
    for (const [key, config] of Object.entries(experimentConfigs)) {
      const total = config.sections.reduce((sum, s) => sum + (s.maxPoints ?? 0), 0);
      expect(total, `${key} total points should be 50 but is ${total}`).toBe(50);
    }
  });

  it('each section has pointGuidance and criteria', () => {
    for (const [key, config] of Object.entries(experimentConfigs)) {
      for (const section of config.sections) {
        expect(
          section.pointGuidance,
          `${key} section ${section.id} missing pointGuidance`
        ).toBeDefined();
        expect(
          section.criteria,
          `${key} section ${section.id} missing criteria`
        ).toBeDefined();
        expect(section.criteria.good, `${key} section ${section.id} missing criteria.good`).toBeDefined();
        expect(
          section.criteria.unsatisfactory,
          `${key} section ${section.id} missing criteria.unsatisfactory`
        ).toBeDefined();
      }
    }
  });
});

describe('getExperiment and getExperiments helpers', () => {
  it('getExperiment("jafnvaegi") returns the jafnvaegi config', () => {
    const config = getExperiment('jafnvaegi');
    expect(config).toBeDefined();
    expect(config.id).toBe('jafnvaegi');
    expect(config.title).toBe('Jafnvægi í efnahvörfum');
    expect(config.year).toBe(3);
  });

  it('getExperiment("nonexistent") returns undefined', () => {
    const config = getExperiment('nonexistent');
    expect(config).toBeUndefined();
  });

  it('getExperiments() returns 2 configs', () => {
    const experiments = getExperiments();
    expect(experiments).toHaveLength(2);
  });

  it('getExperiments2() returns 1 config', () => {
    const experiments = getExperiments2();
    expect(experiments).toHaveLength(1);
  });

  it('getExperiment2("orka-2ar") returns the orka-2ar config', () => {
    const config = getExperiment2('orka-2ar');
    expect(config).toBeDefined();
    expect(config.id).toBe('orka-2ar');
    expect(config.year).toBe(2);
  });
});

describe('2nd year config - checklist structure', () => {
  it('orka-2ar has a checklist with sections', () => {
    const config = getExperiment2('orka-2ar');
    expect(config.checklist).toBeDefined();
    const sectionKeys = Object.keys(config.checklist);
    expect(sectionKeys.length).toBeGreaterThan(0);
    for (const key of sectionKeys) {
      const section = config.checklist[key];
      expect(section.name, `${key} missing name`).toBeDefined();
      expect(section.items, `${key} missing items`).toBeDefined();
      expect(Array.isArray(section.items)).toBe(true);
      expect(section.items.length).toBeGreaterThan(0);
    }
  });

  it('orka-2ar has baselineComparison enabled', () => {
    const config = getExperiment2('orka-2ar');
    expect(config.baselineComparison).toBeDefined();
    expect(config.baselineComparison.enabled).toBe(true);
    expect(config.baselineComparison.requiredConcepts.length).toBeGreaterThan(0);
    expect(config.baselineComparison.requiredFormulas.length).toBeGreaterThan(0);
  });
});

describe('jafnvaegi worksheet', () => {
  it('jafnvaegi has worksheet with reaction, materials, equipment, and steps', () => {
    const config = getExperiment('jafnvaegi');
    expect(config.worksheet).toBeDefined();
    expect(config.worksheet!.reaction).toContain('Fe');
    expect(config.worksheet!.reaction).toContain('SCN');
    expect(Array.isArray(config.worksheet!.materials)).toBe(true);
    expect(config.worksheet!.materials.length).toBeGreaterThan(0);
    expect(Array.isArray(config.worksheet!.equipment)).toBe(true);
    expect(config.worksheet!.equipment.length).toBeGreaterThan(0);
    expect(Array.isArray(config.worksheet!.steps)).toBe(true);
    expect(config.worksheet!.steps.length).toBeGreaterThan(0);
  });
});
