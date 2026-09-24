import { useEffect, useMemo, useRef, useState } from 'react';

import { Header, LanguageSwitcher } from '@shared/components';
import { useGameI18n } from '@shared/hooks';
import {
  isPhone,
  revealSpan,
  shuffleArray,
  useArmedAfter,
  useItemTop,
  useRevealAfterCommit,
  useScreenTop,
} from '@shared/utils';

import { puzzles } from '../data/quantum-numbers';
import { gameTranslations } from '../i18n';
import { formatQuantum } from '../utils/electrons';
import { ITEM_START } from '../utils/itemStart';

interface Level1Props {
  onComplete: (score: number) => void;
  onBack: () => void;
}

export function Level1({ onComplete, onBack }: Level1Props) {
  const { language, setLanguage } = useGameI18n({ gameTranslations });
  const [phase, setPhase] = useState<'teach' | 'practice'>('teach');
  const [teachStep, setTeachStep] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const puzzle = puzzles[currentIndex];
  const isLast = currentIndex >= puzzles.length - 1;

  // The data lists every valid combination before every invalid one, so in data
  // order "tick the top two or three" passed all eight questions. Shuffle once
  // per question (keyed on `puzzle`, so the order holds while the student reads
  // it). `selected` holds positions in this shuffled list, so grading and the
  // verdict below read it too, never `puzzle.options`.
  const displayedOptions = useMemo(() => shuffleArray(puzzle.options), [puzzle]);
  const allRight = displayedOptions.every((opt, idx) => opt.isValid === selected.has(idx));

  const feedbackRef = useRef<HTMLDivElement>(null);
  const verdictRef = useRef<HTMLDivElement>(null);
  const questionRef = useRef<HTMLHeadingElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  // A new screen (a teaching step, or the exercises) starts at the top of the
  // page at every width, as it always has, and its heading takes focus.
  useScreenTop(`${phase}:${teachStep}`, { anyWidth: true, focus: ITEM_START });
  // The next question starts at the top of the page too: the browser keeps the
  // old scroll offset, and on a phone that lands a student below the new
  // question's n value. `always` + `gap: 0` on the page's own wrapper, which
  // sits directly under the sticky header, is exactly the old scroll to the top
  // at every width; focus moves to the new question's n value.
  const pageRef = useItemTop<HTMLDivElement>(currentIndex, {
    anyWidth: true,
    always: true,
    instant: true,
    gap: 0,
  });

  // After Athuga the verdict is drawn below the option cards. On a desktop it
  // is brought into view only where it is below the fold, exactly as before
  // (`scrollIntoView({ block: 'nearest' })` with the block's 16 px bottom
  // margin). On a phone the shared reveal shows as much as fits from the
  // question down to Næsta, and at every width focus moves to the verdict, not
  // to Næsta, so a second Enter lands on nothing (design P3).
  useEffect(() => {
    if (submitted && !isPhone()) revealSpan(feedbackRef.current, [], { anyWidth: true, gap: 16 });
  }, [submitted]);
  useRevealAfterCommit(submitted, () => {
    const firstChosen = [...selected].sort((a, b) => a - b)[0];
    return {
      bottom: nextRef.current,
      tops: [
        questionRef.current,
        firstChosen === undefined ? null : (optionsRef.current?.children[firstChosen] ?? null),
        verdictRef.current,
      ],
      focus: verdictRef.current,
    };
  });
  // A double tap on Athuga must not land on Næsta a moment later.
  const armed = useArmedAfter(400, `${currentIndex}:${submitted}`);

  const handleToggle = (idx: number) => {
    if (submitted) return;
    const next = new Set(selected);
    if (next.has(idx)) next.delete(idx);
    else next.add(idx);
    setSelected(next);
  };

  const handleSubmit = () => {
    if (submitted || selected.size === 0) return;
    setSubmitted(true);

    // Every valid option ticked and every invalid one left alone.
    if (allRight) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (isLast) {
      onComplete(score);
      return;
    }
    setCurrentIndex((i) => i + 1);
    setSelected(new Set());
    setSubmitted(false);
  };

  // ==================== TEACHING PHASE ====================
  if (phase === 'teach') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100">
        <Header
          variant="game"
          backHref="/efnafraedi/2-ar/"
          gameTitle="Skammtatölur — Kennsla"
          authSlot={
            <LanguageSwitcher
              language={language}
              onLanguageChange={setLanguage}
              variant="compact"
            />
          }
        />
        <div className="max-w-lg mx-auto p-4 md:p-8 phone:px-3 phone:py-2">
          <div className="flex justify-between items-center mb-4 phone:mb-2">
            <button
              onClick={onBack}
              className="text-warm-600 hover:text-warm-800 pointer-coarse:py-2.5 pointer-coarse:-my-2.5"
            >
              ← Til baka
            </button>
            <span className="text-sm text-warm-500">Kennsla {teachStep + 1}/3</span>
          </div>

          {teachStep === 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 space-y-4 phone:p-3 phone:space-y-3 animate-slide-in">
              <h2 className="text-xl font-bold text-warm-800">Hvað eru skammtatölur?</h2>
              <p className="text-warm-700">
                Hver rafeind í atómi hefur fjórar <strong>skammtatölur</strong> sem lýsa stöðu
                hennar og hegðun. Saman virka þær eins og „heimilisfang" rafeindarinnar.
              </p>
              <div className="space-y-3">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <strong className="text-blue-800">n</strong>{' '}
                  <span className="text-blue-600">(aðalskammtatala)</span>
                  <p className="text-sm text-blue-700 mt-1">
                    Ákvarðar hvolfið / orkustigið. n = 1, 2, 3, ...
                  </p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <strong className="text-green-800">l</strong>{' '}
                  <span className="text-green-600">(hliðarskammtatala)</span>
                  <p className="text-sm text-green-700 mt-1">
                    Ákvarðar lögun svigrúmsins. l = 0 til n−1
                  </p>
                  <p className="text-xs text-green-600 mt-1">l=0 → s, l=1 → p, l=2 → d, l=3 → f</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <strong className="text-purple-800">mₗ</strong>{' '}
                  <span className="text-purple-600">(segulskammtatala)</span>
                  <p className="text-sm text-purple-700 mt-1">
                    Stefna svigrúmsins í rúminu. mₗ = −l til +l
                  </p>
                </div>
                <div className="bg-amber-50 p-3 rounded-lg">
                  <strong className="text-amber-800">mₛ</strong>{' '}
                  <span className="text-amber-600">(spunaskammtatala)</span>
                  <p className="text-sm text-amber-700 mt-1">
                    Spuni rafeindarinnar. mₛ = +½ eða −½
                  </p>
                </div>
              </div>
              <button
                onClick={() => setTeachStep(1)}
                className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 rounded-xl transition-colors"
              >
                Sjáum dæmi →
              </button>
            </div>
          )}

          {teachStep === 1 && (
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 space-y-4 phone:p-3 phone:space-y-3 animate-slide-in">
              <h2 className="text-xl font-bold text-warm-800">Dæmi: n = 2</h2>
              <p className="text-warm-700">Hvaða gildi eru leyfileg þegar n = 2?</p>

              <div className="bg-warm-50 p-4 rounded-lg space-y-3">
                <div>
                  <p className="font-semibold text-warm-800">l getur verið 0 eða 1</p>
                  <p className="text-sm text-warm-600 ml-4">Reglan: l = 0 til n−1, þ.e. 0 til 1</p>
                  <p className="text-sm text-warm-600 ml-4">
                    l=0 → 2s svigrúm &bull; l=1 → 2p svigrúm
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-warm-800">Fyrir l = 1 (2p): mₗ = −1, 0, +1</p>
                  <p className="text-sm text-warm-600 ml-4">
                    Þrjár stefnur → þrjú 2p svigrúm (2px, 2py, 2pz)
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-warm-800">mₛ = +½ eða −½ alltaf</p>
                  <p className="text-sm text-warm-600 ml-4">
                    Tvær rafeindir í hverju svigrúmi (gagnstæður spuni)
                  </p>
                </div>
              </div>

              <div className="bg-red-50 border-2 border-red-200 p-3 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>Ógilt:</strong> l = 2 þegar n = 2 — l getur aldrei verið jafn eða stærri
                  en n!
                </p>
              </div>

              <button
                onClick={() => setTeachStep(2)}
                className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 rounded-xl transition-colors"
              >
                Eitt dæmi til →
              </button>
            </div>
          )}

          {teachStep === 2 && (
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 space-y-4 phone:p-3 phone:space-y-3 animate-slide-in">
              <h2 className="text-xl font-bold text-warm-800">Dæmi: n = 3</h2>

              <div className="bg-warm-50 p-4 rounded-lg space-y-2">
                <p className="text-sm text-warm-700">
                  <strong>l</strong> getur verið 0, 1, eða 2 → 3s, 3p, 3d svigrúm
                </p>
                <p className="text-sm text-warm-700">
                  <strong>Fyrir l = 2 (3d):</strong> mₗ = −2, −1, 0, +1, +2 → fimm svigrúm
                </p>
                <p className="text-sm text-warm-700">
                  <strong>Samtals:</strong> 1 + 3 + 5 = 9 svigrúm, allt að 18 rafeindir
                </p>
              </div>

              <div className="bg-teal-50 p-4 rounded-lg">
                <h3 className="font-bold text-teal-800 mb-2">Reglurnar í stuttu máli</h3>
                <div className="text-sm text-teal-700 space-y-1 font-mono">
                  <p>l: 0 til n−1 (aldrei ≥ n)</p>
                  <p>mₗ: −l til +l</p>
                  <p>mₛ: +½ eða −½ (alltaf)</p>
                </div>
              </div>

              <button
                onClick={() => setPhase('practice')}
                className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 rounded-xl transition-colors"
              >
                Ég er tilbúin/n — byrja æfingar →
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==================== PRACTICE PHASE ====================
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100">
      <Header
        variant="game"
        backHref="/efnafraedi/2-ar/"
        gameTitle="Skammtatölur"
        authSlot={
          <LanguageSwitcher language={language} onLanguageChange={setLanguage} variant="compact" />
        }
      />

      <div ref={pageRef} className="max-w-3xl mx-auto p-4 md:p-8 phone:px-3 phone:py-2">
        {/* Progress */}
        <div className="flex justify-between items-center gap-3 mb-4 phone:mb-2">
          <button
            onClick={onBack}
            className="text-warm-600 hover:text-warm-800 pointer-coarse:py-2.5 pointer-coarse:-my-2.5"
          >
            ← Til baka
          </button>
          <div className="text-sm text-warm-600 text-right">
            Spurning {currentIndex + 1} / {puzzles.length} &bull; Stig: {score}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 phone:p-3 animate-slide-in">
          {/* Quantum number display. It stays on a phone, only smaller: it is the
              only place n appears in the question. */}
          <div data-item-start className="text-center mb-6 phone:mb-2 phone-land:mb-1">
            <div className="inline-block bg-teal-100 px-6 py-3 rounded-xl phone:px-4 phone:py-1">
              <span className="text-3xl font-bold text-teal-800 phone:text-2xl">
                n = {puzzle.n}
              </span>
            </div>
          </div>

          <h2
            ref={questionRef}
            className="text-lg font-semibold text-warm-800 mb-4 text-center phone:text-base phone:mb-2 phone-land:mb-1"
          >
            {language === 'is' ? puzzle.description_is : puzzle.description_en}
          </h2>

          {/* Rules reminder */}
          <div className="bg-blue-50 p-3 rounded-lg mb-6 text-sm text-blue-800 phone:p-2 phone:mb-3 phone-land:mb-2">
            <strong>Reglur:</strong> l: 0 til n-1 &bull; mₗ: -l til +l &bull; mₛ: +½ eða -½
          </div>

          {/* Options */}
          <div
            ref={optionsRef}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 phone:gap-2 phone:mb-3 phone-land:grid-cols-3"
          >
            {displayedOptions.map((opt, idx) => {
              const isSelected = selected.has(idx);
              let className = 'quantum-card';
              if (isSelected && !submitted) className += ' selected';
              if (submitted) {
                if (opt.isValid) className += ' correct';
                else if (isSelected) className += ' incorrect';
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleToggle(idx)}
                  className={className}
                  disabled={submitted}
                  aria-pressed={isSelected}
                >
                  <div className="font-mono text-lg text-center phone:text-base phone-land:text-sm">
                    <span className="whitespace-nowrap">l = {opt.l},</span>{' '}
                    <span className="whitespace-nowrap">mₗ = {formatQuantum(opt.ml)},</span>{' '}
                    <span className="whitespace-nowrap">
                      mₛ = {formatQuantum(opt.ms, { signed: true })}
                    </span>
                  </div>
                  {submitted && (
                    <div className="text-center mt-2 text-sm phone:mt-1">
                      {opt.isValid ? '✓ Gilt' : '✗ Ógilt'}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Submit / Next. Athuga and Næsta are separate elements (keyed), never
              one button relabelled, and Næsta ignores a press within 400 ms of
              appearing. */}
          {!submitted ? (
            <button
              key="check"
              onClick={handleSubmit}
              disabled={selected.size === 0}
              className="game-btn w-full py-3 rounded-xl font-bold text-white bg-teal-500 hover:bg-teal-600 disabled:bg-warm-300 disabled:cursor-not-allowed transition-colors"
            >
              Athuga svar
            </button>
          ) : (
            <div key="feedback" ref={feedbackRef} className="scroll-mb-4">
              {/* The feedback region focus moves to after Athuga (P3), named by its
                  verdict. */}
              <div
                ref={verdictRef}
                role="group"
                tabIndex={-1}
                aria-labelledby="rafeind-l1-verdict"
                className={`p-4 rounded-xl mb-2 phone:p-3 focus:outline-none ${
                  allRight
                    ? 'bg-green-50 border-2 border-green-300'
                    : 'bg-red-50 border-2 border-red-300'
                }`}
              >
                <div id="rafeind-l1-verdict" className="text-lg font-bold mb-2 phone:mb-1">
                  {allRight ? '✅ Rétt!' : '❌ Ekki rétt'}
                </div>
                <p className="text-sm text-warm-700">
                  {language === 'is' ? puzzle.explanation_is : puzzle.explanation_en}
                </p>
              </div>
              <button
                ref={nextRef}
                onClick={armed(handleNext)}
                className="game-btn w-full mt-4 py-3 rounded-xl font-bold text-white bg-teal-500 hover:bg-teal-600 transition-colors phone:mt-2"
              >
                {isLast ? 'Ljúka stigi' : 'Næsta spurning →'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
