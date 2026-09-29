import { useCallback, useMemo, useRef, useState } from 'react';

import { useEscapeKey } from '@shared/hooks';
import {
  shuffleArray,
  useArmedAfter,
  useItemTop,
  useRevealAfterCommit,
  useScreenTop,
} from '@shared/utils';

import { ElectrochemicalCell } from './ElectrochemicalCell';
import { HalfReactionBalancer } from './HalfReactionBalancer';
import { OxidationStateDisplay } from './OxidationStateDisplay';
import { L2_SCORING } from '../config/scoring';

interface Level2Props {
  onComplete: (score: number) => void;
  onBack: () => void;
  t: (key: string, fallback?: string) => string;
}

interface RedoxReaction {
  id: number;
  equation: string;
  equationDisplay: string;
  species: { name: string; before: number; after: number }[];
  oxidized: string;
  reduced: string;
  oxidizingAgent: string;
  reducingAgent: string;
  explanation: string;
}

const reactions: RedoxReaction[] = [
  {
    id: 1,
    equation: '2Na + Cl2 → 2NaCl',
    equationDisplay: '2Na + Cl₂ → 2NaCl',
    species: [
      { name: 'Na', before: 0, after: 1 },
      { name: 'Cl', before: 0, after: -1 },
    ],
    oxidized: 'Na',
    reduced: 'Cl',
    oxidizingAgent: 'Cl₂',
    reducingAgent: 'Na',
    explanation: 'Na tapar rafeindum (0→+1) og oxast. Cl öðlast rafeindir (0→-1) og afoxast.',
  },
  {
    id: 2,
    equation: 'Fe + CuSO4 → FeSO4 + Cu',
    equationDisplay: 'Fe + CuSO₄ → FeSO₄ + Cu',
    species: [
      { name: 'Fe', before: 0, after: 2 },
      { name: 'Cu', before: 2, after: 0 },
    ],
    oxidized: 'Fe',
    reduced: 'Cu',
    oxidizingAgent: 'Cu²⁺',
    reducingAgent: 'Fe',
    explanation: 'Fe tapar rafeindum (0→+2) og oxast. Cu²⁺ öðlast rafeindir (+2→0) og afoxast.',
  },
  {
    id: 3,
    equation: 'Zn + 2HCl → ZnCl2 + H2',
    equationDisplay: 'Zn + 2HCl → ZnCl₂ + H₂',
    species: [
      { name: 'Zn', before: 0, after: 2 },
      { name: 'H', before: 1, after: 0 },
    ],
    oxidized: 'Zn',
    reduced: 'H',
    oxidizingAgent: 'H⁺',
    reducingAgent: 'Zn',
    explanation: 'Zn tapar rafeindum (0→+2) og oxast. H⁺ öðlast rafeindir (+1→0) og afoxast.',
  },
  {
    id: 4,
    equation: '2Mg + O2 → 2MgO',
    equationDisplay: '2Mg + O₂ → 2MgO',
    species: [
      { name: 'Mg', before: 0, after: 2 },
      { name: 'O', before: 0, after: -2 },
    ],
    oxidized: 'Mg',
    reduced: 'O',
    oxidizingAgent: 'O₂',
    reducingAgent: 'Mg',
    explanation: 'Mg tapar rafeindum (0→+2) og oxast. O öðlast rafeindir (0→-2) og afoxast.',
  },
  {
    id: 5,
    equation: 'Cu + 2AgNO3 → Cu(NO3)2 + 2Ag',
    equationDisplay: 'Cu + 2AgNO₃ → Cu(NO₃)₂ + 2Ag',
    species: [
      { name: 'Cu', before: 0, after: 2 },
      { name: 'Ag', before: 1, after: 0 },
    ],
    oxidized: 'Cu',
    reduced: 'Ag',
    oxidizingAgent: 'Ag⁺',
    reducingAgent: 'Cu',
    explanation: 'Cu tapar rafeindum (0→+2) og oxast. Ag⁺ öðlast rafeindir (+1→0) og afoxast.',
  },
  {
    id: 6,
    equation: '2Fe2O3 + 3C → 4Fe + 3CO2',
    equationDisplay: '2Fe₂O₃ + 3C → 4Fe + 3CO₂',
    species: [
      { name: 'Fe', before: 3, after: 0 },
      { name: 'C', before: 0, after: 4 },
    ],
    oxidized: 'C',
    reduced: 'Fe',
    oxidizingAgent: 'Fe₂O₃',
    reducingAgent: 'C',
    explanation: 'C tapar rafeindum (0→+4) og oxast. Fe³⁺ öðlast rafeindir (+3→0) og afoxast.',
  },
  {
    id: 7,
    equation: 'Cl2 + 2KBr → 2KCl + Br2',
    equationDisplay: 'Cl₂ + 2KBr → 2KCl + Br₂',
    species: [
      { name: 'Cl', before: 0, after: -1 },
      { name: 'Br', before: -1, after: 0 },
    ],
    oxidized: 'Br',
    reduced: 'Cl',
    oxidizingAgent: 'Cl₂',
    reducingAgent: 'Br⁻',
    explanation: 'Br⁻ tapar rafeindum (-1→0) og oxast. Cl öðlast rafeindir (0→-1) og afoxast.',
  },
  {
    id: 8,
    equation: '2Al + 3CuO → Al2O3 + 3Cu',
    equationDisplay: '2Al + 3CuO → Al₂O₃ + 3Cu',
    species: [
      { name: 'Al', before: 0, after: 3 },
      { name: 'Cu', before: 2, after: 0 },
    ],
    oxidized: 'Al',
    reduced: 'Cu',
    oxidizingAgent: 'CuO',
    reducingAgent: 'Al',
    explanation: 'Al tapar rafeindum (0→+3) og oxast. Cu²⁺ öðlast rafeindir (+2→0) og afoxast.',
  },
];

type QuestionType = 'oxidized' | 'reduced' | 'oxidizing-agent' | 'reducing-agent';

interface Question {
  type: QuestionType;
  label: string;
  hint: string;
}

const questionTypes: Question[] = [
  { type: 'oxidized', label: 'Hvað oxast?', hint: 'Hvað tapar rafeindum? (ox# hækkar)' },
  { type: 'reduced', label: 'Hvað afoxast?', hint: 'Hvað öðlast rafeindir? (ox# lækkar)' },
  {
    type: 'oxidizing-agent',
    label: 'Hvað er oxunarefnið?',
    hint: 'Efnið sem veldur oxun (tekur við rafeindum)',
  },
  {
    type: 'reducing-agent',
    label: 'Hvað er afoxunarefnið?',
    hint: 'Efnið sem veldur afoxun (gefur rafeindir)',
  },
];

export function Level2({ onComplete, onBack, t }: Level2Props) {
  const [showIntro, setShowIntro] = useState(true);
  useEscapeKey(onBack, showIntro);
  const [currentReaction, setCurrentReaction] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [, setTotalHintsUsed] = useState(0);

  const reaction = reactions[currentReaction];
  const question = questionTypes[currentQuestion];

  const getCorrectAnswer = (): string => {
    switch (question.type) {
      case 'oxidized':
        return reaction.oxidized;
      case 'reduced':
        return reaction.reduced;
      case 'oxidizing-agent':
        return reaction.oxidizingAgent;
      case 'reducing-agent':
        return reaction.reducingAgent;
    }
  };

  // In the data the species that is oxidised comes first in six of the eight reactions, so
  // "Hvað oxast?" was answered by the left button three times in four. Shuffle per question;
  // grading compares the option's text, so no answer key moves.
  const options = useMemo(() => {
    const r = reactions[currentReaction];
    const q = questionTypes[currentQuestion];
    const base =
      q.type === 'oxidizing-agent' || q.type === 'reducing-agent'
        ? [r.oxidizingAgent, r.reducingAgent]
        : r.species.map((s) => s.name);
    return shuffleArray(base);
  }, [currentReaction, currentQuestion]);

  // Built once per reaction: an inline array is new on every render, and the diagram replayed
  // its animation each time the student asked for a hint.
  const changes = useMemo(
    () =>
      reactions[currentReaction].species.map((s) => ({
        element: s.name,
        before: s.before,
        after: s.after,
      })),
    [currentReaction]
  );

  // The diagram labels which species is oxidised and which reduced, so it must not do that while
  // "Hvað oxast?" is on screen. From the first answer on the student has been told, and the
  // labels are what the oxidising- and reducing-agent questions reason from.
  const verdictShown = showFeedback || currentQuestion > 0;

  // Intro → practice starts the practice screen at its top, heading focused.
  useScreenTop(showIntro);
  // Each Næsta brings the new item back if its top is off screen and focuses it: the button
  // that was pressed has unmounted, and focus would otherwise fall to <body>. The item is the
  // whole reaction when a new one opens (its first question), and the question alone after
  // that — bringing the diagram back above every question pushed the answers off a short
  // screen (the SE) that had them in view.
  const firstQuestion = currentQuestion === 0;
  const itemRef = useItemTop<HTMLDivElement>(`${currentReaction}:${currentQuestion}`);
  const reactionRef = useRef<HTMLDivElement>(null);
  const questionRef = useRef<HTMLDivElement>(null);
  const questionBox = useCallback(
    (el: HTMLDivElement | null) => {
      questionRef.current = el;
      if (!firstQuestion) itemRef.current = el;
    },
    [firstQuestion, itemRef]
  );
  const verdictRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  // After an answer: the reaction and its diagram through Næsta if they fit, else the
  // question, else the verdict at the top; focus moves to the verdict, not to Næsta (P3).
  useRevealAfterCommit(showFeedback, () => ({
    bottom: nextRef.current,
    tops: [reactionRef.current, questionRef.current, verdictRef.current],
    focus: verdictRef.current,
  }));
  // The hint opens inside the question box and the hint button unmounts: focus the hint, and
  // on a phone keep the question, the hint and the answers on screen together.
  const hintRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);
  useRevealAfterCommit(showHint, () => ({
    bottom: optionsRef.current,
    tops: [questionRef.current],
    focus: hintRef.current,
  }));
  // A double tap on an answer must not land on Næsta.
  const armed = useArmedAfter(400, `${currentReaction}:${currentQuestion}:${showFeedback}`);

  const handleAnswer = (answer: string) => {
    const correct = answer === getCorrectAnswer();
    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      setScore((prev) => prev + L2_SCORING.POINTS_PER_QUESTION);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questionTypes.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else if (currentReaction < reactions.length - 1) {
      setCurrentReaction((prev) => prev + 1);
      setCurrentQuestion(0);
      setShowExplanation(false);
    } else {
      onComplete(score);
      return;
    }
    setShowFeedback(false);
    setShowHint(false);
  };

  const totalQuestions = reactions.length * questionTypes.length;
  const currentProgress = currentReaction * questionTypes.length + currentQuestion + 1;

  if (showIntro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 p-3 sm:p-4 md:p-8">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 space-y-5">
          <div className="flex flex-wrap justify-between items-center gap-x-3 gap-y-1">
            <button
              onClick={onBack}
              className="text-warm-500 hover:text-warm-700 whitespace-nowrap pointer-coarse:py-3 pointer-coarse:-my-3"
            >
              ← {t('common.back', 'Til baka')}
            </button>
            <h1 className="text-lg font-bold text-warm-800 order-last w-full sm:order-none sm:w-auto">
              Oxun & Afoxun — Kennsla
            </h1>
            <span className="text-sm text-warm-500 whitespace-nowrap">Stig 2</span>
          </div>

          <div className="bg-teal-50 border-l-4 border-teal-500 rounded-lg p-4">
            <h2 className="font-bold text-teal-900 mb-2">Hvað eru hálfhvörf?</h2>
            <p className="text-warm-700 text-sm leading-relaxed">
              <strong>Redoxhvarf er alltaf tvö hálfhvörf.</strong> Ein tegund <strong>tapar</strong>{' '}
              rafeindum (oxast), önnur <strong>öðlast</strong> rafeindir (afoxast). Þetta gerist
              alltaf samtímis — rafeindir hverfa ekki, þær færast milli tegunda.
            </p>
          </div>

          <div className="bg-white border border-warm-200 rounded-lg p-4">
            <h3 className="font-bold text-warm-800 mb-3">Dæmi: Zn + Cu²⁺ → Zn²⁺ + Cu</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="font-bold text-blue-800 mb-1">Oxun (tap á rafeindum)</p>
                <p className="font-mono text-blue-900">Zn → Zn²⁺ + 2e⁻</p>
                <p className="text-xs text-blue-700 mt-1">
                  Sink fer úr 0 í +2 → tapar 2 rafeindum.
                </p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="font-bold text-red-800 mb-1">Afoxun (öðlun rafeinda)</p>
                <p className="font-mono text-red-900">Cu²⁺ + 2e⁻ → Cu</p>
                <p className="text-xs text-red-700 mt-1">
                  Kopar fer úr +2 í 0 → öðlast 2 rafeindir.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h3 className="font-bold text-amber-800 mb-2">Oxunarefni vs. afoxunarefni</h3>
            <ul className="space-y-1 text-sm text-warm-700 list-disc list-inside">
              <li>
                <strong>Oxunarefni</strong> = tegundin sem <em>veldur</em> oxun. Hún sjálf afoxast
                (tekur til sín rafeindir). Í dæminu: Cu²⁺.
              </li>
              <li>
                <strong>Afoxunarefni</strong> = tegundin sem <em>veldur</em> afoxun. Hún sjálf oxast
                (tapar rafeindum). Í dæminu: Zn.
              </li>
            </ul>
            <p className="text-xs text-amber-700 mt-2">
              Mundu: tegundin sem „oxast“ og „afoxunarefni“ er sama tegundin — bara tvö ólík
              sjónarhorn á sama hlutverkið.
            </p>
          </div>

          <button
            onClick={() => setShowIntro(false)}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl transition-colors"
          >
            Byrja æfingar →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 p-3 sm:p-4 md:p-8 phone:p-3">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 phone:p-4">
        <div className="flex flex-wrap justify-between items-center gap-x-3 gap-y-2 mb-6 phone:mb-3">
          <button
            onClick={onBack}
            className="text-warm-500 hover:text-warm-700 whitespace-nowrap pointer-coarse:py-3 pointer-coarse:-my-3"
          >
            ← {t('common.back', 'Til baka')}
          </button>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="text-sm text-warm-500 whitespace-nowrap">
              {currentProgress} {t('level2.progressOf', 'af')} {totalQuestions}
            </div>
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-bold whitespace-nowrap">
              {t('level2.score', 'Stig')}: {score}
            </div>
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-center mb-2 text-green-600 phone:text-xl">
          🔄 {t('levels.level2.name', 'Greina redox-hvörf')}
        </h1>

        {/* A phone on its side: the reaction and its diagram | the question, the answers and
            the verdict. The two groups are plain blocks, so desktop margins are unchanged. */}
        <div
          ref={firstQuestion ? itemRef : undefined}
          className="phone-land:grid phone-land:grid-cols-2 phone-land:gap-4 phone-land:items-start"
        >
          <div
            ref={reactionRef}
            className="bg-warm-50 p-3 sm:p-6 rounded-xl mb-6 phone:p-3 phone:mb-3"
          >
            <div
              data-item-start={firstQuestion ? '' : undefined}
              className="text-center mb-4 phone:mb-2"
            >
              <div className="text-sm text-warm-500 mb-2 phone:mb-1">
                {t('level2.reaction', 'Efnahvarf')} {currentReaction + 1}:
              </div>
              <div className="text-2xl md:text-3xl font-mono font-bold text-warm-800">
                {reaction.equationDisplay}
              </div>
            </div>

            {/* Enhanced Oxidation State Display with Electron Transfer Animation */}
            <OxidationStateDisplay
              key={reaction.id}
              changes={changes}
              animate={verdictShown}
              revealVerdict={verdictShown}
              showElectrons={true}
              size="medium"
            />
          </div>

          <div>
            <div
              ref={questionBox}
              data-item-start={firstQuestion ? undefined : ''}
              className="bg-green-50 p-4 rounded-xl mb-6 border-2 border-green-200 phone:p-3 phone:mb-3"
            >
              <div className="flex items-center gap-2 mb-2 phone:mb-0">
                <span className="text-2xl">❓</span>
                <span className="text-xl font-bold text-green-800">{question.label}</span>
              </div>
              {showHint && (
                <div ref={hintRef} className="text-green-600 text-sm mt-2 flex items-center gap-2">
                  <span>💡</span>
                  <span>{question.hint}</span>
                </div>
              )}
            </div>

            {/* The answering and feedback branches are keyed, so no answer or hint button is ever
            reused as a button that moves on. */}
            {!showFeedback ? (
              <div key="answer" className="space-y-4 phone:space-y-3">
                <div ref={optionsRef} className="grid grid-cols-2 gap-4 phone:gap-3">
                  {options.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleAnswer(option)}
                      className="p-4 phone:p-3 rounded-xl border-2 border-green-300 bg-white hover:bg-green-50 hover:border-green-400 text-lg font-bold text-warm-800 transition-all"
                    >
                      {option}
                    </button>
                  ))}
                </div>
                {!showHint && (
                  <button
                    onClick={() => {
                      setShowHint(true);
                      setTotalHintsUsed((prev) => prev + 1);
                    }}
                    className="w-full bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-bold py-2 px-4 rounded-xl text-sm pointer-coarse:min-h-11"
                  >
                    💡 {t('common.hint', 'Sýna vísbendingu')}
                  </button>
                )}
              </div>
            ) : (
              <div key="feedback" className="space-y-4 phone:space-y-3">
                {/* The feedback region focus moves to after an answer (P3), named by the verdict.
                On a phone the mark sits inline before the verdict. */}
                <div
                  ref={verdictRef}
                  tabIndex={-1}
                  role="group"
                  aria-labelledby="redox-l2-verdict"
                  className={`p-6 rounded-xl text-center focus:outline-none phone:p-3 phone:flex phone:flex-wrap phone:items-center phone:justify-center phone:gap-x-2 ${
                    isCorrect
                      ? 'bg-green-100 border-2 border-green-400'
                      : 'bg-red-100 border-2 border-red-400'
                  }`}
                >
                  <div className="text-4xl mb-2 phone:text-2xl phone:mb-0">
                    {isCorrect ? '✓' : '✗'}
                  </div>
                  <div
                    id="redox-l2-verdict"
                    className={`text-xl font-bold ${isCorrect ? 'text-green-800' : 'text-red-800'}`}
                  >
                    {isCorrect ? t('common.correct', 'Rétt!') : t('common.incorrect', 'Rangt')}
                  </div>
                  {!isCorrect && (
                    <div className="text-red-700 mt-2 phone:basis-full phone:mt-1">
                      {t('level2.correctAnswer', 'Rétt svar')}:{' '}
                      <strong>{getCorrectAnswer()}</strong>
                    </div>
                  )}
                </div>

                {currentQuestion === questionTypes.length - 1 && (
                  <button
                    onClick={() => setShowExplanation((prev) => !prev)}
                    className="w-full bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold py-2 px-4 rounded-xl pointer-coarse:min-h-11"
                  >
                    {showExplanation
                      ? `🔼 ${t('level2.hideExplanation', 'Fela útskýringu')}`
                      : `🔽 ${t('level2.showExplanation', 'Sýna útskýringu')}`}
                  </button>
                )}

                {showExplanation && (
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                    <div className="text-blue-800">{reaction.explanation}</div>
                  </div>
                )}

                <button
                  ref={nextRef}
                  onClick={armed(handleNext)}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl"
                >
                  {currentQuestion < questionTypes.length - 1
                    ? `${t('level2.nextQuestion', 'Næsta spurning')} →`
                    : currentReaction < reactions.length - 1
                      ? `${t('level2.nextReaction', 'Næsta hvarf')} →`
                      : `${t('level2.finishLevel', 'Ljúka stigi')} →`}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 bg-warm-50 p-3 sm:p-4 rounded-xl">
          <h3 className="font-semibold text-warm-700 mb-2">
            📚 {t('level2.keyConcepts', 'Lykilhugtök')}:
          </h3>
          <div className="grid grid-cols-1 min-[360px]:grid-cols-2 gap-2 sm:gap-3 text-sm">
            <div className="bg-blue-50 p-2 sm:p-3 rounded-lg">
              <div className="font-bold text-blue-800">{t('concepts.oxidation', 'Oxun')}</div>
              <div className="text-blue-600">{t('concepts.oxidationDesc', 'Tapa e⁻ • ox# ↑')}</div>
            </div>
            <div className="bg-red-50 p-2 sm:p-3 rounded-lg">
              <div className="font-bold text-red-800">{t('concepts.reduction', 'Afoxun')}</div>
              <div className="text-red-600">{t('concepts.reductionDesc', 'Öðlast e⁻ • ox# ↓')}</div>
            </div>
            <div className="bg-purple-50 p-2 sm:p-3 rounded-lg">
              <div className="font-bold text-purple-800">
                {t('concepts.oxidizingAgent', 'Oxunarefni')}
              </div>
              <div className="text-purple-600">
                {t('concepts.oxidizingAgentDesc', 'Veldur oxun • Afoxast sjálft')}
              </div>
            </div>
            <div className="bg-green-50 p-2 sm:p-3 rounded-lg">
              <div className="font-bold text-green-800">
                {t('concepts.reducingAgent', 'Afoxunarefni')}
              </div>
              <div className="text-green-600">
                {t('concepts.reducingAgentDesc', 'Veldur afoxun • Oxast sjálft')}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 w-full bg-warm-200 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentProgress / totalQuestions) * 100}%` }}
          />
        </div>

        {/* Half-Reaction Balancer Tool */}
        <div className="mt-6">
          <HalfReactionBalancer interactive={true} compact={false} />
        </div>

        {/* Electrochemical Cell Simulation */}
        <div className="mt-6">
          <ElectrochemicalCell compact={false} interactive={true} />
        </div>
      </div>
    </div>
  );
}
