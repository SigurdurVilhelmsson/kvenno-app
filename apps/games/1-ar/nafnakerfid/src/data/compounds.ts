// Chemical compounds for nomenclature matching game
export type Difficulty = 'easy' | 'medium' | 'hard';
export type CompoundType = 'ionic' | 'molecular';
export type Category = 'jónefni' | 'sameind' | 'sameindaefni' | 'málmar-breytilega-hleðsla';

export interface Compound {
  formula: string;
  name: string;
  type: CompoundType;
  category: Category;
  difficulty: Difficulty;
  elements: string[];
  info: string;
}

export const COMPOUNDS: Compound[] = [
  // EASY (21 compounds)
  { formula: 'NaCl', name: 'Natríumklóríð', type: 'ionic', category: 'jónefni', difficulty: 'easy', elements: ['Na', 'Cl'], info: 'Málmur + Málmleysingi → Jónefni' },
  { formula: 'H₂O', name: 'Vatn', type: 'molecular', category: 'sameindaefni', difficulty: 'easy', elements: ['H', 'O'], info: 'Eina efnið með sérheiti!' },
  { formula: 'CO₂', name: 'Koldíoxíð', type: 'molecular', category: 'sameindaefni', difficulty: 'easy', elements: ['C', 'O'], info: 'Tvíefni: tvær súrefniseiningar' },
  { formula: 'NH₃', name: 'Ammóníak', type: 'molecular', category: 'sameind', difficulty: 'easy', elements: ['N', 'H'], info: 'Algengt efnasamband' },
  { formula: 'MgO', name: 'Magnesíumoxíð', type: 'ionic', category: 'jónefni', difficulty: 'easy', elements: ['Mg', 'O'], info: 'Málmur + Súrefni → Oxíð' },
  { formula: 'CaCl₂', name: 'Kalsíumklóríð', type: 'ionic', category: 'jónefni', difficulty: 'easy', elements: ['Ca', 'Cl'], info: 'Ca²⁺ þarf tvö Cl⁻ jónir' },
  { formula: 'KBr', name: 'Kalíumbrómíð', type: 'ionic', category: 'jónefni', difficulty: 'easy', elements: ['K', 'Br'], info: 'Endi -íð fyrir tvíefni' },
  { formula: 'LiF', name: 'Litíumflúoríð', type: 'ionic', category: 'jónefni', difficulty: 'easy', elements: ['Li', 'F'], info: 'Einfaldasta jónefnið' },
  { formula: 'CH₄', name: 'Metan', type: 'molecular', category: 'sameind', difficulty: 'easy', elements: ['C', 'H'], info: 'Einfaldasta kolvetnið' },
  { formula: 'O₂', name: 'Súrefni', type: 'molecular', category: 'sameind', difficulty: 'easy', elements: ['O'], info: 'Tvíatóma sameind' },
  { formula: 'N₂', name: 'Nitur', type: 'molecular', category: 'sameind', difficulty: 'easy', elements: ['N'], info: 'Tvíatóma sameind' },
  { formula: 'H₂', name: 'Vetni', type: 'molecular', category: 'sameind', difficulty: 'easy', elements: ['H'], info: 'Léttasta frumefnið' },
  { formula: 'Cl₂', name: 'Klór', type: 'molecular', category: 'sameind', difficulty: 'easy', elements: ['Cl'], info: 'Grænt gas' },
  { formula: 'NaF', name: 'Natríumflúoríð', type: 'ionic', category: 'jónefni', difficulty: 'easy', elements: ['Na', 'F'], info: 'Notað í tannkremi' },
  { formula: 'KCl', name: 'Kalíumklóríð', type: 'ionic', category: 'jónefni', difficulty: 'easy', elements: ['K', 'Cl'], info: 'Líkt og borðsalt' },
  { formula: 'BaO', name: 'Baríumoxíð', type: 'ionic', category: 'jónefni', difficulty: 'easy', elements: ['Ba', 'O'], info: 'Málmoxíð' },
  { formula: 'AlCl₃', name: 'Álklóríð', type: 'ionic', category: 'jónefni', difficulty: 'easy', elements: ['Al', 'Cl'], info: 'Ál hefur +3 hleðslu' },
  { formula: 'Na₂O', name: 'Natríumoxíð', type: 'ionic', category: 'jónefni', difficulty: 'easy', elements: ['Na', 'O'], info: 'Tvö Na⁺ fyrir hvert O²⁻' },
  { formula: 'MgCl₂', name: 'Magnesíumklóríð', type: 'ionic', category: 'jónefni', difficulty: 'easy', elements: ['Mg', 'Cl'], info: 'Algengt salt' },
  { formula: 'CaO', name: 'Kalsíumoxíð', type: 'ionic', category: 'jónefni', difficulty: 'easy', elements: ['Ca', 'O'], info: 'Brennd kalk' },
  { formula: 'Li₂O', name: 'Litíumoxíð', type: 'ionic', category: 'jónefni', difficulty: 'easy', elements: ['Li', 'O'], info: 'Tvö litíum, eitt súrefni' },

  // MEDIUM (18 compounds)
  { formula: 'Al₂O₃', name: 'Áloxíð', type: 'ionic', category: 'jónefni', difficulty: 'medium', elements: ['Al', 'O'], info: 'Tvö ál, þrjú súrefni' },
  { formula: 'Fe₂O₃', name: 'Járn(III)oxíð', type: 'ionic', category: 'málmar-breytilega-hleðsla', difficulty: 'medium', elements: ['Fe', 'O'], info: 'Járn með +3 hleðslu - rust' },
  { formula: 'CuSO₄', name: 'Kopar(II)súlfat', type: 'ionic', category: 'málmar-breytilega-hleðsla', difficulty: 'medium', elements: ['Cu', 'S', 'O'], info: 'Kopar + Súlfat (SO₄²⁻)' },
  { formula: 'Na₂CO₃', name: 'Natríumkarbónat', type: 'ionic', category: 'jónefni', difficulty: 'medium', elements: ['Na', 'C', 'O'], info: 'Sameindajón: CO₃²⁻ (karbónat)' },
  { formula: 'NH₄Cl', name: 'Ammóníumklóríð', type: 'ionic', category: 'jónefni', difficulty: 'medium', elements: ['N', 'H', 'Cl'], info: 'Ammóníum (NH₄⁺) + Klóríð' },
  { formula: 'NaOH', name: 'Natríumhýdroxíð', type: 'ionic', category: 'jónefni', difficulty: 'medium', elements: ['Na', 'O', 'H'], info: 'Sterkt basi, hýdroxíð (OH⁻)' },
  { formula: 'Ca(OH)₂', name: 'Kalsíumhýdroxíð', type: 'ionic', category: 'jónefni', difficulty: 'medium', elements: ['Ca', 'O', 'H'], info: 'Ca²⁺ + tvö OH⁻' },
  { formula: 'KNO₃', name: 'Kalíumnítrat', type: 'ionic', category: 'jónefni', difficulty: 'medium', elements: ['K', 'N', 'O'], info: 'Sameindajón: NO₃⁻ (nítrat)' },
  { formula: 'N₂O₄', name: 'Díniturtetroxíð', type: 'molecular', category: 'sameind', difficulty: 'medium', elements: ['N', 'O'], info: 'Tvö köfnunarefni, fjögur súrefni' },
  { formula: 'SO₂', name: 'Brennisteinsdíoxíð', type: 'molecular', category: 'sameind', difficulty: 'medium', elements: ['S', 'O'], info: 'Mengun frá brennisteinsneitun' },
  { formula: 'K₂SO₄', name: 'Kalíumsúlfat', type: 'ionic', category: 'jónefni', difficulty: 'medium', elements: ['K', 'S', 'O'], info: 'Tvö kalíum + súlfat' },
  { formula: 'ZnO', name: 'Sinkoxíð', type: 'ionic', category: 'jónefni', difficulty: 'medium', elements: ['Zn', 'O'], info: 'Notað í sólarvörn' },
  { formula: 'Na₂SO₄', name: 'Natríumsúlfat', type: 'ionic', category: 'jónefni', difficulty: 'medium', elements: ['Na', 'S', 'O'], info: 'Algengur í sápu' },
  { formula: 'CaCO₃', name: 'Kalsíumkarbónat', type: 'ionic', category: 'jónefni', difficulty: 'medium', elements: ['Ca', 'C', 'O'], info: 'Kalksteinn, skeljabrot' },
  { formula: 'AgCl', name: 'Silfurklóríð', type: 'ionic', category: 'jónefni', difficulty: 'medium', elements: ['Ag', 'Cl'], info: 'Hvítur seti' },
  { formula: 'Mg(NO₃)₂', name: 'Magnesíumnítrat', type: 'ionic', category: 'jónefni', difficulty: 'medium', elements: ['Mg', 'N', 'O'], info: 'Mg²⁺ + tvö NO₃⁻' },
  { formula: 'P₄O₁₀', name: 'Fosfordekoxíð', type: 'molecular', category: 'sameind', difficulty: 'medium', elements: ['P', 'O'], info: 'Fjórir fosfórar, tíu súrefni' },
  { formula: '(NH₄)₂SO₄', name: 'Ammóníumsúlfat', type: 'ionic', category: 'jónefni', difficulty: 'medium', elements: ['N', 'H', 'S', 'O'], info: 'Tvö ammóníum + súlfat' },

  // HARD (20 compounds)
  { formula: 'Fe(NO₃)₃', name: 'Járn(III)nítrat', type: 'ionic', category: 'málmar-breytilega-hleðsla', difficulty: 'hard', elements: ['Fe', 'N', 'O'], info: 'Járn +3, þrjú nítrat' },
  { formula: 'Cu₂O', name: 'Kopar(I)oxíð', type: 'ionic', category: 'málmar-breytilega-hleðsla', difficulty: 'hard', elements: ['Cu', 'O'], info: 'Kopar með +1 hleðslu' },
  { formula: 'Mn₂O₇', name: 'Mangan(VII)oxíð', type: 'ionic', category: 'málmar-breytilega-hleðsla', difficulty: 'hard', elements: ['Mn', 'O'], info: 'Hæsta oxunarstig' },
  { formula: 'Cr₂O₃', name: 'Króm(III)oxíð', type: 'ionic', category: 'málmar-breytilega-hleðsla', difficulty: 'hard', elements: ['Cr', 'O'], info: 'Grænn litur' },
  { formula: 'Pb(NO₃)₂', name: 'Blý(II)nítrat', type: 'ionic', category: 'málmar-breytilega-hleðsla', difficulty: 'hard', elements: ['Pb', 'N', 'O'], info: 'Blý +2, tvö nítrat' },
  { formula: 'HgCl₂', name: 'Kvikasilfur(II)klóríð', type: 'ionic', category: 'málmar-breytilega-hleðsla', difficulty: 'hard', elements: ['Hg', 'Cl'], info: 'Eitrað efni' },
  { formula: 'SnO₂', name: 'Tin(IV)oxíð', type: 'ionic', category: 'málmar-breytilega-hleðsla', difficulty: 'hard', elements: ['Sn', 'O'], info: 'Tin með +4 hleðslu' },
  { formula: 'Co(NO₃)₂', name: 'Kóbolt(II)nítrat', type: 'ionic', category: 'málmar-breytilega-hleðsla', difficulty: 'hard', elements: ['Co', 'N', 'O'], info: 'Kóbolt +2' },
  { formula: 'Al₂(SO₄)₃', name: 'Álsúlfat', type: 'ionic', category: 'jónefni', difficulty: 'hard', elements: ['Al', 'S', 'O'], info: 'Tvö ál, þrjú súlfat' },
  { formula: 'Ca₃(PO₄)₂', name: 'Kalsíumfosfat', type: 'ionic', category: 'jónefni', difficulty: 'hard', elements: ['Ca', 'P', 'O'], info: 'Þrjú kalsíum, tvö fosfat' },
  { formula: 'N₂O₅', name: 'Díniturpentoxíð', type: 'molecular', category: 'sameind', difficulty: 'hard', elements: ['N', 'O'], info: 'Tvö köfnunarefni, fimm súrefni' },
  { formula: 'SF₆', name: 'Brennisteinshexaflúoríð', type: 'molecular', category: 'sameind', difficulty: 'hard', elements: ['S', 'F'], info: 'Eitt brennisteinn, sex flúor' },
  { formula: 'PCl₅', name: 'Fosforpentaklóríð', type: 'molecular', category: 'sameind', difficulty: 'hard', elements: ['P', 'Cl'], info: 'Einn fosfór, fimm klór' },
  { formula: 'IF₇', name: 'Joðheptaflúoríð', type: 'molecular', category: 'sameind', difficulty: 'hard', elements: ['I', 'F'], info: 'Eitt joð, sjö flúor' },
  { formula: 'XeF₄', name: 'Xenontetraflúoríð', type: 'molecular', category: 'sameind', difficulty: 'hard', elements: ['Xe', 'F'], info: 'Göseðlisgas sem myndast efnasambindu' },
  { formula: 'Cl₂O₇', name: 'Díklórheptoxíð', type: 'molecular', category: 'sameind', difficulty: 'hard', elements: ['Cl', 'O'], info: 'Tvö klór, sjö súrefni' },
  { formula: 'NH₄NO₃', name: 'Ammóníumnítrat', type: 'ionic', category: 'jónefni', difficulty: 'hard', elements: ['N', 'H', 'O'], info: 'Notað í áburð' },
  { formula: 'NaHCO₃', name: 'Natríumvetniskarbónat', type: 'ionic', category: 'jónefni', difficulty: 'hard', elements: ['Na', 'H', 'C', 'O'], info: 'Matarsódi' },
  { formula: 'K₂Cr₂O₇', name: 'Kalíumdíkrómat', type: 'ionic', category: 'jónefni', difficulty: 'hard', elements: ['K', 'Cr', 'O'], info: 'Appelsínugulur litur' },
  { formula: 'Fe₃O₄', name: 'Járnoxíð (blandað)', type: 'ionic', category: 'málmar-breytilega-hleðsla', difficulty: 'hard', elements: ['Fe', 'O'], info: 'Segulsteinn, blanda Fe²⁺ og Fe³⁺' },
];

// Fisher-Yates shuffle for reliable randomization
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Helper functions
export function getCompoundsByDifficulty(difficulty: Difficulty): Compound[] {
  return COMPOUNDS.filter(c => c.difficulty === difficulty);
}

export function getRandomCompounds(count: number, difficulty?: Difficulty): Compound[] {
  const pool = difficulty ? getCompoundsByDifficulty(difficulty) : COMPOUNDS;
  const shuffled = shuffle(pool);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
