import { useState, useMemo, useEffect, useRef, type KeyboardEvent } from 'react';

import { AnimatedMolecule, FeedbackPanel } from '@shared/components';
import { MoleculeViewer3DLazy } from '@shared/components/MoleculeViewer3D';
import type { TieredHints } from '@shared/types';
import {
  revealSpan,
  shuffleArray,
  useArmedAfter,
  useIsPhone,
  useItemTop,
  useRevealAfterCommit,
  useScreenTop,
} from '@shared/utils';

import { BondAngleMeasurement } from './BondAngleMeasurement';
import { ElectronRepulsionAnimation } from './ElectronRepulsionAnimation';
import { ShapeTransitionAnimation } from './ShapeTransitionAnimation';
import { tabletBelowMd, useTabletTopOnChange } from '../utils/tabletBand';
import { geometryToMolecule } from '../utils/vseprConverter';

// Misconceptions for VSEPR geometry
const VSEPR_MISCONCEPTIONS: Record<string, string> = {
  electron_domains:
    'Rafeindasvið = bindandi pör + stök pör. Tvítengi og þrítengi telja sem EITT svið.',
  lone_pairs: 'Stök pör taka meira pláss en bindandi pör og ýta horninu niður.',
  geometry:
    'Rafeindaröðun (electron geometry) vs sameindaröðun (molecular geometry) - stök pör sjást ekki í sameindaröðun.',
  bond_angle: 'Stök pör minnka hornið: ferflötungur (109,5°) → pýramída (107°) → beygð (104,5°).',
};

// The misconception each kind of question tests. Every wrong answer used to
// get the electron-versus-molecular-geometry note, including a wrong bond
// angle and a wrong domain count, which have notes of their own above.
const MISCONCEPTION_FOR: Record<Challenge['type'], string> = {
  identify: VSEPR_MISCONCEPTIONS.geometry,
  molecular_vs_electron: VSEPR_MISCONCEPTIONS.geometry,
  electron_domains: VSEPR_MISCONCEPTIONS.electron_domains,
  angle: VSEPR_MISCONCEPTIONS.bond_angle,
  lone_pair_effect: VSEPR_MISCONCEPTIONS.lone_pairs,
};

// Related concepts for VSEPR
const VSEPR_RELATED: string[] = ['VSEPR kenningin', 'Rafeindasvið', 'Sameindaröðun', 'Tengihorn'];

interface Level1Props {
  onComplete: (score: number) => void;
  onBack: () => void;
}

interface Geometry {
  id: string;
  name: string;
  nameEn: string;
  electronDomains: number;
  bondingPairs: number;
  lonePairs: number;
  electronGeometry: string;
  molecularGeometry: string;
  bondAngle: string;
  example: string;
  exampleName: string;
  description: string;
  visual: string;
}

const GEOMETRIES: Geometry[] = [
  {
    id: 'linear',
    name: 'Línuleg',
    nameEn: 'Linear',
    electronDomains: 2,
    bondingPairs: 2,
    lonePairs: 0,
    electronGeometry: 'Línuleg',
    molecularGeometry: 'Línuleg',
    bondAngle: '180°',
    example: 'CO₂',
    exampleName: 'Koldíoxíð',
    description: 'Tvö rafeindasvið staðsetjast á sitthvora hlið miðatómsins.',
    visual: '○—●—○',
  },
  {
    id: 'trigonal-planar',
    name: 'Þríhyrnd slétt',
    nameEn: 'Trigonal Planar',
    electronDomains: 3,
    bondingPairs: 3,
    lonePairs: 0,
    electronGeometry: 'Þríhyrnd slétt',
    molecularGeometry: 'Þríhyrnd slétt',
    bondAngle: '120°',
    example: 'BF₃',
    exampleName: 'Bórþríflúoríð',
    description: 'Þrjú rafeindasvið dreifast jafnt í sléttu þríhyrningsformi.',
    visual: '○╲\n  ●\n○╱ ╲○',
  },
  {
    id: 'bent-2',
    name: 'Beygð (2 bp)',
    nameEn: 'Bent',
    electronDomains: 3,
    bondingPairs: 2,
    lonePairs: 1,
    electronGeometry: 'Þríhyrnd slétt',
    molecularGeometry: 'Beygð',
    bondAngle: '<120°',
    example: 'SO₂',
    exampleName: 'Brennisteinsdíoxíð',
    description: 'Stakt par ýtir bindandi pörum saman — lægra horn.',
    visual: '○╲  ::\n  ●\n○╱',
  },
  {
    id: 'tetrahedral',
    name: 'Ferflötungur',
    nameEn: 'Tetrahedral',
    electronDomains: 4,
    bondingPairs: 4,
    lonePairs: 0,
    electronGeometry: 'Ferflötungur',
    molecularGeometry: 'Ferflötungur',
    bondAngle: '109,5°',
    example: 'CH₄',
    exampleName: 'Metan',
    description: 'Fjögur rafeindasvið í þrívíðri ferflötungsröðun.',
    visual: '    ○\n    |\n○—●—○\n    |\n    ○',
  },
  {
    id: 'trigonal-pyramidal',
    name: 'Þríhyrnd pýramída',
    nameEn: 'Trigonal Pyramidal',
    electronDomains: 4,
    bondingPairs: 3,
    lonePairs: 1,
    electronGeometry: 'Ferflötungur',
    molecularGeometry: 'Þríhyrnd pýramída',
    bondAngle: '107°',
    example: 'NH₃',
    exampleName: 'Ammóníak',
    description: 'Stakt par ofan á þremur bindandi — pýramídalögun.',
    visual: '    ::\n    |\n○—●—○\n    |\n    ○',
  },
  {
    id: 'bent-4',
    name: 'Beygð (2 lp)',
    nameEn: 'Bent',
    electronDomains: 4,
    bondingPairs: 2,
    lonePairs: 2,
    electronGeometry: 'Ferflötungur',
    molecularGeometry: 'Beygð',
    bondAngle: '104,5°',
    example: 'H₂O',
    exampleName: 'Vatn',
    description: 'Tvö stök pör þrýsta bindandi pörum saman.',
    visual: '  ::  ::\n    \\ /\n○—●—○',
  },
  {
    id: 'trigonal-bipyramidal',
    name: 'Þríhyrnd tvípýramída',
    nameEn: 'Trigonal Bipyramidal',
    electronDomains: 5,
    bondingPairs: 5,
    lonePairs: 0,
    electronGeometry: 'Þríhyrnd tvípýramída',
    molecularGeometry: 'Þríhyrnd tvípýramída',
    bondAngle: '90° og 120°',
    example: 'PCl₅',
    exampleName: 'Fosfórpentaklóríð',
    description: 'Fimm rafeindasvið — þrjú í miðsléttunni (120°), tvö lóðrétt (90°).',
    visual: '    ○\n    |\n○-●-○\n   /|\\\n  ○ ○',
  },
  {
    id: 'octahedral',
    name: 'Áttflötungur',
    nameEn: 'Octahedral',
    electronDomains: 6,
    bondingPairs: 6,
    lonePairs: 0,
    electronGeometry: 'Áttflötungur',
    molecularGeometry: 'Áttflötungur',
    bondAngle: '90°',
    example: 'SF₆',
    exampleName: 'Brennisteinshexaflúoríð',
    description: 'Sex rafeindasvið í samhverfri áttflötungsröðun.',
    visual: '    ○\n    |\n○-●-○\n   /|\n  ○ ○\n    |\n    ○',
  },
];

interface Challenge {
  id: number;
  type: 'identify' | 'electron_domains' | 'molecular_vs_electron' | 'angle' | 'lone_pair_effect';
  question: string;
  geometryId?: string;
  options: { id: string; text: string; correct: boolean; explanation: string }[];
  hints: TieredHints;
}

const challenges: Challenge[] = [
  {
    id: 1,
    type: 'identify',
    question: 'Hvaða lögun hefur CO₂ (koldíoxíð)?',
    geometryId: 'linear',
    options: [
      {
        id: 'a',
        text: 'Línuleg',
        correct: true,
        explanation: 'CO₂ hefur 2 rafeindasvið sem staðsetjast 180° í sundur.',
      },
      {
        id: 'b',
        text: 'Beygð',
        correct: false,
        explanation: 'Beygð lögun krefst stakra para á miðatómi.',
      },
      {
        id: 'c',
        text: 'Þríhyrnd slétt',
        correct: false,
        explanation: 'Þríhyrnd slétt hefur 3 rafeindasvið, ekki 2.',
      },
      {
        id: 'd',
        text: 'Ferflötungur',
        correct: false,
        explanation: 'Ferflötungur hefur 4 rafeindasvið.',
      },
    ],
    hints: {
      topic: 'Þetta snýst um VSEPR lögun miðað við fjölda rafeindasviða.',
      strategy: 'Teldu rafeindasvið á miðatóminu (C). Tvöföldar tengingar telja sem eitt svið.',
      method: 'CO₂ hefur tvöfalda tengingu við hvort súrefnisatóm = 2 rafeindasvið.',
      solution: '2 rafeindasvið staðsetjast 180° í sundur = línuleg lögun.',
    },
  },
  {
    id: 2,
    type: 'electron_domains',
    question: 'Hversu mörg rafeindasvið (electron domains) hefur vatn (H₂O)?',
    geometryId: 'bent-4',
    options: [
      {
        id: 'a',
        text: '2 rafeindasvið',
        correct: false,
        explanation: 'Þú telur aðeins bindandi pörin.',
      },
      {
        id: 'b',
        text: '3 rafeindasvið',
        correct: false,
        explanation: 'Þig vantar eitt stakt par.',
      },
      {
        id: 'c',
        text: '4 rafeindasvið',
        correct: true,
        explanation: 'Rétt! 2 bindandi pör + 2 stök pör = 4 rafeindasvið.',
      },
      {
        id: 'd',
        text: '6 rafeindasvið',
        correct: false,
        explanation: 'Það eru aðeins 4 rafeindapör í ysta hvolfi súrefnis.',
      },
    ],
    hints: {
      topic: 'Mundu að telja bæði bindandi og stök pör.',
      strategy: 'Rafeindasvið = bindandi pör + stök pör á miðatóminu.',
      method: 'Súrefni hefur 6 gildisrafeindir. 2 fara í O-H tengingar, 4 mynda 2 stök pör.',
      solution: '2 bindandi pör + 2 stök pör = 4 rafeindasvið.',
    },
  },
  {
    id: 3,
    type: 'molecular_vs_electron',
    question: 'NH₃ (ammóníak) hefur ferflötungs RAFEINDALÖGUN en hvaða SAMEINDARLÖGUN?',
    geometryId: 'trigonal-pyramidal',
    options: [
      {
        id: 'a',
        text: 'Ferflötungur',
        correct: false,
        explanation: 'Sameindarlögun tekur ekki tillit til stöku paranna.',
      },
      {
        id: 'b',
        text: 'Þríhyrnd pýramída',
        correct: true,
        explanation: 'Rétt! Stakt par á toppnum er ekki sýnilegt í sameindarlögun.',
      },
      {
        id: 'c',
        text: 'Þríhyrnd slétt',
        correct: false,
        explanation: 'Þríhyrnd slétt er 2D, NH₃ er 3D pýramída.',
      },
      {
        id: 'd',
        text: 'Línuleg',
        correct: false,
        explanation: 'Línuleg hefur aðeins 2 rafeindasvið.',
      },
    ],
    hints: {
      topic: 'Munurinn á rafeindalögun og sameindarlögun.',
      strategy: 'Sameindarlögun lýsir aðeins stöðu atóma, ekki stakra para.',
      method: 'NH₃: 4 rafeindasvið (3 bp + 1 lp). Sameindarlögun sýnir aðeins 3 bindandi pörin.',
      solution: 'Þríhyrnd pýramída - 3 H atóm í botninum, N á toppnum, stakt par ósýnilegt.',
    },
  },
  {
    id: 4,
    type: 'angle',
    question: 'Hvert er tengihorn í ferflötungssameindum (eins og CH₄)?',
    geometryId: 'tetrahedral',
    options: [
      {
        id: 'a',
        text: '90°',
        correct: false,
        explanation: '90° er fyrir áttflötung (octahedral).',
      },
      {
        id: 'b',
        text: '109,5°',
        correct: true,
        explanation: 'Rétt! Þetta er hornið sem hámarkar fjarlægð milli 4 rafeindasviða.',
      },
      {
        id: 'c',
        text: '120°',
        correct: false,
        explanation: '120° er fyrir þríhyrnda slétta lögun.',
      },
      { id: 'd', text: '180°', correct: false, explanation: '180° er fyrir línulega lögun.' },
    ],
    hints: {
      topic: 'Tengihorn ákvarðast af fjölda rafeindasviða.',
      strategy: 'Hornið hámarkar fjarlægð milli rafeindasviða í þrívíðri röðun.',
      method: '4 rafeindasvið í þrívídd = ferflötungur. Hornið er milli 90° og 120°.',
      solution: '109,5° - þetta er nákvæmt ferflötungshorn.',
    },
  },
  {
    id: 5,
    type: 'lone_pair_effect',
    question: 'Af hverju er tengihorn í H₂O (104,5°) minna en í CH₄ (109,5°)?',
    options: [
      {
        id: 'a',
        text: 'Súrefni er minna atóm',
        correct: false,
        explanation: 'Stærð atóms hefur lítil áhrif á hornið.',
      },
      {
        id: 'b',
        text: 'Stök pör hrinda meira en bindandi pör',
        correct: true,
        explanation: 'Rétt! Stök pör taka meira pláss og ýta bindandi pörum saman.',
      },
      {
        id: 'c',
        text: 'Vatn er fljótandi',
        correct: false,
        explanation: 'Eðlisástand hefur ekki áhrif á lögun.',
      },
      {
        id: 'd',
        text: 'Vetni er léttara en kolefni',
        correct: false,
        explanation: 'Massinn hefur ekki áhrif á tengihorn.',
      },
    ],
    hints: {
      topic: 'Áhrif stakra para á tengihorn.',
      strategy: 'Hugsaðu um það sem „tekur meira pláss" í kringum miðatómið.',
      method: 'Stök pör eru nær kjarna og dreifa sér meira en bindandi pör.',
      solution: 'Stök pör hrinda meira og ýta bindandi pörum saman = minna horn.',
    },
  },
  {
    id: 6,
    type: 'identify',
    question: 'Hvaða lögun hefur BF₃ (bórþríflúoríð)?',
    geometryId: 'trigonal-planar',
    options: [
      {
        id: 'a',
        text: 'Þríhyrnd pýramída',
        correct: false,
        explanation: 'Pýramída hefur stakt par á miðatóminu.',
      },
      {
        id: 'b',
        text: 'Þríhyrnd slétt',
        correct: true,
        explanation: 'Rétt! 3 bindandi pör, engin stök pör — slétt 120° lögun.',
      },
      { id: 'c', text: 'Beygð', correct: false, explanation: 'Beygð lögun hefur stök pör.' },
      {
        id: 'd',
        text: 'Ferflötungur',
        correct: false,
        explanation: 'Ferflötungur hefur 4 rafeindasvið, ekki 3.',
      },
    ],
    hints: {
      topic: 'VSEPR lögun með 3 rafeindasvið.',
      strategy: 'Athugaðu hvort miðatómið hefur stök pör.',
      method: 'Bór hefur aðeins 3 gildisrafeindir og myndar ekki stök pör.',
      solution: '3 bindandi pör, 0 stök = þríhyrnd slétt lögun (120°).',
    },
  },
  {
    id: 7,
    type: 'molecular_vs_electron',
    question: 'SF₆ hefur 6 rafeindasvið. Hvað heitir þessi lögun?',
    geometryId: 'octahedral',
    options: [
      {
        id: 'a',
        text: 'Sexflötungur',
        correct: false,
        explanation: 'Sexflötungur er ekki algengur í VSEPR.',
      },
      {
        id: 'b',
        text: 'Áttflötungur',
        correct: true,
        explanation: 'Rétt! 6 rafeindasvið í 90° sundur — áttflötungur.',
      },
      {
        id: 'c',
        text: 'Þríhyrnd tvípýramída',
        correct: false,
        explanation: 'Þríhyrnd tvípýramída hefur 5 rafeindasvið.',
      },
      { id: 'd', text: 'Kúla', correct: false, explanation: 'Kúla er ekki VSEPR lögun.' },
    ],
    hints: {
      topic: 'VSEPR lögun með 6 rafeindasvið.',
      strategy: 'Nafnið kemur frá fjölda flata á fasta efninu sem lýsir þessari röðun.',
      method: '6 rafeindasvið í samhverfri röðun, öll 90° frá hvoru öðru.',
      solution: 'Áttflötungur (octahedral) - fasta efnið hefur 8 fleti.',
    },
  },
  {
    id: 8,
    type: 'electron_domains',
    question: 'PCl₅ hefur 5 rafeindasvið. Hvað heitir þessi rafeindalögun?',
    geometryId: 'trigonal-bipyramidal',
    options: [
      {
        id: 'a',
        text: 'Fimmflötungur',
        correct: false,
        explanation: 'Þetta er ekki staðlað VSEPR nafn.',
      },
      {
        id: 'b',
        text: 'Áttflötungur',
        correct: false,
        explanation: 'Áttflötungur hefur 6 rafeindasvið.',
      },
      {
        id: 'c',
        text: 'Þríhyrnd tvípýramída',
        correct: true,
        explanation: 'Rétt! 3 á miðsléttu (120°) + 2 lóðrétt (90°).',
      },
      {
        id: 'd',
        text: 'Ferflötungur',
        correct: false,
        explanation: 'Ferflötungur hefur 4 rafeindasvið.',
      },
    ],
    hints: {
      topic: 'VSEPR lögun með 5 rafeindasvið.',
      strategy: 'Hugsaðu um tvær mismunandi stöður - miðslétta og ás.',
      method: '3 stöður á miðsléttu (120°) + 2 stöður lóðrétt á ásnum (90°).',
      solution: 'Þríhyrnd tvípýramída - trigonal bipyramidal.',
    },
  },
];

/**
 * Stig 1's four explore widgets, as phone-only tabs (design §4). On a phone the
 * shape picker comes first and one widget shows at a time under it; everywhere
 * else the widgets stack as they always have. The labels are the widgets' own
 * headings, and the shape description's is `Lýsing`.
 */
const EXPLORE_TABS = [
  { id: 'repulsion', label: 'Fráhrinding' },
  { id: 'transition', label: 'Lögunarbreyting' },
  { id: 'angle', label: 'Tengihorn' },
  { id: 'details', label: 'Lýsing' },
] as const;
type ExploreTab = (typeof EXPLORE_TABS)[number]['id'];

/** Arrow keys, Home and End move along a row of radios or tabs (roving tabindex). */
function stepIndex(key: string, index: number, count: number): number | null {
  if (key === 'ArrowRight' || key === 'ArrowDown') return (index + 1) % count;
  if (key === 'ArrowLeft' || key === 'ArrowUp') return (index - 1 + count) % count;
  if (key === 'Home') return 0;
  if (key === 'End') return count - 1;
  return null;
}

export function Level1({ onComplete, onBack }: Level1Props) {
  const [phase, setPhase] = useState<'explore' | 'quiz'>('explore');
  const [selectedGeometry, setSelectedGeometry] = useState<Geometry | null>(null);
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [tab, setTab] = useState<ExploreTab>('repulsion');
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hintMultiplier, setHintMultiplier] = useState(1.0);
  const [hintsUsedTier, setHintsUsedTier] = useState(0);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [, setTotalHintsUsed] = useState(0);
  const phone = useIsPhone();

  const challenge = challenges[currentChallenge];

  // Starting the questions and going back replace the screen: on a phone it starts at its
  // top, and focus goes to its heading (the quiz has none, so to the question). Each new
  // question brings the card's top back on a phone and focuses the question. Between a
  // phone and md the old jump to the top of the page stays.
  const questionRef = useRef<HTMLParagraphElement>(null);
  useScreenTop(phase, { focus: phase === 'quiz' ? questionRef : undefined });
  const cardRef = useItemTop<HTMLDivElement>(currentChallenge);
  useTabletTopOnChange(phase);
  useTabletTopOnChange(currentChallenge);

  // After Athuga: the question through Næsta if it fits (else the student's choice, else
  // the verdict at the top), and focus on the feedback, not on Næsta, so a second Enter
  // lands on nothing (design P3).
  const chosenRef = useRef<HTMLButtonElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  useRevealAfterCommit(showResult, () => ({
    bottom: nextRef.current,
    tops: [questionRef.current, chosenRef.current, feedbackRef.current],
    focus: feedbackRef.current,
  }));
  // A double tap on Athuga must not land on Næsta.
  const armed = useArmedAfter(400, `${currentChallenge}:${showResult}`);
  // Opening the hint replaces its link with the hint, which pushed Athuga down and dropped
  // focus to <body> with the link: keep the hint through Athuga in view on a phone, and move
  // focus to the hint (design §3, hints).
  const hintRef = useRef<HTMLDivElement>(null);
  const checkRef = useRef<HTMLButtonElement>(null);
  useRevealAfterCommit(showHint, () => ({
    bottom: checkRef.current,
    tops: [hintRef.current],
    focus: hintRef.current,
  }));

  // A picked shape changes what the widgets below the picker show. On a phone, keep the
  // picker and the open tab in view together when they fit, else the tabs and the open
  // tab from its top (design §3, explore). Between a phone and md
  // the details panel opens below the shape grid, under the fold, and is brought into view
  // as it always was; from md up it opens in view, so the page is left alone.
  const pickerRef = useRef<HTMLDivElement>(null);
  const tablistRef = useRef<HTMLDivElement>(null);
  const panelsRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!selectedGeometry) return;
    if (phone) revealSpan(panelsRef.current, [pickerRef.current, tablistRef.current]);
    else if (tabletBelowMd()) revealSpan(detailsRef.current, [], { anyWidth: true, gap: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: only a new pick reveals
  }, [selectedGeometry]);

  // Shuffle options for current challenge - memoize to keep stable during challenge
  const shuffledOptions = useMemo(() => {
    const shuffled = shuffleArray(challenge.options);
    // Assign new sequential IDs (a, b, c, d) after shuffling
    return shuffled.map((opt, idx) => ({
      ...opt,
      id: String.fromCharCode(97 + idx), // 'a', 'b', 'c', 'd'
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: re-shuffle when challenge index changes
  }, [currentChallenge, challenge.options]);

  const basePoints = 15;

  const checkAnswer = () => {
    const selected = shuffledOptions.find((opt) => opt.id === selectedOption);
    const correct = selected?.correct ?? false;
    setIsCorrect(correct);
    if (correct) {
      const earnedPoints = Math.round(basePoints * hintMultiplier);
      setScore((prev) => prev + earnedPoints);
    }
    setShowResult(true);
  };

  const nextChallenge = () => {
    // Track hints used for this question
    if (hintsUsedTier > 0) {
      setTotalHintsUsed((prev) => prev + hintsUsedTier);
    }

    if (currentChallenge < challenges.length - 1) {
      setCurrentChallenge((prev) => prev + 1);
      setSelectedOption(null);
      setShowResult(false);
      setShowHint(false);
      setHintMultiplier(1.0);
      setHintsUsedTier(0);
      setIsCorrect(false);
    } else {
      onComplete(score);
    }
  };

  // Exploration phase
  if (phase === 'explore') {
    const repulsion = (
      <ElectronRepulsionAnimation
        geometryId={selectedGeometry?.id || 'tetrahedral'}
        showForces={true}
        compact={phone}
      />
    );
    const transition = (
      <ShapeTransitionAnimation
        compact={true}
        showControls={true}
        initialDomains={selectedGeometry?.electronDomains || 4}
      />
    );

    // The shape picker. On a phone it is a radio group (one shape is chosen at a time) and
    // comes first, each chip the shape and its example on one line; the English name, which
    // restates the Icelandic one, is kept for a screen reader only. Elsewhere it is the grid
    // it was.
    const pickIndex = selectedGeometry
      ? GEOMETRIES.findIndex((g) => g.id === selectedGeometry.id)
      : -1;
    const onPickKey = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
      const to = stepIndex(e.key, index, GEOMETRIES.length);
      if (to === null) return;
      e.preventDefault();
      setSelectedGeometry(GEOMETRIES[to]);
      pickerRef.current?.querySelectorAll<HTMLButtonElement>('button')[to]?.focus();
    };
    const picker = (
      <div
        ref={pickerRef}
        className="grid grid-cols-1 min-[360px]:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-8 phone:grid-cols-2 phone-land:grid-cols-4 phone:gap-2 phone:mb-3"
        {...(phone
          ? { role: 'radiogroup', 'aria-labelledby': 'vsepr-explore-heading' }
          : undefined)}
      >
        {GEOMETRIES.map((geo, index) => (
          <button
            key={geo.id}
            onClick={() => setSelectedGeometry(geo)}
            {...(phone
              ? {
                  role: 'radio',
                  'aria-checked': selectedGeometry?.id === geo.id,
                  tabIndex: index === Math.max(pickIndex, 0) ? 0 : -1,
                  onKeyDown: (e: KeyboardEvent<HTMLButtonElement>) => onPickKey(e, index),
                }
              : undefined)}
            className={`p-2 sm:p-4 phone:px-2 phone:py-1.5 phone:min-h-11 rounded-xl border-2 transition-all text-center ${
              selectedGeometry?.id === geo.id
                ? 'border-teal-500 bg-teal-50 shadow-lg'
                : 'border-warm-200 hover:border-teal-300 hover:bg-teal-50/50'
            }`}
          >
            <div className="text-base sm:text-lg font-bold text-warm-800 phone:text-sm phone:inline">
              {geo.name}
            </div>
            <div className="text-xs text-warm-500 phone:sr-only">{geo.nameEn}</div>
            <div className="text-sm text-teal-600 mt-1 phone:inline phone:text-xs phone:mt-0 phone:ml-1.5">
              {geo.example}
            </div>
          </button>
        ))}
      </div>
    );

    // The chosen shape's picture and numbers: the details panel's first half.
    const description = selectedGeometry && (
      <div className="flex flex-col md:flex-row gap-6 phone:gap-3">
        {/* Visual representation */}
        <div className="flex-1">
          {/* 2D/3D Toggle */}
          <div className="flex justify-center gap-2 mb-3 phone:mb-2">
            <button
              onClick={() => setViewMode('2d')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors pointer-coarse:min-h-11 ${
                viewMode === '2d'
                  ? 'bg-teal-600 text-white'
                  : 'bg-warm-200 text-warm-600 hover:bg-warm-300'
              }`}
            >
              2D
            </button>
            <button
              onClick={() => setViewMode('3d')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors pointer-coarse:min-h-11 ${
                viewMode === '3d'
                  ? 'bg-teal-600 text-white'
                  : 'bg-warm-200 text-warm-600 hover:bg-warm-300'
              }`}
            >
              3D
            </button>
          </div>

          <div className="bg-warm-900 rounded-xl p-3 sm:p-6 flex items-center justify-center min-h-48 phone:p-2 phone:min-h-0">
            <div className="text-center w-full">
              {viewMode === '2d' ? (
                <AnimatedMolecule
                  molecule={geometryToMolecule({
                    id: selectedGeometry.id,
                    example: selectedGeometry.example,
                    exampleName: selectedGeometry.exampleName,
                    bondingPairs: selectedGeometry.bondingPairs,
                    lonePairs: selectedGeometry.lonePairs,
                  })}
                  mode="vsepr"
                  size="lg"
                  fit
                  animation="scale-in"
                  showLonePairs={true}
                  ariaLabel={`${selectedGeometry.name} lögun: ${selectedGeometry.example}`}
                />
              ) : (
                <MoleculeViewer3DLazy
                  molecule={geometryToMolecule({
                    id: selectedGeometry.id,
                    example: selectedGeometry.example,
                    exampleName: selectedGeometry.exampleName,
                    bondingPairs: selectedGeometry.bondingPairs,
                    lonePairs: selectedGeometry.lonePairs,
                  })}
                  style="ball-stick"
                  showLabels={true}
                  autoRotate={true}
                  autoRotateSpeed={1.5}
                  height={200}
                  backgroundColor="transparent"
                />
              )}
              {/* On a phone the formula and its name share one line. */}
              <div className="text-2xl font-bold text-teal-400 mt-4 phone:text-xl phone:mt-1 phone:inline phone:mr-2">
                {selectedGeometry.example}
              </div>
              <div className="text-warm-400 phone:inline">{selectedGeometry.exampleName}</div>
              {viewMode === '3d' && (
                <div className="text-xs text-warm-500 mt-2">
                  Dragðu til að snúa; klíptu eða skrunaðu til að stækka
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 space-y-4 phone:space-y-2">
          <h3
            className="text-xl font-bold text-teal-800 phone:text-lg"
            aria-live={phone ? 'polite' : undefined}
          >
            {selectedGeometry.name}
          </h3>
          <p className="text-warm-700">{selectedGeometry.description}</p>

          <div className="grid grid-cols-2 gap-3 text-sm phone:gap-2">
            <div className="bg-white p-3 rounded-lg phone:p-2">
              <div className="text-warm-500">Rafeindasvið</div>
              <div className="font-bold text-warm-800">{selectedGeometry.electronDomains}</div>
            </div>
            <div className="bg-white p-3 rounded-lg phone:p-2">
              <div className="text-warm-500">Bindandi pör</div>
              <div className="font-bold text-blue-600">{selectedGeometry.bondingPairs}</div>
            </div>
            <div className="bg-white p-3 rounded-lg phone:p-2">
              <div className="text-warm-500">Stök pör</div>
              <div className="font-bold text-yellow-600">{selectedGeometry.lonePairs}</div>
            </div>
            <div className="bg-white p-3 rounded-lg phone:p-2">
              <div className="text-warm-500">Tengihorn</div>
              <div className="font-bold text-teal-600">{selectedGeometry.bondAngle}</div>
            </div>
          </div>

          <div className="bg-white p-3 rounded-lg phone:p-2">
            <div className="text-warm-500 text-sm">Rafeindalögun</div>
            <div className="font-bold text-purple-600">{selectedGeometry.electronGeometry}</div>
          </div>
          <div className="bg-white p-3 rounded-lg phone:p-2">
            <div className="text-warm-500 text-sm">Sameindarlögun</div>
            <div className="font-bold text-teal-600">{selectedGeometry.molecularGeometry}</div>
          </div>
        </div>
      </div>
    );

    const onTabKey = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
      const to = stepIndex(e.key, index, EXPLORE_TABS.length);
      if (to === null) return;
      e.preventDefault();
      setTab(EXPLORE_TABS[to].id);
      document.getElementById(`vsepr-tab-${EXPLORE_TABS[to].id}`)?.focus();
    };
    const panel = (id: ExploreTab) => ({
      id: `vsepr-panel-${id}`,
      role: 'tabpanel',
      'aria-labelledby': `vsepr-tab-${id}`,
      hidden: tab !== id,
    });

    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6 phone:mb-2">
            <button
              onClick={onBack}
              className="text-warm-600 hover:text-warm-800 flex items-center gap-2 pointer-coarse:min-h-11"
            >
              <span>&larr;</span> Til baka
            </button>
            <div className="text-sm text-warm-600">Stig 1: Könnun</div>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 mb-6 phone:p-3 phone:mb-3">
            <h2
              id="vsepr-explore-heading"
              className="text-2xl font-bold text-teal-800 mb-4 phone:text-xl phone:mb-2"
            >
              Kannaðu mismunandi sameindarlögun
            </h2>
            <p className="text-warm-600 mb-6 phone:text-sm phone:mb-3">
              Smelltu á lögun til að sjá dæmi og útskýringu. Þegar þú ert tilbúinn, haltu áfram í
              spurningar.
            </p>

            {phone ? (
              <>
                {picker}
                <div
                  ref={tablistRef}
                  role="tablist"
                  aria-labelledby="vsepr-explore-heading"
                  className="grid grid-cols-2 phone-land:grid-cols-4 gap-1.5 mb-3"
                >
                  {EXPLORE_TABS.map((t, index) => (
                    <button
                      key={t.id}
                      id={`vsepr-tab-${t.id}`}
                      role="tab"
                      aria-selected={tab === t.id}
                      aria-controls={`vsepr-panel-${t.id}`}
                      tabIndex={tab === t.id ? 0 : -1}
                      onClick={() => setTab(t.id)}
                      onKeyDown={(e) => onTabKey(e, index)}
                      className={`min-h-11 px-1.5 py-1.5 rounded-lg text-sm max-[359px]:text-xs font-medium transition-colors ${
                        tab === t.id
                          ? 'bg-teal-600 text-white'
                          : 'bg-warm-100 text-warm-700 hover:bg-warm-200'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                {/* Every widget stays mounted, so nothing loses its state when the student
                    switches tabs. */}
                <div ref={panelsRef}>
                  <div {...panel('repulsion')}>{repulsion}</div>
                  <div {...panel('transition')}>{transition}</div>
                  <div {...panel('angle')}>
                    <BondAngleMeasurement
                      geometryId={selectedGeometry?.id}
                      showComparison={false}
                    />
                  </div>
                  <div {...panel('details')}>
                    {selectedGeometry ? (
                      <div className="bg-teal-50 rounded-xl p-3 animate-slide-in">
                        {description}
                      </div>
                    ) : (
                      <p className="bg-teal-50 rounded-xl p-3 text-warm-600 text-sm">
                        Smelltu á lögun til að sjá dæmi og útskýringu.
                      </p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Electron Repulsion Animation */}
                <div className="mb-8">{repulsion}</div>

                {/* Shape Transition Animation */}
                <div className="mb-8">{transition}</div>

                {picker}

                {selectedGeometry && (
                  <div
                    ref={detailsRef}
                    className="bg-teal-50 rounded-xl p-3 sm:p-6 animate-slide-in"
                  >
                    {description}

                    {/* Bond Angle Measurement */}
                    <div className="mt-6">
                      <BondAngleMeasurement
                        geometryId={selectedGeometry.id}
                        showComparison={false}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <button
            onClick={() => setPhase('quiz')}
            className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-4 px-6 rounded-xl transition-colors"
          >
            Hefja spurningar →
          </button>
        </div>
      </div>
    );
  }

  // Quiz phase
  const correctOption = shuffledOptions.find((opt) => opt.correct);
  // The panel heads itself Rétt!/Rangt, and several explanations open
  // with their own "Rétt!", which a wrong answer must not be shown.
  const why = (correctOption?.explanation ?? '').replace(/^Rétt!\s*/, '');
  const geo = challenge.geometryId
    ? GEOMETRIES.find((g) => g.id === challenge.geometryId)
    : undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* On a phone the counters share one line (P4), so the row is one line tall. */}
        <div className="flex items-center justify-between mb-6 phone:mb-2 phone:gap-3">
          <button
            onClick={() => setPhase('explore')}
            className="text-warm-600 hover:text-warm-800 flex items-center gap-2 pointer-coarse:min-h-11 phone:shrink-0"
          >
            <span>&larr;</span> Til baka
          </button>
          <div className="text-right phone:flex phone:flex-wrap phone:items-baseline phone:justify-end phone:gap-x-2 phone:min-w-0">
            <div className="text-sm text-warm-600">
              Spurning {currentChallenge + 1} af {challenges.length}
            </div>
            <div className="text-lg font-bold text-teal-600 phone:text-base">{score} stig</div>
          </div>
        </div>

        <div className="w-full bg-warm-200 rounded-full h-2 mb-6 phone:h-1.5 phone:mb-3">
          <div
            className="bg-teal-500 h-2 phone:h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${((currentChallenge + 1) / challenges.length) * 100}%` }}
          />
        </div>

        <div ref={cardRef} className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 phone:p-3">
          {/* A phone on its side: the question and the molecule | the choices and the
              feedback. The two groups are plain blocks, so desktop margins are unchanged. */}
          <div className="phone-land:grid phone-land:grid-cols-2 phone-land:gap-4 phone-land:items-start">
            <div>
              <p
                ref={questionRef}
                data-item-start
                className="text-warm-700 text-lg mb-6 phone:text-base phone:mb-3"
              >
                {challenge.question}
              </p>

              {/* Show relevant geometry visual if available */}
              {geo && (
                <div className="bg-warm-900 p-3 sm:p-4 rounded-xl mb-6 flex flex-col items-center phone:p-2 phone:mb-3">
                  <AnimatedMolecule
                    molecule={geometryToMolecule({
                      id: geo.id,
                      example: geo.example,
                      exampleName: geo.exampleName,
                      bondingPairs: geo.bondingPairs,
                      lonePairs: geo.lonePairs,
                    })}
                    mode="vsepr"
                    size="md"
                    fit
                    animation="fade-in"
                    showLonePairs={true}
                    // Not the shape's name: several questions ask for it.
                    ariaLabel={`Sameindin ${geo.example}`}
                  />
                  <div className="text-warm-300 text-sm mt-2 font-medium phone:mt-1">
                    {geo.example}
                  </div>
                </div>
              )}
            </div>

            <div>
              <div className="space-y-3 mb-6 phone:space-y-2 phone:mb-3">
                {shuffledOptions.map((option) => (
                  <button
                    key={option.id}
                    ref={selectedOption === option.id ? chosenRef : undefined}
                    onClick={() => !showResult && setSelectedOption(option.id)}
                    disabled={showResult}
                    className={`w-full p-4 phone:p-3 rounded-xl border-2 text-left transition-all ${
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
                      // On a phone, a right answer's note is hidden when the feedback below
                      // says exactly the same thing; a wrong answer's note always shows.
                      <div
                        className={`mt-2 text-sm ${option.correct ? 'text-green-700' : 'text-red-700'} ${
                          option.correct && option.explanation === why ? 'phone:hidden' : ''
                        }`}
                      >
                        {option.explanation}
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {!showResult && !showHint && (
                <button
                  onClick={() => {
                    setShowHint(true);
                    setTotalHintsUsed((prev) => prev + 1);
                  }}
                  className="text-teal-600 hover:text-teal-800 text-sm underline mb-4 pointer-coarse:min-h-11 phone:mb-2"
                >
                  Sýna vísbendingu
                </button>
              )}

              {showHint && !showResult && (
                <div
                  ref={hintRef}
                  className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl mb-4 phone:p-3 phone:mb-3"
                >
                  <span className="font-bold text-yellow-800">Vísbending: </span>
                  <span className="text-yellow-900">{challenge.hints.topic}</span>
                </div>
              )}

              {/* Athuga and Næsta are separate elements (keyed), never one button relabelled,
                  and Næsta ignores a press within 400 ms of appearing. */}
              {!showResult && (
                <button
                  key="check"
                  ref={checkRef}
                  onClick={checkAnswer}
                  disabled={!selectedOption}
                  className="w-full bg-teal-500 hover:bg-teal-600 disabled:bg-warm-300 text-white font-bold py-4 px-6 rounded-xl transition-colors"
                >
                  Athuga svar
                </button>
              )}

              {showResult && (
                <>
                  {/* The feedback region focus moves to after Athuga (P3). FeedbackPanel is
                      itself role=alert and announces the verdict. */}
                  <div ref={feedbackRef} tabIndex={-1} role="group" className="mb-4">
                    <FeedbackPanel
                      feedback={{
                        isCorrect,
                        explanation: why,
                        misconception: isCorrect ? undefined : MISCONCEPTION_FOR[challenge.type],
                        relatedConcepts: VSEPR_RELATED,
                        nextSteps: isCorrect
                          ? 'Frábært! Þú skilur VSEPR vel. Haltu áfram.'
                          : 'Mundu: Teldu rafeindasvið fyrst, síðan athugaðu stök pör.',
                      }}
                      config={{
                        showExplanation: true,
                        showMisconceptions: !isCorrect,
                        showRelatedConcepts: true,
                        showNextSteps: true,
                      }}
                    />
                  </div>
                  <button
                    key="next"
                    ref={nextRef}
                    onClick={armed(nextChallenge)}
                    className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-4 px-6 rounded-xl transition-colors"
                  >
                    {currentChallenge < challenges.length - 1 ? 'Næsta spurning' : 'Ljúka stigi 1'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
