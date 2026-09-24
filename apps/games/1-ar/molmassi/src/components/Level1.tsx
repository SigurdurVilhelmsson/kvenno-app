import { useState } from 'react';

import { FeedbackPanel } from '@shared/components';
import { useEscapeKey } from '@shared/hooks';
import { formatDecimal, shuffleArray, parseStudentNumber } from '@shared/utils';

import { CalculationBreakdown } from './CalculationBreakdown';
import { PeriodicTable } from './PeriodicTable';
import { atomWord } from '../data/atomWords';
import { COMPOUNDS, type Compound } from '../data/compounds';
import { ELEMENTS } from '../data/elements';

/**
 * Given the student's guess, infer the most likely element-count mistake by
 * trying off-by-one perturbations on each element and reporting the closest
 * match. Returns null if no perturbation is clearly closer than the guess.
 */
export function diagnoseMistake(userValue: number, compound: Compound): string | null {
  const correct = compound.molarMass;
  const guessError = Math.abs(userValue - correct);
  let best: { atom: string; direction: 'extra' | 'missing'; residual: number } | null = null;

  for (const el of compound.elements) {
    const element = ELEMENTS.find((e) => e.symbol === el.symbol);
    if (!element) continue;
    // Student may have counted one extra of this element
    const extra = correct + element.atomicMass;
    // Student may have missed one of this element
    const missing = correct - element.atomicMass;
    const atom = atomWord(el.symbol);
    const candidates = [
      { value: extra, direction: 'extra' as const },
      { value: missing, direction: 'missing' as const },
    ];
    for (const c of candidates) {
      const residual = Math.abs(userValue - c.value);
      if (residual < guessError * 0.4 && (best === null || residual < best.residual)) {
        best = { atom, direction: c.direction, residual };
      }
    }
  }

  if (!best) return null;
  if (best.direction === 'extra') {
    return `Þú virðist hafa talið einu ${best.atom}i of mikið.`;
  }
  return `Þú virðist hafa gleymt einu ${best.atom}i.`;
}

function pickRandom<T>(arr: T[], n: number): T[] {
  return shuffleArray(arr).slice(0, n);
}

interface Level1Props {
  onBack: () => void;
  onComplete: (score: number, maxScore: number, hintsUsed: number) => void;
  onCorrectAnswer?: () => void;
  onIncorrectAnswer?: () => void;
}

/** Pick 4 easy + 4 medium + 2 hard, shuffled */
function selectProblems(): Compound[] {
  const easy = pickRandom(
    COMPOUNDS.filter((c) => c.difficulty === 'easy'),
    4
  );
  const medium = pickRandom(
    COMPOUNDS.filter((c) => c.difficulty === 'medium'),
    4
  );
  const hard = pickRandom(
    COMPOUNDS.filter((c) => c.difficulty === 'hard'),
    2
  );
  return shuffleArray([...easy, ...medium, ...hard]);
}

function getTolerance(difficulty: Compound['difficulty']): number {
  if (difficulty === 'easy') return 0.5;
  if (difficulty === 'medium') return 1.0;
  return 2.0;
}

const TOTAL = 10;

/** Shown when an answer cannot be read as a number; the example is the placeholder's. */
export const UNREADABLE_ANSWER = 'Ógilt gildi. Skrifaðu tölu, t.d. 18,02';

/**
 * Font size for the formula headline. At text-5xl the hydrates are wider than a
 * phone (Na₂CO₃·10H₂O is ~380px) and split mid-formula, so longer formulas start
 * smaller and grow back to text-5xl by sm. Exported for its test.
 */
export function formulaSizeClass(formula: string): string {
  const length = [...formula].length;
  if (length >= 10) return 'text-3xl min-[360px]:text-4xl sm:text-5xl';
  if (length >= 7) return 'text-4xl min-[360px]:text-5xl';
  return 'text-5xl';
}

export function Level1({ onBack, onComplete }: Level1Props) {
  // Teaching phase state
  const [phase, setPhase] = useState<'teach' | 'practice'>('teach');
  useEscapeKey(onBack, phase === 'teach');
  const [teachStep, setTeachStep] = useState(0);

  // Practice phase state
  const [problems, setProblems] = useState<Compound[]>(selectProblems);
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState('');
  const [correctCount, setCorrectCount] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [diagnostic, setDiagnostic] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showPeriodicTable, setShowPeriodicTable] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const compound = problems[index];

  const handleSubmit = () => {
    const value = parseStudentNumber(input);
    if (isNaN(value)) {
      // Say so, as Stig 2 and 3 do. Returning silently left a student who
      // typed `≈ 18` tapping Athuga with nothing happening at all.
      setError(UNREADABLE_ANSWER);
      return;
    }
    setError('');
    const tolerance = getTolerance(compound.difficulty);
    const correct = Math.abs(value - compound.molarMass) <= tolerance;
    setIsCorrect(correct);
    setDiagnostic(correct ? null : diagnoseMistake(value, compound));
    if (correct) setCorrectCount((prev) => prev + 1);
    setAnswered(true);
  };

  const handleNext = () => {
    if (index + 1 >= TOTAL) {
      setDone(true);
      return;
    }
    setIndex((prev) => prev + 1);
    setInput('');
    setError('');
    setAnswered(false);
    setIsCorrect(false);
    setDiagnostic(null);
    setShowHint(false);
  };

  const handleRetry = () => {
    setProblems(selectProblems());
    setIndex(0);
    setInput('');
    setError('');
    setCorrectCount(0);
    setHintsUsed(0);
    setAnswered(false);
    setIsCorrect(false);
    setShowHint(false);
    setDone(false);
  };

  // ==================== TEACHING PHASE ====================
  if (phase === 'teach') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-xl shadow-md p-4 mb-4">
            <div className="flex flex-wrap sm:flex-nowrap justify-between items-center">
              <button
                onClick={onBack}
                className="text-warm-500 hover:text-warm-700 font-semibold text-sm whitespace-nowrap pointer-coarse:py-3 pointer-coarse:-my-3"
              >
                ← Til baka
              </button>
              <h1 className="order-last basis-full mt-1 sm:order-none sm:basis-auto sm:mt-0 text-lg font-bold text-warm-800">
                Mólmassi — Hvernig reikna?
              </h1>
              <span className="text-sm text-warm-500">Kennsla</span>
            </div>
          </div>

          {/* Step 0: What is molar mass? */}
          {teachStep === 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6 space-y-4 animate-fade-in-up">
              <h2 className="text-xl font-bold text-warm-800">Hvað er mólmassi?</h2>
              <p className="text-warm-700">
                <strong>Mólmassi (M)</strong> er massi eins móls af efni, mældur í g/mól. Hann segir
                okkur hversu þungar 6,022 × 10²³ eindir (atóm eða sameindir) eru.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-blue-800 font-mono text-center text-lg">
                  M = Σ (fjöldi atóma × atómmassi)
                </p>
                <p className="text-sm text-blue-600 text-center mt-1">
                  Leggðu saman massa allra atóma í formúlunni
                </p>
              </div>
              <p className="text-warm-600 text-sm">
                Til dæmis: Vatn (H₂O) hefur 2 vetnisatóm og 1 súrefnisatóm. Mólmassi vatns er massi
                þessara atóma samanlagður.
              </p>
              <button
                onClick={() => setTeachStep(1)}
                className="w-full bg-kvenno-orange hover:bg-kvenno-orange-dark text-white font-bold py-3 rounded-xl transition-colors"
              >
                Sjáum dæmi →
              </button>
            </div>
          )}

          {/* Step 1: Walkthrough with H₂O */}
          {teachStep === 1 && (
            <div className="bg-white rounded-xl shadow-lg p-6 space-y-4 animate-fade-in-up">
              <h2 className="text-xl font-bold text-warm-800">Dæmi: H₂O (Vatn)</h2>
              <p className="text-warm-700">Reiknum mólmassa vatns skref fyrir skref:</p>

              <div className="bg-warm-50 p-4 rounded-lg space-y-3">
                <div>
                  <p className="font-semibold text-warm-800">Skref 1: Teldu atómin</p>
                  <p className="text-warm-600 ml-4">
                    H₂O hefur <strong>2 H</strong> og <strong>1 O</strong>
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-warm-800">Skref 2: Flettu upp atómmassa</p>
                  <p className="text-warm-600 ml-4">
                    <span className="whitespace-nowrap">H ≈ 1,008 g/mól</span> &bull;{' '}
                    <span className="whitespace-nowrap">O ≈ 16,00 g/mól</span>
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-warm-800">
                    Skref 3: Margfaldaðu og leggðu saman
                  </p>
                  <div className="ml-4 font-mono text-warm-700 space-y-1">
                    <p>
                      H: 2 × 1,008 <span className="whitespace-nowrap">= 2,016 g/mól</span>
                    </p>
                    <p>
                      O: 1 × 16,00 <span className="whitespace-nowrap">= 16,00 g/mól</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border-2 border-green-300 p-4 rounded-lg text-center">
                <p className="text-sm text-green-700 font-semibold">Heildarmólmassi:</p>
                {/* The sum of the two terms shown, to the fewest decimals among
                    them, as the CO₂ example below does. It said 18,015 — the
                    total with O at 15,999, not the 16,00 this screen uses. */}
                <p className="text-2xl font-bold text-green-800">
                  2,016 + 16,00 = <span className="text-3xl">18,02 g/mól</span>
                </p>
              </div>

              <button
                onClick={() => setTeachStep(2)}
                className="w-full bg-kvenno-orange hover:bg-kvenno-orange-dark text-white font-bold py-3 rounded-xl transition-colors"
              >
                Eitt dæmi til →
              </button>
            </div>
          )}

          {/* Step 2: Second example — CO₂ */}
          {teachStep === 2 && (
            <div className="bg-white rounded-xl shadow-lg p-6 space-y-4 animate-fade-in-up">
              <h2 className="text-xl font-bold text-warm-800">Dæmi: CO₂ (Koldíoxíð)</h2>
              <p className="text-warm-700">
                Nú geturðu reynt sjálf/ur. CO₂ hefur 1 kolefnisatóm og 2 súrefnisatóm.
              </p>

              <div className="bg-warm-50 p-4 rounded-lg space-y-3">
                <div>
                  <p className="font-semibold text-warm-800">Skref 1: Teldu atómin</p>
                  <p className="text-warm-600 ml-4">
                    <strong>1 C</strong> og <strong>2 O</strong>
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-warm-800">Skref 2: Atómmassi</p>
                  <p className="text-warm-600 ml-4">
                    <span className="whitespace-nowrap">C ≈ 12,01 g/mól</span> &bull;{' '}
                    <span className="whitespace-nowrap">O ≈ 16,00 g/mól</span>
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-warm-800">Skref 3: Reiknaðu</p>
                  <div className="ml-4 font-mono text-warm-700 space-y-1">
                    <p>
                      C: 1 × 12,01 <span className="whitespace-nowrap">= 12,01 g/mól</span>
                    </p>
                    <p>
                      O: 2 × 16,00 <span className="whitespace-nowrap">= 32,00 g/mól</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border-2 border-green-300 p-4 rounded-lg text-center">
                <p className="text-sm text-green-700 font-semibold">Heildarmólmassi:</p>
                <p className="text-2xl font-bold text-green-800">
                  12,01 + 32,00 = <span className="text-3xl">44,01 g/mól</span>
                </p>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
                <strong>Aðferðin er alltaf sú sama:</strong> Telja → fletta upp → margfalda → leggja
                saman.
              </div>

              <button
                onClick={() => setPhase('practice')}
                className="w-full bg-kvenno-orange hover:bg-kvenno-orange-dark text-white font-bold px-4 py-3 rounded-xl transition-colors"
              >
                Ég er tilbúin/n — byrja æfingar →
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==================== SUMMARY SCREEN ====================
  if (done) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center space-y-6">
          <h2 className="text-2xl font-bold text-warm-800">Niðurstöður</h2>
          <p className="text-lg text-warm-700">
            Þú svaraðir <span className="font-bold text-kvenno-orange">{correctCount}</span> af{' '}
            <span className="font-bold">{TOTAL}</span> rétt
          </p>
          <div className="h-3 bg-warm-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-kvenno-orange transition-all duration-700"
              style={{ width: `${(correctCount / TOTAL) * 100}%` }}
            />
          </div>
          <div className="flex flex-col min-[360px]:flex-row gap-3">
            <button
              onClick={handleRetry}
              className="flex-1 bg-warm-200 hover:bg-warm-300 text-warm-800 font-bold py-3 rounded-xl transition-colors"
            >
              Reyna aftur
            </button>
            <button
              onClick={() => onComplete(correctCount, TOTAL, hintsUsed)}
              className="flex-1 bg-kvenno-orange hover:bg-kvenno-orange-dark text-white font-bold py-3 rounded-xl transition-colors"
            >
              Ljúka stigi
            </button>
          </div>
          <button
            onClick={onBack}
            className="text-warm-500 hover:text-warm-700 text-sm pointer-coarse:py-3 pointer-coarse:-my-3"
          >
            Til baka í valmynd
          </button>
        </div>
      </div>
    );
  }

  // ==================== PRACTICE PHASE ====================
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-4">
          <div className="flex flex-wrap sm:flex-nowrap justify-between items-center">
            <button
              onClick={onBack}
              className="text-warm-500 hover:text-warm-700 font-semibold text-sm whitespace-nowrap pointer-coarse:py-3 pointer-coarse:-my-3"
            >
              ← Til baka
            </button>
            <h1 className="order-last basis-full mt-1 sm:order-none sm:basis-auto sm:mt-0 text-lg font-bold text-warm-800">
              Mólmassi – Stig 1
            </h1>
            <span className="text-sm font-semibold text-warm-600">
              {index + 1}/{TOTAL}
            </span>
          </div>
          <div className="mt-3 h-2 bg-warm-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-kvenno-orange transition-all duration-500"
              style={{ width: `${((index + 1) / TOTAL) * 100}%` }}
            />
          </div>
        </div>

        {/* Method reminder */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4 text-sm text-blue-800">
          <strong>Aðferð:</strong> Telja atóm → fletta upp atómmassa → margfalda → leggja saman
        </div>

        {/* Compound card */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4 text-center" key={index}>
          <p className="text-sm text-warm-500 mb-1">Reiknaðu mólmassa:</p>
          <div className={`${formulaSizeClass(compound.formula)} font-bold text-warm-800 mb-2`}>
            {compound.formula}
          </div>
          <p className="text-warm-600">{compound.name}</p>
          <span
            className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${
              compound.difficulty === 'easy'
                ? 'bg-green-100 text-green-700'
                : compound.difficulty === 'medium'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-red-100 text-red-700'
            }`}
          >
            {compound.difficulty === 'easy'
              ? 'Auðvelt'
              : compound.difficulty === 'medium'
                ? 'Miðlungs'
                : 'Erfitt'}{' '}
            (±{formatDecimal(getTolerance(compound.difficulty))} g/mól)
          </span>
        </div>

        {/* Input area */}
        {!answered && (
          <div className="bg-white rounded-xl shadow-md p-4 mb-4">
            <label className="block text-sm font-medium text-warm-700 mb-2">Svar (g/mól):</label>
            <div className="flex gap-3">
              <input
                type="text"
                inputMode="decimal"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setError('');
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="t.d. 18,02"
                autoComplete="off"
                aria-invalid={error ? true : undefined}
                className={`flex-1 px-4 py-3 border-2 ${error ? 'border-red-400' : 'border-warm-300 focus:border-kvenno-orange'} rounded-xl focus:outline-none text-lg font-mono`}
                autoFocus
              />
              <button
                onClick={handleSubmit}
                disabled={!input.trim()}
                className="bg-kvenno-orange hover:bg-kvenno-orange-dark disabled:opacity-40 text-white font-bold px-6 py-3 rounded-xl transition-colors"
              >
                Athuga
              </button>
            </div>
            {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
          </div>
        )}

        {/* Toolbar: periodic table + hint */}
        {!answered && (
          <div className="flex gap-3 mb-4">
            <button
              onClick={() => setShowPeriodicTable(true)}
              className="flex-1 px-4 py-2.5 pointer-coarse:min-h-11 rounded-xl text-sm font-semibold bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors"
            >
              Lotukerfið
            </button>
            {!showHint && (
              <button
                onClick={() => {
                  setShowHint(true);
                  setHintsUsed((prev) => prev + 1);
                }}
                className="flex-1 px-4 py-2.5 pointer-coarse:min-h-11 rounded-xl text-sm font-semibold bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition-colors"
              >
                Vísbending
              </button>
            )}
          </div>
        )}

        {/* Hint */}
        {showHint && !answered && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-4 text-sm text-yellow-800">
            <span className="font-bold">Vísbending:</span> Algengir atómmassar – H≈1, C≈12, N≈14,
            O≈16, Na≈23, S≈32, Cl≈35,5, K≈39, Ca≈40
          </div>
        )}

        {/* Feedback + breakdown */}
        {answered && (
          <div className="space-y-4 mb-4">
            <FeedbackPanel
              feedback={{
                isCorrect,
                explanation: isCorrect
                  ? `Rétt! Mólmassi ${compound.nameGenitive} er ${formatDecimal(compound.molarMass, 3)} g/mól.`
                  : `Rangt. Rétt svar er ${formatDecimal(compound.molarMass, 3)} g/mól. Sjáðu útreikninginn hér að neðan.`,
              }}
              config={{ showExplanation: true }}
            />

            {diagnostic && !isCorrect && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                <span className="font-bold">Líklegast voru mistökin: </span>
                {diagnostic}
              </div>
            )}

            <CalculationBreakdown compound={compound} />

            <button
              onClick={handleNext}
              className="w-full bg-kvenno-orange hover:bg-kvenno-orange-dark text-white font-bold py-3 rounded-xl transition-colors"
            >
              {index + 1 < TOTAL ? 'Næsta dæmi →' : 'Sjá niðurstöður →'}
            </button>
          </div>
        )}
      </div>

      {/* Periodic table modal */}
      {showPeriodicTable && (
        <PeriodicTable
          onClose={() => setShowPeriodicTable(false)}
          showApproximate={true}
          highlightElements={compound.elements.map((e) => e.symbol)}
        />
      )}
    </div>
  );
}

export default Level1;
