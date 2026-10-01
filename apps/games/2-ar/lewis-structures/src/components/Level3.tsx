import { useMemo, useRef, useState } from 'react';

import { PhoneDisclosure } from '@shared/components';
import {
  shuffleArray,
  useArmedAfter,
  useIsPhone,
  useItemTop,
  useRevealAfterCommit,
} from '@shared/utils';

import { LewisStructure } from './LewisStructure';
import type { LewisDrawing } from '../utils/lewisLayout';

interface Level3Props {
  /** How many of the questions were answered right. The hint never changes it. */
  onComplete: (correct: number, total: number) => void;
  onBack: () => void;
}

interface AtomCharge {
  symbol: string;
  valenceElectrons: number;
  lonePairElectrons: number;
  bondingElectrons: number;
  formalCharge: number;
}

interface Challenge {
  id: number;
  title: string;
  type: 'calculate_fc' | 'best_structure' | 'resonance';
  molecule: string;
  description: string;
  /** The whole molecule, drawn as every structure in the game is. */
  drawing?: LewisDrawing;
  atoms?: AtomCharge[];
  structures?: {
    id: string;
    description: string;
    drawing: LewisDrawing;
    formalCharges: { atom: string; charge: number }[];
    isPreferred: boolean;
    explanation: string;
  }[];
  resonanceForms?: {
    id: string;
    structure: string;
    drawing: LewisDrawing;
    isValid: boolean;
  }[];
  question: string;
  correctAnswer: string | number;
  options?: { id: string; text: string; correct: boolean; explanation: string }[];
  hint: string;
  explanation: string;
}

const challenges: Challenge[] = [
  {
    id: 1,
    title: 'Formleg hleðsla — formúlan',
    type: 'calculate_fc',
    molecule: 'Formleg hleðsla',
    description: 'Formleg hleðsla segir til um hvernig rafeindum er dreift á atóm í Lewis-formúlu.',
    question: 'Hvaða formúla er notuð til að reikna formlega hleðslu?',
    correctAnswer: 'fc_formula',
    options: [
      {
        id: 'fc_formula',
        text: 'FC = Gildisraf. - (óbundnar + ½ bundnar)',
        correct: true,
        explanation: 'Rétt! Þetta er formúlan fyrir formlega hleðslu.',
      },
      {
        id: 'wrong1',
        text: 'FC = Gildisraf. - (óbundnar + bundnar)',
        correct: false,
        explanation: 'Bundnar rafeindir eru sameiginlegar, þannig að þú deilir með 2.',
      },
      {
        id: 'wrong2',
        text: 'FC = Gildisraf. + óbundnar - bundnar',
        correct: false,
        explanation: 'Þú dregur óbundnar og helminginn af bundnum frá gildisrafeindum.',
      },
    ],
    hint: 'Bundnar rafeindir eru sameiginlegar á milli atóma',
    explanation:
      'FC = V - (L + ½B) þar sem V = gildisrafeindir, L = óbundnar rafeindir, B = bundnar rafeindir.',
  },
  {
    id: 2,
    title: 'Reikna formlega hleðslu: Súrefni í vatni',
    type: 'calculate_fc',
    molecule: 'H₂O',
    description:
      'Í vatni hefur súrefni 2 stök pör (4 óbundnar rafeindir) og 2 tengi (4 bundnar rafeindir).',
    drawing: {
      central: { symbol: 'O', lonePairs: 2, formalCharge: 0 },
      outer: [
        { symbol: 'H', bond: 'single', lonePairs: 0 },
        { symbol: 'H', bond: 'single', lonePairs: 0 },
      ],
    },
    atoms: [
      {
        symbol: 'O',
        valenceElectrons: 6,
        lonePairElectrons: 4,
        bondingElectrons: 4,
        formalCharge: 0,
      },
    ],
    question: 'Hver er formleg hleðsla súrefnisins í H₂O?',
    correctAnswer: 0,
    options: [
      {
        id: '-1',
        text: '-1',
        correct: false,
        explanation: 'FC = 6 - (4 + ½×4) = 6 - 6 = 0, ekki -1.',
      },
      {
        id: '0',
        text: '0',
        correct: true,
        explanation: 'Rétt! FC = 6 - (4 + 2) = 0. Súrefnið hefur enga formlega hleðslu.',
      },
      {
        id: '+1',
        text: '+1',
        correct: false,
        explanation: 'Jákvæð formleg hleðsla myndi þýða of fáar rafeindir.',
      },
    ],
    hint: 'FC = 6 - (4 óbundnar + ½ × 4 bundnar)',
    explanation:
      'O í H₂O: FC = 6 - (4 + 2) = 0. Súrefnið hefur enga formlega hleðslu, sem er æskilegt.',
  },
  {
    id: 3,
    title: 'Reikna formlega hleðslu: Nitur í ammóníum',
    type: 'calculate_fc',
    molecule: 'NH₄⁺',
    description:
      'Í ammóníumjóninni er nitur tengt 4 vetnisatómum með eintengjum og hefur engin stök pör.',
    drawing: {
      central: { symbol: 'N', lonePairs: 0, formalCharge: 1 },
      outer: [
        { symbol: 'H', bond: 'single', lonePairs: 0 },
        { symbol: 'H', bond: 'single', lonePairs: 0 },
        { symbol: 'H', bond: 'single', lonePairs: 0 },
        { symbol: 'H', bond: 'single', lonePairs: 0 },
      ],
      ionCharge: 1,
    },
    atoms: [
      {
        symbol: 'N',
        valenceElectrons: 5,
        lonePairElectrons: 0,
        bondingElectrons: 8,
        formalCharge: 1,
      },
    ],
    question: 'Hver er formleg hleðsla nitursins í NH₄⁺?',
    correctAnswer: 1,
    options: [
      {
        id: '0',
        text: '0',
        correct: false,
        explanation: 'Nitur deilir 8 rafeindum en á aðeins 5 gildisrafeindir.',
      },
      {
        id: '+1',
        text: '+1',
        correct: true,
        explanation: 'Rétt! FC = 5 - (0 + ½×8) = 5 - 4 = +1.',
      },
      {
        id: '-1',
        text: '-1',
        correct: false,
        explanation: 'Neikvæð formleg hleðsla myndi þýða fleiri rafeindir en gildisrafeindir.',
      },
    ],
    hint: 'Nitur hefur 5 gildisrafeindir en deilir 8 í tengjum',
    explanation: 'N í NH₄⁺: FC = 5 - (0 + 4) = +1. Þetta samræmist við +1 hleðslu jónarinnar.',
  },
  {
    id: 4,
    title: 'Besta Lewis-formúlan',
    type: 'best_structure',
    molecule: 'CO',
    description:
      'Kolsýringur getur teiknast á mismunandi vegu. Formleg hleðsla hjálpar okkur að velja bestu formúluna.',
    structures: [
      {
        id: 'triple',
        description: 'C≡O (þrítengi)',
        drawing: {
          central: { symbol: 'C', lonePairs: 1, formalCharge: -1 },
          outer: [{ symbol: 'O', bond: 'triple', lonePairs: 1, formalCharge: 1 }],
        },
        formalCharges: [
          { atom: 'C', charge: -1 },
          { atom: 'O', charge: +1 },
        ],
        isPreferred: true,
        explanation:
          'Með þrítengi fá bæði atómin áttund, þó formlegu hleðslurnar (C⁻ og O⁺) séu ekki núll — áttureglan vegur þyngra.',
      },
      {
        id: 'double',
        description: 'C=O (tvítengi)',
        drawing: {
          central: { symbol: 'C', lonePairs: 1 },
          outer: [{ symbol: 'O', bond: 'double', lonePairs: 2 }],
        },
        formalCharges: [
          { atom: 'C', charge: 0 },
          { atom: 'O', charge: 0 },
        ],
        isPreferred: false,
        explanation: 'Kolefni hefur aðeins 6 rafeindir og nær ekki áttund.',
      },
    ],
    question: 'Hver er æskilegasta formúlan fyrir CO?',
    correctAnswer: 'triple',
    options: [
      {
        id: 'triple',
        text: ':C≡O: með þrítengi',
        correct: true,
        explanation: 'Rétt! Bæði atóm hafa 8 rafeindir, þó formlegar hleðslur séu ekki núll.',
      },
      {
        id: 'double',
        text: 'C=O með tvítengi',
        correct: false,
        explanation: 'Kolefni fengi aðeins 6 rafeindir og næði ekki áttund.',
      },
    ],
    hint: 'Áttureglan vegur þyngra en að hafa formlegar hleðslur sem lægstar',
    explanation:
      'Í CO er þrítengi æskilegast þó það gefi formlegu hleðslurnar C⁻ og O⁺, vegna þess að þá fá bæði atómin áttund.',
  },
  {
    id: 5,
    title: 'Vokmyndir I',
    type: 'resonance',
    molecule: 'NO₂⁻',
    description: 'Í nítrítjóninni er N miðatóm, tengt tveimur O-atómum.',
    resonanceForms: [
      {
        id: 'a',
        structure: 'O=N-O⁻',
        drawing: {
          central: { symbol: 'N', lonePairs: 1 },
          outer: [
            { symbol: 'O', bond: 'double', lonePairs: 2 },
            { symbol: 'O', bond: 'single', lonePairs: 3, formalCharge: -1 },
          ],
          ionCharge: -1,
        },
        isValid: true,
      },
      {
        id: 'b',
        structure: '⁻O-N=O',
        drawing: {
          central: { symbol: 'N', lonePairs: 1 },
          outer: [
            { symbol: 'O', bond: 'single', lonePairs: 3, formalCharge: -1 },
            { symbol: 'O', bond: 'double', lonePairs: 2 },
          ],
          ionCharge: -1,
        },
        isValid: true,
      },
    ],
    question: 'Hversu margar vokmyndir hefur NO₂⁻?',
    correctAnswer: '2',
    options: [
      {
        id: '1',
        text: '1 formúla',
        correct: false,
        explanation: 'Tvítengið getur verið við hvort O-atómið sem er.',
      },
      {
        id: '2',
        text: '2 formúlur',
        correct: true,
        explanation: 'Rétt! O=N-O⁻ og ⁻O-N=O eru jafngildar vokmyndir.',
      },
      {
        id: '3',
        text: '3 formúlur',
        correct: false,
        explanation: 'Aðeins tvær eru mögulegar með þessari rafeindasamsetningu.',
      },
    ],
    hint: 'Tvítengið getur verið við hvort O-atómið sem er',
    explanation:
      'NO₂⁻ hefur tvær vokmyndir, með tvítengið við sitt hvort súrefnisatómið. Raunverulega jónin er vokblendingur beggja.',
  },
  {
    id: 6,
    title: 'Vokmyndir II',
    type: 'resonance',
    molecule: 'CO₃²⁻',
    description: 'Karbónatjónin er klassískt dæmi um vok.',
    resonanceForms: [
      {
        id: 'a',
        structure: 'O=C(-O⁻)₂',
        drawing: {
          central: { symbol: 'C', lonePairs: 0 },
          outer: [
            { symbol: 'O', bond: 'double', lonePairs: 2 },
            { symbol: 'O', bond: 'single', lonePairs: 3, formalCharge: -1 },
            { symbol: 'O', bond: 'single', lonePairs: 3, formalCharge: -1 },
          ],
          ionCharge: -2,
        },
        isValid: true,
      },
      {
        id: 'b',
        structure: '⁻O-C(=O)-O⁻',
        drawing: {
          central: { symbol: 'C', lonePairs: 0 },
          outer: [
            { symbol: 'O', bond: 'single', lonePairs: 3, formalCharge: -1 },
            { symbol: 'O', bond: 'double', lonePairs: 2 },
            { symbol: 'O', bond: 'single', lonePairs: 3, formalCharge: -1 },
          ],
          ionCharge: -2,
        },
        isValid: true,
      },
      {
        id: 'c',
        structure: '(⁻O)₂-C=O',
        drawing: {
          central: { symbol: 'C', lonePairs: 0 },
          outer: [
            { symbol: 'O', bond: 'single', lonePairs: 3, formalCharge: -1 },
            { symbol: 'O', bond: 'single', lonePairs: 3, formalCharge: -1 },
            { symbol: 'O', bond: 'double', lonePairs: 2 },
          ],
          ionCharge: -2,
        },
        isValid: true,
      },
    ],
    question: 'Hversu margar vokmyndir hefur CO₃²⁻?',
    correctAnswer: '3',
    options: [
      {
        id: '2',
        text: '2 formúlur',
        correct: false,
        explanation: 'Þrjú súrefni geta hvert um sig haft tvöfalt tengi.',
      },
      {
        id: '3',
        text: '3 formúlur',
        correct: true,
        explanation: 'Rétt! Tvöfalda tengið getur verið á hverju súrefni.',
      },
      {
        id: '4',
        text: '4 formúlur',
        correct: false,
        explanation: 'Með 3 súrefni eru aðeins 3 möguleikar.',
      },
    ],
    hint: 'Hvert súrefni getur haft tvöfalda tengið',
    explanation:
      'CO₃²⁻ hefur þrjár vokmyndir. Öll þrjú C-O tengin eru jafnlöng, á milli lengdar eintengis og tvítengis.',
  },
  {
    id: 7,
    title: 'Raunverulega sameindin',
    type: 'resonance',
    molecule: 'O₃',
    description: 'Ósón hefur tvær vokmyndir.',
    question: 'Hvaða fullyrðing er rétt um ósón (O₃)?',
    correctAnswer: 'hybrid',
    options: [
      {
        id: 'flips',
        text: 'Sameindin skiptir sífellt á milli formúlanna',
        correct: false,
        explanation: 'Nei, sameindin er alltaf vokblendingur - hún breytist ekki.',
      },
      {
        id: 'hybrid',
        text: 'Sameindin er vokblendingur allra formúlanna',
        correct: true,
        explanation: 'Rétt! Raunverulega sameindin er alltaf meðaltal allra vokmyndanna.',
      },
      {
        id: 'one',
        text: 'Aðeins ein formúla er rétt',
        correct: false,
        explanation: 'Báðar formúlur eru jafngildar og sameindin er vokblendingur þeirra.',
      },
    ],
    hint: 'Vokmyndir sýna takmarkanir Lewis-formúla',
    explanation:
      'Vokmyndir eru ekki mismunandi form sameindarinnar. Raunverulega sameindin er einn vokblendingur, meðaltal allra vokmyndanna.',
  },
  {
    id: 8,
    title: 'Formleg hleðsla og stöðugleiki',
    type: 'best_structure',
    molecule: 'SCN⁻',
    description: 'Þíósýanatjónin getur teiknast á nokkra vegu.',
    question: 'Hvaða regla gildir um bestu Lewis-formúluna?',
    correctAnswer: 'minimize',
    options: [
      {
        id: 'maximize',
        text: 'Hámarka formlegar hleðslur',
        correct: false,
        explanation: 'Háar formlegar hleðslur gera sameindir óstöðugri.',
      },
      {
        id: 'minimize',
        text: 'Lágmarka formlegar hleðslur (helst 0)',
        correct: true,
        explanation: 'Rétt! Lægri formlegar hleðslur = stöðugri sameind.',
      },
      {
        id: 'negative',
        text: 'Setja neikvæða hleðslu á C',
        correct: false,
        explanation: 'Neikvæð hleðsla ætti að vera á rafneikvæðasta atóminu.',
      },
    ],
    hint: 'Stöðugri formúlur hafa lægri formlegar hleðslur',
    explanation:
      'Besta Lewis-formúlan hefur: (1) áttund á hverju atómi þar sem það er hægt, (2) sem lægstar formlegar hleðslur, (3) neikvæða hleðslu á rafneikvæðasta atóminu.',
  },
];

export function Level3({ onComplete, onBack }: Level3Props) {
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState(false);
  // Right answers, counted flat (mobile-pass decisions 1 (b) and 2 (b)). Opening
  // the hint used to cut a right answer from 15 points to 8, silently.
  const [correctCount, setCorrectCount] = useState(0);

  const challenge = challenges[currentChallenge];
  // "Næsta þraut" swaps the question in place, so the page kept its offset.
  // Each new question brings the card's top back when it has scrolled off — at
  // any width, as the game's own helper did — and focus moves to its title.
  const cardRef = useItemTop<HTMLDivElement>(currentChallenge, { anyWidth: true, gap: 0 });

  // The data holds the correct option second on 6 of the 8 challenges and first
  // on the other two, so "the middle one" beat reading the question. Shuffled
  // once per challenge, so the list holds still while the student answers.
  // Grading reads each option's own `correct` flag, which travels with it.
  const shuffledOptions = useMemo(
    () => shuffleArray(challenges[currentChallenge].options ?? []),
    [currentChallenge]
  );

  const checkAnswer = () => {
    const correct = challenge.options?.find((opt) => opt.id === selectedAnswer)?.correct ?? false;

    if (correct) setCorrectCount((prev) => prev + 1);

    setShowResult(true);
  };

  const nextChallenge = () => {
    if (currentChallenge < challenges.length - 1) {
      setCurrentChallenge((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setShowHint(false);
    } else {
      onComplete(correctCount, challenges.length);
    }
  };

  const asksForFormula = challenge.correctAnswer === 'fc_formula';
  const isCorrect = challenge.options?.find((opt) => opt.id === selectedAnswer)?.correct ?? false;

  const questionRef = useRef<HTMLParagraphElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const selectedIndex = shuffledOptions.findIndex((opt) => opt.id === selectedAnswer);
  // After "Athuga svar": on a phone, the question through Næsta if it fits,
  // else the chosen option, else the verdict at the top. Focus moves to the
  // verdict, never to Næsta, so a second Enter lands on nothing (design P3).
  useRevealAfterCommit(showResult, () => ({
    bottom: nextRef.current,
    tops: [
      questionRef.current,
      selectedIndex < 0 ? null : (optionsRef.current?.children[selectedIndex] ?? null),
      resultRef.current,
    ],
    focus: resultRef.current,
  }));
  // Opening the hint replaces its link with the hint, which pushes Athuga down and
  // dropped focus to <body> with the link: on a phone the hint through Athuga
  // comes into view, and focus moves to the hint (design §3, hints).
  const hintRef = useRef<HTMLDivElement>(null);
  const checkRef = useRef<HTMLButtonElement>(null);
  useRevealAfterCommit(showHint && !showResult, () => ({
    bottom: checkRef.current,
    tops: [hintRef.current],
    focus: hintRef.current,
  }));
  // A double tap on "Athuga svar" must not land on Næsta.
  const armed = useArmedAfter(400, `${currentChallenge}:${showResult}`);
  // On a phone, options that are only a signed number (the formal charges −1,
  // 0, +1) sit side by side while the student chooses. After the check the list
  // is one column again, so the chosen option's explanation reads on a full row.
  const phone = useIsPhone();
  const shortOptions = shuffledOptions.every((opt) => opt.text.length <= 3);
  const optionRow = phone && shortOptions && !showResult;

  // Every structure here is drawn as the rest of the game draws one
  // (components/LewisStructure). This level used to draw a single atom with its
  // bonds stacked on one side — water's O read as a double bond, NH₄⁺'s N as a
  // quadruple one — CO's two forms with no lone pairs, and resonance forms as
  // monospace text.

  // The molecule a formal-charge question is about, with the counts beside it.
  // The atom's charge is drawn only once the answer is in, since it is the answer.
  const renderFormalChargeProblem = (drawing: LewisDrawing, atom: AtomCharge) => (
    <div className="flex items-center justify-center gap-4 py-2 phone:py-1">
      <LewisStructure
        drawing={drawing}
        label={`Lewis-formúla ${challenge.molecule}`}
        showFormalCharges={showResult}
        maxWidth={220}
      />
      <div className="text-xs text-warm-600 text-left whitespace-nowrap shrink-0">
        <div className="font-bold text-warm-700 mb-1">{atom.symbol}:</div>
        <div>V = {atom.valenceElectrons}</div>
        <div>L = {atom.lonePairElectrons}</div>
        <div>B = {atom.bondingElectrons}</div>
      </div>
    </div>
  );

  // Candidate structures for a best-structure question, charges drawn: they are
  // the data the question asks the student to weigh.
  const renderStructureComparison = (structures: NonNullable<Challenge['structures']>) => {
    return (
      <div className="flex flex-wrap justify-center gap-6 py-4 phone:grid phone:grid-cols-2 phone:gap-2 phone:py-1">
        {structures.map((struct) => (
          <div
            key={struct.id}
            className={`p-4 phone:px-1 phone:py-2 phone:min-w-0 rounded-xl border-2 ${
              showResult && struct.isPreferred
                ? 'border-green-500 bg-green-50'
                : 'border-warm-200 bg-white'
            }`}
          >
            <div className="flex justify-center mb-2 phone:mb-1">
              <LewisStructure
                drawing={struct.drawing}
                label={`Lewis-formúla: ${struct.description}`}
                maxWidth={170}
              />
            </div>
            {/* Structure label */}
            <div className="text-center text-sm font-mono font-bold text-warm-700">
              {struct.description}
            </div>
            {/* Formal charges text */}
            <div className="text-center text-xs text-warm-500 mt-1">
              {struct.formalCharges
                .map((fc) => `${fc.atom}: ${fc.charge > 0 ? '+' : ''}${fc.charge}`)
                .join(', ')}
            </div>
            {/* Preferred badge */}
            {showResult && struct.isPreferred && (
              <div className="text-center mt-2">
                <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  ✓ Æskilegast
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Resonance forms, shown once the question is answered.
  const renderResonanceStructures = (forms: NonNullable<Challenge['resonanceForms']>) => {
    return (
      <div className="flex flex-wrap justify-center items-center gap-3 py-2 phone:flex-col phone:gap-1 phone:py-1">
        {forms.map((form, idx) => (
          <div key={form.id} className="flex items-center gap-2 phone:flex-col phone:gap-1">
            <div className="w-52 phone:w-56">
              <LewisStructure
                drawing={form.drawing}
                label={`Vokmynd ${idx + 1} af ${forms.length} fyrir ${challenge.molecule}`}
                maxWidth={208}
              />
            </div>
            {/* Double arrow between structures */}
            {idx < forms.length - 1 && (
              <div className="text-2xl text-warm-500 font-bold phone:rotate-90" aria-hidden="true">
                ⟷
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header. On a phone the counters share one line (P4), so the row is one line tall. */}
        <div className="flex items-center justify-between mb-6 phone:mb-2 phone:gap-3">
          <button
            onClick={onBack}
            className="text-warm-600 hover:text-warm-800 flex items-center gap-2 pointer-coarse:min-h-11 phone:shrink-0"
          >
            <span>&larr;</span> Til baka
          </button>
          <div className="text-right phone:flex phone:flex-wrap phone:items-baseline phone:justify-end phone:gap-x-2 phone:min-w-0">
            <div className="text-sm text-warm-600">
              Stig 3 / Þraut {currentChallenge + 1} af {challenges.length}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-warm-200 rounded-full h-2 mb-6 phone:h-1.5 phone:mb-3">
          <div
            className="bg-purple-500 h-2 phone:h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${((currentChallenge + 1) / challenges.length) * 100}%` }}
          />
        </div>

        {/* Main content */}
        {/* A phone on its side: the molecule and its picture | the question, the options and
            Athuga, and after a check the verdict across both columns below them. The wrappers
            are display: contents everywhere else, so nothing else moves. */}
        <div
          ref={cardRef}
          className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 phone:p-3 phone-land:grid phone-land:grid-cols-2 phone-land:gap-x-4 phone-land:items-start"
        >
          <div className="contents phone-land:block">
            {/* On a phone the molecule chip sits beside the title where both fit. */}
            <div className="phone:flex phone:flex-wrap phone:items-center phone:gap-x-3 phone:gap-y-1 phone:mb-2">
              <h2
                data-item-start
                className="text-xl sm:text-2xl font-bold text-purple-800 mb-2 phone:mb-0 phone:min-w-0"
              >
                {challenge.title}
              </h2>

              {challenge.molecule && (
                <div className="inline-block bg-purple-50 px-4 py-2 rounded-lg mb-4 phone:mb-0 phone:px-3 phone:py-1">
                  <span
                    className="font-mono text-2xl font-bold text-purple-700 phone:text-xl"
                    role="img"
                    aria-label={`Sameind: ${challenge.molecule}`}
                  >
                    {challenge.molecule}
                  </span>
                </div>
              )}
            </div>

            <p className="text-warm-600 mb-6 phone:mb-3">{challenge.description}</p>

            {/* Atom info for FC calculations - with visual diagram */}
            {challenge.atoms && (
              <div className="bg-warm-50 p-4 rounded-xl mb-6 phone:p-3 phone:mb-3">
                <h3 className="font-bold text-warm-700 mb-3 phone:mb-0">Rafeindasamsetning:</h3>
                {challenge.drawing &&
                  renderFormalChargeProblem(challenge.drawing, challenge.atoms[0])}
                {/* FC calculation shown after answer */}
                {showResult &&
                  challenge.atoms.map((atom, idx) => (
                    <div
                      key={`calc-${idx}`}
                      className="mt-4 p-3 phone:mt-2 phone:p-2 bg-white rounded-lg border border-purple-200"
                    >
                      <div className="text-sm font-mono text-center">
                        <span className="text-warm-600">FC = </span>
                        <span className="text-purple-600">{atom.valenceElectrons}</span>
                        <span className="text-warm-600"> - (</span>
                        <span className="text-blue-600">{atom.lonePairElectrons}</span>
                        <span className="text-warm-600"> + ½×</span>
                        <span className="text-green-600">{atom.bondingElectrons}</span>
                        <span className="text-warm-600">) = </span>
                        <span
                          className={`font-bold ${atom.formalCharge === 0 ? 'text-green-600' : atom.formalCharge > 0 ? 'text-red-600' : 'text-blue-600'}`}
                        >
                          {atom.formalCharge > 0 ? '+' : ''}
                          {atom.formalCharge}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {/* Structure options for best structure challenges - with visual diagram */}
            {challenge.structures && (
              <div className="bg-warm-50 p-4 rounded-xl mb-6 phone:p-3 phone:mb-3">
                <h3 className="font-bold text-warm-700 mb-3 phone:mb-2">Möguleg form:</h3>
                {renderStructureComparison(challenge.structures)}
              </div>
            )}

            {/* Resonance structures, after the answer: the question asks how many there are,
                and drawing them all above it answered it. */}
            {showResult && challenge.resonanceForms && (
              <div className="bg-warm-50 p-4 rounded-xl mb-6 phone:p-3 phone:mb-3">
                <h3 className="font-bold text-warm-700 mb-3 phone:mb-1">Vokmyndir:</h3>
                {renderResonanceStructures(challenge.resonanceForms)}
              </div>
            )}
          </div>

          <div className="contents phone-land:block">
            {/* Question */}
            <p
              ref={questionRef}
              className="text-lg font-medium text-warm-800 mb-4 phone:text-base phone:mb-2"
            >
              {challenge.question}
            </p>

            {/* Options */}
            <div
              ref={optionsRef}
              className={
                optionRow
                  ? 'grid grid-cols-3 gap-2 mb-3'
                  : 'space-y-3 mb-6 phone:space-y-2 phone:mb-3'
              }
            >
              {shuffledOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => !showResult && setSelectedAnswer(option.id)}
                  disabled={showResult}
                  className={`w-full p-4 phone:p-3 rounded-xl border-2 transition-all ${
                    optionRow ? 'text-center font-mono text-lg' : 'text-left'
                  } ${
                    showResult
                      ? option.correct
                        ? 'border-green-500 bg-green-50'
                        : selectedAnswer === option.id
                          ? 'border-red-500 bg-red-50'
                          : 'border-warm-200 bg-warm-50 opacity-50'
                      : selectedAnswer === option.id
                        ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'
                        : 'border-warm-300 hover:border-purple-400 hover:bg-purple-50'
                  }`}
                >
                  <span>{option.text}</span>
                  {showResult && selectedAnswer === option.id && (
                    <div
                      className={`mt-2 text-sm ${option.correct ? 'text-green-700' : 'text-red-700'}`}
                    >
                      {option.explanation}
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* On a phone "Sýna vísbendingu" and Athuga share a row; Athuga wraps
                under the link where both do not fit, and the opened hint takes a
                row of its own above it. A plain block everywhere else. */}
            <div className="phone:flex phone:flex-wrap phone:items-center phone:gap-x-3">
              {/* Hint button */}
              {!showResult && !showHint && (
                <button
                  onClick={() => setShowHint(true)}
                  className="text-purple-600 hover:text-purple-800 text-sm underline mb-4 phone:mb-2 phone:shrink-0 pointer-coarse:min-h-11"
                >
                  Sýna vísbendingu
                </button>
              )}

              {showHint && !showResult && (
                <div
                  ref={hintRef}
                  className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl mb-4 phone:p-3 phone:mb-3 phone:basis-full"
                >
                  <span className="font-bold text-yellow-800">Vísbending: </span>
                  <span className="text-yellow-900">{challenge.hint}</span>
                </div>
              )}

              {/* Check answer button */}
              {!showResult && (
                <button
                  key="check"
                  ref={checkRef}
                  onClick={checkAnswer}
                  disabled={!selectedAnswer}
                  className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-warm-300 text-white font-bold py-4 px-6 phone:py-3 phone:mb-2 phone:w-auto phone:flex-1 phone:basis-40 rounded-xl transition-colors"
                >
                  Athuga svar
                </button>
              )}
            </div>
          </div>

          {/* Result feedback */}
          {/* The group focused after the check (P3), named by its verdict. */}
          {showResult && (
            <div
              ref={resultRef}
              role="group"
              tabIndex={-1}
              aria-labelledby="lewis-l3-verdict"
              className={`p-4 rounded-xl mb-4 phone:p-3 phone:mb-3 focus:outline-none phone-land:col-span-2 ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}
            >
              <div
                id="lewis-l3-verdict"
                className={`font-bold text-lg mb-2 phone:mb-1 ${isCorrect ? 'text-green-700' : 'text-red-700'}`}
              >
                {isCorrect ? 'Rétt!' : 'Rangt'}
              </div>
              <div className="text-sm text-warm-700">{challenge.explanation}</div>
            </div>
          )}

          {/* Next button */}
          {showResult && (
            <button
              key="next"
              ref={nextRef}
              onClick={armed(nextChallenge)}
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-4 px-6 phone:py-3 rounded-xl transition-colors phone-land:col-span-2"
            >
              {currentChallenge < challenges.length - 1 ? 'Næsta þraut' : 'Ljúka stigi 3'}
            </button>
          )}
        </div>

        {/* Reference card: closed on a phone until opened (P9), always open elsewhere. Held
            back while question 1 is open, since question 1 asks for this formula. */}
        {!(asksForFormula && !showResult) && (
          <PhoneDisclosure
            summary="Formúla formlegrar hleðslu"
            className="mt-6 bg-white rounded-xl p-4 shadow-sm phone:mt-3 phone:p-2"
            buttonClassName="text-warm-700 border-transparent"
          >
            <h3 className="font-bold text-warm-700 mb-3 phone:sr-only">
              Formúla formlegrar hleðslu
            </h3>
            <div className="bg-purple-50 p-3 rounded-lg text-center font-mono mb-3">
              <strong>FC = V - (L + ½B)</strong>
            </div>
            <ul className="text-sm text-warm-600 space-y-1">
              <li>
                <strong>V</strong> = Gildisrafeindir (frá lotukerfinu)
              </li>
              <li>
                <strong>L</strong> = Óbundnar rafeindir (í stökum pörum)
              </li>
              <li>
                <strong>B</strong> = Bundnar rafeindir (í tengjum)
              </li>
            </ul>
          </PhoneDisclosure>
        )}
      </div>
    </div>
  );
}
