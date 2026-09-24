import { useRef, useState } from 'react';

import {
  deltaNGas,
  equationOf,
  kcExpression,
  kcToKp,
  kpExpression,
  omittedFromK,
  reverseReaction,
  R_GAS,
  scaleReaction,
} from '@shared/engine/equilibrium';
import { formatDecimal, formatScientific } from '@shared/utils';

import { reactionBy } from '../data/reactions';
import { useRevealTopOnChange } from '../utils/reveal';

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
const vetnisjodid = reactionBy('vetnisjodid');

/** The three operations, worked on equations the student has already seen. */
const ammoniakBakhvarf = reverseReaction(ammoniak);
const vetnisjodidTvofalt = scaleReaction(vetnisjodid, 2);

interface Props {
  onComplete: () => void;
  onBack: () => void;
}

const STEPS = [
  'Stuðlarnir verða veldisvísar',
  'Föst efni og hreinir vökvar detta út',
  'Sami fasti, tvær leiðir: Kc og Kp',
  'Q er sama stæðan, utan jafnvægis',
  'Þrjár aðgerðir á jöfnu',
] as const;

export function SkiljaScreen({ onComplete, onBack }: Props) {
  const [step, setStep] = useState(0);
  const stepsRef = useRef<HTMLOListElement>(null);

  // "Næsta" sits at the foot of a step taller than a phone screen, so the next
  // step would otherwise open with its first paragraphs scrolled away.
  useRevealTopOnChange(stepsRef, step);

  const next = () => (step + 1 >= STEPS.length ? onComplete() : setStep(step + 1));

  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-lg bg-white p-4 shadow-md sm:p-6 md:p-8">
        <div className="mb-4 flex items-baseline justify-between gap-3 sm:mb-6">
          <h2 className="min-w-0 text-xl font-bold text-warm-800 sm:text-2xl">
            Skilja — hvað K er
          </h2>
          <button
            onClick={onBack}
            className="shrink-0 whitespace-nowrap text-sm text-warm-500 underline pointer-coarse:-my-3 pointer-coarse:-mr-3 pointer-coarse:px-3 pointer-coarse:py-3"
          >
            Til baka
          </button>
        </div>

        {/* Below `md` only the current step is named and the rest are numbers:
            five full labels wrap to five rows on a phone and push every
            step's content a third of the way down the screen, and to three
            rows on a phone held sideways, where the screen is 360 px tall. */}
        <ol ref={stepsRef} className="mb-6 flex flex-wrap gap-2 text-xs">
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
              {i + 1}.<span className={i === step ? undefined : 'hidden md:inline'}> {label}</span>
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
            <div className="rounded-xl border-2 border-warm-200 bg-warm-50 p-4 sm:p-5">
              <p className="mb-3 font-mono text-lg text-warm-800">{equationOf(ammoniak)}</p>
              <p className="font-mono text-lg font-semibold text-kvenno-orange-dark">
                {kcExpression(ammoniak)}
              </p>
            </div>
            <p className="text-sm text-warm-600">
              Stuðullinn 3 á vetninu gerir það að verkum að tvöföldun á [H₂] deilir Q með átta.
              Þetta er ástæðan fyrir því að lítil breyting á vetnisstyrk hefur svona mikil áhrif í
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
            <div className="rounded-xl border-2 border-warm-200 bg-warm-50 p-4 sm:p-5">
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
            <div className="rounded-xl border-2 border-purple-200 bg-purple-50 p-4 sm:p-5">
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
            <div className="rounded-xl border-2 border-warm-200 bg-warm-50 p-4 sm:p-5">
              <p className="mb-3 font-mono text-lg text-warm-800">
                Kp = Kc · (R·T)<sup>Δn</sup>
              </p>
              <p className="text-sm text-warm-600">
                Δn er <strong>mól af gasi</strong> í myndefnum mínus mól af gasi í hvarfefnum.
                Aðeins gas telur — uppleyst efni er í K en ekki í Δn. R = {formatDecimal(R_GAS)}{' '}
                L·atm/(mól·K).
              </p>
            </div>
            <div className="rounded-xl border-2 border-warm-200 p-4 sm:p-5">
              <p className="mb-2 font-mono text-warm-800">{equationOf(ammoniak)}</p>
              <p className="mb-1 font-mono text-sm text-warm-700">{kpExpression(ammoniak)}</p>
              <p className="font-mono text-sm text-warm-700">
                Δn = 2 − (1 + 3) = {deltaNGas(ammoniak)}
              </p>
              <p className="mt-2 font-mono text-sm font-semibold text-kvenno-orange-dark">
                Kc = 0,50 við 400 °C → Kp ={' '}
                <span className="whitespace-nowrap">
                  {formatScientific(kcToKp(0.5, deltaNGas(ammoniak), 400), 2)}
                </span>
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
            <div className="rounded-xl border-2 border-warm-200 bg-warm-50 p-4 sm:p-5">
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

        {step === 4 && (
          <section className="space-y-4">
            <p className="text-warm-700">
              Oft er fastinn sem þú þarft ekki í töflunni, en fastar fyrir{' '}
              <strong>tengd jafnvægi</strong> eru það — efnahvörf sem eiga hvarfefni eða myndefni
              sameiginleg. Þá má smíða jöfnuna sem þig vantar úr þeim sem þú hefur, og fastinn
              fylgir með. Aðgerðirnar eru þrjár.
            </p>

            <div className="rounded-xl border-2 border-warm-200 bg-warm-50 p-4 sm:p-5">
              <p className="mb-2 text-sm font-semibold text-warm-800">
                1. Snúa jöfnunni við → K verður umhverfa sín
              </p>
              <p className="font-mono text-sm text-warm-700">{equationOf(ammoniak)}</p>
              <p className="mb-2 font-mono text-sm text-warm-700">
                Kc = {ammoniak.constant!.value.toString().replace('.', ',')}
              </p>
              <p className="font-mono text-sm text-warm-800">{equationOf(ammoniakBakhvarf)}</p>
              <p className="font-mono text-sm font-semibold text-kvenno-orange-dark">
                Kc = 1 / {ammoniak.constant!.value.toString().replace('.', ',')} ={' '}
                <span className="whitespace-nowrap">
                  {formatScientific(ammoniakBakhvarf.constant!.value, 2)}
                </span>
              </p>
            </div>

            <div className="rounded-xl border-2 border-warm-200 bg-warm-50 p-4 sm:p-5">
              <p className="mb-2 text-sm font-semibold text-warm-800">
                2. Margfalda stuðlana með n → K fer í n-ta veldi
              </p>
              <p className="font-mono text-sm text-warm-700">{equationOf(vetnisjodid)}</p>
              <p className="mb-2 font-mono text-sm text-warm-700">
                Kc = {vetnisjodid.constant!.value}
              </p>
              <p className="font-mono text-sm text-warm-800">{equationOf(vetnisjodidTvofalt)}</p>
              <p className="font-mono text-sm font-semibold text-kvenno-orange-dark">
                Kc = {vetnisjodid.constant!.value}² ={' '}
                <span className="whitespace-nowrap">
                  {formatScientific(vetnisjodidTvofalt.constant!.value, 2)}
                </span>
              </p>
            </div>

            <div className="rounded-xl border-2 border-warm-200 bg-warm-50 p-4 sm:p-5">
              <p className="mb-2 text-sm font-semibold text-warm-800">
                3. Leggja tvær jöfnur saman → fastarnir margfaldast
              </p>
              <p className="font-mono text-sm text-warm-700">A ⇌ B&nbsp;&nbsp;&nbsp;K₁</p>
              <p className="mb-2 font-mono text-sm text-warm-700">B ⇌ C&nbsp;&nbsp;&nbsp;K₂</p>
              <p className="font-mono text-sm text-warm-800">A ⇌ C</p>
              <p className="font-mono text-sm font-semibold text-kvenno-orange-dark">K = K₁ · K₂</p>
              <p className="mt-2 text-sm text-warm-600">
                B stendur sitt hvorum megin og styttist út. Það sama gerist með öll efni sem koma
                fram beggja vegna — líka föst efni, sem voru hvort eð er ekki í K.
              </p>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
              <strong>Engin af þessum þremur er ný regla.</strong> K er brot með myndefnum uppi og
              hvarfefnum niðri, svo það að víxla hliðunum snýr brotinu við, það að margfalda
              stuðlana hefur hvern lið upp í það veldi, og það að leggja saman margfaldar brotin tvö
              og styttir út það sem stendur beggja vegna. Ein staðreynd, þrjár afleiðingar.
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <strong>Eitt skilyrði:</strong> fastarnir verða að eiga við sama hitastig. K er háður
              hitastigi, svo margfeldi tveggja fasta sem mældir voru við sitt hvort hitastigið lýsir
              engu kerfi.
            </div>
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
