import { useState } from 'react';

interface Level3Props {
  onComplete: (score: number, maxScore: number, hintsUsed: number) => void;
  onBack: () => void;
  onCorrectAnswer?: () => void;
  onIncorrectAnswer?: () => void;
}

interface AtomCharge {
  symbol: string;
  valenceElectrons: number;
  lonePairElectrons: number;
  bondingElectrons: number;
  formalCharge: number;
}

interface Challenge {
  id: number;
  title: string;
  type: 'calculate_fc' | 'best_structure' | 'resonance';
  molecule: string;
  description: string;
  atoms?: AtomCharge[];
  structures?: {
    id: string;
    description: string;
    formalCharges: { atom: string; charge: number }[];
    isPreferred: boolean;
    explanation: string;
  }[];
  resonanceForms?: {
    id: string;
    structure: string;
    isValid: boolean;
  }[];
  question: string;
  correctAnswer: string | number;
  options?: { id: string; text: string; correct: boolean; explanation: string }[];
  hint: string;
  explanation: string;
}

const challenges: Challenge[] = [
  {
    id: 1,
    title: 'Formhleðsla - Formúlan',
    type: 'calculate_fc',
    molecule: 'Formhleðsla',
    description: 'Formhleðsla (formal charge) segir til um hvernig rafeindum er dreift á atóm í Lewis-formúlu.',
    question: 'Hvaða formúla er notuð til að reikna formhleðslu?',
    correctAnswer: 'fc_formula',
    options: [
      { id: 'fc_formula', text: 'FC = Gildisraf. - (óbundnar + ½ bundnar)', correct: true, explanation: 'Rétt! Þetta er formúlan fyrir formhleðslu.' },
      { id: 'wrong1', text: 'FC = Gildisraf. - (óbundnar + bundnar)', correct: false, explanation: 'Bundnar rafeindir eru sameiginlegar, þannig að þú deilir með 2.' },
      { id: 'wrong2', text: 'FC = Gildisraf. + óbundnar - bundnar', correct: false, explanation: 'Þú dregur óbundnar og helminginn af bundnum frá gildisrafeindum.' },
    ],
    hint: 'Bundnar rafeindir eru sameiginlegar á milli atóma',
    explanation: 'FC = V - (L + ½B) þar sem V = gildisrafeindir, L = lone pair rafeindir, B = bundin rafeindir.',
  },
  {
    id: 2,
    title: 'Reikna formhleðslu: Súrefni í vatni',
    type: 'calculate_fc',
    molecule: 'H₂O',
    description: 'Í vatni hefur súrefni 2 einstæð pör (4 óbundnar rafeindir) og 2 tengsl (4 bundnar rafeindir).',
    atoms: [
      { symbol: 'O', valenceElectrons: 6, lonePairElectrons: 4, bondingElectrons: 4, formalCharge: 0 },
    ],
    question: 'Hver er formhleðsla súrefnisins í H₂O?',
    correctAnswer: 0,
    options: [
      { id: '-1', text: '-1', correct: false, explanation: 'FC = 6 - (4 + ½×4) = 6 - 6 = 0, ekki -1.' },
      { id: '0', text: '0', correct: true, explanation: 'Rétt! FC = 6 - (4 + 2) = 0. Súrefnið hefur enga formhleðslu.' },
      { id: '+1', text: '+1', correct: false, explanation: 'Jákvæð formhleðsla myndi þýða of fáar rafeindir.' },
    ],
    hint: 'FC = 6 - (4 óbundnar + ½ × 4 bundnar)',
    explanation: 'O í H₂O: FC = 6 - (4 + 2) = 0. Súrefnið hefur enga formhleðslu, sem er æskilegt.',
  },
  {
    id: 3,
    title: 'Reikna formhleðslu: Nitur í ammóníum',
    type: 'calculate_fc',
    molecule: 'NH₄⁺',
    description: 'Í ammóníumjóninni er nitur tengt við 4 vetni með einföldum tengslum og engin einstæð pör.',
    atoms: [
      { symbol: 'N', valenceElectrons: 5, lonePairElectrons: 0, bondingElectrons: 8, formalCharge: 1 },
    ],
    question: 'Hver er formhleðsla nitursins í NH₄⁺?',
    correctAnswer: 1,
    options: [
      { id: '0', text: '0', correct: false, explanation: 'Nitur deilir 8 rafeindum en á aðeins 5 gildisrafeindir.' },
      { id: '+1', text: '+1', correct: true, explanation: 'Rétt! FC = 5 - (0 + ½×8) = 5 - 4 = +1.' },
      { id: '-1', text: '-1', correct: false, explanation: 'Neikvæð formhleðsla myndi þýða fleiri rafeindir en gildisrafeindir.' },
    ],
    hint: 'Nitur hefur 5 gildisrafeindir en deilir 8 í tengslum',
    explanation: 'N í NH₄⁺: FC = 5 - (0 + 4) = +1. Þetta samræmist við +1 hleðslu jónarinnar.',
  },
  {
    id: 4,
    title: 'Besta Lewis-formúlan',
    type: 'best_structure',
    molecule: 'CO',
    description: 'Kolsýringur getur teiknast á mismunandi vegu. Formhleðsla hjálpar okkur að velja bestu formúluna.',
    structures: [
      {
        id: 'triple',
        description: 'C≡O (þreföld tengsl)',
        formalCharges: [{ atom: 'C', charge: -1 }, { atom: 'O', charge: +1 }],
        isPreferred: true,
        explanation: 'Þreföld tengsl uppfylla áttu fyrir bæði atóm og lágmarka formhleðslu.',
      },
      {
        id: 'double',
        description: 'C=O (tvöföld tengsl)',
        formalCharges: [{ atom: 'C', charge: 0 }, { atom: 'O', charge: 0 }],
        isPreferred: false,
        explanation: 'Kolefni hefur aðeins 6 rafeindir - uppfyllir ekki áttu.',
      },
    ],
    question: 'Hver er æskilegasta formúlan fyrir CO?',
    correctAnswer: 'triple',
    options: [
      { id: 'triple', text: ':C≡O: með þreföldum tengslum', correct: true, explanation: 'Rétt! Bæði atóm hafa 8 rafeindir, þó formhleðslur séu ekki núll.' },
      { id: 'double', text: 'C=O með tvöföldum tengslum', correct: false, explanation: 'Kolefni fengi aðeins 6 rafeindir - uppfyllir ekki áttu.' },
    ],
    hint: 'Áttureglan er mikilvægari en lágmarks formhleðsla',
    explanation: 'Í CO er þreföld tengsl æskilegust þó hún gefi formhleðslur C⁻ og O⁺, vegna þess að þá uppfylla bæði atóm átturegluna.',
  },
  {
    id: 5,
    title: 'Samsvörunarformúlur I',
    type: 'resonance',
    molecule: 'NO₂⁻',
    description: 'Nítrítjónin hefur tvær jafngildar samsvörunarformúlur.',
    resonanceForms: [
      { id: 'a', structure: 'O=N-O⁻', isValid: true },
      { id: 'b', structure: '⁻O-N=O', isValid: true },
    ],
    question: 'Hversu margar samsvörunarformúlur hefur NO₂⁻?',
    correctAnswer: '2',
    options: [
      { id: '1', text: '1 formúla', correct: false, explanation: 'Tvöfalda tengslin geta verið á sitt hvoru O-inu.' },
      { id: '2', text: '2 formúlur', correct: true, explanation: 'Rétt! O=N-O⁻ og ⁻O-N=O eru jafngildar samsvörunarformúlur.' },
      { id: '3', text: '3 formúlur', correct: false, explanation: 'Aðeins tvær eru mögulegar með þessari rafeindasamsetningu.' },
    ],
    hint: 'Tvöfalda tengslin geta verið á sitt hvoru O-inu',
    explanation: 'NO₂⁻ hefur tvær samsvörunarformúlur þar sem tvöfalda tengslin "hoppa" á milli súrefnisatómanna. Raunverulega sameindina er meðaltal beggja.',
  },
  {
    id: 6,
    title: 'Samsvörunarformúlur II',
    type: 'resonance',
    molecule: 'CO₃²⁻',
    description: 'Karbónatjónin er klassískt dæmi um samsvörun.',
    resonanceForms: [
      { id: 'a', structure: 'O=C(-O⁻)₂', isValid: true },
      { id: 'b', structure: '⁻O-C(=O)-O⁻', isValid: true },
      { id: 'c', structure: '(⁻O)₂-C=O', isValid: true },
    ],
    question: 'Hversu margar samsvörunarformúlur hefur CO₃²⁻?',
    correctAnswer: '3',
    options: [
      { id: '2', text: '2 formúlur', correct: false, explanation: 'Þrjú súrefni geta hvert um sig haft tvöfalt tengi.' },
      { id: '3', text: '3 formúlur', correct: true, explanation: 'Rétt! Tvöfalda tengið getur verið á hverju súrefni.' },
      { id: '4', text: '4 formúlur', correct: false, explanation: 'Með 3 súrefni eru aðeins 3 möguleikar.' },
    ],
    hint: 'Hvert súrefni getur haft tvöfalda tengið',
    explanation: 'CO₃²⁻ hefur þrjár samsvörunarformúlur. Raunveruleg tengsla-lengd er eins fyrir öll þrjú C-O tengslin (á milli einfalds og tvöfalds).',
  },
  {
    id: 7,
    title: 'Raunveruleg sameindin',
    type: 'resonance',
    molecule: 'O₃',
    description: 'Ósón hefur tvær samsvörunarformúlur.',
    question: 'Hvaða fullyrðing er rétt um ósón (O₃)?',
    correctAnswer: 'hybrid',
    options: [
      { id: 'flips', text: 'Sameindin "flippar" milli formúla', correct: false, explanation: 'Nei, sameindin er alltaf hybrid - hún breytist ekki.' },
      { id: 'hybrid', text: 'Sameindin er hybrid af öllum formúlum', correct: true, explanation: 'Rétt! Raunverulega sameindin er stöðugt meðaltal allra samsvörunarformúla.' },
      { id: 'one', text: 'Aðeins ein formúla er rétt', correct: false, explanation: 'Báðar formúlur eru jafngildar og sameindin er hybrid.' },
    ],
    hint: 'Samsvörunarformúlur sýna takmarkanir Lewis-formúla',
    explanation: 'Samsvörunarformúlur eru ekki mismunandi form sameindarinnar. Raunverulega sameindin er einn "hybrid" sem er meðaltal allra samsvörunarformúla.',
  },
  {
    id: 8,
    title: 'Formhleðsla og stöðugleiki',
    type: 'best_structure',
    molecule: 'SCN⁻',
    description: 'Þíósýanatjónin getur teiknast á nokkra vegu.',
    question: 'Hvaða regla gildir um bestu Lewis-formúluna?',
    correctAnswer: 'minimize',
    options: [
      { id: 'maximize', text: 'Hámarka formhleðslur', correct: false, explanation: 'Háar formhleðslur gera sameindir óstöðugri.' },
      { id: 'minimize', text: 'Lágmarka formhleðslur (helst 0)', correct: true, explanation: 'Rétt! Lægri formhleðslur = stöðugri sameind.' },
      { id: 'negative', text: 'Setja neikvæða hleðslu á C', correct: false, explanation: 'Neikvæð hleðsla ætti að vera á rafeinadrægnasta atóminu.' },
    ],
    hint: 'Stöðugri formúlur hafa lægri formhleðslur',
    explanation: 'Bestu Lewis-formúlur hafa: (1) Lágmarks formhleðslur, (2) Neikvæð hleðsla á rafeinadrægnasta atómi, (3) Uppfyllt átta.',
  },
];

// Calculate max score: 8 challenges * 15 points each = 120
const MAX_SCORE = 120;

export function Level3({ onComplete, onBack, onCorrectAnswer, onIncorrectAnswer }: Level3Props) {
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [totalHintsUsed, setTotalHintsUsed] = useState(0);

  const challenge = challenges[currentChallenge];

  const checkAnswer = () => {
    const correct = challenge.options?.find(opt => opt.id === selectedAnswer)?.correct ?? false;

    if (correct) {
      onCorrectAnswer?.();
      if (!showHint) {
        setScore(prev => prev + 15);
      } else {
        setScore(prev => prev + 8);
      }
    } else {
      onIncorrectAnswer?.();
    }

    setShowResult(true);
  };

  const nextChallenge = () => {
    if (currentChallenge < challenges.length - 1) {
      setCurrentChallenge(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setShowHint(false);
    } else {
      onComplete(score, MAX_SCORE, totalHintsUsed);
    }
  };

  const isCorrect = challenge.options?.find(opt => opt.id === selectedAnswer)?.correct ?? false;

  // Render formal charge badge
  const renderFormalCharge = (charge: number) => {
    if (charge === 0) return null;

    const chargeText = charge > 0 ? `+${charge}` : `${charge}`;
    const bgColor = charge > 0 ? 'bg-red-500' : 'bg-blue-500';

    return (
      <div className={`absolute -top-2 -right-2 ${bgColor} text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm`}>
        {chargeText}
      </div>
    );
  };

  // Render lone pairs as dots
  const renderLonePairs = (count: number, position: 'top' | 'bottom' | 'left' | 'right') => {
    if (count === 0) return null;
    const pairs = Math.floor(count / 2);
    if (pairs === 0) return null;

    const positionClasses: Record<string, string> = {
      'top': 'absolute -top-4 left-1/2 -translate-x-1/2',
      'bottom': 'absolute -bottom-4 left-1/2 -translate-x-1/2',
      'left': 'absolute top-1/2 -left-4 -translate-y-1/2',
      'right': 'absolute top-1/2 -right-4 -translate-y-1/2',
    };

    return (
      <div className={`${positionClasses[position]} flex gap-0.5`}>
        {Array(Math.min(pairs, 2)).fill(0).map((_, i) => (
          <div key={i} className="flex gap-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-600" />
            <div className="w-1.5 h-1.5 rounded-full bg-purple-600" />
          </div>
        ))}
      </div>
    );
  };

  // Render bonding electrons as lines
  const renderBonds = (bondingElectrons: number) => {
    const bondCount = bondingElectrons / 2;
    return (
      <div className="flex flex-col gap-0.5">
        {Array(Math.min(bondCount, 4)).fill(0).map((_, i) => (
          <div key={i} className="w-6 h-0.5 bg-gray-600" />
        ))}
      </div>
    );
  };

  // Render atom visualization for FC calculations
  const renderAtomVisualization = (atom: AtomCharge, showCharge: boolean) => {
    const lonePairs = atom.lonePairElectrons / 2;

    return (
      <div className="flex items-center justify-center gap-2 py-4">
        {/* Bonding electrons on left */}
        <div className="flex items-center">
          <div className="text-xs text-gray-500 mr-2">tengsl</div>
          {renderBonds(atom.bondingElectrons)}
        </div>

        {/* Atom with lone pairs */}
        <div className="relative mx-4">
          <div className="w-16 h-16 rounded-full border-4 border-purple-500 bg-purple-100 flex items-center justify-center font-bold text-xl text-purple-800">
            {atom.symbol}
          </div>
          {/* Show formal charge when revealed */}
          {showCharge && renderFormalCharge(atom.formalCharge)}
          {/* Lone pairs */}
          {lonePairs >= 1 && renderLonePairs(2, 'top')}
          {lonePairs >= 2 && renderLonePairs(2, 'bottom')}
        </div>

        {/* Electron count summary */}
        <div className="text-xs text-gray-600 ml-4 text-left">
          <div>V = {atom.valenceElectrons}</div>
          <div>L = {atom.lonePairElectrons}</div>
          <div>B = {atom.bondingElectrons}</div>
        </div>
      </div>
    );
  };

  // Render structure comparison for best_structure challenges
  const renderStructureComparison = (structures: NonNullable<Challenge['structures']>) => {
    return (
      <div className="flex flex-wrap justify-center gap-6 py-4">
        {structures.map((struct) => (
          <div key={struct.id} className={`p-4 rounded-xl border-2 ${
            showResult && struct.isPreferred
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200 bg-white'
          }`}>
            {/* Structure visualization */}
            <div className="flex items-center justify-center gap-1 mb-3">
              {struct.formalCharges.map((fc, idx) => (
                <div key={idx} className="relative mx-1">
                  <div className={`w-12 h-12 rounded-full border-3 flex items-center justify-center font-bold ${
                    idx === 0 ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-green-400 bg-green-50 text-green-700'
                  }`}>
                    {fc.atom}
                  </div>
                  {fc.charge !== 0 && (
                    <div className={`absolute -top-1.5 -right-1.5 ${fc.charge > 0 ? 'bg-red-500' : 'bg-blue-500'} text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center`}>
                      {fc.charge > 0 ? '+' : '−'}
                    </div>
                  )}
                  {/* Bond between atoms */}
                  {idx < struct.formalCharges.length - 1 && (
                    <div className="absolute top-1/2 -right-3 transform -translate-y-1/2">
                      {struct.id === 'triple' ? (
                        <div className="flex flex-col gap-0.5">
                          <div className="w-4 h-0.5 bg-gray-700" />
                          <div className="w-4 h-0.5 bg-gray-700" />
                          <div className="w-4 h-0.5 bg-gray-700" />
                        </div>
                      ) : (
                        <div className="flex flex-col gap-0.5">
                          <div className="w-4 h-0.5 bg-gray-700" />
                          <div className="w-4 h-0.5 bg-gray-700" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {/* Structure label */}
            <div className="text-center text-sm font-mono font-bold text-gray-700">
              {struct.description}
            </div>
            {/* Formal charges text */}
            <div className="text-center text-xs text-gray-500 mt-1">
              {struct.formalCharges.map(fc =>
                `${fc.atom}: ${fc.charge >= 0 ? '+' : ''}${fc.charge}`
              ).join(', ')}
            </div>
            {/* Preferred badge */}
            {showResult && struct.isPreferred && (
              <div className="text-center mt-2">
                <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  ✓ Æskilegast
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Render resonance structures visualization
  const renderResonanceStructures = (forms: NonNullable<Challenge['resonanceForms']>) => {
    return (
      <div className="flex flex-wrap justify-center items-center gap-4 py-4">
        {forms.map((form, idx) => (
          <div key={form.id} className="flex items-center gap-2">
            <div className={`p-3 rounded-lg border-2 ${
              form.isValid ? 'border-purple-300 bg-purple-50' : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="font-mono text-lg font-bold text-purple-800">
                {form.structure}
              </div>
            </div>
            {/* Double arrow between structures */}
            {idx < forms.length - 1 && (
              <div className="text-2xl text-purple-400 font-bold">⟷</div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800 flex items-center gap-2"
          >
            <span>&larr;</span> Til baka
          </button>
          <div className="text-right">
            <div className="text-sm text-gray-600">Stig 3 / Þraut {currentChallenge + 1} af {challenges.length}</div>
            <div className="text-lg font-bold text-purple-600">{score} stig</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div
            className="bg-purple-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentChallenge + 1) / challenges.length) * 100}%` }}
          />
        </div>

        {/* Main content */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
          <h2 className="text-2xl font-bold text-purple-800 mb-2">
            {challenge.title}
          </h2>

          {challenge.molecule && (
            <div className="inline-block bg-purple-50 px-4 py-2 rounded-lg mb-4">
              <span className="font-mono text-2xl font-bold text-purple-700">{challenge.molecule}</span>
            </div>
          )}

          <p className="text-gray-600 mb-6">{challenge.description}</p>

          {/* Atom info for FC calculations - with visual diagram */}
          {challenge.atoms && (
            <div className="bg-gray-50 p-4 rounded-xl mb-6">
              <h3 className="font-bold text-gray-700 mb-3">Rafeindasamsetning:</h3>
              {/* Visual atom diagram */}
              {challenge.atoms.map((atom, idx) => (
                <div key={idx}>
                  {renderAtomVisualization(atom, showResult)}
                </div>
              ))}
              {/* FC calculation shown after answer */}
              {showResult && challenge.atoms.map((atom, idx) => (
                <div key={`calc-${idx}`} className="mt-4 p-3 bg-white rounded-lg border border-purple-200">
                  <div className="text-sm font-mono text-center">
                    <span className="text-gray-600">FC = </span>
                    <span className="text-purple-600">{atom.valenceElectrons}</span>
                    <span className="text-gray-600"> - (</span>
                    <span className="text-blue-600">{atom.lonePairElectrons}</span>
                    <span className="text-gray-600"> + ½×</span>
                    <span className="text-green-600">{atom.bondingElectrons}</span>
                    <span className="text-gray-600">) = </span>
                    <span className={`font-bold ${atom.formalCharge === 0 ? 'text-green-600' : atom.formalCharge > 0 ? 'text-red-600' : 'text-blue-600'}`}>
                      {atom.formalCharge >= 0 ? '+' : ''}{atom.formalCharge}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Structure options for best structure challenges - with visual diagram */}
          {challenge.structures && (
            <div className="bg-gray-50 p-4 rounded-xl mb-6">
              <h3 className="font-bold text-gray-700 mb-3">Möguleg form:</h3>
              {renderStructureComparison(challenge.structures)}
            </div>
          )}

          {/* Resonance structures visualization */}
          {challenge.resonanceForms && (
            <div className="bg-gray-50 p-4 rounded-xl mb-6">
              <h3 className="font-bold text-gray-700 mb-3">Samsvörunarformúlur:</h3>
              {renderResonanceStructures(challenge.resonanceForms)}
            </div>
          )}

          {/* Question */}
          <p className="text-lg font-medium text-gray-800 mb-4">{challenge.question}</p>

          {/* Options */}
          <div className="space-y-3 mb-6">
            {challenge.options?.map(option => (
              <button
                key={option.id}
                onClick={() => !showResult && setSelectedAnswer(option.id)}
                disabled={showResult}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  showResult
                    ? option.correct
                      ? 'border-green-500 bg-green-50'
                      : selectedAnswer === option.id
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 bg-gray-50 opacity-50'
                    : selectedAnswer === option.id
                    ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'
                    : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                }`}
              >
                <span>{option.text}</span>
                {showResult && selectedAnswer === option.id && (
                  <div className={`mt-2 text-sm ${option.correct ? 'text-green-700' : 'text-red-700'}`}>
                    {option.explanation}
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Hint button */}
          {!showResult && !showHint && (
            <button
              onClick={() => {
                setShowHint(true);
                setTotalHintsUsed(prev => prev + 1);
              }}
              className="text-purple-600 hover:text-purple-800 text-sm underline mb-4"
            >
              Sýna vísbendingu (-7 stig)
            </button>
          )}

          {showHint && !showResult && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl mb-4">
              <span className="font-bold text-yellow-800">Vísbending: </span>
              <span className="text-yellow-900">{challenge.hint}</span>
            </div>
          )}

          {/* Check answer button */}
          {!showResult && (
            <button
              onClick={checkAnswer}
              disabled={!selectedAnswer}
              className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white font-bold py-4 px-6 rounded-xl transition-colors"
            >
              Athuga svar
            </button>
          )}

          {/* Result feedback */}
          {showResult && (
            <div className={`p-4 rounded-xl mb-4 ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className={`font-bold text-lg mb-2 ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                {isCorrect ? 'Rétt!' : 'Rangt'}
              </div>
              <div className="text-sm text-gray-700">{challenge.explanation}</div>
            </div>
          )}

          {/* Next button */}
          {showResult && (
            <button
              onClick={nextChallenge}
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-4 px-6 rounded-xl transition-colors"
            >
              {currentChallenge < challenges.length - 1 ? 'Næsta þraut' : 'Ljúka stigi 3'}
            </button>
          )}
        </div>

        {/* Reference card */}
        <div className="mt-6 bg-white rounded-xl p-4 shadow">
          <h3 className="font-bold text-gray-700 mb-3">Formhleðsluformúlan</h3>
          <div className="bg-purple-50 p-3 rounded-lg text-center font-mono mb-3">
            <strong>FC = V - (L + ½B)</strong>
          </div>
          <ul className="text-sm text-gray-600 space-y-1">
            <li><strong>V</strong> = Gildisrafeindir (frá lotukerfinu)</li>
            <li><strong>L</strong> = Óbundnar rafeindir (lone pairs)</li>
            <li><strong>B</strong> = Bundnar rafeindir (í tengslum)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
