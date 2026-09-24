/**
 * Naming a straight carbon chain with methyl branches, as the Sameindasmiður builds it.
 *
 * Everything the builder shows about a chain (its name, its formula, which bonds it may
 * have) is derived here from the chain itself, so the name, the formula and the picture
 * cannot disagree with each other.
 *
 * **The stems are the ones the school's textbook writes the names with** (efnafræði 2e,
 * ch. 20, m68846: etan, própan, bútan, pentan, hexan, heptan, oktan, nónan, dekan), and the
 * alkyne ending is `-ýn` there (`viðskeytið -ýn … 1-bútýn`). The builder used to build names
 * from the English roots `meth`/`eth`/`oct`, so it printed `ethan` and `octen` while Stig 1
 * taught `etan` and `oktan` beside it.
 *
 * **Numbering follows the rule the game states** — "Númeraðu keðjuna svo tvítengi/þrítengi
 * fái lægstu tölu" — and then gives the branches the lowest locants. The chain is always
 * drawn C1 → Cn, but the name is free to count from either end, which is the point of the
 * rule: a double bond between C3 and C4 of four carbons is 1-búten, not "3-búten".
 */

export type BondType = 'single' | 'double' | 'triple';

export interface ChainBond {
  /** Bond between C(position) and C(position + 1), 1-indexed along the drawn chain. */
  position: number;
  type: BondType;
}

export interface Chain {
  carbons: number;
  /** Bonds that are not single may be listed alone; a missing position is a single bond. */
  bonds: ChainBond[];
  /** 1-indexed carbons carrying a methyl branch. */
  branches: number[];
}

/** Chain-length stems as the textbook's names spell them. */
export const CHAIN_STEMS: Record<number, string> = {
  1: 'met',
  2: 'et',
  3: 'próp',
  4: 'bút',
  5: 'pent',
  6: 'hex',
  7: 'hept',
  8: 'okt',
  9: 'nón',
  10: 'dek',
};

/** Endings for the bond type, as in the textbook (`-an`, `-en`, `-ýn`). */
export const BOND_ENDINGS: Record<BondType, string> = {
  single: 'an',
  double: 'en',
  triple: 'ýn',
};

/** Multiplier prefixes for more than one methyl branch (`2,3-dímetýl…`). */
const BRANCH_MULTIPLIERS: Record<number, string> = {
  1: '',
  2: 'dí',
  3: 'trí',
  4: 'tetra',
  5: 'penta',
  6: 'hexa',
  7: 'hepta',
  8: 'okta',
};

export const bondOrder = (type: BondType): number =>
  type === 'single' ? 1 : type === 'double' ? 2 : 3;

function bondTypeAt(bonds: ChainBond[], position: number): BondType {
  return bonds.find((b) => b.position === position)?.type ?? 'single';
}

/** Bonds carbon `k` uses: its chain neighbours, counted by bond order, plus its branch. */
export function bondsUsed(chain: Chain, k: number): number {
  const left = k > 1 ? bondOrder(bondTypeAt(chain.bonds, k - 1)) : 0;
  const right = k < chain.carbons ? bondOrder(bondTypeAt(chain.bonds, k)) : 0;
  return left + right + (chain.branches.includes(k) ? 1 : 0);
}

/** A bond may take `type` only if neither carbon it joins would exceed four bonds. */
export function canSetBond(chain: Chain, position: number, type: BondType): boolean {
  const next: Chain = {
    ...chain,
    bonds: [...chain.bonds.filter((b) => b.position !== position), { position, type }],
  };
  return bondsUsed(next, position) <= 4 && bondsUsed(next, position + 1) <= 4;
}

/**
 * The type a click on a bond moves it to: single → double → triple → single, skipping any
 * type that would give a carbon a fifth bond. A single bond is always possible.
 */
export function nextBondType(chain: Chain, position: number): BondType {
  const cycle: BondType[] = ['single', 'double', 'triple'];
  const current = bondTypeAt(chain.bonds, position);
  for (let step = 1; step < cycle.length; step++) {
    const candidate = cycle[(cycle.indexOf(current) + step) % cycle.length];
    if (candidate === 'single' || canSetBond(chain, position, candidate)) return candidate;
  }
  return 'single';
}

/** A methyl branch goes on an interior carbon that still has a bond to spare. */
export function canAddBranch(chain: Chain, k: number): boolean {
  if (k < 2 || k > chain.carbons - 1 || chain.branches.includes(k)) return false;
  return bondsUsed(chain, k) + 1 <= 4;
}

const SUBSCRIPTS = '₀₁₂₃₄₅₆₇₈₉';
const subscript = (n: number) =>
  String(n)
    .split('')
    .map((d) => SUBSCRIPTS[Number(d)])
    .join('');

/** Molecular formula, `C₄H₁₀` style: a count of 1 is left unwritten, as in `CH₄`. */
export function molecularFormula(chain: Chain): string {
  const totalCarbons = chain.carbons + chain.branches.length;
  let hydrogens = 3 * chain.branches.length;
  for (let k = 1; k <= chain.carbons; k++) hydrogens += 4 - bondsUsed(chain, k);
  const count = (n: number) => (n === 1 ? '' : subscript(n));
  return `C${count(totalCarbons)}H${count(hydrogens)}`;
}

export interface ChainName {
  name: string;
  /** The multiple bond the ending names, with its locant in the numbering the name uses. */
  principal: { type: 'double' | 'triple'; locant: number } | null;
  /** True when the name counts from the Cn end of the drawn chain. */
  reversed: boolean;
}

/** Compare locant lists at the first point of difference; negative when `a` is lower. */
function compareLocants(a: number[], b: number[]): number {
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    if (a[i] !== b[i]) return a[i] - b[i];
  }
  return 0;
}

export function nameChain(chain: Chain): ChainName {
  const n = chain.carbons;
  const multiple = chain.bonds.filter((b) => b.type !== 'single');
  const principalType: 'double' | 'triple' | null = multiple.some((b) => b.type === 'triple')
    ? 'triple'
    : multiple.some((b) => b.type === 'double')
      ? 'double'
      : null;

  const numberings = [false, true].map((reversed) => {
    const bondLocant = (p: number) => (reversed ? n - p : p);
    const atomLocant = (k: number) => (reversed ? n + 1 - k : k);
    const principalLocant = principalType
      ? Math.min(
          ...multiple.filter((b) => b.type === principalType).map((b) => bondLocant(b.position))
        )
      : 0;
    const branchLocants = chain.branches.map(atomLocant).sort((a, b) => a - b);
    return { reversed, principalLocant, branchLocants };
  });

  // Lowest locant for the multiple bond first, then for the branches; forward on a tie.
  const [forward, backward] = numberings;
  const byBond = backward.principalLocant - forward.principalLocant;
  const chosen =
    byBond < 0 ||
    (byBond === 0 && compareLocants(backward.branchLocants, forward.branchLocants) < 0)
      ? backward
      : forward;

  const stem = CHAIN_STEMS[n] ?? `C${n}`;
  const ending = BOND_ENDINGS[principalType ?? 'single'];
  // Two or three carbons leave no choice of position, so the name omits it (própen, etýn).
  const locant = principalType && n >= 4 ? `${chosen.principalLocant}-` : '';
  const parent = `${locant}${stem}${ending}`;

  let name = parent;
  if (chosen.branchLocants.length > 0) {
    const multiplier = BRANCH_MULTIPLIERS[chosen.branchLocants.length] ?? '';
    // A locant after the branch prefix is set off by a hyphen: 4-metýl-1-penten.
    name = `${chosen.branchLocants.join(',')}-${multiplier}metýl${locant ? '-' : ''}${parent}`;
  }

  return {
    name,
    principal: principalType ? { type: principalType, locant: chosen.principalLocant } : null,
    reversed: chosen.reversed,
  };
}

/** A chain's multiple bonds as sorted `position:type`, so two chains compare as strings. */
function unsaturationKey(bonds: ChainBond[]): string {
  return bonds
    .filter((b) => b.type !== 'single')
    .map((b) => `${b.position}:${b.type}`)
    .sort()
    .join(',');
}

/** True when two chains carry the same multiple bonds at the same drawn positions. */
export function sameBondsAsDrawn(a: ChainBond[], b: ChainBond[]): boolean {
  return unsaturationKey(a) === unsaturationKey(b);
}

/**
 * Whether a built unbranched chain is the target molecule.
 *
 * The chain is drawn C1 → Cn, but a name counts from whichever end gives the multiple bond
 * the lowest number — the rule Stig 2 states and the textbook uses ("Við byrjum að telja frá
 * þeim enda keðjunnar sem er næstur tvítenginu"). So C–C–C=C, with the double bond between
 * C3 and C4, is 1-búten and must be graded as 1-búten: `nameChain` above, which the Stig 1
 * builder shows, names it exactly that. On n carbons, bond position p mirrors to n − p.
 */
export function isSameUnbranchedChain(
  built: { carbons: number; bonds: ChainBond[] },
  target: { carbons: number; bonds: ChainBond[] }
): boolean {
  if (built.carbons !== target.carbons) return false;
  const mirrored = target.bonds.map((b) => ({ ...b, position: target.carbons - b.position }));
  return sameBondsAsDrawn(built.bonds, target.bonds) || sameBondsAsDrawn(built.bonds, mirrored);
}
