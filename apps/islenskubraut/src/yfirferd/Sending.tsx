import { useState } from 'react';

import { counts, reviewFile, reviewText, today, type Review } from './store';

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
  const c = counts(review);
  const empty = c.notes + c.right + c.wrong === 0;

  const download = () => {
    const date = today();
    const blob = new Blob([`${JSON.stringify(reviewFile(review, date), null, 2)}\n`], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yfirferd-islenskubraut-${date}.json`;
    document.body.append(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setStatus('Skráin var sótt. Sendu hana til þess sem bað þig um yfirferðina.');
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(reviewText(review, today()));
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
          ? 'Yfirferðin geymist í þessum vafra þar til þú sendir hana.'
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
            type="button"
            onClick={() => setClearing(true)}
            disabled={empty}
            className="px-4 py-2 rounded-lg text-warm-700 underline hover:text-warm-900 disabled:opacity-50 pointer-coarse:min-h-11"
          >
            Hreinsa allt
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              update((r) => ({ ...r, notes: {}, clips: {} }));
              setClearing(false);
              setStatus('Yfirferðin var hreinsuð.');
            }}
            className="px-4 py-2 rounded-lg font-semibold border-2 border-warm-900 text-warm-900 hover:bg-warm-100 pointer-coarse:min-h-11"
          >
            Já, eyða öllu sem ég hef skrifað
          </button>
        )}
      </div>
      <p role="status" className="mt-3 text-sm text-warm-800 min-h-5">
        {status}
      </p>
    </section>
  );
}
