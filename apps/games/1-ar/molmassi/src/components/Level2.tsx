import { useState, useEffect } from 'react';
import { PeriodicTable } from './PeriodicTable';

// Fisher-Yates shuffle for reliable randomization
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Atom visual properties for consistency with Level 1
const ATOM_DATA: Record<string, { color: string; size: number; name: string; mass: number; approxMass: number }> = {
  H: { color: '#FFFFFF', size: 20, name: 'Vetni', mass: 1.008, approxMass: 1 },
  C: { color: '#333333', size: 34, name: 'Kolefni', mass: 12.011, approxMass: 12 },
  N: { color: '#3B82F6', size: 32, name: 'Köfnunarefni', mass: 14.007, approxMass: 14 },
  O: { color: '#EF4444', size: 30, name: 'Súrefni', mass: 15.999, approxMass: 16 },
  S: { color: '#EAB308', size: 40, name: 'Brennisteinn', mass: 32.065, approxMass: 32 },
  Cl: { color: '#22C55E', size: 38, name: 'Klór', mass: 35.453, approxMass: 35 },
  Na: { color: '#8B5CF6', size: 44, name: 'Natríum', mass: 22.990, approxMass: 23 },
  Ca: { color: '#F97316', size: 48, name: 'Kalsíum', mass: 40.078, approxMass: 40 },
  Fe: { color: '#78716C', size: 46, name: 'Járn', mass: 55.845, approxMass: 56 },
  K: { color: '#EC4899', size: 52, name: 'Kalíum', mass: 39.098, approxMass: 39 },
  Mg: { color: '#14B8A6', size: 42, name: 'Magnesíum', mass: 24.305, approxMass: 24 },
  P: { color: '#F59E0B', size: 36, name: 'Fosfór', mass: 30.974, approxMass: 31 },
  Al: { color: '#A1A1AA', size: 40, name: 'Ál', mass: 26.982, approxMass: 27 },
  Cu: { color: '#B45309', size: 44, name: 'Kopar', mass: 63.546, approxMass: 64 },
};

// Challenge types for Level 2
type ChallengeType = 'estimate_mass' | 'order_molecules' | 'calculate_simple' | 'find_heaviest_atom';

interface Compound {
  formula: string;
  name: string;
  elements: { symbol: string; count: number }[];
  molarMass: number;
}

interface Challenge {
  type: ChallengeType;
  compound: Compound;
  // For order_molecules
  compounds?: Compound[];
  // For calculate_simple - accepts range
  acceptableRange?: { min: number; max: number };
}

// Compounds for Level 2 (medium complexity)
const LEVEL2_COMPOUNDS: Compound[] = [
  { formula: 'H₂O', name: 'Vatn', elements: [{ symbol: 'H', count: 2 }, { symbol: 'O', count: 1 }], molarMass: 18.015 },
  { formula: 'CO₂', name: 'Koltvísýringur', elements: [{ symbol: 'C', count: 1 }, { symbol: 'O', count: 2 }], molarMass: 44.009 },
  { formula: 'NaCl', name: 'Borðsalt', elements: [{ symbol: 'Na', count: 1 }, { symbol: 'Cl', count: 1 }], molarMass: 58.44 },
  { formula: 'CH₄', name: 'Metan', elements: [{ symbol: 'C', count: 1 }, { symbol: 'H', count: 4 }], molarMass: 16.043 },
  { formula: 'NH₃', name: 'Ammóníak', elements: [{ symbol: 'N', count: 1 }, { symbol: 'H', count: 3 }], molarMass: 17.031 },
  { formula: 'NaOH', name: 'Natrímhýdroxíð', elements: [{ symbol: 'Na', count: 1 }, { symbol: 'O', count: 1 }, { symbol: 'H', count: 1 }], molarMass: 39.997 },
  { formula: 'HCl', name: 'Saltsýra', elements: [{ symbol: 'H', count: 1 }, { symbol: 'Cl', count: 1 }], molarMass: 36.458 },
  { formula: 'CaO', name: 'Kalsíumoxíð', elements: [{ symbol: 'Ca', count: 1 }, { symbol: 'O', count: 1 }], molarMass: 56.077 },
  { formula: 'MgO', name: 'Magnesíumoxíð', elements: [{ symbol: 'Mg', count: 1 }, { symbol: 'O', count: 1 }], molarMass: 40.304 },
  { formula: 'H₂S', name: 'Brennisteinsvetni', elements: [{ symbol: 'H', count: 2 }, { symbol: 'S', count: 1 }], molarMass: 34.081 },
  { formula: 'SO₂', name: 'Brennisteinsdíoxíð', elements: [{ symbol: 'S', count: 1 }, { symbol: 'O', count: 2 }], molarMass: 64.066 },
  { formula: 'NO₂', name: 'Köfnunarefnisdíoxíð', elements: [{ symbol: 'N', count: 1 }, { symbol: 'O', count: 2 }], molarMass: 46.006 },
];

// Calculate approximate molar mass using rounded atomic masses
function calculateApproxMass(elements: { symbol: string; count: number }[]): number {
  return elements.reduce((sum, el) => {
    const atom = ATOM_DATA[el.symbol];
    return sum + (atom ? atom.approxMass * el.count : 0);
  }, 0);
}

// Generate a random challenge
function generateChallenge(challengeNumber: number): Challenge {
  const compound = LEVEL2_COMPOUNDS[Math.floor(Math.random() * LEVEL2_COMPOUNDS.length)];

  // Cycle through challenge types
  const types: ChallengeType[] = ['estimate_mass', 'order_molecules', 'calculate_simple', 'find_heaviest_atom'];
  const type = types[challengeNumber % types.length];

  switch (type) {
    case 'estimate_mass': {
      return {
        type: 'estimate_mass',
        compound,
      };
    }

    case 'order_molecules': {
      // Pick 3 different compounds
      const shuffled = shuffle(LEVEL2_COMPOUNDS);
      const selected = shuffled.slice(0, 3);
      return {
        type: 'order_molecules',
        compound: selected[0],
        compounds: selected,
      };
    }

    case 'calculate_simple': {
      const approxMass = calculateApproxMass(compound.elements);
      return {
        type: 'calculate_simple',
        compound,
        acceptableRange: { min: approxMass - 3, max: approxMass + 3 },
      };
    }

    case 'find_heaviest_atom': {
      // Find a compound with at least 2 different elements
      let comp = compound;
      while (comp.elements.length < 2) {
        comp = LEVEL2_COMPOUNDS[Math.floor(Math.random() * LEVEL2_COMPOUNDS.length)];
      }
      return {
        type: 'find_heaviest_atom',
        compound: comp,
      };
    }

    default:
      return { type: 'estimate_mass', compound };
  }
}

// Atom circle component
function AtomCircle({ symbol, showMass = false }: { symbol: string; showMass?: boolean }) {
  const atom = ATOM_DATA[symbol] || { color: '#888', size: 30, name: symbol, mass: 0, approxMass: 0 };

  return (
    <div className="inline-flex flex-col items-center">
      <div
        className="atom-circle rounded-full border-2 flex items-center justify-center font-bold text-xs"
        style={{
          width: atom.size,
          height: atom.size,
          backgroundColor: atom.color,
          borderColor: atom.color === '#FFFFFF' ? '#CBD5E1' : 'transparent',
          color: atom.color === '#FFFFFF' || atom.color === '#EAB308' ? '#1F2937' : '#FFFFFF',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        {symbol}
      </div>
      {showMass && (
        <span className="text-xs text-gray-600 mt-1">≈{atom.approxMass}</span>
      )}
    </div>
  );
}

// Molecule with calculation breakdown
function MoleculeWithBreakdown({ elements }: { elements: { symbol: string; count: number }[] }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
        {elements.map((el, i) => (
          <div key={i} className="flex items-center gap-1">
            {Array.from({ length: el.count }).map((_, j) => (
              <AtomCircle key={j} symbol={el.symbol} showMass={true} />
            ))}
          </div>
        ))}
      </div>

      <div className="border-t pt-3 mt-3">
        <div className="text-sm text-gray-600 mb-2 text-center">Útreikningur:</div>
        <div className="space-y-1">
          {elements.map((el, i) => {
            const atom = ATOM_DATA[el.symbol];
            const subtotal = atom ? atom.approxMass * el.count : 0;
            return (
              <div key={i} className="flex items-center justify-between text-sm px-2">
                <span>{el.symbol} × {el.count} × ≈{atom?.approxMass}</span>
                <span className="font-semibold">= {subtotal}</span>
              </div>
            );
          })}
          <div className="flex items-center justify-between font-bold text-primary border-t pt-2 mt-2 px-2">
            <span>Samtals:</span>
            <span>≈ {calculateApproxMass(elements)} g/mol</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface Level2Props {
  onBack: () => void;
  onComplete: (score: number, maxScore: number, hintsUsed: number) => void;
  onCorrectAnswer?: () => void;
  onIncorrectAnswer?: () => void;
}

// Generate reasoning options for estimate_mass challenges
function generateReasoningOptions(compound: Compound): { text: string; isCorrect: boolean }[] {
  // Find the heaviest contributing element
  let maxContribution = 0;
  let heaviestElement = '';
  for (const el of compound.elements) {
    const atom = ATOM_DATA[el.symbol];
    const contribution = atom ? atom.approxMass * el.count : 0;
    if (contribution > maxContribution) {
      maxContribution = contribution;
      heaviestElement = el.symbol;
    }
  }

  const atomName = ATOM_DATA[heaviestElement]?.name || heaviestElement;
  const correctReason = `${atomName} (${heaviestElement}) leggur mest til massans`;

  const distractors = [
    'Ég giskaði bara',
    'Flestar sameindir eru léttar',
    'Allar frumeindir eru jafnþungar'
  ];

  const options = [
    { text: correctReason, isCorrect: true },
    ...distractors.map(text => ({ text, isCorrect: false }))
  ];

  // Shuffle options
  return shuffle(options);
}

// Main Level 2 Component
export function Level2({ onBack, onComplete, onCorrectAnswer, onIncorrectAnswer }: Level2Props) {
  const [challengeNumber, setChallengeNumber] = useState(0);
  const [challenge, setChallenge] = useState<Challenge>(() => generateChallenge(0));
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [totalHintsUsed, setTotalHintsUsed] = useState(0);

  // For estimate_mass reasoning phase
  const [showReasoningPrompt, setShowReasoningPrompt] = useState(false);
  const [selectedReasoning, setSelectedReasoning] = useState<string | null>(null);
  const [reasoningOptions, setReasoningOptions] = useState<{ text: string; isCorrect: boolean }[]>([]);
  const [reasoningFeedback, setReasoningFeedback] = useState<string | null>(null);

  // For order_molecules
  const [orderedCompounds, setOrderedCompounds] = useState<Compound[]>([]);

  // Periodic table modal
  const [showPeriodicTable, setShowPeriodicTable] = useState(false);

  const totalChallenges = 8;
  const isComplete = challengeNumber >= totalChallenges;

  // Reset state when challenge changes
  useEffect(() => {
    setSelectedAnswer(null);
    setShowFeedback(false);
    setShowHint(false);
    setUserInput('');
    // Reset reasoning state
    setShowReasoningPrompt(false);
    setSelectedReasoning(null);
    setReasoningOptions([]);
    setReasoningFeedback(null);
    if (challenge.compounds) {
      setOrderedCompounds([...challenge.compounds]);
    }
  }, [challenge]);

  const checkAnswer = (answer: number | string | Compound[]) => {
    let correct = false;

    switch (challenge.type) {
      case 'estimate_mass': {
        const approxMass = calculateApproxMass(challenge.compound.elements);
        const options = generateEstimateOptions(approxMass);
        correct = options[answer as number] === approxMass;
        setSelectedAnswer(answer as number);
        setIsCorrect(correct);

        // For estimate_mass, show reasoning prompt instead of immediate feedback
        if (correct) {
          setReasoningOptions(generateReasoningOptions(challenge.compound));
          setShowReasoningPrompt(true);
          return; // Don't show feedback yet
        }
        // If wrong, show feedback immediately
        break;
      }

      case 'order_molecules': {
        const ordered = answer as Compound[];
        // Check if ordered from lightest to heaviest
        let isOrdered = true;
        for (let i = 1; i < ordered.length; i++) {
          if (ordered[i].molarMass < ordered[i-1].molarMass) {
            isOrdered = false;
            break;
          }
        }
        correct = isOrdered;
        break;
      }

      case 'calculate_simple': {
        const userValue = parseFloat(userInput);
        if (!isNaN(userValue) && challenge.acceptableRange) {
          correct = userValue >= challenge.acceptableRange.min && userValue <= challenge.acceptableRange.max;
        }
        setSelectedAnswer(userValue);
        break;
      }

      case 'find_heaviest_atom': {
        const heaviest = challenge.compound.elements.reduce((max, el) => {
          const atomMass = ATOM_DATA[el.symbol]?.approxMass || 0;
          const maxMass = ATOM_DATA[max.symbol]?.approxMass || 0;
          return atomMass > maxMass ? el : max;
        });
        correct = answer === heaviest.symbol;
        setSelectedAnswer(answer as string);
        break;
      }
    }

    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      setScore(prev => prev + 15);
      onCorrectAnswer?.();
    } else {
      onIncorrectAnswer?.();
    }
  };

  // Handle reasoning submission for estimate_mass
  const handleReasoningSubmit = () => {
    if (!selectedReasoning) return;

    const selected = reasoningOptions.find(opt => opt.text === selectedReasoning);
    const reasoningCorrect = selected?.isCorrect || false;

    if (reasoningCorrect) {
      setReasoningFeedback('Rétt! Þú skilur hvaða frumefni leggur mest til massans.');
      setScore(prev => prev + 15);
      onCorrectAnswer?.();
    } else {
      setReasoningFeedback('Ekki alveg. Hugsaðu um hvaða frumefni er þyngst og hversu mörg eru af því.');
    }

    // Show full feedback after reasoning
    setTimeout(() => {
      setShowReasoningPrompt(false);
      setShowFeedback(true);
    }, 1500);
  };

  const nextChallenge = () => {
    const next = challengeNumber + 1;
    setChallengeNumber(next);
    if (next < totalChallenges) {
      setChallenge(generateChallenge(next));
    }
  };

  // Generate options for estimate_mass
  function generateEstimateOptions(correctValue: number): number[] {
    const options = [correctValue];
    // Add some wrong options
    const offsets = [-15, -8, 8, 15, -20, 20];
    for (const offset of offsets) {
      const wrong = correctValue + offset;
      if (wrong > 0 && !options.includes(wrong)) {
        options.push(wrong);
      }
      if (options.length >= 4) break;
    }
    // Shuffle using Fisher-Yates
    return shuffle(options);
  }

  // Game complete screen
  if (isComplete) {
    const accuracy = Math.round((score / (totalChallenges * 15)) * 100);

    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center animate-fade-in-up">
          <div className="text-6xl mb-4 animate-bounce-in">🎓</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Stig 2 Lokið!</h2>
          <p className="text-gray-600 mb-6">Þú getur nú áætlað mólmassa!</p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-purple-50 rounded-xl p-4">
              <div className="text-3xl font-bold text-purple-600">{score}</div>
              <div className="text-sm text-gray-600">Stig</div>
            </div>
            <div className="bg-green-50 rounded-xl p-4">
              <div className="text-3xl font-bold text-green-600">{accuracy}%</div>
              <div className="text-sm text-gray-600">Nákvæmni</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 mb-6 text-left">
            <h3 className="font-bold text-purple-800 mb-3 flex items-center gap-2">
              <span className="text-lg">📚</span> Hvað lærðir þú?
            </h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Áætla mólmassa með námundun</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Nota heil tölu nálganir (H≈1, C≈12, O≈16)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Bera saman massa mismunandi sameinda</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Finna þyngstu frumeindir í sameind</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => onComplete(score, totalChallenges * 15, totalHintsUsed)}
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-xl transition-colors btn-press"
            >
              Halda áfram í Stig 3 →
            </button>
            <button
              onClick={() => {
                setChallengeNumber(0);
                setScore(0);
                setChallenge(generateChallenge(0));
              }}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-xl transition-colors"
            >
              Spila Aftur
            </button>
            <button
              onClick={onBack}
              className="w-full text-gray-500 hover:text-gray-700 font-semibold py-2"
            >
              Til baka í valmynd
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Challenge-specific content
  const renderChallenge = () => {
    switch (challenge.type) {
      case 'estimate_mass': {
        const approxMass = calculateApproxMass(challenge.compound.elements);
        const options = generateEstimateOptions(approxMass);

        return (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-lg text-gray-700 mb-2">
                Áætlaðu mólmassa <span className="font-bold">{challenge.compound.name}</span>
              </p>
              <div className="text-4xl font-bold text-gray-800 mb-4">
                {challenge.compound.formula}
              </div>
            </div>

            <MoleculeWithBreakdown elements={challenge.compound.elements} />

            {/* Answer options */}
            {!showReasoningPrompt && (
              <div className="grid grid-cols-2 gap-3">
                {options.map((opt, index) => (
                  <button
                    key={index}
                    onClick={() => !showFeedback && !showReasoningPrompt && checkAnswer(index)}
                    disabled={showFeedback || showReasoningPrompt}
                    className={`py-4 px-6 rounded-xl font-bold text-lg transition-all ${
                      (showFeedback || showReasoningPrompt) && options[selectedAnswer as number] === opt
                        ? isCorrect
                          ? 'bg-green-500 text-white'
                          : 'bg-red-500 text-white'
                        : showFeedback && opt === approxMass
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                    }`}
                  >
                    ≈ {opt} g/mol
                  </button>
                ))}
              </div>
            )}

            {/* Reasoning phase - only shown for correct answers */}
            {showReasoningPrompt && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 space-y-4">
                <div className="text-center">
                  <div className="text-2xl mb-2">🧠</div>
                  <h3 className="font-bold text-blue-800">Rétt svar! En af hverju?</h3>
                  <p className="text-sm text-blue-600 mt-1">Veldu bestu skýringuna</p>
                </div>

                <div className="space-y-2">
                  {reasoningOptions.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedReasoning(option.text)}
                      className={`w-full p-3 rounded-lg text-left transition-all border-2 ${
                        selectedReasoning === option.text
                          ? 'border-blue-500 bg-blue-100 text-blue-800'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
                      }`}
                    >
                      {option.text}
                    </button>
                  ))}
                </div>

                {reasoningFeedback && (
                  <div className={`p-3 rounded-lg text-center ${
                    reasoningFeedback.includes('Rétt') ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {reasoningFeedback}
                  </div>
                )}

                {!reasoningFeedback && (
                  <button
                    onClick={handleReasoningSubmit}
                    disabled={!selectedReasoning}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold py-3 px-6 rounded-xl transition-colors"
                  >
                    Staðfesta skýringu
                  </button>
                )}
              </div>
            )}
          </div>
        );
      }

      case 'order_molecules': {
        return (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-lg text-gray-700 mb-4">
                Raðaðu sameindunum frá <span className="font-bold">léttust</span> til <span className="font-bold">þyngst</span>
              </p>
            </div>

            <div className="space-y-3">
              {orderedCompounds.map((comp, index) => (
                <div
                  key={comp.formula}
                  className={`bg-white border-2 rounded-xl p-4 flex items-center justify-between ${
                    showFeedback
                      ? [...orderedCompounds].sort((a, b) => a.molarMass - b.molarMass)[index].formula === comp.formula
                        ? 'border-green-500 bg-green-50'
                        : 'border-red-500 bg-red-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-gray-400">{index + 1}.</span>
                    <div>
                      <div className="font-bold text-gray-800">{comp.formula}</div>
                      <div className="text-sm text-gray-600">{comp.name}</div>
                    </div>
                  </div>
                  {!showFeedback && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          if (index > 0) {
                            const newOrder = [...orderedCompounds];
                            [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
                            setOrderedCompounds(newOrder);
                          }
                        }}
                        disabled={index === 0}
                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-30 flex items-center justify-center"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => {
                          if (index < orderedCompounds.length - 1) {
                            const newOrder = [...orderedCompounds];
                            [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
                            setOrderedCompounds(newOrder);
                          }
                        }}
                        disabled={index === orderedCompounds.length - 1}
                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-30 flex items-center justify-center"
                      >
                        ↓
                      </button>
                    </div>
                  )}
                  {showFeedback && (
                    <span className="text-sm text-gray-500">≈ {calculateApproxMass(comp.elements)} g/mol</span>
                  )}
                </div>
              ))}
            </div>

            {!showFeedback && (
              <button
                onClick={() => checkAnswer(orderedCompounds)}
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-xl transition-colors"
              >
                Athuga röðun
              </button>
            )}
          </div>
        );
      }

      case 'calculate_simple': {
        return (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-lg text-gray-700 mb-2">
                Reiknaðu áætlaðan mólmassa <span className="font-bold">{challenge.compound.name}</span>
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Notaðu heiltölur: H≈1, C≈12, N≈14, O≈16, S≈32, Cl≈35, Na≈23
              </p>
              <div className="text-4xl font-bold text-gray-800 mb-4">
                {challenge.compound.formula}
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex flex-wrap items-center justify-center gap-3">
                {challenge.compound.elements.map((el, i) => (
                  <div key={i} className="flex items-center gap-1">
                    {Array.from({ length: el.count }).map((_, j) => (
                      <AtomCircle key={j} symbol={el.symbol} showMass={true} />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <input
                type="number"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                disabled={showFeedback}
                placeholder="Sláðu inn áætlaðan mólmassa..."
                className="flex-1 px-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary"
              />
              {!showFeedback && (
                <button
                  onClick={() => checkAnswer(parseFloat(userInput))}
                  disabled={!userInput}
                  className="bg-primary hover:bg-primary-dark disabled:bg-gray-300 text-white font-bold px-6 py-3 rounded-xl transition-colors"
                >
                  Athuga
                </button>
              )}
            </div>

            {showFeedback && (
              <div className={`p-4 rounded-xl ${isCorrect ? 'bg-green-100' : 'bg-yellow-100'}`}>
                <p className={`font-bold ${isCorrect ? 'text-green-800' : 'text-yellow-800'}`}>
                  {isCorrect ? '✓ Rétt!' : 'Nálægt!'}
                </p>
                <p className="text-gray-700 mt-1">
                  Áætlað: ≈ {calculateApproxMass(challenge.compound.elements)} g/mol
                </p>
                <p className="text-gray-500 text-sm">
                  Nákvæmt: {challenge.compound.molarMass.toFixed(3)} g/mol
                </p>
              </div>
            )}

            {showHint && !showFeedback && (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                <MoleculeWithBreakdown elements={challenge.compound.elements} />
              </div>
            )}
          </div>
        );
      }

      case 'find_heaviest_atom': {
        const uniqueElements = [...new Set(challenge.compound.elements.map(e => e.symbol))];
        const heaviest = challenge.compound.elements.reduce((max, el) => {
          const atomMass = ATOM_DATA[el.symbol]?.approxMass || 0;
          const maxMass = ATOM_DATA[max.symbol]?.approxMass || 0;
          return atomMass > maxMass ? el : max;
        });

        return (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-lg text-gray-700 mb-2">
                Hvaða frumefni er <span className="font-bold">þyngst</span> í þessari sameind?
              </p>
              <div className="text-4xl font-bold text-gray-800 mb-4">
                {challenge.compound.formula}
              </div>
              <div className="text-gray-600">{challenge.compound.name}</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {uniqueElements.map(symbol => {
                const atom = ATOM_DATA[symbol];
                return (
                  <button
                    key={symbol}
                    onClick={() => !showFeedback && checkAnswer(symbol)}
                    disabled={showFeedback}
                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                      showFeedback && selectedAnswer === symbol
                        ? isCorrect
                          ? 'border-green-500 bg-green-50'
                          : 'border-red-500 bg-red-50'
                        : showFeedback && symbol === heaviest.symbol
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-primary hover:bg-orange-50'
                    }`}
                  >
                    <AtomCircle symbol={symbol} />
                    <div className="text-center">
                      <div className="font-bold text-gray-800">{atom?.name}</div>
                      {showFeedback && (
                        <div className="text-sm text-gray-600">≈ {atom?.approxMass} g/mol</div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      }
    }
  };

  const getChallengeTitle = () => {
    switch (challenge.type) {
      case 'estimate_mass': return 'Áætla mólmassa';
      case 'order_molecules': return 'Raða eftir massa';
      case 'calculate_simple': return 'Reikna með námundun';
      case 'find_heaviest_atom': return 'Finna þyngstu frumeind';
      default: return 'Áskorun';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-800">Mólmassi - Stig 2</h1>
              <p className="text-sm text-gray-600">Áætla og reikna með námundun</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{score}</div>
              <div className="text-xs text-gray-600">Stig</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Áskorun {challengeNumber + 1}/{totalChallenges}</span>
              <span>{getChallengeTitle()}</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 progress-fill"
                style={{ width: `${((challengeNumber + 1) / totalChallenges) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Challenge Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-4 card-enter" key={challengeNumber}>
          {renderChallenge()}
        </div>

        {/* Feedback */}
        {showFeedback && (
          <div className={`rounded-xl p-4 mb-4 animate-fade-in-up ${isCorrect ? 'bg-green-100 border-2 border-green-500' : 'bg-yellow-100 border-2 border-yellow-500'}`}>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{isCorrect ? '🎉' : '💡'}</span>
              <p className={`text-lg font-bold ${isCorrect ? 'text-green-800' : 'text-yellow-800'}`}>
                {isCorrect ? 'Rétt!' : 'Næstum!'}
              </p>
            </div>
            {isCorrect && (
              <p className="text-green-700 mt-1 text-sm">+15 stig!</p>
            )}

            <button
              onClick={nextChallenge}
              className="mt-3 w-full bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg transition-colors btn-press"
            >
              {challengeNumber + 1 < totalChallenges ? 'Næsta áskorun →' : 'Sjá niðurstöður →'}
            </button>
          </div>
        )}

        {/* Hint button */}
        {!showFeedback && !showHint && challenge.type === 'calculate_simple' && (
          <button
            onClick={() => {
              setShowHint(true);
              setTotalHintsUsed(prev => prev + 1);
            }}
            className="w-full bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-semibold py-3 px-4 rounded-xl transition-colors"
          >
            💡 Sýna útreikning
          </button>
        )}

        {/* Reference card with periodic table button */}
        <div className="mt-6 bg-purple-50 rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-purple-800">Nálgunartöflur:</h3>
            <button
              onClick={() => setShowPeriodicTable(true)}
              className="bg-purple-500 hover:bg-purple-600 text-white text-xs font-semibold py-1 px-3 rounded-lg transition-colors"
            >
              📊 Opna lotukerfið
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2 text-xs text-center">
            {['H', 'C', 'N', 'O', 'S', 'Cl', 'Na', 'Ca'].map(symbol => (
              <div key={symbol} className="bg-white rounded p-1">
                <div className="font-bold">{symbol}</div>
                <div className="text-gray-600">≈{ATOM_DATA[symbol]?.approxMass}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Periodic Table Modal */}
        {showPeriodicTable && (
          <PeriodicTable
            onClose={() => setShowPeriodicTable(false)}
            showApproximate={true}
          />
        )}

        {/* Back button */}
        <button
          onClick={onBack}
          className="mt-4 w-full text-gray-500 hover:text-gray-700 font-semibold py-2"
        >
          ← Til baka í valmynd
        </button>
      </div>
    </div>
  );
}

export default Level2;
