/**
 * Pictograms for the A1 chips (REVIEW-QUEUE D3, C10), from ARASAAC (https://arasaac.org).
 *
 * `content/islenskubraut/myndir/myndir.yaml` names, for every chip a student sees at A1, the
 * English word ARASAAC is searched for, the pictogram chosen and whether a person has approved
 * the pairing. Only an approved picture reaches a student: a pictogram that shows the wrong
 * thing teaches the wrong word, and nothing here can tell.
 *
 * Pure: `myndir-check.mjs` does the reading, writing and fetching, and the tests drive this with
 * small fixtures.
 */

export const ARASAAC_API = 'https://api.arasaac.org/v1';
export const ARASAAC_STATIC = 'https://static.arasaac.org/pictograms';

/** ARASAAC's terms: credit them, in their words, wherever a pictogram is shown. */
export const CREDIT =
  'Myndtáknin eru eign ríkisstjórnar Aragóníu og gerð af Sergio Palao fyrir ARASAAC ' +
  '(https://arasaac.org), sem dreifir þeim með Creative Commons-leyfinu BY-NC-SA.';

const LEVEL = 'A1';

function assert(condition, message) {
  if (!condition) throw new Error(`myndir.yaml: ${message}`);
}

/**
 * Every chip a student sees at A1, per category: the answers to each question at A1, and the
 * words the sentence builder offers (some come from vocabulary groups rather than questions).
 */
export function chipsByCategory(categories) {
  return new Map(
    categories.map((c) => {
      const chips = new Set(
        c.guidingQuestions.flatMap((q) =>
          q.answers.filter((a) => a.level === LEVEL).flatMap((a) => a.options)
        )
      );
      for (const b of (c.builder ?? []).filter((b) => b.level === LEVEL)) {
        for (const o of b.subject.options ?? []) chips.add(o);
        for (const f of b.frames) for (const o of f.blank?.options ?? []) chips.add(o);
      }
      return [c.id, chips];
    })
  );
}

function readEntry(where, raw) {
  assert(raw && typeof raw === 'object' && !Array.isArray(raw), `${where} must be a map`);
  const { search, id = null, approved = false, ...rest } = raw;
  assert(Object.keys(rest).length === 0, `${where} has unknown keys: ${Object.keys(rest)}`);
  assert(typeof search === 'string' && search.trim() !== '', `${where}.search must be a word`);
  assert(id === null || (Number.isInteger(id) && id > 0), `${where}.id must be an ARASAAC number`);
  assert(typeof approved === 'boolean', `${where}.approved must be true or false`);
  assert(!approved || id !== null, `${where} is approved but has no picture (id)`);
  return { search, id, approved };
}

/** The parsed YAML, validated: `{ words: {word: entry}, categories: {id: {word: entry}} }`. */
export function readMyndir(raw) {
  assert(raw && typeof raw === 'object', 'must be a map');
  const words = Object.fromEntries(
    Object.entries(raw.words ?? {}).map(([w, e]) => [w, readEntry(`words.${w}`, e)])
  );
  const categories = Object.fromEntries(
    Object.entries(raw.categories ?? {}).map(([c, map]) => [
      c,
      Object.fromEntries(
        Object.entries(map ?? {}).map(([w, e]) => [w, readEntry(`categories.${c}.${w}`, e)])
      ),
    ])
  );
  return { words, categories };
}

/** The entry for a chip on a category's card: that card's own, else the shared one. */
export function entryFor(myndir, categoryId, word) {
  return myndir.categories[categoryId]?.[word] ?? myndir.words[word];
}

/**
 * Where the map and the cards disagree: chips with no entry (`missing`), entries no card shows
 * (`stale`), and category overrides for a word that card does not have. A chip added to a card
 * without an entry here fails the build, so a card cannot quietly lose its pictures.
 */
export function checkCoverage(myndir, categories) {
  const chips = chipsByCategory(categories);
  const missing = [];
  const used = new Set();
  for (const [id, words] of chips) {
    for (const word of words) {
      if (entryFor(myndir, id, word)) used.add(word);
      else missing.push(`${id}: ${word}`);
    }
  }
  const stale = Object.keys(myndir.words).filter((w) => !used.has(w));
  for (const [id, map] of Object.entries(myndir.categories)) {
    for (const word of Object.keys(map)) {
      if (!chips.get(id)?.has(word)) stale.push(`categories.${id}.${word}`);
    }
  }
  return { missing, stale };
}

/** Every entry, shared and per category, with where it lives in the YAML. */
export function allEntries(myndir) {
  return [
    ...Object.entries(myndir.words).map(([word, e]) => ({ path: ['words', word], word, ...e })),
    ...Object.entries(myndir.categories).flatMap(([c, map]) =>
      Object.entries(map).map(([word, e]) => ({
        path: ['categories', c, word],
        word,
        category: c,
        ...e,
      }))
    ),
  ];
}

/** The approved pictures students see, per category and chip: `{dyr: {feldur: 1234}}`. */
export function approvedPictures(myndir, categories) {
  const out = {};
  for (const [id, words] of chipsByCategory(categories)) {
    const map = {};
    for (const word of [...words].sort((a, b) => a.localeCompare(b, 'is'))) {
      const entry = entryFor(myndir, id, word);
      if (entry?.approved) map[word] = entry.id;
    }
    out[id] = map;
  }
  return out;
}

export const searchUrl = (word) =>
  `${ARASAAC_API}/pictograms/en/search/${encodeURIComponent(word)}`;
export const imageUrl = (id) => `${ARASAAC_STATIC}/${id}/${id}_300.png`;

/**
 * ARASAAC's answer to a search, as pictogram numbers in its order of relevance. Pictograms it
 * marks as sexual or violent are left out, since these cards are for a classroom. A 404 is a
 * word ARASAAC has nothing for; any other shape throws rather than being read as no match.
 */
export function parseSearch(word, status, body) {
  if (status === 404) return [];
  if (status < 200 || status >= 300) throw new Error(`ARASAAC answered ${status} for "${word}"`);
  if (!Array.isArray(body) || body.some((p) => !Number.isInteger(p?._id))) {
    throw new Error(
      `unexpected ARASAAC answer for "${word}": ${JSON.stringify(body).slice(0, 200)}`
    );
  }
  return body.filter((p) => !p.sex && !p.violence).map((p) => p._id);
}

export async function searchPictograms(word, fetchImpl = fetch) {
  const res = await fetchImpl(searchUrl(word), { headers: { accept: 'application/json' } });
  const text = res.status === 404 ? '' : await res.text();
  let body = null;
  if (text !== '') {
    try {
      body = JSON.parse(text);
    } catch {
      throw new Error(`ARASAAC did not send JSON for "${word}": ${text.slice(0, 200)}`);
    }
  }
  return parseSearch(word, res.status, body);
}

const PNG = [0x89, 0x50, 0x4e, 0x47];

/** One pictogram as PNG bytes. Anything that is not a PNG throws rather than being saved. */
export async function fetchPicture(id, fetchImpl = fetch) {
  const res = await fetchImpl(imageUrl(id));
  if (res.status !== 200) throw new Error(`ARASAAC answered ${res.status} for pictogram ${id}`);
  const bytes = new Uint8Array(await res.arrayBuffer());
  if (!PNG.every((b, i) => bytes[i] === b)) throw new Error(`pictogram ${id} is not a PNG`);
  return bytes;
}

const escape = (s) =>
  String(s).replace(
    /[&<>"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]
  );

/**
 * A page for a person to check every pairing: each chip with the chosen picture and the other
 * pictures ARASAAC found, numbered, so a better one can be put in `id`. Opened from disk, not
 * deployed; the alternatives load from ARASAAC's site.
 */
export function reviewSheet(entries, candidates, localSrc) {
  const rows = entries
    .map((e) => {
      const where = e.category ? ` <small>(${escape(e.category)})</small>` : '';
      const chosen = e.id
        ? `<figure><img src="${escape(localSrc(e.id))}" alt=""><figcaption>${e.id}</figcaption></figure>`
        : '<p class="none">Engin mynd valin</p>';
      const others = (candidates[e.search] ?? [])
        .filter((id) => id !== e.id)
        .slice(0, 6)
        .map(
          (id) =>
            `<figure><img src="${escape(imageUrl(id))}" alt="" loading="lazy"><figcaption>${id}</figcaption></figure>`
        )
        .join('');
      const status = e.approved ? '<span class="ok">samþykkt</span>' : '<span>ekki samþykkt</span>';
      return `<tr><th>${escape(e.word)}${where}<br><small>leit: ${escape(e.search)}</small><br>${status}</th><td class="chosen">${chosen}</td><td>${others}</td></tr>`;
    })
    .join('\n');
  return `<!doctype html>
<html lang="is"><meta charset="utf-8"><title>Myndtákn, yfirlit</title>
<style>
body{font-family:system-ui,sans-serif;margin:2rem}table{border-collapse:collapse}
th,td{border-top:1px solid #ccc;padding:.5rem;vertical-align:top;text-align:left}
figure{display:inline-block;margin:0 .5rem .5rem 0;text-align:center}img{width:96px;height:96px}
.chosen img{outline:3px solid #2a7}.none{color:#a00}.ok{color:#2a7;font-weight:bold}
</style>
<h1>Myndtákn fyrir A1-spjöldin</h1>
<p>Grænn rammi: myndin sem er valin (<code>id</code>). Til hægri: aðrar myndir sem ARASAAC fann,
með númeri. Til að skipta, settu númerið í <code>id</code> í <code>myndir.yaml</code>. Þegar myndin
passar við orðið, settu <code>approved: true</code>.</p>
<table>
${rows}
</table>
<p><small>${escape(CREDIT)}</small></p>
</html>
`;
}
