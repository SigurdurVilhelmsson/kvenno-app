import { useState, useEffect, useId } from 'react';

import { pairCount } from '../utils/lonePairs';

interface Atom {
  symbol: string;
  valenceElectrons: number;
  position: 'central' | 'surrounding';
}

interface GuidedStep {
  id: number;
  title: string;
  instruction: string;
  action: 'count' | 'place-central' | 'draw-bonds' | 'distribute' | 'check-octet' | 'complete';
  targetValue?: number;
  completed: boolean;
}

interface LewisGuidedModeProps {
  molecule: string;
  atoms: Atom[];
  totalElectrons: number;
  onComplete?: () => void;
  compact?: boolean;
}

/** An empty field is no answer yet; anything else, 0 included, is an answer. */
function readCount(raw: string): number | null {
  if (raw.trim() === '') return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export function LewisGuidedMode({
  molecule,
  atoms,
  totalElectrons,
  onComplete,
  compact = false,
}: LewisGuidedModeProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [userValue, setUserValue] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [electronsUsed, setElectronsUsed] = useState(0);
  const [electronsRemaining, setElectronsRemaining] = useState(totalElectrons);
  const [bondsDrawn, setBondsDrawn] = useState<
    { from: string; to: string; type: 'single' | 'double' | 'triple' }[]
  >([]);
  const [lonePairs, setLonePairs] = useState<{ atom: string; count: number }[]>([]);
  const [animating, setAnimating] = useState(false);

  const centralAtom = atoms.find((a) => a.position === 'central');
  const surroundingAtoms = atoms.filter((a) => a.position === 'surrounding');

  // Calculate expected values
  const expectedBonds = surroundingAtoms.length;
  const electronsInBonds = expectedBonds * 2;
  const electronsForLonePairs = totalElectrons - electronsInBonds;
  const bondInputId = useId();

  // The distribution step 4 asks for, by the rule its own tip gives: outer atoms
  // first, each non-H one filled to its octet (three pairs beside its single
  // bond), H none at all, and the central atom takes what is left. Keyed by
  // symbol, as the counters on screen are.
  const expectedLonePairs = new Map<string, number>();
  {
    let pairsLeft = electronsForLonePairs / 2;
    for (const a of surroundingAtoms) {
      const give = a.symbol === 'H' ? 0 : Math.min(3, pairsLeft);
      pairsLeft -= give;
      expectedLonePairs.set(a.symbol, (expectedLonePairs.get(a.symbol) ?? 0) + give);
    }
    const c = centralAtom?.symbol ?? '';
    expectedLonePairs.set(c, (expectedLonePairs.get(c) ?? 0) + pairsLeft);
  }
  const uniqueSurrounding = surroundingAtoms.filter(
    (a, i, arr) => arr.findIndex((x) => x.symbol === a.symbol) === i
  );

  const steps: GuidedStep[] = [
    {
      id: 1,
      title: 'Telja gildisrafeindir',
      instruction: `Hversu margar gildisrafeindir eru alls í ${molecule}?`,
      action: 'count',
      targetValue: totalElectrons,
      completed: false,
    },
    {
      id: 2,
      title: 'Velja miðatóm',
      instruction: `Miðatómið er ${centralAtom?.symbol}. Það hefur ${centralAtom?.valenceElectrons} gildisrafeindir og getur myndað flest tengsl.`,
      action: 'place-central',
      completed: false,
    },
    {
      id: 3,
      title: 'Teikna einföld tengsl',
      instruction: `Teiknaðu ${expectedBonds} einföld tengsl frá ${centralAtom?.symbol} til ytri atómanna. Hvert tengi notar 2 rafeindir.`,
      action: 'draw-bonds',
      targetValue: expectedBonds,
      completed: false,
    },
    {
      id: 4,
      title: 'Dreifa eftirstandandi rafeindum',
      instruction: `${totalElectrons} - ${electronsInBonds} = ${electronsForLonePairs} rafeindir eftir. Dreifðu þeim sem einstæðum pörum (2 rafeindir á hvert par).`,
      action: 'distribute',
      targetValue: electronsForLonePairs / 2,
      completed: false,
    },
    {
      id: 5,
      title: 'Athuga átturegluna',
      instruction: 'Athugaðu hvort öll atóm uppfylla átturegluna (8 rafeindir, nema H sem vill 2).',
      action: 'check-octet',
      completed: false,
    },
    {
      id: 6,
      title: 'Lokið!',
      instruction: `Þú hefur teiknað Lewis-formúlu fyrir ${molecule}!`,
      action: 'complete',
      completed: false,
    },
  ];

  const step = steps[currentStep];

  useEffect(() => {
    setElectronsRemaining(totalElectrons - electronsUsed);
  }, [totalElectrons, electronsUsed]);

  const handleCheckValue = () => {
    if (step.targetValue === undefined) return;

    const correct = userValue === step.targetValue;
    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      setAnimating(true);
      setTimeout(() => {
        setAnimating(false);
        if (step.action === 'draw-bonds') {
          // Calculate electrons used in bonds
          setElectronsUsed(electronsInBonds);
          setBondsDrawn(
            surroundingAtoms.map((a) => ({
              from: centralAtom?.symbol || '',
              to: a.symbol,
              type: 'single' as const,
            }))
          );
        }
      }, 500);
    }
  };

  // A wrong answer used to leave the step with no way forward but skipping the
  // whole walkthrough: the input was gone and only a correct answer showed
  // "Næsta skref".
  const retryStep = () => {
    setShowFeedback(false);
    setIsCorrect(false);
    setUserValue(null);
  };

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
      setUserValue(null);
      setShowFeedback(false);
      setIsCorrect(false);
    } else {
      onComplete?.();
    }
  };

  const handleAddLonePair = (atomSymbol: string) => {
    setLonePairs((prev) => {
      const existing = prev.find((lp) => lp.atom === atomSymbol);
      if (existing) {
        return prev.map((lp) => (lp.atom === atomSymbol ? { ...lp, count: lp.count + 1 } : lp));
      }
      return [...prev, { atom: atomSymbol, count: 1 }];
    });
    setElectronsUsed((prev) => prev + 2);
  };

  const handleRemoveLonePair = (atomSymbol: string) => {
    setLonePairs((prev) => {
      const existing = prev.find((lp) => lp.atom === atomSymbol);
      if (existing && existing.count > 0) {
        return prev
          .map((lp) => (lp.atom === atomSymbol ? { ...lp, count: Math.max(0, lp.count - 1) } : lp))
          .filter((lp) => lp.count > 0);
      }
      return prev;
    });
    setElectronsUsed((prev) => Math.max(0, prev - 2));
  };

  const getTotalLonePairs = () => lonePairs.reduce((sum, lp) => sum + lp.count, 0);

  const getAtomLonePairs = (symbol: string) =>
    lonePairs.find((lp) => lp.atom === symbol)?.count || 0;

  // Atoms sharing a symbol share one counter, so one atom's pairs are its share.
  const pairsPerAtom = (symbol: string) =>
    getAtomLonePairs(symbol) /
    Math.max(1, surroundingAtoms.filter((a) => a.symbol === symbol).length);

  // The total alone was no check at all — the button only enables once every
  // electron is placed, which fixes the total — so two pairs on H passed.
  const checkDistribution = () => {
    const symbols = new Set([...expectedLonePairs.keys(), ...lonePairs.map((lp) => lp.atom)]);
    const correct =
      electronsRemaining === 0 &&
      getTotalLonePairs() === electronsForLonePairs / 2 &&
      [...symbols].every((sym) => getAtomLonePairs(sym) === (expectedLonePairs.get(sym) ?? 0));
    setIsCorrect(correct);
    setShowFeedback(true);
  };

  return (
    <div
      className={`bg-gradient-to-br from-green-50 to-teal-50 rounded-xl border border-green-200 ${compact ? 'p-4' : 'p-4 sm:p-6'}`}
    >
      <div className="flex items-center justify-between gap-2 mb-4">
        <h3
          className={`font-bold text-green-800 flex items-center gap-2 ${compact ? 'text-base' : 'text-lg'}`}
        >
          <span>📝</span> Leiðsögn: {molecule}
        </h3>
        <div className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full whitespace-nowrap shrink-0">
          Skref {currentStep + 1}/{steps.length}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-warm-200 rounded-full h-2 mb-6">
        <div
          className="bg-green-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>

      {/* Electron tracker */}
      <div className="bg-white rounded-lg p-4 mb-4 shadow-xs">
        <div className="flex justify-between items-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{totalElectrons}</div>
            <div className="text-xs text-warm-500">Alls</div>
          </div>
          <div className="text-warm-400">−</div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{electronsUsed}</div>
            <div className="text-xs text-warm-500">Notaðar</div>
          </div>
          <div className="text-warm-400">=</div>
          <div className="text-center">
            <div
              className={`text-2xl font-bold ${electronsRemaining === 0 ? 'text-green-600' : 'text-orange-600'}`}
            >
              {electronsRemaining}
            </div>
            <div className="text-xs text-warm-500">Eftir</div>
          </div>
        </div>
      </div>

      {/* Step content */}
      <div className="bg-white rounded-lg p-4 sm:p-5 mb-4 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
              showFeedback && isCorrect ? 'bg-green-500' : 'bg-blue-500'
            }`}
          >
            {currentStep + 1}
          </div>
          <h4 className="font-bold text-warm-800">{step.title}</h4>
        </div>

        <p className="text-warm-700 mb-4">{step.instruction}</p>

        {/* Step-specific UI */}
        {step.action === 'count' && !showFeedback && (
          <div className="space-y-4">
            {/* Show atom breakdown */}
            <div className="bg-warm-50 p-3 rounded-lg">
              <div className="text-sm font-medium text-warm-600 mb-2">Útreikningur:</div>
              <div className="flex flex-wrap gap-3 items-center">
                {atoms.map((atom, idx) => {
                  const count = atoms.filter((a) => a.symbol === atom.symbol).length;
                  if (idx !== atoms.findIndex((a) => a.symbol === atom.symbol)) return null;
                  return (
                    <div key={atom.symbol} className="flex items-center gap-1">
                      {idx > 0 && <span className="text-warm-400">+</span>}
                      <span className="bg-blue-100 px-2 py-1 rounded text-blue-800 font-mono">
                        {count} × {atom.symbol}({atom.valenceElectrons})
                      </span>
                    </div>
                  );
                })}
                <span className="text-warm-400">=</span>
                <span className="text-warm-400">?</span>
              </div>
            </div>

            <div className="flex gap-3 items-center">
              <input
                type="number"
                value={userValue ?? ''}
                onChange={(e) => setUserValue(readCount(e.target.value))}
                aria-label="Fjöldi gildisrafeinda"
                className="flex-1 p-3 border-2 border-warm-300 rounded-lg focus:border-blue-500 focus:outline-none text-xl font-mono text-center"
                placeholder="?"
              />
              <span className="text-warm-600">rafeindir</span>
            </div>

            <button
              onClick={handleCheckValue}
              disabled={userValue === null}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-warm-300 text-white font-bold py-3 px-4 rounded-lg transition-all"
            >
              Athuga
            </button>
          </div>
        )}

        {step.action === 'place-central' && !showFeedback && (
          <div className="space-y-4">
            {/* Visual of central atom */}
            <div className="flex justify-center py-6">
              <div className={`relative ${animating ? 'animate-bounce' : ''}`}>
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-bold text-white">{centralAtom?.symbol}</span>
                </div>
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-warm-500">
                  Miðatóm
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setIsCorrect(true);
                setShowFeedback(true);
              }}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-all"
            >
              Ég skil - áfram!
            </button>
          </div>
        )}

        {step.action === 'draw-bonds' && !showFeedback && (
          <div className="space-y-4">
            {/* Visual of bonds being drawn */}
            <div className="flex justify-center py-4">
              <svg viewBox="0 0 250 180" className="w-full max-w-[250px] h-auto">
                {/* Central atom */}
                <circle cx="125" cy="90" r="25" fill="#3b82f6" />
                <text
                  x="125"
                  y="95"
                  textAnchor="middle"
                  fill="white"
                  fontSize="18"
                  fontWeight="bold"
                >
                  {centralAtom?.symbol}
                </text>

                {/* Surrounding atoms with bond lines */}
                {surroundingAtoms.map((atom, idx) => {
                  const angle = (idx / surroundingAtoms.length) * 2 * Math.PI - Math.PI / 2;
                  const x = 125 + Math.cos(angle) * 80;
                  const y = 90 + Math.sin(angle) * 60;
                  const lineX1 = 125 + Math.cos(angle) * 25;
                  const lineY1 = 90 + Math.sin(angle) * 25;
                  const lineX2 = x - Math.cos(angle) * 18;
                  const lineY2 = y - Math.sin(angle) * 18;

                  return (
                    <g key={idx}>
                      {/* Bond line */}
                      <line
                        x1={lineX1}
                        y1={lineY1}
                        x2={lineX2}
                        y2={lineY2}
                        stroke="#374151"
                        strokeWidth="3"
                        strokeDasharray={bondsDrawn.length > idx ? '0' : '5,5'}
                        className={bondsDrawn.length > idx ? '' : 'animate-pulse'}
                      />
                      {/* Surrounding atom */}
                      <circle cx={x} cy={y} r="18" fill="#10b981" />
                      <text
                        x={x}
                        y={y + 5}
                        textAnchor="middle"
                        fill="white"
                        fontSize="14"
                        fontWeight="bold"
                      >
                        {atom.symbol}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="text-center text-sm text-warm-600 mb-4">
              Hvert einfalt tengi notar 2 rafeindir (ein frá hvoru atómi)
            </div>

            <div className="flex gap-3 items-center">
              <label htmlFor={bondInputId} className="text-warm-700">
                Fjöldi tengja:
              </label>
              <input
                id={bondInputId}
                type="number"
                value={userValue ?? ''}
                onChange={(e) => setUserValue(readCount(e.target.value))}
                className="flex-1 p-3 border-2 border-warm-300 rounded-lg focus:border-blue-500 focus:outline-none text-xl font-mono text-center max-w-24"
                placeholder="?"
                min="0"
                max="6"
              />
            </div>

            <button
              onClick={handleCheckValue}
              disabled={userValue === null}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-warm-300 text-white font-bold py-3 px-4 rounded-lg transition-all"
            >
              Athuga
            </button>
          </div>
        )}

        {step.action === 'distribute' && !showFeedback && (
          <div className="space-y-4">
            <div className="bg-yellow-50 p-3 rounded-lg text-sm text-yellow-800 mb-4">
              Rafeindir eftir: <strong>{electronsRemaining}</strong> ={' '}
              {electronsRemaining === 2
                ? '1 einstætt par'
                : `${electronsRemaining / 2} einstæð pör`}
            </div>

            {/* Interactive lone pair placement */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Central atom */}
              <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                <div className="font-bold text-blue-800 mb-2 flex items-center justify-between gap-2">
                  <span>{centralAtom?.symbol} (miðatóm)</span>
                  <span className="text-sm bg-blue-100 px-2 py-0.5 rounded whitespace-nowrap">
                    {pairCount(getAtomLonePairs(centralAtom?.symbol || ''))}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddLonePair(centralAtom?.symbol || '')}
                    disabled={electronsRemaining < 2}
                    aria-label={`Bæta einstæðu pari við ${centralAtom?.symbol} (miðatóm)`}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-warm-300 text-white py-2 rounded pointer-coarse:min-h-11"
                  >
                    + Par
                  </button>
                  <button
                    onClick={() => handleRemoveLonePair(centralAtom?.symbol || '')}
                    disabled={getAtomLonePairs(centralAtom?.symbol || '') === 0}
                    aria-label={`Taka einstætt par af ${centralAtom?.symbol} (miðatóm)`}
                    className="flex-1 bg-warm-300 hover:bg-warm-400 disabled:bg-warm-200 text-warm-700 py-2 rounded pointer-coarse:min-h-11"
                  >
                    − Par
                  </button>
                </div>
              </div>

              {/* Surrounding atoms */}
              {uniqueSurrounding.map((atom) => (
                <div
                  key={atom.symbol}
                  className="p-4 bg-green-50 rounded-lg border-2 border-green-200"
                >
                  <div className="font-bold text-green-800 mb-2 flex items-center justify-between gap-2">
                    <span>{atom.symbol} (ytri)</span>
                    <span className="text-sm bg-green-100 px-2 py-0.5 rounded whitespace-nowrap">
                      {pairCount(getAtomLonePairs(atom.symbol))}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddLonePair(atom.symbol)}
                      disabled={electronsRemaining < 2}
                      aria-label={`Bæta einstæðu pari við ${atom.symbol} (ytri)`}
                      className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-warm-300 text-white py-2 rounded pointer-coarse:min-h-11"
                    >
                      + Par
                    </button>
                    <button
                      onClick={() => handleRemoveLonePair(atom.symbol)}
                      disabled={getAtomLonePairs(atom.symbol) === 0}
                      aria-label={`Taka einstætt par af ${atom.symbol} (ytri)`}
                      className="flex-1 bg-warm-300 hover:bg-warm-400 disabled:bg-warm-200 text-warm-700 py-2 rounded pointer-coarse:min-h-11"
                    >
                      − Par
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={checkDistribution}
              disabled={electronsRemaining !== 0}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-warm-300 text-white font-bold py-3 px-4 rounded-lg transition-all"
            >
              Athuga dreifingu
            </button>
          </div>
        )}

        {step.action === 'check-octet' && !showFeedback && (
          <div className="space-y-4">
            <div className="bg-white p-3 sm:p-4 rounded-lg border">
              <div className="text-sm font-medium text-warm-600 mb-3">Athugun á áttureglunni:</div>

              {/* Central atom */}
              <div className="mb-3 p-3 bg-blue-50 rounded">
                <div className="flex justify-between items-center gap-3">
                  <span className="font-bold text-blue-800">{centralAtom?.symbol}</span>
                  <span className="text-sm text-right">
                    {bondsDrawn.length * 2} (tengsl) +{' '}
                    {getAtomLonePairs(centralAtom?.symbol || '') * 2} (pör) ={' '}
                    <span
                      className={`font-bold ${
                        bondsDrawn.length * 2 + getAtomLonePairs(centralAtom?.symbol || '') * 2 ===
                        8
                          ? 'text-green-600'
                          : 'text-orange-600'
                      }`}
                    >
                      {bondsDrawn.length * 2 + getAtomLonePairs(centralAtom?.symbol || '') * 2}{' '}
                      rafeindir
                    </span>
                  </span>
                </div>
              </div>

              {/* Surrounding atoms */}
              {surroundingAtoms.map((atom, idx) => {
                // H is full at 2, not at 8 — and only at 2: it was drawn green
                // whatever it held.
                const electrons = 2 + pairsPerAtom(atom.symbol) * 2;
                const full = electrons === (atom.symbol === 'H' ? 2 : 8);
                return (
                  <div key={idx} className="mb-2 p-3 bg-green-50 rounded">
                    <div className="flex justify-between items-center gap-3">
                      <span className="font-bold text-green-800">{atom.symbol}</span>
                      <span className="text-sm text-right">
                        2 (tengi) + {pairsPerAtom(atom.symbol) * 2} (pör) ={' '}
                        <span
                          className={`font-bold ${full ? 'text-green-600' : 'text-orange-600'}`}
                        >
                          {electrons} rafeindir
                        </span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => {
                setIsCorrect(true);
                setShowFeedback(true);
              }}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-all"
            >
              Athugað - áfram!
            </button>
          </div>
        )}

        {step.action === 'complete' && (
          <div className="text-center py-4">
            <div className="text-5xl mb-4">🎉</div>
            <p className="text-green-700 font-medium mb-4">
              Þú hefur lokið við Lewis-formúlu fyrir {molecule}!
            </p>
            <button
              onClick={onComplete}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-all"
            >
              Ljúka
            </button>
          </div>
        )}

        {/* Feedback */}
        {showFeedback && step.action !== 'complete' && (
          <div
            className={`mt-4 p-4 rounded-lg ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}
          >
            <div className={`font-bold ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
              {isCorrect ? '✓ Rétt!' : '✗ Ekki rétt'}
            </div>
            {!isCorrect && step.action === 'distribute' && (
              <p className="text-sm text-warm-700 mt-1">
                Rétt dreifing: {centralAtom?.symbol} (miðatóm){' '}
                {pairCount(expectedLonePairs.get(centralAtom?.symbol ?? '') ?? 0)}
                {uniqueSurrounding.map(
                  (a) => `, ${a.symbol} ${pairCount(expectedLonePairs.get(a.symbol) ?? 0)}`
                )}
              </p>
            )}
            {!isCorrect && step.action !== 'distribute' && step.targetValue !== undefined && (
              <p className="text-sm text-warm-700 mt-1">Rétt svar: {step.targetValue}</p>
            )}
            {!isCorrect && (
              <button
                onClick={retryStep}
                className="mt-3 w-full bg-warm-200 hover:bg-warm-300 text-warm-700 font-bold py-2 px-4 rounded-lg transition-all pointer-coarse:min-h-11"
              >
                Reyna aftur
              </button>
            )}
            {isCorrect && (
              <button
                onClick={handleNextStep}
                className="mt-3 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-all pointer-coarse:min-h-11"
              >
                Næsta skref →
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tip box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
        <div className="font-medium text-blue-800 mb-1">💡 Ráð:</div>
        <div className="text-blue-700">
          {step.action === 'count' &&
            'Leggðu saman gildisrafeindir allra atóma. Hópnúmer segir fjölda gildisrafeinda.'}
          {step.action === 'place-central' &&
            'Miðatómið er venjulega það sem getur myndað flest tengsl (ekki H).'}
          {step.action === 'draw-bonds' &&
            'Byrjaðu alltaf með einföld tengsl. Tvöföld/þreföld koma seinna ef þarf.'}
          {step.action === 'distribute' && 'Settu einstæð pör á ytri atóm fyrst, síðan miðatómið.'}
          {step.action === 'check-octet' && 'H vill 2 rafeindir, flest önnur vilja 8 rafeindir.'}
          {step.action === 'complete' && 'Til hamingju! Reyndu næstu sameind.'}
        </div>
      </div>
    </div>
  );
}
