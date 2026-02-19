import { useState, useEffect, useMemo } from 'react';
import { FeedbackPanel } from '@shared/components';
import type { TieredHints } from '@shared/types';
import { shuffleArray } from '@shared/utils';
import { StatePathComparison } from './StatePathComparison';

// Misconceptions for Hess's Law concepts
const MISCONCEPTIONS: Record<number, string> = {
  1: 'Neikvætt ΔH þýðir að orka fer ÚT úr kerfinu (exothermic), ekki inn. Jákvætt þýðir að orka fer inn (endothermic).',
  2: 'Þegar þú snýrð við hvörfum, snýrðu við FORMERKINU á ΔH. Ef ΔH = -X, þá verður öfugt hvarf ΔH = +X.',
  3: 'Við margföldun breytist formerkið EKKI. Ef ΔH = -X, þá er 2×ΔH = -2X (enn neikvætt).',
  4: 'Mundu röðina: snúðu fyrst við (breytir formerki), SÍÐAN margfaldaðu.',
  5: 'Til að nota Hess, þarftu að stilla jöfnur þannig að hvarfefni og afurðir strikist út rétt.',
  6: 'Orkubraut: leiðin skiptir ekki máli, aðeins upphafs- og lokastaða. Heildar ΔH er summa allra skrefa.',
};

// Related concepts for each challenge
const RELATED_CONCEPTS: Record<number, string[]> = {
  1: ['Exothermic', 'Endothermic', 'Skammtavarmi'],
  2: ['Öfug hvörf', 'Formerkisbreyting', 'Hverfanleiki'],
  3: ['Stökefnafræði', 'Mólhlutföll', 'Hlutfallsleg orka'],
  4: ['Samsett aðgerðir', 'Sundrun vs myndun', 'Margföldun'],
  5: ['Lögmál Hess', 'Orkuvarðveisla', 'Hverfanleiki'],
  6: ['Orkubraut', 'Ferlisstuðull', 'Heildar ΔH'],
};

/**
 * Multiplies all coefficients in a chemical equation string
 * E.g., "CH₄(g) + 2O₂(g)" with multiplier 2 → "2CH₄(g) + 4O₂(g)"
 */
function multiplyEquationCoefficients(equation: string, multiplier: number): string {
  if (multiplier === 1) return equation;

  // Split by " + " to get individual terms
  const terms = equation.split(' + ');

  const multipliedTerms = terms.map(term => {
    term = term.trim();

    // Match coefficient at start: number, fraction (½), or nothing (implicit 1)
    // Regex: optional number or fraction at the start, followed by the formula
    const fractionMatch = term.match(/^(½|⅓|¼|⅔|¾)/);
    const numberMatch = term.match(/^(\d+)/);

    if (fractionMatch) {
      // Handle fraction coefficients
      const fractionMap: Record<string, number> = {
        '½': 0.5, '⅓': 1/3, '¼': 0.25, '⅔': 2/3, '¾': 0.75
      };
      const fractionValue = fractionMap[fractionMatch[1]] || 0.5;
      const newCoeff = fractionValue * multiplier;
      const formula = term.slice(fractionMatch[1].length);

      // Format the new coefficient nicely
      if (Number.isInteger(newCoeff)) {
        return newCoeff === 1 ? formula : `${newCoeff}${formula}`;
      } else {
        // Convert back to fraction if possible
        const fractionStr = newCoeff === 0.5 ? '½' :
                           newCoeff === 1.5 ? '³⁄₂' :
                           newCoeff === 2.5 ? '⁵⁄₂' :
                           `${newCoeff}`;
        return `${fractionStr}${formula}`;
      }
    } else if (numberMatch) {
      // Handle numeric coefficients
      const oldCoeff = parseInt(numberMatch[1], 10);
      const newCoeff = oldCoeff * multiplier;
      const formula = term.slice(numberMatch[1].length);
      return `${newCoeff}${formula}`;
    } else {
      // Implicit coefficient of 1
      return `${multiplier}${term}`;
    }
  });

  return multipliedTerms.join(' + ');
}

interface Equation {
  id: string;
  reactants: string;
  products: string;
  deltaH: number;
  isReversed: boolean;
  multiplier: number;
}

interface Challenge {
  id: number;
  title: string;
  description: string;
  concept: string;
  equation: Equation;
  question: string;
  options: { text: string; correct: boolean; explanation: string }[];
  hints: TieredHints;
}

const CHALLENGES: Challenge[] = [
  {
    id: 1,
    title: 'Hvað er ΔH?',
    description: 'Skammtavarmi (ΔH) segir okkur hvort hvörf gefi frá sér orku eða taki til sín orku.',
    concept: 'Neikvætt ΔH = exothermic (gefur frá sér varma). Jákvætt ΔH = endothermic (tekur til sín varma).',
    equation: {
      id: 'eq1',
      reactants: 'CH₄(g) + 2O₂(g)',
      products: 'CO₂(g) + 2H₂O(l)',
      deltaH: -890,
      isReversed: false,
      multiplier: 1
    },
    question: 'Brennsla metans gefur ΔH = -890 kJ/mol. Er þetta hvarf exothermic eða endothermic?',
    options: [
      { text: 'Exothermic (gefur frá sér varma)', correct: true, explanation: 'Rétt! Neikvætt ΔH þýðir að kerfið gefur frá sér orku til umhverfisins.' },
      { text: 'Endothermic (tekur til sín varma)', correct: false, explanation: 'Rangt. Neikvætt ΔH þýðir að orka fer ÚT úr kerfinu, ekki inn.' }
    ],
    hints: {
      topic: 'Þetta snýst um formerki ΔH og hvað það þýðir.',
      strategy: 'Hugsaðu um hvort orka fer inn í kerfið eða út úr því.',
      method: 'Neikvætt ΔH = orka fer út (exothermic). Jákvætt ΔH = orka fer inn (endothermic).',
      solution: 'ΔH = -890 kJ er neikvætt, svo orka fer ÚT úr kerfinu. Þetta er exothermic hvarf.'
    }
  },
  {
    id: 2,
    title: 'Snúa við hvörfum',
    description: 'Þegar þú snýrð við efnahvörfum (hvarfefni ↔ afurðir), þá snýst formerkið á ΔH.',
    concept: 'Ef A → B hefur ΔH = -100 kJ, þá hefur B → A ΔH = +100 kJ',
    equation: {
      id: 'eq2',
      reactants: 'H₂(g) + ½O₂(g)',
      products: 'H₂O(l)',
      deltaH: -286,
      isReversed: false,
      multiplier: 1
    },
    question: 'Myndun vatns: H₂(g) + ½O₂(g) → H₂O(l) hefur ΔH = -286 kJ. Hvað er ΔH fyrir sundrun vatns?',
    options: [
      { text: '+286 kJ', correct: true, explanation: 'Rétt! Þegar þú snýrð við hvörfum, snýrðu einnig formerkinu. -286 → +286' },
      { text: '-286 kJ', correct: false, explanation: 'Rangt. Þú þarft að snúa formerkinu þegar þú snýrð við hvörfum.' },
      { text: '-572 kJ', correct: false, explanation: 'Rangt. Þú ert að margfalda, ekki snúa við.' },
      { text: '+572 kJ', correct: false, explanation: 'Rangt. Þú ert bæði að margfalda og snúa við, en við erum bara að snúa.' }
    ],
    hints: {
      topic: 'Þetta snýst um að snúa við efnahvörfum og áhrif á ΔH.',
      strategy: 'Þegar hvörf ganga öfugt, þá gengur orkan einnig öfugt.',
      method: 'Snúðu formerkinu á ΔH. Ef ΔH = -X, þá er öfugt hvarf ΔH = +X.',
      solution: 'Myndun vatns: ΔH = -286 kJ. Sundrun er öfug, svo ΔH = +286 kJ.'
    }
  },
  {
    id: 3,
    title: 'Margfalda jöfnur',
    description: 'Þegar þú margfaldar alla stuðla í jöfnu, þá margfaldar þú einnig ΔH.',
    concept: 'Ef jafna hefur ΔH = -100 kJ, þá hefur 2× jafnan ΔH = -200 kJ',
    equation: {
      id: 'eq3',
      reactants: 'C(s) + O₂(g)',
      products: 'CO₂(g)',
      deltaH: -394,
      isReversed: false,
      multiplier: 1
    },
    question: 'Brennsla kolefnis: C(s) + O₂(g) → CO₂(g) hefur ΔH = -394 kJ. Hvað er ΔH ef við brennum 3 mól af kolefni?',
    options: [
      { text: '-1182 kJ', correct: true, explanation: 'Rétt! 3 × (-394) = -1182 kJ. Þreföld efnismagn gefur þrefalda orku.' },
      { text: '-394 kJ', correct: false, explanation: 'Rangt. Þetta er ΔH fyrir 1 mól. Þú þarft að margfalda með 3.' },
      { text: '-131 kJ', correct: false, explanation: 'Rangt. Þú ert að deila, ekki margfalda.' },
      { text: '+1182 kJ', correct: false, explanation: 'Rangt. Formerkið breytist ekki við margföldun.' }
    ],
    hints: {
      topic: 'Þetta snýst um að margfalda efnahvörf og áhrif á ΔH.',
      strategy: 'Meiri efnismagn = meiri orka. Margfaldaðu ΔH með sama stuðli.',
      method: 'Ef jafna hefur ΔH = X, þá hefur n× jafnan ΔH = n×X. Formerkið helst.',
      solution: '3 mól af C: ΔH = 3 × (-394) = -1182 kJ. Formerkið er enn neikvætt.'
    }
  },
  {
    id: 4,
    title: 'Sameina bæði',
    description: 'Þú getur snúið við OG margfaldað jöfnu. Gættu að röð aðgerða!',
    concept: 'Snúðu fyrst við (breytir formerki), margfaldaðu síðan.',
    equation: {
      id: 'eq4',
      reactants: 'N₂(g) + 3H₂(g)',
      products: '2NH₃(g)',
      deltaH: -92,
      isReversed: false,
      multiplier: 1
    },
    question: 'Myndun ammoníaks: N₂ + 3H₂ → 2NH₃ hefur ΔH = -92 kJ. Hvað er ΔH ef 4 mól af NH₃ sundrast?',
    options: [
      { text: '+184 kJ', correct: true, explanation: 'Rétt! Snúa við: +92 kJ. Margfalda með 2 (4 mól NH₃ = 2× jafnan): +184 kJ' },
      { text: '-184 kJ', correct: false, explanation: 'Rangt. Þú margfaldaðir rétt, en gleymdist að snúa formerkinu (sundrun vs myndun).' },
      { text: '+92 kJ', correct: false, explanation: 'Rangt. Þú snúðir við, en gleymdist að margfalda með 2.' },
      { text: '-92 kJ', correct: false, explanation: 'Rangt. Þetta er ΔH fyrir myndun, ekki sundrun.' }
    ],
    hints: {
      topic: 'Þetta snýst um að sameina snúa við og margfalda.',
      strategy: 'Hugsaðu um aðgerðirnar í réttri röð: sundrun (snúa) og magn (margfalda).',
      method: 'Sundrun er öfug við myndun, svo snúðu formerki. 4 mól NH₃ = 2× jafnan.',
      solution: 'Snúa við: +92 kJ. Margfalda með 2: +184 kJ.'
    }
  },
  {
    id: 5,
    title: 'Lögmál Hess í verki',
    description: 'Við getum fundið ΔH fyrir hvörf með því að leggja saman ΔH úr öðrum hvörfum.',
    concept: 'Ef A → B og B → C, þá A → C = ΔH₁ + ΔH₂',
    equation: {
      id: 'eq5',
      reactants: 'C(s) + ½O₂(g)',
      products: 'CO(g)',
      deltaH: -110,
      isReversed: false,
      multiplier: 1
    },
    question: 'Gefið: (1) C + O₂ → CO₂, ΔH = -394 kJ og (2) CO + ½O₂ → CO₂, ΔH = -283 kJ. Hvað er ΔH fyrir C + ½O₂ → CO?',
    options: [
      { text: '-111 kJ', correct: true, explanation: 'Rétt! Nota jöfnu (1) og snúa við jöfnu (2): -394 + 283 = -111 kJ' },
      { text: '-677 kJ', correct: false, explanation: 'Rangt. Þú lagðir saman, en þú þarft að snúa við jöfnu (2) til að CO sé afurð.' },
      { text: '+111 kJ', correct: false, explanation: 'Rangt. Réttur tölugildið, en rangt formerki.' },
      { text: '-394 kJ', correct: false, explanation: 'Rangt. Þetta er aðeins ΔH fyrir jöfnu (1), en þú þarft að sameina báðar.' }
    ],
    hints: {
      topic: 'Þetta snýst um að nota Hess lögmál til að finna ΔH.',
      strategy: 'Þú þarft að stilla jöfnur þannig að CO sé afurð og annað strikist út.',
      method: 'Nota jöfnu (1) eins og hún er. Snúa við jöfnu (2) svo CO verði afurð.',
      solution: 'Jafna (1): -394 kJ. Öfug jafna (2): +283 kJ. Heildar: -394 + 283 = -111 kJ.'
    }
  },
  {
    id: 6,
    title: 'Orkubraut',
    description: 'Hugsaðu um ΔH sem hæðarmismun. Leiðin skiptir ekki máli, aðeins upphafs- og lokastaða.',
    concept: 'Sama og að ganga upp fjall: sama hæð hvort sem þú ferð beina leið eða hringinn.',
    equation: {
      id: 'eq6',
      reactants: 'A',
      products: 'D',
      deltaH: -50,
      isReversed: false,
      multiplier: 1
    },
    question: 'A → B (ΔH = -30 kJ), B → C (ΔH = +10 kJ), C → D (ΔH = -30 kJ). Hvað er ΔH fyrir A → D?',
    options: [
      { text: '-50 kJ', correct: true, explanation: 'Rétt! -30 + 10 + (-30) = -50 kJ. Leggðu saman öll ΔH.' },
      { text: '-70 kJ', correct: false, explanation: 'Rangt. Gættu að formerkjum: B → C er +10, ekki -10.' },
      { text: '-30 kJ', correct: false, explanation: 'Rangt. Þú þarft að leggja saman öll þrjú ΔH.' },
      { text: '+50 kJ', correct: false, explanation: 'Rangt. Formerkið er rangt.' }
    ],
    hints: {
      topic: 'Þetta snýst um orkubraut og summu ΔH.',
      strategy: 'Leggðu saman öll ΔH á leiðinni. Gættu að formerkjum.',
      method: 'A→B: -30. B→C: +10. C→D: -30. Leggðu saman: -30 + 10 + (-30).',
      solution: '-30 + 10 + (-30) = -30 + 10 - 30 = -50 kJ.'
    }
  }
];

// Energy diagram component
function EnergyDiagram({
  equation,
  showPath = true
}: {
  equation: Equation;
  showPath?: boolean;
}) {
  const effectiveDeltaH = equation.deltaH * equation.multiplier * (equation.isReversed ? -1 : 1);
  const isExothermic = effectiveDeltaH < 0;

  // Calculate positions based on ΔH magnitude
  // Base gap (at multiplier=1) is 20% from center, scales with multiplier
  // Center is at 50%, so positions range from ~20% to ~80%
  const baseGap = 15; // Base distance from center (%)
  const gapPerMultiplier = 10; // Additional gap per multiplier level
  const totalGap = baseGap + (equation.multiplier - 1) * gapPerMultiplier;

  // Clamp the gap to keep bars within visible range (max 35% from center)
  const clampedGap = Math.min(totalGap, 35);

  // Calculate positions (0-100 scale, lower value = higher on screen = higher energy)
  // For exothermic: reactants high (small top%), products low (large top%)
  // For endothermic: reactants low (large top%), products high (small top%)
  const reactantLevel = isExothermic ? (50 - clampedGap) : (50 + clampedGap);
  const productLevel = isExothermic ? (50 + clampedGap) : (50 - clampedGap);

  return (
    <div className="relative bg-gradient-to-b from-red-50 via-white to-blue-50 rounded-xl p-6 h-64 border-2 border-gray-200">
      {/* Y-axis label */}
      <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-xs text-gray-500 font-semibold">
        Orka
      </div>

      {/* Energy levels */}
      <div className="relative h-full ml-8">
        {/* Reactants level */}
        <div
          className="absolute left-0 w-1/3 h-3 bg-blue-500 rounded-full flex items-center justify-center transition-all duration-500"
          style={{ top: `${reactantLevel}%` }}
        >
          <span className="absolute -top-6 text-xs font-semibold text-blue-700">
            {equation.isReversed ? equation.products : equation.reactants}
          </span>
        </div>

        {/* Products level */}
        <div
          className="absolute right-0 w-1/3 h-3 bg-green-500 rounded-full flex items-center justify-center transition-all duration-500"
          style={{ top: `${productLevel}%` }}
        >
          <span className="absolute -top-6 text-xs font-semibold text-green-700">
            {equation.isReversed ? equation.reactants : equation.products}
          </span>
        </div>

        {/* Arrow showing energy change */}
        {showPath && (
          <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center"
            style={{
              top: `${Math.min(reactantLevel, productLevel) + 5}%`,
              height: `${Math.abs(productLevel - reactantLevel) - 10}%`
            }}
          >
            <div className={`w-1 flex-1 ${isExothermic ? 'bg-red-400' : 'bg-blue-400'}`} />
            <div className={`text-2xl ${isExothermic ? 'text-red-500' : 'text-blue-500'}`}>
              {isExothermic ? '↓' : '↑'}
            </div>
          </div>
        )}

        {/* ΔH label */}
        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 bg-white px-3 py-1 rounded-lg border-2 border-gray-300 shadow">
          <span className={`font-bold text-lg ${effectiveDeltaH < 0 ? 'text-red-600' : 'text-blue-600'}`}>
            ΔH = {effectiveDeltaH > 0 ? '+' : ''}{effectiveDeltaH} kJ
          </span>
        </div>
      </div>
    </div>
  );
}

// Equation display with controls
function EquationDisplay({
  equation,
  onReverse,
  onMultiply,
  showControls = true
}: {
  equation: Equation;
  onReverse?: () => void;
  onMultiply?: (factor: number) => void;
  showControls?: boolean;
}) {
  const effectiveDeltaH = equation.deltaH * equation.multiplier * (equation.isReversed ? -1 : 1);

  // Get the displayed reactants and products with multiplied coefficients
  const displayReactants = multiplyEquationCoefficients(
    equation.isReversed ? equation.products : equation.reactants,
    equation.multiplier
  );
  const displayProducts = multiplyEquationCoefficients(
    equation.isReversed ? equation.reactants : equation.products,
    equation.multiplier
  );

  return (
    <div className={`p-4 rounded-xl border-2 transition-all ${
      equation.isReversed ? 'bg-red-50 border-red-300' :
      equation.multiplier !== 1 ? 'bg-blue-50 border-blue-300' :
      'bg-white border-gray-300'
    }`}>
      {/* Equation */}
      <div className="text-center mb-3">
        <span className="font-mono text-lg">
          <span className="text-blue-700">{displayReactants}</span>
          <span className="mx-2 text-gray-600">→</span>
          <span className="text-green-700">{displayProducts}</span>
        </span>
      </div>

      {/* ΔH value */}
      <div className="text-center mb-4">
        <span className={`font-bold text-xl ${effectiveDeltaH < 0 ? 'text-red-600' : 'text-blue-600'}`}>
          ΔH = {effectiveDeltaH > 0 ? '+' : ''}{effectiveDeltaH} kJ/mol
        </span>
      </div>

      {/* Controls */}
      {showControls && (
        <div className="flex justify-center gap-4">
          <button
            onClick={onReverse}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              equation.isReversed
                ? 'bg-red-500 text-white'
                : 'bg-gray-200 hover:bg-red-100 text-gray-700'
            }`}
          >
            🔄 Snúa við
          </button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">×</span>
            {[1, 2, 3].map(n => (
              <button
                key={n}
                onClick={() => onMultiply?.(n)}
                className={`w-10 h-10 rounded-lg font-bold transition-colors ${
                  equation.multiplier === n
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 hover:bg-blue-100 text-gray-700'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface Level1Props {
  onComplete: (score: number, maxScore?: number, hintsUsed?: number) => void;
  onBack: () => void;
  onCorrectAnswer?: () => void;
  onIncorrectAnswer?: () => void;
}

export function Level1({ onComplete, onBack, onCorrectAnswer, onIncorrectAnswer }: Level1Props) {
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [equation, setEquation] = useState<Equation>(CHALLENGES[0].equation);
  const [totalHintsUsed, setTotalHintsUsed] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState<number[]>([]);

  const challenge = CHALLENGES[currentChallenge];

  // Shuffle options for current challenge - memoize to keep stable during challenge
  const shuffledOptions = useMemo(() => {
    return shuffleArray(challenge.options);
  }, [currentChallenge, challenge.options]);

  // Reset equation when challenge changes
  useEffect(() => {
    setEquation({ ...CHALLENGES[currentChallenge].equation });
    setSelectedAnswer(null);
    setShowResult(false);
    setShowHint(false);
  }, [currentChallenge]);

  // Handle equation modifications
  const handleReverse = () => {
    setEquation(prev => ({ ...prev, isReversed: !prev.isReversed }));
  };

  const handleMultiply = (factor: number) => {
    setEquation(prev => ({ ...prev, multiplier: factor }));
  };

  // Check answer
  const checkAnswer = () => {
    if (selectedAnswer === null) return;

    const isCorrect = shuffledOptions[selectedAnswer].correct;
    setShowResult(true);

    if (isCorrect) {
      onCorrectAnswer?.();
      if (!completed.includes(challenge.id)) {
        const points = showHint ? 50 : 100;
        setScore(prev => prev + points);
        setCompleted(prev => [...prev, challenge.id]);
      }
    } else {
      onIncorrectAnswer?.();
    }
  };

  // Next challenge
  const nextChallenge = () => {
    if (currentChallenge < CHALLENGES.length - 1) {
      setCurrentChallenge(prev => prev + 1);
      // useEffect will reset the equation when currentChallenge changes
    } else {
      // Max score is 100 per challenge × 6 challenges = 600
      onComplete(score, 600, totalHintsUsed);
    }
  };

  // Handle hint usage
  const handleShowHint = () => {
    setShowHint(true);
    setTotalHintsUsed(prev => prev + 1);
  };

  // Show interactive controls for challenges 2-4
  const showEquationControls = challenge.id >= 2 && challenge.id <= 4;

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-blue-600">
                Lögmál Hess - Stig 1
              </h1>
              <p className="text-sm text-gray-600">Skildu hugtökin - byggðu innsæi</p>
            </div>

            <div className="flex gap-4 items-center">
              <button
                onClick={onBack}
                className="text-gray-600 hover:text-gray-800 text-sm"
              >
                ← Til baka
              </button>
              <div className="text-center">
                <div className="text-xl font-bold text-blue-600">{score}</div>
                <div className="text-xs text-gray-600">Stig</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-600">
                  {completed.length}/{CHALLENGES.length}
                </div>
                <div className="text-xs text-gray-600">Lokið</div>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(completed.length / CHALLENGES.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Main content */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
          {/* Challenge header */}
          <div className="mb-6">
            <div className="inline-block bg-blue-100 px-4 py-2 rounded-full text-sm font-semibold text-blue-800 mb-2">
              {currentChallenge + 1}. {challenge.title}
            </div>
            <p className="text-gray-700 mb-2">{challenge.description}</p>
            <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
              <p className="text-sm text-purple-800">
                <strong>Lykillhugtak:</strong> {challenge.concept}
              </p>
            </div>
          </div>

          {/* Energy diagram */}
          <div className="mb-6">
            <EnergyDiagram equation={equation} />
          </div>

          {/* Equation with optional controls */}
          <div className="mb-6">
            <EquationDisplay
              equation={equation}
              onReverse={handleReverse}
              onMultiply={handleMultiply}
              showControls={showEquationControls && !showResult}
            />
          </div>

          {/* Question */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{challenge.question}</h3>

            <div className="space-y-3">
              {shuffledOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={() => !showResult && setSelectedAnswer(index)}
                  disabled={showResult}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    showResult
                      ? option.correct
                        ? 'bg-green-100 border-green-500'
                        : selectedAnswer === index
                        ? 'bg-red-100 border-red-500'
                        : 'bg-gray-50 border-gray-200'
                      : selectedAnswer === index
                      ? 'bg-blue-100 border-blue-500'
                      : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <div className="font-semibold">{option.text}</div>
                  {showResult && (selectedAnswer === index || option.correct) && (
                    <div className={`mt-2 text-sm ${option.correct ? 'text-green-700' : 'text-red-700'}`}>
                      {option.explanation}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Hint */}
          {!showResult && (
            <div className="mb-6">
              {showHint ? (
                <div className="bg-yellow-50 border-2 border-yellow-300 p-4 rounded-xl">
                  <h4 className="font-semibold text-yellow-800 mb-2">💡 Vísbending:</h4>
                  <p className="text-yellow-900">{challenge.hints?.method || ''}</p>
                </div>
              ) : (
                <button
                  onClick={handleShowHint}
                  className="text-yellow-600 hover:text-yellow-700 text-sm"
                >
                  💡 Sýna vísbendingu (-50 stig)
                </button>
              )}
            </div>
          )}

          {/* Detailed Feedback Panel */}
          {showResult && (
            <div className="mb-6">
              <FeedbackPanel
                feedback={{
                  isCorrect: shuffledOptions[selectedAnswer!]?.correct || false,
                  explanation: shuffledOptions[selectedAnswer!]?.explanation || '',
                  misconception: shuffledOptions[selectedAnswer!]?.correct
                    ? undefined
                    : MISCONCEPTIONS[challenge.id],
                  relatedConcepts: RELATED_CONCEPTS[challenge.id],
                  nextSteps: shuffledOptions[selectedAnswer!]?.correct
                    ? 'Frábært! Þú skilur þetta hugtak vel. Haltu áfram.'
                    : 'Skoðaðu útskýringuna og reyndu að muna regluna.',
                }}
                config={{
                  showExplanation: true,
                  showMisconceptions: !shuffledOptions[selectedAnswer!]?.correct,
                  showRelatedConcepts: true,
                  showNextSteps: true,
                }}
              />
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-4">
            {!showResult ? (
              <button
                onClick={checkAnswer}
                disabled={selectedAnswer === null}
                className={`flex-1 py-3 px-6 rounded-xl font-bold transition-colors ${
                  selectedAnswer !== null
                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Athuga svar
              </button>
            ) : (
              <button
                onClick={nextChallenge}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl transition-colors"
              >
                {currentChallenge < CHALLENGES.length - 1 ? 'Næsta verkefni →' : 'Ljúka stigi →'}
              </button>
            )}
          </div>
        </div>

        {/* State Path Comparison - Educational visualization */}
        <div className="mt-6">
          <StatePathComparison compact={true} />
        </div>

        {/* Challenge navigation */}
        <div className="mt-6 flex justify-center gap-2">
          {CHALLENGES.map((c, i) => (
            <button
              key={c.id}
              onClick={() => setCurrentChallenge(i)}
              className={`w-10 h-10 rounded-full font-bold transition-colors ${
                completed.includes(c.id)
                  ? 'bg-green-500 text-white'
                  : i === currentChallenge
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              {completed.includes(c.id) ? '✓' : i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Level1;
