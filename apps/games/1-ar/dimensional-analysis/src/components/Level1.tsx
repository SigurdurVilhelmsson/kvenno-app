import { useState, useEffect } from 'react';
import { FeedbackPanel } from '@shared/components';
import type { DetailedFeedback } from '@shared/types';
import { level1Questions, QuestionType } from '../data/questions';
import { scoreExplanation } from '../utils/scoring';

// Misconceptions for each question type
const MISCONCEPTIONS: Record<QuestionType, string> = {
  equivalence: 'Umbreytingarstuðull jafngildir 1 aðeins þegar teljarinn og nefnarinn eru sama magn í mismunandi einingum (t.d. 1000 mL = 1 L).',
  cancellation_prediction: 'Einingar strikast út eins og tölur í almennum brotum - ef sama eining er í teljara og nefnara, þá hverfa þær.',
  factor_selection: 'Veldu stuðul þannig að einingin sem þú vilt losna við sé á gagnstæðri hlið við upphafsmagn (ef þú hefur g, settu g í nefnara).',
  error_identification: 'Algeng villa er að snúa stuðlinum rangt - athugaðu alltaf hvort einingin sem þú vilt losna við sé þar sem hún getur strikast út.',
  conceptual: 'Umbreyting breytir ekki magninu, aðeins hvernig við tjáum það. 1 kg og 1000 g er sama magnið.',
};

// Related concepts for each question type
const RELATED_CONCEPTS: Record<QuestionType, string[]> = {
  equivalence: ['Umbreytingarstuðlar', 'Jafngildi eininga', 'Brot'],
  cancellation_prediction: ['Strikun eininga', 'Brotareglur', 'Víddargreining'],
  factor_selection: ['Factor-label aðferð', 'Umbreytingar', 'Einingaval'],
  error_identification: ['Algengar villur', 'Víddargreining', 'Einingaathugun'],
  conceptual: ['Einingakerfi', 'SI-einingar', 'Umbreytingar'],
};

interface Level1Progress {
  questionsAnswered: number;
  questionsCorrect: number;
  explanationsProvided: number;
  explanationScores: number[];
  mastered: boolean;
}

interface Level1Props {
  onComplete: (progress: Level1Progress) => void;
  onBack: () => void;
  initialProgress?: Level1Progress;
}

export function Level1({ onComplete, onBack, initialProgress }: Level1Props) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(
    initialProgress?.questionsAnswered || 0
  );
  const [progress, setProgress] = useState<Level1Progress>(
    initialProgress || {
      questionsAnswered: 0,
      questionsCorrect: 0,
      explanationsProvided: 0,
      explanationScores: [],
      mastered: false
    }
  );

  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [selectedExplanation, setSelectedExplanation] = useState<number | null>(null);
  const [explanation, setExplanation] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [explanationScore, setExplanationScore] = useState(0);

  const question = level1Questions[currentQuestionIndex];

  useEffect(() => {
    if (question) {
      setSelectedOptions([]);
      setSelectedExplanation(null);
      setExplanation('');
      setShowFeedback(false);
    }
  }, [currentQuestionIndex, question]);

  const handleOptionToggle = (index: number) => {
    if (question.multiSelect) {
      if (selectedOptions.includes(index)) {
        setSelectedOptions(selectedOptions.filter(i => i !== index));
      } else {
        setSelectedOptions([...selectedOptions, index]);
      }
    } else {
      setSelectedOptions([index]);
    }
  };

  const handleSubmit = () => {
    let answerCorrect = false;

    // Check answer based on question type
    if (question.type === 'equivalence' || question.type === 'cancellation_prediction') {
      if (question.multiSelect && Array.isArray(question.correct)) {
        // Multi-select: all correct must be selected, no incorrect selected
        const selectedSet = new Set(selectedOptions);
        answerCorrect = question.correct.length === selectedOptions.length &&
                       question.correct.every(c => selectedSet.has(c));
      } else if (!question.multiSelect && typeof question.correct === 'number') {
        // Single select
        answerCorrect = selectedOptions[0] === question.correct;
      }
    } else if (question.type === 'factor_selection') {
      // Check if selected factor is correct
      if (question.factors) {
        const selectedFactor = question.factors[selectedOptions[0]];
        answerCorrect = selectedFactor?.correct || false;
      }
    } else if (question.type === 'error_identification') {
      answerCorrect = selectedOptions[0] === question.correct;
    } else if (question.type === 'conceptual') {
      answerCorrect = selectedOptions[0] === question.correct;
    }

    // Score explanation if required
    let expScore = 0;
    if (question.explanationRequired) {
      if (question.explanationOptions && selectedExplanation !== null) {
        const selectedExp = question.explanationOptions[selectedExplanation];
        expScore = selectedExp?.correct ? 1 : 0.5;
      } else if (explanation.trim()) {
        expScore = scoreExplanation(explanation, question.type);
      }
    } else {
      expScore = 1; // No explanation required, give full score
    }

    setIsCorrect(answerCorrect);
    setExplanationScore(expScore);
    setShowFeedback(true);

    // Update progress
    const newProgress = {
      ...progress,
      questionsAnswered: progress.questionsAnswered + 1,
      questionsCorrect: progress.questionsCorrect + (answerCorrect ? 1 : 0),
      explanationsProvided: progress.explanationsProvided + (question.explanationRequired ? 1 : 0),
      explanationScores: question.explanationRequired ? [...progress.explanationScores, expScore] : progress.explanationScores
    };
    setProgress(newProgress);
  };

  const handleContinue = () => {
    const newProgress = { ...progress };

    // Check mastery after 10 questions
    if (newProgress.questionsAnswered >= 10) {
      const avgExplanation = newProgress.explanationScores.length > 0
        ? newProgress.explanationScores.reduce((a, b) => a + b, 0) / newProgress.explanationScores.length
        : 1;
      newProgress.mastered = newProgress.questionsCorrect >= 8 && avgExplanation >= 0.7;
    }

    setProgress(newProgress);

    if (currentQuestionIndex < level1Questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      onComplete(newProgress);
    }
  };

  if (!question) return null;

  const accuracy = progress.questionsAnswered > 0
    ? Math.round((progress.questionsCorrect / progress.questionsAnswered) * 100)
    : 0;

  // Generate detailed feedback for FeedbackPanel
  const getDetailedFeedback = (): DetailedFeedback => {
    const baseExplanation = question.correctText || '';

    if (isCorrect) {
      return {
        isCorrect: true,
        explanation: baseExplanation || 'Rétt! Þú skildir hvernig á að nota umbreytingarstuðla.',
        relatedConcepts: RELATED_CONCEPTS[question.type],
        nextSteps: question.type === 'conceptual'
          ? 'Þú ert tilbúin/n að æfa umbreytingar með tölum.'
          : 'Reyndu næst flóknari umbreytingu með mörgum skrefum.',
      };
    }

    return {
      isCorrect: false,
      explanation: baseExplanation || 'Skoðaðu hvernig umbreytingarstuðlar virka.',
      misconception: MISCONCEPTIONS[question.type],
      relatedConcepts: RELATED_CONCEPTS[question.type],
      nextSteps: 'Lestu útskýringuna vandlega og reyndu svipað dæmi.',
    };
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800 flex items-center gap-2"
          >
            ← Til baka
          </button>
          <div className="text-sm text-gray-600">
            <span>Spurning {progress.questionsAnswered + 1} / 10</span>
            <span className="ml-4">Nákvæmni: {accuracy}%</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6">{question.prompt}</h2>

          {/* Options */}
          <div className="space-y-3 mb-6">
            {question.type === 'factor_selection' && question.factors ? (
              // Factor selection
              question.factors.map((factor, idx) => (
                <button
                  key={idx}
                  onClick={() => handleOptionToggle(idx)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    selectedOptions.includes(idx)
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  disabled={showFeedback}
                >
                  <span className="font-mono">{factor.text}</span>
                </button>
              ))
            ) : (
              // Regular options
              question.options?.map((option, idx) => {
                const isObject = typeof option === 'object' && option !== null;
                const optionText = isObject ? (option as any).text : option as string;

                return (
                  <button
                    key={idx}
                    onClick={() => handleOptionToggle(idx)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                      selectedOptions.includes(idx)
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    disabled={showFeedback}
                  >
                    {question.multiSelect && (
                      <input
                        type="checkbox"
                        checked={selectedOptions.includes(idx)}
                        readOnly
                        className="mr-3"
                      />
                    )}
                    {optionText}
                  </button>
                );
              })
            )}
          </div>

          {/* Explanation */}
          {question.explanationRequired && !showFeedback && (
            <div className="mb-6">
              <label className="block font-semibold mb-2">Útskýrðu svar þitt:</label>

              {question.explanationOptions ? (
                // Multiple choice explanation
                <div className="space-y-2">
                  {question.explanationOptions.map((exp, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedExplanation(idx)}
                      className={`w-full p-3 rounded-lg border-2 text-left text-sm transition-all ${
                        selectedExplanation === idx
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {exp.text}
                    </button>
                  ))}
                </div>
              ) : (
                // Free text explanation
                <textarea
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Útskýrðu af hverju þú valdir þetta svar..."
                  className="w-full p-3 border-2 border-gray-300 rounded-lg h-24"
                />
              )}
            </div>
          )}

          {!showFeedback && (
            <button
              onClick={handleSubmit}
              disabled={selectedOptions.length === 0 || (question.explanationRequired && !selectedExplanation && !explanation.trim())}
              className="w-full bg-orange-500 text-white py-3 rounded-lg font-bold hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              style={{ backgroundColor: (selectedOptions.length === 0 || (question.explanationRequired && selectedExplanation === null && !explanation.trim())) ? undefined : '#f36b22' }}
            >
              Athuga svar
            </button>
          )}

          {showFeedback && (
            <div className="space-y-4">
              <FeedbackPanel
                feedback={getDetailedFeedback()}
                config={{
                  showExplanation: true,
                  showMisconceptions: !isCorrect,
                  showRelatedConcepts: true,
                  showNextSteps: true,
                }}
              />

              {question.explanationRequired && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm font-semibold text-gray-700 mb-1">Útskýringareinkunn:</p>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${explanationScore * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{Math.round(explanationScore * 100)}%</p>
                </div>
              )}

              {question.visualization && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 italic">
                    <strong>Sjónrænt:</strong> {question.visualization}
                  </p>
                </div>
              )}

              <button
                onClick={handleContinue}
                className="w-full bg-orange-500 text-white py-3 rounded-lg font-bold hover:bg-orange-600"
                style={{ backgroundColor: '#f36b22' }}
              >
                {currentQuestionIndex < level1Questions.length - 1 ? 'Næsta spurning →' : 'Ljúka stigi'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
