import { useState, useEffect } from 'react';

interface Solvent {
  id: string;
  name: string;
  formula: string;
  polarity: 'polar' | 'nonpolar';
  description: string;
  color: string;
}

interface Solute {
  id: string;
  name: string;
  formula: string;
  polarity: 'polar' | 'nonpolar' | 'ionic';
  dissolves: {
    water: boolean;
    hexane: boolean;
  };
  explanation: string;
}

const solvents: Solvent[] = [
  {
    id: 'water',
    name: 'Vatn',
    formula: 'H₂O',
    polarity: 'polar',
    description: 'Skautað leysi með vetnistengjum',
    color: '#3b82f6'
  },
  {
    id: 'hexane',
    name: 'Hexan',
    formula: 'C₆H₁₄',
    polarity: 'nonpolar',
    description: 'Óskautað leysi með London kraftum',
    color: '#f59e0b'
  }
];

const solutes: Solute[] = [
  {
    id: 'nacl',
    name: 'Natríumklóríð',
    formula: 'NaCl',
    polarity: 'ionic',
    dissolves: { water: true, hexane: false },
    explanation: 'Jónabindingarefni leysast í skautuðum leysum. Vatnssameindir umkringja jónirnar og rjúfa kristalbygginguna.'
  },
  {
    id: 'ethanol',
    name: 'Etanól',
    formula: 'C₂H₅OH',
    polarity: 'polar',
    dissolves: { water: true, hexane: true },
    explanation: 'Etanól er „amfífíll" — skautaður O-H hópur leysist í vatni, en kolvetnis keðjan leysist í hexani. Blandast báðum!'
  },
  {
    id: 'oil',
    name: 'Olía',
    formula: '(CH₂)ₙ',
    polarity: 'nonpolar',
    dissolves: { water: false, hexane: true },
    explanation: 'Olía er óskautuð og hefur aðeins London krafta. Leysist í hexani en ekki vatni — þess vegna flýtur olía á vatni.'
  },
  {
    id: 'sugar',
    name: 'Sykur',
    formula: 'C₁₂H₂₂O₁₁',
    polarity: 'polar',
    dissolves: { water: true, hexane: false },
    explanation: 'Sykur hefur marga O-H hópa sem mynda vetnistengi við vatn. Leysist vel í vatni en ekki í hexani.'
  },
  {
    id: 'iodine',
    name: 'Joð',
    formula: 'I₂',
    polarity: 'nonpolar',
    dissolves: { water: false, hexane: true },
    explanation: 'I₂ er óskautað og hefur aðeins sterka London krafta. Leysist vel í hexani og gefur fjólubláan lit.'
  },
  {
    id: 'ammonia',
    name: 'Ammóníak',
    formula: 'NH₃',
    polarity: 'polar',
    dissolves: { water: true, hexane: false },
    explanation: 'NH₃ er skautað og getur myndað vetnistengi við vatn. Leysist mjög vel í vatni.'
  }
];

interface SolubilityPredictionProps {
  compact?: boolean;
  onPrediction?: (correct: boolean) => void;
}

export function SolubilityPrediction({ compact = false, onPrediction }: SolubilityPredictionProps) {
  const [selectedSolute, setSelectedSolute] = useState<Solute | null>(null);
  const [selectedSolvent, setSelectedSolvent] = useState<Solvent | null>(null);
  const [userPrediction, setUserPrediction] = useState<boolean | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'mixing' | 'result'>('idle');
  const [stats, setStats] = useState({ correct: 0, total: 0 });

  const actualResult = selectedSolute && selectedSolvent
    ? selectedSolute.dissolves[selectedSolvent.id as 'water' | 'hexane']
    : null;

  const makePredict = (willDissolve: boolean) => {
    setUserPrediction(willDissolve);
    setAnimationPhase('mixing');
  };

  useEffect(() => {
    if (animationPhase === 'mixing') {
      const timer = setTimeout(() => {
        setAnimationPhase('result');
        setShowResult(true);
        const isCorrect = userPrediction === actualResult;
        setStats(prev => ({
          correct: prev.correct + (isCorrect ? 1 : 0),
          total: prev.total + 1
        }));
        onPrediction?.(isCorrect);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [animationPhase, userPrediction, actualResult, onPrediction]);

  const reset = () => {
    setSelectedSolute(null);
    setSelectedSolvent(null);
    setUserPrediction(null);
    setShowResult(false);
    setAnimationPhase('idle');
  };

  const tryNew = () => {
    setUserPrediction(null);
    setShowResult(false);
    setAnimationPhase('idle');
  };

  const isCorrect = userPrediction === actualResult;

  return (
    <div className={`bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl border border-cyan-200 ${compact ? 'p-4' : 'p-6'}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-bold text-cyan-800 flex items-center gap-2 ${compact ? 'text-base' : 'text-lg'}`}>
          <span>🧪</span> Leysni: „Líkt leysist í líku"
        </h3>
        {stats.total > 0 && (
          <div className="text-sm text-cyan-700 bg-cyan-100 px-3 py-1 rounded-full">
            {stats.correct}/{stats.total} rétt
          </div>
        )}
      </div>

      <div className="text-sm text-gray-600 mb-4">
        Skautuð efni leysast í skautuðum leysum. Óskautuð efni leysast í óskautuðum leysum.
      </div>

      {/* Solute Selection */}
      <div className="mb-4">
        <div className="text-sm font-medium text-gray-700 mb-2">1. Veldu efni til að leysa:</div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {solutes.map(solute => (
            <button
              key={solute.id}
              onClick={() => { setSelectedSolute(solute); tryNew(); }}
              disabled={showResult}
              className={`p-3 rounded-lg border-2 transition-all text-left ${
                selectedSolute?.id === solute.id
                  ? 'border-cyan-500 bg-cyan-50'
                  : 'border-gray-200 hover:border-cyan-300 bg-white'
              }`}
            >
              <div className="font-bold text-gray-800">{solute.formula}</div>
              <div className="text-xs text-gray-500">{solute.name}</div>
              <div className={`text-xs mt-1 px-1.5 py-0.5 rounded inline-block ${
                solute.polarity === 'polar' ? 'bg-blue-100 text-blue-700' :
                solute.polarity === 'ionic' ? 'bg-purple-100 text-purple-700' :
                'bg-amber-100 text-amber-700'
              }`}>
                {solute.polarity === 'polar' ? 'Skautað' :
                 solute.polarity === 'ionic' ? 'Jónatengi' : 'Óskautað'}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Solvent Selection */}
      {selectedSolute && (
        <div className="mb-4">
          <div className="text-sm font-medium text-gray-700 mb-2">2. Veldu leysi:</div>
          <div className="grid grid-cols-2 gap-3">
            {solvents.map(solvent => (
              <button
                key={solvent.id}
                onClick={() => { setSelectedSolvent(solvent); tryNew(); }}
                disabled={showResult}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedSolvent?.id === solvent.id
                    ? 'border-cyan-500 bg-white'
                    : 'border-gray-200 hover:border-cyan-300 bg-white'
                }`}
              >
                <div
                  className="w-12 h-12 rounded-lg mx-auto mb-2 opacity-60"
                  style={{ backgroundColor: solvent.color }}
                />
                <div className="font-bold text-gray-800">{solvent.formula}</div>
                <div className="text-sm text-gray-600">{solvent.name}</div>
                <div className={`text-xs mt-1 ${
                  solvent.polarity === 'polar' ? 'text-blue-600' : 'text-amber-600'
                }`}>
                  {solvent.polarity === 'polar' ? '(Skautað)' : '(Óskautað)'}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Prediction */}
      {selectedSolute && selectedSolvent && !showResult && animationPhase === 'idle' && (
        <div className="mb-4">
          <div className="text-sm font-medium text-gray-700 mb-2">
            3. Spáðu: Leysist {selectedSolute.formula} í {selectedSolvent.name.toLowerCase()}?
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => makePredict(true)}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-all"
            >
              ✓ Já, leysist
            </button>
            <button
              onClick={() => makePredict(false)}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg transition-all"
            >
              ✗ Nei, leysist ekki
            </button>
          </div>
        </div>
      )}

      {/* Mixing Animation */}
      {animationPhase === 'mixing' && selectedSolute && selectedSolvent && (
        <div className="flex flex-col items-center py-8">
          <div className="relative w-32 h-40">
            {/* Beaker */}
            <svg viewBox="0 0 100 120" className="w-full h-full">
              {/* Beaker outline */}
              <path
                d="M15 20 L15 100 Q15 110 25 110 L75 110 Q85 110 85 100 L85 20"
                fill="none"
                stroke="#94a3b8"
                strokeWidth="3"
              />
              {/* Liquid */}
              <rect
                x="17"
                y="40"
                width="66"
                height="68"
                rx="3"
                fill={selectedSolvent.color}
                opacity="0.4"
                className="animate-pulse"
              />
              {/* Mixing particles */}
              {[...Array(6)].map((_, i) => (
                <circle
                  key={i}
                  cx={30 + (i % 3) * 20}
                  cy={60 + Math.floor(i / 3) * 25}
                  r="5"
                  fill={selectedSolute.polarity === 'nonpolar' ? '#f59e0b' : '#3b82f6'}
                  className="animate-bounce"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </svg>
          </div>
          <div className="text-gray-600 animate-pulse mt-2">Blanda...</div>
        </div>
      )}

      {/* Result */}
      {showResult && selectedSolute && selectedSolvent && (
        <div className="space-y-4">
          {/* Result visualization */}
          <div className="flex justify-center">
            <div className="relative w-40 h-48">
              <svg viewBox="0 0 100 120" className="w-full h-full">
                {/* Beaker */}
                <path
                  d="M15 20 L15 100 Q15 110 25 110 L75 110 Q85 110 85 100 L85 20"
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth="3"
                />
                {/* Liquid */}
                <rect
                  x="17"
                  y="40"
                  width="66"
                  height="68"
                  rx="3"
                  fill={selectedSolvent.color}
                  opacity={actualResult ? "0.5" : "0.3"}
                />
                {actualResult ? (
                  // Dissolved - uniform color
                  <rect
                    x="17"
                    y="40"
                    width="66"
                    height="68"
                    rx="3"
                    fill={selectedSolute.polarity === 'nonpolar' ? '#f59e0b' : '#8b5cf6'}
                    opacity="0.3"
                  />
                ) : (
                  // Not dissolved - separated layer or particles at bottom
                  <>
                    {selectedSolute.polarity === 'nonpolar' ? (
                      // Oil-like layer on top
                      <rect
                        x="17"
                        y="40"
                        width="66"
                        height="20"
                        rx="3"
                        fill="#f59e0b"
                        opacity="0.6"
                      />
                    ) : (
                      // Solid at bottom
                      <ellipse
                        cx="50"
                        cy="100"
                        rx="25"
                        ry="8"
                        fill="#9ca3af"
                        opacity="0.8"
                      />
                    )}
                  </>
                )}
              </svg>
              {/* Label */}
              <div className={`absolute -bottom-6 left-0 right-0 text-center text-sm font-bold ${
                actualResult ? 'text-green-600' : 'text-red-600'
              }`}>
                {actualResult ? 'Leyst!' : 'Leysist ekki'}
              </div>
            </div>
          </div>

          {/* Feedback */}
          <div className={`p-4 rounded-lg ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className={`font-bold ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
              {isCorrect ? '✓ Rétt spáð!' : '✗ Ekki rétt'}
            </div>
            <p className="text-sm text-gray-700 mt-2">
              {selectedSolute.explanation}
            </p>
          </div>

          {/* Polarity explanation */}
          <div className="bg-gray-50 p-4 rounded-lg text-sm">
            <div className="font-medium text-gray-700 mb-2">Af hverju?</div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2 py-1 rounded ${
                selectedSolute.polarity === 'polar' ? 'bg-blue-100 text-blue-700' :
                selectedSolute.polarity === 'ionic' ? 'bg-purple-100 text-purple-700' :
                'bg-amber-100 text-amber-700'
              }`}>
                {selectedSolute.formula} = {
                  selectedSolute.polarity === 'polar' ? 'Skautað' :
                  selectedSolute.polarity === 'ionic' ? 'Jónatengi' : 'Óskautað'
                }
              </span>
              <span className="text-gray-500">+</span>
              <span className={`px-2 py-1 rounded ${
                selectedSolvent.polarity === 'polar' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {selectedSolvent.formula} = {selectedSolvent.polarity === 'polar' ? 'Skautað' : 'Óskautað'}
              </span>
              <span className="text-gray-500">=</span>
              <span className={`px-2 py-1 rounded font-bold ${
                actualResult ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {actualResult ? 'Líkt leysist í líku ✓' : 'Ólíkt → leysist ekki ✗'}
              </span>
            </div>
          </div>

          <button
            onClick={reset}
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg transition-all"
          >
            Prófa annað efni
          </button>
        </div>
      )}

      {/* Reference guide */}
      {!selectedSolute && (
        <div className="bg-white p-4 rounded-lg border border-gray-200 mt-4">
          <div className="text-sm font-medium text-gray-700 mb-2">Minnispunktar:</div>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• <span className="text-blue-600 font-medium">Skautað</span> leysist í <span className="text-blue-600 font-medium">skautuðu</span> (vatn, alk., sýrur)</li>
            <li>• <span className="text-amber-600 font-medium">Óskautað</span> leysist í <span className="text-amber-600 font-medium">óskautuðu</span> (olíur, fita, hexan)</li>
            <li>• <span className="text-purple-600 font-medium">Jónatengi</span> leysist í <span className="text-blue-600 font-medium">skautuðu</span> (salt í vatni)</li>
          </ul>
        </div>
      )}
    </div>
  );
}
