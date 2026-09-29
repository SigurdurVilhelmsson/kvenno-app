import { useLayoutEffect, useRef, useState } from 'react';

import { focusTarget, revealSpan, useArmedAfter } from '@shared/utils';

import { BackButton } from './BackButton';
import { Sci } from './Sci';
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
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const onwardRef = useRef<HTMLButtonElement>(null);
  const shownStep = useRef(step);
  const s = molarSolubility(SALT);

  // Each "Næsta skref" opens the next rung above the button. Focus moves to the
  // new rung (a group named by its heading), since the button just pressed may
  // be gone; on a phone the rung is brought in down to the button where both
  // fit, or from its heading where they do not (design §3 Reading).
  useLayoutEffect(() => {
    if (shownStep.current === step) return;
    shownStep.current = step;
    const rung = stepRefs.current[step];
    focusTarget(rung);
    revealSpan(onwardRef.current, [rung]);
  }, [step]);
  // A double tap on "Næsta skref" must not press the next one, or "Áfram í Æfa".
  const armed = useArmedAfter(400, step);
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
      // Held together in three pieces, so a phone breaks the line at an
      // equals sign and never inside a number.
      content: (
        <>
          <span className="whitespace-nowrap">s = ∛(Ksp / 4)</span>{' '}
          <span className="whitespace-nowrap">= ∛({formatScientific(SALT.ksp)} / 4)</span>{' '}
          <span className="whitespace-nowrap">= {formatScientific(s, 3)} M</span>
        </>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-lg bg-white p-4 shadow-md sm:p-6 md:p-8 phone:p-3">
        <div className="mb-6 flex items-baseline justify-between gap-3 phone:mb-3">
          <h2 className="min-w-0 text-xl font-bold text-warm-800 sm:text-2xl phone:text-base">
            Skilja — frá Ksp að mólarleysni
          </h2>
          <BackButton onClick={onBack} />
        </div>

        <p className="mb-6 text-warm-700 phone:mb-3">
          Silfurkrómat, <span className="font-mono">Ag₂CrO₄</span>. Það er valið hér af ástæðu:
          hlutfallið er 2:1, svo aðferðin sem virkar fyrir silfurklóríð gefur rangt svar. Ef þú
          kannt þetta dæmi kanntu þau öll.
        </p>

        <div className="space-y-4 phone:space-y-3">
          {steps.map((s2, i) => (
            <div
              key={s2.title}
              ref={(el) => {
                stepRefs.current[i] = el;
              }}
              role="group"
              aria-labelledby={`skilja-step-${i}`}
              className={`rounded-lg border-2 p-4 transition-opacity phone:p-3 ${
                i <= step ? 'border-orange-300 bg-orange-50' : 'border-warm-200 bg-white opacity-40'
              }`}
            >
              <h3 id={`skilja-step-${i}`} className="mb-2 font-semibold text-warm-800">
                {s2.title}
              </h3>
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
          <div className="mt-6 rounded-lg border-2 border-amber-300 bg-amber-50 p-3 sm:p-4 phone:mt-3">
            <h3 className="mb-2 font-semibold text-amber-900">Af hverju ekki bara kvaðratrótin?</h3>
            {/* Side by side only where a whole number fits in each half; on a
                phone the two stack, one above the other, rather than each
                breaking at its × sign. */}
            <div className="mb-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 sm:gap-4">
              <div className="rounded bg-white/70 p-3">
                <p className="text-amber-800">√Ksp — röng aðferð</p>
                <p className="font-mono text-lg text-amber-900">
                  <Sci value={naive} figures={3} unit="M" />
                </p>
              </div>
              <div className="rounded bg-white/70 p-3">
                <p className="text-amber-800">∛(Ksp/4) — rétt</p>
                <p className="font-mono text-lg text-amber-900">
                  <Sci value={s} figures={3} unit="M" />
                </p>
              </div>
            </div>
            <p className="text-sm text-amber-900">
              Munurinn er <strong>{Math.round(s / naive)}-faldur</strong>. Kvaðratrótin á aðeins við
              þegar hlutfallið er 1:1, því þá — og aðeins þá — er Ksp = s². Almenna reglan er{' '}
              <span className="font-mono">
                <span className="whitespace-nowrap">s =</span>{' '}
                <span className="whitespace-nowrap">(Ksp / (xˣ · yʸ))^(1/(x+y))</span>
              </span>
              , og hún gefur kvaðratrótina sjálfkrafa þegar x = y = 1.
            </p>
          </div>
        )}

        {/* Separate keyed buttons, so the one that replaces "Næsta skref" on
            the last rung is a new element, not the same one relabelled. */}
        <div className="mt-8 flex gap-3 border-t border-warm-200 pt-6 phone:mt-4 phone:pt-3">
          {step < steps.length - 1 ? (
            <button
              key="next-step"
              ref={onwardRef}
              type="button"
              onClick={armed(() => setStep(step + 1))}
              className="game-btn rounded-lg bg-kvenno-orange px-4 py-2 font-semibold text-white hover:bg-kvenno-orange-dark pointer-coarse:min-h-11"
            >
              Næsta skref
            </button>
          ) : (
            <button
              key="onward"
              ref={onwardRef}
              type="button"
              onClick={armed(onComplete)}
              className="game-btn rounded-lg bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700 pointer-coarse:min-h-11"
            >
              Áfram í Æfa
            </button>
          )}
        </div>

        <details className="mt-8 rounded-lg phone:mt-4 border border-warm-200 bg-white p-4">
          <summary className="cursor-pointer font-semibold text-warm-800 pointer-coarse:-my-3 pointer-coarse:py-3">
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
            Hliðrun jafnvægis.
          </p>
        </details>
      </div>
    </div>
  );
}
