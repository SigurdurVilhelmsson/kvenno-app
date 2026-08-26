import { useState } from 'react';

import { useEscapeKey } from '@shared/hooks';

import { RatioFraction } from './RatioCard';
import { ratioById } from '../data/ratios';
import { flip, orient, type Equivalence, type Orientation } from '../engine/units';

interface LessonProps {
  heading: string;
  /** The relationship as a student meets it in the textbook. */
  statement: string;
  equivalence: Equivalence;
  /** When the as-written orientation is the useful one. */
  forwardUse: string;
  /** When the flipped orientation is the useful one. */
  flippedUse: string;
}

/**
 * One relationship, shown as the two fractions it can become.
 *
 * Molarity and density are used as multipliers elsewhere in Year 1 but taught as
 * concepts nowhere (CURRICULUM_REVIEW.md:53). This screen is where a student is
 * told what they are before being asked to orient them.
 */
function Lesson({ heading, statement, equivalence, forwardUse, flippedUse }: LessonProps) {
  const [orientation, setOrientation] = useState<Orientation>('forward');
  const oriented = orient(equivalence, orientation);

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-warm-800">{heading}</h3>
      <p className="mt-2 text-warm-700">{statement}</p>

      <div className="mt-4 flex flex-col items-center gap-3 rounded-lg bg-warm-50 p-4 sm:flex-row sm:justify-center sm:gap-6">
        <RatioFraction ratio={oriented} className="text-lg" />
        <button
          type="button"
          onClick={() => setOrientation(flip(orientation))}
          className="game-btn rounded-lg border border-warm-300 bg-white px-4 py-2 text-sm font-medium text-warm-700 hover:bg-warm-100"
        >
          ⇅ Snúa hlutfallinu við
        </button>
      </div>

      <p className="mt-3 rounded-lg bg-sky-50 p-3 text-sm text-sky-900">
        Svona snúið stendur{' '}
        <strong>
          {oriented.den.unit}
          {oriented.den.species ? ` ${oriented.den.species}` : ''}
        </strong>{' '}
        í nefnaranum, svo sú eining styttist út:{' '}
        {orientation === 'forward' ? forwardUse : flippedUse}
      </p>
    </div>
  );
}

interface UnderstandScreenProps {
  onComplete: () => void;
  onBack: () => void;
}

export function UnderstandScreen({ onComplete, onBack }: UnderstandScreenProps) {
  useEscapeKey(onBack);

  return (
    <div className="mx-auto max-w-3xl">
      <button
        type="button"
        onClick={onBack}
        className="game-btn mb-4 rounded-lg border border-warm-300 px-3 py-1.5 text-sm text-warm-700 hover:bg-warm-50"
      >
        ← Aftur í valmynd
      </button>

      <div className="mb-5 rounded-xl bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold text-warm-800">Hvert hlutfall er í raun tvö</h2>
        <p className="mt-2 text-warm-700">
          Sérhver staðreynd sem tengir tvær einingar má skrifa sem brot — og brotið má snúa við án
          þess að staðreyndin breytist. Bæði brotin eru jöfn einum, svo það breytir aldrei stærðinni
          sem þú ert með að margfalda með þeim. Það eina sem breytist er{' '}
          <strong>hvaða eining styttist út</strong>.
        </p>
        <p className="mt-2 text-warm-700">
          Þess vegna er engin þörf á að muna „hvor talan á að vera uppi“. Þú velur þá átt sem lætur
          einingina sem þú vilt losna við lenda í nefnaranum.
        </p>
      </div>

      <div className="space-y-5">
        <Lesson
          heading="Mólmassi"
          statement="Mólmassi segir hvað eitt mól af efninu vegur. Fyrir magnesíum: 24,31 g í hverju móli."
          equivalence={ratioById('mm-Mg')}
          forwardUse="mól verða að grömmum."
          flippedUse="grömm verða að mólum."
        />
        <Lesson
          heading="Mólstyrkur"
          statement="Mólstyrkur (M) segir hversu mörg mól af uppleystu efni eru í hverjum lítra af lausn. 0,100 M NaOH þýðir 0,100 mól NaOH í hverjum lítra lausnar."
          equivalence={ratioById('molstyrkur-NaOH-0100')}
          forwardUse="lítrar af lausn verða að mólum af uppleystu efni."
          flippedUse="mól af uppleystu efni verða að lítrum af lausn."
        />
        <Lesson
          heading="Eðlismassi"
          statement="Eðlismassi segir hvað hver millilítri af efninu vegur. Etanól er 0,789 g/mL, sem er ástæðan fyrir því að það flýtur ofan á vatni."
          equivalence={ratioById('edlismassi-etanol')}
          forwardUse="millilítrar verða að grömmum."
          flippedUse="grömm verða að millilítrum."
        />
      </div>

      <div className="mt-5 rounded-xl border-2 border-amber-300 bg-amber-50 p-5">
        <h3 className="font-semibold text-amber-900">Og eitt hlutfall í viðbót: efnajafnan</h3>
        <p className="mt-2 text-sm text-amber-900">
          Stuðlarnir í stilltri efnajöfnu eru líka hlutfall — en aðeins á milli{' '}
          <strong>móla</strong>, aldrei á milli gramma. Í jöfnunni 2 Mg + O₂ → 2 MgO stendur 2 mól
          Mg á móti 2 mólum MgO. Það er eina hlutfallið í leiknum sem færir þig á milli tveggja
          ólíkra efna, og þess vegna þarftu alltaf að komast inn í mól áður en þú notar það.
        </p>
      </div>

      <button
        type="button"
        onClick={onComplete}
        className="game-btn mt-6 w-full rounded-lg bg-kvenno-orange px-5 py-3 font-semibold text-white hover:bg-kvenno-orange-dark"
      >
        Áfram að æfingum
      </button>
    </div>
  );
}
