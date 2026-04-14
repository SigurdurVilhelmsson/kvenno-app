import { useState, useCallback, useMemo } from 'react';

import { FeedbackPanel } from '@shared/components';

import { COMPOUNDS, type Compound } from '../data/compounds';

interface Level3Props {
  t: (key: string, fallback?: string) => string;
  onComplete: (score: number, maxScore: number, hintsUsed: number) => void;
  onBack: () => void;
  onCorrectAnswer?: () => void;
  onIncorrectAnswer?: () => void;
}

/** Greek prefixes for molecular compounds */
const PREFIXES: Record<number, string> = {
  1: 'mónó',
  2: 'dí',
  3: 'trí',
  4: 'tetra',
  5: 'penta',
  6: 'hexa',
  7: 'hepta',
  8: 'okta',
  9: 'nóna',
  10: 'deka',
};

/** Icelandic element roots for building compound names */
const ELEMENT_ROOTS: Record<string, { root: string; full: string }> = {
  H: { root: 'vetni', full: 'Vetni' },
  C: { root: 'kol', full: 'Kolefni' },
  N: { root: 'nitur', full: 'Köfnunarefni' },
  O: { root: 'oxíð', full: 'Súrefni' },
  F: { root: 'flúoríð', full: 'Flúor' },
  Cl: { root: 'klóríð', full: 'Klór' },
  Br: { root: 'brómíð', full: 'Bróm' },
  I: { root: 'joðíð', full: 'Joð' },
  S: { root: 'brennisteinið', full: 'Brennisteinn' },
  P: { root: 'fosfór', full: 'Fosfór' },
  Na: { root: 'natríum', full: 'Natríum' },
  K: { root: 'kalíum', full: 'Kalíum' },
  Ca: { root: 'kalsíum', full: 'Kalsíum' },
  Mg: { root: 'magnesíum', full: 'Magnesíum' },
  Al: { root: 'ál', full: 'Ál' },
  Fe: { root: 'járn', full: 'Járn' },
  Cu: { root: 'kopar', full: 'Kopar' },
  Zn: { root: 'sink', full: 'Sink' },
  Ag: { root: 'silfur', full: 'Silfur' },
  Li: { root: 'litíum', full: 'Litíum' },
  Ba: { root: 'baríum', full: 'Baríum' },
  Xe: { root: 'xenon', full: 'Xenon' },
};

interface NamePart {
  id: string;
  text: string;
  type: 'prefix' | 'element' | 'suffix';
}

/** Fisher-Yates shuffle */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Generate available clickable parts plus distractors for a compound */
function generateParts(compound: Compound): NamePart[] {
  const parts: NamePart[] = [];
  let id = 0;

  // Add common prefixes (up to 4, plus any that appear in the name)
  Object.entries(PREFIXES).forEach(([num, prefix]) => {
    if (parseInt(num) <= 4 || compound.name.toLowerCase().includes(prefix)) {
      parts.push({ id: `p-${id++}`, text: prefix, type: 'prefix' });
    }
  });

  // Add element roots based on elements in the compound
  compound.elements.forEach((el) => {
    const info = ELEMENT_ROOTS[el];
    if (info) parts.push({ id: `e-${id++}`, text: info.root.toLowerCase(), type: 'element' });
  });

  // Distractors
  const distractors = ['súlfat', 'nítrat', 'karbon', 'amid'];
  distractors.slice(0, 2).forEach((d) => {
    if (!compound.name.toLowerCase().includes(d)) {
      parts.push({ id: `d-${id++}`, text: d, type: 'element' });
    }
  });

  return shuffle(parts);
}

/** Pick 10 compounds mixing different types, excluding special names */
function selectCompounds(): Compound[] {
  const pool = COMPOUNDS.filter(
    (c) =>
      c.name !== 'Vatn' &&
      c.name !== 'Ammóníak' &&
      c.name !== 'Metan' &&
      c.name !== 'Súrefni' &&
      c.name !== 'Nitur' &&
      c.name !== 'Vetni' &&
      c.name !== 'Klór' &&
      !c.name.includes('(blandað)')
  );
  return shuffle(pool).slice(0, 10);
}

/** Naming rule explanation for a compound */
function ruleFor(c: Compound): string {
  if (c.category === 'málmar-breytilega-hleðsla')
    return 'Breytileg hleðsla: Málmur(rómversk tala) + málmleysingi-íð';
  if (c.type === 'molecular') return 'Sameindaefni: Grísk forskeyti + frumefni-íð';
  return 'Jónefni: Málmur + málmleysingi-íð';
}

export function Level3({ t, onComplete, onBack, onCorrectAnswer, onIncorrectAnswer }: Level3Props) {
  const compounds = useMemo(selectCompounds, []);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<NamePart[]>([]);
  const [available, setAvailable] = useState<NamePart[]>(() => generateParts(compounds[0]));
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [rulesOpen, setRulesOpen] = useState(false);

  const compound = compounds[idx];
  const total = compounds.length;
  const maxScore = total * 10;

  const builtName = selected.map((p) => p.text).join('');
  const displayName = builtName.charAt(0).toUpperCase() + builtName.slice(1);

  const selectPart = useCallback(
    (part: NamePart) => {
      if (answered) return;
      setSelected((prev) => [...prev, part]);
      setAvailable((prev) => prev.filter((p) => p.id !== part.id));
    },
    [answered]
  );

  const removePart = useCallback(
    (part: NamePart) => {
      if (answered) return;
      setSelected((prev) => prev.filter((p) => p.id !== part.id));
      setAvailable((prev) => [...prev, part]);
    },
    [answered]
  );

  const handleCheck = useCallback(() => {
    const correct = displayName.toLowerCase() === compound.name.toLowerCase();
    setIsCorrect(correct);
    setAnswered(true);
    setAttempts((prev) => prev + 1);
    if (correct) {
      setScore((prev) => prev + Math.max(10 - attempts * 2, 5));
      onCorrectAnswer?.();
    } else {
      onIncorrectAnswer?.();
    }
  }, [displayName, compound.name, attempts, onCorrectAnswer, onIncorrectAnswer]);

  const handleReset = useCallback(() => {
    setSelected([]);
    setAvailable(generateParts(compound));
    if (answered && !isCorrect) setAnswered(false);
  }, [compound, answered, isCorrect]);

  const handleNext = useCallback(() => {
    if (idx + 1 >= total) {
      onComplete(score, maxScore, 0);
      return;
    }
    const next = idx + 1;
    setIdx(next);
    setSelected([]);
    setAvailable(generateParts(compounds[next]));
    setAnswered(false);
    setAttempts(0);
  }, [idx, total, compounds, score, maxScore, onComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white p-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-4">
          <div className="flex justify-between items-center">
            <button
              onClick={onBack}
              className="text-warm-500 hover:text-warm-700 font-semibold text-sm"
            >
              {t('common.back', 'Til baka')}
            </button>
            <h1 className="text-lg font-bold text-warm-800">
              {t('level3.ui.title', 'Byggja nöfn')}
            </h1>
            <div className="flex gap-3 text-center">
              <div>
                <div className="text-lg font-bold text-kvenno-orange">{score}</div>
                <div className="text-[10px] text-warm-500">{t('common.score', 'Stig')}</div>
              </div>
              <div>
                <div className="text-lg font-bold text-warm-700">
                  {idx + 1}/{total}
                </div>
                <div className="text-[10px] text-warm-500">{t('level3.ui.compounds', 'Efni')}</div>
              </div>
            </div>
          </div>
          <div className="mt-3 h-2 bg-warm-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-kvenno-orange transition-all duration-500"
              style={{ width: `${((idx + (answered ? 1 : 0)) / total) * 100}%` }}
            />
          </div>
        </div>

        {/* Collapsible naming rules */}
        <button
          onClick={() => setRulesOpen((prev) => !prev)}
          className="w-full bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4 text-left text-sm"
        >
          <div className="flex justify-between items-center">
            <span className="font-bold text-blue-800">
              {t('level3.ui.namingRules', 'Nafnareglur')}
            </span>
            <span className="text-blue-500">{rulesOpen ? '−' : '+'}</span>
          </div>
          {rulesOpen && (
            <ul className="mt-2 space-y-1 text-warm-700">
              <li>
                <strong>Jónefni:</strong> Málmur + málmleysingi-íð (NaCl = Natríumklóríð)
              </li>
              <li>
                <strong>Sameindaefni:</strong> Forskeyti + frumefni-íð (CO₂ = Koldíoxíð)
              </li>
              <li>
                <strong>Breytileg hleðsla:</strong> Málmur(tala) + -íð (Fe₂O₃ = Járn(III)oxíð)
              </li>
            </ul>
          )}
        </button>

        {/* Formula display */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-4">
          <div className="text-center mb-4">
            <div className="text-xs text-warm-500 mb-1">
              {t('level3.ui.formulaLabel', 'Efnaformúla:')}
            </div>
            <div className="text-4xl font-mono font-bold text-warm-800">{compound.formula}</div>
            <div className="text-xs text-warm-500 mt-1">{compound.info}</div>
          </div>

          {/* Build area */}
          <div className="mb-4">
            <div className="text-xs text-warm-600 mb-1">
              {t('level3.ui.yourName', 'Þitt nafn:')}
            </div>
            <div
              className={`min-h-14 p-3 rounded-xl border-2 border-dashed flex flex-wrap gap-2 items-center justify-center ${
                answered
                  ? isCorrect
                    ? 'border-green-400 bg-green-50'
                    : 'border-red-400 bg-red-50'
                  : 'border-kvenno-orange/40 bg-orange-50'
              }`}
            >
              {selected.length === 0 ? (
                <span className="text-warm-400 text-sm">
                  {t('level3.ui.selectParts', 'Veldu parta hér að neðan...')}
                </span>
              ) : (
                selected.map((part) => (
                  <button
                    key={part.id}
                    onClick={() => removePart(part)}
                    disabled={answered}
                    className="px-3 py-1.5 bg-kvenno-orange text-white rounded-lg text-sm font-medium hover:bg-kvenno-orange-dark transition-colors disabled:opacity-50"
                  >
                    {part.text}
                    {!answered && <span className="ml-1.5 text-orange-200">x</span>}
                  </button>
                ))
              )}
            </div>
            <div className="text-center mt-2 text-xl font-bold text-warm-800">
              {displayName || '???'}
            </div>
          </div>

          {/* Feedback */}
          {answered && (
            <div className="mb-4">
              <FeedbackPanel
                feedback={{
                  isCorrect,
                  explanation: isCorrect
                    ? `${compound.name} -- ${ruleFor(compound)}`
                    : `Rétt nafn: ${compound.name}. ${ruleFor(compound)}`,
                }}
                config={{ showExplanation: true }}
              />
            </div>
          )}

          {/* Available parts */}
          <div>
            <div className="text-xs text-warm-600 mb-1">
              {t('level3.ui.availableParts', 'Tiltækir partar:')}
            </div>
            <div className="flex flex-wrap gap-2">
              {available.map((part) => (
                <button
                  key={part.id}
                  onClick={() => selectPart(part)}
                  disabled={answered}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    part.type === 'prefix'
                      ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      : 'bg-warm-100 text-warm-700 hover:bg-warm-200'
                  }`}
                >
                  {part.text}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          {!answered ? (
            <>
              <button
                onClick={handleReset}
                className="flex-1 bg-warm-200 hover:bg-warm-300 text-warm-700 font-bold py-3 rounded-xl transition-colors"
              >
                {t('level3.ui.clear', 'Hreinsa')}
              </button>
              <button
                onClick={handleCheck}
                disabled={selected.length === 0}
                className="flex-1 bg-kvenno-orange hover:bg-kvenno-orange-dark text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('level3.ui.check', 'Athuga')}
              </button>
            </>
          ) : (
            <>
              {!isCorrect && (
                <button
                  onClick={handleReset}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 rounded-xl transition-colors"
                >
                  {t('common.retry', 'Reyna aftur')}
                </button>
              )}
              <button
                onClick={handleNext}
                className="flex-1 bg-kvenno-orange hover:bg-kvenno-orange-dark text-white font-bold py-3 rounded-xl transition-colors"
              >
                {idx + 1 < total
                  ? t('level3.ui.nextCompound', 'Næsta efni') + ' \u2192'
                  : t('level3.ui.seeResults', 'Sjá niðurstöður')}
              </button>
            </>
          )}
        </div>

        <button
          onClick={onBack}
          className="mt-4 w-full text-warm-500 hover:text-warm-700 font-semibold py-2 text-sm"
        >
          {t('level3.ui.backToMenu', 'Til baka í valmynd')}
        </button>
      </div>
    </div>
  );
}
