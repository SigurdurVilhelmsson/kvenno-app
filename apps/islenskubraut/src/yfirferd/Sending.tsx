import { useEffect, useRef, useState } from 'react';

import { useArmedAfter } from '@kvenno/shared/utils/armed';

import { counts, fileName, now, reviewFile, reviewText, type Review } from './store';

/**
 * Sending the review back: the reviewer's name, what the review holds, and two ways to send it,
 * a file for `pnpm islenskubraut:yfirferd` or text to paste into an email. Shared by both pages.
 */
export function Sending({
  review,
  update,
  saved,
}: {
  review: Review;
  update: (change: (r: Review) => Review) => void;
  saved: boolean;
}) {
  const [status, setStatus] = useState('');
  const [clearing, setClearing] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const clearRef = useRef<HTMLButtonElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const wasClearing = useRef(false);
  // The second press of a double click must not confirm what the first one asked.
  const guard = useArmedAfter(400, clearing);
  const c = counts(review);
  const empty = c.notes + c.right + c.wrong === 0;

  // Focus follows the question: to Hætta við when it is asked, back to Hreinsa allt when it is
  // cancelled, and to the message once everything is cleared, never to the top of the page.
  useEffect(() => {
    if (clearing) cancelRef.current?.focus();
    else if (wasClearing.current) {
      if (clearRef.current && !clearRef.current.disabled) clearRef.current.focus();
      else statusRef.current?.focus();
    }
    wasClearing.current = clearing;
  }, [clearing]);

  const download = () => {
    const stamp = now();
    const date = stamp.slice(0, 10);
    const name = fileName(review, stamp);
    const blob = new Blob([`${JSON.stringify(reviewFile(review, date, stamp), null, 2)}\n`], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.append(a);
    a.click();
    a.remove();
    // Safari reads the file after the click has returned, so the address must outlive it.
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    setStatus(
      `Skráin ${name} ætti nú að vera í niðurhalsmöppunni. Sendu hana til þess sem bað þig um yfirferðina. Ef hún kom ekki, notaðu „Afrita sem texta“.`
    );
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(reviewText(review, now().slice(0, 10)));
      setStatus('Afritað. Límdu textann í tölvupóst.');
    } catch {
      setStatus('Vafrinn leyfði ekki afritun. Sæktu skrána í staðinn.');
    }
  };

  return (
    <section
      aria-labelledby="sending"
      className="rounded-xl border border-warm-300 bg-surface-raised p-4 sm:p-5"
    >
      <h2 id="sending" className="font-heading text-lg font-semibold text-warm-900 mb-3">
        Senda yfirferðina
      </h2>
      <label className="block text-sm text-warm-800 mb-3">
        Nafnið þitt
        <input
          type="text"
          value={review.reviewer}
          onChange={(e) => {
            const reviewer = e.target.value;
            update((r) => ({ ...r, reviewer }));
          }}
          autoComplete="name"
          className="mt-1 block w-full max-w-sm rounded-lg border border-warm-300 bg-surface-page px-3 py-2"
        />
      </label>
      <p className="text-sm text-warm-700 mb-3">
        Athugasemdir: {c.notes} · Réttar upptökur: {c.right} · Rangar upptökur: {c.wrong}
      </p>
      <p className="text-sm text-warm-700 mb-3">
        {saved
          ? 'Yfirferðin geymist í þessum vafra, líka eftir að þú sendir hana, þar til þú hreinsar hana. Í huliðsglugga hverfur hún þegar glugganum er lokað. Ef aðrir nota þennan vafra, hreinsaðu hana þegar þú hefur sent hana.'
          : 'Vafrinn geymir ekki yfirferðina: sendu hana áður en þú lokar síðunni.'}
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={download}
          disabled={empty}
          className="px-4 py-2 rounded-lg font-semibold text-white bg-warm-900 hover:bg-warm-800 disabled:opacity-50 pointer-coarse:min-h-11"
        >
          Sækja skrá
        </button>
        <button
          type="button"
          onClick={copy}
          disabled={empty}
          className="px-4 py-2 rounded-lg font-semibold border-2 border-warm-900 text-warm-900 hover:bg-warm-100 disabled:opacity-50 pointer-coarse:min-h-11"
        >
          Afrita sem texta
        </button>
        {!clearing ? (
          <button
            key="hreinsa"
            ref={clearRef}
            type="button"
            onClick={() => setClearing(true)}
            disabled={empty && review.reviewer === ''}
            className="px-4 py-2 rounded-lg text-warm-700 underline hover:text-warm-900 disabled:opacity-50 pointer-coarse:min-h-11"
          >
            Hreinsa allt
          </button>
        ) : (
          <>
            {/* Where "Hreinsa allt" was, so a second click lands here and cancels. */}
            <button
              key="haetta"
              ref={cancelRef}
              type="button"
              onClick={() => setClearing(false)}
              className="px-4 py-2 rounded-lg font-semibold border-2 border-warm-900 text-warm-900 hover:bg-warm-100 pointer-coarse:min-h-11"
            >
              Hætta við
            </button>
            <button
              key="eyda"
              type="button"
              onClick={guard(() => {
                update(() => ({ reviewer: '', notes: {}, clips: {} }));
                setClearing(false);
                setStatus('Yfirferðin var hreinsuð.');
              })}
              className="px-4 py-2 rounded-lg font-semibold text-white bg-warm-900 hover:bg-warm-800 pointer-coarse:min-h-11"
            >
              Já, eyða öllu sem ég hef skrifað
            </button>
          </>
        )}
      </div>
      <p ref={statusRef} tabIndex={-1} role="status" className="mt-3 text-sm text-warm-800 min-h-5">
        {status}
      </p>
    </section>
  );
}
