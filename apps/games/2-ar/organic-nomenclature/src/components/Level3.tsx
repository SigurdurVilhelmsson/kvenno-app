import { useState } from 'react';

interface Level3Props {
  onComplete: (score: number, maxScore: number, hintsUsed: number) => void;
  onBack: () => void;
  onCorrectAnswer?: () => void;
  onIncorrectAnswer?: () => void;
}

interface FunctionalGroup {
  name: string;
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
    name: "Alcohol",
    nameIcelandic: "Alkóhól",
    formula: "-OH",
    suffix: "-ól",
    example: "CH₃OH",
    exampleName: "metanól",
    description: "Hýdroxýlhópur bundinn við kolefni",
    color: "bg-blue-100 border-blue-400 text-blue-800"
  },
  {
    name: "Aldehyde",
    nameIcelandic: "Aldehýð",
    formula: "-CHO",
    suffix: "-al",
    example: "CH₃CHO",
    exampleName: "etanal",
    description: "Karbonýlhópur í enda keðju",
    color: "bg-amber-100 border-amber-400 text-amber-800"
  },
  {
    name: "Ketone",
    nameIcelandic: "Ketón",
    formula: "C-CO-C",
    suffix: "-ón",
    example: "CH₃COCH₃",
    exampleName: "própanón",
    description: "Karbonýlhópur í miðri keðju",
    color: "bg-orange-100 border-orange-400 text-orange-800"
  },
  {
    name: "Carboxylic Acid",
    nameIcelandic: "Karboxýlsýra",
    formula: "-COOH",
    suffix: "-sýra",
    example: "CH₃COOH",
    exampleName: "etansýra",
    description: "Karboxýlhópur (sýruhópur)",
    color: "bg-red-100 border-red-400 text-red-800"
  }
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
    question: "Hvaða hóptengi er í CH₃OH?",
    formula: "CH₃OH",
    correctAnswer: "Alkóhól (-OH)",
    options: ["Alkóhól (-OH)", "Aldehýð (-CHO)", "Karboxýlsýra (-COOH)", "Ketón (C=O)"],
    explanation: "CH₃OH hefur -OH hóp sem er hýdroxýlhópur (alkóhól)"
  },
  {
    id: 2,
    type: 'identify',
    question: "Hvaða hóptengi er í CH₃COOH?",
    formula: "CH₃COOH",
    correctAnswer: "Karboxýlsýra (-COOH)",
    options: ["Alkóhól (-OH)", "Aldehýð (-CHO)", "Karboxýlsýra (-COOH)", "Ketón (C=O)"],
    explanation: "-COOH hópurinn er karboxýlhópur (sýruhópur)"
  },
  {
    id: 3,
    type: 'identify',
    question: "Hvaða hóptengi er í CH₃CHO?",
    formula: "CH₃CHO",
    correctAnswer: "Aldehýð (-CHO)",
    options: ["Alkóhól (-OH)", "Aldehýð (-CHO)", "Karboxýlsýra (-COOH)", "Ketón (C=O)"],
    explanation: "-CHO er aldehýðhópur (karbonýl í enda keðju)"
  },

  // Naming challenges
  {
    id: 4,
    type: 'name',
    question: "Hvað heitir CH₃CH₂OH?",
    formula: "CH₃CH₂OH",
    correctAnswer: "etanól",
    options: ["metanól", "etanól", "própanól", "etanal"],
    explanation: "2 kolefni (eth-) + alkóhól (-ól) = etanól"
  },
  {
    id: 5,
    type: 'name',
    question: "Hvað heitir CH₃CH₂COOH?",
    formula: "CH₃CH₂COOH",
    correctAnswer: "própansýra",
    options: ["etansýra", "própansýra", "propanól", "propan"],
    explanation: "3 kolefni (prop-) + karboxýlsýra (-sýra) = própansýra"
  },
  {
    id: 6,
    type: 'name',
    question: "Hvað heitir HCHO?",
    formula: "HCHO",
    correctAnswer: "metanal",
    options: ["metanal", "etanal", "metanól", "metansýra"],
    explanation: "1 kolefni (meth-) + aldehýð (-al) = metanal (einnig kallað formaldehýð)"
  },
  {
    id: 7,
    type: 'name',
    question: "Hvað heitir CH₃COCH₃?",
    formula: "CH₃COCH₃",
    correctAnswer: "própanón",
    options: ["etanón", "própanón", "própanól", "propan"],
    explanation: "3 kolefni (prop-) + ketón (-ón) = própanón (einnig kallað asetón)"
  },

  // Structure challenges
  {
    id: 8,
    type: 'structure',
    question: "Hvaða formúla á METANÓL?",
    correctAnswer: "CH₃OH",
    options: ["CH₃OH", "CH₃CHO", "HCOOH", "CH₄"],
    explanation: "Metanól = 1 kolefni + alkóhól = CH₃ + OH = CH₃OH"
  },
  {
    id: 9,
    type: 'structure',
    question: "Hvaða formúla á ETANSÝRA?",
    correctAnswer: "CH₃COOH",
    options: ["CH₃COOH", "CH₃CHO", "CH₃OH", "C₂H₆"],
    explanation: "Etansýra = 2 kolefni + karboxýlsýra = CH₃COOH (edik)"
  },
  {
    id: 10,
    type: 'structure',
    question: "Hvaða formúla á PRÓPANÓL?",
    correctAnswer: "CH₃CH₂CH₂OH",
    options: ["CH₃CH₂CH₂OH", "CH₃CH₂CHO", "CH₃CH₂COOH", "C₃H₈"],
    explanation: "Própanól = 3 kolefni + alkóhól = CH₃CH₂CH₂OH"
  }
];

export function Level3({ onComplete, onBack, onCorrectAnswer, onIncorrectAnswer }: Level3Props) {
  const [phase, setPhase] = useState<'learn' | 'challenge'>('learn');
  const [currentGroup, setCurrentGroup] = useState(0);
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [totalHintsUsed] = useState(0); // Level3 doesn't have hints in challenge
  const maxScore = challenges.length * 10;

  const handleNextGroup = () => {
    if (currentGroup < functionalGroups.length - 1) {
      setCurrentGroup(prev => prev + 1);
    } else {
      setPhase('challenge');
    }
  };

  const handlePrevGroup = () => {
    if (currentGroup > 0) {
      setCurrentGroup(prev => prev - 1);
    }
  };

  const handleAnswer = (answer: string) => {
    const correct = answer === challenges[currentChallenge].correctAnswer;
    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      setScore(prev => prev + 10);
      onCorrectAnswer?.();
    } else {
      onIncorrectAnswer?.();
    }
  };

  const handleNextChallenge = () => {
    if (currentChallenge < challenges.length - 1) {
      setCurrentChallenge(prev => prev + 1);
      setShowFeedback(false);
    } else {
      onComplete(score, maxScore, totalHintsUsed);
    }
  };

  if (phase === 'learn') {
    const group = functionalGroups[currentGroup];

    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 p-4 md:p-8">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <button onClick={onBack} className="text-gray-500 hover:text-gray-700">
              ← Til baka
            </button>
            <div className="text-sm text-gray-500">
              Hóptengi {currentGroup + 1} af {functionalGroups.length}
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-center mb-2 text-purple-600">
            🔬 Hóptengi (Functional Groups)
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Hóptengi ákvarða eiginleika og nafn sameindar
          </p>

          <div className="flex justify-center gap-2 mb-6">
            {functionalGroups.map((_, idx) => (
              <div
                key={idx}
                className={`w-3 h-3 rounded-full ${
                  idx === currentGroup ? 'bg-purple-500' : idx < currentGroup ? 'bg-green-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <div className={`${group.color} p-8 rounded-2xl border-2 animate-slide-in`}>
            <div className="text-center mb-6">
              <div className="text-4xl font-bold mb-2">{group.nameIcelandic}</div>
              <div className="text-lg text-gray-600">({group.name})</div>
            </div>

            <div className="bg-white p-6 rounded-xl mb-6">
              <div className="grid grid-cols-2 gap-6 text-center">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Hóptengi</div>
                  <div className="text-3xl font-mono font-bold">{group.formula}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Viðskeyti</div>
                  <div className="text-3xl font-bold text-green-600">{group.suffix}</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl mb-4">
              <div className="text-sm text-gray-500 mb-1">Dæmi:</div>
              <div className="flex items-center justify-center gap-4">
                <span className="text-2xl font-mono">{group.example}</span>
                <span className="text-2xl text-gray-400">→</span>
                <span className="text-2xl font-bold">{group.exampleName}</span>
              </div>
            </div>

            <div className="text-center text-sm">
              {group.description}
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <button
              onClick={handlePrevGroup}
              disabled={currentGroup === 0}
              className={`flex-1 py-3 px-6 rounded-xl font-bold ${
                currentGroup === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-500 hover:bg-gray-600 text-white'
              }`}
            >
              ← Fyrri
            </button>
            <button
              onClick={handleNextGroup}
              className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-xl"
            >
              {currentGroup === functionalGroups.length - 1 ? 'Byrja áskoranir →' : 'Næsta →'}
            </button>
          </div>

          <div className="mt-6 bg-gray-50 p-4 rounded-xl">
            <h3 className="font-semibold text-gray-700 mb-2">📋 Öll hóptengi:</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {functionalGroups.map((fg, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded border ${
                    idx === currentGroup ? fg.color : 'bg-white'
                  }`}
                >
                  <span className="font-bold">{fg.formula}</span>
                  <span className="text-gray-500"> → </span>
                  <span className="text-green-600">{fg.suffix}</span>
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
      case 'identify': return '🔍 Þekkja hóptengi';
      case 'name': return '🏷️ Nefna sameind';
      case 'structure': return '🧪 Finna formúlu';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 p-4 md:p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <button onClick={onBack} className="text-gray-500 hover:text-gray-700">
            ← Til baka
          </button>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              Áskorun {currentChallenge + 1} af {challenges.length}
            </div>
            <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-bold">
              Stig: {score}
            </div>
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-center mb-2 text-purple-600">
          {getTypeLabel()}
        </h1>

        <div className="bg-purple-50 p-6 rounded-xl mb-6 text-center border-2 border-purple-200">
          <div className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
            {challenge.question}
          </div>
          {challenge.formula && (
            <div className="text-3xl font-mono font-bold text-purple-700">
              {challenge.formula}
            </div>
          )}
        </div>

        {!showFeedback ? (
          <div className="grid grid-cols-2 gap-4">
            {challenge.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(option)}
                className="p-4 rounded-xl border-2 border-purple-300 bg-white hover:bg-purple-50 hover:border-purple-400 text-lg font-bold text-gray-800 transition-all"
              >
                {option}
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className={`p-6 rounded-xl text-center ${
              isCorrect ? 'bg-green-100 border-2 border-green-400' : 'bg-red-100 border-2 border-red-400'
            }`}>
              <div className="text-4xl mb-2">{isCorrect ? '✓' : '✗'}</div>
              <div className={`text-xl font-bold ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                {isCorrect ? 'Rétt!' : 'Rangt'}
              </div>
              {!isCorrect && (
                <div className="text-red-700 mt-2">
                  Rétt svar: <strong>{challenge.correctAnswer}</strong>
                </div>
              )}
            </div>

            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
              <div className="font-bold text-blue-800 mb-1">Útskýring:</div>
              <div className="text-blue-700">{challenge.explanation}</div>
            </div>

            <button
              onClick={handleNextChallenge}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-xl"
            >
              {currentChallenge < challenges.length - 1 ? 'Næsta áskorun →' : 'Ljúka stigi →'}
            </button>
          </div>
        )}

        <div className="mt-6 bg-gray-50 p-4 rounded-xl">
          <h3 className="font-semibold text-gray-700 mb-2">📋 Hóptengi og viðskeytir:</h3>
          <div className="grid grid-cols-4 gap-2 text-xs text-center">
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

        <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-purple-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentChallenge + 1) / challenges.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
