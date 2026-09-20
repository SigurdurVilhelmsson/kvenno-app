import { useState } from 'react';

import {
  deltaNGas,
  equationOf,
  kcExpression,
  kcToKp,
  kpExpression,
  omittedFromK,
  R_GAS,
} from '@shared/engine/equilibrium';
import { formatScientific } from '@shared/utils';

import { reactionBy } from '../data/reactions';

/**
 * Skilja — the four things that make K more than a formula.
 *
 * Worked on reactions the book itself works, and the order is the book's:
 * write the expression, then see solids drop out of it, then see the same
 * constant written two ways, then meet Q as the same expression away from
 * equilibrium.
 *
 * The heterogeneous step uses the lead-chloride example deliberately. Its K
 * is a leysnimargfeldi, so a student who has played Leysnijafnvægi meets a
 * quantity they already know arriving from the general rule rather than as a
 * separate fact — which is the whole claim this node makes about the topic.
 */

const ammoniak = reactionBy('ammoniak');
const kalksteinn = reactionBy('kalksteinn');
const blyklorid = reactionBy('blyklorid');
const vatnsgas = reactionBy('vatnsgas');

interface Props {
  onComplete: () => void;
  onBack: () => void;
}

const STEPS = [
  'Stuðlarnir verða veldisvísar',
  'Föst efni og hreinir vökvar detta út',
  'Sami fasti, tvær leiðir: Kc og Kp',
  'Q er sama stæðan, utan jafnvægis',
] as const;

export function SkiljaScreen({ onComplete, onBack }: Props) {
  const [step, setStep] = useState(0);

  const next = () => (step + 1 >= STEPS.length ? onComplete() : setStep(step + 1));

  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-lg bg-white p-6 shadow-md md:p-8">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="text-2xl font-bold text-warm-800">Skilja — hvað K er</h2>
          <button onClick={onBack} className="text-sm text-warm-500 underline">
            Til baka
          </button>
        </div>

        <ol className="mb-6 flex flex-wrap gap-2 text-xs">
          {STEPS.map((label, i) => (
            <li
              key={label}
              className={`rounded-full px-3 py-1 ${
                i === step
                  ? 'bg-kvenno-orange font-semibold text-white'
                  : i < step
                    ? 'bg-green-100 text-green-800'
                    : 'bg-warm-100 text-warm-500'
              }`}
            >
              {i + 1}. {label}
            </li>
          ))}
        </ol>

        {step === 0 && (
          <section className="space-y-4">
            <p className="text-warm-700">
              Jafnvægisfastinn er eitt brot: myndefnin uppi, hvarfefnin niðri, og{' '}
              <strong>stuðullinn úr stilltu jöfnunni verður veldisvísir</strong>. Ekki margfaldari,
              ekki summa — veldisvísir.
            </p>
            <div className="rounded-xl border-2 border-warm-200 bg-warm-50 p-5">
              <p className="mb-3 font-mono text-lg text-warm-800">{equationOf(ammoniak)}</p>
              <p className="font-mono text-lg font-semibold text-kvenno-orange-dark">
                {kcExpression(ammoniak)}
              </p>
            </div>
            <p className="text-sm text-warm-600">
              Stuðullinn 3 á vetninu gerir það að verkum að tvöföldun á [H₂] áttfaldar Q. Þetta er
              ástæðan fyrir því að lítil breyting á vetnisstyrk hefur svona mikil áhrif í
              Haber-ferlinu.
            </p>
          </section>
        )}

        {step === 1 && (
          <section className="space-y-4">
            <p className="text-warm-700">
              Fast efni og hreinn vökvi fara <strong>ekki</strong> í stæðuna. Styrkur þeirra er
              eiginleiki efnisins sjálfs — kalksteinsmoli er jafn þéttur hvort sem molinn er stór
              eða lítill — svo hann breytist ekki þegar hvarfið gengur.
            </p>
            <div className="rounded-xl border-2 border-warm-200 bg-warm-50 p-5">
              <p className="mb-2 font-mono text-warm-800">{equationOf(kalksteinn)}</p>
              <p className="mb-3 font-mono font-semibold text-kvenno-orange-dark">
                {kcExpression(kalksteinn)}
              </p>
              <p className="text-sm text-warm-600">
                Bæði{' '}
                {omittedFromK(kalksteinn)
                  .map((s) => s.formula)
                  .join(' og ')}{' '}
                eru föst efni og detta út. Eftir stendur einn liður.
              </p>
            </div>
            <div className="rounded-xl border-2 border-purple-200 bg-purple-50 p-5">
              <p className="mb-2 font-mono text-purple-900">{equationOf(blyklorid)}</p>
              <p className="mb-3 font-mono font-semibold text-purple-900">
                {kcExpression(blyklorid)}
              </p>
              <p className="text-sm text-purple-900">
                Þessa stæðu þekkirðu. Saltið er fast og dettur út, svo eftir stendur margfeldi
                jónastyrkjanna — sem er nákvæmlega <strong>leysnimargfeldið</strong> úr
                Leysnijafnvægi. Þar var það sérstök regla um torleyst sölt; hér kemur það út úr
                almennu reglunni án þess að nokkuð sé bætt við.
              </p>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="space-y-4">
            <p className="text-warm-700">
              Fyrir gashvörf má skrifa fastann með styrkjum (Kc) eða með hlutþrýstingi (Kp).{' '}
              <strong>Þetta er sami fastinn, ekki tveir.</strong> Sambandið kemur beint úr
              kjörgasjöfnunni.
            </p>
            <div className="rounded-xl border-2 border-warm-200 bg-warm-50 p-5">
              <p className="mb-3 font-mono text-lg text-warm-800">
                Kp = Kc · (R·T)<sup>Δn</sup>
              </p>
              <p className="text-sm text-warm-600">
                Δn er <strong>mól af gasi</strong> í myndefnum mínus mól af gasi í hvarfefnum.
                Aðeins gas telur — uppleyst efni er í K en ekki í Δn. R = {R_GAS} L·atm/(mól·K).
              </p>
            </div>
            <div className="rounded-xl border-2 border-warm-200 p-5">
              <p className="mb-2 font-mono text-warm-800">{equationOf(ammoniak)}</p>
              <p className="mb-1 font-mono text-sm text-warm-700">{kpExpression(ammoniak)}</p>
              <p className="font-mono text-sm text-warm-700">
                Δn = 2 − (1 + 3) = {deltaNGas(ammoniak)}
              </p>
              <p className="mt-2 font-mono text-sm font-semibold text-kvenno-orange-dark">
                Kc = 0,50 við 400 °C → Kp ={' '}
                {formatScientific(kcToKp(0.5, deltaNGas(ammoniak), 400), 2)}
              </p>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              Þegar Δn er núll fellur (R·T) út og <strong>Kp er nákvæmlega sama talan og Kc</strong>
              . Það gerist í hverju hvarfi þar sem jafn mörg gasmól eru beggja vegna, til dæmis
              vatnsgashvarfinu.
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="space-y-4">
            <p className="text-warm-700">
              <strong>Hvarfstuðullinn</strong> Q er sama stæðan og K — sömu efni, sömu veldisvísar.
              Munurinn er bara hvenær þú reiknar hana: K á við blöndu í jafnvægi, Q á við hvaða
              blöndu sem er.
            </p>
            <div className="rounded-xl border-2 border-warm-200 bg-warm-50 p-5">
              <p className="mb-2 font-mono text-warm-800">{equationOf(vatnsgas)}</p>
              <p className="font-mono text-warm-700">{kcExpression(vatnsgas).replace('Kc', 'Q')}</p>
              <p className="mt-2 font-mono text-warm-700">{kcExpression(vatnsgas)}</p>
              <p className="mt-2 text-sm text-warm-600">Sama brot. Annað augnablik.</p>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-lg border-2 border-blue-300 bg-blue-50 p-4 text-sm">
                <p className="mb-1 font-mono font-bold text-blue-900">Q &lt; K</p>
                <p className="text-blue-900">
                  Of lítið af myndefnum. Hvarfið gengur áfram þar til Q hefur hækkað upp í K.
                </p>
              </div>
              <div className="rounded-lg border-2 border-amber-300 bg-amber-50 p-4 text-sm">
                <p className="mb-1 font-mono font-bold text-amber-900">Q &gt; K</p>
                <p className="text-amber-900">
                  Of mikið af myndefnum. Hvarfið gengur afturábak þar til Q hefur lækkað niður í K.
                </p>
              </div>
              <div className="rounded-lg border-2 border-green-300 bg-green-50 p-4 text-sm">
                <p className="mb-1 font-mono font-bold text-green-900">Q = K</p>
                <p className="text-green-900">
                  Jafnvægi. Bæði hvörfin ganga enn, jafn hratt, svo ekkert breytist á yfirborðinu.
                </p>
              </div>
            </div>
            <p className="text-sm text-warm-600">
              Þetta er svarið við því sem Hliðrun jafnvægis sýndi þér: þegar þú bætir efni út í
              færirðu Q frá K, og kerfið hliðrast í þá átt sem færir Q til baka.
            </p>
          </section>
        )}

        <button
          type="button"
          onClick={next}
          className="game-btn mt-6 w-full rounded-lg bg-kvenno-orange px-4 py-3 font-semibold text-white hover:bg-kvenno-orange-dark"
        >
          {step + 1 >= STEPS.length ? 'Ljúka' : 'Næsta'}
        </button>
      </div>
    </div>
  );
}
