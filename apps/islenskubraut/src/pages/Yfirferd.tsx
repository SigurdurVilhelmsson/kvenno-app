import { useState, type ReactNode } from 'react';

import { Link } from 'react-router-dom';

import { Container } from '@kvenno/shared/components';

import { categories } from '../data';
import { egget } from '../data/egget';
import { giskaleikur } from '../data/giskaleikur';
import { glossur } from '../data/glossur';
import { hlustun } from '../data/hlustun';
import { tenglar } from '../data/tenglar';
import { texti } from '../data/texti';
import type { Category, Level } from '../data/types';
import { useKeepScroll } from '../yfirferd/scroll';
import { Sending } from '../yfirferd/Sending';
import { ITEMS, one, useReview, type ItemId, type Review } from '../yfirferd/store';

const LEVELS: Level[] = ['A1', 'A2', 'B1'];

/** What an item's state means to a student: on the site, or waiting for a teacher. */
type State = 'birt' | 'staðfest' | 'drög';

interface Row {
  item: ItemId;
  state: State;
  /** A count where the item is many things, as recordings are: `3 af 80 samþykktar`. */
  detail?: string;
  /** Per level, or once for the card. */
  links: { label: string; href: string; internal?: boolean }[];
  /** What a teacher should look at, in one line. */
  hint: string;
}

const pdf = (kind: string, id: string, level: Level) =>
  `${import.meta.env.BASE_URL}spjold/${kind}-${id}-${level}.pdf`;
const card = (id: string, level: Level) => `/spjald/${id}?stig=${level}&drog`;
// The card at each level: links, glosses and chips differ from level to level.
const cards = (id: string) => LEVELS.map((l) => ({ label: l, href: card(id, l), internal: true }));

/** Every item of one card, with its state and where to open it. */
function rows(category: Category): Row[] {
  const id = category.id;
  const confirmed = (flag?: { confirmed: boolean }): State =>
    flag?.confirmed ? 'staðfest' : 'drög';
  const perLevel = (kind: string) =>
    LEVELS.map((l) => ({ label: `${l} (PDF)`, href: pdf(kind, id, l) }));
  const out: Row[] = [
    {
      item: 'spjald',
      state: category.draft ? 'drög' : 'birt',
      links: [
        ...LEVELS.map((l) => ({ label: l, href: card(id, l), internal: true })),
        ...perLevel('spjald'),
      ],
      hint: 'Orðin, rammarnir, spurningarnar og dæmið á hverju stigi.',
    },
    {
      item: 'ordalisti',
      state: category.draft ? 'drög' : 'birt',
      links: perLevel('ordalisti'),
      hint: 'Ný orð á hverju stigi, með línu fyrir eigið tungumál.',
    },
    {
      item: 'giskaleikur',
      state: confirmed(giskaleikur[id]),
      links: perLevel('giskaleikur'),
      hint: 'Er lýsingin á hverjum hlut rétt, og þekkir nemandi á þessu stigi hlutina?',
    },
    {
      item: 'texti',
      state: confirmed(texti[id]),
      links: perLevel('texti'),
      hint: 'Er textinn eðlileg íslenska, á réttu stigi, og passa eyðurnar?',
    },
    {
      item: 'egget',
      state: confirmed(egget[id]),
      links: perLevel('egget'),
      hint: 'Lýsir hver setning því sem nemandi getur gert með spjaldinu á þessu stigi?',
    },
  ];
  const builder = category.builder?.find((b) => b.level === 'A1');
  if (builder) {
    out.push({
      item: 'smidur',
      state: builder.confirmed ? 'staðfest' : 'drög',
      links: [{ label: 'Opna A1', href: `/smidur/${id}`, internal: true }],
      hint: 'Eru setningarnar réttar með öllum orðum? Breyttu orðin eru undirstrikuð.',
    });
  }
  const clips = hlustun.filter((c) => c.places.some((p) => p.category === id));
  const heard = clips.filter((c) => c.approved).length;
  out.push({
    item: 'hljod',
    state: clips.length > 0 && heard === clips.length ? 'staðfest' : 'drög',
    detail: `${heard} af ${clips.length} ${one(heard) ? 'samþykkt' : 'samþykktar'}`,
    links: [{ label: 'Hlusta', href: `/yfirferd/hljod?flokkur=${id}`, internal: true }],
    hint: 'Hlustaðu á hverja upptöku og merktu hana rétta eða ranga.',
  });
  const links = tenglar.filter((t) => t.urls[id]);
  if (links.length > 0) {
    const approved = links.filter((t) => t.approved).length;
    out.push({
      item: 'tenglar',
      state: approved === links.length ? 'staðfest' : 'drög',
      detail: `${approved} af ${links.length} ${one(approved) ? 'samþykktur' : 'samþykktir'}`,
      links: cards(id),
      hint: 'Neðst á spjaldinu, á hverju stigi. Opnaðu hvern tengil. Er lýsingin rétt og á hann heima á þessu spjaldi og stigi?',
    });
  }
  if (glossur.length > 0) {
    out.push({
      item: 'glossur',
      state: glossur.every((g) => g.approved) ? 'staðfest' : 'drög',
      detail: glossur.map((g) => `${g.name}${g.approved ? '' : ' (drög)'}`).join(', '),
      links: cards(id),
      hint: 'Veldu málið undir „Á þínu máli“ og lestu orðin á spurningaspjaldinu, á hverju stigi. Þetta þarf að lesa sá sem talar málið.',
    });
  }
  return out;
}

const STATE_TEXT: Record<State, string> = {
  birt: 'birt nemendum',
  staðfest: 'staðfest',
  drög: 'drög',
};

/**
 * Everything on Íslenskubraut that waits for a teacher, card by card (REVIEW-QUEUE C13–C19): its
 * state, where to open it, and a note to send back. No page a student sees links here; the
 * listening page links back.
 */
export function Yfirferd() {
  const { review, update, saved } = useReview();
  useKeepScroll();

  return (
    <Container className="py-8 sm:py-12">
      <h1 className="font-heading text-2xl sm:text-3xl font-bold text-warm-900 mb-4">Yfirferð</h1>
      <div className="max-w-2xl space-y-3 text-warm-800 mb-8">
        <p>
          Hér er allt á Íslenskubraut sem bíður þess að kennari fari yfir það. Ekkert sem merkt er
          „drög“ birtist nemendum fyrr en búið er að staðfesta það, nema hvað upptökur, tenglar og
          tungumál undir „Á þínu máli“ birtast eitt og eitt, um leið og hvert þeirra er samþykkt.
          Það sem merkt er „birt nemendum“ sjá nemendur nú þegar. Engin síða sem nemendur sjá vísar
          hingað.
        </p>
        <ol className="list-decimal pl-6 space-y-1">
          <li>
            Opnaðu hvert atriði. Hlekkirnir sýna drögin eins og nemandi myndi sjá þau, og
            PDF-skjölin eins og þau prentast.
          </li>
          <li>
            Skrifaðu athugasemd þar sem eitthvað er rangt, óeðlilegt eða á röngu stigi. Það er nóg
            að nefna stigið og orðið, til dæmis „A2: „loðið“ á ekki heima hér“.
          </li>
          <li>
            Hlustaðu á upptökurnar á{' '}
            <Link to="/yfirferd/hljod" className="underline hover:text-warm-900">
              hlustunarsíðunni
            </Link>{' '}
            og merktu hverja rétta eða ranga.
          </li>
          <li>Sendu yfirferðina neðst á síðunni, sem skrá eða texta í tölvupósti.</li>
        </ol>
      </div>

      <nav aria-label="Spjöldin" className="mb-8">
        <ul className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <li key={c.id}>
              <a
                href={`#${c.id}`}
                className="inline-block rounded-lg border border-warm-300 px-3 py-1 text-sm text-warm-900 hover:bg-warm-100"
              >
                {c.icon} {c.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="space-y-10 max-w-3xl">
        {categories.map((category) => (
          <section key={category.id} id={category.id} aria-labelledby={`h-${category.id}`}>
            <h2
              id={`h-${category.id}`}
              className="font-heading text-xl font-bold text-warm-900 mb-3 flex items-center gap-2"
            >
              <span aria-hidden="true">{category.icon}</span>
              {category.name}
              {category.draft && (
                <span className="text-sm font-normal text-warm-700">(drög, ekki á forsíðu)</span>
              )}
            </h2>
            <ul className="space-y-3">
              {rows(category).map((row) => (
                <ItemRow
                  key={row.item}
                  category={category}
                  row={row}
                  review={review}
                  update={update}
                />
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="mt-12 max-w-3xl">
        <Sending review={review} update={update} saved={saved} />
      </div>
    </Container>
  );
}

function ItemRow({
  category,
  row,
  review,
  update,
}: {
  category: Category;
  row: Row;
  review: Review;
  update: (change: (r: Review) => Review) => void;
}) {
  const name = ITEMS.find((i) => i.id === row.item)!.name;
  const key = `${category.id}/${row.item}`;
  const note = review.notes[key] ?? '';
  const noteId = `athugasemd-${category.id}-${row.item}`;
  // Open at first if a note is written; after that the teacher's own clicks decide, so emptying
  // the box to rewrite it does not shut it under the cursor.
  const [open, setOpen] = useState(() => note.trim() !== '');
  return (
    <li className="rounded-xl border border-warm-200 bg-surface-raised p-3 sm:p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h3 className="font-semibold text-warm-900">{name}</h3>
        <p className="text-sm text-warm-700">
          <StateBadge state={row.state} />
          {row.detail ? ` · ${row.detail}` : ''}
        </p>
      </div>
      <p className="mt-1 text-sm text-warm-700">{row.hint}</p>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm" aria-label={`${name}: opna`}>
        {row.links.map((l) => (
          <li key={l.href}>
            <Opna link={l} context={`${category.name}, ${name}`} />
          </li>
        ))}
      </ul>
      <details className="mt-2" open={open} onToggle={(e) => setOpen(e.currentTarget.open)}>
        <summary className="cursor-pointer text-sm text-warm-800 underline pointer-coarse:py-2">
          Athugasemd{note.trim() ? ' (skrifuð)' : ''}
        </summary>
        <label htmlFor={noteId} className="sr-only">
          Athugasemd um {name}, {category.name}
        </label>
        <textarea
          id={noteId}
          value={note}
          onChange={(e) => {
            const text = e.target.value;
            update((r) => ({ ...r, notes: { ...r.notes, [key]: text } }));
          }}
          rows={3}
          className="mt-2 block w-full rounded-lg border border-warm-300 bg-surface-page px-3 py-2 text-sm"
        />
      </details>
    </li>
  );
}

function StateBadge({ state }: { state: State }) {
  return (
    <span
      className={`inline-block rounded px-1.5 font-semibold ${
        state === 'drög' ? 'bg-warm-100 text-warm-900' : 'text-warm-900'
      }`}
    >
      {STATE_TEXT[state]}
    </span>
  );
}

/** A link to open an item, its card and item named for a screen reader. */
function Opna({
  link,
  context,
}: {
  link: { label: string; href: string; internal?: boolean };
  context: string;
}): ReactNode {
  const body = (
    <>
      {link.label}
      <span className="sr-only">, {context}</span>
    </>
  );
  const className = 'font-semibold text-warm-900 underline hover:text-warm-600';
  return link.internal ? (
    <Link to={link.href} className={className}>
      {body}
    </Link>
  ) : (
    <a href={link.href} className={className}>
      {body}
    </a>
  );
}
