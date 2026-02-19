/**
 * Types for the enhanced feedback system
 */

/**
 * Detailed feedback for game answers
 * Provides rich context beyond simple correct/incorrect
 */
export interface DetailedFeedback {
  /** Whether the answer was correct */
  isCorrect: boolean;
  /** Explanation of why the answer is correct or incorrect */
  explanation: string;
  /** Common misconception if the answer was wrong (optional) */
  misconception?: string;
  /** Related chemistry concepts for further learning */
  relatedConcepts?: string[];
  /** Suggested next steps or what to learn next */
  nextSteps?: string;
}

/**
 * Feedback severity levels for visual styling
 */
export type FeedbackSeverity = 'success' | 'error' | 'warning' | 'info';

/**
 * Configuration for the FeedbackPanel component
 */
export interface FeedbackPanelConfig {
  /** Whether to show the expandable "Why?" section */
  showExplanation?: boolean;
  /** Whether to show misconception warnings */
  showMisconceptions?: boolean;
  /** Whether to show related concept chips */
  showRelatedConcepts?: boolean;
  /** Whether to show next steps suggestions */
  showNextSteps?: boolean;
  /** Auto-collapse the panel after this many milliseconds (0 = never) */
  autoCollapseMs?: number;
}

/**
 * Related concept chip data
 */
export interface RelatedConcept {
  /** Unique identifier for the concept */
  id: string;
  /** Display label for the concept */
  label: string;
  /** Optional link to learn more */
  href?: string;
}

/**
 * Props for FeedbackPanel component
 */
export interface FeedbackPanelProps {
  /** The feedback to display */
  feedback: DetailedFeedback;
  /** Visual severity (auto-detected from isCorrect if not provided) */
  severity?: FeedbackSeverity;
  /** Configuration options */
  config?: FeedbackPanelConfig;
  /** Callback when the panel is dismissed */
  onDismiss?: () => void;
  /** Callback when a related concept is clicked */
  onConceptClick?: (conceptId: string) => void;
  /** Additional CSS class names */
  className?: string;
}
