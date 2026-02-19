import { useState, useMemo } from 'react';
import { AnimatedMolecule, DragDropBuilder, FeedbackPanel, MoleculeViewer3DLazy } from '@shared/components';
import type { DraggableItemData, DropZoneData, DropResult, ZoneState } from '@shared/components';
import { lewisToMolecule } from '../utils/lewisConverter';
import { shuffleArray } from '@shared/utils';
import { LewisGuidedMode } from './LewisGuidedMode';

// Misconceptions for Lewis structure building
const LEWIS_MISCONCEPTIONS: Record<string, string> = {
  central_atom: 'Miðatómið er venjulega atómið með flestum gildisrafeindum (nema H sem er alltaf ytri atóm).',
  lone_pairs: 'Einstæð pör eru rafeindir sem tilheyra einu atómi og taka ekki þátt í efnabindingum.',
  bond_count: 'Fjöldi tengja ákvarðast af því hversu margar rafeindir atóm þurfa til að ná áttureglunni.',
  octet: 'Áttureglan: Atóm vilja hafa 8 rafeindir í ystu skel (nema H sem vill 2).',
};

// Related concepts
const LEWIS_RELATED = ['Lewis-formúlur', 'Gildisrafeindir', 'Áttureglan', 'Efnatengi'];

interface Level2Props {
  onComplete: (score: number, maxScore: number, hintsUsed: number) => void;
  onBack: () => void;
  onCorrectAnswer?: () => void;
  onIncorrectAnswer?: () => void;
}

interface LewisStructure {
  centralAtom: string;
  surroundingAtoms: { symbol: string; bondType: 'single' | 'double' | 'triple'; lonePairs: number; formalCharge?: number }[];
  centralLonePairs: number;
  centralFormalCharge?: number;
  centralUnpairedElectron?: boolean; // For radicals like NO
  octetException?: 'none' | 'electron-deficient' | 'expanded-octet' | 'odd-electron';
  centralElectrons?: number; // Actual electrons around central atom (for exceptions)
}

interface Challenge {
  id: number;
  title: string;
  molecule: string;
  totalElectrons: number;
  correctStructure: LewisStructure;
  steps: {
    question: string;
    type: 'central_atom' | 'bond_count' | 'lone_pairs_surrounding' | 'lone_pairs_central';
    options: { id: string; text: string; correct: boolean }[];
    explanation: string;
  }[];
  hint: string;
  finalExplanation: string;
}

const challenges: Challenge[] = [
  {
    id: 1,
    title: 'Vatn (H₂O)',
    molecule: 'H₂O',
    totalElectrons: 8,
    correctStructure: {
      centralAtom: 'O',
      surroundingAtoms: [
        { symbol: 'H', bondType: 'single', lonePairs: 0 },
        { symbol: 'H', bondType: 'single', lonePairs: 0 },
      ],
      centralLonePairs: 2,
    },
    steps: [
      {
        question: 'Hvert er miðatómið í H₂O?',
        type: 'central_atom',
        options: [
          { id: 'H', text: 'Vetni (H)', correct: false },
          { id: 'O', text: 'Súrefni (O)', correct: true },
        ],
        explanation: 'Súrefni er miðatómið - það hefur fleiri gildisrafeindir og getur myndað fleiri tengsl.',
      },
      {
        question: 'Hversu mörg einföld tengsl eru á milli O og H atómanna?',
        type: 'bond_count',
        options: [
          { id: '1', text: '1 tengi', correct: false },
          { id: '2', text: '2 tengsl', correct: true },
          { id: '3', text: '3 tengsl', correct: false },
        ],
        explanation: 'Tvö einföld tengsl - eitt til hvers vetnis. Þetta notar 4 rafeindir.',
      },
      {
        question: 'Hversu mörg einstæð rafeindarapör (lone pairs) eru á súrefninu?',
        type: 'lone_pairs_central',
        options: [
          { id: '0', text: '0 pör', correct: false },
          { id: '1', text: '1 par', correct: false },
          { id: '2', text: '2 pör', correct: true },
          { id: '3', text: '3 pör', correct: false },
        ],
        explanation: '8 heildarrafeindir - 4 í tengslum = 4 óbundnar, sem eru 2 einstæð rafeindarapör.',
      },
    ],
    hint: 'H getur aðeins myndað 1 tengi, þannig að O verður að vera miðatómið',
    finalExplanation: 'H₂O: O í miðju með 2 H tengd og 2 einstæð rafeindarapör. Þetta gefur 4 rafeindarapör í kringum O.',
  },
  {
    id: 2,
    title: 'Ammóníak (NH₃)',
    molecule: 'NH₃',
    totalElectrons: 8,
    correctStructure: {
      centralAtom: 'N',
      surroundingAtoms: [
        { symbol: 'H', bondType: 'single', lonePairs: 0 },
        { symbol: 'H', bondType: 'single', lonePairs: 0 },
        { symbol: 'H', bondType: 'single', lonePairs: 0 },
      ],
      centralLonePairs: 1,
    },
    steps: [
      {
        question: 'Hvert er miðatómið í NH₃?',
        type: 'central_atom',
        options: [
          { id: 'N', text: 'Nitur (N)', correct: true },
          { id: 'H', text: 'Vetni (H)', correct: false },
        ],
        explanation: 'Nitur er miðatómið með 5 gildisrafeindir.',
      },
      {
        question: 'Hversu mörg einföld N-H tengsl eru?',
        type: 'bond_count',
        options: [
          { id: '2', text: '2 tengsl', correct: false },
          { id: '3', text: '3 tengsl', correct: true },
          { id: '4', text: '4 tengsl', correct: false },
        ],
        explanation: 'Þrjú einföld tengsl - eitt til hvers vetnis. Þetta notar 6 rafeindir.',
      },
      {
        question: 'Hversu mörg einstæð rafeindarapör eru á nitrinu?',
        type: 'lone_pairs_central',
        options: [
          { id: '0', text: '0 pör', correct: false },
          { id: '1', text: '1 par', correct: true },
          { id: '2', text: '2 pör', correct: false },
        ],
        explanation: '8 heildarrafeindir - 6 í tengslum = 2 óbundnar, sem eru 1 einstætt rafeindarapar.',
      },
    ],
    hint: 'N hefur 5 gildisrafeindir, þannig að það getur myndað 3 tengsl og hefur 1 einstætt par',
    finalExplanation: 'NH₃: N í miðju með 3 H tengd og 1 einstætt rafeindarapar. Þetta gerir N tetrahedral en sameindina pýramídalaga.',
  },
  {
    id: 3,
    title: 'Koltvísýringur (CO₂)',
    molecule: 'CO₂',
    totalElectrons: 16,
    correctStructure: {
      centralAtom: 'C',
      surroundingAtoms: [
        { symbol: 'O', bondType: 'double', lonePairs: 2 },
        { symbol: 'O', bondType: 'double', lonePairs: 2 },
      ],
      centralLonePairs: 0,
    },
    steps: [
      {
        question: 'Hvert er miðatómið í CO₂?',
        type: 'central_atom',
        options: [
          { id: 'C', text: 'Kolefni (C)', correct: true },
          { id: 'O', text: 'Súrefni (O)', correct: false },
        ],
        explanation: 'Kolefni er miðatómið - það hefur færri rafeindir og stendur venjulega í miðjunni.',
      },
      {
        question: 'Hvers konar tengsl eru á milli C og O?',
        type: 'bond_count',
        options: [
          { id: 'single', text: 'Einföld tengsl (C-O)', correct: false },
          { id: 'double', text: 'Tvöföld tengsl (C=O)', correct: true },
          { id: 'triple', text: 'Þreföld tengsl (C≡O)', correct: false },
        ],
        explanation: 'Tvöföld tengsl til beggja súrefna. C myndar 4 tengsl alls (2+2) og hvert O hefur 8 rafeindir.',
      },
      {
        question: 'Hversu mörg einstæð rafeindarapör eru á HVERJU súrefni?',
        type: 'lone_pairs_surrounding',
        options: [
          { id: '1', text: '1 par', correct: false },
          { id: '2', text: '2 pör', correct: true },
          { id: '3', text: '3 pör', correct: false },
        ],
        explanation: 'Hvert O hefur 2 einstæð rafeindarapör. Ásamt tvöföldu tengslunum hefur hvert O 8 rafeindir.',
      },
    ],
    hint: 'C þarf 4 tengsl og hvert O þarf 2 tengsl (fyrir áttu)',
    finalExplanation: 'CO₂: O=C=O með tvöföldum tengslum. Hvert O hefur 2 einstæð pör. Þetta er línuleg sameind.',
  },
  {
    id: 4,
    title: 'Metan (CH₄)',
    molecule: 'CH₄',
    totalElectrons: 8,
    correctStructure: {
      centralAtom: 'C',
      surroundingAtoms: [
        { symbol: 'H', bondType: 'single', lonePairs: 0 },
        { symbol: 'H', bondType: 'single', lonePairs: 0 },
        { symbol: 'H', bondType: 'single', lonePairs: 0 },
        { symbol: 'H', bondType: 'single', lonePairs: 0 },
      ],
      centralLonePairs: 0,
    },
    steps: [
      {
        question: 'Hvert er miðatómið í CH₄?',
        type: 'central_atom',
        options: [
          { id: 'C', text: 'Kolefni (C)', correct: true },
          { id: 'H', text: 'Vetni (H)', correct: false },
        ],
        explanation: 'Kolefni er miðatómið með 4 gildisrafeindir.',
      },
      {
        question: 'Hversu mörg C-H tengsl eru í metan?',
        type: 'bond_count',
        options: [
          { id: '3', text: '3 tengsl', correct: false },
          { id: '4', text: '4 tengsl', correct: true },
          { id: '5', text: '5 tengsl', correct: false },
        ],
        explanation: '4 einföld C-H tengsl. Þetta notar allar 8 rafeindirnar.',
      },
      {
        question: 'Eru einhver einstæð rafeindarapör á kolefninu?',
        type: 'lone_pairs_central',
        options: [
          { id: '0', text: 'Nei, engin', correct: true },
          { id: '1', text: 'Já, 1 par', correct: false },
          { id: '2', text: 'Já, 2 pör', correct: false },
        ],
        explanation: 'Allar 8 rafeindir eru í tengslum. Kolefni hefur engin einstæð pör í metan.',
      },
    ],
    hint: 'C myndar 4 tengsl og H myndar 1 - þannig kemur CH₄',
    finalExplanation: 'CH₄: C í miðju með 4 H tengd. Engin einstæð rafeindarapör. Þetta er tetrahedal sameind.',
  },
  {
    id: 5,
    title: 'Nituroxíð (NO)',
    molecule: 'NO',
    totalElectrons: 11,
    correctStructure: {
      centralAtom: 'N',
      surroundingAtoms: [
        { symbol: 'O', bondType: 'double', lonePairs: 2 },
      ],
      centralLonePairs: 1,
      centralUnpairedElectron: true, // NO is a radical
    },
    steps: [
      {
        question: 'Þessi sameind hefur oddatölu rafeinda (11). Hvað þýðir það?',
        type: 'central_atom',
        options: [
          { id: 'radical', text: 'Hún hefur óparaða rafeind (radical)', correct: true },
          { id: 'normal', text: 'Ekkert sérstakt', correct: false },
        ],
        explanation: 'NO er róttæki (radical) með eina óparaða rafeind. Þetta gerir hana mjög hvarfgjarnan.',
      },
      {
        question: 'Hvers konar tengsl eru á milli N og O?',
        type: 'bond_count',
        options: [
          { id: 'single', text: 'Einföld tengsl', correct: false },
          { id: 'double', text: 'Tvöföld tengsl', correct: true },
          { id: 'triple', text: 'Þreföld tengsl', correct: false },
        ],
        explanation: 'Tvöföld tengsl (N=O) með óparaðri rafeind á nitrinu.',
      },
      {
        question: 'Hvar er óparaða rafeindin?',
        type: 'lone_pairs_central',
        options: [
          { id: 'N', text: 'Á nitrinu (N)', correct: true },
          { id: 'O', text: 'Á súrefninu (O)', correct: false },
        ],
        explanation: 'N hefur óparaða rafeind, sem gerir NO að róttæki.',
      },
    ],
    hint: 'Sameindir með oddatölu rafeinda eru róttæki',
    finalExplanation: 'NO: Tvöföld tengsl N=O með óparaðri rafeind á N. Þetta er róttæki og mjög hvarfgjarnt.',
  },
  {
    id: 6,
    title: 'Vetni klóríð (HCl)',
    molecule: 'HCl',
    totalElectrons: 8,
    correctStructure: {
      centralAtom: 'Cl',
      surroundingAtoms: [
        { symbol: 'H', bondType: 'single', lonePairs: 0 },
      ],
      centralLonePairs: 3,
    },
    steps: [
      {
        question: 'Hvers konar tengsl eru í HCl?',
        type: 'bond_count',
        options: [
          { id: 'single', text: 'Einföld tengsl (H-Cl)', correct: true },
          { id: 'double', text: 'Tvöföld tengsl', correct: false },
        ],
        explanation: 'Eitt einfalt tengi. Bæði H og Cl þurfa aðeins 1 rafeind.',
      },
      {
        question: 'Hversu mörg einstæð rafeindarapör eru á Cl?',
        type: 'lone_pairs_central',
        options: [
          { id: '2', text: '2 pör', correct: false },
          { id: '3', text: '3 pör', correct: true },
          { id: '4', text: '4 pör', correct: false },
        ],
        explanation: 'Cl hefur 7 gildisrafeindir. 1 í tengslum, 6 óbundnar = 3 einstæð pör.',
      },
      {
        question: 'Er áttureglan uppfyllt fyrir Cl?',
        type: 'central_atom',
        options: [
          { id: 'yes', text: 'Já', correct: true },
          { id: 'no', text: 'Nei', correct: false },
        ],
        explanation: 'Cl hefur 2 (frá tengi) + 6 (einstæð) = 8 rafeindir. Áttureglan er uppfyllt!',
      },
    ],
    hint: 'Cl þarf aðeins 1 rafeind til að ná áttureglunni',
    finalExplanation: 'HCl: Einfalt H-Cl tengi. Cl hefur 3 einstæð rafeindarapör. Bæði H og Cl hafa fulla ystu skel.',
  },
  // === OCTET RULE EXCEPTIONS ===
  {
    id: 7,
    title: 'Bórþríflúoríð (BF₃) - Undantekning',
    molecule: 'BF₃',
    totalElectrons: 24,
    correctStructure: {
      centralAtom: 'B',
      surroundingAtoms: [
        { symbol: 'F', bondType: 'single', lonePairs: 3 },
        { symbol: 'F', bondType: 'single', lonePairs: 3 },
        { symbol: 'F', bondType: 'single', lonePairs: 3 },
      ],
      centralLonePairs: 0,
      octetException: 'electron-deficient',
      centralElectrons: 6,
    },
    steps: [
      {
        question: 'Bór (B) er í hópi 13 og hefur 3 gildisrafeindir. Hvað gerist þegar B myndar 3 einföld tengsl?',
        type: 'central_atom',
        options: [
          { id: '6e', text: 'Bór hefur aðeins 6 rafeindir í kringum sig', correct: true },
          { id: '8e', text: 'Bór hefur 8 rafeindir (uppfyllir áttu)', correct: false },
        ],
        explanation: 'Bór með 3 einföld tengsl hefur aðeins 6 rafeindir. Þetta er undantekning frá áttureglunni!',
      },
      {
        question: 'Af hverju er BF₃ stöðugt þó það uppfylli ekki átturegluna?',
        type: 'bond_count',
        options: [
          { id: 'small', text: 'Bór er lítið atóm sem getur ekki haldið 8 rafeindum', correct: true },
          { id: 'special', text: 'Flúor gefur rafeindir til bórs', correct: false },
        ],
        explanation: 'Bór er lítið atóm á 2. lotu og hefur ekki d-undirskel. Það getur stöðugt haft færri en 8 rafeindir.',
      },
      {
        question: 'Hvað kallast þessi tegund undantekninga?',
        type: 'lone_pairs_central',
        options: [
          { id: 'deficient', text: 'Rafeindaskort (electron deficient)', correct: true },
          { id: 'expanded', text: 'Stækkuð átta (expanded octet)', correct: false },
        ],
        explanation: 'BF₃ er "electron deficient" - það hefur færri en 8 rafeindir í kringum miðatómið.',
      },
    ],
    hint: 'Bór er í hópi 13 og myndar venjulega 3 tengsl',
    finalExplanation: 'BF₃ er dæmi um rafeindaskort: Bór hefur aðeins 6 rafeindir í kringum sig, ekki 8. Þetta er stöðugt vegna þess að bór er lítið atóm.',
  },
  {
    id: 8,
    title: 'Fosfórpentaklóríð (PCl₅) - Undantekning',
    molecule: 'PCl₅',
    totalElectrons: 40,
    correctStructure: {
      centralAtom: 'P',
      surroundingAtoms: [
        { symbol: 'Cl', bondType: 'single', lonePairs: 3 },
        { symbol: 'Cl', bondType: 'single', lonePairs: 3 },
        { symbol: 'Cl', bondType: 'single', lonePairs: 3 },
        { symbol: 'Cl', bondType: 'single', lonePairs: 3 },
        { symbol: 'Cl', bondType: 'single', lonePairs: 3 },
      ],
      centralLonePairs: 0,
      octetException: 'expanded-octet',
      centralElectrons: 10,
    },
    steps: [
      {
        question: 'Fosfór (P) er í hópi 15 á 3. lotu. Hversu mörg tengsl myndar P í PCl₅?',
        type: 'bond_count',
        options: [
          { id: '3', text: '3 tengsl', correct: false },
          { id: '5', text: '5 tengsl', correct: true },
        ],
        explanation: '5 einföld tengsl til 5 klóratóma. Þetta þýðir 10 rafeindir í kringum P!',
      },
      {
        question: 'Hversu margar rafeindir eru í kringum fosfór í PCl₅?',
        type: 'central_atom',
        options: [
          { id: '8', text: '8 rafeindir', correct: false },
          { id: '10', text: '10 rafeindir', correct: true },
        ],
        explanation: 'Fosfór hefur 10 rafeindir í kringum sig - fleiri en áttureglan leyfir!',
      },
      {
        question: 'Hvað kallast þessi tegund undantekninga?',
        type: 'lone_pairs_central',
        options: [
          { id: 'deficient', text: 'Rafeindaskort (electron deficient)', correct: false },
          { id: 'expanded', text: 'Stækkuð átta (expanded octet)', correct: true },
        ],
        explanation: 'PCl₅ hefur "expanded octet" - stækkaða áttu með fleiri en 8 rafeindum.',
      },
    ],
    hint: 'Fosfór er á 3. lotu og hefur d-undirskeljum aðgengilegar',
    finalExplanation: 'PCl₅ er dæmi um stækkaða áttu: Fosfór hefur 10 rafeindir í kringum sig. Þetta er mögulegt vegna þess að P er á 3. lotu og getur notað d-undirskeljum.',
  },
  {
    id: 9,
    title: 'Brennisteinshexaflúoríð (SF₆) - Undantekning',
    molecule: 'SF₆',
    totalElectrons: 48,
    correctStructure: {
      centralAtom: 'S',
      surroundingAtoms: [
        { symbol: 'F', bondType: 'single', lonePairs: 3 },
        { symbol: 'F', bondType: 'single', lonePairs: 3 },
        { symbol: 'F', bondType: 'single', lonePairs: 3 },
        { symbol: 'F', bondType: 'single', lonePairs: 3 },
        { symbol: 'F', bondType: 'single', lonePairs: 3 },
        { symbol: 'F', bondType: 'single', lonePairs: 3 },
      ],
      centralLonePairs: 0,
      octetException: 'expanded-octet',
      centralElectrons: 12,
    },
    steps: [
      {
        question: 'Brennisteinn (S) myndar 6 tengsl í SF₆. Hversu margar rafeindir eru í kringum S?',
        type: 'central_atom',
        options: [
          { id: '8', text: '8 rafeindir', correct: false },
          { id: '12', text: '12 rafeindir', correct: true },
        ],
        explanation: 'Brennisteinn hefur 12 rafeindir í kringum sig - tvöfalt meira en áttureglan!',
      },
      {
        question: 'Hvað gerir atómum á 3. lotu og neðar kleift að hafa fleiri en 8 rafeindir?',
        type: 'bond_count',
        options: [
          { id: 'd-orbitals', text: 'Þau hafa tómar d-undirskeljum', correct: true },
          { id: 'bigger', text: 'Þau eru bara stærri', correct: false },
        ],
        explanation: 'Atóm á 3. lotu og neðar hafa aðgang að d-undirskeljum sem geta haldið viðbótarrafeindum.',
      },
      {
        question: 'SF₆ er mjög stöðug sameind. Hvers vegna er það mikilvægt í iðnaði?',
        type: 'lone_pairs_central',
        options: [
          { id: 'insulator', text: 'Hún er notuð sem einangrunarefni í rafbúnaði', correct: true },
          { id: 'fuel', text: 'Hún er notuð sem eldsneyti', correct: false },
        ],
        explanation: 'SF₆ er mjög stöðug og er notuð sem einangrunarefni í háspennubúnaði.',
      },
    ],
    hint: 'Brennisteinn er á 3. lotu og getur haft meira en 8 rafeindir',
    finalExplanation: 'SF₆ er dæmi um stækkaða áttu: S hefur 12 rafeindir í kringum sig (6 tengsl). Þetta er mögulegt vegna d-undirskelja.',
  },
];

// Calculate max score: 9 challenges * 3 steps each * 5 points = 135
const MAX_SCORE = 135;

export function Level2({ onComplete, onBack, onCorrectAnswer, onIncorrectAnswer }: Level2Props) {
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showStepResult, setShowStepResult] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [stepCorrect, setStepCorrect] = useState<boolean[]>([]);
  const [score, setScore] = useState(0);
  const [totalHintsUsed, setTotalHintsUsed] = useState(0);
  const [buildMode, setBuildMode] = useState(false);
  const [zoneState, setZoneState] = useState<ZoneState>({});
  const [buildComplete, setBuildComplete] = useState(false);
  const [buildCorrect, setBuildCorrect] = useState(false);
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [showTutorial, setShowTutorial] = useState(false);

  const challenge = challenges[currentChallenge];
  const step = challenge.steps[currentStep];
  const isLastStep = currentStep === challenge.steps.length - 1;
  const isLastChallenge = currentChallenge === challenges.length - 1;

  // Generate draggable items for building Lewis structure
  const { electronItems, atomZones } = useMemo(() => {
    const structure = challenge.correctStructure;

    // Create draggable electron pairs
    const items: DraggableItemData[] = [];

    // Add lone pairs to drag (we'll create more than needed for challenge)
    const totalLonePairs = structure.centralLonePairs +
      structure.surroundingAtoms.reduce((sum, a) => sum + a.lonePairs, 0);

    for (let i = 0; i < totalLonePairs + 2; i++) {
      items.push({
        id: `lone-pair-${i}`,
        content: (
          <div className="flex items-center gap-1 p-2">
            <div className="w-2 h-2 rounded-full bg-blue-600" />
            <div className="w-2 h-2 rounded-full bg-blue-600" />
            <span className="text-xs ml-1">Einstætt par</span>
          </div>
        ),
        category: 'electron',
        data: { type: 'lone-pair' },
      });
    }

    // Create drop zones for atoms
    const zones: DropZoneData[] = [
      {
        id: `zone-${structure.centralAtom}`,
        label: `${structure.centralAtom} (miðatóm)`,
        maxItems: 4,
        placeholder: 'Dragðu einstæð pör hingað',
        data: {
          atom: structure.centralAtom,
          expectedPairs: structure.centralLonePairs,
          isCentral: true
        },
      },
    ];

    // Add zones for surrounding atoms (only those with lone pairs)
    structure.surroundingAtoms.forEach((atom, idx) => {
      if (atom.lonePairs > 0) {
        zones.push({
          id: `zone-${atom.symbol}-${idx}`,
          label: `${atom.symbol} (ytri atóm)`,
          maxItems: 4,
          placeholder: 'Dragðu einstæð pör hingað',
          data: {
            atom: atom.symbol,
            expectedPairs: atom.lonePairs,
            isCentral: false
          },
        });
      }
    });

    return { electronItems: items, atomZones: zones };
  }, [challenge]);

  // Handle drag-drop events
  const handleDrop = (result: DropResult) => {
    const { itemId, zoneId, index } = result;

    setZoneState(prev => {
      const newState = { ...prev };
      // Remove item from other zones
      for (const key of Object.keys(newState)) {
        newState[key] = newState[key].filter(id => id !== itemId);
      }
      // Add to target zone
      if (!newState[zoneId]) {
        newState[zoneId] = [];
      }
      newState[zoneId].splice(index, 0, itemId);
      return newState;
    });
  };

  const handleReorder = (zoneId: string, newOrder: string[]) => {
    setZoneState(prev => ({
      ...prev,
      [zoneId]: newOrder,
    }));
  };

  // Check if build is correct
  const checkBuild = () => {
    let correct = true;

    for (const zone of atomZones) {
      const placedItems = zoneState[zone.id] || [];
      const expectedPairs = (zone.data?.expectedPairs as number) || 0;

      if (placedItems.length !== expectedPairs) {
        correct = false;
        break;
      }
    }

    setBuildCorrect(correct);
    setBuildComplete(true);

    if (correct) {
      onCorrectAnswer?.();
      setScore(prev => prev + 10);
    } else {
      onIncorrectAnswer?.();
    }
  };

  // Get feedback for build mode
  const getBuildFeedback = () => {
    if (buildCorrect) {
      return {
        isCorrect: true,
        explanation: `Rétt! ${challenge.molecule} hefur ${challenge.correctStructure.centralLonePairs} einstæð pör á ${challenge.correctStructure.centralAtom}.`,
        relatedConcepts: LEWIS_RELATED,
        nextSteps: 'Þú skilur hvernig einstæð pör dreifast á atóm í Lewis-formúlum.',
      };
    }

    let feedback = 'Athugaðu fjölda einstæðra para á hverju atómi:\n';
    for (const zone of atomZones) {
      const placed = (zoneState[zone.id] || []).length;
      const expected = (zone.data?.expectedPairs as number) || 0;
      feedback += `• ${zone.data?.atom}: ${placed}/${expected} pör\n`;
    }

    return {
      isCorrect: false,
      explanation: feedback,
      misconception: LEWIS_MISCONCEPTIONS.lone_pairs,
      relatedConcepts: LEWIS_RELATED,
      nextSteps: 'Reiknaðu heildarfjölda gildisrafeinda og dreifðu þeim rétt.',
    };
  };

  // Shuffle options for current step - memoize to keep stable during step
  const shuffledStepOptions = useMemo(() => {
    return shuffleArray(step.options);
  }, [currentChallenge, currentStep, step.options]);

  // Convert Lewis structure to Molecule format for AnimatedMolecule
  const molecule = useMemo(() => {
    return lewisToMolecule(
      challenge.correctStructure,
      challenge.molecule,
      challenge.title
    );
  }, [challenge]);

  // Determine if we should show lone pairs (only on last step when completed)
  const showLonePairs = isLastStep && showStepResult;

  const checkStep = () => {
    const correct = shuffledStepOptions.find(opt => opt.id === selectedAnswer)?.correct ?? false;
    setStepCorrect(prev => [...prev, correct]);

    if (correct) {
      onCorrectAnswer?.();
      if (!showHint) {
        setScore(prev => prev + 5);
      } else {
        setScore(prev => prev + 2);
      }
    } else {
      onIncorrectAnswer?.();
    }

    setShowStepResult(true);
  };

  const nextStep = () => {
    if (!isLastStep) {
      setCurrentStep(prev => prev + 1);
      setSelectedAnswer(null);
      setShowStepResult(false);
      setShowHint(false);
    }
  };

  const enterBuildMode = () => {
    setBuildMode(true);
    setZoneState({});
    setBuildComplete(false);
    setBuildCorrect(false);
  };

  const nextChallenge = () => {
    if (!isLastChallenge) {
      setCurrentChallenge(prev => prev + 1);
      setCurrentStep(0);
      setSelectedAnswer(null);
      setShowStepResult(false);
      setShowHint(false);
      setStepCorrect([]);
      setBuildMode(false);
      setZoneState({});
      setBuildComplete(false);
      setBuildCorrect(false);
    } else {
      onComplete(score, MAX_SCORE, totalHintsUsed);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800 flex items-center gap-2"
          >
            <span>&larr;</span> Til baka
          </button>
          <div className="text-right">
            <div className="text-sm text-gray-600">
              Stig 2 / Sameind {currentChallenge + 1} af {challenges.length}
            </div>
            <div className="text-lg font-bold text-green-600">{score} stig</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentChallenge + (currentStep + 1) / challenge.steps.length) / challenges.length) * 100}%` }}
          />
        </div>

        {/* Tutorial toggle button */}
        {!showTutorial && currentChallenge === 0 && currentStep === 0 && !showStepResult && (
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4 mb-6 border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📝</span>
                <div>
                  <div className="font-bold text-gray-800">Nýr í Lewis-formúlum?</div>
                  <div className="text-sm text-gray-600">Byrjaðu með leiðsögnina til að læra skref fyrir skref</div>
                </div>
              </div>
              <button
                onClick={() => setShowTutorial(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-all"
              >
                Opna leiðsögn
              </button>
            </div>
          </div>
        )}

        {/* Tutorial Mode */}
        {showTutorial && (
          <div className="mb-6">
            <LewisGuidedMode
              molecule="H₂O"
              atoms={[
                { symbol: 'O', valenceElectrons: 6, position: 'central' },
                { symbol: 'H', valenceElectrons: 1, position: 'surrounding' },
                { symbol: 'H', valenceElectrons: 1, position: 'surrounding' },
              ]}
              totalElectrons={8}
              onComplete={() => {
                setShowTutorial(false);
                setScore(prev => prev + 5); // Bonus for completing tutorial
              }}
            />
            <button
              onClick={() => setShowTutorial(false)}
              className="mt-4 w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-all"
            >
              Sleppa leiðsögn
            </button>
          </div>
        )}

        {/* Main content */}
        {!showTutorial && (
        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
          <h2 className="text-2xl font-bold text-green-800 mb-2">
            {challenge.title}
          </h2>
          <div className="flex items-center gap-4 mb-4">
            <span className="font-mono text-3xl font-bold text-indigo-600">{challenge.molecule}</span>
            <span className="text-sm text-gray-600">({challenge.totalElectrons} gildisrafeindir)</span>
          </div>

          {/* Lewis structure visualization */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            {/* 2D/3D Toggle - only show when structure is complete */}
            {isLastStep && showStepResult && (
              <div className="flex justify-center gap-2 mb-3">
                <button
                  onClick={() => setViewMode('2d')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    viewMode === '2d'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  2D Lewis
                </button>
                <button
                  onClick={() => setViewMode('3d')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    viewMode === '3d'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  3D lögun
                </button>
              </div>
            )}

            <div className="flex justify-center py-4">
              {viewMode === '2d' || !showLonePairs ? (
                <AnimatedMolecule
                  molecule={molecule}
                  mode="lewis"
                  size="lg"
                  animation={showStepResult ? 'fade-in' : 'none'}
                  showLonePairs={showLonePairs}
                  showFormalCharges={showLonePairs}
                  ariaLabel={`Lewis-formúla fyrir ${challenge.molecule}`}
                />
              ) : (
                <div className="w-full">
                  <MoleculeViewer3DLazy
                    molecule={molecule}
                    style="ball-stick"
                    showLabels={true}
                    autoRotate={true}
                    autoRotateSpeed={1.5}
                    height={200}
                    width="100%"
                    backgroundColor="#f9fafb"
                  />
                  <div className="text-xs text-gray-500 text-center mt-2">
                    Dragðu til að snúa, skrollaðu til að stækka
                  </div>
                </div>
              )}
            </div>

            {/* Legend - shown when structure is complete */}
            {isLastStep && showStepResult && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-500 mb-2 font-medium">Skýringar:</div>
                <div className="flex flex-wrap gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-full border-2 border-blue-500 bg-blue-100" />
                    <span>Miðatóm</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-full border-2 border-green-500 bg-green-100" />
                    <span>Ytri atóm</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="flex gap-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    </div>
                    <span>Einstætt par</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-0.5 bg-gray-800" />
                    <span>Einfalt tengi</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="flex flex-col gap-0.5">
                      <div className="w-6 h-0.5 bg-gray-800" />
                      <div className="w-6 h-0.5 bg-gray-800" />
                    </div>
                    <span>Tvöfalt tengi</span>
                  </div>
                  {challenge.correctStructure.centralUnpairedElectron && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <span>Óparuð rafeind</span>
                    </div>
                  )}
                </div>
                {/* Octet exception warning */}
                {challenge.correctStructure.octetException && challenge.correctStructure.octetException !== 'none' && (
                  <div className="mt-3 pt-3 border-t border-orange-200">
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
                      challenge.correctStructure.octetException === 'electron-deficient'
                        ? 'bg-orange-100 text-orange-800 border border-orange-300'
                        : 'bg-purple-100 text-purple-800 border border-purple-300'
                    }`}>
                      <span className="text-lg">⚠️</span>
                      {challenge.correctStructure.octetException === 'electron-deficient' && (
                        <span>Rafeindaskort: {challenge.correctStructure.centralAtom} hefur {challenge.correctStructure.centralElectrons} rafeindir</span>
                      )}
                      {challenge.correctStructure.octetException === 'expanded-octet' && (
                        <span>Stækkuð átta: {challenge.correctStructure.centralAtom} hefur {challenge.correctStructure.centralElectrons} rafeindir</span>
                      )}
                      {challenge.correctStructure.octetException === 'odd-electron' && (
                        <span>Oddatala rafeinda (radical)</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Step indicator */}
          <div className="flex gap-2 mb-4">
            {challenge.steps.map((_, idx) => (
              <div
                key={idx}
                className={`flex-1 h-2 rounded-full ${
                  idx < currentStep
                    ? stepCorrect[idx]
                      ? 'bg-green-500'
                      : 'bg-red-400'
                    : idx === currentStep
                    ? 'bg-blue-500'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {/* Current step question */}
          <div className="mb-6">
            <p className="text-lg font-medium text-gray-800 mb-4">
              Skref {currentStep + 1}: {step.question}
            </p>

            <div className="space-y-3">
              {shuffledStepOptions.map(option => (
                <button
                  key={option.id}
                  onClick={() => !showStepResult && setSelectedAnswer(option.id)}
                  disabled={showStepResult}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    showStepResult
                      ? option.correct
                        ? 'border-green-500 bg-green-50'
                        : selectedAnswer === option.id
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 bg-gray-50 opacity-50'
                      : selectedAnswer === option.id
                      ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                      : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
                  }`}
                >
                  {option.text}
                </button>
              ))}
            </div>
          </div>

          {/* Step result */}
          {showStepResult && (
            <div className={`p-4 rounded-xl mb-4 ${
              shuffledStepOptions.find(o => o.id === selectedAnswer)?.correct
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}>
              <p className="text-sm text-gray-700">{step.explanation}</p>
            </div>
          )}

          {/* Final explanation */}
          {isLastStep && showStepResult && !buildMode && (
            <div className="bg-indigo-50 p-4 rounded-xl mb-4">
              <div className="font-bold text-indigo-800 mb-2">Lewis-formúla:</div>
              <p className="text-indigo-900 text-sm">{challenge.finalExplanation}</p>
            </div>
          )}

          {/* Build Mode - Drag and drop electron pairs */}
          {buildMode && (
            <div className="mb-6">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                <h3 className="font-bold text-green-800 mb-2">
                  Byggðu Lewis-formúluna
                </h3>
                <p className="text-green-700 text-sm mb-4">
                  Dragðu einstæð rafeindarapör á réttu atómin til að ljúka Lewis-formúlunni fyrir {challenge.molecule}.
                </p>

                <DragDropBuilder
                  items={electronItems}
                  zones={atomZones}
                  initialState={zoneState}
                  onDrop={handleDrop}
                  onReorder={handleReorder}
                  orientation="horizontal"
                  disabled={buildComplete}
                />
              </div>

              {/* Build result feedback */}
              {buildComplete && (
                <div className="mb-4">
                  <FeedbackPanel
                    feedback={getBuildFeedback()}
                    config={{
                      showExplanation: true,
                      showMisconceptions: !buildCorrect,
                      showRelatedConcepts: true,
                      showNextSteps: true,
                    }}
                  />
                </div>
              )}

              {/* Build action buttons */}
              {!buildComplete ? (
                <button
                  onClick={checkBuild}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-xl transition-colors"
                >
                  Athuga byggingu
                </button>
              ) : (
                <button
                  onClick={nextChallenge}
                  className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-4 px-6 rounded-xl transition-colors"
                >
                  {isLastChallenge ? 'Ljúka stigi 2' : 'Næsta sameind'}
                </button>
              )}
            </div>
          )}

          {/* Hint button */}
          {!showStepResult && !showHint && (
            <button
              onClick={() => {
                setShowHint(true);
                setTotalHintsUsed(prev => prev + 1);
              }}
              className="text-green-600 hover:text-green-800 text-sm underline mb-4"
            >
              Sýna vísbendingu (-3 stig)
            </button>
          )}

          {showHint && !showStepResult && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl mb-4">
              <span className="font-bold text-yellow-800">Vísbending: </span>
              <span className="text-yellow-900">{challenge.hint}</span>
            </div>
          )}

          {/* Action buttons */}
          {!buildMode && (
            <>
              {!showStepResult ? (
                <button
                  onClick={checkStep}
                  disabled={!selectedAnswer}
                  className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-bold py-4 px-6 rounded-xl transition-colors"
                >
                  Athuga
                </button>
              ) : isLastStep ? (
                <div className="space-y-3">
                  {/* Show build mode option if there are lone pairs to place */}
                  {atomZones.length > 0 && (
                    <button
                      onClick={enterBuildMode}
                      className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <span>✋</span> Byggja Lewis-formúlu (bónus +10 stig)
                    </button>
                  )}
                  <button
                    onClick={nextChallenge}
                    className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-4 px-6 rounded-xl transition-colors"
                  >
                    {isLastChallenge ? 'Ljúka stigi 2' : 'Næsta sameind'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={nextStep}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-xl transition-colors"
                >
                  Næsta skref
                </button>
              )}
            </>
          )}
        </div>
        )}

        {/* Quick reference */}
        <div className="mt-6 bg-white rounded-xl p-4 shadow">
          <h3 className="font-bold text-gray-700 mb-2">Skref til að teikna Lewis-formúlu:</h3>
          <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
            <li className={currentStep >= 0 ? 'text-green-600 font-medium' : ''}>Veldu miðatóm (oftast það sem hefur flest tengsl)</li>
            <li className={currentStep >= 1 ? 'text-green-600 font-medium' : ''}>Teiknaðu einföld tengsl til allra ytri atóma</li>
            <li className={currentStep >= 2 ? 'text-green-600 font-medium' : ''}>Dreifðu eftirstandandi rafeindum sem einstæð pör</li>
            <li>Breyttu í tvöföld/þreföld tengsl ef þarf til að uppfylla átturegluna</li>
          </ol>
        </div>

        {/* Octet exceptions reference - show when relevant */}
        {challenge.correctStructure.octetException && challenge.correctStructure.octetException !== 'none' && (
          <div className="mt-4 bg-gradient-to-r from-orange-50 to-purple-50 rounded-xl p-4 shadow border border-orange-200">
            <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
              <span className="text-xl">⚠️</span>
              Undantekningar frá áttureglunni
            </h3>
            <div className="grid gap-3 text-sm">
              <div className={`p-3 rounded-lg ${challenge.correctStructure.octetException === 'electron-deficient' ? 'bg-orange-100 border-2 border-orange-300' : 'bg-white'}`}>
                <div className="font-bold text-orange-700">Rafeindaskort (Electron Deficient)</div>
                <div className="text-gray-600">Atóm eins og B og Al hafa færri en 8 rafeindir</div>
                <div className="text-xs text-gray-500 mt-1">Dæmi: BF₃ (6 rafeindir), AlCl₃ (6 rafeindir)</div>
              </div>
              <div className={`p-3 rounded-lg ${challenge.correctStructure.octetException === 'expanded-octet' ? 'bg-purple-100 border-2 border-purple-300' : 'bg-white'}`}>
                <div className="font-bold text-purple-700">Stækkuð átta (Expanded Octet)</div>
                <div className="text-gray-600">Atóm á 3. lotu+ geta haft fleiri en 8 rafeindir (nota d-undirskeljum)</div>
                <div className="text-xs text-gray-500 mt-1">Dæmi: PCl₅ (10 rafeindir), SF₆ (12 rafeindir)</div>
              </div>
              <div className="p-3 rounded-lg bg-white">
                <div className="font-bold text-red-700">Oddatala rafeinda (Radicals)</div>
                <div className="text-gray-600">Sameindir með oddatölu rafeinda hafa óparaða rafeind</div>
                <div className="text-xs text-gray-500 mt-1">Dæmi: NO (11 rafeindir), NO₂ (17 rafeindir)</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
