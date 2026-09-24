import { useId, useState, type ReactNode } from 'react';

import { useIsPhone } from '../utils/reveal';

export interface PhoneDisclosureProps {
  /**
   * The button's text: the block's own existing heading, so the disclosure adds no new
   * string. Shown on a phone only.
   */
  summary: ReactNode;
  /** The reference content. Always mounted; hidden on a phone until the button opens it. */
  children: ReactNode;
  /**
   * Classes for the outer element. It replaces the block's existing wrapper, so give it
   * that wrapper's classes and desktop keeps its layout.
   */
  className?: string;
  /** Classes for the element around `children` — for a wrapper that laid its children out. */
  contentClassName?: string;
  /** Extra classes for the phone-only button, e.g. colours on a dark card. */
  buttonClassName?: string;
}

/**
 * A reference block that starts closed on a phone and is always open everywhere else.
 *
 * **Only for true reference** — lookup tables and formula cards a student consults while
 * answering (design P9: Uppflettitöflur, Blendnitafla, Formhleðsluformúlan, …). Never for an
 * explore widget, which must not become one tap away, and never for a deliberate scaffold
 * the level is built around.
 *
 * On a phone (`useIsPhone`, the same test as the `phone:` variant) it renders a 44 px
 * `<button aria-expanded aria-controls>` labelled with `summary`, and the content is hidden
 * until it is pressed. Everywhere else there is no button at all — not a hidden one — and
 * the content always shows, so desktop renders exactly as the block did before; jsdom, which
 * has no `matchMedia`, takes the desktop branch too. The content stays mounted either way,
 * so nothing inside it loses its state when the disclosure closes or the phone is turned.
 */
export function PhoneDisclosure({
  summary,
  children,
  className = '',
  contentClassName = '',
  buttonClassName = '',
}: PhoneDisclosureProps) {
  const phone = useIsPhone();
  const [open, setOpen] = useState(false);
  const contentId = useId();
  const hidden = phone && !open;

  return (
    <div className={className}>
      {phone && (
        <button
          type="button"
          aria-expanded={open}
          aria-controls={contentId}
          onClick={() => setOpen((o) => !o)}
          className={`
            flex w-full min-h-11 items-center justify-between gap-2
            rounded-lg border border-warm-300 px-3 py-2
            text-left font-semibold
            ${buttonClassName}
          `}
        >
          <span className="min-w-0">{summary}</span>
          <span aria-hidden="true" className="shrink-0 text-xs">
            {open ? '▼' : '▶'}
          </span>
        </button>
      )}
      <div
        id={contentId}
        hidden={hidden}
        className={`${phone && open ? 'mt-2' : ''} ${contentClassName}`.trim() || undefined}
      >
        {children}
      </div>
    </div>
  );
}

export default PhoneDisclosure;
