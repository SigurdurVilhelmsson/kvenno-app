import { useEffect, useMemo, useRef, useState } from 'react';

import { CLASSES, KIND_NAMES, SOLUTES, classOf, type ElectrolyteClass } from '../data/electrolytes';
import { revealTop } from '../utils/reveal';

/**
 * Stig 0 — Rafkleyfi.
 *
 * A teach phase, then a classify drill. Same shape as
 * `1-ar/dimensional-analysis`'s Stig 0, which is the platform's precedent for
 * prerequisite content inside an existing three-level game — and the reason
 * this is Stig 0 rather than Stig 4 is that Siggi ruled on 2026-08-29 that
 * there is no Level 4.
 *
 * Icelandic is hardcoded here, again following that precedent: the Stig 0 card
 * and screen in `dimensional-analysis` are hardcoded inside a game that
 * otherwise uses `t()`. Writing `en` and `pl` blocks would mean inventing
 * Polish chemistry terminology against no glossary, which is the mistake this
 * repo's terminology rule exists to prevent — and `useGameI18n`'s `t()` falls
 * back to Icelandic for a missing key anyway, so a Polish-speaking student sees
 * exactly what they would have seen.
 *
 * **The bulb never lights before the student commits.** The old game rendered
 * the unlit bulb pre-answer, which is precisely the picture for "órafkleyft
 * efni" — a second answer leak underneath the first
 * (`ORPHANED_GAMES_ASSESSMENT.md:320`). Here the apparatus is drawn with no
 * verdict until an answer is in.
 */

interface Props {
  onComplete: (score: number) => void;
  onBack: () => void;
}

type Phase = 'teach' | 'drill' | 'done';

const ORDER: ElectrolyteClass[] = ['sterkur', 'veikur', 'orafkleyft'];

function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function Level0Electrolytes({ onComplete, onBack }: Props) {
  const [phase, setPhase] = useState<Phase>('teach');
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<ElectrolyteClass | null>(null);
  const [correct, setCorrect] = useState(0);

  const items = useMemo(() => shuffle(SOLUTES), []);
  const progressRef = useRef<HTMLParagraphElement>(null);

  // "Næsta" sits below the feedback, so on a short (landscape) phone screen
  // the next solute's formula and name would otherwise start above the fold.
  useEffect(() => {
    revealTop(progressRef.current);
  }, [index]);
  const item = items[index];
  const truth = item ? classOf(item) : 'sterkur';
  const isRight = answer === truth;

  const next = () => {
    if (index + 1 >= items.length) {
      setPhase('done');
      return;
    }
    setIndex(index + 1);
    setAnswer(null);
  };

  if (phase === 'teach') {
    return (
      <Shell title="Stig 0 — Rafkleyfi" onBack={onBack}>
        <p className="mb-6 text-warm-700">
          Settu tvo málmstauta ofan í glas og tengdu peru við. Hreint vatn leiðir varla nokkurn
          straum. En leystu eitthvað upp í því og stundum kviknar á perunni — stundum skært, stundum
          dauft, stundum alls ekki. Það sem ræður því er hvort efnið <em>klofnar í jónir</em> þegar
          það leysist.
        </p>

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          {ORDER.map((id) => (
            <div key={id} className="rounded-xl border-2 border-warm-200 bg-white p-4 text-center">
              <Bulb state={CLASSES[id].bulb} />
              <h3 className="mt-3 font-bold text-warm-800">{CLASSES[id].name}</h3>
              <p className="mt-1 text-sm text-warm-600">{CLASSES[id].description}</p>
            </div>
          ))}
        </div>

        <div className="mb-6 rounded-xl bg-orange-50 p-5">
          <h3 className="mb-2 font-bold text-orange-800">Hvernig þekkirðu þau í sundur?</h3>
          <ul className="space-y-2 text-sm text-orange-900">
            <li>
              <strong>Leysanlegt jónaefni</strong> er þegar byggt úr jónum. Vatnið dregur þær í
              sundur og lausnin fyllist af jónum — sterkur rafkleyfi.
            </li>
            <li>
              <strong>Sterk sýra eða sterkur basi</strong> klofnar líka algjörlega. Sterkur
              rafkleyfi.
            </li>
            <li>
              <strong>Veik sýra eða veikur basi</strong> klofnar aðeins að hluta. Fáar jónir —
              veikur rafkleyfi.
            </li>
            <li>
              <strong>Sameindaefni</strong> leysist upp án þess að mynda jónir. Órafkleyft efni.
            </li>
          </ul>
        </div>

        <div className="mb-6 rounded-xl border-2 border-amber-200 bg-amber-50 p-5">
          <h3 className="mb-2 font-bold text-amber-800">Gildran</h3>
          <p className="text-sm text-amber-900">
            Að <strong>leysast upp</strong> og að <strong>klofna í jónir</strong> eru ekki sami
            hluturinn. Sykur leysist frábærlega í vatni og sykurvatn leiðir samt engan straum:
            sykursameindirnar dreifast heilar um vatnið. Og öfugt — það að efni sé hættulegt segir
            ekkert um hvort það er sterkt. Flússýra ætir gler og er samt veik sýra.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setPhase('drill')}
          className="game-btn w-full rounded-xl bg-kvenno-orange px-4 py-3 font-bold text-white hover:bg-kvenno-orange-dark"
        >
          Byrja að flokka
        </button>
      </Shell>
    );
  }

  if (phase === 'done') {
    return (
      <Shell title="Stig 0 — Rafkleyfi" onBack={onBack}>
        <p className="mb-4 text-lg font-bold text-warm-800">
          {correct} af {items.length} rétt.
        </p>
        <p className="mb-6 text-warm-700">
          Nú veistu hvað verður um efnið þegar það leysist. Næsta spurning er hversu mikið af því er
          í lausninni — og það er styrkur, sem er það sem Stig 1 snýst um.
        </p>
        <button
          type="button"
          onClick={() => onComplete(correct * 10)}
          className="game-btn w-full rounded-xl bg-green-600 px-4 py-3 font-bold text-white hover:bg-green-700"
        >
          Til baka í valmynd
        </button>
      </Shell>
    );
  }

  return (
    <Shell title="Stig 0 — Rafkleyfi" onBack={onBack}>
      <p ref={progressRef} className="mb-2 text-sm text-warm-600">
        Efni {index + 1} af {items.length} · {correct} rétt
      </p>

      <div className="mb-6 rounded-xl border-2 border-warm-200 bg-warm-50 p-6 text-center">
        <p className="font-mono text-3xl text-warm-900">{item.formula}</p>
        <p className="mt-1 text-lg font-semibold text-warm-800">{item.name}</p>
        {/* The observable never names the class — that split is the fix for the
            old game's leak, where all fifteen descriptions gave it away. */}
        <p className="mt-2 text-sm text-warm-600">{item.observable}</p>
      </div>

      <div className="mb-6 flex justify-center">
        {/* No verdict before the answer: an unlit bulb *is* the answer for a
            non-electrolyte, so it cannot be on screen yet. */}
        <Bulb state={answer === null ? 'unknown' : CLASSES[truth].bulb} />
      </div>

      {answer === null ? (
        <div className="grid gap-3 sm:grid-cols-3">
          {ORDER.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setAnswer(id);
                if (id === truth) setCorrect(correct + 1);
              }}
              className="game-btn rounded-xl border-2 border-warm-200 bg-white px-4 py-3 font-semibold text-warm-700 hover:bg-warm-50"
            >
              {CLASSES[id].name}
            </button>
          ))}
        </div>
      ) : (
        <div
          className={`rounded-xl border-2 p-4 ${
            isRight ? 'border-green-300 bg-green-50' : 'border-amber-300 bg-amber-50'
          }`}
        >
          <p className="mb-2 font-bold text-warm-900">
            {isRight ? 'Rétt.' : `Nei — ${item.name} er ${CLASSES[truth].name.toLowerCase()}.`}
          </p>
          <p className="mb-2 text-sm text-warm-800">
            <strong>{KIND_NAMES[item.kind]}.</strong> {item.why}
          </p>
          {item.dissociation && (
            <p className="rounded bg-white/70 p-2 font-mono text-sm text-warm-900">
              {item.dissociation}
            </p>
          )}
          {!item.dissociation && (
            <p className="rounded bg-white/70 p-2 text-sm text-warm-700">
              Engin klofnunarjafna — efnið myndar engar jónir.
            </p>
          )}
          <button
            type="button"
            onClick={next}
            className="game-btn mt-4 rounded-xl bg-green-600 px-4 py-2 font-bold text-white hover:bg-green-700 pointer-coarse:min-h-11"
          >
            {index + 1 >= items.length ? 'Ljúka' : 'Næsta'}
          </button>
        </div>
      )}
    </Shell>
  );
}

function Shell({
  title,
  onBack,
  children,
}: {
  title: string;
  onBack: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white p-4 md:p-8">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-4 shadow-2xl sm:p-6 md:p-8">
        <div className="mb-6 flex items-baseline justify-between gap-3">
          <h2 className="text-2xl font-bold text-warm-800">{title}</h2>
          <button
            onClick={onBack}
            className="shrink-0 whitespace-nowrap text-sm text-warm-500 underline pointer-coarse:-mx-2 pointer-coarse:-my-3 pointer-coarse:px-2 pointer-coarse:py-3"
          >
            Til baka
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/**
 * The conductivity apparatus: two electrodes in a beaker with a bulb.
 *
 * Brown's §11.2 figure, and the platform had no conductivity visual of any
 * kind before this. Brightness is also written out in text beneath, so the
 * three states do not depend on telling shades of yellow apart.
 */
function Bulb({ state }: { state: 'bright' | 'dim' | 'off' | 'unknown' }) {
  const fill = {
    bright: '#facc15',
    dim: '#fef3c7',
    off: '#e7e5e4',
    unknown: '#f5f5f4',
  }[state];
  const label = {
    bright: 'Björt pera',
    dim: 'Dauf pera',
    off: 'Slökkt pera',
    unknown: 'Ekki mælt enn',
  }[state];

  return (
    <div className="text-center">
      <svg viewBox="0 0 80 90" className="mx-auto h-24 w-20" role="img" aria-label={label}>
        <circle
          cx="40"
          cy="20"
          r="14"
          fill={fill}
          stroke="#78716c"
          strokeWidth="2"
          strokeDasharray={state === 'unknown' ? '3 3' : undefined}
        />
        {state === 'bright' && (
          <g stroke="#eab308" strokeWidth="2" strokeLinecap="round">
            <line x1="40" y1="0" x2="40" y2="4" />
            <line x1="62" y1="20" x2="66" y2="20" />
            <line x1="18" y1="20" x2="14" y2="20" />
          </g>
        )}
        <line x1="30" y1="32" x2="24" y2="52" stroke="#78716c" strokeWidth="2" />
        <line x1="50" y1="32" x2="56" y2="52" stroke="#78716c" strokeWidth="2" />
        <rect x="20" y="52" width="8" height="24" fill="#a8a29e" />
        <rect x="52" y="52" width="8" height="24" fill="#a8a29e" />
        <path d="M12 50 L12 86 L68 86 L68 50" fill="none" stroke="#57534e" strokeWidth="2" />
        <rect x="13" y="60" width="54" height="25" fill="#bae6fd" opacity="0.6" />
      </svg>
      <p className="mt-1 text-xs text-warm-600">{label}</p>
    </div>
  );
}
