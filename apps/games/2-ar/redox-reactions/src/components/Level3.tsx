import { useState } from 'react';

interface Level3Props {
  onComplete: (score: number, maxScore: number, hintsUsed: number) => void;
  onBack: () => void;
  onCorrectAnswer?: () => void;
  onIncorrectAnswer?: () => void;
}

interface HalfReaction {
  species: string;
  speciesDisplay: string;
  product: string;
  productDisplay: string;
  electrons: number;
  isOxidation: boolean;
  coefficientSpecies: number;
  coefficientProduct: number;
  coefficientElectron: number;
}

interface RedoxProblem {
  id: number;
  description: string;
  overallReaction: string;
  overallDisplay: string;
  oxidationHalf: HalfReaction;
  reductionHalf: HalfReaction;
  multiplierOx: number;
  multiplierRed: number;
  finalEquation: string;
  finalDisplay: string;
  hint: string;
}

const problems: RedoxProblem[] = [
  {
    id: 1,
    description: "Zink í kopar(II) lausn",
    overallReaction: "Zn + Cu²⁺ → Zn²⁺ + Cu",
    overallDisplay: "Zn + Cu²⁺ → Zn²⁺ + Cu",
    oxidationHalf: {
      species: "Zn",
      speciesDisplay: "Zn",
      product: "Zn²⁺",
      productDisplay: "Zn²⁺",
      electrons: 2,
      isOxidation: true,
      coefficientSpecies: 1,
      coefficientProduct: 1,
      coefficientElectron: 2
    },
    reductionHalf: {
      species: "Cu²⁺",
      speciesDisplay: "Cu²⁺",
      product: "Cu",
      productDisplay: "Cu",
      electrons: 2,
      isOxidation: false,
      coefficientSpecies: 1,
      coefficientProduct: 1,
      coefficientElectron: 2
    },
    multiplierOx: 1,
    multiplierRed: 1,
    finalEquation: "Zn + Cu²⁺ → Zn²⁺ + Cu",
    finalDisplay: "Zn + Cu²⁺ → Zn²⁺ + Cu",
    hint: "Báðar hálf-hvörf nota 2 rafeindir, svo margfaldarinn er 1"
  },
  {
    id: 2,
    description: "Járn og silfurjón",
    overallReaction: "Fe + Ag⁺ → Fe²⁺ + Ag",
    overallDisplay: "Fe + Ag⁺ → Fe²⁺ + Ag",
    oxidationHalf: {
      species: "Fe",
      speciesDisplay: "Fe",
      product: "Fe²⁺",
      productDisplay: "Fe²⁺",
      electrons: 2,
      isOxidation: true,
      coefficientSpecies: 1,
      coefficientProduct: 1,
      coefficientElectron: 2
    },
    reductionHalf: {
      species: "Ag⁺",
      speciesDisplay: "Ag⁺",
      product: "Ag",
      productDisplay: "Ag",
      electrons: 1,
      isOxidation: false,
      coefficientSpecies: 1,
      coefficientProduct: 1,
      coefficientElectron: 1
    },
    multiplierOx: 1,
    multiplierRed: 2,
    finalEquation: "Fe + 2Ag⁺ → Fe²⁺ + 2Ag",
    finalDisplay: "Fe + 2Ag⁺ → Fe²⁺ + 2Ag",
    hint: "Fe gefur 2e⁻, Ag⁺ tekur 1e⁻, þú þarft 2×Ag⁺"
  },
  {
    id: 3,
    description: "Ál og vetnisjón",
    overallReaction: "Al + H⁺ → Al³⁺ + H₂",
    overallDisplay: "Al + H⁺ → Al³⁺ + H₂",
    oxidationHalf: {
      species: "Al",
      speciesDisplay: "Al",
      product: "Al³⁺",
      productDisplay: "Al³⁺",
      electrons: 3,
      isOxidation: true,
      coefficientSpecies: 1,
      coefficientProduct: 1,
      coefficientElectron: 3
    },
    reductionHalf: {
      species: "H⁺",
      speciesDisplay: "2H⁺",
      product: "H₂",
      productDisplay: "H₂",
      electrons: 2,
      isOxidation: false,
      coefficientSpecies: 2,
      coefficientProduct: 1,
      coefficientElectron: 2
    },
    multiplierOx: 2,
    multiplierRed: 3,
    finalEquation: "2Al + 6H⁺ → 2Al³⁺ + 3H₂",
    finalDisplay: "2Al + 6H⁺ → 2Al³⁺ + 3H₂",
    hint: "Al gefur 3e⁻, 2H⁺ tekur 2e⁻. LCM(3,2)=6, svo 2×Al og 3×(2H⁺)"
  },
  {
    id: 4,
    description: "Magnesíum og súrefni",
    overallReaction: "Mg + O₂ → MgO",
    overallDisplay: "Mg + O₂ → MgO",
    oxidationHalf: {
      species: "Mg",
      speciesDisplay: "Mg",
      product: "Mg²⁺",
      productDisplay: "Mg²⁺",
      electrons: 2,
      isOxidation: true,
      coefficientSpecies: 1,
      coefficientProduct: 1,
      coefficientElectron: 2
    },
    reductionHalf: {
      species: "O₂",
      speciesDisplay: "O₂",
      product: "O²⁻",
      productDisplay: "2O²⁻",
      electrons: 4,
      isOxidation: false,
      coefficientSpecies: 1,
      coefficientProduct: 2,
      coefficientElectron: 4
    },
    multiplierOx: 2,
    multiplierRed: 1,
    finalEquation: "2Mg + O₂ → 2MgO",
    finalDisplay: "2Mg + O₂ → 2MgO",
    hint: "Mg gefur 2e⁻, O₂ tekur 4e⁻, þú þarft 2×Mg"
  },
  {
    id: 5,
    description: "Klór og kalíum bróm",
    overallReaction: "Cl₂ + Br⁻ → Cl⁻ + Br₂",
    overallDisplay: "Cl₂ + Br⁻ → Cl⁻ + Br₂",
    oxidationHalf: {
      species: "Br⁻",
      speciesDisplay: "2Br⁻",
      product: "Br₂",
      productDisplay: "Br₂",
      electrons: 2,
      isOxidation: true,
      coefficientSpecies: 2,
      coefficientProduct: 1,
      coefficientElectron: 2
    },
    reductionHalf: {
      species: "Cl₂",
      speciesDisplay: "Cl₂",
      product: "Cl⁻",
      productDisplay: "2Cl⁻",
      electrons: 2,
      isOxidation: false,
      coefficientSpecies: 1,
      coefficientProduct: 2,
      coefficientElectron: 2
    },
    multiplierOx: 1,
    multiplierRed: 1,
    finalEquation: "Cl₂ + 2Br⁻ → 2Cl⁻ + Br₂",
    finalDisplay: "Cl₂ + 2Br⁻ → 2Cl⁻ + Br₂",
    hint: "Báðar hálf-hvörf nota 2e⁻"
  },
  {
    id: 6,
    description: "Járn(III) og tin(II)",
    overallReaction: "Fe³⁺ + Sn²⁺ → Fe²⁺ + Sn⁴⁺",
    overallDisplay: "Fe³⁺ + Sn²⁺ → Fe²⁺ + Sn⁴⁺",
    oxidationHalf: {
      species: "Sn²⁺",
      speciesDisplay: "Sn²⁺",
      product: "Sn⁴⁺",
      productDisplay: "Sn⁴⁺",
      electrons: 2,
      isOxidation: true,
      coefficientSpecies: 1,
      coefficientProduct: 1,
      coefficientElectron: 2
    },
    reductionHalf: {
      species: "Fe³⁺",
      speciesDisplay: "Fe³⁺",
      product: "Fe²⁺",
      productDisplay: "Fe²⁺",
      electrons: 1,
      isOxidation: false,
      coefficientSpecies: 1,
      coefficientProduct: 1,
      coefficientElectron: 1
    },
    multiplierOx: 1,
    multiplierRed: 2,
    finalEquation: "2Fe³⁺ + Sn²⁺ → 2Fe²⁺ + Sn⁴⁺",
    finalDisplay: "2Fe³⁺ + Sn²⁺ → 2Fe²⁺ + Sn⁴⁺",
    hint: "Sn²⁺ gefur 2e⁻, Fe³⁺ tekur 1e⁻, þú þarft 2×Fe³⁺"
  }
];

type Step = 'identify' | 'write-ox' | 'write-red' | 'balance' | 'complete';

export function Level3({ onComplete, onBack, onCorrectAnswer, onIncorrectAnswer }: Level3Props) {
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
    redMultiplier: ''
  });
  const [feedback, setFeedback] = useState<{ show: boolean; correct: boolean; message: string }>({
    show: false,
    correct: false,
    message: ''
  });
  const [totalHintsUsed, setTotalHintsUsed] = useState(0);

  // Maximum possible score: 6 problems * (15 identify + 10 ox + 10 red + 20 balance) = 6 * 55 = 330
  const maxScore = problems.length * 55;

  const problem = problems[currentProblem];

  const checkIdentify = () => {
    const oxCorrect = answers.oxidized.toLowerCase() === problem.oxidationHalf.species.toLowerCase().replace(/[⁺⁻²³⁴₂]/g, '');
    const redCorrect = answers.reduced.toLowerCase() === problem.reductionHalf.species.toLowerCase().replace(/[⁺⁻²³⁴₂]/g, '');

    if (oxCorrect && redCorrect) {
      setScore(prev => prev + 15);
      setFeedback({ show: true, correct: true, message: 'Rétt! Þú greindir hvað oxast og afoxast.' });
      onCorrectAnswer?.();
    } else {
      setFeedback({
        show: true,
        correct: false,
        message: `${problem.oxidationHalf.speciesDisplay} oxast (gefur e⁻), ${problem.reductionHalf.speciesDisplay} afoxast (tekur e⁻).`
      });
      onIncorrectAnswer?.();
    }
  };

  const checkMultipliers = () => {
    const oxM = parseInt(answers.oxMultiplier);
    const redM = parseInt(answers.redMultiplier);

    if (oxM === problem.multiplierOx && redM === problem.multiplierRed) {
      setScore(prev => prev + 20);
      setFeedback({ show: true, correct: true, message: 'Frábært! Þú jafnaðir rafeindirnar rétt.' });
      onCorrectAnswer?.();
    } else {
      setFeedback({
        show: true,
        correct: false,
        message: `Til að jafna ${problem.oxidationHalf.electrons}e⁻ og ${problem.reductionHalf.electrons}e⁻, þarftu margfaldara ${problem.multiplierOx} og ${problem.multiplierRed}.`
      });
      onIncorrectAnswer?.();
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
        setCurrentProblem(prev => prev + 1);
        setStep('identify');
        setAnswers({
          oxidized: '',
          reduced: '',
          oxElectrons: '',
          redElectrons: '',
          oxMultiplier: '',
          redMultiplier: ''
        });
      } else {
        onComplete(score, maxScore, totalHintsUsed);
      }
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'identify':
        return (
          <div className="space-y-4">
            <div className="bg-purple-50 p-4 rounded-xl">
              <h3 className="font-bold text-purple-800 mb-2">Skref 1: Greindu hvað oxast og afoxast</h3>
              <p className="text-purple-600 text-sm">Mundu: Oxun = tapar e⁻, Afoxun = öðlast e⁻</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hvað oxast?</label>
                <input
                  type="text"
                  value={answers.oxidized}
                  onChange={(e) => setAnswers(prev => ({ ...prev, oxidized: e.target.value }))}
                  placeholder="t.d. Zn"
                  className="w-full p-3 border-2 border-blue-300 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hvað afoxast?</label>
                <input
                  type="text"
                  value={answers.reduced}
                  onChange={(e) => setAnswers(prev => ({ ...prev, reduced: e.target.value }))}
                  placeholder="t.d. Cu"
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
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-purple-500 hover:bg-purple-600 text-white'
                }`}
              >
                Athuga svar
              </button>
            )}
          </div>
        );

      case 'write-ox':
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-xl">
              <h3 className="font-bold text-blue-800 mb-2">Skref 2: Oxunar hálf-hvarf</h3>
              <div className="text-blue-600">
                {problem.oxidationHalf.speciesDisplay} → {problem.oxidationHalf.productDisplay} + ?e⁻
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hversu margar rafeindir tapar {problem.oxidationHalf.speciesDisplay}?
              </label>
              <input
                type="number"
                value={answers.oxElectrons}
                onChange={(e) => setAnswers(prev => ({ ...prev, oxElectrons: e.target.value }))}
                placeholder="Fjöldi rafeinda"
                className="w-full p-3 border-2 border-blue-300 rounded-xl focus:border-blue-500 focus:outline-none"
              />
            </div>

            {!feedback.show && (
              <button
                onClick={() => {
                  const correct = parseInt(answers.oxElectrons) === problem.oxidationHalf.electrons;
                  if (correct) {
                    setScore(prev => prev + 10);
                    setFeedback({ show: true, correct: true, message: 'Rétt!' });
                    onCorrectAnswer?.();
                  } else {
                    setFeedback({
                      show: true,
                      correct: false,
                      message: `${problem.oxidationHalf.speciesDisplay} → ${problem.oxidationHalf.productDisplay} + ${problem.oxidationHalf.electrons}e⁻`
                    });
                    onIncorrectAnswer?.();
                  }
                }}
                disabled={!answers.oxElectrons}
                className={`w-full font-bold py-3 px-6 rounded-xl ${
                  !answers.oxElectrons
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                Athuga
              </button>
            )}
          </div>
        );

      case 'write-red':
        return (
          <div className="space-y-4">
            <div className="bg-red-50 p-4 rounded-xl">
              <h3 className="font-bold text-red-800 mb-2">Skref 3: Afoxunar hálf-hvarf</h3>
              <div className="text-red-600">
                {problem.reductionHalf.speciesDisplay} + ?e⁻ → {problem.reductionHalf.productDisplay}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hversu margar rafeindir öðlast {problem.reductionHalf.speciesDisplay}?
              </label>
              <input
                type="number"
                value={answers.redElectrons}
                onChange={(e) => setAnswers(prev => ({ ...prev, redElectrons: e.target.value }))}
                placeholder="Fjöldi rafeinda"
                className="w-full p-3 border-2 border-red-300 rounded-xl focus:border-red-500 focus:outline-none"
              />
            </div>

            {!feedback.show && (
              <button
                onClick={() => {
                  const correct = parseInt(answers.redElectrons) === problem.reductionHalf.electrons;
                  if (correct) {
                    setScore(prev => prev + 10);
                    setFeedback({ show: true, correct: true, message: 'Rétt!' });
                    onCorrectAnswer?.();
                  } else {
                    setFeedback({
                      show: true,
                      correct: false,
                      message: `${problem.reductionHalf.speciesDisplay} + ${problem.reductionHalf.electrons}e⁻ → ${problem.reductionHalf.productDisplay}`
                    });
                    onIncorrectAnswer?.();
                  }
                }}
                disabled={!answers.redElectrons}
                className={`w-full font-bold py-3 px-6 rounded-xl ${
                  !answers.redElectrons
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
              >
                Athuga
              </button>
            )}
          </div>
        );

      case 'balance':
        return (
          <div className="space-y-4">
            <div className="bg-amber-50 p-4 rounded-xl">
              <h3 className="font-bold text-amber-800 mb-2">Skref 4: Jafna rafeindirnar</h3>
              <p className="text-amber-600 text-sm mb-3">
                Margfaldaðu hálf-hvörfin svo rafeindir sem tapast = rafeindir sem öðlast
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-blue-100 p-2 rounded">
                  Oxun: {problem.oxidationHalf.electrons}e⁻
                </div>
                <div className="bg-red-100 p-2 rounded">
                  Afoxun: {problem.reductionHalf.electrons}e⁻
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Margfaldari fyrir oxun:
                </label>
                <input
                  type="number"
                  value={answers.oxMultiplier}
                  onChange={(e) => setAnswers(prev => ({ ...prev, oxMultiplier: e.target.value }))}
                  placeholder="×?"
                  className="w-full p-3 border-2 border-blue-300 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Margfaldari fyrir afoxun:
                </label>
                <input
                  type="number"
                  value={answers.redMultiplier}
                  onChange={(e) => setAnswers(prev => ({ ...prev, redMultiplier: e.target.value }))}
                  placeholder="×?"
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
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-amber-500 hover:bg-amber-600 text-white'
                }`}
              >
                Athuga margfaldara
              </button>
            )}
          </div>
        );

      case 'complete':
        return (
          <div className="space-y-4">
            <div className="bg-green-50 p-6 rounded-xl border-2 border-green-400 text-center">
              <div className="text-4xl mb-2">✓</div>
              <h3 className="font-bold text-green-800 text-xl mb-2">Jöfnuð jafna!</h3>
              <div className="text-2xl font-mono text-green-700 mb-4">
                {problem.finalDisplay}
              </div>

              <div className="bg-white p-4 rounded-lg text-left text-sm">
                <div className="font-bold text-gray-700 mb-2">Samantekt:</div>
                <div className="space-y-1 text-gray-600">
                  <div>• Oxun: {problem.multiplierOx}×({problem.oxidationHalf.speciesDisplay} → {problem.oxidationHalf.productDisplay} + {problem.oxidationHalf.electrons}e⁻)</div>
                  <div>• Afoxun: {problem.multiplierRed}×({problem.reductionHalf.speciesDisplay} + {problem.reductionHalf.electrons}e⁻ → {problem.reductionHalf.productDisplay})</div>
                  <div className="font-bold text-green-700 pt-2">
                    Rafeindir: {problem.multiplierOx * problem.oxidationHalf.electrons} tapað = {problem.multiplierRed * problem.reductionHalf.electrons} öðlast ✓
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 p-4 md:p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <button onClick={onBack} className="text-gray-500 hover:text-gray-700">
            ← Til baka
          </button>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              Dæmi {currentProblem + 1} af {problems.length}
            </div>
            <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-bold">
              Stig: {score}
            </div>
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-center mb-2 text-purple-600">
          ⚖️ Jafna redox-jöfnur
        </h1>
        <p className="text-center text-gray-600 mb-4">
          Hálf-hvörf aðferðin
        </p>

        <div className="bg-gray-50 p-4 rounded-xl mb-6 text-center">
          <div className="text-sm text-gray-500 mb-1">{problem.description}</div>
          <div className="text-xl md:text-2xl font-mono font-bold text-gray-800">
            {problem.overallDisplay}
          </div>
        </div>

        <div className="flex justify-center gap-2 mb-6">
          {['identify', 'write-ox', 'write-red', 'balance', 'complete'].map((s, idx) => (
            <div
              key={s}
              className={`w-8 h-2 rounded-full ${
                s === step ? 'bg-purple-500' :
                ['identify', 'write-ox', 'write-red', 'balance', 'complete'].indexOf(step) > idx
                  ? 'bg-green-500'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        {renderStep()}

        {feedback.show && (
          <div className={`mt-4 p-4 rounded-xl ${
            feedback.correct ? 'bg-green-100 border-2 border-green-400' : 'bg-amber-100 border-2 border-amber-400'
          }`}>
            <div className={`font-bold ${feedback.correct ? 'text-green-800' : 'text-amber-800'}`}>
              {feedback.correct ? '✓ ' : '💡 '}{feedback.message}
            </div>
          </div>
        )}

        {feedback.show && (
          <button
            onClick={handleNext}
            className="w-full mt-4 bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-xl"
          >
            {step === 'complete'
              ? (currentProblem < problems.length - 1 ? 'Næsta dæmi →' : 'Ljúka stigi →')
              : 'Halda áfram →'}
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
              setTotalHintsUsed(prev => prev + 1);
            }}
            className="w-full mt-4 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-bold py-2 px-4 rounded-xl text-sm"
          >
            💡 Sýna vísbendingu
          </button>
        )}

        <div className="mt-6 w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-purple-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentProblem + 1) / problems.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
