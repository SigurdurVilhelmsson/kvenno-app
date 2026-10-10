/**
 * PDF generation for Islenskubraut teaching cards.
 * The only copy: the SPA has no PDF code of its own and calls this route.
 */

import { fileURLToPath } from 'node:url';
import ReactPDF, { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import type { ReactElement } from 'react';
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

/**
 * Generate a PDF buffer for a teaching card.
 * @param category - The category data
 * @param level - The CEFR level (A1, A2, B1)
 * @returns A Buffer containing the PDF bytes
 */
export async function generatePdf(category: Category, level: string): Promise<Buffer> {
  const doc = createSpjaldDocument(category, level as Level);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfStream = await ReactPDF.renderToStream(doc as any);
  const chunks: Buffer[] = [];
  for await (const chunk of pdfStream) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : (chunk as Buffer));
  }
  return Buffer.concat(chunks);
}
