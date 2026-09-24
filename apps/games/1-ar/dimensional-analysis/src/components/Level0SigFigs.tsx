import { useLayoutEffect, useRef, useState } from 'react';

import {
  DECIMAL_INPUT_PROPS,
  formatDecimal,
  revealInline,
  useArmedAfter,
  useItemTop,
  useRevealAfterCommit,
  type ScientificEntry,
} from '@shared/utils';

import {
  ARITHMETIC_ITEMS,
  COUNT_ITEMS,
  ROUND_ITEMS,
  RULES,
  type ArithmeticItem,
  type CountItem,
  type RoundItem,
} from '../data/sigfig-items';
import { countSigFigs, readWritten, toggleSign } from '../utils/sigfigs';

/**
 * Stig 0 — Markverðir stafir.
 *
 * Siggi's ruling, 2026-09-19: significant figures live inside Einingagreining,
 * not in a game of their own. This is the teaching this game was missing while
 * already marking students on it — `Level3.tsx` shows a red panel when the
 * figure count is wrong, and nothing had ever explained the rule.
 *
 * Four steps, teach-before-test: read the rules, count them, write a number to
 * a given precision, then the two arithmetic rules. **No score and no timer** —
 * this is a learning phase, per the April 2026 structure, so the footer counts
 * progress and nothing else.
 */

type Step = 'reglur' | 'telja' | 'namunda' | 'reikna' | 'lokid';

const STEPS: { id: Step; label: string }[] = [
  { id: 'reglur', label: 'Reglurnar' },
  { id: 'telja', label: 'Teldu' },
  { id: 'namunda', label: 'Námundaðu' },
  { id: 'reikna', label: 'Reiknireglurnar' },
];

interface Props {
  onComplete: (progress: { mastered: boolean }) => void;
  onBack: () => void;
}

/**
 * `rett` right; `stafir` the right number to the wrong precision; `veldi` the
 * right digits a power of ten out; `gildi` a wrong rounding; `ogilt` not
 * readable as a number, which does not use up the question.
 */
export type WrittenVerdict = 'rett' | 'stafir' | 'veldi' | 'gildi' | 'ogilt';

/**
 * Is the written answer right?
 *
 * **Both halves have to match**, and that is the lesson: `2,5` and `2,50` are
 * the same number and different answers. Comparing only the value would accept
 * the very mistake the step exists to correct.
 *
 * The answer arrives as digits and an optional power of ten (`readWritten`).
 * The value it is compared against comes from the item's number, never from
 * reading back the printed answer: `6,0 × 10¹` read with `parseStudentNumber`
 * is 6, which is how `6,0` came to be graded correct for sixty. The comparison
 * is exact, not within a tolerance — a tolerance would accept `0,00456` for
 * `0,00457`, which is a wrong rounding and the thing this step grades.
 *
 * The significant figures are counted on the digits as written. The power of
 * ten carries none, so `6,0` × 10¹ is two figures, and so is `60,` (rule 4).
 */
export function checkWritten(
  entry: ScientificEntry,
  item: { value: number; figures: number }
): WrittenVerdict {
  const written = readWritten(entry);
  if (written === null) return 'ogilt';

  const wanted = Number(item.value.toPrecision(item.figures));
  if (!(written.value > 0)) return 'gildi';

  // How many powers of ten apart the two are. Zero is the right value; a
  // whole number is the right digits with the comma or the power misplaced —
  // `6,0` for sixty — which is a different mistake from a wrong rounding.
  const shift = Math.log10(written.value / wanted);
  if (Math.abs(shift) > 1e-9) {
    return Math.abs(shift - Math.round(shift)) < 1e-9 ? 'veldi' : 'gildi';
  }
  return countSigFigs(written.digits) === item.figures ? 'rett' : 'stafir';
}

/**
 * A written number as two fields: the digits, `× 10`, and a power of ten.
 *
 * Stig 3 uses this row too, for the one kind of item that asks for scientific
 * notation, so the game has one way of writing it and not two. Both fields
 * raise the decimal keypad; that keypad has no minus key on an iPhone, so the
 * `±` button flips the sign of the power. It shows only on a touch screen — a
 * desktop keyboard has a minus key.
 *
 * Neither field carries a numeric placeholder. Stig 0's old one, `t.d. 2,50`,
 * was the answer to its own third item.
 */
export function WrittenNumberRow({
  entry,
  onChange,
  disabled = false,
  digitsLabel,
  fieldClassName = 'rounded-lg border-2 border-warm-300 py-2 text-lg',
  onEnter,
  enterKeyHint,
}: {
  entry: ScientificEntry;
  onChange: (patch: Partial<ScientificEntry>) => void;
  disabled?: boolean;
  /** The accessible name of the digits field. */
  digitsLabel: string;
  /** Border, padding and type size, so each level keeps its own look. */
  fieldClassName?: string;
  /** Enter in either field: send the answer (Stig 0) or move on to the next field (Stig 3). */
  onEnter?: () => void;
  /** The label on the phone keyboard's Enter key. */
  enterKeyHint?: 'done' | 'next';
}) {
  const onKeyDown = onEnter
    ? (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key !== 'Enter') return;
        e.preventDefault();
        onEnter();
      }
    : undefined;
  return (
    <div className="flex w-full min-w-0 items-center gap-1.5 sm:w-auto sm:gap-2">
      <input
        {...DECIMAL_INPUT_PROPS}
        value={entry.mantissa}
        onChange={(e) => onChange({ mantissa: e.target.value })}
        onKeyDown={onKeyDown}
        enterKeyHint={enterKeyHint}
        disabled={disabled}
        autoComplete="off"
        aria-label={digitsLabel}
        className={`w-0 min-w-0 flex-1 px-3 sm:w-40 sm:flex-none ${fieldClassName}`}
      />
      <span className="shrink-0 whitespace-nowrap font-mono text-lg text-warm-700">× 10</span>
      <input
        {...DECIMAL_INPUT_PROPS}
        value={entry.exponent}
        onChange={(e) => onChange({ exponent: e.target.value })}
        onKeyDown={onKeyDown}
        enterKeyHint={enterKeyHint}
        disabled={disabled}
        autoComplete="off"
        aria-label="Veldisvísir"
        className={`w-14 shrink-0 px-1 text-center font-mono sm:w-20 ${fieldClassName}`}
      />
      <button
        type="button"
        onClick={() => onChange({ exponent: toggleSign(entry.exponent) })}
        disabled={disabled}
        aria-label="Skipta um formerki á veldisvísi"
        className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-lg border-2 border-warm-300 bg-white font-mono text-lg text-warm-700 disabled:opacity-60 pointer-coarse:inline-flex"
      >
        ±
      </button>
    </div>
  );
}

/** Under the row: the power is optional, so a plainly written number is fine. */
export const WRITTEN_NUMBER_HELP = 'Skildu veldisvísinn eftir auðan ef þú skrifar töluna beint.';

/** When `readWritten` cannot read what was typed. */
export const WRITTEN_NUMBER_UNREADABLE =
  'Þetta er ekki hægt að lesa sem tölu. Skrifaðu aðeins tölustafi og kommu í fyrri reitinn og veldisvísinn í þann seinni.';

function ChoiceRow({
  options,
  chosen,
  answer,
  onChoose,
}: {
  options: number[];
  chosen: number | null;
  answer: number;
  onChoose: (n: number) => void;
}) {
  return (
    <div className="grid grid-cols-5 gap-2 sm:flex sm:flex-wrap">
      {options.map((n) => {
        const picked = chosen === n;
        const shade =
          chosen === null
            ? 'bg-white hover:bg-orange-50 border-warm-300'
            : n === answer
              ? 'bg-green-100 border-green-500'
              : picked
                ? 'bg-red-100 border-red-400'
                : 'bg-white border-warm-200 opacity-60';
        return (
          <button
            key={n}
            type="button"
            disabled={chosen !== null}
            onClick={() => onChoose(n)}
            className={`game-btn h-14 w-full rounded-lg border-2 text-lg font-semibold sm:w-14 ${shade}`}
            aria-label={`${n}`}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}

/**
 * The verdict, and the region focus moves to after an answer (design P3): a
 * group named by its own first line, so a second Enter lands on nothing.
 */
function Verdict({
  ok,
  children,
  groupRef,
}: {
  ok: boolean;
  children: React.ReactNode;
  groupRef: React.Ref<HTMLDivElement>;
}) {
  return (
    <div
      ref={groupRef}
      tabIndex={-1}
      role="group"
      aria-labelledby="da-l0-verdict"
      className={`mt-4 rounded-lg border p-4 text-sm focus:outline-none phone:mt-3 phone:p-3 ${
        ok
          ? 'border-green-200 bg-green-50 text-green-900'
          : 'border-amber-300 bg-amber-50 text-amber-900'
      }`}
    >
      <p id="da-l0-verdict" className="mb-1 font-semibold">
        {ok ? 'Rétt' : 'Ekki alveg'}
      </p>
      {children}
    </div>
  );
}

export function Level0SigFigs({ onComplete, onBack }: Props) {
  const [step, setStep] = useState<Step>('reglur');
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [entry, setEntry] = useState<ScientificEntry>({ mantissa: '', exponent: '' });
  const [verdict, setVerdict] = useState<WrittenVerdict | null>(null);
  // An unreadable entry is not an answer: it is sent back for editing, and
  // editing clears the prompt.
  const answered = verdict !== null && verdict !== 'ogilt';

  const edit = (patch: Partial<ScientificEntry>) => {
    setEntry((current) => ({ ...current, ...patch }));
    setVerdict((current) => (current === 'ogilt' ? null : current));
  };

  const advance = (list: unknown[], next: Step) => {
    setChosen(null);
    setEntry({ mantissa: '', exponent: '' });
    setVerdict(null);
    if (index + 1 < list.length) setIndex(index + 1);
    else {
      setIndex(0);
      setStep(next);
    }
  };

  const countItem: CountItem = COUNT_ITEMS[index];
  const roundItem: RoundItem = ROUND_ITEMS[index];
  const arithItem: ArithmeticItem = ARITHMETIC_ITEMS[index];

  // Each new step and each new question: on a phone the card's top comes back
  // under the header, and focus moves to the question's first line.
  const itemKey = `${step}:${index}`;
  const cardRef = useItemTop<HTMLDivElement>(itemKey);

  // The step pills are one sideways-scrolling row on a phone: keep the
  // current one in view.
  const currentPillRef = useRef<HTMLLIElement>(null);
  useLayoutEffect(() => {
    revealInline(currentPillRef.current, { inline: 'nearest' });
  }, [step]);

  // After an answer: on a phone, the question through "Næsta" if it fits, else
  // the verdict at the top; focus moves to the verdict, not to "Næsta".
  const committed = step === 'namunda' ? answered : chosen !== null;
  const promptRef = useRef<HTMLDivElement>(null);
  const verdictRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  useRevealAfterCommit(committed, () => ({
    bottom: nextRef.current,
    tops: [promptRef.current, verdictRef.current],
    focus: verdictRef.current,
  }));
  // "Næsta" renders where a finger just tapped an answer: ignore it for 400 ms.
  const armed = useArmedAfter(400, `${itemKey}:${committed}`);

  const answerRound = () => {
    if (answered || entry.mantissa.trim() === '') return;
    setVerdict(checkWritten(entry, roundItem));
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div ref={cardRef} className="rounded-lg bg-white p-4 shadow-md sm:p-6 md:p-8 phone:p-3">
        <div className="mb-6 flex items-baseline justify-between gap-3 phone:mb-3">
          <h2 className="text-xl font-bold text-warm-800 sm:text-2xl phone:text-lg">
            Stig 0 — Markverðir stafir
          </h2>
          <button
            onClick={onBack}
            className="shrink-0 whitespace-nowrap text-sm text-warm-500 underline"
          >
            Til baka
          </button>
        </div>

        {/* On a phone the pills stay on one row, scrolling sideways, with the
            current one kept in view. */}
        <ol className="mb-6 flex flex-wrap gap-2 text-xs phone:mb-3 phone:flex-nowrap phone:gap-1.5 phone:overflow-x-auto">
          {STEPS.map((s) => (
            <li
              key={s.id}
              ref={s.id === step ? currentPillRef : undefined}
              aria-current={s.id === step ? 'step' : undefined}
              className={`rounded-full px-3 py-1 phone:shrink-0 phone:px-2.5 ${
                s.id === step
                  ? 'bg-orange-100 font-semibold text-orange-800'
                  : 'bg-warm-100 text-warm-500'
              }`}
            >
              {s.label}
            </li>
          ))}
        </ol>

        {step === 'reglur' && (
          <div>
            <p className="mb-4 text-warm-700">
              Mæling segir tvennt: hvað hún er, og hversu nákvæm hún er.{' '}
              <strong>Markverðir stafir</strong> eru hvernig við skrifum það seinna niður. Í Stigi 3
              í þessum leik ertu þegar dæmd/ur á þá — hér er reglan sjálf.
            </p>
            <div className="space-y-4">
              {RULES.map((rule) => (
                <div key={rule.n} className="rounded-lg border border-warm-200 bg-warm-50 p-4">
                  <h3 className="font-semibold text-warm-800">
                    {rule.n}. {rule.title}
                  </h3>
                  <p className="mt-1 text-sm text-warm-600">{rule.body}</p>
                  <ul className="mt-2 space-y-1">
                    {rule.examples.map((ex) => (
                      <li key={ex.written} className="text-sm">
                        <code className="rounded bg-white px-2 py-0.5 font-mono">{ex.written}</code>
                        <strong className="mx-2">{ex.count}</strong>
                        <span className="text-warm-500">{ex.why}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
              <strong>Af hverju skiptir þetta máli?</strong> Vog sem sýnir 2,50 g segir að massinn
              liggi milli 2,495 og 2,505 g. Skrifirðu 2,5 g hefurðu sagt milli 2,45 og 2,55 — tíu
              sinnum grófari fullyrðing um sömu mælinguna.
            </div>
            <button
              onClick={() => setStep('telja')}
              className="game-btn mt-6 rounded-lg px-6 py-3 font-semibold text-white"
              style={{ backgroundColor: '#f36b22' }}
            >
              Áfram í æfingu
            </button>
          </div>
        )}

        {step === 'telja' && (
          <div>
            <div ref={promptRef}>
              <p data-item-start className="mb-2 text-sm text-warm-500 phone:mb-1">
                Spurning {index + 1} af {COUNT_ITEMS.length}
              </p>
              <p className="mb-4 text-warm-700 phone:mb-2">
                Hversu marga markverða stafi hefur þessi tala?
              </p>
              <p className="mb-6 rounded-lg bg-warm-50 px-4 py-6 text-center font-mono text-4xl text-warm-900 phone:mb-3 phone:py-4">
                {countItem.written}
              </p>
            </div>
            <ChoiceRow
              options={[1, 2, 3, 4, 5]}
              chosen={chosen}
              answer={countItem.answer}
              onChoose={setChosen}
            />
            {chosen !== null && (
              <Verdict ok={chosen === countItem.answer} groupRef={verdictRef}>
                <p>
                  {countItem.written} hefur <strong>{countItem.answer}</strong> markverða stafi —
                  regla {countItem.rule}.
                </p>
                {chosen !== countItem.answer && countItem.misconception && (
                  <p className="mt-2">{countItem.misconception}</p>
                )}
              </Verdict>
            )}
            {chosen !== null && (
              <button
                ref={nextRef}
                onClick={armed(() => advance(COUNT_ITEMS, 'namunda'))}
                className="game-btn mt-4 rounded-lg bg-warm-800 px-5 py-2 font-semibold text-white phone:mt-3"
              >
                {index + 1 < COUNT_ITEMS.length ? 'Næsta' : 'Áfram'}
              </button>
            )}
          </div>
        )}

        {step === 'namunda' && (
          <div>
            <div ref={promptRef}>
              <p data-item-start className="mb-2 text-sm text-warm-500 phone:mb-1">
                Spurning {index + 1} af {ROUND_ITEMS.length}
              </p>
              <p className="mb-4 text-warm-700 phone:mb-2">{roundItem.context}</p>
              <p className="mb-4 text-warm-700 phone:mb-2">
                Skrifaðu töluna með <strong>{roundItem.figures}</strong> markverðum stöfum.
              </p>
            </div>
            {/* The same row on every item, so its shape says nothing about which
                one wants a power of ten. Enter in either field sends it. */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-3">
              <WrittenNumberRow
                entry={entry}
                onChange={edit}
                disabled={answered}
                digitsLabel="Svarið þitt"
                onEnter={answerRound}
                enterKeyHint="done"
              />
              {!answered && (
                <button
                  key="check"
                  onClick={answerRound}
                  disabled={entry.mantissa.trim() === ''}
                  className="game-btn rounded-lg px-5 py-2 font-semibold text-white disabled:opacity-40"
                  style={{ backgroundColor: '#f36b22' }}
                >
                  Svara
                </button>
              )}
            </div>
            <p className="mt-2 text-xs text-warm-500">{WRITTEN_NUMBER_HELP}</p>
            {verdict === 'ogilt' && (
              <p className="mt-2 text-sm text-amber-800">{WRITTEN_NUMBER_UNREADABLE}</p>
            )}
            {answered && (
              <Verdict ok={verdict === 'rett'} groupRef={verdictRef}>
                <p>
                  Svarið er <strong>{roundItem.answer}</strong>.
                </p>
                {verdict === 'stafir' && (
                  <p className="mt-2">
                    Talan þín er rétt en hún er ekki skrifuð með {roundItem.figures} markverðum
                    stöfum. Núll aftast er ekki skraut — það er hluti af fullyrðingunni um nákvæmni.
                  </p>
                )}
                {verdict === 'veldi' && (
                  <p className="mt-2">
                    Talan er ekki af réttri stærð. Athugaðu veldisvísinn og hvar komman stendur.
                  </p>
                )}
                {verdict === 'gildi' && <p className="mt-2">Námundunin sjálf stemmir ekki.</p>}
                {/* The notation is shown, not named. The old note's word had no
                    hits in the course's textbook, which itself uses two, and
                    which one the course uses is an open terminology ruling
                    (`docs/FEBRUARY-DECISIONS-RECOVERED.md`, item 7). */}
                {roundItem.answer.includes('×') && (
                  <p className="mt-2">
                    Skrifuð sem{' '}
                    <code>
                      {formatDecimal(Number(roundItem.value.toPrecision(roundItem.figures)))}
                    </code>{' '}
                    yrði talan lesin með færri markverðum stöfum, því núll aftast telja ekki nema
                    komma sé skrifuð (regla 4). Skýrast er að skrifa hana sem{' '}
                    <code className="whitespace-nowrap">{roundItem.answer}</code>, þar sem allir
                    tölustafirnir framan við <span className="whitespace-nowrap">× 10</span> eru
                    markverðir.
                  </p>
                )}
              </Verdict>
            )}
            {answered && (
              <div>
                <button
                  key="next"
                  ref={nextRef}
                  onClick={armed(() => advance(ROUND_ITEMS, 'reikna'))}
                  className="game-btn mt-4 rounded-lg bg-warm-800 px-5 py-2 font-semibold text-white phone:mt-3"
                >
                  {index + 1 < ROUND_ITEMS.length ? 'Næsta' : 'Áfram'}
                </button>
              </div>
            )}
          </div>
        )}

        {step === 'reikna' && (
          <div>
            <div ref={promptRef}>
              <p data-item-start className="mb-2 text-sm text-warm-500 phone:mb-1">
                Spurning {index + 1} af {ARITHMETIC_ITEMS.length}
              </p>
              <p className="mb-4 text-warm-700 phone:mb-2">
                {arithItem.kind === 'margfeldi'
                  ? 'Hversu marga markverða stafi má svarið hafa?'
                  : 'Hversu marga AUKASTAFI má svarið hafa?'}
              </p>
              <p className="mb-6 rounded-lg bg-warm-50 px-4 py-6 text-center font-mono text-2xl text-warm-900 phone:mb-3 phone:py-4">
                {arithItem.expression}
              </p>
            </div>
            <ChoiceRow
              options={[0, 1, 2, 3, 4]}
              chosen={chosen}
              answer={arithItem.answer}
              onChoose={setChosen}
            />
            {chosen !== null && (
              <Verdict ok={chosen === arithItem.answer} groupRef={verdictRef}>
                <p>{arithItem.explanation}</p>
              </Verdict>
            )}
            {chosen !== null && (
              <button
                ref={nextRef}
                onClick={armed(() => advance(ARITHMETIC_ITEMS, 'lokid'))}
                className="game-btn mt-4 rounded-lg bg-warm-800 px-5 py-2 font-semibold text-white phone:mt-3"
              >
                {index + 1 < ARITHMETIC_ITEMS.length ? 'Næsta' : 'Klára'}
              </button>
            )}
          </div>
        )}

        {step === 'lokid' && (
          <div>
            <h3 data-item-start className="mb-3 text-xl font-semibold text-warm-800">
              Stigi 0 lokið
            </h3>
            <p className="mb-4 text-warm-700">
              Þú kannt nú regluna sem Stig 3 dæmir þig á. Munaðu tvennt: í margföldun og deilingu
              ræður fæsti fjöldi <strong>markverðra stafa</strong>, í samlagningu og frádrætti fæsti
              fjöldi <strong>aukastafa</strong> — og umreikningsstuðlar eins og 1000 mg í grammi eru
              skilgreiningar, ekki mælingar, svo þeir takmarka ekkert.
            </p>
            <button
              onClick={() => onComplete({ mastered: true })}
              className="game-btn rounded-lg px-6 py-3 font-semibold text-white"
              style={{ backgroundColor: '#f36b22' }}
            >
              Aftur í valmynd
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
