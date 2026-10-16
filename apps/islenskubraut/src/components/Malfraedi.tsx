import { useMemo, useState } from 'react';

import type { SmidurLevel, SmidurSubject, SmidurTable, SmidurWord } from '../data/smidur';

/**
 * Visible grammar on the sentence builder (docs/research/islenskubraut-additions/, item 7): why
 * each underlined word changed, every form of an inflected word from BÍN, and a short drill on
 * the same forms. All of it is read off the builder's data, so it is as confirmed as the builder
 * is (REVIEW-QUEUE C9, C17).
 */

const GENDER_ADJ: Record<SmidurSubject['gender'], string> = {
  kk: 'karlkyns',
  kvk: 'kvenkyns',
  hk: 'hvorugkyns',
};
const GENDER_NOUN: Record<SmidurSubject['gender'], string> = {
  kk: 'karlkyn',
  kvk: 'kvenkyn',
  hk: 'hvorugkyn',
};
const CASE_NAME: Record<SmidurTable['rows'][number]['case'], string> = {
  NF: 'Nefnifall',
  ÞF: 'Þolfall',
  ÞGF: 'Þágufall',
  EF: 'Eignarfall',
};

/** One line saying why a word differs from the card, for a subject. */
export function reason(word: SmidurWord, subject: SmidurSubject): string | null {
  const why = word.why;
  if (!why) return null;
  const change = `„${why.from}“ verður „${why.to}“`;
  const number = subject.number === 'FT' ? 'í fleirtölu' : 'í eintölu';
  switch (why.kind) {
    case 'sögn':
      return `${change} af því að „${subject.text}“ er ${number}.`;
    case 'fornafn':
      return subject.person
        ? `${change}: fornafnið fylgir manneskjunni.`
        : `${change} af því að „${subject.text}“ er ${GENDER_ADJ[subject.gender]} og ${number}.`;
    case 'samræmi':
      return `${change}: lýsingarorðið fylgir „${subject.text}“ (${GENDER_NOUN[subject.gender]}, ${
        subject.number === 'FT' ? 'fleirtala' : 'eintala'
      }).`;
    case 'þolfall':
      return `${change}: á eftir „${why.verb}“ kemur þolfall.`;
  }
}

/** How much of `form` matches the word's base form from the start; the rest is what changed. */
function shared(form: string, base: string): number {
  let i = 0;
  while (i < form.length && i < base.length && form[i] === base[i]) i++;
  return i;
}

/** A word's forms, what differs from its base form in bold, and the form in the sentence ringed. */
export function WordTable({ table, current }: { table: SmidurTable; current: string }) {
  const base = table.ord;
  const show = (form: string) =>
    form.split(' / ').map((f, i) => (
      <span key={f}>
        {i > 0 && ' / '}
        <span className={f === current ? 'rounded px-1 ring-2 ring-warm-400' : undefined}>
          {f.slice(0, shared(f, base))}
          <strong>{f.slice(shared(f, base))}</strong>
        </span>
      </span>
    ));
  return (
    <table className="mt-2 text-sm border-collapse">
      <caption className="sr-only">Allar myndir orðsins {table.ord}</caption>
      <thead>
        <tr>
          <td />
          {table.columns.map((c) => (
            <th key={c} scope="col" className="px-2 py-1 text-left font-semibold text-warm-700">
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {table.rows.map((r) => (
          <tr key={r.case} className="border-t border-warm-200">
            <th scope="row" className="pr-3 py-1 text-left font-normal text-warm-600">
              {CASE_NAME[r.case]}
            </th>
            {r.forms.map((f, i) => (
              <td key={i} className="px-2 py-1 text-warm-900">
                {show(f)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Under the sentence: each changed word's reason, and the forms of each inflected one. */
export function WhyList({
  words,
  subject,
  tables,
}: {
  words: SmidurWord[];
  subject: SmidurSubject;
  tables: SmidurLevel['tables'];
}) {
  const changed = words.filter((w) => w.changed && w.why);
  if (changed.length === 0) return null;
  return (
    <ul className="mt-3 space-y-2 text-sm text-warm-800" aria-label="Af hverju breytast orðin?">
      {changed.map((w, i) => {
        const table = w.lemma ? tables[w.lemma] : undefined;
        return (
          <li key={i}>
            {reason(w, subject)}
            {table && (
              <details className="mt-1">
                <summary className="cursor-pointer text-warm-600 underline">
                  Allar myndir orðsins „{table.ord}“
                </summary>
                <WordTable table={table} current={w.word.replace(/[.,?!]+$/, '')} />
              </details>
            )}
          </li>
        );
      })}
    </ul>
  );
}

interface DrillItem {
  before: string;
  after: string;
  base: string;
  answer: string;
  choices: string[];
  why: string | null;
}

/** Every inflected word in a level's sentences, once each, as a pick-the-form question. */
export function drillItems(data: SmidurLevel): DrillItem[] {
  const seen = new Set<string>();
  const items: DrillItem[] = [];
  for (const frame of data.frames) {
    frame.sentences.forEach((row, s) =>
      row.forEach((words) => {
        words.forEach((w, i) => {
          if (!w.choices || !w.why || w.choices.length < 2) return;
          const answer = w.word.replace(/[.,?!]+$/, '');
          const punct = w.word.slice(answer.length);
          const key = `${frame.frame}|${data.subjects[s].text}|${answer}`;
          if (seen.has(key)) return;
          seen.add(key);
          items.push({
            before: words
              .slice(0, i)
              .map((x) => x.word)
              .join(' '),
            after: (
              punct +
              ' ' +
              words
                .slice(i + 1)
                .map((x) => x.word)
                .join(' ')
            ).trim(),
            base: w.why.from,
            answer,
            choices: [...w.choices].sort((a, b) => a.localeCompare(b, 'is')),
            why: reason(w, data.subjects[s]),
          });
        });
      })
    );
  }
  return items;
}

/**
 * "Æfing": one sentence at a time with a word left out; the student picks its form. A wrong pick
 * says so and stays to try again; a right one says why. No score and nothing saved, as on the
 * rest of the site.
 */
export function Aefing({ data, color }: { data: SmidurLevel; color: string }) {
  const items = useMemo(() => drillItems(data), [data]);
  const [index, setIndex] = useState(0);
  const [tried, setTried] = useState<string[]>([]);
  if (items.length === 0) return null;
  const item = items[index % items.length];
  const solved = tried.includes(item.answer);
  const last = tried.at(-1);
  const next = () => {
    setIndex(index + 1);
    setTried([]);
  };

  return (
    <section aria-labelledby="smidur-aefing" className="mt-12 max-w-2xl">
      <h2
        id="smidur-aefing"
        className="font-heading text-sm font-semibold text-warm-600 uppercase tracking-wider mb-3"
      >
        Æfing
      </h2>
      <p className="text-sm text-warm-600 mb-3">Veldu rétta mynd orðsins.</p>
      <p className="text-xl text-warm-900 mb-4" data-testid="aefing-setning">
        {item.before} <span className="font-semibold">___</span>
        {/^[.,?!]/.test(item.after) ? '' : ' '}
        {item.after} <span className="text-warm-600">({item.base})</span>
      </p>
      <div role="group" aria-label="Myndir orðsins" className="flex flex-wrap gap-2">
        {item.choices.map((c) => {
          const wrong = tried.includes(c) && c !== item.answer;
          const right = solved && c === item.answer;
          return (
            <button
              key={c}
              type="button"
              disabled={wrong || solved}
              onClick={() => setTried([...tried, c])}
              className={`px-4 py-2 rounded-lg font-medium pointer-coarse:min-h-11 ${
                right
                  ? 'text-white'
                  : wrong
                    ? 'bg-warm-100 text-warm-500 line-through'
                    : 'bg-warm-100 text-warm-800 hover:bg-warm-200'
              }`}
              style={right ? { backgroundColor: color } : undefined}
            >
              {c}
            </button>
          );
        })}
      </div>
      <p role="status" className="mt-3 text-sm text-warm-800 min-h-5">
        {solved ? `Rétt. ${item.why ?? ''}` : last ? 'Ekki alveg. Reyndu aftur.' : ''}
      </p>
      {solved && (
        <button
          type="button"
          onClick={next}
          className="mt-3 px-4 py-2 rounded-lg font-semibold border-2 text-warm-900 hover:bg-warm-100 pointer-coarse:min-h-11"
          style={{ borderColor: color }}
        >
          Næsta setning
        </button>
      )}
    </section>
  );
}
