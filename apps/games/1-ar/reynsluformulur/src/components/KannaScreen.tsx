import { useState } from 'react';

import { COMPOUNDS } from '../data/problems';
import { percentComposition } from '../engine/empirical';

/**
 * Kanna — the discovery phase. No right or wrong.
 *
 * The thing to discover is the one that makes the whole topic necessary:
 * **percent composition does not tell you how many atoms there are.** A student
 * picks a compound, sees its percentages, and sees that the element with the
 * largest share is very often not the element with the most atoms — because
 * mass and count are different questions and the molar mass is what separates
 * them.
 *
 * Glucose and formaldehyde sit in the pool deliberately: identical percentages,
 * different compounds. That is the fact the Beita phase later resolves with a
 * molar mass.
 */

interface Props {
  onComplete: () => void;
  onBack: () => void;
}

export function KannaScreen({ onComplete, onBack }: Props) {
  const [id, setId] = useState(COMPOUNDS[0].id);
  const compound = COMPOUNDS.find((c) => c.id === id)!;
  const pct = percentComposition(compound.counts);

  const heaviestShare = [...pct].sort((a, b) => b.percent - a.percent)[0];
  const mostAtoms = [...compound.counts].sort((a, b) => b.subscript - a.subscript)[0];
  const theyDisagree = heaviestShare.element !== mostAtoms.element;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-lg bg-white p-6 shadow-md md:p-8">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="text-2xl font-bold text-warm-800">Kanna — massi er ekki fjöldi</h2>
          <button onClick={onBack} className="text-sm text-warm-500 underline">
            Til baka
          </button>
        </div>

        <p className="mb-6 text-warm-700">
          Veldu efni og skoðaðu hvað efnagreining myndi mæla: hversu stór hluti massans kemur frá
          hverju frumefni. Taktu eftir hvort frumefnið sem á stærsta hlutann er líka það sem á
          flestar frumeindir.
        </p>

        <div className="mb-6 flex flex-wrap gap-2">
          {COMPOUNDS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setId(c.id)}
              className={`game-btn rounded-lg border-2 px-3 py-2 text-sm ${
                c.id === id
                  ? 'border-orange-400 bg-orange-50 font-semibold text-orange-900'
                  : 'border-warm-200 bg-white text-warm-700 hover:bg-warm-50'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="mb-6 overflow-hidden rounded-lg border border-warm-200">
          <table className="w-full text-sm">
            <thead className="bg-warm-50 text-warm-700">
              <tr>
                <th className="p-3 text-left">Frumefni</th>
                <th className="p-3 text-right">Hlutfall massa</th>
                <th className="p-3 text-right">Fjöldi frumeinda</th>
              </tr>
            </thead>
            <tbody>
              {pct.map((p) => {
                const count = compound.counts.find((c) => c.element === p.element)!;
                return (
                  <tr key={p.element} className="border-t border-warm-100">
                    <td className="p-3 font-mono font-semibold text-warm-800">{p.element}</td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="h-2 w-32 overflow-hidden rounded-full bg-warm-100">
                          <div
                            className="h-full rounded-full bg-orange-400"
                            style={{ width: `${p.percent}%` }}
                          />
                        </div>
                        <span className="w-16 text-right font-mono">
                          {p.percent.toFixed(2).replace('.', ',')} %
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-right font-mono">{count.subscript}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div
          className={`mb-6 rounded-lg border p-4 text-sm ${
            theyDisagree
              ? 'border-amber-300 bg-amber-50 text-amber-900'
              : 'border-sky-200 bg-sky-50 text-sky-900'
          }`}
        >
          {theyDisagree ? (
            <p>
              <strong>{heaviestShare.element}</strong> á stærsta hlutann af massanum (
              {heaviestShare.percent.toFixed(1).replace('.', ',')} %), en{' '}
              <strong>{mostAtoms.element}</strong> á flestar frumeindirnar ({mostAtoms.subscript}).
              Prósentan segir þér ekki fjöldann — til þess þarf að deila með mólmassanum.
            </p>
          ) : (
            <p>
              Hér fer það saman: <strong>{heaviestShare.element}</strong> á bæði stærsta hlutann af
              massanum og flestar frumeindirnar. Prófaðu efni þar sem það gerir það ekki.
            </p>
          )}
        </div>

        <p className="mb-6 text-sm text-warm-600">{compound.context}</p>

        <button
          onClick={onComplete}
          className="game-btn rounded-lg bg-kvenno-orange px-6 py-3 font-semibold text-white"
        >
          Áfram í Skilja
        </button>
      </div>
    </div>
  );
}
