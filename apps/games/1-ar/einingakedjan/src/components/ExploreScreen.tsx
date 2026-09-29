import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { useEscapeKey } from '@shared/hooks';
import { focusTarget, isPhone, revealSpan, useIsPhone } from '@shared/utils';

import { useBackButton } from './BackButton';
import { ChainRow } from './ChainRow';
import { PoolCard } from './RatioCard';
import { UnitsDisplay } from './UnitsDisplay';
import { ratioById } from '../data/ratios';
import {
  applyRatio,
  flip,
  orient,
  quantity,
  type Orientation,
  type StepResult,
} from '../engine/units';
import { revealOnDesktop } from '../utils/desktopReveal';

const START = quantity(5.0, 'g', 'Mg');
/** As written in the prose above the board: the trailing zeros are the precision. */
const START_LABEL = '5,00';

const POOL_IDS = ['mm-Mg', 'avo-Mg', 'mm-MgO', 'jafna-Mg-MgO', 'metric-g-kg'];

const THINGS_TO_TRY = [
  'Settu mólmassa magnesíums í keðjuna og snúðu honum svo við. Hvor áttin lætur grömmin hverfa?',
  'Prófaðu að setja mólmassa MgO beint á 5,00 g Mg. Hvers vegna styttist ekkert út, þótt báðar einingarnar heiti „g“?',
  'Settu tvö hlutföll í röð og skoðaðu hvað stendur eftir á milli þeirra.',
];

interface ExploreScreenProps {
  onComplete: () => void;
  onBack: () => void;
}

/**
 * A sandbox with no target and no right answer.
 *
 * Nothing here is graded and nothing is blocked: a card that cancels nothing is
 * applied anyway and the resulting nonsense unit is displayed. Discovering that
 * `g Mg · g MgO` is not a unit anyone can use is the point of the screen.
 */
export function ExploreScreen({ onComplete, onBack }: ExploreScreenProps) {
  useEscapeKey(onBack);
  const back = useBackButton(onBack);
  const phone = useIsPhone();
  const chainHeadingId = useId();
  const resultLabelId = useId();

  const [slots, setSlots] = useState<{ id: string; orientation: Orientation }[]>([]);

  // Unlike the graded phases this keeps going through a step that cancels nothing.
  const steps = useMemo(() => {
    const out: StepResult[] = [];
    let current = START;
    for (const slot of slots) {
      const step = applyRatio(current, orient(ratioById(slot.id), slot.orientation));
      out.push(step);
      current = step.after;
    }
    return out;
  }, [slots]);

  // A pool card lands in the chain, which sits above the pool: bring the new
  // card and what it did to the units into view together. On a phone the chain
  // is one row (ChainRow scrolls it sideways to the new card), and the least
  // move that shows the row down to the result is made. A desktop window keeps
  // the game's old reveal exactly. Focus moves to the result at every width,
  // so a screen reader hears what the card did to the units (and a second
  // Enter lands there rather than adding the card twice).
  const chainRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const clearRef = useRef<HTMLButtonElement>(null);
  const shownSlotCount = useRef(slots.length);
  useEffect(() => {
    const added = slots.length > shownSlotCount.current;
    shownSlotCount.current = slots.length;
    if (!added) return;
    // On a phone: the row, the result and "Hreinsa keðjuna" under it, or as
    // much of that as fits, the result at the least.
    if (isPhone()) {
      revealSpan(clearRef.current ?? resultRef.current, [chainRef.current, resultRef.current]);
    } else {
      const placed = chainRef.current?.querySelectorAll('[data-slot]');
      revealOnDesktop(placed?.[placed.length - 1], resultRef.current);
    }
    focusTarget(resultRef.current);
  }, [slots.length]);

  // "Hreinsa keðjuna" and a card's ✕ unmount the button just pressed: keep
  // focus in the chain, on its heading, rather than let it fall to <body>.
  const chainHeadingRef = useRef<HTMLHeadingElement>(null);
  const refocusChain = useRef(false);
  const focusChain = () => {
    refocusChain.current = true;
  };
  useLayoutEffect(() => {
    if (!refocusChain.current) return;
    refocusChain.current = false;
    const active = document.activeElement;
    if (!active || active === document.body) focusTarget(chainHeadingRef.current);
  }, [slots]);

  const current = steps.length ? steps[steps.length - 1].after : START;
  const lastStep = steps.length ? steps[steps.length - 1] : null;

  const thingsToTry = (
    <div className="rounded-xl border-2 border-sky-200 bg-sky-50 p-5 phone:mb-3 phone:p-3">
      <h3 className="font-semibold text-sky-900">Þrennt til að prófa</h3>
      <ul className="mt-2 space-y-2 text-sm text-sky-900 phone:space-y-1.5">
        {THINGS_TO_TRY.map((item) => (
          <li key={item} className="flex gap-2">
            <span aria-hidden="true">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="mx-auto max-w-4xl">
      {back.above}

      <div className="mb-5 rounded-xl bg-white p-5 shadow-sm phone:mb-3 phone:p-3">
        {/* On a phone the back button shares this row (design P4). */}
        <div className="phone:flex phone:items-center phone:gap-3">
          {back.inRow}
          <h2 className="text-xl font-bold text-warm-800 phone:min-w-0 phone:text-base">
            Prófaðu þig áfram
          </h2>
        </div>
        <p className="mt-2 text-warm-700">
          Hér er ekkert rétt eða rangt svar og ekkert mark að stefna á. Þú ert með 5,00 g af
          magnesíum. Bættu hlutföllum við og fylgstu með hvað verður um einingarnar — líka þegar
          ekkert styttist út.
        </p>
      </div>

      {/* On a phone the three suggestions come straight after the intro, where
          they are read before the first card is placed rather than found after
          the pool (design §4). It moves in the DOM, not by CSS order; it holds
          nothing focusable either way. */}
      {phone && thingsToTry}

      {/* On a phone on its side the chain and the pool sit side by side, so a
          card and what it did are on screen together. Plain blocks elsewhere. */}
      <div className="phone-land:mb-5 phone-land:grid phone-land:grid-cols-2 phone-land:items-start phone-land:gap-3">
        <div
          role="group"
          aria-labelledby={chainHeadingId}
          className="mb-5 rounded-xl bg-white p-5 shadow-sm phone:mb-3 phone:p-3 phone-land:mb-0"
        >
          <h3
            ref={chainHeadingRef}
            id={chainHeadingId}
            className="mb-3 font-semibold text-warm-800 phone:mb-2"
          >
            Keðjan
          </h3>
          <ChainRow
            rowRef={chainRef}
            start={START}
            startLabel={START_LABEL}
            markSlots
            className="flex-wrap"
            ratios={slots.map((slot, position) => ({
              key: `${slot.id}-${position}`,
              ratio: orient(ratioById(slot.id), slot.orientation),
            }))}
            onFlip={(position) =>
              setSlots((s) =>
                s.map((entry, i) =>
                  i === position ? { ...entry, orientation: flip(entry.orientation) } : entry
                )
              )
            }
            onRemove={(position) => {
              setSlots((s) => s.filter((_, i) => i !== position));
              focusChain();
            }}
          />

          <div
            ref={resultRef}
            role="group"
            aria-labelledby={resultLabelId}
            className="mt-4 rounded-lg bg-warm-50 p-4 phone:mt-2 phone:p-2.5"
          >
            <span
              id={resultLabelId}
              className="block text-xs font-semibold uppercase tracking-wide text-warm-500"
            >
              Þú ert núna með
            </span>
            <UnitsDisplay
              quantity={current}
              valueLabel={lastStep ? undefined : START_LABEL}
              className="mt-1 text-xl phone:mt-0.5 phone:text-lg"
            />
            {lastStep && (
              <p className="mt-2 text-sm text-warm-600 phone:mt-1">
                {lastStep.cancelCount > 0
                  ? 'Einingar styttust út í síðasta skrefi og útkoman er eining sem þýðir eitthvað.'
                  : 'Ekkert styttist út í síðasta skrefi. Útkoman er eining sem enginn getur notað — prófaðu að snúa spjaldinu við.'}
              </p>
            )}
          </div>

          {slots.length > 0 && (
            <button
              ref={clearRef}
              type="button"
              onClick={() => {
                setSlots([]);
                focusChain();
              }}
              className="game-btn mt-3 rounded-lg border border-warm-300 px-4 py-2 text-sm text-warm-700 hover:bg-warm-50 pointer-coarse:min-h-11 phone:mt-2"
            >
              Hreinsa keðjuna
            </button>
          )}
        </div>

        {/* On a phone two cards to a row where they fit; a card whose text is
            wider than half the row takes the whole row rather than break a
            unit apart. */}
        <div className="mb-5 rounded-xl bg-white p-5 shadow-sm phone:mb-3 phone:p-3 phone-land:mb-0">
          <h3 className="mb-3 font-semibold text-warm-800 phone:mb-2">Hlutföll í boði</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 phone:flex phone:flex-wrap phone:gap-2">
            {POOL_IDS.map((id) => (
              <PoolCard
                key={id}
                equivalence={ratioById(id)}
                className="phone:flex-[1_1_9rem]"
                onAdd={() => setSlots((s) => [...s, { id, orientation: 'forward' }])}
              />
            ))}
          </div>
        </div>
      </div>

      {!phone && thingsToTry}

      <button
        type="button"
        onClick={onComplete}
        className="game-btn mt-6 w-full rounded-lg bg-kvenno-orange px-5 py-3 font-semibold text-white hover:bg-kvenno-orange-dark phone:mt-4"
      >
        Áfram
      </button>
    </div>
  );
}
