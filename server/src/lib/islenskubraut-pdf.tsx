/**
 * PDF generation for Islenskubraut teaching cards.
 * The only copy: the SPA has no PDF code of its own and calls this route.
 */

import { fileURLToPath } from 'node:url';
import ReactPDF, { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import type { ReactElement, ReactNode } from 'react';
import type { Category, GuidingQuestion, Level } from '../types/index.js';

/**
 * Noto Sans, bundled in `server/fonts/` (@fontsource/noto-sans 5.3.0 — SIL Open Font
 * License, `fonts/OFL.txt`). Two things were wrong with the fonts this replaced:
 *
 * - They were URLs on cdn.jsdelivr.net, fetched when the first card was rendered. Any
 *   server that could not reach the CDN answered every download with a 500.
 * - They were the `latin-ext` subset, which starts at U+0100 and so holds neither
 *   A–Z nor a single Icelandic letter (á ð é í ó ú ý þ æ ö are all U+00C0–00FF).
 *   react-pdf silently fell back to Helvetica for every character, so even when the
 *   fetch worked the card was never set in Noto Sans. `latin` covers U+0000–00FF.
 *
 * The path is resolved from this module, and `../../fonts` is `server/fonts` from both
 * `src/lib/` (tsx, vitest) and `dist/lib/` (production), since tsc copies no assets.
 */
const fontPath = (file: string) => fileURLToPath(new URL(`../../fonts/${file}`, import.meta.url));

// react-pdf hyphenates long words at line ends by default, which split words a learner is
// trying to read (`sér-` / `fræðingar`). A word now moves to the next line whole.
Font.registerHyphenationCallback((word) => [word]);

Font.register({
  family: 'NotoSans',
  fonts: [
    { src: fontPath('noto-sans-latin-400-normal.woff'), fontWeight: 'normal' },
    { src: fontPath('noto-sans-latin-700-normal.woff'), fontWeight: 'bold' },
  ],
});

/**
 * Render a document to PDF bytes, every PDF in this file going through here.
 *
 * Each render gets freshly loaded fonts. react-pdf keeps one font object per registered file for
 * the life of the process, and once it has set one document, a later document in the same
 * process can lose a glyph: rendered after its card, a talk-to-write sheet printed `llin` for
 * `Ullin`, on the page and in the text layer, and the cards' `Efniviður` printed as `fniviður`
 * (REVIEW-QUEUE D3). Either document alone renders whole. `Font.reset()` cannot be used: it clears
 * the data but keeps the finished load, so the font never reloads. Clearing both is what works.
 *
 * Renders run one at a time, so a reload never lands in the middle of another document.
 */
let renderQueue: Promise<unknown> = Promise.resolve();

export function renderPdf(doc: ReactElement): Promise<Buffer> {
  const run = renderQueue.then(async () => {
    const family = Font.getRegisteredFonts().NotoSans as unknown as {
      sources: { data: unknown; loadResultPromise: unknown }[];
    };
    for (const source of family.sources) {
      source.data = null;
      source.loadResultPromise = null;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfStream = await ReactPDF.renderToStream(doc as any);
    const chunks: Buffer[] = [];
    for await (const chunk of pdfStream) {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : (chunk as Buffer));
    }
    return Buffer.concat(chunks);
  });
  renderQueue = run.catch(() => undefined);
  return run;
}

const styles = StyleSheet.create({
  page: { fontFamily: 'NotoSans', padding: 30, backgroundColor: '#FFFFFF' },
  frontHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  frontHeaderText: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF' },
  // White with the level in the category colour: white text on a white wash fell below 4.5:1.
  levelBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelBadgeText: { fontSize: 14, fontWeight: 'bold' },
  subCategoryBox: {
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
    overflow: 'hidden',
  },
  subCategoryHeader: { paddingHorizontal: 10, paddingVertical: 5 },
  subCategoryHeaderText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  subCategoryBody: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  optionTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    marginRight: 4,
    marginBottom: 4,
  },
  optionText: { fontSize: 10 },
  // The vocabulary page is read across a table once laminated, so its words are larger
  // than the question card's, which has to fit nine questions on one page.
  vocabTag: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 1,
    marginRight: 5,
    marginBottom: 5,
  },
  vocabText: { fontSize: 12 },
  backHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 30,
  },
  sentenceTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 24,
  },
  frameBox: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    alignItems: 'center',
  },
  frameText: { fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  exampleBox: { backgroundColor: '#F9FAFB', borderRadius: 8, padding: 14, marginTop: 24 },
  exampleLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#6B7280',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  exampleText: { fontSize: 12, color: '#374151' },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#6B7280',
  },
  questionBox: {
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
    overflow: 'hidden',
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#F9FAFB',
  },
  questionText: { fontSize: 10, fontWeight: 'bold', color: '#1F2937' },
  questionLabel: { fontSize: 8, color: '#6B7280' },
  questionBody: {
    paddingHorizontal: 8,
    paddingTop: 4,
    paddingBottom: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
  },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 6 },
  dividerLine: { flex: 1, borderBottomWidth: 1, borderBottomColor: '#D1D5DB' },
  dividerText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#6B7280',
    textTransform: 'uppercase',
    paddingHorizontal: 8,
  },
  contextGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  contextCard: { width: '48%', borderRadius: 6, overflow: 'hidden', marginBottom: 4 },
  contextCardHeader: { paddingHorizontal: 8, paddingVertical: 4 },
  contextCardHeaderText: { fontSize: 9, fontWeight: 'bold', color: '#FFFFFF' },
  contextCardBody: { paddingHorizontal: 8, paddingVertical: 4 },
  // One wrapping line rather than one answer per line: a column of thirteen time words
  // is what pushed the A2 and B1 question cards onto a fourth page.
  contextCardOptions: { flexDirection: 'row', flexWrap: 'wrap' },
  contextCardOption: { fontSize: 9, fontWeight: 'bold', marginRight: 4, lineHeight: 1.5 },
  questionPageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  questionPageHeaderText: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF' },
  questionPageTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
});

interface RGB {
  r: number;
  g: number;
  b: number;
}

function hexToRgb(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : { r: 0, g: 0, b: 0 };
}

/** The tinted background and border of an answer tag, from its text colour. */
function tint(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function LevelBadge({ level, color }: { level: Level; color: string }) {
  return (
    <View style={styles.levelBadge}>
      <Text style={{ ...styles.levelBadgeText, color }}>{level}</Text>
    </View>
  );
}

function QuestionBlock({
  question,
  level,
  categoryColor,
}: {
  question: GuidingQuestion;
  level: Level;
  categoryColor: string;
}) {
  const answers = question.answers.find((a) => a.level === level);
  if (!answers || answers.options.length === 0) return null;
  const tag = {
    ...styles.optionTag,
    borderColor: tint(categoryColor, 0.25),
    backgroundColor: tint(categoryColor, 0.05),
  };

  return (
    <View style={styles.questionBox} wrap={false}>
      <View style={styles.questionHeader}>
        <Text style={styles.questionText}>{question.question}</Text>
        <Text style={styles.questionLabel}>{question.label ?? ''}</Text>
      </View>
      <View style={styles.questionBody}>
        {answers.options.map((option, i) => (
          <View key={i} style={tag}>
            <Text style={{ ...styles.optionText, color: categoryColor }}>{option}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function ContextCard({
  question,
  level,
  color,
}: {
  question: GuidingQuestion;
  level: Level;
  color: string;
}) {
  const answers = question.answers.find((a) => a.level === level);
  if (!answers || answers.options.length === 0) return null;

  return (
    <View style={{ ...styles.contextCard, backgroundColor: tint(color, 0.08) }} wrap={false}>
      <View style={{ ...styles.contextCardHeader, backgroundColor: color }}>
        <Text style={styles.contextCardHeaderText}>{question.question}</Text>
      </View>
      <View style={styles.contextCardBody}>
        {/* Each answer is its own box, so a line breaks between answers, never inside one,
            and no separator is left dangling at a line's start or end. */}
        <View style={styles.contextCardOptions}>
          {answers.options.map((option, i) => (
            <Text key={i} style={{ ...styles.contextCardOption, color }}>
              {i < answers.options.length - 1 ? `${option} ·` : option}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}

export function createSpjaldDocument(category: Category, level: Level): ReactElement {
  const sentenceFrame = category.sentenceFrames.find((sf) => sf.level === level);
  const example = category.examples.find((e) => e.level === level)?.text ?? '';
  const vocabTag = {
    ...styles.vocabTag,
    borderColor: tint(category.color, 0.25),
    backgroundColor: tint(category.color, 0.05),
  };
  // Which questions are coloured context boxes is declared in the YAML (`context:`).
  const mainQuestions = category.guidingQuestions.filter((q) => !q.context);
  const contextQuestions = category.guidingQuestions.filter((q) => q.context);
  const footerText = `Íslenskubraut — Kvennaskólinn í Reykjavík — ${category.name} ${level}`;
  const footer = <Text style={styles.footer}>{footerText}</Text>;

  return (
    <Document>
      {/* Page 1: Vocabulary */}
      <Page size="A4" style={styles.page}>
        <View style={{ ...styles.frontHeader, backgroundColor: category.color }}>
          <Text style={styles.frontHeaderText}>{category.name.toUpperCase()}</Text>
          <LevelBadge level={level} color={category.color} />
        </View>
        {category.subCategories.map((sub, index) => (
          <View key={index} style={styles.subCategoryBox} wrap={false}>
            {/* The full colour, not a faded one: white text on 80 % fell below 4.5:1. */}
            <View style={{ ...styles.subCategoryHeader, backgroundColor: category.color }}>
              <Text style={styles.subCategoryHeaderText}>{sub.name}</Text>
            </View>
            <View style={styles.subCategoryBody}>
              {sub.options.map((option, i) => (
                <View key={i} style={vocabTag}>
                  <Text style={{ ...styles.vocabText, color: category.color }}>{option}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
        {footer}
      </Page>

      {/* Page 2: Sentence frames */}
      <Page size="A4" style={styles.page}>
        <View style={{ ...styles.backHeader, backgroundColor: category.color }}>
          <Text style={styles.frontHeaderText}>{category.name.toUpperCase()}</Text>
          <LevelBadge level={level} color={category.color} />
        </View>
        <Text style={styles.sentenceTitle}>Setningarammar</Text>
        {sentenceFrame?.frames.map((frame, index) => (
          <View
            key={index}
            style={{ ...styles.frameBox, borderColor: tint(category.color, 0.25) }}
            wrap={false}
          >
            <Text style={{ ...styles.frameText, color: category.color }}>{frame}</Text>
          </View>
        ))}
        <View style={styles.exampleBox}>
          <Text style={styles.exampleLabel}>Dæmi</Text>
          <Text style={styles.exampleText}>{example}</Text>
        </View>
        {/* No teacher note: students handle the printed card. The note is on the web page. */}
        {footer}
      </Page>

      {/* Page 3: Question card */}
      <Page size="A4" style={styles.page}>
        <View style={{ ...styles.questionPageHeader, backgroundColor: category.color }}>
          <Text style={styles.questionPageHeaderText}>{category.name.toUpperCase()}</Text>
          <LevelBadge level={level} color={category.color} />
        </View>
        <Text style={styles.questionPageTitle}>Spurningaspjald</Text>
        {mainQuestions.map((q, i) => (
          <QuestionBlock key={i} question={q} level={level} categoryColor={category.color} />
        ))}
        {contextQuestions.length > 0 && (
          <>
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Notagildi og samhengi</Text>
              <View style={styles.dividerLine} />
            </View>
            <View style={styles.contextGrid}>
              {contextQuestions.map(
                (q, i) =>
                  q.context && (
                    <ContextCard key={i} question={q} level={level} color={q.context.color} />
                  )
              )}
            </View>
          </>
        )}
        {footer}
      </Page>
    </Document>
  );
}

/** The three levels every category is printed at. */
export const LEVELS: readonly Level[] = ['A1', 'A2', 'B1'];

/** Every answer on the card at a level, as printed: the words a student meets there. */
function answersAt(category: Category, level: Level): string[] {
  return category.guidingQuestions.flatMap(
    (q) => q.answers.find((a) => a.level === level)?.options ?? []
  );
}

export interface WordGroup {
  question: string;
  words: string[];
}

/**
 * The words new on the card at a level: its answers that the level below does not print, each
 * once, under the first question that offers it. A2 and B1 repeat most of the level below, so a
 * sheet of every answer would grow to ninety rows by B1. A student keeps each level's sheet.
 */
export function newWordsAt(category: Category, level: Level): WordGroup[] {
  const below = LEVELS[LEVELS.indexOf(level) - 1];
  // `gamall/gömul` and `gömul/gamall` are one word written two ways on different questions.
  const key = (w: string) => w.split('/').sort().join('/');
  const seen = new Set((below ? answersAt(category, below) : []).map(key));
  return category.guidingQuestions
    .map((q) => {
      const words = (q.answers.find((a) => a.level === level)?.options ?? []).filter((w) => {
        if (seen.has(key(w))) return false;
        seen.add(key(w));
        return true;
      });
      return { question: q.question, words };
    })
    .filter((g) => g.words.length > 0);
}

/** The days a word is reviewed on: spaced, not massed (docs/research/islenskubraut-additions/). */
export const REVIEW_DAYS = [1, 3, 7, 14] as const;

const listStyles = StyleSheet.create({
  // The footer sits 20 pt from the bottom; the last row must stop above it.
  page: { paddingTop: 24, paddingBottom: 36 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 8,
  },
  headerText: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  title: { fontSize: 16, fontWeight: 'bold', color: '#1F2937', marginBottom: 3 },
  instructions: { fontSize: 9, color: '#374151', marginBottom: 8, lineHeight: 1.35 },
  headRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderBottomWidth: 1.5,
    paddingBottom: 3,
    marginBottom: 2,
  },
  headText: { fontSize: 8, fontWeight: 'bold', color: '#374151' },
  // Regular weight, as are the words: in bold, react-pdf writes `y` into the PDF's text layer
  // wrongly, and dropped the `s` of `syndir` from the page outright.
  group: { fontSize: 7.5, color: '#4B5563', marginTop: 2.5 },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    minHeight: 13.5,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E7EB',
  },
  word: { width: '32%', fontSize: 10.5, lineHeight: 1.2, paddingBottom: 1.5 },
  own: {
    width: '42%',
    marginRight: '4%',
    marginBottom: 2.5,
    borderBottomWidth: 0.75,
    borderBottomColor: '#9CA3AF',
    height: 10,
  },
  days: { width: '22%', flexDirection: 'row', justifyContent: 'space-between' },
  dayHead: { width: 14, fontSize: 8, fontWeight: 'bold', color: '#374151', textAlign: 'center' },
  box: { width: 10, height: 10, borderWidth: 0.75, borderColor: '#6B7280', margin: 2 },
});

/**
 * Orðalisti: one A4 page per category and level, for a student to keep. Each word new at the
 * level, a line to write it in their own language, and four boxes to tick when they review it.
 * The own-language column gives part of what first-language glosses give, with no translations
 * to source or check. No pictures yet: printing ARASAAC's waits on REVIEW-QUEUE C10.
 */
export function createOrdalistiDocument(category: Category, level: Level): ReactElement {
  const groups = newWordsAt(category, level);
  // A short list gets taller rows, so there is room to write; a long one still fits one page.
  const lines = groups.reduce((n, g) => n + g.words.length + 0.75, 0);
  const rowHeight = Math.min(24, Math.max(13.5, 600 / lines));
  const footer = (
    <Text style={styles.footer}>
      {`Íslenskubraut — Kvennaskólinn í Reykjavík — ${category.name} ${level} — orðalisti`}
    </Text>
  );
  return (
    <Document>
      <Page size="A4" style={{ ...styles.page, ...listStyles.page }}>
        <View style={{ ...listStyles.header, backgroundColor: category.color }}>
          <Text style={listStyles.headerText}>{category.name.toUpperCase()}</Text>
          <LevelBadge level={level} color={category.color} />
        </View>
        <Text style={listStyles.title}>Orðalisti</Text>
        <Text style={listStyles.instructions}>
          {level === 'A1' ? 'Orðin á spjaldinu.' : `Ný orð á spjaldinu á stigi ${level}.`} Skrifaðu
          hvert orð á þínu tungumáli. Rifjaðu orðin upp eftir 1, 3, 7 og 14 daga og merktu við í
          hvert sinn.
        </Text>
        <View style={{ ...listStyles.headRow, borderBottomColor: category.color }}>
          <Text style={{ ...listStyles.headText, width: '32%' }}>Orð</Text>
          <Text style={{ ...listStyles.headText, width: '46%' }}>Á mínu tungumáli</Text>
          <View style={listStyles.days}>
            {REVIEW_DAYS.map((d) => (
              <Text key={d} style={listStyles.dayHead}>
                {`${d}.`}
              </Text>
            ))}
          </View>
        </View>
        {groups.map((g) => (
          <View key={g.question}>
            <Text style={listStyles.group}>{g.question}</Text>
            {g.words.map((w) => (
              <View key={w} style={{ ...listStyles.row, minHeight: rowHeight }} wrap={false}>
                <Text style={{ ...listStyles.word, color: category.color }}>{w}</Text>
                <View style={listStyles.own} />
                <View style={listStyles.days}>
                  {REVIEW_DAYS.map((d) => (
                    <View key={d} style={listStyles.box} />
                  ))}
                </View>
              </View>
            ))}
          </View>
        ))}
        {footer}
      </Page>
    </Document>
  );
}

const gameStyles = StyleSheet.create({
  title: { fontSize: 16, color: '#1F2937', marginBottom: 3 },
  instructions: { fontSize: 9, color: '#374151', marginBottom: 8, lineHeight: 1.35 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: {
    width: '48.5%',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#9CA3AF',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginBottom: 6,
  },
  name: { fontSize: 14, lineHeight: 1.2, marginBottom: 2 },
  answer: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline' },
  question: { fontSize: 7, color: '#4B5563', lineHeight: 1.2 },
  chips: { fontSize: 8.5, lineHeight: 1.2 },
  heading: { fontSize: 10, color: '#1F2937', marginTop: 10, marginBottom: 4 },
  line: { fontSize: 10, color: '#374151', lineHeight: 1.5 },
  candidates: { flexDirection: 'row', flexWrap: 'wrap' },
  candidate: { width: '33%', flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  box: { width: 11, height: 11, borderWidth: 0.75, borderColor: '#6B7280', marginRight: 6 },
});

export interface GameAnswer {
  question: string;
  chips: string[];
}
export interface GameItem {
  name: string;
  answers: GameAnswer[];
}

/**
 * "Hvað er þetta?": the information-gap game for a card at a level (docs/research/
 * islenskubraut-additions/, item 3). First the cards to cut out, one per thing, each describing
 * it in the card's own words; partner A draws one. Last the sheet partner B keeps: the rules, the
 * questions to ask, the things to cross off, and the card's frames for answering in a sentence.
 * Every text is regular weight, as on the word lists (see `listStyles.group`).
 */
export function createGiskaleikurDocument(
  category: Category,
  level: Level,
  items: GameItem[]
): ReactElement {
  const header = (
    <View style={{ ...listStyles.header, backgroundColor: category.color }}>
      <Text style={listStyles.headerText}>{category.name.toUpperCase()}</Text>
      <LevelBadge level={level} color={category.color} />
    </View>
  );
  const footer = (
    <Text style={styles.footer}>
      {`Íslenskubraut — Kvennaskólinn í Reykjavík — ${category.name} ${level} — Hvað er þetta?`}
    </Text>
  );
  const asked = category.guidingQuestions
    .map((q) => q.question)
    .filter((q) => items.some((i) => i.answers.some((a) => a.question === q)));
  const frames = category.sentenceFrames.find((f) => f.level === level)?.frames ?? [];
  const page = { ...styles.page, ...listStyles.page };

  return (
    <Document>
      <Page size="A4" style={page}>
        {header}
        <Text style={gameStyles.title}>Hvað er þetta? Spjöld</Text>
        <Text style={gameStyles.instructions}>
          Klippið spjöldin út og leggið þau á hvolf. Nemandi A dregur eitt spjald og sýnir það
          engum. Hin blaðsíðan er fyrir nemanda B.
        </Text>
        <View style={gameStyles.grid}>
          {items.map((item) => (
            <View key={item.name} style={gameStyles.card} wrap={false}>
              <Text style={{ ...gameStyles.name, color: category.color }}>{item.name}</Text>
              {item.answers.map((a) => (
                <View key={a.question} style={gameStyles.answer}>
                  <Text style={gameStyles.question}>{`${a.question} `}</Text>
                  <Text style={{ ...gameStyles.chips, color: category.color }}>
                    {a.chips.join(', ')}
                  </Text>
                </View>
              ))}
            </View>
          ))}
        </View>
        {footer}
      </Page>

      <Page size="A4" style={page}>
        {header}
        <Text style={gameStyles.title}>Hvað er þetta? Spurningablað</Text>
        <Text style={gameStyles.instructions}>
          Leikurinn er fyrir tvo. Nemandi A dregur spjald og segir ekki hvað er á því. Nemandi B
          spyr spurninganna hér fyrir neðan, einnar í einu. A svarar í heilli setningu með orðunum á
          spjaldinu. B strikar yfir það sem getur ekki verið rétt. Þegar B veit svarið spyr B: „Er
          þetta …?“ Svo skiptið þið um hlutverk.
        </Text>
        <Text style={gameStyles.heading}>Spurningar</Text>
        {asked.map((q) => (
          <Text key={q} style={gameStyles.line}>
            {`• ${q}`}
          </Text>
        ))}
        <Text style={gameStyles.heading}>Hvað getur það verið?</Text>
        <View style={gameStyles.candidates}>
          {items.map((item) => (
            <View key={item.name} style={gameStyles.candidate}>
              <View style={gameStyles.box} />
              <Text style={gameStyles.line}>{item.name}</Text>
            </View>
          ))}
        </View>
        {frames.length > 0 && (
          <>
            <Text style={gameStyles.heading}>Svaraðu svona</Text>
            {frames.map((f) => (
              <Text key={f} style={gameStyles.line}>
                {f}
              </Text>
            ))}
          </>
        )}
        {footer}
      </Page>
    </Document>
  );
}

/** The file a guessing game is saved as, beside the cards in `spjold/`. */
export function giskaleikurFileName(categoryId: string, level: Level): string {
  return `giskaleikur-${categoryId}-${level}.pdf`;
}

/** A guessing game's PDF bytes. */
export async function generateGiskaleikurPdf(
  category: Category,
  level: Level,
  items: GameItem[]
): Promise<Buffer> {
  return renderPdf(createGiskaleikurDocument(category, level, items));
}

const textStyles = StyleSheet.create({
  title: { fontSize: 15, color: '#1F2937', marginBottom: 2 },
  step: { fontSize: 11, marginTop: 9, marginBottom: 2 },
  instructions: { fontSize: 8.5, color: '#4B5563', marginBottom: 4, lineHeight: 1.3 },
  frame: { fontSize: 9.5, color: '#374151', lineHeight: 1.4 },
  stage: { flexDirection: 'row', marginBottom: 3 },
  stageName: { width: '20%', fontSize: 8, lineHeight: 1.5, paddingRight: 6 },
  stageText: { width: '80%', fontSize: 10, color: '#1F2937', lineHeight: 1.5 },
  bank: {
    borderWidth: 0.75,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 5,
    fontSize: 9.5,
    lineHeight: 1.4,
  },
  writeLine: { borderBottomWidth: 0.5, borderBottomColor: '#9CA3AF', height: 20 },
});

/** One stage of a model text, run or gap: what `islenskubraut-texti.ts` stores. */
export type TextPart = { text: string } | { gap: string };
export interface TextSheet {
  genre: string;
  stages: { name: string; parts: TextPart[] }[];
  bank: string[];
}

/** How many lines a student gets for their own text in step 4. */
export const WRITE_LINES = 5;

/**
 * "Frá tali til texta": the talk-to-write sheet for a card at a level (docs/research/
 * islenskubraut-additions/, item 4), one A4 page in four steps. Say it with the card's frames;
 * read the model text, each stage named beside it; fill the same text with the card's words
 * taken out, from a box of them; write your own. Regular weight throughout, as on the word lists.
 */
export function createTextiDocument(
  category: Category,
  level: Level,
  sheet: TextSheet
): ReactElement {
  const frames = category.sentenceFrames.find((f) => f.level === level)?.frames ?? [];
  const color = { color: category.color };
  let gapNumber = 0;
  const stage = (name: string, body: ReactNode) => (
    <View key={name} style={textStyles.stage} wrap={false}>
      <Text style={{ ...textStyles.stageName, ...color }}>{name}</Text>
      <Text style={textStyles.stageText}>{body}</Text>
    </View>
  );

  return (
    <Document>
      <Page size="A4" style={{ ...styles.page, ...listStyles.page }}>
        <View style={{ ...listStyles.header, backgroundColor: category.color }}>
          <Text style={listStyles.headerText}>{category.name.toUpperCase()}</Text>
          <LevelBadge level={level} color={category.color} />
        </View>
        <Text style={textStyles.title}>{`Frá tali til texta: ${sheet.genre}`}</Text>

        <Text style={{ ...textStyles.step, ...color }}>1. Segðu frá</Text>
        <Text style={textStyles.instructions}>
          Veldu eitthvað á spjaldinu og segðu félaga þínum frá því. Notaðu rammana.
        </Text>
        {frames.map((f) => (
          <Text key={f} style={textStyles.frame}>
            {f}
          </Text>
        ))}

        <Text style={{ ...textStyles.step, ...color }}>2. Lestu</Text>
        <Text style={textStyles.instructions}>
          Lestu textann. Hver hluti hans segir eitthvað ákveðið og nafnið stendur við hann.
        </Text>
        {sheet.stages.map((s) =>
          stage(
            s.name,
            s.parts.map((p) => ('gap' in p ? p.gap : p.text))
          )
        )}

        <Text style={{ ...textStyles.step, ...color }}>3. Fylltu í</Text>
        <Text style={textStyles.instructions}>
          Brjóttu blaðið svo að textinn hér fyrir ofan sjáist ekki. Fylltu í eyðurnar með orðunum í
          rammanum.
        </Text>
        <Text style={{ ...textStyles.bank, borderColor: category.color }}>
          {/* A non-breaking space inside each entry, so `villt dýr` never splits across lines. */}
          {sheet.bank.map((w) => w.replace(/ /g, '\u00a0')).join('   ·   ')}
        </Text>
        {sheet.stages.map((s) =>
          stage(
            s.name,
            s.parts.map((p) => {
              if (!('gap' in p)) return p.text;
              gapNumber += 1;
              return `(${gapNumber}) ____________`;
            })
          )
        )}

        <Text style={{ ...textStyles.step, ...color }}>4. Skrifaðu</Text>
        <Text style={textStyles.instructions}>
          Skrifaðu tvær til fimm setningar um eitthvað annað á spjaldinu. Notaðu rammana í 1. hluta.
        </Text>
        {Array.from({ length: WRITE_LINES }, (_, i) => (
          <View key={i} style={textStyles.writeLine} />
        ))}

        <Text style={styles.footer}>
          {`Íslenskubraut — Kvennaskólinn í Reykjavík — ${category.name} ${level} — Frá tali til texta`}
        </Text>
      </Page>
    </Document>
  );
}

/** The file a talk-to-write sheet is saved as, beside the cards in `spjold/`. */
export function textiFileName(categoryId: string, level: Level): string {
  return `texti-${categoryId}-${level}.pdf`;
}

/** A talk-to-write sheet's PDF bytes. */
export async function generateTextiPdf(
  category: Category,
  level: Level,
  sheet: TextSheet
): Promise<Buffer> {
  return renderPdf(createTextiDocument(category, level, sheet));
}

const canStyles = StyleSheet.create({
  title: { fontSize: 15, color: '#1F2937', marginBottom: 2 },
  instructions: { fontSize: 8.5, color: '#4B5563', marginBottom: 6, lineHeight: 1.3 },
  strip: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#9CA3AF',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 8,
  },
  stripHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  stripTitle: { fontSize: 10 },
  name: { fontSize: 8, color: '#4B5563' },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 20 },
  statement: { flex: 1, fontSize: 9.5, color: '#1F2937', lineHeight: 1.3, paddingRight: 6 },
  rating: { width: 46, alignItems: 'center' },
  ratingHead: { width: 46, fontSize: 7, color: '#4B5563', textAlign: 'center' },
  box: { width: 11, height: 11, borderWidth: 0.75, borderColor: '#6B7280' },
  legend: { fontSize: 9, color: '#1F2937', lineHeight: 1.4 },
  table: { marginTop: 8, borderTopWidth: 0.75, borderLeftWidth: 0.75, borderColor: '#9CA3AF' },
  tr: { flexDirection: 'row' },
  td: {
    borderRightWidth: 0.75,
    borderBottomWidth: 0.75,
    borderColor: '#9CA3AF',
    height: 22,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  th: { fontSize: 8, color: '#374151' },
});

/** The three self-ratings on a student's strip, from not yet to on my own. */
export const RATINGS = ['ekki enn', 'með hjálp', 'sjálf/ur'] as const;
/** Rows on the class checklist, one per student. */
export const CHECKLIST_ROWS = 22;

/**
 * "Ég get…": the can-do statements for a card at a level (docs/research/islenskubraut-additions/,
 * item 6). Page 1 is four strips to cut apart, one per student, each statement with the three
 * self-ratings. Page 2 is the teacher's class checklist with the same statements, ticked while a
 * student talks about the card. Neither is a grade, and the checklist says so.
 */
export function createEggetDocument(
  category: Category,
  level: Level,
  statements: string[]
): ReactElement {
  const header = (
    <View style={{ ...listStyles.header, backgroundColor: category.color }}>
      <Text style={listStyles.headerText}>{category.name.toUpperCase()}</Text>
      <LevelBadge level={level} color={category.color} />
    </View>
  );
  const footer = (
    <Text style={styles.footer}>
      {`Íslenskubraut — Kvennaskólinn í Reykjavík — ${category.name} ${level} — Ég get…`}
    </Text>
  );
  const page = { ...styles.page, ...listStyles.page };
  const strip = (n: number) => (
    <View key={n} style={canStyles.strip} wrap={false}>
      <View style={canStyles.stripHead}>
        <Text style={{ ...canStyles.stripTitle, color: category.color }}>
          {`Ég get… · ${category.name} · ${level}`}
        </Text>
        <Text style={canStyles.name}>Nafn: ______________________</Text>
      </View>
      <View style={canStyles.row}>
        <Text style={canStyles.statement}> </Text>
        {RATINGS.map((r) => (
          <Text key={r} style={canStyles.ratingHead}>
            {r}
          </Text>
        ))}
      </View>
      {statements.map((st) => (
        <View key={st} style={canStyles.row}>
          <Text style={canStyles.statement}>{st}</Text>
          {RATINGS.map((r) => (
            <View key={r} style={canStyles.rating}>
              <View style={canStyles.box} />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
  const nameWidth = 130;
  const cellWidth = (535 - nameWidth) / statements.length;

  return (
    <Document>
      <Page size="A4" style={page}>
        {header}
        <Text style={canStyles.title}>Ég get…</Text>
        <Text style={canStyles.instructions}>
          Klippið blaðið í fjóra miða, einn fyrir hvern nemanda. Lestu hverja setningu og merktu við
          það sem passar núna. Þetta er ekki próf.
        </Text>
        {[1, 2, 3, 4].map(strip)}
        {footer}
      </Page>

      <Page size="A4" style={page}>
        {header}
        <Text style={canStyles.title}>Ég get… Gátlisti kennara</Text>
        <Text style={canStyles.instructions}>
          Hlustaðu á nemanda tala um spjaldið og skrifaðu H (með hjálp) eða S (sjálf/ur) í reitinn.
          Listinn er til að fylgjast með framförum, ekki til einkunnar.
        </Text>
        {statements.map((st, i) => (
          <Text key={st} style={canStyles.legend}>
            {`${i + 1}. ${st}`}
          </Text>
        ))}
        <View style={canStyles.table}>
          <View style={canStyles.tr} fixed>
            <View style={{ ...canStyles.td, width: nameWidth }}>
              <Text style={canStyles.th}>Nafn</Text>
            </View>
            {statements.map((st, i) => (
              <View key={st} style={{ ...canStyles.td, width: cellWidth, alignItems: 'center' }}>
                <Text style={canStyles.th}>{`${i + 1}.`}</Text>
              </View>
            ))}
          </View>
          {Array.from({ length: CHECKLIST_ROWS }, (_, r) => (
            <View key={r} style={canStyles.tr}>
              <View style={{ ...canStyles.td, width: nameWidth }} />
              {statements.map((st) => (
                <View key={st} style={{ ...canStyles.td, width: cellWidth }} />
              ))}
            </View>
          ))}
        </View>
        {footer}
      </Page>
    </Document>
  );
}

/** The file the can-do strips are saved as, beside the cards in `spjold/`. */
export function eggetFileName(categoryId: string, level: Level): string {
  return `egget-${categoryId}-${level}.pdf`;
}

/** The can-do strips' PDF bytes. */
export async function generateEggetPdf(
  category: Category,
  level: Level,
  statements: string[]
): Promise<Buffer> {
  return renderPdf(createEggetDocument(category, level, statements));
}

/** The file a word list is saved as, beside the cards in `spjold/`. */
export function ordalistiFileName(categoryId: string, level: Level): string {
  return `ordalisti-${categoryId}-${level}.pdf`;
}

/** A word list's PDF bytes. */
export async function generateOrdalistiPdf(category: Category, level: Level): Promise<Buffer> {
  return renderPdf(createOrdalistiDocument(category, level));
}

/**
 * The file a card is saved as. The build writes each card under this name and the app links
 * to it (`DownloadButton.tsx` builds the same name), so a download keeps it.
 */
export function spjaldFileName(categoryId: string, level: Level): string {
  return `spjald-${categoryId}-${level}.pdf`;
}

/** Pages in a rendered PDF: each page object, not the `/Pages` tree that holds them. */
export function pdfPageCount(pdf: Buffer): number {
  return pdf.toString('latin1').match(/\/Type\s*\/Page(?!s)/g)?.length ?? 0;
}

/**
 * Generate a PDF buffer for a teaching card.
 * @param category - The category data
 * @param level - The CEFR level (A1, A2, B1)
 * @returns A Buffer containing the PDF bytes
 */
export async function generatePdf(category: Category, level: string): Promise<Buffer> {
  return renderPdf(createSpjaldDocument(category, level as Level));
}
