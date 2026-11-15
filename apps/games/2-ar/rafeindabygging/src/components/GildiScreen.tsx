/**
 * Gildisrafeindir og jónir: the bridge from electron configurations to Lewis-formúlur. Skilja and
 * an ungraded Kanna come first, then Æfa: ten items, one attempt each, ending `N af M rétt` with
 * no running score. Every answer is worked out from Z (`engine/gildi.ts`); a wrong answer shows
 * the working, and what the option chosen would have meant.
 */

import { useId, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { Header } from '@shared/components';
import {
  focusTarget,
  useArmedAfter,
  useItemTop,
  useRevealAfterCommit,
  useScreenTop,
} from '@shared/utils';

import { GILDI_ITEMS, KANNA_ELEMENTS, NAME_OF, type GildiItem } from '../data/gildi';
import {
  atomConfig,
  ionConfig,
  ionLabel,
  lewisSides,
  sameSides,
  shorthand,
  fullText,
  sidesLabel,
  subshellText,
  valenceElectrons,
  valenceSubshells,
  type Sides,
} from '../engine/gildi';
import { rafeindir } from '../utils/electrons';

interface Props {
  onBack: () => void;
}

const NOBLE_NAME: Record<string, string> = { He: 'helíum', Ne: 'neon', Ar: 'argon', Kr: 'krypton' };

/** The key of an item, from Z. */
export function answerOf(item: GildiItem): number | Sides | string {
  if (item.kind === 'gildi') return valenceElectrons(item.z);
  if (item.kind === 'lewis') return lewisSides(valenceElectrons(item.z));
  return shorthand(ionConfig(item.z, item.charge));
}

export function isAnswer(item: GildiItem, value: number | Sides | string): boolean {
  const key = answerOf(item);
  if (item.kind === 'lewis') return sameSides(key as Sides, value as Sides);
  return key === value;
}

const optionKey = (value: number | Sides | string) =>
  Array.isArray(value) ? value.join('') : String(value);

/** The working shown after an answer, worked out from Z like the key. */
export function explanation(item: GildiItem): string[] {
  const name = NAME_OF[item.symbol];
  const atom = atomConfig(item.z);
  if (item.kind !== 'jon') {
    const valence = valenceSubshells(item.z);
    const n = valence[0].n;
    const v = valenceElectrons(item.z);
    const lines = [
      `${name} (Z = ${item.z}): ${shorthand(atom)}.`,
      `Hæsta n er ${n}, svo gildisrafeindirnar eru ${valence.map(subshellText).join(' ')}: ${v} talsins.`,
    ];
    if (atom.some((s) => s.l === 2 && s.n === n - 1 && s.e === 10)) {
      lines.push(`Fullfyllt ${n - 1}d-undirhvolf telst til kjarnarafeinda.`);
    }
    if (item.kind === 'lewis') {
      lines.push(
        `Lewis-táknið hefur ${v} punkta, einn á hverja hlið áður en nokkur hlið fær annan.`
      );
    }
    return lines;
  }
  const ion = ionLabel(item.symbol, item.charge);
  const result = shorthand(ionConfig(item.z, item.charge));
  const count = Math.abs(item.charge);
  const lines = [`${name}: ${shorthand(atom)}.`];
  if (item.charge > 0) {
    lines.push(
      item.z >= 21 && item.z <= 30
        ? `${ion} hefur misst ${count} ${rafeindir(count)}. Hliðarmálmur missir 4s-rafeindirnar á undan 3d, svo ${ion} er ${result}.`
        : `${ion} hefur misst ${count} ${rafeindir(count)}, úr ysta hvolfinu, svo ${ion} er ${result}.`
    );
  } else {
    lines.push(
      `${ion} hefur fengið ${count} ${rafeindir(count)}, sem fara í næstu lausu svigrúm, svo ${ion} er ${result}.`
    );
  }
  const bare = /^\[(\w+)\]$/.exec(result);
  if (bare) lines.push(`Það er sama rafeindaskipan og ${NOBLE_NAME[bare[1]]}.`);
  return lines;
}

const DOT = 4.5;
/** Where each side's dots sit, about a symbol centred at (50, 50). */
const PLACES: readonly ((k: number, of: number) => [number, number])[] = [
  (k, of) => [50 + (of === 2 ? (k ? 8 : -8) : 0), 16],
  (k, of) => [84, 50 + (of === 2 ? (k ? 8 : -8) : 0)],
  (k, of) => [50 + (of === 2 ? (k ? 8 : -8) : 0), 84],
  (k, of) => [16, 50 + (of === 2 ? (k ? 8 : -8) : 0)],
];

export function LewisSymbol({
  symbol,
  sides,
  size = 80,
}: {
  symbol: string;
  sides: Sides;
  size?: number;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      role="img"
      aria-label={`${symbol}, ${sidesLabel(sides)}`}
    >
      <text
        x="50"
        y="51"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="34"
        fontWeight="700"
        fill="currentColor"
      >
        {symbol}
      </text>
      {sides.flatMap((of, side) =>
        Array.from({ length: of }, (_, k) => {
          const [cx, cy] = PLACES[side](k, of);
          return <circle key={`${side}-${k}`} cx={cx} cy={cy} r={DOT} fill="currentColor" />;
        })
      )}
    </svg>
  );
}

function Kanna() {
  const [z, setZ] = useState(15);
  const element = KANNA_ELEMENTS.find((e) => e.z === z)!;
  const atom = atomConfig(z);
  const valence = valenceSubshells(z);
  const v = valenceElectrons(z);
  const ion = element.ion;
  return (
    <section
      aria-labelledby="gildi-kanna"
      className="space-y-3 rounded-xl border border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50 p-4 phone:p-3"
    >
      <h3 id="gildi-kanna" className="text-lg font-bold text-teal-800">
        Kannaðu: frá rafeindaskipan að Lewis-tákni
      </h3>
      <fieldset>
        <legend className="mb-1 text-sm font-semibold text-teal-900">Frumefni</legend>
        <div className="flex flex-wrap gap-1.5">
          {KANNA_ELEMENTS.map((e) => (
            <button
              key={e.z}
              type="button"
              onClick={() => setZ(e.z)}
              aria-pressed={e.z === z}
              aria-label={e.name}
              className={`w-11 rounded-lg border-2 py-1 text-sm font-semibold pointer-coarse:min-h-11 ${
                e.z === z
                  ? 'border-teal-700 bg-teal-700 text-white'
                  : 'border-teal-300 bg-white text-teal-900 hover:bg-teal-100'
              }`}
            >
              {e.symbol}
            </button>
          ))}
        </div>
      </fieldset>
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
        <div className="shrink-0 rounded-lg bg-white p-2 text-warm-900 shadow-sm">
          <LewisSymbol symbol={element.symbol} sides={lewisSides(v)} size={96} />
        </div>
        <dl aria-live="polite" className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
          <dt className="font-semibold text-teal-900">Frumefni</dt>
          <dd>
            {element.name}, Z = {z}
          </dd>
          <dt className="font-semibold text-teal-900">Rafeindaskipan</dt>
          <dd className="font-mono">{fullText(atom)}</dd>
          <dt className="font-semibold text-teal-900">Stytt</dt>
          <dd className="font-mono">{shorthand(atom)}</dd>
          <dt className="font-semibold text-teal-900">Gildisrafeindir</dt>
          <dd>
            <span className="font-mono">{valence.map(subshellText).join(' ')}</span>: {v}
          </dd>
          <dt className="font-semibold text-teal-900">Jón</dt>
          <dd>
            {ion === undefined ? (
              'myndar sjaldan jón'
            ) : (
              <>
                {ionLabel(element.symbol, ion)}:{' '}
                <span className="font-mono">{shorthand(ionConfig(z, ion))}</span>
              </>
            )}
          </dd>
        </dl>
      </div>
      <p className="text-sm text-warm-700">
        Gakktu eftir þriðju lotu, frá Na til Ar: einum punkti fleira í hverju skrefi. Málmarnir
        missa gildisrafeindirnar og málmleysingjarnir fylla upp í átta, svo jónir beggja fá
        rafeindaskipan eðalgass.
      </p>
    </section>
  );
}

function shuffled<T>(items: readonly T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function GildiScreen({ onBack }: Props) {
  const [phase, setPhase] = useState<'skilja' | 'aefa'>('skilja');
  const titleRef = useRef<HTMLHeadingElement>(null);
  const startRef = useRef<HTMLHeadingElement>(null);
  useScreenTop(phase, { anyWidth: true, focus: phase === 'skilja' ? titleRef : startRef });
  useLayoutEffect(() => {
    focusTarget(titleRef.current);
  }, []);

  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const item = index < GILDI_ITEMS.length ? GILDI_ITEMS[index] : null;
  const options = useMemo(
    () => (item ? shuffled<{ value: number | Sides | string; slip?: string }>(item.options) : []),
    [item]
  );
  const picked = options.find((o) => optionKey(o.value) === chosen) ?? null;
  const right = item && picked ? isAnswer(item, picked.value) : false;

  const cardRef = useItemTop<HTMLDivElement>(index);
  const questionRef = useRef<HTMLDivElement>(null);
  const answerRef = useRef<HTMLDivElement>(null);
  const verdictRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  useRevealAfterCommit(picked !== null, () => ({
    bottom: nextRef.current,
    tops: [questionRef.current, answerRef.current, verdictRef.current],
    focus: verdictRef.current,
  }));
  const armed = useArmedAfter(400, `${index}:${picked !== null}`);
  const verdictId = useId();

  const choose = (value: number | Sides | string) => {
    if (!item || chosen !== null) return;
    setChosen(optionKey(value));
    if (isAnswer(item, value)) setCorrect((n) => n + 1);
  };
  const next = () => {
    setChosen(null);
    setIndex((i) => i + 1);
  };
  const restart = () => {
    setChosen(null);
    setCorrect(0);
    setIndex(0);
  };

  const answerText = (it: GildiItem) => {
    const key = answerOf(it);
    if (it.kind === 'gildi') return `${key} gildisrafeindir`;
    if (it.kind === 'lewis') return sidesLabel(key as Sides);
    return String(key);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100">
      <Header
        variant="game"
        gameTitle="Gildisrafeindir og jónir"
        backLabel="Til baka í valmynd"
        onBack={onBack}
      />
      <main className="mx-auto max-w-3xl px-4 py-6 phone:py-3">
        <div className="space-y-5 rounded-xl bg-white p-4 shadow-lg sm:p-6 md:p-8 phone:space-y-3 phone:p-3">
          <h2
            ref={titleRef}
            tabIndex={-1}
            data-item-start={phase === 'skilja' ? '' : undefined}
            className={`text-2xl font-bold text-teal-700 phone:text-xl ${phase === 'aefa' ? 'phone:sr-only' : ''}`}
          >
            Gildisrafeindir og jónir
          </h2>

          {phase === 'skilja' ? (
            <>
              <section
                aria-labelledby="gildi-skilja"
                className="space-y-2 rounded-xl bg-blue-50 p-4 phone:p-3"
              >
                <h3 id="gildi-skilja" className="text-lg font-bold text-blue-800">
                  Gildisrafeindir og kjarnarafeindir
                </h3>
                <p className="text-sm text-blue-900">
                  Rafeindirnar í ysta hvolfinu, því sem hefur hæsta n, eru{' '}
                  <strong>gildisrafeindir</strong>. Hinar eru <strong>kjarnarafeindir</strong>, og
                  þær eru eðalgasið í styttu rafeindaskipaninni. Natríum er [Ne] 3s¹: ein
                  gildisrafeind og tíu kjarnarafeindir.
                </p>
                <p className="text-sm text-blue-900">
                  Fullfyllt d-undirhvolf undir ysta hvolfinu telst til kjarnans. Bróm er [Ar] 4s²
                  3d¹⁰ 4p⁵ og hefur sjö gildisrafeindir, 4s² 4p⁵. Hjá aðalflokkunum er fjöldinn sá
                  sami niður hvern flokk: allir halógenarnir hafa sjö.
                </p>
              </section>

              <section
                aria-labelledby="gildi-lewis"
                className="space-y-2 rounded-xl bg-amber-50 p-4 phone:p-3"
              >
                <h3 id="gildi-lewis" className="text-lg font-bold text-amber-800">
                  Lewis-tákn
                </h3>
                <p className="text-sm text-amber-900">
                  <strong>Lewis-tákn</strong> er tákn frumefnisins með einum punkti fyrir hverja
                  gildisrafeind. Punktarnir fara fyrst einn á hverja af fjórum hliðum og para sig
                  svo, eins og rafeindirnar dreifast í p-svigrúmin eftir reglu Hunds.
                </p>
                <div className="flex flex-wrap justify-center gap-2 text-amber-950">
                  {['Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar'].map((symbol, i) => (
                    <LewisSymbol key={symbol} symbol={symbol} sides={lewisSides(i + 1)} size={56} />
                  ))}
                </div>
                <p className="text-sm text-amber-900">
                  Þetta eru Lewis-tákn þriðju lotu. Í næsta leik, Lewis-formúlum, verða punktarnir
                  að tengjum og stökum rafeindapörum.
                </p>
              </section>

              <section
                aria-labelledby="gildi-jonir"
                className="space-y-2 rounded-xl bg-cyan-50 p-4 phone:p-3"
              >
                <h3 id="gildi-jonir" className="text-lg font-bold text-cyan-800">
                  Rafeindaskipan jóna
                </h3>
                <p className="text-sm text-cyan-900">
                  Katjón hefur misst rafeindir. Þær fara úr ysta hvolfinu, hæsta n, og innan þess úr
                  p á undan s: Na⁺ er [Ne]. Anjón hefur fengið rafeindir, og þær fara í næstu lausu
                  svigrúm eftir Aufbau-röð: Cl⁻ er [Ar].
                </p>
                <p className="text-sm text-cyan-900">
                  <strong>Hliðarmálmar missa 4s-rafeindirnar á undan 3d</strong>, þótt 4s hafi
                  fyllst fyrst. Járn er [Ar] 4s² 3d⁶, svo Fe²⁺ er [Ar] 3d⁶ og Fe³⁺ er [Ar] 3d⁵.
                </p>
              </section>

              <Kanna />

              <p className="text-xs text-warm-600">
                Heimild: Efnafræði 2e, kafli 6, „Rafeindabygging atóma (rafeindaskipan)“, og kafli
                7, „Lewis-tákn og Lewis-myndir“.
              </p>

              <button
                type="button"
                onClick={() => setPhase('aefa')}
                className="game-btn w-full rounded-xl bg-green-600 py-3 font-bold text-white hover:bg-green-700"
              >
                Æfa: tíu spurningar →
              </button>
            </>
          ) : (
            <section aria-labelledby="gildi-aefa" className="space-y-3">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <h3 id="gildi-aefa" className="text-lg font-bold text-warm-800">
                  Æfðu þig
                </h3>
                <button
                  type="button"
                  onClick={() => setPhase('skilja')}
                  className="text-sm text-teal-700 underline pointer-coarse:-my-3 pointer-coarse:py-3"
                >
                  Skýring
                </button>
              </div>
              {item ? (
                <div
                  ref={cardRef}
                  className="space-y-3 rounded-xl border-2 border-warm-200 p-4 phone:p-3"
                >
                  <div ref={questionRef} className="space-y-1">
                    <p className="text-sm text-warm-500">
                      Spurning {index + 1} af {GILDI_ITEMS.length}
                    </p>
                    <h4
                      ref={startRef}
                      data-item-start
                      tabIndex={-1}
                      className="text-lg font-bold text-warm-800"
                    >
                      {item.question}
                    </h4>
                  </div>

                  <div
                    ref={answerRef}
                    className={
                      item.kind === 'lewis' ? 'grid grid-cols-2 gap-2' : 'grid gap-2 sm:grid-cols-2'
                    }
                  >
                    {options.map((o) => {
                      const key = optionKey(o.value);
                      const isPicked = chosen === key;
                      const isKey = chosen !== null && isAnswer(item, o.value);
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => choose(o.value)}
                          aria-disabled={chosen !== null}
                          aria-pressed={isPicked}
                          className={`flex items-center justify-center rounded-lg border-2 px-3 py-2 font-mono text-lg pointer-coarse:min-h-11 ${
                            isKey
                              ? 'border-green-600 bg-green-50 text-green-900'
                              : isPicked
                                ? 'border-red-500 bg-red-50 text-red-900'
                                : 'border-warm-300 bg-white text-warm-900 hover:bg-warm-50'
                          }`}
                        >
                          {item.kind === 'lewis' ? (
                            <LewisSymbol symbol={item.symbol} sides={o.value as Sides} size={72} />
                          ) : (
                            String(o.value)
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {picked !== null && (
                    <>
                      <div
                        ref={verdictRef}
                        role="group"
                        tabIndex={-1}
                        aria-labelledby={verdictId}
                        className={`space-y-2 rounded-lg border-2 p-3 ${
                          right
                            ? 'border-green-500 bg-green-50 text-green-900'
                            : 'border-red-400 bg-red-50 text-red-900'
                        }`}
                      >
                        <p id={verdictId} className="font-bold">
                          {right ? 'Rétt!' : `Ekki rétt. Svarið er ${answerText(item)}.`}
                        </p>
                        {!right && picked.slip && <p className="text-sm">{picked.slip}</p>}
                        <ul className="space-y-1 text-sm">
                          {explanation(item).map((line) => (
                            <li key={line}>{line}</li>
                          ))}
                        </ul>
                      </div>
                      <button
                        ref={nextRef}
                        type="button"
                        onClick={armed(next)}
                        className="game-btn w-full rounded-lg bg-teal-700 px-4 py-3 font-semibold text-white hover:bg-teal-800"
                      >
                        {index + 1 < GILDI_ITEMS.length ? 'Næsta spurning →' : 'Sjá niðurstöðu →'}
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <div
                  ref={cardRef}
                  className="space-y-3 rounded-xl border-2 border-green-300 bg-green-50 p-4"
                >
                  <h4
                    ref={startRef}
                    data-item-start
                    tabIndex={-1}
                    className="text-lg font-bold text-green-900"
                  >
                    {correct} af {GILDI_ITEMS.length} rétt
                  </h4>
                  <p className="text-sm text-green-900">
                    Gildisrafeindirnar ráða Lewis-tákninu og jónunum sem frumefnið myndar. Næst:
                    Lewis-formúlur, þar sem punktarnir verða að tengjum.
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={restart}
                      className="flex-1 rounded-xl bg-teal-700 py-3 font-bold text-white hover:bg-teal-800"
                    >
                      Byrja aftur
                    </button>
                    <button
                      type="button"
                      onClick={onBack}
                      className="flex-1 rounded-xl bg-warm-200 py-3 font-bold text-warm-700 hover:bg-warm-300"
                    >
                      ← Valmynd
                    </button>
                  </div>
                </div>
              )}
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
