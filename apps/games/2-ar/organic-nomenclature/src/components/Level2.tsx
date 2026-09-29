import { useState, useMemo, useEffect, useRef } from 'react';

import {
  AnimatedMolecule,
  DragDropBuilder,
  FeedbackPanel,
  PinnedActions,
} from '@shared/components';
import type { DraggableItemData, DropZoneData, DropResult, ZoneState } from '@shared/components';
import {
  focusTarget,
  isPhone,
  revealSpan,
  revealTop,
  usableArea,
  useArmedAfter,
  useItemTop,
  useRevealAfterCommit,
  useScreenTop,
} from '@shared/utils';

import { StructureFromNameChallenge } from './StructureFromNameChallenge';
import { CHAIN_STEMS } from '../utils/naming';
import { organicToMolecule, hasBranches, type OrganicBranch } from '../utils/organicConverter';

// Misconceptions for organic nomenclature
const NOMENCLATURE_MISCONCEPTIONS: Record<string, string> = {
  prefix: 'Forskeytið ákvarðast af fjölda kolefna: meth=1, eth=2, prop=3, but=4, pent=5, hex=6.',
  suffix: 'Viðskeytið ákvarðast af tengjategund: -an (eintengi), -en (tvítengi), -ýn (þrítengi).',
  position: 'Staðsetningartala þarf fyrir 4+ kolefni til að sýna hvar tvítengi/þrítengi er.',
};

const NOMENCLATURE_RELATED = ['IUPAC nafnakerfi', 'Kolefniskeðjur', 'Vetniskolefni', 'Virknihópar'];

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
    correctName: 'própen',
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
    correctName: 'etýn',
    triplePosition: 1,
    hint: '2 kolefni + þrítengi = eth + ýn',
  },
  {
    id: 9,
    type: 'alkyne',
    carbons: 3,
    structure: 'C≡C-C',
    formula: 'C₃H₄',
    correctName: 'própýn',
    triplePosition: 1,
    hint: '3 kolefni + þrítengi = prop + ýn',
  },
  {
    id: 10,
    type: 'alkyne',
    carbons: 4,
    structure: 'C≡C-C-C',
    formula: 'C₄H₆',
    correctName: '1-bútýn',
    triplePosition: 1,
    hint: '4+ kolefni þarf staðsetningartölu',
  },
  {
    id: 11,
    type: 'alkyne',
    carbons: 5,
    structure: 'C-C≡C-C-C',
    formula: 'C₅H₈',
    correctName: '2-pentýn',
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

  // Choosing a mode, and Til baka from one, starts the new screen at its top
  // with its heading focused.
  useScreenTop(mode);

  // "Næsta sameind", "Halda áfram" and "Reyna aftur": on a phone the molecule's
  // top comes back under the screen's top edge, and focus moves to it at every
  // width, because the button pressed has unmounted.
  const moleculeRef = useItemTop<HTMLDivElement>(`${currentMolecule}:${attempts}`);
  const feedbackBoxRef = useRef<HTMLDivElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const nextRowRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  // After Athuga, a phone shows the molecule through the next buttons when it
  // fits, or else the verdict at the top, and focus moves to the verdict, not to
  // a button, so a second Enter lands on nothing (design P3).
  useRevealAfterCommit(showFeedback, () => ({
    bottom: nextRowRef.current,
    tops: [moleculeRef.current, feedbackRef.current],
    focus: feedbackRef.current,
  }));
  // A double tap on Athuga must not land on Reyna aftur, Halda áfram or Næsta.
  const armed = useArmedAfter(400, `${currentMolecule}:${showFeedback}`);

  // A desktop window keeps what the game's own helper did there, at any width:
  // the feedback is brought to the top when it opened above the screen or near
  // its foot, and moving on brings back a molecule more than half above the
  // screen. A phone does both through the shared hooks above.
  useEffect(() => {
    const el = feedbackBoxRef.current;
    if (!showFeedback || !el || isPhone()) return;
    const { top } = el.getBoundingClientRect();
    if (top < 0 || top > usableArea().bottom - 120) revealTop(el, { anyWidth: true, always: true });
  }, [showFeedback]);
  useEffect(() => {
    const el = moleculeRef.current;
    if (showFeedback || !el || isPhone()) return;
    const { top, height } = el.getBoundingClientRect();
    if (top < -height * 0.5) revealTop(el, { anyWidth: true, always: true });
  }, [moleculeRef, currentMolecule, showFeedback]);

  // The hint opens above the name builder, and the Vísbending button that
  // opened it is gone, so focus moves to the hint. On a phone the hint is
  // brought into view with Athuga, or alone while Athuga is pinned to the
  // bottom of the screen anyway. ("Reyna aftur" also opens the hint, but moves
  // focus to the molecule instead: only a hint asked for moves it here.)
  const hintAsked = useRef(false);
  const openHint = () => {
    hintAsked.current = true;
    setShowHint(true);
    setTotalHintsUsed((prev) => prev + 1);
  };
  useEffect(() => {
    if (!showHint || !hintAsked.current) return;
    hintAsked.current = false;
    const pinned = !!actionsRef.current?.closest('[data-pinned-bottom]');
    revealSpan(pinned ? hintRef.current : actionsRef.current, [hintRef.current]);
    focusTarget(hintRef.current);
  }, [showHint]);

  // Generate draggable items for building names
  const { nameItems, nameZones } = useMemo(() => {
    // Prefixes for carbon counts. The chip shows the prefix Stig 1 teaches; the built name
    // uses the stem the answer is spelled with (eth- + -an builds `etan`, as the answer key and
    // the textbook write it). Concatenating the chip label built `ethan`, which the grader
    // then marked wrong, so etan, eten and etýn could not be answered in this mode at all.
    const prefixes = [
      { id: 'prefix-meth', label: 'meth-', carbons: 1 },
      { id: 'prefix-eth', label: 'eth-', carbons: 2 },
      { id: 'prefix-prop', label: 'prop-', carbons: 3 },
      { id: 'prefix-but', label: 'but-', carbons: 4 },
      { id: 'prefix-pent', label: 'pent-', carbons: 5 },
      { id: 'prefix-hex', label: 'hex-', carbons: 6 },
    ].map((p) => ({ ...p, stem: CHAIN_STEMS[p.carbons] }));

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
      { id: 'suffix-yn', label: '-ýn', type: 'alkyne' },
    ];

    // The builder wraps each part in its own padded card, so on a phone the chips inside drop
    // most of their padding: the pool holds more parts per row and the whole builder fits a
    // phone screen with less scrolling between a part and its zone. sm and up are unchanged.
    // On a phone (`phone:`, with the builder's `compact`) the chip goes further and becomes the
    // card: it drops its own border and fills the card's padding (the negative margins), so a
    // part is one 44 px chip rather than a chip inside a card.
    const chip =
      'px-2 py-0.5 sm:px-3 sm:py-2 rounded-lg border-2 font-bold ' +
      'phone:-mx-2 phone:-my-1 phone:px-2 phone:py-2 phone:border-0 phone:rounded-md';
    const items: DraggableItemData[] = [];

    // Add prefix items
    prefixes.forEach((p) => {
      items.push({
        id: p.id,
        content: (
          <div className={`${chip} bg-blue-100 border-blue-300 text-blue-700`}>{p.label}</div>
        ),
        category: 'prefix',
        data: { label: p.label, stem: p.stem, carbons: p.carbons },
      });
    });

    // Add position items (only if molecule needs position)
    const needsPosition = molecule.carbons >= 4 && molecule.type !== 'alkane';
    if (needsPosition) {
      positions.forEach((p) => {
        items.push({
          id: p.id,
          content: (
            <div className={`${chip} bg-red-100 border-red-300 text-red-700`}>{p.label}</div>
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
            className={`${chip} ${
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

  // An item taken back out of a zone — dragged or tapped back to the pool, or displaced by a
  // swap into a full zone. Without this the mirrored zoneState keeps it, and the built name
  // (and the graded answer) still shows a part the student has already removed.
  const handleRemove = (itemId: string, fromZoneId: string) => {
    setZoneState((prev) => ({
      ...prev,
      [fromZoneId]: (prev[fromZoneId] || []).filter((id) => id !== itemId),
    }));
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
      if (item?.data?.stem) {
        name += item.data.stem as string;
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

    // Name the part that is actually wrong. This used to go by which zones were filled, so
    // eth- + -en for etan was told about prefixes, and any wrong build of 1-búten or 2-pentýn
    // was told about the position number even when the prefix or the ending was the mistake.
    const placed = (zoneId: string) =>
      nameItems.find((i) => i.id === zoneState[zoneId]?.[0])?.data as
        { carbons?: number; type?: string } | undefined;
    const prefixPart = placed('zone-prefix');
    const suffixPart = placed('zone-suffix');

    let misconception: string;
    if (prefixPart?.carbons !== molecule.carbons) {
      misconception = NOMENCLATURE_MISCONCEPTIONS.prefix;
    } else if (suffixPart?.type !== molecule.type) {
      misconception = NOMENCLATURE_MISCONCEPTIONS.suffix;
    } else {
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
        return 'Alkýn (þrítengi)';
    }
  };

  // Mode selection screen
  if (mode === 'select') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 p-4 md:p-8">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8">
          <div className="flex flex-wrap justify-between items-center gap-x-4 gap-y-2 mb-6 phone:mb-3">
            <button
              onClick={onBack}
              className="text-warm-500 hover:text-warm-700 whitespace-nowrap pointer-coarse:py-2.5 pointer-coarse:-my-2.5"
            >
              ← Til baka
            </button>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-center mb-2 text-green-600 phone:text-xl">
            🏷️ Stig 2: Nafna og byggja
          </h1>
          <p className="text-center text-warm-600 mb-8 phone:mb-4">Veldu hvernig þú vilt æfa þig</p>

          <div className="space-y-4 phone:space-y-3">
            <button
              onClick={() => setMode('name')}
              className="w-full p-4 sm:p-6 rounded-xl border-4 border-green-400 bg-green-50 hover:bg-green-100 transition-all text-left phone:p-3"
            >
              <div className="flex items-center gap-4 phone:gap-3">
                <div className="text-4xl phone:text-3xl">🏷️</div>
                <div className="flex-1">
                  <div className="text-xl font-bold text-green-800">Nefna sameindir</div>
                  <div className="text-sm text-green-600 mt-1">Sjáðu sameind → Skrifaðu nafnið</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => setMode('build')}
              className="w-full p-4 sm:p-6 rounded-xl border-4 border-emerald-400 bg-emerald-50 hover:bg-emerald-100 transition-all text-left phone:p-3"
            >
              <div className="flex items-center gap-4 phone:gap-3">
                <div className="text-4xl phone:text-3xl">🔬</div>
                <div className="flex-1">
                  <div className="text-xl font-bold text-emerald-800">Byggja sameindir</div>
                  <div className="text-sm text-emerald-600 mt-1">
                    Lestu nafnið → Byggðu sameindina
                  </div>
                </div>
              </div>
            </button>
          </div>

          <div className="mt-8 bg-warm-50 p-4 rounded-xl phone:mt-4">
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
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8">
        <div className="flex flex-wrap justify-between items-center gap-x-4 gap-y-2 mb-6 phone:mb-3 phone:gap-x-3">
          <button
            onClick={() => setMode('select')}
            className="text-warm-500 hover:text-warm-700 whitespace-nowrap pointer-coarse:py-2.5 pointer-coarse:-my-2.5"
          >
            ← Til baka
          </button>
          <div className="ml-auto flex items-center gap-3 sm:gap-4 phone:gap-2">
            <div className="text-sm text-warm-500 whitespace-nowrap">
              Sameind {currentMolecule + 1} af {molecules.length}
            </div>
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-bold whitespace-nowrap phone:px-2 phone:py-0.5 phone:text-sm">
              Stig: {score}
            </div>
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-center mb-2 text-green-600 phone:text-xl phone:mb-1">
          🏷️ Nefndu sameindina
        </h1>
        <p className="text-center text-warm-600 mb-6 phone:mb-3 phone:text-sm">
          Notaðu IUPAC reglurnar til að nefna þessa sameind
        </p>

        {/* A phone on its side: the molecule | naming it (design §3). The two
            groups are plain blocks elsewhere, so desktop margins are unchanged.
            On a portrait phone the task column is display:contents, so the
            pinned action bar sticks within this whole block, molecule included. */}
        <div className="phone-land:grid phone-land:grid-cols-2 phone-land:gap-4 phone-land:items-start">
          <div>
            <div
              ref={moleculeRef}
              data-item-start
              className={`bg-gradient-to-br ${getTypeColor()} p-4 sm:p-6 rounded-xl border-2 mb-6 scroll-mt-4 phone:p-3 phone:mb-3`}
            >
              <div className="text-center mb-4 phone:mb-1">
                <span className="inline-block px-3 py-1 rounded-full text-sm font-bold bg-white">
                  {getTypeName()}
                </span>
              </div>

              {/* On a phone the drawing is cropped to the atoms (fit): the square
              around a chain is mostly empty. */}
              <div className="flex justify-center items-center mb-4 py-2 phone:mb-1 phone:py-0">
                <AnimatedMolecule
                  molecule={organicToMolecule(molecule)}
                  mode="organic"
                  size="lg"
                  animation="scale-in"
                  showAtomLabels={true}
                  ariaLabel={`${molecule.formula} kolefniskeðja`}
                  fit
                />
              </div>

              <div className="text-center">
                <span className="text-2xl font-mono font-bold text-warm-800">
                  {molecule.formula}
                </span>
              </div>

              {/* Functional group legend */}
              {molecule.type !== 'alkane' && (
                <div
                  className={`mt-4 p-3 rounded-lg border-2 phone:mt-2 phone:p-2 ${
                    molecule.type === 'alkene'
                      ? 'bg-green-50 border-green-300'
                      : 'bg-purple-50 border-purple-300'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-center gap-x-2">
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
                      : 'Viðskeytið -ýn gefur til kynna þrítengi (ómettað)'}
                  </p>
                </div>
              )}
            </div>

            {showHint && (
              <div
                ref={hintRef}
                className="bg-yellow-50 p-4 rounded-xl mb-4 border border-yellow-200 phone:p-3 phone:mb-3"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">💡</span>
                  <span className="text-yellow-800">{molecule.hint}</span>
                </div>
              </div>
            )}
          </div>
          <div className="pin:contents">
            {!showFeedback ? (
              // `pin:contents` hands the pinned action bar the whole block above to
              // stick within, not just this one (its children keep their spacing).
              // The two branches are keyed so the feedback never reuses an answering
              // element: Athuga is never Næsta, and nothing of the builder's styling
              // carries over into the feedback while it lays out.
              <div key="answering" className="space-y-4 phone:space-y-3 pin:contents">
                {/* Mode toggle — drag-drop builder has no substituent prefixes, so branched molecules require text entry. */}
                <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1">
                  {/* The disabled toggle's title tooltip never shows on a touchscreen */}
                  {isBranched && (
                    <span className="hidden pointer-coarse:inline text-xs text-warm-500">
                      Greinótt sameind — aðeins skrifa-hamur
                    </span>
                  )}
                  <button
                    onClick={() => setUseDragDrop(!useDragDrop)}
                    disabled={isBranched}
                    className="text-xs px-3 py-1 rounded-full bg-warm-100 hover:bg-warm-200 text-warm-600 disabled:opacity-50 disabled:cursor-not-allowed pointer-coarse:min-h-11 pointer-coarse:px-4 pointer-coarse:text-sm"
                    title={isBranched ? 'Greinótt sameind — aðeins skrifa-hamur' : undefined}
                  >
                    {useDragDrop ? '⌨️ Skipta í skrifa-ham' : '✋ Skipta í draga-ham'}
                  </button>
                </div>

                {useDragDrop ? (
                  /* Drag-and-drop name builder */
                  <div>
                    <label className="block text-sm font-medium text-warm-700 mb-2 phone:mb-1">
                      Dragðu hluta til að byggja nafnið:
                    </label>

                    {/* On a phone: denser parts and zones (compact), and the zones
                    side by side, one row under the pool. */}
                    <DragDropBuilder
                      items={nameItems}
                      zones={nameZones}
                      initialState={zoneState}
                      onDrop={handleDrop}
                      onRemove={handleRemove}
                      orientation="horizontal"
                      compact
                      className="phone:gap-3"
                      itemsPoolClassName="phone:p-3"
                      zonesClassName="sm:flex-row phone:flex-row phone:gap-2"
                    />

                    {/* Preview of built name: one line on a phone */}
                    <div className="mt-4 p-4 bg-emerald-50 rounded-xl border-2 border-emerald-200 text-center phone:mt-3 phone:px-3 phone:py-1.5 phone:flex phone:flex-wrap phone:items-baseline phone:justify-center phone:gap-x-2">
                      <div className="text-sm text-warm-500 mb-1 phone:mb-0">
                        Nafnið sem þú byggir:
                      </div>
                      <div className="text-2xl font-bold text-emerald-700 phone:text-xl">
                        {getBuiltName() || '—'}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Text input mode */
                  <div>
                    <label className="block text-sm font-medium text-warm-700 mb-2 phone:mb-1">
                      Hvert er nafn þessarar sameindar?
                    </label>
                    <input
                      type="text"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder="Sláðu inn nafnið..."
                      autoCapitalize="none"
                      autoCorrect="off"
                      autoComplete="off"
                      spellCheck={false}
                      enterKeyHint="done"
                      className="w-full text-center text-xl font-bold p-4 border-2 border-green-300 rounded-xl focus:border-green-500 focus:outline-none phone:p-3"
                      onKeyPress={(e) => e.key === 'Enter' && userAnswer && handleSubmit()}
                    />
                  </div>
                )}

                {(() => {
                  // Vísbending | Athuga on one row, each word on one line. Where the
                  // two do not fit side by side (about 320 px) they stack instead
                  // of squeezing.
                  const actions = (
                    <div ref={actionsRef} className="flex gap-4 phone:flex-wrap phone:gap-3">
                      {!showHint && (
                        <button
                          onClick={openHint}
                          className="flex-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-bold py-3 px-4 sm:px-6 rounded-xl phone:flex-[1_1_8.5rem] phone:px-2 phone:whitespace-nowrap"
                        >
                          💡 Vísbending
                        </button>
                      )}
                      <button
                        key="check"
                        onClick={useDragDrop ? handleDragDropSubmit : handleSubmit}
                        disabled={useDragDrop ? !getBuiltName() : !userAnswer.trim()}
                        className={`flex-1 font-bold py-3 px-4 sm:px-6 rounded-xl phone:flex-[1_1_8.5rem] phone:px-2 phone:whitespace-nowrap ${
                          (useDragDrop ? !getBuiltName() : !userAnswer.trim())
                            ? 'bg-warm-200 text-warm-400 cursor-not-allowed'
                            : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                      >
                        Athuga svar
                      </button>
                    </div>
                  );
                  // Building a name by tapping parts: the parts and zones push
                  // Athuga below the screen, so on a portrait phone the row stays
                  // pinned to the bottom edge (P8). Never on the typed screen,
                  // where the keyboard would cover it.
                  return useDragDrop ? <PinnedActions>{actions}</PinnedActions> : actions;
                })()}
              </div>
            ) : (
              <div
                key="feedback"
                ref={feedbackBoxRef}
                className="space-y-4 scroll-mt-4 phone:space-y-3"
              >
                {/* The feedback region focus moves to after Athuga (P3): FeedbackPanel,
                itself role=alert, or the typed verdict, named by its heading. */}
                {useDragDrop ? (
                  <div ref={feedbackRef} tabIndex={-1} role="group" className="focus:outline-none">
                    <FeedbackPanel
                      feedback={getDragDropFeedback()}
                      config={{
                        showExplanation: true,
                        showMisconceptions: !isCorrect,
                        showRelatedConcepts: true,
                        showNextSteps: true,
                      }}
                    />
                  </div>
                ) : (
                  <div
                    ref={feedbackRef}
                    tabIndex={-1}
                    role="group"
                    aria-labelledby="organic-l2-verdict"
                    className={`p-6 rounded-xl text-center focus:outline-none phone:p-4 ${
                      isCorrect
                        ? 'bg-green-100 border-2 border-green-400'
                        : 'bg-red-100 border-2 border-red-400'
                    }`}
                  >
                    {/* On a phone the ✓/✗ sits inline with the verdict. */}
                    <div className="phone:flex phone:items-center phone:justify-center phone:gap-2">
                      <div className="text-4xl mb-2 phone:text-2xl phone:mb-0">
                        {isCorrect ? '✓' : '✗'}
                      </div>
                      <div
                        id="organic-l2-verdict"
                        className={`text-xl font-bold ${isCorrect ? 'text-green-800' : 'text-red-800'}`}
                      >
                        {isCorrect ? 'Rétt!' : 'Rangt'}
                      </div>
                    </div>
                    {isCorrect ? (
                      <div className="mt-2 text-green-700 phone:mt-1">
                        <span className="text-2xl font-bold">{molecule.correctName}</span> er rétt!
                      </div>
                    ) : (
                      <div className="mt-2 text-red-700 phone:mt-1">
                        Rétt svar er: <span className="font-bold">{molecule.correctName}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="bg-warm-50 p-4 rounded-xl phone:p-3">
                  <div className="font-bold text-warm-700 mb-2 phone:mb-1">Útskýring:</div>
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
                      {molecule.type === 'alkane' ? 'an' : molecule.type === 'alkene' ? 'en' : 'ýn'}
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
                    {(molecule.doublePosition || molecule.triplePosition) &&
                      molecule.carbons >= 4 && (
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

                {/* Separate elements from Athuga, and each ignores a press within
                400 ms of appearing. Where Reyna aftur and Halda áfram do not
                fit side by side on one line each (about 320 px), they stack. */}
                {isCorrect ? (
                  <div ref={nextRowRef}>
                    <button
                      key="next"
                      onClick={armed(handleNext)}
                      className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 sm:px-6 rounded-xl"
                    >
                      {currentMolecule < molecules.length - 1 ? 'Næsta sameind →' : 'Ljúka stigi →'}
                    </button>
                  </div>
                ) : (
                  <div ref={nextRowRef} className="flex gap-4 phone:flex-wrap phone:gap-3">
                    <button
                      key="retry"
                      onClick={armed(handleTryAgain)}
                      className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-4 sm:px-6 rounded-xl phone:flex-[1_1_8.5rem] phone:px-2 phone:whitespace-nowrap"
                    >
                      Reyna aftur
                    </button>
                    <button
                      key="next"
                      onClick={armed(handleNext)}
                      className="flex-1 bg-warm-500 hover:bg-warm-600 text-white font-bold py-3 px-4 sm:px-6 rounded-xl phone:flex-[1_1_8.5rem] phone:px-2 phone:whitespace-nowrap"
                    >
                      Halda áfram →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 bg-warm-50 p-4 rounded-xl phone:mt-4">
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
