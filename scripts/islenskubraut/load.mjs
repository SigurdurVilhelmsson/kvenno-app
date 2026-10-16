import { readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { parse } from 'yaml';

import { findInvisible, isFlattened } from './text.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
export const CONTENT_DIR = resolve(ROOT, 'content/islenskubraut');
export const LEVELS = ['A1', 'A2', 'B1'];

/**
 * The four "Notagildi og samhengi" questions, which print as coloured boxes below a card's
 * main questions, and their colours. A question opts in with `context: <kind>` in the YAML;
 * until Oct 2026 both renderers decided it from the question's emoji, each from its own list.
 * Each colour carries white text and its own tinted answers at 4.5:1 or better (WCAG AA).
 */
export const CONTEXT_COLORS = {
  hvar: '#B91C1C',
  hvenaer: '#107837',
  hver: '#C2410C',
  notagildi: '#1D4ED8',
};

/** Category order as the SPA presents it. Not alphabetical — this is the taught order. */
export const CATEGORY_ORDER = [
  'dyr',
  'matur',
  'farartaeki',
  'manneskja',
  'stadir',
  'klaednadur',
  'skolinn',
];

function assert(condition, message) {
  if (!condition) throw new Error(`islenskubraut content: ${message}`);
}

function checkString(value, where) {
  assert(typeof value === 'string' && value.length > 0, `${where} must be a non-empty string`);
  const invisible = findInvisible(value);
  assert(invisible.length === 0, `${where} contains ${invisible.join(', ')} — "${value}"`);
  assert(!isFlattened(value), `${where} looks ASCII-flattened — "${value}"`);
}

/** Parse and validate one category file into the Category shape. */
export function loadCategory(id, contentDir = CONTENT_DIR) {
  const doc = parse(readFileSync(resolve(contentDir, `${id}.yaml`), 'utf8'));
  assert(doc.id === id, `${id}.yaml declares id "${doc.id}"`);
  for (const field of ['name', 'description', 'color', 'icon'])
    checkString(doc[field], `${id}.${field}`);
  // A new category is a draft until a teacher has read it: the home page leaves it out.
  assert(
    doc.draft === undefined || typeof doc.draft === 'boolean',
    `${id}.draft must be true or false`
  );

  const subCategories = (doc.subCategories ?? []).map((s) => {
    checkString(s.name, `${id}.${s.id}.name`);
    assert(Array.isArray(s.options) && s.options.length > 0, `${id}.${s.id}.options is empty`);
    s.options.forEach((o, i) => checkString(o, `${id}.${s.id}.options[${i}]`));
    return { name: s.name, options: s.options };
  });

  const sentenceFrames = (doc.sentenceFrames ?? []).map((f) => {
    assert(LEVELS.includes(f.level), `${id}.${f.id} has level "${f.level}"`);
    assert(Array.isArray(f.frames) && f.frames.length > 0, `${id}.${f.id}.frames is empty`);
    f.frames.forEach((x, i) => checkString(x, `${id}.${f.id}.frames[${i}]`));
    return { level: f.level, frames: f.frames };
  });

  const guidingQuestions = (doc.guidingQuestions ?? []).map((q) => {
    checkString(q.question, `${id}.${q.id}.question`);
    checkString(q.icon, `${id}.${q.id}.icon`);
    // A main question carries a label printed under it ("Útlit"); a context question carries
    // its kind instead, and has no label because its box shows only the question.
    assert(
      (q.label === undefined) !== (q.context === undefined),
      `${id}.${q.id} needs exactly one of label (a main question) or context (a coloured box)`
    );
    if (q.context !== undefined) {
      assert(
        Object.hasOwn(CONTEXT_COLORS, q.context),
        `${id}.${q.id}.context is "${q.context}", not one of ${Object.keys(CONTEXT_COLORS).join(', ')}`
      );
    } else {
      checkString(q.label, `${id}.${q.id}.label`);
    }
    const answers = LEVELS.filter((l) => q.answers?.[l]).map((level) => {
      const options = q.answers[level];
      assert(Array.isArray(options) && options.length > 0, `${id}.${q.id}.${level} is empty`);
      options.forEach((o, i) => checkString(o, `${id}.${q.id}.${level}[${i}]`));
      return { level, options };
    });
    assert(answers.length > 0, `${id}.${q.id} has no answers at any level`);
    const kind =
      q.context === undefined
        ? { label: q.label }
        : { context: { kind: q.context, color: CONTEXT_COLORS[q.context] } };
    return { question: q.question, icon: q.icon, ...kind, answers };
  });

  // One worked example and one teacher note per level, printed with the sentence frames.
  // Until Oct 2026 both were hard-coded twice, in the SPA and in the PDF renderer, where
  // neither the spreadsheet review nor the BÍN check could see them.
  const perLevel = (field) =>
    LEVELS.map((level) => {
      const text = doc[field]?.[level];
      checkString(text, `${id}.${field}.${level}`);
      return { level, text };
    });
  const examples = perLevel('examples');
  const teacherNotes = perLevel('teacherNotes');

  const builder = loadBuilder(id, doc.builder, { subCategories, sentenceFrames, guidingQuestions });

  return {
    id: doc.id,
    name: doc.name,
    icon: doc.icon,
    description: doc.description,
    color: doc.color,
    ...(doc.draft ? { draft: true } : {}),
    subCategories,
    sentenceFrames,
    examples,
    teacherNotes,
    guidingQuestions,
    ...(builder.length > 0 ? { builder } : {}),
  };
}

/**
 * How a word in a builder frame follows the sentence's subject: a pronoun in the nominative
 * (`Það er` → `Hann er`) or the accusative (`notar það` → `notar hann`), or the verb `vera`
 * (`er` → `eru` for a plural subject).
 */
export const AGREE_ROLES = ['NF', 'ÞF', 'sögn'];

/**
 * How a blank's word is put into the sentence: as written, made to agree with the subject (an
 * adjective: `sætt` → `sætur` for a masculine subject), or put in the accusative (a noun after
 * `hefur`: `feldur` → `feld`).
 */
export const BLANK_FORMS = ['as-is', 'agree', 'ÞF'];

/**
 * The sentence builder's tags (REVIEW-QUEUE D3, C9): for each card frame a student can build,
 * which list of words fills its blank and in what form, and which words in the frame follow the
 * subject. Drafted by Claude in Oct 2026 for a teacher to confirm; a teaching call, per frame.
 *
 * A word list is named by a question on the card (its answers at the same level) or by a
 * vocabulary group. Every frame must be one of the card's frames at that level, so editing a
 * frame or a question's wording breaks the build here, loudly, rather than the builder quietly.
 */
function loadBuilder(id, raw, { subCategories, sentenceFrames, guidingQuestions }) {
  if (raw === undefined) return [];
  assert(raw && typeof raw === 'object' && !Array.isArray(raw), `${id}.builder must be a map`);
  return Object.entries(raw).map(([level, spec]) => {
    const where = `${id}.builder.${level}`;
    assert(LEVELS.includes(level), `${where}: "${level}" is not a level`);
    const cardFrames = sentenceFrames.filter((f) => f.level === level).flatMap((f) => f.frames);

    const wordList = (name, at) => {
      checkString(name, at);
      const question = guidingQuestions.find((q) => q.question === name);
      const options =
        question?.answers.find((a) => a.level === level)?.options ??
        subCategories.find((sc) => sc.name === name)?.options;
      assert(
        options,
        `${at}: "${name}" is neither a question with ${level} answers nor a vocabulary group`
      );
      return options;
    };

    const subjectRaw = spec?.subject;
    assert(subjectRaw && typeof subjectRaw === 'object', `${where}.subject is missing`);
    let subject;
    if (subjectRaw.person === true) {
      subject = { kind: 'person' };
    } else if (subjectRaw.word !== undefined) {
      checkString(subjectRaw.word, `${where}.subject.word`);
      subject = { kind: 'word', word: subjectRaw.word };
    } else {
      const options = wordList(subjectRaw.words, `${where}.subject.words`);
      // A noun whose singular and plural look the same (`skór`) is read as singular unless
      // listed here.
      const plural = subjectRaw.plural ?? [];
      assert(Array.isArray(plural), `${where}.subject.plural must be a list`);
      for (const p of plural) {
        assert(options.includes(p), `${where}.subject.plural: "${p}" is not in its word list`);
      }
      subject = {
        kind: 'words',
        words: subjectRaw.words,
        options,
        ...(plural.length > 0 ? { plural } : {}),
      };
    }

    assert(Array.isArray(spec.frames) && spec.frames.length > 0, `${where}.frames is empty`);
    const frames = spec.frames.map((f, i) => {
      const at = `${where}.frames[${i}]`;
      checkString(f.frame, `${at}.frame`);
      assert(
        cardFrames.includes(f.frame),
        `${at}: "${f.frame}" is not one of the card's ${level} frames`
      );
      const blanks = f.frame.split('___').length - 1;
      assert(blanks <= 1, `${at}: a builder frame has at most one blank`);

      const agree = Object.entries(f.agree ?? {}).map(([word, role]) => {
        assert(
          AGREE_ROLES.includes(role),
          `${at}.agree.${word}: "${role}" is not one of ${AGREE_ROLES.join(', ')}`
        );
        const tokens = f.frame.split(/[\s.,?!]+/);
        assert(tokens.includes(word), `${at}.agree: "${word}" is not a word in "${f.frame}"`);
        return { word, role };
      });

      if (blanks === 0) {
        assert(
          f.blank === undefined && f.words === undefined,
          `${at}: "${f.frame}" has no blank to fill`
        );
        return { frame: f.frame, agree, blank: null };
      }
      if (f.blank === 'subject') {
        assert(subject.kind === 'words', `${at}: blank: subject needs a subject word list`);
        assert(
          f.words === undefined && f.form === undefined,
          `${at}: the subject blank takes no words or form`
        );
        return { frame: f.frame, agree, blank: { subject: true } };
      }
      assert(f.blank === undefined, `${at}.blank: only "subject" is allowed`);
      const form = f.form ?? 'as-is';
      assert(
        BLANK_FORMS.includes(form),
        `${at}.form: "${form}" is not one of ${BLANK_FORMS.join(', ')}`
      );
      return {
        frame: f.frame,
        agree,
        blank: { words: f.words, options: wordList(f.words, `${at}.words`), form },
      };
    });

    // A word BÍN reads as two words of the class the builder needs (`sætt`: `sær` or `sætur`)
    // names the one meant, by its BÍN headword. The builder never picks one itself.
    const lemmas = spec.lemmas ?? {};
    assert(
      lemmas && typeof lemmas === 'object' && !Array.isArray(lemmas),
      `${where}.lemmas must be a map`
    );
    for (const [form, headword] of Object.entries(lemmas)) {
      checkString(headword, `${where}.lemmas.${form}`);
    }

    // A teacher's confirmation that the level's tags and sentences are right (REVIEW-QUEUE C9).
    // Until it is set, the card page does not link to the builder.
    const confirmed = spec.confirmed ?? false;
    assert(typeof confirmed === 'boolean', `${where}.confirmed must be true or false`);

    if (subject.kind === 'word') {
      assert(
        frames.some((f) => f.frame.split(/[\s.,?!]+/).includes(subject.word)),
        `${where}.subject.word: "${subject.word}" appears in none of its frames`
      );
    }
    return {
      level,
      confirmed,
      subject,
      frames,
      ...(Object.keys(lemmas).length > 0 ? { lemmas } : {}),
    };
  });
}

/** All categories, in taught order. Throws if a file on disk is not in CATEGORY_ORDER. */
export function loadCategories(contentDir = CONTENT_DIR) {
  const onDisk = readdirSync(contentDir)
    .filter((f) => f.endsWith('.yaml'))
    .map((f) => f.replace(/\.yaml$/, ''));
  const unknown = onDisk.filter((id) => !CATEGORY_ORDER.includes(id));
  assert(unknown.length === 0, `${unknown.join(', ')} not listed in CATEGORY_ORDER`);
  return CATEGORY_ORDER.map((id) => loadCategory(id, contentDir));
}
