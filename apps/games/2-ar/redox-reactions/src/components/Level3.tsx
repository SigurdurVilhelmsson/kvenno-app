import { useState } from 'react';

import { useEscapeKey } from '@shared/hooks';

import { L3_SCORING } from '../config/scoring';
import { problems } from '../data/half-reactions';

interface Level3Props {
  t: (key: string, fallback?: string) => string;
  onComplete: (score: number) => void;
  onBack: () => void;
}

type Step = 'identify' | 'write-ox' | 'write-red' | 'balance' | 'complete';

export function Level3({ t, onComplete, onBack }: Level3Props) {
  const [showIntro, setShowIntro] = useState(true);
  useEscapeKey(onBack, showIntro);
  const [currentProblem, setCurrentProblem] = useState(0);
  const [step, setStep] = useState<Step>('identify');
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [answers, setAnswers] = useState({
    oxidized: '',
    reduced: '',
    oxElectrons: '',
    redElectrons: '',
    oxMultiplier: '',
    redMultiplier: '',
  });
  const [feedback, setFeedback] = useState<{ show: boolean; correct: boolean; message: string }>({
    show: false,
    correct: false,
    message: '',
  });
  const [, setTotalHintsUsed] = useState(0);

  const problem = problems[currentProblem];

  const checkIdentify = () => {
    const oxCorrect =
      answers.oxidized.toLowerCase() ===
      problem.oxidationHalf.species.toLowerCase().replace(/[⁺⁻²³⁴₂]/g, '');
    const redCorrect =
      answers.reduced.toLowerCase() ===
      problem.reductionHalf.species.toLowerCase().replace(/[⁺⁻²³⁴₂]/g, '');

    if (oxCorrect && redCorrect) {
      setScore((prev) => prev + L3_SCORING.IDENTIFY);
      setFeedback({
        show: true,
        correct: true,
        message: t('level3.identifyCorrect', 'Rétt! Þú greindir hvað oxast og afoxast.'),
      });
    } else {
      setFeedback({
        show: true,
        correct: false,
        message: `${problem.oxidationHalf.speciesDisplay} ${t('level3.oxidizes', 'oxast')} (${t('level3.losesElectrons', 'gefur e⁻')}), ${problem.reductionHalf.speciesDisplay} ${t('level3.reduces', 'afoxast')} (${t('level3.gainsElectrons', 'tekur e⁻')}).`,
      });
    }
  };

  const checkMultipliers = () => {
    const oxM = parseInt(answers.oxMultiplier);
    const redM = parseInt(answers.redMultiplier);

    if (oxM === problem.multiplierOx && redM === problem.multiplierRed) {
      setScore((prev) => prev + L3_SCORING.BALANCE);
      setFeedback({
        show: true,
        correct: true,
        message: t('level3.balanceCorrect', 'Frábært! Þú jafnaðir rafeindirnar rétt.'),
      });
    } else {
      setFeedback({
        show: true,
        correct: false,
        message: `${t('level3.toBalance', 'Til að jafna')} ${problem.oxidationHalf.electrons}e⁻ ${t('level3.and', 'og')} ${problem.reductionHalf.electrons}e⁻, ${t('level3.needMultipliers', 'þarftu margfaldara')} ${problem.multiplierOx} ${t('level3.and', 'og')} ${problem.multiplierRed}.`,
      });
    }
  };

  const checkOxElectrons = () => {
    if (feedback.show || !answers.oxElectrons) return;
    const correct = parseInt(answers.oxElectrons) === problem.oxidationHalf.electrons;
    if (correct) {
      setScore((prev) => prev + L3_SCORING.OXIDATION_HALF);
      setFeedback({ show: true, correct: true, message: t('common.correct', 'Rétt!') });
    } else {
      setFeedback({
        show: true,
        correct: false,
        message: `${problem.oxidationHalf.speciesDisplay} → ${problem.oxidationHalf.productDisplay} + ${problem.oxidationHalf.electrons}e⁻`,
      });
    }
  };

  const checkRedElectrons = () => {
    if (feedback.show || !answers.redElectrons) return;
    const correct = parseInt(answers.redElectrons) === problem.reductionHalf.electrons;
    if (correct) {
      setScore((prev) => prev + L3_SCORING.REDUCTION_HALF);
      setFeedback({ show: true, correct: true, message: t('common.correct', 'Rétt!') });
    } else {
      setFeedback({
        show: true,
        correct: false,
        message: `${problem.reductionHalf.speciesDisplay} + ${problem.reductionHalf.electrons}e⁻ → ${problem.reductionHalf.productDisplay}`,
      });
    }
  };

  const handleNext = () => {
    setFeedback({ show: false, correct: false, message: '' });
    setShowHint(false);

    if (step === 'identify') {
      setStep('write-ox');
    } else if (step === 'write-ox') {
      setStep('write-red');
    } else if (step === 'write-red') {
      setStep('balance');
    } else if (step === 'balance') {
      setStep('complete');
    } else if (step === 'complete') {
      if (currentProblem < problems.length - 1) {
        setCurrentProblem((prev) => prev + 1);
        setStep('identify');
        setAnswers({
          oxidized: '',
          reduced: '',
          oxElectrons: '',
          redElectrons: '',
          oxMultiplier: '',
          redMultiplier: '',
        });
      } else {
        onComplete(score);
      }
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'identify':
        return (
          <div className="space-y-4">
            <div className="bg-purple-50 p-4 rounded-xl">
              <h3 className="font-bold text-purple-800 mb-2">
                {t('level3.step1Title', 'Skref 1: Greindu hvað oxast og afoxast')}
              </h3>
              <p className="text-purple-600 text-sm">
                {t('level3.step1Hint', 'Mundu: Oxun = tapar e⁻, Afoxun = öðlast e⁻')}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-sm font-medium text-warm-700 mb-1"
                  htmlFor="oxidized-input"
                >
                  {t('level3.whatOxidizes', 'Hvað oxast?')}
                </label>
                <input
                  id="oxidized-input"
                  type="text"
                  value={answers.oxidized}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, oxidized: e.target.value }))}
                  onKeyDown={(e) => {
                    if (
                      e.key === 'Enter' &&
                      answers.oxidized &&
                      answers.reduced &&
                      !feedback.show
                    ) {
                      checkIdentify();
                    }
                  }}
                  placeholder={t('level3.examplePlaceholder', 't.d. Zn')}
                  className="w-full p-3 border-2 border-blue-300 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium text-warm-700 mb-1"
                  htmlFor="reduced-input"
                >
                  {t('level3.whatReduces', 'Hvað afoxast?')}
                </label>
                <input
                  id="reduced-input"
                  type="text"
                  value={answers.reduced}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, reduced: e.target.value }))}
                  onKeyDown={(e) => {
                    if (
                      e.key === 'Enter' &&
                      answers.oxidized &&
                      answers.reduced &&
                      !feedback.show
                    ) {
                      checkIdentify();
                    }
                  }}
                  placeholder={t('level3.examplePlaceholder', 't.d. Zn')}
                  className="w-full p-3 border-2 border-red-300 rounded-xl focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>

            {!feedback.show && (
              <button
                onClick={checkIdentify}
                disabled={!answers.oxidized || !answers.reduced}
                className={`w-full font-bold py-3 px-6 rounded-xl ${
                  !answers.oxidized || !answers.reduced
                    ? 'bg-warm-200 text-warm-400 cursor-not-allowed'
                    : 'bg-purple-500 hover:bg-purple-600 text-white'
                }`}
              >
                {t('common.submit', 'Athuga svar')}
              </button>
            )}
          </div>
        );

      case 'write-ox':
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-xl">
              <h3 className="font-bold text-blue-800 mb-2">
                {t('level3.step2Title', 'Skref 2: Oxunar hálf-hvarf')}
              </h3>
              <div className="text-blue-600">
                {problem.oxidationHalf.speciesDisplay} → {problem.oxidationHalf.productDisplay} +
                ?e⁻
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-warm-700 mb-1">
                {t('level3.howManyElectronsLost', 'Hversu margar rafeindir tapar')}{' '}
                {problem.oxidationHalf.speciesDisplay}?
              </label>
              <input
                type="number"
                value={answers.oxElectrons}
                onChange={(e) => setAnswers((prev) => ({ ...prev, oxElectrons: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') checkOxElectrons();
                }}
                placeholder={t('level3.electronCount', 'Fjöldi rafeinda')}
                className="w-full p-3 border-2 border-blue-300 rounded-xl focus:border-blue-500 focus:outline-none"
              />
            </div>

            {!feedback.show && (
              <button
                onClick={checkOxElectrons}
                disabled={!answers.oxElectrons}
                className={`w-full font-bold py-3 px-6 rounded-xl ${
                  !answers.oxElectrons
                    ? 'bg-warm-200 text-warm-400 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {t('common.submit', 'Athuga')}
              </button>
            )}
          </div>
        );

      case 'write-red':
        return (
          <div className="space-y-4">
            <div className="bg-red-50 p-4 rounded-xl">
              <h3 className="font-bold text-red-800 mb-2">
                {t('level3.step3Title', 'Skref 3: Afoxunar hálf-hvarf')}
              </h3>
              <div className="text-red-600">
                {problem.reductionHalf.speciesDisplay} + ?e⁻ →{' '}
                {problem.reductionHalf.productDisplay}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-warm-700 mb-1">
                {t('level3.howManyElectronsGained', 'Hversu margar rafeindir öðlast')}{' '}
                {problem.reductionHalf.speciesDisplay}?
              </label>
              <input
                type="number"
                value={answers.redElectrons}
                onChange={(e) => setAnswers((prev) => ({ ...prev, redElectrons: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') checkRedElectrons();
                }}
                placeholder={t('level3.electronCount', 'Fjöldi rafeinda')}
                className="w-full p-3 border-2 border-red-300 rounded-xl focus:border-red-500 focus:outline-none"
              />
            </div>

            {!feedback.show && (
              <button
                onClick={checkRedElectrons}
                disabled={!answers.redElectrons}
                className={`w-full font-bold py-3 px-6 rounded-xl ${
                  !answers.redElectrons
                    ? 'bg-warm-200 text-warm-400 cursor-not-allowed'
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
              >
                {t('common.submit', 'Athuga')}
              </button>
            )}
          </div>
        );

      case 'balance':
        return (
          <div className="space-y-4">
            <div className="bg-amber-50 p-4 rounded-xl">
              <h3 className="font-bold text-amber-800 mb-2">
                {t('level3.step4Title', 'Skref 4: Jafna rafeindirnar')}
              </h3>
              <p className="text-amber-600 text-sm mb-3">
                {t(
                  'level3.step4Hint',
                  'Margfaldaðu hálf-hvörfin svo rafeindir sem tapast = rafeindir sem öðlast'
                )}
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-blue-100 p-2 rounded">
                  {t('level3.oxidationLabel', 'Oxun')}: {problem.oxidationHalf.electrons}e⁻
                </div>
                <div className="bg-red-100 p-2 rounded">
                  {t('level3.reductionLabel', 'Afoxun')}: {problem.reductionHalf.electrons}e⁻
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-warm-700 mb-1">
                  {t('level3.multiplierForOxidation', 'Margfaldari fyrir oxun:')}
                </label>
                <input
                  type="number"
                  value={answers.oxMultiplier}
                  onChange={(e) =>
                    setAnswers((prev) => ({ ...prev, oxMultiplier: e.target.value }))
                  }
                  onKeyDown={(e) => {
                    if (
                      e.key === 'Enter' &&
                      answers.oxMultiplier &&
                      answers.redMultiplier &&
                      !feedback.show
                    ) {
                      checkMultipliers();
                    }
                  }}
                  placeholder="x?"
                  className="w-full p-3 border-2 border-blue-300 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-warm-700 mb-1">
                  {t('level3.multiplierForReduction', 'Margfaldari fyrir afoxun:')}
                </label>
                <input
                  type="number"
                  value={answers.redMultiplier}
                  onChange={(e) =>
                    setAnswers((prev) => ({ ...prev, redMultiplier: e.target.value }))
                  }
                  onKeyDown={(e) => {
                    if (
                      e.key === 'Enter' &&
                      answers.oxMultiplier &&
                      answers.redMultiplier &&
                      !feedback.show
                    ) {
                      checkMultipliers();
                    }
                  }}
                  placeholder="x?"
                  className="w-full p-3 border-2 border-red-300 rounded-xl focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>

            {!feedback.show && (
              <button
                onClick={checkMultipliers}
                disabled={!answers.oxMultiplier || !answers.redMultiplier}
                className={`w-full font-bold py-3 px-6 rounded-xl ${
                  !answers.oxMultiplier || !answers.redMultiplier
                    ? 'bg-warm-200 text-warm-400 cursor-not-allowed'
                    : 'bg-amber-500 hover:bg-amber-600 text-white'
                }`}
              >
                {t('level3.checkMultipliers', 'Athuga margfaldara')}
              </button>
            )}
          </div>
        );

      case 'complete':
        return (
          <div className="space-y-4">
            <div className="bg-green-50 p-6 rounded-xl border-2 border-green-400 text-center">
              <div className="text-4xl mb-2">✓</div>
              <h3 className="font-bold text-green-800 text-xl mb-2">
                {t('level3.equationBalanced', 'Jöfnuð jafna!')}
              </h3>
              <div className="text-2xl font-mono text-green-700 mb-4">{problem.finalDisplay}</div>

              <div className="bg-white p-4 rounded-lg text-left text-sm">
                <div className="font-bold text-warm-700 mb-2">
                  {t('level3.summary', 'Samantekt:')}
                </div>
                <div className="space-y-1 text-warm-600">
                  <div>
                    • {t('level3.oxidationLabel', 'Oxun')}: {problem.multiplierOx}x(
                    {problem.oxidationHalf.speciesDisplay} → {problem.oxidationHalf.productDisplay}{' '}
                    + {problem.oxidationHalf.electrons}e⁻)
                  </div>
                  <div>
                    • {t('level3.reductionLabel', 'Afoxun')}: {problem.multiplierRed}x(
                    {problem.reductionHalf.speciesDisplay} + {problem.reductionHalf.electrons}e⁻ →{' '}
                    {problem.reductionHalf.productDisplay})
                  </div>
                  <div className="font-bold text-green-700 pt-2">
                    {t('level3.electrons', 'Rafeindir')}:{' '}
                    {problem.multiplierOx * problem.oxidationHalf.electrons}{' '}
                    {t('level3.lost', 'tapað')} ={' '}
                    {problem.multiplierRed * problem.reductionHalf.electrons}{' '}
                    {t('level3.gained', 'öðlast')} ✓
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  if (showIntro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 p-4 md:p-8">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-8 space-y-5">
          <div className="flex justify-between items-center">
            <button onClick={onBack} className="text-warm-500 hover:text-warm-700">
              ← {t('common.back', 'Til baka')}
            </button>
            <h1 className="text-lg font-bold text-warm-800">Hálfhvarfaaðferðin — Kennsla</h1>
            <span className="text-sm text-warm-500">Stig 3</span>
          </div>

          <div className="bg-teal-50 border-l-4 border-teal-500 rounded-lg p-4">
            <h2 className="font-bold text-teal-900 mb-2">Af hverju hálfhvörf?</h2>
            <p className="text-warm-700 text-sm leading-relaxed">
              Rafeindir <strong>hverfa ekki</strong> í efnahvörfum. Fjöldi rafeinda sem ein tegund
              tapar verður að vera <em>jafn</em> fjölda sem önnur öðlast. Með því að aðskilja
              redoxhvarf í tvö hálfhvörf getum við jafnað rafeindafjölda beint.
            </p>
          </div>

          <div className="bg-white border border-warm-200 rounded-lg p-4 space-y-3">
            <h3 className="font-bold text-warm-800">Dæmi: 2Al + 3Cu²⁺ → 2Al³⁺ + 3Cu</h3>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
              <p className="font-bold text-blue-800 mb-1">Skref 1 — Oxunarhálfhvarf</p>
              <p className="font-mono text-blue-900">Al → Al³⁺ + 3e⁻</p>
              <p className="text-xs text-blue-700 mt-1">Al fer úr 0 í +3 og tapar 3 rafeindum.</p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
              <p className="font-bold text-red-800 mb-1">Skref 2 — Afoxunarhálfhvarf</p>
              <p className="font-mono text-red-900">Cu²⁺ + 2e⁻ → Cu</p>
              <p className="text-xs text-red-700 mt-1">Cu²⁺ fer úr +2 í 0 og öðlast 2 rafeindir.</p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
              <p className="font-bold text-amber-800 mb-1">Skref 3 — Jafna rafeindir</p>
              <p className="text-warm-700">
                Oxun gefur <strong>3 rafeindir</strong>, afoxun þarfnast{' '}
                <strong>2 rafeindir</strong>. Minnsta samþakning er 6. Margföldum oxun með 2 og
                afoxun með 3.
              </p>
              <p className="font-mono text-warm-800 mt-1">
                2 × (Al → Al³⁺ + 3e⁻) = 2Al → 2Al³⁺ + 6e⁻
              </p>
              <p className="font-mono text-warm-800">3 × (Cu²⁺ + 2e⁻ → Cu) = 3Cu²⁺ + 6e⁻ → 3Cu</p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
              <p className="font-bold text-green-800 mb-1">Skref 4 — Leggja saman</p>
              <p className="font-mono text-green-900">2Al + 3Cu²⁺ → 2Al³⁺ + 3Cu</p>
              <p className="text-xs text-green-700 mt-1">
                6 rafeindir vinstra megin = 6 rafeindir hægra megin ✓
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowIntro(false)}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl transition-colors"
          >
            Byrja æfingar →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 p-4 md:p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <button onClick={onBack} className="text-warm-500 hover:text-warm-700">
            <span>&larr;</span> {t('common.back', 'Til baka')}
          </button>
          <div className="flex items-center gap-4">
            <div className="text-sm text-warm-500">
              {t('level3.problem', 'Daemi')} {currentProblem + 1} {t('level3.of', 'af')}{' '}
              {problems.length}
            </div>
            <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-bold">
              {t('level3.score', 'Stig')}: {score}
            </div>
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-center mb-2 text-purple-600">
          {t('levels.level3.name', 'Jafna redox-jofnur')}
        </h1>
        <p className="text-center text-warm-600 mb-4">
          {t('level3.subtitle', 'Half-hvorf adferdin')}
        </p>

        <div className="bg-warm-50 p-4 rounded-xl mb-6 text-center">
          <div className="text-sm text-warm-500 mb-1">{problem.description}</div>
          <div className="text-xl md:text-2xl font-mono font-bold text-warm-800">
            {problem.overallDisplay}
          </div>
        </div>

        <div className="flex justify-center gap-2 mb-6">
          {['identify', 'write-ox', 'write-red', 'balance', 'complete'].map((s, idx) => (
            <div
              key={s}
              className={`w-8 h-2 rounded-full ${
                s === step
                  ? 'bg-purple-500'
                  : ['identify', 'write-ox', 'write-red', 'balance', 'complete'].indexOf(step) > idx
                    ? 'bg-green-500'
                    : 'bg-warm-300'
              }`}
            />
          ))}
        </div>

        {renderStep()}

        {feedback.show && (
          <div
            className={`mt-4 p-4 rounded-xl ${
              feedback.correct
                ? 'bg-green-100 border-2 border-green-400'
                : 'bg-amber-100 border-2 border-amber-400'
            }`}
          >
            <div className={`font-bold ${feedback.correct ? 'text-green-800' : 'text-amber-800'}`}>
              {feedback.correct ? '✓ ' : ''}
              {feedback.message}
            </div>
          </div>
        )}

        {feedback.show && (
          <button
            onClick={handleNext}
            className="w-full mt-4 bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-xl"
          >
            {step === 'complete'
              ? currentProblem < problems.length - 1
                ? t('level3.nextProblem', 'Naesta daemi') + ' →'
                : t('level3.completeLevel', 'Ljuka stigi') + ' →'
              : t('common.next', 'Halda afram') + ' →'}
          </button>
        )}

        {showHint && (
          <div className="mt-4 bg-yellow-50 p-4 rounded-xl border border-yellow-200">
            <div className="flex items-center gap-2">
              <span className="text-xl">💡</span>
              <span className="text-yellow-800">{problem.hint}</span>
            </div>
          </div>
        )}

        {!showHint && !feedback.show && step !== 'complete' && (
          <button
            onClick={() => {
              setShowHint(true);
              setTotalHintsUsed((prev) => prev + 1);
            }}
            className="w-full mt-4 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-bold py-2 px-4 rounded-xl text-sm"
          >
            {t('common.hint', 'Syna visbendingu')}
          </button>
        )}

        <div className="mt-6 w-full bg-warm-200 rounded-full h-2">
          <div
            className="bg-purple-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentProblem + 1) / problems.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
