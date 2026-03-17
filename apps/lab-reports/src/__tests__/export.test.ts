/**
 * Tests for the lab-reports CSV export module.
 * Mocks DOM APIs (createElement, URL.createObjectURL) to verify CSV generation.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import type {
  AnalysisResult,
  ExperimentSection,
  Analysis2Result,
  ExperimentConfig2,
} from '@/types';

// Mock DOM APIs for CSV download
const mockAnchor = {
  href: '',
  download: '',
  click: vi.fn(),
  style: {} as CSSStyleDeclaration,
};

let createElementSpy: ReturnType<typeof vi.fn>;
let appendChildSpy: ReturnType<typeof vi.fn>;
let removeChildSpy: ReturnType<typeof vi.fn>;
let createObjectURLSpy: ReturnType<typeof vi.fn>;
let revokeObjectURLSpy: ReturnType<typeof vi.fn>;

beforeEach(() => {
  mockAnchor.href = '';
  mockAnchor.download = '';
  mockAnchor.click.mockReset();

  // Spy on document.createElement to return our mock anchor for 'a' elements
  createElementSpy = vi.spyOn(document, 'createElement').mockImplementation(((tagName: string) => {
    if (tagName === 'a') return mockAnchor as unknown as HTMLElement;
    return document.createElement.call(document, tagName);
  }) as typeof document.createElement);

  appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
  removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation((node) => node);

  // Mock URL static methods without replacing the URL constructor
  createObjectURLSpy = vi.fn(() => 'blob:mock-url');
  revokeObjectURLSpy = vi.fn();
  URL.createObjectURL = createObjectURLSpy as typeof URL.createObjectURL;
  URL.revokeObjectURL = revokeObjectURLSpy as typeof URL.revokeObjectURL;
});

afterEach(() => {
  vi.restoreAllMocks();
});

// Test data
const testSections: ExperimentSection[] = [
  {
    id: 'inngangur',
    name: 'Inngangur',
    description: 'Introduction',
    maxPoints: 5,
    criteria: { good: 'Good', unsatisfactory: 'Bad' },
  },
  {
    id: 'nidurstodur',
    name: 'Niðurstöður',
    description: 'Results',
    maxPoints: 10,
    criteria: { good: 'Good', unsatisfactory: 'Bad' },
  },
];

const testResults: AnalysisResult[] = [
  {
    filename: 'student1.pdf',
    suggestedGrade: '12/15',
    sections: {
      inngangur: { present: true, quality: 'good', points: 5, maxPoints: 5, note: 'Vel gert' },
      nidurstodur: {
        present: true,
        quality: 'needs improvement',
        points: 7,
        maxPoints: 10,
        note: 'Vantar',
      },
    },
  },
  {
    filename: 'student2.pdf',
    suggestedGrade: '8/15',
    sections: {
      inngangur: {
        present: false,
        quality: 'unsatisfactory',
        points: 0,
        maxPoints: 5,
        note: 'Vantar',
      },
      nidurstodur: { present: true, quality: 'good', points: 8, maxPoints: 10, note: 'Gott' },
    },
  },
];

describe('exportResultsToCSV', () => {
  it('triggers a file download', async () => {
    const { exportResultsToCSV } = await import('@/utils/export');

    exportResultsToCSV(testResults, testSections);

    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(mockAnchor.click).toHaveBeenCalledOnce();
    expect(revokeObjectURLSpy).toHaveBeenCalled();
  });

  it('uses custom filename when provided', async () => {
    const { exportResultsToCSV } = await import('@/utils/export');

    exportResultsToCSV(testResults, testSections, 'custom-report.csv');

    expect(mockAnchor.download).toBe('custom-report.csv');
  });

  it('uses default filename with current date when no filename given', async () => {
    const { exportResultsToCSV } = await import('@/utils/export');

    exportResultsToCSV(testResults, testSections);

    expect(mockAnchor.download).toMatch(/^lab_report_grades_\d{4}-\d{2}-\d{2}\.csv$/);
  });

  it('creates anchor element with blob URL', async () => {
    const { exportResultsToCSV } = await import('@/utils/export');

    exportResultsToCSV(testResults, testSections);

    expect(mockAnchor.href).toBe('blob:mock-url');
  });

  it('calls createObjectURL with a Blob', async () => {
    const { exportResultsToCSV } = await import('@/utils/export');

    exportResultsToCSV(testResults, testSections);

    expect(createObjectURLSpy).toHaveBeenCalledOnce();
    const blob = createObjectURLSpy.mock.calls[0][0];
    expect(blob).toBeInstanceOf(Blob);
  });

  it('appends and removes anchor from document body', async () => {
    const { exportResultsToCSV } = await import('@/utils/export');

    exportResultsToCSV(testResults, testSections);

    expect(appendChildSpy).toHaveBeenCalledWith(mockAnchor);
    expect(removeChildSpy).toHaveBeenCalledWith(mockAnchor);
  });
});

describe('exportChecklist2ToCSV', () => {
  const testExperiment2: ExperimentConfig2 = {
    id: 'test-2ar',
    title: 'Test 2. árs tilraun',
    year: 2,
    baselineComparison: {
      enabled: true,
      requiredConcepts: ['hitavarmtafl', 'varmi'],
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
    },
    alwaysManualCheck: ['myndrit'],
  };

  const testResults2: Analysis2Result[] = [
    {
      draftProvided: true,
      baselineComparison: {
        conceptsMatch: true,
        formulasMatch: true,
        languageRelated: true,
        overallVerdict: 'ok',
        conceptsFound: ['hitavarmtafl'],
        conceptsMissing: [],
        formulasFound: ['q = Cs * m * deltaT'],
        formulasMissing: [],
      },
      checklist: {
        uppsetning: [
          { id: 'tilgangur', label: 'Tilgangur skýrslu', present: true },
          { id: 'efni', label: 'Efni og tæki', present: false, note: 'Vantar lista' },
        ],
      },
      manualChecksRequired: ['myndrit'],
      summaryIcelandic: 'Skýrslan er ágæt en vantar nokkur atriði.',
    },
  ];

  it('triggers a file download', async () => {
    const { exportChecklist2ToCSV } = await import('@/utils/export');

    exportChecklist2ToCSV(testResults2, ['nemandi1.pdf'], testExperiment2);

    expect(mockAnchor.click).toHaveBeenCalledOnce();
  });

  it('uses default filename with date prefix', async () => {
    const { exportChecklist2ToCSV } = await import('@/utils/export');

    exportChecklist2ToCSV(testResults2, ['nemandi1.pdf'], testExperiment2);

    expect(mockAnchor.download).toMatch(/^gatlistamat_\d{4}-\d{2}-\d{2}\.csv$/);
  });

  it('uses custom filename when provided', async () => {
    const { exportChecklist2ToCSV } = await import('@/utils/export');

    exportChecklist2ToCSV(testResults2, ['nemandi1.pdf'], testExperiment2, 'custom.csv');

    expect(mockAnchor.download).toBe('custom.csv');
  });

  it('creates blob URL for download', async () => {
    const { exportChecklist2ToCSV } = await import('@/utils/export');

    exportChecklist2ToCSV(testResults2, ['nemandi1.pdf'], testExperiment2);

    expect(createObjectURLSpy).toHaveBeenCalledOnce();
    expect(mockAnchor.href).toBe('blob:mock-url');
  });
});
