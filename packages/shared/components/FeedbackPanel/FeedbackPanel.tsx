import { useState, useEffect, useCallback } from 'react';
import type {
  FeedbackSeverity,
  FeedbackPanelConfig,
  FeedbackPanelProps,
} from '../../types/feedback.types';

const DEFAULT_CONFIG: FeedbackPanelConfig = {
  showExplanation: true,
  showMisconceptions: true,
  showRelatedConcepts: true,
  showNextSteps: true,
  autoCollapseMs: 0,
};

/**
 * Get Tailwind classes based on feedback severity
 */
function getSeverityClasses(severity: FeedbackSeverity): {
  container: string;
  icon: string;
  text: string;
} {
  switch (severity) {
    case 'success':
      return {
        container: 'bg-green-50 border-green-200',
        icon: 'text-green-500',
        text: 'text-green-800',
      };
    case 'error':
      return {
        container: 'bg-red-50 border-red-200',
        icon: 'text-red-500',
        text: 'text-red-800',
      };
    case 'warning':
      return {
        container: 'bg-amber-50 border-amber-200',
        icon: 'text-amber-500',
        text: 'text-amber-800',
      };
    case 'info':
    default:
      return {
        container: 'bg-blue-50 border-blue-200',
        icon: 'text-blue-500',
        text: 'text-blue-800',
      };
  }
}

/**
 * Get icon based on severity
 */
function getSeverityIcon(severity: FeedbackSeverity): string {
  switch (severity) {
    case 'success':
      return '✓';
    case 'error':
      return '✗';
    case 'warning':
      return '⚠';
    case 'info':
    default:
      return 'ℹ';
  }
}

/**
 * FeedbackPanel Component
 *
 * Displays detailed feedback for game answers with expandable sections.
 *
 * Features:
 * - Expandable "Why?" explanation section
 * - Misconception warnings (amber highlight)
 * - Related concept chips
 * - Next steps suggestions
 * - i18n ready (uses text props directly)
 *
 * @example
 * ```tsx
 * <FeedbackPanel
 *   feedback={{
 *     isCorrect: false,
 *     explanation: 'The molar mass of H2O is 18.015 g/mol',
 *     misconception: 'Remember to include all atoms',
 *     relatedConcepts: ['Molar mass', 'Atomic mass'],
 *   }}
 *   onConceptClick={(id) => navigate(`/concept/${id}`)}
 * />
 * ```
 */
export function FeedbackPanel({
  feedback,
  severity: severityProp,
  config: configProp,
  onDismiss,
  onConceptClick,
  className = '',
}: FeedbackPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const config = { ...DEFAULT_CONFIG, ...configProp };
  const severity = severityProp ?? (feedback.isCorrect ? 'success' : 'error');
  const classes = getSeverityClasses(severity);
  const icon = getSeverityIcon(severity);

  // Auto-collapse functionality
  useEffect(() => {
    if (config.autoCollapseMs && config.autoCollapseMs > 0) {
      const timer = setTimeout(() => {
        setIsExpanded(false);
      }, config.autoCollapseMs);
      return () => clearTimeout(timer);
    }
  }, [config.autoCollapseMs, isExpanded]);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    onDismiss?.();
  }, [onDismiss]);

  const handleConceptClick = useCallback(
    (concept: string) => {
      onConceptClick?.(concept.toLowerCase().replace(/\s+/g, '-'));
    },
    [onConceptClick]
  );

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`
        feedback-panel
        ${classes.container}
        border rounded-xl p-4
        transition-all duration-300 ease-in-out
        ${className}
      `}
      role="alert"
      aria-live="polite"
    >
      {/* Header with icon and main message */}
      <div className="flex items-start gap-3">
        <span
          className={`
            ${classes.icon}
            text-2xl font-bold
            flex-shrink-0
          `}
          aria-hidden="true"
        >
          {icon}
        </span>

        <div className="flex-1 min-w-0">
          {/* Primary feedback message */}
          <p className={`${classes.text} font-medium`}>
            {feedback.isCorrect ? 'Rétt!' : 'Rangt'}
          </p>

          {/* Expandable explanation */}
          {config.showExplanation && feedback.explanation && (
            <div className="mt-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`
                  text-sm ${classes.text} opacity-75
                  hover:opacity-100 transition-opacity
                  flex items-center gap-1
                `}
                type="button"
                aria-expanded={isExpanded}
              >
                <span className="text-xs">{isExpanded ? '▼' : '▶'}</span>
                <span>Af hverju?</span>
              </button>

              {isExpanded && (
                <div
                  className={`
                    mt-2 p-3 rounded-lg
                    bg-white/50
                    ${classes.text} text-sm
                    animate-fadeIn
                  `}
                >
                  {feedback.explanation}
                </div>
              )}
            </div>
          )}

          {/* Misconception warning */}
          {config.showMisconceptions && feedback.misconception && !feedback.isCorrect && (
            <div
              className="
                mt-3 p-3 rounded-lg
                bg-amber-100 border border-amber-300
                text-amber-800 text-sm
              "
            >
              <span className="font-medium">Algeng villa: </span>
              {feedback.misconception}
            </div>
          )}

          {/* Related concepts */}
          {config.showRelatedConcepts &&
            feedback.relatedConcepts &&
            feedback.relatedConcepts.length > 0 && (
              <div className="mt-3">
                <span className={`text-xs ${classes.text} opacity-75`}>Tengd efni:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {feedback.relatedConcepts.map((concept) => (
                    <button
                      key={concept}
                      onClick={() => handleConceptClick(concept)}
                      className={`
                        px-2 py-1 rounded-full
                        text-xs font-medium
                        bg-white/70 ${classes.text}
                        hover:bg-white transition-colors
                      `}
                      type="button"
                    >
                      {concept}
                    </button>
                  ))}
                </div>
              </div>
            )}

          {/* Next steps */}
          {config.showNextSteps && feedback.nextSteps && (
            <div
              className={`
                mt-3 text-sm ${classes.text} opacity-90
                flex items-center gap-2
              `}
            >
              <span>→</span>
              <span>{feedback.nextSteps}</span>
            </div>
          )}
        </div>

        {/* Dismiss button */}
        {onDismiss && (
          <button
            onClick={handleDismiss}
            className={`
              ${classes.text} opacity-50
              hover:opacity-100 transition-opacity
              flex-shrink-0 p-1
            `}
            type="button"
            aria-label="Loka"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

export default FeedbackPanel;
