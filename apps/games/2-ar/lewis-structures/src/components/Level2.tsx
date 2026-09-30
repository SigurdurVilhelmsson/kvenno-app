import { useState, useMemo, useRef, useEffect, useLayoutEffect } from 'react';

import { AnimatedMolecule, PhoneDisclosure } from '@shared/components';
import { MoleculeViewer3DLazy } from '@shared/components/MoleculeViewer3D';
import {
  focusTarget,
  isPhone,
  revealTop,
  useArmedAfter,
  useIsPhone,
  useItemTop,
  useRevealAfterCommit,
} from '@shared/utils';

import { LewisDrawingCanvas } from './LewisDrawingCanvas';
import { LewisGuidedMode } from './LewisGuidedMode';
import { lewisToMolecule } from '../utils/lewisConverter';

interface Level2Props {
  /** How many of the molecules were drawn right without opening the solution. */
  onComplete: (correct: number, total: number) => void;
  onBack: () => void;
}

interface LewisStructure {
  centralAtom: string;
  surroundingAtoms: {
    symbol: string;
    bondType: 'single' | 'double' | 'triple';
    lonePairs: number;
    formalCharge?: number;
  }[];
  centralLonePairs: number;
  centralFormalCharge?: number;
  centralUnpairedElectron?: boolean;
  octetException?: 'none' | 'electron-deficient' | 'expanded-octet' | 'odd-electron';
  centralElectrons?: number;
}

interface Challenge {
  id: number;
  title: string;
  molecule: string;
  totalElectrons: number;
  correctStructure: LewisStructure;
  hints: string[];
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
    hints: [
      'H getur aðeins myndað 1 tengi, þannig að O verður að vera miðatómið.',
      'Súrefni myndar 2 einföld tengsl við vetni.',
      'O hefur 2 stök rafeindapör (8 - 4 í tengslum = 4 óbundnar = 2 pör).',
    ],
    finalExplanation:
      'H₂O: O í miðju með 2 H tengd og 2 stök rafeindapör. Þetta gefur 4 rafeindapör í kringum O.',
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
    hints: [
      'N hefur 5 gildisrafeindir og getur myndað 3 tengsl.',
      'Þrjú einföld N-H tengsl nota 6 rafeindir.',
      'N hefur 1 stakt par (8 - 6 = 2 óbundnar = 1 par).',
    ],
    finalExplanation:
      'NH₃: N í miðju með 3 H tengd og 1 stakt rafeindapar. Þetta gerir N ferflötungslaga en sameindina pýramídalaga.',
  },
  {
    id: 3,
    title: 'Koldíoxíð (CO₂)',
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
    hints: [
      'C þarf 4 tengsl og hvert O þarf 2 tengsl (fyrir áttu).',
      'Prófaðu tvöföld tengsl milli C og beggja O.',
      'Hvert O hefur 2 stök rafeindapör. C hefur engin.',
    ],
    finalExplanation:
      'CO₂: O=C=O með tvöföldum tengslum. Hvert O hefur 2 stök pör. Þetta er línuleg sameind.',
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
    hints: [
      'C myndar 4 tengsl og H myndar 1.',
      '4 einföld C-H tengsl nota allar 8 rafeindirnar.',
      'Engin stök pör á neinu atómi.',
    ],
    finalExplanation:
      'CH₄: C í miðju með 4 H tengd. Engin stök rafeindapör. Þetta er ferflötungslaga sameind.',
  },
  {
    id: 5,
    title: 'Nituroxíð (NO)',
    molecule: 'NO',
    totalElectrons: 11,
    correctStructure: {
      centralAtom: 'N',
      surroundingAtoms: [{ symbol: 'O', bondType: 'double', lonePairs: 2 }],
      centralLonePairs: 1,
      centralUnpairedElectron: true,
    },
    hints: [
      'Sameindir með oddatölu rafeinda eru stakeindir.',
      'N=O tvöfalt tengi. O hefur 2 stök pör.',
      'N hefur 1 stakt par + 1 óparaða rafeind (alls 11 rafeindir).',
    ],
    finalExplanation:
      'NO: Tvöföld tengsl N=O með óparaðri rafeind á N. Þetta er stakeind og hún er mjög hvarfgjörn.',
  },
  {
    id: 6,
    title: 'Vetnisklóríð (HCl)',
    molecule: 'HCl',
    totalElectrons: 8,
    correctStructure: {
      centralAtom: 'Cl',
      surroundingAtoms: [{ symbol: 'H', bondType: 'single', lonePairs: 0 }],
      centralLonePairs: 3,
    },
    hints: [
      'Cl þarf aðeins 1 rafeind til að ná áttureglunni.',
      'Eitt einfalt H-Cl tengi.',
      'Cl hefur 3 stök pör (7 gildisrafeindir - 1 í tengi = 6 = 3 pör).',
    ],
    finalExplanation:
      'HCl: Einfalt H-Cl tengi. Cl hefur 3 stök rafeindapör. Bæði H og Cl hafa fullt ysta hvolf.',
  },
  // === OCTET RULE EXCEPTIONS ===
  {
    id: 7,
    title: 'Bórþríflúoríð (BF₃)',
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
    hints: [
      'B er í hópi 13 og myndar venjulega 3 tengsl.',
      '3 einföld B-F tengsl. Hvert F hefur 3 stök pör.',
      'B hefur aðeins 6 rafeindir — undantekning frá áttureglunni!',
    ],
    finalExplanation:
      'BF₃ er dæmi um rafeindaskort: Bór hefur aðeins 6 rafeindir í kringum sig, ekki 8. Þetta er stöðugt vegna þess að bór er lítið atóm.',
  },
  {
    id: 8,
    title: 'Fosfórpentaklóríð (PCl₅)',
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
    hints: [
      'P er á 3. lotu og getur haft fleiri en 8 rafeindir.',
      '5 einföld P-Cl tengsl. Hvert Cl hefur 3 stök pör.',
      'P hefur 10 rafeindir — stækkuð átta.',
    ],
    finalExplanation:
      'PCl₅ er dæmi um stækkaða áttu: Fosfór hefur 10 rafeindir í kringum sig. P er á 3. lotu og nógu stórt til að rúma fleiri en fjögur rafeindapör.',
  },
  {
    id: 9,
    title: 'Brennisteinshexaflúoríð (SF₆)',
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
    hints: [
      'S er á 3. lotu og getur haft meira en 8 rafeindir.',
      '6 einföld S-F tengsl. Hvert F hefur 3 stök pör.',
      'S hefur 12 rafeindir — tvöfalt meira en áttureglan!',
    ],
    finalExplanation:
      'SF₆ er dæmi um stækkaða áttu: S hefur 12 rafeindir í kringum sig (6 tengsl). S er á 3. lotu og nógu stórt til að rúma fleiri en fjögur rafeindapör.',
  },
];

export function Level2({ onComplete, onBack }: Level2Props) {
  const [currentChallenge, setCurrentChallenge] = useState(0);
  // Molecules drawn right without the solution. There is no running score: the
  // count is reported at the end of the level (mobile-pass decision 1 (b)).
  const [solvedUnaided, setSolvedUnaided] = useState(0);
  const [solutionShown, setSolutionShown] = useState(false);
  const [drawingCorrect, setDrawingCorrect] = useState(false);
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [showTutorial, setShowTutorial] = useState(false);
  const [hintsRevealed, setHintsRevealed] = useState(0);
  // Force remount of canvas when challenge changes
  const [canvasKey, setCanvasKey] = useState(0);

  const challenge = challenges[currentChallenge];
  const isLastChallenge = currentChallenge === challenges.length - 1;
  // "Næsta sameind" swaps the molecule in place, so the page kept its offset:
  // the next board opened above the screen. Each new molecule — and the board
  // coming back when the tutorial closes, whose last button sits far below it —
  // brings the card's top back when it has scrolled off, at any width as the
  // game's own helper did, and focus moves to the molecule's title.
  const cardRef = useItemTop<HTMLDivElement>(`${currentChallenge}-${showTutorial}`, {
    anyWidth: true,
    gap: 0,
  });
  // Opening the tutorial replaces the board with it: on a phone its top comes
  // into view, and focus moves to its first step (it was on <body>, with the
  // button that opened it gone).
  const tutorialRef = useItemTop<HTMLDivElement>(showTutorial);
  // A correct drawing swaps the tall board for a shorter result. On a phone the
  // title through Næsta comes into view if it fits, else the verdict at the
  // top; focus moves to the verdict, never to Næsta (design P3).
  const titleRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  useRevealAfterCommit(drawingCorrect, () => ({
    bottom: nextRef.current,
    tops: [titleRef.current, successRef.current],
    focus: successRef.current,
  }));
  // Wider screens keep what the game's own helper did: on a short window the
  // "Rétt!" could land above the top of the page, and is brought back.
  useEffect(() => {
    const el = successRef.current;
    if (drawingCorrect && el && !isPhone() && el.getBoundingClientRect().top < 0) {
      revealTop(el, { anyWidth: true, gap: 0 });
    }
  }, [drawingCorrect]);
  // A double tap on Athuga must not land on Næsta, which opens where the board was.
  const armed = useArmedAfter(400, `${currentChallenge}:${drawingCorrect}`);
  const phone = useIsPhone();

  const molecule = useMemo(() => {
    return lewisToMolecule(challenge.correctStructure, challenge.molecule, challenge.title);
  }, [challenge]);

  const handleDrawingComplete = (correct: boolean) => {
    if (correct) {
      if (!solutionShown) setSolvedUnaided((prev) => prev + 1);
      setDrawingCorrect(true);
    }
  };

  const nextChallenge = () => {
    if (!isLastChallenge) {
      setCurrentChallenge((prev) => prev + 1);
      setDrawingCorrect(false);
      setViewMode('2d');
      setHintsRevealed(0);
      setSolutionShown(false);
      setCanvasKey((prev) => prev + 1);
    } else {
      onComplete(solvedUnaided, challenges.length);
    }
  };

  // Each hint the student opens takes focus, at every width (the shared
  // HintSystem does the same). Opening the last one unmounted the button just
  // pressed and dropped focus to <body> (P3.5). A new molecule resets the count
  // without moving focus here — useItemTop focuses its title.
  const hintsRef = useRef<HTMLDivElement>(null);
  const focusNewHint = useRef(false);
  useLayoutEffect(() => {
    if (!focusNewHint.current) return;
    focusNewHint.current = false;
    const hints = hintsRef.current?.children;
    const last = hints?.[hints.length - 1];
    focusTarget(last instanceof HTMLElement ? last : null);
  }, [hintsRevealed]);

  const revealHint = () => {
    if (hintsRevealed < challenge.hints.length) {
      focusNewHint.current = true;
      setHintsRevealed((prev) => prev + 1);
    }
  };

  // The completion view, in parts. A phone on its side sets the drawing beside the verdict,
  // the explanation and Næsta, which takes two wrappers; they exist only on a phone. Even a
  // box-less wrapper made React rebuild the view instead of reusing the elements the drawing
  // view shared with it, and that moved where the browser's scroll anchoring left a desktop
  // page as the tall board gave way to the shorter result (27 px at 1280x800).
  //
  // Lewis structure visualization
  const completionDrawing = (
    <div className="bg-warm-50 rounded-xl p-4 mb-6 phone:p-2 phone:mb-3">
      <div className="flex justify-center gap-2 mb-3 phone:mb-1">
        <button
          onClick={() => setViewMode('2d')}
          className={`px-4 py-1.5 pointer-coarse:min-h-11 rounded-lg text-sm font-medium transition-colors ${
            viewMode === '2d'
              ? 'bg-green-600 text-white'
              : 'bg-warm-200 text-warm-600 hover:bg-warm-300'
          }`}
        >
          2D Lewis
        </button>
        <button
          onClick={() => setViewMode('3d')}
          className={`px-4 py-1.5 pointer-coarse:min-h-11 rounded-lg text-sm font-medium transition-colors ${
            viewMode === '3d'
              ? 'bg-green-600 text-white'
              : 'bg-warm-200 text-warm-600 hover:bg-warm-300'
          }`}
        >
          3D lögun
        </button>
      </div>

      <div className="flex justify-center py-4 phone:py-1">
        {viewMode === '2d' ? (
          <AnimatedMolecule
            molecule={molecule}
            mode="lewis"
            size="lg"
            fit
            animation="fade-in"
            showLonePairs={true}
            showFormalCharges={true}
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
            <div className="text-xs text-warm-500 text-center mt-2">
              {/* A wheel does not exist on a phone: zoom there is a pinch. */}
              <span className="pointer-coarse:hidden">
                Dragðu til að snúa, skrollaðu til að stækka
              </span>
              <span className="hidden pointer-coarse:inline">
                Dragðu til að snúa, notaðu tvo fingur til að stækka
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      {/* On a phone the legend is one row, its label leading. */}
      <div className="mt-4 pt-4 border-t border-warm-200 phone:mt-1 phone:pt-2 phone:flex phone:flex-wrap phone:items-center phone:gap-x-3 phone:gap-y-1">
        <div className="text-xs text-warm-500 mb-2 font-medium phone:mb-0">Skýringar:</div>
        <div className="flex flex-wrap gap-4 text-xs phone:gap-x-3 phone:gap-y-1">
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
            <span>Stakt par</span>
          </div>
        </div>

        {/* Octet exception warning */}
        {challenge.correctStructure.octetException &&
          challenge.correctStructure.octetException !== 'none' && (
            <div className="mt-3 pt-3 border-t border-orange-200 phone:mt-1 phone:pt-2 phone:basis-full">
              <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
                  challenge.correctStructure.octetException === 'electron-deficient'
                    ? 'bg-orange-100 text-orange-800 border border-orange-300'
                    : 'bg-purple-100 text-purple-800 border border-purple-300'
                }`}
              >
                <span className="text-lg">⚠️</span>
                {challenge.correctStructure.octetException === 'electron-deficient' && (
                  <span>
                    Rafeindaskortur: {challenge.correctStructure.centralAtom} hefur{' '}
                    {challenge.correctStructure.centralElectrons} rafeindir
                  </span>
                )}
                {challenge.correctStructure.octetException === 'expanded-octet' && (
                  <span>
                    Stækkuð átta: {challenge.correctStructure.centralAtom} hefur{' '}
                    {challenge.correctStructure.centralElectrons} rafeindir
                  </span>
                )}
              </div>
            </div>
          )}
      </div>
    </div>
  );
  // Success + explanation. The verdict is the group focused after the check (P3); on a phone it
  // is one line.
  const completionVerdict = (
    <div
      ref={successRef}
      role="group"
      tabIndex={-1}
      aria-labelledby="lewis-l2-verdict"
      className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4 focus:outline-none phone:px-3 phone:py-2 phone:mb-3 phone:flex phone:items-baseline phone:gap-2"
    >
      <div id="lewis-l2-verdict" className="font-bold text-green-800">
        Rétt!
      </div>
    </div>
  );
  const completionExplanation = (
    <div className="bg-indigo-50 p-4 rounded-xl mb-6 phone:p-3 phone:mb-3">
      <div className="font-bold text-indigo-800 mb-2 phone:mb-1">Lewis-formúla:</div>
      <p className="text-indigo-900 text-sm">{challenge.finalExplanation}</p>
    </div>
  );
  const completionNext = (
    <button
      ref={nextRef}
      onClick={armed(nextChallenge)}
      className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-4 px-6 phone:py-3 rounded-xl transition-colors"
    >
      {isLastChallenge ? 'Ljúka stigi 2' : 'Næsta sameind →'}
    </button>
  );

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
              Stig 2 / Sameind {currentChallenge + 1} af {challenges.length}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-warm-200 rounded-full h-2 mb-6 phone:h-1.5 phone:mb-3">
          <div
            className="bg-green-500 h-2 phone:h-1.5 rounded-full transition-all duration-300"
            style={{
              width: `${((currentChallenge + (drawingCorrect ? 1 : 0)) / challenges.length) * 100}%`,
            }}
          />
        </div>

        {/* Tutorial toggle. On a phone it is one row: the question beside its
            button, the longer line kept for screen readers. */}
        {!showTutorial && currentChallenge === 0 && !drawingCorrect && (
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4 mb-6 border border-blue-200 phone:px-3 phone:py-2 phone:mb-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-0 phone:flex-row phone:items-center phone:justify-between phone:gap-2">
              <div className="flex items-center gap-3 phone:min-w-0">
                <span className="text-2xl phone:hidden">📝</span>
                <div className="phone:min-w-0">
                  <div className="font-bold text-warm-800 phone:text-sm">Nýr í Lewis-formúlum?</div>
                  <div className="text-sm text-warm-600 phone:sr-only">
                    Byrjaðu með leiðsögnina til að læra skref fyrir skref
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowTutorial(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-all pointer-coarse:min-h-11 phone:shrink-0 phone:px-3 phone:text-sm"
              >
                Opna leiðsögn
              </button>
            </div>
          </div>
        )}

        {/* Tutorial */}
        {showTutorial && (
          <div ref={tutorialRef} className="mb-6 phone:mb-3">
            <LewisGuidedMode
              molecule="H₂O"
              atoms={[
                { symbol: 'O', valenceElectrons: 6, position: 'central' },
                { symbol: 'H', valenceElectrons: 1, position: 'surrounding' },
                { symbol: 'H', valenceElectrons: 1, position: 'surrounding' },
              ]}
              totalElectrons={8}
              onComplete={() => setShowTutorial(false)}
            />
            <button
              onClick={() => setShowTutorial(false)}
              className="mt-4 phone:mt-3 w-full bg-warm-200 hover:bg-warm-300 text-warm-700 font-medium py-2 px-4 rounded-lg transition-all pointer-coarse:min-h-11"
            >
              Sleppa leiðsögn
            </button>
          </div>
        )}

        {/* Main content */}
        {!showTutorial && (
          <div
            ref={cardRef}
            className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 phone:p-3"
          >
            {/* On a phone the formula and its electron count run on after the
                title, on one line where they fit. */}
            <div
              ref={titleRef}
              className="phone:flex phone:flex-wrap phone:items-baseline phone:gap-x-3 phone:mb-2"
            >
              <h2
                data-item-start
                className="text-lg min-[360px]:text-xl sm:text-2xl font-bold text-green-800 mb-2 phone:mb-0"
              >
                {challenge.title}
              </h2>
              <div className="flex flex-wrap items-center gap-x-4 mb-6 phone:mb-0 phone:gap-x-2 phone:items-baseline">
                <span className="font-mono text-3xl font-bold text-indigo-600 phone:text-xl">
                  {challenge.molecule}
                </span>
                <span className="text-sm text-warm-600">
                  ({challenge.totalElectrons} gildisrafeindir)
                </span>
              </div>
            </div>

            {drawingCorrect ? (
              /* === Completion view === A phone on its side: the drawing | the verdict, the
                 explanation and Næsta; on a phone standing up the wrappers are display:
                 contents. Desktop gets no wrappers (see the parts above). */
              phone ? (
                <div className="contents phone-land:grid phone-land:grid-cols-2 phone-land:gap-x-4 phone-land:items-start">
                  {completionDrawing}
                  <div className="contents phone-land:block">
                    {completionVerdict}
                    {completionExplanation}
                    {completionNext}
                  </div>
                </div>
              ) : (
                <>
                  {completionDrawing}
                  {completionVerdict}
                  {completionExplanation}
                  {completionNext}
                </>
              )
            ) : (
              /* === Drawing view === */
              <>
                <LewisDrawingCanvas
                  key={canvasKey}
                  molecule={challenge.molecule}
                  totalElectrons={challenge.totalElectrons}
                  correctStructure={challenge.correctStructure}
                  onComplete={handleDrawingComplete}
                  onSolutionShown={() => setSolutionShown(true)}
                />

                {/* Hints, under the board and its actions */}
                <div className="mt-4 phone:mt-3">
                  {hintsRevealed > 0 && (
                    <div ref={hintsRef} className="space-y-2 mb-3 phone:mb-1">
                      {challenge.hints.slice(0, hintsRevealed).map((hint, i) => (
                        <div
                          key={i}
                          className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-sm text-yellow-900"
                        >
                          <span className="font-bold text-yellow-800">Vísbending {i + 1}: </span>
                          {hint}
                        </div>
                      ))}
                    </div>
                  )}
                  {hintsRevealed < challenge.hints.length && (
                    <button
                      onClick={revealHint}
                      className="text-green-600 hover:text-green-800 text-sm underline pointer-coarse:min-h-11"
                    >
                      {hintsRevealed === 0 ? 'Sýna vísbendingu' : 'Sýna fleiri vísbendingar'}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Quick reference */}
        <div className="mt-6 bg-white rounded-xl p-4 shadow-sm phone:mt-3">
          <h3 className="font-bold text-warm-700 mb-2">Skref til að teikna Lewis-formúlu:</h3>
          <ol className="text-sm text-warm-600 space-y-1 list-decimal list-inside">
            <li>Finndu miðatóm (oftast það sem hefur flest tengsl, aldrei H)</li>
            <li>Teiknaðu tengsl til allra ytri atóma (smelltu á strikin)</li>
            <li>Dreifðu eftirstandandi rafeindum sem stök pör</li>
            <li>Breyttu í tvöföld/þreföld tengsl ef þarf til að uppfylla átturegluna</li>
          </ol>
        </div>

        {/* Octet exceptions reference. Shown with every molecule and highlighting none, so it
            is a reference and not a clue: it used to appear only on BF₃, PCl₅ and SF₆, light up
            the case being drawn and list that molecule with its electron count. Its examples are
            molecules this level does not ask for. Closed on a phone until opened (P9). */}
        <PhoneDisclosure
          summary="Undantekningar frá áttureglunni"
          className="mt-4 bg-white rounded-xl p-4 shadow-sm phone:mt-3 phone:p-2"
          buttonClassName="text-warm-700 border-transparent"
        >
          <h3 className="font-bold text-warm-700 mb-3 phone:sr-only">
            Undantekningar frá áttureglunni
          </h3>
          <div className="grid gap-3 text-sm">
            <div className="p-3 rounded-lg bg-warm-50">
              <div className="font-bold text-warm-800">Rafeindaskortur</div>
              <div className="text-warm-600">
                Atóm eins og B og Al geta haft færri en 8 rafeindir í kringum sig
              </div>
              <div className="text-xs text-warm-500 mt-1">Dæmi: BCl₃, AlCl₃</div>
            </div>
            <div className="p-3 rounded-lg bg-warm-50">
              <div className="font-bold text-warm-800">Stækkuð átta</div>
              <div className="text-warm-600">
                Atóm á 3. lotu og neðar eru nógu stór til að rúma fleiri en fjögur rafeindapör
              </div>
              <div className="text-xs text-warm-500 mt-1">Dæmi: ClF₃, SF₄, XeF₄</div>
            </div>
            <div className="p-3 rounded-lg bg-warm-50">
              <div className="font-bold text-warm-800">Oddatala rafeinda (stakeindir)</div>
              <div className="text-warm-600">
                Sameindir með oddatölu rafeinda hafa óparaða rafeind
              </div>
              <div className="text-xs text-warm-500 mt-1">Dæmi: NO₂, ClO₂</div>
            </div>
          </div>
        </PhoneDisclosure>
      </div>
    </div>
  );
}
