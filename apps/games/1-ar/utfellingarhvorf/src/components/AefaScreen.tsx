import { useEffect, useMemo, useRef, useState } from 'react';

import { PinnedActions } from '@shared/components';
import { isPhone, useArmedAfter, useItemTop, useRevealAfterCommit } from '@shared/utils';

import { SOLUBILITY_RULES } from '../data/ions';
import { DRILL_ITEMS } from '../data/problems';
import { decidingRules } from '../engine/precipitation';
import { revealOnDesktop } from '../utils/desktopReveal';

/**
 * Æfa — the solubility drill: is this compound leysanlegt, and by which rule?
 *
 * **Two answers are required, not one**, and that is the design. "Leysanlegt"
 * alone is a coin flip a student can win half the time; naming the rule is what
 * shows they read the anion and checked the exception list. The feedback
 * therefore names the rule whether they got the verdict right or wrong.
 *
 * Some compounds are settled by two rows at once — NaNO₃ by the group-1 row
 * and by the nitrate row — and either is a right answer; `decidingRules` says
 * which, and the feedback prints every one of them.
 *
 * The order is shuffled once per session rather than fixed. Four games on the
 * platform ship option arrays that look constant but shuffle at render, and two
 * that genuinely did not were fixed in August; the idiom here is the one those
 * use — a `useMemo` keyed on nothing, so the order is stable within a run and
 * different between runs.
 *
 * The exception items are the point of the drill and a test asserts they are
 * still in it. A drill of only general cases teaches "look at the anion" and
 * stops there, which is exactly the habit the exceptions exist to break.
 */

interface Props {
  onComplete: () => void;
  onBack: () => void;
}

const QUESTIONS = 10;

function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function AefaScreen({ onComplete, onBack }: Props) {
  // A run always contains every exception case, topped up to ten with general
  // ones. Drawing ten at random would sometimes serve a run with no exception
  // in it at all, which is the run that teaches the wrong habit.
  const items = useMemo(() => {
    const exceptions = DRILL_ITEMS.filter((d) => d.verdict.byException);
    const general = DRILL_ITEMS.filter((d) => !d.verdict.byException);
    return shuffle([
      ...exceptions,
      ...shuffle(general).slice(0, Math.max(0, QUESTIONS - exceptions.length)),
    ]);
  }, []);

  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<boolean | null>(null);
  const [ruleId, setRuleId] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(0);

  const item = items[index];
  const rules = useMemo(() => decidingRules(item.salt), [item]);
  const verdictRight = answer === item.verdict.soluble;
  const ruleRight = rules.some((r) => r.id === ruleId);
  const bothRight = verdictRight && ruleRight;

  const check = () => {
    setChecked(true);
    if (verdictRight && ruleRight) setCorrect(correct + 1);
  };

  // On a phone "Athuga" and "Næsta" sit at the bottom of a card taller than the
  // screen, so "Athuga" is pinned to the foot of the screen while there is a
  // choice to make (design §4, P8: a choice screen, no text input, and the
  // feedback it brings is short). After "Athuga" the most that fits of the
  // compound → the chosen rule → the verdict and its "Næsta" comes into view; where
  // it does not, the verdict at the top, read down to the button. Focus moves
  // to the verdict, not to the button (design P3), and "Næsta" drops a press
  // within 400 ms of appearing, so a double tap cannot skip it. After "Næsta"
  // the card's top comes back under the header and focus moves to the new
  // compound.
  const counterRef = useRef<HTMLParagraphElement>(null);
  const compoundRef = useRef<HTMLDivElement>(null);
  const ruleRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const feedbackRef = useRef<HTMLDivElement>(null);
  const cardRef = useItemTop<HTMLDivElement>(index);
  useRevealAfterCommit(checked, () => ({
    bottom: feedbackRef.current,
    tops: [compoundRef.current, ruleId ? ruleRefs.current[ruleId] : null, feedbackRef.current],
    focus: feedbackRef.current,
  }));

  // A desktop window keeps what the game's own helper did there, at any
  // width: the verdict with its "Næsta" after "Athuga", and the counter with
  // the new compound after "Næsta", each brought into view when it is not.
  const shown = useRef({ index, checked });
  useEffect(() => {
    const before = shown.current;
    shown.current = { index, checked };
    if (isPhone()) return;
    if (index !== before.index) revealOnDesktop(counterRef.current, compoundRef.current);
    else if (checked && !before.checked) revealOnDesktop(feedbackRef.current);
  }, [index, checked]);

  const armed = useArmedAfter(400, `${index}:${checked}`);

  const next = () => {
    if (index + 1 >= items.length) {
      onComplete();
      return;
    }
    setIndex(index + 1);
    setAnswer(null);
    setRuleId(null);
    setChecked(false);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div ref={cardRef} className="rounded-lg bg-white p-4 shadow-md sm:p-6 md:p-8 phone:p-3">
        <div className="mb-6 flex items-baseline justify-between gap-3 phone:mb-2">
          <h2 className="text-xl font-bold text-warm-800 sm:text-2xl phone:min-w-0 phone:text-base">
            Æfa — leysanlegt eða ekki?
          </h2>
          <button
            onClick={onBack}
            className="shrink-0 whitespace-nowrap text-sm text-warm-500 underline pointer-coarse:-my-3 pointer-coarse:py-3"
          >
            Til baka
          </button>
        </div>

        {/* On a phone on its side the compound and its first question sit
            beside the rules, so the whole choice is on one screen. Plain blocks
            elsewhere, so the spacing is what it was. */}
        <div className="phone-land:mb-3 phone-land:grid phone-land:grid-cols-[2fr_3fr] phone-land:items-start phone-land:gap-4">
          <div>
            <p ref={counterRef} className="mb-2 text-sm text-warm-600 phone:mb-1">
              Efni {index + 1} af {items.length}
            </p>

            {/* On a phone the first question sits inside the compound's card:
                the card loses its lower edge and the question carries it on, so
                the two read as one block. */}
            <div
              ref={compoundRef}
              data-item-start
              className="mb-6 rounded-lg border-2 border-warm-200 bg-warm-50 p-6 text-center phone:mb-0 phone:flex phone:flex-wrap phone:items-baseline phone:justify-center phone:gap-x-3 phone:rounded-b-none phone:border-b-0 phone:px-3 phone:pb-1 phone:pt-2"
            >
              <p className="font-mono text-3xl text-warm-900 phone:text-2xl">{item.salt.formula}</p>
              <p className="mt-2 text-sm text-warm-600 phone:mt-0">
                {item.salt.cation.name} og {item.salt.anion.name}
              </p>
            </div>

            <fieldset
              className="mb-4 phone:mb-2 phone:min-w-0 phone:rounded-b-lg phone:border-2 phone:border-t-0 phone:border-warm-200 phone:bg-warm-50 phone:px-3 phone:pb-1.5"
              disabled={checked}
            >
              {/* Floated on a phone, so the fieldset's side borders run past it
                  rather than breaking around it. */}
              <legend className="mb-2 text-sm font-semibold text-warm-700 phone:float-left phone:mb-1 phone:w-full">
                Leysist það upp í vatni?
              </legend>
              <div className="flex gap-2 sm:gap-3 phone:clear-both phone-land:flex-col">
                {[
                  { value: true, label: 'Leysanlegt' },
                  { value: false, label: 'Óleysanlegt' },
                ].map((option) => (
                  <button
                    key={String(option.value)}
                    type="button"
                    onClick={() => setAnswer(option.value)}
                    className={`game-btn flex-1 rounded-lg border-2 px-2 py-3 font-semibold sm:px-4 phone:px-2 phone:py-2 pointer-coarse:min-h-11 ${
                      answer === option.value
                        ? 'border-orange-400 bg-orange-50 text-orange-900'
                        : 'border-warm-200 bg-white text-warm-700 hover:bg-warm-50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>

          <fieldset className="mb-6 phone:mb-2 phone:min-w-0 phone-land:mb-0" disabled={checked}>
            <legend className="mb-2 text-sm font-semibold text-warm-700 phone:mb-1">
              Hvaða regla ræður því?
            </legend>
            <div className="space-y-2 phone:space-y-1">
              {SOLUBILITY_RULES.map((r) => (
                <button
                  key={r.id}
                  ref={(el) => {
                    ruleRefs.current[r.id] = el;
                  }}
                  type="button"
                  onClick={() => setRuleId(r.id)}
                  className={`game-btn block w-full rounded-lg border-2 px-3 py-2 text-left text-sm pointer-coarse:min-h-11 phone:py-1.5 ${
                    ruleId === r.id
                      ? 'border-orange-400 bg-orange-50 text-orange-900'
                      : 'border-warm-200 bg-white text-warm-700 hover:bg-warm-50'
                  }`}
                >
                  {r.text}
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        {!checked ? (
          <PinnedActions pinnedClassName="pin:pt-1.5">
            <button
              key="athuga"
              type="button"
              onClick={check}
              disabled={answer === null || ruleId === null}
              className="game-btn w-full rounded-lg bg-kvenno-orange px-4 py-3 font-semibold text-white hover:bg-kvenno-orange-dark disabled:cursor-not-allowed disabled:bg-warm-300 phone:py-2.5"
            >
              Athuga
            </button>
          </PinnedActions>
        ) : (
          <div
            ref={feedbackRef}
            role="group"
            aria-labelledby="aefa-verdict"
            className={`rounded-lg border-2 p-4 phone:p-3 ${
              bothRight ? 'border-green-300 bg-green-50' : 'border-amber-300 bg-amber-50'
            }`}
          >
            <p id="aefa-verdict" className="mb-2 font-semibold text-warm-900">
              {bothRight
                ? 'Rétt — bæði svarið og reglan.'
                : verdictRight
                  ? 'Rétt svar, en það er önnur regla sem ræður því.'
                  : 'Ekki rétt.'}
            </p>
            <p className="text-sm text-warm-800">
              {item.salt.formula} er{' '}
              <strong>{item.verdict.soluble ? 'leysanlegt' : 'óleysanlegt'}</strong>.
              {rules.map((r) => ` ${r.text} ${r.exceptionText}`).join('')}
            </p>
            {item.verdict.byException && (
              <p className="mt-2 rounded border border-amber-300 bg-white p-2 text-sm text-amber-900">
                Þetta er undantekning. Almenna reglan segir{' '}
                {item.verdict.rule.soluble ? 'leysanlegt' : 'óleysanlegt'}, en{' '}
                {item.salt.cation.formula} snýr því við. Undantekningarnar eru ekki aukaatriði — þær
                eru þar sem dæmin eru samin.
              </p>
            )}
            <button
              key="naesta"
              type="button"
              onClick={armed(next)}
              className="game-btn mt-4 rounded-lg bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700 pointer-coarse:min-h-11"
            >
              {index + 1 >= items.length ? 'Ljúka' : 'Næsta'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
