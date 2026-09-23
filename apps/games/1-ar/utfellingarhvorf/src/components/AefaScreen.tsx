import { useEffect, useMemo, useRef, useState } from 'react';

import { SOLUBILITY_RULES } from '../data/ions';
import { DRILL_ITEMS } from '../data/problems';
import { reveal } from '../utils/reveal';

/**
 * Æfa — the solubility drill: is this compound leysanlegt, and by which rule?
 *
 * **Two answers are required, not one**, and that is the design. "Leysanlegt"
 * alone is a coin flip a student can win half the time; naming the rule is what
 * shows they read the anion and checked the exception list. The feedback
 * therefore names the rule whether they got the verdict right or wrong.
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
  const verdictRight = answer === item.verdict.soluble;
  const ruleRight = ruleId === item.verdict.rule.id;
  const bothRight = verdictRight && ruleRight;

  const check = () => {
    setChecked(true);
    if (verdictRight && ruleRight) setCorrect(correct + 1);
  };

  // On a phone "Athuga" and "Næsta" sit at the bottom of a card taller than the
  // screen. After "Athuga" bring the whole verdict (and its "Næsta") into view;
  // after "Næsta" bring the new compound back, which has scrolled off the top.
  const counterRef = useRef<HTMLParagraphElement>(null);
  const compoundRef = useRef<HTMLDivElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const shown = useRef({ index, checked });
  useEffect(() => {
    const before = shown.current;
    shown.current = { index, checked };
    if (index !== before.index) reveal(counterRef.current, compoundRef.current);
    else if (checked && !before.checked) reveal(feedbackRef.current);
  }, [index, checked]);

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
      <div className="rounded-lg bg-white p-4 shadow-md sm:p-6 md:p-8">
        <div className="mb-6 flex items-baseline justify-between gap-3">
          <h2 className="text-xl font-bold text-warm-800 sm:text-2xl">
            Æfa — leysanlegt eða ekki?
          </h2>
          <button
            onClick={onBack}
            className="shrink-0 whitespace-nowrap text-sm text-warm-500 underline pointer-coarse:-my-3 pointer-coarse:py-3"
          >
            Til baka
          </button>
        </div>

        <p ref={counterRef} className="mb-2 text-sm text-warm-600">
          Efni {index + 1} af {items.length}
        </p>

        <div
          ref={compoundRef}
          className="mb-6 rounded-lg border-2 border-warm-200 bg-warm-50 p-6 text-center"
        >
          <p className="font-mono text-3xl text-warm-900">{item.salt.formula}</p>
          <p className="mt-2 text-sm text-warm-600">
            {item.salt.cation.name} og {item.salt.anion.name}
          </p>
        </div>

        <fieldset className="mb-4" disabled={checked}>
          <legend className="mb-2 text-sm font-semibold text-warm-700">
            Leysist það upp í vatni?
          </legend>
          <div className="flex gap-2 sm:gap-3">
            {[
              { value: true, label: 'Leysanlegt' },
              { value: false, label: 'Óleysanlegt' },
            ].map((option) => (
              <button
                key={String(option.value)}
                type="button"
                onClick={() => setAnswer(option.value)}
                className={`game-btn flex-1 rounded-lg border-2 px-2 py-3 font-semibold sm:px-4 ${
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

        <fieldset className="mb-6" disabled={checked}>
          <legend className="mb-2 text-sm font-semibold text-warm-700">
            Hvaða regla ræður því?
          </legend>
          <div className="space-y-2">
            {SOLUBILITY_RULES.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRuleId(r.id)}
                className={`game-btn block w-full rounded-lg border-2 px-3 py-2 text-left text-sm pointer-coarse:min-h-11 ${
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

        {!checked ? (
          <button
            type="button"
            onClick={check}
            disabled={answer === null || ruleId === null}
            className="game-btn w-full rounded-lg bg-kvenno-orange px-4 py-3 font-semibold text-white hover:bg-kvenno-orange-dark disabled:cursor-not-allowed disabled:bg-warm-300"
          >
            Athuga
          </button>
        ) : (
          <div
            ref={feedbackRef}
            className={`rounded-lg border-2 p-4 ${
              bothRight ? 'border-green-300 bg-green-50' : 'border-amber-300 bg-amber-50'
            }`}
          >
            <p className="mb-2 font-semibold text-warm-900">
              {bothRight
                ? 'Rétt — bæði svarið og reglan.'
                : verdictRight
                  ? 'Rétt svar, en það er önnur regla sem ræður því.'
                  : 'Ekki rétt.'}
            </p>
            <p className="text-sm text-warm-800">
              {item.salt.formula} er{' '}
              <strong>{item.verdict.soluble ? 'leysanlegt' : 'óleysanlegt'}</strong>.{' '}
              {item.verdict.rule.text} {item.verdict.rule.exceptionText}
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
              type="button"
              onClick={next}
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
