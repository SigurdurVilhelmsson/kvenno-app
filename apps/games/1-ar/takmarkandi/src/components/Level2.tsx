import { useState } from 'react';
import { Reaction } from '../types';
import { REACTIONS } from '../data/reactions';
import { getMolarMass, roundMass } from '../data/molar-masses';
import { Molecule } from './Molecule';
import { ReactionAnimation } from './ReactionAnimation';

interface Level2Props {
  onComplete: (score: number, maxScore: number, hintsUsed: number) => void;
  onBack: () => void;
  onCorrectAnswer?: () => void;
  onIncorrectAnswer?: () => void;
}

type ProblemMode = 'molecules' | 'grams';
type Step = 'moles_r1' | 'moles_r2' | 'times_r1' | 'times_r2' | 'limiting' | 'products' | 'excess' | 'complete';

interface Problem {
  reaction: Reaction;
  mode: ProblemMode;
  // For molecules mode
  r1Count: number;
  r2Count: number;
  // For grams mode
  r1Grams: number;
  r2Grams: number;
  r1MolarMass: number;
  r2MolarMass: number;
  // Correct answers (moles for gram mode, count for molecule mode)
  molesR1: number;
  molesR2: number;
  timesR1: number;
  timesR2: number;
  limitingReactant: string;
  productsFormed: number;
  productGrams: number;
  productMolarMass: number;
  excessRemaining: number;
  excessGrams: number;
}

// Use easy and medium reactions for Level 2
const LEVEL2_REACTIONS = REACTIONS.filter(r => r.difficulty === 'easy' || r.difficulty === 'medium');

function generateProblem(mode: ProblemMode): Problem {
  const reaction = LEVEL2_REACTIONS[Math.floor(Math.random() * LEVEL2_REACTIONS.length)];
  const r1MolarMass = getMolarMass(reaction.reactant1.formula);
  const r2MolarMass = getMolarMass(reaction.reactant2.formula);
  const productMolarMass = getMolarMass(reaction.products[0].formula);

  // Generate counts that create a clear limiting reactant
  let r1Count: number, r2Count: number;

  // Randomize which is limiting
  if (Math.random() < 0.5) {
    // R1 is limiting
    r1Count = reaction.reactant1.coeff * (Math.floor(Math.random() * 3) + 2); // 2-4 times
    r2Count = reaction.reactant2.coeff * (Math.floor(Math.random() * 3) + 4); // 4-6 times
  } else {
    // R2 is limiting
    r1Count = reaction.reactant1.coeff * (Math.floor(Math.random() * 3) + 4);
    r2Count = reaction.reactant2.coeff * (Math.floor(Math.random() * 3) + 2);
  }

  // For grams mode, convert to "nice" gram values
  let r1Grams: number, r2Grams: number;
  let molesR1: number, molesR2: number;

  if (mode === 'grams') {
    // Generate mole amounts that give nice gram values
    molesR1 = roundMass(r1Count * 0.5); // Use fractional moles for variety
    molesR2 = roundMass(r2Count * 0.5);
    r1Grams = roundMass(molesR1 * r1MolarMass);
    r2Grams = roundMass(molesR2 * r2MolarMass);
    // Recalculate moles from grams (for exact values)
    molesR1 = roundMass(r1Grams / r1MolarMass);
    molesR2 = roundMass(r2Grams / r2MolarMass);
  } else {
    r1Grams = 0;
    r2Grams = 0;
    molesR1 = r1Count;
    molesR2 = r2Count;
  }

  // Calculate correct answers based on moles
  const timesR1 = molesR1 / reaction.reactant1.coeff;
  const timesR2 = molesR2 / reaction.reactant2.coeff;
  const limitingReactant = timesR1 <= timesR2 ? reaction.reactant1.formula : reaction.reactant2.formula;
  const timesReactionRuns = Math.min(timesR1, timesR2);
  const productsFormed = reaction.products[0].coeff * timesReactionRuns;
  const productGrams = roundMass(productsFormed * productMolarMass);

  const excessRemaining = limitingReactant === reaction.reactant1.formula
    ? molesR2 - (timesReactionRuns * reaction.reactant2.coeff)
    : molesR1 - (timesReactionRuns * reaction.reactant1.coeff);

  const excessMolarMass = limitingReactant === reaction.reactant1.formula ? r2MolarMass : r1MolarMass;
  const excessGrams = roundMass(excessRemaining * excessMolarMass);

  return {
    reaction,
    mode,
    r1Count,
    r2Count,
    r1Grams,
    r2Grams,
    r1MolarMass,
    r2MolarMass,
    molesR1: roundMass(molesR1),
    molesR2: roundMass(molesR2),
    timesR1: roundMass(timesR1),
    timesR2: roundMass(timesR2),
    limitingReactant,
    productsFormed: roundMass(productsFormed),
    productGrams,
    productMolarMass,
    excessRemaining: roundMass(excessRemaining),
    excessGrams
  };
}

export function Level2({ onComplete, onBack, onCorrectAnswer, onIncorrectAnswer }: Level2Props) {
  const [problemMode, setProblemMode] = useState<ProblemMode>('molecules');
  const [problemIndex, setProblemIndex] = useState(0);
  const [problem, setProblem] = useState<Problem>(() => generateProblem('molecules'));
  const [currentStep, setCurrentStep] = useState<Step>('times_r1');
  const [score, setScore] = useState(0);
  const [correctProblems, setCorrectProblems] = useState(0);
  const [input, setInput] = useState('');
  const [selectedLimiting, setSelectedLimiting] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isStepCorrect, setIsStepCorrect] = useState(false);
  const [problemCorrectSoFar, setProblemCorrectSoFar] = useState(true);
  const [totalHintsUsed, setTotalHintsUsed] = useState(0);
  const [showModeSelect, setShowModeSelect] = useState(true); // Show mode selection at start

  const totalProblems = 8;
  const masteryThreshold = 6;
  const hasMastery = correctProblems >= masteryThreshold;
  const isComplete = problemIndex >= totalProblems || hasMastery;
  const isGramMode = problem.mode === 'grams';

  const checkStep = () => {
    let correct = false;
    const numInput = parseFloat(input);

    // Tolerance for gram/mole calculations (allow 5% error)
    const isCloseEnough = (val: number, expected: number) => {
      if (expected === 0) return val === 0;
      const tolerance = Math.abs(expected * 0.05);
      return Math.abs(val - expected) <= Math.max(tolerance, 0.01);
    };

    switch (currentStep) {
      case 'moles_r1':
        correct = isCloseEnough(numInput, problem.molesR1);
        break;
      case 'moles_r2':
        correct = isCloseEnough(numInput, problem.molesR2);
        break;
      case 'times_r1':
        correct = isGramMode ? isCloseEnough(numInput, problem.timesR1) : numInput === problem.timesR1;
        break;
      case 'times_r2':
        correct = isGramMode ? isCloseEnough(numInput, problem.timesR2) : numInput === problem.timesR2;
        break;
      case 'limiting':
        correct = selectedLimiting === problem.limitingReactant;
        break;
      case 'products':
        if (isGramMode) {
          correct = isCloseEnough(numInput, problem.productGrams);
        } else {
          correct = numInput === problem.productsFormed;
        }
        break;
      case 'excess':
        if (isGramMode) {
          correct = isCloseEnough(numInput, problem.excessGrams);
        } else {
          correct = numInput === problem.excessRemaining;
        }
        break;
    }

    setIsStepCorrect(correct);
    setShowFeedback(true);

    if (!correct) {
      setProblemCorrectSoFar(false);
      onIncorrectAnswer?.();
    }

    if (correct) {
      setScore(prev => prev + 5);
      onCorrectAnswer?.();
    }
  };

  const nextStep = () => {
    setShowFeedback(false);
    setInput('');
    setSelectedLimiting(null);

    // Different step order based on mode
    const stepOrder: Step[] = isGramMode
      ? ['moles_r1', 'moles_r2', 'times_r1', 'times_r2', 'limiting', 'products', 'excess', 'complete']
      : ['times_r1', 'times_r2', 'limiting', 'products', 'excess', 'complete'];
    const currentIndex = stepOrder.indexOf(currentStep);

    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    }
  };

  const nextProblem = () => {
    if (problemCorrectSoFar) {
      setCorrectProblems(prev => prev + 1);
    }

    const next = problemIndex + 1;
    setProblemIndex(next);

    if (next < totalProblems) {
      setProblem(generateProblem(problemMode));
      setCurrentStep(problemMode === 'grams' ? 'moles_r1' : 'times_r1');
      setInput('');
      setSelectedLimiting(null);
      setShowFeedback(false);
      setProblemCorrectSoFar(true);
    }
  };

  const startWithMode = (mode: ProblemMode) => {
    setProblemMode(mode);
    setProblem(generateProblem(mode));
    setCurrentStep(mode === 'grams' ? 'moles_r1' : 'times_r1');
    setShowModeSelect(false);
  };

  // Mode selection screen
  if (showModeSelect) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 p-4">
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">⚗️</div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Stig 2: Leiðbeind æfing</h1>
              <p className="text-gray-600">Veldu hvernig þú vilt æfa</p>
            </div>

            <div className="space-y-4 mb-8">
              <button
                onClick={() => startWithMode('molecules')}
                className="w-full bg-white border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 rounded-xl p-6 text-left transition-all"
              >
                <div className="flex items-center gap-4">
                  <span className="text-4xl">🔵</span>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-1">Sameindir</h3>
                    <p className="text-gray-600 text-sm">
                      Byrjaðu með að telja sameindir - einfaldara og sjónrænna
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => startWithMode('grams')}
                className="w-full bg-white border-2 border-yellow-200 hover:border-yellow-400 hover:bg-yellow-50 rounded-xl p-6 text-left transition-all"
              >
                <div className="flex items-center gap-4">
                  <span className="text-4xl">⚖️</span>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-1">Grömm og mól</h3>
                    <p className="text-gray-600 text-sm">
                      Æfðu að breyta grömmum í mól - eins og í raunverulegri tilraun
                    </p>
                    <p className="text-xs text-yellow-600 mt-1">
                      + Fleiri skref: grömm → mól → hlutföll
                    </p>
                  </div>
                </div>
              </button>
            </div>

            <div className="bg-blue-50 rounded-xl p-4 mb-6">
              <h4 className="font-bold text-blue-800 mb-2">Munurinn:</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li><strong>Sameindir:</strong> Þú vinnur með fjölda sameinda (t.d. 6 sameindir)</li>
                <li><strong>Grömm:</strong> Þú byrjar með massa og breytir í mól með mólmassa</li>
              </ul>
            </div>

            <button
              onClick={onBack}
              className="w-full text-gray-500 hover:text-gray-700 font-semibold py-2"
            >
              ← Til baka í valmynd
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Complete screen
  if (isComplete) {
    const passedLevel = hasMastery;

    return (
      <div className={`min-h-screen bg-gradient-to-b ${passedLevel ? 'from-green-50' : 'from-yellow-50'} to-white p-4`}>
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="text-6xl mb-4">{passedLevel ? '🎓' : '📚'}</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {passedLevel ? 'Vel gert!' : 'Góð æfing!'}
            </h2>
            <p className="text-gray-600 mb-6">
              {passedLevel
                ? `Þú náðir ${correctProblems}+ fullkomnum verkefnum og hefur lokið Stigi 2!`
                : `Þú þarft ${masteryThreshold} fullkomin verkefni til að opna Stig 3. Reyndu aftur!`}
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-green-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-green-600">{correctProblems}/{problemIndex + 1}</div>
                <div className="text-xs text-gray-600">Fullkomin</div>
              </div>
              <div className="bg-purple-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-purple-600">{score}</div>
                <div className="text-xs text-gray-600">Stig</div>
              </div>
            </div>

            {/* Mastery progress */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Framvinda í lærdómi</span>
                <span>{correctProblems}/{masteryThreshold} fullkomin</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${passedLevel ? 'bg-green-500' : 'bg-yellow-500'}`}
                  style={{ width: `${Math.min((correctProblems / masteryThreshold) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* What you learned */}
            <div className="bg-blue-50 rounded-xl p-4 mb-6 text-left">
              <h3 className="font-bold text-blue-800 mb-3">
                Aðferðin {problemMode === 'grams' ? '(með grömmum)' : '(með sameindum)'}:
              </h3>
              <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
                {problemMode === 'grams' ? (
                  <>
                    <li>Breyta grömmum í mól: mól = grömm ÷ mólmassi</li>
                    <li>Reikna hversu oft R1 getur hvarfast: mól ÷ stuðull</li>
                    <li>Reikna hversu oft R2 getur hvarfast: mól ÷ stuðull</li>
                    <li>Takmarkandi = sá með FÆRRI skipti</li>
                    <li>Afurðir í grömmum = mól afurðar × mólmassi</li>
                    <li>Afgangur í grömmum = mól afgangur × mólmassi</li>
                  </>
                ) : (
                  <>
                    <li>Reikna hversu oft R1 getur hvarfast: sameindir ÷ stuðull</li>
                    <li>Reikna hversu oft R2 getur hvarfast: sameindir ÷ stuðull</li>
                    <li>Takmarkandi = sá með FÆRRI skipti</li>
                    <li>Afurðir = fjöldi skipta × stuðull afurðar</li>
                    <li>Afgangur = upphafleg - notuð</li>
                  </>
                )}
              </ol>
            </div>

            <div className="space-y-3">
              {passedLevel ? (
                <button
                  onClick={() => onComplete(score, totalProblems * 25, totalHintsUsed)}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl transition-colors"
                >
                  Halda áfram í Stig 3 →
                </button>
              ) : (
                <button
                  onClick={() => {
                    setProblemIndex(0);
                    setScore(0);
                    setCorrectProblems(0);
                    setProblem(generateProblem(problemMode));
                    setCurrentStep(problemMode === 'grams' ? 'moles_r1' : 'times_r1');
                    setInput('');
                    setSelectedLimiting(null);
                    setShowFeedback(false);
                    setProblemCorrectSoFar(true);
                    setTotalHintsUsed(0);
                  }}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-xl transition-colors"
                >
                  Reyna aftur
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
      </div>
    );
  }

  // Problem complete - show summary before next
  if (currentStep === 'complete') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 p-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-md p-4 mb-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-xl font-bold text-gray-800">Takmarkandi - Stig 2</h1>
                <p className="text-sm text-gray-600">Verkefni {problemIndex + 1}/{totalProblems}</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{score}</div>
                <div className="text-xs text-gray-600">Stig</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">{problemCorrectSoFar ? '✅' : '📝'}</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {problemCorrectSoFar ? 'Fullkomið!' : 'Verkefni lokið'}
              </h2>
              <p className="text-gray-600">
                {problemCorrectSoFar
                  ? 'Þú svaraðir öllum skrefum rétt!'
                  : 'Þú lærðir af mistökunum. Haltu áfram að æfa!'}
              </p>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <h3 className="font-bold text-gray-800 mb-3">Samantekt:</h3>
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span>Hvörf:</span>
                  <span className="font-mono">{problem.reaction.equation}</span>
                </div>
                <div className="flex justify-between">
                  <span>{problem.reaction.reactant1.formula} sinnum:</span>
                  <span className="font-bold">{problem.timesR1}</span>
                </div>
                <div className="flex justify-between">
                  <span>{problem.reaction.reactant2.formula} sinnum:</span>
                  <span className="font-bold">{problem.timesR2}</span>
                </div>
                <div className="flex justify-between">
                  <span>Takmarkandi:</span>
                  <span className="font-bold text-orange-600">{problem.limitingReactant}</span>
                </div>
                <div className="flex justify-between">
                  <span>{problem.reaction.products[0].formula} myndast:</span>
                  <span className="font-bold text-green-600">{problem.productsFormed}</span>
                </div>
                <div className="flex justify-between">
                  <span>Afgangur:</span>
                  <span className="font-bold text-blue-600">{problem.excessRemaining}</span>
                </div>
              </div>
            </div>

            {/* Animated reaction visualization */}
            <div className="mb-6">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="text-xl">🔬</span> Sjáðu hvörfin gerast!
              </h3>
              <ReactionAnimation
                reactant1={problem.reaction.reactant1}
                reactant2={problem.reaction.reactant2}
                products={problem.reaction.products}
                r1Count={isGramMode ? Math.round(problem.molesR1) : problem.r1Count}
                r2Count={isGramMode ? Math.round(problem.molesR2) : problem.r2Count}
                autoPlay={true}
                showResult={true}
              />
            </div>

            <button
              onClick={nextProblem}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl transition-colors"
            >
              {problemIndex + 1 < totalProblems ? 'Næsta verkefni →' : 'Sjá niðurstöður →'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Get step info - different steps based on mode
  const getStepInfo = () => {
    const totalSteps = isGramMode ? 7 : 5;
    const timesRun = Math.min(problem.timesR1, problem.timesR2);
    const excessReactant = problem.limitingReactant === problem.reaction.reactant1.formula
      ? problem.reaction.reactant2
      : problem.reaction.reactant1;

    if (isGramMode) {
      // Gram mode steps
      switch (currentStep) {
        case 'moles_r1':
          return {
            stepNumber: 1,
            totalSteps,
            title: `Skref 1: Breyta grömmum af ${problem.reaction.reactant1.formula} í mól`,
            instruction: `Þú hefur ${problem.r1Grams} g af ${problem.reaction.reactant1.formula}. Mólmassi ${problem.reaction.reactant1.formula} er ${problem.r1MolarMass} g/mol`,
            formula: `mól = grömm ÷ mólmassi = ${problem.r1Grams} ÷ ${problem.r1MolarMass} = ?`,
            correctAnswer: problem.molesR1,
            unit: 'mól'
          };
        case 'moles_r2':
          return {
            stepNumber: 2,
            totalSteps,
            title: `Skref 2: Breyta grömmum af ${problem.reaction.reactant2.formula} í mól`,
            instruction: `Þú hefur ${problem.r2Grams} g af ${problem.reaction.reactant2.formula}. Mólmassi ${problem.reaction.reactant2.formula} er ${problem.r2MolarMass} g/mol`,
            formula: `mól = grömm ÷ mólmassi = ${problem.r2Grams} ÷ ${problem.r2MolarMass} = ?`,
            correctAnswer: problem.molesR2,
            unit: 'mól'
          };
        case 'times_r1':
          return {
            stepNumber: 3,
            totalSteps,
            title: `Skref 3: Hversu oft getur ${problem.reaction.reactant1.formula} hvarfast?`,
            instruction: `Þú hefur ${problem.molesR1} mól af ${problem.reaction.reactant1.formula} og stuðullinn er ${problem.reaction.reactant1.coeff}`,
            formula: `Fjöldi skipta = mól ÷ stuðull = ${problem.molesR1} ÷ ${problem.reaction.reactant1.coeff} = ?`,
            correctAnswer: problem.timesR1,
            unit: 'skipti'
          };
        case 'times_r2':
          return {
            stepNumber: 4,
            totalSteps,
            title: `Skref 4: Hversu oft getur ${problem.reaction.reactant2.formula} hvarfast?`,
            instruction: `Þú hefur ${problem.molesR2} mól af ${problem.reaction.reactant2.formula} og stuðullinn er ${problem.reaction.reactant2.coeff}`,
            formula: `Fjöldi skipta = mól ÷ stuðull = ${problem.molesR2} ÷ ${problem.reaction.reactant2.coeff} = ?`,
            correctAnswer: problem.timesR2,
            unit: 'skipti'
          };
        case 'limiting':
          return {
            stepNumber: 5,
            totalSteps,
            title: 'Skref 5: Hvort er takmarkandi hvarfefnið?',
            instruction: `${problem.reaction.reactant1.formula} getur hvarfast ${roundMass(problem.timesR1)} sinnum. ${problem.reaction.reactant2.formula} getur hvarfast ${roundMass(problem.timesR2)} sinnum. Hvort takmarkar hvörfin?`,
            formula: 'Takmarkandi = hvarfefnið með FÆRRI skipti',
            correctAnswer: problem.limitingReactant,
            unit: ''
          };
        case 'products':
          const productMoles = roundMass(timesRun * problem.reaction.products[0].coeff);
          return {
            stepNumber: 6,
            totalSteps,
            title: `Skref 6: Hvað myndast mörg grömm af ${problem.reaction.products[0].formula}?`,
            instruction: `Hvörfin geta gerst ${roundMass(timesRun)} sinnum. Stuðull ${problem.reaction.products[0].formula} er ${problem.reaction.products[0].coeff}, þannig ${productMoles} mól myndast. Mólmassi ${problem.reaction.products[0].formula} er ${problem.productMolarMass} g/mol`,
            formula: `Massi = mól × mólmassi = ${productMoles} × ${problem.productMolarMass} = ?`,
            correctAnswer: problem.productGrams,
            unit: 'g'
          };
        case 'excess':
          const excessMolarMass = problem.limitingReactant === problem.reaction.reactant1.formula
            ? problem.r2MolarMass
            : problem.r1MolarMass;
          return {
            stepNumber: 7,
            totalSteps,
            title: `Skref 7: Hvað verða mörg grömm af ${excessReactant.formula} eftir?`,
            instruction: `${roundMass(problem.excessRemaining)} mól af ${excessReactant.formula} verða eftir. Mólmassi ${excessReactant.formula} er ${excessMolarMass} g/mol`,
            formula: `Massi = mól × mólmassi = ${roundMass(problem.excessRemaining)} × ${excessMolarMass} = ?`,
            correctAnswer: problem.excessGrams,
            unit: 'g'
          };
        default:
          return { stepNumber: 0, totalSteps, title: '', instruction: '', formula: '', correctAnswer: 0, unit: '' };
      }
    } else {
      // Molecule mode steps (original)
      switch (currentStep) {
        case 'times_r1':
          return {
            stepNumber: 1,
            totalSteps,
            title: `Skref 1: Hversu oft getur ${problem.reaction.reactant1.formula} hvarfast?`,
            instruction: `Þú hefur ${problem.r1Count} ${problem.reaction.reactant1.formula} og stuðullinn er ${problem.reaction.reactant1.coeff}`,
            formula: `Fjöldi skipta = sameindir ÷ stuðull = ${problem.r1Count} ÷ ${problem.reaction.reactant1.coeff} = ?`,
            correctAnswer: problem.timesR1,
            unit: 'skipti'
          };
        case 'times_r2':
          return {
            stepNumber: 2,
            totalSteps,
            title: `Skref 2: Hversu oft getur ${problem.reaction.reactant2.formula} hvarfast?`,
            instruction: `Þú hefur ${problem.r2Count} ${problem.reaction.reactant2.formula} og stuðullinn er ${problem.reaction.reactant2.coeff}`,
            formula: `Fjöldi skipta = sameindir ÷ stuðull = ${problem.r2Count} ÷ ${problem.reaction.reactant2.coeff} = ?`,
            correctAnswer: problem.timesR2,
            unit: 'skipti'
          };
        case 'limiting':
          return {
            stepNumber: 3,
            totalSteps,
            title: 'Skref 3: Hvort er takmarkandi hvarfefnið?',
            instruction: `${problem.reaction.reactant1.formula} getur hvarfast ${problem.timesR1} sinnum. ${problem.reaction.reactant2.formula} getur hvarfast ${problem.timesR2} sinnum. Hvort takmarkar hvörfin?`,
            formula: 'Takmarkandi = hvarfefnið með FÆRRI skipti',
            correctAnswer: problem.limitingReactant,
            unit: ''
          };
        case 'products':
          return {
            stepNumber: 4,
            totalSteps,
            title: `Skref 4: Hversu margar ${problem.reaction.products[0].formula} myndast?`,
            instruction: `Hvörfin geta gerst ${Math.floor(timesRun)} sinnum. Stuðull ${problem.reaction.products[0].formula} er ${problem.reaction.products[0].coeff}`,
            formula: `Afurðir = fjöldi skipta × stuðull = ${Math.floor(timesRun)} × ${problem.reaction.products[0].coeff} = ?`,
            correctAnswer: problem.productsFormed,
            unit: 'sameindir'
          };
        case 'excess':
          const excessStartCount = problem.limitingReactant === problem.reaction.reactant1.formula
            ? problem.r2Count
            : problem.r1Count;
          const used = Math.floor(timesRun) * excessReactant.coeff;
          return {
            stepNumber: 5,
            totalSteps,
            title: `Skref 5: Hversu margar ${excessReactant.formula} verða eftir?`,
            instruction: `Þú byrjaðir með ${excessStartCount} ${excessReactant.formula}. Hvörfin notuðu ${Math.floor(timesRun)} × ${excessReactant.coeff} = ${used} sameindir`,
            formula: `Afgangur = upphafs - notuð = ${excessStartCount} - ${used} = ?`,
            correctAnswer: problem.excessRemaining,
            unit: 'sameindir'
          };
        default:
          return { stepNumber: 0, totalSteps, title: '', instruction: '', formula: '', correctAnswer: 0, unit: '' };
      }
    }
  };

  const stepInfo = getStepInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-800">Takmarkandi - Stig 2</h1>
              <p className="text-sm text-gray-600">
                {isGramMode ? '⚖️ Grömm og mól' : '🔵 Sameindir'}
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{score}</div>
              <div className="text-xs text-gray-600">Stig</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Verkefni {problemIndex + 1}/{totalProblems}</span>
              <span>{correctProblems}/{masteryThreshold} fullkomin</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 transition-all duration-500"
                style={{ width: `${((problemIndex + 1) / totalProblems) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Equation display */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-4">
          <div className="text-center text-xl font-mono bg-gray-50 p-3 rounded-lg">
            {problem.reaction.equation}
          </div>
        </div>

        {/* Reactants visualization */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-4">
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-xl ${
              currentStep === 'moles_r1' || currentStep === 'times_r1' ? 'bg-orange-50 border-2 border-orange-300' :
              currentStep === 'limiting' && selectedLimiting === problem.reaction.reactant1.formula ? 'bg-orange-100 border-2 border-orange-500' :
              'bg-gray-50'
            }`}>
              <div className="text-center mb-2">
                <div className="text-lg font-bold">{problem.reaction.reactant1.formula}</div>
                {isGramMode ? (
                  <>
                    <div className="text-sm text-gray-600 font-semibold">{problem.r1Grams} g</div>
                    <div className="text-xs text-gray-500">M = {problem.r1MolarMass} g/mol</div>
                  </>
                ) : (
                  <div className="text-sm text-gray-600">{problem.r1Count} sameindur</div>
                )}
                <div className="text-xs text-gray-500">Stuðull: {problem.reaction.reactant1.coeff}</div>
              </div>
              {!isGramMode && (
                <div className="flex flex-wrap justify-center gap-1">
                  {Array.from({ length: Math.min(problem.r1Count, 8) }).map((_, i) => (
                    <Molecule
                      key={i}
                      formula={problem.reaction.reactant1.formula}
                      color={problem.reaction.reactant1.color}
                      size={25}
                    />
                  ))}
                  {problem.r1Count > 8 && <span className="text-gray-500 text-sm">+{problem.r1Count - 8}</span>}
                </div>
              )}
              {isGramMode && (
                <div className="flex justify-center">
                  <div className="bg-yellow-100 rounded-lg p-3">
                    <span className="text-2xl">⚖️</span>
                    <div className="text-xs text-gray-600 mt-1">{problem.r1Grams} grömm</div>
                  </div>
                </div>
              )}
            </div>

            <div className={`p-4 rounded-xl ${
              currentStep === 'moles_r2' || currentStep === 'times_r2' ? 'bg-orange-50 border-2 border-orange-300' :
              currentStep === 'limiting' && selectedLimiting === problem.reaction.reactant2.formula ? 'bg-orange-100 border-2 border-orange-500' :
              'bg-gray-50'
            }`}>
              <div className="text-center mb-2">
                <div className="text-lg font-bold">{problem.reaction.reactant2.formula}</div>
                {isGramMode ? (
                  <>
                    <div className="text-sm text-gray-600 font-semibold">{problem.r2Grams} g</div>
                    <div className="text-xs text-gray-500">M = {problem.r2MolarMass} g/mol</div>
                  </>
                ) : (
                  <div className="text-sm text-gray-600">{problem.r2Count} sameindur</div>
                )}
                <div className="text-xs text-gray-500">Stuðull: {problem.reaction.reactant2.coeff}</div>
              </div>
              {!isGramMode && (
                <div className="flex flex-wrap justify-center gap-1">
                  {Array.from({ length: Math.min(problem.r2Count, 8) }).map((_, i) => (
                    <Molecule
                      key={i}
                      formula={problem.reaction.reactant2.formula}
                      color={problem.reaction.reactant2.color}
                      size={25}
                    />
                  ))}
                  {problem.r2Count > 8 && <span className="text-gray-500 text-sm">+{problem.r2Count - 8}</span>}
                </div>
              )}
              {isGramMode && (
                <div className="flex justify-center">
                  <div className="bg-yellow-100 rounded-lg p-3">
                    <span className="text-2xl">⚖️</span>
                    <div className="text-xs text-gray-600 mt-1">{problem.r2Grams} grömm</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step progress */}
        <div className="bg-white rounded-xl shadow-md p-3 mb-4">
          <div className="flex justify-between">
            {Array.from({ length: stepInfo.totalSteps }, (_, i) => i + 1).map((step) => (
              <div
                key={step}
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                  step < stepInfo.stepNumber
                    ? 'bg-green-500 text-white'
                    : step === stepInfo.stepNumber
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step < stepInfo.stepNumber ? '✓' : step}
              </div>
            ))}
          </div>
        </div>

        {/* Current step */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-4">
          <h2 className="text-lg font-bold text-gray-800 mb-2">{stepInfo.title}</h2>
          <p className="text-gray-600 mb-4">{stepInfo.instruction}</p>

          {/* Formula hint */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-4">
            <p className="font-mono text-sm text-gray-700">{stepInfo.formula}</p>
          </div>

          {/* Input or selection */}
          {currentStep === 'limiting' ? (
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => !showFeedback && setSelectedLimiting(problem.reaction.reactant1.formula)}
                disabled={showFeedback}
                className={`p-4 rounded-xl border-4 font-bold text-lg transition-all ${
                  showFeedback && selectedLimiting === problem.reaction.reactant1.formula
                    ? isStepCorrect ? 'border-green-500 bg-green-50 text-green-700' : 'border-red-500 bg-red-50 text-red-700'
                    : showFeedback && problem.limitingReactant === problem.reaction.reactant1.formula
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : selectedLimiting === problem.reaction.reactant1.formula
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                }`}
              >
                {problem.reaction.reactant1.formula}
                <div className="text-sm font-normal text-gray-600">{roundMass(problem.timesR1)} skipti</div>
              </button>

              <button
                onClick={() => !showFeedback && setSelectedLimiting(problem.reaction.reactant2.formula)}
                disabled={showFeedback}
                className={`p-4 rounded-xl border-4 font-bold text-lg transition-all ${
                  showFeedback && selectedLimiting === problem.reaction.reactant2.formula
                    ? isStepCorrect ? 'border-green-500 bg-green-50 text-green-700' : 'border-red-500 bg-red-50 text-red-700'
                    : showFeedback && problem.limitingReactant === problem.reaction.reactant2.formula
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : selectedLimiting === problem.reaction.reactant2.formula
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                }`}
              >
                {problem.reaction.reactant2.formula}
                <div className="text-sm font-normal text-gray-600">{roundMass(problem.timesR2)} skipti</div>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <input
                type="number"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={showFeedback}
                className={`flex-1 px-4 py-3 border-2 rounded-xl text-xl text-center ${
                  showFeedback
                    ? isStepCorrect
                      ? 'border-green-500 bg-green-50'
                      : 'border-red-500 bg-red-50'
                    : 'border-gray-300 focus:border-orange-500'
                } outline-none`}
                placeholder="Sláðu inn svar..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && input && !showFeedback) {
                    checkStep();
                  }
                }}
              />
            </div>
          )}
        </div>

        {/* Feedback */}
        {showFeedback && (
          <div className={`rounded-xl p-4 mb-4 ${isStepCorrect ? 'bg-green-100 border-2 border-green-500' : 'bg-red-100 border-2 border-red-500'}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{isStepCorrect ? '✓' : '✗'}</span>
              <p className="text-lg font-bold">{isStepCorrect ? 'Rétt!' : 'Rangt'}</p>
            </div>
            {isStepCorrect ? (
              <p className="text-green-700 text-sm">+5 stig!</p>
            ) : (
              <p className="text-gray-700 text-sm">
                Rétt svar: <span className="font-bold">{stepInfo.correctAnswer}{stepInfo.unit ? ` ${stepInfo.unit}` : ''}</span>
              </p>
            )}
            <button
              onClick={nextStep}
              className="mt-3 w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              {stepInfo.stepNumber < stepInfo.totalSteps ? 'Næsta skref →' : 'Sjá samantekt →'}
            </button>
          </div>
        )}

        {/* Submit button */}
        {!showFeedback && (
          <button
            onClick={checkStep}
            disabled={currentStep === 'limiting' ? !selectedLimiting : !input}
            className={`w-full font-bold py-3 px-6 rounded-xl transition-colors ${
              (currentStep === 'limiting' ? selectedLimiting : input)
                ? 'bg-orange-500 hover:bg-orange-600 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Athuga svar
          </button>
        )}

        {/* Back button */}
        <button
          onClick={onBack}
          className="w-full text-gray-500 hover:text-gray-700 font-semibold py-3 mt-4"
        >
          ← Til baka í valmynd
        </button>
      </div>
    </div>
  );
}

export default Level2;
