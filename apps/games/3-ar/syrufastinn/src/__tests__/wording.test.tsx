import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { molarMassOf } from '@shared/utils';

import { clockPastNextGuard } from './next-guard-clock';
import { formatPercent } from '../components/KlofnunBar';
import { PracticeScreen } from '../components/PracticeScreen';
import { UnderstandScreen } from '../components/UnderstandScreen';
import { MONOPROTIC_ACIDS } from '../data/acids';
import { APPLY_PROBLEMS, PRACTICE_PROBLEMS, gradeApply } from '../data/problems';
import { percentDissociation } from '../engine/grade';
import { solveWeakAcid } from '../engine/ka';

/**
 * What the game says, checked against what the game computes.
 *
 * Every test here is a sentence that was wrong on screen: a misconception that
 * described the opposite mistake, a percentage printed as zero beside the bar
 * that gave its real value, two different pH values called the same answer, and
 * Icelandic in the wrong case. Each fails against the text it replaced.
 */

afterEach(() => {
  cleanup();
  document.body.innerHTML = '';
});

clockPastNextGuard();

const gameRoot = join(__dirname, '../..');
const fmt = (n: number, dp: number) => n.toFixed(dp).replace('.', ',');

/** Every source file a student's text can come from, as one whitespace-collapsed string each. */
function sources(): { file: string; text: string }[] {
  const out: { file: string; text: string }[] = [];
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      if (name === '__tests__' || name === 'node_modules') continue;
      if (statSync(path).isDirectory()) walk(path);
      else if (/\.(tsx?|html)$/.test(name)) {
        out.push({ file: path, text: readFileSync(path, 'utf8').replace(/\s+/g, ' ') });
      }
    }
  };
  walk(join(gameRoot, 'src'));
  out.push({
    file: 'index.html',
    text: readFileSync(join(gameRoot, 'index.html'), 'utf8').replace(/\s+/g, ' '),
  });
  return out;
}

/** Play Æfa's first problem to its pH step. */
function toPHStep() {
  render(<PracticeScreen onComplete={() => {}} onBack={() => {}} />);
  const p = PRACTICE_PROBLEMS[0];
  const x = solveWeakAcid(p.acid.ka, p.concentration).hApprox;
  fireEvent.change(screen.getByLabelText('Svar'), {
    target: { value: x.toExponential(2).replace('.', ',') },
  });
  fireEvent.click(screen.getByText('Athuga'));
  fireEvent.click(screen.getByText('Áfram')); // to the 5 % check
  fireEvent.click(screen.getByText('Áfram')); // to pH
  expect(screen.getByText(/Skref 3 af 3/)).toBeTruthy();
  return p;
}

function answer(value: string) {
  fireEvent.change(screen.getByLabelText('Svar'), { target: { value } });
  fireEvent.click(screen.getByText('Athuga'));
}

const misconceptionText = () => screen.queryByText('Algeng villa:')?.parentElement?.textContent;

/** The first match of `re` in `text`, so a failure names the offending words, not the whole file. */
const found = (text: string, re: RegExp) => text.match(re)?.[0];

describe('Æfa feedback', () => {
  it('names the forgotten minus when the pH answer is negative, not when it is above 7', () => {
    // Leaving out the minus gives log₁₀[H⁺], which is negative. The text used to
    // say the mistake showed as "a positive number above 7", the opposite.
    const p = toPHStep();
    answer(`-${fmt(p.answer, 2)}`);
    const text = misconceptionText();
    expect(text).toMatch(/neikvætt/);
    expect(text).toMatch(/mínus/);
    expect(text).not.toMatch(/jákvæð/);

    // A positive wrong answer is some other mistake, and the number does not
    // say which — so the slot stays empty, per CLAUDE.md.
    fireEvent.click(screen.getByText('Reyna aftur'));
    answer(fmt(14 - p.answer, 2));
    expect(screen.getByText('Rangt')).toBeTruthy();
    expect(misconceptionText()).toBeUndefined();
  });

  it('does not print "Algeng villa" twice for a wrong x', () => {
    // FeedbackPanel already prefixes the slot with "Algeng villa:".
    render(<PracticeScreen onComplete={() => {}} onBack={() => {}} />);
    const p = PRACTICE_PROBLEMS[0];
    answer((p.acid.ka * p.concentration).toExponential(2).replace('.', ','));
    const text = misconceptionText() ?? '';
    expect(text).toMatch(/kvaðratrót/);
    expect(text.match(/Algeng villa/g)).toHaveLength(1);
  });

  it('names an x mistake only when the answer is the number that mistake gives', () => {
    // CLAUDE.md: populate the slot where the student's answer shows the mistake,
    // and leave it undefined where it does not. Ka · C is the forgotten root and
    // C is the whole acid; a merely rounded x is neither, and was being told it
    // had forgotten the square root.
    const p = PRACTICE_PROBLEMS[0];
    const x = solveWeakAcid(p.acid.ka, p.concentration).hApprox;
    const cases: [string, RegExp | undefined][] = [
      [(p.acid.ka * p.concentration).toExponential(2), /kvaðratrót/],
      [String(p.concentration), /C sjálfu/],
      [x.toPrecision(1), undefined],
      [(x * 3).toExponential(2), undefined],
    ];
    for (const [value, expected] of cases) {
      render(<PracticeScreen onComplete={() => {}} onBack={() => {}} />);
      answer(value.replace('.', ','));
      expect(screen.getByText('Rangt'), value).toBeTruthy();
      if (expected) expect(misconceptionText(), value).toMatch(expected);
      else expect(misconceptionText(), value).toBeUndefined();
      cleanup();
    }
  });

  it('prints the klofnunarhlutfall the bar prints, including below 0,01 %', () => {
    // Fenól at 1,0 M is Æfa's first problem at 0,0011 %. Two decimals made the
    // sentence say 0,00 % — nothing dissociated — above a bar saying 0,0011 %.
    render(<PracticeScreen onComplete={() => {}} onBack={() => {}} />);
    const p = PRACTICE_PROBLEMS[0];
    expect(p.percentDissociated).toBeLessThan(0.01);
    answer(solveWeakAcid(p.acid.ka, p.concentration).hApprox.toExponential(2).replace('.', ','));
    fireEvent.click(screen.getByText('Áfram'));

    const sentence = screen.getByText(/Klofnunarhlutfallið er/).textContent ?? '';
    expect(sentence).not.toMatch(/0,00 %/);
    expect(sentence).toContain(`${formatPercent(p.percentDissociated)} %`);
    expect(screen.getByRole('img').getAttribute('aria-label')).toContain(
      formatPercent(p.percentDissociated)
    );
  });

  it('never prints a percentage as zero anywhere in Æfa', () => {
    for (const p of PRACTICE_PROBLEMS) {
      expect(formatPercent(p.percentDissociated), p.id).not.toMatch(/^0,0+$/);
    }
  });
});

describe('Skilja', () => {
  const ediksyra = MONOPROTIC_ACIDS.find((a) => a.id === 'ediksyra')!;
  const s = solveWeakAcid(ediksyra.ka, 0.1);

  it('does not call two different pH values the same answer', () => {
    // The premise: 0,100 M ediksýra sits on a rounding boundary, so to two
    // decimals the approximation is 2,87 and the exact root 2,88.
    expect(fmt(s.pHApprox, 2)).not.toBe(fmt(s.pH, 2));

    render(<UnderstandScreen onComplete={() => {}} onBack={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /^4\./ }));
    expect(found(document.body.textContent ?? '', /ósýnileg\p{L}*/u)).toBeUndefined();

    fireEvent.click(screen.getByRole('button', { name: /^5\./ }));
    const green = screen.getByText(/nákvæma jafnan/).textContent ?? '';
    expect(green).not.toMatch(/sama svar/);
    // Whatever it prints, the two values it compares must show their gap.
    const [a, b] = [...green.matchAll(/(\d+,\d+)/g)].slice(1, 3).map((m) => m[1]);
    expect(a).not.toBe(b);
  });
});

describe('Beita text', () => {
  it('writes no decimal separator between superscript digits', () => {
    // `10⁻²·⁸⁷` used a raised dot for the decimal comma, and the same game uses
    // `·` for multiplication — it reads as 10⁻² · 87.
    const superDecimal = /[⁰¹²³⁴⁵⁶⁷⁸⁹][·.,][⁰¹²³⁴⁵⁶⁷⁸⁹]/;
    for (const p of APPLY_PROBLEMS) {
      const text = [p.question, p.explanation, p.misconception ?? ''].join(' ');
      expect(text, p.id).not.toMatch(superDecimal);
    }
    for (const { file, text } of sources()) {
      expect(found(text, superDecimal), file).toBeUndefined();
    }
  });
});

describe('Beita feedback', () => {
  /** `1,3 × 10⁻³` or `0,013`, as the game prints them, back to a number. */
  const readPrinted = (text: string): number => {
    const sup = '⁰¹²³⁴⁵⁶⁷⁸⁹';
    const m = text.match(/^(\d+,\d+)(?: × 10([⁻]?[⁰¹²³⁴⁵⁶⁷⁸⁹]+))?$/u);
    if (!m) throw new Error(`not a printed number: ${text}`);
    const exp = m[2]
      ? Number([...m[2]].map((c) => (c === '⁻' ? '-' : String(sup.indexOf(c)))).join(''))
      : 0;
    return Number(m[1].replace(',', '.')) * 10 ** exp;
  };

  it("names the number each klofnun mistake actually produces at this problem's C", () => {
    // Written when the problem was fenól at 1,0 M, where x/C is x itself, so
    // "1,3 × 10⁻³ means you forgot the 100" was true. At 0,100 M it is not:
    // 1,3 × 10⁻³ · 100 is 0,13, not 1,33.
    const p = APPLY_PROBLEMS.find((q) => q.id === 'apply-klofnun')!;
    const text = p.misconception ?? '';

    const forgot100 = text.match(/var ([\d,]+(?: × 10\S+)?) gleymdirðu að margfalda með 100/u);
    expect(forgot100, 'names the forgot-×100 answer').toBeTruthy();
    const n = readPrinted(forgot100![1]);
    expect(gradeApply(p, n), 'the named answer is wrong').toBe(false);
    expect(gradeApply(p, n * 100), 'and ×100 repairs it').toBe(true);

    const gaveX = text.match(/var ([\d,]+(?: × 10\S+)?) skilaðirðu styrknum x/u);
    expect(gaveX, 'names the returned-x answer').toBeTruthy();
    const x = solveWeakAcid(p.acid.ka, p.concentration).hApprox;
    expect(Math.abs(readPrinted(gaveX![1]) - x) / x).toBeLessThan(0.05);
  });

  it('does not tell every student what their own calculation gave', () => {
    // The explanation is shown whether the answer was right or wrong, so "your
    // calculation gives 1,84 × 10⁻⁵" told a student who typed 1 something false —
    // what grade.ts says feedback may never do.
    const yours = /(?<!\p{L})þ(?:inn|ín|itt|inni|ínu|ínum|íns|innar)(?!\p{L})/u;
    for (const p of APPLY_PROBLEMS) {
      expect(found(p.explanation, yours), p.id).toBeUndefined();
    }
  });
});

describe('Icelandic', () => {
  it('puts the object of "má nota" in the accusative', () => {
    // `nálgunina má nota` — the approximation may be used. With the nominative,
    // `nálgunin má nota` says the approximation may use something. The textbook
    // writes it the accusative way throughout: `Þessa jöfnu má nota`.
    for (const { file, text } of sources()) {
      expect(
        found(text, /\b(?:nálgunin|leiðin)\b[^.;]{0,25}\bmá (?:ekki )?nota\b/),
        file
      ).toBeUndefined();
    }
  });

  it('calls a dilute solution thin, not weak', () => {
    // ordabok.md: dilute solution;þunn lausn. `Veik` is acid strength, and
    // Skilja's last step exists to keep strength and dilution apart.
    for (const { file, text } of sources()) {
      expect(found(text, /\bveik\p{L}* lausn/iu), file).toBeUndefined();
    }
  });
});

describe('the menu', () => {
  it('does not overstate how much of the acid in vinegar dissociates', () => {
    // Vinegar is 4–8 % ediksýra by mass, so roughly 0,7–1,3 M at 1 g/mL. The
    // engine puts that under one percent dissociated; "örfá prósent" was about
    // five times too high.
    const ediksyra = MONOPROTIC_ACIDS.find((a) => a.id === 'ediksyra')!;
    const molar = molarMassOf('C₂H₄O₂');
    for (const massPercent of [4, 5, 8]) {
      const c = (massPercent * 10) / molar;
      expect(percentDissociation(ediksyra.ka, c), `${massPercent} %`).toBeLessThan(1);
    }
    const app = sources().find((s) => s.file.endsWith('App.tsx'))!.text;
    expect(found(app, /örfá prósent/)).toBeUndefined();
    expect(app).toMatch(/innan við eitt prósent klofið/);
  });
});
