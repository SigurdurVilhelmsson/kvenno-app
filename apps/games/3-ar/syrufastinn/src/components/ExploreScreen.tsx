/**
 * Kanna — where Ka comes from.
 *
 * No right or wrong, per the April restructure. The student picks an acid,
 * measures a solution at whatever concentration they like, and the table fills
 * in: pH moves every time, Ka does not. That is the whole phase. Ka arrives as
 * something recovered from an observation rather than a number handed over in a
 * table, which is what `kaFromMeasuredPH` exists for.
 *
 * The reflection question at the end is not scored and cannot be got wrong —
 * both answers open the same explanation, because the point is to have committed
 * to a guess before reading it.
 */

import { useEffect, useMemo, useRef, useState } from 'react';

import {
  focusTarget,
  isPhone,
  revealSpan,
  usableArea,
  useArmedAfter,
  useRevealAfterCommit,
} from '@shared/utils';

import { useBackButton } from './BackButton';
import { KlofnunBar } from './KlofnunBar';
import { EXPLORABLE_ACIDS, exploreSeries } from '../data/problems';
import { percentDissociation } from '../engine/grade';
import { kaFromMeasuredPH, solveWeakAcid } from '../engine/ka';

const fmt = (n: number, dp: number) => n.toFixed(dp).replace('.', ',');

const sci = (n: number) => {
  const exp = Math.floor(Math.log10(n));
  const mant = n / Math.pow(10, exp);
  const sup = String(exp)
    .replace('-', '⁻')
    .replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)]);
  return `${fmt(mant, 2)} × 10${sup}`;
};

interface ExploreScreenProps {
  onComplete: () => void;
  onBack: () => void;
}

export function ExploreScreen({ onComplete, onBack }: ExploreScreenProps) {
  const [acid, setAcid] = useState(EXPLORABLE_ACIDS[0]);
  const [measured, setMeasured] = useState<number[]>([]);
  const [guess, setGuess] = useState<'sami' | 'breytist' | null>(null);

  const series = useMemo(() => exploreSeries(acid), [acid]);
  const rows = measured
    .map((c) => {
      const { hExact } = solveWeakAcid(acid.ka, c);
      const pH = -Math.log10(hExact);
      return {
        c,
        pH,
        h: hExact,
        ka: kaFromMeasuredPH(pH, c),
        pct: percentDissociation(acid.ka, c),
      };
    })
    .sort((a, b) => b.c - a.c);

  const measure = (c: number) => setMeasured((prev) => (prev.includes(c) ? prev : [...prev, c]));

  const switchAcid = (id: string) => {
    const next = EXPLORABLE_ACIDS.find((a) => a.id === id);
    if (!next) return;
    setAcid(next);
    setMeasured([]);
    setGuess(null);
  };

  const enough = rows.length >= 3;
  const back = useBackButton(onBack);

  const concRef = useRef<HTMLDivElement>(null);
  const rowsRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const questionRef = useRef<HTMLDivElement>(null);
  const guessesRef = useRef<HTMLDivElement>(null);
  const payoffRef = useRef<HTMLDivElement>(null);
  const onwardRef = useRef<HTMLButtonElement>(null);
  const moreRef = useRef<HTMLParagraphElement>(null);

  // Each measurement: the button just pressed turns disabled, so focus would
  // fall to <body>. It moves to the table, where the new row is — or, on the
  // third measurement, to the question that has just appeared under it.
  //
  // On a phone the table opens under the concentration buttons, below the
  // bottom edge, so the first measurement looked as if nothing had happened.
  // The buttons stay anchored on screen with the table and the bar under them,
  // so the next tap shows its row without a scroll; when the question appears
  // it is brought in with its answers, with as much of the table as fits.
  //
  // A desktop window keeps what the game's own helper did there, at any width:
  // only a first row that opened within 48 px of the bottom edge moves the page.
  useEffect(() => {
    if (rows.length === 0) return;
    const asking = rows.length === 3 && guess === null;
    if (isPhone()) {
      if (asking) revealSpan(guessesRef.current, [tableRef.current, questionRef.current]);
      else {
        revealSpan(moreRef.current ?? rowsRef.current, [concRef.current, tableRef.current]);
      }
    } else {
      const first = tableRef.current?.querySelector('tbody tr');
      if (first && first.getBoundingClientRect().top + 48 > usableArea().bottom) {
        revealSpan(tableRef.current, [], { anyWidth: true, gap: 16 });
      }
    }
    focusTarget(asking ? questionRef.current : tableRef.current);
    // Only a new measurement moves anything; `guess` is read, not watched.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows.length]);

  // After the guess: the explanation from its heading, through "Áfram" if it
  // fits (it is teaching-length, so on a phone it usually does not, and the
  // student reads down to it). Focus moves to the explanation.
  useRevealAfterCommit(guess !== null, () => ({
    bottom: onwardRef.current,
    tops: [payoffRef.current],
    focus: payoffRef.current,
  }));
  // A double tap must not answer the question the moment it appears, nor
  // press "Áfram" the moment the explanation does.
  const armed = useArmedAfter(400, `${enough}:${guess}`);

  return (
    <div className="mx-auto max-w-3xl">
      {back.above}

      <div className="rounded-lg bg-white p-4 shadow-md sm:p-6 md:p-8 phone:p-3">
        <div className="phone:mb-2 phone:flex phone:items-baseline phone:gap-3">
          {back.inRow}
          <h2 className="mb-2 text-2xl font-bold text-warm-800 phone:mb-0 phone:min-w-0 phone:flex-1 phone:text-base">
            Kanna: hvaðan kemur Ka?
          </h2>
        </div>
        <p className="mb-6 text-warm-600 phone:mb-3">
          Þú ert með sýru og pH-mæli. Mældu nokkrar lausnir af sömu sýru, hverja með sínum styrk, og
          reiknaðu Ka út frá hverri mælingu. Fylgstu með hvað breytist og hvað gerir það ekki.
        </p>

        <div className="mb-6 phone:mb-3">
          <label htmlFor="acid-picker" className="mb-2 block text-sm font-semibold text-warm-700">
            Sýra
          </label>
          <select
            id="acid-picker"
            value={acid.id}
            onChange={(e) => switchAcid(e.target.value)}
            className="w-full rounded-lg border border-warm-300 bg-white p-3 text-warm-800"
          >
            {EXPLORABLE_ACIDS.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.formula})
              </option>
            ))}
          </select>
          <p className="mt-2 text-sm text-warm-600">{acid.context}</p>
        </div>

        <div ref={concRef} className="mb-6 phone:mb-3">
          <p className="mb-2 text-sm font-semibold text-warm-700">Veldu styrk og mældu (mól/L)</p>
          {/* On a phone the seven concentrations are two rows of four (one row
              of seven on its side) rather than three ragged rows. */}
          <div className="flex flex-wrap gap-2 phone:grid phone:grid-cols-4 phone-land:grid-cols-7">
            {series.map(({ concentration }) => (
              <button
                key={concentration}
                type="button"
                onClick={() => measure(concentration)}
                disabled={measured.includes(concentration)}
                className={`game-btn rounded-lg px-4 py-2 text-sm transition-colors pointer-coarse:min-h-11 phone:whitespace-nowrap phone:px-1 ${
                  measured.includes(concentration)
                    ? 'cursor-default bg-warm-100 text-warm-400'
                    : 'bg-kvenno-orange text-white hover:bg-kvenno-orange-dark'
                }`}
              >
                {fmt(concentration, 3)} M
              </button>
            ))}
          </div>
        </div>

        {rows.length > 0 && (
          <div ref={rowsRef} className="fade-in mb-6 overflow-x-auto phone:mb-3">
            {/* On the narrowest phones the four columns fit only at 12 px, and
                the column that would otherwise scroll out of sight is Ka's. */}
            <table ref={tableRef} className="w-full text-sm max-[359px]:text-xs">
              <caption className="sr-only">
                Mældar lausnir: styrkur, pH, styrkur vetnisjóna og reiknaður sýrufasti
              </caption>
              <thead>
                <tr className="border-b border-warm-200 text-left text-warm-600">
                  <th scope="col" className="py-2 pr-1.5 sm:pr-3">
                    C (mól/L)
                  </th>
                  <th scope="col" className="py-2 pr-1.5 sm:pr-3">
                    Mælt pH
                  </th>
                  <th scope="col" className="py-2 pr-1.5 sm:pr-3">
                    [H⁺]
                  </th>
                  <th scope="col" className="py-2">
                    Ka = x² / <span className="whitespace-nowrap">(C − x)</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.c} className="border-b border-warm-100">
                    <td className="py-2 pr-1.5 sm:pr-3">{fmt(r.c, 3)}</td>
                    <td className="py-2 pr-1.5 font-semibold text-kvenno-orange sm:pr-3">
                      {fmt(r.pH, 2)}
                    </td>
                    {/* A number in scientific notation is one token: it must not
                        break at the spaces around × on a phone. */}
                    <td className="whitespace-nowrap py-2 pr-1.5 text-warm-600 sm:pr-3">
                      {sci(r.h)}
                    </td>
                    <td className="whitespace-nowrap py-2 font-semibold text-green-700">
                      {sci(r.ka)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-4">
              <p className="mb-2 text-sm font-semibold text-warm-700">
                Hversu mikið af sýrunni klofnaði í þynnstu lausninni?
              </p>
              <KlofnunBar
                percent={rows[rows.length - 1].pct}
                valid={rows[rows.length - 1].pct < 5}
              />
            </div>
          </div>
        )}

        {enough && guess === null && (
          <div
            ref={questionRef}
            role="group"
            aria-labelledby="kanna-question"
            className="fade-in rounded-lg border border-kvenno-orange bg-kvenno-orange/5 p-5 phone:p-4"
          >
            <p id="kanna-question" className="mb-3 font-semibold text-warm-800">
              Áður en þú lest lengra — hvað heldurðu?
            </p>
            <p className="mb-4 text-sm text-warm-700">
              Þú hefur mælt {rows.length} lausnir af sömu sýru. pH-gildin eru ólík. Hvað gerir
              Ka-dálkurinn?
            </p>
            <div ref={guessesRef} className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={armed(() => setGuess('sami'))}
                className="game-btn flex-1 rounded-lg border-2 border-warm-300 bg-white p-3 text-warm-800 hover:border-kvenno-orange"
              >
                Hann helst sá sami
              </button>
              <button
                type="button"
                onClick={armed(() => setGuess('breytist'))}
                className="game-btn flex-1 rounded-lg border-2 border-warm-300 bg-white p-3 text-warm-800 hover:border-kvenno-orange"
              >
                Hann breytist með styrknum
              </button>
            </div>
            <p className="mt-3 text-xs text-warm-500">
              Hvorugt svarið er talið rétt eða rangt — það skiptir bara máli að þú hafir giskað áður
              en þú sérð svarið.
            </p>
          </div>
        )}

        {guess !== null && (
          <div
            ref={payoffRef}
            role="group"
            aria-labelledby="kanna-payoff"
            className="fade-in rounded-lg border border-green-300 bg-green-50 p-5 phone:p-4"
          >
            <h3 id="kanna-payoff" className="mb-2 font-semibold text-green-900">
              Ka er fasti — pH er það ekki
            </h3>
            <p className="mb-3 text-sm text-green-900">
              {guess === 'sami'
                ? 'Rétt hjá þér, og taktu eftir hvað það þýðir: '
                : 'Skiljanlegt — pH breyttist, svo það lá beint við. En taktu eftir: '}
              þynntu lausnina tífalt og pH hækkar, [H⁺] fellur, en{' '}
              <strong>Ka kemur eins út í hvert einasta skipti</strong>. Það er ekki tilviljun —
              hlutfallið x²/(C − x) er einmitt smíðað þannig að styrkurinn styttist út.
            </p>
            <p className="mb-3 text-sm text-green-900">
              Þess vegna heitir hann <strong>sýrufasti</strong> en ekki „sýrustyrkur“. Hann lýsir
              sýrunni sjálfri, ekki lausninni sem þú bjóst til. Sama tala gildir í maganum á þér og
              í tilraunaglasi.
            </p>
            <p className="text-sm text-green-900">
              Hitt sem taflan sýnir: <strong>klofnunarhlutfallið hækkar við þynningu.</strong> Því
              minna sem er af sýrunni, því stærri hluti hennar klofnar — jafnvel þótt [H⁺] lækki.
              Það kemur flestum á óvart og er beinlínis það sem Ka-jafnan spáir fyrir um.
            </p>

            <button
              ref={onwardRef}
              type="button"
              onClick={armed(onComplete)}
              className="game-btn mt-4 rounded-lg bg-kvenno-orange px-5 py-2.5 text-white hover:bg-kvenno-orange-dark"
            >
              Áfram í Skilja
            </button>
          </div>
        )}

        {!enough && rows.length > 0 && (
          <p ref={moreRef} className="text-sm text-warm-500">
            Mældu að minnsta kosti þrjár lausnir til að sjá mynstrið.
          </p>
        )}
      </div>
    </div>
  );
}
