import { useState, useMemo, useEffect } from 'react';

import { AnimatedMolecule, DragDropBuilder, FeedbackPanel } from '@shared/components';
import type { DraggableItemData, DropZoneData, DropResult, ZoneState } from '@shared/components';

import { StructureFromNameChallenge } from './StructureFromNameChallenge';
import { organicToMolecule, hasBranches, type OrganicBranch } from '../utils/organicConverter';

// Misconceptions for organic nomenclature
const NOMENCLATURE_MISCONCEPTIONS: Record<string, string> = {
  prefix: 'Forskeytið ákvarðast af fjölda kolefna: meth=1, eth=2, prop=3, but=4, pent=5, hex=6.',
  suffix: 'Viðskeytið ákvarðast af tengjategund: -an (eintengi), -en (tvítengi), -yn (þrítengi).',
  position: 'Staðsetningartala þarf fyrir 4+ kolefni til að sýna hvar tvítengi/þrítengi er.',
};

const NOMENCLATURE_RELATED = ['IUPAC nafnakerfi', 'Kolefniskeðjur', 'Vetniskolefni', 'Hóptengi'];

interface Level2Props {
  onComplete: (score: number) => void;
  onBack: () => void;
}

interface Molecule {
  id: number;
  type: 'alkane' | 'alkene' | 'alkyne';
  carbons: number;
  structure: string;
  formula: string;
  correctName: string;
  doublePosition?: number;
  triplePosition?: number;
  branches?: OrganicBranch[];
  hint: string;
}

const molecules: Molecule[] = [
  // Alkanes
  {
    id: 1,
    type: 'alkane',
    carbons: 2,
    structure: 'C-C',
    formula: 'C₂H₆',
    correctName: 'etan',
    hint: '2 kolefni + eintengi = eth + an',
  },
  {
    id: 2,
    type: 'alkane',
    carbons: 4,
    structure: 'C-C-C-C',
    formula: 'C₄H₁₀',
    correctName: 'bútan',
    hint: '4 kolefni + eintengi = but + an',
  },
  {
    id: 3,
    type: 'alkane',
    carbons: 6,
    structure: 'C-C-C-C-C-C',
    formula: 'C₆H₁₄',
    correctName: 'hexan',
    hint: '6 kolefni + eintengi = hex + an',
  },

  // Alkenes
  {
    id: 4,
    type: 'alkene',
    carbons: 2,
    structure: 'C=C',
    formula: 'C₂H₄',
    correctName: 'eten',
    doublePosition: 1,
    hint: '2 kolefni + tvítengi = eth + en',
  },
  {
    id: 5,
    type: 'alkene',
    carbons: 3,
    structure: 'C=C-C',
    formula: 'C₃H₆',
    correctName: 'propen',
    doublePosition: 1,
    hint: '3 kolefni + tvítengi = prop + en',
  },
  {
    id: 6,
    type: 'alkene',
    carbons: 4,
    structure: 'C=C-C-C',
    formula: 'C₄H₈',
    correctName: '1-búten',
    doublePosition: 1,
    hint: '4+ kolefni þarf staðsetningartölu',
  },
  {
    id: 7,
    type: 'alkene',
    carbons: 4,
    structure: 'C-C=C-C',
    formula: 'C₄H₈',
    correctName: '2-búten',
    doublePosition: 2,
    hint: 'Tvítengi byrjar á kolefni 2',
  },

  // Alkynes
  {
    id: 8,
    type: 'alkyne',
    carbons: 2,
    structure: 'C≡C',
    formula: 'C₂H₂',
    correctName: 'etyn',
    triplePosition: 1,
    hint: '2 kolefni + þrítengi = eth + yn',
  },
  {
    id: 9,
    type: 'alkyne',
    carbons: 3,
    structure: 'C≡C-C',
    formula: 'C₃H₄',
    correctName: 'propyn',
    triplePosition: 1,
    hint: '3 kolefni + þrítengi = prop + yn',
  },
  {
    id: 10,
    type: 'alkyne',
    carbons: 4,
    structure: 'C≡C-C-C',
    formula: 'C₄H₆',
    correctName: '1-bútyn',
    triplePosition: 1,
    hint: '4+ kolefni þarf staðsetningartölu',
  },
  {
    id: 11,
    type: 'alkyne',
    carbons: 5,
    structure: 'C-C≡C-C-C',
    formula: 'C₅H₈',
    correctName: '2-pentyn',
    triplePosition: 2,
    hint: 'Þrítengi byrjar á kolefni 2',
  },
  {
    id: 12,
    type: 'alkene',
    carbons: 5,
    structure: 'C=C-C-C-C',
    formula: 'C₅H₁₀',
    correctName: '1-penten',
    doublePosition: 1,
    hint: '5 kolefni, tvítengi á stað 1',
  },

  // Branched alkanes — exercise the parent-chain rule (find the longest C chain).
  {
    id: 13,
    type: 'alkane',
    carbons: 3,
    structure: 'C-C(-C)-C',
    formula: 'C₄H₁₀',
    correctName: '2-metýlprópan',
    branches: [{ atPosition: 2, length: 1 }],
    hint: 'Lengsta kolefniskeðjan er 3 (própan). Metýl-grein á kolefni 2. Sama summuformúla og bútan!',
  },
  {
    id: 14,
    type: 'alkane',
    carbons: 4,
    structure: 'C-C(-C)-C-C',
    formula: 'C₅H₁₂',
    correctName: '2-metýlbútan',
    branches: [{ atPosition: 2, length: 1 }],
    hint: 'Finndu lengstu keðju (4 kolefni = bútan) og númeraðu svo lágt númer fáist fyrir greinina.',
  },
  {
    id: 15,
    type: 'alkane',
    carbons: 5,
    structure: 'C-C-C(-C)-C-C',
    formula: 'C₆H₁₄',
    correctName: '3-metýlpentan',
    branches: [{ atPosition: 3, length: 1 }],
    hint: 'Lengsta keðjan er 5 kolefni (pentan). Greinin er á miðkolefninu — númer 3 burtséð frá báðum endum.',
  },
];

export function Level2({ onComplete, onBack }: Level2Props) {
  const [mode, setMode] = useState<'select' | 'name' | 'build'>('select');
  const [currentMolecule, setCurrentMolecule] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [, setTotalHintsUsed] = useState(0);
  const [useDragDrop, setUseDragDrop] = useState(true);
  const [zoneState, setZoneState] = useState<ZoneState>({});

  const molecule = molecules[currentMolecule];
  const isBranched = hasBranches(molecule);

  // Branched molecules require text entry: the drag-drop builder has no
  // substituent prefix items (e.g., "2-metýl-"), so force text mode when one loads.
  useEffect(() => {
    if (isBranched && useDragDrop) setUseDragDrop(false);
  }, [isBranched, useDragDrop]);

  // Generate draggable items for building names
  const { nameItems, nameZones } = useMemo(() => {
    // Prefixes for carbon counts
    const prefixes = [
      { id: 'prefix-meth', label: 'meth-', carbons: 1 },
      { id: 'prefix-eth', label: 'eth-', carbons: 2 },
      { id: 'prefix-prop', label: 'prop-', carbons: 3 },
      { id: 'prefix-but', label: 'but-', carbons: 4 },
      { id: 'prefix-pent', label: 'pent-', carbons: 5 },
      { id: 'prefix-hex', label: 'hex-', carbons: 6 },
    ];

    // Position numbers (for molecules with 4+ carbons)
    const positions = [
      { id: 'pos-1', label: '1-' },
      { id: 'pos-2', label: '2-' },
      { id: 'pos-3', label: '3-' },
    ];

    // Suffixes for bond types
    const suffixes = [
      { id: 'suffix-an', label: '-an', type: 'alkane' },
      { id: 'suffix-en', label: '-en', type: 'alkene' },
      { id: 'suffix-yn', label: '-yn', type: 'alkyne' },
    ];

    const items: DraggableItemData[] = [];

    // Add prefix items
    prefixes.forEach((p) => {
      items.push({
        id: p.id,
        content: (
          <div className="px-3 py-2 bg-blue-100 rounded-lg border-2 border-blue-300 font-bold text-blue-700">
            {p.label}
          </div>
        ),
        category: 'prefix',
        data: { label: p.label, carbons: p.carbons },
      });
    });

    // Add position items (only if molecule needs position)
    const needsPosition = molecule.carbons >= 4 && molecule.type !== 'alkane';
    if (needsPosition) {
      positions.forEach((p) => {
        items.push({
          id: p.id,
          content: (
            <div className="px-3 py-2 bg-red-100 rounded-lg border-2 border-red-300 font-bold text-red-700">
              {p.label}
            </div>
          ),
          category: 'position',
          data: { label: p.label },
        });
      });
    }

    // Add suffix items
    suffixes.forEach((s) => {
      items.push({
        id: s.id,
        content: (
          <div
            className={`px-3 py-2 rounded-lg border-2 font-bold ${
              s.type === 'alkane'
                ? 'bg-warm-100 border-warm-300 text-warm-700'
                : s.type === 'alkene'
                  ? 'bg-green-100 border-green-300 text-green-700'
                  : 'bg-purple-100 border-purple-300 text-purple-700'
            }`}
          >
            {s.label}
          </div>
        ),
        category: 'suffix',
        data: { label: s.label, type: s.type },
      });
    });

    // Create drop zones
    const zones: DropZoneData[] = [];

    if (needsPosition) {
      zones.push({
        id: 'zone-position',
        label: 'Staðsetning',
        maxItems: 1,
        placeholder: '?-',
        acceptedCategories: ['position'],
      });
    }

    zones.push({
      id: 'zone-prefix',
      label: 'Forskeyti',
      maxItems: 1,
      placeholder: '???-',
      acceptedCategories: ['prefix'],
    });

    zones.push({
      id: 'zone-suffix',
      label: 'Viðskeyti',
      maxItems: 1,
      placeholder: '-???',
      acceptedCategories: ['suffix'],
    });

    return { nameItems: items, nameZones: zones };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: regenerate items when molecule index changes
  }, [currentMolecule, molecule]);

  // Handle drag-drop events
  const handleDrop = (result: DropResult) => {
    const { itemId, zoneId } = result;

    setZoneState((prev) => {
      const newState = { ...prev };
      // Remove item from other zones
      for (const key of Object.keys(newState)) {
        newState[key] = newState[key].filter((id) => id !== itemId);
      }
      // Add to target zone
      if (!newState[zoneId]) {
        newState[zoneId] = [];
      }
      // Replace existing item in zone (max 1)
      newState[zoneId] = [itemId];
      return newState;
    });
  };

  // Build name from zone state
  const getBuiltName = (): string => {
    let name = '';

    // Get position if present
    const positionItem = zoneState['zone-position']?.[0];
    if (positionItem) {
      const item = nameItems.find((i) => i.id === positionItem);
      if (item?.data?.label) {
        name += item.data.label;
      }
    }

    // Get prefix
    const prefixItem = zoneState['zone-prefix']?.[0];
    if (prefixItem) {
      const item = nameItems.find((i) => i.id === prefixItem);
      if (item?.data?.label) {
        const label = item.data.label as string;
        name += label.replace('-', '');
      }
    }

    // Get suffix
    const suffixItem = zoneState['zone-suffix']?.[0];
    if (suffixItem) {
      const item = nameItems.find((i) => i.id === suffixItem);
      if (item?.data?.label) {
        const label = item.data.label as string;
        name += label.replace('-', '');
      }
    }

    return name;
  };

  // Check drag-drop answer
  const handleDragDropSubmit = () => {
    const builtName = getBuiltName();
    const normalizedBuilt = normalizeAnswer(builtName);
    const normalizedCorrect = normalizeAnswer(molecule.correctName);
    const correct = normalizedBuilt === normalizedCorrect;

    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      const points = attempts === 0 ? 10 : attempts === 1 ? 5 : 2;
      setScore((prev) => prev + points);
    }
  };

  // Get detailed feedback
  const getDragDropFeedback = () => {
    const builtName = getBuiltName();

    if (isCorrect) {
      return {
        isCorrect: true,
        explanation: `Rétt! ${molecule.correctName} er rétt nafn fyrir ${molecule.formula}.`,
        relatedConcepts: NOMENCLATURE_RELATED,
        nextSteps: 'Frábært! Þú ert að ná góðum tökum á IUPAC nafnakerfinu.',
      };
    }

    // Determine what went wrong
    let misconception = NOMENCLATURE_MISCONCEPTIONS.prefix;
    const prefixItem = zoneState['zone-prefix']?.[0];
    const suffixItem = zoneState['zone-suffix']?.[0];

    if (!prefixItem) {
      misconception = NOMENCLATURE_MISCONCEPTIONS.prefix;
    } else if (!suffixItem) {
      misconception = NOMENCLATURE_MISCONCEPTIONS.suffix;
    } else if (molecule.carbons >= 4 && molecule.type !== 'alkane') {
      misconception = NOMENCLATURE_MISCONCEPTIONS.position;
    }

    return {
      isCorrect: false,
      explanation: `Þú skrifaðir "${builtName || '(ekkert)'}" en rétt svar er "${molecule.correctName}".`,
      misconception,
      relatedConcepts: NOMENCLATURE_RELATED,
      nextSteps: 'Athugaðu kolefnisfjölda og tengjategund sameindarinnar.',
    };
  };

  const normalizeAnswer = (answer: string): string => {
    return answer
      .toLowerCase()
      .trim()
      .replace(/í/g, 'i')
      .replace(/ú/g, 'u')
      .replace(/ý/g, 'y')
      .replace(/ó/g, 'o')
      .replace(/á/g, 'a')
      .replace(/é/g, 'e');
  };

  const handleSubmit = () => {
    const normalizedUser = normalizeAnswer(userAnswer);
    const normalizedCorrect = normalizeAnswer(molecule.correctName);
    const correct = normalizedUser === normalizedCorrect;

    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      const points = attempts === 0 ? 10 : attempts === 1 ? 5 : 2;
      setScore((prev) => prev + points);
    }
  };

  const handleNext = () => {
    if (currentMolecule < molecules.length - 1) {
      setCurrentMolecule((prev) => prev + 1);
      setUserAnswer('');
      setShowFeedback(false);
      setShowHint(false);
      setAttempts(0);
      setZoneState({});
    } else {
      onComplete(score);
    }
  };

  const handleTryAgain = () => {
    setShowFeedback(false);
    setUserAnswer('');
    setZoneState({});
    setAttempts((prev) => prev + 1);
    setShowHint(true);
  };

  const getTypeColor = () => {
    switch (molecule.type) {
      case 'alkane':
        return 'from-warm-50 to-warm-100 border-warm-300';
      case 'alkene':
        return 'from-green-50 to-emerald-100 border-green-300';
      case 'alkyne':
        return 'from-purple-50 to-violet-100 border-purple-300';
    }
  };

  const getTypeName = () => {
    switch (molecule.type) {
      case 'alkane':
        return 'Alkan (eintengi)';
      case 'alkene':
        return 'Alken (tvítengi)';
      case 'alkyne':
        return 'Alkyn (þrítengi)';
    }
  };

  // Mode selection screen
  if (mode === 'select') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 p-4 md:p-8">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <button onClick={onBack} className="text-warm-500 hover:text-warm-700">
              ← Til baka
            </button>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-center mb-2 text-green-600">
            🏷️ Stig 2: Nafna og byggja
          </h1>
          <p className="text-center text-warm-600 mb-8">Veldu hvernig þú vilt æfa þig</p>

          <div className="space-y-4">
            <button
              onClick={() => setMode('name')}
              className="w-full p-6 rounded-xl border-4 border-green-400 bg-green-50 hover:bg-green-100 transition-all text-left"
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">🏷️</div>
                <div className="flex-1">
                  <div className="text-xl font-bold text-green-800">Nefna sameindir</div>
                  <div className="text-sm text-green-600 mt-1">Sjáðu sameind → Skrifaðu nafnið</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => setMode('build')}
              className="w-full p-6 rounded-xl border-4 border-emerald-400 bg-emerald-50 hover:bg-emerald-100 transition-all text-left"
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">🔬</div>
                <div className="flex-1">
                  <div className="text-xl font-bold text-emerald-800">Byggja sameindir</div>
                  <div className="text-sm text-emerald-600 mt-1">
                    Lestu nafnið → Byggðu sameindina
                  </div>
                </div>
              </div>
            </button>
          </div>

          <div className="mt-8 bg-warm-50 p-4 rounded-xl">
            <h3 className="font-semibold text-warm-700 mb-2">💡 Mismunandi æfingar</h3>
            <p className="text-sm text-warm-600">
              <strong>Nefna sameindir</strong> æfir þig í að þekkja byggingu og skrifa nafn.
              <br />
              <strong>Byggja sameindir</strong> æfir öfuga leið: lesa nafn og búa til rétta
              byggingu.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Build mode - use StructureFromNameChallenge
  if (mode === 'build') {
    return <StructureFromNameChallenge onComplete={onComplete} onBack={() => setMode('select')} />;
  }

  // Name mode - existing functionality
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 p-4 md:p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => setMode('select')} className="text-warm-500 hover:text-warm-700">
            ← Til baka
          </button>
          <div className="flex items-center gap-4">
            <div className="text-sm text-warm-500">
              Sameind {currentMolecule + 1} af {molecules.length}
            </div>
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-bold">
              Stig: {score}
            </div>
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-center mb-2 text-green-600">
          🏷️ Nefndu sameindina
        </h1>
        <p className="text-center text-warm-600 mb-6">
          Notaðu IUPAC reglurnar til að nefna þessa sameind
        </p>

        <div className={`bg-gradient-to-br ${getTypeColor()} p-6 rounded-xl border-2 mb-6`}>
          <div className="text-center mb-4">
            <span className="inline-block px-3 py-1 rounded-full text-sm font-bold bg-white">
              {getTypeName()}
            </span>
          </div>

          <div className="flex justify-center items-center mb-4 py-2">
            <AnimatedMolecule
              molecule={organicToMolecule(molecule)}
              mode="organic"
              size="lg"
              animation="scale-in"
              showAtomLabels={true}
              ariaLabel={`${molecule.formula} kolefniskeðja`}
            />
          </div>

          <div className="text-center">
            <span className="text-2xl font-mono font-bold text-warm-800">{molecule.formula}</span>
          </div>

          {/* Functional group legend */}
          {molecule.type !== 'alkane' && (
            <div
              className={`mt-4 p-3 rounded-lg border-2 ${
                molecule.type === 'alkene'
                  ? 'bg-green-50 border-green-300'
                  : 'bg-purple-50 border-purple-300'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span
                  className={`text-lg font-bold ${
                    molecule.type === 'alkene' ? 'text-green-600' : 'text-purple-600'
                  }`}
                >
                  {molecule.type === 'alkene' ? '🟢 Tvítengi (C=C)' : '🟣 Þrítengi (C≡C)'}
                </span>
                <span className="text-sm text-warm-600">
                  á stað {molecule.doublePosition || molecule.triplePosition}
                </span>
              </div>
              <p className="text-xs text-center mt-1 text-warm-500">
                {molecule.type === 'alkene'
                  ? 'Viðskeytið -en gefur til kynna tvítengi (ómettað)'
                  : 'Viðskeytið -yn gefur til kynna þrítengi (ómettað)'}
              </p>
            </div>
          )}
        </div>

        {showHint && (
          <div className="bg-yellow-50 p-4 rounded-xl mb-4 border border-yellow-200">
            <div className="flex items-center gap-2">
              <span className="text-xl">💡</span>
              <span className="text-yellow-800">{molecule.hint}</span>
            </div>
          </div>
        )}

        {!showFeedback ? (
          <div className="space-y-4">
            {/* Mode toggle — drag-drop builder has no substituent prefixes, so branched molecules require text entry. */}
            <div className="flex justify-end">
              <button
                onClick={() => setUseDragDrop(!useDragDrop)}
                disabled={isBranched}
                className="text-xs px-3 py-1 rounded-full bg-warm-100 hover:bg-warm-200 text-warm-600 disabled:opacity-50 disabled:cursor-not-allowed"
                title={isBranched ? 'Greinótt sameind — aðeins skrifa-hamur' : undefined}
              >
                {useDragDrop ? '⌨️ Skipta í skrifa-ham' : '✋ Skipta í draga-ham'}
              </button>
            </div>

            {useDragDrop ? (
              /* Drag-and-drop name builder */
              <div>
                <label className="block text-sm font-medium text-warm-700 mb-2">
                  Dragðu hluta til að byggja nafnið:
                </label>

                <DragDropBuilder
                  items={nameItems}
                  zones={nameZones}
                  initialState={zoneState}
                  onDrop={handleDrop}
                  orientation="horizontal"
                />

                {/* Preview of built name */}
                <div className="mt-4 p-4 bg-emerald-50 rounded-xl border-2 border-emerald-200 text-center">
                  <div className="text-sm text-warm-500 mb-1">Nafnið sem þú byggir:</div>
                  <div className="text-2xl font-bold text-emerald-700">{getBuiltName() || '—'}</div>
                </div>
              </div>
            ) : (
              /* Text input mode */
              <div>
                <label className="block text-sm font-medium text-warm-700 mb-2">
                  Hvert er nafn þessarar sameindar?
                </label>
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Sláðu inn nafnið..."
                  className="w-full text-center text-xl font-bold p-4 border-2 border-green-300 rounded-xl focus:border-green-500 focus:outline-none"
                  onKeyPress={(e) => e.key === 'Enter' && userAnswer && handleSubmit()}
                />
              </div>
            )}

            <div className="flex gap-4">
              {!showHint && (
                <button
                  onClick={() => {
                    setShowHint(true);
                    setTotalHintsUsed((prev) => prev + 1);
                  }}
                  className="flex-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-bold py-3 px-6 rounded-xl"
                >
                  💡 Vísbending
                </button>
              )}
              <button
                onClick={useDragDrop ? handleDragDropSubmit : handleSubmit}
                disabled={useDragDrop ? !getBuiltName() : !userAnswer.trim()}
                className={`flex-1 font-bold py-3 px-6 rounded-xl ${
                  (useDragDrop ? !getBuiltName() : !userAnswer.trim())
                    ? 'bg-warm-200 text-warm-400 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                Athuga svar
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {useDragDrop ? (
              <FeedbackPanel
                feedback={getDragDropFeedback()}
                config={{
                  showExplanation: true,
                  showMisconceptions: !isCorrect,
                  showRelatedConcepts: true,
                  showNextSteps: true,
                }}
              />
            ) : (
              <div
                className={`p-6 rounded-xl text-center ${
                  isCorrect
                    ? 'bg-green-100 border-2 border-green-400'
                    : 'bg-red-100 border-2 border-red-400'
                }`}
              >
                <div className="text-4xl mb-2">{isCorrect ? '✓' : '✗'}</div>
                <div
                  className={`text-xl font-bold ${isCorrect ? 'text-green-800' : 'text-red-800'}`}
                >
                  {isCorrect ? 'Rétt!' : 'Rangt'}
                </div>
                {isCorrect ? (
                  <div className="mt-2 text-green-700">
                    <span className="text-2xl font-bold">{molecule.correctName}</span> er rétt!
                  </div>
                ) : (
                  <div className="mt-2 text-red-700">
                    Rétt svar er: <span className="font-bold">{molecule.correctName}</span>
                  </div>
                )}
              </div>
            )}

            <div className="bg-warm-50 p-4 rounded-xl">
              <div className="font-bold text-warm-700 mb-2">Útskýring:</div>
              <div className="text-sm text-warm-600">
                <span className="text-blue-600 font-bold">
                  {molecule.carbons === 1
                    ? 'meth'
                    : molecule.carbons === 2
                      ? 'eth'
                      : molecule.carbons === 3
                        ? 'prop'
                        : molecule.carbons === 4
                          ? 'but'
                          : molecule.carbons === 5
                            ? 'pent'
                            : molecule.carbons === 6
                              ? 'hex'
                              : molecule.carbons === 7
                                ? 'hept'
                                : molecule.carbons === 8
                                  ? 'oct'
                                  : 'non'}
                </span>
                <span className="text-warm-500"> ({molecule.carbons} kolefni) + </span>
                <span className="text-green-600 font-bold">
                  {molecule.type === 'alkane' ? 'an' : molecule.type === 'alkene' ? 'en' : 'yn'}
                </span>
                <span className="text-warm-500">
                  {' '}
                  (
                  {molecule.type === 'alkane'
                    ? 'eintengi'
                    : molecule.type === 'alkene'
                      ? 'tvítengi'
                      : 'þrítengi'}
                  )
                </span>
                {(molecule.doublePosition || molecule.triplePosition) && molecule.carbons >= 4 && (
                  <span className="text-warm-500">
                    {' '}
                    + staðsetningartala{' '}
                    <span className="text-red-600 font-bold">
                      {molecule.doublePosition || molecule.triplePosition}
                    </span>
                  </span>
                )}
              </div>
            </div>

            {isCorrect ? (
              <button
                onClick={handleNext}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl"
              >
                {currentMolecule < molecules.length - 1 ? 'Næsta sameind →' : 'Ljúka stigi →'}
              </button>
            ) : (
              <div className="flex gap-4">
                <button
                  onClick={handleTryAgain}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-6 rounded-xl"
                >
                  Reyna aftur
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 bg-warm-500 hover:bg-warm-600 text-white font-bold py-3 px-6 rounded-xl"
                >
                  Halda áfram →
                </button>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 bg-warm-50 p-4 rounded-xl">
          <h3 className="font-semibold text-warm-700 mb-2">📋 Nafnareglur:</h3>
          <div className="text-xs space-y-1 text-warm-600">
            <div>• Forskeyti (kolefnisfjöldi) + viðskeyti (tengjategund)</div>
            <div>• Fyrir 4+ kolefni með tvítengi/þrítengi, bættu við staðsetningartölu</div>
            <div>• Númeraðu keðjuna svo tvítengi/þrítengi fái lægstu tölu</div>
          </div>
        </div>

        <div className="mt-4 w-full bg-warm-200 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentMolecule + 1) / molecules.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
