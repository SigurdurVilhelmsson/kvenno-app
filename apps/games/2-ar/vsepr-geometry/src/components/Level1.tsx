import { useState, useMemo } from 'react';
import { AnimatedMolecule, FeedbackPanel, MoleculeViewer3DLazy } from '@shared/components';
import type { TieredHints } from '@shared/types';
import { geometryToMolecule } from '../utils/vseprConverter';
import { shuffleArray } from '@shared/utils';
import { BondAngleMeasurement } from './BondAngleMeasurement';
import { ElectronRepulsionAnimation } from './ElectronRepulsionAnimation';
import { ShapeTransitionAnimation } from './ShapeTransitionAnimation';

// Misconceptions for VSEPR geometry
const VSEPR_MISCONCEPTIONS: Record<string, string> = {
  electron_domains: 'Rafeinasvið = bindandi pör + einstæð pör. Tvítengi og þrítengi telja sem EITT svið.',
  lone_pairs: 'Einstæð pör taka meira pláss en bindandi pör og ýta horninu niður.',
  geometry: 'Rafeindaröðun (electron geometry) vs sameindaröðun (molecular geometry) - einstæð pör sjást ekki í sameindaröðun.',
  bond_angle: 'Einstæð pör minnka hornið: fjórflötungur (109.5°) → pýramída (107°) → beygð (104.5°).',
};

// Related concepts for VSEPR
const VSEPR_RELATED: string[] = ['VSEPR kenningin', 'Rafeinasvið', 'Sameindaröðun', 'Tengjahorn'];

interface Level1Props {
  onComplete: (score: number, maxScore: number, hintsUsed: number) => void;
  onBack: () => void;
  onCorrectAnswer?: () => void;
  onIncorrectAnswer?: () => void;
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
    exampleName: 'Koltvísýringur',
    description: 'Tvö rafeinasvið staðsetjast á sitthvora hlið miðatómsins.',
    visual: '○—●—○'
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
    description: 'Þrjú rafeinasvið dreifist jafnt í sléttu þríhyrningsformi.',
    visual: '○╲\n  ●\n○╱ ╲○'
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
    exampleName: 'Brennisteinstvísýringur',
    description: 'Einstætt par ýtir bindandi pörum saman — lægra horn.',
    visual: '○╲  ::\n  ●\n○╱'
  },
  {
    id: 'tetrahedral',
    name: 'Fjórflötungur',
    nameEn: 'Tetrahedral',
    electronDomains: 4,
    bondingPairs: 4,
    lonePairs: 0,
    electronGeometry: 'Fjórflötungur',
    molecularGeometry: 'Fjórflötungur',
    bondAngle: '109.5°',
    example: 'CH₄',
    exampleName: 'Metan',
    description: 'Fjögur rafeinasvið í þrívíð fjórflötungsröðun.',
    visual: '    ○\n    |\n○—●—○\n    |\n    ○'
  },
  {
    id: 'trigonal-pyramidal',
    name: 'Þríhyrnd pýramída',
    nameEn: 'Trigonal Pyramidal',
    electronDomains: 4,
    bondingPairs: 3,
    lonePairs: 1,
    electronGeometry: 'Fjórflötungur',
    molecularGeometry: 'Þríhyrnd pýramída',
    bondAngle: '107°',
    example: 'NH₃',
    exampleName: 'Ammóníak',
    description: 'Einstætt par ofan á þremur bindandi — pýramídalögun.',
    visual: '    ::\n    |\n○—●—○\n    |\n    ○'
  },
  {
    id: 'bent-4',
    name: 'Beygð (2 lp)',
    nameEn: 'Bent',
    electronDomains: 4,
    bondingPairs: 2,
    lonePairs: 2,
    electronGeometry: 'Fjórflötungur',
    molecularGeometry: 'Beygð',
    bondAngle: '104.5°',
    example: 'H₂O',
    exampleName: 'Vatn',
    description: 'Tvö einstæð pör þrýsta bindandi pörum saman.',
    visual: '  ::  ::\n    \\ /\n○—●—○'
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
    description: 'Fimm rafeinasvið — þrjú í miðsléttunni (120°), tvö lóðrétt (90°).',
    visual: '    ○\n    |\n○-●-○\n   /|\\\n  ○ ○'
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
    description: 'Sex rafeinasvið í samhverfri áttflötungsröðun.',
    visual: '    ○\n    |\n○-●-○\n   /|\n  ○ ○\n    |\n    ○'
  }
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
    question: 'Hvaða lögun hefur CO₂ (koltvísýringur)?',
    geometryId: 'linear',
    options: [
      { id: 'a', text: 'Línuleg (Linear)', correct: true, explanation: 'CO₂ hefur 2 rafeinasvið sem staðsetjast 180° í sundur.' },
      { id: 'b', text: 'Beygð (Bent)', correct: false, explanation: 'Beygð lögun krefst einstæðra para á miðatómi.' },
      { id: 'c', text: 'Þríhyrnd slétt', correct: false, explanation: 'Þríhyrnd slétt hefur 3 rafeinasvið, ekki 2.' },
      { id: 'd', text: 'Fjórflötungur', correct: false, explanation: 'Fjórflötungur hefur 4 rafeinasvið.' }
    ],
    hints: {
      topic: 'Þetta snýst um VSEPR lögun miðað við fjölda rafeinasviða.',
      strategy: 'Teldu rafeinasvið á miðatóminu (C). Tvöföldar tengingar telja sem eitt svið.',
      method: 'CO₂ hefur tvöföld tenging við hvort súrefnisatóm = 2 rafeinasvið.',
      solution: '2 rafeinasvið staðsetjast 180° í sundur = línuleg lögun.'
    }
  },
  {
    id: 2,
    type: 'electron_domains',
    question: 'Hversu mörg rafeinasvið (electron domains) hefur vatn (H₂O)?',
    geometryId: 'bent-4',
    options: [
      { id: 'a', text: '2 rafeinasvið', correct: false, explanation: 'Þú telur aðeins bindandi pörin.' },
      { id: 'b', text: '3 rafeinasvið', correct: false, explanation: 'Þú vantar eitt einstætt par.' },
      { id: 'c', text: '4 rafeinasvið', correct: true, explanation: 'Rétt! 2 bindandi pör + 2 einstæð pör = 4 rafeinasvið.' },
      { id: 'd', text: '6 rafeinasvið', correct: false, explanation: 'Það eru aðeins 4 rafeinapör í ystu skel súrefnis.' }
    ],
    hints: {
      topic: 'Mundu að telja bæði bindandi og einstæð pör.',
      strategy: 'Rafeinasvið = bindandi pör + einstæð pör á miðatóminu.',
      method: 'Súrefni hefur 6 gildisrafeindir. 2 fara í O-H tengingar, 4 mynda 2 einstæð pör.',
      solution: '2 bindandi pör + 2 einstæð pör = 4 rafeinasvið.'
    }
  },
  {
    id: 3,
    type: 'molecular_vs_electron',
    question: 'NH₃ (ammóníak) hefur fjórflötungs RAFEINALÖGUN en hvaða SAMEINDARLÖGUN?',
    geometryId: 'trigonal-pyramidal',
    options: [
      { id: 'a', text: 'Fjórflötungur', correct: false, explanation: 'Sameindarlögun tekur ekki tillit til einstæðu paranna.' },
      { id: 'b', text: 'Þríhyrnd pýramída', correct: true, explanation: 'Rétt! Einstætt par á toppnum er ekki sýnilegt í sameindarlögun.' },
      { id: 'c', text: 'Þríhyrnd slétt', correct: false, explanation: 'Þríhyrnd slétt er 2D, NH₃ er 3D pýramída.' },
      { id: 'd', text: 'Línuleg', correct: false, explanation: 'Línuleg hefur aðeins 2 rafeinasvið.' }
    ],
    hints: {
      topic: 'Munurinn á rafeinalögun og sameindarlögun.',
      strategy: 'Sameindarlögun lýsir aðeins stöðu atóma, ekki einstæðra para.',
      method: 'NH₃: 4 rafeinasvið (3 bp + 1 lp). Sameindarlögun sýnir aðeins 3 bindandi pörin.',
      solution: 'Þríhyrnd pýramída - 3 H atóm í botninum, N á toppnum, einstætt par ósýnilegt.'
    }
  },
  {
    id: 4,
    type: 'angle',
    question: 'Hvert er tengihorn í fjórflötungssameindum (eins og CH₄)?',
    geometryId: 'tetrahedral',
    options: [
      { id: 'a', text: '90°', correct: false, explanation: '90° er fyrir áttflötung (octahedral).' },
      { id: 'b', text: '109.5°', correct: true, explanation: 'Rétt! Þetta er hornið sem hámarkar fjarlægð milli 4 rafeinasviða.' },
      { id: 'c', text: '120°', correct: false, explanation: '120° er fyrir þríhyrnd slétta lögun.' },
      { id: 'd', text: '180°', correct: false, explanation: '180° er fyrir línulega lögun.' }
    ],
    hints: {
      topic: 'Tengihorn ákvarðast af fjölda rafeinasviða.',
      strategy: 'Hornið hámarkar fjarlægð milli rafeinasviða í þrívíðri röðun.',
      method: '4 rafeinasvið í þrívídd = fjórflötungur. Hornið er milli 90° og 120°.',
      solution: '109.5° - þetta er nákvæmt fjórflötungshorn.'
    }
  },
  {
    id: 5,
    type: 'lone_pair_effect',
    question: 'Af hverju er tengihorn í H₂O (104.5°) minna en í CH₄ (109.5°)?',
    options: [
      { id: 'a', text: 'Súrefni er minna atóm', correct: false, explanation: 'Stærð atóms hefur lítil áhrif á hornið.' },
      { id: 'b', text: 'Einstæð pör hrinda meira en bindandi pör', correct: true, explanation: 'Rétt! Einstæð pör taka meira pláss og ýta bindandi pörum saman.' },
      { id: 'c', text: 'Vatn er fljótandi', correct: false, explanation: 'Eðlisástand hefur ekki áhrif á lögun.' },
      { id: 'd', text: 'Vetni er léttara en kolefni', correct: false, explanation: 'Massinn hefur ekki áhrif á tengihorn.' }
    ],
    hints: {
      topic: 'Áhrif einstæðra para á tengihorn.',
      strategy: 'Hugsaðu um það sem „tekur meira pláss" í kringum miðatómið.',
      method: 'Einstæð pör eru nær kjarna og dreifa sér meira en bindandi pör.',
      solution: 'Einstæð pör hrinda meira og ýta bindandi pörum saman = minna horn.'
    }
  },
  {
    id: 6,
    type: 'identify',
    question: 'Hvaða lögun hefur BF₃ (bórþríflúoríð)?',
    geometryId: 'trigonal-planar',
    options: [
      { id: 'a', text: 'Þríhyrnd pýramída', correct: false, explanation: 'Pýramída hefur einstætt par á miðatóminu.' },
      { id: 'b', text: 'Þríhyrnd slétt', correct: true, explanation: 'Rétt! 3 bindandi pör, engin einstæð pör — slétt 120° lögun.' },
      { id: 'c', text: 'Beygð', correct: false, explanation: 'Beygð lögun hefur einstæð pör.' },
      { id: 'd', text: 'Fjórflötungur', correct: false, explanation: 'Fjórflötungur hefur 4 rafeinasvið, ekki 3.' }
    ],
    hints: {
      topic: 'VSEPR lögun með 3 rafeinasvið.',
      strategy: 'Athugaðu hvort miðatómið hefur einstæð pör.',
      method: 'Bór hefur aðeins 3 gildisrafeindir og myndar ekki einstæð pör.',
      solution: '3 bindandi pör, 0 einstæð = þríhyrnd slétt lögun (120°).'
    }
  },
  {
    id: 7,
    type: 'molecular_vs_electron',
    question: 'SF₆ hefur 6 rafeinasvið. Hvað heitir þessi lögun?',
    geometryId: 'octahedral',
    options: [
      { id: 'a', text: 'Sexflötungur', correct: false, explanation: 'Sexflötungur er ekki algengur í VSEPR.' },
      { id: 'b', text: 'Áttflötungur (Octahedral)', correct: true, explanation: 'Rétt! 6 rafeinasvið í 90° sundur — áttflötungur.' },
      { id: 'c', text: 'Þríhyrnd tvípýramída', correct: false, explanation: 'Þríhyrnd tvípýramída hefur 5 rafeinasvið.' },
      { id: 'd', text: 'Kúla', correct: false, explanation: 'Kúla er ekki VSEPR lögun.' }
    ],
    hints: {
      topic: 'VSEPR lögun með 6 rafeinasvið.',
      strategy: 'Nafnið kemur frá fjölda flata á fasta efninu sem lýsir þessari röðun.',
      method: '6 rafeinasvið í samhverfri röðun, öll 90° frá hvoru öðru.',
      solution: 'Áttflötungur (octahedral) - fasti efnið hefur 8 fleti.'
    }
  },
  {
    id: 8,
    type: 'electron_domains',
    question: 'PCl₅ hefur 5 rafeinasvið. Hvað heitir þessi rafeinalögun?',
    geometryId: 'trigonal-bipyramidal',
    options: [
      { id: 'a', text: 'Fimmflötungur', correct: false, explanation: 'Þetta er ekki staðlað VSEPR nafn.' },
      { id: 'b', text: 'Áttflötungur', correct: false, explanation: 'Áttflötungur hefur 6 rafeinasvið.' },
      { id: 'c', text: 'Þríhyrnd tvípýramída', correct: true, explanation: 'Rétt! 3 á miðsléttu (120°) + 2 lóðrétt (90°).' },
      { id: 'd', text: 'Fjórflötungur', correct: false, explanation: 'Fjórflötungur hefur 4 rafeinasvið.' }
    ],
    hints: {
      topic: 'VSEPR lögun með 5 rafeinasvið.',
      strategy: 'Hugsaðu um tvær mismunandi stöður - miðslétta og ás.',
      method: '3 stöður á miðsléttu (120°) + 2 stöður lóðrétt á ásnum (90°).',
      solution: 'Þríhyrnd tvípýramída - trigonal bipyramidal.'
    }
  }
];

export function Level1({ onComplete, onBack, onCorrectAnswer, onIncorrectAnswer }: Level1Props) {
  const [phase, setPhase] = useState<'explore' | 'quiz'>('explore');
  const [selectedGeometry, setSelectedGeometry] = useState<Geometry | null>(null);
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hintMultiplier, setHintMultiplier] = useState(1.0);
  const [hintsUsedTier, setHintsUsedTier] = useState(0);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [totalHintsUsed, setTotalHintsUsed] = useState(0);

  const challenge = challenges[currentChallenge];
  const maxScore = challenges.length * 15; // 15 points per question without hints

  // Shuffle options for current challenge - memoize to keep stable during challenge
  const shuffledOptions = useMemo(() => {
    const shuffled = shuffleArray(challenge.options);
    // Assign new sequential IDs (a, b, c, d) after shuffling
    return shuffled.map((opt, idx) => ({
      ...opt,
      id: String.fromCharCode(97 + idx) // 'a', 'b', 'c', 'd'
    }));
  }, [currentChallenge, challenge.options]);

  const basePoints = 15;

  const checkAnswer = () => {
    const selected = shuffledOptions.find(opt => opt.id === selectedOption);
    const correct = selected?.correct ?? false;
    setIsCorrect(correct);
    if (correct) {
      onCorrectAnswer?.();
      const earnedPoints = Math.round(basePoints * hintMultiplier);
      setScore(prev => prev + earnedPoints);
    } else {
      onIncorrectAnswer?.();
    }
    setShowResult(true);
  };

  const nextChallenge = () => {
    // Track hints used for this question
    if (hintsUsedTier > 0) {
      setTotalHintsUsed(prev => prev + hintsUsedTier);
    }

    if (currentChallenge < challenges.length - 1) {
      setCurrentChallenge(prev => prev + 1);
      setSelectedOption(null);
      setShowResult(false);
      setShowHint(false);
      setHintMultiplier(1.0);
      setHintsUsedTier(0);
      setIsCorrect(false);
    } else {
      onComplete(score, maxScore, totalHintsUsed + hintsUsedTier);
    }
  };

  // Exploration phase
  if (phase === 'explore') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-800 flex items-center gap-2"
            >
              <span>&larr;</span> Til baka
            </button>
            <div className="text-sm text-gray-600">Stig 1: Könnun</div>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 mb-6">
            <h2 className="text-2xl font-bold text-teal-800 mb-4">
              Kannaðu mismunandi sameindarlögun
            </h2>
            <p className="text-gray-600 mb-6">
              Smelltu á lögun til að sjá dæmi og útskýringu. Þegar þú ert tilbúinn, haltu áfram í spurningar.
            </p>

            {/* Electron Repulsion Animation */}
            <div className="mb-8">
              <ElectronRepulsionAnimation
                geometryId={selectedGeometry?.id || 'tetrahedral'}
                showForces={true}
              />
            </div>

            {/* Shape Transition Animation */}
            <div className="mb-8">
              <ShapeTransitionAnimation
                compact={true}
                showControls={true}
                initialDomains={selectedGeometry?.electronDomains || 4}
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {GEOMETRIES.map(geo => (
                <button
                  key={geo.id}
                  onClick={() => setSelectedGeometry(geo)}
                  className={`p-4 rounded-xl border-2 transition-all text-center ${
                    selectedGeometry?.id === geo.id
                      ? 'border-teal-500 bg-teal-50 shadow-lg'
                      : 'border-gray-200 hover:border-teal-300 hover:bg-teal-50/50'
                  }`}
                >
                  <div className="text-lg font-bold text-gray-800">{geo.name}</div>
                  <div className="text-xs text-gray-500">{geo.nameEn}</div>
                  <div className="text-sm text-teal-600 mt-1">{geo.example}</div>
                </button>
              ))}
            </div>

            {selectedGeometry && (
              <div className="bg-teal-50 rounded-xl p-6 animate-slide-in">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Visual representation */}
                  <div className="flex-1">
                    {/* 2D/3D Toggle */}
                    <div className="flex justify-center gap-2 mb-3">
                      <button
                        onClick={() => setViewMode('2d')}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          viewMode === '2d'
                            ? 'bg-teal-600 text-white'
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                      >
                        2D
                      </button>
                      <button
                        onClick={() => setViewMode('3d')}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          viewMode === '3d'
                            ? 'bg-teal-600 text-white'
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                      >
                        3D
                      </button>
                    </div>

                    <div className="bg-gray-900 rounded-xl p-6 flex items-center justify-center min-h-48">
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
                        <div className="text-2xl font-bold text-teal-400 mt-4">{selectedGeometry.example}</div>
                        <div className="text-gray-400">{selectedGeometry.exampleName}</div>
                        {viewMode === '3d' && (
                          <div className="text-xs text-gray-500 mt-2">
                            Dragðu til að snúa, skrollaðu til að stækka
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex-1 space-y-4">
                    <h3 className="text-xl font-bold text-teal-800">{selectedGeometry.name}</h3>
                    <p className="text-gray-700">{selectedGeometry.description}</p>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-white p-3 rounded-lg">
                        <div className="text-gray-500">Rafeinasvið</div>
                        <div className="font-bold text-gray-800">{selectedGeometry.electronDomains}</div>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <div className="text-gray-500">Bindandi pör</div>
                        <div className="font-bold text-blue-600">{selectedGeometry.bondingPairs}</div>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <div className="text-gray-500">Einstæð pör</div>
                        <div className="font-bold text-yellow-600">{selectedGeometry.lonePairs}</div>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <div className="text-gray-500">Tengihorn</div>
                        <div className="font-bold text-teal-600">{selectedGeometry.bondAngle}</div>
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-lg">
                      <div className="text-gray-500 text-sm">Rafeinalögun</div>
                      <div className="font-bold text-purple-600">{selectedGeometry.electronGeometry}</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <div className="text-gray-500 text-sm">Sameindarlögun</div>
                      <div className="font-bold text-teal-600">{selectedGeometry.molecularGeometry}</div>
                    </div>
                  </div>
                </div>

                {/* Bond Angle Measurement */}
                <div className="mt-6">
                  <BondAngleMeasurement
                    geometryId={selectedGeometry.id}
                    showComparison={false}
                  />
                </div>
              </div>
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
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setPhase('explore')}
            className="text-gray-600 hover:text-gray-800 flex items-center gap-2"
          >
            <span>&larr;</span> Til baka
          </button>
          <div className="text-right">
            <div className="text-sm text-gray-600">Spurning {currentChallenge + 1} af {challenges.length}</div>
            <div className="text-lg font-bold text-teal-600">{score} stig</div>
          </div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div
            className="bg-teal-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentChallenge + 1) / challenges.length) * 100}%` }}
          />
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
          <p className="text-gray-700 text-lg mb-6">{challenge.question}</p>

          {/* Show relevant geometry visual if available */}
          {challenge.geometryId && (() => {
            const geo = GEOMETRIES.find(g => g.id === challenge.geometryId);
            if (!geo) return null;
            return (
              <div className="bg-slate-900 p-4 rounded-xl mb-6 flex flex-col items-center">
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
                  animation="fade-in"
                  showLonePairs={true}
                  ariaLabel={`${geo.name} lögun`}
                />
                <div className="text-slate-300 text-sm mt-2 font-medium">{geo.example}</div>
              </div>
            );
          })()}

          <div className="space-y-3 mb-6">
            {shuffledOptions.map(option => (
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
                      : 'border-gray-200 bg-gray-50 opacity-50'
                    : selectedOption === option.id
                    ? 'border-teal-500 bg-teal-50 ring-2 ring-teal-200'
                    : 'border-gray-300 hover:border-teal-400 hover:bg-teal-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="font-bold text-gray-500 uppercase">{option.id}.</span>
                  <span className="flex-1">{option.text}</span>
                </div>
                {showResult && selectedOption === option.id && (
                  <div className={`mt-2 text-sm ${option.correct ? 'text-green-700' : 'text-red-700'}`}>
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
                setTotalHintsUsed(prev => prev + 1);
              }}
              className="text-teal-600 hover:text-teal-800 text-sm underline mb-4"
            >
              Syna visbendingu (-7 stig)
            </button>
          )}

          {showHint && !showResult && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl mb-4">
              <span className="font-bold text-yellow-800">Vísbending: </span>
              <span className="text-yellow-900">{challenge.hints.topic}</span>
            </div>
          )}

          {!showResult && (
            <button
              onClick={checkAnswer}
              disabled={!selectedOption}
              className="w-full bg-teal-500 hover:bg-teal-600 disabled:bg-gray-300 text-white font-bold py-4 px-6 rounded-xl transition-colors"
            >
              Athuga svar
            </button>
          )}

          {showResult && (() => {
            const correctOption = shuffledOptions.find(opt => opt.correct);
            return (
              <>
                <div className="mb-4">
                  <FeedbackPanel
                    feedback={{
                      isCorrect,
                      explanation: isCorrect
                        ? `Rétt! ${correctOption?.explanation || ''}`
                        : `${correctOption?.explanation || ''}`,
                      misconception: isCorrect ? undefined : VSEPR_MISCONCEPTIONS.geometry,
                      relatedConcepts: VSEPR_RELATED,
                      nextSteps: isCorrect
                        ? 'Frábært! Þú skilur VSEPR vel. Haltu áfram.'
                        : 'Mundu: Teldu rafeinasvið fyrst, síðan athugaðu einstæð pör.',
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
                  onClick={nextChallenge}
                  className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-4 px-6 rounded-xl transition-colors"
                >
                  {currentChallenge < challenges.length - 1 ? 'Næsta spurning' : 'Ljúka stigi 1'}
                </button>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
