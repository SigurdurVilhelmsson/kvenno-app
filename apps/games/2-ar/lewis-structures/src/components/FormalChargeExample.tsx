import { LewisStructure } from './LewisStructure';
import type { LewisDrawing } from '../utils/lewisLayout';

/**
 * The worked step Stig 3 opens on, before its first question (docs/REVIEW-QUEUE.md
 * C6, teach before test). Neither molecule is one the level asks about.
 *
 * - Formal charge on CO₂, the textbook's own example (ch. 7, m68740): O=C=O
 *   against O≡C–O. Both give every atom an octet, so formal charge decides.
 *   Stig 3's CO question then meets the other case, where it does not.
 * - Vok on SO₂. Its forms are drawn without formal charges: whether S takes an
 *   expanded octet in SO₂ is argued over, and this step is about the forms, not
 *   about that.
 *
 * Every number on screen is computed from the drawings, so a charge cannot
 * disagree with the structure it labels.
 */

const CO2_DOUBLE: LewisDrawing = {
  central: { symbol: 'C', lonePairs: 0 },
  outer: [
    { symbol: 'O', lonePairs: 2, bond: 'double' },
    { symbol: 'O', lonePairs: 2, bond: 'double' },
  ],
};

const CO2_TRIPLE: LewisDrawing = {
  central: { symbol: 'C', lonePairs: 0 },
  outer: [
    { symbol: 'O', lonePairs: 1, bond: 'triple' },
    { symbol: 'O', lonePairs: 3, bond: 'single' },
  ],
};

const SO2_FORMS: LewisDrawing[] = [
  {
    central: { symbol: 'S', lonePairs: 1 },
    outer: [
      { symbol: 'O', lonePairs: 2, bond: 'double' },
      { symbol: 'O', lonePairs: 3, bond: 'single' },
    ],
  },
  {
    central: { symbol: 'S', lonePairs: 1 },
    outer: [
      { symbol: 'O', lonePairs: 3, bond: 'single' },
      { symbol: 'O', lonePairs: 2, bond: 'double' },
    ],
  },
];

const VALENCE: Record<string, number> = { C: 4, O: 6, S: 6 };
const BOND_ELECTRONS = { none: 0, single: 2, double: 4, triple: 6 } as const;

export interface ChargeLine {
  atom: string;
  valence: number;
  lone: number;
  bonding: number;
  charge: number;
}

/** One line of FC = V − (L + ½B) for each atom of a drawing, central first. */
export function chargeLines(d: LewisDrawing): ChargeLine[] {
  const line = (atom: string, lone: number, bonding: number): ChargeLine => {
    const valence = VALENCE[atom];
    return { atom, valence, lone, bonding, charge: valence - (lone + bonding / 2) };
  };
  return [
    line(
      d.central.symbol,
      2 * d.central.lonePairs,
      d.outer.reduce((s, o) => s + BOND_ELECTRONS[o.bond], 0)
    ),
    ...d.outer.map((o) => line(o.symbol, 2 * o.lonePairs, BOND_ELECTRONS[o.bond])),
  ];
}

/** The same drawing with each atom's formal charge filled in, for the circled badges. */
function withCharges(d: LewisDrawing): LewisDrawing {
  const [central, ...outer] = chargeLines(d);
  return {
    ...d,
    central: { ...d.central, formalCharge: central.charge },
    outer: d.outer.map((o, i) => ({ ...o, formalCharge: outer[i].charge })),
  };
}

const signed = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `−${-n}` : '0');

function Calculation({ drawing, names }: { drawing: LewisDrawing; names: string[] }) {
  return (
    <ul className="text-sm font-mono space-y-0.5 text-warm-800">
      {chargeLines(drawing).map((l, i) => (
        <li key={i}>
          {names[i]}: {l.valence} − ({l.lone} + ½·{l.bonding}) = <strong>{signed(l.charge)}</strong>
        </li>
      ))}
    </ul>
  );
}

export function FormalChargeExample({ onDone }: { onDone: () => void }) {
  return (
    <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 phone:p-3 space-y-5 phone:space-y-3">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-warm-800 phone:text-lg">
          Dæmi á undan: koldíoxíð
        </h2>
        <p className="text-sm text-warm-600 mt-1">
          Hvorki CO₂ né SO₂ kemur fyrir í spurningunum á eftir.
        </p>
      </div>

      <section className="space-y-2">
        <h3 className="font-bold text-warm-800">1. Formleg hleðsla</h3>
        <p className="text-sm text-warm-700">
          Formleg hleðsla er hleðslan sem atóm hefði ef rafeindunum í hverju tengi væri skipt jafnt
          á milli atómanna tveggja. Hún er reiknuð fyrir hvert atóm:
        </p>
        <div className="bg-warm-50 p-3 rounded-lg text-center font-mono">
          <strong>FC = V − (L + ½B)</strong>
        </div>
        <p className="text-xs text-warm-600">
          V = gildisrafeindir, L = óbundnar rafeindir (í stökum pörum), B = bundnar rafeindir (í
          tengjum).
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="font-bold text-warm-800">2. Tvær mögulegar formúlur fyrir CO₂</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <figure className="space-y-2">
            <LewisStructure
              drawing={withCharges(CO2_DOUBLE)}
              label="O=C=O, allar formlegar hleðslur núll"
              maxWidth={220}
              className="mx-auto"
            />
            <figcaption className="text-center text-sm font-semibold text-warm-800">
              O=C=O
            </figcaption>
            <Calculation drawing={CO2_DOUBLE} names={['C', 'O', 'O']} />
          </figure>
          <figure className="space-y-2">
            <LewisStructure
              drawing={withCharges(CO2_TRIPLE)}
              label="O≡C–O, formleg hleðsla +1 á þrítengda O-inu og −1 á eintengda O-inu"
              maxWidth={220}
              className="mx-auto"
            />
            <figcaption className="text-center text-sm font-semibold text-warm-800">
              O≡C–O
            </figcaption>
            <Calculation drawing={CO2_TRIPLE} names={['C', 'O (þrítengt)', 'O (eintengt)']} />
          </figure>
        </div>
        <p className="text-sm text-warm-700">
          Summa formlegu hleðslnanna er 0 í báðum, eins og hún á að vera fyrir óhlaðna sameind. Í
          báðum hefur hvert atóm áttund, svo formleg hleðsla ræður: <strong>O=C=O</strong> er
          æskilegri, því þar eru allar formlegar hleðslur núll.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="font-bold text-warm-800">3. Vok: brennisteinsdíoxíð, SO₂</h3>
        <p className="text-sm text-warm-700">
          Stundum má teikna fleiri en eina jafngilda Lewis-formúlu sem greinast aðeins á því hvar
          tengin liggja. Þær kallast <strong>vokmyndir</strong>. Í SO₂ getur tvítengið verið við
          hvort O-atómið sem er:
        </p>
        <div className="flex justify-center items-center gap-3 phone:flex-col phone:gap-1">
          <LewisStructure
            drawing={SO2_FORMS[0]}
            label="Vokmynd 1 af 2 fyrir SO₂: tvítengið við fyrra O-atómið"
            showFormalCharges={false}
            maxWidth={200}
          />
          <div className="text-2xl text-warm-500 font-bold phone:rotate-90" aria-hidden="true">
            ↔
          </div>
          <LewisStructure
            drawing={SO2_FORMS[1]}
            label="Vokmynd 2 af 2 fyrir SO₂: tvítengið við seinna O-atómið"
            showFormalCharges={false}
            maxWidth={200}
          />
        </div>
        <p className="text-sm text-warm-700">
          Sameindin sveiflast ekki á milli vokmyndanna. Raunveruleg rafeindabygging hennar er alltaf
          meðaltal þeirra, <strong>vokblendingur</strong>, og bæði S–O tengin eru jafnlöng.
        </p>
      </section>

      <button
        onClick={onDone}
        className="w-full bg-kvenno-orange hover:bg-kvenno-orange-600 text-white font-bold py-4 px-6 phone:py-3 rounded-xl transition-colors"
      >
        Áfram í spurningarnar
      </button>
    </div>
  );
}
