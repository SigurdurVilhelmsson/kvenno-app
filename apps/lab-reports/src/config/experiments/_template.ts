import { ExperimentConfig } from '@/types';

/**
 * [EXPERIMENT NAME IN ICELANDIC]
 * [X]th year chemistry experiment
 *
 * [Brief description of what this experiment explores]
 */
export const experimentId: ExperimentConfig = {
  // Unique identifier (use lowercase, no spaces)
  id: 'experiment-id',

  // Full experiment title in Icelandic
  title: 'Experiment Title',

  // Which year this is for (1, 2, 3, etc.)
  year: 3,

  // Worksheet information (optional but recommended for student mode)
  worksheet: {
    // Main chemical reaction or equation
    reaction: 'A + B → C',

    // List of materials/chemicals needed
    materials: [
      'Material 1',
      'Material 2',
      'Material 3',
    ],

    // List of equipment needed
    equipment: [
      'Equipment 1',
      'Equipment 2',
      'Equipment 3',
    ],

    // Step-by-step procedure
    steps: [
      'Step 1: Do this',
      'Step 2: Do that',
      'Step 3: Observe results',
      // Use leading spaces for sub-steps:
      '  a. Sub-step 1',
      '  b. Sub-step 2',
    ],
  },

  // Report sections to evaluate
  sections: [
    {
      id: 'tilgangur',
      name: 'Tilgangur',
      description: 'Brief description of what should be in this section',
      maxPoints: 3,
      criteria: {
        good: 'What makes this section excellent',
        needsImprovement: 'What indicates needs improvement',
        unsatisfactory: 'What makes it unsatisfactory',
      },
    },
    {
      id: 'fraedi',
      name: 'Fræðikafli',
      description: 'Theoretical background, definitions, laws, equations',
      maxPoints: 7.5,
      criteria: {
        good: 'Complete theory with numbered equations',
        needsImprovement: 'Theory present but missing details',
        unsatisfactory: 'Missing important theoretical elements',
      },
    },
    {
      id: 'taeki',
      name: 'Tæki og efni',
      description: 'Complete list of equipment and materials',
      maxPoints: 1.5,
      criteria: {
        good: 'Complete and accurate list',
        needsImprovement: 'List present but incomplete',
        unsatisfactory: 'Very incomplete or missing',
      },
    },
    {
      id: 'framkvamd',
      name: 'Framkvæmd',
      description: 'Should reference worksheet + brief description',
      maxPoints: 3,
      criteria: {
        good: 'References worksheet with brief summary',
        needsImprovement: 'Missing reference or summary',
        unsatisfactory: 'Missing or too detailed',
      },
      specialNote: 'Students should reference worksheet, not rewrite everything!',
    },
    {
      id: 'nidurstodur',
      name: 'Niðurstöður',
      description: 'Results, calculations, observations, analysis',
      maxPoints: 7.5,
      criteria: {
        good: 'All calculations, observations, and analysis present',
        needsImprovement: 'Most present but missing some details',
        unsatisfactory: 'Missing important calculations or analysis',
      },
    },
    {
      id: 'lokaord',
      name: 'Lokaorð',
      description: 'Summary and connection to theory',
      maxPoints: 6,
      criteria: {
        good: 'Strong summary with clear theoretical connections',
        needsImprovement: 'Summary present but could be better',
        unsatisfactory: 'Weak or missing summary',
      },
    },
    {
      id: 'undirskrift',
      name: 'Undirskrift',
      description: 'Student signature present',
      maxPoints: 1.5,
      criteria: {
        good: 'Signature present',
        unsatisfactory: 'Signature missing',
      },
    },
  ],

  // Grading scale (usually ['10', '8', '5', '0'])
  gradeScale: ['10', '8', '5', '0'],

  // Experiment-specific evaluation instructions for the AI (optional)
  // These are injected into the system prompt after the experiment title.
  // Use for chemistry facts, accuracy rules, and checklists specific to this experiment.
  // evaluationNotes: [
  //   'Chemistry facts specific to this experiment',
  //   'Checklist for section evaluation',
  // ],
};
