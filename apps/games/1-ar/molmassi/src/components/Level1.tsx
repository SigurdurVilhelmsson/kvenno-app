import { useState, useEffect } from 'react';
import { FeedbackPanel, MoleculeViewer3DLazy } from '@shared/components';
import type { DetailedFeedback } from '@shared/types';
import { elementsToMolecule } from '../utils/moleculeConverter';
import { PeriodicTable } from './PeriodicTable';

// Atomic masses for calculations
const ATOMIC_MASSES: Record<string, number> = {
  H: 1.008,
  C: 12.011,
  N: 14.007,
  O: 15.999,
  S: 32.065,
  Cl: 35.453,
  Na: 22.990,
  Ca: 40.078,
  Fe: 55.845,
  K: 39.098,
  Mg: 24.305,
  P: 30.974,
  Al: 26.982,
  Cu: 63.546,
};

// Visual properties for atoms (used in UI)
const ATOM_VISUALS: Record<string, { color: string; size: number; name: string; mass: number }> = {
  H: { color: '#F3F4F6', size: 24, name: 'Vetni', mass: 1.008 },
  C: { color: '#4B5563', size: 30, name: 'Kolefni', mass: 12.011 },
  N: { color: '#3B82F6', size: 28, name: 'Köfnunarefni', mass: 14.007 },
  O: { color: '#EF4444', size: 28, name: 'Súrefni', mass: 15.999 },
  S: { color: '#EAB308', size: 32, name: 'Brennisteinn', mass: 32.065 },
  Cl: { color: '#22C55E', size: 32, name: 'Klór', mass: 35.453 },
  Na: { color: '#8B5CF6', size: 34, name: 'Natríum', mass: 22.990 },
  Ca: { color: '#F97316', size: 36, name: 'Kalsíum', mass: 40.078 },
  Fe: { color: '#78716C', size: 34, name: 'Járn', mass: 55.845 },
  K: { color: '#EC4899', size: 38, name: 'Kalíum', mass: 39.098 },
  Mg: { color: '#14B8A6', size: 34, name: 'Magnesíum', mass: 24.305 },
  P: { color: '#F59E0B', size: 30, name: 'Fosfór', mass: 30.974 },
  Al: { color: '#A1A1AA', size: 32, name: 'Ál', mass: 26.982 },
  Cu: { color: '#B45309', size: 32, name: 'Kopar', mass: 63.546 },
};

// Challenge types for Level 1
type ChallengeType = 'count_atoms' | 'compare_mass' | 'build_molecule' | 'estimate_range';

interface Challenge {
  type: ChallengeType;
  compound: {
    formula: string;
    name: string;
    elements: { symbol: string; count: number }[];
    molarMass: number;
  };
  // For count_atoms
  targetElement?: string;
  correctCount?: number;
  // For compare_mass
  compareCompound?: {
    formula: string;
    name: string;
    elements: { symbol: string; count: number }[];
    molarMass: number;
  };
  // For estimate_range
  ranges?: { min: number; max: number; label: string }[];
  correctRangeIndex?: number;
}

// Simple compounds for Level 1
const LEVEL1_COMPOUNDS = [
  { formula: 'H₂O', name: 'Vatn', elements: [{ symbol: 'H', count: 2 }, { symbol: 'O', count: 1 }], molarMass: 18.015 },
  { formula: 'CO₂', name: 'Koltvísýringur', elements: [{ symbol: 'C', count: 1 }, { symbol: 'O', count: 2 }], molarMass: 44.009 },
  { formula: 'NaCl', name: 'Borðsalt', elements: [{ symbol: 'Na', count: 1 }, { symbol: 'Cl', count: 1 }], molarMass: 58.44 },
  { formula: 'CH₄', name: 'Metan', elements: [{ symbol: 'C', count: 1 }, { symbol: 'H', count: 4 }], molarMass: 16.043 },
  { formula: 'NH₃', name: 'Ammóníak', elements: [{ symbol: 'N', count: 1 }, { symbol: 'H', count: 3 }], molarMass: 17.031 },
  { formula: 'O₂', name: 'Súrefni', elements: [{ symbol: 'O', count: 2 }], molarMass: 31.998 },
  { formula: 'N₂', name: 'Köfnunarefni', elements: [{ symbol: 'N', count: 2 }], molarMass: 28.014 },
  { formula: 'HCl', name: 'Saltsýra', elements: [{ symbol: 'H', count: 1 }, { symbol: 'Cl', count: 1 }], molarMass: 36.458 },
  { formula: 'CaO', name: 'Kalsíumoxíð', elements: [{ symbol: 'Ca', count: 1 }, { symbol: 'O', count: 1 }], molarMass: 56.077 },
  { formula: 'MgO', name: 'Magnesíumoxíð', elements: [{ symbol: 'Mg', count: 1 }, { symbol: 'O', count: 1 }], molarMass: 40.304 },
];

// Generate a random challenge
function generateChallenge(challengeNumber: number): Challenge {
  const compound = LEVEL1_COMPOUNDS[Math.floor(Math.random() * LEVEL1_COMPOUNDS.length)];

  // Cycle through challenge types
  const types: ChallengeType[] = ['count_atoms', 'compare_mass', 'build_molecule', 'estimate_range'];
  const type = types[challengeNumber % types.length];

  switch (type) {
    case 'count_atoms': {
      const element = compound.elements[Math.floor(Math.random() * compound.elements.length)];
      return {
        type: 'count_atoms',
        compound,
        targetElement: element.symbol,
        correctCount: element.count,
      };
    }

    case 'compare_mass': {
      let other = LEVEL1_COMPOUNDS[Math.floor(Math.random() * LEVEL1_COMPOUNDS.length)];
      while (other.formula === compound.formula) {
        other = LEVEL1_COMPOUNDS[Math.floor(Math.random() * LEVEL1_COMPOUNDS.length)];
      }
      return {
        type: 'compare_mass',
        compound,
        compareCompound: other,
      };
    }

    case 'build_molecule': {
      return {
        type: 'build_molecule',
        compound,
      };
    }

    case 'estimate_range': {
      const ranges = [
        { min: 0, max: 25, label: '0-25 g/mol' },
        { min: 25, max: 50, label: '25-50 g/mol' },
        { min: 50, max: 100, label: '50-100 g/mol' },
      ];
      const correctIndex = ranges.findIndex(r => compound.molarMass >= r.min && compound.molarMass < r.max);
      return {
        type: 'estimate_range',
        compound,
        ranges,
        correctRangeIndex: correctIndex >= 0 ? correctIndex : 2,
      };
    }

    default:
      return { type: 'count_atoms', compound };
  }
}

// Atom circle component with animations
function AtomCircle({ symbol, showLabel = true, onClick, isSelected = false, animateIn = false, delay = 0 }: {
  symbol: string;
  showLabel?: boolean;
  onClick?: () => void;
  isSelected?: boolean;
  animateIn?: boolean;
  delay?: number;
}) {
  const visual = ATOM_VISUALS[symbol] || { color: '#888', size: 30, name: symbol, mass: 0 };

  return (
    <div
      className={`relative inline-flex flex-col items-center ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div
        className={`atom-circle rounded-full border-2 flex items-center justify-center font-bold text-xs ${animateIn ? 'animate-bounce-in' : ''} ${isSelected ? 'ring-4 ring-primary ring-opacity-50 animate-pulse-soft' : ''}`}
        style={{
          width: visual.size,
          height: visual.size,
          backgroundColor: visual.color,
          borderColor: visual.color === '#FFFFFF' ? '#CBD5E1' : 'transparent',
          color: visual.color === '#FFFFFF' || visual.color === '#EAB308' ? '#1F2937' : '#FFFFFF',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          animationDelay: animateIn ? `${delay}ms` : '0ms',
          animationFillMode: 'backwards',
        }}
      >
        {symbol}
      </div>
      {showLabel && (
        <span className="text-xs text-gray-600 mt-1">{visual.name}</span>
      )}
    </div>
  );
}

// Molecule visualization component with animations
function MoleculeVisual({ elements, showMassBar = false, animateAtoms = true }: {
  elements: { symbol: string; count: number }[];
  showMassBar?: boolean;
  animateAtoms?: boolean;
}) {
  const totalMass = elements.reduce((sum, el) => {
    const visual = ATOM_VISUALS[el.symbol];
    return sum + (visual ? visual.mass * el.count : 0);
  }, 0);

  // Calculate max possible mass for the bar (roughly 100 g/mol for simple molecules)
  const maxMass = 100;
  const massPercent = Math.min((totalMass / maxMass) * 100, 100);

  // Count total atoms for staggered animation
  let atomCounter = 0;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap items-center justify-center gap-2 p-4 bg-gray-100 rounded-xl min-h-[80px]">
        {elements.map((el, elIndex) => (
          <div key={elIndex} className="flex items-center gap-1">
            {Array.from({ length: el.count }).map((_, atomIndex) => {
              const delay = atomCounter * 50; // 50ms stagger
              atomCounter++;
              return (
                <AtomCircle
                  key={`${elIndex}-${atomIndex}`}
                  symbol={el.symbol}
                  showLabel={false}
                  animateIn={animateAtoms}
                  delay={delay}
                />
              );
            })}
          </div>
        ))}
      </div>

      {showMassBar && (
        <div className="w-full max-w-xs animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <div className="text-xs text-gray-600 text-center mb-1">Heildarmassi</div>
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full mass-bar-fill bg-gradient-to-r from-green-400 via-yellow-400 to-red-400"
              style={{ width: `${massPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Létt</span>
            <span>Þungt</span>
          </div>
        </div>
      )}
    </div>
  );
}

interface Level1Props {
  onBack: () => void;
  onComplete: (score: number, maxScore: number, hintsUsed: number) => void;
  onCorrectAnswer?: () => void;
  onIncorrectAnswer?: () => void;
}

// Main Level 1 Component
export function Level1({ onBack, onComplete, onCorrectAnswer, onIncorrectAnswer }: Level1Props) {
  const [challengeNumber, setChallengeNumber] = useState(0);
  const [challenge, setChallenge] = useState<Challenge>(() => generateChallenge(0));
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | string | null>(null);
  const [hintMultiplier, setHintMultiplier] = useState(1.0);
  const [hintsUsedTier, setHintsUsedTier] = useState(0);
  const [_totalHintsUsed, setTotalHintsUsed] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [showPeriodicTable, setShowPeriodicTable] = useState(false);

  // For build_molecule challenge
  const [builtAtoms, setBuiltAtoms] = useState<{ symbol: string; count: number }[]>([]);

  const totalChallenges = 8;
  const masteryThreshold = 6; // 6/8 = 75% required to pass
  const hasMastery = correctCount >= masteryThreshold;
  const isComplete = challengeNumber >= totalChallenges || hasMastery;

  // Reset built atoms when challenge changes
  useEffect(() => {
    setBuiltAtoms([]);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setHintMultiplier(1.0);
    setHintsUsedTier(0);
    setShowHint(false);
  }, [challenge]);

  const checkAnswer = (answer: number | string) => {
    setSelectedAnswer(answer);
    let correct = false;

    switch (challenge.type) {
      case 'count_atoms':
        correct = answer === challenge.correctCount;
        break;

      case 'compare_mass':
        const isHeavier = challenge.compound.molarMass > (challenge.compareCompound?.molarMass || 0);
        correct = (answer === 'first' && isHeavier) || (answer === 'second' && !isHeavier);
        break;

      case 'estimate_range':
        correct = answer === challenge.correctRangeIndex;
        break;

      case 'build_molecule':
        // Check if built atoms match the compound
        const targetElements = [...challenge.compound.elements].sort((a, b) => a.symbol.localeCompare(b.symbol));
        const builtElements = [...builtAtoms].sort((a, b) => a.symbol.localeCompare(b.symbol));
        correct = JSON.stringify(targetElements) === JSON.stringify(builtElements);
        break;
    }

    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      const points = Math.round(10 * hintMultiplier);
      setScore(prev => prev + points);
      setCorrectCount(prev => prev + 1);
      onCorrectAnswer?.();
    } else {
      onIncorrectAnswer?.();
    }
  };

  const nextChallenge = () => {
    const next = challengeNumber + 1;
    setChallengeNumber(next);
    if (next < totalChallenges) {
      setChallenge(generateChallenge(next));
    }
  };

  const addAtom = (symbol: string) => {
    setBuiltAtoms(prev => {
      const existing = prev.find(a => a.symbol === symbol);
      if (existing) {
        return prev.map(a => a.symbol === symbol ? { ...a, count: a.count + 1 } : a);
      }
      return [...prev, { symbol, count: 1 }];
    });
  };

  const removeAtom = (symbol: string) => {
    setBuiltAtoms(prev => {
      const existing = prev.find(a => a.symbol === symbol);
      if (existing && existing.count > 1) {
        return prev.map(a => a.symbol === symbol ? { ...a, count: a.count - 1 } : a);
      }
      return prev.filter(a => a.symbol !== symbol);
    });
  };

  const checkBuiltMolecule = () => {
    checkAnswer('build');
  };

  // Game complete screen with celebration
  if (isComplete) {
    const questionsAnswered = challengeNumber + (showFeedback ? 1 : 0);
    const accuracy = questionsAnswered > 0 ? Math.round((correctCount / questionsAnswered) * 100) : 0;
    const passedLevel = hasMastery;

    return (
      <div className={`min-h-screen bg-gradient-to-b ${passedLevel ? 'from-green-50' : 'from-yellow-50'} to-white flex items-center justify-center p-4`}>
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center animate-fade-in-up">
          <div className="text-6xl mb-4 animate-bounce-in">{passedLevel ? '🎉' : '💪'}</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            {passedLevel ? 'Frábært!' : 'Góð tilraun!'}
          </h2>
          <p className="text-gray-600 mb-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            {passedLevel
              ? `Þú náðir ${masteryThreshold}+ réttum svörum og hefur lokið Stigi 1!`
              : `Þú þarft ${masteryThreshold} rétt svör til að opna Stig 2. Reyndu aftur!`}
          </p>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-green-50 rounded-xl p-4 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              <div className="text-2xl font-bold text-green-600">{correctCount}/{questionsAnswered}</div>
              <div className="text-xs text-gray-600">Rétt svör</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
              <div className="text-2xl font-bold text-blue-600">{accuracy}%</div>
              <div className="text-xs text-gray-600">Nákvæmni</div>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
              <div className="text-2xl font-bold text-purple-600">{score}</div>
              <div className="text-xs text-gray-600">Stig</div>
            </div>
          </div>

          {/* Mastery progress */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6 animate-fade-in-up" style={{ animationDelay: '450ms' }}>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Framvinda í lærdómi</span>
              <span>{correctCount}/{masteryThreshold} rétt svör</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${passedLevel ? 'bg-green-500' : 'bg-yellow-500'}`}
                style={{ width: `${Math.min((correctCount / masteryThreshold) * 100, 100)}%` }}
              />
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-6 text-left animate-fade-in-up" style={{ animationDelay: '500ms' }}>
            <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
              <span className="text-lg">📚</span> Hvað lærðir þú?
            </h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Sameindir eru byggðar úr frumeindum</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Mismunandi frumeindir hafa mismunandi massa</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Formúlan sýnir hversu margar frumeindir eru</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Fleiri/þyngri frumeindir = meiri massi</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
            {passedLevel ? (
              <button
                onClick={() => onComplete(score, totalChallenges * 10, hintsUsedTier)}
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-xl transition-colors btn-press"
              >
                Halda áfram í Stig 2 →
              </button>
            ) : (
              <button
                onClick={() => {
                  setChallengeNumber(0);
                  setScore(0);
                  setCorrectCount(0);
                  setChallenge(generateChallenge(0));
                  setHintMultiplier(1.0);
                  setHintsUsedTier(0);
                }}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-xl transition-colors btn-press"
              >
                Reyna aftur
              </button>
            )}
            {passedLevel && (
              <button
                onClick={() => {
                  setChallengeNumber(0);
                  setScore(0);
                  setCorrectCount(0);
                  setChallenge(generateChallenge(0));
                  setHintMultiplier(1.0);
                  setHintsUsedTier(0);
                }}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-xl transition-colors"
              >
                Spila Aftur
              </button>
            )}
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
      case 'count_atoms':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-lg text-gray-700 mb-4">
                Hversu margar <span className="font-bold">{ATOM_VISUALS[challenge.targetElement!]?.name || challenge.targetElement}</span> frumeindir
                ({challenge.targetElement}) eru í <span className="font-bold">{challenge.compound.name}</span>?
              </p>

              <div className="text-4xl font-bold text-gray-800 mb-4">
                {challenge.compound.formula}
              </div>

              {viewMode === '2d' ? (
                <MoleculeVisual elements={challenge.compound.elements} />
              ) : (
                <div className="bg-gray-900 rounded-xl p-4">
                  <MoleculeViewer3DLazy
                    molecule={elementsToMolecule(challenge.compound.elements, challenge.compound.formula, challenge.compound.name)}
                    style="ball-stick"
                    showLabels={true}
                    autoRotate={true}
                    autoRotateSpeed={1.5}
                    height={180}
                    backgroundColor="transparent"
                  />
                  <div className="text-xs text-gray-400 mt-2">
                    Dragðu til að snúa, skrollaðu til að stækka
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              {[1, 2, 3, 4, 5, 6].map(num => (
                <button
                  key={num}
                  onClick={() => !showFeedback && checkAnswer(num)}
                  disabled={showFeedback}
                  className={`w-14 h-14 rounded-xl font-bold text-xl transition-all ${
                    showFeedback && selectedAnswer === num
                      ? isCorrect
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                      : showFeedback && num === challenge.correctCount
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>

            {showHint && !showFeedback && (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 text-center">
                <p className="text-sm text-yellow-800">
                  💡 <strong>Vísbending:</strong> Líttu á lítlu tölurnar í formúlunni.
                  Talan við hliðina á {challenge.targetElement} segir þér hversu margar eru!
                </p>
              </div>
            )}
          </div>
        );

      case 'compare_mass':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-lg text-gray-700 mb-4">
                Hvort efnið er <span className="font-bold">þyngra</span>?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => !showFeedback && checkAnswer('first')}
                disabled={showFeedback}
                className={`p-4 rounded-xl border-2 transition-all ${
                  showFeedback && selectedAnswer === 'first'
                    ? isCorrect
                      ? 'border-green-500 bg-green-50'
                      : 'border-red-500 bg-red-50'
                    : showFeedback && challenge.compound.molarMass > (challenge.compareCompound?.molarMass || 0)
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-primary hover:bg-orange-50'
                }`}
              >
                <div className="text-2xl font-bold text-gray-800 mb-2">
                  {challenge.compound.formula}
                </div>
                <div className="text-sm text-gray-600 mb-3">{challenge.compound.name}</div>
                {viewMode === '2d' ? (
                  <MoleculeVisual elements={challenge.compound.elements} />
                ) : (
                  <div className="bg-gray-900 rounded-lg p-2">
                    <MoleculeViewer3DLazy
                      molecule={elementsToMolecule(challenge.compound.elements, challenge.compound.formula, challenge.compound.name)}
                      style="ball-stick"
                      showLabels={true}
                      autoRotate={true}
                      autoRotateSpeed={2}
                      height={120}
                      backgroundColor="transparent"
                    />
                  </div>
                )}
              </button>

              <button
                onClick={() => !showFeedback && checkAnswer('second')}
                disabled={showFeedback}
                className={`p-4 rounded-xl border-2 transition-all ${
                  showFeedback && selectedAnswer === 'second'
                    ? isCorrect
                      ? 'border-green-500 bg-green-50'
                      : 'border-red-500 bg-red-50'
                    : showFeedback && (challenge.compareCompound?.molarMass || 0) > challenge.compound.molarMass
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-primary hover:bg-orange-50'
                }`}
              >
                <div className="text-2xl font-bold text-gray-800 mb-2">
                  {challenge.compareCompound?.formula}
                </div>
                <div className="text-sm text-gray-600 mb-3">{challenge.compareCompound?.name}</div>
                {viewMode === '2d' ? (
                  <MoleculeVisual elements={challenge.compareCompound?.elements || []} />
                ) : (
                  <div className="bg-gray-900 rounded-lg p-2">
                    <MoleculeViewer3DLazy
                      molecule={elementsToMolecule(challenge.compareCompound?.elements || [], challenge.compareCompound?.formula || '', challenge.compareCompound?.name)}
                      style="ball-stick"
                      showLabels={true}
                      autoRotate={true}
                      autoRotateSpeed={2}
                      height={120}
                      backgroundColor="transparent"
                    />
                  </div>
                )}
              </button>
            </div>

            {showHint && !showFeedback && (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 text-center">
                <p className="text-sm text-yellow-800">
                  💡 <strong>Vísbending:</strong> Stærri frumeindir eru þyngri.
                  Fleiri frumeindir þýðir einnig meiri massa!
                </p>
              </div>
            )}
          </div>
        );

      case 'build_molecule':
        // Get available elements from the compound
        const availableElements = [...new Set(challenge.compound.elements.map(e => e.symbol))];

        return (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-lg text-gray-700 mb-2">
                Byggðu sameindina <span className="font-bold">{challenge.compound.name}</span>
              </p>
              <div className="text-4xl font-bold text-gray-800 mb-4">
                {challenge.compound.formula}
              </div>
            </div>

            {/* Built molecule display */}
            <div className="bg-gray-100 rounded-xl p-4 min-h-[100px]">
              <div className="text-xs text-gray-500 mb-2 text-center">Þín sameind:</div>
              {builtAtoms.length > 0 ? (
                <MoleculeVisual elements={builtAtoms} showMassBar={true} />
              ) : (
                <div className="text-center text-gray-400 py-4">
                  Smelltu á frumeindir til að bæta þeim við
                </div>
              )}
            </div>

            {/* Atom palette */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
              <div className="text-xs text-gray-500 mb-3 text-center">Veldu frumeindir:</div>
              <div className="flex flex-wrap justify-center gap-4">
                {availableElements.map(symbol => {
                  const count = builtAtoms.find(a => a.symbol === symbol)?.count || 0;
                  return (
                    <div key={symbol} className="flex flex-col items-center gap-2">
                      <AtomCircle
                        symbol={symbol}
                        onClick={() => !showFeedback && addAtom(symbol)}
                      />
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => !showFeedback && removeAtom(symbol)}
                          disabled={showFeedback || count === 0}
                          className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 text-sm font-bold"
                        >
                          −
                        </button>
                        <span className="w-6 text-center font-bold">{count}</span>
                        <button
                          onClick={() => !showFeedback && addAtom(symbol)}
                          disabled={showFeedback}
                          className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 text-sm font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {!showFeedback && (
              <button
                onClick={checkBuiltMolecule}
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-xl transition-colors"
              >
                Athuga sameind
              </button>
            )}

            {showHint && !showFeedback && (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 text-center">
                <p className="text-sm text-yellow-800">
                  💡 <strong>Vísbending:</strong> Líttu á formúluna. Tölurnar segja þér nákvæmlega
                  hversu margar af hverri frumeind þú þarft!
                </p>
              </div>
            )}
          </div>
        );

      case 'estimate_range':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-lg text-gray-700 mb-4">
                Í hvaða massabil fellur <span className="font-bold">{challenge.compound.name}</span>?
              </p>

              <div className="text-4xl font-bold text-gray-800 mb-4">
                {challenge.compound.formula}
              </div>

              {viewMode === '2d' ? (
                <MoleculeVisual elements={challenge.compound.elements} showMassBar={true} />
              ) : (
                <div className="bg-gray-900 rounded-xl p-4 mb-4">
                  <MoleculeViewer3DLazy
                    molecule={elementsToMolecule(challenge.compound.elements, challenge.compound.formula, challenge.compound.name)}
                    style="ball-stick"
                    showLabels={true}
                    autoRotate={true}
                    autoRotateSpeed={1.5}
                    height={180}
                    backgroundColor="transparent"
                  />
                  <div className="text-xs text-gray-400 mt-2">
                    Dragðu til að snúa, skrollaðu til að stækka
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {challenge.ranges?.map((range, index) => (
                <button
                  key={index}
                  onClick={() => !showFeedback && checkAnswer(index)}
                  disabled={showFeedback}
                  className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all ${
                    showFeedback && selectedAnswer === index
                      ? isCorrect
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                      : showFeedback && index === challenge.correctRangeIndex
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>

            {showHint && !showFeedback && (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 text-center">
                <p className="text-sm text-yellow-800">
                  💡 <strong>Vísbending:</strong> Hugsaðu um stærðina á frumeindunum og hversu margar eru.
                  H er um 1 g/mol, O er um 16 g/mol, C er um 12 g/mol.
                </p>
              </div>
            )}
          </div>
        );
    }
  };

  const getChallengeTitle = () => {
    switch (challenge.type) {
      case 'count_atoms': return 'Telja frumeindir';
      case 'compare_mass': return 'Bera saman massa';
      case 'build_molecule': return 'Byggja sameind';
      case 'estimate_range': return 'Áætla massabil';
      default: return 'Áskorun';
    }
  };

  // Note: TieredHints available via HintSystem component for future integration
  // getChallengeHints() can be implemented when HintSystem is added to this game

  // Generate detailed feedback for FeedbackPanel
  const getDetailedFeedback = (): DetailedFeedback => {
    const elementName = ATOM_VISUALS[challenge.targetElement!]?.name || challenge.targetElement;

    switch (challenge.type) {
      case 'count_atoms': {
        if (isCorrect) {
          return {
            isCorrect: true,
            explanation: `Rétt! Í ${challenge.compound.formula} eru ${challenge.correctCount} ${elementName} frumeindir. Þú fannst rétt tölu með því að lesa formúluna.`,
            relatedConcepts: ['Efnaformúlur', 'Subscripts', 'Frumeindir'],
            nextSteps: 'Reyndu næst að bera saman massa sameinda.',
          };
        }
        return {
          isCorrect: false,
          explanation: `Í ${challenge.compound.formula} eru ${challenge.correctCount} ${elementName} (${challenge.targetElement}) frumeindir. Líttu á töluna við hliðina á ${challenge.targetElement} í formúlunni.`,
          misconception: 'Mundu: Ef engin tala er við hliðina á frumefninu, þá er 1 frumeind. Talan (subscript) á aðeins við það frumefni sem hún er við.',
          relatedConcepts: ['Efnaformúlur', 'Subscripts'],
          nextSteps: 'Æfðu þig í að lesa subscripts í mismunandi formúlum.',
        };
      }

      case 'compare_mass': {
        const heavier = challenge.compound.molarMass > (challenge.compareCompound?.molarMass || 0)
          ? challenge.compound
          : challenge.compareCompound;
        const lighter = challenge.compound.molarMass <= (challenge.compareCompound?.molarMass || 0)
          ? challenge.compound
          : challenge.compareCompound;

        if (isCorrect) {
          return {
            isCorrect: true,
            explanation: `Rétt! ${heavier?.name} (${heavier?.molarMass.toFixed(1)} g/mol) er þyngri en ${lighter?.name} (${lighter?.molarMass.toFixed(1)} g/mol).`,
            relatedConcepts: ['Mólmassi', 'Atómmassi', 'Samanburður'],
            nextSteps: 'Reyndu að áætla í hvaða massabil sameind fellur.',
          };
        }
        return {
          isCorrect: false,
          explanation: `${heavier?.name} er í raun þyngri (${heavier?.molarMass.toFixed(1)} g/mol) en ${lighter?.name} (${lighter?.molarMass.toFixed(1)} g/mol).`,
          misconception: 'Stærri frumeindir (eins og O, Cl, Na) hafa meiri massa en litlar (eins og H). Fleiri frumeindir þýðir líka meiri massa.',
          relatedConcepts: ['Mólmassi', 'Atómmassi'],
          nextSteps: 'Hugsaðu um bæði stærð og fjölda frumefna þegar þú berð saman.',
        };
      }

      case 'build_molecule': {
        const targetFormula = challenge.compound.elements.map(e =>
          `${e.count}× ${ATOM_VISUALS[e.symbol]?.name || e.symbol}`
        ).join(' + ');

        if (isCorrect) {
          return {
            isCorrect: true,
            explanation: `Frábært! Þú byggðir ${challenge.compound.name} (${challenge.compound.formula}) rétt: ${targetFormula}.`,
            relatedConcepts: ['Efnaformúlur', 'Sameindir', 'Frumeindir'],
            nextSteps: 'Reyndu nú að áætla mólmassa þessarar sameindar.',
          };
        }
        return {
          isCorrect: false,
          explanation: `${challenge.compound.name} (${challenge.compound.formula}) inniheldur: ${targetFormula}. Berðu saman við það sem þú byggðir.`,
          misconception: 'Lestu formúluna vandlega - hver tala (subscript) segir þér nákvæmlega hversu margar af hverri frumeind þarf.',
          relatedConcepts: ['Efnaformúlur', 'Sameindir'],
          nextSteps: 'Byrjaðu á fyrsta frumefninu og farðu kerfisbundið í gegnum formúluna.',
        };
      }

      case 'estimate_range': {
        const mass = challenge.compound.molarMass;
        const correctRange = challenge.ranges?.[challenge.correctRangeIndex!];
        const calculation = challenge.compound.elements.map(e =>
          `${e.count}×${ATOMIC_MASSES[e.symbol]?.toFixed(0) || '?'}`
        ).join(' + ');

        if (isCorrect) {
          return {
            isCorrect: true,
            explanation: `Rétt! ${challenge.compound.name} = ${mass.toFixed(1)} g/mol (${calculation}), sem fellur í bilið ${correctRange?.label}.`,
            relatedConcepts: ['Mólmassi', 'Atómmassi', 'Útreikningar'],
            nextSteps: 'Þú ert tilbúin/n að reikna nákvæman mólmassa!',
          };
        }
        return {
          isCorrect: false,
          explanation: `${challenge.compound.name} = ${calculation} = ${mass.toFixed(1)} g/mol, sem fellur í bilið ${correctRange?.label}.`,
          misconception: 'Mundu atómmassamina: H≈1, C≈12, N≈14, O≈16 g/mol. Margfaldaðu með fjöldanum og leggðu saman.',
          relatedConcepts: ['Mólmassi', 'Atómmassi'],
          nextSteps: 'Æfðu þig í að leggja saman atómmassa - það er grunnurinn að mólmassaútreikningum.',
        };
      }

      default:
        return {
          isCorrect,
          explanation: isCorrect ? 'Rétt svar!' : 'Rangt svar.',
        };
    }
  };

  // Hints available via getChallengeHints() for future HintSystem integration

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-800">Mólmassi - Stig 1</h1>
              <p className="text-sm text-gray-600">Skildu sameindir án útreikninga</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{score}</div>
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
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${((challengeNumber + 1) / totalChallenges) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Toolbar: 2D/3D Toggle + Periodic Table */}
        <div className="flex justify-center items-center gap-4 mb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('2d')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                viewMode === '2d'
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              2D
            </button>
            <button
              onClick={() => setViewMode('3d')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                viewMode === '3d'
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              3D
            </button>
          </div>

          {/* Periodic Table Button */}
          <button
            onClick={() => setShowPeriodicTable(true)}
            className="px-4 py-1.5 rounded-lg text-sm font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors flex items-center gap-1"
          >
            <span>📊</span> Lotukerfið
          </button>
        </div>

        {/* Challenge Card with entrance animation */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-4 card-enter" key={challengeNumber}>
          {renderChallenge()}
        </div>

        {/* Detailed Feedback with FeedbackPanel */}
        {showFeedback && (
          <div className="mb-4 animate-fade-in-up">
            <FeedbackPanel
              feedback={getDetailedFeedback()}
              config={{
                showExplanation: true,
                showMisconceptions: true,
                showRelatedConcepts: true,
                showNextSteps: true,
              }}
              className="mb-3"
            />

            {isCorrect && (
              <p className="text-green-700 text-sm text-center mb-3">+{Math.round(10 * hintMultiplier)} stig!</p>
            )}

            <button
              onClick={nextChallenge}
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg transition-colors btn-press"
            >
              {challengeNumber + 1 < totalChallenges ? 'Næsta áskorun →' : 'Sjá niðurstöður →'}
            </button>
          </div>
        )}

        {/* Hint button */}
        {!showFeedback && !showHint && (
          <button
            onClick={() => {
              setShowHint(true);
              setTotalHintsUsed(prev => prev + 1);
            }}
            className="w-full bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-semibold py-3 px-4 rounded-xl transition-colors"
          >
            💡 Vísbending
          </button>
        )}

        {/* Educational note */}
        <div className="mt-6 bg-blue-50 rounded-xl p-4">
          <h3 className="font-bold text-blue-800 mb-2">Lykilhugmynd:</h3>
          <p className="text-sm text-gray-700">
            {challenge.type === 'count_atoms' && 'Formúlan segir þér hversu margar frumeindir eru í sameind. Lítlu tölurnar (subscripts) sýna fjöldann.'}
            {challenge.type === 'compare_mass' && 'Stærri frumeindir eru þyngri. Súrefni (O) er ~16× þyngri en vetni (H).'}
            {challenge.type === 'build_molecule' && 'Sameindir eru byggðar úr frumeindum. Hver frumeind hefur sinn eigin massa.'}
            {challenge.type === 'estimate_range' && 'Mólmassi er summa allra frumeindasmassa í sameind. H≈1, C≈12, N≈14, O≈16 g/mol.'}
          </p>
        </div>

        {/* Back button */}
        <button
          onClick={onBack}
          className="mt-4 w-full text-gray-500 hover:text-gray-700 font-semibold py-2"
        >
          ← Til baka í valmynd
        </button>
      </div>

      {/* Periodic Table Modal */}
      {showPeriodicTable && (
        <PeriodicTable
          onClose={() => setShowPeriodicTable(false)}
          showApproximate={true}
          highlightElements={challenge.compound.elements.map(e => e.symbol)}
        />
      )}
    </div>
  );
}

export default Level1;
