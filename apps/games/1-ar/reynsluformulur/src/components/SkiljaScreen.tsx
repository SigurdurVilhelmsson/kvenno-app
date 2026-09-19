import { useState } from 'react';

import { PROBLEMS } from '../data/problems';
import { deriveEmpirical } from '../engine/empirical';

/**
 * Skilja — the method, worked one column at a time on a real compound.
 *
 * The four columns are revealed in order rather than all at once, because the
 * step that matters is the last one and a student who sees the finished table
 * reads the answer instead of the method.
 *
 * Járn(III)oxíð is the worked example on purpose: its ratios come out 1 : 1,5,
 * which is exactly the case the February review recorded students getting wrong
 * — _"Students frequently round 1.5 to 2"_. Teaching the method on a compound
 * where every ratio is already whole would hide the only hard part.
 */

interface Props {
  onComplete: () => void;
  onBack: () => void;
}

const WORKED_ID = 'jarnoxid';

const COLUMNS = [
  {
    key: 'percent',
    label: 'Prósenta',
    caption: 'Taktu 100 g sýni. Þá er hvert prósent einfaldlega grömm.',
  },
  {
    key: 'moles',
    label: 'Mól',
    caption: 'Deildu massanum með mólmassa frumefnisins. Nú ertu kominn með fjölda, ekki massa.',
  },
  {
    key: 'ratio',
    label: 'Hlutfall',
    caption: 'Deildu öllum mólfjöldunum með þeim minnsta. Minnsta talan verður 1.',
  },
  {
    key: 'subscript',
    label: 'Vísitala',
    caption: 'Margfaldaðu upp þangað til allar tölurnar eru heilar. Þetta er skrefið sem klikkar.',
  },
] as const;

const fmt = (n: number, dp: number) => n.toFixed(dp).replace('.', ',');

export function SkiljaScreen({ onComplete, onBack }: Props) {
  const [shown, setShown] = useState(1);
  const problem = PROBLEMS.find((p) => p.id === WORKED_ID)!;
  const derived = deriveEmpirical(
    Object.fromEntries(problem.percentages.map((p) => [p.element, p.percent]))
  );

  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-lg bg-white p-6 shadow-md md:p-8">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="text-2xl font-bold text-warm-800">Skilja — fjórar súlur</h2>
          <button onClick={onBack} className="text-sm text-warm-500 underline">
            Til baka
          </button>
        </div>

        <p className="mb-6 text-warm-700">
          Efnagreining á ryði gefur{' '}
          {problem.percentages.map((p) => `${p.element} ${fmt(p.percent, 2)} %`).join(' og ')}.
          Leiðin að formúlunni er alltaf sama taflan.
        </p>

        <div className="mb-4 overflow-x-auto rounded-lg border border-warm-200">
          <table className="w-full text-sm">
            <thead className="bg-warm-50 text-warm-700">
              <tr>
                <th className="p-3 text-left">Frumefni</th>
                {COLUMNS.slice(0, shown).map((c) => (
                  <th key={c.key} className="p-3 text-right">
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {derived.rows.map((r) => (
                <tr key={r.element} className="border-t border-warm-100">
                  <td className="p-3 font-mono font-semibold text-warm-800">{r.element}</td>
                  {shown >= 1 && (
                    <td className="p-3 text-right font-mono">{fmt(r.percent, 2)} g</td>
                  )}
                  {shown >= 2 && <td className="p-3 text-right font-mono">{fmt(r.moles, 3)}</td>}
                  {shown >= 3 && (
                    <td className="p-3 text-right font-mono">
                      {fmt(r.ratio, 2)}
                      {Math.abs(r.ratio - 1.5) < 0.05 && (
                        <span className="ml-1 text-amber-600">←</span>
                      )}
                    </td>
                  )}
                  {shown >= 4 && (
                    <td className="p-3 text-right font-mono font-bold text-orange-700">
                      {r.subscript}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mb-6 text-sm text-warm-600">{COLUMNS[shown - 1].caption}</p>

        {shown === 3 && (
          <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="mb-1 font-semibold">Hér tapa flestir dæminu</p>
            <p>
              Hlutfallið fyrir O er <strong>1,50</strong>. Það er ekki 2 sem búið er að mæla
              ónákvæmt — það er nákvæmlega helmingur. Formúla getur ekki haft hálfa frumeind, svo
              svarið er að <strong>margfalda allt með 2</strong>, ekki að námunda.
            </p>
          </div>
        )}

        {shown === 4 && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-900">
            <p>
              Margfaldað með <strong>{derived.multiplier}</strong>: 1 → {derived.rows[0].subscript}{' '}
              og 1,5 → {derived.rows[1].subscript}. Reynsluformúlan er{' '}
              <strong className="font-mono text-base">{derived.formula}</strong>.
            </p>
            <p className="mt-2">
              Hefðirðu námundað 1,5 upp í 2 hefðirðu fengið FeO₂ — efni sem er ekki til.
            </p>
          </div>
        )}

        <div className="flex gap-3">
          {shown < COLUMNS.length ? (
            <button
              onClick={() => setShown(shown + 1)}
              className="game-btn rounded-lg bg-kvenno-orange px-6 py-3 font-semibold text-white"
            >
              Næsta súla
            </button>
          ) : (
            <button
              onClick={onComplete}
              className="game-btn rounded-lg bg-kvenno-orange px-6 py-3 font-semibold text-white"
            >
              Áfram í Æfa
            </button>
          )}
          {shown > 1 && (
            <button
              onClick={() => setShown(shown - 1)}
              className="game-btn rounded-lg border border-warm-300 px-5 py-3 text-warm-700"
            >
              Fyrri súla
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
