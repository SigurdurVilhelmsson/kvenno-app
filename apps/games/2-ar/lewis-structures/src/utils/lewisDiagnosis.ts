/**
 * What is wrong with a student's Lewis drawing, said by the rules rather than
 * by the answer key.
 *
 * Stig 2 used to answer a wrong drawing with the key itself — "O–H₂: Ekkert →
 * ætti að vera Einfalt", "O: 0 pör → ætti að vera 2" — which a student could
 * copy back and be marked right without having reasoned about anything. These
 * messages name the rule a drawing breaks instead: electrons spent that the
 * molecule does not have, electrons left over, an atom with no bond, an atom
 * whose shell is not full. The key itself is only offered after a second miss,
 * by the canvas, and a molecule solved that way is not counted as solved.
 *
 * Each atom's target is derived from the correct structure the same way the
 * student's count is derived from the drawing, so the exceptions (BF₃'s 6,
 * PCl₅'s 10, SF₆'s 12, NO's 7) need no list of their own.
 */

export type BondType = 'none' | 'single' | 'double' | 'triple';

export const BOND_E: Record<BondType, number> = { none: 0, single: 2, double: 4, triple: 6 };

export interface DiagnosisStructure {
  centralAtom: string;
  surroundingAtoms: { symbol: string; bondType: Exclude<BondType, 'none'>; lonePairs: number }[];
  centralLonePairs: number;
  centralUnpairedElectron?: boolean;
}

export interface DrawingState {
  bonds: BondType[];
  centralLP: number;
  surroundingLP: number[];
}

/** "1 rafeind", "2 rafeindir", "21 rafeind": the count agrees with its last digit. */
export const electronCount = (n: number): string =>
  `${n} ${n % 10 === 1 && n % 100 !== 11 ? 'rafeind' : 'rafeindir'}`;

/** Electrons the drawing places around each atom: every bond it takes part in, and its own pairs. */
function electronsAround(
  state: DrawingState,
  unpairedShown: boolean
): { central: number; surrounding: number[] } {
  return {
    central:
      state.bonds.reduce((s, b) => s + BOND_E[b], 0) +
      state.centralLP * 2 +
      (unpairedShown ? 1 : 0),
    surrounding: state.bonds.map((b, i) => BOND_E[b] + state.surroundingLP[i] * 2),
  };
}

/** The same count, taken from the correct structure: what each atom should end up with. */
export function targetElectrons(structure: DiagnosisStructure): {
  central: number;
  surrounding: number[];
} {
  return electronsAround(
    {
      bonds: structure.surroundingAtoms.map((a) => a.bondType),
      centralLP: structure.centralLonePairs,
      surroundingLP: structure.surroundingAtoms.map((a) => a.lonePairs),
    },
    !!structure.centralUnpairedElectron
  );
}

/**
 * The rule-based messages for a drawing that is not the correct one, most
 * basic first. Empty only when the drawing is correct. `label(i)` names outer
 * atom i as the controls do (F₁, F₂, …).
 */
export function diagnoseDrawing(
  molecule: string,
  totalElectrons: number,
  structure: DiagnosisStructure,
  state: DrawingState,
  label: (i: number) => string
): string[] {
  const used =
    state.bonds.reduce((s, b) => s + BOND_E[b], 0) +
    state.centralLP * 2 +
    state.surroundingLP.reduce((s, lp) => s + lp * 2, 0);
  const remaining = totalElectrons - used;
  // A radical's odd electron is drawn by the canvas once exactly one is left.
  const unpairedShown = !!structure.centralUnpairedElectron && remaining === 1;

  const messages: string[] = [];
  const central = structure.centralAtom;

  if (remaining < 0) {
    messages.push(
      `Þú hefur notað ${electronCount(used)}, en ${molecule} hefur aðeins ${totalElectrons} gildisrafeindir til ráðstöfunar.`
    );
  }

  state.bonds.forEach((b, i) => {
    if (b === 'none') {
      messages.push(
        `${label(i)} er ekki tengt ${central}. Hvert ytra atóm þarf að minnsta kosti eitt tengi.`
      );
    }
  });

  if (remaining > 0 && !unpairedShown) {
    messages.push(
      remaining === 1
        ? `Ein rafeind er enn ónotuð. Allar gildisrafeindirnar eiga heima í formúlunni — í tengjum eða stökum pörum.`
        : `${electronCount(remaining)} eru enn ónotaðar. Allar gildisrafeindirnar eiga heima í formúlunni — í tengjum eða stökum pörum.`
    );
  }

  const have = electronsAround(state, unpairedShown);
  const want = targetElectrons(structure);
  const atomMessage = (name: string, symbol: string, n: number, target: number): string | null => {
    if (n === target || n === 0) return null; // 0: an unbonded atom, said above
    if (symbol === 'H') {
      return `${name} hefur ${electronCount(n)} í kringum sig. Vetni rúmar aðeins 2 — eitt eintengi og engin stök pör.`;
    }
    if (target === 8) {
      return `${name} hefur ${electronCount(n)} í kringum sig — áttureglan krefst 8.`;
    }
    return `${name} hefur ${electronCount(n)} í kringum sig, en í ${molecule} á ${symbol} að hafa ${target}.`;
  };
  const centralMsg = atomMessage(central, central, have.central, want.central);
  if (centralMsg) messages.push(centralMsg);
  structure.surroundingAtoms.forEach((atom, i) => {
    const msg = atomMessage(label(i), atom.symbol, have.surrounding[i], want.surrounding[i]);
    if (msg) messages.push(msg);
  });

  const isCorrect =
    structure.surroundingAtoms.every(
      (a, i) => state.bonds[i] === a.bondType && state.surroundingLP[i] === a.lonePairs
    ) && state.centralLP === structure.centralLonePairs;

  // Every electron placed and every atom at its count, yet not the structure:
  // the bonds are shared out unevenly (O≡C–O for CO₂). That is a formal-charge
  // question, which Stig 3 teaches; here it is named, not solved.
  if (!isCorrect && messages.length === 0) {
    messages.push(
      `Allar rafeindirnar eru notaðar og hvert atóm hefur rétta tölu í kringum sig — en ${molecule} á sér betri formúlu. Prófaðu að dreifa tengjunum öðruvísi: best er þegar formhleðsla hvers atóms er sem næst núlli.`
    );
  }

  return isCorrect ? [] : messages;
}
