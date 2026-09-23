// @vitest-environment jsdom
/**
 * Level 3 grades what each item asks, the way the student writes it.
 *
 * Four defects, each found by playing the real component:
 *
 * 1. **The significant-figure panel counted the decimal comma as a digit.** It
 *    used a second counter that knew only the full stop, so `0,125` — the
 *    form the course teaches — was four figures, and a correct three-figure
 *    answer got the red panel. Stig 0 teaches the rule from `utils/sigfigs.ts`;
 *    Level 3 now counts with it.
 * 2. **The scientific-notation item graded `1,08 × 10⁹` as 1,08.** One field
 *    read with `parseStudentNumber`, which stops at the `×`, so the notation
 *    Stig 0 teaches was marked wrong; only an `e` form passed, and a phone's
 *    decimal keypad cannot type one. It now takes Stig 0's two-field row.
 * 3. **The submit button asked for what the item does not grade.** A reverse
 *    item demanded a typed number it never read, and neither a reverse nor an
 *    efficiency item needed its choice made before it could be sent.
 * 4. **The correct choice sat in the same place.** A correct route came first
 *    on both reverse items and the efficient path first on four of five
 *    efficiency items. They are shuffled now, and grading reads the order shown.
 *
 * Queries are scoped to the rendered container: the repo runs vitest with
 * `retry: 2`, and a failed attempt's DOM would otherwise make document-wide
 * queries ambiguous (see `docs/README.md`).
 */

import { cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Level3 } from '../components/Level3';
import { level3Challenges, type Level3Challenge } from '../data/challenges';

const run = vi.hoisted(() => ({ current: [] as Level3Challenge[] }));
vi.mock('../utils/level3Run', () => ({
  LEVEL_3_RUN_LENGTH: 12,
  buildLevel3Run: () => run.current,
}));

const STARTED = {
  problemsCompleted: 0,
  compositeScores: [],
  totalSteps: 0,
  achievements: [],
  mastered: false,
  hintsUsed: 0,
};

const EXPLANATION = 'Ég umbreytti einingunum skref fyrir skref með stuðlum.';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function byId(id: string): Level3Challenge {
  const item = level3Challenges.find((c) => c.id === id);
  if (!item) throw new Error(`${id} is not in the pool`);
  return item;
}

function play(item: Level3Challenge) {
  run.current = [item];
  const onCorrectAnswer = vi.fn();
  const onIncorrectAnswer = vi.fn();
  const { container } = render(
    <Level3
      onComplete={vi.fn()}
      onBack={vi.fn()}
      initialProgress={{ ...STARTED }}
      onCorrectAnswer={onCorrectAnswer}
      onIncorrectAnswer={onIncorrectAnswer}
    />
  );
  const view = within(container);
  const explain = () =>
    fireEvent.change(view.getByLabelText(/Útskýring/), { target: { value: EXPLANATION } });
  const submitButton = () => view.getByRole('button', { name: /Senda inn/ }) as HTMLButtonElement;
  return { view, explain, submitButton, onCorrectAnswer, onIncorrectAnswer };
}

describe('the significant-figure panel reads the decimal comma', () => {
  // L3-4: 50,0 mL × 2,50 g/mL, in kg — 0,125, to three figures.
  it.each(['0,125', '0.125'])('counts %s as three figures, which is what it is', (typed) => {
    const { view, explain, submitButton } = play(byId('L3-4'));
    fireEvent.change(view.getByLabelText('Þitt svar:'), { target: { value: typed } });
    explain();
    fireEvent.click(submitButton());
    expect(view.getByText(/Markverðir stafir réttir/)).toBeTruthy();
    expect(view.getByText(/Þitt svar: 3 stafir/)).toBeTruthy();
  });

  it('still names a precision that is actually wrong', () => {
    const { view, explain, submitButton } = play(byId('L3-4'));
    fireEvent.change(view.getByLabelText('Þitt svar:'), { target: { value: '0,1250' } });
    explain();
    fireEvent.click(submitButton());
    expect(view.getByText(/Markverðir stafir rangir/)).toBeTruthy();
    expect(view.getByText(/Þitt svar: 4 stafir/)).toBeTruthy();
  });
});

describe('the scientific-notation item takes digits and a power of ten', () => {
  // L3-6: the speed of light in km/klst, 1,08 × 10⁹.
  function answer(digits: string, power = '') {
    const game = play(byId('L3-6'));
    fireEvent.change(game.view.getByLabelText('Þitt svar'), { target: { value: digits } });
    fireEvent.change(game.view.getByLabelText('Veldisvísir'), { target: { value: power } });
    game.explain();
    fireEvent.click(game.submitButton());
    return game;
  }

  it.each([
    ['1,08', '9'],
    ['10,8', '8'],
    ['1.08', '9'],
    ['1080000000', ''],
  ])('grades %s × 10^%s correct', (digits, power) => {
    const { view, onCorrectAnswer } = answer(digits, power);
    expect(view.getByText('Svarið er rétt!')).toBeTruthy();
    expect(onCorrectAnswer).toHaveBeenCalled();
  });

  it.each([
    ['1,08', ''], // the digits alone: a billionth of the answer
    ['1,08', '8'], // a power of ten out
    ['0', ''],
    ['2,16', '9'], // double
    ['5,4', '8'], // half
  ])('grades %s × 10^%s wrong', (digits, power) => {
    const { view } = answer(digits, power);
    expect(view.getByText('Svarið er ekki alveg rétt')).toBeTruthy();
  });

  it('sends the whole printed form typed into one field back, instead of reading 1,08', () => {
    const { view, onCorrectAnswer, onIncorrectAnswer } = answer('1,08 × 10⁹');
    expect(view.getByText(/ekki hægt að lesa sem tölu/)).toBeTruthy();
    expect(view.queryByText(/Svarið er/)).toBeNull();
    expect(onCorrectAnswer).not.toHaveBeenCalled();
    expect(onIncorrectAnswer).not.toHaveBeenCalled();
    // Editing clears the prompt, and the item is still there to answer.
    fireEvent.change(view.getByLabelText('Þitt svar'), { target: { value: '1,08' } });
    expect(view.queryByText(/ekki hægt að lesa sem tölu/)).toBeNull();
    fireEvent.change(view.getByLabelText('Veldisvísir'), { target: { value: '9' } });
    fireEvent.click(view.getByRole('button', { name: /Senda inn/ }));
    expect(view.getByText('Svarið er rétt!')).toBeTruthy();
  });

  it('offers no example written with a full stop, and none in e notation', () => {
    const { view } = play(byId('L3-6'));
    for (const field of view.getAllByRole('textbox')) {
      expect(field.getAttribute('placeholder') ?? '').not.toMatch(/\d\.\d|\de\d/);
    }
    fireEvent.click(view.getByRole('button', { name: /Sýna vísbendingu/ }));
    const hint = view.getByText(/tölustafina í fyrri reitinn/);
    expect(hint.textContent).not.toMatch(/\d\.\d|\de\d/);
    // The old hint's `vísindatölustafi` has no corpus hits; the notation is left
    // unnamed until the term is ruled on.
    expect(hint.textContent).not.toMatch(/vísindatölustaf/i);
  });
});

describe('the submit button asks for what the item grades', () => {
  it('a reverse item is answered by its route: no number to type, and the route is required', () => {
    const { view, explain, submitButton } = play(byId('L3-7'));
    expect(view.queryByPlaceholderText('Sláðu inn svar')).toBeNull();
    explain();
    expect(submitButton().disabled).toBe(true);
    fireEvent.click(view.getAllByRole('button', { name: /skref/ })[0]);
    expect(submitButton().disabled).toBe(false);
  });

  it('an efficiency item needs its path chosen as well as its number', () => {
    const { view, explain, submitButton } = play(byId('L3-10'));
    explain();
    fireEvent.change(view.getByLabelText('Þitt svar:'), { target: { value: '0,5' } });
    expect(submitButton().disabled).toBe(true);
    fireEvent.click(view.getByRole('button', { name: /Leið 1/ }));
    expect(submitButton().disabled).toBe(false);
  });

  it('every other type needs its number, and every type its explanation', () => {
    const { view, explain, submitButton } = play(byId('L3-4'));
    explain();
    expect(submitButton().disabled).toBe(true);
    fireEvent.change(view.getByLabelText('Þitt svar:'), { target: { value: '0,125' } });
    expect(submitButton().disabled).toBe(false);
    fireEvent.change(view.getByLabelText(/Útskýring/), { target: { value: '' } });
    expect(submitButton().disabled).toBe(true);
  });
});

describe('the choices are shuffled, and graded in the order shown', () => {
  // With Math.random pinned at 0, Fisher–Yates swaps every element with the
  // first and so never leaves a two-item list in its data order.
  const pinRandom = () => vi.spyOn(Math, 'random').mockReturnValue(0);

  it('a reverse item: the correct route is not always on top, and picking it is right', () => {
    pinRandom();
    const item = byId('L3-7');
    if (item.type !== 'reverse') throw new Error('L3-7 is not a reverse item');
    expect(item.options[0].correct, 'the data still lists the correct route first').toBe(true);

    const { view, explain, submitButton, onCorrectAnswer, onIncorrectAnswer } = play(item);
    const shown = view.getAllByRole('button', { name: /skref/ });
    const correctText = item.options.find((o) => o.correct)!.text;
    expect(shown[0].textContent).not.toContain(correctText);

    fireEvent.click(shown.find((b) => b.textContent?.includes(correctText))!);
    explain();
    fireEvent.click(submitButton());
    expect(view.getByText('Svarið er rétt!')).toBeTruthy();
    expect(onCorrectAnswer).toHaveBeenCalled();
    expect(onIncorrectAnswer).not.toHaveBeenCalled();
  });

  it('a reverse item: picking the wrong route shown first is wrong', () => {
    pinRandom();
    const { view, explain, submitButton } = play(byId('L3-7'));
    fireEvent.click(view.getAllByRole('button', { name: /skref/ })[0]);
    explain();
    fireEvent.click(submitButton());
    expect(view.getByText('Svarið er ekki alveg rétt')).toBeTruthy();
  });

  it('an efficiency item: the efficient path is not always first, and choosing it is credited', () => {
    pinRandom();
    const item = byId('L3-COOK-4');
    if (item.type !== 'efficiency') throw new Error('L3-COOK-4 is not an efficiency item');
    expect(item.possiblePaths[0].efficient, 'the data still lists it first').toBe(true);

    const { view, explain, submitButton } = play(item);
    const efficient = item.possiblePaths.find((p) => p.efficient)!;
    const shown = view.getAllByRole('button', { name: /Leið \d/ });
    expect(shown[0].textContent).not.toContain(efficient.steps[0]);

    const chosen = shown.findIndex((b) => b.textContent?.includes(efficient.steps[0]));
    fireEvent.click(shown[chosen]);
    fireEvent.change(view.getByLabelText('Þitt svar:'), { target: { value: '9' } });
    explain();
    fireEvent.click(submitButton());
    // The feedback's list is the same order as the buttons, and marks the
    // student's pick on the efficient path.
    const rows = view.getByText(/Leiðirnar bornar saman/).parentElement!;
    const picked = within(rows).getByText('þitt val').parentElement!;
    expect(picked.textContent).toContain(`Leið ${chosen + 1}`);
    expect(picked.textContent).toContain('Skilvirkt');
    expect(view.getByText('✓ Rétt aðferð valin')).toBeTruthy();
  });
});

describe('the fields are named by their labels', () => {
  it('the answer and the explanation are associated with what the screen calls them', () => {
    const { view } = play(byId('L3-2'));
    expect(view.getByLabelText('Hvað er rétta svarið?').tagName).toBe('INPUT');
    expect(view.getByLabelText(/Útskýring/).tagName).toBe('TEXTAREA');
  });
});

describe('the explanation tip promises nothing the level does not give', () => {
  // The tip under the explanation box said to use "umbreyti", "stuðull" and
  // "eining" "for a better grade". Nothing reads the words — `scoreExplanation`
  // deliberately does no keyword matching — so the promise was a phantom, the
  // same class as the hint penalty this level once advertised and never took.
  it.each(['L3-2', 'L3-4', 'L3-7'])('%s claims no grade for vocabulary', (id) => {
    const { view } = play(byId(id));
    // The whole explanation box, found by its heading, so the check does not
    // depend on the tip's current wording.
    const box = view.getByText(/^Útskýring \(hvernig/).parentElement!;
    expect(box.textContent).toMatch(/umbreyti/);
    expect(box.textContent).not.toMatch(/einkunn/);
  });
});
