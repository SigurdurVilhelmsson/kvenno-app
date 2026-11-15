/**
 * Heildað hraðalögmál og Arrhenius: using the integrated rate laws, half-lives and the two-point
 * Arrhenius equation (book ch. 12, m68791 and m68793). Skilja and an ungraded Kanna come first,
 * then Æfa: ten items from the book's examples, one attempt each, ending `N af M rétt` with no
 * running score. Every key is worked out by `engine/rate-laws.ts`; a wrong answer shows the
 * working and, where it can be told, the slip behind it.
 */

import { useId, useLayoutEffect, useRef, useState } from 'react';

import { Header } from '@shared/components';
import {
  DECIMAL_INPUT_PROPS,
  focusTarget,
  formatDecimal,
  parseStudentNumber,
  useArmedAfter,
  useItemTop,
  useRevealAfterCommit,
  useScreenTop,
} from '@shared/utils';

import { HEILDUN_ITEMS, PLOTS, SCALES, type HeildunItem, type NumericItem } from '../data/heildun';
import {
  R,
  activationEnergy,
  concentrationAt,
  halfLife,
  kFromHalfLife,
  timeToLeave,
  type Order,
} from '../engine/rate-laws';

interface Props {
  onBack: () => void;
}

/** Three significant figures, with a decimal comma. */
export const sig3 = (x: number) => formatDecimal(Number(x.toPrecision(3)));

const isNumeric = (item: HeildunItem): item is NumericItem =>
  item.kind !== 'graf' && item.kind !== 'tvofalt';

/** The key of a numeric item, in the unit it is typed in. */
export function numericAnswer(item: NumericItem): number {
  switch (item.kind) {
    case 'timi':
      return timeToLeave(item.left, item.k);
    case 'styrkur':
      return concentrationAt(item.t, item.A0, item.k, item.order);
    case 'helmingun':
      return halfLife(item.A0, item.k, item.order);
    case 'hradafasti':
      return kFromHalfLife(item.tHalf) / item.scale;
    case 'eftir':
      return 100 * concentrationAt(item.t, 1, item.k, 1);
    case 'virkjun':
      return activationEnergy(item.k1, item.T1, item.k2, item.T2) / 1000;
  }
}

/** The key of any item: a number, or the text of the right option. */
export function answerOf(item: HeildunItem): number | string {
  if (isNumeric(item)) return numericAnswer(item);
  if (item.kind === 'graf') return PLOTS[item.order];
  const ratio = halfLife(2, 1, item.order) / halfLife(1, 1, item.order);
  return ratio === 1 ? SCALES[0] : ratio === 2 ? SCALES[1] : SCALES[2];
}

export const optionsOf = (item: HeildunItem): readonly string[] =>
  item.kind === 'graf' ? [PLOTS[0], PLOTS[1], PLOTS[2]] : item.kind === 'tvofalt' ? SCALES : [];

/** 3 % for an activation energy, so the book's two-figure answer is right; 1 % otherwise. */
export const toleranceOf = (item: NumericItem) => (item.kind === 'virkjun' ? 0.03 : 0.01);

export function closeTo(value: number, key: number, tolerance: number): boolean {
  return Number.isFinite(value) && Math.abs(value - key) <= Math.abs(key) * tolerance;
}

/** The slip behind a wrong number, where it can be told. */
export function numberSlip(item: NumericItem, value: number): string | null {
  const key = numericAnswer(item);
  const near = (x: number) => closeTo(value, x, toleranceOf(item));
  switch (item.kind) {
    case 'timi':
      return near(timeToLeave(1 - item.left, item.k))
        ? `Eftir eru ${formatDecimal(100 * item.left)} %, ekki ${formatDecimal(100 - 100 * item.left)} %: ln([A]/[A]₀) = ln ${formatDecimal(item.left)}.`
        : null;
    case 'styrkur':
      return near(concentrationAt(item.t, item.A0, item.k, 1))
        ? 'Þetta er fyrsta stigs jafnan. Hvarfið er annars stigs: 1/[A] = 1/[A]₀ + kt.'
        : null;
    case 'helmingun':
      return near(halfLife(item.A0, item.k, 1))
        ? 'Þetta er helmingunartími fyrsta stigs, ln 2/k. Hvarfið er annars stigs: t½ = 1/(k[A]₀).'
        : null;
    case 'hradafasti':
      return null;
    case 'eftir':
      return near(100 - key) ? 'Þetta er hlutinn sem hefur hvarfast, ekki sá sem er eftir.' : null;
    case 'virkjun':
      if (near(key * 1000)) return 'Þetta er Ea í J/mól. Deildu með 1000 fyrir kJ/mól.';
      if (near(key / Math.LN10))
        return 'Þú notaðir log, en jafnan notar náttúrlega lógaritmann ln.';
      if (near(-key))
        return 'Formerkið snýst við: k₂ á að fylgja T₂, og hærra hitastig gefur stærra k.';
      return null;
  }
}

const sci = (x: number) => {
  const exp = Math.floor(Math.log10(Math.abs(x)));
  if (exp >= -2 && exp <= 3) return sig3(x);
  const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
  const e = String(Math.abs(exp))
    .split('')
    .map((d) => SUP[Number(d)])
    .join('');
  return `${sig3(x / 10 ** exp)} × 10${exp < 0 ? '⁻' : ''}${e}`;
};

/** The working shown after an answer. */
export function working(item: HeildunItem): string[] {
  switch (item.kind) {
    case 'timi':
      return [
        'Fyrsta stigs: ln([A]/[A]₀) = −kt, svo t = −ln([A]/[A]₀)/k.',
        `t = −ln ${formatDecimal(item.left)} / ${sci(item.k)} s⁻¹ = ${sig3(numericAnswer(item))} s.`,
      ];
    case 'styrkur':
      return [
        'Annars stigs: 1/[A] = 1/[A]₀ + kt.',
        `1/[A] = 1/${formatDecimal(item.A0, 3)} + ${sci(item.k)} × ${formatDecimal(item.t, 1)} = ${sig3(1 / numericAnswer(item))} L/mól, svo [A] = ${sig3(numericAnswer(item))} M.`,
      ];
    case 'helmingun':
      return [
        'Annars stigs: t½ = 1/(k[A]₀). Helmingunartíminn fer eftir upphafsstyrknum.',
        `t½ = 1/(${sci(item.k)} × ${formatDecimal(item.A0, 3)}) = ${sig3(numericAnswer(item))} mín.`,
      ];
    case 'hradafasti':
      return [
        'Fyrsta stigs: t½ = ln 2/k, svo k = ln 2/t½.',
        `k = 0,693 / ${sci(item.tHalf)} s = ${sci(numericAnswer(item) * item.scale)} s⁻¹.`,
      ];
    case 'eftir':
      return [
        'Fyrsta stigs: [A]/[A]₀ = e^(−kt).',
        `t = 0,75 klst. = ${formatDecimal(item.t)} s, svo [A]/[A]₀ = e^(−${sci(item.k)} × ${formatDecimal(item.t)}) = ${sig3(numericAnswer(item) / 100)}, um ${sig3(numericAnswer(item))} %.`,
      ];
    case 'virkjun':
      return [
        'Tveggja punkta form Arrheniusarjöfnunnar: ln(k₂/k₁) = (Ea/R)(1/T₁ − 1/T₂).',
        `Ea = ${formatDecimal(R)} J/(mól·K) × ln(${sci(item.k2)}/${sci(item.k1)}) / (1/${item.T1} − 1/${item.T2}) = ${sig3(numericAnswer(item))} kJ/mól.`,
      ];
    case 'graf':
      return [
        'Núllta stigs: [A] á móti t er bein lína. Fyrsta stigs: ln[A] á móti t. Annars stigs: 1/[A] á móti t.',
        'Hallatala beinu línunnar er −k fyrir núllta og fyrsta stig og k fyrir annað stig.',
      ];
    case 'tvofalt':
      return [
        'Fyrsta stigs: t½ = ln 2/k. Upphafsstyrkurinn kemur hvergi fyrir, svo helmingunartíminn er sá sami hver sem hann er.',
        'Núllta stigs tvöfaldast t½ = [A]₀/(2k) með [A]₀, og annars stigs helmingast t½ = 1/(k[A]₀).',
      ];
  }
}

function Kanna() {
  const [order, setOrder] = useState<Order>(1);
  const [a0, setA0] = useState(1);
  const k = order === 0 ? 0.05 : 0.1;
  const tHalf = halfLife(a0, k, order);
  const unitK = order === 0 ? 'M/s' : order === 1 ? 's⁻¹' : 'L/(mól·s)';
  return (
    <section
      aria-labelledby="heildun-kanna"
      className="space-y-3 rounded-xl border border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50 p-4 phone:p-3"
    >
      <h3 id="heildun-kanna" className="text-lg font-bold text-teal-800">
        Kannaðu: helmingunartími og upphafsstyrkur
      </h3>
      <fieldset>
        <legend className="mb-1 text-sm font-semibold text-teal-900">Stig hvarfsins</legend>
        <div className="flex flex-wrap gap-2">
          {([0, 1, 2] as const).map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => setOrder(o)}
              aria-pressed={o === order}
              className={`rounded-lg border-2 px-3 py-1.5 text-sm pointer-coarse:min-h-11 ${
                o === order
                  ? 'border-teal-700 bg-teal-700 text-white'
                  : 'border-teal-300 bg-white text-teal-900 hover:bg-teal-100'
              }`}
            >
              {['Núllta stigs', 'Fyrsta stigs', 'Annars stigs'][o]}
            </button>
          ))}
        </div>
      </fieldset>
      <div>
        <label htmlFor="heildun-a0" className="block text-sm font-semibold text-teal-900">
          Upphafsstyrkur [A]₀: {formatDecimal(a0, 2)} M
        </label>
        <input
          id="heildun-a0"
          type="range"
          min={0.25}
          max={2}
          step={0.25}
          value={a0}
          onChange={(e) => setA0(Number(e.target.value))}
          aria-valuetext={`${formatDecimal(a0, 2)} M`}
          className="w-full"
        />
      </div>
      <p aria-live="polite" className="text-sm text-warm-900">
        k = {formatDecimal(k, 2)} {unitK}. Helmingunartími: <strong>{sig3(tHalf)} s</strong>. Næsti
        helmingur tekur {sig3(halfLife(a0 / 2, k, order))} s.
      </p>
      <p className="text-sm text-warm-700">
        Færðu upphafsstyrkinn við hvert stig. Aðeins við fyrsta stig stendur helmingunartíminn í
        stað; þess vegna er hann notaður um geislavirkar samsætur.
      </p>
    </section>
  );
}

export function HeildunScreen({ onBack }: Props) {
  const [phase, setPhase] = useState<'skilja' | 'aefa'>('skilja');
  const titleRef = useRef<HTMLHeadingElement>(null);
  const startRef = useRef<HTMLHeadingElement>(null);
  useScreenTop(phase, { anyWidth: true, focus: phase === 'skilja' ? titleRef : startRef });
  useLayoutEffect(() => {
    focusTarget(titleRef.current);
  }, []);

  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState('');
  const [chosen, setChosen] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<'rett' | 'rangt' | null>(null);
  const [slip, setSlip] = useState<string | null>(null);
  const [invalid, setInvalid] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const item = index < HEILDUN_ITEMS.length ? HEILDUN_ITEMS[index] : null;

  const cardRef = useItemTop<HTMLDivElement>(index);
  const questionRef = useRef<HTMLDivElement>(null);
  const answerRef = useRef<HTMLDivElement>(null);
  const verdictRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  useRevealAfterCommit(outcome !== null, () => ({
    bottom: nextRef.current,
    tops: [questionRef.current, answerRef.current, verdictRef.current],
    focus: verdictRef.current,
  }));
  const armed = useArmedAfter(400, `${index}:${outcome !== null}`);
  const verdictId = useId();

  const commit = (right: boolean, why: string | null) => {
    setOutcome(right ? 'rett' : 'rangt');
    setSlip(right ? null : why);
    if (right) setCorrect((n) => n + 1);
  };
  const check = () => {
    if (!item || outcome !== null || !isNumeric(item)) return;
    const value = parseStudentNumber(typed);
    if (!Number.isFinite(value)) {
      setInvalid(`Skrifaðu svarið sem tölu í ${item.unit}, t.d. 12,5.`);
      return;
    }
    setInvalid(null);
    commit(closeTo(value, numericAnswer(item), toleranceOf(item)), numberSlip(item, value));
  };
  const choose = (value: string) => {
    if (!item || outcome !== null) return;
    setChosen(value);
    commit(value === answerOf(item), null);
  };
  const clear = () => {
    setTyped('');
    setChosen(null);
    setOutcome(null);
    setSlip(null);
    setInvalid(null);
  };
  const next = () => {
    clear();
    setIndex((i) => i + 1);
  };
  const restart = () => {
    clear();
    setCorrect(0);
    setIndex(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100">
      <Header
        variant="game"
        gameTitle="Hvarfhraði"
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
            Heildað hraðalögmál og Arrhenius
          </h2>

          {phase === 'skilja' ? (
            <>
              <section
                aria-labelledby="heildun-log"
                className="space-y-2 rounded-xl bg-blue-50 p-4 phone:p-3"
              >
                <h3 id="heildun-log" className="text-lg font-bold text-blue-800">
                  Heildaða hraðalögmálið
                </h3>
                <p className="text-sm text-blue-900">
                  Hraðalögmálið segir hve hratt [A] breytist. Heildaða hraðalögmálið segir hver [A]
                  er eftir tímann t, og hvert stig hefur sitt:
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-blue-900">
                    <thead>
                      <tr>
                        <th className="pr-3 font-semibold">Stig</th>
                        <th className="pr-3 font-semibold">Heildað hraðalögmál</th>
                        <th className="pr-3 font-semibold">Bein lína</th>
                        <th className="font-semibold">t½</th>
                      </tr>
                    </thead>
                    <tbody className="font-mono">
                      <tr>
                        <td className="pr-3 font-sans">0</td>
                        <td className="pr-3">[A] = [A]₀ − kt</td>
                        <td className="pr-3">{PLOTS[0]}</td>
                        <td>[A]₀/(2k)</td>
                      </tr>
                      <tr>
                        <td className="pr-3 font-sans">1</td>
                        <td className="pr-3">ln[A] = ln[A]₀ − kt</td>
                        <td className="pr-3">{PLOTS[1]}</td>
                        <td>ln 2/k</td>
                      </tr>
                      <tr>
                        <td className="pr-3 font-sans">2</td>
                        <td className="pr-3">1/[A] = 1/[A]₀ + kt</td>
                        <td className="pr-3">{PLOTS[2]}</td>
                        <td>1/(k[A]₀)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-blue-900">
                  Stig hvarfs má lesa af mæligögnum: það grafið sem er bein lína segir stigið, og
                  hallatala þess gefur k.
                </p>
              </section>

              <Kanna />

              <section
                aria-labelledby="heildun-arrhenius"
                className="space-y-2 rounded-xl bg-amber-50 p-4 phone:p-3"
              >
                <h3 id="heildun-arrhenius" className="text-lg font-bold text-amber-800">
                  Arrheniusarjafnan
                </h3>
                <p className="text-sm text-amber-900">
                  Hraðafastinn vex með hitastigi: k = A·e^(−Ea/RT), þar sem Ea er virkjunarorkan, R
                  = {formatDecimal(R)} J/(mól·K) og T í kelvin. Með k mælt við tvö hitastig má finna
                  Ea án A:
                </p>
                <p className="text-center font-mono text-amber-900">
                  ln(k₂/k₁) = (Ea/R)·(1/T₁ − 1/T₂)
                </p>
                <p className="text-sm text-amber-900">
                  Ea kemur í J/mól; deildu með 1000 fyrir kJ/mól. Hitastigið verður að vera í
                  kelvin.
                </p>
              </section>

              <p className="text-xs text-warm-600">
                Heimild: Efnafræði 2e, kafli 12, „Heilduð hraðalögmál“ og „Árekstrakenningin“.
                Tölurnar í æfingunum eru úr sýnidæmum og æfingum bókarinnar.
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
            <section aria-labelledby="heildun-aefa" className="space-y-3">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <h3 id="heildun-aefa" className="text-lg font-bold text-warm-800">
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
                  <div ref={questionRef} className="space-y-2">
                    <p className="text-sm text-warm-500">
                      Spurning {index + 1} af {HEILDUN_ITEMS.length}
                    </p>
                    <p className="text-sm text-warm-700">{item.setting}</p>
                    <h4
                      ref={startRef}
                      data-item-start
                      tabIndex={-1}
                      className="text-lg font-bold text-warm-800"
                    >
                      {item.question}
                    </h4>
                  </div>

                  {isNumeric(item) ? (
                    <div ref={answerRef} className="flex flex-wrap items-center gap-2">
                      <input
                        {...DECIMAL_INPUT_PROPS}
                        autoComplete="off"
                        value={typed}
                        onChange={(e) => setTyped(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key !== 'Enter') return;
                          e.preventDefault();
                          check();
                        }}
                        enterKeyHint="done"
                        disabled={outcome !== null}
                        aria-label={`Svar í ${item.unit}`}
                        className="w-36 min-w-0 rounded-lg border-2 border-warm-300 px-3 py-2 text-center font-mono text-lg disabled:bg-warm-100"
                      />
                      <span className="font-mono text-warm-700">{item.unit}</span>
                    </div>
                  ) : (
                    <div ref={answerRef} className="grid gap-2">
                      {optionsOf(item).map((value) => {
                        const isKey = outcome !== null && value === answerOf(item);
                        const isPicked = chosen === value;
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => choose(value)}
                            aria-disabled={outcome !== null}
                            aria-pressed={isPicked}
                            className={`rounded-lg border-2 px-3 py-2 text-left pointer-coarse:min-h-11 ${
                              isKey
                                ? 'border-green-600 bg-green-50 text-green-900'
                                : isPicked
                                  ? 'border-red-500 bg-red-50 text-red-900'
                                  : 'border-warm-300 bg-white text-warm-900 hover:bg-warm-50'
                            }`}
                          >
                            {value}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {outcome === null ? (
                    isNumeric(item) && (
                      <>
                        {invalid && (
                          <p role="alert" className="text-sm font-semibold text-amber-800">
                            {invalid}
                          </p>
                        )}
                        <button
                          type="button"
                          onClick={check}
                          className="game-btn w-full rounded-lg bg-kvenno-orange px-4 py-3 font-semibold text-white hover:bg-kvenno-orange-600"
                        >
                          Athuga
                        </button>
                      </>
                    )
                  ) : (
                    <>
                      <div
                        ref={verdictRef}
                        role="group"
                        tabIndex={-1}
                        aria-labelledby={verdictId}
                        className={`space-y-2 rounded-lg border-2 p-3 ${
                          outcome === 'rett'
                            ? 'border-green-500 bg-green-50 text-green-900'
                            : 'border-red-400 bg-red-50 text-red-900'
                        }`}
                      >
                        <p id={verdictId} className="font-bold">
                          {outcome === 'rett'
                            ? 'Rétt!'
                            : isNumeric(item)
                              ? `Ekki rétt. Svarið er ${sig3(numericAnswer(item))} ${item.unit}.`
                              : `Ekki rétt. Svarið er: ${answerOf(item)}.`}
                        </p>
                        {slip && <p className="text-sm">{slip}</p>}
                        <ul className="space-y-1 text-sm">
                          {working(item).map((line) => (
                            <li key={line}>{line}</li>
                          ))}
                        </ul>
                        <p className="text-xs opacity-80">Heimild: {item.source}.</p>
                      </div>
                      <button
                        ref={nextRef}
                        type="button"
                        onClick={armed(next)}
                        className="game-btn w-full rounded-lg bg-teal-700 px-4 py-3 font-semibold text-white hover:bg-teal-800"
                      >
                        {index + 1 < HEILDUN_ITEMS.length ? 'Næsta spurning →' : 'Sjá niðurstöðu →'}
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
                    {correct} af {HEILDUN_ITEMS.length} rétt
                  </h4>
                  <p className="text-sm text-green-900">
                    Heildaða hraðalögmálið segir hvað er eftir eftir tímann t, og Arrheniusarjafnan
                    hvernig hitastig breytir k.
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
