/**
 * The problems the Æfa and Beita phases pose.
 *
 * Generated from `ANSWERABLE_PAIRS` rather than typed out, so a problem can
 * never contradict the engine that grades it — the defect `1-ar/molmassi` shipped
 * (B4), where a printed breakdown disagreed with its own total.
 *
 * Two properties are deliberate and are asserted by `problems.test.ts`:
 *
 *  - **Æfa is entirely inside the 5 % rule.** The practice phase teaches the
 *    method; meeting the exception while still learning the method teaches
 *    neither.
 *  - **Beita is not.** The apply phase includes pairs where the rule fails, so
 *    the check the student was taught in Æfa is the thing that saves them. A
 *    rule that never fires is a rule nobody believes.
 */

import { ANSWERABLE_PAIRS, MONOPROTIC_ACIDS, type WeakAcid } from './acids';
import {
  KA_FROM_PH_TOLERANCE,
  KA_RELATIVE_TOLERANCE,
  PERCENT_RELATIVE_TOLERANCE,
  PH_TOLERANCE,
  percentDissociation,
  referencePH,
} from '../engine/grade';
import { pKa, kbFromKa, kaFromMeasuredPH, solveWeakAcid } from '../engine/ka';

export type ApplyKind = 'pH' | 'ka' | 'kb' | 'klofnun';

export interface PHProblem {
  id: string;
  acid: WeakAcid;
  concentration: number;
  /** The pH the game quotes — approximation where licensed, exact where not. */
  answer: number;
  /** Klofnunarhlutfall at this pair, in percent. */
  percentDissociated: number;
  /** Whether the 5 % rule licenses the approximation here. */
  approximationValid: boolean;
}

function toProblem(acid: WeakAcid, concentration: number): PHProblem {
  const s = solveWeakAcid(acid.ka, concentration);
  return {
    id: `${acid.id}-${concentration}`,
    acid,
    concentration,
    answer: referencePH(acid.ka, concentration),
    percentDissociated: percentDissociation(acid.ka, concentration),
    approximationValid: s.approximationValid,
  };
}

const ALL = ANSWERABLE_PAIRS.map(({ acid, concentration }) => toProblem(acid, concentration));

/**
 * Æfa: five problems, all inside the 5 % rule, ordered from the most
 * comfortable margin to the tightest — so the last one is nearly at the line
 * and the check starts to feel like it is doing something before Beita makes it.
 */
export const PRACTICE_PROBLEMS: PHProblem[] = ALL.filter((p) => p.approximationValid)
  .sort((a, b) => a.percentDissociated - b.percentDissociated)
  .filter((_, i, arr) => {
    // Five evenly spaced through the sorted set, so the sequence spans the range
    // rather than clustering at one end.
    const step = Math.floor(arr.length / 5);
    return i % Math.max(step, 1) === 0;
  })
  .slice(0, 5);

/** The pairs where the rule fails. Beita's whole point. */
export const RULE_BREAKING_PROBLEMS: PHProblem[] = ALL.filter((p) => !p.approximationValid).sort(
  (a, b) => a.percentDissociated - b.percentDissociated
);

export interface ApplyProblem {
  id: string;
  kind: ApplyKind;
  acid: WeakAcid;
  concentration: number;
  /** What the student is asked, in Icelandic. */
  question: string;
  /**
   * The graded value, **always computed from the engine**, never typed in.
   *
   * A hand-entered answer is how a question comes to disagree with its own
   * grader: `apply-ka` originally stored the tidy 1,8 × 10⁻⁵ while asking for Ka
   * from a pH of 2,87, which actually implies 1,84 × 10⁻⁵. A student doing the
   * arithmetic correctly would have been marked wrong.
   */
  answer: number;
  /** How this answer is compared. pH is a log, so it is absolute; the rest are relative. */
  grading: { mode: 'absolute' | 'relative'; tolerance: number };
  /** Unit or format hint shown beside the field. */
  answerHint: string;
  /** Shown once answered, whether right or wrong. */
  explanation: string;
  /**
   * Named only where the student's likely wrong answer is diagnosable from the
   * problem itself. Left undefined elsewhere — `CLAUDE.md`'s rule, and the
   * reason the misconception slot renders outside the collapse.
   */
  misconception?: string;
  approximationValid: boolean;
}

/** Icelandic decimal comma, since that is what the games print and accept. */
const fmt = (n: number, dp: number) => n.toFixed(dp).replace('.', ',');

const SUPERSCRIPT: Record<string, string> = {
  '-': '⁻',
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
};

/** `1,8 × 10⁻⁵` — real superscripts, the way the rest of the library prints them. */
const sci = (n: number) => {
  const exp = Math.floor(Math.log10(n));
  const mant = n / Math.pow(10, exp);
  const sup = String(exp)
    .split('')
    .map((c) => SUPERSCRIPT[c] ?? c)
    .join('');
  return `${fmt(mant, 1)} × 10${sup}`;
};

/**
 * Beita: one of each kind, plus every rule-breaking pair.
 *
 * The rule-breakers come last and are the reason the phase exists: a student who
 * substitutes √(Ka·C) without checking gets them wrong, and the feedback says
 * which check they skipped rather than only that the number is off.
 */
export const APPLY_PROBLEMS: ApplyProblem[] = (() => {
  const out: ApplyProblem[] = [];
  const ediksyra = MONOPROTIC_ACIDS.find((a) => a.id === 'ediksyra')!;
  const propansyra = MONOPROTIC_ACIDS.find((a) => a.id === 'propansyra')!;
  const fenol = MONOPROTIC_ACIDS.find((a) => a.id === 'fenol')!;

  out.push({
    id: 'apply-ph',
    kind: 'pH',
    acid: propansyra,
    concentration: 0.25,
    question: `Hvert er pH í 0,25 M lausn af ${propansyra.name.toLowerCase()} (Ka = ${sci(propansyra.ka)})?`,
    answer: referencePH(propansyra.ka, 0.25),
    grading: { mode: 'absolute', tolerance: PH_TOLERANCE },
    answerHint: 'pH, tveir aukastafir',
    explanation:
      `x = √(Ka · C) = √(${sci(propansyra.ka)} · 0,25) og pH = −log x. ` +
      `Klofnunarhlutfallið er ${fmt(percentDissociation(propansyra.ka, 0.25), 2)} %, ` +
      'vel innan 5 %, svo nálgunin má nota.',
    approximationValid: true,
  });

  out.push({
    id: 'apply-ka',
    kind: 'ka',
    acid: ediksyra,
    concentration: 0.1,
    question:
      'Þú mælir pH = 2,87 í 0,100 M lausn af óþekktri veikri sýru. Hver er sýrufasti hennar Ka?',
    // Computed from the pH the question states, not from the acid's table value.
    // Those differ — 1,84 × 10⁻⁵ against 1,8 × 10⁻⁵ — because 2,87 is itself
    // rounded, and the graded answer has to be the one the question implies.
    answer: kaFromMeasuredPH(2.87, 0.1),
    grading: { mode: 'relative', tolerance: KA_FROM_PH_TOLERANCE },
    answerHint: 'Ka, t.d. 1,8e-5',
    explanation:
      '[H⁺] = 10⁻²·⁸⁷ = 1,3 × 10⁻³ M. Ka = x² / (C − x) = 1,8 × 10⁻⁵ — þetta er ediksýra. ' +
      'Þetta er áttin sem sýrufastinn er raunverulega ákvarðaður í: mælt pH, reiknaður Ka. ' +
      'Taflan gefur 1,8 × 10⁻⁵; útreikningurinn þinn gefur 1,84 × 10⁻⁵ og bæði teljast rétt, ' +
      'því pH upp á tvo aukastafi ræður ekki við fleiri markverða stafi en það.',
    misconception:
      'Ef svarið þitt var 1,3 × 10⁻³ þá skilaðirðu [H⁺], ekki Ka. Ka er hlutfallið x²/(C − x), ekki styrkurinn sjálfur.',
    approximationValid: true,
  });

  out.push({
    id: 'apply-kb',
    kind: 'kb',
    acid: ediksyra,
    concentration: 0.1,
    question: `Basafasti Kb fyrir ${ediksyra.conjugateBaseName} (samoka basa ${ediksyra.name.toLowerCase()}, Ka = ${sci(ediksyra.ka)}) — hver er hann?`,
    answer: kbFromKa(ediksyra.ka),
    grading: { mode: 'relative', tolerance: KA_RELATIVE_TOLERANCE },
    answerHint: 'Kb, t.d. 5,6e-10',
    explanation:
      'Ka · Kb = Kw = 1,0 × 10⁻¹⁴, svo Kb = Kw / Ka = 5,6 × 10⁻¹⁰. ' +
      'Það er engin sérstök basareikningsfræði að læra — bara þetta samband.',
    misconception:
      'Ef þú dróst frá í stað þess að deila: sambandið er margföldun, Ka · Kb = Kw. Í pK-formi verður það pKa + pKb = 14, og þá má leggja saman.',
    approximationValid: true,
  });

  out.push({
    id: 'apply-klofnun',
    kind: 'klofnun',
    acid: ediksyra,
    concentration: 0.1,
    question: `Hversu hátt er klofnunarhlutfall 0,100 M lausnar af ${ediksyra.name.toLowerCase()} (Ka = ${sci(ediksyra.ka)})? Svaraðu í prósentum.`,
    answer: percentDissociation(ediksyra.ka, 0.1),
    grading: { mode: 'relative', tolerance: PERCENT_RELATIVE_TOLERANCE },
    answerHint: '% af sýrunni',
    explanation:
      `x = √(Ka · C) = 1,3 × 10⁻³ M og klofnunarhlutfallið er x/C = ${fmt(percentDissociation(ediksyra.ka, 0.1), 2)} %. ` +
      `Til samanburðar klofnar ${fenol.name.toLowerCase()} aðeins ` +
      `${fmt(percentDissociation(fenol.ka, 1.0), 4)} % í 1,0 M lausn — þúsundfalt minna, og samt er sú lausn súr.`,
    misconception:
      'Ef svarið þitt var 1,3 × 10⁻³ gleymdirðu að margfalda með 100. Klofnunarhlutfallið er x/C sem prósenta, ekki x sjálft.',
    approximationValid: true,
  });

  for (const p of RULE_BREAKING_PROBLEMS) {
    const s = solveWeakAcid(p.acid.ka, p.concentration);
    out.push({
      id: `apply-break-${p.id}`,
      kind: 'pH',
      acid: p.acid,
      concentration: p.concentration,
      question: `Hvert er pH í ${fmt(p.concentration, 3)} M lausn af ${p.acid.name.toLowerCase()} (Ka = ${sci(p.acid.ka)})? Athugaðu 5 % regluna áður en þú svarar.`,
      answer: p.answer,
      grading: { mode: 'absolute', tolerance: PH_TOLERANCE },
      answerHint: 'pH, tveir aukastafir',
      explanation:
        `Klofnunarhlutfallið er ${fmt(p.percentDissociated, 2)} % — yfir 5 %, svo nálgunin má ekki nota hér. ` +
        `√(Ka · C) gefur pH = ${fmt(s.pHApprox, 2)}, en rétta svarið úr annars stigs jöfnunni er ${fmt(s.pH, 2)}.`,
      misconception: `Ef þú svaraðir ${fmt(s.pHApprox, 2)} notaðirðu √(Ka · C). Það er nálgunin, og hún byggir á að x sé hverfandi miðað við C — en hér er x ${fmt(p.percentDissociated, 1)} % af C. Leystu x² + Ka·x − Ka·C = 0.`,
      approximationValid: false,
    });
  }

  return out;
})();

/** Every concentration of one acid, for the Kanna phase's constant-Ka table. */
export function exploreSeries(acid: WeakAcid): PHProblem[] {
  return ALL.filter((p) => p.acid.id === acid.id).sort((a, b) => b.concentration - a.concentration);
}

/** Acids the Kanna phase may offer — those with enough concentrations to show a trend. */
export const EXPLORABLE_ACIDS = MONOPROTIC_ACIDS.filter((a) => exploreSeries(a).length >= 3);

export { pKa };

/**
 * Grade an Apply answer by the rule the problem itself declares.
 *
 * One entry point, so a screen cannot invent its own comparison and drift from
 * the data — the `1-ar/dimensional-analysis` lesson, where `handleSubmit` and
 * `getDetailedFeedback` each computed the answer and could disagree.
 */
export function gradeApply(problem: ApplyProblem, value: number): boolean {
  if (!Number.isFinite(value)) return false;
  const { mode, tolerance } = problem.grading;
  return mode === 'absolute'
    ? Math.abs(value - problem.answer) <= tolerance
    : Math.abs(value - problem.answer) <= Math.abs(problem.answer) * tolerance;
}
