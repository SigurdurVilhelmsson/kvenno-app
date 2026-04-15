import { useState } from 'react';

import { AnimatedMolecule, FeedbackPanel } from '@shared/components';
import { MoleculeViewer3DLazy } from '@shared/components/MoleculeViewer3D';

import { ForceStrengthAnimation } from './ForceStrengthAnimation';
import { imfToMolecule } from '../utils/imfConverter';

// Misconceptions for IMF types
const MISCONCEPTIONS = {
  polar:
    'Skautaðar sameindir hafa bæði London krafta OG tvípól-tvípól. Mundu: London er ALLTAF til staðar!',
  nonpolar:
    'Óskautaðar sameindir hafa AÐEINS London krafta. Samhverfa sameindin (eins og CO₂, CCl₄) getur haft skautuð tengsl en vera samt óskautuð í heild.',
  hbond:
    'Vetnistengi krefst H bundið við F, O, eða N. Ef H er bundið við C eða Cl, þá eru engin vetnistengi.',
  london_strength:
    'London kraftar verða sterkari eftir því sem mólmassi eykst (stærri rafeindaský = meiri dreifistuðull).',
};

// Related concepts for IMF
const RELATED_CONCEPTS: Record<string, string[]> = {
  london: ['Dreifikraftar', 'Mólmassi', 'Tímabundnir tvípólar'],
  dipole: ['Skautaðar sameindir', 'Rafneikvæðni', 'δ+ og δ-'],
  hydrogen: ['H-F, H-O, H-N', 'Suðumark', 'Vatnseiginleikar'],
};

interface Level1Props {
  onComplete: (score: number, maxScore: number, hintsUsed: number) => void;
  onBack: () => void;
  onCorrectAnswer?: () => void;
  onIncorrectAnswer?: () => void;
}

interface IMFType {
  id: 'london' | 'dipole' | 'hydrogen';
  name: string;
  nameEn: string;
  description: string;
  strength: string;
  examples: string[];
}

const IMF_TYPES: IMFType[] = [
  {
    id: 'london',
    name: 'London dreifikraftar',
    nameEn: 'London Dispersion Forces',
    description:
      'Veikir, tímabundnir aðdráttarkraftar vegna tímabundinna tvípóla. Til staðar í ÖLLUM sameindum.',
    strength: 'Veikastur',
    examples: ['CH₄', 'Ar', 'CO₂', 'CCl₄', 'I₂'],
  },
  {
    id: 'dipole',
    name: 'Tvípól-tvípól kraftar',
    nameEn: 'Dipole-Dipole Forces',
    description:
      'Aðdráttarkraftar milli skauttaðra sameinda þar sem δ+ hluti einnar sameindar laðar að δ- hluta annarar.',
    strength: 'Meðal',
    examples: ['HCl', 'SO₂', 'CHCl₃', 'H₂S'],
  },
  {
    id: 'hydrogen',
    name: 'Vetnistengi',
    nameEn: 'Hydrogen Bonding',
    description:
      'Sérstakt sterk tvípól-tvípól kraftur þegar H er bundið við F, O, eða N. Sterkasta IMF.',
    strength: 'Sterkastur',
    examples: ['H₂O', 'NH₃', 'HF', 'CH₃OH', 'DNA'],
  },
];

interface AtomVisualization {
  symbol: string;
  partialCharge?: 'positive' | 'negative' | 'none';
  position:
    | 'center'
    | 'left'
    | 'right'
    | 'top'
    | 'bottom'
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right';
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

interface BondVisualization {
  from: string; // position
  to: string; // position
  type: 'single' | 'double' | 'triple';
  polar?: boolean;
}

interface MoleculeVisualization {
  atoms: AtomVisualization[];
  bonds: BondVisualization[];
  shape?: 'linear' | 'bent' | 'trigonal' | 'tetrahedral' | 'diatomic';
  dipoleMoment?: 'left' | 'right' | 'up' | 'down' | 'none';
}

interface Molecule {
  id: number;
  formula: string;
  name: string;
  structure?: string;
  isPolar: boolean;
  hasHBond: boolean;
  molarMass: number;
  correctIMFs: ('london' | 'dipole' | 'hydrogen')[];
  explanation: string;
  visualization?: MoleculeVisualization;
}

const molecules: Molecule[] = [
  {
    id: 1,
    formula: 'H₂O',
    name: 'Vatn',
    isPolar: true,
    hasHBond: true,
    molarMass: 18,
    correctIMFs: ['london', 'dipole', 'hydrogen'],
    explanation:
      'Vatn hefur alla þrjá krafta: London (alltaf), tvípól-tvípól (skautuð), og vetnistengi (O-H tengsl).',
    visualization: {
      atoms: [
        { symbol: 'O', partialCharge: 'negative', position: 'center', size: 'large', color: 'red' },
        {
          symbol: 'H',
          partialCharge: 'positive',
          position: 'top-left',
          size: 'small',
          color: 'gray',
        },
        {
          symbol: 'H',
          partialCharge: 'positive',
          position: 'top-right',
          size: 'small',
          color: 'gray',
        },
      ],
      bonds: [
        { from: 'center', to: 'top-left', type: 'single', polar: true },
        { from: 'center', to: 'top-right', type: 'single', polar: true },
      ],
      shape: 'bent',
      dipoleMoment: 'up',
    },
  },
  {
    id: 2,
    formula: 'CH₄',
    name: 'Metan',
    isPolar: false,
    hasHBond: false,
    molarMass: 16,
    correctIMFs: ['london'],
    explanation: 'Metan er óskautuð sameind svo hún hefur aðeins London krafta.',
    visualization: {
      atoms: [
        { symbol: 'C', partialCharge: 'none', position: 'center', size: 'medium', color: 'gray' },
        { symbol: 'H', partialCharge: 'none', position: 'top', size: 'small', color: 'white' },
        { symbol: 'H', partialCharge: 'none', position: 'bottom', size: 'small', color: 'white' },
        { symbol: 'H', partialCharge: 'none', position: 'left', size: 'small', color: 'white' },
        { symbol: 'H', partialCharge: 'none', position: 'right', size: 'small', color: 'white' },
      ],
      bonds: [
        { from: 'center', to: 'top', type: 'single' },
        { from: 'center', to: 'bottom', type: 'single' },
        { from: 'center', to: 'left', type: 'single' },
        { from: 'center', to: 'right', type: 'single' },
      ],
      shape: 'tetrahedral',
      dipoleMoment: 'none',
    },
  },
  {
    id: 3,
    formula: 'HCl',
    name: 'Saltsýra',
    isPolar: true,
    hasHBond: false,
    molarMass: 36.5,
    correctIMFs: ['london', 'dipole'],
    explanation:
      'HCl er skautuð (Cl er rafneikvæðara) en H er ekki bundið við F, O, eða N — engin vetnistengi.',
    visualization: {
      atoms: [
        { symbol: 'H', partialCharge: 'positive', position: 'left', size: 'small', color: 'white' },
        {
          symbol: 'Cl',
          partialCharge: 'negative',
          position: 'right',
          size: 'large',
          color: 'green',
        },
      ],
      bonds: [{ from: 'left', to: 'right', type: 'single', polar: true }],
      shape: 'diatomic',
      dipoleMoment: 'right',
    },
  },
  {
    id: 4,
    formula: 'NH₃',
    name: 'Ammóníak',
    isPolar: true,
    hasHBond: true,
    molarMass: 17,
    correctIMFs: ['london', 'dipole', 'hydrogen'],
    explanation:
      'Ammóníak hefur N-H tengsl sem geta myndað vetnistengi, auk þess að vera skautuð sameind.',
    visualization: {
      atoms: [
        {
          symbol: 'N',
          partialCharge: 'negative',
          position: 'center',
          size: 'medium',
          color: 'blue',
        },
        {
          symbol: 'H',
          partialCharge: 'positive',
          position: 'bottom-left',
          size: 'small',
          color: 'white',
        },
        {
          symbol: 'H',
          partialCharge: 'positive',
          position: 'bottom',
          size: 'small',
          color: 'white',
        },
        {
          symbol: 'H',
          partialCharge: 'positive',
          position: 'bottom-right',
          size: 'small',
          color: 'white',
        },
      ],
      bonds: [
        { from: 'center', to: 'bottom-left', type: 'single', polar: true },
        { from: 'center', to: 'bottom', type: 'single', polar: true },
        { from: 'center', to: 'bottom-right', type: 'single', polar: true },
      ],
      shape: 'trigonal',
      dipoleMoment: 'up',
    },
  },
  {
    id: 5,
    formula: 'CO₂',
    name: 'Koltvísýringur',
    isPolar: false,
    hasHBond: false,
    molarMass: 44,
    correctIMFs: ['london'],
    explanation:
      'Þó C=O tengslin séu skautuð, er sameindin línuleg og óskautuð — aðeins London kraftar.',
    visualization: {
      atoms: [
        { symbol: 'O', partialCharge: 'negative', position: 'left', size: 'medium', color: 'red' },
        {
          symbol: 'C',
          partialCharge: 'positive',
          position: 'center',
          size: 'medium',
          color: 'gray',
        },
        { symbol: 'O', partialCharge: 'negative', position: 'right', size: 'medium', color: 'red' },
      ],
      bonds: [
        { from: 'left', to: 'center', type: 'double', polar: true },
        { from: 'center', to: 'right', type: 'double', polar: true },
      ],
      shape: 'linear',
      dipoleMoment: 'none', // Cancels out
    },
  },
  {
    id: 6,
    formula: 'CH₃OH',
    name: 'Metanól',
    isPolar: true,
    hasHBond: true,
    molarMass: 32,
    correctIMFs: ['london', 'dipole', 'hydrogen'],
    explanation: 'Metanól hefur O-H hóp sem gerir kleift að mynda vetnistengi.',
    visualization: {
      atoms: [
        { symbol: 'C', partialCharge: 'none', position: 'left', size: 'medium', color: 'gray' },
        {
          symbol: 'O',
          partialCharge: 'negative',
          position: 'center',
          size: 'medium',
          color: 'red',
        },
        {
          symbol: 'H',
          partialCharge: 'positive',
          position: 'right',
          size: 'small',
          color: 'white',
        },
      ],
      bonds: [
        { from: 'left', to: 'center', type: 'single' },
        { from: 'center', to: 'right', type: 'single', polar: true },
      ],
      shape: 'bent',
      dipoleMoment: 'right',
    },
  },
  {
    id: 7,
    formula: 'CCl₄',
    name: 'Kolefnistetraklóríð',
    isPolar: false,
    hasHBond: false,
    molarMass: 154,
    correctIMFs: ['london'],
    explanation: 'CCl₄ er samhverf fjórflötungur — óskautuð þrátt fyrir skautuð C-Cl tengisl.',
    visualization: {
      atoms: [
        {
          symbol: 'C',
          partialCharge: 'positive',
          position: 'center',
          size: 'medium',
          color: 'gray',
        },
        {
          symbol: 'Cl',
          partialCharge: 'negative',
          position: 'top',
          size: 'medium',
          color: 'green',
        },
        {
          symbol: 'Cl',
          partialCharge: 'negative',
          position: 'bottom',
          size: 'medium',
          color: 'green',
        },
        {
          symbol: 'Cl',
          partialCharge: 'negative',
          position: 'left',
          size: 'medium',
          color: 'green',
        },
        {
          symbol: 'Cl',
          partialCharge: 'negative',
          position: 'right',
          size: 'medium',
          color: 'green',
        },
      ],
      bonds: [
        { from: 'center', to: 'top', type: 'single', polar: true },
        { from: 'center', to: 'bottom', type: 'single', polar: true },
        { from: 'center', to: 'left', type: 'single', polar: true },
        { from: 'center', to: 'right', type: 'single', polar: true },
      ],
      shape: 'tetrahedral',
      dipoleMoment: 'none', // Cancels out
    },
  },
  {
    id: 8,
    formula: 'CHCl₃',
    name: 'Klóróform',
    isPolar: true,
    hasHBond: false,
    molarMass: 119,
    correctIMFs: ['london', 'dipole'],
    explanation: 'Klóróform er ósamhverf og skautuð, en H er bundið við C — engin vetnistengi.',
    visualization: {
      atoms: [
        { symbol: 'C', partialCharge: 'none', position: 'center', size: 'medium', color: 'gray' },
        { symbol: 'H', partialCharge: 'positive', position: 'top', size: 'small', color: 'white' },
        {
          symbol: 'Cl',
          partialCharge: 'negative',
          position: 'bottom-left',
          size: 'medium',
          color: 'green',
        },
        {
          symbol: 'Cl',
          partialCharge: 'negative',
          position: 'bottom',
          size: 'medium',
          color: 'green',
        },
        {
          symbol: 'Cl',
          partialCharge: 'negative',
          position: 'bottom-right',
          size: 'medium',
          color: 'green',
        },
      ],
      bonds: [
        { from: 'center', to: 'top', type: 'single' },
        { from: 'center', to: 'bottom-left', type: 'single', polar: true },
        { from: 'center', to: 'bottom', type: 'single', polar: true },
        { from: 'center', to: 'bottom-right', type: 'single', polar: true },
      ],
      shape: 'tetrahedral',
      dipoleMoment: 'up',
    },
  },
  {
    id: 9,
    formula: 'HF',
    name: 'Flúorsýra',
    isPolar: true,
    hasHBond: true,
    molarMass: 20,
    correctIMFs: ['london', 'dipole', 'hydrogen'],
    explanation: 'HF hefur H-F tengi sem myndar mjög sterk vetnistengi.',
    visualization: {
      atoms: [
        { symbol: 'H', partialCharge: 'positive', position: 'left', size: 'small', color: 'white' },
        {
          symbol: 'F',
          partialCharge: 'negative',
          position: 'right',
          size: 'medium',
          color: 'yellow',
        },
      ],
      bonds: [{ from: 'left', to: 'right', type: 'single', polar: true }],
      shape: 'diatomic',
      dipoleMoment: 'right',
    },
  },
  {
    id: 10,
    formula: 'I₂',
    name: 'Joð',
    isPolar: false,
    hasHBond: false,
    molarMass: 254,
    correctIMFs: ['london'],
    explanation:
      'I₂ er óskautuð tvíatóma sameind — aðeins London kraftar. En þeir eru sterkir vegna stórrar mólmassa.',
    visualization: {
      atoms: [
        { symbol: 'I', partialCharge: 'none', position: 'left', size: 'large', color: 'purple' },
        { symbol: 'I', partialCharge: 'none', position: 'right', size: 'large', color: 'purple' },
      ],
      bonds: [{ from: 'left', to: 'right', type: 'single' }],
      shape: 'diatomic',
      dipoleMoment: 'none',
    },
  },
];

// Max possible score: 10 molecules * 15 points = 150 points
const MAX_SCORE = 150;

export function Level1({ onComplete, onBack, onCorrectAnswer, onIncorrectAnswer }: Level1Props) {
  const [phase, setPhase] = useState<'learn' | 'quiz'>('learn');
  const [currentMolecule, setCurrentMolecule] = useState(0);
  const [selectedIMFs, setSelectedIMFs] = useState<Set<string>>(new Set());
  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [totalHintsUsed, setTotalHintsUsed] = useState(0);
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');

  const molecule = molecules[currentMolecule];

  const toggleIMF = (imfId: string) => {
    if (showResult) return;
    const newSet = new Set(selectedIMFs);
    if (newSet.has(imfId)) {
      newSet.delete(imfId);
    } else {
      newSet.add(imfId);
    }
    setSelectedIMFs(newSet);
  };

  const checkAnswer = () => {
    const correctSet = new Set(molecule.correctIMFs);
    const isCorrect =
      selectedIMFs.size === correctSet.size &&
      [...selectedIMFs].every((imf) => correctSet.has(imf as 'london' | 'dipole' | 'hydrogen'));

    if (isCorrect) {
      if (!showHint) {
        setScore((prev) => prev + 15);
      } else {
        setScore((prev) => prev + 8);
      }
      onCorrectAnswer?.();
    } else {
      onIncorrectAnswer?.();
    }
    setShowResult(true);
  };

  const nextMolecule = () => {
    if (currentMolecule < molecules.length - 1) {
      setCurrentMolecule((prev) => prev + 1);
      setSelectedIMFs(new Set());
      setShowResult(false);
      setShowHint(false);
    } else {
      onComplete(score, MAX_SCORE, totalHintsUsed);
    }
  };

  const handleShowHint = () => {
    setShowHint(true);
    setTotalHintsUsed((prev) => prev + 1);
  };

  // IMF strength scale visualization
  const renderIMFStrengthScale = () => {
    return (
      <div className="mt-4 p-3 bg-warm-100 rounded-lg">
        <div className="text-xs text-warm-600 mb-2 text-center font-medium">Styrkur IMF</div>
        <div className="flex items-center gap-1">
          <div className="flex-1 h-3 bg-purple-400 rounded-l-full" />
          <div className="flex-1 h-3 bg-blue-400" />
          <div className="flex-1 h-3 bg-red-400 rounded-r-full" />
        </div>
        <div className="flex justify-between text-xs mt-1">
          <span className="text-purple-700">London</span>
          <span className="text-blue-700">Tvípól</span>
          <span className="text-red-700">H-tengi</span>
        </div>
        <div className="flex justify-between text-xs text-warm-500">
          <span>Veikastur</span>
          <span></span>
          <span>Sterkastur</span>
        </div>
      </div>
    );
  };

  // Learning phase
  if (phase === 'learn') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button onClick={onBack} className="text-warm-600 hover:text-warm-800">
              ← Til baka
            </button>
            <div className="text-sm text-warm-600">Stig 1: Kynning</div>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 mb-6">
            <h2 className="text-2xl font-bold text-indigo-800 mb-6">
              Tegundir millisameindakrafta (IMF)
            </h2>

            <div className="space-y-6">
              {IMF_TYPES.map((imf) => (
                <div
                  key={imf.id}
                  className={`p-6 rounded-xl border-2 ${
                    imf.id === 'london'
                      ? 'bg-purple-50 border-purple-200'
                      : imf.id === 'dipole'
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl ${
                        imf.id === 'london'
                          ? 'bg-purple-200'
                          : imf.id === 'dipole'
                            ? 'bg-blue-200'
                            : 'bg-red-200'
                      }`}
                    >
                      {imf.id === 'london' ? '🌫️' : imf.id === 'dipole' ? '⚡' : '🔗'}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-warm-800">{imf.name}</h3>
                      <div className="text-sm text-warm-500 mb-2">{imf.nameEn}</div>
                      <p className="text-warm-700 mb-3">{imf.description}</p>
                      <div className="flex items-center gap-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            imf.id === 'london'
                              ? 'bg-purple-200 text-purple-800'
                              : imf.id === 'dipole'
                                ? 'bg-blue-200 text-blue-800'
                                : 'bg-red-200 text-red-800'
                          }`}
                        >
                          {imf.strength}
                        </span>
                        <span className="text-sm text-warm-500">
                          Dæmi: {imf.examples.join(', ')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 bg-yellow-50 p-4 rounded-xl border border-yellow-200">
              <h4 className="font-bold text-yellow-800 mb-2">🔑 Lykilatriði</h4>
              <ul className="space-y-1 text-yellow-900 text-sm">
                <li>
                  • <strong>Öll efni</strong> hafa London krafta — þeir eru alltaf til staðar
                </li>
                <li>
                  • <strong>Skautaðar sameindir</strong> hafa einnig tvípól-tvípól
                </li>
                <li>
                  • <strong>H-F, H-O, eða H-N</strong> tengsl gefa vetnistengi
                </li>
                <li>• Stærra atóm / mólmassi = sterkari London kraftar</li>
              </ul>
            </div>

            {/* Force Strength Animation */}
            <div className="mt-8">
              <ForceStrengthAnimation interactive={true} animate={true} compact={false} />
            </div>
          </div>

          <button
            onClick={() => setPhase('quiz')}
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-4 px-6 rounded-xl"
          >
            Hefja æfingar →
          </button>
        </div>
      </div>
    );
  }

  // Quiz phase
  const isCorrect =
    showResult &&
    selectedIMFs.size === molecule.correctIMFs.length &&
    [...selectedIMFs].every((imf) =>
      molecule.correctIMFs.includes(imf as 'london' | 'dipole' | 'hydrogen')
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setPhase('learn')} className="text-warm-600 hover:text-warm-800">
            ← Skoða kennslu
          </button>
          <div className="text-right">
            <div className="text-sm text-warm-600">
              Sameind {currentMolecule + 1} af {molecules.length}
            </div>
            <div className="text-lg font-bold text-indigo-600">{score} stig</div>
          </div>
        </div>

        <div className="w-full bg-warm-200 rounded-full h-2 mb-6">
          <div
            className="bg-indigo-500 h-2 rounded-full transition-all"
            style={{ width: `${((currentMolecule + 1) / molecules.length) * 100}%` }}
          />
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
          {/* Molecule display with visualization */}
          <div className="bg-warm-900 rounded-xl p-6 mb-6">
            <div className="text-center mb-4">
              <div className="text-4xl font-bold text-white mb-1">{molecule.formula}</div>
              <div className="text-warm-400">{molecule.name}</div>
            </div>

            {/* 2D/3D Toggle */}
            <div
              className="flex justify-center gap-2 mb-4"
              role="radiogroup"
              aria-label="Birtingarmáti"
            >
              <button
                onClick={() => setViewMode('2d')}
                role="radio"
                aria-checked={viewMode === '2d'}
                aria-label="Tvívíð birting"
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === '2d'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-warm-700 text-warm-300 hover:bg-warm-600'
                }`}
              >
                2D
              </button>
              <button
                onClick={() => setViewMode('3d')}
                role="radio"
                aria-checked={viewMode === '3d'}
                aria-label="Þrívíð birting"
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === '3d'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-warm-700 text-warm-300 hover:bg-warm-600'
                }`}
              >
                3D
              </button>
            </div>

            {/* Molecular structure visualization */}
            {molecule.visualization && (
              <div className="bg-warm-800 rounded-lg p-4 mb-4">
                <div className="flex justify-center py-2">
                  {viewMode === '2d' ? (
                    <AnimatedMolecule
                      molecule={imfToMolecule({
                        formula: molecule.formula,
                        name: molecule.name,
                        isPolar: molecule.isPolar,
                        hasHBond: molecule.hasHBond,
                        visualization: molecule.visualization,
                      })}
                      mode="simple"
                      size="md"
                      animation="fade-in"
                      showPartialCharges={molecule.isPolar}
                      showDipoleMoment={
                        molecule.isPolar && molecule.visualization.dipoleMoment !== 'none'
                      }
                      ariaLabel={`${molecule.name} sameindaformúla`}
                    />
                  ) : (
                    <MoleculeViewer3DLazy
                      molecule={imfToMolecule({
                        formula: molecule.formula,
                        name: molecule.name,
                        isPolar: molecule.isPolar,
                        hasHBond: molecule.hasHBond,
                        visualization: molecule.visualization,
                      })}
                      style="ball-stick"
                      showLabels={true}
                      autoRotate={true}
                      autoRotateSpeed={1.5}
                      height={180}
                      width="100%"
                      backgroundColor="transparent"
                    />
                  )}
                </div>
                {/* Legend for partial charges */}
                {molecule.isPolar && viewMode === '2d' && (
                  <div className="flex justify-center gap-4 mt-3 text-xs">
                    <span className="text-red-400">δ+ = Jákvætt skautað</span>
                    <span className="text-blue-400">δ− = Neikvætt skautað</span>
                  </div>
                )}
                {viewMode === '3d' && (
                  <div className="text-xs text-warm-400 text-center mt-2">
                    Dragðu til að snúa, skrollaðu til að stækka
                  </div>
                )}
              </div>
            )}

            {/* Molecule properties badges */}
            <div className="flex justify-center gap-3 flex-wrap">
              <span
                className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                  molecule.isPolar ? 'bg-blue-500 text-white' : 'bg-warm-600 text-warm-300'
                }`}
              >
                {molecule.isPolar ? '⚡ Skautuð' : '○ Óskautuð'}
              </span>
              <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-purple-500 text-white">
                M = {molecule.molarMass} g/mol
              </span>
              {molecule.hasHBond && (
                <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-red-500 text-white">
                  🔗 H-F/O/N tengi
                </span>
              )}
            </div>
          </div>

          <p className="text-warm-700 text-lg mb-6">
            Hvaða millisameindakraftar eru til staðar í {molecule.formula}? (Veldu allt sem á við)
          </p>

          {/* IMF Selection */}
          <div className="space-y-3 mb-6">
            {IMF_TYPES.map((imf) => {
              const isSelected = selectedIMFs.has(imf.id);
              const isCorrectChoice = molecule.correctIMFs.includes(imf.id);

              return (
                <button
                  key={imf.id}
                  onClick={() => toggleIMF(imf.id)}
                  disabled={showResult}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    showResult
                      ? isCorrectChoice
                        ? 'border-green-500 bg-green-50'
                        : isSelected
                          ? 'border-red-500 bg-red-50'
                          : 'border-warm-200 opacity-50'
                      : isSelected
                        ? `border-2 ring-2 ${
                            imf.id === 'london'
                              ? 'border-purple-500 ring-purple-200 bg-purple-50'
                              : imf.id === 'dipole'
                                ? 'border-blue-500 ring-blue-200 bg-blue-50'
                                : 'border-red-500 ring-red-200 bg-red-50'
                          }`
                        : 'border-warm-300 hover:border-warm-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                        isSelected
                          ? 'bg-indigo-500 border-indigo-500 text-white'
                          : 'border-warm-400'
                      }`}
                    >
                      {isSelected && '✓'}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold">{imf.name}</div>
                      <div className="text-xs text-warm-500">{imf.nameEn}</div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        imf.id === 'london'
                          ? 'bg-purple-100 text-purple-700'
                          : imf.id === 'dipole'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {imf.strength}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Hint */}
          {!showResult && !showHint && (
            <button
              onClick={handleShowHint}
              className="text-indigo-600 hover:text-indigo-800 text-sm underline mb-4"
            >
              Sýna vísbendingu
            </button>
          )}

          {showHint && !showResult && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl mb-4">
              <span className="font-bold text-yellow-800">Vísbending: </span>
              <span className="text-yellow-900">
                {molecule.isPolar
                  ? 'Þessi sameind er skautuð — hvaða IMF eru til staðar í skautaðrar sameindum?'
                  : 'Þessi sameind er óskautuð — hvaða IMF er alltaf til staðar?'}
                {molecule.hasHBond && ' Athugaðu einnig hvort H-F, H-O, eða H-N séu til staðar.'}
              </span>
            </div>
          )}

          {!showResult ? (
            <button
              onClick={checkAnswer}
              disabled={selectedIMFs.size === 0}
              className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-warm-300 text-white font-bold py-4 px-6 rounded-xl"
            >
              Athuga svar
            </button>
          ) : (
            <>
              <div className="mb-4">
                <FeedbackPanel
                  feedback={{
                    isCorrect,
                    explanation: molecule.explanation,
                    misconception: isCorrect
                      ? undefined
                      : molecule.hasHBond && !selectedIMFs.has('hydrogen')
                        ? MISCONCEPTIONS.hbond
                        : molecule.isPolar && !selectedIMFs.has('dipole')
                          ? MISCONCEPTIONS.polar
                          : !molecule.isPolar && selectedIMFs.has('dipole')
                            ? MISCONCEPTIONS.nonpolar
                            : MISCONCEPTIONS.london_strength,
                    relatedConcepts: [
                      ...RELATED_CONCEPTS.london,
                      ...(molecule.isPolar ? RELATED_CONCEPTS.dipole : []),
                      ...(molecule.hasHBond ? RELATED_CONCEPTS.hydrogen : []),
                    ],
                    nextSteps: isCorrect
                      ? 'Frábært! Þú skilur IMF vel. Haltu áfram.'
                      : 'Mundu: London er ALLTAF til staðar. Skautuð = tvípól. H-F/O/N = vetnistengi.',
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
                onClick={nextMolecule}
                className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-4 px-6 rounded-xl"
              >
                {currentMolecule < molecules.length - 1 ? 'Næsta sameind' : 'Ljúka stigi 1'}
              </button>
            </>
          )}
        </div>

        {/* Quick reference with IMF strength scale */}
        <div className="mt-6 bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-bold text-warm-700 mb-2">Flýtileiðbeiningar</h3>
          <div className="grid grid-cols-3 gap-2 text-xs mb-3">
            <div className="bg-purple-50 p-2 rounded text-center">
              <div className="font-bold text-purple-700">London</div>
              <div className="text-purple-600">ALLTAF til staðar</div>
            </div>
            <div className="bg-blue-50 p-2 rounded text-center">
              <div className="font-bold text-blue-700">Tvípól-tvípól</div>
              <div className="text-blue-600">Skautaðar sameindir</div>
            </div>
            <div className="bg-red-50 p-2 rounded text-center">
              <div className="font-bold text-red-700">Vetnistengi</div>
              <div className="text-red-600">H-F, H-O, H-N</div>
            </div>
          </div>
          {/* IMF Strength Scale */}
          {renderIMFStrengthScale()}
        </div>
      </div>
    </div>
  );
}
