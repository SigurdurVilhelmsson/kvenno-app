// @vitest-environment jsdom
import { fireEvent, render, screen, within } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, expect, it } from 'vitest';

import { Aefing, WhyList, drillItems, reason } from '../components/Malfraedi';
import type { SmidurLevel, SmidurWord } from '../data/smidur';

expect.extend(toHaveNoViolations);

const avoxtur = { text: 'ávöxtur', gender: 'kk', number: 'ET', person: false } as const;
const skor = { text: 'skór', gender: 'kk', number: 'FT', person: false } as const;
const hun = { text: 'hún', gender: 'kvk', number: 'ET', person: true } as const;
const saetur: SmidurWord = {
  word: 'sætur.',
  changed: true,
  why: { kind: 'samræmi', from: 'sætt', to: 'sætur' },
  lemma: 'saetur',
  choices: ['sæt', 'sætt', 'sætur'],
};
const hann: SmidurWord = {
  word: 'Hann',
  changed: true,
  why: { kind: 'fornafn', case: 'NF', from: 'það', to: 'hann' },
};
const level: SmidurLevel = {
  level: 'A1',
  confirmed: false,
  subjectQuestion: 'Hvers konar matur er þetta?',
  subjects: [avoxtur],
  frames: [
    {
      frame: 'Það er ___.',
      question: 'Hvernig bragðast það?',
      options: ['sætt'],
      sentences: [[[hann, { word: 'er', changed: false }, saetur]]],
    },
  ],
  tables: {
    saetur: {
      ord: 'sætur',
      columns: ['karlkyn', 'kvenkyn', 'hvorugkyn'],
      rows: [{ case: 'NF', forms: ['sætur', 'sæt', 'sætt'] }],
    },
  },
};

describe('reasons', () => {
  it('say what changed and why, for each kind of change', () => {
    expect(reason(hann, avoxtur)).toBe(
      '„það“ verður „hann“ af því að „ávöxtur“ er karlkyns og í eintölu.'
    );
    expect(reason(hann, hun)).toBe('„það“ verður „hann“: fornafnið fylgir manneskjunni.');
    expect(
      reason({ word: 'eru', changed: true, why: { kind: 'sögn', from: 'er', to: 'eru' } }, skor)
    ).toBe('„er“ verður „eru“ af því að „skór“ er í fleirtölu.');
    expect(reason(saetur, avoxtur)).toBe(
      '„sætt“ verður „sætur“: lýsingarorðið fylgir „ávöxtur“ (karlkyn, eintala).'
    );
    expect(
      reason(
        {
          word: 'feld.',
          changed: true,
          why: { kind: 'þolfall', from: 'feldur', to: 'feld', verb: 'hefur' },
        },
        avoxtur
      )
    ).toBe('„feldur“ verður „feld“: á eftir „hefur“ kemur þolfall.');
    expect(reason({ word: 'er', changed: false }, avoxtur)).toBeNull();
  });

  it('list under the sentence, with every form of an inflected word', async () => {
    const { container } = render(
      <WhyList words={level.frames[0].sentences[0][0]} subject={avoxtur} tables={level.tables} />
    );
    const list = screen.getByRole('list', { name: 'Af hverju breytast orðin?' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(2);
    fireEvent.click(screen.getByText('Allar myndir orðsins „sætur“'));
    expect(screen.getByRole('table', { name: 'Allar myndir orðsins sætur' })).toBeDefined();
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('the drill', () => {
  it('asks once for each inflected word, with the card’s word as the hint', () => {
    expect(drillItems(level)).toEqual([
      {
        before: 'Hann er',
        after: '.',
        base: 'sætt',
        answer: 'sætur',
        choices: ['sæt', 'sætt', 'sætur'],
        why: '„sætt“ verður „sætur“: lýsingarorðið fylgir „ávöxtur“ (karlkyn, eintala).',
      },
    ]);
  });

  it('says a wrong pick is wrong and lets the student try again, then says why', () => {
    render(<Aefing data={level} color="#000" />);
    const choices = screen.getByRole('group', { name: 'Myndir orðsins' });
    fireEvent.click(within(choices).getByRole('button', { name: 'sæt' }));
    expect(screen.getByRole('status').textContent).toBe('Ekki alveg. Reyndu aftur.');
    expect(within(choices).getByRole('button', { name: 'sæt' })).toHaveProperty('disabled', true);
    fireEvent.click(within(choices).getByRole('button', { name: 'sætur' }));
    expect(screen.getByRole('status').textContent).toMatch(/^Rétt\. „sætt“ verður „sætur“/);
    fireEvent.click(screen.getByRole('button', { name: 'Næsta setning' }));
    expect(screen.getByRole('status').textContent).toBe('');
  });
});
