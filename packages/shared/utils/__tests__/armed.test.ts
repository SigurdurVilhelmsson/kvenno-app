import { createElement, useState } from 'react';

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useArmedAfter } from '../armed';

let clock = 1000;

beforeEach(() => {
  clock = 1000;
  vi.spyOn(performance, 'now').mockImplementation(() => clock);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

/** Athuga, then a separate Næsta guarded by the hook — the P3 shape. */
function Loop({ onNext, ms }: { onNext: () => void; ms?: number }) {
  const [item, setItem] = useState(0);
  const [checked, setChecked] = useState(false);
  const guard = useArmedAfter(ms, `${item}:${checked}`);
  return createElement(
    'div',
    null,
    createElement('p', null, `Dæmi ${item + 1}`),
    checked
      ? createElement(
          'button',
          {
            onClick: guard(() => {
              onNext();
              setItem(item + 1);
              setChecked(false);
            }),
          },
          'Næsta'
        )
      : createElement('button', { onClick: () => setChecked(true) }, 'Athuga')
  );
}

describe('useArmedAfter', () => {
  it('drops a Næsta press that lands within 400 ms of Næsta appearing (a double tap)', () => {
    const onNext = vi.fn();
    const { getByText } = render(createElement(Loop, { onNext }));
    fireEvent.click(getByText('Athuga'));
    clock += 150;
    fireEvent.click(getByText('Næsta'));
    expect(onNext).not.toHaveBeenCalled();
    expect(getByText('Dæmi 1')).toBeTruthy();
  });

  it('lets a deliberate press through once armed', () => {
    const onNext = vi.fn();
    const { getByText } = render(createElement(Loop, { onNext }));
    fireEvent.click(getByText('Athuga'));
    clock += 400;
    fireEvent.click(getByText('Næsta'));
    expect(onNext).toHaveBeenCalledTimes(1);
    expect(getByText('Dæmi 2')).toBeTruthy();
  });

  it('re-arms whenever the key changes', () => {
    const onNext = vi.fn();
    const { getByText } = render(createElement(Loop, { onNext }));
    fireEvent.click(getByText('Athuga'));
    clock += 500;
    fireEvent.click(getByText('Næsta'));
    fireEvent.click(getByText('Athuga'));
    clock += 100;
    fireEvent.click(getByText('Næsta'));
    expect(onNext).toHaveBeenCalledTimes(1);
    clock += 300;
    fireEvent.click(getByText('Næsta'));
    expect(onNext).toHaveBeenCalledTimes(2);
  });

  it('takes a custom window, and passes the event through', () => {
    const handler = vi.fn();
    function One() {
      const guard = useArmedAfter(100);
      return createElement('button', { onClick: guard(handler) }, 'Áfram');
    }
    const { getByText } = render(createElement(One));
    clock += 99;
    fireEvent.click(getByText('Áfram'));
    expect(handler).not.toHaveBeenCalled();
    clock += 1;
    act(() => fireEvent.click(getByText('Áfram')));
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0]).toHaveProperty('type', 'click');
  });

  it('never disables the button, so nothing visible changes', () => {
    const { getByText } = render(createElement(Loop, { onNext: vi.fn() }));
    fireEvent.click(getByText('Athuga'));
    expect((getByText('Næsta') as HTMLButtonElement).disabled).toBe(false);
  });
});
