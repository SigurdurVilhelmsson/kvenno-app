/**
 * Skilja — the ICE table, and where √(Ka·C) comes from.
 *
 * A walk-through, not a test. Kanna established that Ka is a constant recovered
 * from a measurement; this derives the expression that made it come out
 * constant, and then derives the approximation *from an assumption the student
 * can see stated*, so that the 5 % rule arrives as the condition on that
 * assumption rather than as a rule to memorise.
 *
 * The order is load-bearing: the exact expression first, the approximation
 * second and explicitly as a simplification. Teaching √(Ka·C) first and the
 * quadratic as an advanced afterthought is what produces students who cannot say
 * when the approximation stops working — which is the habit this game exists to
 * replace.
 */

import { useState } from 'react';

import { KlofnunBar } from './KlofnunBar';
import { MONOPROTIC_ACIDS } from '../data/acids';
import { percentDissociation } from '../engine/grade';
import { solveWeakAcid } from '../engine/ka';

const fmt = (n: number, dp: number) => n.toFixed(dp).replace('.', ',');

const STEPS = ['Efnajafnan', 'ICE-taflan', 'Sýrufastinn', 'Nálgunin', '5 % reglan'] as const;

interface UnderstandScreenProps {
  onComplete: () => void;
  onBack: () => void;
}

export function UnderstandScreen({ onComplete, onBack }: UnderstandScreenProps) {
  const [step, setStep] = useState(0);

  // The worked example throughout: the one the whole platform already uses.
  const acid = MONOPROTIC_ACIDS.find((a) => a.id === 'ediksyra')!;
  const C = 0.1;
  const s = solveWeakAcid(acid.ka, C);
  const pct = percentDissociation(acid.ka, C);

  // The counter-example, from the same pool: same method, rule fails.
  const weakRule = MONOPROTIC_ACIDS.find((a) => a.id === 'maurasyra')!;
  const weakC = 0.01;
  const weakS = solveWeakAcid(weakRule.ka, weakC);
  const weakPct = percentDissociation(weakRule.ka, weakC);

  return (
    <div className="mx-auto max-w-3xl">
      <button type="button" onClick={onBack} className="mb-4 text-warm-600 hover:text-warm-800">
        ← Til baka
      </button>

      <div className="rounded-lg bg-white p-6 shadow-md md:p-8">
        <h2 className="mb-2 text-2xl font-bold text-warm-800">Skilja: hvaðan jafnan kemur</h2>
        <p className="mb-6 text-warm-600">
          Dæmið í gegn er 0,100 M ediksýra — sama lausn og pH Títrun byrjar á.
        </p>

        <ol className="mb-6 flex flex-wrap gap-2" aria-label="Skref">
          {STEPS.map((label, i) => (
            <li key={label}>
              <button
                type="button"
                onClick={() => setStep(i)}
                aria-current={i === step ? 'step' : undefined}
                className={`rounded-full px-3 py-1 text-xs transition-colors ${
                  i === step
                    ? 'bg-kvenno-orange text-white'
                    : i < step
                      ? 'bg-green-100 text-green-800'
                      : 'bg-warm-100 text-warm-600'
                }`}
              >
                {i + 1}. {label}
              </button>
            </li>
          ))}
        </ol>

        <div className="fade-in min-h-[18rem]">
          {step === 0 && (
            <div>
              <h3 className="mb-3 text-lg font-semibold text-warm-800">Sýran klofnar — að hluta</h3>
              <div className="mb-4 rounded-lg bg-warm-50 p-4 text-center font-mono text-lg text-warm-800">
                CH₃COOH ⇌ H⁺ + CH₃COO⁻
              </div>
              <p className="mb-3 text-warm-700">
                Örin snýr í báðar áttir og það er allur munurinn á veikri sýru og sterkri. Saltsýra
                klofnar alveg: setur þú 0,1 mól í lítra færðu 0,1 mól af H⁺. Ediksýra kemst í
                jafnvægi þar sem meirihlutinn er enn óklofinn.
              </p>
              <p className="text-warm-700">
                Spurningin sem eftir stendur er <em>hversu langt</em> jafnvægið nær — og því svarar
                ein tala fyrir hverja sýru.
              </p>
            </div>
          )}

          {step === 1 && (
            <div>
              <h3 className="mb-3 text-lg font-semibold text-warm-800">
                ICE: byrjun, breyting, jafnvægi
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-center text-sm">
                  <thead>
                    <tr className="border-b border-warm-200 text-warm-600">
                      <th scope="col" className="py-2 text-left"></th>
                      <th scope="col" className="py-2">
                        CH₃COOH
                      </th>
                      <th scope="col" className="py-2">
                        H⁺
                      </th>
                      <th scope="col" className="py-2">
                        CH₃COO⁻
                      </th>
                    </tr>
                  </thead>
                  <tbody className="font-mono">
                    <tr className="border-b border-warm-100">
                      <th scope="row" className="py-2 text-left font-sans text-warm-700">
                        Byrjun
                      </th>
                      <td className="py-2">0,100</td>
                      <td className="py-2">~0</td>
                      <td className="py-2">0</td>
                    </tr>
                    <tr className="border-b border-warm-100">
                      <th scope="row" className="py-2 text-left font-sans text-warm-700">
                        Breyting
                      </th>
                      <td className="py-2 text-red-700">−x</td>
                      <td className="py-2 text-green-700">+x</td>
                      <td className="py-2 text-green-700">+x</td>
                    </tr>
                    <tr>
                      <th scope="row" className="py-2 text-left font-sans text-warm-700">
                        Jafnvægi
                      </th>
                      <td className="py-2 font-semibold">0,100 − x</td>
                      <td className="py-2 font-semibold">x</td>
                      <td className="py-2 font-semibold">x</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-warm-700">
                Allt hvílir á neðstu línunni. Sýran sem klofnaði er <strong>farin</strong> úr fyrsta
                dálkinum — þess vegna stendur þar 0,100 − x en ekki 0,100. Það er nákvæmlega þetta
                mínus-x sem nálgunin síðar hendir út.
              </p>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 className="mb-3 text-lg font-semibold text-warm-800">
                Sýrufastinn er neðsta línan, sett í jöfnu
              </h3>
              <div className="mb-4 rounded-lg bg-warm-50 p-4 text-center font-mono text-warm-800">
                Ka = [H⁺][A⁻] / [HA] = x · x / (C − x) = x² / (C − x)
              </div>
              <p className="mb-3 text-warm-700">
                Þetta er sama jafnan og þú notaðir í Kanna til að reikna Ka út frá mældu pH — bara
                lesin í hina áttina. Þar gafstu henni x og fékkst Ka; hér gefurðu henni Ka og leitar
                að x.
              </p>
              <div className="mb-3 rounded-lg bg-warm-50 p-4 text-center font-mono text-warm-800">
                x² + Ka·x − Ka·C = 0
              </div>
              <p className="text-warm-700">
                Umraðað er þetta venjuleg annars stigs jafna, og hún er alltaf rétt. Fyrir 0,100 M
                ediksýru gefur hún x = {s.hExact.toExponential(3).replace('.', ',')} M, sem er pH{' '}
                <strong>{fmt(s.pH, 4)}</strong>.
              </p>
            </div>
          )}

          {step === 3 && (
            <div>
              <h3 className="mb-3 text-lg font-semibold text-warm-800">
                Nálgunin — og forsendan sem hún byggir á
              </h3>
              <p className="mb-3 text-warm-700">
                Annars stigs jafnan er alltaf rétt en það er leiðinlegt að leysa hana. Svo við gerum
                eina <strong>forsendu</strong>, og hún er skrifuð hér svo þú getir seinna athugað
                hvort hún hélt:
              </p>
              <div className="mb-4 rounded-lg border-2 border-amber-300 bg-amber-50 p-4 text-center text-amber-900">
                <span className="font-mono">x ≪ C</span>
                <span className="block text-sm">— svo lítið klofnar að C − x er nánast C</span>
              </div>
              <p className="mb-3 text-warm-700">Gefi maður sér það styttist allt saman:</p>
              <div className="mb-4 rounded-lg bg-warm-50 p-4 text-center font-mono text-warm-800">
                Ka ≈ x² / C &nbsp;→&nbsp; x ≈ √(Ka · C)
              </div>
              <p className="text-warm-700">
                Fyrir 0,100 M ediksýru gefur nálgunin pH <strong>{fmt(s.pHApprox, 4)}</strong> á
                móti {fmt(s.pH, 4)} úr nákvæmu jöfnunni. Munurinn er{' '}
                {fmt(Math.abs(s.pH - s.pHApprox), 4)} — ósýnilegur þegar svarið er gefið upp með
                tveimur aukastöfum. Þess vegna er <strong>{fmt(s.pHApprox, 2)}</strong> talan sem
                stendur í bókinni.
              </p>
            </div>
          )}

          {step === 4 && (
            <div>
              <h3 className="mb-3 text-lg font-semibold text-warm-800">
                5 % reglan: hvenær forsendan heldur
              </h3>
              <p className="mb-4 text-warm-700">
                Forsendan var <span className="font-mono">x ≪ C</span>. Hlutfallið x/C er einmitt{' '}
                <strong>klofnunarhlutfallið</strong>, svo það er sú tala sem segir þér hvort
                forsendan hélt. Venjan er að draga strikið við 5 %.
              </p>

              <div className="mb-5 rounded-lg border border-green-300 bg-green-50 p-4">
                <p className="mb-2 text-sm font-semibold text-green-900">
                  0,100 M ediksýra — forsendan heldur
                </p>
                <KlofnunBar percent={pct} valid />
                <p className="mt-2 text-sm text-green-900">
                  {fmt(pct, 2)} % klofnar. Nálgunin gefur {fmt(s.pHApprox, 2)}, nákvæma jafnan{' '}
                  {fmt(s.pH, 2)} — sama svar.
                </p>
              </div>

              <div className="rounded-lg border border-red-300 bg-red-50 p-4">
                <p className="mb-2 text-sm font-semibold text-red-900">
                  0,010 M maurasýra — forsendan heldur ekki
                </p>
                <KlofnunBar percent={weakPct} valid={false} />
                <p className="mt-2 text-sm text-red-900">
                  {fmt(weakPct, 2)} % klofnar. Nú gefur nálgunin {fmt(weakS.pHApprox, 2)} en rétta
                  svarið er {fmt(weakS.pH, 2)}. Munurinn er orðinn stærri en aukastafirnir sem þú
                  gefur upp — sem sagt beinlínis rangt svar, ekki bara ónákvæmt.
                </p>
              </div>

              <p className="mt-4 text-warm-700">
                Athugaðu að hvorugt hangir á því hvort sýran sé „sterk“ eða „veik“. Sama sýran fer
                yfir mörkin ef þú þynnir hana nógu mikið — það er þynningin sem hækkar
                klofnunarhlutfallið, alveg eins og taflan í Kanna sýndi.
              </p>

              <button
                type="button"
                onClick={onComplete}
                className="game-btn mt-5 rounded-lg bg-kvenno-orange px-5 py-2.5 text-white hover:bg-kvenno-orange-dark"
              >
                Áfram í Æfa
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-between border-t border-warm-200 pt-4">
          <button
            type="button"
            onClick={() => setStep((v) => Math.max(0, v - 1))}
            disabled={step === 0}
            className="rounded-lg px-4 py-2 text-warm-600 hover:text-warm-800 disabled:opacity-40"
          >
            ← Fyrra skref
          </button>
          <button
            type="button"
            onClick={() => setStep((v) => Math.min(STEPS.length - 1, v + 1))}
            disabled={step === STEPS.length - 1}
            className="rounded-lg px-4 py-2 text-warm-600 hover:text-warm-800 disabled:opacity-40"
          >
            Næsta skref →
          </button>
        </div>
      </div>
    </div>
  );
}
