import { useState, useCallback, useMemo } from 'react';
import { Compound, COMPOUNDS } from '../data/compounds';

/**
 * Name Builder Component
 * Students construct chemical names from prefixes, element roots, and suffixes
 */

// Prefixes for molecular compounds (Greek)
const PREFIXES: { [key: number]: string } = {
  1: 'Mónó',
  2: 'Dí',
  3: 'Trí',
  4: 'Tetra',
  5: 'Penta',
  6: 'Hexa',
  7: 'Hepta',
  8: 'Okta',
  9: 'Nóna',
  10: 'Deka'
};

// Element names in Icelandic (roots for building names)
const ELEMENT_ROOTS: { [key: string]: { root: string; full: string } } = {
  'H': { root: 'vetni', full: 'Vetni' },
  'C': { root: 'kol', full: 'Kolefni' },
  'N': { root: 'nitur', full: 'Köfnunarefni' },
  'O': { root: 'oxíð', full: 'Súrefni' },
  'F': { root: 'flúoríð', full: 'Flúor' },
  'Cl': { root: 'klóríð', full: 'Klór' },
  'Br': { root: 'brómíð', full: 'Bróm' },
  'I': { root: 'joðíð', full: 'Joð' },
  'S': { root: 'brennisteinið', full: 'Brennisteinn' },
  'P': { root: 'fosfór', full: 'Fosfór' },
  'Na': { root: 'natríum', full: 'Natríum' },
  'K': { root: 'kalíum', full: 'Kalíum' },
  'Ca': { root: 'kalsíum', full: 'Kalsíum' },
  'Mg': { root: 'magnesíum', full: 'Magnesíum' },
  'Al': { root: 'ál', full: 'Ál' },
  'Fe': { root: 'járn', full: 'Járn' },
  'Cu': { root: 'kopar', full: 'Kopar' },
  'Zn': { root: 'sink', full: 'Sink' },
  'Ag': { root: 'silfur', full: 'Silfur' },
  'Li': { root: 'litíum', full: 'Litíum' },
  'Ba': { root: 'baríum', full: 'Baríum' },
  'Xe': { root: 'xenon', full: 'Xenon' },
};

// Polyatomic ions (for future expansion)
// const POLYATOMIC_IONS: { [key: string]: string } = {
//   'SO₄': 'súlfat',
//   'NO₃': 'nítrat',
//   'CO₃': 'karbónat',
//   'PO₄': 'fosfat',
//   'OH': 'hýdroxíð',
//   'NH₄': 'ammóníum',
//   'Cr₂O₇': 'díkrómat',
//   'HCO₃': 'vetniskarbónat',
// };

interface NamePart {
  id: string;
  text: string;
  type: 'prefix' | 'element' | 'suffix' | 'ion';
  isSelected: boolean;
  order: number;
}

interface NameBuilderProps {
  onComplete?: (score: number, maxScore: number) => void;
  onBack?: () => void;
  onCorrectAnswer?: () => void;
  onIncorrectAnswer?: () => void;
}

// Get compounds suitable for name building (molecular compounds work best)
function getNameBuildingCompounds(): Compound[] {
  return COMPOUNDS.filter(c =>
    c.type === 'molecular' &&
    c.difficulty !== 'hard' &&
    c.name !== 'Vatn' && // Skip special names
    c.name !== 'Ammóníak' &&
    !c.name.includes('(') // Skip oxidation state compounds for now
  ).slice(0, 15);
}

// Parse a compound name into expected parts (for future expansion)
// function parseCompoundName(compound: Compound): string[] {
//   const name = compound.name;
//   const parts: string[] = [];
//   // Check for common patterns
//   if (name.startsWith('Dí')) parts.push('Dí');
//   else if (name.startsWith('Trí')) parts.push('Trí');
//   // etc.
//   return parts;
// }

// Generate available parts for a compound
function generateParts(compound: Compound): NamePart[] {
  const parts: NamePart[] = [];
  let id = 0;

  // Add relevant prefixes
  Object.entries(PREFIXES).forEach(([num, prefix]) => {
    if (parseInt(num) <= 4 || compound.name.toLowerCase().includes(prefix.toLowerCase())) {
      parts.push({
        id: `prefix-${id++}`,
        text: prefix.toLowerCase(),
        type: 'prefix',
        isSelected: false,
        order: -1
      });
    }
  });

  // Add element roots based on elements in the compound
  compound.elements.forEach(el => {
    const rootInfo = ELEMENT_ROOTS[el];
    if (rootInfo) {
      parts.push({
        id: `element-${id++}`,
        text: rootInfo.root.toLowerCase(),
        type: 'element',
        isSelected: false,
        order: -1
      });
    }
  });

  // Add some distractors
  const distractors = ['sulfat', 'nítrat', 'karbon', 'amid'];
  distractors.slice(0, 2).forEach(d => {
    if (!compound.name.toLowerCase().includes(d)) {
      parts.push({
        id: `distractor-${id++}`,
        text: d,
        type: 'element',
        isSelected: false,
        order: -1
      });
    }
  });

  return parts;
}

export function NameBuilder({ onComplete, onBack, onCorrectAnswer, onIncorrectAnswer }: NameBuilderProps) {
  const compounds = useMemo(() => getNameBuildingCompounds(), []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedParts, setSelectedParts] = useState<NamePart[]>([]);
  const [availableParts, setAvailableParts] = useState<NamePart[]>(() =>
    generateParts(compounds[0])
  );
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const compound = compounds[currentIndex];
  const totalCompounds = Math.min(compounds.length, 10);

  // Build the current name from selected parts
  const builtName = selectedParts
    .sort((a, b) => a.order - b.order)
    .map(p => p.text)
    .join('');

  // Capitalize first letter
  const displayName = builtName.charAt(0).toUpperCase() + builtName.slice(1);

  // Select a part
  const selectPart = useCallback((part: NamePart) => {
    if (showFeedback) return;

    setSelectedParts(prev => {
      const newOrder = prev.length;
      return [...prev, { ...part, isSelected: true, order: newOrder }];
    });
    setAvailableParts(prev => prev.filter(p => p.id !== part.id));
  }, [showFeedback]);

  // Remove a part
  const removePart = useCallback((part: NamePart) => {
    if (showFeedback) return;

    setSelectedParts(prev => prev.filter(p => p.id !== part.id));
    setAvailableParts(prev => [...prev, { ...part, isSelected: false, order: -1 }]);
  }, [showFeedback]);

  // Check the answer
  const checkAnswer = useCallback(() => {
    const correct = displayName.toLowerCase() === compound.name.toLowerCase();
    setIsCorrect(correct);
    setShowFeedback(true);
    setAttempts(prev => prev + 1);

    if (correct) {
      const points = Math.max(10 - attempts * 2, 5);
      setScore(prev => prev + points);
      onCorrectAnswer?.();
    } else {
      onIncorrectAnswer?.();
    }
  }, [displayName, compound.name, attempts, onCorrectAnswer, onIncorrectAnswer]);

  // Next compound
  const nextCompound = useCallback(() => {
    if (currentIndex + 1 < totalCompounds) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setSelectedParts([]);
      setAvailableParts(generateParts(compounds[nextIdx]));
      setShowFeedback(false);
      setAttempts(0);
    } else {
      onComplete?.(score, totalCompounds * 10);
    }
  }, [currentIndex, totalCompounds, compounds, score, onComplete]);

  // Reset current
  const resetCurrent = useCallback(() => {
    setSelectedParts([]);
    setAvailableParts(generateParts(compound));
    if (showFeedback && !isCorrect) {
      setShowFeedback(false);
    }
  }, [compound, showFeedback, isCorrect]);

  // Completion screen
  if (currentIndex >= totalCompounds) {
    const accuracy = Math.round((score / (totalCompounds * 10)) * 100);
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Frábært!</h2>
            <p className="text-gray-600 mb-6">Þú hefur lokið nafnasmiðju!</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-purple-50 rounded-xl p-4">
                <div className="text-3xl font-bold text-purple-600">{score}</div>
                <div className="text-sm text-gray-600">Stig</div>
              </div>
              <div className="bg-green-50 rounded-xl p-4">
                <div className="text-3xl font-bold text-green-600">{accuracy}%</div>
                <div className="text-sm text-gray-600">Nákvæmni</div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-4 mb-6 text-left">
              <h3 className="font-bold text-blue-800 mb-2">Hvað lærðir þú?</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Grísk forskeyti: dí-, trí-, tetra-, penta-...</li>
                <li>• Endi -íð fyrir tvíefni (oxíð, klóríð, flúoríð)</li>
                <li>• Málmurinn kemur fyrst í jónefnum</li>
              </ul>
            </div>

            <button
              onClick={onBack}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 rounded-xl transition-colors"
            >
              Til baka í valmynd
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-800">Nafnasmiðja</h1>
              <p className="text-sm text-gray-600">Byggðu nafnið úr pörtum</p>
            </div>
            <div className="flex gap-4 items-center">
              <div className="text-center">
                <div className="text-xl font-bold text-purple-600">{score}</div>
                <div className="text-xs text-gray-600">Stig</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-blue-600">{currentIndex + 1}/{totalCompounds}</div>
                <div className="text-xs text-gray-600">Efni</div>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 transition-all duration-500"
              style={{ width: `${((currentIndex + (showFeedback ? 1 : 0)) / totalCompounds) * 100}%` }}
            />
          </div>
        </div>

        {/* Formula display */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-4">
          <div className="text-center mb-6">
            <div className="text-sm text-gray-500 mb-2">Efnaformúla:</div>
            <div className="text-5xl font-mono font-bold text-gray-800">{compound.formula}</div>
            <div className="text-sm text-gray-500 mt-2">{compound.info}</div>
          </div>

          {/* Building area */}
          <div className="mb-6">
            <div className="text-sm text-gray-600 mb-2">Þitt nafn:</div>
            <div className={`min-h-16 p-4 rounded-xl border-2 border-dashed flex flex-wrap gap-2 items-center justify-center ${
              showFeedback
                ? isCorrect ? 'border-green-400 bg-green-50' : 'border-red-400 bg-red-50'
                : 'border-purple-300 bg-purple-50'
            }`}>
              {selectedParts.length === 0 ? (
                <span className="text-gray-400 text-sm">Veldu parta hér að neðan...</span>
              ) : (
                selectedParts.sort((a, b) => a.order - b.order).map(part => (
                  <button
                    key={part.id}
                    onClick={() => removePart(part)}
                    disabled={showFeedback}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors disabled:opacity-50"
                  >
                    {part.text}
                    {!showFeedback && <span className="ml-2 text-purple-200">×</span>}
                  </button>
                ))
              )}
            </div>
            <div className="text-center mt-2">
              <span className="text-2xl font-bold text-gray-800">
                {displayName || '???'}
              </span>
            </div>
          </div>

          {/* Feedback */}
          {showFeedback && (
            <div className={`p-4 rounded-xl mb-4 ${isCorrect ? 'bg-green-100' : 'bg-yellow-100'}`}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{isCorrect ? '🎉' : '💡'}</span>
                <div>
                  <div className="font-bold text-gray-800">
                    {isCorrect ? 'Rétt!' : 'Ekki alveg...'}
                  </div>
                  <div className="text-sm text-gray-700">
                    Rétt nafn: <strong>{compound.name}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Available parts */}
          <div>
            <div className="text-sm text-gray-600 mb-2">Tiltækir partar:</div>
            <div className="flex flex-wrap gap-2">
              {availableParts.map(part => (
                <button
                  key={part.id}
                  onClick={() => selectPart(part)}
                  disabled={showFeedback}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    part.type === 'prefix'
                      ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      : part.type === 'suffix'
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {part.text}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          {!showFeedback ? (
            <>
              <button
                onClick={resetCurrent}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 rounded-xl transition-colors"
              >
                🔄 Hreinsa
              </button>
              <button
                onClick={checkAnswer}
                disabled={selectedParts.length === 0}
                className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ✓ Athuga
              </button>
            </>
          ) : (
            <>
              {!isCorrect && (
                <button
                  onClick={resetCurrent}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 rounded-xl transition-colors"
                >
                  Reyna aftur
                </button>
              )}
              <button
                onClick={nextCompound}
                className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 rounded-xl transition-colors"
              >
                {currentIndex + 1 < totalCompounds ? 'Næsta efni →' : 'Sjá niðurstöður'}
              </button>
            </>
          )}
        </div>

        {/* Naming rules hint */}
        <div className="mt-4 bg-blue-50 rounded-xl p-4">
          <h3 className="font-bold text-blue-800 mb-2">Nafnareglur:</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• <strong>Jónefni:</strong> Málmur + málmleysingi → málmur + endi -íð</li>
            <li>• <strong>Sameindaefni:</strong> Notaðu forskeyti (dí-, trí-, tetra-...)</li>
            <li>• <strong>-íð:</strong> Endinn fyrir neikvæða jón (oxíð, klóríð, flúoríð)</li>
          </ul>
        </div>

        {/* Back button */}
        <button
          onClick={onBack}
          className="mt-4 w-full text-gray-500 hover:text-gray-700 font-semibold py-2"
        >
          ← Til baka í valmynd
        </button>
      </div>
    </div>
  );
}

export default NameBuilder;
