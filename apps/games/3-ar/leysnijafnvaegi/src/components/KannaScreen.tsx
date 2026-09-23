import { useState } from 'react';

import { BackButton } from './BackButton';
import { Sci } from './Sci';
import { SALTS, SALT_NOTES } from '../data/salts';
import { formatScientific, molarSolubility, solubilityWithCommonIon } from '../engine/ksp';

/**
 * Kanna — the discovery phase. No right or wrong, no score.
 *
 * Two things to discover, and the second is the one students never expect.
 *
 * **"Óleysanlegt" is a number.** A Year-1 student learned from
 * `1-ar/utfellingarhvorf` that AgCl does not dissolve. It does: 1,3 × 10⁻⁵ M of
 * it, which is small and is not zero. Lining the pool up by Ksp shows a range
 * of twelve orders of magnitude hiding inside one word.
 *
 * **Adding one of its own ions makes it far less soluble still.**
 * `samjónahrif`. The slider is the phase's whole argument: drag it and AgCl's
 * solubility falls by a factor of seven thousand, without anything being
 * removed from the beaker.
 */

interface Props {
  onComplete: () => void;
  onBack: () => void;
}

const STEPS = [0, 0.0001, 0.001, 0.01, 0.05, 0.1];

export function KannaScreen({ onComplete, onBack }: Props) {
  const [formula, setFormula] = useState('AgCl');
  const [stepIndex, setStepIndex] = useState(0);
  const [moved, setMoved] = useState(false);

  const salt = SALTS.find((s) => s.formula === formula)!;
  const note = SALT_NOTES.get(salt.formula);
  const pure = molarSolubility(salt);
  const concentration = STEPS[stepIndex];
  const { exact } = solubilityWithCommonIon(salt, 'anion', concentration);
  const suppression = pure / exact;

  // A log bar: solubilities here span 10⁻⁵ to 10⁻², so a linear bar would show
  // one filled cell and eleven empty ones.
  const barWidth = (value: number) => {
    const lo = -9;
    const hi = -1;
    const clamped = Math.min(Math.max(Math.log10(value), lo), hi);
    return `${((clamped - lo) / (hi - lo)) * 100}%`;
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-lg bg-white p-4 shadow-md sm:p-6 md:p-8">
        <div className="mb-6 flex items-baseline justify-between gap-3">
          <h2 className="min-w-0 text-xl font-bold text-warm-800 sm:text-2xl">
            Kanna — hvað þýðir „óleysanlegt“?
          </h2>
          <BackButton onClick={onBack} />
        </div>

        <p className="mb-6 text-warm-700">
          Í Útfellingarhvörfum lærðirðu að silfurklóríð sé óleysanlegt. Það er ekki alveg satt — það
          leysist, bara mjög lítið. Hér er talan á bak við orðið, og hún er ekki sú sama fyrir öll
          efni sem leysnireglurnar kalla óleysanleg.
        </p>

        <div className="mb-6 flex flex-wrap gap-2">
          {SALTS.map((s) => (
            <button
              key={s.formula}
              type="button"
              onClick={() => setFormula(s.formula)}
              className={`game-btn rounded-lg border-2 px-3 py-2 font-mono text-sm pointer-coarse:min-h-11 ${
                s.formula === formula
                  ? 'border-orange-400 bg-orange-50 font-semibold text-orange-900'
                  : 'border-warm-200 bg-white text-warm-700 hover:bg-warm-50'
              }`}
            >
              {s.formula}
            </button>
          ))}
        </div>

        <div className="mb-6 rounded-xl border-2 border-warm-200 bg-warm-50 p-4 sm:p-5">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-3">
            <span className="font-mono text-2xl text-warm-900">{salt.formula}</span>
            <span className="text-sm text-warm-600">{salt.name}</span>
          </div>
          {/* Two columns only where there is room: on a phone each column is
              narrower than the word Leysnimargfeldi. */}
          <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 sm:gap-4">
            <div>
              <dt className="text-warm-600">Leysnimargfeldi</dt>
              <dd className="font-mono text-lg text-warm-900">
                <Sci value={salt.ksp} />
              </dd>
            </div>
            <div>
              <dt className="text-warm-600">Mólarleysni í hreinu vatni</dt>
              <dd className="font-mono text-lg text-warm-900">
                <Sci value={pure} figures={3} unit="M" />
              </dd>
            </div>
          </dl>
          {note?.context && <p className="mt-3 text-sm text-warm-700">{note.context}</p>}
        </div>

        <div className="mb-6 rounded-xl border-2 border-sky-200 bg-sky-50 p-4 sm:p-5">
          <h3 className="mb-1 font-semibold text-sky-900">
            Bættu {salt.anion} út í — jóninni sem efnið á sjálft
          </h3>
          <p className="mb-4 text-sm text-sky-800">
            Ekkert er tekið úr glasinu. Samt fellur leysnin.
          </p>

          {/* The track is 16 px tall; on a touch screen the whole 44 px strip
              around it takes the finger. */}
          <input
            type="range"
            min={0}
            max={STEPS.length - 1}
            step={1}
            value={stepIndex}
            aria-label={`Styrkur af ${salt.anion}`}
            onChange={(e) => {
              setStepIndex(Number(e.target.value));
              setMoved(true);
            }}
            className="w-full pointer-coarse:h-11"
          />
          <div className="mb-4 flex justify-between font-mono text-xs text-sky-700">
            {STEPS.map((s) => (
              <span key={s}>{s === 0 ? '0' : s}</span>
            ))}
          </div>

          <div className="space-y-2">
            <Bar
              label="Hreint vatn"
              width={barWidth(pure)}
              value={formatScientific(pure, 3)}
              tone="bg-sky-400"
            />
            <Bar
              label={concentration === 0 ? 'Sami mælikvarði' : `Í ${concentration} M ${salt.anion}`}
              width={barWidth(exact)}
              value={formatScientific(exact, 3)}
              tone="bg-orange-400"
            />
          </div>

          {concentration > 0 && (
            <p className="mt-4 rounded-lg bg-white/70 p-3 text-sm text-sky-900">
              <strong>
                {suppression < 10 ? suppression.toFixed(1) : Math.round(suppression)}-falt
              </strong>{' '}
              minni leysni en í hreinu vatni. Þetta heita <strong>samjónahrif</strong>, og skýringin
              kemur í næsta áfanga.
            </p>
          )}
        </div>

        <div className="border-t border-warm-200 pt-6">
          <p className="mb-3 text-sm text-warm-600">
            {moved
              ? 'Taktu eftir að súlurnar eru á lógaritmískum kvarða — annars sæist hreina vatnið varla heldur.'
              : 'Prófaðu að draga sleðann áður en þú heldur áfram.'}
          </p>
          <button
            type="button"
            onClick={onComplete}
            disabled={!moved}
            className="game-btn rounded-lg bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-warm-300 pointer-coarse:min-h-11"
          >
            Áfram í Skilja
          </button>
        </div>
      </div>
    </div>
  );
}

function Bar({
  label,
  width,
  value,
  tone,
}: {
  label: string;
  width: string;
  value: string;
  tone: string;
}) {
  return (
    <div>
      <div className="mb-1 flex justify-between gap-2 text-xs text-sky-800">
        <span>{label}</span>
        <span className="whitespace-nowrap font-mono">{value} M</span>
      </div>
      <div className="h-5 overflow-hidden rounded bg-white">
        <div className={`h-full ${tone} transition-all duration-300`} style={{ width }} />
      </div>
    </div>
  );
}
