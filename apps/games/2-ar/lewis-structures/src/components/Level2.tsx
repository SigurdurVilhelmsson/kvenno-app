import { useState, useMemo } from 'react';

import { AnimatedMolecule } from '@shared/components';
import { MoleculeViewer3DLazy } from '@shared/components/MoleculeViewer3D';

import { LewisDrawingCanvas } from './LewisDrawingCanvas';
import { LewisGuidedMode } from './LewisGuidedMode';
import { lewisToMolecule } from '../utils/lewisConverter';

interface Level2Props {
  onComplete: (score: number) => void;
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
      'O hefur 2 einstæð rafeindarapör (8 - 4 í tengslum = 4 óbundnar = 2 pör).',
    ],
    finalExplanation:
      'H₂O: O í miðju með 2 H tengd og 2 einstæð rafeindarapör. Þetta gefur 4 rafeindarapör í kringum O.',
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
      'N hefur 1 einstætt par (8 - 6 = 2 óbundnar = 1 par).',
    ],
    finalExplanation:
      'NH₃: N í miðju með 3 H tengd og 1 einstætt rafeindarapar. Þetta gerir N tetrahedral en sameindina pýramídalaga.',
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
    hints: [
      'C þarf 4 tengsl og hvert O þarf 2 tengsl (fyrir áttu).',
      'Prófaðu tvöföld tengsl milli C og beggja O.',
      'Hvert O hefur 2 einstæð rafeindarapör. C hefur engin.',
    ],
    finalExplanation:
      'CO₂: O=C=O með tvöföldum tengslum. Hvert O hefur 2 einstæð pör. Þetta er línuleg sameind.',
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
      'Engin einstæð pör á neinu atómi.',
    ],
    finalExplanation:
      'CH₄: C í miðju með 4 H tengd. Engin einstæð rafeindarapör. Þetta er tetrahedral sameind.',
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
      'Sameindir með oddatölu rafeinda eru róttæki (radicals).',
      'N=O tvöfalt tengi. O hefur 2 einstæð pör.',
      'N hefur 1 einstætt par + 1 óparaða rafeind (alls 11 rafeindir).',
    ],
    finalExplanation:
      'NO: Tvöföld tengsl N=O með óparaðri rafeind á N. Þetta er róttæki og mjög hvarfgjarnt.',
  },
  {
    id: 6,
    title: 'Vetni klóríð (HCl)',
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
      'Cl hefur 3 einstæð pör (7 gildisrafeindir - 1 í tengi = 6 = 3 pör).',
    ],
    finalExplanation:
      'HCl: Einfalt H-Cl tengi. Cl hefur 3 einstæð rafeindarapör. Bæði H og Cl hafa fulla ystu skel.',
  },
  // === OCTET RULE EXCEPTIONS ===
  {
    id: 7,
    title: 'Bórþríflúoríð (BF₃) — Undantekning',
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
      '3 einföld B-F tengsl. Hvert F hefur 3 einstæð pör.',
      'B hefur aðeins 6 rafeindir — undantekning frá áttureglunni!',
    ],
    finalExplanation:
      'BF₃ er dæmi um rafeindaskort: Bór hefur aðeins 6 rafeindir í kringum sig, ekki 8. Þetta er stöðugt vegna þess að bór er lítið atóm.',
  },
  {
    id: 8,
    title: 'Fosfórpentaklóríð (PCl₅) — Undantekning',
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
      '5 einföld P-Cl tengsl. Hvert Cl hefur 3 einstæð pör.',
      'P hefur 10 rafeindir — stækkuð átta (expanded octet).',
    ],
    finalExplanation:
      'PCl₅ er dæmi um stækkaða áttu: Fosfór hefur 10 rafeindir í kringum sig. Þetta er mögulegt vegna þess að P er á 3. lotu og getur notað d-undirskeljum.',
  },
  {
    id: 9,
    title: 'Brennisteinshexaflúoríð (SF₆) — Undantekning',
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
      '6 einföld S-F tengsl. Hvert F hefur 3 einstæð pör.',
      'S hefur 12 rafeindir — tvöfalt meira en áttureglan!',
    ],
    finalExplanation:
      'SF₆ er dæmi um stækkaða áttu: S hefur 12 rafeindir í kringum sig (6 tengsl). Þetta er mögulegt vegna d-undirskelja.',
  },
];

// 9 challenges × 15 points each = 135

export function Level2({ onComplete, onBack }: Level2Props) {
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [score, setScore] = useState(0);
  const [, setTotalHintsUsed] = useState(0);
  const [drawingCorrect, setDrawingCorrect] = useState(false);
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [showTutorial, setShowTutorial] = useState(false);
  const [hintsRevealed, setHintsRevealed] = useState(0);
  // Force remount of canvas when challenge changes
  const [canvasKey, setCanvasKey] = useState(0);

  const challenge = challenges[currentChallenge];
  const isLastChallenge = currentChallenge === challenges.length - 1;

  const molecule = useMemo(() => {
    return lewisToMolecule(challenge.correctStructure, challenge.molecule, challenge.title);
  }, [challenge]);

  const handleDrawingComplete = (correct: boolean) => {
    if (correct) {
      setScore((prev) => prev + 15);
      setDrawingCorrect(true);
    }
  };

  const nextChallenge = () => {
    if (!isLastChallenge) {
      setCurrentChallenge((prev) => prev + 1);
      setDrawingCorrect(false);
      setViewMode('2d');
      setHintsRevealed(0);
      setCanvasKey((prev) => prev + 1);
    } else {
      onComplete(score);
    }
  };

  const revealHint = () => {
    if (hintsRevealed < challenge.hints.length) {
      setHintsRevealed((prev) => prev + 1);
      setTotalHintsUsed((prev) => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="text-warm-600 hover:text-warm-800 flex items-center gap-2"
          >
            <span>&larr;</span> Til baka
          </button>
          <div className="text-right">
            <div className="text-sm text-warm-600">
              Stig 2 / Sameind {currentChallenge + 1} af {challenges.length}
            </div>
            <div className="text-lg font-bold text-green-600">{score} stig</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-warm-200 rounded-full h-2 mb-6">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${((currentChallenge + (drawingCorrect ? 1 : 0)) / challenges.length) * 100}%`,
            }}
          />
        </div>

        {/* Tutorial toggle */}
        {!showTutorial && currentChallenge === 0 && !drawingCorrect && (
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4 mb-6 border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📝</span>
                <div>
                  <div className="font-bold text-warm-800">Nýr í Lewis-formúlum?</div>
                  <div className="text-sm text-warm-600">
                    Byrjaðu með leiðsögnina til að læra skref fyrir skref
                  </div>
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

        {/* Tutorial */}
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
                setScore((prev) => prev + 5);
              }}
            />
            <button
              onClick={() => setShowTutorial(false)}
              className="mt-4 w-full bg-warm-200 hover:bg-warm-300 text-warm-700 font-medium py-2 px-4 rounded-lg transition-all"
            >
              Sleppa leiðsögn
            </button>
          </div>
        )}

        {/* Main content */}
        {!showTutorial && (
          <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
            <h2 className="text-2xl font-bold text-green-800 mb-2">{challenge.title}</h2>
            <div className="flex items-center gap-4 mb-6">
              <span className="font-mono text-3xl font-bold text-indigo-600">
                {challenge.molecule}
              </span>
              <span className="text-sm text-warm-600">
                ({challenge.totalElectrons} gildisrafeindir)
              </span>
            </div>

            {drawingCorrect ? (
              /* === Completion view === */
              <>
                {/* Lewis structure visualization */}
                <div className="bg-warm-50 rounded-xl p-4 mb-6">
                  <div className="flex justify-center gap-2 mb-3">
                    <button
                      onClick={() => setViewMode('2d')}
                      className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        viewMode === '2d'
                          ? 'bg-green-600 text-white'
                          : 'bg-warm-200 text-warm-600 hover:bg-warm-300'
                      }`}
                    >
                      2D Lewis
                    </button>
                    <button
                      onClick={() => setViewMode('3d')}
                      className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        viewMode === '3d'
                          ? 'bg-green-600 text-white'
                          : 'bg-warm-200 text-warm-600 hover:bg-warm-300'
                      }`}
                    >
                      3D lögun
                    </button>
                  </div>

                  <div className="flex justify-center py-4">
                    {viewMode === '2d' ? (
                      <AnimatedMolecule
                        molecule={molecule}
                        mode="lewis"
                        size="lg"
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
                          Dragðu til að snúa, skrollaðu til að stækka
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Legend */}
                  <div className="mt-4 pt-4 border-t border-warm-200">
                    <div className="text-xs text-warm-500 mb-2 font-medium">Skýringar:</div>
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
                    </div>

                    {/* Octet exception warning */}
                    {challenge.correctStructure.octetException &&
                      challenge.correctStructure.octetException !== 'none' && (
                        <div className="mt-3 pt-3 border-t border-orange-200">
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
                                Rafeindaskort: {challenge.correctStructure.centralAtom} hefur{' '}
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

                {/* Success + explanation */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                  <div className="font-bold text-green-800 mb-1">Rétt!</div>
                  <p className="text-sm text-green-900">+15 stig</p>
                </div>

                <div className="bg-indigo-50 p-4 rounded-xl mb-6">
                  <div className="font-bold text-indigo-800 mb-2">Lewis-formúla:</div>
                  <p className="text-indigo-900 text-sm">{challenge.finalExplanation}</p>
                </div>

                <button
                  onClick={nextChallenge}
                  className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-4 px-6 rounded-xl transition-colors"
                >
                  {isLastChallenge ? 'Ljúka stigi 2' : 'Næsta sameind →'}
                </button>
              </>
            ) : (
              /* === Drawing view === */
              <>
                <LewisDrawingCanvas
                  key={canvasKey}
                  molecule={challenge.molecule}
                  totalElectrons={challenge.totalElectrons}
                  correctStructure={challenge.correctStructure}
                  onComplete={handleDrawingComplete}
                />

                {/* Hints */}
                <div className="mt-4">
                  {hintsRevealed > 0 && (
                    <div className="space-y-2 mb-3">
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
                      className="text-green-600 hover:text-green-800 text-sm underline"
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
        <div className="mt-6 bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-bold text-warm-700 mb-2">Skref til að teikna Lewis-formúlu:</h3>
          <ol className="text-sm text-warm-600 space-y-1 list-decimal list-inside">
            <li>Finndu miðatóm (oftast það sem hefur flest tengsl, aldrei H)</li>
            <li>Teiknaðu tengsl til allra ytri atóma (smelltu á strikin)</li>
            <li>Dreifðu eftirstandandi rafeindum sem einstæð pör</li>
            <li>Breyttu í tvöföld/þreföld tengsl ef þarf til að uppfylla átturegluna</li>
          </ol>
        </div>

        {/* Octet exceptions reference */}
        {challenge.correctStructure.octetException &&
          challenge.correctStructure.octetException !== 'none' && (
            <div className="mt-4 bg-gradient-to-r from-orange-50 to-purple-50 rounded-xl p-4 shadow-sm border border-orange-200">
              <h3 className="font-bold text-warm-700 mb-3 flex items-center gap-2">
                <span className="text-xl">⚠️</span>
                Undantekningar frá áttureglunni
              </h3>
              <div className="grid gap-3 text-sm">
                <div
                  className={`p-3 rounded-lg ${challenge.correctStructure.octetException === 'electron-deficient' ? 'bg-orange-100 border-2 border-orange-300' : 'bg-white'}`}
                >
                  <div className="font-bold text-orange-700">
                    Rafeindaskort (Electron Deficient)
                  </div>
                  <div className="text-warm-600">
                    Atóm eins og B og Al hafa færri en 8 rafeindir
                  </div>
                  <div className="text-xs text-warm-500 mt-1">
                    Dæmi: BF₃ (6 rafeindir), AlCl₃ (6 rafeindir)
                  </div>
                </div>
                <div
                  className={`p-3 rounded-lg ${challenge.correctStructure.octetException === 'expanded-octet' ? 'bg-purple-100 border-2 border-purple-300' : 'bg-white'}`}
                >
                  <div className="font-bold text-purple-700">Stækkuð átta (Expanded Octet)</div>
                  <div className="text-warm-600">
                    Atóm á 3. lotu+ geta haft fleiri en 8 rafeindir (nota d-undirskeljum)
                  </div>
                  <div className="text-xs text-warm-500 mt-1">
                    Dæmi: PCl₅ (10 rafeindir), SF₆ (12 rafeindir)
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-white">
                  <div className="font-bold text-red-700">Oddatala rafeinda (Radicals)</div>
                  <div className="text-warm-600">
                    Sameindir með oddatölu rafeinda hafa óparaða rafeind
                  </div>
                  <div className="text-xs text-warm-500 mt-1">
                    Dæmi: NO (11 rafeindir), NO₂ (17 rafeindir)
                  </div>
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
