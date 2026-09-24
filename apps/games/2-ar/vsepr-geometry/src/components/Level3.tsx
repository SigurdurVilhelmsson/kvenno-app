import { useMemo, useState } from 'react';

import { shuffleArray } from '@shared/utils';

import { useScrollTopOnChange } from '../utils/phoneScroll';

interface Level3Props {
  onComplete: (score: number) => void;
  onBack: () => void;
}

interface Challenge {
  id: number;
  type: 'hybridization' | 'polarity' | 'multi_center' | 'dipole';
  formula: string;
  name: string;
  question: string;
  lewisStructure?: string;
  options: { id: string; text: string; correct: boolean; explanation: string }[];
  hint: string;
  conceptExplanation: string;
}

const challenges: Challenge[] = [
  // Hybridization questions
  {
    id: 1,
    type: 'hybridization',
    formula: 'CH₄',
    name: 'Metan',
    question: 'Hvaða blendni (hybridization) hefur kolefnið í CH₄?',
    options: [
      {
        id: 'a',
        text: 'sp',
        correct: false,
        explanation: 'sp blendni gefur línulega lögun (2 svið).',
      },
      {
        id: 'b',
        text: 'sp²',
        correct: false,
        explanation: 'sp² blendni gefur þríhyrnda sléttu (3 svið).',
      },
      {
        id: 'c',
        text: 'sp³',
        correct: true,
        explanation: 'Rétt! 4 rafeindasvið = sp³ blendni = ferflötungur.',
      },
      { id: 'd', text: 'sp³d', correct: false, explanation: 'sp³d krefst 5 rafeindasviða.' },
    ],
    hint: 'Fjöldi rafeindasviða ákvarðar blendnina: 2=sp, 3=sp², 4=sp³...',
    conceptExplanation:
      'Blendni lýsir hvernig svigrúm atómsins blandast saman. Fjöldi blandaðra svigrúma = fjöldi rafeindasviða.',
  },
  {
    id: 2,
    type: 'hybridization',
    formula: 'CO₂',
    name: 'Koldíoxíð',
    question: 'Hvaða blendni hefur kolefnið í CO₂?',
    options: [
      {
        id: 'a',
        text: 'sp',
        correct: true,
        explanation: 'Rétt! 2 rafeindasvið (2 tvöfaldar tengingar) = sp blendni = línuleg.',
      },
      { id: 'b', text: 'sp²', correct: false, explanation: 'sp² gefur þríhyrnda slétta lögun.' },
      { id: 'c', text: 'sp³', correct: false, explanation: 'sp³ gefur ferflötung.' },
      {
        id: 'd',
        text: 'Engin blendni',
        correct: false,
        explanation: 'Kolefni notar alltaf blendni í efnatengsli.',
      },
    ],
    hint: 'Tvöföld tenging telst sem EITT rafeindasvið.',
    conceptExplanation:
      'Í CO₂ hefur kolefni 2 tvöfaldar tengingar við súrefni. Hver tvöföld tenging telur sem eitt rafeindasvið, svo C hefur 2 rafeindasvið og sp blendni.',
  },
  {
    id: 3,
    type: 'hybridization',
    formula: 'NH₃',
    name: 'Ammóníak',
    question: 'Hvaða blendni hefur nitrið í NH₃?',
    options: [
      { id: 'a', text: 'sp', correct: false, explanation: 'sp hefur aðeins 2 rafeindasvið.' },
      { id: 'b', text: 'sp²', correct: false, explanation: 'sp² hefur 3 rafeindasvið.' },
      {
        id: 'c',
        text: 'sp³',
        correct: true,
        explanation: 'Rétt! 3 tengsl + 1 stakt par = 4 rafeindasvið = sp³.',
      },
      { id: 'd', text: 'sp³d', correct: false, explanation: 'sp³d krefst 5 rafeindasviða.' },
    ],
    hint: 'Mundu að telja STÖK PÖR sem rafeindasvið líka!',
    conceptExplanation:
      'NH₃ hefur 3 N-H tengsl og 1 stakt par á nitri = 4 rafeindasvið = sp³ blendni. Þó sameindarlögunin sé þríhyrnd pýramída er blendnin enn sp³.',
  },
  {
    id: 4,
    type: 'hybridization',
    formula: 'SF₆',
    name: 'Brennisteinshexaflúoríð',
    question: 'Hvaða blendni hefur brennisteinninn í SF₆?',
    options: [
      { id: 'a', text: 'sp³', correct: false, explanation: 'sp³ hefur aðeins 4 rafeindasvið.' },
      { id: 'b', text: 'sp³d', correct: false, explanation: 'sp³d hefur 5 rafeindasvið.' },
      {
        id: 'c',
        text: 'sp³d²',
        correct: true,
        explanation: 'Rétt! 6 tengsl = 6 rafeindasvið = sp³d² blendni = áttflötungur.',
      },
      {
        id: 'd',
        text: 'd²sp³',
        correct: false,
        explanation: 'Þetta er sama og sp³d², en sp³d² er algengari ritháttur.',
      },
    ],
    hint: 'S hefur 6 F tengingar = 6 rafeindasvið. Þetta krefst d-svigrúma.',
    conceptExplanation:
      'Fyrir 5+ rafeindasvið þarf að nota d-svigrúm. 5 svið = sp³d, 6 svið = sp³d². Þetta er mögulegt fyrir frumefni í 3. röð og neðar.',
  },
  // Polarity questions
  {
    id: 5,
    type: 'polarity',
    formula: 'H₂O',
    name: 'Vatn',
    question: 'Er vatn (H₂O) skautuð eða óskautuð sameind?',
    options: [
      {
        id: 'a',
        text: 'Skautuð',
        correct: true,
        explanation: 'Rétt! Beygð lögun gerir að verkum að tvískautsvægin jafnast ekki út.',
      },
      {
        id: 'b',
        text: 'Óskautuð',
        correct: false,
        explanation: 'Vatn er skautað vegna beygðu lögunarinnar.',
      },
      {
        id: 'c',
        text: 'Fer eftir hitastigi',
        correct: false,
        explanation: 'Skautun ákvarðast af efnafræðilegri byggingu, ekki hitastigi.',
      },
      {
        id: 'd',
        text: 'Fer eftir jónstyrk',
        correct: false,
        explanation: 'Jónstyrkur hefur ekki áhrif á sameindarskautun.',
      },
    ],
    hint: 'Hugsaðu um lögunina — ef O-H tvískautsvægin benda í mismunandi áttir, hvað gerist?',
    conceptExplanation:
      'Í H₂O eru tvö skautuð O-H tengisl sem benda í mismunandi áttir (104,5° horn). Tvískautsvægin jafnast ekki út → skautuð sameind.',
  },
  {
    id: 6,
    type: 'polarity',
    formula: 'CO₂',
    name: 'Koldíoxíð',
    question: 'Er CO₂ skautuð eða óskautuð sameind?',
    options: [
      {
        id: 'a',
        text: 'Skautuð',
        correct: false,
        explanation: 'Þó C=O tengslin séu skautuð, þá er sameindin ekki skautuð.',
      },
      {
        id: 'b',
        text: 'Óskautuð',
        correct: true,
        explanation: 'Rétt! Línuleg lögun (180°) — tvískautsvægin jafnast út.',
      },
      {
        id: 'c',
        text: 'Lítillega skautuð',
        correct: false,
        explanation: 'Skautun er annaðhvort til staðar eða ekki í þessu samhengi.',
      },
      {
        id: 'd',
        text: 'Fer eftir þrýstingi',
        correct: false,
        explanation: 'Þrýstingur hefur ekki áhrif á sameindarskautun.',
      },
    ],
    hint: 'Línuleg lögun — C=O tvískautsvægin vísa í gagnstæðar áttir.',
    conceptExplanation:
      'Hvert C=O tengi er skautað (O er rafneikvæðara). En í línulegri lögun (180°) vísa tvískautsvægin í GAGNSTÆÐAR áttir og hætta við hvort annað → nettó tvískautsvægi = 0.',
  },
  {
    id: 7,
    type: 'polarity',
    formula: 'BF₃',
    name: 'Bórþríflúoríð',
    question: 'Er BF₃ skautuð eða óskautuð sameind?',
    options: [
      {
        id: 'a',
        text: 'Skautuð vegna F atóma',
        correct: false,
        explanation: 'Þó B-F tengslin séu skautuð, er sameindin samhverf.',
      },
      {
        id: 'b',
        text: 'Óskautuð vegna samhverfu',
        correct: true,
        explanation: 'Rétt! Þríhyrnd slétt lögun er samhverf — tvískautsvægin jafnast út.',
      },
      {
        id: 'c',
        text: 'Skautuð vegna bórs',
        correct: false,
        explanation: 'Bór er ekki mjög rafneikvætt miðað við flúor.',
      },
      {
        id: 'd',
        text: 'Misjafnlega skautuð',
        correct: false,
        explanation: 'Sameind er annaðhvort skautuð eða ekki.',
      },
    ],
    hint: 'Þríhyrnd slétt lögun (120°) — þrjú eins tengisl.',
    conceptExplanation:
      'BF₃ er þríhyrnd slétt (120° milli allra tengja). Þrjú jafn skautuð B-F tengisl draga í þrjár jafnar áttir → kraftarnir jafnast út → óskautuð sameind.',
  },
  {
    id: 8,
    type: 'polarity',
    formula: 'CHCl₃',
    name: 'Klóróform',
    question: 'Er CHCl₃ (klóróform) skautuð eða óskautuð sameind?',
    options: [
      {
        id: 'a',
        text: 'Óskautuð vegna ferflötungs',
        correct: false,
        explanation: 'Ferflötungur er samhverfur, en CHCl₃ hefur mismunandi atóm.',
      },
      {
        id: 'b',
        text: 'Skautuð vegna ósamhverfu',
        correct: true,
        explanation: 'Rétt! C-H og C-Cl hafa mismunandi skautun — ósamhverf dreifing.',
      },
      {
        id: 'c',
        text: 'Aðeins H er skautað',
        correct: false,
        explanation: 'Bæði C-H og C-Cl tengisl eru skautuð.',
      },
      {
        id: 'd',
        text: 'Fer eftir leysi',
        correct: false,
        explanation: 'Skautun ákvarðast af byggingu sameindarinnar.',
      },
    ],
    hint: 'Berðu saman CH₄ (óskautuð) við CHCl₃ — hvað er breytt?',
    conceptExplanation:
      'Í CH₄ eru öll 4 tengslin eins → samhverf → óskautuð. Í CHCl₃ eru 1 H og 3 Cl — ósamhverf → skautuð. C-Cl tengsl draga miklu meira en C-H.',
  },
  // Multi-center molecules
  {
    id: 9,
    type: 'multi_center',
    formula: 'C₂H₄',
    name: 'Eten (etýlen)',
    lewisStructure: 'H₂C = CH₂',
    question: 'Hvaða blendni hafa BÆÐI kolefnin í C₂H₄ (eten)?',
    options: [
      {
        id: 'a',
        text: 'sp',
        correct: false,
        explanation: 'sp gefur línulega lögun, en C₂H₄ er slétt.',
      },
      {
        id: 'b',
        text: 'sp²',
        correct: true,
        explanation: 'Rétt! Hvert C hefur 3 rafeindasvið (2 C-H + 1 C=C) = sp² blendni.',
      },
      {
        id: 'c',
        text: 'sp³',
        correct: false,
        explanation: 'sp³ krefst 4 rafeindasviða, en hvert C hefur aðeins 3.',
      },
      {
        id: 'd',
        text: 'Mismunandi blendni',
        correct: false,
        explanation: 'Bæði kolefnin eru í nákvæmlega sömu stöðu.',
      },
    ],
    hint: 'Tvöföld C=C tenging telur sem EITT rafeindasvið. Teldu svið í kringum hvort C.',
    conceptExplanation:
      'Í C₂H₄ hefur hvert C: 2 tengsl við H + 1 tengsl við hitt C (tvöfalt tengi). = 3 rafeindasvið = sp² blendni. Öll atóm liggja í einni sléttu.',
  },
  {
    id: 10,
    type: 'multi_center',
    formula: 'C₂H₂',
    name: 'Etín (asetýlen)',
    lewisStructure: 'H-C≡C-H',
    question: 'Hvaða blendni hafa kolefnin í C₂H₂ (etín)?',
    options: [
      {
        id: 'a',
        text: 'sp',
        correct: true,
        explanation: 'Rétt! Hvert C hefur 2 rafeindasvið (1 C-H + 1 C≡C) = sp blendni = línuleg.',
      },
      { id: 'b', text: 'sp²', correct: false, explanation: 'sp² krefst 3 rafeindasviða.' },
      { id: 'c', text: 'sp³', correct: false, explanation: 'sp³ krefst 4 rafeindasviða.' },
      {
        id: 'd',
        text: 'Engin blendni',
        correct: false,
        explanation: 'Kolefni notar alltaf blendni í sameindum.',
      },
    ],
    hint: 'Þreföld tenging telur einnig sem EITT rafeindasvið.',
    conceptExplanation:
      'Í C₂H₂ er þreföld tenging milli kolefnanna. Hvert C hefur aðeins 2 rafeindasvið (C-H + C≡C) = sp blendni. Sameindin er línuleg (180°).',
  },
  // Dipole moment questions
  {
    id: 11,
    type: 'dipole',
    formula: 'CCl₄',
    name: 'Kolefnistetraklóríð',
    question:
      'CCl₄ hefur fjögur C-Cl tengisl sem eru öll skautuð. Af hverju er CCl₄ þá ÓSKAUTUÐ sameind?',
    options: [
      {
        id: 'a',
        text: 'C-Cl tengisl eru í raun óskautuð',
        correct: false,
        explanation: 'C-Cl tengisl ERU skautuð (Cl er rafneikvæðara).',
      },
      {
        id: 'b',
        text: 'Ferflötungslögun er samhverf — tvískautsvægi jafnast út',
        correct: true,
        explanation:
          'Rétt! Fjögur jafn skautuð tengisl í ferflötungi draga í jafnar áttir → nettó tvískautsvægi = 0.',
      },
      {
        id: 'c',
        text: 'Klór er ekki nægilega rafneikvætt',
        correct: false,
        explanation: 'Klór er mjög rafneikvætt.',
      },
      {
        id: 'd',
        text: 'Kolefni er óleiðandi',
        correct: false,
        explanation: 'Leiðni hefur ekkert með skautun að gera.',
      },
    ],
    hint: 'Hugsaðu um ferflötunginn — ef þú dregur í allar 4 áttir jafnt...',
    conceptExplanation:
      'Þetta er klassískt dæmi um SAMHVERFU. Þó hvert C-Cl tengi sé skautað, þá eru þau SAMHVERF dreifð í rúminu (ferflötungur). Kraftarnir jafnast út → ekkert nettó tvískautsvægi.',
  },
  {
    id: 12,
    type: 'dipole',
    formula: 'NF₃ vs. NH₃',
    name: 'Samanburður',
    question: 'Bæði NF₃ og NH₃ hafa þríhyrnda pýramídalögun. Hvor er MEIRA skautuð?',
    options: [
      {
        id: 'a',
        text: 'NF₃ er meira skautuð vegna F',
        correct: false,
        explanation: 'F er rafneikvæðara, en það er ekki allt...',
      },
      {
        id: 'b',
        text: 'NH₃ er meira skautuð',
        correct: true,
        explanation:
          'Rétt! Í NH₃ benda staka parið og N-H tvískautsvægin í SÖMU átt. Í NF₃ benda þau í GAGNSTÆÐAR áttir.',
      },
      {
        id: 'c',
        text: 'Þær eru jafn skautaðar',
        correct: false,
        explanation: 'Stefna tvískautsvægis skiptir máli.',
      },
      {
        id: 'd',
        text: 'Hvorug er skautuð',
        correct: false,
        explanation: 'Báðar eru skautaðar, en misjafnlega.',
      },
    ],
    hint: 'Hugsaðu um staka parið á N — hvert bendir það? Og hvert benda tengslin?',
    conceptExplanation:
      'Í NH₃: N-H tengisl benda FRÁ N (H er δ+) og staka parið bendir einnig upp → allir kraftar benda í SÖMU ÁTTINA → stórt tvískautsvægi. Í NF₃: N-F tengisl benda MÓTI N (F er δ-) en staka parið bendir í GAGNSTÆÐA ÁTT → kraftar hætta við → minna tvískautsvægi.',
  },
];

// The polarity card's worked examples. Three of the four are molecules the
// polarity questions ask about, so the one on screen is held back until the
// question is answered — otherwise the card below it gives the answer.
const POLARITY_EXAMPLES: { formula: string; text: string }[] = [
  { formula: 'CO₂', text: 'CO₂ (línuleg) → óskautuð' },
  { formula: 'H₂O', text: 'H₂O (beygð) → skautuð' },
  { formula: 'CCl₄', text: 'CCl₄ (ferflötungur) → óskautuð' },
  { formula: 'CHCl₃', text: 'CHCl₃ (ferflötungur) → skautuð' },
];

const HYBRIDIZATION_CONFIGS: Record<
  number,
  { label: string; orbitals: string; angle: string; shape: string }
> = {
  2: { label: 'sp', orbitals: '1s + 1p', angle: '180°', shape: 'Línuleg' },
  3: { label: 'sp²', orbitals: '1s + 2p', angle: '120°', shape: 'Þríhyrnd' },
  4: { label: 'sp³', orbitals: '1s + 3p', angle: '109,5°', shape: 'Ferflötungur' },
  5: { label: 'sp³d', orbitals: '1s + 3p + 1d', angle: '90°/120°', shape: 'Tvípýramída' },
  6: { label: 'sp³d²', orbitals: '1s + 3p + 2d', angle: '90°', shape: 'Áttflötungur' },
};

// Orbital glyphs fed into the mixing, in the order the wide diagram draws them
function inputOrbitals(domains: number): { kind: 's' | 'p' | 'd'; rotate: number }[] {
  const glyphs: { kind: 's' | 'p' | 'd'; rotate: number }[] = [{ kind: 's', rotate: 0 }];
  const pRotations = [0, 90, 45];
  for (let i = 0; i < Math.min(domains - 1, 3); i++)
    glyphs.push({ kind: 'p', rotate: pRotations[i] });
  const dRotations = [0, 90];
  for (let i = 0; i < Math.max(domains - 4, 0); i++)
    glyphs.push({ kind: 'd', rotate: dRotations[i] });
  return glyphs;
}

// The same diagram laid out top to bottom for phones: the wide one shrinks to
// ~250 px there and its labels fall to 5-9 px.
function HybridizationDiagramStacked({ domains }: { domains: number }) {
  const c = HYBRIDIZATION_CONFIGS[domains];
  if (!c) return null;
  const glyphs = inputOrbitals(domains);
  const cx = 110;
  const cy = 150;
  const lobeDist = 34;
  const lobeAngles = Array.from({ length: domains }, (_, i) => (i / domains) * 360 - 90);

  return (
    <svg viewBox="0 0 220 244" className="sm:hidden w-full max-w-[320px] mx-auto">
      <text x={cx} y="18" textAnchor="middle" fontSize="12">
        <tspan fill="#7c3aed" fontWeight="bold">
          Svigrúm:
        </tspan>
        <tspan fill="#6b7280"> {c.orbitals}</tspan>
      </text>
      {glyphs.map((g, i) => {
        const x = cx + (i - (glyphs.length - 1) / 2) * 30;
        const isD = g.kind === 'd';
        return (
          <g key={i} transform={`translate(${x},52)`}>
            {g.kind === 's' ? (
              <circle r="12" fill="#c4b5fd" stroke="#7c3aed" strokeWidth="1.5" />
            ) : (
              <ellipse
                rx={isD ? 7 : 8}
                ry={isD ? 14 : 15}
                fill={isD ? '#fbbf24' : '#a78bfa'}
                stroke={isD ? '#d97706' : '#7c3aed'}
                strokeWidth="1"
                transform={`rotate(${g.rotate})`}
              />
            )}
            <text
              y="4"
              textAnchor="middle"
              fill={isD ? '#92400e' : '#7c3aed'}
              fontSize="11"
              fontWeight="bold"
            >
              {g.kind}
            </text>
          </g>
        );
      })}
      <text x={cx} y="86" textAnchor="middle" fill="#374151" fontSize="16">
        ↓
      </text>
      <text x={cx} y="98" textAnchor="middle" fill="#7c3aed" fontSize="12" fontWeight="bold">
        {domains}× {c.label}
      </text>
      <circle cx={cx} cy={cy} r="4" fill="#7c3aed" />
      {lobeAngles.map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const ex = cx + Math.cos(rad) * lobeDist;
        const ey = cy + Math.sin(rad) * lobeDist;
        return (
          <g key={i}>
            <line x1={cx} y1={cy} x2={ex} y2={ey} stroke="#8b5cf6" strokeWidth="2" />
            <ellipse
              cx={ex}
              cy={ey}
              rx="10"
              ry="6"
              fill="#c4b5fd"
              stroke="#7c3aed"
              strokeWidth="1"
              transform={`rotate(${deg},${ex},${ey})`}
            />
          </g>
        );
      })}
      <text x={cx} y="216" textAnchor="middle" fill="#059669" fontSize="13" fontWeight="bold">
        {c.shape}
      </text>
      <text x={cx} y="234" textAnchor="middle" fill="#6b7280" fontSize="12">
        {c.angle}
      </text>
    </svg>
  );
}

// Simple SVG hybridization diagram showing orbital mixing
function HybridizationDiagram({ domains }: { domains: number }) {
  const c = HYBRIDIZATION_CONFIGS[domains];
  if (!c) return null;

  // Orbital lobe angles for the result
  const lobeAngles = Array.from({ length: domains }, (_, i) => (i / domains) * 360 - 90);
  const lobeDist = 32;
  const cx = 140,
    cy = 55;

  return (
    <div className="bg-purple-50 rounded-xl p-3 sm:p-4 border border-purple-200">
      <div className="text-sm font-bold text-purple-800 mb-3">Blendni: {c.label}</div>
      <HybridizationDiagramStacked domains={domains} />
      {/* The wide layout, from sm up. Its right-hand shape label is wider than
          the viewBox for the longer names, so it is allowed to spill into the
          box's padding instead of being cut off. */}
      <svg
        viewBox="0 0 280 110"
        className="hidden sm:block w-full max-w-[360px] mx-auto"
        style={{ overflow: 'visible' }}
      >
        {/* Input orbitals */}
        <text x="10" y="20" fill="#7c3aed" fontSize="11" fontWeight="bold">
          Svigrúm:
        </text>
        <text x="10" y="42" fill="#6b7280" fontSize="12">
          {c.orbitals}
        </text>
        {/* s orbital circle */}
        <circle cx="20" cy="65" r="10" fill="#c4b5fd" stroke="#7c3aed" strokeWidth="1.5" />
        <text x="20" y="69" textAnchor="middle" fill="#7c3aed" fontSize="8" fontWeight="bold">
          s
        </text>
        {/* p orbital lobes */}
        {domains >= 2 && (
          <g transform="translate(45,65)">
            <ellipse rx="6" ry="12" fill="#a78bfa" stroke="#7c3aed" strokeWidth="1" />
            <text x="0" y="4" textAnchor="middle" fill="#7c3aed" fontSize="7" fontWeight="bold">
              p
            </text>
          </g>
        )}
        {domains >= 3 && (
          <g transform="translate(62,65)">
            <ellipse
              rx="6"
              ry="12"
              fill="#a78bfa"
              stroke="#7c3aed"
              strokeWidth="1"
              transform="rotate(90)"
            />
            <text x="0" y="4" textAnchor="middle" fill="#7c3aed" fontSize="7" fontWeight="bold">
              p
            </text>
          </g>
        )}
        {domains >= 4 && (
          <g transform="translate(79,65)">
            <ellipse
              rx="6"
              ry="12"
              fill="#a78bfa"
              stroke="#7c3aed"
              strokeWidth="1"
              transform="rotate(45)"
            />
            <text x="0" y="4" textAnchor="middle" fill="#7c3aed" fontSize="7" fontWeight="bold">
              p
            </text>
          </g>
        )}
        {domains >= 5 && (
          <g transform="translate(96,65)">
            <ellipse rx="5" ry="10" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
            <text x="0" y="4" textAnchor="middle" fill="#92400e" fontSize="7" fontWeight="bold">
              d
            </text>
          </g>
        )}
        {domains >= 6 && (
          <g transform="translate(113,65)">
            <ellipse
              rx="5"
              ry="10"
              fill="#fbbf24"
              stroke="#d97706"
              strokeWidth="1"
              transform="rotate(90)"
            />
            <text x="0" y="4" textAnchor="middle" fill="#92400e" fontSize="7" fontWeight="bold">
              d
            </text>
          </g>
        )}

        {/* Arrow */}
        <text x="120" y="42" fill="#374151" fontSize="16">
          →
        </text>

        {/* Result: hybrid orbitals */}
        <text x={cx} y="20" textAnchor="middle" fill="#7c3aed" fontSize="11" fontWeight="bold">
          {domains}× {c.label}
        </text>
        {/* Central dot */}
        <circle cx={cx} cy={cy} r="4" fill="#7c3aed" />
        {/* Hybrid orbital lobes */}
        {lobeAngles.map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          const ex = cx + Math.cos(rad) * lobeDist;
          const ey = cy + Math.sin(rad) * lobeDist;
          return (
            <g key={i}>
              <line x1={cx} y1={cy} x2={ex} y2={ey} stroke="#8b5cf6" strokeWidth="2" />
              <ellipse
                cx={ex}
                cy={ey}
                rx="8"
                ry="5"
                fill="#c4b5fd"
                stroke="#7c3aed"
                strokeWidth="1"
                transform={`rotate(${deg},${ex},${ey})`}
              />
            </g>
          );
        })}

        {/* Angle + shape label */}
        <text x={cx} y="100" textAnchor="middle" fill="#6b7280" fontSize="10">
          {c.angle} → {c.shape}
        </text>

        {/* Result arrow + label */}
        <text x="230" y="42" fill="#374151" fontSize="16">
          →
        </text>
        <text x="255" y="58" textAnchor="middle" fill="#059669" fontSize="12" fontWeight="bold">
          {c.shape}
        </text>
        <text x="255" y="74" textAnchor="middle" fill="#6b7280" fontSize="10">
          {c.angle}
        </text>
      </svg>
    </div>
  );
}

export function Level3({ onComplete, onBack }: Level3Props) {
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showConcept, setShowConcept] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [, setTotalHintsUsed] = useState(0);

  const challenge = challenges[currentChallenge];

  // A new question replaces the screen; on a phone start it at the top.
  useScrollTopOnChange(currentChallenge);

  // The data lists the answer at b in half the questions and never at d, so
  // shuffle per question. The ids double as the visible letters and are
  // reassigned by position, so grading must look them up here too.
  const shuffledOptions = useMemo(
    () =>
      shuffleArray(challenge.options).map((opt, idx) => ({
        ...opt,
        id: String.fromCharCode(97 + idx), // 'a', 'b', 'c', 'd'
      })),
    [challenge]
  );

  const checkAnswer = () => {
    const selected = shuffledOptions.find((opt) => opt.id === selectedOption);
    const correct = selected?.correct ?? false;
    setIsCorrect(correct);
    if (correct) {
      setScore((prev) => prev + 12);
    }
    setShowResult(true);
  };

  const nextChallenge = () => {
    if (currentChallenge < challenges.length - 1) {
      setCurrentChallenge((prev) => prev + 1);
      setSelectedOption(null);
      setShowResult(false);
      setShowHint(false);
      setShowConcept(false);
      setIsCorrect(false);
    } else {
      onComplete(score);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'hybridization':
        return 'Blendni';
      case 'polarity':
        return 'Skautun';
      case 'multi_center':
        return 'Mörg miðatóm';
      case 'dipole':
        return 'Tvískautsvægi';
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'hybridization':
        return 'bg-purple-100 text-purple-800';
      case 'polarity':
        return 'bg-blue-100 text-blue-800';
      case 'multi_center':
        return 'bg-green-100 text-green-800';
      case 'dipole':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-warm-100 text-warm-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="text-warm-600 hover:text-warm-800 flex items-center gap-2 pointer-coarse:min-h-11"
          >
            <span>&larr;</span> Til baka
          </button>
          <div className="text-right">
            <div className="text-sm text-warm-600">
              Spurning {currentChallenge + 1} af {challenges.length}
            </div>
            <div className="text-lg font-bold text-teal-600">{score} stig</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-warm-200 rounded-full h-2 mb-6">
          <div
            className="bg-teal-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentChallenge + 1) / challenges.length) * 100}%` }}
          />
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8">
          {/* Type badge */}
          <div className="mb-4">
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(challenge.type)}`}
            >
              {getTypeLabel(challenge.type)}
            </span>
          </div>

          {/* Molecule info */}
          <div className="bg-warm-900 rounded-xl p-3 sm:p-4 mb-6 text-center">
            <div className="text-3xl font-bold text-white">{challenge.formula}</div>
            <div className="text-warm-400">{challenge.name}</div>
            {challenge.lewisStructure && (
              <div className="font-mono text-teal-400 mt-2 whitespace-pre">
                {challenge.lewisStructure}
              </div>
            )}
          </div>

          {/* Question */}
          <p className="text-warm-700 text-lg mb-6">{challenge.question}</p>

          {/* Options */}
          <div className="space-y-3 mb-6">
            {shuffledOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => !showResult && setSelectedOption(option.id)}
                disabled={showResult}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  showResult
                    ? option.correct
                      ? 'border-green-500 bg-green-50'
                      : selectedOption === option.id
                        ? 'border-red-500 bg-red-50'
                        : 'border-warm-200 bg-warm-50 opacity-50'
                    : selectedOption === option.id
                      ? 'border-teal-500 bg-teal-50 ring-2 ring-teal-200'
                      : 'border-warm-300 hover:border-teal-400 hover:bg-teal-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="font-bold text-warm-500 uppercase">{option.id}.</span>
                  <span className="flex-1">{option.text}</span>
                </div>
                {showResult && selectedOption === option.id && (
                  <div
                    className={`mt-2 text-sm ${option.correct ? 'text-green-700' : 'text-red-700'}`}
                  >
                    {option.explanation}
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Hint */}
          {!showResult && !showHint && (
            <button
              onClick={() => {
                setShowHint(true);
                setTotalHintsUsed((prev) => prev + 1);
              }}
              className="text-teal-600 hover:text-teal-800 text-sm underline mb-4 pointer-coarse:min-h-11"
            >
              Sýna vísbendingu
            </button>
          )}

          {showHint && !showResult && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl mb-4">
              <span className="font-bold text-yellow-800">Vísbending: </span>
              <span className="text-yellow-900">{challenge.hint}</span>
            </div>
          )}

          {/* Check answer button */}
          {!showResult && (
            <button
              onClick={checkAnswer}
              disabled={!selectedOption}
              className="w-full bg-teal-500 hover:bg-teal-600 disabled:bg-warm-300 text-white font-bold py-4 px-6 rounded-xl transition-colors"
            >
              Athuga svar
            </button>
          )}

          {/* Result and concept explanation */}
          {showResult && (
            <>
              <div
                className={`p-4 rounded-xl mb-4 ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}
              >
                <div
                  className={`font-bold text-lg ${isCorrect ? 'text-green-700' : 'text-red-700'}`}
                >
                  {isCorrect ? 'Rétt!' : 'Rangt'}
                </div>
              </div>

              {/* Hybridization diagram — shown after hybridization questions */}
              {challenge.type === 'hybridization' && (
                <div className="mb-4">
                  <HybridizationDiagram
                    domains={
                      challenge.formula === 'CH₄'
                        ? 4
                        : challenge.formula === 'CO₂'
                          ? 2
                          : challenge.formula === 'NH₃'
                            ? 4
                            : challenge.formula === 'SF₆'
                              ? 6
                              : challenge.formula === 'C₂H₄'
                                ? 3
                                : challenge.formula === 'C₂H₂'
                                  ? 2
                                  : 4
                    }
                  />
                </div>
              )}

              {/* Concept explanation toggle */}
              <button
                onClick={() => setShowConcept(!showConcept)}
                className="w-full text-left p-4 bg-purple-50 rounded-xl mb-4 hover:bg-purple-100 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-800">💡 Skoða hugtakaútskýringu</span>
                  <span className="text-purple-600">{showConcept ? '▲' : '▼'}</span>
                </div>
              </button>

              {showConcept && (
                <div className="bg-purple-50 p-4 rounded-xl mb-4 border border-purple-200">
                  <p className="text-purple-900 text-sm">{challenge.conceptExplanation}</p>
                </div>
              )}

              <button
                onClick={nextChallenge}
                className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-4 px-6 rounded-xl transition-colors"
              >
                {currentChallenge < challenges.length - 1 ? 'Næsta spurning' : 'Ljúka stigi 3'}
              </button>
            </>
          )}
        </div>

        {/* Reference tables */}
        <div className="mt-6 grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="font-bold text-warm-700 mb-3">🧬 Blendnitafla</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-warm-50">
                  <th className="p-2 text-left">Svið</th>
                  <th className="p-2 text-left">Blendni</th>
                  <th className="p-2 text-left">Lögun</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="p-2">2</td>
                  <td className="hybridization-sp">sp</td>
                  <td>Línuleg</td>
                </tr>
                <tr className="border-t">
                  <td className="p-2">3</td>
                  <td className="hybridization-sp2">sp²</td>
                  <td>Þríhyrnd</td>
                </tr>
                <tr className="border-t">
                  <td className="p-2">4</td>
                  <td className="hybridization-sp3">sp³</td>
                  <td>Ferflötungur</td>
                </tr>
                <tr className="border-t">
                  <td className="p-2">5</td>
                  <td className="hybridization-sp3d">sp³d</td>
                  <td>Tvípýramída</td>
                </tr>
                <tr className="border-t">
                  <td className="p-2">6</td>
                  <td className="hybridization-sp3d2">sp³d²</td>
                  <td>Áttflötungur</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="font-bold text-warm-700 mb-3">⚡ Skautun</h3>
            <div className="space-y-2 text-sm">
              <div className="bg-green-50 p-2 rounded">
                <strong>Óskautuð:</strong> Samhverf lögun → tvískautsvægi jafnast út
              </div>
              <div className="bg-blue-50 p-2 rounded">
                <strong>Skautuð:</strong> Ósamhverf → nettó tvískautsvægi ≠ 0
              </div>
              <div className="text-warm-600 mt-2">
                <strong>Dæmi:</strong>
                {POLARITY_EXAMPLES.filter(
                  (ex) => showResult || ex.formula !== challenge.formula
                ).map((ex) => (
                  <div key={ex.formula}>{ex.text}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
