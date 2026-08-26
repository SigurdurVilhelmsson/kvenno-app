import { useMemo, useState } from 'react';

import { useEscapeKey } from '@shared/hooks';

import { ChainCard, PoolCard } from './RatioCard';
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

  const current = steps.length ? steps[steps.length - 1].after : START;
  const lastStep = steps.length ? steps[steps.length - 1] : null;

  return (
    <div className="mx-auto max-w-4xl">
      <button
        type="button"
        onClick={onBack}
        className="game-btn mb-4 rounded-lg border border-warm-300 px-3 py-1.5 text-sm text-warm-700 hover:bg-warm-50"
      >
        ← Aftur í valmynd
      </button>

      <div className="mb-5 rounded-xl bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold text-warm-800">Prófaðu þig áfram</h2>
        <p className="mt-2 text-warm-700">
          Hér er ekkert rétt eða rangt svar og ekkert mark að stefna á. Þú ert með 5,00 g af
          magnesíum. Bættu hlutföllum við og fylgstu með hvað verður um einingarnar — líka þegar
          ekkert styttist út.
        </p>
      </div>

      <div className="mb-5 rounded-xl bg-white p-5 shadow-sm">
        <h3 className="mb-3 font-semibold text-warm-800">Keðjan</h3>
        <div className="flex flex-wrap items-stretch gap-3">
          <div className="flex items-center rounded-lg bg-warm-100 px-3 py-2">
            <UnitsDisplay quantity={START} valueLabel={START_LABEL} />
          </div>
          {slots.map((slot, position) => (
            <div key={`${slot.id}-${position}`} className="flex items-center gap-3">
              <span aria-hidden="true" className="text-warm-400">
                ×
              </span>
              <ChainCard
                ratio={orient(ratioById(slot.id), slot.orientation)}
                position={position + 1}
                onFlip={() =>
                  setSlots((s) =>
                    s.map((entry, i) =>
                      i === position ? { ...entry, orientation: flip(entry.orientation) } : entry
                    )
                  )
                }
                onRemove={() => setSlots((s) => s.filter((_, i) => i !== position))}
              />
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-lg bg-warm-50 p-4">
          <span className="block text-xs font-semibold uppercase tracking-wide text-warm-500">
            Þú ert núna með
          </span>
          <UnitsDisplay quantity={current} className="mt-1 text-xl" />
          {lastStep && (
            <p className="mt-2 text-sm text-warm-600">
              {lastStep.cancelCount > 0
                ? 'Einingar styttust út í síðasta skrefi og útkoman er eining sem þýðir eitthvað.'
                : 'Ekkert styttist út í síðasta skrefi. Útkoman er eining sem enginn getur notað — prófaðu að snúa spjaldinu við.'}
            </p>
          )}
        </div>

        {slots.length > 0 && (
          <button
            type="button"
            onClick={() => setSlots([])}
            className="game-btn mt-3 rounded-lg border border-warm-300 px-4 py-2 text-sm text-warm-700 hover:bg-warm-50"
          >
            Hreinsa keðjuna
          </button>
        )}
      </div>

      <div className="mb-5 rounded-xl bg-white p-5 shadow-sm">
        <h3 className="mb-3 font-semibold text-warm-800">Hlutföll í boði</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {POOL_IDS.map((id) => (
            <PoolCard
              key={id}
              equivalence={ratioById(id)}
              onAdd={() => setSlots((s) => [...s, { id, orientation: 'forward' }])}
            />
          ))}
        </div>
      </div>

      <div className="rounded-xl border-2 border-sky-200 bg-sky-50 p-5">
        <h3 className="font-semibold text-sky-900">Þrennt til að prófa</h3>
        <ul className="mt-2 space-y-2 text-sm text-sky-900">
          {THINGS_TO_TRY.map((item) => (
            <li key={item} className="flex gap-2">
              <span aria-hidden="true">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        onClick={onComplete}
        className="game-btn mt-6 w-full rounded-lg bg-kvenno-orange px-5 py-3 font-semibold text-white hover:bg-kvenno-orange-dark"
      >
        Áfram
      </button>
    </div>
  );
}
