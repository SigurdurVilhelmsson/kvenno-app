import { useState } from 'react';

interface Level2Props {
  t: (key: string, fallback?: string) => string;
  onComplete: (score: number, maxScore: number, hintsUsed: number) => void;
  onBack: () => void;
  onCorrectAnswer?: () => void;
  onIncorrectAnswer?: () => void;
}

type CompoundType = 'ionic-simple' | 'ionic-variable' | 'ionic-polyatomic' | 'molecular';

interface NamingChallenge {
  id: number;
  formula: string;
  correctName: string;
  type: CompoundType;
  metal?: string;
  nonmetal?: string;
  oxidationState?: string;
  polyatomicIon?: string;
  prefix1?: string;
  prefix2?: string;
  steps: {
    identifyType: string;
    nameParts: string[];
    finalName: string;
  };
  hint: string;
}

const challenges: NamingChallenge[] = [
  {
    id: 1,
    formula: 'KBr',
    correctName: 'Kalíumbrómíð',
    type: 'ionic-simple',
    metal: 'Kalíum',
    nonmetal: 'brómíð',
    steps: {
      identifyType: 'Jónefni (málmur + málmleysingi)',
      nameParts: ['Kalíum (málmur)', 'bróm → brómíð'],
      finalName: 'Kalíum + brómíð = Kalíumbrómíð',
    },
    hint: 'K er málmur í hópi 1, Br er málmleysingi',
  },
  {
    id: 2,
    formula: 'CaO',
    correctName: 'Kalsíumoxíð',
    type: 'ionic-simple',
    metal: 'Kalsíum',
    nonmetal: 'oxíð',
    steps: {
      identifyType: 'Jónefni (málmur + málmleysingi)',
      nameParts: ['Kalsíum (málmur)', 'súrefni → oxíð'],
      finalName: 'Kalsíum + oxíð = Kalsíumoxíð',
    },
    hint: 'Ca er málmur í hópi 2, O er súrefni',
  },
  {
    id: 3,
    formula: 'FeCl₃',
    correctName: 'Járn(III)klóríð',
    type: 'ionic-variable',
    metal: 'Járn',
    nonmetal: 'klóríð',
    oxidationState: 'III',
    steps: {
      identifyType: 'Jónefni með breytilega hleðslu',
      nameParts: ['Járn (breytileg hleðsla)', '3 Cl⁻ → Fe³⁺ → (III)', 'klór → klóríð'],
      finalName: 'Járn(III) + klóríð = Járn(III)klóríð',
    },
    hint: 'Járn getur haft +2 eða +3 hleðslu. 3 klór þýðir Fe³⁺',
  },
  {
    id: 4,
    formula: 'Cu₂O',
    correctName: 'Kopar(I)oxíð',
    type: 'ionic-variable',
    metal: 'Kopar',
    nonmetal: 'oxíð',
    oxidationState: 'I',
    steps: {
      identifyType: 'Jónefni með breytilega hleðslu',
      nameParts: ['Kopar (breytileg hleðsla)', '2 Cu + O²⁻ → 2Cu⁺ → (I)', 'súrefni → oxíð'],
      finalName: 'Kopar(I) + oxíð = Kopar(I)oxíð',
    },
    hint: '2 kopar deila einni O²⁻, svo hver Cu er +1',
  },
  {
    id: 5,
    formula: 'Na₂SO₄',
    correctName: 'Natríumsúlfat',
    type: 'ionic-polyatomic',
    metal: 'Natríum',
    polyatomicIon: 'súlfat',
    steps: {
      identifyType: 'Jónefni með fjölatóma jón',
      nameParts: ['Natríum (málmur)', 'SO₄²⁻ = súlfat (fjölatóma jón)'],
      finalName: 'Natríum + súlfat = Natríumsúlfat',
    },
    hint: 'SO₄ er súlfat jónin - fjölatóma jón með fast nafn',
  },
  {
    id: 6,
    formula: 'KNO₃',
    correctName: 'Kalíumnítrat',
    type: 'ionic-polyatomic',
    metal: 'Kalíum',
    polyatomicIon: 'nítrat',
    steps: {
      identifyType: 'Jónefni með fjölatóma jón',
      nameParts: ['Kalíum (málmur)', 'NO₃⁻ = nítrat (fjölatóma jón)'],
      finalName: 'Kalíum + nítrat = Kalíumnítrat',
    },
    hint: 'NO₃ er nítrat jónin',
  },
  {
    id: 7,
    formula: 'CO₂',
    correctName: 'Koldíoxíð',
    type: 'molecular',
    prefix1: '',
    prefix2: 'dí',
    steps: {
      identifyType: 'Sameind (tveir málmleysingjar)',
      nameParts: ['C: 1 atóm → (sleppum mono)', 'O: 2 atóm → dí', 'súrefni → oxíð'],
      finalName: 'Kol + dí + oxíð = Koldíoxíð',
    },
    hint: 'Bæði C og O eru málmleysingjar - þetta er sameind',
  },
  {
    id: 8,
    formula: 'N₂O₄',
    correctName: 'Díniturtetroxíð',
    type: 'molecular',
    prefix1: 'dí',
    prefix2: 'tetra',
    steps: {
      identifyType: 'Sameind (tveir málmleysingjar)',
      nameParts: ['N: 2 atóm → dí', 'O: 4 atóm → tetra', 'súrefni → oxíð'],
      finalName: 'Dí + nitur + tetra + oxíð = Díniturtetroxíð',
    },
    hint: 'N og O eru báðir málmleysingjar',
  },
  {
    id: 9,
    formula: 'SF₆',
    correctName: 'Brennisteinshexaflúoríð',
    type: 'molecular',
    prefix1: '',
    prefix2: 'hexa',
    steps: {
      identifyType: 'Sameind (tveir málmleysingjar)',
      nameParts: ['S: 1 atóm → (sleppum mono)', 'F: 6 atóm → hexa', 'flúor → flúoríð'],
      finalName: 'Brennisteinn + hexa + flúoríð = Brennisteinshexaflúoríð',
    },
    hint: 'S og F eru báðir málmleysingjar',
  },
  {
    id: 10,
    formula: 'Ca(NO₃)₂',
    correctName: 'Kalsíumnítrat',
    type: 'ionic-polyatomic',
    metal: 'Kalsíum',
    polyatomicIon: 'nítrat',
    steps: {
      identifyType: 'Jónefni með fjölatóma jón',
      nameParts: ['Kalsíum (málmur)', 'NO₃⁻ = nítrat (×2 breytir ekki nafninu)'],
      finalName: 'Kalsíum + nítrat = Kalsíumnítrat',
    },
    hint: 'Sviginn sýnir að það eru 2 nítrat jónir, en nafnið er samt bara nítrat',
  },
  {
    id: 11,
    formula: 'PbO₂',
    correctName: 'Blý(IV)oxíð',
    type: 'ionic-variable',
    metal: 'Blý',
    nonmetal: 'oxíð',
    oxidationState: 'IV',
    steps: {
      identifyType: 'Jónefni með breytilega hleðslu',
      nameParts: ['Blý (breytileg hleðsla)', '2 O²⁻ = -4 → Pb⁴⁺ → (IV)', 'súrefni → oxíð'],
      finalName: 'Blý(IV) + oxíð = Blý(IV)oxíð',
    },
    hint: 'Blý getur haft +2 eða +4 hleðslu. 2 súrefni = -4, svo blý er +4',
  },
  {
    id: 12,
    formula: 'PCl₅',
    correctName: 'Fosforpentaklóríð',
    type: 'molecular',
    prefix1: '',
    prefix2: 'penta',
    steps: {
      identifyType: 'Sameind (tveir málmleysingjar)',
      nameParts: ['P: 1 atóm → (sleppum mono)', 'Cl: 5 atóm → penta', 'klór → klóríð'],
      finalName: 'Fosfor + penta + klóríð = Fosforpentaklóríð',
    },
    hint: 'P og Cl eru báðir málmleysingjar',
  },
];

const typeNames: Record<CompoundType, { name: string; color: string; description: string }> = {
  'ionic-simple': {
    name: 'Einfalt jónefni',
    color: 'blue',
    description: 'Málmur + málmleysingi, fær endinguna -íð',
  },
  'ionic-variable': {
    name: 'Jónefni (breytileg hleðsla)',
    color: 'purple',
    description: 'Málmur með breytilega hleðslu, notar rómverskar tölur',
  },
  'ionic-polyatomic': {
    name: 'Jónefni (fjölatóma jón)',
    color: 'green',
    description: 'Inniheldur fjölatóma jón eins og súlfat, nítrat, eða karbónat',
  },
  molecular: {
    name: 'Sameind',
    color: 'orange',
    description: 'Tveir málmleysingjar, notar grísk forskeyti',
  },
};

const greekPrefixes = [
  { count: 1, prefix: 'mono-', note: '(sleppum fyrir fyrra frumefni)' },
  { count: 2, prefix: 'dí-', note: '' },
  { count: 3, prefix: 'trí-', note: '' },
  { count: 4, prefix: 'tetra-', note: '' },
  { count: 5, prefix: 'penta-', note: '' },
  { count: 6, prefix: 'hexa-', note: '' },
  { count: 7, prefix: 'hepta-', note: '' },
  { count: 8, prefix: 'okta-', note: '' },
];

type Step = 'identify' | 'build' | 'answer' | 'feedback';

export function Level2({ t, onComplete, onBack, onCorrectAnswer, onIncorrectAnswer }: Level2Props) {
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [step, setStep] = useState<Step>('identify');
  const [selectedType, setSelectedType] = useState<CompoundType | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [typeCorrect, setTypeCorrect] = useState<boolean | null>(null);
  const [totalHintsUsed, setTotalHintsUsed] = useState(0);

  const challenge = challenges[currentChallenge];
  const typeInfo = typeNames[challenge.type];

  const normalizeAnswer = (answer: string): string => {
    return answer
      .toLowerCase()
      .trim()
      .replace(/í/g, 'i')
      .replace(/ú/g, 'u')
      .replace(/ý/g, 'y')
      .replace(/ó/g, 'o')
      .replace(/á/g, 'a')
      .replace(/é/g, 'e')
      .replace(/ð/g, 'd')
      .replace(/æ/g, 'ae')
      .replace(/ö/g, 'o')
      .replace(/\s+/g, '')
      .replace(/[()]/g, '');
  };

  const handleTypeSelect = (type: CompoundType) => {
    setSelectedType(type);
    const correct = type === challenge.type;
    setTypeCorrect(correct);

    if (correct) {
      setScore((prev) => prev + 5);
    }

    // Move to build step after a short delay
    setTimeout(() => {
      setStep('build');
    }, 1500);
  };

  const handleSubmitAnswer = () => {
    setStep('feedback');
    const normalizedUser = normalizeAnswer(userAnswer);
    const normalizedCorrect = normalizeAnswer(challenge.correctName);

    if (normalizedUser === normalizedCorrect) {
      setScore((prev) => prev + 10);
      onCorrectAnswer?.();
    } else {
      onIncorrectAnswer?.();
    }
  };

  const handleNext = () => {
    if (currentChallenge < challenges.length - 1) {
      setCurrentChallenge((prev) => prev + 1);
      setStep('identify');
      setSelectedType(null);
      setUserAnswer('');
      setShowHint(false);
      setTypeCorrect(null);
    } else {
      // Max score: 15 points per challenge (5 for type + 10 for answer without hint)
      const maxScore = challenges.length * 15;
      onComplete(score, maxScore, totalHintsUsed);
    }
  };

  const isAnswerCorrect = normalizeAnswer(userAnswer) === normalizeAnswer(challenge.correctName);

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; border: string; text: string; light: string }> = {
      blue: {
        bg: 'bg-blue-500',
        border: 'border-blue-400',
        text: 'text-blue-800',
        light: 'bg-blue-50',
      },
      purple: {
        bg: 'bg-purple-500',
        border: 'border-purple-400',
        text: 'text-purple-800',
        light: 'bg-purple-50',
      },
      green: {
        bg: 'bg-green-500',
        border: 'border-green-400',
        text: 'text-green-800',
        light: 'bg-green-50',
      },
      orange: {
        bg: 'bg-orange-500',
        border: 'border-orange-400',
        text: 'text-orange-800',
        light: 'bg-orange-50',
      },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <button onClick={onBack} className="text-warm-500 hover:text-warm-700">
            ← {t('common.back', 'Til baka')}
          </button>
          <div className="flex items-center gap-4">
            <div className="text-sm text-warm-500">
              {t('level2.ui.compoundNOfM', 'Efnasamband {n} af {m}')
                .replace('{n}', String(currentChallenge + 1))
                .replace('{m}', String(challenges.length))}
            </div>
            <div className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full font-bold">
              {t('common.score', 'Stig')}: {score}
            </div>
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-center mb-2 text-teal-600">
          {t('level2.ui.nameCompound', 'Nefndu efnasambandið')}
        </h1>
        <p className="text-center text-warm-600 mb-6">
          {t('level2.ui.followSteps', 'Fylgdu skrefunum til að nefna efnasambandið rétt')}
        </p>

        {/* Formula display */}
        <div className="bg-warm-100 rounded-2xl p-6 md:p-8 mb-6 text-center">
          <div className="text-4xl md:text-6xl font-mono font-bold text-warm-800">
            {challenge.formula}
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex justify-center gap-2 mb-6">
          {['identify', 'build', 'answer', 'feedback'].map((s, idx) => (
            <div key={s} className={`flex items-center ${idx < 3 ? 'gap-2' : ''}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  s === step
                    ? 'bg-teal-500 text-white'
                    : ['identify', 'build', 'answer', 'feedback'].indexOf(step) > idx
                      ? 'bg-green-500 text-white'
                      : 'bg-warm-200 text-warm-500'
                }`}
              >
                {idx + 1}
              </div>
              {idx < 3 && <div className="w-8 h-0.5 bg-warm-300" />}
            </div>
          ))}
        </div>

        {/* Step 1: Identify type */}
        {step === 'identify' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-warm-700 text-center mb-4">
              {t('level2.ui.step1Title', 'Skref 1: Hvaða tegund efnasambands er þetta?')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(Object.keys(typeNames) as CompoundType[]).map((type) => {
                const info = typeNames[type];
                const colors = getColorClasses(info.color);
                return (
                  <button
                    key={type}
                    onClick={() => handleTypeSelect(type)}
                    disabled={selectedType !== null}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      selectedType === type
                        ? type === challenge.type
                          ? 'border-green-500 bg-green-50'
                          : 'border-red-500 bg-red-50'
                        : selectedType !== null && type === challenge.type
                          ? 'border-green-500 bg-green-50'
                          : `${colors.border} ${colors.light} hover:shadow-md`
                    }`}
                  >
                    <div className={`font-bold ${colors.text}`}>{info.name}</div>
                    <div className="text-sm text-warm-600">{info.description}</div>
                  </button>
                );
              })}
            </div>

            {typeCorrect !== null && (
              <div
                className={`p-4 rounded-xl text-center ${
                  typeCorrect ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                }`}
              >
                {typeCorrect
                  ? `✓ ${t('common.correct', 'Rétt!')}`
                  : `Þetta er ${typeInfo.name.toLowerCase()}`}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Build the name */}
        {step === 'build' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-warm-700 text-center mb-4">
              {t('level2.ui.step2Title', 'Skref 2: Hvernig er nafnið byggt upp?')}
            </h2>

            <div
              className={`${getColorClasses(typeInfo.color).light} border-2 ${getColorClasses(typeInfo.color).border} rounded-xl p-4`}
            >
              <div className={`font-bold ${getColorClasses(typeInfo.color).text} mb-2`}>
                {typeInfo.name}
              </div>
              <div className="text-warm-700 mb-4">{challenge.steps.identifyType}</div>

              <div className="bg-white rounded-lg p-4 space-y-2">
                {challenge.steps.nameParts.map((part, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-warm-200 flex items-center justify-center text-sm font-bold">
                      {idx + 1}
                    </span>
                    <span>{part}</span>
                  </div>
                ))}
                <div className="pt-2 border-t mt-2">
                  <span className="font-bold text-warm-700">→ {challenge.steps.finalName}</span>
                </div>
              </div>
            </div>

            {/* Greek prefixes reference for molecular compounds */}
            {challenge.type === 'molecular' && (
              <div className="bg-orange-50 rounded-xl p-4">
                <div className="font-bold text-orange-800 mb-2">
                  {t('level2.ui.greekPrefixes', 'Grísk forskeyti:')}
                </div>
                <div className="grid grid-cols-4 gap-2 text-sm">
                  {greekPrefixes.slice(0, 8).map((p) => (
                    <div key={p.count} className="bg-white p-2 rounded text-center">
                      <span className="font-bold">{p.count}</span> = {p.prefix.replace('-', '')}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setStep('answer')}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-6 rounded-xl"
            >
              {t('level2.ui.understood', 'Ég skil - skrifa nafnið')} →
            </button>
          </div>
        )}

        {/* Step 3: Enter answer */}
        {step === 'answer' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-warm-700 text-center mb-4">
              {t('level2.ui.step3Title', 'Skref 3: Skrifaðu nafnið')}
            </h2>

            <div className="bg-warm-50 rounded-xl p-4 mb-4">
              <div className="text-sm text-warm-600 mb-2">{t('level2.ui.remember', 'Mundu:')}</div>
              <div className="text-warm-700">{challenge.steps.finalName}</div>
            </div>

            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder={t('level2.ui.typeHere', 'Skrifaðu nafnið hér...')}
              className="w-full text-center text-2xl font-bold p-4 border-2 border-teal-300 rounded-xl focus:border-teal-500 focus:outline-none"
              onKeyPress={(e) => e.key === 'Enter' && userAnswer && handleSubmitAnswer()}
              autoFocus
            />

            {showHint && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">💡</span>
                  <span className="text-yellow-800">{challenge.hint}</span>
                </div>
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
                  💡 {t('common.hint', 'Vísbending')}
                </button>
              )}
              <button
                onClick={handleSubmitAnswer}
                disabled={!userAnswer.trim()}
                className={`flex-1 font-bold py-3 px-6 rounded-xl ${
                  !userAnswer.trim()
                    ? 'bg-warm-200 text-warm-400 cursor-not-allowed'
                    : 'bg-teal-500 hover:bg-teal-600 text-white'
                }`}
              >
                {t('level2.ui.checkAnswer', 'Athuga svar')}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Feedback */}
        {step === 'feedback' && (
          <div className="space-y-4">
            <div
              className={`p-6 rounded-xl text-center ${
                isAnswerCorrect
                  ? 'bg-green-100 border-2 border-green-400'
                  : 'bg-red-100 border-2 border-red-400'
              }`}
            >
              <div className="text-4xl mb-2">{isAnswerCorrect ? '✓' : '✗'}</div>
              <div
                className={`text-xl font-bold ${isAnswerCorrect ? 'text-green-800' : 'text-red-800'}`}
              >
                {isAnswerCorrect
                  ? t('common.correct', 'Rétt!')
                  : t('level2.ui.notQuite', 'Ekki alveg')}
              </div>
              {!isAnswerCorrect && (
                <div className="mt-2 text-red-700">
                  <div>
                    {t('level2.ui.youWrote', 'Þú skrifaðir:')} <strong>{userAnswer}</strong>
                  </div>
                  <div>
                    {t('level2.ui.correctAnswer', 'Rétt svar:')}{' '}
                    <strong>{challenge.correctName}</strong>
                  </div>
                </div>
              )}
              {isAnswerCorrect && (
                <div className="mt-2 text-green-700 text-2xl font-bold">
                  {challenge.correctName}
                </div>
              )}
            </div>

            {/* Summary */}
            <div className={`${getColorClasses(typeInfo.color).light} rounded-xl p-4`}>
              <div className={`font-bold ${getColorClasses(typeInfo.color).text} mb-2`}>
                {t('level2.ui.summary', 'Samantekt:')} {typeInfo.name}
              </div>
              <div className="bg-white rounded-lg p-3">
                <div className="text-warm-700">{challenge.steps.finalName}</div>
              </div>
            </div>

            <button
              onClick={handleNext}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-6 rounded-xl"
            >
              {currentChallenge < challenges.length - 1
                ? t('level2.ui.nextCompound', 'Næsta efnasamband') + ' →'
                : t('level2.ui.finishLevel', 'Ljúka stigi') + ' →'}
            </button>
          </div>
        )}

        {/* Progress bar */}
        <div className="mt-6 w-full bg-warm-200 rounded-full h-2">
          <div
            className="bg-teal-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentChallenge + 1) / challenges.length) * 100}%` }}
          />
        </div>

        {/* Quick reference */}
        <div className="mt-6 bg-warm-50 rounded-xl p-4">
          <h3 className="font-semibold text-warm-700 mb-2 text-sm">
            {t('level2.ui.quickRef', 'Flýtileiðbeiningar:')}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div className="bg-blue-50 p-2 rounded border border-blue-200">
              <div className="font-bold text-blue-700">Jónefni</div>
              <div className="text-blue-600">málmur + -íð</div>
            </div>
            <div className="bg-purple-50 p-2 rounded border border-purple-200">
              <div className="font-bold text-purple-700">Breytileg</div>
              <div className="text-purple-600">málmur(X) + -íð</div>
            </div>
            <div className="bg-green-50 p-2 rounded border border-green-200">
              <div className="font-bold text-green-700">Fjölatóma</div>
              <div className="text-green-600">málmur + jón</div>
            </div>
            <div className="bg-orange-50 p-2 rounded border border-orange-200">
              <div className="font-bold text-orange-700">Sameind</div>
              <div className="text-orange-600">forskeyti + -íð</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
