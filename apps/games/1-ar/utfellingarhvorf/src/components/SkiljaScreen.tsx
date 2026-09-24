import { useEffect, useRef, useState } from 'react';

import { focusTarget, isPhone, revealSpan, useArmedAfter } from '@shared/utils';

import { SOLUBILITY_RULES } from '../data/ions';
import { SCENARIOS } from '../data/problems';
import { renderEquation, renderSide } from '../engine/precipitation';
import { revealOnDesktop } from '../utils/desktopReveal';

/**
 * Skilja — the three-equation ladder, revealed one rung at a time.
 *
 * **This is the phase the platform has never had.** Net ionic equations were
 * absent from all three years, and the old `jonir-i-lausn` printed its eight of
 * them as post-answer decoration — display, not teaching
 * (`docs/FEBRUARY-DECISIONS-RECOVERED.md:234`). Here the ladder is the lesson:
 *
 *  1. **Sameindajafna** — the bottles as labelled
 *  2. **Heildarjónajafna** — every dissolved salt is really loose ions, so write them
 *  3. **Nettójónajafna** — cross out what is identical on both sides
 *
 * Step 3 is subtraction, and showing it as subtraction is the whole point: the
 * spectators are struck through in place before they disappear, so the student
 * sees where the short equation came from rather than being handed it.
 *
 * The solubility table sits open beside the worked example, not behind a hint
 * button. The old game charged 50 points for a hint that was the answer
 * (`ORPHANED_GAMES_ASSESSMENT.md:548`); hints are never penalised here, so
 * there is no reason to hide the reference at all.
 */

interface Props {
  onComplete: () => void;
  onBack: () => void;
}

const WORKED = SCENARIOS.find((s) => s.id === 'pbno3-ki')!;

const STEPS = [
  {
    title: '1. Sameindajafna',
    blurb:
      'Fyrst eins og flöskurnar eru merktar: heil efnasambönd, stillt. (aq) þýðir uppleyst í vatni, (s) þýðir fast efni.',
  },
  {
    title: '2. Heildarjónajafna',
    blurb:
      'Uppleyst jónaefni er ekki heilt í vatninu — það er sundrað í lausar jónir. Skrifum þær allar. Botnfallið er fast og sundrast ekki, svo það stendur óbreytt.',
  },
  {
    title: '3. Nettójónajafna',
    blurb:
      'Sumar jónir standa óbreyttar beggja vegna örvarinnar. Þær heita áhorfendajónir og þær gera ekkert — strikum þær út. Eftir stendur efnahvarfið sjálft.',
  },
] as const;

export function SkiljaScreen({ onComplete, onBack }: Props) {
  const [step, setStep] = useState(0);
  const { reaction } = WORKED;
  const spectators = new Set(reaction.spectators.map((s) => s.formula));

  // "Næsta skref" opens the next rung above the button. On a phone the rung
  // just opened comes into view with the button under it (design §4), and where
  // the two do not fit together the rung's top is brought under the header and
  // the student reads down to the button. Focus moves to the rung, which is what
  // changed; the button stays where it was. A desktop window keeps what the
  // game's own helper did there: the rung, brought into view if it is not.
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const actionRef = useRef<HTMLDivElement>(null);
  const shownStep = useRef(step);
  useEffect(() => {
    if (step === shownStep.current) return;
    shownStep.current = step;
    const rung = stepRefs.current[step];
    if (isPhone()) revealSpan(actionRef.current, [rung]);
    else revealOnDesktop(rung);
    focusTarget(rung);
  }, [step]);

  // "Næsta skref" and "Áfram í Æfa" are separate buttons, and neither takes a
  // press within 400 ms of appearing or of opening a rung: a double tap cannot
  // open the next rung unread, or leave the phase from the last.
  const armed = useArmedAfter(400, step);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-lg bg-white p-4 shadow-md sm:p-6 md:p-8 phone:p-3">
        <div className="mb-6 flex items-baseline justify-between gap-3 phone:mb-3">
          <h2 className="text-xl font-bold text-warm-800 sm:text-2xl phone:min-w-0 phone:text-base">
            Skilja — þrjár jöfnur, ein saga
          </h2>
          <button
            onClick={onBack}
            className="shrink-0 whitespace-nowrap text-sm text-warm-500 underline pointer-coarse:-my-3 pointer-coarse:py-3"
          >
            Til baka
          </button>
        </div>

        <p className="mb-6 text-warm-700 phone:mb-3">
          Sama efnahvarfið, skrifað á þrjá vegu. Hver þeirra segir satt — en þær segja ekki það
          sama, og sú síðasta segir það sem raunverulega gerðist.
        </p>

        <div className="mb-6 rounded-lg border border-warm-200 bg-warm-50 p-4 phone:mb-3 phone:p-3">
          <p className="text-sm text-warm-700">{WORKED.context}</p>
        </div>

        <div className="space-y-4 phone:space-y-3">
          {STEPS.map((s, i) => (
            <div
              key={s.title}
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
                {s.title}
              </h3>
              {i <= step && (
                <>
                  <p className="mb-3 text-sm text-warm-700 phone:mb-2">{s.blurb}</p>
                  <p className="overflow-x-auto font-mono text-sm text-warm-900 md:text-base">
                    {i === 0 && renderEquation(reaction.molecular)}
                    {i === 1 && renderEquation(reaction.complete)}
                    {i === 2 && <StruckThrough />}
                  </p>
                </>
              )}
            </div>
          ))}
        </div>

        {step === STEPS.length - 1 && (
          <div className="mt-6 rounded-lg border-2 border-green-300 bg-green-50 p-4 phone:mt-3 phone:p-3">
            <h3 className="mb-2 font-semibold text-green-900">Nettójónajafnan</h3>
            <p className="font-mono text-base text-green-900">{renderEquation(reaction.net)}</p>
            <p className="mt-3 text-sm text-green-800">
              Áhorfendajónirnar hér eru {reaction.spectators.map((s) => s.formula).join(' og ')}.
              Þær voru í glasinu allan tímann og eru það enn — þær breyttust hvorki efnafræðilega né
              eðlisfræðilega, og þess vegna eiga þær ekki heima í jöfnunni.
            </p>
            <p className="mt-2 text-sm text-green-800">
              Taktu eftir hvað þetta þýðir: nettójónajafnan segir að{' '}
              <span className="font-mono">{renderSide(reaction.net.left)}</span> gefi botnfall{' '}
              <em>hvaðan sem jónirnar koma</em>. Það þarf hvorki að vera blý(II)nítrat né
              kalíumjoðíð — hvaða uppleysta blý- og joðíðsalt sem er gerir það sama.
            </p>
          </div>
        )}

        <div
          ref={actionRef}
          className="mt-8 flex gap-3 border-t border-warm-200 pt-6 phone:mt-4 phone:pt-3"
        >
          {step < STEPS.length - 1 ? (
            <button
              key="naesta"
              type="button"
              onClick={armed(() => setStep(step + 1))}
              className="game-btn rounded-lg bg-kvenno-orange px-4 py-2 font-semibold text-white hover:bg-kvenno-orange-dark pointer-coarse:min-h-11"
            >
              Næsta skref
            </button>
          ) : (
            <button
              key="afram"
              type="button"
              onClick={armed(onComplete)}
              className="game-btn rounded-lg bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700 pointer-coarse:min-h-11"
            >
              Áfram í Æfa
            </button>
          )}
        </div>

        <details className="mt-8 rounded-lg border border-warm-200 bg-white p-4 phone:mt-4 phone:p-3">
          <summary className="cursor-pointer font-semibold text-warm-800 pointer-coarse:-my-2.5 pointer-coarse:py-2.5">
            Leysnireglurnar — hafðu þær opnar
          </summary>
          <ul className="mt-3 space-y-2 text-sm text-warm-700">
            {SOLUBILITY_RULES.map((r) => (
              <li key={r.id} className="border-l-4 border-warm-200 pl-3">
                <span className={r.soluble ? 'text-sky-800' : 'text-amber-800'}>{r.text}</span>{' '}
                <span className="text-warm-500">{r.exceptionText}</span>
              </li>
            ))}
          </ul>
        </details>
      </div>
    </div>
  );

  /**
   * The complete ionic equation with the spectators struck through, which is
   * the picture of step 3 rather than its result.
   */
  function StruckThrough() {
    const side = (terms: typeof reaction.complete.left) =>
      terms.map((t, i) => (
        <span key={`${t.species}-${i}`}>
          {i > 0 && ' + '}
          <span className={spectators.has(t.species) ? 'text-warm-400 line-through' : ''}>
            {t.coefficient === 1 ? '' : t.coefficient}
            {t.species}({t.state})
          </span>
        </span>
      ));
    return (
      <>
        {side(reaction.complete.left)} → {side(reaction.complete.right)}
      </>
    );
  }
}
