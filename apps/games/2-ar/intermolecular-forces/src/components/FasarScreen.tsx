/**
 * Fasabreytingar og fasarit: phase changes, heating curves and phase diagrams (book ch. 10.3,
 * m68768, and 10.4, m68769). Skilja and an ungraded Kanna come first, then Æfa: ten items from
 * the book, one attempt each, ending `N af M rétt` with no running score. Every number key is
 * worked out by `engine/fasar.ts`; a wrong answer shows the working and, where it can be told,
 * the slip behind it.
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

import { FASAR_ITEMS, type FasarItem, type NumericItem } from '../data/fasar';
import {
  WATER,
  closeTo,
  heatSteps,
  heatingCurve,
  meltHeat,
  stateAfter,
  totalHeat,
  vaporisationEnthalpy,
  type Step,
} from '../engine/fasar';

interface Props {
  onBack: () => void;
}

/** Three significant figures, with a decimal comma. */
export const sig3 = (x: number) => formatDecimal(Number(x.toPrecision(3)));

const isNumeric = (item: FasarItem): item is NumericItem => item.kind !== 'val';

/** The key of a numeric item, in its unit. */
export function numericAnswer(item: NumericItem): number {
  switch (item.kind) {
    case 'vatn': {
      const q = totalHeat(item.mass, item.t1, item.t2);
      return item.released ? -q : q;
    }
    case 'braedsla':
      return meltHeat(item.mass, molarMassOf(item.formula), item.fusion);
    case 'gufunarvermi':
      return vaporisationEnthalpy(item.t1, item.p1, item.t2, item.p2);
  }
}

/** The key of any item: a number, or the text of the right option. */
export function answerOf(item: FasarItem): number | string {
  return isNumeric(item) ? numericAnswer(item) : item.options[0].text;
}

/** The slip behind a wrong number, where it can be told. */
export function numberSlip(item: NumericItem, value: number): string | null {
  const key = numericAnswer(item);
  const near = (x: number) => closeTo(value, x);
  switch (item.kind) {
    case 'vatn': {
      const steps = heatSteps(item.mass, item.t1, item.t2);
      const sign = item.released ? -1 : 1;
      const warmOnly = sign * steps.filter((s) => s.kind === 'hitun').reduce((a, s) => a + s.q, 0);
      const changes = steps.filter((s) => s.kind === 'hamskipti');
      if (near(warmOnly))
        return 'Þú reiknaðir aðeins hitunina, q = m·c·ΔT. Hamskiptin taka líka varma: q = n·ΔH á hverri sléttu ferilsins.';
      for (const c of changes) {
        if (near(key - sign * c.q))
          return c.from === WATER.melts
            ? `Bræðslan gleymdist: ${sig3(Math.abs(c.q))} kJ við 0 °C.`
            : `Gufunin gleymdist: ${sig3(Math.abs(c.q))} kJ við 100 °C.`;
      }
      if (item.released && near(-key))
        return 'Spurt er um varmann sem losnar, svo svarið er jákvæð tala.';
      return null;
    }
    case 'braedsla':
      return near(item.mass * item.fusion)
        ? 'ΔH(bræðslu) er á mól. Breyttu massanum fyrst í mól með mólmassanum.'
        : null;
    case 'gufunarvermi':
      if (near(key * 1000)) return 'Þetta er ΔH í J/mól. Deildu með 1000 fyrir kJ/mól.';
      if (near(key / Math.LN10))
        return 'Þú notaðir log, en jafnan notar náttúrlega lógaritmann ln.';
      return null;
  }
}

const stepLine = (s: Step, mass: number): string => {
  const name = { ís: 'ís', vatn: 'vatn', gufa: 'gufu' }[s.phase];
  if (s.kind === 'hitun') {
    const c = s.phase === 'ís' ? WATER.cIce : s.phase === 'vatn' ? WATER.cWater : WATER.cSteam;
    return `${s.until > s.from ? 'Hita' : 'Kæla'} ${name} úr ${formatDecimal(s.from)} °C í ${formatDecimal(s.until)} °C: ${formatDecimal(mass)} g × ${formatDecimal(c, 3)} J/(g·°C) × ${formatDecimal(s.until - s.from)} °C = ${sig3(s.q)} kJ.`;
  }
  const n = mass / WATER.M;
  const verb = {
    ís: 'Bræða ísinn',
    vatn: s.to === 'gufa' ? 'Sjóða vatnið' : 'Frysta vatnið',
    gufa: 'Þétta gufuna',
  }[s.phase];
  const dH = s.from === WATER.melts ? WATER.fusion : WATER.vaporisation;
  return `${verb} við ${formatDecimal(s.from)} °C: ${sig3(n)} mól × ${s.q < 0 ? '−' : ''}${formatDecimal(dH)} kJ/mól = ${sig3(s.q)} kJ.`;
};

/** The working shown after an answer. */
export function working(item: FasarItem): string[] {
  switch (item.kind) {
    case 'vatn': {
      const q = totalHeat(item.mass, item.t1, item.t2);
      return [
        `n = ${formatDecimal(item.mass)} g / ${formatDecimal(WATER.M, 2)} g/mól = ${sig3(item.mass / WATER.M)} mól.`,
        ...heatSteps(item.mass, item.t1, item.t2).map((s) => stepLine(s, item.mass)),
        item.released
          ? `Samtals ${sig3(q)} kJ: vatnið gefur frá sér ${sig3(-q)} kJ.`
          : `Samtals ${sig3(q)} kJ.`,
      ];
    }
    case 'braedsla': {
      const M = molarMassOf(item.formula);
      return [
        `M(TiCl₄) = ${formatDecimal(M, 2)} g/mól, svo n = ${formatDecimal(item.mass)} g / ${formatDecimal(M, 2)} g/mól = ${sig3(item.mass / M)} mól.`,
        `q = n · ΔH(bræðslu) = ${sig3(item.mass / M)} mól × ${formatDecimal(item.fusion)} kJ/mól = ${sig3(numericAnswer(item))} kJ.`,
      ];
    }
    case 'gufunarvermi':
      return [
        'Clausius-Clapeyron: ln(P₂/P₁) = (ΔH/R)·(1/T₁ − 1/T₂), með T í kelvin.',
        `T₁ = ${formatDecimal(item.t1 + 273.15)} K og T₂ = ${formatDecimal(item.t2 + 273.15)} K.`,
        `ΔH = 8,314 J/(mól·K) × ln(${formatDecimal(item.p2)}/${formatDecimal(item.p1)}) / (1/T₁ − 1/T₂) = ${sig3(numericAnswer(item))} kJ/mól.`,
      ];
    case 'val':
      return [...item.why];
  }
}

const KANNA_MASS = 100;
const KANNA_FROM = -20;
const KANNA_TO = 120;

/** The heating curve of 100 g of ice, with a marker at the heat added so far. */
function Kanna() {
  const total = totalHeat(KANNA_MASS, KANNA_FROM, KANNA_TO);
  const [added, setAdded] = useState(0);
  const state = stateAfter(KANNA_MASS, KANNA_FROM, KANNA_TO, added);
  const points = heatingCurve(KANNA_MASS, KANNA_FROM, KANNA_TO);
  const W = 320;
  const H = 180;
  const x = (q: number) => 30 + (q / total) * (W - 40);
  const y = (t: number) => H - 20 - ((t - KANNA_FROM) / (KANNA_TO - KANNA_FROM)) * (H - 35);
  const plateau =
    state.ice > 0 && state.water > 0
      ? 'bráðnar'
      : state.water > 0 && state.steam > 0
        ? 'sýður'
        : null;
  return (
    <section
      aria-labelledby="fasar-kanna"
      className="space-y-3 rounded-xl border border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50 p-4 phone:p-3"
    >
      <h3 id="fasar-kanna" className="text-lg font-bold text-teal-800">
        Kannaðu: hitunarferill vatns
      </h3>
      <p className="text-sm text-teal-900">
        {KANNA_MASS} g af ís við {KANNA_FROM} °C eru hituð jafnt og þétt. Bættu við varma og fylgstu
        með hitastiginu.
      </p>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full max-w-md"
        role="img"
        aria-label={`Hitunarferill: hitastig á móti varma. Nú ${formatDecimal(state.t, 1)} °C eftir ${formatDecimal(added)} kJ.`}
      >
        <line x1={30} y1={H - 20} x2={W - 5} y2={H - 20} stroke="#78716c" />
        <line x1={30} y1={10} x2={30} y2={H - 20} stroke="#78716c" />
        {[0, 100].map((t) => (
          <g key={t}>
            <line x1={30} y1={y(t)} x2={W - 5} y2={y(t)} stroke="#d6d3d1" strokeDasharray="3 3" />
            <text x={26} y={y(t) + 4} textAnchor="end" fontSize={10} fill="#57534e">
              {t}
            </text>
          </g>
        ))}
        <text x={W - 5} y={H - 6} textAnchor="end" fontSize={10} fill="#57534e">
          varmi (kJ)
        </text>
        <text x={34} y={18} fontSize={10} fill="#57534e">
          °C
        </text>
        <polyline
          points={points.map((p) => `${x(p.q)},${y(p.t)}`).join(' ')}
          fill="none"
          stroke="#0f766e"
          strokeWidth={2.5}
        />
        <circle cx={x(added)} cy={y(state.t)} r={6} fill="#f36b22" stroke="white" strokeWidth={2} />
      </svg>
      <div>
        <label htmlFor="fasar-varmi" className="block text-sm font-semibold text-teal-900">
          Varmi bætt við: {formatDecimal(added)} kJ
        </label>
        <input
          id="fasar-varmi"
          type="range"
          min={0}
          max={Math.floor(total)}
          step={1}
          value={added}
          onChange={(e) => setAdded(Number(e.target.value))}
          aria-valuetext={`${formatDecimal(added)} kJ`}
          className="w-full"
        />
      </div>
      <p aria-live="polite" className="text-sm text-warm-900">
        Hitastig: <strong>{formatDecimal(state.t, 1)} °C</strong>. Ís {formatDecimal(state.ice, 0)}{' '}
        g, vatn {formatDecimal(state.water, 0)} g, gufa {formatDecimal(state.steam, 0)} g.
        {plateau && ` Vatnið ${plateau}: hitastigið stendur í stað meðan varminn fer í hamskiptin.`}
      </p>
      <p className="text-sm text-warm-700">
        Sléttan við 100 °C er nærri sjöfalt lengri en sú við 0 °C. Við suðu þarf að yfirvinna
        kraftana milli sameindanna að fullu, við bráðnun aðeins að hluta.
      </p>
    </section>
  );
}

/** A water phase diagram, not to scale, as the book draws it. */
function PhaseDiagram() {
  return (
    <svg
      viewBox="0 0 320 200"
      className="w-full max-w-md"
      role="img"
      aria-label="Fasarit vatns, ekki í kvarða: ís til vinstri, vatn efst í miðju, gufa neðst til hægri. Ferlarnir þrír mætast í þrípunktinum og ferillinn milli vatns og gufu endar í markpunktinum."
    >
      <line x1={30} y1={180} x2={310} y2={180} stroke="#78716c" />
      <line x1={30} y1={10} x2={30} y2={180} stroke="#78716c" />
      <text x={310} y={195} textAnchor="end" fontSize={10} fill="#57534e">
        hitastig
      </text>
      <text x={34} y={20} fontSize={10} fill="#57534e">
        þrýstingur
      </text>
      <path d="M 35 178 Q 80 168 110 140" fill="none" stroke="#0f766e" strokeWidth={2} />
      <path d="M 110 140 Q 190 120 270 50" fill="none" stroke="#0f766e" strokeWidth={2} />
      <path d="M 110 140 L 100 15" fill="none" stroke="#0f766e" strokeWidth={2} />
      <circle cx={110} cy={140} r={4} fill="#f36b22" />
      <circle cx={270} cy={50} r={4} fill="#f36b22" />
      <text x={116} y={156} fontSize={10} fill="#9a3412">
        þrípunktur
      </text>
      <text x={262} y={42} textAnchor="end" fontSize={10} fill="#9a3412">
        markpunktur
      </text>
      <text x={55} y={80} fontSize={13} fontWeight="bold" fill="#1e3a8a">
        Ís
      </text>
      <text x={160} y={70} fontSize={13} fontWeight="bold" fill="#1e3a8a">
        Vatn
      </text>
      <text x={210} y={160} fontSize={13} fontWeight="bold" fill="#1e3a8a">
        Gufa
      </text>
    </svg>
  );
}

export function FasarScreen({ onBack }: Props) {
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
  const item = index < FASAR_ITEMS.length ? FASAR_ITEMS[index] : null;
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
    commit(closeTo(value, numericAnswer(item)), numberSlip(item, value));
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
            Fasabreytingar og fasarit
          </h2>

          {phase === 'skilja' ? (
            <>
              <section
                aria-labelledby="fasar-hamskipti"
                className="space-y-2 rounded-xl bg-blue-50 p-4 phone:p-3"
              >
                <h3 id="fasar-hamskipti" className="text-lg font-bold text-blue-800">
                  Sex fasabreytingar
                </h3>
                <p className="text-sm text-blue-900">
                  <strong>Bráðnun</strong> (fast → vökvi), <strong>uppgufun</strong> (vökvi → gas)
                  og <strong>þurrgufun</strong> (fast → gas) taka til sín varma: kraftarnir milli
                  sameindanna eru yfirunnir. Gagnstæðu ferlin, <strong>storknun</strong>,{' '}
                  <strong>þétting</strong> og <strong>hélun</strong>, gefa sama varma frá sér.
                </p>
                <p className="text-sm text-blue-900">
                  Varminn á mól heitir <strong>bræðsluvermi</strong>, ΔH(bræðslu), og{' '}
                  <strong>gufunarvermi</strong>, ΔH(gufunar). Fyrir vatn eru þau{' '}
                  {formatDecimal(WATER.fusion)} kJ/mól við 0 °C og{' '}
                  {formatDecimal(WATER.vaporisation)} kJ/mól við 100 °C. Því sterkari sem kraftarnir
                  milli sameindanna eru, því stærri eru þau.
                </p>
              </section>

              <section
                aria-labelledby="fasar-ferill"
                className="space-y-2 rounded-xl bg-cyan-50 p-4 phone:p-3"
              >
                <h3 id="fasar-ferill" className="text-lg font-bold text-cyan-800">
                  Hitunarferill
                </h3>
                <p className="text-sm text-cyan-900">
                  Hitunarferill sýnir hitastig efnis á móti varmanum sem það tekur til sín. Þar sem
                  einn fasi hitnar hækkar hitastigið og
                </p>
                <p className="text-center font-mono text-cyan-900">q = m · c · ΔT</p>
                <p className="text-sm text-cyan-900">
                  með eðlisvarma íss {formatDecimal(WATER.cIce)}, vatns{' '}
                  {formatDecimal(WATER.cWater, 3)} og gufu {formatDecimal(WATER.cSteam)} J/(g·°C). Á
                  sléttunum stendur hitastigið í stað meðan fasinn breytist, og þar er
                </p>
                <p className="text-center font-mono text-cyan-900">q = n · ΔH</p>
                <p className="text-sm text-cyan-900">
                  Heildarvarminn er summa allra hlutanna. Kólni efnið eru allir hlutarnir neikvæðir.
                </p>
              </section>

              <Kanna />

              <section
                aria-labelledby="fasar-fasarit"
                className="space-y-2 rounded-xl bg-amber-50 p-4 phone:p-3"
              >
                <h3 id="fasar-fasarit" className="text-lg font-bold text-amber-800">
                  Fasarit
                </h3>
                <PhaseDiagram />
                <p className="text-sm text-amber-900">
                  <strong>Fasarit</strong> sýnir í hvaða ham efni er við gefið hitastig og þrýsting.
                  Á ferlunum eru tveir fasar í jafnvægi: ferillinn milli vatns og gufu gefur
                  suðumarkið við hvern þrýsting. Í <strong>þrípunktinum</strong> eru allir þrír
                  fasarnir í jafnvægi, og undir þrýstingi hans getur efnið ekki verið vökvi.
                </p>
                <p className="text-sm text-amber-900">
                  Ferillinn milli vökva og gass endar í <strong>markpunktinum</strong>, fyrir vatn
                  374 °C og 218 atm. Yfir honum er efnið ofurkritískur vökvi og enginn þrýstingur
                  gerir það að vökva. Ferillinn milli íss og vatns hallar örlítið til vinstri, svo
                  bræðslumark íss lækkar með þrýstingi; hjá flestum efnum hallar hann til hægri.
                </p>
              </section>

              <p className="text-xs text-warm-600">
                Heimild: Efnafræði 2e, kafli 10, „Fasabreytingar“ og „Fasarit“. Tölurnar í æfingunum
                eru úr sýnidæmum og æfingum bókarinnar.
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
            <section aria-labelledby="fasar-aefa" className="space-y-3">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <h3 id="fasar-aefa" className="text-lg font-bold text-warm-800">
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
                      Spurning {index + 1} af {FASAR_ITEMS.length}
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
                        {index + 1 < FASAR_ITEMS.length ? 'Næsta spurning →' : 'Sjá niðurstöðu →'}
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
                    {correct} af {FASAR_ITEMS.length} rétt
                  </h4>
                  <p className="text-sm text-green-900">
                    Á hitunarferli fer varminn ýmist í að hita efnið eða breyta fasa þess, og
                    fasaritið segir hvaða fasi er stöðugur við hvert hitastig og þrýsting.
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
