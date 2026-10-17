import { useEffect, useMemo, useRef, useState } from 'react';

import { Link, useSearchParams } from 'react-router-dom';

import { Container } from '@kvenno/shared/components';

import { DrogContext, HljodCredit, Hlusta } from '../components/Hlusta';
import { categories } from '../data';
import { hlustun, type HlustunClip, type HlustunPlace } from '../data/hlustun';
import { useKeepScroll } from '../yfirferd/scroll';
import { Sending } from '../yfirferd/Sending';
import { isCurrent, now, useReview, type Review, type Verdict } from '../yfirferd/store';

/** A recogniser score above which a clip is listed as doubtful: over a fifth of its letters differ. */
export const DOUBT = 0.2;

const doubtful = (c: HlustunClip) => (c.score ?? 0) > DOUBT;

const nameOf = (id: string) => categories.find((c) => c.id === id)?.name ?? id;

function placeText(p: HlustunPlace): string {
  const where =
    p.where === 'rammi' ? 'setningarammi' : p.where === 'dæmi' ? 'dæmi' : `„${p.where}“`;
  return `${nameOf(p.category)}${p.level ? ` ${p.level}` : ''}, ${where}`;
}

/** This teacher's verdict on the clip as it is now: one given to an earlier recording is not. */
function current(review: Review, clip: HlustunClip) {
  const mine = review.clips[clip.text];
  return isCurrent(clip.text, mine) ? mine : undefined;
}

/** Each recording marked now, with when: a mark given or changed since is told by its time. */
const marks = (review: Review) =>
  new Map(
    hlustun.flatMap((c) => {
      const mine = current(review, c);
      return mine ? [[c.text, mine.at] as const] : [];
    })
  );

/**
 * Every recording on the cards, for a teacher to hear and mark right or wrong (REVIEW-QUEUE C15).
 * Drafts play here, as under `?drog`. The ones a speech recogniser heard as something else come
 * first. No page a student sees links here; the review page does.
 */
export function YfirferdHljod() {
  const { review, update, saved } = useReview();
  const [params, setParams] = useSearchParams();
  const flokkur = params.get('flokkur') ?? '';
  const onlyDoubtful = params.has('efi');
  const unmarked = params.has('ometnar');
  // What was already marked when "not yet marked" was switched on, and when. A row marked during
  // the pass, or cleared and marked again, stays with its note box until the filter is switched
  // again; a row cleared since, here or in another tab, comes back.
  const [markedBefore, setMarkedBefore] = useState(() => marks(review));
  useKeepScroll();

  const setParam = (key: string, value: string | null) =>
    setParams(
      (p) => {
        if (value === null) p.delete(key);
        else p.set(key, value);
        return p;
      },
      { replace: true }
    );

  // The doubtful first, by how far the recogniser was off; the rest in the cards' order.
  const ordered = useMemo(() => {
    const doubt = (c: HlustunClip) => (doubtful(c) ? (c.score ?? 0) : 0);
    return hlustun
      .map((clip, i) => ({ clip, i }))
      .sort((a, b) => doubt(b.clip) - doubt(a.clip) || a.i - b.i)
      .map(({ clip }) => clip);
  }, []);
  const shown = ordered.filter(
    (c) =>
      (!flokkur || c.places.some((p) => p.category === flokkur)) &&
      (!onlyDoubtful || doubtful(c)) &&
      (!unmarked ||
        markedBefore.get(c.text) === undefined ||
        markedBefore.get(c.text) !== current(review, c)?.at)
  );
  const inScope = hlustun.filter((c) => !flokkur || c.places.some((p) => p.category === flokkur));
  const marked = inScope.filter((c) => current(review, c)).length;

  const setVerdict = (clip: HlustunClip, verdict: Verdict | null) =>
    update((r) => {
      const clips = { ...r.clips };
      // What was written about this recording, kept through a verdict taken back by mistake.
      const stored = r.clips[clip.text];
      const before = stored?.v === clip.v ? stored : undefined;
      const at = now();
      // Taken back, it is kept as such, so a file sent later withdraws one sent earlier.
      if (verdict === null)
        clips[clip.text] = {
          verdict: null,
          v: clip.v,
          at,
          ...(before?.note ? { note: before.note } : {}),
        };
      // A note says what is wrong, so it goes when the clip is heard as right.
      else if (verdict === 'right') clips[clip.text] = { verdict, v: clip.v, at };
      else
        clips[clip.text] = {
          verdict,
          v: clip.v,
          at,
          ...(before?.note ? { note: before.note } : {}),
        };
      return { ...r, clips };
    });

  return (
    <Container className="py-8 sm:py-12">
      <nav aria-label="Brauðmolar" className="mb-6">
        <Link to="/yfirferd" className="text-sm text-warm-600 underline hover:text-warm-900">
          Yfirferð
        </Link>
      </nav>
      <h1 className="font-heading text-2xl sm:text-3xl font-bold text-warm-900 mb-4">Hlustun</h1>
      <div className="max-w-2xl space-y-3 text-warm-800 mb-6">
        <p>
          Upptökurnar eru gerðar með talgervli, ekki lesnar af manneskju. Engin þeirra heyrist á
          spjöldunum fyrr en búið er að samþykkja hana.
        </p>
        <p>
          Hlustaðu á hverja og merktu hana „Rétt“ ef hún segir textann eins og á að segja hann. Ef
          ekki, merktu hana „Rangt“ og segðu hvað er að, til dæmis rangar áherslur eða rangt orð.
          Efst eru upptökur sem talgreinir heyrði sem eitthvað annað; þær eru ekki endilega rangar.
        </p>
        <p>
          Talgervillinn les eyðu í ramma sem þögn, skástrik sem „eða“ og orð í sviga á eftir stuttri
          þögn. Þar sem hann á að segja annað en stendur á spjaldinu er það skrifað undir textanum.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mb-4 max-w-3xl">
        <label className="text-sm text-warm-800">
          Spjald{' '}
          <select
            value={flokkur}
            onChange={(e) => setParam('flokkur', e.target.value || null)}
            className="ml-1 rounded-lg border border-warm-300 bg-surface-raised px-2 py-1 pointer-coarse:min-h-11"
          >
            <option value="">Öll spjöld</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="inline-flex items-center gap-2 text-sm text-warm-800 pointer-coarse:min-h-11">
          <input
            type="checkbox"
            checked={onlyDoubtful}
            onChange={(e) => setParam('efi', e.target.checked ? '' : null)}
          />
          Aðeins þær sem talgreinir efast um
        </label>
        <label className="inline-flex items-center gap-2 text-sm text-warm-800 pointer-coarse:min-h-11">
          <input
            type="checkbox"
            checked={unmarked}
            onChange={(e) => {
              if (e.target.checked) setMarkedBefore(marks(review));
              setParam('ometnar', e.target.checked ? '' : null);
            }}
          />
          Aðeins þær sem ég hef ekki metið
        </label>
      </div>
      <p className="text-sm text-warm-700 mb-4" aria-live="polite">
        Þú hefur metið {marked} af {inScope.length}. Sýndar: {shown.length}.
      </p>

      <DrogContext.Provider value={true}>
        <ul className="space-y-2 max-w-3xl" aria-label="Upptökur">
          {shown.map((clip) => (
            <ClipRow
              key={clip.text}
              clip={clip}
              flokkur={flokkur}
              review={review}
              setVerdict={setVerdict}
              setNote={(note) =>
                update((r) => ({
                  ...r,
                  clips: {
                    ...r.clips,
                    [clip.text]: {
                      verdict: 'wrong',
                      v: clip.v,
                      at: r.clips[clip.text]?.at ?? now(),
                      note,
                    },
                  },
                }))
              }
            />
          ))}
        </ul>
      </DrogContext.Provider>
      <HljodCredit className="mt-6 max-w-3xl" />

      <div className="mt-10 max-w-3xl">
        <Sending review={review} update={update} saved={saved} />
      </div>
    </Container>
  );
}

function ClipRow({
  clip,
  flokkur,
  review,
  setVerdict,
  setNote,
}: {
  clip: HlustunClip;
  flokkur: string;
  review: Review;
  setVerdict: (clip: HlustunClip, verdict: Verdict | null) => void;
  setNote: (note: string) => void;
}) {
  const mine = current(review, clip);
  const stored = review.clips[clip.text];
  const remade = stored !== undefined && stored.verdict !== null && stored.v !== clip.v;
  // Where the clip is on the card being reviewed, when one is chosen.
  const place = clip.places.find((p) => p.category === flokkur) ?? clip.places[0];
  const noteRef = useRef<HTMLInputElement>(null);
  const [focusNote, setFocusNote] = useState(false);
  useEffect(() => {
    if (focusNote && mine?.verdict === 'wrong') {
      noteRef.current?.focus();
      setFocusNote(false);
    }
  }, [focusNote, mine?.verdict]);

  const verdictButton = (verdict: Verdict, label: string) => {
    const pressed = mine?.verdict === verdict;
    return (
      <button
        type="button"
        aria-pressed={pressed}
        onClick={() => {
          setVerdict(clip, pressed ? null : verdict);
          // After "Rangt", straight to saying what is wrong.
          if (!pressed && verdict === 'wrong') setFocusNote(true);
        }}
        className={`px-3 py-1 rounded-lg text-sm font-semibold border-2 pointer-coarse:min-h-11 ${
          pressed ? 'bg-warm-900 border-warm-900 text-white' : 'border-warm-300 text-warm-900'
        }`}
      >
        {label}
      </button>
    );
  };
  return (
    <li className="rounded-xl border border-warm-200 bg-surface-raised p-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <Hlusta text={clip.text} color="#1F2937" />
        <span lang="is" className="font-semibold text-warm-900">
          {clip.text}
        </span>
        {clip.approved && <span className="text-sm text-warm-700">(samþykkt)</span>}
        {clip.rejected && <span className="text-sm text-warm-700">(merkt röng)</span>}
        <span role="group" aria-label={`Mat: ${clip.text}`} className="ml-auto inline-flex gap-2">
          {verdictButton('right', 'Rétt')}
          {verdictButton('wrong', 'Rangt')}
        </span>
      </div>
      {clip.say && (
        <p className="mt-1 text-sm text-warm-800">
          Talgervillinn segir: <span lang="is">„{clip.say}“</span>
        </p>
      )}
      <p className="mt-1 text-xs text-warm-700">
        {placeText(place)}
        {clip.places.length > 1 ? ` og ${clip.places.length - 1} í viðbót` : ''}
      </p>
      {doubtful(clip) && (
        <p className="mt-1 text-sm text-warm-800">Talgreinir heyrði: „{clip.heard}“</p>
      )}
      {remade && (
        <p className="mt-1 text-sm text-warm-800">
          Upptakan hefur verið gerð aftur síðan þú mast hana. Hlustaðu aftur.
        </p>
      )}
      {mine?.verdict === 'wrong' && (
        <label className="mt-2 block text-sm text-warm-800">
          Hvað er rangt?<span className="sr-only"> „{clip.text}“</span>
          <input
            ref={noteRef}
            type="text"
            value={mine.note ?? ''}
            onChange={(e) => setNote(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-warm-300 bg-surface-page px-3 py-2"
          />
        </label>
      )}
    </li>
  );
}
