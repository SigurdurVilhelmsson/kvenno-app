import { useState, useEffect, useId, useLayoutEffect, useRef } from 'react';

import { focusTarget, useArmedAfter, useItemTop, useRevealAfterCommit } from '@shared/utils';

import { LewisStructure } from './LewisStructure';
import type { LewisDrawing } from '../utils/lewisLayout';
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
      instruction: `${totalElectrons} - ${electronsInBonds} = ${electronsForLonePairs} rafeindir eftir. Dreifðu þeim sem stökum pörum (2 rafeindir á hvert par).`,
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

  // Each new step brings its card's top back on a phone and focuses its title.
  const stepRef = useItemTop<HTMLDivElement>(currentStep);
  // After a check: on a phone the verdict through its button comes into view,
  // and focus moves to the verdict, not to the button, so a second Enter lands
  // on nothing (design P3). "Næsta skref" ignores a press within 400 ms of
  // appearing, so a double tap cannot skip it either; nor can "Reyna aftur"
  // clear a wrong verdict before it is read.
  const feedbackRef = useRef<HTMLDivElement>(null);
  const feedbackActionRef = useRef<HTMLButtonElement>(null);
  useRevealAfterCommit(showFeedback, () => ({
    bottom: feedbackActionRef.current,
    tops: [feedbackRef.current],
    focus: feedbackRef.current,
  }));
  const armed = useArmedAfter(400, `${currentStep}:${showFeedback}`);
  const verdictId = useId();

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

  // Enter in a count field checks it, as "Athuga" beside it does.
  const checkOnEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && userValue !== null) {
      e.preventDefault();
      handleCheckValue();
    }
  };

  // A wrong answer used to leave the step with no way forward but skipping the
  // whole walkthrough: the input was gone and only a correct answer showed
  // "Næsta skref".
  const [retries, setRetries] = useState(0);
  const retryStep = () => {
    setShowFeedback(false);
    setIsCorrect(false);
    setUserValue(null);
    setRetries((n) => n + 1);
  };
  // "Reyna aftur" unmounts with the feedback, which dropped focus to <body>
  // (P3.5). Focus goes back to the step's field — or, on the lone-pair step,
  // which has none, to the step's title — as the syrufastinn retry does.
  useLayoutEffect(() => {
    if (retries === 0) return;
    const card = stepRef.current;
    focusTarget(
      card?.querySelector<HTMLElement>('input') ??
        card?.querySelector<HTMLElement>('[data-item-start]') ??
        card
    );
  }, [retries, stepRef]);

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

  // The molecule as it stands, drawn as every structure in the game is. The
  // walkthrough used to draw balls and bonds and never a single lone pair, so
  // the step about placing pairs had nothing on screen to place them on.
  // Atoms sharing a symbol share a counter; its pairs are dealt out in turn.
  const drawing = (): LewisDrawing => {
    const dealt = new Map<string, number>();
    return {
      central: {
        symbol: centralAtom?.symbol ?? '',
        lonePairs: getAtomLonePairs(centralAtom?.symbol ?? ''),
      },
      outer: surroundingAtoms.map((a, idx) => {
        const same = surroundingAtoms.filter((x) => x.symbol === a.symbol).length;
        const nth = dealt.get(a.symbol) ?? 0;
        dealt.set(a.symbol, nth + 1);
        const total = getAtomLonePairs(a.symbol);
        const share = Math.floor(total / same) + (nth < total % same ? 1 : 0);
        return {
          symbol: a.symbol,
          bond: idx < bondsDrawn.length ? 'single' : 'none',
          lonePairs: share,
        } as const;
      }),
    };
  };
  const structure = (
    <div className="flex justify-center py-2">
      <LewisStructure
        drawing={drawing()}
        label={`Lewis-formúla ${molecule} eins og hún stendur`}
        maxWidth={220}
      />
    </div>
  );

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
      <div className="flex items-center justify-between gap-2 mb-4 phone:mb-2">
        <h3
          className={`font-bold text-green-800 flex items-center gap-2 ${compact ? 'text-base' : 'text-lg'}`}
        >
          <span>📝</span> Leiðsögn: {molecule}
        </h3>
        <div className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full whitespace-nowrap shrink-0">
          Skref {currentStep + 1}/{steps.length}
        </div>
      </div>

      {/* Progress bar. Dropped on a phone: "Skref n/6" beside the title says the same. */}
      <div className="w-full bg-warm-200 rounded-full h-2 mb-6 phone:hidden">
        <div
          className="bg-green-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>

      {/* Electron tracker. One line on a phone: each count beside its label. */}
      <div className="bg-white rounded-lg p-4 mb-4 shadow-xs phone:px-3 phone:py-1.5 phone:mb-2">
        <div className="flex justify-between items-center">
          <div className="text-center phone:flex phone:flex-row-reverse phone:items-baseline phone:gap-1">
            <div className="text-2xl font-bold text-blue-600 phone:text-lg">{totalElectrons}</div>
            <div className="text-xs text-warm-500">Alls</div>
          </div>
          <div className="text-warm-400">−</div>
          <div className="text-center phone:flex phone:flex-row-reverse phone:items-baseline phone:gap-1">
            <div className="text-2xl font-bold text-green-600 phone:text-lg">{electronsUsed}</div>
            <div className="text-xs text-warm-500">Notaðar</div>
          </div>
          <div className="text-warm-400">=</div>
          <div className="text-center phone:flex phone:flex-row-reverse phone:items-baseline phone:gap-1">
            <div
              className={`text-2xl font-bold phone:text-lg ${electronsRemaining === 0 ? 'text-green-600' : 'text-orange-600'}`}
            >
              {electronsRemaining}
            </div>
            <div className="text-xs text-warm-500">Eftir</div>
          </div>
        </div>
      </div>

      {/* Step content */}
      <div
        ref={stepRef}
        className="bg-white rounded-lg p-4 sm:p-5 mb-4 shadow-xs phone:p-3 phone:mb-3"
      >
        <div className="flex items-center gap-2 mb-3 phone:mb-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold phone:w-7 phone:h-7 phone:shrink-0 ${
              showFeedback && isCorrect ? 'bg-green-500' : 'bg-blue-500'
            }`}
          >
            {currentStep + 1}
          </div>
          <h4 data-item-start className="font-bold text-warm-800">
            {step.title}
          </h4>
        </div>

        <p className="text-warm-700 mb-4 phone:mb-3">{step.instruction}</p>

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
                onKeyDown={checkOnEnter}
                enterKeyHint="done"
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
            <div className="flex justify-center py-6 phone:py-4">
              <div className={`relative ${animating ? 'animate-bounce' : ''}`}>
                <LewisStructure
                  drawing={{
                    central: { symbol: centralAtom?.symbol ?? '', lonePairs: 0 },
                    outer: [],
                  }}
                  label={`Miðatómið ${centralAtom?.symbol ?? ''}`}
                  maxWidth={64}
                />
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
            {/* The skeleton: dashed where a bond is still to be drawn */}
            {structure}

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
                onKeyDown={checkOnEnter}
                enterKeyHint="done"
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
            {structure}
            <div className="bg-yellow-50 p-3 rounded-lg text-sm text-yellow-800 mb-4">
              Rafeindir eftir: <strong>{electronsRemaining}</strong> ={' '}
              {electronsRemaining === 2 ? '1 stakt par' : `${electronsRemaining / 2} stök pör`}
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
                    aria-label={`Bæta stöku pari við ${centralAtom?.symbol} (miðatóm)`}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-warm-300 text-white py-2 rounded pointer-coarse:min-h-11"
                  >
                    + Par
                  </button>
                  <button
                    onClick={() => handleRemoveLonePair(centralAtom?.symbol || '')}
                    disabled={getAtomLonePairs(centralAtom?.symbol || '') === 0}
                    aria-label={`Taka stakt par af ${centralAtom?.symbol} (miðatóm)`}
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
                      aria-label={`Bæta stöku pari við ${atom.symbol} (ytri)`}
                      className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-warm-300 text-white py-2 rounded pointer-coarse:min-h-11"
                    >
                      + Par
                    </button>
                    <button
                      onClick={() => handleRemoveLonePair(atom.symbol)}
                      disabled={getAtomLonePairs(atom.symbol) === 0}
                      aria-label={`Taka stakt par af ${atom.symbol} (ytri)`}
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
            {structure}
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
            {structure}
            {/* Reached by "Næsta skref": the same guard, so a double tap on it
                cannot close the walkthrough unread. */}
            <button
              onClick={armed(() => onComplete?.())}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-all"
            >
              Ljúka
            </button>
          </div>
        )}

        {/* Feedback */}
        {/* The group focused after a check (P3), named by its verdict. */}
        {showFeedback && step.action !== 'complete' && (
          <div
            ref={feedbackRef}
            role="group"
            tabIndex={-1}
            aria-labelledby={verdictId}
            className={`mt-4 p-4 phone:mt-3 phone:p-3 rounded-lg focus:outline-none ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}
          >
            <div
              id={verdictId}
              className={`font-bold ${isCorrect ? 'text-green-700' : 'text-red-700'}`}
            >
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
                key="retry"
                ref={feedbackActionRef}
                onClick={armed(retryStep)}
                className="mt-3 w-full bg-warm-200 hover:bg-warm-300 text-warm-700 font-bold py-2 px-4 rounded-lg transition-all pointer-coarse:min-h-11"
              >
                Reyna aftur
              </button>
            )}
            {isCorrect && (
              <button
                key="next"
                ref={feedbackActionRef}
                onClick={armed(handleNextStep)}
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
          {step.action === 'distribute' && 'Settu stök pör á ytri atóm fyrst, síðan miðatómið.'}
          {step.action === 'check-octet' && 'H vill 2 rafeindir, flest önnur vilja 8 rafeindir.'}
          {step.action === 'complete' && 'Til hamingju! Reyndu næstu sameind.'}
        </div>
      </div>
    </div>
  );
}
