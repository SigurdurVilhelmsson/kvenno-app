import { useEffect, useMemo, useRef, useState } from 'react';

import { focusTarget, isPhone, revealSpan, useIsPhone } from '@shared/utils';

import { SCENARIOS } from '../data/problems';
import { revealOnDesktop } from '../utils/desktopReveal';

/**
 * Kanna — the discovery phase. No right or wrong, no score.
 *
 * The thing to discover is the one the whole topic rests on: **pouring two
 * clear solutions together sometimes gives a solid and sometimes gives
 * nothing, and which it is depends only on the ions present.** A student picks
 * two bottles, pours, and sees the beaker.
 *
 * Nothing here names a rule. The pairs are chosen so that the pattern is
 * visible before it is stated — every nítrat pairing stays clear, silver keeps
 * precipitating, and the same anion behaves differently with different
 * partners. The Skilja phase then hands over the table that explains it.
 *
 * `ORPHANED_GAMES_ASSESSMENT.md:330` noted that the old game had no Explore
 * phase at all and went straight to testing. This is that phase.
 */

interface Props {
  onComplete: () => void;
  onBack: () => void;
}

export function KannaScreen({ onComplete, onBack }: Props) {
  const [index, setIndex] = useState(0);
  const [poured, setPoured] = useState<Set<string>>(new Set());

  const scenario = SCENARIOS[index];
  const { reaction } = scenario;
  const hasPoured = poured.has(scenario.id);

  const seenBoth = useMemo(() => {
    const seen = SCENARIOS.filter((s) => poured.has(s.id));
    return (
      seen.some((s) => s.reaction.formsPrecipitate) &&
      seen.some((s) => !s.reaction.formsPrecipitate)
    );
  }, [poured]);

  const pour = () => setPoured(new Set([...poured, scenario.id]));
  const stacked = useIsPhone();

  // On a phone the list of pairs is taller than the screen, so the beakers a
  // tap relabels and the result a pour produces are both below the finger.
  // After a pair is chosen, the list through the beakers and the pour button
  // (or the result) comes into view where it fits (design §4), so the next
  // pair is one tap away with no scroll; where it does not, the beakers and the
  // button. After a pour, the same with the result, and focus moves to the
  // result: the button that poured has gone, and a screen reader hears what
  // happened. A desktop window keeps what the game's own helper did there.
  const chipsRef = useRef<HTMLDivElement>(null);
  const beakersRef = useRef<HTMLDivElement>(null);
  const outcomeRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const shown = useRef({ index, hasPoured });
  useEffect(() => {
    const before = shown.current;
    shown.current = { index, hasPoured };
    const poured = hasPoured && !before.hasPoured && index === before.index;
    if (index === before.index && !poured) return;
    if (isPhone()) {
      revealSpan(outcomeRef.current, [chipsRef.current, beakersRef.current, outcomeRef.current]);
    } else if (poured) {
      revealOnDesktop(outcomeRef.current);
    } else {
      revealOnDesktop(beakersRef.current, outcomeRef.current);
    }
    if (poured) focusTarget(resultRef.current);
  }, [index, hasPoured]);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-lg bg-white p-4 shadow-md sm:p-6 md:p-8 phone:p-3">
        <div className="mb-6 flex items-baseline justify-between gap-3 phone:mb-3">
          <h2 className="text-xl font-bold text-warm-800 sm:text-2xl phone:min-w-0 phone:text-base">
            Kanna — helltu saman og sjáðu
          </h2>
          <button
            onClick={onBack}
            className="shrink-0 whitespace-nowrap text-sm text-warm-500 underline pointer-coarse:-my-3 pointer-coarse:py-3"
          >
            Til baka
          </button>
        </div>

        <p className="mb-6 text-warm-700 phone:mb-3">
          Tvær tærar lausnir. Stundum myndast fast efni þegar þeim er hellt saman, stundum ekki.
          Prófaðu nokkrar og athugaðu hvort þú sérð mynstur — hvaða jónir eru til staðar þegar
          eitthvað gerist?
        </p>

        {/* On a phone on its side the pairs sit beside the beakers and the
            result, so a pick, a pour and what it gave share one screen. Plain
            blocks elsewhere, so the spacing is what it was. */}
        <div className="phone-land:grid phone-land:grid-cols-2 phone-land:items-start phone-land:gap-4">
          {/* On a phone each pair's formulas stack, so a portrait phone takes
              three pairs to a row and the whole list is on screen with the
              beakers. The stacked markup exists only on a phone: a desktop
              window renders the label exactly as it did. */}
          <div
            ref={chipsRef}
            className="mb-6 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap phone:mb-2 phone:gap-1.5 max-sm:grid-cols-3 max-sm:gap-1 phone-land:mb-0"
          >
            {SCENARIOS.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setIndex(i)}
                className={`game-btn rounded-lg border-2 px-2 py-2 text-sm pointer-coarse:min-h-11 sm:px-3 phone:py-0.5 phone:leading-tight max-sm:px-0.5 ${
                  i === index
                    ? 'border-orange-400 bg-orange-50 font-semibold text-orange-900'
                    : 'border-warm-200 bg-white text-warm-700 hover:bg-warm-50'
                }`}
              >
                {stacked ? (
                  <>
                    <span className="block whitespace-nowrap">
                      {s.reaction.reactants[0].formula}
                    </span>{' '}
                    + {s.reaction.reactants[1].formula}
                  </>
                ) : (
                  <>
                    {s.reaction.reactants[0].formula} + {s.reaction.reactants[1].formula}
                  </>
                )}
                {poured.has(s.id) && <span className="ml-1 text-green-600">✓</span>}
              </button>
            ))}
          </div>

          <div>
            <div
              ref={beakersRef}
              className="mb-6 grid grid-cols-3 items-end gap-2 sm:gap-4 phone:mb-2"
            >
              <Beaker label={reaction.reactants[0].formula} tone="clear" />
              <Beaker label={reaction.reactants[1].formula} tone="clear" />
              <Beaker
                label={hasPoured ? 'Blandað' : '?'}
                tone={hasPoured ? (reaction.formsPrecipitate ? 'precipitate' : 'clear') : 'unknown'}
              />
            </div>

            <div ref={outcomeRef}>
              {!hasPoured ? (
                <button
                  type="button"
                  onClick={pour}
                  className="game-btn w-full rounded-lg bg-kvenno-orange px-4 py-3 font-semibold text-white hover:bg-kvenno-orange-dark"
                >
                  Helltu saman
                </button>
              ) : (
                <div
                  ref={resultRef}
                  role="group"
                  aria-labelledby="kanna-outcome"
                  className={`rounded-lg border-2 p-4 phone:px-3 phone:py-2 ${
                    reaction.formsPrecipitate
                      ? 'border-amber-300 bg-amber-50'
                      : 'border-sky-200 bg-sky-50'
                  }`}
                >
                  <p id="kanna-outcome" className="mb-2 font-semibold text-warm-800 phone:mb-1">
                    {reaction.formsPrecipitate
                      ? `Botnfall myndast: ${reaction.precipitates.map((p) => p.formula).join(' og ')}`
                      : 'Ekkert botnfall. Lausnin er áfram tær.'}
                  </p>
                  <p className="text-sm text-warm-700">{scenario.context}</p>
                  <p className="mt-3 text-sm text-warm-600 phone:mt-1.5">
                    Jónirnar í glasinu:{' '}
                    <span className="font-mono">
                      {[
                        reaction.reactants[0].cation.formula,
                        reaction.reactants[0].anion.formula,
                        reaction.reactants[1].cation.formula,
                        reaction.reactants[1].anion.formula,
                      ].join(', ')}
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-warm-200 pt-6 phone:mt-4 phone:pt-3">
          <p className="mb-3 text-sm text-warm-600">
            {seenBoth
              ? 'Þú hefur séð bæði — glas sem verður skýjað og glas sem gerir ekkert. Næsti áfangi segir hvað ræður því.'
              : 'Prófaðu að minnsta kosti eina blöndu sem gefur botnfall og eina sem gerir það ekki.'}
          </p>
          <button
            type="button"
            onClick={onComplete}
            disabled={!seenBoth}
            className="game-btn rounded-lg bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-warm-300 pointer-coarse:min-h-11"
          >
            Áfram í Skilja
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * A beaker. Three states only — clear, cloudy, and not yet poured.
 *
 * Deliberately not colour-coded per precipitate: the colours are named in the
 * context sentences instead, because a student reading this on a phone in a
 * lit classroom should not have to distinguish pale yellow from white.
 */
function Beaker({ label, tone }: { label: string; tone: 'clear' | 'precipitate' | 'unknown' }) {
  const fill =
    tone === 'precipitate' ? 'bg-amber-200' : tone === 'clear' ? 'bg-sky-100' : 'bg-warm-100';
  return (
    <div className="text-center">
      <div className="relative mx-auto h-24 w-20 rounded-b-xl border-2 border-warm-400 border-t-0 phone:h-14 phone:w-14">
        <div className={`absolute inset-x-0 bottom-0 h-16 rounded-b-lg phone:h-10 ${fill}`} />
        {tone === 'precipitate' && (
          <div className="absolute inset-x-1 bottom-0 h-4 rounded-b-lg bg-amber-500/70" />
        )}
      </div>
      <p className="mt-2 font-mono text-sm text-warm-700 phone:mt-1">{label}</p>
    </div>
  );
}
