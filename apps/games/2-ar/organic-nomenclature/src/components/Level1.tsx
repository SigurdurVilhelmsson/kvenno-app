import { useState, useMemo, useRef, useEffect } from 'react';

import { FeedbackPanel } from '@shared/components';
import type { TieredHints } from '@shared/types';
import {
  isPhone,
  revealTop,
  shuffleArray,
  usableArea,
  useArmedAfter,
  useItemTop,
  useRevealAfterCommit,
  useScreenTop,
} from '@shared/utils';

import { MoleculeBuilder } from './MoleculeBuilder';

// Misconceptions for organic nomenclature
const MISCONCEPTIONS: Record<string, string> = {
  prefix:
    'Forskeytið segir til um fjölda kolefna í keðjunni. meth=1, eth=2, prop=3, but=4, pent=5, hex=6...',
  suffix: 'Viðskeytið segir til um tengjategund: -an (eintengi), -en (tvítengi), -ýn (þrítengi).',
  name: 'Nafnið er samsett úr forskeyti (fjöldi C) + viðskeyti (tengjategund). T.d. eth + en = eten.',
};

// Related concepts for organic nomenclature
const RELATED_CONCEPTS: Record<string, string[]> = {
  prefix: ['Kolefniskeðjur', 'Alkanar', 'IUPAC nafnakerfi'],
  suffix: ['Mettaðar sameindir', 'Ómettaðar sameindir', 'Efnatengi'],
  name: ['Lífræn efni', 'Vetniskolefni', 'Formúlur'],
};

interface Level1Props {
  onComplete: (score: number) => void;
  onBack: () => void;
}

interface PrefixRule {
  carbons: number;
  prefix: string;
  example: string;
  formula: string;
}

interface SuffixRule {
  bondType: string;
  suffix: string;
  bondSymbol: string;
  description: string;
}

const prefixes: PrefixRule[] = [
  { carbons: 1, prefix: 'meth-', example: 'metan', formula: 'CH₄' },
  { carbons: 2, prefix: 'eth-', example: 'etan', formula: 'C₂H₆' },
  { carbons: 3, prefix: 'prop-', example: 'própan', formula: 'C₃H₈' },
  { carbons: 4, prefix: 'but-', example: 'bútan', formula: 'C₄H₁₀' },
  { carbons: 5, prefix: 'pent-', example: 'pentan', formula: 'C₅H₁₂' },
  { carbons: 6, prefix: 'hex-', example: 'hexan', formula: 'C₆H₁₄' },
  { carbons: 7, prefix: 'hept-', example: 'heptan', formula: 'C₇H₁₆' },
  { carbons: 8, prefix: 'oct-', example: 'oktan', formula: 'C₈H₁₈' },
  { carbons: 9, prefix: 'non-', example: 'nónan', formula: 'C₉H₂₀' },
  { carbons: 10, prefix: 'dec-', example: 'dekan', formula: 'C₁₀H₂₂' },
];

const suffixes: SuffixRule[] = [
  {
    bondType: 'Eintengi',
    suffix: '-an',
    bondSymbol: 'C-C',
    description: 'Öll tengi eru einföld (mettað)',
  },
  {
    bondType: 'Tvítengi',
    suffix: '-en',
    bondSymbol: 'C=C',
    description: 'Eitt eða fleiri tvítengi (ómettað)',
  },
  {
    bondType: 'Þrítengi',
    suffix: '-ýn',
    bondSymbol: 'C≡C',
    description: 'Eitt eða fleiri þrítengi (ómettað)',
  },
];

interface QuizQuestion {
  id: number;
  type: 'prefix' | 'suffix' | 'name';
  question: string;
  correctAnswer: string;
  options: string[];
  hints?: TieredHints;
}

const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    type: 'prefix',
    question: "Hvað táknar forskeytið 'meth-'?",
    correctAnswer: '1 kolefni',
    options: ['1 kolefni', '2 kolefni', '3 kolefni', '4 kolefni'],
  },
  {
    id: 2,
    type: 'prefix',
    question: "Hvað táknar forskeytið 'prop-'?",
    correctAnswer: '3 kolefni',
    options: ['2 kolefni', '3 kolefni', '4 kolefni', '5 kolefni'],
  },
  {
    id: 3,
    type: 'suffix',
    question: "Hvað táknar viðskeytið '-an'?",
    correctAnswer: 'Eintengi',
    options: ['Eintengi', 'Tvítengi', 'Þrítengi', 'Virknihópur'],
  },
  {
    id: 4,
    type: 'suffix',
    question: "Hvað táknar viðskeytið '-en'?",
    correctAnswer: 'Tvítengi',
    options: ['Eintengi', 'Tvítengi', 'Þrítengi', 'Virknihópur'],
  },
  {
    id: 5,
    type: 'prefix',
    question: 'Hvaða forskeyti táknar 5 kolefni?',
    correctAnswer: 'pent-',
    options: ['but-', 'pent-', 'hex-', 'hept-'],
  },
  {
    id: 6,
    type: 'suffix',
    question: "Hvað táknar viðskeytið '-ýn'?",
    correctAnswer: 'Þrítengi',
    options: ['Eintengi', 'Tvítengi', 'Þrítengi', 'Hringtengi'],
  },
  {
    id: 7,
    type: 'name',
    question: 'Hvað heitir C₂H₆?',
    correctAnswer: 'etan',
    options: ['metan', 'etan', 'própan', 'bútan'],
  },
  {
    id: 8,
    type: 'name',
    question: 'Hvað heitir C₃H₄ með þrítengi?',
    correctAnswer: 'própýn',
    options: ['própen', 'própýn', 'própan', 'própanal'],
  },
  {
    id: 9,
    type: 'prefix',
    question: 'Hvaða forskeyti táknar 8 kolefni?',
    correctAnswer: 'oct-',
    options: ['hex-', 'hept-', 'oct-', 'non-'],
  },
  {
    id: 10,
    type: 'name',
    question: 'Hvað heitir C₂H₄ með tvítengi?',
    correctAnswer: 'eten',
    options: ['etan', 'eten', 'etýn', 'etanal'],
  },
];

export function Level1({ onComplete, onBack }: Level1Props) {
  const [phase, setPhase] = useState<'prefixes' | 'suffixes' | 'builder' | 'quiz'>('prefixes');
  const [currentItem, setCurrentItem] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  // (quiz has no hints)

  const handleNext = () => {
    if (phase === 'prefixes') {
      if (currentItem < prefixes.length - 1) {
        setCurrentItem((prev) => prev + 1);
      } else {
        setPhase('suffixes');
        setCurrentItem(0);
      }
    } else if (phase === 'suffixes') {
      if (currentItem < suffixes.length - 1) {
        setCurrentItem((prev) => prev + 1);
      } else {
        setPhase('builder');
      }
    } else if (phase === 'builder') {
      setPhase('quiz');
    }
  };

  const handlePrev = () => {
    if (currentItem > 0) {
      setCurrentItem((prev) => prev - 1);
    } else if (phase === 'suffixes') {
      setPhase('prefixes');
      setCurrentItem(prefixes.length - 1);
    }
  };

  const handleAnswer = (answer: string) => {
    const correct = answer === quizQuestions[currentQuestion].correctAnswer;
    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      setScore((prev) => prev + 10);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setShowFeedback(false);
    } else {
      onComplete(score);
    }
  };

  // Must call hooks unconditionally - memoize quiz options before conditional returns
  const question = quizQuestions[currentQuestion];
  const shuffledQuizOptions = useMemo(() => {
    if (!question) return [];
    return shuffleArray(question.options);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: re-shuffle when question index changes
  }, [currentQuestion, question]);

  // Each teaching card (Næsta, Fyrri) and each quiz question: on a phone its top
  // comes back under the screen's top edge, and focus moves to it at every
  // width, because the button pressed may have unmounted. Declared before
  // useScreenTop, so on a phase change the screen top and its heading win.
  const itemRef = useItemTop<HTMLDivElement>(
    phase === 'quiz' ? `quiz:${currentQuestion}` : `${phase}:${currentItem}`
  );
  // A phase change (prefixes → suffixes → builder → quiz, and back) starts the
  // new screen at its top with its heading focused.
  useScreenTop(phase);

  const feedbackBoxRef = useRef<HTMLDivElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  // After an answer, a phone shows the question through Næsta when it fits, or
  // else the verdict at the top, and focus moves to the feedback, not to Næsta,
  // so a second Enter lands on nothing (design P3).
  useRevealAfterCommit(showFeedback, () => ({
    bottom: nextRef.current,
    tops: [itemRef.current, feedbackRef.current],
    focus: feedbackRef.current,
  }));
  // A double tap on an answer must not land on Næsta.
  const armed = useArmedAfter(400, `${currentQuestion}:${showFeedback}`);

  // A desktop window keeps what the game's own helper did there, at any width:
  // the feedback is brought to the top when it opened above the screen or near
  // its foot, and "Byrja próf" and "Næsta spurning" bring back a question left
  // above the screen. A phone does both through the shared hooks above.
  useEffect(() => {
    const el = feedbackBoxRef.current;
    if (!showFeedback || !el || isPhone()) return;
    const { top } = el.getBoundingClientRect();
    if (top < 0 || top > usableArea().bottom - 120) revealTop(el, { anyWidth: true, always: true });
  }, [showFeedback]);
  useEffect(() => {
    const el = itemRef.current;
    if (phase !== 'quiz' || showFeedback || !el || isPhone()) return;
    if (el.getBoundingClientRect().top < 0) revealTop(el, { anyWidth: true, always: true });
  }, [itemRef, phase, currentQuestion, showFeedback]);

  if (phase === 'prefixes') {
    const prefix = prefixes[currentItem];

    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 p-4 md:p-8">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8">
          <div className="flex flex-wrap justify-between items-center gap-x-4 gap-y-2 mb-6 phone:mb-3">
            <button
              onClick={onBack}
              className="text-warm-500 hover:text-warm-700 whitespace-nowrap pointer-coarse:py-2.5 pointer-coarse:-my-2.5"
            >
              ← Til baka
            </button>
            <div className="ml-auto text-sm text-warm-500 whitespace-nowrap">
              Forskeyti {currentItem + 1} af {prefixes.length}
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-center mb-2 text-warm-700 phone:text-xl">
            📚 Forskeyti (kolefnisfjöldi)
          </h1>
          <p className="text-center text-warm-600 mb-8 phone:mb-4">
            Forskeytið segir hversu mörg kolefni eru í keðjunni
          </p>

          <div className="flex justify-center gap-1 mb-6 phone:mb-4">
            {prefixes.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full ${
                  idx === currentItem
                    ? 'bg-warm-700'
                    : idx < currentItem
                      ? 'bg-green-500'
                      : 'bg-warm-300'
                }`}
              />
            ))}
          </div>

          <div
            ref={itemRef}
            data-item-start
            className="bg-gradient-to-br from-warm-100 to-warm-100 p-4 sm:p-8 rounded-2xl border-2 border-warm-200 animate-slide-in"
          >
            <div className="flex justify-center items-center gap-4 sm:gap-8 mb-6">
              <div className="text-center">
                <div className="text-6xl font-bold text-warm-800 mb-2">{prefix.carbons}</div>
                <div className="text-warm-500">kolefni</div>
              </div>
              <div className="text-4xl text-warm-400">→</div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">{prefix.prefix}</div>
                <div className="text-warm-500">forskeyti</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl text-center">
              <div className="text-sm text-warm-500 mb-1">Dæmi (alkan):</div>
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
                <span className="text-2xl font-bold text-warm-800">{prefix.example}</span>
                <span className="text-xl text-warm-400">|</span>
                <span className="text-2xl font-mono text-warm-600 whitespace-nowrap">
                  {prefix.formula}
                </span>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap justify-center gap-y-2">
              {Array.from({ length: prefix.carbons }).map((_, idx) => (
                <div key={idx} className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-warm-800 text-white font-bold text-sm flex items-center justify-center">
                    C
                  </div>
                  {idx < prefix.carbons - 1 && <div className="w-4 h-1 bg-warm-600"></div>}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 mt-8 phone:mt-4 phone:gap-3">
            <button
              onClick={handlePrev}
              disabled={currentItem === 0}
              className={`flex-1 py-3 px-4 sm:px-6 rounded-xl font-bold phone:px-2 phone:whitespace-nowrap ${
                currentItem === 0
                  ? 'bg-warm-200 text-warm-400 cursor-not-allowed'
                  : 'bg-warm-500 hover:bg-warm-600 text-white'
              }`}
            >
              ← Fyrri
            </button>
            <button
              onClick={handleNext}
              className="flex-1 bg-warm-700 hover:bg-warm-800 text-white font-bold py-3 px-4 sm:px-6 rounded-xl phone:px-2 phone:whitespace-nowrap"
            >
              {currentItem === prefixes.length - 1 ? 'Viðskeyti →' : 'Næsta →'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'suffixes') {
    const suffix = suffixes[currentItem];

    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 p-4 md:p-8">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8">
          <div className="flex flex-wrap justify-between items-center gap-x-4 gap-y-2 mb-6 phone:mb-3">
            <button
              onClick={onBack}
              className="text-warm-500 hover:text-warm-700 whitespace-nowrap pointer-coarse:py-2.5 pointer-coarse:-my-2.5"
            >
              ← Til baka
            </button>
            <div className="ml-auto text-sm text-warm-500 whitespace-nowrap">
              Viðskeyti {currentItem + 1} af {suffixes.length}
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-center mb-2 text-green-700 phone:text-xl">
            🔗 Viðskeyti (tengjategund)
          </h1>
          <p className="text-center text-warm-600 mb-8 phone:mb-4">
            Viðskeytið segir hvaða tegund af tengingu er milli kolefna
          </p>

          <div className="flex justify-center gap-2 mb-6 phone:mb-4">
            {suffixes.map((_, idx) => (
              <div
                key={idx}
                className={`w-3 h-3 rounded-full ${
                  idx === currentItem
                    ? 'bg-green-700'
                    : idx < currentItem
                      ? 'bg-green-500'
                      : 'bg-warm-300'
                }`}
              />
            ))}
          </div>

          <div
            ref={itemRef}
            data-item-start
            className="bg-gradient-to-br from-green-100 to-emerald-100 p-4 sm:p-8 rounded-2xl border-2 border-green-200 animate-slide-in"
          >
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-green-700 mb-2">{suffix.suffix}</div>
              <div className="text-2xl text-warm-700">{suffix.bondType}</div>
            </div>

            <div className="bg-white p-6 rounded-xl text-center mb-4">
              <div className="text-4xl font-mono font-bold text-warm-800 mb-2">
                {suffix.bondSymbol}
              </div>
              <div className="text-warm-600">{suffix.description}</div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div
                className={`p-3 rounded-lg text-center ${currentItem === 0 ? 'bg-warm-200' : 'bg-white'}`}
              >
                <div className="font-bold">-an</div>
                <div className="text-warm-500">C-C</div>
              </div>
              <div
                className={`p-3 rounded-lg text-center ${currentItem === 1 ? 'bg-green-200' : 'bg-white'}`}
              >
                <div className="font-bold">-en</div>
                <div className="text-warm-500">C=C</div>
              </div>
              <div
                className={`p-3 rounded-lg text-center ${currentItem === 2 ? 'bg-purple-200' : 'bg-white'}`}
              >
                <div className="font-bold">-ýn</div>
                <div className="text-warm-500">C≡C</div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-8 phone:mt-4 phone:gap-3">
            <button
              onClick={handlePrev}
              className="flex-1 bg-warm-500 hover:bg-warm-600 text-white font-bold py-3 px-4 sm:px-6 rounded-xl phone:px-2 phone:whitespace-nowrap"
            >
              ← Fyrri
            </button>
            <button
              onClick={handleNext}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 sm:px-6 rounded-xl phone:px-2 phone:whitespace-nowrap"
            >
              {currentItem === suffixes.length - 1 ? 'Sameindasmiður →' : 'Næsta →'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Builder phase - Interactive molecule exploration
  if (phase === 'builder') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 p-4 md:p-8">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8">
          <div className="flex flex-wrap justify-between items-center gap-x-4 gap-y-2 mb-6 phone:mb-3">
            <button
              onClick={onBack}
              className="text-warm-500 hover:text-warm-700 whitespace-nowrap pointer-coarse:py-2.5 pointer-coarse:-my-2.5"
            >
              ← Til baka
            </button>
            <div className="ml-auto text-sm text-warm-500 whitespace-nowrap">Sameindasmiður</div>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-center mb-2 text-emerald-600 phone:text-xl">
            🔬 Prófaðu sjálf/ur!
          </h1>
          <p className="text-center text-warm-600 mb-8 phone:mb-4">
            Byggðu sameindir og sjáðu hvernig nafnið breytist
          </p>

          <MoleculeBuilder compact={false} maxCarbons={8} initialCarbons={4} />

          <div className="mt-6 bg-emerald-50 p-4 rounded-xl border border-emerald-200">
            <h3 className="font-semibold text-emerald-800 mb-2">📝 Taktu eftir:</h3>
            <ul className="text-sm text-emerald-700 space-y-1">
              <li>
                • <strong>Forskeytið</strong> breytist þegar þú bætir við/fjarlægir kolefni
              </li>
              <li>
                • <strong>Viðskeytið</strong> breytist þegar þú breytir tengingum (ein/tví/þrí)
              </li>
              <li>
                • Fyrir 4+ kolefni birtist <strong>staðsetningartala</strong> fyrir
                tvítengi/þrítengi
              </li>
            </ul>
          </div>

          <div className="flex gap-4 mt-8 phone:mt-4 phone:gap-3">
            <button
              onClick={() => {
                setPhase('suffixes');
                setCurrentItem(suffixes.length - 1);
              }}
              className="flex-1 bg-warm-500 hover:bg-warm-600 text-white font-bold py-3 px-4 sm:px-6 rounded-xl phone:px-2 phone:whitespace-nowrap"
            >
              ← Til baka
            </button>
            <button
              onClick={handleNext}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 sm:px-6 rounded-xl phone:px-2 phone:whitespace-nowrap"
            >
              Byrja próf →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz phase
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 p-4 md:p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8">
        <div className="flex flex-wrap justify-between items-center gap-x-4 gap-y-2 mb-6 phone:mb-3 phone:gap-x-3">
          <button
            onClick={onBack}
            className="text-warm-500 hover:text-warm-700 whitespace-nowrap pointer-coarse:py-2.5 pointer-coarse:-my-2.5"
          >
            ← Til baka
          </button>
          <div className="ml-auto flex items-center gap-3 sm:gap-4 phone:gap-2">
            <div className="text-sm text-warm-500 whitespace-nowrap">
              Spurning {currentQuestion + 1} af {quizQuestions.length}
            </div>
            <div className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-bold whitespace-nowrap phone:px-2 phone:py-0.5 phone:text-sm">
              Stig: {score}
            </div>
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-center mb-8 text-emerald-600 phone:text-xl phone:mb-3">
          ✏️ Próf: Forskeyti og viðskeyti
        </h1>

        <div
          ref={itemRef}
          data-item-start
          className="bg-emerald-50 p-4 sm:p-6 rounded-xl mb-6 text-center border-2 border-emerald-200 scroll-mt-4 phone:p-3 phone:mb-3"
        >
          <div className="text-xl md:text-2xl font-bold text-warm-800">{question.question}</div>
        </div>

        {!showFeedback ? (
          <div key="options" className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 phone:gap-2">
            {shuffledQuizOptions.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(option)}
                className="p-4 rounded-xl border-2 border-emerald-300 bg-white hover:bg-emerald-50 hover:border-emerald-400 text-lg font-bold text-warm-800 transition-all phone:p-3"
              >
                {option}
              </button>
            ))}
          </div>
        ) : (
          <div
            key="feedback"
            ref={feedbackBoxRef}
            className="space-y-4 scroll-mt-4 phone:space-y-3"
          >
            {/* The feedback region focus moves to after an answer (P3).
                FeedbackPanel is itself role=alert and announces the verdict. */}
            <div ref={feedbackRef} tabIndex={-1} role="group" className="focus:outline-none">
              <FeedbackPanel
                feedback={{
                  isCorrect,
                  explanation: isCorrect
                    ? `Rétt! ${question.correctAnswer} er rétta svarið.`
                    : `Rétt svar: ${question.correctAnswer}`,
                  misconception: isCorrect ? undefined : MISCONCEPTIONS[question.type],
                  relatedConcepts: RELATED_CONCEPTS[question.type],
                  nextSteps: isCorrect
                    ? 'Frábært! Þú ert að ná góðum tökum á lífrænu nafnakerfinu.'
                    : 'Skoðaðu minnisblaðið og reyndu að muna reglurnar.',
                }}
                config={{
                  showExplanation: true,
                  showMisconceptions: !isCorrect,
                  showRelatedConcepts: true,
                  showNextSteps: true,
                }}
              />
            </div>

            {/* Næsta is its own element, never an answer relabelled, and it
                ignores a press within 400 ms of appearing. */}
            <button
              key="next"
              ref={nextRef}
              onClick={armed(handleNextQuestion)}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 sm:px-6 rounded-xl"
            >
              {currentQuestion < quizQuestions.length - 1 ? 'Næsta spurning →' : 'Ljúka stigi →'}
            </button>
          </div>
        )}

        <div className="mt-6 bg-warm-50 p-4 rounded-xl phone:mt-4">
          <h3 className="font-semibold text-warm-700 mb-2">📋 Minnisblað:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <div className="font-bold text-warm-700 mb-1">Forskeyti:</div>
              <div className="grid grid-cols-3 sm:grid-cols-2 gap-1">
                {prefixes.slice(0, 6).map((p, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-1 rounded border text-center whitespace-nowrap"
                  >
                    {p.carbons}: {p.prefix}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="font-bold text-warm-700 mb-1">Viðskeyti:</div>
              <div className="space-y-1">
                {suffixes.map((s, idx) => (
                  <div key={idx} className="bg-white p-1 rounded border text-center">
                    {s.suffix} = {s.bondType}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 w-full bg-warm-200 rounded-full h-2">
          <div
            className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
