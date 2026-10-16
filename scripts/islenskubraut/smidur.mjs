/**
 * The sentence builder's grammar (REVIEW-QUEUE D3): from a card's builder tags, BÍN's saved
 * lookups and its inflection tables, the sentence a student builds.
 *
 * A sentence is about a subject, picked first ("Þetta er ávöxtur") or fixed by the card
 * ("Þetta er dýr"). Its gender and number come from BÍN and decide the rest: the pronoun
 * (`Það er` → `Hann er`), the verb (`er` → `eru` for `buxur`) and an adjective in the blank
 * (`sætt` → `sætur`). A noun after `hefur` goes in the accusative (`feldur` → `feld`). For a
 * person the pronoun follows the person, not the noun (a `kennari` can be `hún`), so the
 * student picks `hún` or `hann`.
 *
 * Nothing is guessed. A form BÍN has not supplied, or a word that is two different words of
 * the needed class in BÍN, is reported as a problem for a person, never filled in.
 *
 * Pure: the tests drive it with small tables, and `smidur-check.mjs` with the saved files.
 */
import { candidateForms } from './bin.mjs';

/** Personal pronouns by case, number and gender. A closed class, so written out here. */
const PRONOUNS = {
  NF: { ET: { kk: 'hann', kvk: 'hún', hk: 'það' }, FT: { kk: 'þeir', kvk: 'þær', hk: 'þau' } },
  ÞF: { ET: { kk: 'hann', kvk: 'hana', hk: 'það' }, FT: { kk: 'þá', kvk: 'þær', hk: 'þau' } },
};
const VERA = { ET: 'er', FT: 'eru' };
const GENDER_TAG = { kk: 'KK', kvk: 'KVK', hk: 'HK' };

/** The words a chip is made of. `há/hár` gives two spellings of one word; the first is used. */
function tokens(option) {
  return option.split('/')[0].trim().split(/\s+/);
}

/**
 * The one BÍN word of class `ofl` (`no`, `lo`) that `form` is a form of, from the saved
 * lookups. `null` when `form` is a word of no such class, which leaves it as written.
 */
export function lemmaOf(form, ofl, lookups, chosen = {}) {
  let looked = false;
  for (const candidate of candidateForms(form)) {
    const entry = lookups[candidate];
    if (!entry) continue;
    looked = true;
    if (!entry.found) continue;
    let matches = entry.lemmas.filter((l) => l.ofl === ofl);
    if (matches.length > 1 && chosen[form]) {
      matches = matches.filter((l) => l.ord === chosen[form]);
      if (matches.length === 0) {
        throw new Error(`"${form}" is not a form of "${chosen[form]}" in BÍN (lemmas)`);
      }
    }
    if (matches.length === 1) return matches[0];
    if (matches.length > 1) {
      throw new Error(
        `"${form}" is ${matches.length} different ${ofl} words in BÍN ` +
          `(${matches.map((l) => l.ord).join(', ')}): name one under lemmas`
      );
    }
  }
  if (!looked) throw new Error(`"${form}" has not been looked up in BÍN (--fetch)`);
  return null;
}

/** The form one word of a blank takes: its own, where the tags give it one, else the blank's. */
export function formOf(blank, option) {
  return blank.forms?.[option] ?? blank.form;
}

/** Whether a frame is offered with a subject: not when the tags name the subject under `except`. */
export function fits(frame, subject) {
  return !frame.except?.includes(subject.text);
}

/** Every inflection table the builder needs: one GUID per word it inflects or reads a gender from. */
export function paradigmsNeeded(categories, lookups) {
  const guids = new Set();
  const problems = [];
  const need = (form, ofl, where, chosen) => {
    try {
      const lemma = lemmaOf(form, ofl, lookups, chosen);
      if (lemma) guids.add(lemma.guid);
      else if (ofl === 'no' && where.endsWith('subject')) {
        problems.push(`${where}: "${form}" is not a noun in BÍN`);
      }
    } catch (err) {
      problems.push(`${where}: ${err.message}`);
    }
  };
  for (const c of categories) {
    for (const b of c.builder ?? []) {
      const where = `${c.id} ${b.level}`;
      if (b.subject.kind === 'words') {
        for (const o of b.subject.options) {
          need(tokens(o).at(-1), 'no', `${where} subject`, b.lemmas);
        }
      } else if (b.subject.kind === 'word') {
        need(b.subject.word, 'no', `${where} subject`, b.lemmas);
      }
      for (const f of b.frames) {
        if (!f.blank?.options) continue;
        for (const o of f.blank.options) {
          const form = formOf(f.blank, o);
          if (form !== 'agree' && form !== 'ÞF') continue;
          for (const t of tokens(o))
            need(t, form === 'agree' ? 'lo' : 'no', `${where} "${f.frame}"`, b.lemmas);
        }
      }
    }
  }
  return { guids: [...guids].sort(), problems };
}

function table(guid, paradigms) {
  const p = paradigms[guid];
  if (!p) throw new Error(`no inflection table for ${guid} yet (--fetch)`);
  return p;
}

function formWithTag(paradigm, tag) {
  const hit = paradigm.bmyndir.find((f) => f.g === tag);
  if (!hit) throw new Error(`BÍN has no ${tag} form of "${paradigm.ord}"`);
  return hit.b;
}

/** The number a noun form is in: singular unless BÍN reads it only as plural, or the card says so. */
function numberOf(form, paradigm, plural) {
  if (plural) return 'FT';
  const tags = paradigm.bmyndir.filter((f) => f.b === form).map((f) => f.g);
  if (tags.includes('NFET')) return 'ET';
  if (tags.includes('NFFT')) return 'FT';
  throw new Error(`"${form}" is not a nominative of "${paradigm.ord}" in BÍN`);
}

/** Who or what a builder's sentences can be about, each with its gender and number. */
export function subjectsOf(builder, lookups, paradigms) {
  const { subject } = builder;
  if (subject.kind === 'person') {
    return [
      { text: 'hún', gender: 'kvk', number: 'ET', person: true },
      { text: 'hann', gender: 'kk', number: 'ET', person: true },
    ];
  }
  const texts = subject.kind === 'word' ? [subject.word] : subject.options;
  return texts.map((text) => {
    const head = tokens(text).at(-1);
    const lemma = lemmaOf(head, 'no', lookups, builder.lemmas);
    if (!lemma) throw new Error(`"${head}" is not a noun in BÍN`);
    const paradigm = table(lemma.guid, paradigms);
    const plural = subject.plural?.includes(text) ?? false;
    return { text, gender: paradigm.kyn, number: numberOf(head, paradigm, plural) };
  });
}

const CASES = ['NF', 'ÞF', 'ÞGF', 'EF'];
const GENDERS = ['KK', 'KVK', 'HK'];

/** The distinct forms among `tags` in a table, in order: the alternatives a drill offers. */
function formsOf(paradigm, tags) {
  return [...new Set(tags.flatMap((t) => paradigm.bmyndir.filter((f) => f.g === t).map((f) => f.b)))];
}

/**
 * One word of a blank, put in the form the blank asks for, with what a student needs to see why:
 * the BÍN word it is a form of, and the forms it could have been in its place. A word of no
 * class the blank inflects (`með` in `með hjólum`) comes back as written.
 */
function inflectWord(word, form, subject, lookups, paradigms, chosen) {
  if (form === 'agree') {
    const lemma = lemmaOf(word, 'lo', lookups, chosen);
    if (!lemma) return { word };
    const paradigm = table(lemma.guid, paradigms);
    const tag = `FSB-${GENDER_TAG[subject.gender]}-NF${subject.number}`;
    return {
      word: formWithTag(paradigm, tag),
      lemma: lemma.guid,
      choices: formsOf(
        paradigm,
        GENDERS.map((g) => `FSB-${g}-NF${subject.number}`)
      ),
    };
  }
  // ÞF: a noun in the nominative goes into the accusative of the same number.
  const lemma = lemmaOf(word, 'no', lookups, chosen);
  if (!lemma) return { word };
  const paradigm = table(lemma.guid, paradigms);
  const number = numberOf(word, paradigm, false);
  return {
    word: formWithTag(paradigm, `ÞF${number}`),
    lemma: lemma.guid,
    choices: formsOf(
      paradigm,
      CASES.map((c) => `${c}${number}`)
    ),
  };
}

function capitalised(model, word) {
  return model[0] === model[0].toLocaleUpperCase('is')
    ? word[0].toLocaleUpperCase('is') + word.slice(1)
    : word;
}

/**
 * The sentence a frame makes about `subject` with `option` in its blank, word by word. A word the
 * grammar decides carries `why`: a pronoun or `er` that follows the subject, an adjective that
 * agrees with it, or a noun in the accusative after the frame's verb (`verb`). An inflected word
 * also names its BÍN word (`lemma`) and the forms it could have been (`choices`). Throws, naming
 * what is missing, when BÍN has not supplied a form the sentence needs.
 */
export function buildWords(frame, subject, option, lookups, paradigms, chosen = {}) {
  const roles = new Map(frame.agree.map((a) => [a.word, a.role]));
  const parts = frame.frame.split(' ');
  const out = [];
  parts.forEach((tok, i) => {
    const [, core, punct] = tok.match(/^(.*?)([.,?!]*)$/);
    const end = (words) => {
      words[words.length - 1].word += punct;
      out.push(...words);
    };
    if (core === '___') {
      // Word by word, as the sentence is compared with the card word by word.
      const asWritten = (text) => text.split(' ').map((word) => ({ word }));
      if (frame.blank?.subject) return end(asWritten(subject.text));
      const form = formOf(frame.blank, option);
      if (form === 'as-is') return end(asWritten(option));
      const kind = form === 'agree' ? 'samræmi' : 'þolfall';
      const verb = kind === 'þolfall' ? parts[i - 1]?.replace(/[.,?!]+$/, '') : undefined;
      return end(
        tokens(option).map((w) => {
          const done = inflectWord(w, form, subject, lookups, paradigms, chosen);
          if (!done.lemma) return done;
          return { ...done, why: { kind, from: w, to: done.word, ...(verb ? { verb } : {}) } };
        })
      );
    }
    const role = roles.get(core);
    if (!role) return out.push({ word: tok });
    const word =
      role === 'sögn' ? VERA[subject.number] : PRONOUNS[role][subject.number][subject.gender];
    const why =
      role === 'sögn'
        ? { kind: 'sögn', from: core, to: word }
        : { kind: 'fornafn', case: role, from: core.toLocaleLowerCase('is'), to: word };
    end([{ word: capitalised(core, word), why }]);
  });
  return out;
}

/** The sentence a frame makes, as a string: `buildWords` joined. */
export function buildSentence(frame, subject, option, lookups, paradigms, chosen = {}) {
  return buildWords(frame, subject, option, lookups, paradigms, chosen)
    .map((w) => w.word)
    .join(' ');
}

/**
 * Every sentence a card's builder can make, for a person to read through: per level, per
 * subject, per frame, one entry per word in the blank. A sentence BÍN cannot complete carries
 * `problem` instead.
 */
export function allSentences(category, lookups, paradigms) {
  const out = [];
  for (const builder of category.builder ?? []) {
    let subjects;
    try {
      subjects = subjectsOf(builder, lookups, paradigms);
    } catch (err) {
      out.push({ level: builder.level, problem: `subject: ${err.message}` });
      continue;
    }
    for (const subject of subjects) {
      for (const frame of builder.frames.filter((f) => fits(f, subject))) {
        const options = frame.blank && !frame.blank.subject ? frame.blank.options : [null];
        for (const option of options) {
          const entry = { level: builder.level, subject: subject.text, frame: frame.frame, option };
          try {
            out.push({
              ...entry,
              sentence: buildSentence(frame, subject, option, lookups, paradigms, builder.lemmas),
            });
          } catch (err) {
            out.push({ ...entry, problem: err.message });
          }
        }
      }
    }
  }
  return out;
}

/**
 * A built sentence as its words, each marked `changed` when it differs from the card as printed
 * (`Það er sætt.` → `Hann er sætur.` marks `Hann` and `sætur`), so the page can show a student
 * what the grammar did. A word the card writes with a slash (`Hún/Hann`, `há/hár`) is a choice
 * the student made, not a change, and is never marked. A changed word keeps its reason, and an
 * inflected one its BÍN word and alternatives; an unchanged word keeps neither.
 */
export function markChanges(written, built) {
  const before = written.split(' ');
  const words = typeof built === 'string' ? built.split(' ').map((word) => ({ word })) : built;
  const comparable = before.length === words.length;
  const bare = (w) => w.replace(/[.,?!]+$/, '').toLocaleLowerCase('is');
  return words.map(({ word, why, lemma, choices }, i) => {
    const changed = comparable && !before[i].includes('/') && bare(before[i]) !== bare(word);
    return changed && why
      ? { word, changed, why, ...(lemma ? { lemma, choices } : {}) }
      : { word, changed };
  });
}

/**
 * A word's BÍN table for "Allar myndir orðsins": a noun's four cases in each number, without the
 * article; an adjective's four cases in each gender, singular, strong positive. Each cell lists
 * every form BÍN gives.
 */
export function wordTable(paradigm) {
  const cell = (tag) => formsOf(paradigm, [tag]).join(' / ');
  if (paradigm.ofl === 'no') {
    return {
      ord: paradigm.ord,
      columns: ['eintala', 'fleirtala'],
      rows: CASES.map((c) => ({ case: c, forms: [cell(`${c}ET`), cell(`${c}FT`)] })),
    };
  }
  return {
    ord: paradigm.ord,
    columns: ['karlkyn', 'kvenkyn', 'hvorugkyn'],
    rows: CASES.map((c) => ({ case: c, forms: GENDERS.map((g) => cell(`FSB-${g}-${c}ET`)) })),
  };
}

/**
 * Everything the student page shows for one category: per level, who or what the sentence can be
 * about, and every frame with every sentence already built. Throws on the first sentence BÍN
 * cannot complete, so a gap breaks the build instead of reaching a student.
 */
export function pageData(category, lookups, paradigms) {
  return (category.builder ?? []).map((builder) => {
    const subjects = subjectsOf(builder, lookups, paradigms);
    const frames = builder.frames.map((frame) => {
      const options = frame.blank && !frame.blank.subject ? frame.blank.options : null;
      // A subject the frame does not fit gets no sentences; the page does not offer the frame.
      const sentences = subjects.map((subject) =>
        fits(frame, subject)
          ? (options ?? [null]).map((option) => {
              const built = buildWords(frame, subject, option, lookups, paradigms, builder.lemmas);
              const fill = frame.blank?.subject ? subject.text : option;
              return markChanges(
                fill === null ? frame.frame : frame.frame.replace('___', fill),
                built
              );
            })
          : []
      );
      return {
        frame: frame.frame,
        question: frame.blank?.words ?? null,
        options,
        sentences,
        ...(frame.except ? { except: frame.except } : {}),
      };
    });
    // "Allar myndir orðsins": the table of every word a sentence on this page inflects.
    const guids = new Set(
      frames.flatMap((f) => f.sentences.flat(2).flatMap((w) => (w.lemma ? [w.lemma] : [])))
    );
    const tables = Object.fromEntries(
      [...guids].sort().map((g) => [g, wordTable(table(g, paradigms))])
    );
    return {
      level: builder.level,
      confirmed: builder.confirmed,
      subjectQuestion: builder.subject.kind === 'words' ? builder.subject.words : null,
      subjects: subjects.map(({ text, gender, number, person }) => ({
        text,
        gender,
        number,
        person: person ?? false,
      })),
      frames,
      tables,
    };
  });
}
