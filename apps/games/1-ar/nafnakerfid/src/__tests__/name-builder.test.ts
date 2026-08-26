import { describe, it, expect } from 'vitest';

import { COMPOUNDS, type Compound } from '../data/compounds';
import { MORPHEMES, segmentName, type Morpheme } from '../data/naming';

/**
 * Level 3 must be able to pose every question it draws.
 *
 * It asks the student to build a compound's name by clicking parts. Those parts
 * used to be improvised from the compound's element symbols, which could not
 * express a Roman numeral, a polyatomic ion, several metals, or an elided
 * prefix — so **33 of the 51 compounds in the pool could not be assembled from
 * the parts offered**, and could never be marked correct. A student met roughly
 * six unanswerable questions in a run of ten.
 *
 * The fix is that the parts now come from the name's own decomposition. This
 * file is what keeps that true: it drives the real inventory over the real pool,
 * so a compound whose name needs a morpheme nobody declared fails here rather
 * than becoming an ungradeable question.
 */

/** The pool Level 3 actually draws from. */
const POOL: Compound[] = COMPOUNDS.filter((c) => !c.excludeFromNameBuilder);

/**
 * What Level 3 shows and grades: the parts concatenated, with the first letter
 * capitalised (`Level3.tsx`'s `displayName`). Everything after that first letter
 * has to be right in the parts themselves — which is why the Roman numerals are
 * stored uppercase.
 */
const built = (segments: Morpheme[]) => {
  const joined = segments.map((m) => m.text).join('');
  return joined.charAt(0).toUpperCase() + joined.slice(1);
};

describe('every compound in the pool can be built', () => {
  it('has the pool it is meant to check', () => {
    expect(POOL.length).toBe(52);
    expect(COMPOUNDS.length - POOL.length).toBe(7);
  });

  it.each(POOL.map((c) => [c.formula, c] as const))('%s', (_formula, compound) => {
    const segments = segmentName(compound.name);
    expect(
      segments,
      `"${compound.name}" cannot be built from the naming morphemes — declare the missing one in naming.ts`
    ).not.toBeNull();

    // The parts must spell the name exactly. Level 3 grades on string equality
    // against `compound.name`, so anything less is still an unanswerable
    // question, just a subtler one.
    expect(built(segments!)).toBe(compound.name);
  });

  it('splits into more than one part, or it is not a building exercise', () => {
    for (const compound of POOL) {
      expect(segmentName(compound.name)!.length, compound.formula).toBeGreaterThan(1);
    }
  });
});

describe('the cases the old builder could not express', () => {
  const segmentsOf = (formula: string) => {
    const compound = COMPOUNDS.find((c) => c.formula === formula);
    expect(compound, formula).toBeDefined();
    return segmentName(compound!.name)!.map((m) => `${m.text}:${m.kind}`);
  };

  it('splits a Roman numeral off as its own part', () => {
    expect(segmentsOf('Fe₂O₃')).toEqual(['járn:root', '(III):charge', 'oxíð:root']);
    expect(segmentsOf('Cu₂O')).toEqual(['kopar:root', '(I):charge', 'oxíð:root']);
    expect(segmentsOf('SnO₂')).toEqual(['tin:root', '(IV):charge', 'oxíð:root']);
  });

  it('handles the mixed-valence pair, which used to be excluded outright', () => {
    expect(segmentsOf('Fe₃O₄')).toEqual(['járn:root', '(II,III):charge', 'oxíð:root']);
  });

  it('keeps a polyatomic ion whole', () => {
    expect(segmentsOf('K₂SO₄')).toEqual(['kalíum:root', 'súlfat:ion']);
    expect(segmentsOf('NaHCO₃')).toEqual(['natríum:root', 'vetniskarbónat:ion']);
    expect(segmentsOf('(NH₄)₂SO₄')).toEqual(['ammóníum:ion', 'súlfat:ion']);
    expect(segmentsOf('Ca₃(PO₄)₂')).toEqual(['kalsíum:root', 'fosfat:ion']);
  });

  it('offers the elided prefix as it is written, not as prefix plus oxíð', () => {
    // deka + oxíð concatenates to "dekaoxíð", which is not the word. This is the
    // reason the elided forms are single morphemes.
    expect(segmentsOf('P₄O₁₀')).toEqual(['tetra:prefix', 'fosfór:root', 'dekoxíð:root']);
    expect(segmentsOf('N₂O₄')).toEqual(['dí:prefix', 'nitur:root', 'tetroxíð:root']);
    expect(segmentsOf('N₂O₅')).toEqual(['dí:prefix', 'nitur:root', 'pentoxíð:root']);
    expect(segmentsOf('Cl₂O₇')).toEqual(['dí:prefix', 'klór:root', 'heptoxíð:root']);
  });

  it('uses the first-element stem where it differs from the anion', () => {
    // Sulfur is súlfíð as an anion but brennisteins- when it comes first.
    expect(segmentsOf('SO₂')).toEqual(['brennisteins:root', 'dí:prefix', 'oxíð:root']);
    expect(segmentsOf('SF₆')).toEqual(['brennisteins:root', 'hexa:prefix', 'flúoríð:root']);
    expect(segmentsOf('IF₇')).toEqual(['joð:root', 'hepta:prefix', 'flúoríð:root']);
  });

  it('names the metals the old root table had no entry for', () => {
    for (const formula of ['Mn₂O₇', 'Cr₂O₃', 'Pb(NO₃)₂', 'HgCl₂', 'SnO₂', 'Co(NO₃)₂']) {
      expect(segmentsOf(formula).length, formula).toBeGreaterThan(1);
    }
  });
});

describe('segmentName refuses what it cannot build', () => {
  it('returns null for a trivial name with no parts', () => {
    expect(segmentName('Vatn')).toBeNull();
    expect(segmentName('Metan')).toBeNull();
  });

  it('returns null rather than a partial answer', () => {
    // A greedy walk that consumed "natríum" and then gave up would be worse than
    // useless here: it would hand the student a tray that cannot spell the name.
    expect(segmentName('natríumzzz')).toBeNull();
  });

  it('backtracks out of a longer match that leads nowhere', () => {
    // "dí" also opens "díkrómat"; taking the longer one first must not strand
    // the walk on a name that genuinely starts with the short prefix.
    expect(segmentName('díkrómat')!.map((m) => m.text)).toEqual(['díkrómat']);
    expect(segmentName('dínituroxíð')!.map((m) => m.text)).toEqual(['dí', 'nitur', 'oxíð']);
  });
});

describe('the morpheme inventory', () => {
  it('holds no duplicate text', () => {
    const seen = new Set<string>();
    for (const morpheme of MORPHEMES) {
      const key = morpheme.text.toLowerCase();
      expect(seen.has(key), `${morpheme.text} declared twice`).toBe(false);
      seen.add(key);
    }
  });

  it('holds no empty morpheme, which would make the walk loop forever', () => {
    for (const morpheme of MORPHEMES) {
      expect(morpheme.text.length).toBeGreaterThan(0);
    }
  });

  it('writes Roman numerals in the case the name uses', () => {
    // The parts are concatenated verbatim and shown to the student, so a
    // lowercase "(iii)" would grade correct — comparison is case-insensitive —
    // while displaying a name that is not how the compound is written.
    const romans = MORPHEMES.filter((m) => m.kind === 'charge');
    expect(romans.length).toBeGreaterThan(0);
    for (const roman of romans) {
      expect(roman.text).toMatch(/^\([IVX]+(,[IVX]+)*\)$/);
    }
  });

  it('carries every morpheme the pool needs and nothing dead', () => {
    // Anything in the inventory that no name uses is still legitimate — it works
    // as a distractor — but it should be a real naming form, not a leftover.
    // Pinned so that adding a morpheme is a deliberate act with a visible list.
    //
    // `deka` is the interesting one: no name uses it, because P₄O₁₀ takes the
    // elided `dekoxíð`. It is exactly the distractor that case wants — a student
    // reaching for deka + oxíð builds "dekaoxíð", which is the mistake.
    const used = new Set(
      POOL.flatMap((c) => segmentName(c.name) ?? []).map((m) => m.text.toLowerCase())
    );
    const unused = MORPHEMES.filter((m) => !used.has(m.text.toLowerCase())).map((m) => m.text);
    expect(unused.sort()).toEqual(
      ['deka', 'joðíð', 'mónó', 'nóna', 'okta', 'súlfíð', 'trí', 'vetni'].sort()
    );
  });
});
