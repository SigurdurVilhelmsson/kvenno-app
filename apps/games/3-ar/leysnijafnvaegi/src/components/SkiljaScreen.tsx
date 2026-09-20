import { useState } from 'react';

import { saltBy } from '../data/salts';
import {
  dissolutionEquation,
  formatScientific,
  kspExpression,
  molarSolubility,
} from '../engine/ksp';

/**
 * Skilja — from the dissolution equation to a molar solubility, one rung at a
 * time.
 *
 * **Worked on Ag₂CrO₄ deliberately.** A 1:1 salt lets a student write
 * `s = √Ksp`, get the right answer, and learn nothing transferable — and then
 * fail on the next question. Silver chromate is 2:1, so the square root is
 * wrong by a factor of sixty, and the only way through is to write the ICE
 * relation out. The contrast panel at the end shows both numbers side by side,
 * because seeing the wrong method's answer is what makes the right one stick.
 */

interface Props {
  onComplete: () => void;
  onBack: () => void;
}

const SALT = saltBy('Ag₂CrO₄');

export function SkiljaScreen({ onComplete, onBack }: Props) {
  const [step, setStep] = useState(0);
  const s = molarSolubility(SALT);
  const naive = Math.sqrt(SALT.ksp);

  const steps = [
    {
      title: '1. Skrifaðu upplausnarjöfnuna',
      body: 'Fast efni í jafnvægi við jónirnar sínar. Taktu eftir stuðlinum 2 — hver formúlueining gefur tvær silfurjónir.',
      content: dissolutionEquation(SALT),
    },
    {
      title: '2. Skrifaðu leysnimargfeldið',
      body: 'Hver jón fer í veldi sem er stuðullinn hennar í jöfnunni. Fasta efnið kemur ekki fyrir — styrkur fasts efnis er ekki breytistærð.',
      content: kspExpression(SALT),
    },
    {
      title: '3. Settu mólarleysnina inn',
      body: 'Ef s mól leysast upp í lítra, þá myndast 2s mól af silfurjónum og s mól af krómatjónum. Þetta er ICE-taflan, bara stutt.',
      content: 'Ksp = (2s)²(s) = 4s³',
    },
    {
      title: '4. Leystu fyrir s',
      body: 'Þriðja rótin, ekki kvaðratrótin — og ekki gleyma fjarkanum.',
      content: `s = ∛(Ksp / 4) = ∛(${formatScientific(SALT.ksp)} / 4) = ${formatScientific(s, 3)} M`,
    },
  ];

  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-lg bg-white p-6 shadow-md md:p-8">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="text-2xl font-bold text-warm-800">Skilja — frá Ksp að mólarleysni</h2>
          <button onClick={onBack} className="text-sm text-warm-500 underline">
            Til baka
          </button>
        </div>

        <p className="mb-6 text-warm-700">
          Silfurkrómat, <span className="font-mono">Ag₂CrO₄</span>. Það er valið hér af ástæðu:
          hlutfallið er 2:1, svo aðferðin sem virkar fyrir silfurklóríð gefur rangt svar. Ef þú
          kannt þetta dæmi kanntu þau öll.
        </p>

        <div className="space-y-4">
          {steps.map((s2, i) => (
            <div
              key={s2.title}
              className={`rounded-lg border-2 p-4 transition-opacity ${
                i <= step ? 'border-orange-300 bg-orange-50' : 'border-warm-200 bg-white opacity-40'
              }`}
            >
              <h3 className="mb-2 font-semibold text-warm-800">{s2.title}</h3>
              {i <= step && (
                <>
                  <p className="mb-3 text-sm text-warm-700">{s2.body}</p>
                  <p className="overflow-x-auto font-mono text-sm text-warm-900 md:text-base">
                    {s2.content}
                  </p>
                </>
              )}
            </div>
          ))}
        </div>

        {step === steps.length - 1 && (
          <div className="mt-6 rounded-lg border-2 border-amber-300 bg-amber-50 p-4">
            <h3 className="mb-2 font-semibold text-amber-900">Af hverju ekki bara kvaðratrótin?</h3>
            <div className="mb-3 grid grid-cols-2 gap-4 text-sm">
              <div className="rounded bg-white/70 p-3">
                <p className="text-amber-800">√Ksp — röng aðferð</p>
                <p className="font-mono text-lg text-amber-900">{formatScientific(naive, 3)} M</p>
              </div>
              <div className="rounded bg-white/70 p-3">
                <p className="text-amber-800">∛(Ksp/4) — rétt</p>
                <p className="font-mono text-lg text-amber-900">{formatScientific(s, 3)} M</p>
              </div>
            </div>
            <p className="text-sm text-amber-900">
              Munurinn er <strong>{Math.round(s / naive)}-faldur</strong>. Kvaðratrótin á aðeins við
              þegar hlutfallið er 1:1, því þá — og aðeins þá — er Ksp = s². Almenna reglan er{' '}
              <span className="font-mono">s = (Ksp / (xˣ · yʸ))^(1/(x+y))</span>, og hún gefur
              kvaðratrótina sjálfkrafa þegar x = y = 1.
            </p>
          </div>
        )}

        <div className="mt-8 flex gap-3 border-t border-warm-200 pt-6">
          {step < steps.length - 1 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="game-btn rounded-lg bg-kvenno-orange px-4 py-2 font-semibold text-white hover:bg-kvenno-orange-dark"
            >
              Næsta skref
            </button>
          ) : (
            <button
              type="button"
              onClick={onComplete}
              className="game-btn rounded-lg bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700"
            >
              Áfram í Æfa
            </button>
          )}
        </div>

        <details className="mt-8 rounded-lg border border-warm-200 bg-white p-4">
          <summary className="cursor-pointer font-semibold text-warm-800">
            Samjónahrif — af hverju leysnin fellur
          </summary>
          <p className="mt-3 text-sm text-warm-700">
            Ksp er fasti: hann breytist ekki þótt lausnin geri það. Ef þú eykur styrk annarrar
            jónarinnar verður hin að minnka á móti til að margfeldið haldist það sama. Þess vegna
            leysist silfurklóríð sjö þúsund sinnum verr í 0,10 M saltvatni en í hreinu vatni — það
            er ekki nýtt efnahvarf, bara sama jafnan að halda sér.
          </p>
          <p className="mt-2 text-sm text-warm-700">
            Þetta er Le Chatelier séð frá hinni hliðinni, og þú hefur reiknað sams konar dæmi í
            Jafnvægi.
          </p>
        </details>
      </div>
    </div>
  );
}
