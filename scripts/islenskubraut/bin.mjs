/**
 * Word-level check of the Íslenskubraut content against BÍN — Beygingarlýsing íslensks
 * nútímamáls, the inflection database of Stofnun Árna Magnússonar í íslenskum fræðum.
 *
 * Every word a student reads is looked up as an inflected form in BÍN-kjarninn, the core
 * set of standard forms the public API serves (https://bin.arnastofnun.is/api/). A form
 * BÍN does not know is either a misspelling — `endurunnru`, or the `rannsóka` and
 * `Undirbuníngur` that reached the printed cards before August 2026 — or a real word the
 * core set does not carry, such as a rare compound. Nothing here can tell those two apart,
 * so a person decides, and records a word they accept in `bin/ekki-i-bin.yaml`.
 *
 * The API is called only by `bin-check.mjs --fetch`, and the answers are saved in
 * `bin/ordmyndir.json`. The check itself reads that file and never goes online, so it gives
 * the same answer every time and does not depend on BÍN being up.
 *
 * The pure half lives here so the tests can drive it without a network.
 */

export const BIN_API = 'https://bin.arnastofnun.is/api';

/**
 * BÍN's terms of use: anyone may use BÍN-kjarninn and publish data from it, but must not
 * change the data and must name its origin — that it comes from Beygingarlýsing íslensks
 * nútímamáls and is owned by Stofnun Árna Magnússonar í íslenskum fræðum. The data is
 * licensed CC BY-SA 4.0. The saved lookups carry both, so the file states its own terms
 * wherever it is copied; the forms in it are stored exactly as BÍN sent them.
 */
export const SOURCE =
  'Gögnin eru úr Beygingarlýsingu íslensks nútímamáls (BÍN-kjarnanum) og eru í eigu Stofnunar Árna Magnússonar í íslenskum fræðum. https://bin.arnastofnun.is/';
export const LICENSE = 'CC BY-SA 4.0 — https://creativecommons.org/licenses/by-sa/4.0/';

/** The saved-lookups file: attribution and licence first, then every form in Icelandic order. */
export function cacheDocument(cache) {
  const ordmyndir = Object.fromEntries(
    Object.keys(cache)
      .sort((a, b) => a.localeCompare(b, 'is'))
      .map((k) => [k, cache[k]])
  );
  return { _heimild: SOURCE, _leyfi: LICENSE, ordmyndir };
}

/** Letter runs. `___` blanks, punctuation, digits and parentheses all split words. */
const WORD_RE = /\p{L}+/gu;

/**
 * Every word in the content a student reads, with where it appears.
 *
 * Takes `loadCategories()` output. Icons, colours and ids are not text and are skipped.
 * Returns a Map from the word exactly as written to a list of `{ category, place, text }`,
 * in content order.
 */
export function collectWords(categories) {
  const words = new Map();
  const add = (category, place, text) => {
    for (const [word] of text.matchAll(WORD_RE)) {
      if (!words.has(word)) words.set(word, []);
      words.get(word).push({ category, place, text });
    }
  };

  for (const c of categories) {
    add(c.id, 'heiti', c.name);
    add(c.id, 'lýsing', c.description);
    for (const s of c.subCategories) {
      add(c.id, s.name, s.name);
      for (const o of s.options) add(c.id, s.name, o);
    }
    for (const f of c.sentenceFrames) for (const x of f.frames) add(c.id, `rammi ${f.level}`, x);
    for (const e of c.examples ?? []) add(c.id, `dæmi ${e.level}`, e.text);
    for (const n of c.teacherNotes ?? []) add(c.id, `fyrir kennara ${n.level}`, n.text);
    for (const q of c.guidingQuestions) {
      add(c.id, q.question, q.question);
      if (q.label) add(c.id, q.question, q.label);
      for (const a of q.answers)
        for (const o of a.options) add(c.id, `${q.question} ${a.level}`, o);
    }
  }
  return words;
}

/** Lower-case a word the Icelandic way. */
export function lower(word) {
  return word.toLocaleLowerCase('is');
}

/**
 * The forms to try for a written word, most likely first: the lower-case form, then the
 * word as written when it differs. All but a handful of capitals in the content start a
 * sentence (`Það`, `Hvernig`), so the lower-case form is the one BÍN lists; a proper noun
 * is found under its capital.
 */
export function candidateForms(word) {
  const l = lower(word);
  return l === word ? [word] : [l, word];
}

/**
 * Turn one API answer into what the cache stores for that form.
 *
 * The API returns, per its documentation, a one-element array carrying the full
 * paradigm when a single word matches, and an array of `{ ord, guid, ofl, kyn, hluti }`
 * without forms when several do. The documentation names the forms field
 * `beygingarmyndir` in its prose and `bmyndir` in its example, so both are read. What the
 * API sends for no match is not documented. The live API answered `{"0":""}` for `umar`
 * (first run, 2026-10-09), so a body whose every value is an empty string is "not found",
 * as are a 404, an empty array and an empty object. Anything else unexpected throws rather
 * than being guessed at.
 *
 * Each lemma is stored with the tags under which `form` appears in it, when the response
 * carries the paradigm, so a later step can read case and number without a second fetch.
 */
export function parseBinResponse(form, status, body) {
  if (status === 404) return { found: false };
  if (status < 200 || status >= 300) {
    throw new Error(`BÍN answered ${status} for "${form}"`);
  }
  if (body == null || (typeof body === 'object' && Object.values(body).every((v) => v === ''))) {
    return { found: false };
  }
  const entries = Array.isArray(body) ? body : [body];
  if (!entries.every((e) => e && typeof e.ord === 'string' && typeof e.guid === 'string')) {
    throw new Error(`unexpected BÍN response for "${form}": ${JSON.stringify(body).slice(0, 200)}`);
  }
  const lemmas = entries.map((e) => {
    const lemma = { ord: e.ord, guid: e.guid, ofl: e.ofl ?? '', kyn: e.kyn ?? '' };
    const forms = e.bmyndir ?? e.beygingarmyndir;
    if (Array.isArray(forms)) lemma.tags = forms.filter((f) => f.b === form).map((f) => f.g);
    return lemma;
  });
  return { found: true, lemmas };
}

/** Look up one inflected form. `fetchImpl` is injectable for tests. */
export async function fetchForm(form, fetchImpl = fetch) {
  const url = `${BIN_API}/beygingarmynd/${encodeURIComponent(form)}`;
  const res = await fetchImpl(url, { headers: { accept: 'application/json' } });
  let body = null;
  if (res.status !== 404) {
    const text = await res.text();
    if (text.trim() !== '') {
      try {
        body = JSON.parse(text);
      } catch {
        throw new Error(`BÍN did not send JSON for "${form}": ${text.slice(0, 200)}`);
      }
    }
  }
  return parseBinResponse(form, res.status, body);
}

/**
 * Sort every word into one of three outcomes against the cache and the accepted list.
 *
 * - `found`: some candidate form is in the cache as found, or the word is accepted
 * - `notFound`: every candidate form is cached, and BÍN knew none of them
 * - `uncached`: some candidate form has never been looked up — run `--fetch`
 *
 * `accepted` is matched on the lower-case form, which is how a teacher writes it.
 */
export function classify(words, cache, accepted = {}) {
  const result = { found: [], notFound: [], uncached: [] };
  for (const word of words.keys()) {
    const forms = candidateForms(word);
    if (Object.hasOwn(accepted, lower(word)) || forms.some((f) => cache[f]?.found)) {
      result.found.push(word);
    } else if (forms.every((f) => Object.hasOwn(cache, f))) {
      result.notFound.push(word);
    } else {
      result.uncached.push(word);
    }
  }
  return result;
}

/**
 * The next form to look up for each word that still needs one, in content order, without
 * duplicates: its first candidate not yet cached, unless an earlier candidate was already
 * found. So a capitalised word is tried as written only after its lower-case form came back
 * empty. Call again after fetching until it returns nothing.
 */
export function formsToFetch(words, cache) {
  const out = new Set();
  for (const word of words.keys()) {
    for (const f of candidateForms(word)) {
      if (cache[f]?.found) break;
      if (!Object.hasOwn(cache, f)) {
        out.add(f);
        break;
      }
    }
  }
  return [...out];
}

/** Accepted words are a map from the word to a reason a person wrote. Throws on a bare entry. */
export function validateAccepted(accepted) {
  if (accepted == null) return {};
  if (typeof accepted !== 'object' || Array.isArray(accepted)) {
    throw new Error('ekki-i-bin.yaml must be a map of "word: reason"');
  }
  for (const [word, reason] of Object.entries(accepted)) {
    if (word !== lower(word)) throw new Error(`ekki-i-bin.yaml: write "${word}" in lower case`);
    if (typeof reason !== 'string' || reason.trim() === '') {
      throw new Error(`ekki-i-bin.yaml: "${word}" has no reason`);
    }
  }
  return accepted;
}

/** Human-readable report of words BÍN did not know, each with the phrases it appears in. */
export function formatNotFound(words, notFound) {
  const lines = [];
  for (const word of [...notFound].sort((a, b) => a.localeCompare(b, 'is'))) {
    const seen = new Set();
    const places = [];
    for (const { category, text } of words.get(word)) {
      const key = `${category}: ${text}`;
      if (!seen.has(key)) {
        seen.add(key);
        places.push(key);
      }
    }
    lines.push(`  ${word}`);
    for (const p of places.slice(0, 3)) lines.push(`      ${p}`);
    if (places.length > 3) lines.push(`      … and ${places.length - 3} more`);
  }
  return lines.join('\n');
}
