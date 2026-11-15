/**
 * Kerspenna: cell potentials and ΔG° from the book's table, and half-reactions in acid (book
 * ch. 17, m68821, m68823, m68824). Skilja and an ungraded Kanna come first, then Æfa: ten items,
 * one attempt each, ending `N af M rétt` with no running score. Every key is worked out from the
 * table (`engine/kerspenna.ts`); a wrong answer shows the working and, where it can be told,
 * the slip behind it.
 */

import { useId, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { Header } from '@shared/components';
import {
  ELECTRODE_POTENTIALS,
  standardPotential,
  type Couple,
} from '@shared/data/electrode-potentials';
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

import { KANNA_COUPLES, KER_ITEMS, coupleLabel, type KerItem } from '../data/kerspenna';
import {
  closeTo,
  deltaG,
  ecell,
  electronsTransferred,
  spontaneousCell,
  type Cell,
} from '../engine/kerspenna';

interface Props {
  onBack: () => void;
}

/** A potential or energy with a sign and a decimal comma: as the book gives it, or to `digits`. */
export const volts = (e: number, digits?: number) =>
  `${e > 0 ? '+' : e < 0 ? '−' : ''}${formatDecimal(Math.abs(e), digits)}`;

const halfReaction = (c: Couple) => ELECTRODE_POTENTIALS[c].halfReaction;

const cellOf = (item: KerItem): Cell | null => {
  if (item.kind === 'ecell' || item.kind === 'dg') return spontaneousCell(...item.couples);
  if (item.kind === 'stefna') return { cathode: item.reduced, anode: item.oxidised };
  return null;
};

/** The key of an item. */
export function answerOf(item: KerItem): number | string {
  const cell = cellOf(item);
  if (item.kind === 'ecell') return ecell(cell!);
  if (item.kind === 'dg') return deltaG(cell!);
  if (item.kind === 'stefna') return ecell(cell!) > 0 ? 'Já' : 'Nei';
  return halfReaction(item.couple);
}

export const unitOf = (item: KerItem) => (item.kind === 'ecell' ? 'V' : 'kJ');

/** The slip behind a wrong number, where it can be told. */
export function numberSlip(item: KerItem, value: number): string | null {
  const cell = cellOf(item)!;
  const key = answerOf(item) as number;
  const unit = unitOf(item);
  if (closeTo(value, -key, unit)) {
    return item.kind === 'ecell'
      ? 'Formerkið snýst við: E°ker = E°katóða − E°anóða, og katóðan er hálfkerið með hærra E°.'
      : 'Formerkið snýst við: ΔG° = −nFE°ker, og jákvæð kerspenna gefur neikvætt ΔG°.';
  }
  if (item.kind === 'ecell') {
    const sum = standardPotential(cell.cathode) + standardPotential(cell.anode);
    if (closeTo(value, sum, 'V')) {
      return 'Þú lagðir E° saman. Töflugildin eru bæði afoxanir, svo anóðan er dregin frá.';
    }
    return null;
  }
  const n = electronsTransferred(cell);
  if (n > 1 && closeTo(value, key / n, 'kJ')) {
    return `n vantar: ${n} mól rafeinda flytjast í hverju móli hvarfs.`;
  }
  if (closeTo(value, key * 1000, 'kJ')) return 'Þetta er ΔG° í J. Deildu með 1000 fyrir kJ.';
  return null;
}

/** The working shown after an answer. */
export function working(item: KerItem): string[] {
  if (item.kind === 'halfhvarf') {
    return [
      'Fyrst eru önnur atóm en O og H stillt, svo O með H₂O, H með H⁺ og loks hleðslan með e⁻.',
      `Taflan bókarinnar: ${halfReaction(item.couple)}, E° = ${volts(standardPotential(item.couple))} V.`,
    ];
  }
  const cell = cellOf(item)!;
  const ec = standardPotential(cell.cathode);
  const ea = standardPotential(cell.anode);
  const e = ecell(cell);
  const lines = [
    `Katóða (afoxun): ${halfReaction(cell.cathode)}, E° = ${volts(ec)} V.`,
    `Anóða (oxun): ${halfReaction(cell.anode)}, E° = ${volts(ea)} V.`,
    `E°ker = ${volts(ec)} − (${volts(ea)}) = ${volts(e, 2)} V.`,
  ];
  if (item.kind === 'stefna') {
    lines.push(
      e > 0
        ? 'E°ker er jákvæð, svo hvarfið er sjálfgengt eins og það er skrifað.'
        : 'E°ker er neikvæð, svo hvarfið er ekki sjálfgengt eins og það er skrifað; það gengur í hina áttina.'
    );
  }
  if (item.kind === 'dg') {
    const n = electronsTransferred(cell);
    lines.push(
      `n = ${n}, svo ΔG° = −${n} × 96 485 C/mól × ${formatDecimal(e, 3)} V = ${volts(deltaG(cell), 1)} kJ.`
    );
  }
  return lines;
}

function Kanna() {
  const [a, setA] = useState<Couple>('Zn2+/Zn');
  const [b, setB] = useState<Couple>('Cu2+/Cu');
  const cell = spontaneousCell(a, b);
  const e = ecell(cell);
  const select = (id: string, label: string, value: Couple, set: (c: Couple) => void) => (
    <div className="min-w-0 flex-1">
      <label htmlFor={id} className="block text-sm font-semibold text-teal-900">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(ev) => set(ev.target.value as Couple)}
        className="w-full rounded-lg border-2 border-teal-300 bg-white px-2 py-2 pointer-coarse:min-h-11"
      >
        {KANNA_COUPLES.map((c) => (
          <option key={c} value={c}>
            {coupleLabel(c)} ({volts(standardPotential(c))} V)
          </option>
        ))}
      </select>
    </div>
  );
  return (
    <section
      aria-labelledby="ker-kanna"
      className="space-y-3 rounded-xl border border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50 p-4 phone:p-3"
    >
      <h3 id="ker-kanna" className="text-lg font-bold text-teal-800">
        Kannaðu: settu saman galvaníker
      </h3>
      <div className="flex flex-col gap-2 sm:flex-row">
        {select('ker-a', 'Hálfker 1', a, setA)}
        {select('ker-b', 'Hálfker 2', b, setB)}
      </div>
      <div aria-live="polite" className="space-y-1 text-sm text-warm-900">
        {a === b ? (
          <p>Sama hálfker báðum megin: engin spenna, ekkert hvarf.</p>
        ) : (
          <>
            <p>
              <strong>Katóða</strong> (afoxun, hærra E°): {halfReaction(cell.cathode)}
            </p>
            <p>
              <strong>Anóða</strong> (oxun): {halfReaction(cell.anode)}
            </p>
            <p>
              E°ker = {volts(standardPotential(cell.cathode))} − (
              {volts(standardPotential(cell.anode))}) = <strong>{volts(e, 2)} V</strong>, n ={' '}
              {electronsTransferred(cell)}, ΔG° = <strong>{volts(deltaG(cell), 0)} kJ</strong>.
            </p>
          </>
        )}
      </div>
      <p className="text-sm text-warm-700">
        Því lengra sem hálfkerin eru hvort frá öðru í töflunni, því hærri er spennan. Snúðu
        hálfkerunum við: katóðan og anóðan fylgja E°, ekki röðinni sem þú velur.
      </p>
    </section>
  );
}

export function KerspennaScreen({ onBack }: Props) {
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
  const item = index < KER_ITEMS.length ? KER_ITEMS[index] : null;
  const numeric = item?.kind === 'ecell' || item?.kind === 'dg';
  const choices = useMemo(() => {
    if (!item || numeric) return [];
    if (item.kind === 'stefna') return [{ value: 'Já' }, { value: 'Nei' }];
    if (item.kind !== 'halfhvarf') return [];
    const out = [...item.options];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }, [item, numeric]);

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
    if (!item || outcome !== null || !numeric) return;
    const value = parseStudentNumber(typed.replace(/^\+/, '').replace(/^−/, '-'));
    if (!Number.isFinite(value)) {
      setInvalid(`Skrifaðu svarið sem tölu í ${unitOf(item)}, t.d. 1,23 eða −45,6.`);
      return;
    }
    setInvalid(null);
    const key = answerOf(item) as number;
    commit(closeTo(value, key, unitOf(item)), numberSlip(item, value));
  };
  const choose = (value: string, why?: string) => {
    if (!item || outcome !== null) return;
    setChosen(value);
    commit(value === answerOf(item), why ?? null);
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

  const keyText = (it: KerItem) => {
    const key = answerOf(it);
    if (it.kind === 'ecell') return `${volts(key as number, 2)} V`;
    if (it.kind === 'dg') return `${volts(key as number, 0)} kJ`;
    return String(key);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100">
      <Header
        variant="game"
        gameTitle="Oxun og afoxun"
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
            Kerspenna
          </h2>

          {phase === 'skilja' ? (
            <>
              <section
                aria-labelledby="ker-ecell"
                className="space-y-2 rounded-xl bg-blue-50 p-4 phone:p-3"
              >
                <h3 id="ker-ecell" className="text-lg font-bold text-blue-800">
                  Staðalkerspenna
                </h3>
                <p className="text-sm text-blue-900">
                  Tafla bókarinnar gefur <strong>staðalrafskautsspennu</strong>, E°, hvers hálfkers,
                  alltaf skrifaða sem afoxun. Í galvaníkeri er hálfkerið með hærra E° katóðan, þar
                  sem afoxun verður, og hitt anóðan, þar sem oxun verður. Staðalkerspennan er
                </p>
                <p className="text-center font-mono text-blue-900">E°ker = E°katóða − E°anóða</p>
                <p className="text-sm text-blue-900">
                  Hálfhvarfið við anóðuna er skrifað öfugt, en E° þess er ekki snúið við:
                  frádrátturinn sér um það. Margfaldist hálfhvarf með tölu breytist E° ekki. Sinkur
                  og kopar: E°ker = {volts(standardPotential('Cu2+/Cu'))} − (
                  {volts(standardPotential('Zn2+/Zn'))}) ={' '}
                  {volts(ecell({ cathode: 'Cu2+/Cu', anode: 'Zn2+/Zn' }), 2)} V.
                </p>
              </section>

              <section
                aria-labelledby="ker-dg"
                className="space-y-2 rounded-xl bg-cyan-50 p-4 phone:p-3"
              >
                <h3 id="ker-dg" className="text-lg font-bold text-cyan-800">
                  Stefna hvarfs og ΔG°
                </h3>
                <p className="text-sm text-cyan-900">
                  Sé E°ker jákvæð er hvarfið sjálfgengt eins og það er skrifað; sé hún neikvæð
                  gengur það í hina áttina. Sama segir ΔG°:
                </p>
                <p className="text-center font-mono text-cyan-900">ΔG° = −n · F · E°ker</p>
                <p className="text-sm text-cyan-900">
                  þar sem n er fjöldi móla rafeinda sem flytjast í hverju móli hvarfs og F,
                  Faraday-fastinn, er 96 485 C/mól. Volt sinnum coulomb er joule, svo ΔG° kemur í J
                  og er deilt með 1000 fyrir kJ.
                </p>
              </section>

              <Kanna />

              <section
                aria-labelledby="ker-surt"
                className="space-y-2 rounded-xl bg-amber-50 p-4 phone:p-3"
              >
                <h3 id="ker-surt" className="text-lg font-bold text-amber-800">
                  Hálfhvörf í súrri lausn
                </h3>
                <ol className="list-decimal space-y-1 pl-5 text-sm text-amber-900">
                  <li>Stilltu öll atóm nema O og H.</li>
                  <li>Stilltu O með H₂O þeim megin sem vantar O.</li>
                  <li>Stilltu H með H⁺ þeim megin sem vantar H.</li>
                  <li>Stilltu hleðsluna með rafeindum, e⁻.</li>
                </ol>
                <p className="text-sm text-amber-900">
                  MnO₄⁻ → Mn²⁺: fjögur O kalla á 4H₂O hægra megin, þau á 8H⁺ vinstra megin, og
                  hleðslan 7+ vinstra megin á móti 2+ hægra megin kallar á 5e⁻:{' '}
                  {halfReaction('MnO4-/Mn2+')}.
                </p>
              </section>

              <p className="text-xs text-warm-600">
                Heimild: Efnafræði 2e, kafli 17 (staðalkerspenna, ΔG° og E°, stilling
                oxunar-afoxunarhvarfa) og viðauki um staðalrafskautsspennu.
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
            <section aria-labelledby="ker-aefa" className="space-y-3">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <h3 id="ker-aefa" className="text-lg font-bold text-warm-800">
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
                      Spurning {index + 1} af {KER_ITEMS.length}
                    </p>
                    {(item.kind === 'stefna' || item.kind === 'dg') && (
                      <p className="font-mono text-warm-900">{item.equation}</p>
                    )}
                    <h4
                      ref={startRef}
                      data-item-start
                      tabIndex={-1}
                      className="text-lg font-bold text-warm-800"
                    >
                      {item.question}
                    </h4>
                    {item.kind !== 'halfhvarf' && (
                      <ul className="space-y-0.5 text-sm text-warm-700">
                        {(item.kind === 'stefna'
                          ? [item.reduced, item.oxidised]
                          : [...item.couples]
                        ).map((c) => (
                          <li key={c} className="font-mono">
                            {halfReaction(c)}, E° = {volts(standardPotential(c))} V
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {numeric ? (
                    <div ref={answerRef} className="flex items-center gap-2">
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
                        aria-label={`Svar í ${unitOf(item)}`}
                        className="w-36 min-w-0 rounded-lg border-2 border-warm-300 px-3 py-2 text-center font-mono text-lg disabled:bg-warm-100"
                      />
                      <span className="font-mono text-warm-700">{unitOf(item)}</span>
                    </div>
                  ) : (
                    <div
                      ref={answerRef}
                      className={item.kind === 'stefna' ? 'grid grid-cols-2 gap-2' : 'grid gap-2'}
                    >
                      {choices.map((o) => {
                        const isKey = outcome !== null && o.value === answerOf(item);
                        const isPicked = chosen === o.value;
                        return (
                          <button
                            key={o.value}
                            type="button"
                            onClick={() => choose(o.value, 'slip' in o ? o.slip : undefined)}
                            aria-disabled={outcome !== null}
                            aria-pressed={isPicked}
                            className={`rounded-lg border-2 px-3 py-2 text-left font-mono pointer-coarse:min-h-11 ${
                              isKey
                                ? 'border-green-600 bg-green-50 text-green-900'
                                : isPicked
                                  ? 'border-red-500 bg-red-50 text-red-900'
                                  : 'border-warm-300 bg-white text-warm-900 hover:bg-warm-50'
                            } ${item.kind === 'stefna' ? 'text-center font-sans font-semibold' : ''}`}
                          >
                            {o.value}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {outcome === null ? (
                    numeric && (
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
                          {outcome === 'rett' ? 'Rétt!' : `Ekki rétt. Svarið er ${keyText(item)}.`}
                        </p>
                        {slip && <p className="text-sm">{slip}</p>}
                        <ul className="space-y-1 text-sm">
                          {working(item).map((line) => (
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
                        {index + 1 < KER_ITEMS.length ? 'Næsta spurning →' : 'Sjá niðurstöðu →'}
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
                    {correct} af {KER_ITEMS.length} rétt
                  </h4>
                  <p className="text-sm text-green-900">
                    Tafla staðalrafskautsspennu segir hvaða hvarf er sjálfgengt og hve mikla orku
                    það getur gefið: E°ker = E°katóða − E°anóða og ΔG° = −nFE°ker.
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
