import { useState } from 'react';
import { OxidationStateDisplay } from './OxidationStateDisplay';
import { HalfReactionBalancer } from './HalfReactionBalancer';
import { ElectrochemicalCell } from './ElectrochemicalCell';

interface Level2Props {
  onComplete: (score: number, maxScore: number, hintsUsed: number) => void;
  onBack: () => void;
  onCorrectAnswer?: () => void;
  onIncorrectAnswer?: () => void;
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
    equation: "2Na + Cl2 → 2NaCl",
    equationDisplay: "2Na + Cl₂ → 2NaCl",
    species: [
      { name: "Na", before: 0, after: 1 },
      { name: "Cl", before: 0, after: -1 }
    ],
    oxidized: "Na",
    reduced: "Cl",
    oxidizingAgent: "Cl₂",
    reducingAgent: "Na",
    explanation: "Na tapar rafeindum (0→+1) og oxast. Cl öðlast rafeindir (0→-1) og afoxast."
  },
  {
    id: 2,
    equation: "Fe + CuSO4 → FeSO4 + Cu",
    equationDisplay: "Fe + CuSO₄ → FeSO₄ + Cu",
    species: [
      { name: "Fe", before: 0, after: 2 },
      { name: "Cu", before: 2, after: 0 }
    ],
    oxidized: "Fe",
    reduced: "Cu",
    oxidizingAgent: "Cu²⁺",
    reducingAgent: "Fe",
    explanation: "Fe tapar rafeindum (0→+2) og oxast. Cu²⁺ öðlast rafeindir (+2→0) og afoxast."
  },
  {
    id: 3,
    equation: "Zn + 2HCl → ZnCl2 + H2",
    equationDisplay: "Zn + 2HCl → ZnCl₂ + H₂",
    species: [
      { name: "Zn", before: 0, after: 2 },
      { name: "H", before: 1, after: 0 }
    ],
    oxidized: "Zn",
    reduced: "H",
    oxidizingAgent: "H⁺",
    reducingAgent: "Zn",
    explanation: "Zn tapar rafeindum (0→+2) og oxast. H⁺ öðlast rafeindir (+1→0) og afoxast."
  },
  {
    id: 4,
    equation: "2Mg + O2 → 2MgO",
    equationDisplay: "2Mg + O₂ → 2MgO",
    species: [
      { name: "Mg", before: 0, after: 2 },
      { name: "O", before: 0, after: -2 }
    ],
    oxidized: "Mg",
    reduced: "O",
    oxidizingAgent: "O₂",
    reducingAgent: "Mg",
    explanation: "Mg tapar rafeindum (0→+2) og oxast. O öðlast rafeindir (0→-2) og afoxast."
  },
  {
    id: 5,
    equation: "Cu + 2AgNO3 → Cu(NO3)2 + 2Ag",
    equationDisplay: "Cu + 2AgNO₃ → Cu(NO₃)₂ + 2Ag",
    species: [
      { name: "Cu", before: 0, after: 2 },
      { name: "Ag", before: 1, after: 0 }
    ],
    oxidized: "Cu",
    reduced: "Ag",
    oxidizingAgent: "Ag⁺",
    reducingAgent: "Cu",
    explanation: "Cu tapar rafeindum (0→+2) og oxast. Ag⁺ öðlast rafeindir (+1→0) og afoxast."
  },
  {
    id: 6,
    equation: "2Fe2O3 + 3C → 4Fe + 3CO2",
    equationDisplay: "2Fe₂O₃ + 3C → 4Fe + 3CO₂",
    species: [
      { name: "Fe", before: 3, after: 0 },
      { name: "C", before: 0, after: 4 }
    ],
    oxidized: "C",
    reduced: "Fe",
    oxidizingAgent: "Fe₂O₃",
    reducingAgent: "C",
    explanation: "C tapar rafeindum (0→+4) og oxast. Fe³⁺ öðlast rafeindir (+3→0) og afoxast."
  },
  {
    id: 7,
    equation: "Cl2 + 2KBr → 2KCl + Br2",
    equationDisplay: "Cl₂ + 2KBr → 2KCl + Br₂",
    species: [
      { name: "Cl", before: 0, after: -1 },
      { name: "Br", before: -1, after: 0 }
    ],
    oxidized: "Br",
    reduced: "Cl",
    oxidizingAgent: "Cl₂",
    reducingAgent: "Br⁻",
    explanation: "Br⁻ tapar rafeindum (-1→0) og oxast. Cl öðlast rafeindir (0→-1) og afoxast."
  },
  {
    id: 8,
    equation: "2Al + 3CuO → Al2O3 + 3Cu",
    equationDisplay: "2Al + 3CuO → Al₂O₃ + 3Cu",
    species: [
      { name: "Al", before: 0, after: 3 },
      { name: "Cu", before: 2, after: 0 }
    ],
    oxidized: "Al",
    reduced: "Cu",
    oxidizingAgent: "CuO",
    reducingAgent: "Al",
    explanation: "Al tapar rafeindum (0→+3) og oxast. Cu²⁺ öðlast rafeindir (+2→0) og afoxast."
  }
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
  { type: 'oxidizing-agent', label: 'Hvað er oxunarefnið?', hint: 'Efnið sem veldur oxun (tekur við rafeindum)' },
  { type: 'reducing-agent', label: 'Hvað er afoxunarefnið?', hint: 'Efnið sem veldur afoxun (gefur rafeindir)' }
];

export function Level2({ onComplete, onBack, onCorrectAnswer, onIncorrectAnswer }: Level2Props) {
  const [currentReaction, setCurrentReaction] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [totalHintsUsed, setTotalHintsUsed] = useState(0);

  // Maximum possible score: 8 reactions * 4 questions * 10 points = 320
  const maxScore = reactions.length * questionTypes.length * 10;

  const reaction = reactions[currentReaction];
  const question = questionTypes[currentQuestion];

  const getCorrectAnswer = (): string => {
    switch (question.type) {
      case 'oxidized': return reaction.oxidized;
      case 'reduced': return reaction.reduced;
      case 'oxidizing-agent': return reaction.oxidizingAgent;
      case 'reducing-agent': return reaction.reducingAgent;
    }
  };

  const getOptions = (): string[] => {
    const baseOptions = reaction.species.map(s => s.name);
    if (question.type === 'oxidizing-agent' || question.type === 'reducing-agent') {
      return [reaction.oxidizingAgent, reaction.reducingAgent].sort();
    }
    return baseOptions;
  };

  const handleAnswer = (answer: string) => {
    const correct = answer === getCorrectAnswer();
    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      setScore(prev => prev + 10);
      onCorrectAnswer?.();
    } else {
      onIncorrectAnswer?.();
    }
  };

  const handleNext = () => {
    if (currentQuestion < questionTypes.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else if (currentReaction < reactions.length - 1) {
      setCurrentReaction(prev => prev + 1);
      setCurrentQuestion(0);
      setShowExplanation(false);
    } else {
      onComplete(score, maxScore, totalHintsUsed);
      return;
    }
    setShowFeedback(false);
    setShowHint(false);
  };

  const totalQuestions = reactions.length * questionTypes.length;
  const currentProgress = currentReaction * questionTypes.length + currentQuestion + 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 p-4 md:p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <button onClick={onBack} className="text-gray-500 hover:text-gray-700">
            ← Til baka
          </button>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              {currentProgress} af {totalQuestions}
            </div>
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-bold">
              Stig: {score}
            </div>
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-center mb-2 text-green-600">
          🔄 Greina redox-hvörf
        </h1>

        <div className="bg-gray-50 p-6 rounded-xl mb-6">
          <div className="text-center mb-4">
            <div className="text-sm text-gray-500 mb-2">Efnahvarf {currentReaction + 1}:</div>
            <div className="text-2xl md:text-3xl font-mono font-bold text-gray-800">
              {reaction.equationDisplay}
            </div>
          </div>

          {/* Enhanced Oxidation State Display with Electron Transfer Animation */}
          <OxidationStateDisplay
            changes={reaction.species.map(s => ({
              element: s.name,
              before: s.before,
              after: s.after
            }))}
            animate={!showFeedback}
            showElectrons={true}
            size="medium"
          />
        </div>

        <div className="bg-green-50 p-4 rounded-xl mb-6 border-2 border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">❓</span>
            <span className="text-xl font-bold text-green-800">{question.label}</span>
          </div>
          {showHint && (
            <div className="text-green-600 text-sm mt-2 flex items-center gap-2">
              <span>💡</span>
              <span>{question.hint}</span>
            </div>
          )}
        </div>

        {!showFeedback ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {getOptions().map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(option)}
                  className="p-4 rounded-xl border-2 border-green-300 bg-white hover:bg-green-50 hover:border-green-400 text-lg font-bold text-gray-800 transition-all"
                >
                  {option}
                </button>
              ))}
            </div>
            {!showHint && (
              <button
                onClick={() => {
                  setShowHint(true);
                  setTotalHintsUsed(prev => prev + 1);
                }}
                className="w-full bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-bold py-2 px-4 rounded-xl text-sm"
              >
                💡 Sýna vísbendingu
              </button>
            )}
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
                  Rétt svar: <strong>{getCorrectAnswer()}</strong>
                </div>
              )}
            </div>

            {currentQuestion === questionTypes.length - 1 && (
              <button
                onClick={() => setShowExplanation(prev => !prev)}
                className="w-full bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold py-2 px-4 rounded-xl"
              >
                {showExplanation ? '🔼 Fela útskýringu' : '🔽 Sýna útskýringu'}
              </button>
            )}

            {showExplanation && (
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <div className="text-blue-800">{reaction.explanation}</div>
              </div>
            )}

            <button
              onClick={handleNext}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl"
            >
              {currentQuestion < questionTypes.length - 1
                ? 'Næsta spurning →'
                : currentReaction < reactions.length - 1
                  ? 'Næsta hvarf →'
                  : 'Ljúka stigi →'}
            </button>
          </div>
        )}

        <div className="mt-6 bg-gray-50 p-4 rounded-xl">
          <h3 className="font-semibold text-gray-700 mb-2">📚 Lykilhugtök:</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="font-bold text-blue-800">Oxun</div>
              <div className="text-blue-600">Tapa e⁻ • ox# ↑</div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg">
              <div className="font-bold text-red-800">Afoxun</div>
              <div className="text-red-600">Öðlast e⁻ • ox# ↓</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="font-bold text-purple-800">Oxunarefni</div>
              <div className="text-purple-600">Veldur oxun • Afoxast sjálft</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="font-bold text-green-800">Afoxunarefni</div>
              <div className="text-green-600">Veldur afoxun • Oxast sjálft</div>
            </div>
          </div>
        </div>

        <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentProgress / totalQuestions) * 100}%` }}
          />
        </div>

        {/* Half-Reaction Balancer Tool */}
        <div className="mt-6">
          <HalfReactionBalancer
            interactive={true}
            compact={false}
          />
        </div>

        {/* Electrochemical Cell Simulation */}
        <div className="mt-6">
          <ElectrochemicalCell
            compact={false}
            interactive={true}
          />
        </div>
      </div>
    </div>
  );
}
