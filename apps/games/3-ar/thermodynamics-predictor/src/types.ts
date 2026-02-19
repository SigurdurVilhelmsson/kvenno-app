export interface Problem {
  id: number;
  reaction: string;
  name: string;
  deltaH: number; // kJ/mol
  deltaS: number; // J/(mol·K)
  defaultTemp: number; // Kelvin
  scenario: 1 | 2 | 3 | 4;
  difficulty: 'Auðvelt' | 'Miðlungs' | 'Erfitt';
  advancedTask?: string;
}

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export type GameMode = 'menu' | 'learning' | 'challenge';

export type Spontaneity = 'spontaneous' | 'equilibrium' | 'non-spontaneous';

export interface ProblemsData {
  beginner: Problem[];
  intermediate: Problem[];
  advanced: Problem[];
}
