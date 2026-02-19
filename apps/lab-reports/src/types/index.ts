// Application modes
export type AppMode = 'teacher' | 'student';

// Experiment and section types
export interface SectionCriteria {
  good: string;
  needsImprovement?: string;
  unsatisfactory: string;
}

export interface ExperimentSection {
  id: string;
  name: string;
  description: string;
  criteria: SectionCriteria;
  specialNote?: string;
  maxPoints?: number; // Maximum points for this section
  pointGuidance?: Record<string, string>; // Point ranges with descriptions
}

export interface Worksheet {
  reaction: string;
  materials: string[];
  equipment: string[];
  steps: string[];
}

export interface ExperimentConfig {
  id: string;
  title: string;
  year: number;
  worksheet?: Worksheet;
  sections: ExperimentSection[];
  gradeScale: string[];
  evaluationNotes?: string[]; // Experiment-specific evaluation instructions for the AI
}

export interface ExperimentConfigs {
  [key: string]: ExperimentConfig;
}

// Analysis results
export interface SectionAnalysis {
  present: boolean;
  quality?: 'good' | 'needs improvement' | 'unsatisfactory';
  note?: string;
  points?: number; // Points earned for this section
  maxPoints?: number; // Maximum points possible for this section
  reasoning?: string; // Explanation for point deductions (teacher mode)
}

export interface AnalysisResult {
  filename: string;
  sections?: {
    [sectionId: string]: SectionAnalysis;
  };
  suggestedGrade?: string;
  totalPoints?: number; // Total points earned (e.g., 25)
  maxTotalPoints?: number; // Maximum possible points (e.g., 30)
  quickSummary?: string; // Brief summary for teachers
  error?: string;
  extractionDebug?: FileContent['debug']; // Debug info for troubleshooting DOCX/PDF differences
}

// Student assistance types
export interface StudentFeedback {
  filename: string;
  overallAssessment?: string;
  heildareinkunn?: string; // Total grade (e.g., "25/30")
  totalPoints?: number;
  maxTotalPoints?: number;
  styrkir?: string[]; // Overall strengths
  almennarAthugasemdir?: string[]; // General comments
  sections: {
    [sectionId: string]: {
      present: boolean;
      points?: number;
      maxPoints?: number;
      strengths?: string[];
      improvements?: string[];
      suggestions?: string[];
      athugasemdir?: string; // Comments in Icelandic
    };
  };
  nextSteps?: string[];
  næstuSkref?: string[]; // Next steps in Icelandic
  extractionDebug?: FileContent['debug']; // Debug info for troubleshooting DOCX/PDF differences
}

// Session management
export interface GradingSession {
  id: string;
  name: string;
  experiment: string;
  timestamp: string;
  results: AnalysisResult[] | StudentFeedback[];
  fileCount: number;
  mode: AppMode;
}

// File processing
export interface FileContent {
  type: 'text' | 'image' | 'pdf' | 'docx';
  data: string;
  mediaType?: string;
  images?: Array<{
    data: string;
    mediaType: string;
  }>;
  equations?: string[]; // LaTeX equations extracted from document
  debug?: {
    // Debug information for troubleshooting extraction differences
    textLength: number;
    textLines: number;
    imageCount: number;
    totalImageSize: number;
    averageImageSize: number;
    extractionMethod: string; // 'direct-pdf' | 'docx-converted-pdf'
    textSample?: string; // First 500 chars of extracted text
    textStructure?: {
      // Text structure analysis
      paragraphCount: number;
      averageLineLength: number;
      whitespaceDensity: number;
    };
    tableDetection?: {
      // Table structure detection
      columnSeparatorsDetected: number;
      hasTableStructure: boolean;
    };
  };
}

// 2nd year simplified checklist types
export interface ChecklistItem {
  id: string;
  label: string;
  autoCheck: boolean;
  manualRequired?: boolean;
}

export interface ChecklistSection {
  name: string;
  weight: string;
  items: ChecklistItem[];
  penalty?: string;
}

export interface BaselineComparisonConfig {
  enabled: boolean;
  requiredConcepts: string[];
  requiredFormulas: string[];
}

export interface ExperimentConfig2 {
  id: string;
  title: string;
  year: number;
  baselineComparison: BaselineComparisonConfig;
  checklist: Record<string, ChecklistSection>;
  alwaysManualCheck: string[];
}

export interface ChecklistResult {
  id: string;
  label: string;
  present: boolean | 'needs_manual_check';
  note?: string;
}

export interface BaselineComparisonResult {
  conceptsMatch: boolean;
  formulasMatch: boolean;
  languageRelated: boolean;
  overallVerdict: 'ok' | 'warning' | 'mismatch';
  notes?: string;
  conceptsFound: string[];
  conceptsMissing: string[];
  formulasFound: string[];
  formulasMissing: string[];
}

export interface Analysis2Result {
  studentName?: string;
  draftProvided: boolean;
  baselineComparison?: BaselineComparisonResult;
  checklist: Record<string, ChecklistResult[]>;
  manualChecksRequired: string[];
  summaryIcelandic: string;
  error?: string;
}

// Toast notification
export interface Toast {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

// Processing status
export interface ProcessingStatus {
  current: number;
  total: number;
  currentFile: string;
}
