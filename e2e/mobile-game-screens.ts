/**
 * Recorded navigation paths to every main screen of every game, replayed by
 * mobile-games.spec.ts at phone width. Keyed `<year>/<slug>`, matching
 * scripts/build-games.mjs.
 *
 * Each path starts from a freshly loaded game (empty localStorage) and uses
 * stable navigation labels, never the text of a shuffled question. When a
 * game's navigation changes, re-record its paths rather than deleting them.
 */

export type ScreenStep =
  | { click: string }
  | { clickRole: [Parameters<import('@playwright/test').Page['getByRole']>[0], string] }
  | { css: string }
  | { fill: [string, string] }
  | { press: string }
  | { wait: number };

export interface GameScreen {
  name: string;
  steps: ScreenStep[];
}

export const GAME_SCREENS: Record<string, GameScreen[]> = {
  '1-ar/dimensional-analysis': [
    {
      name: 'Valmynd',
      steps: [
        {
          wait: 200,
        },
      ],
    },
    {
      name: 'Stig 0 — reglurnar',
      steps: [
        {
          click: 'Markverðir stafir',
        },
      ],
    },
    {
      name: 'Stig 0 — talning, endurgjöf',
      steps: [
        {
          click: 'Markverðir stafir',
        },
        {
          click: 'Áfram í æfingu',
        },
        {
          css: 'button[aria-label="1"]',
        },
      ],
    },
    {
      name: 'Stig 1 — kynning',
      steps: [
        {
          click: 'Hugtök',
        },
      ],
    },
    {
      name: 'Stig 1 — vogin (jafngildi)',
      steps: [
        {
          click: 'Hugtök',
        },
        {
          click: 'Byrja!',
        },
        {
          css: 'button[aria-label="Draga frá 1 lítra"]',
        },
      ],
    },
    {
      name: 'Stig 1 — brotið (C2), villa',
      steps: [
        {
          click: 'Hugtök',
        },
        {
          click: 'Byrja!',
        },
        {
          css: 'button[aria-label="Bæta við 1 lítra"]',
        },
        {
          wait: 300,
        },
        {
          click: 'Næsta áskorun',
        },
        {
          clickRole: ['button', '1000 mL'],
        },
        {
          clickRole: ['button', '500 mL'],
        },
      ],
    },
    {
      name: 'Stig 2 — verkefni',
      steps: [
        {
          click: 'Beiting',
        },
        {
          click: 'Byrja æfingar',
        },
      ],
    },
    {
      name: 'Stig 2 — stuðull settur í keðju',
      steps: [
        {
          click: 'Beiting',
        },
        {
          click: 'Byrja æfingar',
        },
        {
          css: '.items-pool [data-item-id]',
        },
        {
          css: '[data-zone-id="conversion-chain"]',
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 2 — endurgjöf (smella-hamur)',
      steps: [
        {
          click: 'Beiting',
        },
        {
          click: 'Byrja æfingar',
        },
        {
          click: 'Skipta í smella-ham',
        },
        {
          css: 'button:has(div.text-blue-600)',
        },
        {
          fill: ['input[placeholder="Sláðu inn svar"]', '999'],
        },
        {
          click: 'Athuga svar',
        },
      ],
    },
    {
      name: 'Stig 3 — kynning',
      steps: [
        {
          click: 'Fullir útreikningar',
        },
      ],
    },
    {
      name: 'Stig 3 — áskorun',
      steps: [
        {
          click: 'Fullir útreikningar',
        },
        {
          click: 'Byrja áskoranir',
        },
      ],
    },
    {
      name: 'Stig 3 — endurgjöf',
      steps: [
        {
          click: 'Fullir útreikningar',
        },
        {
          click: 'Byrja áskoranir',
        },
        {
          css: 'main button.text-left, main label',
        },
        {
          fill: ['main input', '999'],
        },
        {
          fill: ['main textarea', 'Ég umbreytti einingunum með stuðli.'],
        },
        {
          click: 'Senda inn',
        },
      ],
    },
  ],
  '1-ar/lotukerfid': [
    {
      name: 'Valmynd',
      steps: [
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 1 — kennsla',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Þekkja frumefni'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 1 — spurning (lotukerfið eða valkostir)',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Þekkja frumefni'],
        },
        {
          clickRole: ['button', 'Byrja æfingar →'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 1 — vísbending',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Þekkja frumefni'],
        },
        {
          clickRole: ['button', 'Byrja æfingar →'],
        },
        {
          click: 'Vísbending',
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 1 — endurgjöf',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Þekkja frumefni'],
        },
        {
          clickRole: ['button', 'Byrja æfingar →'],
        },
        {
          css: 'button.element-cell:not([disabled]), div.grid.grid-cols-2.max-w-lg > button',
        },
        {
          wait: 800,
        },
      ],
    },
    {
      name: 'Stig 1 — næsta spurning',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Þekkja frumefni'],
        },
        {
          clickRole: ['button', 'Byrja æfingar →'],
        },
        {
          css: 'button.element-cell:not([disabled]), div.grid.grid-cols-2.max-w-lg > button',
        },
        {
          wait: 800,
        },
        {
          clickRole: ['button', 'Næsta spurning →'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 2 — kennsla',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Flokkar og lotubundnir eiginleikar'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 2 — spurning með vísbendingu',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Flokkar og lotubundnir eiginleikar'],
        },
        {
          clickRole: ['button', 'Byrja æfingar →'],
        },
        {
          click: 'Vísbending',
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 2 — endurgjöf',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Flokkar og lotubundnir eiginleikar'],
        },
        {
          clickRole: ['button', 'Byrja æfingar →'],
        },
        {
          css: 'button.rounded-xl.border-2',
        },
        {
          wait: 800,
        },
      ],
    },
    {
      name: 'Stig 3 — kennsla',
      steps: [
        {
          clickRole: ['button', 'Stig 3: Atómbygging'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 3 — spurning',
      steps: [
        {
          clickRole: ['button', 'Stig 3: Atómbygging'],
        },
        {
          clickRole: ['button', 'Byrja æfingar →'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 3 — vísbending',
      steps: [
        {
          clickRole: ['button', 'Stig 3: Atómbygging'],
        },
        {
          clickRole: ['button', 'Byrja æfingar →'],
        },
        {
          click: 'Vísbending',
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 3 — endurgjöf',
      steps: [
        {
          clickRole: ['button', 'Stig 3: Atómbygging'],
        },
        {
          clickRole: ['button', 'Byrja æfingar →'],
        },
        {
          css: 'input[type=number], button.element-cell:not([disabled])',
        },
        {
          press: '9',
        },
        {
          press: 'Enter',
        },
        {
          wait: 800,
        },
      ],
    },
  ],
  '1-ar/nafnakerfid': [
    {
      name: 'Valmynd',
      steps: [
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 1 — regla 4 (dæmi)',
      steps: [
        {
          clickRole: ['button', 'Grunnreglur'],
        },
        {
          clickRole: ['button', 'Regla 4'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Stig 1 — upphitun, rangt svar',
      steps: [
        {
          clickRole: ['button', 'Grunnreglur'],
        },
        {
          clickRole: ['button', 'Regla 4'],
        },
        {
          clickRole: ['button', 'Hefja próf'],
        },
        {
          clickRole: ['button', 'Málmleysingi'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Stig 2 — skref 1',
      steps: [
        {
          clickRole: ['button', 'Æfing með leiðsögn'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 2 — skref 2',
      steps: [
        {
          clickRole: ['button', 'Æfing með leiðsögn'],
        },
        {
          clickRole: ['button', 'Sameind'],
        },
        {
          wait: 1900,
        },
      ],
    },
    {
      name: 'Stig 2 — skref 3 með vísbendingu',
      steps: [
        {
          clickRole: ['button', 'Æfing með leiðsögn'],
        },
        {
          clickRole: ['button', 'Sameind'],
        },
        {
          wait: 1900,
        },
        {
          clickRole: ['button', 'Ég skil'],
        },
        {
          clickRole: ['button', 'Vísbending'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 2 — rangt svar',
      steps: [
        {
          clickRole: ['button', 'Æfing með leiðsögn'],
        },
        {
          clickRole: ['button', 'Sameind'],
        },
        {
          wait: 1900,
        },
        {
          clickRole: ['button', 'Ég skil'],
        },
        {
          fill: ['input[type=text]', 'Brennisteinsheksaflúoríð'],
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Stig 3 — nafnareglur opnar',
      steps: [
        {
          clickRole: ['button', 'Byggja nöfn'],
        },
        {
          clickRole: ['button', 'Nafnareglur'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 3 — fjórir partar valdir',
      steps: [
        {
          clickRole: ['button', 'Byggja nöfn'],
        },
        {
          css: 'div.flex.flex-wrap.gap-2:not(.border-dashed) > button',
        },
        {
          css: 'div.flex.flex-wrap.gap-2:not(.border-dashed) > button',
        },
        {
          css: 'div.flex.flex-wrap.gap-2:not(.border-dashed) > button',
        },
        {
          css: 'div.flex.flex-wrap.gap-2:not(.border-dashed) > button',
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 3 — rangt svar',
      steps: [
        {
          clickRole: ['button', 'Byggja nöfn'],
        },
        {
          css: 'div.flex.flex-wrap.gap-2:not(.border-dashed) > button',
        },
        {
          clickRole: ['button', 'Athuga'],
        },
        {
          wait: 400,
        },
      ],
    },
  ],
  '1-ar/molmassi': [
    {
      name: 'Valmynd',
      steps: [
        {
          wait: 200,
        },
      ],
    },
    {
      name: 'Stig 1 — kennsla',
      steps: [
        {
          click: 'Stig 1: Mólmassi',
        },
        {
          click: 'Sjáum dæmi',
        },
        {
          click: 'Eitt dæmi til',
        },
      ],
    },
    {
      name: 'Stig 1 — dæmi með vísbendingu',
      steps: [
        {
          click: 'Stig 1: Mólmassi',
        },
        {
          click: 'Sjáum dæmi',
        },
        {
          click: 'Eitt dæmi til',
        },
        {
          click: 'byrja æfingar',
        },
        {
          click: 'Vísbending',
        },
      ],
    },
    {
      name: 'Stig 1 — endurgjöf og útreikningur',
      steps: [
        {
          click: 'Stig 1: Mólmassi',
        },
        {
          click: 'Sjáum dæmi',
        },
        {
          click: 'Eitt dæmi til',
        },
        {
          click: 'byrja æfingar',
        },
        {
          fill: ['input[placeholder="t.d. 18,02"]', '1'],
        },
        {
          clickRole: ['button', 'Athuga'],
        },
      ],
    },
    {
      name: 'Stig 1 — lotukerfið, frumefni valið',
      steps: [
        {
          click: 'Stig 1: Mólmassi',
        },
        {
          click: 'Sjáum dæmi',
        },
        {
          click: 'Eitt dæmi til',
        },
        {
          click: 'byrja æfingar',
        },
        {
          clickRole: ['button', 'Lotukerfið'],
        },
        {
          css: '[role=dialog] .aspect-square button',
        },
      ],
    },
    {
      name: 'Stig 1 — lotukerfið, listi',
      steps: [
        {
          click: 'Stig 1: Mólmassi',
        },
        {
          click: 'Sjáum dæmi',
        },
        {
          click: 'Eitt dæmi til',
        },
        {
          click: 'byrja æfingar',
        },
        {
          clickRole: ['button', 'Lotukerfið'],
        },
        {
          click: 'Listi',
        },
      ],
    },
    {
      name: 'Stig 2 — kennsla',
      steps: [
        {
          click: 'Stig 2: Mól-umbreytingar',
        },
      ],
    },
    {
      name: 'Stig 2 — dæmi',
      steps: [
        {
          click: 'Stig 2: Mól-umbreytingar',
        },
        {
          click: 'Byrja æfingar',
        },
      ],
    },
    {
      name: 'Stig 2 — endurgjöf',
      steps: [
        {
          click: 'Stig 2: Mól-umbreytingar',
        },
        {
          click: 'Byrja æfingar',
        },
        {
          fill: ['input[placeholder="Svar..."]', '99999'],
        },
        {
          clickRole: ['button', 'Svara'],
        },
      ],
    },
    {
      name: 'Stig 3 — dæmi, ógilt svar',
      steps: [
        {
          click: 'Stig 3: Samþætt æfing',
        },
        {
          fill: ['input[placeholder^="t.d. 2,5e20"]', 'abc'],
        },
        {
          clickRole: ['button', 'Svara'],
        },
      ],
    },
    {
      name: 'Stig 3 — endurgjöf og lausnarleið',
      steps: [
        {
          click: 'Stig 3: Samþætt æfing',
        },
        {
          fill: ['input[placeholder^="t.d. 2,5e20"]', '99999'],
        },
        {
          clickRole: ['button', 'Svara'],
        },
      ],
    },
    {
      name: 'Stig 3 — lotukerfið',
      steps: [
        {
          click: 'Stig 3: Samþætt æfing',
        },
        {
          clickRole: ['button', 'Lotukerfið'],
        },
      ],
    },
  ],
  '1-ar/reynsluformulur': [
    {
      name: 'Valmynd',
      steps: [
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Kanna — tafla',
      steps: [
        {
          clickRole: ['button', 'Kanna'],
        },
      ],
    },
    {
      name: 'Kanna — Magnesíumfosfat valið',
      steps: [
        {
          clickRole: ['button', 'Kanna'],
        },
        {
          clickRole: ['button', 'Magnesíumfosfat'],
        },
      ],
    },
    {
      name: 'Valmynd eftir Kanna (Lokið)',
      steps: [
        {
          clickRole: ['button', 'Kanna'],
        },
        {
          clickRole: ['button', 'Áfram í Skilja'],
        },
      ],
    },
    {
      name: 'Skilja — þriðja súla (1,5-gildran)',
      steps: [
        {
          clickRole: ['button', 'Skilja'],
        },
        {
          clickRole: ['button', 'Næsta súla'],
        },
        {
          clickRole: ['button', 'Næsta súla'],
        },
      ],
    },
    {
      name: 'Skilja — fjórar súlur (tafla skrunar)',
      steps: [
        {
          clickRole: ['button', 'Skilja'],
        },
        {
          clickRole: ['button', 'Næsta súla'],
        },
        {
          clickRole: ['button', 'Næsta súla'],
        },
        {
          clickRole: ['button', 'Næsta súla'],
        },
      ],
    },
    {
      name: 'Æfa — Mól, röng svör',
      steps: [
        {
          clickRole: ['button', 'Æfa'],
        },
        {
          fill: ['input[aria-label="Mól fyrir H"]', '0'],
        },
        {
          fill: ['input[aria-label="Mól fyrir O"]', '0'],
        },
        {
          clickRole: ['button', 'Athuga'],
        },
      ],
    },
    {
      name: 'Æfa — Hlutfall, röng svör',
      steps: [
        {
          clickRole: ['button', 'Æfa'],
        },
        {
          fill: ['input[aria-label="Mól fyrir H"]', '5,883'],
        },
        {
          fill: ['input[aria-label="Mól fyrir O"]', '5,880'],
        },
        {
          clickRole: ['button', 'Athuga'],
        },
        {
          clickRole: ['button', 'Næsta súla'],
        },
        {
          fill: ['input[aria-label="Hlutfall fyrir H"]', '0'],
        },
        {
          fill: ['input[aria-label="Hlutfall fyrir O"]', '0'],
        },
        {
          clickRole: ['button', 'Athuga'],
        },
      ],
    },
    {
      name: 'Æfa — Vísitala rétt, reynsluformúla sýnd',
      steps: [
        {
          clickRole: ['button', 'Æfa'],
        },
        {
          fill: ['input[aria-label="Mól fyrir H"]', '5,883'],
        },
        {
          fill: ['input[aria-label="Mól fyrir O"]', '5,880'],
        },
        {
          clickRole: ['button', 'Athuga'],
        },
        {
          clickRole: ['button', 'Næsta súla'],
        },
        {
          fill: ['input[aria-label="Hlutfall fyrir H"]', '1'],
        },
        {
          fill: ['input[aria-label="Hlutfall fyrir O"]', '1'],
        },
        {
          clickRole: ['button', 'Athuga'],
        },
        {
          clickRole: ['button', 'Næsta súla'],
        },
        {
          fill: ['input[aria-label="Vísitala fyrir H"]', '1'],
        },
        {
          fill: ['input[aria-label="Vísitala fyrir O"]', '1'],
        },
        {
          clickRole: ['button', 'Athuga'],
        },
      ],
    },
    {
      name: 'Beita — spurning',
      steps: [
        {
          clickRole: ['button', 'Beita'],
        },
      ],
    },
    {
      name: 'Beita — rangt svar',
      steps: [
        {
          clickRole: ['button', 'Beita'],
        },
        {
          fill: ['#n-input', '3'],
        },
        {
          clickRole: ['button', 'Svara'],
        },
      ],
    },
    {
      name: 'Beita — síðasta dæmi svarað (Klára)',
      steps: [
        {
          clickRole: ['button', 'Beita'],
        },
        {
          fill: ['#n-input', '2'],
        },
        {
          clickRole: ['button', 'Svara'],
        },
        {
          clickRole: ['button', 'Næsta dæmi'],
        },
        {
          fill: ['#n-input', '6'],
        },
        {
          clickRole: ['button', 'Svara'],
        },
        {
          clickRole: ['button', 'Næsta dæmi'],
        },
        {
          fill: ['#n-input', '6'],
        },
        {
          clickRole: ['button', 'Svara'],
        },
      ],
    },
  ],
  '1-ar/utfellingarhvorf': [
    {
      name: 'Valmynd',
      steps: [
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Kanna — áður en hellt er',
      steps: [
        {
          clickRole: ['button', 'Kanna'],
        },
      ],
    },
    {
      name: 'Kanna — botnfall myndast',
      steps: [
        {
          clickRole: ['button', 'Kanna'],
        },
        {
          clickRole: ['button', 'Helltu saman'],
        },
      ],
    },
    {
      name: 'Kanna — ekkert botnfall',
      steps: [
        {
          clickRole: ['button', 'Kanna'],
        },
        {
          clickRole: ['button', 'NaCl + KNO₃'],
        },
        {
          clickRole: ['button', 'Helltu saman'],
        },
      ],
    },
    {
      name: 'Valmynd — Kanna lokið',
      steps: [
        {
          clickRole: ['button', 'Kanna'],
        },
        {
          clickRole: ['button', 'Helltu saman'],
        },
        {
          clickRole: ['button', 'NaCl + KNO₃'],
        },
        {
          clickRole: ['button', 'Helltu saman'],
        },
        {
          clickRole: ['button', 'Áfram í Skilja'],
        },
        {
          clickRole: ['button', 'Til baka'],
        },
      ],
    },
    {
      name: 'Skilja — þrjú skref og leysnireglurnar opnar',
      steps: [
        {
          clickRole: ['button', 'Skilja'],
        },
        {
          clickRole: ['button', 'Næsta skref'],
        },
        {
          clickRole: ['button', 'Næsta skref'],
        },
        {
          css: 'summary',
        },
      ],
    },
    {
      name: 'Æfa — spurning',
      steps: [
        {
          clickRole: ['button', 'Æfa'],
        },
      ],
    },
    {
      name: 'Æfa — endurgjöf',
      steps: [
        {
          clickRole: ['button', 'Æfa'],
        },
        {
          css: 'fieldset button',
        },
        {
          css: 'fieldset:nth-of-type(2) button',
        },
        {
          clickRole: ['button', 'Athuga'],
        },
      ],
    },
    {
      name: 'Beita — myndast botnfall?',
      steps: [
        {
          clickRole: ['button', 'Beita'],
        },
      ],
    },
    {
      name: 'Beita — hvort efnið fellur út?',
      steps: [
        {
          clickRole: ['button', 'Beita'],
        },
        {
          clickRole: ['button', 'Já, botnfall myndast'],
        },
      ],
    },
    {
      name: 'Beita — byggja nettójónajöfnu',
      steps: [
        {
          clickRole: ['button', 'Beita'],
        },
        {
          clickRole: ['button', 'Já, botnfall myndast'],
        },
        {
          clickRole: ['button', 'AgCl'],
        },
        {
          clickRole: ['button', 'Fjölga Ag⁺'],
        },
        {
          clickRole: ['button', 'Fjölga Cl⁻'],
        },
      ],
    },
    {
      name: 'Beita — rétt jafna',
      steps: [
        {
          clickRole: ['button', 'Beita'],
        },
        {
          clickRole: ['button', 'Já, botnfall myndast'],
        },
        {
          clickRole: ['button', 'AgCl'],
        },
        {
          clickRole: ['button', 'Fjölga Ag⁺'],
        },
        {
          clickRole: ['button', 'Fjölga Cl⁻'],
        },
        {
          clickRole: ['button', 'Athuga jöfnuna'],
        },
      ],
    },
    {
      name: 'Beita — rangt spáð',
      steps: [
        {
          clickRole: ['button', 'Beita'],
        },
        {
          clickRole: ['button', 'Nei, ekkert gerist'],
        },
      ],
    },
  ],
  '1-ar/jafna-jofnur': [
    {
      name: 'Valmynd',
      steps: [
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 1 — kynning',
      steps: [
        {
          clickRole: ['button', 'Stig 1'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 1 — æfing',
      steps: [
        {
          clickRole: ['button', 'Stig 1'],
        },
        {
          click: 'Byrja æfingar',
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 1 — vísbending',
      steps: [
        {
          clickRole: ['button', 'Stig 1'],
        },
        {
          click: 'Byrja æfingar',
        },
        {
          clickRole: ['button', 'Vísbending'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 1 — endurgjöf',
      steps: [
        {
          clickRole: ['button', 'Stig 1'],
        },
        {
          click: 'Byrja æfingar',
        },
        {
          clickRole: ['button', 'Athuga'],
        },
        {
          wait: 600,
        },
      ],
    },
    {
      name: 'Stig 2 — æfing',
      steps: [
        {
          clickRole: ['button', 'Stig 2'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 2 — vísbending',
      steps: [
        {
          clickRole: ['button', 'Stig 2'],
        },
        {
          clickRole: ['button', 'Vísbending'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 2 — endurgjöf',
      steps: [
        {
          clickRole: ['button', 'Stig 2'],
        },
        {
          clickRole: ['button', 'Athuga'],
        },
        {
          wait: 600,
        },
      ],
    },
    {
      name: 'Stig 3 — vísbending',
      steps: [
        {
          clickRole: ['button', 'Stig 3'],
        },
        {
          clickRole: ['button', 'Vísbending'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 3 — endurgjöf',
      steps: [
        {
          clickRole: ['button', 'Stig 3'],
        },
        {
          css: 'button[aria-label^="Hækka"]',
        },
        {
          clickRole: ['button', 'Athuga'],
        },
        {
          wait: 600,
        },
      ],
    },
    {
      name: 'Stig 3 — næsta efnajafna',
      steps: [
        {
          clickRole: ['button', 'Stig 3'],
        },
        {
          clickRole: ['button', 'Athuga'],
        },
        {
          clickRole: ['button', 'Næsta efnajafna'],
        },
        {
          wait: 300,
        },
      ],
    },
  ],
  '1-ar/takmarkandi': [
    {
      name: 'Valmynd',
      steps: [
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Valmynd — enska',
      steps: [
        {
          clickRole: ['button', 'English'],
        },
      ],
    },
    {
      name: 'Stig 1 — kynning',
      steps: [
        {
          clickRole: ['button', 'Stig 1'],
        },
      ],
    },
    {
      name: 'Stig 1 — spurning',
      steps: [
        {
          clickRole: ['button', 'Stig 1'],
        },
        {
          click: 'Byrja æfingar',
        },
      ],
    },
    {
      name: 'Stig 1 — endurgjöf',
      steps: [
        {
          clickRole: ['button', 'Stig 1'],
        },
        {
          click: 'Byrja æfingar',
        },
        {
          css: 'button:has-text("sameindir")',
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Stig 2 — spurning',
      steps: [
        {
          clickRole: ['button', 'Stig 2'],
        },
      ],
    },
    {
      name: 'Stig 2 — endurgjöf',
      steps: [
        {
          clickRole: ['button', 'Stig 2'],
        },
        {
          fill: ['input', '9999'],
        },
        {
          clickRole: ['button', 'Athuga'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Stig 3 — takmarkandi',
      steps: [
        {
          clickRole: ['button', 'Stig 3'],
        },
      ],
    },
    {
      name: 'Stig 3 — endurgjöf',
      steps: [
        {
          clickRole: ['button', 'Stig 3'],
        },
        {
          css: 'button.font-mono',
        },
        {
          clickRole: ['button', 'Athuga'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Stig 3 — fræðilegar heimtur, röng',
      steps: [
        {
          clickRole: ['button', 'Stig 3'],
        },
        {
          css: 'button.font-mono',
        },
        {
          clickRole: ['button', 'Athuga'],
        },
        {
          clickRole: ['button', 'Áfram'],
        },
        {
          fill: ['input', '1'],
        },
        {
          clickRole: ['button', 'Athuga'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Stig 3 — prósentuheimtur, röng',
      steps: [
        {
          clickRole: ['button', 'Stig 3'],
        },
        {
          css: 'button.font-mono',
        },
        {
          clickRole: ['button', 'Athuga'],
        },
        {
          clickRole: ['button', 'Áfram'],
        },
        {
          fill: ['input', '1'],
        },
        {
          clickRole: ['button', 'Athuga'],
        },
        {
          clickRole: ['button', 'Áfram'],
        },
        {
          fill: ['input', '1'],
        },
        {
          clickRole: ['button', 'Athuga'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Stig 3 — yfirlit verkefnis',
      steps: [
        {
          clickRole: ['button', 'Stig 3'],
        },
        {
          css: 'button.font-mono',
        },
        {
          clickRole: ['button', 'Athuga'],
        },
        {
          clickRole: ['button', 'Áfram'],
        },
        {
          fill: ['input', '1'],
        },
        {
          clickRole: ['button', 'Athuga'],
        },
        {
          clickRole: ['button', 'Áfram'],
        },
        {
          fill: ['input', '1'],
        },
        {
          clickRole: ['button', 'Athuga'],
        },
        {
          clickRole: ['button', 'Áfram'],
        },
        {
          wait: 300,
        },
      ],
    },
  ],
  '1-ar/lausnir': [
    {
      name: 'Valmynd',
      steps: [
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 0 — kennsla',
      steps: [
        {
          clickRole: ['button', 'Rafkleyfi'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 0 — endurgjöf',
      steps: [
        {
          clickRole: ['button', 'Rafkleyfi'],
        },
        {
          clickRole: ['button', 'Byrja að flokka'],
        },
        {
          clickRole: ['button', 'Sterkur rafkleyfi'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 1 — röng spá',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Hugtök'],
        },
        {
          clickRole: ['button', 'Eykst'],
        },
        {
          clickRole: ['button', 'Athuga spá'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 1 — verkefni',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Hugtök'],
        },
        {
          clickRole: ['button', 'Minnkar'],
        },
        {
          clickRole: ['button', 'Athuga spá'],
        },
        {
          clickRole: ['button', 'Áfram í verkefni'],
        },
        {
          wait: 500,
        },
      ],
    },
    {
      name: 'Stig 1 — verkefni 2 (sameindir)',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Hugtök'],
        },
        {
          clickRole: ['button', '2'],
        },
        {
          clickRole: ['button', 'Eykst'],
        },
        {
          clickRole: ['button', 'Athuga spá'],
        },
        {
          clickRole: ['button', 'Áfram í verkefni'],
        },
        {
          wait: 500,
        },
      ],
    },
    {
      name: 'Stig 2 — atburðarás og vísbending',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Rökstuðningur'],
        },
        {
          clickRole: ['button', 'Vísbending'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 2 — niðurstaða',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Rökstuðningur'],
        },
        {
          css: 'button.rounded-xl.border-2',
        },
        {
          clickRole: ['button', 'Staðfesta svar'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 2 — hitastig, niðurstaða',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Rökstuðningur'],
        },
        {
          css: 'button.rounded-xl.border-2',
        },
        {
          clickRole: ['button', 'Staðfesta svar'],
        },
        {
          clickRole: ['button', 'Næsta spurning'],
        },
        {
          css: 'button.rounded-xl.border-2',
        },
        {
          clickRole: ['button', 'Staðfesta svar'],
        },
        {
          clickRole: ['button', 'Næsta spurning'],
        },
        {
          css: 'button.rounded-xl.border-2',
        },
        {
          clickRole: ['button', 'Staðfesta svar'],
        },
        {
          clickRole: ['button', 'Næsta spurning'],
        },
        {
          css: 'button.rounded-xl.border-2',
        },
        {
          clickRole: ['button', 'Staðfesta svar'],
        },
      ],
    },
    {
      name: 'Stig 2 — Kanna leysni',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Rökstuðningur'],
        },
        {
          clickRole: ['button', 'Kanna'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Stig 3 — dæmi og ábendingar',
      steps: [
        {
          clickRole: ['button', 'Stig 3: Útreikningar'],
        },
        {
          clickRole: ['button', 'Ábending 1'],
        },
        {
          clickRole: ['button', 'Ábending 2'],
        },
        {
          clickRole: ['button', 'Ábending 3'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 3 — endurgjöf',
      steps: [
        {
          clickRole: ['button', 'Stig 3: Útreikningar'],
        },
        {
          fill: ['input[inputmode=decimal]', '1'],
        },
        {
          clickRole: ['button', 'Athuga'],
        },
        {
          wait: 300,
        },
      ],
    },
  ],
  '1-ar/einingakedjan': [
    {
      name: 'Valmynd',
      steps: [
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Kanna — fimm spjöld og snúið spjald',
      steps: [
        {
          clickRole: ['button', 'Kanna'],
        },
        {
          css: 'button[aria-label^="Bæta við hlutfalli"][aria-label*=": 24,31 g Mg"]',
        },
        {
          css: 'button[aria-label^="Bæta við hlutfalli"][aria-label*="atóm Mg jafngildir"]',
        },
        {
          css: 'button[aria-label^="Bæta við hlutfalli"][aria-label*=": 40,3 g MgO"]',
        },
        {
          css: 'button[aria-label^="Bæta við hlutfalli"][aria-label*="2 mol Mg jafngildir 2 mol MgO"]',
        },
        {
          css: 'button[aria-label^="Bæta við hlutfalli"][aria-label*=": 1000 g jafngildir"]',
        },
        {
          css: 'button[aria-label="Snúa við hlutfalli númer 1"]',
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Kanna lokið — valmynd',
      steps: [
        {
          clickRole: ['button', 'Kanna'],
        },
        {
          css: 'button[aria-label^="Bæta við hlutfalli"][aria-label*=": 24,31 g Mg"]',
        },
        {
          clickRole: ['button', 'Áfram'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Skilja — hlutfall snúið við',
      steps: [
        {
          clickRole: ['button', 'Skilja'],
        },
        {
          clickRole: ['button', 'Snúa hlutfallinu við'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Æfa — keðja í smíðum með vísbendingu',
      steps: [
        {
          clickRole: ['button', 'Æfa'],
        },
        {
          css: 'button[aria-label^="Bæta við hlutfalli"][aria-label*=": 24,31 g Mg"]',
        },
        {
          clickRole: ['button', 'Vísbending'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Æfa — spá valin',
      steps: [
        {
          clickRole: ['button', 'Æfa'],
        },
        {
          css: 'button[aria-label^="Bæta við hlutfalli"]',
        },
        {
          clickRole: ['button', 'Leysa'],
        },
        {
          css: 'main .grid button',
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Æfa — leiðrétting eftir ranga keðju',
      steps: [
        {
          clickRole: ['button', 'Æfa'],
        },
        {
          css: 'button[aria-label^="Bæta við hlutfalli"][aria-label*=": 24,31 g Mg"]',
        },
        {
          clickRole: ['button', 'Leysa'],
        },
        {
          css: 'main .grid button',
        },
        {
          clickRole: ['button', 'Sýna útreikninginn'],
        },
        {
          wait: 2500,
        },
        {
          css: '.border-amber-400 .grid button',
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Æfa — keðjan gengur upp',
      steps: [
        {
          clickRole: ['button', 'Æfa'],
        },
        {
          css: 'button[aria-label^="Bæta við hlutfalli"][aria-label*=": 24,31 g Mg"]',
        },
        {
          css: 'button[aria-label="Snúa við hlutfalli númer 1"]',
        },
        {
          css: 'button[aria-label^="Bæta við hlutfalli"][aria-label*="atóm Mg jafngildir"]',
        },
        {
          clickRole: ['button', 'Leysa'],
        },
        {
          css: 'main .grid button',
        },
        {
          clickRole: ['button', 'Sýna útreikninginn'],
        },
        {
          clickRole: ['button', 'Sýna öll skrefin strax'],
        },
        {
          wait: 1000,
        },
      ],
    },
    {
      name: 'Beita — þriggja skrefa lausn með efnajöfnu',
      steps: [
        {
          clickRole: ['button', 'Beita'],
        },
        {
          css: 'button[aria-label^="Bæta við hlutfalli"][aria-label*=": 24,31 g Mg"]',
        },
        {
          css: 'button[aria-label="Snúa við hlutfalli númer 1"]',
        },
        {
          css: 'button[aria-label^="Bæta við hlutfalli"][aria-label*="2 mol Mg jafngildir 2 mol MgO"]',
        },
        {
          css: 'button[aria-label="Snúa við hlutfalli númer 2"]',
        },
        {
          css: 'button[aria-label^="Bæta við hlutfalli"][aria-label*=": 40,3 g MgO"]',
        },
        {
          clickRole: ['button', 'Leysa'],
        },
        {
          clickRole: ['button', 'Sýna öll skrefin strax'],
        },
        {
          wait: 1000,
        },
      ],
    },
    {
      name: 'Beita — næsta dæmi',
      steps: [
        {
          clickRole: ['button', 'Beita'],
        },
        {
          css: 'button[aria-label^="Bæta við hlutfalli"][aria-label*=": 24,31 g Mg"]',
        },
        {
          css: 'button[aria-label="Snúa við hlutfalli númer 1"]',
        },
        {
          css: 'button[aria-label^="Bæta við hlutfalli"][aria-label*="2 mol Mg jafngildir 2 mol MgO"]',
        },
        {
          css: 'button[aria-label="Snúa við hlutfalli númer 2"]',
        },
        {
          css: 'button[aria-label^="Bæta við hlutfalli"][aria-label*=": 40,3 g MgO"]',
        },
        {
          clickRole: ['button', 'Leysa'],
        },
        {
          clickRole: ['button', 'Sýna öll skrefin strax'],
        },
        {
          wait: 1000,
        },
        {
          clickRole: ['button', 'Næsta dæmi'],
        },
        {
          wait: 400,
        },
      ],
    },
  ],
  '2-ar/hess-law': [
    {
      name: 'Valmynd',
      steps: [
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 1 — kynning',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Skilningur'],
        },
      ],
    },
    {
      name: 'Stig 1 — endurgjöf',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Skilningur'],
        },
        {
          clickRole: ['button', 'Byrja'],
        },
        {
          css: 'div.space-y-3 > button',
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
      ],
    },
    {
      name: 'Stig 1 — snúa við og margfalda',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Skilningur'],
        },
        {
          clickRole: ['button', 'Byrja'],
        },
        {
          css: 'button.rounded-full:nth-child(2)',
        },
        {
          clickRole: ['button', 'Snúa við'],
        },
        {
          css: 'button.w-10.rounded-lg:nth-of-type(3)',
        },
      ],
    },
    {
      name: 'Stig 1 — ástandsfall',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Skilningur'],
        },
        {
          clickRole: ['button', 'Byrja'],
        },
        {
          clickRole: ['button', 'Myndun NH₃'],
        },
        {
          clickRole: ['switch', 'Sýna saman'],
        },
      ],
    },
    {
      name: 'Valmynd — framvinda',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Skilningur'],
        },
        {
          clickRole: ['button', 'Byrja'],
        },
        {
          css: 'button.rounded-full:nth-child(6)',
        },
        {
          css: 'div.space-y-3 > button',
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
        {
          clickRole: ['button', 'Ljúka stigi'],
        },
      ],
    },
    {
      name: 'Stig 2 — orkuferill',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Þrautir'],
        },
        {
          css: 'div[role=button] div.font-mono',
        },
        {
          clickRole: ['button', 'Snúa við jöfnu'],
        },
        {
          clickRole: ['button', 'Sýna vísbendingu'],
        },
      ],
    },
    {
      name: 'Stig 2 — endurgjöf',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Þrautir'],
        },
        {
          css: 'div[role=button] div.font-mono',
        },
        {
          clickRole: ['button', 'Athuga lausn'],
        },
      ],
    },
    {
      name: 'Stig 3 — kynning',
      steps: [
        {
          clickRole: ['button', 'Stig 3: Útreikningar'],
        },
      ],
    },
    {
      name: 'Stig 3 — tafla og vísbending',
      steps: [
        {
          clickRole: ['button', 'Stig 3: Útreikningar'],
        },
        {
          clickRole: ['button', 'Byrja æfingar'],
        },
        {
          clickRole: ['button', 'Sýna ΔH°f töflu'],
        },
        {
          clickRole: ['button', 'Sýna vísbendingu'],
        },
      ],
    },
    {
      name: 'Stig 3 — endurgjöf',
      steps: [
        {
          clickRole: ['button', 'Stig 3: Útreikningar'],
        },
        {
          clickRole: ['button', 'Byrja æfingar'],
        },
        {
          fill: ['#hess-l3-answer', '5'],
        },
        {
          clickRole: ['button', 'Athuga'],
        },
      ],
    },
  ],
  '2-ar/kinetics': [
    {
      name: 'Valmynd',
      steps: [
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 1 — spurning',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Hraðahugtök'],
        },
        {
          clickRole: ['button', 'Sýna vísbendingu'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 1 — endurgjöf',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Hraðahugtök'],
        },
        {
          css: 'button.text-left.border-2',
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Stig 1 — hvataáhrif',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Hraðahugtök'],
        },
        {
          clickRole: ['button', 'Sýna hreyfingu'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Stig 2 — kynning',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Hraðalögmál'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 2 — spurning',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Hraðalögmál'],
        },
        {
          clickRole: ['button', 'Byrja æfingar'],
        },
        {
          clickRole: ['button', 'Sýna vísbendingu'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 2 — endurgjöf',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Hraðalögmál'],
        },
        {
          clickRole: ['button', 'Byrja æfingar'],
        },
        {
          css: 'button.w-12.h-12',
        },
        {
          css: 'div.space-y-4 > div:nth-child(2) button.w-12',
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Stig 3 — kynning',
      steps: [
        {
          clickRole: ['button', 'Stig 3: Hvarfgangur'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 3 — spurning',
      steps: [
        {
          clickRole: ['button', 'Stig 3: Hvarfgangur'],
        },
        {
          clickRole: ['button', 'Byrja æfingar'],
        },
        {
          clickRole: ['button', 'Sýna vísbendingu'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 3 — endurgjöf',
      steps: [
        {
          clickRole: ['button', 'Stig 3: Hvarfgangur'],
        },
        {
          clickRole: ['button', 'Byrja æfingar'],
        },
        {
          css: 'button.text-left.border-2',
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
        {
          wait: 400,
        },
      ],
    },
  ],
  '2-ar/lewis-structures': [
    {
      name: 'Stig 1 — spurning',
      steps: [
        {
          click: 'Stig 1: Gildisrafeindir',
        },
      ],
    },
    {
      name: 'Stig 1 — vísbendingar opnaðar',
      steps: [
        {
          click: 'Stig 1: Gildisrafeindir',
        },
        {
          clickRole: ['button', 'Vísbending 1/4'],
        },
        {
          clickRole: ['button', 'Vísbending 2/4'],
        },
      ],
    },
    {
      name: 'Stig 1 — rangt svar, endurgjöf',
      steps: [
        {
          click: 'Stig 1: Gildisrafeindir',
        },
        {
          fill: ['input[type=number]', '99'],
        },
        {
          click: 'Athuga svar',
        },
      ],
    },
    {
      name: 'Stig 1 — rétt svar, endurgjöf',
      steps: [
        {
          click: 'Stig 1: Gildisrafeindir',
        },
        {
          fill: ['input[type=number]', '4'],
        },
        {
          click: 'Athuga svar',
        },
      ],
    },
    {
      name: 'Stig 2 — teikniborð',
      steps: [
        {
          click: 'Stig 2: Teikna Lewis',
        },
      ],
    },
    {
      name: 'Stig 2 — rangt teiknað, endurgjöf',
      steps: [
        {
          click: 'Stig 2: Teikna Lewis',
        },
        {
          css: 'svg g[role=button]',
        },
        {
          click: 'Athuga',
        },
      ],
    },
    {
      name: 'Stig 2 — of margar rafeindir',
      steps: [
        {
          click: 'Stig 2: Teikna Lewis',
        },
        {
          css: 'svg g[role=button]:nth-of-type(1)',
        },
        {
          css: 'svg g[role=button]:nth-of-type(1)',
        },
        {
          css: 'svg g[role=button]:nth-of-type(1)',
        },
        {
          css: 'svg g[role=button]:nth-of-type(2)',
        },
        {
          css: 'svg g[role=button]:nth-of-type(2)',
        },
        {
          css: 'svg g[role=button]:nth-of-type(2)',
        },
      ],
    },
    {
      name: 'Stig 2 — vísbendingar opnaðar',
      steps: [
        {
          click: 'Stig 2: Teikna Lewis',
        },
        {
          click: 'Sýna vísbendingu',
        },
        {
          click: 'Sýna fleiri vísbendingar',
        },
        {
          click: 'Sýna fleiri vísbendingar',
        },
      ],
    },
    {
      name: 'Stig 2 — rétt teiknað, Lewis-formúla',
      steps: [
        {
          click: 'Stig 2: Teikna Lewis',
        },
        {
          css: 'svg g[role=button]:nth-of-type(1)',
        },
        {
          css: 'svg g[role=button]:nth-of-type(2)',
        },
        {
          clickRole: ['button', 'Bæta einstæðu pari við O (miðatóm)'],
        },
        {
          clickRole: ['button', 'Bæta einstæðu pari við O (miðatóm)'],
        },
        {
          click: 'Athuga',
        },
      ],
    },
    {
      name: 'Stig 2 — rétt teiknað, þrívíddarlögun',
      steps: [
        {
          click: 'Stig 2: Teikna Lewis',
        },
        {
          css: 'svg g[role=button]:nth-of-type(1)',
        },
        {
          css: 'svg g[role=button]:nth-of-type(2)',
        },
        {
          clickRole: ['button', 'Bæta einstæðu pari við O (miðatóm)'],
        },
        {
          clickRole: ['button', 'Bæta einstæðu pari við O (miðatóm)'],
        },
        {
          click: 'Athuga',
        },
        {
          click: '3D lögun',
        },
        {
          wait: 500,
        },
      ],
    },
    {
      name: 'Stig 2 — leiðsögn, dreifing rafeinda',
      steps: [
        {
          click: 'Stig 2: Teikna Lewis',
        },
        {
          click: 'Opna leiðsögn',
        },
        {
          fill: ['input[type=number]', '8'],
        },
        {
          click: 'Athuga',
        },
        {
          click: 'Næsta skref',
        },
        {
          click: 'Ég skil',
        },
        {
          click: 'Næsta skref',
        },
        {
          fill: ['input[type=number]', '2'],
        },
        {
          click: 'Athuga',
        },
        {
          wait: 700,
        },
        {
          click: 'Næsta skref',
        },
      ],
    },
    {
      name: 'Stig 3 — spurning, vísbending og rangt svar',
      steps: [
        {
          click: 'Stig 3: Formhleðsla',
        },
        {
          click: 'Sýna vísbendingu',
        },
        {
          click: 'FC = Gildisraf. + óbundnar - bundnar',
        },
        {
          click: 'Athuga svar',
        },
      ],
    },
    {
      name: 'Stig 3 — formhleðsla atóms, niðurstaða',
      steps: [
        {
          click: 'Stig 3: Formhleðsla',
        },
        {
          click: 'FC = Gildisraf. - (óbundnar + ½ bundnar)',
        },
        {
          click: 'Athuga svar',
        },
        {
          click: 'Næsta þraut',
        },
        {
          clickRole: ['button', '+1'],
        },
        {
          click: 'Athuga svar',
        },
      ],
    },
    {
      name: 'Stig 3 — samanburður Lewis-formúla (CO)',
      steps: [
        {
          click: 'Stig 3: Formhleðsla',
        },
        {
          click: 'FC = Gildisraf. - (óbundnar + ½ bundnar)',
        },
        {
          click: 'Athuga svar',
        },
        {
          click: 'Næsta þraut',
        },
        {
          clickRole: ['button', '+1'],
        },
        {
          click: 'Athuga svar',
        },
        {
          click: 'Næsta þraut',
        },
        {
          clickRole: ['button', '+1'],
        },
        {
          click: 'Athuga svar',
        },
        {
          click: 'Næsta þraut',
        },
      ],
    },
  ],
  '2-ar/vsepr-geometry': [
    {
      name: 'Valmynd',
      steps: [
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 1 — könnun',
      steps: [
        {
          clickRole: ['button', 'Stig 1: VSEPR Kenning'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 1 — valin lögun',
      steps: [
        {
          clickRole: ['button', 'Stig 1: VSEPR Kenning'],
        },
        {
          clickRole: ['button', 'Áttflötungur Octahedral'],
        },
        {
          wait: 500,
        },
      ],
    },
    {
      name: 'Stig 1 — spurning með vísbendingu',
      steps: [
        {
          clickRole: ['button', 'Stig 1: VSEPR Kenning'],
        },
        {
          clickRole: ['button', 'Hefja spurningar'],
        },
        {
          css: 'button.underline',
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 1 — endurgjöf',
      steps: [
        {
          clickRole: ['button', 'Stig 1: VSEPR Kenning'],
        },
        {
          clickRole: ['button', 'Hefja spurningar'],
        },
        {
          css: 'button:has(span.uppercase)',
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 2 — telja rafeindasvið',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Spá fyrir um lögun'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 2 — röng talning',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Spá fyrir um lögun'],
        },
        {
          fill: ['div:nth-child(1) > input[type=number]', '5'],
        },
        {
          fill: ['div:nth-child(2) > input[type=number]', '0'],
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 2 — lögun opinberuð',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Spá fyrir um lögun'],
        },
        {
          fill: ['div:nth-child(1) > input[type=number]', '2'],
        },
        {
          fill: ['div:nth-child(2) > input[type=number]', '2'],
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
        {
          clickRole: ['button', 'Næsta skref'],
        },
        {
          clickRole: ['button', 'Beygð'],
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
        {
          wait: 800,
        },
      ],
    },
    {
      name: 'Stig 2 — tengihorn',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Spá fyrir um lögun'],
        },
        {
          fill: ['div:nth-child(1) > input[type=number]', '2'],
        },
        {
          fill: ['div:nth-child(2) > input[type=number]', '2'],
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
        {
          clickRole: ['button', 'Næsta skref'],
        },
        {
          clickRole: ['button', 'Beygð'],
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
        {
          clickRole: ['button', 'Næsta skref'],
        },
        {
          fill: ['input[type=text]', '50'],
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
        {
          wait: 500,
        },
      ],
    },
    {
      name: 'Stig 3 — spurning',
      steps: [
        {
          clickRole: ['button', 'Stig 3: Blendni og skautun'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 3 — endurgjöf og blendnirit',
      steps: [
        {
          clickRole: ['button', 'Stig 3: Blendni og skautun'],
        },
        {
          css: 'button:has(span.uppercase)',
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
        {
          clickRole: ['button', 'Skoða hugtakaútskýringu'],
        },
        {
          wait: 300,
        },
      ],
    },
  ],
  '2-ar/intermolecular-forces': [
    {
      name: 'Valmynd',
      steps: [
        {
          wait: 200,
        },
      ],
    },
    {
      name: 'Stig 1 — kynning',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Greina IMF tegundir'],
        },
      ],
    },
    {
      name: 'Stig 1 — samanburður krafta',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Greina IMF tegundir'],
        },
        {
          clickRole: ['button', 'Bera saman'],
        },
      ],
    },
    {
      name: 'Stig 1 — valinn kraftur',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Greina IMF tegundir'],
        },
        {
          css: '[aria-label="Veldu krafttegund"] button:nth-child(2)',
        },
      ],
    },
    {
      name: 'Stig 1 — spurning með vísbendingu',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Greina IMF tegundir'],
        },
        {
          clickRole: ['button', 'Hefja æfingar'],
        },
        {
          clickRole: ['button', 'Sýna vísbendingu'],
        },
      ],
    },
    {
      name: 'Stig 1 — endurgjöf',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Greina IMF tegundir'],
        },
        {
          clickRole: ['button', 'Hefja æfingar'],
        },
        {
          clickRole: ['button', 'London dreifikraftar'],
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
      ],
    },
    {
      name: 'Stig 2 — röðun',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Raða eftir eiginleikum'],
        },
        {
          css: 'div:has(> div:text-is("Tiltæk efni:")) button',
        },
        {
          css: 'div:has(> div:text-is("Tiltæk efni:")) button',
        },
        {
          css: 'div:has(> div:text-is("Tiltæk efni:")) button',
        },
      ],
    },
    {
      name: 'Stig 2 — endurgjöf',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Raða eftir eiginleikum'],
        },
        {
          css: 'div:has(> div:text-is("Tiltæk efni:")) button',
        },
        {
          css: 'div:has(> div:text-is("Tiltæk efni:")) button',
        },
        {
          css: 'div:has(> div:text-is("Tiltæk efni:")) button',
        },
        {
          clickRole: ['button', 'Athuga röðun'],
        },
      ],
    },
    {
      name: 'Stig 2 — leysni, niðurstaða',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Raða eftir eiginleikum'],
        },
        {
          clickRole: ['button', 'NaCl'],
        },
        {
          clickRole: ['button', '(Skautað)'],
        },
        {
          clickRole: ['button', 'Nei, leysist ekki'],
        },
        {
          wait: 1800,
        },
      ],
    },
    {
      name: 'Stig 3 — spurning',
      steps: [
        {
          clickRole: ['button', 'Stig 3: Flókin greining'],
        },
      ],
    },
    {
      name: 'Stig 3 — endurgjöf og dýpri skilningur',
      steps: [
        {
          clickRole: ['button', 'Stig 3: Flókin greining'],
        },
        {
          css: '.space-y-3 > button',
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
        {
          clickRole: ['button', 'Dýpri skilningur'],
        },
      ],
    },
  ],
  '2-ar/organic-nomenclature': [
    {
      name: 'Valmynd',
      steps: [
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 1 — forskeyti, 10 kolefni',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Grunnreglur'],
        },
        {
          clickRole: ['button', 'Næsta →'],
        },
        {
          clickRole: ['button', 'Næsta →'],
        },
        {
          clickRole: ['button', 'Næsta →'],
        },
        {
          clickRole: ['button', 'Næsta →'],
        },
        {
          clickRole: ['button', 'Næsta →'],
        },
        {
          clickRole: ['button', 'Næsta →'],
        },
        {
          clickRole: ['button', 'Næsta →'],
        },
        {
          clickRole: ['button', 'Næsta →'],
        },
        {
          clickRole: ['button', 'Næsta →'],
        },
      ],
    },
    {
      name: 'Stig 1 — viðskeyti',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Grunnreglur'],
        },
        {
          clickRole: ['button', 'Næsta →'],
        },
        {
          clickRole: ['button', 'Næsta →'],
        },
        {
          clickRole: ['button', 'Næsta →'],
        },
        {
          clickRole: ['button', 'Næsta →'],
        },
        {
          clickRole: ['button', 'Næsta →'],
        },
        {
          clickRole: ['button', 'Næsta →'],
        },
        {
          clickRole: ['button', 'Næsta →'],
        },
        {
          clickRole: ['button', 'Næsta →'],
        },
        {
          clickRole: ['button', 'Næsta →'],
        },
        {
          clickRole: ['button', 'Viðskeyti →'],
        },
      ],
    },
    {
      name: 'Stig 2 — val á ham',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Nefna sameindir'],
        },
      ],
    },
    {
      name: 'Stig 2 — nafnasmiður',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Nefna sameindir'],
        },
        {
          clickRole: ['button', 'Nefna sameindir'],
        },
      ],
    },
    {
      name: 'Stig 2 — nafnasmiður með hlutum í reitum',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Nefna sameindir'],
        },
        {
          clickRole: ['button', 'Nefna sameindir'],
        },
        {
          css: '[data-drop-pool] [data-item-id="prefix-prop"]',
        },
        {
          css: '[data-zone-id="zone-prefix"]',
        },
        {
          css: '[data-drop-pool] [data-item-id="suffix-en"]',
        },
        {
          css: '[data-zone-id="zone-suffix"]',
        },
      ],
    },
    {
      name: 'Stig 2 — endurgjöf í draga-ham',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Nefna sameindir'],
        },
        {
          clickRole: ['button', 'Nefna sameindir'],
        },
        {
          css: '[data-drop-pool] [data-item-id="prefix-prop"]',
        },
        {
          css: '[data-zone-id="zone-prefix"]',
        },
        {
          css: '[data-drop-pool] [data-item-id="suffix-en"]',
        },
        {
          css: '[data-zone-id="zone-suffix"]',
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
        {
          wait: 600,
        },
      ],
    },
    {
      name: 'Stig 2 — skrifa-hamur, endurgjöf',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Nefna sameindir'],
        },
        {
          clickRole: ['button', 'Nefna sameindir'],
        },
        {
          clickRole: ['button', 'Skipta í skrifa-ham'],
        },
        {
          fill: ['input[type=text]', 'x'],
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
        {
          wait: 600,
        },
      ],
    },
    {
      name: 'Stig 2 — byggja sameind, 8 kolefni',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Nefna sameindir'],
        },
        {
          clickRole: ['button', 'Byggja sameindir'],
        },
        {
          clickRole: ['button', 'Bæta við kolefni'],
        },
        {
          clickRole: ['button', 'Bæta við kolefni'],
        },
        {
          clickRole: ['button', 'Bæta við kolefni'],
        },
        {
          clickRole: ['button', 'Bæta við kolefni'],
        },
      ],
    },
    {
      name: 'Stig 2 — byggja sameind, endurgjöf',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Nefna sameindir'],
        },
        {
          clickRole: ['button', 'Byggja sameindir'],
        },
        {
          clickRole: ['button', 'Sýna vísbendingu'],
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
        {
          wait: 600,
        },
      ],
    },
    {
      name: 'Stig 3 — hóptengi, karboxýlsýra',
      steps: [
        {
          clickRole: ['button', 'Stig 3: Hagnýtar sameindir'],
        },
        {
          clickRole: ['button', 'Næsta →'],
        },
        {
          clickRole: ['button', 'Næsta →'],
        },
        {
          clickRole: ['button', 'Næsta →'],
        },
      ],
    },
    {
      name: 'Stig 3 — áskorun',
      steps: [
        {
          clickRole: ['button', 'Stig 3: Hagnýtar sameindir'],
        },
        {
          clickRole: ['button', 'Næsta →'],
        },
        {
          clickRole: ['button', 'Næsta →'],
        },
        {
          clickRole: ['button', 'Næsta →'],
        },
        {
          clickRole: ['button', 'Byrja áskoranir'],
        },
      ],
    },
    {
      name: 'Stig 3 — endurgjöf',
      steps: [
        {
          clickRole: ['button', 'Stig 3: Hagnýtar sameindir'],
        },
        {
          clickRole: ['button', 'Næsta →'],
        },
        {
          clickRole: ['button', 'Næsta →'],
        },
        {
          clickRole: ['button', 'Næsta →'],
        },
        {
          clickRole: ['button', 'Byrja áskoranir'],
        },
        {
          css: 'button.border-purple-300',
        },
        {
          wait: 600,
        },
      ],
    },
  ],
  '2-ar/redox-reactions': [
    {
      name: 'Valmynd',
      steps: [
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 1 — regla',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Oxunartölur'],
        },
      ],
    },
    {
      name: 'Stig 1 — spurning',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Oxunartölur'],
        },
        {
          clickRole: ['button', 'Næsta'],
        },
        {
          clickRole: ['button', 'Næsta'],
        },
        {
          clickRole: ['button', 'Næsta'],
        },
        {
          clickRole: ['button', 'Næsta'],
        },
        {
          clickRole: ['button', 'Næsta'],
        },
        {
          clickRole: ['button', 'Byrja æfingar'],
        },
      ],
    },
    {
      name: 'Stig 1 — endurgjöf (rangt svar)',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Oxunartölur'],
        },
        {
          clickRole: ['button', 'Næsta'],
        },
        {
          clickRole: ['button', 'Næsta'],
        },
        {
          clickRole: ['button', 'Næsta'],
        },
        {
          clickRole: ['button', 'Næsta'],
        },
        {
          clickRole: ['button', 'Næsta'],
        },
        {
          clickRole: ['button', 'Byrja æfingar'],
        },
        {
          fill: ['input[type="number"]', '99'],
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
      ],
    },
    {
      name: 'Stig 2 — kennsla',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Greina hvörf'],
        },
      ],
    },
    {
      name: 'Stig 2 — endurgjöf',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Greina hvörf'],
        },
        {
          clickRole: ['button', 'Byrja æfingar'],
        },
        {
          css: 'button.border-green-300',
        },
      ],
    },
    {
      name: 'Stig 2 — hálfhvarf stillt',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Greina hvörf'],
        },
        {
          clickRole: ['button', 'Byrja æfingar'],
        },
        {
          clickRole: ['button', 'MnO₄⁻ → Mn²⁺'],
        },
        {
          clickRole: ['button', 'Næsta skref'],
        },
        {
          clickRole: ['button', 'Næsta skref'],
        },
        {
          clickRole: ['button', 'Næsta skref'],
        },
        {
          clickRole: ['button', 'Næsta skref'],
        },
        {
          clickRole: ['button', 'Næsta skref'],
        },
      ],
    },
    {
      name: 'Stig 2 — galvaníhlað í gangi',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Greina hvörf'],
        },
        {
          clickRole: ['button', 'Byrja æfingar'],
        },
        {
          clickRole: ['button', 'Mg-Cu'],
        },
        {
          clickRole: ['button', 'Keyra'],
        },
        {
          wait: 1000,
        },
      ],
    },
    {
      name: 'Stig 3 — kennsla',
      steps: [
        {
          clickRole: ['button', 'Stig 3: Stilla hvörf'],
        },
      ],
    },
    {
      name: 'Stig 3 — endurgjöf (rangt svar)',
      steps: [
        {
          clickRole: ['button', 'Stig 3: Stilla hvörf'],
        },
        {
          clickRole: ['button', 'Byrja æfingar'],
        },
        {
          fill: ['#oxidized-input', 'Xx'],
        },
        {
          fill: ['#reduced-input', 'Yy'],
        },
        {
          clickRole: ['button', 'Staðfesta'],
        },
      ],
    },
    {
      name: 'Stig 3 — skref 4 (margfaldarar)',
      steps: [
        {
          clickRole: ['button', 'Stig 3: Stilla hvörf'],
        },
        {
          clickRole: ['button', 'Byrja æfingar'],
        },
        {
          fill: ['#oxidized-input', 'Xx'],
        },
        {
          fill: ['#reduced-input', 'Yy'],
        },
        {
          clickRole: ['button', 'Staðfesta'],
        },
        {
          clickRole: ['button', 'Næsta'],
        },
        {
          fill: ['input[type="number"]', '9'],
        },
        {
          clickRole: ['button', 'Staðfesta'],
        },
        {
          clickRole: ['button', 'Næsta'],
        },
        {
          fill: ['input[type="number"]', '9'],
        },
        {
          clickRole: ['button', 'Staðfesta'],
        },
        {
          clickRole: ['button', 'Næsta'],
        },
      ],
    },
  ],
  '2-ar/rafeindabygging': [
    {
      name: 'Valmynd',
      steps: [
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 1 — kennsla',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Skammtatölur'],
        },
      ],
    },
    {
      name: 'Stig 1 — kennsla 3/3',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Skammtatölur'],
        },
        {
          clickRole: ['button', 'Sjáum dæmi'],
        },
        {
          clickRole: ['button', 'Eitt dæmi til'],
        },
      ],
    },
    {
      name: 'Stig 1 — endurgjöf',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Skammtatölur'],
        },
        {
          clickRole: ['button', 'Sjáum dæmi'],
        },
        {
          clickRole: ['button', 'Eitt dæmi til'],
        },
        {
          clickRole: ['button', 'byrja æfingar'],
        },
        {
          css: 'button.quantum-card',
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
        {
          wait: 600,
        },
      ],
    },
    {
      name: 'Stig 1 — spurning 2',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Skammtatölur'],
        },
        {
          clickRole: ['button', 'Sjáum dæmi'],
        },
        {
          clickRole: ['button', 'Eitt dæmi til'],
        },
        {
          clickRole: ['button', 'byrja æfingar'],
        },
        {
          css: 'button.quantum-card',
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
        {
          clickRole: ['button', 'Næsta spurning'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 2 — kennsla',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Rafeindasmíð'],
        },
      ],
    },
    {
      name: 'Stig 2 — endurgjöf og svigrúmamynd',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Rafeindasmíð'],
        },
        {
          clickRole: ['button', 'Byrja æfingar'],
        },
        {
          fill: ['input.config-input', '1s2'],
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
        {
          wait: 600,
        },
      ],
    },
    {
      name: 'Stig 3 — kennsla',
      steps: [
        {
          clickRole: ['button', 'Stig 3: Lotukerfi og rafeindir'],
        },
      ],
    },
    {
      name: 'Stig 3 — endurgjöf',
      steps: [
        {
          clickRole: ['button', 'Stig 3: Lotukerfi og rafeindir'],
        },
        {
          clickRole: ['button', 'Byrja æfingar'],
        },
        {
          css: 'button.mc-option',
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
        {
          wait: 600,
        },
      ],
    },
    {
      name: 'Stig 3 — undantekning (Cr) endurgjöf',
      steps: [
        {
          clickRole: ['button', 'Stig 3: Lotukerfi og rafeindir'],
        },
        {
          clickRole: ['button', 'Byrja æfingar'],
        },
        {
          css: 'button.mc-option',
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
        {
          clickRole: ['button', 'Næsta frumefni'],
        },
        {
          css: 'button.mc-option',
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
        {
          clickRole: ['button', 'Næsta frumefni'],
        },
        {
          css: 'button.mc-option',
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
        {
          wait: 600,
        },
      ],
    },
  ],
  '3-ar/ph-titration': [
    {
      name: 'Valmynd',
      steps: [
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 1 — kynning',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Skilningur'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Stig 1 — spurning og vísbending',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Skilningur'],
        },
        {
          wait: 400,
        },
        {
          clickRole: ['button', 'Byrja æfingu'],
        },
        {
          wait: 400,
        },
        {
          clickRole: ['button', 'Vísbending 1/4'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Stig 1 — endurgjöf',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Skilningur'],
        },
        {
          wait: 400,
        },
        {
          clickRole: ['button', 'Byrja æfingu'],
        },
        {
          wait: 400,
        },
        {
          css: 'div.space-y-3 > button',
        },
        {
          clickRole: ['button', 'Staðfesta'],
        },
        {
          wait: 500,
        },
      ],
    },
    {
      name: 'Stig 2 — títrun',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Framkvæmd'],
        },
        {
          wait: 400,
        },
        {
          clickRole: ['button', 'Bæta við 5 mL títrant'],
        },
        {
          clickRole: ['button', 'Sýna vísbendingu'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Stig 2 — merkja jafngildispunkt',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Framkvæmd'],
        },
        {
          wait: 400,
        },
        {
          clickRole: ['button', 'Bæta við 5 mL títrant'],
        },
        {
          clickRole: ['button', 'Bæta við 5 mL títrant'],
        },
        {
          clickRole: ['button', 'Bæta við 5 mL títrant'],
        },
        {
          clickRole: ['button', 'Bæta við 5 mL títrant'],
        },
        {
          clickRole: ['button', 'Bæta við 5 mL títrant'],
        },
        {
          clickRole: ['button', 'merkja jafngildispunkt'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Stig 2 — velja vísi',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Framkvæmd'],
        },
        {
          wait: 400,
        },
        {
          clickRole: ['button', 'Bæta við 5 mL títrant'],
        },
        {
          clickRole: ['button', 'Bæta við 5 mL títrant'],
        },
        {
          clickRole: ['button', 'Bæta við 5 mL títrant'],
        },
        {
          clickRole: ['button', 'Bæta við 5 mL títrant'],
        },
        {
          clickRole: ['button', 'Bæta við 5 mL títrant'],
        },
        {
          clickRole: ['button', 'merkja jafngildispunkt'],
        },
        {
          wait: 400,
        },
        {
          clickRole: ['button', 'Staðfesta:'],
        },
        {
          clickRole: ['button', 'Brómþýmólblátt'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Stig 2 — niðurstaða',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Framkvæmd'],
        },
        {
          wait: 400,
        },
        {
          clickRole: ['button', 'Bæta við 5 mL títrant'],
        },
        {
          clickRole: ['button', 'Bæta við 5 mL títrant'],
        },
        {
          clickRole: ['button', 'Bæta við 5 mL títrant'],
        },
        {
          clickRole: ['button', 'Bæta við 5 mL títrant'],
        },
        {
          clickRole: ['button', 'Bæta við 5 mL títrant'],
        },
        {
          clickRole: ['button', 'merkja jafngildispunkt'],
        },
        {
          clickRole: ['button', 'Staðfesta:'],
        },
        {
          clickRole: ['button', 'Brómþýmólblátt'],
        },
        {
          clickRole: ['button', 'Staðfesta val'],
        },
        {
          wait: 500,
        },
      ],
    },
    {
      name: 'Stig 3 — spurning',
      steps: [
        {
          clickRole: ['button', 'Stig 3: Útreikningar'],
        },
        {
          wait: 400,
        },
        {
          clickRole: ['button', 'Sýna vísbendingu'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Stig 3 — endurgjöf og útreikningur',
      steps: [
        {
          clickRole: ['button', 'Stig 3: Útreikningar'],
        },
        {
          wait: 400,
        },
        {
          fill: ['#ph-titration-l3-answer', '999'],
        },
        {
          clickRole: ['button', 'Staðfesta svar'],
        },
        {
          wait: 400,
        },
        {
          clickRole: ['button', 'Sýna útreikningsgang'],
        },
        {
          wait: 400,
        },
      ],
    },
  ],
  '3-ar/gas-law-challenge': [
    {
      name: 'Valmynd',
      steps: [
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 1 — vísbendingar og lausn',
      steps: [
        {
          clickRole: ['button', 'Byrja að Æfa'],
        },
        {
          wait: 400,
        },
        {
          clickRole: ['button', 'Vísbending (H)'],
        },
        {
          clickRole: ['button', 'Vísbending (H)'],
        },
        {
          clickRole: ['button', 'Sýna lausn'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Stig 1 — villuboð um ógilt svar',
      steps: [
        {
          clickRole: ['button', 'Byrja að Æfa'],
        },
        {
          wait: 400,
        },
        {
          fill: ['#gas-law-answer', 'abc'],
        },
        {
          clickRole: ['button', 'Athuga Svar'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Endurgjöf — rangt svar',
      steps: [
        {
          clickRole: ['button', 'Byrja að Æfa'],
        },
        {
          wait: 400,
        },
        {
          fill: ['#gas-law-answer', '999999'],
        },
        {
          clickRole: ['button', 'Athuga Svar'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Valmynd með árangri',
      steps: [
        {
          clickRole: ['button', 'Byrja að Æfa'],
        },
        {
          wait: 400,
        },
        {
          fill: ['#gas-law-answer', '999999'],
        },
        {
          clickRole: ['button', 'Athuga Svar'],
        },
        {
          wait: 400,
        },
        {
          clickRole: ['button', 'Valmynd'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Stig 2 — skref 1: hvaða lögmál á við',
      steps: [
        {
          clickRole: ['button', 'Stig 2 — Sérstök tilvik'],
        },
        {
          clickRole: ['button', 'Byrja að Æfa'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Stig 2 — rangt lögmál valið',
      steps: [
        {
          clickRole: ['button', 'Stig 2 — Sérstök tilvik'],
        },
        {
          clickRole: ['button', 'Byrja að Æfa'],
        },
        {
          wait: 400,
        },
        {
          clickRole: ['button', 'Kjörgaslögmálið'],
        },
        {
          clickRole: ['button', 'Athuga lögmál'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Stig 3 — lausnarskref með vísbendingum og lausn',
      steps: [
        {
          clickRole: ['button', 'Stig 3 — Samanburður'],
        },
        {
          clickRole: ['button', 'Byrja að Æfa'],
        },
        {
          wait: 400,
        },
        {
          clickRole: ['button', 'Sleppa'],
        },
        {
          wait: 400,
        },
        {
          clickRole: ['button', 'Vísbending (H)'],
        },
        {
          clickRole: ['button', 'Vísbending (H)'],
        },
        {
          clickRole: ['button', 'Sýna lausn'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Keppnishamur — spurning',
      steps: [
        {
          clickRole: ['button', 'Byrja Keppni'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Keppnishamur — endurgjöf',
      steps: [
        {
          clickRole: ['button', 'Byrja Keppni'],
        },
        {
          wait: 400,
        },
        {
          fill: ['#gas-law-answer', '999999'],
        },
        {
          clickRole: ['button', 'Athuga Svar'],
        },
        {
          wait: 400,
        },
      ],
    },
  ],
  '3-ar/jafnvaegisfasti': [
    {
      name: 'Valmynd',
      steps: [
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Kanna — allar fjórar blöndur',
      steps: [
        {
          clickRole: ['button', 'Kanna'],
        },
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Bara myndefni'],
        },
        {
          clickRole: ['button', 'Mikið af myndefnum'],
        },
        {
          clickRole: ['button', 'Tífalt þynnra'],
        },
        {
          clickRole: ['button', 'Bara hvarfefni'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Valmynd — Kanna lokið',
      steps: [
        {
          clickRole: ['button', 'Kanna'],
        },
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Bara myndefni'],
        },
        {
          clickRole: ['button', 'Mikið af myndefnum'],
        },
        {
          clickRole: ['button', 'Tífalt þynnra'],
        },
        {
          clickRole: ['button', 'Bara hvarfefni'],
        },
        {
          clickRole: ['button', 'Áfram'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Skilja — skref 5',
      steps: [
        {
          clickRole: ['button', 'Skilja'],
        },
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Næsta'],
        },
        {
          clickRole: ['button', 'Næsta'],
        },
        {
          clickRole: ['button', 'Næsta'],
        },
        {
          clickRole: ['button', 'Næsta'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Æfa — Skrifa stæðuna, endurgjöf',
      steps: [
        {
          clickRole: ['button', 'Æfa'],
        },
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Athuga'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Æfa — Spá fyrir um stefnu, endurgjöf',
      steps: [
        {
          clickRole: ['button', 'Æfa'],
        },
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Spá fyrir um stefnu'],
        },
        {
          clickRole: ['button', 'Þegar í jafnvægi'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Æfa — Kc yfir í Kp, endurgjöf',
      steps: [
        {
          clickRole: ['button', 'Æfa'],
        },
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Kc yfir í Kp'],
        },
        {
          fill: ['input[aria-label="Tala"]', '9,9'],
        },
        {
          fill: ['input[aria-label="Veldisvísir"]', '9'],
        },
        {
          clickRole: ['button', 'Athuga'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Æfa — Tengd jafnvægi, röng jafna',
      steps: [
        {
          clickRole: ['button', 'Æfa'],
        },
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Tengd jafnvægi'],
        },
        {
          clickRole: ['button', 'Athuga jöfnuna'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Æfa — Tengd jafnvægi, fastinn rangur',
      steps: [
        {
          clickRole: ['button', 'Æfa'],
        },
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Tengd jafnvægi'],
        },
        {
          clickRole: ['button', 'Snúa við'],
        },
        {
          clickRole: ['button', 'Athuga jöfnuna'],
        },
        {
          fill: ['input[aria-label="Tala"]', '9,9'],
        },
        {
          fill: ['input[aria-label="Veldisvísir"]', '9'],
        },
        {
          clickRole: ['button', 'Athuga'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Beita — ICE-tafla, x',
      steps: [
        {
          clickRole: ['button', 'Beita'],
        },
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Áfram — myndefnin aukast'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Beita — rangt x, endurgjöf',
      steps: [
        {
          clickRole: ['button', 'Beita'],
        },
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Áfram — myndefnin aukast'],
        },
        {
          fill: ['input[aria-label="Tala"]', '9,9'],
        },
        {
          fill: ['input[aria-label="Veldisvísir"]', '9'],
        },
        {
          clickRole: ['button', 'Athuga'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Beita — 5 % reglan, niðurstaða',
      steps: [
        {
          clickRole: ['button', 'Beita'],
        },
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Áfram — myndefnin aukast'],
        },
        {
          clickRole: ['button', 'Athuga'],
        },
        {
          clickRole: ['button', 'Sýna svarið og halda áfram'],
        },
        {
          clickRole: ['button', 'Nei — það verður að leysa'],
        },
        {
          wait: 400,
        },
      ],
    },
  ],
  '3-ar/equilibrium-shifter': [
    {
      name: 'Valmynd',
      steps: [
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Lærdómshamur — veldu álag',
      steps: [
        {
          clickRole: ['button', 'Lærdómshamur'],
        },
        {
          wait: 600,
        },
      ],
    },
    {
      name: 'Lærdómshamur — álag valið, spá',
      steps: [
        {
          clickRole: ['button', 'Lærdómshamur'],
        },
        {
          wait: 600,
        },
        {
          css: '.stress-btn',
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Lærdómshamur — allar vísbendingar opnar',
      steps: [
        {
          clickRole: ['button', 'Lærdómshamur'],
        },
        {
          wait: 600,
        },
        {
          css: '.stress-btn',
        },
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Vísbending'],
        },
        {
          clickRole: ['button', 'Vísbending'],
        },
        {
          clickRole: ['button', 'Vísbending'],
        },
        {
          clickRole: ['button', 'Vísbending'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Lærdómshamur — endurgjöf (Q/K og tölur)',
      steps: [
        {
          clickRole: ['button', 'Lærdómshamur'],
        },
        {
          wait: 600,
        },
        {
          css: '.stress-btn',
        },
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Engin hliðrun'],
        },
        {
          wait: 800,
        },
      ],
    },
    {
      name: 'Lærdómshamur — Prófa annað álag',
      steps: [
        {
          clickRole: ['button', 'Lærdómshamur'],
        },
        {
          wait: 600,
        },
        {
          css: '.stress-btn',
        },
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Engin hliðrun'],
        },
        {
          wait: 800,
        },
        {
          clickRole: ['button', 'Prófa annað álag'],
        },
        {
          wait: 500,
        },
      ],
    },
    {
      name: 'Lærdómshamur — næsta jafnvægi',
      steps: [
        {
          clickRole: ['button', 'Lærdómshamur'],
        },
        {
          wait: 600,
        },
        {
          css: '.stress-btn',
        },
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Til vinstri'],
        },
        {
          wait: 800,
        },
        {
          clickRole: ['button', 'Næsta jafnvægi'],
        },
        {
          wait: 600,
        },
      ],
    },
    {
      name: 'Há birtuskil — endurgjöf',
      steps: [
        {
          css: 'input[type=checkbox]',
        },
        {
          wait: 200,
        },
        {
          clickRole: ['button', 'Lærdómshamur'],
        },
        {
          wait: 600,
        },
        {
          css: '.stress-btn',
        },
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Til hægri'],
        },
        {
          wait: 800,
        },
      ],
    },
    {
      name: 'Til baka í valmynd',
      steps: [
        {
          clickRole: ['button', 'Lærdómshamur'],
        },
        {
          wait: 600,
        },
        {
          clickRole: ['button', 'Til baka'],
        },
        {
          wait: 600,
        },
      ],
    },
  ],
  '3-ar/syrufastinn': [
    {
      name: 'Valmynd',
      steps: [
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Kanna — útskýring',
      steps: [
        {
          clickRole: ['button', 'Kanna'],
        },
        {
          css: 'main button.game-btn:not([disabled])',
        },
        {
          css: 'main button.game-btn:not([disabled])',
        },
        {
          css: 'main button.game-btn:not([disabled])',
        },
        {
          click: 'Hann helst sá sami',
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Skilja — ICE-taflan',
      steps: [
        {
          clickRole: ['button', 'Skilja'],
        },
        {
          clickRole: ['button', '2. ICE-taflan'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Skilja — 5 % reglan',
      steps: [
        {
          clickRole: ['button', 'Skilja'],
        },
        {
          clickRole: ['button', '5. 5 % reglan'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Æfa — skref 1 með vísbendingum',
      steps: [
        {
          clickRole: ['button', 'Æfa'],
        },
        {
          click: 'Vísbending 1 af 3',
        },
        {
          click: 'Vísbending 2 af 3',
        },
        {
          click: 'Vísbending 3 af 3',
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Æfa — skref 1, rangt svar',
      steps: [
        {
          clickRole: ['button', 'Æfa'],
        },
        {
          fill: ['#answer', '5'],
        },
        {
          click: 'Athuga',
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Æfa — skref 2, 5 % athugun',
      steps: [
        {
          clickRole: ['button', 'Æfa'],
        },
        {
          fill: ['#answer', '5'],
        },
        {
          click: 'Athuga',
        },
        {
          clickRole: ['button', 'Áfram'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Æfa — skref 3, rangt pH',
      steps: [
        {
          clickRole: ['button', 'Æfa'],
        },
        {
          fill: ['#answer', '5'],
        },
        {
          click: 'Athuga',
        },
        {
          clickRole: ['button', 'Áfram'],
        },
        {
          clickRole: ['button', 'Áfram'],
        },
        {
          fill: ['#answer', '9'],
        },
        {
          click: 'Athuga',
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Beita — dæmi 1, rangt svar',
      steps: [
        {
          clickRole: ['button', 'Beita'],
        },
        {
          fill: ['#apply-answer', '0'],
        },
        {
          click: 'Svara',
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Beita — dæmi 2 (Ka), rangt svar',
      steps: [
        {
          clickRole: ['button', 'Beita'],
        },
        {
          fill: ['#apply-answer', '0'],
        },
        {
          click: 'Svara',
        },
        {
          click: 'Næsta dæmi',
        },
        {
          fill: ['#apply-answer', '0'],
        },
        {
          click: 'Svara',
        },
        {
          wait: 300,
        },
      ],
    },
  ],
  '3-ar/thermodynamics-predictor': [
    {
      name: 'Valmynd',
      steps: [
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Könnun',
      steps: [
        {
          clickRole: ['button', 'Könnun'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Könnun — hátt hitastig (ekki sjálfgengt)',
      steps: [
        {
          clickRole: ['button', 'Könnun'],
        },
        {
          wait: 400,
        },
        {
          css: '#thermo-discover-temp',
        },
        {
          press: 'End',
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Æfingarhamur — spurning',
      steps: [
        {
          clickRole: ['button', 'Æfingarhamur'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Æfingarhamur — svar slegið inn',
      steps: [
        {
          clickRole: ['button', 'Æfingarhamur'],
        },
        {
          wait: 400,
        },
        {
          fill: ['#thermo-delta-g', '99999'],
        },
        {
          clickRole: ['radio', 'Jafnvægi'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Æfingarhamur — lausn og endurgjöf',
      steps: [
        {
          clickRole: ['button', 'Æfingarhamur'],
        },
        {
          wait: 400,
        },
        {
          fill: ['#thermo-delta-g', '99999'],
        },
        {
          clickRole: ['radio', 'Jafnvægi'],
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
        {
          wait: 800,
        },
      ],
    },
    {
      name: 'Æfingarhamur — næsta spurning',
      steps: [
        {
          clickRole: ['button', 'Æfingarhamur'],
        },
        {
          wait: 400,
        },
        {
          fill: ['#thermo-delta-g', '99999'],
        },
        {
          clickRole: ['radio', 'Jafnvægi'],
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
        {
          wait: 800,
        },
        {
          clickRole: ['button', 'Næsta spurning'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Æfingarhamur — Erfitt með áskorun',
      steps: [
        {
          clickRole: ['button', 'Erfitt'],
        },
        {
          clickRole: ['button', 'Æfingarhamur'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Keppnishamur — spurning',
      steps: [
        {
          clickRole: ['button', 'Keppnishamur'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Keppnishamur — lausn og endurgjöf',
      steps: [
        {
          clickRole: ['button', 'Keppnishamur'],
        },
        {
          wait: 400,
        },
        {
          fill: ['#thermo-delta-g', '99999'],
        },
        {
          clickRole: ['radio', 'Jafnvægi'],
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
        {
          wait: 800,
        },
      ],
    },
  ],
  '3-ar/buffer-recipe-creator': [
    {
      name: 'Valmynd',
      steps: [
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 1 — rangt svar (endurgjöf)',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Hugmyndafræði'],
        },
        {
          wait: 400,
        },
        {
          clickRole: ['button', 'Bæta við sýrusameind'],
        },
        {
          clickRole: ['button', 'Athuga stuðpúða'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Stig 1 — rétt svar og samanburður við vatn',
      steps: [
        {
          clickRole: ['button', 'Stig 1: Hugmyndafræði'],
        },
        {
          wait: 400,
        },
        {
          clickRole: ['button', 'Athuga stuðpúða'],
        },
        {
          wait: 300,
        },
        {
          clickRole: ['button', 'Bæta við 0,01 M sterkri sýru'],
        },
        {
          clickRole: ['button', 'Sýna samanburð við vatn'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Stig 2 — stefna, rangt svar',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Útreikningar'],
        },
        {
          wait: 400,
        },
        {
          clickRole: ['button', 'Lægra'],
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Stig 2 — allar vísbendingar',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Útreikningar'],
        },
        {
          wait: 400,
        },
        {
          clickRole: ['button', 'Vísbending'],
        },
        {
          clickRole: ['button', 'Vísbending'],
        },
        {
          clickRole: ['button', 'Vísbending'],
        },
        {
          clickRole: ['button', 'Vísbending'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Stig 2 — massi, rangt svar',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Útreikningar'],
        },
        {
          wait: 400,
        },
        {
          clickRole: ['button', 'Hærra'],
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
        {
          fill: ['input[inputmode=decimal]', '1,585'],
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
        {
          fill: ['div:has(> label:has-text("Sýrumassi")) > input', '1'],
        },
        {
          fill: ['div:has(> label:has-text("Basamassi")) > input', '1'],
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Stig 2 — lokið, útreikningur og stuðpúðageta',
      steps: [
        {
          clickRole: ['button', 'Stig 2: Útreikningar'],
        },
        {
          wait: 400,
        },
        {
          clickRole: ['button', 'Hærra'],
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
        {
          fill: ['input[inputmode=decimal]', '1,585'],
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
        {
          fill: ['div:has(> label:has-text("Sýrumassi")) > input', '4,64'],
        },
        {
          fill: ['div:has(> label:has-text("Basamassi")) > input', '8,70'],
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
        {
          wait: 500,
        },
      ],
    },
    {
      name: 'Stig 3 — kynning',
      steps: [
        {
          clickRole: ['button', 'Stig 3: Hönnun'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Stig 3 — hlutfall, rangt svar',
      steps: [
        {
          clickRole: ['button', 'Stig 3: Hönnun'],
        },
        {
          wait: 400,
        },
        {
          clickRole: ['button', 'Byrja'],
        },
        {
          fill: ['input[inputmode=decimal]', '99'],
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
        {
          wait: 400,
        },
      ],
    },
    {
      name: 'Stig 3 — lokið, uppskrift',
      steps: [
        {
          clickRole: ['button', 'Stig 3: Hönnun'],
        },
        {
          clickRole: ['button', 'Byrja'],
        },
        {
          fill: ['input[inputmode=decimal]', '1,585'],
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
        {
          fill: ['div:has(> label:has-text("Mól sýru")) > input', '0,00387'],
        },
        {
          fill: ['div:has(> label:has-text("Mól basa")) > input', '0,00613'],
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
        {
          fill: ['div:has(> label:has-text("Rúmmál sýru")) > input', '7,76'],
        },
        {
          fill: ['div:has(> label:has-text("Rúmmál basa")) > input', '12,24'],
        },
        {
          clickRole: ['button', 'Athuga svar'],
        },
        {
          wait: 500,
        },
      ],
    },
  ],
  '3-ar/leysnijafnvaegi': [
    {
      name: 'Valmynd',
      steps: [
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Kanna — sleðinn færður',
      steps: [
        {
          clickRole: ['button', 'Kanna'],
        },
        {
          fill: ['input[type=range]', '3'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Kanna — Mn(OH)₂ í mestu samjón',
      steps: [
        {
          clickRole: ['button', 'Kanna'],
        },
        {
          clickRole: ['button', 'Mn(OH)₂'],
        },
        {
          fill: ['input[type=range]', '5'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Valmynd — Kanna lokið',
      steps: [
        {
          clickRole: ['button', 'Kanna'],
        },
        {
          fill: ['input[type=range]', '3'],
        },
        {
          clickRole: ['button', 'Áfram í Skilja'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Skilja — öll skref og samjónahrif',
      steps: [
        {
          clickRole: ['button', 'Skilja'],
        },
        {
          clickRole: ['button', 'Næsta skref'],
        },
        {
          clickRole: ['button', 'Næsta skref'],
        },
        {
          clickRole: ['button', 'Næsta skref'],
        },
        {
          css: 'summary',
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Æfa — fyrsta dæmi',
      steps: [
        {
          clickRole: ['button', 'Æfa'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Æfa — endurgjöf við röngu svari',
      steps: [
        {
          clickRole: ['button', 'Æfa'],
        },
        {
          fill: ['input[aria-label="Tala"]', '9'],
        },
        {
          fill: ['input[aria-label="Veldisvísir"]', '-1'],
        },
        {
          clickRole: ['button', 'Athuga'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Æfa — endurgjöf á 1:2 salti',
      steps: [
        {
          clickRole: ['button', 'Æfa'],
        },
        {
          fill: ['input[aria-label="Tala"]', '9'],
        },
        {
          fill: ['input[aria-label="Veldisvísir"]', '-1'],
        },
        {
          clickRole: ['button', 'Athuga'],
        },
        {
          clickRole: ['button', 'Næsta dæmi'],
        },
        {
          fill: ['input[aria-label="Tala"]', '9'],
        },
        {
          fill: ['input[aria-label="Veldisvísir"]', '-1'],
        },
        {
          clickRole: ['button', 'Athuga'],
        },
        {
          clickRole: ['button', 'Næsta dæmi'],
        },
        {
          fill: ['input[aria-label="Tala"]', '9'],
        },
        {
          fill: ['input[aria-label="Veldisvísir"]', '-1'],
        },
        {
          clickRole: ['button', 'Athuga'],
        },
        {
          clickRole: ['button', 'Næsta dæmi'],
        },
        {
          fill: ['input[aria-label="Tala"]', '9'],
        },
        {
          fill: ['input[aria-label="Veldisvísir"]', '-1'],
        },
        {
          clickRole: ['button', 'Athuga'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Beita — myndast botnfall?',
      steps: [
        {
          clickRole: ['button', 'Beita'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Beita — endurgjöf eftir spá',
      steps: [
        {
          clickRole: ['button', 'Beita'],
        },
        {
          clickRole: ['button', 'Já, Q'],
        },
        {
          wait: 300,
        },
      ],
    },
    {
      name: 'Beita — ójöfn rúmmál, endurgjöf',
      steps: [
        {
          clickRole: ['button', 'Beita'],
        },
        {
          clickRole: ['button', 'Nei, Q'],
        },
        {
          clickRole: ['button', 'Næsta dæmi'],
        },
        {
          clickRole: ['button', 'Nei, Q'],
        },
        {
          clickRole: ['button', 'Næsta dæmi'],
        },
        {
          clickRole: ['button', 'Nei, Q'],
        },
        {
          clickRole: ['button', 'Næsta dæmi'],
        },
        {
          clickRole: ['button', 'Nei, Q'],
        },
        {
          wait: 300,
        },
      ],
    },
  ],
};
