import { useMemo, useState } from 'react';

import {
  amountsAtExtent,
  directionFromQ,
  equationOf,
  kcExpression,
  reactionQuotient,
  solveExtent,
} from '@shared/engine/equilibrium';
import { formatScientific } from '@shared/utils';

import { reactionBy } from '../data/reactions';

/**
 * Kanna — push a mixture around and watch Q move. No right or wrong.
 *
 * The one thing this phase has to land is that **K is a property of the
 * reaction and Q is a property of the flask**. Every mixture the student can
 * build here settles to the same K, which is the observation the next phase
 * turns into a definition — and it is exactly what `equilibrium-shifter`
 * asserts in words without ever showing a number.
 */

const reaction = reactionBy('vatnsgas');
const K = reaction.constant!.value;

interface Props {
  onComplete: () => void;
  onBack: () => void;
}

const PRESETS: { label: string; amounts: Record<string, number> }[] = [
  { label: 'Bara hvarfefni', amounts: { CO: 0.02, 'H₂O': 0.02, 'CO₂': 0, 'H₂': 0 } },
  { label: 'Bara myndefni', amounts: { CO: 0, 'H₂O': 0, 'CO₂': 0.02, 'H₂': 0.02 } },
  { label: 'Mikið af myndefnum', amounts: { CO: 0.011, 'H₂O': 0.0011, 'CO₂': 0.037, 'H₂': 0.046 } },
  { label: 'Tífalt þynnra', amounts: { CO: 0.002, 'H₂O': 0.002, 'CO₂': 0, 'H₂': 0 } },
];

const SPECIES = ['CO', 'H₂O', 'CO₂', 'H₂'] as const;

export function KannaScreen({ onComplete, onBack }: Props) {
  const [amounts, setAmounts] = useState<Record<string, number>>(PRESETS[0].amounts);
  const [seen, setSeen] = useState<number[]>([]);

  const q = reactionQuotient(reaction, amounts);
  const direction = directionFromQ(q, K);

  const settled = useMemo(() => {
    try {
      const x = solveExtent(reaction, amounts, K);
      return amountsAtExtent(reaction, amounts, x);
    } catch {
      return null;
    }
  }, [amounts]);

  const settledQ = settled ? reactionQuotient(reaction, settled) : null;

  const choose = (index: number) => {
    setAmounts(PRESETS[index].amounts);
    if (!seen.includes(index)) setSeen([...seen, index]);
  };

  const allSeen = seen.length >= PRESETS.length;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-lg bg-white p-6 shadow-md md:p-8">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="text-2xl font-bold text-warm-800">Kanna — hvert endar blandan?</h2>
          <button onClick={onBack} className="text-sm text-warm-500 underline">
            Til baka
          </button>
        </div>

        <div className="mb-6 rounded-xl border-2 border-warm-200 bg-warm-50 p-5">
          <p className="mb-2 font-mono text-lg text-warm-800">{equationOf(reaction)}</p>
          <p className="text-sm text-warm-600">
            Vatnsgashvarfið við 800 °C. Veldu upphafsblöndu og sjáðu hvar hún endar.
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3">
          {PRESETS.map((preset, index) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => choose(index)}
              className={`game-btn rounded-lg border-2 px-4 py-3 text-sm font-semibold transition-colors ${
                amounts === preset.amounts
                  ? 'border-kvenno-orange bg-orange-50 text-kvenno-orange-dark'
                  : 'border-warm-300 bg-white text-warm-700 hover:border-warm-400'
              }`}
            >
              {preset.label}
              {seen.includes(index) && <span className="ml-2 text-xs text-green-600">✓</span>}
            </button>
          ))}
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border-2 border-warm-200 p-4">
            <h3 className="mb-3 font-semibold text-warm-800">Í upphafi</h3>
            <dl className="space-y-1 font-mono text-sm text-warm-700">
              {SPECIES.map((s) => (
                <div key={s} className="flex justify-between">
                  <dt>[{s}]</dt>
                  <dd>{amounts[s].toFixed(4).replace('.', ',')} M</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 border-t border-warm-200 pt-3 font-mono text-sm text-warm-800">
              Q = {Number.isFinite(q) ? formatScientific(q, 3) : '∞'}
            </p>
          </div>

          <div className="rounded-lg border-2 border-green-200 bg-green-50 p-4">
            <h3 className="mb-3 font-semibold text-green-900">Í jafnvægi</h3>
            {settled ? (
              <>
                <dl className="space-y-1 font-mono text-sm text-green-900">
                  {SPECIES.map((s) => (
                    <div key={s} className="flex justify-between">
                      <dt>[{s}]</dt>
                      <dd>{settled[s].toFixed(4).replace('.', ',')} M</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-3 border-t border-green-200 pt-3 font-mono text-sm font-semibold text-green-900">
                  Q = {settledQ!.toFixed(2).replace('.', ',')}
                </p>
              </>
            ) : (
              <p className="text-sm text-green-900">
                Þessi blanda getur ekki hvarfast — það vantar bæði hvarfefni og myndefni.
              </p>
            )}
          </div>
        </div>

        <div
          className={`mb-6 rounded-lg border-2 p-4 ${
            direction === 'afram'
              ? 'border-blue-300 bg-blue-50'
              : direction === 'afturabak'
                ? 'border-amber-300 bg-amber-50'
                : 'border-warm-300 bg-warm-50'
          }`}
        >
          <p className="text-sm text-warm-800">
            {direction === 'afram' && (
              <>
                Q er minna en K, svo hvarfið gengur <strong>áfram</strong> — til hægri, í átt að
                myndefnunum.
              </>
            )}
            {direction === 'afturabak' && (
              <>
                Q er stærra en K, svo hvarfið gengur <strong>afturábak</strong> — til vinstri, í átt
                að hvarfefnunum.
              </>
            )}
            {direction === 'jafnvaegi' && <>Q er þegar jafnt K. Ekkert gerist.</>}
          </p>
        </div>

        {allSeen && (
          <div className="mb-6 rounded-lg border-2 border-purple-300 bg-purple-50 p-4">
            <h3 className="mb-2 font-semibold text-purple-900">Tókstu eftir þessu?</h3>
            <p className="text-sm text-purple-900">
              Upphafsblöndurnar fjórar eru gjörólíkar — ein hafði ekkert myndefni, önnur ekkert
              hvarfefni. Samt endar Q alltaf á{' '}
              <span className="font-mono font-semibold">{K.toFixed(2).replace('.', ',')}</span>.
              Talan fer ekki eftir því hvað þú settir í kolbuna. Hún fer eftir hvarfinu sjálfu og
              hitastiginu — og hún heitir <strong>jafnvægisfastinn</strong>, K.
            </p>
            <p className="mt-2 font-mono text-sm text-purple-900">{kcExpression(reaction)}</p>
          </div>
        )}

        <button
          type="button"
          onClick={onComplete}
          disabled={!allSeen}
          className="game-btn w-full rounded-lg bg-kvenno-orange px-4 py-3 font-semibold text-white hover:bg-kvenno-orange-dark disabled:cursor-not-allowed disabled:bg-warm-300"
        >
          {allSeen ? 'Áfram' : `Prófaðu allar fjórar blöndurnar (${seen.length}/4)`}
        </button>
      </div>
    </div>
  );
}
