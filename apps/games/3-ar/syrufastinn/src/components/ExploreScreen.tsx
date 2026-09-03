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

import { useMemo, useState } from 'react';

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

  return (
    <div className="mx-auto max-w-3xl">
      <button type="button" onClick={onBack} className="mb-4 text-warm-600 hover:text-warm-800">
        ← Til baka
      </button>

      <div className="rounded-lg bg-white p-6 shadow-md md:p-8">
        <h2 className="mb-2 text-2xl font-bold text-warm-800">Kanna: hvaðan kemur Ka?</h2>
        <p className="mb-6 text-warm-600">
          Þú ert með sýru og pH-mæli. Mældu nokkrar lausnir af sömu sýru, hverja með sínum styrk, og
          reiknaðu Ka út frá hverri mælingu. Fylgstu með hvað breytist og hvað gerir það ekki.
        </p>

        <div className="mb-6">
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

        <div className="mb-6">
          <p className="mb-2 text-sm font-semibold text-warm-700">Veldu styrk og mældu (mól/L)</p>
          <div className="flex flex-wrap gap-2">
            {series.map(({ concentration }) => (
              <button
                key={concentration}
                type="button"
                onClick={() => measure(concentration)}
                disabled={measured.includes(concentration)}
                className={`game-btn rounded-lg px-4 py-2 text-sm transition-colors ${
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
          <div className="fade-in mb-6 overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">
                Mældar lausnir: styrkur, pH, styrkur vetnisjóna og reiknaður sýrufasti
              </caption>
              <thead>
                <tr className="border-b border-warm-200 text-left text-warm-600">
                  <th scope="col" className="py-2 pr-3">
                    C (mól/L)
                  </th>
                  <th scope="col" className="py-2 pr-3">
                    Mælt pH
                  </th>
                  <th scope="col" className="py-2 pr-3">
                    [H⁺]
                  </th>
                  <th scope="col" className="py-2">
                    Ka = x² / (C − x)
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.c} className="border-b border-warm-100">
                    <td className="py-2 pr-3">{fmt(r.c, 3)}</td>
                    <td className="py-2 pr-3 font-semibold text-kvenno-orange">{fmt(r.pH, 2)}</td>
                    <td className="py-2 pr-3 text-warm-600">{sci(r.h)}</td>
                    <td className="py-2 font-semibold text-green-700">{sci(r.ka)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-4">
              <p className="mb-2 text-sm font-semibold text-warm-700">
                Hversu mikið af sýrunni klofnaði í veikustu lausninni?
              </p>
              <KlofnunBar
                percent={rows[rows.length - 1].pct}
                valid={rows[rows.length - 1].pct < 5}
              />
            </div>
          </div>
        )}

        {enough && guess === null && (
          <div className="fade-in rounded-lg border border-kvenno-orange bg-kvenno-orange/5 p-5">
            <p className="mb-3 font-semibold text-warm-800">
              Áður en þú lest lengra — hvað heldurðu?
            </p>
            <p className="mb-4 text-sm text-warm-700">
              Þú hefur mælt {rows.length} lausnir af sömu sýru. pH-gildin eru ólík. Hvað gerir
              Ka-dálkurinn?
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => setGuess('sami')}
                className="game-btn flex-1 rounded-lg border-2 border-warm-300 bg-white p-3 text-warm-800 hover:border-kvenno-orange"
              >
                Hann helst sá sami
              </button>
              <button
                type="button"
                onClick={() => setGuess('breytist')}
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
          <div className="fade-in rounded-lg border border-green-300 bg-green-50 p-5">
            <h3 className="mb-2 font-semibold text-green-900">Ka er fasti — pH er það ekki</h3>
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
              type="button"
              onClick={onComplete}
              className="game-btn mt-4 rounded-lg bg-kvenno-orange px-5 py-2.5 text-white hover:bg-kvenno-orange-dark"
            >
              Áfram í Skilja
            </button>
          </div>
        )}

        {!enough && rows.length > 0 && (
          <p className="text-sm text-warm-500">
            Mældu að minnsta kosti þrjár lausnir til að sjá mynstrið.
          </p>
        )}
      </div>
    </div>
  );
}
