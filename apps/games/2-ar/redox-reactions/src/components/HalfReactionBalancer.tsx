import { useState } from 'react';

interface HalfReaction {
  id: string;
  reactant: string;
  product: string;
  type: 'oxidation' | 'reduction';
  steps: BalancingStep[];
  explanation: string;
}

interface BalancingStep {
  instruction: string;
  result: string;
  hint: string;
  addedSpecies?: string;
}

interface HalfReactionBalancerProps {
  /** Show interactive practice mode */
  interactive?: boolean;
  /** Compact display */
  compact?: boolean;
  /** Callback when balancing is complete */
  onComplete?: (correct: boolean) => void;
}

// Sample half-reactions for practice
const HALF_REACTIONS: HalfReaction[] = [
  {
    id: 'fe-oxidation',
    reactant: 'Fe',
    product: 'Fe³⁺',
    type: 'oxidation',
    steps: [
      {
        instruction: '1. Skrifaðu ójafnaða helmingshvarfið',
        result: 'Fe → Fe³⁺',
        hint: 'Byrjaðu með hvarfefnið og myndafnið',
      },
      {
        instruction: '2. Jafnaðu aðrar frumeindir (ekki O eða H)',
        result: 'Fe → Fe³⁺',
        hint: 'Fe er þegar jafnað (1 á báðum hliðum)',
      },
      {
        instruction: '3. Bættu við H₂O til að jafna O',
        result: 'Fe → Fe³⁺',
        hint: 'Engin O - sleppa þessu skrefi',
      },
      {
        instruction: '4. Bættu við H⁺ til að jafna H',
        result: 'Fe → Fe³⁺',
        hint: 'Engin H - sleppa þessu skrefi',
      },
      {
        instruction: '5. Bættu við e⁻ til að jafna hleðslu',
        result: 'Fe → Fe³⁺ + 3e⁻',
        hint: 'Vinstri: 0, Hægri: +3. Bættu við 3e⁻ hægra megin',
        addedSpecies: '3e⁻',
      },
    ],
    explanation: 'Fe tapar 3 rafeindum og oxast í Fe³⁺. Þetta er oxunarhelmingshvarf.',
  },
  {
    id: 'mno4-reduction',
    reactant: 'MnO₄⁻',
    product: 'Mn²⁺',
    type: 'reduction',
    steps: [
      {
        instruction: '1. Skrifaðu ójafnaða helmingshvarfið',
        result: 'MnO₄⁻ → Mn²⁺',
        hint: 'Permanganat jónin afoxast í manganjón',
      },
      {
        instruction: '2. Jafnaðu aðrar frumeindir (ekki O eða H)',
        result: 'MnO₄⁻ → Mn²⁺',
        hint: 'Mn er þegar jafnað (1 á báðum hliðum)',
      },
      {
        instruction: '3. Bættu við H₂O til að jafna O',
        result: 'MnO₄⁻ → Mn²⁺ + 4H₂O',
        hint: '4 O vinstra megin - bættu við 4H₂O hægra megin',
        addedSpecies: '4H₂O',
      },
      {
        instruction: '4. Bættu við H⁺ til að jafna H',
        result: '8H⁺ + MnO₄⁻ → Mn²⁺ + 4H₂O',
        hint: '8 H hægra megin - bættu við 8H⁺ vinstra megin',
        addedSpecies: '8H⁺',
      },
      {
        instruction: '5. Bættu við e⁻ til að jafna hleðslu',
        result: '5e⁻ + 8H⁺ + MnO₄⁻ → Mn²⁺ + 4H₂O',
        hint: 'Vinstri: +7, Hægri: +2. Bættu við 5e⁻ vinstra megin',
        addedSpecies: '5e⁻',
      },
    ],
    explanation: 'MnO₄⁻ öðlast 5 rafeindir og afoxast í Mn²⁺. Þetta er afoxunarhelmingshvarf í súru umhverfi.',
  },
  {
    id: 'cr-oxidation',
    reactant: 'Cr',
    product: 'Cr³⁺',
    type: 'oxidation',
    steps: [
      {
        instruction: '1. Skrifaðu ójafnaða helmingshvarfið',
        result: 'Cr → Cr³⁺',
        hint: 'Króm oxast í Cr³⁺ jón',
      },
      {
        instruction: '2. Jafnaðu aðrar frumeindir',
        result: 'Cr → Cr³⁺',
        hint: 'Cr er þegar jafnað',
      },
      {
        instruction: '3. Bættu við H₂O til að jafna O',
        result: 'Cr → Cr³⁺',
        hint: 'Engin O - sleppa',
      },
      {
        instruction: '4. Bættu við H⁺ til að jafna H',
        result: 'Cr → Cr³⁺',
        hint: 'Engin H - sleppa',
      },
      {
        instruction: '5. Bættu við e⁻ til að jafna hleðslu',
        result: 'Cr → Cr³⁺ + 3e⁻',
        hint: 'Vinstri: 0, Hægri: +3. Bættu við 3e⁻',
        addedSpecies: '3e⁻',
      },
    ],
    explanation: 'Cr tapar 3 rafeindum og oxast. Oxunartala breytist frá 0 í +3.',
  },
  {
    id: 'cu-reduction',
    reactant: 'Cu²⁺',
    product: 'Cu',
    type: 'reduction',
    steps: [
      {
        instruction: '1. Skrifaðu ójafnaða helmingshvarfið',
        result: 'Cu²⁺ → Cu',
        hint: 'Koparjón afoxast í koparmal',
      },
      {
        instruction: '2. Jafnaðu aðrar frumeindir',
        result: 'Cu²⁺ → Cu',
        hint: 'Cu er þegar jafnað',
      },
      {
        instruction: '3. Bættu við H₂O til að jafna O',
        result: 'Cu²⁺ → Cu',
        hint: 'Engin O - sleppa',
      },
      {
        instruction: '4. Bættu við H⁺ til að jafna H',
        result: 'Cu²⁺ → Cu',
        hint: 'Engin H - sleppa',
      },
      {
        instruction: '5. Bættu við e⁻ til að jafna hleðslu',
        result: '2e⁻ + Cu²⁺ → Cu',
        hint: 'Vinstri: +2, Hægri: 0. Bættu við 2e⁻ vinstra megin',
        addedSpecies: '2e⁻',
      },
    ],
    explanation: 'Cu²⁺ öðlast 2 rafeindir og afoxast í Cu. Þetta er afoxunarhelmingshvarf.',
  },
];

const BALANCING_RULES = [
  { step: 1, title: 'Ójafnað hvarf', description: 'Skrifaðu hvarfefni og myndefni' },
  { step: 2, title: 'Jafna frumeindir', description: 'Jafnaðu aðrar frumeindir en O og H' },
  { step: 3, title: 'Jafna súrefni', description: 'Bættu við H₂O til að jafna O' },
  { step: 4, title: 'Jafna vetni', description: 'Bættu við H⁺ til að jafna H' },
  { step: 5, title: 'Jafna hleðslu', description: 'Bættu við e⁻ til að jafna hleðslu' },
];

/**
 * HalfReactionBalancer - Step-by-step tool for balancing half-reactions
 *
 * Guides students through the 5-step process:
 * 1. Write unbalanced half-reaction
 * 2. Balance atoms other than O and H
 * 3. Add H₂O to balance O
 * 4. Add H⁺ to balance H
 * 5. Add electrons to balance charge
 */
export function HalfReactionBalancer({
  interactive = true,
  compact = false,
  onComplete,
}: HalfReactionBalancerProps) {
  const [selectedReaction, setSelectedReaction] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const reaction = HALF_REACTIONS[selectedReaction];
  const step = reaction.steps[currentStep];
  const isComplete = currentStep >= reaction.steps.length - 1 && completedSteps.includes(currentStep);

  const handleNextStep = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }

    if (currentStep < reaction.steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setShowHint(false);
    } else {
      onComplete?.(true);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setShowHint(false);
    }
  };

  const handleReactionChange = (index: number) => {
    setSelectedReaction(index);
    setCurrentStep(0);
    setCompletedSteps([]);
    setShowHint(false);
  };

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white font-bold text-sm flex items-center gap-2">
          <span className="text-lg">⚖️</span>
          Helmingshvarfajafnari
        </h3>
        <div className={`px-2 py-1 rounded text-xs font-medium ${
          reaction.type === 'oxidation'
            ? 'bg-red-500/30 text-red-400'
            : 'bg-blue-500/30 text-blue-400'
        }`}>
          {reaction.type === 'oxidation' ? 'Oxun' : 'Afoxun'}
        </div>
      </div>

      {/* Reaction selector */}
      {interactive && !compact && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          {HALF_REACTIONS.map((r, i) => (
            <button
              key={r.id}
              onClick={() => handleReactionChange(i)}
              className={`p-2 rounded-lg text-xs font-mono transition-colors ${
                selectedReaction === i
                  ? 'bg-purple-500 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              {r.reactant} → {r.product}
            </button>
          ))}
        </div>
      )}

      {/* Progress indicator */}
      <div className="flex items-center gap-1 mb-4">
        {BALANCING_RULES.map((rule, i) => (
          <div
            key={i}
            className={`flex-1 h-2 rounded-full transition-colors ${
              completedSteps.includes(i)
                ? 'bg-green-500'
                : i === currentStep
                  ? 'bg-purple-500'
                  : 'bg-slate-700'
            }`}
            title={rule.title}
          />
        ))}
      </div>

      {/* Current step display */}
      <div className="bg-slate-700/50 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-sm">
            {currentStep + 1}
          </div>
          <div className="text-purple-300 font-medium text-sm">
            {BALANCING_RULES[currentStep]?.title}
          </div>
        </div>

        <div className="text-white mb-3">{step.instruction}</div>

        {/* Current equation state */}
        <div className="bg-slate-900 p-4 rounded-lg mb-3">
          <div className="text-center">
            <div className="text-xl font-mono text-white mb-2">
              {step.result}
            </div>
            {step.addedSpecies && completedSteps.includes(currentStep) && (
              <div className="text-green-400 text-sm animate-pulse">
                + {step.addedSpecies}
              </div>
            )}
          </div>
        </div>

        {/* Hint toggle */}
        {interactive && (
          <button
            onClick={() => setShowHint(!showHint)}
            className="text-yellow-400 hover:text-yellow-300 text-sm underline"
          >
            {showHint ? 'Fela vísbendingu' : 'Sýna vísbendingu'}
          </button>
        )}

        {showHint && (
          <div className="mt-2 bg-yellow-500/20 border border-yellow-500/40 rounded-lg p-3">
            <div className="text-yellow-400 text-sm flex items-start gap-2">
              <span>💡</span>
              <span>{step.hint}</span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      {interactive && (
        <div className="flex gap-2">
          <button
            onClick={handlePrevStep}
            disabled={currentStep === 0}
            className="flex-1 px-4 py-2 rounded-lg bg-slate-700 text-gray-300 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ← Fyrra skref
          </button>
          <button
            onClick={handleNextStep}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              isComplete
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-purple-500 text-white hover:bg-purple-600'
            }`}
          >
            {isComplete ? 'Lokið!' : 'Næsta skref →'}
          </button>
        </div>
      )}

      {/* Completion summary */}
      {isComplete && (
        <div className="mt-4 bg-green-500/20 border border-green-500/40 rounded-lg p-4">
          <div className="text-green-400 font-bold mb-2 flex items-center gap-2">
            <span>✓</span>
            Jafnað helmingshvarf!
          </div>
          <div className="text-center bg-slate-900 p-3 rounded-lg mb-2">
            <div className="text-xl font-mono text-white">
              {reaction.steps[reaction.steps.length - 1].result}
            </div>
          </div>
          <div className="text-gray-300 text-sm">
            {reaction.explanation}
          </div>
        </div>
      )}

      {/* Rules reference */}
      {!compact && (
        <div className="mt-4 bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
          <div className="text-blue-400 text-xs font-medium mb-2">
            5-skrefa aðferð (súrt umhverfi):
          </div>
          <ol className="text-gray-300 text-xs space-y-1 list-decimal list-inside">
            {BALANCING_RULES.map((rule, i) => (
              <li key={i} className={completedSteps.includes(i) ? 'text-green-400' : ''}>
                <span className="font-medium">{rule.title}:</span> {rule.description}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Key concepts */}
      {!compact && (
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div className="bg-red-500/20 border border-red-500/40 rounded-lg p-2">
            <div className="text-red-400 font-medium mb-1">Oxun</div>
            <div className="text-gray-300">
              Tapar e⁻ → e⁻ birtist <strong>hægra</strong> megin
            </div>
          </div>
          <div className="bg-blue-500/20 border border-blue-500/40 rounded-lg p-2">
            <div className="text-blue-400 font-medium mb-1">Afoxun</div>
            <div className="text-gray-300">
              Öðlast e⁻ → e⁻ birtist <strong>vinstra</strong> megin
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HalfReactionBalancer;
