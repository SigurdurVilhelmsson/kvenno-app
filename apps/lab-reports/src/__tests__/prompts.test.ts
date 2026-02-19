/**
 * Tests for the lab-reports prompt builder module.
 * Verifies that system prompts contain expected sections, experiment info,
 * and Icelandic formatting instructions.
 */
import { describe, it, expect } from 'vitest';

import {
  buildTeacherSystemPrompt,
  buildStudentSystemPrompt,
  build2ndYearSystemPrompt,
  build2ndYearUserPrompt,
} from '@/config/prompts';
import type { ExperimentConfig, ExperimentConfig2 } from '@/types';

// Minimal experiment config for prompt testing
const testExperiment: ExperimentConfig = {
  id: 'test-tilraun',
  title: 'Hlutleysing syru',
  year: 3,
  worksheet: {
    reaction: 'HCl + NaOH -> NaCl + H2O',
    materials: ['HCl', 'NaOH'],
    equipment: ['Biker', 'Pipetta'],
    steps: ['Mældu', 'Blandaðu'],
  },
  sections: [
    {
      id: 'inngangur',
      name: 'Inngangur',
      description: 'Inngangur tilraunar',
      maxPoints: 5,
      criteria: {
        good: 'Skýr inngangur',
        needsImprovement: 'Vantar upplýsingar',
        unsatisfactory: 'Enginn inngangur',
      },
    },
    {
      id: 'adferd',
      name: 'Aðferð',
      description: 'Lýsing á aðferð',
      maxPoints: 10,
      criteria: {
        good: 'Skýr og nákvæm aðferð',
        unsatisfactory: 'Vantar aðferð',
      },
      specialNote: 'Athugaðu hvort nemandi nefni öryggisráðstafanir',
    },
  ],
  gradeScale: ['A', 'B', 'C', 'D'],
  evaluationNotes: ['Þessi tilraun krefst þekkingar á sýru-basa efnahvarfi'],
};

const testExperiment2: ExperimentConfig2 = {
  id: 'orka-2ar',
  title: 'Orkubreytingar',
  year: 2,
  baselineComparison: {
    enabled: true,
    requiredConcepts: ['hitavarmtafl', 'varmi', 'innvermið'],
    requiredFormulas: ['q = Cs * m * deltaT'],
  },
  checklist: {
    uppsetning: {
      name: 'Uppsetning',
      weight: '15%',
      items: [
        { id: 'tilgangur', label: 'Tilgangur skýrslu', autoCheck: true },
        { id: 'efni', label: 'Efni og tæki', autoCheck: true },
      ],
    },
    framkvamd: {
      name: 'Framkvæmd',
      weight: '20%',
      items: [
        { id: 'adferd', label: 'Lýsing á aðferð', autoCheck: true },
        { id: 'oryggi', label: 'Öryggisatriði', autoCheck: true, manualRequired: true },
      ],
    },
  },
  alwaysManualCheck: ['myndrit'],
};

describe('buildTeacherSystemPrompt', () => {
  it('includes experiment title', () => {
    const prompt = buildTeacherSystemPrompt(testExperiment);
    expect(prompt).toContain('Hlutleysing syru');
  });

  it('includes section names with max points', () => {
    const prompt = buildTeacherSystemPrompt(testExperiment);
    expect(prompt).toContain('Inngangur');
    expect(prompt).toContain('0-5');
    expect(prompt).toContain('Aðferð');
    expect(prompt).toContain('0-10');
  });

  it('includes grading criteria', () => {
    const prompt = buildTeacherSystemPrompt(testExperiment);
    expect(prompt).toContain('Skýr inngangur');
    expect(prompt).toContain('Enginn inngangur');
  });

  it('includes JSON format instructions', () => {
    const prompt = buildTeacherSystemPrompt(testExperiment);
    expect(prompt).toContain('JSON');
    expect(prompt).toContain('sections');
    expect(prompt).toContain('suggestedGrade');
  });

  it('includes total max points', () => {
    const prompt = buildTeacherSystemPrompt(testExperiment);
    // 5 + 10 = 15
    expect(prompt).toContain('15');
  });

  it('includes reaction from worksheet', () => {
    const prompt = buildTeacherSystemPrompt(testExperiment);
    expect(prompt).toContain('HCl + NaOH');
  });

  it('includes evaluation notes', () => {
    const prompt = buildTeacherSystemPrompt(testExperiment);
    expect(prompt).toContain('sýru-basa efnahvarfi');
  });

  it('includes special notes for sections that have them', () => {
    const prompt = buildTeacherSystemPrompt(testExperiment);
    expect(prompt).toContain('öryggisráðstafanir');
  });

  it('includes Icelandic language instructions', () => {
    const prompt = buildTeacherSystemPrompt(testExperiment);
    expect(prompt).toContain('ÍSLENSKA');
  });
});

describe('buildStudentSystemPrompt', () => {
  it('includes experiment title', () => {
    const prompt = buildStudentSystemPrompt(testExperiment);
    expect(prompt).toContain('Hlutleysing syru');
  });

  it('includes encouraging language instruction', () => {
    const prompt = buildStudentSystemPrompt(testExperiment);
    expect(prompt).toContain('hvetjandi');
  });

  it('includes student-specific JSON structure', () => {
    const prompt = buildStudentSystemPrompt(testExperiment);
    expect(prompt).toContain('heildareinkunn');
    expect(prompt).toContain('styrkir');
    expect(prompt).toContain('næstuSkref');
  });

  it('includes section IDs in JSON template', () => {
    const prompt = buildStudentSystemPrompt(testExperiment);
    expect(prompt).toContain('"inngangur"');
    expect(prompt).toContain('"adferd"');
  });

  it('includes improvements and suggestions fields', () => {
    const prompt = buildStudentSystemPrompt(testExperiment);
    expect(prompt).toContain('improvements');
    expect(prompt).toContain('suggestions');
  });
});

describe('build2ndYearSystemPrompt', () => {
  it('includes experiment title', () => {
    const prompt = build2ndYearSystemPrompt(testExperiment2);
    expect(prompt).toContain('Orkubreytingar');
  });

  it('includes checklist items', () => {
    const prompt = build2ndYearSystemPrompt(testExperiment2);
    expect(prompt).toContain('Tilgangur skýrslu');
    expect(prompt).toContain('Efni og tæki');
    expect(prompt).toContain('Lýsing á aðferð');
  });

  it('includes baseline comparison concepts', () => {
    const prompt = build2ndYearSystemPrompt(testExperiment2);
    expect(prompt).toContain('hitavarmtafl');
    expect(prompt).toContain('varmi');
  });

  it('includes baseline comparison formulas', () => {
    const prompt = build2ndYearSystemPrompt(testExperiment2);
    expect(prompt).toContain('q = Cs * m * deltaT');
  });

  it('instructs binary check only (no point assignment)', () => {
    const prompt = build2ndYearSystemPrompt(testExperiment2);
    expect(prompt).toContain('true/false');
    // Should NOT contain point assignment instructions
    expect(prompt).not.toContain('stig:');
  });

  it('includes JSON format with checklist structure', () => {
    const prompt = build2ndYearSystemPrompt(testExperiment2);
    expect(prompt).toContain('checklist');
    expect(prompt).toContain('baselineComparison');
    expect(prompt).toContain('summaryIcelandic');
  });
});

describe('build2ndYearUserPrompt', () => {
  it('includes final content', () => {
    const prompt = build2ndYearUserPrompt(null, 'Þetta er lokaskýrslan mín');
    expect(prompt).toContain('Þetta er lokaskýrslan mín');
    expect(prompt).toContain('LOKASKÝRSLA');
  });

  it('includes both draft and final content when draft provided', () => {
    const prompt = build2ndYearUserPrompt(
      'Þetta er drögin',
      'Þetta er lokaskýrslan'
    );
    expect(prompt).toContain('DRÖG');
    expect(prompt).toContain('Þetta er drögin');
    expect(prompt).toContain('LOKASKÝRSLA');
    expect(prompt).toContain('Þetta er lokaskýrslan');
  });

  it('instructs to skip baseline when no draft provided', () => {
    const prompt = build2ndYearUserPrompt(null, 'Skýrsla hér');
    expect(prompt).toContain('Engin drög gefin');
  });

  it('does not mention skipping baseline when draft is provided', () => {
    const prompt = build2ndYearUserPrompt('Drög', 'Lokaskýrsla');
    expect(prompt).not.toContain('Engin drög gefin');
  });
});
