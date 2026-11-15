import { useLayoutEffect, useMemo, useRef, useState } from 'react';

import { FeedbackPanel } from '@shared/components';
import {
  focusTarget,
  revealSpan,
  shuffleArray,
  useArmedAfter,
  useItemTop,
  useRevealAfterCommit,
} from '@shared/utils';

import { AtomCounter } from './AtomCounter';
import { EquationEditor } from './EquationEditor';
import {
  DESCRIBED_REACTIONS,
  STATE_DECOY,
  label,
  type DescribedReaction,
  type Species,
} from '../data/descriptions';
import type { Molecule } from '../data/reactions';
import {
  buildUnbalancedDiagnostic,
  checkBalance,
  diagnoseMisconception,
} from '../utils/balanceChecker';

/** Items per run, from the twelve described reactions. */
export const DESCRIPTION_ITEMS = 6;

type Side = 'reactants' | 'products';

/** The chips offered on one side: the right ones, each in its likeliest wrong state, and a decoy. */
export function chipsFor(reaction: DescribedReaction, side: Side): string[] {
  const right = reaction[side].map((s) => label(s.formula, s.state));
  const wrongState = reaction[side].map((s) => label(s.formula, STATE_DECOY[s.state]));
  const decoys = reaction.decoys
    .filter((d) => d.side === side)
    .map((d) => label(d.formula, d.state));
  return shuffleArray([...new Set([...right, ...wrongState, ...decoys])]);
}

/**
 * What is wrong with the picked substances, the first side that is wrong:
 * a substance missing or extra, or one in the wrong state. Says which formula
 * has the wrong state, never which state is right.
 */
export function judgePick(
  reaction: DescribedReaction,
  picked: Record<Side, Set<string>>
): string | null {
  for (const side of ['reactants', 'products'] as const) {
    const right = reaction[side];
    const rightLabels = new Set(right.map((s) => label(s.formula, s.state)));
    const chosen = [...picked[side]];
    const word = side === 'reactants' ? 'Hvarfefnin' : 'Myndefnin';
    if (chosen.length === rightLabels.size && chosen.every((c) => rightLabels.has(c))) continue;
    const formulaOf = (l: string) => l.replace(/\((s|l|g|aq)\)$/, '');
    const rightFormulas = new Set(right.map((s) => s.formula));
    const chosenFormulas = chosen.map(formulaOf);
    const sameFormulas =
      chosenFormulas.length === rightFormulas.size &&
      chosenFormulas.every((f) => rightFormulas.has(f));
    if (sameFormulas) {
      const off = chosen.find((c) => !rightLabels.has(c))!;
      return `${word} eru rétt efni, en hamur ${formulaOf(off)} passar ekki við lýsinguna. Lestu aftur hvort það er fast, fljótandi, gas eða leyst í vatni.`;
    }
    return `${word} passa ekki við lýsinguna: eitt efni vantar, er ofaukið eða hefur ranga formúlu. Lestu aftur hvað ${side === 'reactants' ? 'hvarfast' : 'myndast'}.`;
  }
  return null;
}

const asMolecules = (species: Species[]): Molecule[] =>
  species.map((s) => ({
    formula: label(s.formula, s.state),
    elements: s.elements,
    coefficient: s.coefficient,
  }));

/** The balanced equation, as a student writes it. */
export function equationText(reaction: DescribedReaction): string {
  const side = (list: Species[]) =>
    list
      .map((s) => `${s.coefficient === 1 ? '' : s.coefficient}${label(s.formula, s.state)}`)
      .join(' + ');
  return `${side(reaction.reactants)} → ${side(reaction.products)}`;
}

interface Props {
  onComplete: (correct: number, total: number) => void;
  onBack: () => void;
}

/**
 * "Frá lýsingu til jöfnu" (year-1 plan item 17): read a reaction told in
 * words, pick its substances with their states, then balance it with the same
 * steppers and atom counter as the levels. Counted right when the substances
 * were right at the first try and the coefficients are right; a wrong set of
 * coefficients shows the right ones, as the levels do.
 */
export function FromDescription({ onComplete, onBack }: Props) {
  const items = useMemo(() => shuffleArray(DESCRIBED_REACTIONS).slice(0, DESCRIPTION_ITEMS), []);
  const total = items.length;
  const [idx, setIdx] = useState(0);
  const reaction = items[idx];
  const chips = useMemo(
    () => ({
      reactants: chipsFor(reaction, 'reactants'),
      products: chipsFor(reaction, 'products'),
    }),
    [reaction]
  );

  const [picked, setPicked] = useState<Record<Side, Set<string>>>({
    reactants: new Set(),
    products: new Set(),
  });
  const [pickMessage, setPickMessage] = useState<string | null>(null);
  const [pickTries, setPickTries] = useState(0);
  const [balancing, setBalancing] = useState(false);
  const reactants = useMemo(() => asMolecules(reaction.reactants), [reaction]);
  const products = useMemo(() => asMolecules(reaction.products), [reaction]);
  const [rc, setRc] = useState<number[]>([]);
  const [pc, setPc] = useState<number[]>([]);
  const [answered, setAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const balance = balancing ? checkBalance(reactants, products, rc, pc) : null;
  const right = balance ? balance.isBalanced && balance.isReduced : false;

  const cardRef = useItemTop<HTMLDivElement>(idx, { anyWidth: true, gap: 0 });
  const promptRef = useRef<HTMLDivElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const committed = answered || pickMessage !== null;
  useRevealAfterCommit(committed, () => ({
    bottom: actionsRef.current,
    tops: [promptRef.current, feedbackRef.current],
    focus: feedbackRef.current,
  }));
  const armed = useArmedAfter(400, `${idx}:${answered}:${pickTries}`);
  // "Reyna aftur" brings the chips back: focus moves to them, not to <body>,
  // and a phone shows them with the button below.
  const chipsRef = useRef<HTMLDivElement>(null);
  const [retries, setRetries] = useState(0);
  const shownRetries = useRef(retries);
  useLayoutEffect(() => {
    if (shownRetries.current === retries) return;
    shownRetries.current = retries;
    revealSpan(actionsRef.current, [chipsRef.current]);
    focusTarget(chipsRef.current);
  }, [retries]);

  const toggle = (side: Side, chip: string) => {
    if (balancing) return;
    setPickMessage(null);
    setPicked((prev) => {
      const next = new Set(prev[side]);
      if (next.has(chip)) next.delete(chip);
      else next.add(chip);
      return { ...prev, [side]: next };
    });
  };

  const checkPick = () => {
    setPickTries((n) => n + 1);
    const message = judgePick(reaction, picked);
    if (message) {
      setPickMessage(message);
      return;
    }
    setRc(reaction.reactants.map(() => 1));
    setPc(reaction.products.map(() => 1));
    setBalancing(true);
  };

  const checkBalanceAnswer = () => {
    setAnswered(true);
    if (right && pickTries === 1) setCorrectCount((n) => n + 1);
  };

  const next = () => {
    if (idx + 1 >= total) {
      onComplete(correctCount, total);
      return;
    }
    setIdx(idx + 1);
    setPicked({ reactants: new Set(), products: new Set() });
    setPickMessage(null);
    setPickTries(0);
    setBalancing(false);
    setAnswered(false);
  };

  const chipRow = (side: Side, heading: string) => (
    <div>
      <div className="text-xs text-warm-600 mb-1">{heading}</div>
      <div role="group" aria-label={heading} className="flex flex-wrap gap-2">
        {chips[side].map((chip) => {
          const on = picked[side].has(chip);
          return (
            <button
              key={chip}
              aria-pressed={on}
              disabled={balancing}
              onClick={() => toggle(side, chip)}
              className={`px-3 py-2 min-h-[44px] rounded-lg font-mono text-base font-semibold border-2 transition-colors disabled:cursor-not-allowed ${
                on
                  ? 'border-kvenno-orange bg-orange-50 text-warm-900'
                  : 'border-warm-200 bg-white text-warm-700 hover:border-warm-400'
              }`}
            >
              {chip}
            </button>
          );
        })}
      </div>
    </div>
  );

  const misconception =
    answered && balance && !right
      ? diagnoseMisconception(reactants, products, rc, pc, balance)
      : undefined;

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white p-3 sm:p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-md p-3 sm:p-4 mb-4 phone:py-2 phone:mb-3 flex flex-wrap justify-between items-center gap-x-2 gap-y-1">
          <button
            onClick={onBack}
            className="whitespace-nowrap text-warm-500 hover:text-warm-700 font-semibold text-sm pointer-coarse:py-3 pointer-coarse:-my-3 pointer-coarse:px-2 pointer-coarse:-mx-2"
          >
            Til baka
          </button>
          <h1 className="whitespace-nowrap text-base sm:text-lg font-bold text-warm-800">
            Frá lýsingu til jöfnu
          </h1>
          <div className="text-lg font-bold text-warm-700">
            {idx + 1}/{total}
          </div>
        </div>

        <div
          ref={cardRef}
          className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4 phone:p-3 phone:mb-3 space-y-3"
        >
          <div ref={promptRef} data-item-start>
            <p className="text-lg text-warm-800 font-medium">{reaction.description}</p>
            <p className="mt-1 text-xs text-warm-500">
              (s) fast efni · (l) vökvi · (g) gas · (aq) leyst í vatni
            </p>
          </div>

          {(pickMessage || answered) && (
            <div ref={feedbackRef} role="group" tabIndex={-1} aria-label="Niðurstaða">
              {pickMessage ? (
                <FeedbackPanel
                  feedback={{ isCorrect: false, explanation: pickMessage }}
                  config={{ showExplanation: true }}
                />
              ) : (
                <FeedbackPanel
                  feedback={{
                    isCorrect: right,
                    explanation: right
                      ? `${equationText(reaction)}`
                      : `${balance && !balance.isBalanced ? buildUnbalancedDiagnostic(balance.elements) + ' ' : 'Atómin stemma, en stuðlarnir eru ekki lægstu heilu tölurnar. '}Rétt jafna: ${equationText(reaction)}`,
                    misconception,
                  }}
                  config={{ showExplanation: true }}
                />
              )}
            </div>
          )}

          {!balancing ? (
            <div
              ref={chipsRef}
              tabIndex={-1}
              aria-label="Veldu efnin"
              className={`space-y-3 outline-none ${pickMessage ? 'phone:hidden' : ''}`}
            >
              {chipRow('reactants', 'Hvarfefni (vinstra megin)')}
              {chipRow('products', 'Myndefni (hægra megin)')}
            </div>
          ) : (
            <div className="space-y-3">
              {pickTries === 1 && !answered && (
                <p className="text-sm text-green-700 font-semibold">
                  Efnin og hamur þeirra eru rétt. Stilltu nú jöfnuna.
                </p>
              )}
              <EquationEditor
                reactants={reactants}
                products={products}
                reactantCoeffs={rc}
                productCoeffs={pc}
                onReactantCoeffChange={(i, v) => setRc((c) => c.map((x, j) => (j === i ? v : x)))}
                onProductCoeffChange={(i, v) => setPc((c) => c.map((x, j) => (j === i ? v : x)))}
                disabled={answered}
              />
              {balance && <AtomCounter elements={balance.elements} />}
            </div>
          )}
        </div>

        <div ref={actionsRef} className="flex gap-3">
          {!balancing ? (
            pickMessage ? (
              <button
                key="retry"
                onClick={armed(() => {
                  setPickMessage(null);
                  setRetries((n) => n + 1);
                })}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 rounded-xl transition-colors"
              >
                Reyna aftur
              </button>
            ) : (
              <button
                key="pick"
                onClick={checkPick}
                disabled={picked.reactants.size === 0 || picked.products.size === 0}
                className="flex-1 bg-kvenno-orange hover:bg-kvenno-orange-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Athuga efnin
              </button>
            )
          ) : !answered ? (
            <button
              key="check"
              onClick={checkBalanceAnswer}
              className="flex-1 bg-kvenno-orange hover:bg-kvenno-orange-600 text-white font-bold py-3 rounded-xl transition-colors"
            >
              Athuga
            </button>
          ) : (
            <button
              key="next"
              onClick={armed(next)}
              className="flex-1 bg-kvenno-orange hover:bg-kvenno-orange-600 text-white font-bold py-3 rounded-xl transition-colors"
            >
              {idx + 1 < total ? 'Næsta lýsing →' : 'Sjá niðurstöður'}
            </button>
          )}
        </div>

        <button
          onClick={onBack}
          className="mt-4 w-full text-warm-500 hover:text-warm-700 font-semibold py-2 text-sm pointer-coarse:py-3"
        >
          Til baka í valmynd
        </button>
      </div>
    </div>
  );
}
