import { useState } from 'react';

import { DECIMAL_INPUT_PROPS, parseStudentNumber } from '@shared/utils';

import {
  ARITHMETIC_ITEMS,
  COUNT_ITEMS,
  ROUND_ITEMS,
  RULES,
  type ArithmeticItem,
  type CountItem,
  type RoundItem,
} from '../data/sigfig-items';
import { countSigFigs } from '../utils/sigfigs';

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
 * Is the written answer right?
 *
 * **Both halves have to match**, and that is the lesson: `2,5` and `2,50` are
 * the same number and different answers. Comparing only the value would accept
 * the very mistake the step exists to correct.
 */
export function checkWritten(entry: string, expected: string): 'rett' | 'gildi' | 'stafir' {
  const wanted = parseStudentNumber(expected);
  const got = parseStudentNumber(entry);
  if (!Number.isFinite(got) || Math.abs(got - wanted) > Math.abs(wanted) * 1e-9) return 'gildi';
  let figures: number;
  try {
    figures = countSigFigs(entry);
  } catch {
    return 'gildi';
  }
  return figures === countSigFigs(expected) ? 'rett' : 'stafir';
}

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

function Verdict({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <div
      className={`mt-4 rounded-lg border p-4 text-sm ${
        ok
          ? 'border-green-200 bg-green-50 text-green-900'
          : 'border-amber-300 bg-amber-50 text-amber-900'
      }`}
    >
      <p className="mb-1 font-semibold">{ok ? 'Rétt' : 'Ekki alveg'}</p>
      {children}
    </div>
  );
}

export function Level0SigFigs({ onComplete, onBack }: Props) {
  const [step, setStep] = useState<Step>('reglur');
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [entry, setEntry] = useState('');
  const [verdict, setVerdict] = useState<'rett' | 'gildi' | 'stafir' | null>(null);

  const advance = (list: unknown[], next: Step) => {
    setChosen(null);
    setEntry('');
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

  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-lg bg-white p-4 shadow-md sm:p-6 md:p-8">
        <div className="mb-6 flex items-baseline justify-between gap-3">
          <h2 className="text-xl font-bold text-warm-800 sm:text-2xl">
            Stig 0 — Markverðir stafir
          </h2>
          <button
            onClick={onBack}
            className="shrink-0 whitespace-nowrap text-sm text-warm-500 underline"
          >
            Til baka
          </button>
        </div>

        <ol className="mb-6 flex flex-wrap gap-2 text-xs">
          {STEPS.map((s) => (
            <li
              key={s.id}
              className={`rounded-full px-3 py-1 ${
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
            <p className="mb-2 text-sm text-warm-500">
              Spurning {index + 1} af {COUNT_ITEMS.length}
            </p>
            <p className="mb-4 text-warm-700">Hversu marga markverða stafi hefur þessi tala?</p>
            <p className="mb-6 rounded-lg bg-warm-50 px-4 py-6 text-center font-mono text-4xl text-warm-900">
              {countItem.written}
            </p>
            <ChoiceRow
              options={[1, 2, 3, 4, 5]}
              chosen={chosen}
              answer={countItem.answer}
              onChoose={setChosen}
            />
            {chosen !== null && (
              <Verdict ok={chosen === countItem.answer}>
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
                onClick={() => advance(COUNT_ITEMS, 'namunda')}
                className="game-btn mt-4 rounded-lg bg-warm-800 px-5 py-2 font-semibold text-white"
              >
                {index + 1 < COUNT_ITEMS.length ? 'Næsta' : 'Áfram'}
              </button>
            )}
          </div>
        )}

        {step === 'namunda' && (
          <div>
            <p className="mb-2 text-sm text-warm-500">
              Spurning {index + 1} af {ROUND_ITEMS.length}
            </p>
            <p className="mb-4 text-warm-700">{roundItem.context}</p>
            <p className="mb-4 text-warm-700">
              Skrifaðu töluna með <strong>{roundItem.figures}</strong> markverðum stöfum.
            </p>
            <input
              {...DECIMAL_INPUT_PROPS}
              value={entry}
              onChange={(e) => setEntry(e.target.value)}
              disabled={verdict !== null}
              placeholder="t.d. 2,50"
              autoComplete="off"
              aria-label="Svarið þitt"
              className="w-36 rounded-lg border-2 border-warm-300 px-4 py-2 text-lg sm:w-48"
            />
            {verdict === null && (
              <button
                onClick={() => setVerdict(checkWritten(entry, roundItem.answer))}
                disabled={entry.trim() === ''}
                className="game-btn ml-3 rounded-lg px-5 py-2 font-semibold text-white disabled:opacity-40"
                style={{ backgroundColor: '#f36b22' }}
              >
                Svara
              </button>
            )}
            {verdict !== null && (
              <Verdict ok={verdict === 'rett'}>
                <p>
                  Svarið er <strong>{roundItem.answer}</strong>.
                </p>
                {verdict === 'stafir' && (
                  <p className="mt-2">
                    Talan þín er rétt en hún er ekki skrifuð með {roundItem.figures} markverðum
                    stöfum. Núll aftast er ekki skraut — það er hluti af fullyrðingunni um nákvæmni.
                  </p>
                )}
                {verdict === 'gildi' && <p className="mt-2">Námundunin sjálf stemmir ekki.</p>}
                {roundItem.answer.includes('×') && (
                  <p className="mt-2">
                    Þessa tölu er ekki hægt að skrifa með {roundItem.figures} markverðum stöfum án
                    veldisritháttar: skrifuð beint yrði hún lesin með færri stöfum. Það er einmitt
                    ástæðan fyrir veldisrithætti.
                  </p>
                )}
              </Verdict>
            )}
            {verdict !== null && (
              <div>
                <button
                  onClick={() => advance(ROUND_ITEMS, 'reikna')}
                  className="game-btn mt-4 rounded-lg bg-warm-800 px-5 py-2 font-semibold text-white"
                >
                  {index + 1 < ROUND_ITEMS.length ? 'Næsta' : 'Áfram'}
                </button>
              </div>
            )}
          </div>
        )}

        {step === 'reikna' && (
          <div>
            <p className="mb-2 text-sm text-warm-500">
              Spurning {index + 1} af {ARITHMETIC_ITEMS.length}
            </p>
            <p className="mb-4 text-warm-700">
              {arithItem.kind === 'margfeldi'
                ? 'Hversu marga markverða stafi má svarið hafa?'
                : 'Hversu marga AUKASTAFI má svarið hafa?'}
            </p>
            <p className="mb-6 rounded-lg bg-warm-50 px-4 py-6 text-center font-mono text-2xl text-warm-900">
              {arithItem.expression}
            </p>
            <ChoiceRow
              options={[0, 1, 2, 3, 4]}
              chosen={chosen}
              answer={arithItem.answer}
              onChoose={setChosen}
            />
            {chosen !== null && (
              <Verdict ok={chosen === arithItem.answer}>
                <p>{arithItem.explanation}</p>
              </Verdict>
            )}
            {chosen !== null && (
              <button
                onClick={() => advance(ARITHMETIC_ITEMS, 'lokid')}
                className="game-btn mt-4 rounded-lg bg-warm-800 px-5 py-2 font-semibold text-white"
              >
                {index + 1 < ARITHMETIC_ITEMS.length ? 'Næsta' : 'Klára'}
              </button>
            )}
          </div>
        )}

        {step === 'lokid' && (
          <div>
            <h3 className="mb-3 text-xl font-semibold text-warm-800">Stigi 0 lokið</h3>
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
