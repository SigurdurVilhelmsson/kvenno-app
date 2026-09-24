import { useEffect, useMemo, useRef, useState } from 'react';

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

interface Level3Props {
  onComplete: (score: number) => void;
  onBack: () => void;
}

interface FunctionalGroup {
  nameIcelandic: string;
  formula: string;
  suffix: string;
  example: string;
  exampleName: string;
  description: string;
  color: string;
}

const functionalGroups: FunctionalGroup[] = [
  {
    nameIcelandic: 'Alkóhól',
    formula: '-OH',
    suffix: '-ól',
    example: 'CH₃OH',
    exampleName: 'metanól',
    description: 'Hýdroxýlhópur bundinn við kolefni',
    color: 'bg-blue-100 border-blue-400 text-blue-800',
  },
  {
    nameIcelandic: 'Aldehýð',
    formula: '-CHO',
    suffix: '-al',
    example: 'CH₃CHO',
    exampleName: 'etanal',
    description: 'Karbonýlhópur í enda keðju',
    color: 'bg-amber-100 border-amber-400 text-amber-800',
  },
  {
    nameIcelandic: 'Ketón',
    formula: 'C-CO-C',
    suffix: '-ón',
    example: 'CH₃COCH₃',
    exampleName: 'própanón',
    description: 'Karbonýlhópur í miðri keðju',
    color: 'bg-orange-100 border-orange-400 text-orange-800',
  },
  {
    nameIcelandic: 'Karboxýlsýra',
    formula: '-COOH',
    suffix: '-sýra',
    example: 'CH₃COOH',
    exampleName: 'etansýra',
    description: 'Karboxýlhópur (sýruhópur)',
    color: 'bg-red-100 border-red-400 text-red-800',
  },
];

interface Challenge {
  id: number;
  type: 'identify' | 'name' | 'structure';
  question: string;
  formula?: string;
  structure?: string;
  correctAnswer: string;
  options: string[];
  explanation: string;
}

const challenges: Challenge[] = [
  // Identification challenges
  {
    id: 1,
    type: 'identify',
    question: 'Hvaða virknihópur er í CH₃OH?',
    formula: 'CH₃OH',
    correctAnswer: 'Alkóhól (-OH)',
    options: ['Alkóhól (-OH)', 'Aldehýð (-CHO)', 'Karboxýlsýra (-COOH)', 'Ketón (C=O)'],
    explanation: 'CH₃OH hefur -OH hóp sem er hýdroxýlhópur (alkóhól)',
  },
  {
    id: 2,
    type: 'identify',
    question: 'Hvaða virknihópur er í CH₃COOH?',
    formula: 'CH₃COOH',
    correctAnswer: 'Karboxýlsýra (-COOH)',
    options: ['Alkóhól (-OH)', 'Aldehýð (-CHO)', 'Karboxýlsýra (-COOH)', 'Ketón (C=O)'],
    explanation: '-COOH hópurinn er karboxýlhópur (sýruhópur)',
  },
  {
    id: 3,
    type: 'identify',
    question: 'Hvaða virknihópur er í CH₃CHO?',
    formula: 'CH₃CHO',
    correctAnswer: 'Aldehýð (-CHO)',
    options: ['Alkóhól (-OH)', 'Aldehýð (-CHO)', 'Karboxýlsýra (-COOH)', 'Ketón (C=O)'],
    explanation: '-CHO er aldehýðhópur (karbonýl í enda keðju)',
  },

  // Naming challenges
  {
    id: 4,
    type: 'name',
    question: 'Hvað heitir CH₃CH₂OH?',
    formula: 'CH₃CH₂OH',
    correctAnswer: 'etanól',
    options: ['metanól', 'etanól', 'própanól', 'etanal'],
    explanation: '2 kolefni (eth-) + alkóhól (-ól) = etanól',
  },
  {
    id: 5,
    type: 'name',
    question: 'Hvað heitir CH₃CH₂COOH?',
    formula: 'CH₃CH₂COOH',
    correctAnswer: 'própansýra',
    options: ['etansýra', 'própansýra', 'própanól', 'própan'],
    explanation: '3 kolefni (prop-) + karboxýlsýra (-sýra) = própansýra',
  },
  {
    id: 6,
    type: 'name',
    question: 'Hvað heitir HCHO?',
    formula: 'HCHO',
    correctAnswer: 'metanal',
    options: ['metanal', 'etanal', 'metanól', 'metansýra'],
    explanation: '1 kolefni (meth-) + aldehýð (-al) = metanal (einnig kallað formaldehýð)',
  },
  {
    id: 7,
    type: 'name',
    question: 'Hvað heitir CH₃COCH₃?',
    formula: 'CH₃COCH₃',
    correctAnswer: 'própanón',
    options: ['etanón', 'própanón', 'própanól', 'própan'],
    explanation: '3 kolefni (prop-) + ketón (-ón) = própanón (einnig kallað asetón)',
  },

  // Structure challenges
  {
    id: 8,
    type: 'structure',
    question: 'Hvaða formúlu hefur METANÓL?',
    correctAnswer: 'CH₃OH',
    options: ['CH₃OH', 'CH₃CHO', 'HCOOH', 'CH₄'],
    explanation: 'Metanól = 1 kolefni + alkóhól = CH₃ + OH = CH₃OH',
  },
  {
    id: 9,
    type: 'structure',
    question: 'Hvaða formúlu hefur ETANSÝRA?',
    correctAnswer: 'CH₃COOH',
    options: ['CH₃COOH', 'CH₃CHO', 'CH₃OH', 'C₂H₆'],
    explanation: 'Etansýra = 2 kolefni + karboxýlsýra = CH₃COOH (edik)',
  },
  {
    id: 10,
    type: 'structure',
    question: 'Hvaða formúlu hefur PRÓPANÓL?',
    correctAnswer: 'CH₃CH₂CH₂OH',
    options: ['CH₃CH₂CH₂OH', 'CH₃CH₂CHO', 'CH₃CH₂COOH', 'C₃H₈'],
    explanation: 'Própanól = 3 kolefni + alkóhól = CH₃CH₂CH₂OH',
  },
];

export function Level3({ onComplete, onBack }: Level3Props) {
  const [phase, setPhase] = useState<'learn' | 'challenge'>('learn');
  const [currentGroup, setCurrentGroup] = useState(0);
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  // (quiz has no hints)

  const handleNextGroup = () => {
    if (currentGroup < functionalGroups.length - 1) {
      setCurrentGroup((prev) => prev + 1);
    } else {
      setPhase('challenge');
    }
  };

  const handlePrevGroup = () => {
    if (currentGroup > 0) {
      setCurrentGroup((prev) => prev - 1);
    }
  };

  /**
   * The correct answer sits first in the data on 6 of the 10 challenges, so
   * rendering them in order rewarded picking the top-left button. Memoised on
   * the challenge index so the grid holds still while the student reads it.
   *
   * Grading is by string equality against `correctAnswer`, so reordering is safe
   * here — nothing identifies an option by its position.
   */
  const shuffledOptions = useMemo(
    () => shuffleArray(challenges[currentChallenge].options),
    [currentChallenge]
  );

  // Each functional-group card (Næsta, Fyrri) and each challenge: on a phone its
  // top comes back under the screen's top edge, and focus moves to it at every
  // width. Declared before useScreenTop, so on the learn → challenge swap the
  // screen top and its heading win.
  const itemRef = useItemTop<HTMLDivElement>(
    phase === 'learn' ? `learn:${currentGroup}` : `challenge:${currentChallenge}`
  );
  useScreenTop(phase);

  const feedbackBoxRef = useRef<HTMLDivElement>(null);
  const verdictRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  // After an answer, a phone shows the question through Næsta when it fits, or
  // else the verdict at the top, and focus moves to the verdict, not to Næsta,
  // so a second Enter lands on nothing (design P3).
  useRevealAfterCommit(showFeedback, () => ({
    bottom: nextRef.current,
    tops: [itemRef.current, verdictRef.current],
    focus: verdictRef.current,
  }));
  // A double tap on an answer must not land on Næsta.
  const armed = useArmedAfter(400, `${currentChallenge}:${showFeedback}`);

  // A desktop window keeps what the game's own helper did there, at any width:
  // the feedback is brought to the top when it opened above the screen or near
  // its foot, and "Byrja áskoranir" and "Næsta áskorun" bring back a question
  // left above the screen. A phone does both through the shared hooks above.
  useEffect(() => {
    const el = feedbackBoxRef.current;
    if (!showFeedback || !el || isPhone()) return;
    const { top } = el.getBoundingClientRect();
    if (top < 0 || top > usableArea().bottom - 120) revealTop(el, { anyWidth: true, always: true });
  }, [showFeedback]);
  useEffect(() => {
    const el = itemRef.current;
    if (phase !== 'challenge' || showFeedback || !el || isPhone()) return;
    if (el.getBoundingClientRect().top < 0) revealTop(el, { anyWidth: true, always: true });
  }, [itemRef, phase, currentChallenge, showFeedback]);

  const handleAnswer = (answer: string) => {
    const correct = answer === challenges[currentChallenge].correctAnswer;
    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      setScore((prev) => prev + 10);
    }
  };

  const handleNextChallenge = () => {
    if (currentChallenge < challenges.length - 1) {
      setCurrentChallenge((prev) => prev + 1);
      setShowFeedback(false);
    } else {
      onComplete(score);
    }
  };

  if (phase === 'learn') {
    const group = functionalGroups[currentGroup];

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
              Virknihópur {currentGroup + 1} af {functionalGroups.length}
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-center mb-2 text-purple-600 phone:text-xl">
            🔬 Virknihópar
          </h1>
          <p className="text-center text-warm-600 mb-8 phone:mb-4">
            Virknihópar ákvarða eiginleika og nafn sameindar
          </p>

          <div className="flex justify-center gap-2 mb-6 phone:mb-4">
            {functionalGroups.map((_, idx) => (
              <div
                key={idx}
                className={`w-3 h-3 rounded-full ${
                  idx === currentGroup
                    ? 'bg-purple-500'
                    : idx < currentGroup
                      ? 'bg-green-500'
                      : 'bg-warm-300'
                }`}
              />
            ))}
          </div>

          <div
            ref={itemRef}
            data-item-start
            className={`${group.color} p-4 sm:p-8 rounded-2xl border-2 animate-slide-in`}
          >
            <div className="text-center mb-6 phone:mb-4">
              <div className="text-2xl sm:text-4xl font-bold mb-2">{group.nameIcelandic}</div>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-xl mb-6 phone:mb-4">
              <div className="grid grid-cols-2 gap-3 sm:gap-6 text-center">
                <div>
                  <div className="text-sm text-warm-500 mb-1">Virknihópur</div>
                  <div className="text-2xl sm:text-3xl font-mono font-bold whitespace-nowrap">
                    {group.formula}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-warm-500 mb-1">Viðskeyti</div>
                  <div className="text-2xl sm:text-3xl font-bold text-green-600 whitespace-nowrap">
                    {group.suffix}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl mb-4">
              <div className="text-sm text-warm-500 mb-1">Dæmi:</div>
              <div className="flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-4">
                <span className="text-xl sm:text-2xl font-mono whitespace-nowrap">
                  {group.example}
                </span>
                {/* Arrow and name wrap together, so a narrow screen breaks before the arrow */}
                <span className="flex items-center gap-x-3 sm:gap-x-4">
                  <span className="text-xl sm:text-2xl text-warm-400">→</span>
                  <span className="text-xl sm:text-2xl font-bold">{group.exampleName}</span>
                </span>
              </div>
            </div>

            <div className="text-center text-sm">{group.description}</div>
          </div>

          <div className="flex gap-4 mt-8 phone:mt-4 phone:gap-3">
            <button
              onClick={handlePrevGroup}
              disabled={currentGroup === 0}
              className={`flex-1 py-3 px-4 sm:px-6 rounded-xl font-bold phone:px-2 phone:whitespace-nowrap ${
                currentGroup === 0
                  ? 'bg-warm-200 text-warm-400 cursor-not-allowed'
                  : 'bg-warm-500 hover:bg-warm-600 text-white'
              }`}
            >
              ← Fyrri
            </button>
            <button
              onClick={handleNextGroup}
              className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-4 sm:px-6 rounded-xl phone:px-2 phone:whitespace-nowrap"
            >
              {currentGroup === functionalGroups.length - 1 ? 'Byrja áskoranir →' : 'Næsta →'}
            </button>
          </div>

          <div className="mt-6 bg-warm-50 p-4 rounded-xl phone:mt-4">
            <h3 className="font-semibold text-warm-700 mb-2">📋 Allir virknihópar:</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {functionalGroups.map((fg, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded border ${idx === currentGroup ? fg.color : 'bg-white'}`}
                >
                  <span className="font-bold whitespace-nowrap">{fg.formula}</span>
                  <span className="text-warm-500"> → </span>
                  <span className="text-green-600 whitespace-nowrap">{fg.suffix}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Challenge phase
  const challenge = challenges[currentChallenge];

  const getTypeLabel = () => {
    switch (challenge.type) {
      case 'identify':
        return '🔍 Þekkja virknihóp';
      case 'name':
        return '🏷️ Nefna sameind';
      case 'structure':
        return '🧪 Finna formúlu';
    }
  };

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
              Áskorun {currentChallenge + 1} af {challenges.length}
            </div>
            <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-bold whitespace-nowrap phone:px-2 phone:py-0.5 phone:text-sm">
              Stig: {score}
            </div>
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-center mb-2 text-purple-600 phone:text-xl">
          {getTypeLabel()}
        </h1>

        <div
          ref={itemRef}
          data-item-start
          className="bg-purple-50 p-4 sm:p-6 rounded-xl mb-6 text-center border-2 border-purple-200 scroll-mt-4 phone:p-3 phone:mb-3"
        >
          <div className="text-xl md:text-2xl font-bold text-warm-800 mb-2">
            {challenge.question}
          </div>
          {challenge.formula && (
            <div className="text-3xl font-mono font-bold text-purple-700">{challenge.formula}</div>
          )}
        </div>

        {!showFeedback ? (
          <div key="options" className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 phone:gap-2">
            {shuffledOptions.map((option) => (
              <button
                key={option}
                onClick={() => handleAnswer(option)}
                className="p-4 rounded-xl border-2 border-purple-300 bg-white hover:bg-purple-50 hover:border-purple-400 text-lg font-bold text-warm-800 transition-all phone:p-3"
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
            {/* The feedback region focus moves to after an answer (P3), named by
                its verdict. On a phone the ✓/✗ sits inline with the verdict. */}
            <div
              ref={verdictRef}
              tabIndex={-1}
              role="group"
              aria-labelledby="organic-l3-verdict"
              className={`p-6 rounded-xl text-center focus:outline-none phone:p-4 ${
                isCorrect
                  ? 'bg-green-100 border-2 border-green-400'
                  : 'bg-red-100 border-2 border-red-400'
              }`}
            >
              <div className="phone:flex phone:items-center phone:justify-center phone:gap-2">
                <div className="text-4xl mb-2 phone:text-2xl phone:mb-0">
                  {isCorrect ? '✓' : '✗'}
                </div>
                <div
                  id="organic-l3-verdict"
                  className={`text-xl font-bold ${isCorrect ? 'text-green-800' : 'text-red-800'}`}
                >
                  {isCorrect ? 'Rétt!' : 'Rangt'}
                </div>
              </div>
              {!isCorrect && (
                <div className="text-red-700 mt-2 phone:mt-1">
                  Rétt svar: <strong>{challenge.correctAnswer}</strong>
                </div>
              )}
            </div>

            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 phone:p-3">
              <div className="font-bold text-blue-800 mb-1">Útskýring:</div>
              <div className="text-blue-700">{challenge.explanation}</div>
            </div>

            {/* Næsta is its own element, never an answer relabelled, and it
                ignores a press within 400 ms of appearing. */}
            <button
              key="next"
              ref={nextRef}
              onClick={armed(handleNextChallenge)}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-4 sm:px-6 rounded-xl"
            >
              {currentChallenge < challenges.length - 1 ? 'Næsta áskorun →' : 'Ljúka stigi →'}
            </button>
          </div>
        )}

        <div className="mt-6 bg-warm-50 p-4 rounded-xl phone:mt-4">
          <h3 className="font-semibold text-warm-700 mb-2">📋 Virknihópar og viðskeyti:</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-center">
            <div className="bg-blue-50 p-2 rounded border border-blue-200">
              <div className="font-bold">-OH</div>
              <div className="text-blue-600">-ól</div>
            </div>
            <div className="bg-amber-50 p-2 rounded border border-amber-200">
              <div className="font-bold">-CHO</div>
              <div className="text-amber-600">-al</div>
            </div>
            <div className="bg-orange-50 p-2 rounded border border-orange-200">
              <div className="font-bold">C=O</div>
              <div className="text-orange-600">-ón</div>
            </div>
            <div className="bg-red-50 p-2 rounded border border-red-200">
              <div className="font-bold">-COOH</div>
              <div className="text-red-600">-sýra</div>
            </div>
          </div>
        </div>

        <div className="mt-4 w-full bg-warm-200 rounded-full h-2">
          <div
            className="bg-purple-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentChallenge + 1) / challenges.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
