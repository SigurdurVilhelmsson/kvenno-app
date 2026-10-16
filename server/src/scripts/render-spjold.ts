/**
 * Render every Íslenskubraut teaching card to a static PDF.
 *
 *   pnpm --filter kvenno-server spjold [outDir]
 *
 * Each card depends only on its category and level, so all 18 are rendered once at build time
 * and served as files; the app links to them. Until Oct 2026 the backend rendered a card on
 * every download, and each backend failure was a download failure (PRs #87–#89).
 *
 * Writes to `apps/islenskubraut/public/spjold/` by default, which Vite serves in dev and copies
 * into `dist/islenskubraut/spjold/` on build. The folder is generated and gitignored.
 *
 * A card that does not print on exactly three pages fails the build: the printed card is
 * vocabulary, sentence frames and questions, one sheet each, and a fourth page splits a
 * question card from its answers.
 *
 * Beside each card goes its word list (`ordalisti-*.pdf`), the words new at that level with a
 * column for the student's own language and four review boxes. It must fit on one page.
 *
 * And, for each category with one, the guessing game (`giskaleikur-*.pdf`): the cards to cut out
 * and the questioner's sheet, one page each.
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { categories } from '../lib/islenskubraut-data.js';
import { giskaleikur } from '../lib/islenskubraut-giskaleikur.js';
import {
  LEVELS,
  generateGiskaleikurPdf,
  generateOrdalistiPdf,
  giskaleikurFileName,
  generatePdf,
  ordalistiFileName,
  pdfPageCount,
  spjaldFileName,
} from '../lib/islenskubraut-pdf.js';

const DEFAULT_OUT = fileURLToPath(
  new URL('../../../apps/islenskubraut/public/spjold', import.meta.url)
);
const outDir = resolve(process.argv[2] ?? DEFAULT_OUT);

// Cleared first, so a card whose category was removed or renamed does not linger.
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

const wrong: string[] = [];
for (const category of categories) {
  for (const level of LEVELS) {
    const file = spjaldFileName(category.id, level);
    const pdf = await generatePdf(category, level);
    const pages = pdfPageCount(pdf);
    if (pages !== 3) wrong.push(`${file}: ${pages} pages`);
    writeFileSync(resolve(outDir, file), pdf);

    const listFile = ordalistiFileName(category.id, level);
    const list = await generateOrdalistiPdf(category, level);
    const listPages = pdfPageCount(list);
    if (listPages !== 1) wrong.push(`${listFile}: ${listPages} pages, not 1`);
    writeFileSync(resolve(outDir, listFile), list);

    const game = giskaleikur[category.id];
    if (game) {
      const gameFile = giskaleikurFileName(category.id, level);
      const gamePdf = await generateGiskaleikurPdf(category, level, game.levels[level]);
      const gamePages = pdfPageCount(gamePdf);
      if (gamePages !== 2) wrong.push(`${gameFile}: ${gamePages} pages, not 2`);
      writeFileSync(resolve(outDir, gameFile), gamePdf);
    }
  }
}

if (wrong.length > 0) {
  console.error(
    `Íslenskubraut: every card must print on three pages, and every word list on one,\n  and every guessing game on two.\n  ${wrong.join('\n  ')}`
  );
  process.exit(1);
}
console.log(
  `Íslenskubraut: ${categories.length * LEVELS.length} cards, word lists and guessing games written to ${outDir}`
);
