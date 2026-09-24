import { useRef, useState } from 'react';

import { FeedbackPanel } from '@shared/components';
import { useArmedAfter, useItemTop, useRevealAfterCommit, useScreenTop } from '@shared/utils';

import { L1_SCORING } from '../config/scoring';
import { parseWholeNumber } from '../utils/answers';

// Misconceptions for oxidation states
const OXIDATION_MISCONCEPTIONS: Record<string, string> = {
  element: 'Hreint frumefni (ekki bundið við annað) hefur alltaf oxunartölu 0.',
  hydrogen: 'Vetni er yfirleitt +1, NEMA í málmhýdríðum (t.d. NaH) þar sem það er -1.',
  oxygen: 'Súrefni er yfirleitt -2, NEMA í peroxíðum (-1) og OF₂ (+2).',
  halogen: 'Halógenar (F, Cl, Br, I) eru -1 þegar bundnir við málma eða vetni.',
  sum: 'Summa oxunartalna í sameind = 0 (hlutlaust) eða = heildarhleðsla (jón).',
};

// Related concepts for redox
const OXIDATION_RELATED: string[] = ['Oxunartölur', 'Redox-hvörf', 'Rafeindasameignir'];

interface Level1Props {
  t: (key: string, fallback?: string) => string;
  onComplete: (score: number) => void;
  onBack: () => void;
}

interface OxidationRule {
  id: number;
  rule: string;
  example: string;
  explanation: string;
}

interface OxidationProblem {
  id: number;
  compound: string;
  compoundDisplay: string;
  targetElement: string;
  correctAnswer: number;
  hint: string;
}

const oxidationRules: OxidationRule[] = [
  {
    id: 1,
    rule: 'Hreint frumefni = 0',
    example: 'Fe, O₂, N₂, S₈',
    explanation: 'Öll frumefni í sinni hreinustu mynd hafa oxunartölu 0',
  },
  {
    id: 2,
    rule: 'Einatóma jón = hleðsla',
    example: 'Na⁺ = +1, Cl⁻ = -1, Fe³⁺ = +3',
    explanation: 'Oxunartala einatóma jónar er jöfn hleðslu hennar',
  },
  {
    id: 3,
    rule: 'Vetni (H) = +1 yfirleitt',
    example: 'H₂O, HCl, NH₃',
    explanation: 'Vetni er +1 nema í málmhýdríðum (þá -1)',
  },
  {
    id: 4,
    rule: 'Súrefni (O) = -2 yfirleitt',
    example: 'H₂O, CO₂, MgO',
    explanation: 'Súrefni er -2 nema í peroxíðum (-1) og OF₂ (+2)',
  },
  {
    id: 5,
    rule: 'Halógenar = -1 yfirleitt',
    example: 'NaCl, HBr, KI',
    explanation: 'F, Cl, Br, I eru -1 þegar þau eru bundin við málma eða vetni',
  },
  {
    id: 6,
    rule: 'Summa = 0 (hlutlaust) eða hleðsla (jón)',
    example: 'H₂O: 2(+1) + (-2) = 0',
    explanation: 'Summa allra oxunartalna í sameind jafngildir heildarhleðslu',
  },
];

const problems: OxidationProblem[] = [
  {
    id: 1,
    compound: 'NaCl',
    compoundDisplay: 'NaCl',
    targetElement: 'Cl',
    correctAnswer: -1,
    hint: 'Natríum er +1, summan er 0',
  },
  {
    id: 2,
    compound: 'H2O',
    compoundDisplay: 'H₂O',
    targetElement: 'O',
    correctAnswer: -2,
    hint: 'Vetni er +1, summan er 0',
  },
  {
    id: 3,
    compound: 'CO2',
    compoundDisplay: 'CO₂',
    targetElement: 'C',
    correctAnswer: 4,
    hint: 'Súrefni er -2, summan er 0',
  },
  {
    id: 4,
    compound: 'Fe2O3',
    compoundDisplay: 'Fe₂O₃',
    targetElement: 'Fe',
    correctAnswer: 3,
    hint: '3 súrefni × (-2) = -6, þú þarft +6 frá 2 Fe',
  },
  {
    id: 5,
    compound: 'H2SO4',
    compoundDisplay: 'H₂SO₄',
    targetElement: 'S',
    correctAnswer: 6,
    hint: '2H (+2) + 4O (-8) = -6, S þarf að vera +6',
  },
  {
    id: 6,
    compound: 'KMnO4',
    compoundDisplay: 'KMnO₄',
    targetElement: 'Mn',
    correctAnswer: 7,
    hint: 'K (+1) + 4O (-8) = -7, Mn þarf að vera +7',
  },
  {
    id: 7,
    compound: 'NH3',
    compoundDisplay: 'NH₃',
    targetElement: 'N',
    correctAnswer: -3,
    hint: '3H = +3, summan er 0',
  },
  {
    id: 8,
    compound: 'HNO3',
    compoundDisplay: 'HNO₃',
    targetElement: 'N',
    correctAnswer: 5,
    hint: 'H (+1) + 3O (-6) = -5, N þarf að vera +5',
  },
  {
    id: 9,
    compound: 'CuSO4',
    compoundDisplay: 'CuSO₄',
    targetElement: 'Cu',
    correctAnswer: 2,
    hint: 'SO₄ er -2 (súlfatjón)',
  },
  {
    id: 10,
    compound: 'Cr2O7_2-',
    compoundDisplay: 'Cr₂O₇²⁻',
    targetElement: 'Cr',
    correctAnswer: 6,
    hint: '7O (-14) + heildarhleðsla (-2), 2 Cr þarf að gefa +12',
  },
];

export function Level1({ t, onComplete, onBack }: Level1Props) {
  const [phase, setPhase] = useState<'learn' | 'practice'>('learn');
  const [currentRule, setCurrentRule] = useState(0);
  const [currentProblem, setCurrentProblem] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [, setTotalHintsUsed] = useState(0);
  // Set only by the hint button, so Reyna aftur (which opens the hint too) keeps its own focus.
  const [hintAsked, setHintAsked] = useState(false);

  // Rules → practice starts the practice screen at its top, heading focused.
  useScreenTop(phase);
  // Each rule (Næsta and Fyrri) brings the rule card back if it is off screen and focuses
  // its rule; the button stays where it was, but the student reads the new rule next.
  const ruleRef = useItemTop<HTMLDivElement>(currentRule);
  // Each question, and each Reyna aftur, brings the question back and focuses it: the
  // button that was pressed has unmounted, and focus would otherwise fall to <body>.
  const questionRef = useItemTop<HTMLDivElement>(`${currentProblem}:${attempts}`);
  const hintRef = useRef<HTMLDivElement>(null);
  const checkRef = useRef<HTMLButtonElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLDivElement>(null);
  // After Athuga svar: the question through the buttons below the feedback if it fits, else
  // the verdict at the top; focus moves to the feedback, not to a button (design P3).
  useRevealAfterCommit(showFeedback, () => ({
    bottom: nextRef.current,
    tops: [questionRef.current, feedbackRef.current],
    focus: feedbackRef.current,
  }));
  // The hint opens above the answer field and pushes Athuga svar down: keep the hint and the
  // button on screen together, and focus the hint (the hint button has unmounted).
  useRevealAfterCommit(hintAsked, () => ({
    bottom: checkRef.current,
    tops: [questionRef.current, hintRef.current],
    focus: hintRef.current,
  }));
  // A double tap on Athuga svar must not land on a button that renders after it.
  const armed = useArmedAfter(400, `${currentProblem}:${attempts}:${showFeedback}`);

  const handleNextRule = () => {
    if (currentRule < oxidationRules.length - 1) {
      setCurrentRule((prev) => prev + 1);
    } else {
      setPhase('practice');
    }
  };

  const handlePrevRule = () => {
    if (currentRule > 0) {
      setCurrentRule((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    const answer = parseWholeNumber(userAnswer);
    const correct = answer === problems[currentProblem].correctAnswer;
    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      const points =
        attempts === 0
          ? L1_SCORING.FIRST_TRY
          : attempts === 1
            ? L1_SCORING.SECOND_TRY
            : L1_SCORING.THIRD_PLUS_TRY;
      setScore((prev) => prev + points);
    }
  };

  const handleNext = () => {
    if (currentProblem < problems.length - 1) {
      setCurrentProblem((prev) => prev + 1);
      setUserAnswer('');
      setShowFeedback(false);
      setShowHint(false);
      setHintAsked(false);
      setAttempts(0);
    } else {
      onComplete(score);
    }
  };

  const handleTryAgain = () => {
    setShowFeedback(false);
    setUserAnswer('');
    setAttempts((prev) => prev + 1);
    setShowHint(true);
    setHintAsked(false);
  };

  if (phase === 'learn') {
    const rule = oxidationRules[currentRule];

    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 p-3 sm:p-4 md:p-8 phone:p-3">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 phone:p-4">
          <div className="flex flex-wrap justify-between items-center gap-x-3 gap-y-2 mb-6 phone:mb-3">
            <button
              onClick={onBack}
              className="text-warm-500 hover:text-warm-700 whitespace-nowrap pointer-coarse:py-3 pointer-coarse:-my-3"
            >
              &larr; {t('common.back', 'Til baka')}
            </button>
            <div className="text-sm text-warm-500 whitespace-nowrap">
              {t('level1.ruleProgress', 'Regla')} {currentRule + 1} {t('level1.of', 'af')}{' '}
              {oxidationRules.length}
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-center mb-2 text-blue-600 phone:text-xl phone:mb-1">
            {t('rules.title', 'Reglur um oxunartölur')}
          </h1>
          <p className="text-center text-warm-600 mb-8 phone:mb-3">
            {t('level1.learnBasics', 'Lærðu grunnreglurnar')}
          </p>

          <div className="mb-8 phone:mb-3">
            <div className="flex justify-center gap-2 mb-6 phone:mb-3">
              {oxidationRules.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-3 h-3 rounded-full ${
                    idx === currentRule
                      ? 'bg-blue-500'
                      : idx < currentRule
                        ? 'bg-green-500'
                        : 'bg-warm-300'
                  }`}
                />
              ))}
            </div>

            <div
              ref={ruleRef}
              className="bg-blue-50 p-4 sm:p-8 phone:p-3 rounded-2xl border-2 border-blue-200 animate-slide-in"
            >
              <div className="text-center mb-6 phone:mb-3">
                {/* Decorative: on a phone its height goes to the rule instead. */}
                <div className="text-5xl mb-4 phone:hidden">📖</div>
                <div data-item-start className="text-2xl font-bold text-blue-800 mb-2">
                  {rule.rule}
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl mb-4 phone:p-3 phone:mb-3">
                <div className="text-sm text-warm-500 mb-1">{t('level1.example', 'Dæmi:')}</div>
                <div className="text-xl font-mono text-center text-warm-800">{rule.example}</div>
              </div>

              <div className="bg-blue-100 p-4 rounded-xl phone:p-3">
                <div className="text-sm text-blue-600 mb-1">
                  {t('level1.explanation', 'Útskýring:')}
                </div>
                <div className="text-blue-800">{rule.explanation}</div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handlePrevRule}
              disabled={currentRule === 0}
              className={`flex-1 py-3 px-6 rounded-xl font-bold ${
                currentRule === 0
                  ? 'bg-warm-200 text-warm-400 cursor-not-allowed'
                  : 'bg-warm-500 hover:bg-warm-600 text-white'
              }`}
            >
              &larr; {t('level1.previous', 'Fyrri')}
            </button>
            <button
              onClick={handleNextRule}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-xl"
            >
              {currentRule === oxidationRules.length - 1
                ? t('level1.startPractice', 'Byrja æfingar')
                : t('common.next', 'Næsta')}{' '}
              &rarr;
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Practice phase
  const problem = problems[currentProblem];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-3 sm:p-4 md:p-8 phone:p-3">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 phone:p-4">
        <div className="flex flex-wrap justify-between items-center gap-x-3 gap-y-2 mb-6 phone:mb-3">
          <button
            onClick={onBack}
            className="text-warm-500 hover:text-warm-700 whitespace-nowrap pointer-coarse:py-3 pointer-coarse:-my-3"
          >
            &larr; {t('common.back', 'Til baka')}
          </button>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="text-sm text-warm-500 whitespace-nowrap">
              {t('level1.questionProgress', 'Spurning')} {currentProblem + 1} {t('level1.of', 'af')}{' '}
              {problems.length}
            </div>
            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold whitespace-nowrap">
              {t('level1.score', 'Stig')}: {score}
            </div>
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-center mb-2 text-blue-600 phone:text-xl">
          {t('level1.findOxNumber', 'Finndu oxunartöluna')}
        </h1>

        {/* A phone on its side: the question | the hint, the answer and the feedback. The two
            groups are plain blocks, so desktop margins are unchanged. */}
        <div className="phone-land:grid phone-land:grid-cols-2 phone-land:gap-4 phone-land:items-start">
          <div>
            <div
              ref={questionRef}
              data-item-start
              className="bg-warm-50 p-6 rounded-xl mb-6 phone:p-4 phone:mb-4"
            >
              <div className="text-center">
                <div className="text-lg text-warm-600 mb-2 phone:mb-1">
                  {t('level1.whatIsOxNumber', 'Hvað er oxunartala')}
                </div>
                <div className="flex items-center justify-center gap-2 mb-4 phone:mb-2">
                  <span className="text-4xl font-mono font-bold text-warm-800">
                    {problem.compoundDisplay}
                  </span>
                </div>
                <div className="inline-block bg-amber-100 px-4 py-2 rounded-full">
                  <span className="text-amber-800 font-bold text-xl">{problem.targetElement}</span>
                  <span className="text-amber-600">
                    {' '}
                    {t('level1.inThisCompound', 'í þessari sameind?')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            {showHint && (
              <div
                ref={hintRef}
                className="bg-yellow-50 p-4 rounded-xl mb-4 border border-yellow-200"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">💡</span>
                  <span className="text-yellow-800">{problem.hint}</span>
                </div>
              </div>
            )}

            {/* The answering and feedback branches are keyed, so Athuga svar is never reused as a
            button that moves on. */}
            {!showFeedback ? (
              <div key="answer" className="space-y-4 phone:space-y-3">
                <div className="flex justify-center">
                  <input
                    type="number"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && userAnswer !== '') {
                        e.preventDefault();
                        handleSubmit();
                      }
                    }}
                    enterKeyHint="done"
                    placeholder={t('level1.enterNumber', 'Sláðu inn tölu...')}
                    aria-label={t('concepts.oxidationNumber', 'Oxunartala')}
                    className="text-center text-2xl font-bold w-48 sm:w-32 max-sm:placeholder:text-base max-sm:placeholder:font-normal phone:w-48 phone:placeholder:text-base phone:placeholder:font-normal p-3 border-2 border-blue-300 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <p className="text-center text-sm text-warm-500">
                  {t(
                    'level1.useNegative',
                    'Notaðu neikvæðar tölur fyrir neikvæðar oxunartölur (t.d. -2)'
                  )}
                </p>
                <div className="flex gap-3 sm:gap-4">
                  {!showHint && (
                    <button
                      onClick={() => {
                        setShowHint(true);
                        setHintAsked(true);
                        setTotalHintsUsed((prev) => prev + 1);
                      }}
                      className="flex-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-bold py-3 px-3 sm:px-6 rounded-xl"
                    >
                      {t('common.hint', 'Vísbending')}
                    </button>
                  )}
                  <button
                    ref={checkRef}
                    onClick={handleSubmit}
                    disabled={userAnswer === ''}
                    className={`flex-1 font-bold py-3 px-3 sm:px-6 rounded-xl ${
                      userAnswer === ''
                        ? 'bg-warm-200 text-warm-400 cursor-not-allowed'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                  >
                    {t('level1.checkAnswer', 'Athuga svar')}
                  </button>
                </div>
              </div>
            ) : (
              <div key="feedback" className="space-y-4 phone:space-y-3">
                {/* The feedback region focus moves to after Athuga svar (P3). FeedbackPanel is
                itself role=alert and announces the verdict. */}
                <div ref={feedbackRef} tabIndex={-1} role="group" className="focus:outline-none">
                  <FeedbackPanel
                    feedback={{
                      isCorrect,
                      explanation: isCorrect
                        ? `Rétt! Oxunartala ${problem.targetElement} í ${problem.compoundDisplay} er ${problem.correctAnswer > 0 ? `+${problem.correctAnswer}` : problem.correctAnswer}.`
                        : `Þú svaraðir ${userAnswer}, en rétt svar er ${problem.correctAnswer > 0 ? `+${problem.correctAnswer}` : problem.correctAnswer}. ${problem.hint || ''}`,
                      misconception: isCorrect ? undefined : OXIDATION_MISCONCEPTIONS.sum,
                      relatedConcepts: OXIDATION_RELATED,
                      nextSteps: isCorrect
                        ? 'Frábært! Þú skilur hvernig á að reikna oxunartölur.'
                        : 'Mundu reglurnar: H=+1, O=-2, summa=0 (eða hleðsla).',
                    }}
                    config={{
                      showExplanation: true,
                      showMisconceptions: !isCorrect,
                      showRelatedConcepts: true,
                      showNextSteps: true,
                    }}
                  />
                </div>

                {/* Every button here ignores a press within 400 ms of appearing, so a double tap
                on Athuga svar cannot skip the feedback. On a phone the two buttons after a
                wrong answer share a row where both fit on one line each, and wrap under each
                other where they do not (320 px), rather than breaking inside a label. */}
                <div ref={nextRef}>
                  {isCorrect ? (
                    <button
                      onClick={armed(handleNext)}
                      className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl"
                    >
                      {currentProblem < problems.length - 1
                        ? t('common.next', 'Næsta spurning') + ' →'
                        : t('level1.completeLevel', 'Ljúka stigi') + ' →'}
                    </button>
                  ) : (
                    <div className="flex gap-4 phone:flex-wrap phone:gap-2">
                      <button
                        onClick={armed(handleTryAgain)}
                        className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-6 rounded-xl phone:flex-[1_1_8rem] phone:px-3 phone:whitespace-nowrap"
                      >
                        {t('common.retry', 'Reyna aftur')}
                      </button>
                      <button
                        onClick={armed(handleNext)}
                        className="flex-1 bg-warm-500 hover:bg-warm-600 text-white font-bold py-3 px-6 rounded-xl phone:flex-[1_1_8rem] phone:px-3 phone:whitespace-nowrap"
                      >
                        {t('level1.continue', 'Halda áfram')} &rarr;
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 bg-warm-50 p-3 sm:p-4 rounded-xl">
          <h3 className="font-semibold text-warm-700 mb-2">
            {t('level1.rememberRules', 'Muna reglurnar:')}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
            <div className="bg-white p-2 rounded border">{t('rules.rule1', 'Frumefni = 0')}</div>
            <div className="bg-white p-2 rounded border">{t('rules.rule2', 'Jón = hleðsla')}</div>
            <div className="bg-white p-2 rounded border">{t('rules.rule4', 'H = +1')}</div>
            <div className="bg-white p-2 rounded border">{t('rules.rule3', 'O = -2')}</div>
            <div className="bg-white p-2 rounded border">
              {t('level1.halogenRule', 'Halógen = -1')}
            </div>
            <div className="bg-white p-2 rounded border">{t('rules.rule5', 'Summa = hleðsla')}</div>
          </div>
        </div>

        <div className="mt-4 w-full bg-warm-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentProblem + 1) / problems.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
