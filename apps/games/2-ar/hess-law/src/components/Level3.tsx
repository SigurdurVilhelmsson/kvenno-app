import { useState } from 'react';

interface Level3Props {
  onComplete: (score: number, maxScore?: number, hintsUsed?: number) => void;
  onBack: () => void;
  onCorrectAnswer?: () => void;
  onIncorrectAnswer?: () => void;
}

interface Challenge {
  id: number;
  title: string;
  description: string;
  type: 'calculate' | 'reverse' | 'compare';
  equation: string;
  reactants: { formula: string; coefficient: number; deltaHf: number }[];
  products: { formula: string; coefficient: number; deltaHf: number }[];
  correctAnswer: number;
  unit: string;
  hint: string;
  explanation: string;
  // For reverse problems
  unknownCompound?: string;
  givenDeltaHrxn?: number;
}

// Standard enthalpies of formation table (kJ/mol)
const FORMATION_ENTHALPIES: Record<string, { value: number; name: string }> = {
  'H2O(l)': { value: -285.8, name: 'Vatn (fljótandi)' },
  'H2O(g)': { value: -241.8, name: 'Vatnsgufa' },
  'CO2(g)': { value: -393.5, name: 'Koltvísýringur' },
  'CO(g)': { value: -110.5, name: 'Kolsýringur' },
  'CH4(g)': { value: -74.8, name: 'Metan' },
  'C2H6(g)': { value: -84.7, name: 'Etan' },
  'C2H5OH(l)': { value: -277.7, name: 'Etanól' },
  'C6H12O6(s)': { value: -1274, name: 'Glúkósi' },
  'NH3(g)': { value: -46.1, name: 'Ammóníak' },
  'NO(g)': { value: 90.3, name: 'Nituroxíð' },
  'NO2(g)': { value: 33.2, name: 'Niturtvíoxíð' },
  'SO2(g)': { value: -296.8, name: 'Brennisteinsdíoxíð' },
  'SO3(g)': { value: -395.7, name: 'Brennisteinstrioxíð' },
  'HCl(g)': { value: -92.3, name: 'Vetni klóríð' },
  'NaCl(s)': { value: -411.2, name: 'Natríumklóríð' },
  'CaCO3(s)': { value: -1206.9, name: 'Kalsíumkarbónat' },
  'CaO(s)': { value: -635.1, name: 'Kalsíumoxíð' },
  'Fe2O3(s)': { value: -824.2, name: 'Járnoxíð' },
  'Al2O3(s)': { value: -1675.7, name: 'Áloxíð' },
  // Elements in standard state = 0
  'O2(g)': { value: 0, name: 'Súrefni' },
  'H2(g)': { value: 0, name: 'Vetni' },
  'N2(g)': { value: 0, name: 'Nitur' },
  'C(s)': { value: 0, name: 'Kolefni (grafít)' },
  'Fe(s)': { value: 0, name: 'Járn' },
  'Al(s)': { value: 0, name: 'Ál' },
  'S(s)': { value: 0, name: 'Brennisteinn' },
  'Cl2(g)': { value: 0, name: 'Klór' },
  'Na(s)': { value: 0, name: 'Natríum' },
  'Ca(s)': { value: 0, name: 'Kalsíum' },
};

const challenges: Challenge[] = [
  {
    id: 1,
    title: 'Brennsla metans',
    description: 'Reiknaðu ΔH°rxn fyrir brennslu metans með ΔH°f gildum.',
    type: 'calculate',
    equation: 'CH₄(g) + 2O₂(g) → CO₂(g) + 2H₂O(l)',
    reactants: [
      { formula: 'CH4(g)', coefficient: 1, deltaHf: -74.8 },
      { formula: 'O2(g)', coefficient: 2, deltaHf: 0 },
    ],
    products: [
      { formula: 'CO2(g)', coefficient: 1, deltaHf: -393.5 },
      { formula: 'H2O(l)', coefficient: 2, deltaHf: -285.8 },
    ],
    correctAnswer: -890.3,
    unit: 'kJ/mol',
    hint: 'ΔH°rxn = Σ(n × ΔH°f afurðir) - Σ(n × ΔH°f hvarfefni)',
    explanation: 'ΔH°rxn = [1(-393.5) + 2(-285.8)] - [1(-74.8) + 2(0)] = -890.3 kJ/mol'
  },
  {
    id: 2,
    title: 'Myndun ammóníaks',
    description: 'Finndu ΔH°rxn fyrir Haber-ferlið.',
    type: 'calculate',
    equation: 'N₂(g) + 3H₂(g) → 2NH₃(g)',
    reactants: [
      { formula: 'N2(g)', coefficient: 1, deltaHf: 0 },
      { formula: 'H2(g)', coefficient: 3, deltaHf: 0 },
    ],
    products: [
      { formula: 'NH3(g)', coefficient: 2, deltaHf: -46.1 },
    ],
    correctAnswer: -92.2,
    unit: 'kJ/mol',
    hint: 'Frumefni í stöðluðu ástandi hafa ΔH°f = 0',
    explanation: 'ΔH°rxn = [2(-46.1)] - [1(0) + 3(0)] = -92.2 kJ/mol'
  },
  {
    id: 3,
    title: 'Kalsíumkarbónat sundrun',
    description: 'Reiknaðu ΔH° fyrir niðurbrot kalsíumkarbónats.',
    type: 'calculate',
    equation: 'CaCO₃(s) → CaO(s) + CO₂(g)',
    reactants: [
      { formula: 'CaCO3(s)', coefficient: 1, deltaHf: -1206.9 },
    ],
    products: [
      { formula: 'CaO(s)', coefficient: 1, deltaHf: -635.1 },
      { formula: 'CO2(g)', coefficient: 1, deltaHf: -393.5 },
    ],
    correctAnswer: 178.3,
    unit: 'kJ/mol',
    hint: 'Jákvæð ΔH þýðir innhitað hvarf (varmagleypandi)',
    explanation: 'ΔH°rxn = [(-635.1) + (-393.5)] - [(-1206.9)] = +178.3 kJ/mol (innhitað)'
  },
  {
    id: 4,
    title: 'Óþekkt myndunarvarminn',
    description: 'Gefið er ΔH°rxn = -296.8 kJ/mol. Finndu ΔH°f fyrir SO₂(g).',
    type: 'reverse',
    equation: 'S(s) + O₂(g) → SO₂(g)',
    reactants: [
      { formula: 'S(s)', coefficient: 1, deltaHf: 0 },
      { formula: 'O2(g)', coefficient: 1, deltaHf: 0 },
    ],
    products: [
      { formula: 'SO2(g)', coefficient: 1, deltaHf: -296.8 },
    ],
    unknownCompound: 'SO2(g)',
    givenDeltaHrxn: -296.8,
    correctAnswer: -296.8,
    unit: 'kJ/mol',
    hint: 'Þetta er myndunarhvarf! ΔH°rxn = ΔH°f fyrir afurðina.',
    explanation: 'Þar sem hvarfefnin eru frumefni í stöðluðu ástandi: ΔH°rxn = ΔH°f(SO₂) = -296.8 kJ/mol'
  },
  {
    id: 5,
    title: 'Brennsla etanóls',
    description: 'Reiknaðu varmamyndun við brennslu etanóls.',
    type: 'calculate',
    equation: 'C₂H₅OH(l) + 3O₂(g) → 2CO₂(g) + 3H₂O(l)',
    reactants: [
      { formula: 'C2H5OH(l)', coefficient: 1, deltaHf: -277.7 },
      { formula: 'O2(g)', coefficient: 3, deltaHf: 0 },
    ],
    products: [
      { formula: 'CO2(g)', coefficient: 2, deltaHf: -393.5 },
      { formula: 'H2O(l)', coefficient: 3, deltaHf: -285.8 },
    ],
    correctAnswer: -1366.7,
    unit: 'kJ/mol',
    hint: 'Mundu að margfalda ΔH°f með stuðlinum!',
    explanation: 'ΔH°rxn = [2(-393.5) + 3(-285.8)] - [1(-277.7) + 3(0)] = -1366.7 kJ/mol'
  },
  {
    id: 6,
    title: 'Þermít hvarfið',
    description: 'Reiknaðu orkuna í þermít hvarfinu.',
    type: 'calculate',
    equation: '2Al(s) + Fe₂O₃(s) → Al₂O₃(s) + 2Fe(s)',
    reactants: [
      { formula: 'Al(s)', coefficient: 2, deltaHf: 0 },
      { formula: 'Fe2O3(s)', coefficient: 1, deltaHf: -824.2 },
    ],
    products: [
      { formula: 'Al2O3(s)', coefficient: 1, deltaHf: -1675.7 },
      { formula: 'Fe(s)', coefficient: 2, deltaHf: 0 },
    ],
    correctAnswer: -851.5,
    unit: 'kJ/mol',
    hint: 'Þetta hvarf er mjög varmagjafandi - notað til að suða járnbrautir.',
    explanation: 'ΔH°rxn = [1(-1675.7) + 2(0)] - [2(0) + 1(-824.2)] = -851.5 kJ/mol'
  }
];

export function Level3({ onComplete, onBack, onCorrectAnswer, onIncorrectAnswer }: Level3Props) {
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [showTable, setShowTable] = useState(false);
  const [totalHintsUsed, setTotalHintsUsed] = useState(0);

  const challenge = challenges[currentChallenge];

  const checkAnswer = () => {
    const userNum = parseFloat(userAnswer);
    const tolerance = Math.abs(challenge.correctAnswer * 0.02); // 2% tolerance
    const correct = Math.abs(userNum - challenge.correctAnswer) <= tolerance;

    setIsCorrect(correct);
    if (correct) {
      onCorrectAnswer?.();
      if (!showHint) {
        setScore(prev => prev + 20);
      } else {
        setScore(prev => prev + 10);
      }
    } else {
      onIncorrectAnswer?.();
    }
    setShowExplanation(true);
  };

  const handleShowHint = () => {
    setShowHint(true);
    setTotalHintsUsed(prev => prev + 1);
  };

  const nextChallenge = () => {
    if (currentChallenge < challenges.length - 1) {
      setCurrentChallenge(prev => prev + 1);
      setUserAnswer('');
      setShowHint(false);
      setShowExplanation(false);
      setIsCorrect(null);
    } else {
      // Max score is 20 per challenge × 6 challenges = 120
      onComplete(score, 120, totalHintsUsed);
    }
  };

  // Calculate products sum for display
  const productsSum = challenge.products.reduce(
    (sum, p) => sum + p.coefficient * p.deltaHf,
    0
  );

  // Calculate reactants sum for display
  const reactantsSum = challenge.reactants.reduce(
    (sum, r) => sum + r.coefficient * r.deltaHf,
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800 flex items-center gap-2"
          >
            <span>&larr;</span> Til baka
          </button>
          <div className="text-right">
            <div className="text-sm text-gray-600">Stig 3 / Þraut {currentChallenge + 1} af {challenges.length}</div>
            <div className="text-lg font-bold text-purple-600">{score} stig</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div
            className="bg-purple-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentChallenge + 1) / challenges.length) * 100}%` }}
          />
        </div>

        {/* Main content */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
          <h2 className="text-2xl font-bold text-purple-800 mb-2">
            {challenge.title}
          </h2>
          <p className="text-gray-600 mb-6">{challenge.description}</p>

          {/* Chemical equation display */}
          <div className="bg-purple-50 p-4 rounded-xl mb-6">
            <div className="text-center font-mono text-xl">
              {challenge.equation}
            </div>
          </div>

          {/* Toggle formation enthalpy table */}
          <button
            onClick={() => setShowTable(!showTable)}
            className="mb-4 text-purple-600 hover:text-purple-800 underline text-sm"
          >
            {showTable ? 'Fela ΔH°f töflu' : 'Sýna ΔH°f töflu'}
          </button>

          {/* Formation enthalpy table */}
          {showTable && (
            <div className="bg-gray-50 p-4 rounded-xl mb-6 max-h-64 overflow-y-auto">
              <h3 className="font-bold text-gray-700 mb-3">Myndunarvarminn (ΔH°f) í kJ/mol</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                {Object.entries(FORMATION_ENTHALPIES)
                  .filter(([formula]) =>
                    challenge.reactants.some(r => r.formula === formula) ||
                    challenge.products.some(p => p.formula === formula)
                  )
                  .map(([formula, { value, name }]) => (
                    <div key={formula} className="bg-white p-2 rounded border">
                      <div className="font-mono font-bold">{formula}</div>
                      <div className="text-gray-600 text-xs">{name}</div>
                      <div className={`font-bold ${value < 0 ? 'text-blue-600' : value > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                        {value} kJ/mol
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Calculation workspace */}
          <div className="bg-gray-50 p-4 rounded-xl mb-6">
            <h3 className="font-bold text-gray-700 mb-3">Útreikningur</h3>

            {/* Formula reminder */}
            <div className="bg-white p-3 rounded-lg border border-purple-200 mb-4">
              <p className="font-mono text-sm text-center text-purple-800">
                ΔH°<sub>rxn</sub> = Σ(n × ΔH°<sub>f</sub> afurðir) - Σ(n × ΔH°<sub>f</sub> hvarfefni)
              </p>
            </div>

            {/* Products calculation */}
            <div className="mb-4">
              <div className="font-semibold text-green-700 mb-2">Afurðir:</div>
              <div className="space-y-1 text-sm font-mono">
                {challenge.products.map((p, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span>{p.coefficient} × ΔH°f({p.formula}) = {p.coefficient} × ({p.deltaHf}) = </span>
                    <span className="font-bold">{(p.coefficient * p.deltaHf).toFixed(1)} kJ</span>
                  </div>
                ))}
                <div className="border-t pt-1 font-bold">
                  Samtals afurðir: {productsSum.toFixed(1)} kJ
                </div>
              </div>
            </div>

            {/* Reactants calculation */}
            <div className="mb-4">
              <div className="font-semibold text-blue-700 mb-2">Hvarfefni:</div>
              <div className="space-y-1 text-sm font-mono">
                {challenge.reactants.map((r, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span>{r.coefficient} × ΔH°f({r.formula}) = {r.coefficient} × ({r.deltaHf}) = </span>
                    <span className="font-bold">{(r.coefficient * r.deltaHf).toFixed(1)} kJ</span>
                  </div>
                ))}
                <div className="border-t pt-1 font-bold">
                  Samtals hvarfefni: {reactantsSum.toFixed(1)} kJ
                </div>
              </div>
            </div>
          </div>

          {/* Answer input */}
          <div className="flex flex-col md:flex-row gap-4 items-center mb-6">
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {challenge.type === 'reverse'
                  ? `ΔH°f(${challenge.unknownCompound}) = `
                  : 'ΔH°rxn = '}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.1"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  className="flex-1 p-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none text-lg font-mono"
                  placeholder="Sláðu inn svar..."
                  disabled={isCorrect !== null}
                />
                <span className="flex items-center text-gray-600 font-mono">
                  {challenge.unit}
                </span>
              </div>
            </div>

            {isCorrect === null && (
              <button
                onClick={checkAnswer}
                disabled={!userAnswer}
                className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white font-bold py-3 px-8 rounded-xl transition-colors"
              >
                Athuga
              </button>
            )}
          </div>

          {/* Hint button */}
          {isCorrect === null && !showHint && (
            <button
              onClick={handleShowHint}
              className="text-purple-600 hover:text-purple-800 text-sm underline mb-4"
            >
              Sýna vísbendingu (-10 stig)
            </button>
          )}

          {showHint && !showExplanation && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl mb-4">
              <span className="font-bold text-yellow-800">Vísbending: </span>
              <span className="text-yellow-900">{challenge.hint}</span>
            </div>
          )}

          {/* Result feedback */}
          {isCorrect !== null && (
            <div className={`p-4 rounded-xl mb-4 ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className={`font-bold text-lg mb-2 ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                {isCorrect ? 'Rétt!' : 'Rangt'}
              </div>
              <div className={`font-mono ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                Rétt svar: {challenge.correctAnswer} {challenge.unit}
              </div>
            </div>
          )}

          {/* Explanation */}
          {showExplanation && (
            <div className="bg-purple-50 p-4 rounded-xl mb-6">
              <div className="font-bold text-purple-800 mb-2">Útskýring:</div>
              <div className="text-purple-900 font-mono text-sm">
                {challenge.explanation}
              </div>
            </div>
          )}

          {/* Next button */}
          {isCorrect !== null && (
            <button
              onClick={nextChallenge}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-6 rounded-xl transition-colors"
            >
              {currentChallenge < challenges.length - 1 ? 'Næsta þraut' : 'Ljúka stigi 3'}
            </button>
          )}
        </div>

        {/* Key concepts reminder */}
        <div className="mt-6 bg-white rounded-xl p-4 shadow">
          <h3 className="font-bold text-gray-700 mb-2">Lykilatriði</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Frumefni í stöðluðu ástandi hafa ΔH°f = 0</li>
            <li>• Neikvætt ΔH°f = stöðugt efnasamband</li>
            <li>• Mundu að nota stuðla (coefficients) í útreikningi</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
