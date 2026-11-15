/**
 * Samþynningareiginleikar: vapour-pressure lowering, boiling-point elevation, freezing-point
 * depression and osmotic pressure (book ch. 11.4, m68783). Skilja and an ungraded Kanna come
 * first, then Æfa: ten items from the book, one attempt each, ending `N af M rétt` with no
 * running score. Every number key is worked out by `engine/lausnir.ts`; a wrong answer shows the
 * working and, where it can be told, the slip behind it.
 */

import { useId, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { Header } from '@shared/components';
import {
  DECIMAL_INPUT_PROPS,
  focusTarget,
  formatDecimal,
  molarMassOf,
  parseStudentNumber,
  shuffleArray,
  useArmedAfter,
  useItemTop,
  useRevealAfterCommit,
  useScreenTop,
} from '@shared/utils';

import { LAUSNIR_ITEMS, type LausnirItem, type NumericItem, type PointItem } from '../data/lausnir';
import {
  R_ATM,
  SOLVENTS,
  boilingPoint,
  freezingPoint,
  molality,
  osmoticPressure,
  raoult,
} from '../engine/lausnir';

interface Props {
  onBack: () => void;
}

/** Three significant figures, with a decimal comma. */
export const sig3 = (x: number) => formatDecimal(Number(x.toPrecision(3)));

const isNumeric = (item: LausnirItem): item is NumericItem => item.kind !== 'val';

/** The molality of a boiling- or freezing-point item, given or from the masses. */
export function molalityOf(item: PointItem): number {
  if (item.m !== undefined) return item.m;
  if (!item.solute || item.solventGrams === undefined) throw new Error(`${item.id} has no amount`);
  return molality(item.solute.grams / molarMassOf(item.solute.formula), item.solventGrams);
}

const pointWith = (item: PointItem, i: number) =>
  item.kind === 'sudumark'
    ? boilingPoint(item.solvent, molalityOf(item), i)
    : freezingPoint(item.solvent, molalityOf(item), i);

/** The key of a numeric item, in its unit. */
export function numericAnswer(item: NumericItem): number {
  switch (item.kind) {
    case 'raoult':
      return raoult(
        item.solvent.grams / molarMassOf(item.solvent.formula),
        item.solute.grams / molarMassOf(item.solute.formula),
        item.pure
      );
    case 'sudumark':
    case 'frostmark':
      return pointWith(item, item.i);
    case 'osmosa':
      return osmoticPressure(item.M, item.celsius);
  }
}

/** The key of any item: a number, or the text of the right option. */
export function answerOf(item: LausnirItem): number | string {
  return isNumeric(item) ? numericAnswer(item) : item.options[0].text;
}

/**
 * Whether a typed number is right. A boiling or freezing point is graded on its change, within
 * 5 %, since 1 % of 80 °C would pass the pure solvent's own boiling point; the rest within 1 %,
 * or 0,5 % for a vapour pressure, so the pure solvent's is refused.
 */
export function isRight(item: NumericItem, value: number): boolean {
  if (!Number.isFinite(value)) return false;
  const key = numericAnswer(item);
  if (item.kind === 'sudumark' || item.kind === 'frostmark') {
    const start =
      item.kind === 'sudumark' ? SOLVENTS[item.solvent].boils : SOLVENTS[item.solvent].freezes;
    return Math.abs(value - key) <= Math.abs(key - start) * 0.05;
  }
  return Math.abs(value - key) <= Math.abs(key) * (item.kind === 'raoult' ? 0.005 : 0.01);
}

/** The slip behind a wrong number, where it can be told. */
export function numberSlip(item: NumericItem, value: number): string | null {
  const key = numericAnswer(item);
  const near = (x: number) =>
    Number.isFinite(x) && Math.abs(value - x) <= Math.abs(x) * 0.01 + 0.005;
  switch (item.kind) {
    case 'raoult': {
      if (near(item.pure - key))
        return 'Þetta er lækkun gufunarþrýstingsins. Spurt er um gufunarþrýsting lausnarinnar sjálfrar.';
      const massShare = item.solvent.grams / (item.solvent.grams + item.solute.grams);
      if (near(massShare * item.pure))
        return 'Þú notaðir massahlutfall. Lögmál Raoults notar mólbrot: breyttu grömmunum fyrst í mól.';
      return null;
    }
    case 'sudumark':
    case 'frostmark': {
      const solvent = SOLVENTS[item.solvent];
      const start = item.kind === 'sudumark' ? solvent.boils : solvent.freezes;
      const change = Math.abs(key - start);
      if (near(change) || near(-change))
        return item.kind === 'sudumark'
          ? `Þetta er hækkunin, ΔTb. Bættu henni við suðumark hreins leysis, ${formatDecimal(solvent.boils)} °C.`
          : `Þetta er lækkunin, ΔTf. Dragðu hana frá frostmarki hreins leysis, ${formatDecimal(solvent.freezes)} °C.`;
      if (item.i > 1 && near(pointWith(item, 1)))
        return `Hver formúlueining gefur ${item.i} jónir, svo i = ${item.i}. Án hans færðu breytinguna fyrir eina ögn.`;
      return null;
    }
    case 'osmosa':
      return near(item.M * R_ATM * item.celsius)
        ? 'Hitastigið á að vera í kelvin: 37 °C = 310,15 K.'
        : null;
  }
}

/** The working shown after an answer. */
export function working(item: LausnirItem): string[] {
  switch (item.kind) {
    case 'raoult': {
      const nSolvent = item.solvent.grams / molarMassOf(item.solvent.formula);
      const nSolute = item.solute.grams / molarMassOf(item.solute.formula);
      const X = nSolvent / (nSolvent + nSolute);
      return [
        `Mól leysis: ${sig3(nSolvent)} mól. Mól uppleysts efnis: ${sig3(nSolute)} mól.`,
        `Mólbrot leysisins: X = ${sig3(nSolvent)} / (${sig3(nSolvent)} + ${sig3(nSolute)}) = ${sig3(X)}.`,
        `Lögmál Raoults: P = X · P° = ${sig3(X)} × ${formatDecimal(item.pure)} = ${sig3(numericAnswer(item))} ${item.unit}.`,
      ];
    }
    case 'sudumark':
    case 'frostmark': {
      const solvent = SOLVENTS[item.solvent];
      const m = molalityOf(item);
      const lines: string[] = [];
      if (item.solute && item.solventGrams !== undefined) {
        const n = item.solute.grams / molarMassOf(item.solute.formula);
        lines.push(
          `n = ${formatDecimal(item.solute.grams)} g / ${formatDecimal(molarMassOf(item.solute.formula), 2)} g/mól = ${sig3(n)} mól, svo m = ${sig3(n)} mól / ${formatDecimal(item.solventGrams / 1000, 3)} kg = ${sig3(m)} m.`
        );
      }
      const K = item.kind === 'sudumark' ? solvent.Kb : solvent.Kf;
      const change = item.i * K * m;
      lines.push(
        item.kind === 'sudumark'
          ? `ΔTb = ${item.i > 1 ? `i · ` : ''}Kb · m = ${item.i > 1 ? `${item.i} × ` : ''}${formatDecimal(K)} °C/m × ${sig3(m)} m = ${sig3(change)} °C.`
          : `ΔTf = ${item.i > 1 ? `i · ` : ''}Kf · m = ${item.i > 1 ? `${item.i} × ` : ''}${formatDecimal(K)} °C/m × ${sig3(m)} m = ${sig3(change)} °C.`,
        item.kind === 'sudumark'
          ? `Suðumark: ${formatDecimal(solvent.boils)} °C + ${sig3(change)} °C = ${formatDecimal(numericAnswer(item), 2)} °C.`
          : `Frostmark: ${formatDecimal(solvent.freezes)} °C − ${sig3(change)} °C = ${sig3(numericAnswer(item))} °C.`
      );
      return lines;
    }
    case 'osmosa':
      return [
        `Π = M · R · T, með T í kelvin: ${formatDecimal(item.celsius)} °C = ${formatDecimal(item.celsius + 273.15)} K.`,
        `Π = ${formatDecimal(item.M)} mól/L × ${formatDecimal(R_ATM)} L·atm/(mól·K) × ${formatDecimal(item.celsius + 273.15)} K = ${sig3(numericAnswer(item))} atm.`,
      ];
    case 'val':
      return [...item.why];
  }
}

const KANNA_SOLUTES = [
  { id: 'sukrosi', name: 'Súkrósi', i: 1 },
  { id: 'nacl', name: 'NaCl', i: 2 },
  { id: 'cacl2', name: 'CaCl₂', i: 3 },
] as const;

/** Water with a solute in it: the particle molality moves the boiling and freezing points. */
function Kanna() {
  const [solute, setSolute] = useState<(typeof KANNA_SOLUTES)[number]['id']>('sukrosi');
  const [m, setM] = useState(1);
  const i = KANNA_SOLUTES.find((s) => s.id === solute)!.i;
  const bp = boilingPoint('vatn', m, i);
  const fp = freezingPoint('vatn', m, i);
  return (
    <section
      aria-labelledby="lausnir-kanna"
      className="space-y-3 rounded-xl border border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50 p-4 phone:p-3"
    >
      <h3 id="lausnir-kanna" className="text-lg font-bold text-teal-800">
        Kannaðu: efni leyst í vatni
      </h3>
      <fieldset>
        <legend className="mb-1 text-sm font-semibold text-teal-900">Uppleyst efni</legend>
        <div className="flex flex-wrap gap-2">
          {KANNA_SOLUTES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSolute(s.id)}
              aria-pressed={s.id === solute}
              className={`rounded-lg border-2 px-3 py-1.5 text-sm pointer-coarse:min-h-11 ${
                s.id === solute
                  ? 'border-teal-700 bg-teal-700 text-white'
                  : 'border-teal-300 bg-white text-teal-900 hover:bg-teal-100'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      </fieldset>
      <div>
        <label htmlFor="lausnir-m" className="block text-sm font-semibold text-teal-900">
          Mólalstyrkur: {formatDecimal(m, 1)} m
        </label>
        <input
          id="lausnir-m"
          type="range"
          min={0}
          max={2}
          step={0.1}
          value={m}
          onChange={(e) => setM(Number(e.target.value))}
          aria-valuetext={`${formatDecimal(m, 1)} m`}
          className="w-full"
        />
      </div>
      <p aria-live="polite" className="text-sm text-warm-900">
        Agnir í hverju kg af vatni: {i} × {formatDecimal(m, 1)} = {formatDecimal(i * m, 1)} mól.
        Suðumark <strong>{formatDecimal(bp, 2)} °C</strong>, frostmark{' '}
        <strong>{formatDecimal(fp, 2)} °C</strong>.
      </p>
      <p className="text-sm text-warm-700">
        Berðu saman súkrósa og NaCl við sama mólalstyrk: NaCl gefur tvær agnir á hverja
        formúlueiningu og breytir báðum mörkunum tvöfalt meira. Frostmarkið færist meira en
        suðumarkið, því Kf vatns er stærri en Kb.
      </p>
    </section>
  );
}

export function LausnirScreen({ onBack }: Props) {
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
  const item = index < LAUSNIR_ITEMS.length ? LAUSNIR_ITEMS[index] : null;
  const options = useMemo(
    () => (item && item.kind === 'val' ? shuffleArray([...item.options]) : []),
    [item]
  );

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
    commit(isRight(item, value), numberSlip(item, value));
  };
  const choose = (text: string) => {
    if (!item || item.kind !== 'val' || outcome !== null) return;
    setChosen(text);
    commit(text === answerOf(item), item.options.find((o) => o.text === text)?.slip ?? null);
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
        gameTitle="Millisameindakraftar"
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
            Samþynningareiginleikar
          </h2>

          {phase === 'skilja' ? (
            <>
              <section
                aria-labelledby="lausnir-agnir"
                className="space-y-2 rounded-xl bg-blue-50 p-4 phone:p-3"
              >
                <h3 id="lausnir-agnir" className="text-lg font-bold text-blue-800">
                  Fjöldi agna ræður
                </h3>
                <p className="text-sm text-blue-900">
                  <strong>Samþynningareiginleikar</strong> lausnar ráðast aðeins af fjölda
                  uppleystra agna í tilteknu magni leysis, ekki af gerð þeirra. Þeir eru lækkun
                  gufunarþrýstings, hækkun suðumarks, lækkun frostmarks og osmósuþrýstingur.
                </p>
                <p className="text-sm text-blue-900">
                  Styrkurinn er oftast <strong>mólalstyrkur</strong>, m: mól uppleysts efnis í
                  hverju kílógrammi leysis. Rafkleyfi gefur fleiri agnir en formúlueiningarnar:{' '}
                  <strong>van &apos;t Hoff-stuðullinn</strong>, i, er 1 fyrir súkrósa, 2 fyrir NaCl
                  og 3 fyrir CaCl₂ við fullkomna sundrun.
                </p>
              </section>

              <section
                aria-labelledby="lausnir-raoult"
                className="space-y-2 rounded-xl bg-cyan-50 p-4 phone:p-3"
              >
                <h3 id="lausnir-raoult" className="text-lg font-bold text-cyan-800">
                  Gufunarþrýstingur og lögmál Raoults
                </h3>
                <p className="text-sm text-cyan-900">
                  Órokgjarnar agnir við yfirborðið hindra leysisameindirnar í að gufa upp, svo
                  gufunarþrýstingurinn lækkar. Lögmál Raoults segir, með X mólbrot leysisins og P°
                  gufunarþrýsting hreins leysis,
                </p>
                <p className="text-center font-mono text-cyan-900">P = X(leysis) · P°</p>
                <p className="text-sm text-cyan-900">
                  Lægri gufunarþrýstingur þýðir að lausnin þarf hærra hitastig til að sjóða, og hún
                  frýs við lægra hitastig:
                </p>
                <p className="text-center font-mono text-cyan-900">ΔTb = i · Kb · m</p>
                <p className="text-center font-mono text-cyan-900">ΔTf = i · Kf · m</p>
                <p className="text-sm text-cyan-900">
                  Kb og Kf eru fastar leysisins. Fyrir vatn eru þeir{' '}
                  {formatDecimal(SOLVENTS.vatn.Kb)} og {formatDecimal(SOLVENTS.vatn.Kf)} °C/m.
                </p>
              </section>

              <Kanna />

              <section
                aria-labelledby="lausnir-osmosa"
                className="space-y-2 rounded-xl bg-amber-50 p-4 phone:p-3"
              >
                <h3 id="lausnir-osmosa" className="text-lg font-bold text-amber-800">
                  Osmósa
                </h3>
                <p className="text-sm text-amber-900">
                  Í <strong>osmósu</strong> flæðir leysir gegnum hálfgegndræpa himnu úr þynnri lausn
                  yfir í þéttari. <strong>Osmósuþrýstingur</strong> er þrýstingurinn sem þarf til að
                  stöðva flæðið:
                </p>
                <p className="text-center font-mono text-amber-900">Π = i · M · R · T</p>
                <p className="text-sm text-amber-900">
                  með M mólstyrk, R = {formatDecimal(R_ATM)} L·atm/(mól·K) og T í kelvin. Blóðkorn í
                  þéttari lausn en sinni eigin missa vatn og skreppa saman; í þynnri lausn bólgna
                  þau.
                </p>
              </section>

              <p className="text-xs text-warm-600">
                Heimild: Efnafræði 2e, kafli 11, „Samþynningareiginleikar“. Tölurnar í æfingunum eru
                úr sýnidæmum og æfingum bókarinnar.
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
            <section aria-labelledby="lausnir-aefa" className="space-y-3">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <h3 id="lausnir-aefa" className="text-lg font-bold text-warm-800">
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
                      Spurning {index + 1} af {LAUSNIR_ITEMS.length}
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
                      {options.map(({ text }) => {
                        const isKey = outcome !== null && text === answerOf(item);
                        const isPicked = chosen === text;
                        return (
                          <button
                            key={text}
                            type="button"
                            onClick={() => choose(text)}
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
                            {text}
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
                        {index + 1 < LAUSNIR_ITEMS.length ? 'Næsta spurning →' : 'Sjá niðurstöðu →'}
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
                    {correct} af {LAUSNIR_ITEMS.length} rétt
                  </h4>
                  <p className="text-sm text-green-900">
                    Gufunarþrýstingur, suðumark, frostmark og osmósuþrýstingur lausnar fara öll
                    eftir fjölda uppleystra agna, ekki gerð þeirra.
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
