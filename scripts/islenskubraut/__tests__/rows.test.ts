import { describe, expect, it } from 'vitest';

import { fromRows, toRows } from '../rows.mjs';

const category = {
  id: 'manneskja',
  name: 'Manneskja',
  icon: '🧑',
  description: 'Orðaforði um fólk',
  color: '#7B2CBF',
  subCategories: [{ name: 'Aldur', options: ['barn', 'unglingur'] }],
  sentenceFrames: [{ level: 'A1', frames: ['Þetta er ___.'] }],
  guidingQuestions: [
    {
      question: 'Fyrir hvað er manneskjan þekkt?',
      icon: '🎯',
      answers: [{ level: 'A1', options: ['til að vinna', 'til að læra'] }],
    },
  ],
};

describe('toRows', () => {
  it('emits one row per editable string', () => {
    const rows = toRows(category);
    expect(rows.map((r) => r.islenska)).toEqual([
      'Orðaforði um fólk',
      'Aldur',
      'barn',
      'unglingur',
      'Þetta er ___.',
      'Fyrir hvað er manneskjan þekkt?',
      'til að vinna',
      'til að læra',
    ]);
  });

  it('repeats the group key on every row of a group', () => {
    const answers = toRows(category).filter((r) => r.gerd === 'Svar');
    expect(answers.map((r) => r.lykill)).toEqual(['manneskja.q1.A1', 'manneskja.q1.A1']);
  });

  it('repeats the parent question as context on answer rows', () => {
    const answers = toRows(category).filter((r) => r.gerd === 'Svar');
    expect(answers.every((r) => r.samhengi === 'Fyrir hvað er manneskjan þekkt?')).toBe(true);
  });
});

describe('fromRows', () => {
  it('round-trips a category unchanged', () => {
    expect(fromRows('manneskja', toRows(category), category)).toEqual(category);
  });

  it('applies an edit to a single keyed string', () => {
    const rows = toRows(category);
    rows.find((r) => r.lykill === 'manneskja.q1')!.islenska = 'Fyrir hvað er hún þekkt?';
    expect(fromRows('manneskja', rows, category).guidingQuestions[0].question).toBe(
      'Fyrir hvað er hún þekkt?'
    );
  });

  it('appends an option when a row is added to the group', () => {
    const rows = toRows(category);
    const i = rows.findIndex((r) => r.islenska === 'til að læra');
    rows.splice(i + 1, 0, { ...rows[i], islenska: 'til að kenna' });
    expect(fromRows('manneskja', rows, category).guidingQuestions[0].answers[0].options).toEqual([
      'til að vinna',
      'til að læra',
      'til að kenna',
    ]);
  });

  it('removes an option when its row is deleted', () => {
    const rows = toRows(category).filter((r) => r.islenska !== 'til að vinna');
    expect(fromRows('manneskja', rows, category).guidingQuestions[0].answers[0].options).toEqual([
      'til að læra',
    ]);
  });

  it('reorders options to match sheet order', () => {
    const rows = toRows(category);
    const a = rows.findIndex((r) => r.islenska === 'til að vinna');
    const [moved] = rows.splice(a, 1);
    rows.push(moved);
    expect(fromRows('manneskja', rows, category).guidingQuestions[0].answers[0].options).toEqual([
      'til að læra',
      'til að vinna',
    ]);
  });

  it('throws when a group is emptied entirely', () => {
    const rows = toRows(category).filter((r) => r.gerd !== 'Svar');
    expect(() => fromRows('manneskja', rows, category)).toThrow(/manneskja\.q1/);
  });

  it('keeps each question with its own icon when an earlier question is deleted', () => {
    const twoQ = {
      ...category,
      guidingQuestions: [
        { question: 'Q1', icon: '1️⃣', answers: [{ level: 'A1', options: ['a'] }] },
        { question: 'Q2', icon: '2️⃣', answers: [{ level: 'A1', options: ['b'] }] },
      ],
    };
    const rows = toRows(twoQ).filter((r) => !r.lykill.startsWith('manneskja.q1'));
    expect(fromRows('manneskja', rows, twoQ).guidingQuestions[0].icon).toBe('2️⃣');
  });
});
