import { useState, useMemo } from 'react';

import { AnimatedMolecule } from '@shared/components';
import { MoleculeViewer3DLazy } from '@shared/components/MoleculeViewer3D';

import { ElectronRepulsionAnimation } from './ElectronRepulsionAnimation';
import { vseprToMolecule } from '../utils/vseprConverter';

interface Level2Props {
  onComplete: (score: number) => void;
  onBack: () => void;
}

interface GeometryOption {
  id: string;
  name: string;
  bondAngle: string;
}

const GEOMETRY_OPTIONS: GeometryOption[] = [
  { id: 'linear', name: 'Línuleg', bondAngle: '180°' },
  { id: 'bent', name: 'Beygð', bondAngle: '<120° eða <109.5°' },
  { id: 'trigonal-planar', name: 'Þríhyrnd slétt', bondAngle: '120°' },
  { id: 'trigonal-pyramidal', name: 'Þríhyrnd pýramída', bondAngle: '107°' },
  { id: 'tetrahedral', name: 'Fjórflötungur', bondAngle: '109.5°' },
  { id: 'seesaw', name: 'Sjáldruslögun', bondAngle: '90° og 120°' },
  { id: 't-shaped', name: 'T-lögun', bondAngle: '90°' },
  { id: 'trigonal-bipyramidal', name: 'Þríhyrnd tvípýramída', bondAngle: '90° og 120°' },
  { id: 'square-planar', name: 'Ferningsslétt', bondAngle: '90°' },
  { id: 'octahedral', name: 'Áttflötungur', bondAngle: '90°' },
];

interface Molecule {
  id: number;
  formula: string;
  name: string;
  lewisStructure: string;
  centralAtom: string;
  bondingPairs: number;
  lonePairs: number;
  electronDomains: number;
  electronGeometry: string;
  molecularGeometry: string;
  correctGeometryId: string;
  bondAngle: string;
  isPolar: boolean;
  explanation: string;
}

const molecules: Molecule[] = [
  {
    id: 1,
    formula: 'H₂O',
    name: 'Vatn',
    lewisStructure: '  ::  ::\n   \\ /\nH — O — H',
    centralAtom: 'O',
    bondingPairs: 2,
    lonePairs: 2,
    electronDomains: 4,
    electronGeometry: 'Fjórflötungur',
    molecularGeometry: 'Beygð',
    correctGeometryId: 'bent',
    bondAngle: '104.5°',
    isPolar: true,
    explanation:
      'Súrefni hefur 6 gildisrafeindir. 2 fara í tengsl við H, 4 mynda 2 einstæð pör. 4 rafeinasvið = fjórflötungs rafeinalögun, en 2 einstæð pör gera sameindarlögunina beygða.',
  },
  {
    id: 2,
    formula: 'NH₃',
    name: 'Ammóníak',
    lewisStructure: '    ::\n    |\nH — N — H\n    |\n    H',
    centralAtom: 'N',
    bondingPairs: 3,
    lonePairs: 1,
    electronDomains: 4,
    electronGeometry: 'Fjórflötungur',
    molecularGeometry: 'Þríhyrnd pýramída',
    correctGeometryId: 'trigonal-pyramidal',
    bondAngle: '107°',
    isPolar: true,
    explanation:
      'Nitur hefur 5 gildisrafeindir. 3 fara í tengsl við H, 2 mynda einstætt par. 4 rafeinasvið gefa fjórflötungs rafeinalögun, en 1 einstætt par gerir sameindarlögunina þríhyrnda pýramídu.',
  },
  {
    id: 3,
    formula: 'CH₄',
    name: 'Metan',
    lewisStructure: '    H\n    |\nH — C — H\n    |\n    H',
    centralAtom: 'C',
    bondingPairs: 4,
    lonePairs: 0,
    electronDomains: 4,
    electronGeometry: 'Fjórflötungur',
    molecularGeometry: 'Fjórflötungur',
    correctGeometryId: 'tetrahedral',
    bondAngle: '109.5°',
    isPolar: false,
    explanation:
      'Kolefni hefur 4 gildisrafeindir sem allar fara í tengsl við H. 4 rafeinasvið, engin einstæð pör — fullkomin fjórflötungs lögun.',
  },
  {
    id: 4,
    formula: 'CO₂',
    name: 'Koltvísýringur',
    lewisStructure: 'O = C = O',
    centralAtom: 'C',
    bondingPairs: 2,
    lonePairs: 0,
    electronDomains: 2,
    electronGeometry: 'Línuleg',
    molecularGeometry: 'Línuleg',
    correctGeometryId: 'linear',
    bondAngle: '180°',
    isPolar: false,
    explanation:
      'Tvöfaldar tengingar telja sem eitt rafeinasvið hvor. 2 rafeinasvið = línuleg lögun með 180° horn.',
  },
  {
    id: 5,
    formula: 'BF₃',
    name: 'Bórþríflúoríð',
    lewisStructure: '    F\n    |\n F — B — F',
    centralAtom: 'B',
    bondingPairs: 3,
    lonePairs: 0,
    electronDomains: 3,
    electronGeometry: 'Þríhyrnd slétt',
    molecularGeometry: 'Þríhyrnd slétt',
    correctGeometryId: 'trigonal-planar',
    bondAngle: '120°',
    isPolar: false,
    explanation:
      'Bór hefur aðeins 3 gildisrafeindir og myndar 3 tengsl án einstæðra para. 3 rafeinasvið = þríhyrnd slétt lögun.',
  },
  {
    id: 6,
    formula: 'PCl₅',
    name: 'Fosfórpentaklóríð',
    lewisStructure: '    Cl\n    |\nCl-P-Cl\n   /|\\\n Cl Cl',
    centralAtom: 'P',
    bondingPairs: 5,
    lonePairs: 0,
    electronDomains: 5,
    electronGeometry: 'Þríhyrnd tvípýramída',
    molecularGeometry: 'Þríhyrnd tvípýramída',
    correctGeometryId: 'trigonal-bipyramidal',
    bondAngle: '90° og 120°',
    isPolar: false,
    explanation:
      'Fosfór getur rúmað 5 tengsl vegna d-skelja. 5 rafeinasvið = þríhyrnd tvípýramída með 3 á miðsléttunni (120°) og 2 á ásnum (90°).',
  },
  {
    id: 7,
    formula: 'SF₄',
    name: 'Brennisteinstetraflúoríð',
    lewisStructure: '  :: F\n   \\|\nF-S-F\n   /\n  F',
    centralAtom: 'S',
    bondingPairs: 4,
    lonePairs: 1,
    electronDomains: 5,
    electronGeometry: 'Þríhyrnd tvípýramída',
    molecularGeometry: 'Sjáldruslögun',
    correctGeometryId: 'seesaw',
    bondAngle: '90° og 120°',
    isPolar: true,
    explanation:
      'Brennisteinn hefur 6 gildisrafeindir. 4 í tengsl, 2 mynda einstætt par. 5 rafeinasvið = þríhyrnd tvípýramída en einstæða parið veldur sjáldruslögun.',
  },
  {
    id: 8,
    formula: 'SF₆',
    name: 'Brennisteinshexaflúoríð',
    lewisStructure: '    F\n    |\nF-S-F\n   /|\\\n F F F',
    centralAtom: 'S',
    bondingPairs: 6,
    lonePairs: 0,
    electronDomains: 6,
    electronGeometry: 'Áttflötungur',
    molecularGeometry: 'Áttflötungur',
    correctGeometryId: 'octahedral',
    bondAngle: '90°',
    isPolar: false,
    explanation:
      'Brennisteinn getur rúmað 6 tengsl vegna d-skelja. 6 rafeinasvið í samhverfri áttflötungsröðun með öll horn 90°.',
  },
  {
    id: 9,
    formula: 'XeF₄',
    name: 'Xenontetraflúoríð',
    lewisStructure: '::  F  ::\n    |   \nF - Xe - F\n    |   \n    F',
    centralAtom: 'Xe',
    bondingPairs: 4,
    lonePairs: 2,
    electronDomains: 6,
    electronGeometry: 'Áttflötungur',
    molecularGeometry: 'Ferningsslétt',
    correctGeometryId: 'square-planar',
    bondAngle: '90°',
    isPolar: false,
    explanation:
      'Xenon hefur 8 gildisrafeindir. 4 í tengsl, 4 mynda 2 einstæð pör. 6 rafeinasvið = áttflötungs rafeinalögun, en 2 einstæð pör (í andstæðum stöðum) gefa ferningssléttu lögun.',
  },
  {
    id: 10,
    formula: 'ClF₃',
    name: 'Klórþríflúoríð',
    lewisStructure: '    F\n    |\n::Cl::\n   / \\\n  F   F',
    centralAtom: 'Cl',
    bondingPairs: 3,
    lonePairs: 2,
    electronDomains: 5,
    electronGeometry: 'Þríhyrnd tvípýramída',
    molecularGeometry: 'T-lögun',
    correctGeometryId: 't-shaped',
    bondAngle: '90°',
    isPolar: true,
    explanation:
      'Klór hefur 7 gildisrafeindir. 3 í tengsl, 4 mynda 2 einstæð pör. 5 rafeinasvið = þríhyrnd tvípýramída en 2 einstæð pör á miðsléttunni gefa T-lögun.',
  },
];

// Constrained geometry options by electron domain count
const GEOMETRIES_BY_DOMAINS: Record<number, { id: string; name: string }[]> = {
  2: [{ id: 'linear', name: 'Línuleg' }],
  3: [
    { id: 'trigonal-planar', name: 'Þríhyrnd slétt' },
    { id: 'bent', name: 'Beygð' },
  ],
  4: [
    { id: 'tetrahedral', name: 'Fjórflötungur' },
    { id: 'trigonal-pyramidal', name: 'Þríhyrnd pýramída' },
    { id: 'bent', name: 'Beygð' },
  ],
  5: [
    { id: 'trigonal-bipyramidal', name: 'Þríhyrnd tvípýramída' },
    { id: 'seesaw', name: 'Sjáldruslögun' },
    { id: 't-shaped', name: 'T-lögun' },
    { id: 'linear', name: 'Línuleg' },
  ],
  6: [
    { id: 'octahedral', name: 'Áttflötungur' },
    { id: 'square-planar', name: 'Ferningsslétt' },
  ],
};

const ELECTRON_GEOMETRY_NAME: Record<number, string> = {
  2: 'Línuleg',
  3: 'Þríhyrnd slétt',
  4: 'Fjórflötungur',
  5: 'Þríhyrnd tvípýramída',
  6: 'Áttflötungur',
};

// Geometry IDs that have repulsion animations available
const ANIMATED_GEOMETRIES = new Set([
  'linear',
  'trigonal-planar',
  'tetrahedral',
  'trigonal-pyramidal',
  'bent',
  'octahedral',
]);

interface Step {
  id: 'count' | 'geometry' | 'angle' | 'explanation';
  label: string;
}

const STEPS: Step[] = [
  { id: 'count', label: 'Telja rafeinasvið' },
  { id: 'geometry', label: 'Velja lögun' },
  { id: 'angle', label: 'Tengihorn' },
  { id: 'explanation', label: 'Útskýra' },
];

export function Level2({ onComplete, onBack }: Level2Props) {
  const [currentMolecule, setCurrentMolecule] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [, setTotalHintsUsed] = useState(0);
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');

  // Step answers
  const [bondingPairsAnswer, setBondingPairsAnswer] = useState('');
  const [lonePairsAnswer, setLonePairsAnswer] = useState('');
  const [selectedGeometry, setSelectedGeometry] = useState<string | null>(null);
  const [selectedAngle, setSelectedAngle] = useState('');
  const [explanation, setExplanation] = useState('');

  // Track whether geometry has been correctly predicted (controls visualization)
  const [geometryRevealed, setGeometryRevealed] = useState(false);

  // Feedback states
  const [stepResult, setStepResult] = useState<'correct' | 'incorrect' | null>(null);

  const molecule = molecules[currentMolecule];
  const step = STEPS[currentStep];

  // Get constrained geometry options for the current molecule's domain count
  const geometryOptions = useMemo(
    () => GEOMETRIES_BY_DOMAINS[molecule.electronDomains] || GEOMETRY_OPTIONS,
    [molecule.electronDomains]
  );

  const checkStep = () => {
    let correct = false;

    if (step.id === 'count') {
      correct =
        parseInt(bondingPairsAnswer) === molecule.bondingPairs &&
        parseInt(lonePairsAnswer) === molecule.lonePairs;
    } else if (step.id === 'geometry') {
      correct = selectedGeometry === molecule.correctGeometryId;
    } else if (step.id === 'angle') {
      // Accept approximate answers — parse numeric values with ±2° tolerance
      const normalizedAnswer = selectedAngle.replace(/\s/g, '').toLowerCase();
      const normalizedCorrect = molecule.bondAngle.replace(/\s/g, '').toLowerCase();

      // Extract numeric values from the correct answer (e.g. "109.5°" → [109.5], "90° og 120°" → [90, 120])
      const correctNums = normalizedCorrect.match(/[\d.]+/g)?.map(Number) || [];
      const answerNums = normalizedAnswer.match(/[\d.]+/g)?.map(Number) || [];

      if (correctNums.length === 1 && answerNums.length >= 1) {
        // Single-angle geometry: accept if any entered number is within ±2°
        correct = answerNums.some((a) => Math.abs(a - correctNums[0]) <= 2);
      } else if (correctNums.length >= 2 && answerNums.length >= 2) {
        // Multi-angle geometry (e.g. "90° og 120°"): all correct angles must be matched within ±2°
        correct = correctNums.every((c) => answerNums.some((a) => Math.abs(a - c) <= 2));
      } else {
        // Fallback to string matching
        correct =
          normalizedAnswer === normalizedCorrect ||
          normalizedAnswer.includes(normalizedCorrect.replace('°', ''));
      }

      // Special case: bent geometry accepts ~104-105°
      if (!correct && molecule.correctGeometryId === 'bent') {
        correct = answerNums.some((a) => a >= 103 && a <= 106);
      }
    } else if (step.id === 'explanation') {
      // Always correct for explanation step - it's about learning
      correct = explanation.length > 20;
    }

    setStepResult(correct ? 'correct' : 'incorrect');

    if (correct) {
      setScore((prev) => prev + 10);
      if (step.id === 'geometry') {
        setGeometryRevealed(true);
      }
    }
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
      setStepResult(null);
      setShowHint(false);
    } else {
      // Move to next molecule
      if (currentMolecule < molecules.length - 1) {
        setCurrentMolecule((prev) => prev + 1);
        resetStepAnswers();
      } else {
        onComplete(score);
      }
    }
  };

  const resetStepAnswers = () => {
    setCurrentStep(0);
    setBondingPairsAnswer('');
    setLonePairsAnswer('');
    setSelectedGeometry(null);
    setSelectedAngle('');
    setExplanation('');
    setStepResult(null);
    setShowHint(false);
    setGeometryRevealed(false);
  };

  const getHint = () => {
    if (step.id === 'count') {
      return `${molecule.centralAtom} hefur ${molecule.bondingPairs + molecule.lonePairs * 2} gildisrafeindir. Hversu margar fara í tengsl?`;
    } else if (step.id === 'geometry') {
      return `Einstæð pör taka meira pláss en bindandi pör og hrinda þeim saman. ${molecule.lonePairs === 0 ? 'Engin einstæð pör — rafeinalögun = sameindarlögun.' : 'Hversu mikil áhrif hafa ' + molecule.lonePairs + ' einstæð pör?'}`;
    } else if (step.id === 'angle') {
      return `Þessi lögun hefur venjulega horn nálægt ${molecule.bondAngle}.`;
    }
    return 'Útskýrðu af hverju þessi lögun myndast út frá fjölda rafeinasviða.';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
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
              Sameind {currentMolecule + 1} af {molecules.length}
            </div>
            <div className="text-lg font-bold text-teal-600">{score} stig</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-warm-200 rounded-full h-2 mb-6">
          <div
            className="bg-teal-500 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${((currentMolecule * STEPS.length + currentStep + 1) / (molecules.length * STEPS.length)) * 100}%`,
            }}
          />
        </div>

        {/* Steps indicator */}
        <div className="flex gap-2 mb-6">
          {STEPS.map((s, idx) => (
            <div
              key={s.id}
              className={`flex-1 text-center py-2 rounded-lg text-sm font-medium ${
                idx === currentStep
                  ? 'bg-teal-500 text-white'
                  : idx < currentStep
                    ? 'bg-green-100 text-green-700'
                    : 'bg-warm-100 text-warm-500'
              }`}
            >
              {s.label}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
          {/* Molecule display */}
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <div className="flex-1">
              {geometryRevealed ? (
                <>
                  {/* 2D/3D Toggle — only after geometry predicted */}
                  <div className="flex justify-center gap-2 mb-3">
                    <button
                      onClick={() => setViewMode('2d')}
                      className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        viewMode === '2d'
                          ? 'bg-teal-600 text-white'
                          : 'bg-warm-200 text-warm-600 hover:bg-warm-300'
                      }`}
                    >
                      2D
                    </button>
                    <button
                      onClick={() => setViewMode('3d')}
                      className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        viewMode === '3d'
                          ? 'bg-teal-600 text-white'
                          : 'bg-warm-200 text-warm-600 hover:bg-warm-300'
                      }`}
                    >
                      3D
                    </button>
                  </div>

                  <div className="bg-warm-900 rounded-xl p-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white mb-2">{molecule.formula}</div>
                      <div className="text-warm-400 mb-4">{molecule.name}</div>
                      <div className="flex justify-center py-4">
                        {viewMode === '2d' ? (
                          <AnimatedMolecule
                            molecule={vseprToMolecule({
                              formula: molecule.formula,
                              name: molecule.name,
                              centralAtom: molecule.centralAtom,
                              bondingPairs: molecule.bondingPairs,
                              lonePairs: molecule.lonePairs,
                              electronDomains: molecule.electronDomains,
                              correctGeometryId: molecule.correctGeometryId,
                              isPolar: molecule.isPolar,
                            })}
                            mode="vsepr"
                            size="lg"
                            animation="scale-in"
                            showLonePairs={true}
                            ariaLabel={`${molecule.name} VSEPR lögun`}
                          />
                        ) : (
                          <MoleculeViewer3DLazy
                            molecule={vseprToMolecule({
                              formula: molecule.formula,
                              name: molecule.name,
                              centralAtom: molecule.centralAtom,
                              bondingPairs: molecule.bondingPairs,
                              lonePairs: molecule.lonePairs,
                              electronDomains: molecule.electronDomains,
                              correctGeometryId: molecule.correctGeometryId,
                              isPolar: molecule.isPolar,
                            })}
                            style="ball-stick"
                            showLabels={true}
                            autoRotate={true}
                            autoRotateSpeed={1.5}
                            height={200}
                            width="100%"
                            backgroundColor="transparent"
                          />
                        )}
                      </div>
                      {viewMode === '3d' && (
                        <div className="text-xs text-warm-500 mt-2">
                          Dragðu til að snúa, skrollaðu til að stækka
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Repulsion animation — show why the geometry forms */}
                  {ANIMATED_GEOMETRIES.has(molecule.correctGeometryId) && (
                    <div className="mt-4 bg-indigo-50 rounded-xl p-4 border border-indigo-200">
                      <div className="text-sm font-bold text-indigo-800 mb-2">
                        Hvers vegna þessi lögun?
                      </div>
                      <ElectronRepulsionAnimation
                        geometryId={molecule.correctGeometryId}
                        autoPlay={true}
                        showForces={true}
                        compact={true}
                      />
                    </div>
                  )}
                </>
              ) : (
                /* Before geometry predicted — show Lewis structure + domain info */
                <div className="bg-warm-900 rounded-xl p-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-2">{molecule.formula}</div>
                    <div className="text-warm-400 mb-2">{molecule.name}</div>
                    <div className="font-mono text-teal-400 my-4 whitespace-pre text-sm">
                      {molecule.lewisStructure}
                    </div>
                    <div className="text-warm-500 text-sm">Spáðu fyrir um lögun sameindarinnar</div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1 bg-warm-50 rounded-xl p-6">
              <h3 className="font-bold text-warm-700 mb-4">Miðatóm: {molecule.centralAtom}</h3>

              {/* Step content */}
              {step.id === 'count' && (
                <div className="space-y-4">
                  <p className="text-warm-600">Teldu rafeinasvið í kringum miðatómið:</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-warm-600 mb-1">
                        Bindandi pör
                      </label>
                      <input
                        type="number"
                        value={bondingPairsAnswer}
                        onChange={(e) => setBondingPairsAnswer(e.target.value)}
                        disabled={stepResult !== null}
                        className="w-full p-3 border-2 border-warm-300 rounded-xl text-center text-xl"
                        min="0"
                        max="6"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-warm-600 mb-1">
                        Einstæð pör
                      </label>
                      <input
                        type="number"
                        value={lonePairsAnswer}
                        onChange={(e) => setLonePairsAnswer(e.target.value)}
                        disabled={stepResult !== null}
                        className="w-full p-3 border-2 border-warm-300 rounded-xl text-center text-xl"
                        min="0"
                        max="3"
                      />
                    </div>
                  </div>
                  {stepResult === 'correct' && (
                    <div className="bg-teal-50 p-3 rounded-lg">
                      <span className="font-bold text-teal-700">Samtals rafeinasvið: </span>
                      <span className="text-teal-600">{molecule.electronDomains}</span>
                    </div>
                  )}
                </div>
              )}

              {step.id === 'geometry' && (
                <div className="space-y-4">
                  <div className="bg-teal-50 p-3 rounded-lg mb-2">
                    <div className="text-sm text-teal-800">
                      <strong>{molecule.electronDomains} rafeinasvið</strong> → rafeinalögun:{' '}
                      <strong>{ELECTRON_GEOMETRY_NAME[molecule.electronDomains]}</strong>
                    </div>
                    <div className="text-sm text-teal-700 mt-1">
                      {molecule.bondingPairs} bindandi + {molecule.lonePairs} einstæð pör
                    </div>
                  </div>
                  <p className="text-warm-600">
                    Með {molecule.lonePairs} einstæð pör, hvaða <strong>sameindarlögun</strong>{' '}
                    myndast?
                  </p>
                  <div className="space-y-2">
                    {geometryOptions.map((geo) => {
                      const isCorrectGeo = geo.id === molecule.correctGeometryId;
                      const isPickedWrong =
                        stepResult !== null && selectedGeometry === geo.id && !isCorrectGeo;
                      return (
                        <button
                          key={geo.id}
                          onClick={() => !stepResult && setSelectedGeometry(geo.id)}
                          disabled={stepResult !== null}
                          className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                            stepResult
                              ? isCorrectGeo
                                ? 'border-green-500 bg-green-50'
                                : selectedGeometry === geo.id
                                  ? 'border-red-500 bg-red-50'
                                  : 'border-warm-200 opacity-50'
                              : selectedGeometry === geo.id
                                ? 'border-teal-500 bg-teal-50 ring-2 ring-teal-200'
                                : 'border-warm-200 hover:border-teal-300 hover:bg-teal-50'
                          }`}
                        >
                          <div className="flex items-center gap-2 font-bold">
                            {stepResult && isCorrectGeo && (
                              <span aria-label="Rétt svar" className="text-green-700">
                                ✓
                              </span>
                            )}
                            {isPickedWrong && (
                              <span aria-label="Rangt svar" className="text-red-700">
                                ✗
                              </span>
                            )}
                            <span>{geo.name}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {stepResult === 'correct' && (
                    <div className="bg-green-50 p-3 rounded-lg text-green-700 text-sm">
                      Rétt! {molecule.electronGeometry} rafeinalögun → {molecule.molecularGeometry}{' '}
                      sameindarlögun.
                    </div>
                  )}
                </div>
              )}

              {step.id === 'angle' && (
                <div className="space-y-4">
                  <p className="text-warm-600">
                    Hvert er (eru) tengihornið/-in í {molecule.formula}?
                  </p>
                  <input
                    type="text"
                    value={selectedAngle}
                    onChange={(e) => setSelectedAngle(e.target.value)}
                    disabled={stepResult !== null}
                    placeholder="t.d. 109.5° eða 90° og 120°"
                    className="w-full p-3 border-2 border-warm-300 rounded-xl"
                  />
                  {stepResult === 'correct' && (
                    <div className="bg-green-50 p-3 rounded-lg text-green-700">
                      Rétt! Tengihornið er {molecule.bondAngle}
                    </div>
                  )}
                  {stepResult === 'incorrect' && (
                    <div className="bg-red-50 p-3 rounded-lg text-red-700">
                      Rétt svar: {molecule.bondAngle}
                    </div>
                  )}

                  {/* Bond angle visual indicator */}
                  {stepResult !== null && (
                    <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200">
                      <div className="font-bold text-indigo-800 mb-3 flex items-center gap-2">
                        <span className="text-lg">📐</span> Tengihorn í {molecule.molecularGeometry}
                      </div>
                      <div className="flex items-center justify-center py-4">
                        <svg width="180" height="120" viewBox="0 0 180 120" className="drop-shadow">
                          {/* Central atom */}
                          <circle
                            cx="90"
                            cy="80"
                            r="18"
                            fill="#0d9488"
                            stroke="#134e4a"
                            strokeWidth="2"
                          />
                          <text
                            x="90"
                            y="85"
                            textAnchor="middle"
                            fill="white"
                            fontWeight="bold"
                            fontSize="14"
                          >
                            {molecule.centralAtom}
                          </text>

                          {/* Bond lines - simplified representation */}
                          {molecule.correctGeometryId === 'linear' && (
                            <>
                              <line
                                x1="20"
                                y1="80"
                                x2="72"
                                y2="80"
                                stroke="#374151"
                                strokeWidth="3"
                              />
                              <line
                                x1="108"
                                y1="80"
                                x2="160"
                                y2="80"
                                stroke="#374151"
                                strokeWidth="3"
                              />
                              {/* Angle arc */}
                              <path
                                d="M 60 80 A 30 30 0 0 1 120 80"
                                fill="none"
                                stroke="#8b5cf6"
                                strokeWidth="2"
                                strokeDasharray="4 2"
                              />
                              <text
                                x="90"
                                y="60"
                                textAnchor="middle"
                                fill="#8b5cf6"
                                fontWeight="bold"
                                fontSize="12"
                              >
                                180°
                              </text>
                            </>
                          )}

                          {molecule.correctGeometryId === 'trigonal-planar' && (
                            <>
                              <line
                                x1="90"
                                y1="62"
                                x2="90"
                                y2="20"
                                stroke="#374151"
                                strokeWidth="3"
                              />
                              <line
                                x1="72"
                                y1="80"
                                x2="30"
                                y2="100"
                                stroke="#374151"
                                strokeWidth="3"
                              />
                              <line
                                x1="108"
                                y1="80"
                                x2="150"
                                y2="100"
                                stroke="#374151"
                                strokeWidth="3"
                              />
                              <path
                                d="M 70 35 A 25 25 0 0 1 110 35"
                                fill="none"
                                stroke="#8b5cf6"
                                strokeWidth="2"
                                strokeDasharray="4 2"
                              />
                              <text
                                x="90"
                                y="50"
                                textAnchor="middle"
                                fill="#8b5cf6"
                                fontWeight="bold"
                                fontSize="11"
                              >
                                120°
                              </text>
                            </>
                          )}

                          {(molecule.correctGeometryId === 'tetrahedral' ||
                            molecule.correctGeometryId === 'trigonal-pyramidal' ||
                            molecule.correctGeometryId === 'bent') && (
                            <>
                              <line
                                x1="72"
                                y1="80"
                                x2="30"
                                y2="55"
                                stroke="#374151"
                                strokeWidth="3"
                              />
                              <line
                                x1="108"
                                y1="80"
                                x2="150"
                                y2="55"
                                stroke="#374151"
                                strokeWidth="3"
                              />
                              {molecule.bondingPairs >= 3 && (
                                <line
                                  x1="90"
                                  y1="62"
                                  x2="90"
                                  y2="20"
                                  stroke="#374151"
                                  strokeWidth="3"
                                />
                              )}
                              {molecule.bondingPairs >= 4 && (
                                <line
                                  x1="90"
                                  y1="98"
                                  x2="90"
                                  y2="115"
                                  stroke="#374151"
                                  strokeWidth="3"
                                />
                              )}
                              <path
                                d="M 50 55 A 35 35 0 0 1 130 55"
                                fill="none"
                                stroke="#8b5cf6"
                                strokeWidth="2"
                                strokeDasharray="4 2"
                              />
                              <text
                                x="90"
                                y="45"
                                textAnchor="middle"
                                fill="#8b5cf6"
                                fontWeight="bold"
                                fontSize="11"
                              >
                                {molecule.bondAngle}
                              </text>
                            </>
                          )}

                          {molecule.correctGeometryId === 'octahedral' && (
                            <>
                              <line
                                x1="90"
                                y1="62"
                                x2="90"
                                y2="20"
                                stroke="#374151"
                                strokeWidth="3"
                              />
                              <line
                                x1="72"
                                y1="80"
                                x2="30"
                                y2="80"
                                stroke="#374151"
                                strokeWidth="3"
                              />
                              <line
                                x1="108"
                                y1="80"
                                x2="150"
                                y2="80"
                                stroke="#374151"
                                strokeWidth="3"
                              />
                              <line
                                x1="90"
                                y1="98"
                                x2="90"
                                y2="115"
                                stroke="#374151"
                                strokeWidth="3"
                              />
                              <path
                                d="M 90 50 A 30 30 0 0 1 120 80"
                                fill="none"
                                stroke="#8b5cf6"
                                strokeWidth="2"
                                strokeDasharray="4 2"
                              />
                              <text
                                x="115"
                                y="60"
                                textAnchor="middle"
                                fill="#8b5cf6"
                                fontWeight="bold"
                                fontSize="11"
                              >
                                90°
                              </text>
                            </>
                          )}

                          {molecule.correctGeometryId === 'square-planar' && (
                            <>
                              {/* 4 bonds in the square plane (left, right, top, bottom) */}
                              <line
                                x1="90"
                                y1="62"
                                x2="90"
                                y2="20"
                                stroke="#374151"
                                strokeWidth="3"
                              />
                              <line
                                x1="72"
                                y1="80"
                                x2="30"
                                y2="80"
                                stroke="#374151"
                                strokeWidth="3"
                              />
                              <line
                                x1="108"
                                y1="80"
                                x2="150"
                                y2="80"
                                stroke="#374151"
                                strokeWidth="3"
                              />
                              <line
                                x1="90"
                                y1="98"
                                x2="90"
                                y2="115"
                                stroke="#374151"
                                strokeWidth="3"
                              />
                              {/* 2 lone pairs (axial, perpendicular to plane) */}
                              <ellipse
                                cx="65"
                                cy="55"
                                rx="7"
                                ry="5"
                                fill="none"
                                stroke="#ec4899"
                                strokeWidth="2"
                                strokeDasharray="3 2"
                              />
                              <text x="55" y="48" fontSize="8" fill="#ec4899" fontWeight="bold">
                                LP
                              </text>
                              <ellipse
                                cx="115"
                                cy="105"
                                rx="7"
                                ry="5"
                                fill="none"
                                stroke="#ec4899"
                                strokeWidth="2"
                                strokeDasharray="3 2"
                              />
                              <text x="125" y="108" fontSize="8" fill="#ec4899" fontWeight="bold">
                                LP
                              </text>
                              <path
                                d="M 90 50 A 30 30 0 0 1 120 80"
                                fill="none"
                                stroke="#8b5cf6"
                                strokeWidth="2"
                                strokeDasharray="4 2"
                              />
                              <text
                                x="115"
                                y="60"
                                textAnchor="middle"
                                fill="#8b5cf6"
                                fontWeight="bold"
                                fontSize="11"
                              >
                                90°
                              </text>
                            </>
                          )}

                          {(molecule.correctGeometryId === 'trigonal-bipyramidal' ||
                            molecule.correctGeometryId === 'seesaw' ||
                            molecule.correctGeometryId === 't-shaped') && (
                            <>
                              <line
                                x1="90"
                                y1="62"
                                x2="90"
                                y2="15"
                                stroke="#374151"
                                strokeWidth="3"
                              />
                              <line
                                x1="90"
                                y1="98"
                                x2="90"
                                y2="115"
                                stroke="#374151"
                                strokeWidth="3"
                              />
                              <line
                                x1="72"
                                y1="80"
                                x2="30"
                                y2="80"
                                stroke="#374151"
                                strokeWidth="3"
                              />
                              <line
                                x1="108"
                                y1="80"
                                x2="150"
                                y2="80"
                                stroke="#374151"
                                strokeWidth="3"
                              />
                              <path
                                d="M 90 45 A 35 35 0 0 1 125 80"
                                fill="none"
                                stroke="#8b5cf6"
                                strokeWidth="2"
                                strokeDasharray="4 2"
                              />
                              <text
                                x="130"
                                y="55"
                                textAnchor="start"
                                fill="#8b5cf6"
                                fontWeight="bold"
                                fontSize="10"
                              >
                                90°
                              </text>
                              <text
                                x="50"
                                y="95"
                                textAnchor="middle"
                                fill="#f59e0b"
                                fontWeight="bold"
                                fontSize="10"
                              >
                                120°
                              </text>
                            </>
                          )}
                        </svg>
                      </div>
                      <div className="text-xs text-indigo-600 text-center">
                        {molecule.lonePairs > 0 && (
                          <span>
                            ⚠️ Einstæð pör (ekki sýnd) minnka hornið frá fullkominni röðun
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {step.id === 'explanation' && (
                <div className="space-y-4">
                  <p className="text-warm-600">
                    Útskýrðu af hverju {molecule.formula} hefur{' '}
                    {molecule.molecularGeometry.toLowerCase()} lögun:
                  </p>
                  <textarea
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    disabled={stepResult !== null}
                    placeholder="Skrifaðu útskýringu..."
                    rows={4}
                    className="w-full p-3 border-2 border-warm-300 rounded-xl resize-none"
                  />
                  {stepResult !== null && (
                    <div className="bg-teal-50 p-4 rounded-lg">
                      <div className="font-bold text-teal-800 mb-2">Dæmi um útskýringu:</div>
                      <p className="text-teal-700 text-sm">{molecule.explanation}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Hint and buttons */}
          {!stepResult && !showHint && (
            <button
              onClick={() => {
                setShowHint(true);
                setTotalHintsUsed((prev) => prev + 1);
              }}
              className="text-teal-600 hover:text-teal-800 text-sm underline mb-4"
            >
              Syna visbendingu
            </button>
          )}

          {showHint && !stepResult && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl mb-4">
              <span className="font-bold text-yellow-800">Vísbending: </span>
              <span className="text-yellow-900">{getHint()}</span>
            </div>
          )}

          {stepResult && (
            <div
              className={`p-4 rounded-xl mb-4 ${
                stepResult === 'correct'
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              <div
                className={`font-bold ${stepResult === 'correct' ? 'text-green-700' : 'text-red-700'}`}
              >
                {stepResult === 'correct' ? 'Rétt!' : 'Rangt — Sjáðu rétt svar hér að ofan'}
              </div>
            </div>
          )}

          {!stepResult ? (
            <button
              onClick={checkStep}
              disabled={
                (step.id === 'count' && (!bondingPairsAnswer || !lonePairsAnswer)) ||
                (step.id === 'geometry' && !selectedGeometry) ||
                (step.id === 'angle' && !selectedAngle) ||
                (step.id === 'explanation' && explanation.length < 10)
              }
              className="w-full bg-teal-500 hover:bg-teal-600 disabled:bg-warm-300 text-white font-bold py-4 px-6 rounded-xl transition-colors"
            >
              Athuga svar
            </button>
          ) : (
            <button
              onClick={nextStep}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-4 px-6 rounded-xl transition-colors"
            >
              {currentStep < STEPS.length - 1
                ? 'Næsta skref'
                : currentMolecule < molecules.length - 1
                  ? 'Næsta sameind'
                  : 'Ljúka stigi 2'}
            </button>
          )}
        </div>

        {/* Reference table */}
        <div className="mt-6 bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-bold text-warm-700 mb-3">Lögunartafla</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-warm-50">
                  <th className="p-2 text-left">Rafeinasvið</th>
                  <th className="p-2 text-left">BP</th>
                  <th className="p-2 text-left">LP</th>
                  <th className="p-2 text-left">Lögun</th>
                  <th className="p-2 text-left">Horn</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="p-2">2</td>
                  <td>2</td>
                  <td>0</td>
                  <td>Línuleg</td>
                  <td>180°</td>
                </tr>
                <tr className="border-t">
                  <td className="p-2">3</td>
                  <td>3</td>
                  <td>0</td>
                  <td>Þríhyrnd slétt</td>
                  <td>120°</td>
                </tr>
                <tr className="border-t">
                  <td className="p-2">3</td>
                  <td>2</td>
                  <td>1</td>
                  <td>Beygð</td>
                  <td>&lt;120°</td>
                </tr>
                <tr className="border-t">
                  <td className="p-2">4</td>
                  <td>4</td>
                  <td>0</td>
                  <td>Fjórflötungur</td>
                  <td>109.5°</td>
                </tr>
                <tr className="border-t">
                  <td className="p-2">4</td>
                  <td>3</td>
                  <td>1</td>
                  <td>Þríhyrnd pýramída</td>
                  <td>107°</td>
                </tr>
                <tr className="border-t">
                  <td className="p-2">4</td>
                  <td>2</td>
                  <td>2</td>
                  <td>Beygð</td>
                  <td>104.5°</td>
                </tr>
                <tr className="border-t bg-purple-50">
                  <td className="p-2">5</td>
                  <td>5</td>
                  <td>0</td>
                  <td>Þríhyrnd tvípýramída</td>
                  <td>90°, 120°</td>
                </tr>
                <tr className="border-t bg-purple-50">
                  <td className="p-2">5</td>
                  <td>4</td>
                  <td>1</td>
                  <td>Sjáldruslögun</td>
                  <td>~90°, ~120°</td>
                </tr>
                <tr className="border-t bg-purple-50">
                  <td className="p-2">5</td>
                  <td>3</td>
                  <td>2</td>
                  <td>T-lögun</td>
                  <td>90°</td>
                </tr>
                <tr className="border-t bg-indigo-50">
                  <td className="p-2">6</td>
                  <td>6</td>
                  <td>0</td>
                  <td>Áttflötungur</td>
                  <td>90°</td>
                </tr>
                <tr className="border-t bg-indigo-50">
                  <td className="p-2">6</td>
                  <td>4</td>
                  <td>2</td>
                  <td>Ferningsslétt</td>
                  <td>90°</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
