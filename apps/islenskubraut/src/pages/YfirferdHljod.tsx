import { useMemo } from 'react';

import { Link, useSearchParams } from 'react-router-dom';

import { Container } from '@kvenno/shared/components';

import { DrogContext, HljodCredit, Hlusta } from '../components/Hlusta';
import { categories } from '../data';
import { hlustun, type HlustunClip, type HlustunPlace } from '../data/hlustun';
import { Sending } from '../yfirferd/Sending';
import { useReview, type Review, type Verdict } from '../yfirferd/store';

/** A recogniser score from which a clip is listed as doubtful: a fifth of its letters differ. */
export const DOUBT = 0.2;

const nameOf = (id: string) => categories.find((c) => c.id === id)?.name ?? id;

function placeText(p: HlustunPlace): string {
  const where =
    p.where === 'rammi' ? 'setningarammi' : p.where === 'dæmi' ? 'dæmi' : `„${p.where}“`;
  return `${nameOf(p.category)}${p.level ? ` ${p.level}` : ''}, ${where}`;
}

/**
 * Every recording on the cards, for a teacher to hear and mark right or wrong (REVIEW-QUEUE C15).
 * Drafts play here, as under `?drog`. The ones a speech recogniser heard as something else come
 * first. Nothing on the site links here but the review page.
 */
export function YfirferdHljod() {
  const { review, update, saved } = useReview();
  const [params, setParams] = useSearchParams();
  const flokkur = params.get('flokkur') ?? '';
  const doubtful = params.has('efi');
  const unmarked = params.has('ometnar');

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
    const doubt = (c: HlustunClip) => ((c.score ?? 0) >= DOUBT ? (c.score ?? 0) : 0);
    return hlustun
      .map((clip, i) => ({ clip, i }))
      .sort((a, b) => doubt(b.clip) - doubt(a.clip) || a.i - b.i)
      .map(({ clip }) => clip);
  }, []);
  const shown = ordered.filter(
    (c) =>
      (!flokkur || c.places.some((p) => p.category === flokkur)) &&
      (!doubtful || (c.score ?? 0) >= DOUBT) &&
      (!unmarked || !review.clips[c.text])
  );
  const inScope = hlustun.filter((c) => !flokkur || c.places.some((p) => p.category === flokkur));
  const marked = inScope.filter((c) => review.clips[c.text]).length;

  const setVerdict = (text: string, verdict: Verdict | null) =>
    update((r) => {
      const clips = { ...r.clips };
      if (verdict === null) delete clips[text];
      else clips[text] = { ...clips[text], verdict };
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
            checked={doubtful}
            onChange={(e) => setParam('efi', e.target.checked ? '' : null)}
          />
          Aðeins þær sem talgreinir efast um
        </label>
        <label className="inline-flex items-center gap-2 text-sm text-warm-800 pointer-coarse:min-h-11">
          <input
            type="checkbox"
            checked={unmarked}
            onChange={(e) => setParam('ometnar', e.target.checked ? '' : null)}
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
              review={review}
              setVerdict={setVerdict}
              setNote={(note) =>
                update((r) => ({
                  ...r,
                  clips: { ...r.clips, [clip.text]: { verdict: 'wrong', note } },
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
  review,
  setVerdict,
  setNote,
}: {
  clip: HlustunClip;
  review: Review;
  setVerdict: (text: string, verdict: Verdict | null) => void;
  setNote: (note: string) => void;
}) {
  const mine = review.clips[clip.text];
  const doubt = (clip.score ?? 0) >= DOUBT;
  const verdictButton = (verdict: Verdict, label: string) => {
    const pressed = mine?.verdict === verdict;
    return (
      <button
        type="button"
        aria-pressed={pressed}
        onClick={() => setVerdict(clip.text, pressed ? null : verdict)}
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
        <span role="group" aria-label={`Mat: ${clip.text}`} className="ml-auto inline-flex gap-2">
          {verdictButton('right', 'Rétt')}
          {verdictButton('wrong', 'Rangt')}
        </span>
      </div>
      <p className="mt-1 text-xs text-warm-700">
        {placeText(clip.places[0])}
        {clip.places.length > 1 ? ` og ${clip.places.length - 1} í viðbót` : ''}
      </p>
      {doubt && <p className="mt-1 text-sm text-warm-800">Talgreinir heyrði: „{clip.heard}“</p>}
      {mine?.verdict === 'wrong' && (
        <label className="mt-2 block text-sm text-warm-800">
          Hvað er rangt?<span className="sr-only"> „{clip.text}“</span>
          <input
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
