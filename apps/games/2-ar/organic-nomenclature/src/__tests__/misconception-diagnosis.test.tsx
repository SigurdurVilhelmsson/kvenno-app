// @vitest-environment jsdom
import { fireEvent, render, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { clockPastNextGuard } from './next-guard-clock';
import { Level2 } from '../components/Level2';

// The buttons that follow an answer ignore a press within 400 ms of appearing.
clockPastNextGuard();

/**
 * The misconception note is the one part of the feedback a student sees without opening
 * anything, so it has to name the part of the answer that is wrong.
 *
 * - **Stig 2's drag builder** chose the note by which zones were filled, never by what was in
 *   them. With a prefix and an ending placed it always said "prefix" for a short chain and
 *   "position number" for a long one — so eth- + -en for etan was told about prefixes, and
 *   1- + prop- + -en for 1-búten was told about the position number.
 * - **Byggja** counted the multiple bonds but never compared their type, so a double bond
 *   where the name asks for a triple (eten built for etýn) was sent to the position note.
 *
 * The notes are matched by their opening words. Queries are scoped to the rendered container:
 * the repo runs vitest with retries and no RTL auto-cleanup.
 */

const PREFIX_NOTE = /Forskeytið (ákvarðast|segir)/;
const SUFFIX_NOTE = /Viðskeytið (ákvarðast|segir)/;
const POSITION_NOTE = /Staðsetningartala(n)? (þarf|segir)/;

function openNaming() {
  const rendered = render(<Level2 onComplete={vi.fn()} onBack={vi.fn()} />);
  const ui = within(rendered.container);
  fireEvent.click(ui.getByRole('button', { name: /Nefna sameindir/ }));
  const zone = (id: string) =>
    rendered.container.querySelector(`[data-zone-id="${id}"]`) as HTMLElement;
  const pool = () => rendered.container.querySelector('[data-drop-pool]') as HTMLElement;
  const place = (label: string, zoneId: string) => {
    fireEvent.click(within(pool()).getByRole('button', { name: label }));
    fireEvent.click(zone(zoneId));
  };
  const check = () => fireEvent.click(ui.getByRole('button', { name: 'Athuga svar' }));
  const text = () => rendered.container.textContent ?? '';
  // Molecules 1-5 are etan, bútan, hexan, eten, própen; skip past them with a wrong build
  const skipTo = (molecule: number) => {
    for (let i = 1; i < molecule; i++) {
      place('meth-', 'zone-prefix');
      place('-an', 'zone-suffix');
      check();
      fireEvent.click(ui.getByRole('button', { name: /Halda áfram/ }));
    }
    expect(ui.getByText(new RegExp(`Sameind ${molecule} af`))).toBeTruthy();
  };
  return { place, check, text, skipTo };
}

describe('Stig 2 drag builder: the note names the wrong part', () => {
  it('a wrong ending on a short chain is about the ending, not the prefix', () => {
    const b = openNaming();
    b.place('eth-', 'zone-prefix');
    b.place('-en', 'zone-suffix');
    b.check();
    expect(b.text()).toMatch(SUFFIX_NOTE);
    expect(b.text()).not.toMatch(PREFIX_NOTE);
  });

  it('a wrong prefix on a short chain is about the prefix', () => {
    const b = openNaming();
    b.place('prop-', 'zone-prefix');
    b.place('-an', 'zone-suffix');
    b.check();
    expect(b.text()).toMatch(PREFIX_NOTE);
  });

  it('on 1-búten, a wrong prefix or ending is not blamed on the position number', () => {
    const b = openNaming();
    b.skipTo(6);
    b.place('1-', 'zone-position');
    b.place('prop-', 'zone-prefix');
    b.place('-en', 'zone-suffix');
    b.check();
    expect(b.text()).toMatch(PREFIX_NOTE);
    expect(b.text()).not.toMatch(POSITION_NOTE);
  });

  it('on 1-búten, the wrong ending is about the ending', () => {
    const b = openNaming();
    b.skipTo(6);
    b.place('1-', 'zone-position');
    b.place('but-', 'zone-prefix');
    b.place('-an', 'zone-suffix');
    b.check();
    expect(b.text()).toMatch(SUFFIX_NOTE);
    expect(b.text()).not.toMatch(POSITION_NOTE);
  });

  it('on 1-búten, only the wrong number is about the position number', () => {
    const b = openNaming();
    b.skipTo(6);
    b.place('2-', 'zone-position');
    b.place('but-', 'zone-prefix');
    b.place('-en', 'zone-suffix');
    b.check();
    expect(b.text()).toMatch(POSITION_NOTE);
  });
});

describe('Byggja: a bond of the wrong type is about the ending', () => {
  it('eten built for etýn gets the ending note, not the position note', () => {
    const rendered = render(<Level2 onComplete={vi.fn()} onBack={vi.fn()} />);
    const ui = within(rendered.container);
    fireEvent.click(ui.getByRole('button', { name: /Byggja sameindir/ }));
    for (let i = 1; i < 7; i++) {
      fireEvent.click(ui.getByRole('button', { name: 'Athuga svar' }));
      fireEvent.click(ui.getByRole('button', { name: /Næsta áskorun/ }));
    }
    expect(ui.getByText(/^et[yý]n$/)).toBeTruthy();

    const remove = ui.getByRole('button', { name: /^(-|Fjarlægja kolefni)$/ });
    fireEvent.click(remove);
    fireEvent.click(remove); // two carbons
    const bond = rendered.container.querySelectorAll('.bg-warm-900 button')[0] as HTMLElement;
    fireEvent.click(bond); // single → double
    fireEvent.click(ui.getByRole('button', { name: 'Athuga svar' }));

    const text = rendered.container.textContent ?? '';
    expect(text).toMatch(/Rétt svar: 2 kolefni, þrítengi á stað 1\./);
    expect(text).toMatch(SUFFIX_NOTE);
    expect(text).not.toMatch(POSITION_NOTE);
  });
});
