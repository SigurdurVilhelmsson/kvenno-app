/**
 * PDF generation for Islenskubraut teaching cards.
 * The only copy: the SPA has no PDF code of its own and calls this route.
 */

import { fileURLToPath } from 'node:url';
import ReactPDF, { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import React from 'react';
import type { Category, CEFRLevel, GuidingQuestion } from '../types/index.js';

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

Font.register({
  family: 'NotoSans',
  fonts: [
    { src: fontPath('noto-sans-latin-400-normal.woff'), fontWeight: 'normal' },
    { src: fontPath('noto-sans-latin-700-normal.woff'), fontWeight: 'bold' },
  ],
});

const CONTEXT_COLORS: Record<string, string> = {
  '\u{1F4CD}': '#DC2626',
  '\u{1F550}': '#16A34A',
  '\u{1F464}': '#EA580C',
  '\u{1F3AF}': '#2563EB',
};

const CONTEXT_ICONS = new Set(['\u{1F4CD}', '\u{1F550}', '\u{1F464}', '\u{1F3AF}']);

const QUESTION_LABELS: Record<string, string> = {
  '\u{1F4DA}': 'Flokkar',
  '\u{1F441}\u{FE0F}': '\u00datlit',
  '\u270B': '\u00c1fer\u00f0',
  '\u{1F50A}': 'Hlj\u00f3\u00f0',
  '\u{1F443}': 'Lykt',
  '\u{1F445}': 'Brag\u00f0',
  '\u{1F9F1}': 'Efnivi\u00f0ur',
  '\u{1F537}': 'L\u00f6gun',
  '\u{1F3AF}': 'Notagildi',
  '\u{1F464}': 'Hver?',
  '\u{1F4CD}': 'Hvar?',
  '\u{1F550}': 'Hven\u00e6r?',
};

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
  levelBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelBadgeText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
  subCategoryBox: {
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
    overflow: 'hidden',
  },
  subCategoryHeader: { paddingHorizontal: 10, paddingVertical: 5 },
  subCategoryHeaderText: {
    fontSize: 10,
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
    color: '#9CA3AF',
  },
  questionBox: {
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
    overflow: 'hidden',
  },
  questionHeader: { paddingHorizontal: 8, paddingVertical: 4, backgroundColor: '#F9FAFB' },
  questionText: { fontSize: 10, fontWeight: 'bold', color: '#1F2937' },
  questionLabel: { fontSize: 8, color: '#6B7280' },
  questionBody: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
  },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  dividerLine: { flex: 1, borderBottomWidth: 1, borderBottomColor: '#D1D5DB' },
  dividerText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    paddingHorizontal: 8,
  },
  contextGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  contextCard: { width: '48%', borderRadius: 6, overflow: 'hidden', marginBottom: 4 },
  contextCardHeader: { paddingHorizontal: 8, paddingVertical: 4 },
  contextCardHeaderText: { fontSize: 9, fontWeight: 'bold', color: '#FFFFFF' },
  contextCardBody: { paddingHorizontal: 8, paddingVertical: 4 },
  contextCardOption: { fontSize: 9, fontWeight: 'bold', marginBottom: 2 },
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

function createQuestionBlock(
  question: GuidingQuestion,
  level: CEFRLevel,
  categoryColor: string,
  index: number
): React.ReactElement | null {
  const answers = question.answers.find((a) => a.level === level);
  if (!answers || answers.options.length === 0) return null;
  const rgb = hexToRgb(categoryColor);
  const lightBg = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.05)`;
  const borderColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25)`;

  return React.createElement(
    View,
    { key: `q-${index}`, style: styles.questionBox },
    React.createElement(
      View,
      { style: styles.questionHeader },
      React.createElement(Text, { style: styles.questionText }, question.question),
      React.createElement(
        Text,
        { style: styles.questionLabel },
        QUESTION_LABELS[question.icon] || ''
      )
    ),
    React.createElement(
      View,
      { style: styles.questionBody },
      ...answers.options.map((option, i) =>
        React.createElement(
          View,
          { key: i, style: { ...styles.optionTag, borderColor, backgroundColor: lightBg } },
          React.createElement(
            Text,
            { style: { ...styles.optionText, color: categoryColor } },
            option
          )
        )
      )
    )
  );
}

function createContextCard(
  question: GuidingQuestion,
  level: CEFRLevel,
  index: number
): React.ReactElement | null {
  const answers = question.answers.find((a) => a.level === level);
  if (!answers || answers.options.length === 0) return null;
  const color = CONTEXT_COLORS[question.icon] || '#6B7280';
  const rgb = hexToRgb(color);
  const lightBg = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.08)`;

  return React.createElement(
    View,
    { key: `ctx-${index}`, style: { ...styles.contextCard, backgroundColor: lightBg } },
    React.createElement(
      View,
      { style: { ...styles.contextCardHeader, backgroundColor: color } },
      React.createElement(Text, { style: styles.contextCardHeaderText }, question.question)
    ),
    React.createElement(
      View,
      { style: styles.contextCardBody },
      ...answers.options.map((option, i) =>
        React.createElement(Text, { key: i, style: { ...styles.contextCardOption, color } }, option)
      )
    )
  );
}

export function createSpjaldDocument(category: Category, level: CEFRLevel): React.ReactElement {
  const sentenceFrame = category.sentenceFrames.find((sf) => sf.level === level);
  const example = category.examples.find((e) => e.level === level)?.text ?? '';
  const rgb = hexToRgb(category.color);
  const lightBg = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.05)`;
  const borderColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25)`;
  const headerBgFaded = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8)`;
  const mainQuestions = category.guidingQuestions.filter((q) => !CONTEXT_ICONS.has(q.icon));
  const contextQuestions = category.guidingQuestions.filter((q) => CONTEXT_ICONS.has(q.icon));
  const footerText = `\u00cdslenskubraut \u2014 Kvennask\u00f3linn \u00ed Reykjav\u00edk \u2014 ${category.name} ${level}`;

  return React.createElement(
    Document,
    null,
    // Page 1: Vocabulary
    React.createElement(
      Page,
      { size: 'A4', style: styles.page },
      React.createElement(
        View,
        { style: { ...styles.frontHeader, backgroundColor: category.color } },
        React.createElement(Text, { style: styles.frontHeaderText }, category.name.toUpperCase()),
        React.createElement(
          View,
          { style: styles.levelBadge },
          React.createElement(Text, { style: styles.levelBadgeText }, level)
        )
      ),
      ...category.subCategories.map((sub, index) =>
        React.createElement(
          View,
          { key: index, style: styles.subCategoryBox },
          React.createElement(
            View,
            { style: { ...styles.subCategoryHeader, backgroundColor: headerBgFaded } },
            React.createElement(Text, { style: styles.subCategoryHeaderText }, sub.name)
          ),
          React.createElement(
            View,
            { style: styles.subCategoryBody },
            ...sub.options.map((option, i) =>
              React.createElement(
                View,
                { key: i, style: { ...styles.optionTag, borderColor, backgroundColor: lightBg } },
                React.createElement(
                  Text,
                  { style: { ...styles.optionText, color: category.color } },
                  option
                )
              )
            )
          )
        )
      ),
      React.createElement(Text, { style: styles.footer }, footerText)
    ),
    // Page 2: Sentence frames
    React.createElement(
      Page,
      { size: 'A4', style: styles.page },
      React.createElement(
        View,
        { style: { ...styles.backHeader, backgroundColor: category.color } },
        React.createElement(Text, { style: styles.frontHeaderText }, category.name.toUpperCase()),
        React.createElement(
          View,
          { style: styles.levelBadge },
          React.createElement(Text, { style: styles.levelBadgeText }, level)
        )
      ),
      React.createElement(Text, { style: styles.sentenceTitle }, 'Setningarammar'),
      ...(sentenceFrame
        ? sentenceFrame.frames.map((frame, index) =>
            React.createElement(
              View,
              { key: index, style: { ...styles.frameBox, borderColor } },
              React.createElement(
                Text,
                { style: { ...styles.frameText, color: category.color } },
                frame
              )
            )
          )
        : []),
      React.createElement(
        View,
        { style: styles.exampleBox },
        React.createElement(Text, { style: styles.exampleLabel }, 'D\u00e6mi'),
        React.createElement(Text, { style: styles.exampleText }, example)
      ),
      // No teacher note: students handle the printed card. The note is on the web page.

      React.createElement(Text, { style: styles.footer }, footerText)
    ),
    // Page 3: Question card
    React.createElement(
      Page,
      { size: 'A4', style: styles.page },
      React.createElement(
        View,
        { style: { ...styles.frontHeader, backgroundColor: category.color, marginBottom: 12 } },
        React.createElement(Text, { style: styles.frontHeaderText }, category.name.toUpperCase()),
        React.createElement(
          View,
          { style: styles.levelBadge },
          React.createElement(Text, { style: styles.levelBadgeText }, level)
        )
      ),
      React.createElement(
        Text,
        { style: { ...styles.sentenceTitle, marginBottom: 10 } },
        'Spurningaspjald'
      ),
      ...mainQuestions
        .map((q, i) => createQuestionBlock(q, level, category.color, i))
        .filter(Boolean),
      ...(contextQuestions.length > 0
        ? [
            React.createElement(
              View,
              { key: 'divider', style: styles.dividerContainer },
              React.createElement(View, { style: styles.dividerLine }),
              React.createElement(Text, { style: styles.dividerText }, 'Notagildi og samhengi'),
              React.createElement(View, { style: styles.dividerLine })
            ),
          ]
        : []),
      ...(contextQuestions.length > 0
        ? [
            React.createElement(
              View,
              { key: 'context-grid', style: styles.contextGrid },
              ...contextQuestions.map((q, i) => createContextCard(q, level, i)).filter(Boolean)
            ),
          ]
        : []),
      React.createElement(Text, { style: styles.footer }, footerText)
    )
  );
}

/**
 * Generate a PDF buffer for a teaching card.
 * @param category - The category data
 * @param level - The CEFR level (A1, A2, B1)
 * @returns A Buffer containing the PDF bytes
 */
export async function generatePdf(category: Category, level: string): Promise<Buffer> {
  const doc = createSpjaldDocument(category, level as CEFRLevel);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfStream = await ReactPDF.renderToStream(doc as any);
  const chunks: Buffer[] = [];
  for await (const chunk of pdfStream) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : (chunk as Buffer));
  }
  return Buffer.concat(chunks);
}
