import { useState } from 'react';

interface Level3Props {
  onComplete: (score: number, maxScore: number, hintsUsed: number) => void;
  onBack: () => void;
  onCorrectAnswer?: () => void;
  onIncorrectAnswer?: () => void;
}

interface Challenge {
  id: number;
  type: 'hybridization' | 'polarity' | 'multi_center' | 'dipole';
  formula: string;
  name: string;
  question: string;
  lewisStructure?: string;
  options: { id: string; text: string; correct: boolean; explanation: string }[];
  hint: string;
  conceptExplanation: string;
}

const challenges: Challenge[] = [
  // Hybridization questions
  {
    id: 1,
    type: 'hybridization',
    formula: 'CH₄',
    name: 'Metan',
    question: 'Hvaða blendni (hybridization) hefur kolefnið í CH₄?',
    options: [
      { id: 'a', text: 'sp', correct: false, explanation: 'sp blendni gefur línulega lögun (2 svið).' },
      { id: 'b', text: 'sp²', correct: false, explanation: 'sp² blendni gefur þríhyrnda sléttu (3 svið).' },
      { id: 'c', text: 'sp³', correct: true, explanation: 'Rétt! 4 rafeinasvið = sp³ blendni = fjórflötungur.' },
      { id: 'd', text: 'sp³d', correct: false, explanation: 'sp³d krefst 5 rafeinasviða.' }
    ],
    hint: 'Fjöldi rafeinasviða ákvarðar blendnina: 2=sp, 3=sp², 4=sp³...',
    conceptExplanation: 'Blendni lýsir hvernig atómbreytir (orbitals) blandast saman. Fjöldi blandaðra breyti = fjöldi rafeinasviða.'
  },
  {
    id: 2,
    type: 'hybridization',
    formula: 'CO₂',
    name: 'Koltvísýringur',
    question: 'Hvaða blendni hefur kolefnið í CO₂?',
    options: [
      { id: 'a', text: 'sp', correct: true, explanation: 'Rétt! 2 rafeinasvið (2 tvöfald tengingar) = sp blendni = línuleg.' },
      { id: 'b', text: 'sp²', correct: false, explanation: 'sp² gefur þríhyrnd sléttu lögun.' },
      { id: 'c', text: 'sp³', correct: false, explanation: 'sp³ gefur fjórflötung.' },
      { id: 'd', text: 'Engin blendni', correct: false, explanation: 'Kolefni notar alltaf blendni í efnatengsli.' }
    ],
    hint: 'Tvöfald tenging telst sem EITT rafeinasvið.',
    conceptExplanation: 'Í CO₂ hefur kolefni 2 tvöfalt tengingar við súrefni. Hver tvöfald tenging telur sem eitt rafeinasvið, svo C hefur 2 rafeinasvið og sp blendni.'
  },
  {
    id: 3,
    type: 'hybridization',
    formula: 'NH₃',
    name: 'Ammóníak',
    question: 'Hvaða blendni hefur nitrið í NH₃?',
    options: [
      { id: 'a', text: 'sp', correct: false, explanation: 'sp hefur aðeins 2 rafeinasvið.' },
      { id: 'b', text: 'sp²', correct: false, explanation: 'sp² hefur 3 rafeinasvið.' },
      { id: 'c', text: 'sp³', correct: true, explanation: 'Rétt! 3 tengsl + 1 einstætt par = 4 rafeinasvið = sp³.' },
      { id: 'd', text: 'sp³d', correct: false, explanation: 'sp³d krefst 5 rafeinasviða.' }
    ],
    hint: 'Mundu að telja EINSTÆÐ PÖR sem rafeinasvið líka!',
    conceptExplanation: 'NH₃ hefur 3 N-H tengsl og 1 einstætt par á nitri = 4 rafeinasvið = sp³ blendni. Þó sameindarlögunin sé þríhyrnd pýramída er blendnin enn sp³.'
  },
  {
    id: 4,
    type: 'hybridization',
    formula: 'SF₆',
    name: 'Brennisteinshexaflúoríð',
    question: 'Hvaða blendni hefur brennisteinið í SF₆?',
    options: [
      { id: 'a', text: 'sp³', correct: false, explanation: 'sp³ hefur aðeins 4 rafeinasvið.' },
      { id: 'b', text: 'sp³d', correct: false, explanation: 'sp³d hefur 5 rafeinasvið.' },
      { id: 'c', text: 'sp³d²', correct: true, explanation: 'Rétt! 6 tengsl = 6 rafeinasvið = sp³d² blendni = áttflötungur.' },
      { id: 'd', text: 'd²sp³', correct: false, explanation: 'Þetta er sama og sp³d², en sp³d² er algengari ritháttður.' }
    ],
    hint: 'S hefur 6 F tengingar = 6 rafeinasvið. Þetta krefst d-breytu.',
    conceptExplanation: 'Fyrir 5+ rafeinasvið þarf að nota d-breytir (orbitals). 5 svið = sp³d, 6 svið = sp³d². Þetta er mögulegt fyrir frumefni í 3. röð og neðar.'
  },
  // Polarity questions
  {
    id: 5,
    type: 'polarity',
    formula: 'H₂O',
    name: 'Vatn',
    question: 'Er vatn (H₂O) skautuð eða óskautuð sameind?',
    options: [
      { id: 'a', text: 'Skautuð', correct: true, explanation: 'Rétt! Beygð lögun gerir að verkum að tvískautsvægin jafnast ekki út.' },
      { id: 'b', text: 'Óskautuð', correct: false, explanation: 'Vatn er skautað vegna beygðu lögunarinnar.' },
      { id: 'c', text: 'Fer eftir hitastigi', correct: false, explanation: 'Skautun ákvarðast af efnafræðilegri byggingu, ekki hitastigi.' },
      { id: 'd', text: 'Fer eftir jónstyrk', correct: false, explanation: 'Jónstyrkur hefur ekki áhrif á sameindarskautun.' }
    ],
    hint: 'Hugsaðu um lögunina — ef O-H tvískautsvægin benda í mismunandi áttir, hvað gerist?',
    conceptExplanation: 'Í H₂O eru tvö skautuð O-H tengisl sem benda í mismunandi áttir (104.5° horn). Tvískautsvægin jafnast ekki út → skautuð sameind.'
  },
  {
    id: 6,
    type: 'polarity',
    formula: 'CO₂',
    name: 'Koltvísýringur',
    question: 'Er CO₂ skautuð eða óskautuð sameind?',
    options: [
      { id: 'a', text: 'Skautuð', correct: false, explanation: 'Þó C=O tengslin séu skautuð, þá er sameindin ekki skautuð.' },
      { id: 'b', text: 'Óskautuð', correct: true, explanation: 'Rétt! Línuleg lögun (180°) — tvískautsvægin jafnast út.' },
      { id: 'c', text: 'Lítillega skautuð', correct: false, explanation: 'Skautun er annaðhvort til staðar eða ekki í þessari samhengi.' },
      { id: 'd', text: 'Fer eftir þrýstingi', correct: false, explanation: 'Þrýstingur hefur ekki áhrif á sameindarskautun.' }
    ],
    hint: 'Línuleg lögun — C=O tvískautsvægin vísa í gagnstæðar áttir.',
    conceptExplanation: 'Hvert C=O tengi er skautað (O er rafneikvæðara). En í línulegri lögun (180°) vísa tvískautsvægin í GAGNSTÆÐAR áttir og hætta við hvort annað → nettó tvískautsvægi = 0.'
  },
  {
    id: 7,
    type: 'polarity',
    formula: 'BF₃',
    name: 'Bórþríflúoríð',
    question: 'Er BF₃ skautuð eða óskautuð sameind?',
    options: [
      { id: 'a', text: 'Skautuð vegna F atóma', correct: false, explanation: 'Þó B-F tengslin séu skautuð, er sameindin samhverf.' },
      { id: 'b', text: 'Óskautuð vegna samhverfu', correct: true, explanation: 'Rétt! Þríhyrnd slétt lögun er samhverf — tvískautsvægin jafnast út.' },
      { id: 'c', text: 'Skautuð vegna bórs', correct: false, explanation: 'Bór er ekki mjög rafneikvætt miðað við flúor.' },
      { id: 'd', text: 'Misjafnlega skautuð', correct: false, explanation: 'Sameind er annaðhvort skautuð eða ekki.' }
    ],
    hint: 'Þríhyrnd slétt lögun (120°) — þrjú eins tengisl.',
    conceptExplanation: 'BF₃ er þríhyrnd slétt (120° milli allra tengja). Þrjú jafn skautuð B-F tengisl draga í þrjár jafnar áttir → kraftarnir jafnast út → óskautuð sameind.'
  },
  {
    id: 8,
    type: 'polarity',
    formula: 'CHCl₃',
    name: 'Klóróform',
    question: 'Er CHCl₃ (klóróform) skautuð eða óskautuð sameind?',
    options: [
      { id: 'a', text: 'Óskautuð vegna fjórflötungs', correct: false, explanation: 'Fjórflötungur er samhverfur, en CHCl₃ hefur mismunandi atóm.' },
      { id: 'b', text: 'Skautuð vegna ósamhverfu', correct: true, explanation: 'Rétt! C-H og C-Cl hafa mismunandi skautun — ósamhverft dreifing.' },
      { id: 'c', text: 'Aðeins H er skautað', correct: false, explanation: 'Bæði C-H og C-Cl tengisl eru skautuð.' },
      { id: 'd', text: 'Fer eftir leysi', correct: false, explanation: 'Skautun ákvarðast af byggingu sameindarinnar.' }
    ],
    hint: 'Berðu saman CH₄ (óskautuð) við CHCl₃ — hvað er breytt?',
    conceptExplanation: 'Í CH₄ eru öll 4 tengslin eins → samhverf → óskautuð. Í CHCl₃ eru 1 H og 3 Cl — ósamhverf → skautuð. C-Cl tengsl draga miklu meira en C-H.'
  },
  // Multi-center molecules
  {
    id: 9,
    type: 'multi_center',
    formula: 'C₂H₄',
    name: 'Eten (etýlen)',
    lewisStructure: 'H₂C = CH₂',
    question: 'Hvaða blendni hafa BÆÐI kolefnin í C₂H₄ (eten)?',
    options: [
      { id: 'a', text: 'sp', correct: false, explanation: 'sp gefur línulega lögun, en C₂H₄ er slétt.' },
      { id: 'b', text: 'sp²', correct: true, explanation: 'Rétt! Hvert C hefur 3 rafeinasvið (2 C-H + 1 C=C) = sp² blendni.' },
      { id: 'c', text: 'sp³', correct: false, explanation: 'sp³ krefst 4 rafeinasviða, en hvert C hefur aðeins 3.' },
      { id: 'd', text: 'Mismunandi blendni', correct: false, explanation: 'Bæði kolefnin eru í nákvæmlega sömu stöðu.' }
    ],
    hint: 'Tvöfald C=C tenging telur sem EITT rafeinasvið. Teldu svið í kringum hvort C.',
    conceptExplanation: 'Í C₂H₄ hefur hvert C: 2 tengsl við H + 1 tengsl við hitt C (tvöfalt tengi). = 3 rafeinasvið = sp² blendni. Öll atóm liggja í einni slétti.'
  },
  {
    id: 10,
    type: 'multi_center',
    formula: 'C₂H₂',
    name: 'Etín (asetýlen)',
    lewisStructure: 'H-C≡C-H',
    question: 'Hvaða blendni hafa kolefnin í C₂H₂ (etín)?',
    options: [
      { id: 'a', text: 'sp', correct: true, explanation: 'Rétt! Hvert C hefur 2 rafeinasvið (1 C-H + 1 C≡C) = sp blendni = línuleg.' },
      { id: 'b', text: 'sp²', correct: false, explanation: 'sp² krefst 3 rafeinasviða.' },
      { id: 'c', text: 'sp³', correct: false, explanation: 'sp³ krefst 4 rafeinasviða.' },
      { id: 'd', text: 'Engin blendni', correct: false, explanation: 'Kolefni notar alltaf blendni í sameindum.' }
    ],
    hint: 'Þreföld tenging telur einnig sem EITT rafeinasvið.',
    conceptExplanation: 'Í C₂H₂ er þreföld tenging milli kolefnanna. Hvert C hefur aðeins 2 rafeinasvið (C-H + C≡C) = sp blendni. Sameindin er línuleg (180°).'
  },
  // Dipole moment questions
  {
    id: 11,
    type: 'dipole',
    formula: 'CCl₄',
    name: 'Kolefnistetraklóríð',
    question: 'CCl₄ hefur fjögur C-Cl tengisl sem eru öll skautuð. Af hverju er CCl₄ þá ÓSKAUTUÐ sameind?',
    options: [
      { id: 'a', text: 'C-Cl tengisl eru í raun óskautuð', correct: false, explanation: 'C-Cl tengisl ERU skautuð (Cl er rafneikvæðara).' },
      { id: 'b', text: 'Fjórflötungslögun er samhverf — tvískautsvægi jafnast út', correct: true, explanation: 'Rétt! Fjögur jafn skautuð tengisl í fjórflötungi draga í jafnar áttir → nettó tvískautsvægi = 0.' },
      { id: 'c', text: 'Klór er ekki nægilega rafneikvætt', correct: false, explanation: 'Klór er mjög rafneikvætt.' },
      { id: 'd', text: 'Kolefni er óleiðandi', correct: false, explanation: 'Leiðni hefur ekkert með skautun að gera.' }
    ],
    hint: 'Hugsaðu um fjórflötunginn — ef þú dregur í allar 4 áttir jafnt...',
    conceptExplanation: 'Þetta er klassískt dæmi um SAMHVERFU. Þó hvert C-Cl tengi sé skautað, þá eru þau SAMHVERF dreifð í rúminu (fjórflötungur). Kraftarnir jafnast út → enginn nettó tvískautsvægi.'
  },
  {
    id: 12,
    type: 'dipole',
    formula: 'NF₃ vs. NH₃',
    name: 'Samanburður',
    question: 'Bæði NF₃ og NH₃ hafa þríhyrnda pýramídalögun. Hvor er MEIRA skautuð?',
    options: [
      { id: 'a', text: 'NF₃ er meira skautuð vegna F', correct: false, explanation: 'F er rafneikvæðara, en það er ekki allt...' },
      { id: 'b', text: 'NH₃ er meira skautuð', correct: true, explanation: 'Rétt! Í NH₃ benda einstæða parið og N-H tvískautsvægin í SÖMU átt. Í NF₃ benda þau í GAGNSTÆÐAR áttir.' },
      { id: 'c', text: 'Þær eru jafn skatuaðar', correct: false, explanation: 'Stefna tvískautsvægis skiptir máli.' },
      { id: 'd', text: 'Hvorug er skautuð', correct: false, explanation: 'Báðar eru skatuaðar, en misjafnlega.' }
    ],
    hint: 'Hugsaðu um einstæða parið á N — hvert bendir það? Og hvert benda tengslin?',
    conceptExplanation: 'Í NH₃: N-H tengisl benda FRÁ N (H er δ+) og einstæða parið bendir einnig upp → allir kraftar benda í SÖMU ÁTTINA → stórt tvískautsvægi. Í NF₃: N-F tengisl benda MÓTI N (F er δ-) en einstæða parið bendir í GAGNSTÆÐA ÁTT → kraftar hætta við → minna tvískautsvægi.'
  }
];

export function Level3({ onComplete, onBack, onCorrectAnswer, onIncorrectAnswer }: Level3Props) {
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showConcept, setShowConcept] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [totalHintsUsed, setTotalHintsUsed] = useState(0);

  const challenge = challenges[currentChallenge];
  const maxScore = challenges.length * 12; // 12 points per question without hints

  const checkAnswer = () => {
    const selected = challenge.options.find(opt => opt.id === selectedOption);
    const correct = selected?.correct ?? false;
    setIsCorrect(correct);
    if (correct) {
      onCorrectAnswer?.();
      if (!showHint) {
        setScore(prev => prev + 12);
      } else {
        setScore(prev => prev + 6);
      }
    } else {
      onIncorrectAnswer?.();
    }
    setShowResult(true);
  };

  const nextChallenge = () => {
    if (currentChallenge < challenges.length - 1) {
      setCurrentChallenge(prev => prev + 1);
      setSelectedOption(null);
      setShowResult(false);
      setShowHint(false);
      setShowConcept(false);
      setIsCorrect(false);
    } else {
      onComplete(score, maxScore, totalHintsUsed);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'hybridization': return 'Blendni';
      case 'polarity': return 'Skautun';
      case 'multi_center': return 'Mörg miðatóm';
      case 'dipole': return 'Tvískautsvægi';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'hybridization': return 'bg-purple-100 text-purple-800';
      case 'polarity': return 'bg-blue-100 text-blue-800';
      case 'multi_center': return 'bg-green-100 text-green-800';
      case 'dipole': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
            <div className="text-sm text-gray-600">Spurning {currentChallenge + 1} af {challenges.length}</div>
            <div className="text-lg font-bold text-teal-600">{score} stig</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div
            className="bg-teal-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentChallenge + 1) / challenges.length) * 100}%` }}
          />
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
          {/* Type badge */}
          <div className="mb-4">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(challenge.type)}`}>
              {getTypeLabel(challenge.type)}
            </span>
          </div>

          {/* Molecule info */}
          <div className="bg-gray-900 rounded-xl p-4 mb-6 text-center">
            <div className="text-3xl font-bold text-white">{challenge.formula}</div>
            <div className="text-gray-400">{challenge.name}</div>
            {challenge.lewisStructure && (
              <div className="font-mono text-teal-400 mt-2 whitespace-pre">{challenge.lewisStructure}</div>
            )}
          </div>

          {/* Question */}
          <p className="text-gray-700 text-lg mb-6">{challenge.question}</p>

          {/* Options */}
          <div className="space-y-3 mb-6">
            {challenge.options.map(option => (
              <button
                key={option.id}
                onClick={() => !showResult && setSelectedOption(option.id)}
                disabled={showResult}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  showResult
                    ? option.correct
                      ? 'border-green-500 bg-green-50'
                      : selectedOption === option.id
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 bg-gray-50 opacity-50'
                    : selectedOption === option.id
                    ? 'border-teal-500 bg-teal-50 ring-2 ring-teal-200'
                    : 'border-gray-300 hover:border-teal-400 hover:bg-teal-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="font-bold text-gray-500 uppercase">{option.id}.</span>
                  <span className="flex-1">{option.text}</span>
                </div>
                {showResult && selectedOption === option.id && (
                  <div className={`mt-2 text-sm ${option.correct ? 'text-green-700' : 'text-red-700'}`}>
                    {option.explanation}
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Hint */}
          {!showResult && !showHint && (
            <button
              onClick={() => {
                setShowHint(true);
                setTotalHintsUsed(prev => prev + 1);
              }}
              className="text-teal-600 hover:text-teal-800 text-sm underline mb-4"
            >
              Syna visbendingu (-6 stig)
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
              disabled={!selectedOption}
              className="w-full bg-teal-500 hover:bg-teal-600 disabled:bg-gray-300 text-white font-bold py-4 px-6 rounded-xl transition-colors"
            >
              Athuga svar
            </button>
          )}

          {/* Result and concept explanation */}
          {showResult && (
            <>
              <div className={`p-4 rounded-xl mb-4 ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className={`font-bold text-lg ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                  {isCorrect ? 'Rétt!' : 'Rangt'}
                </div>
              </div>

              {/* Concept explanation toggle */}
              <button
                onClick={() => setShowConcept(!showConcept)}
                className="w-full text-left p-4 bg-purple-50 rounded-xl mb-4 hover:bg-purple-100 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-800">💡 Skoða hugtakaútskýringu</span>
                  <span className="text-purple-600">{showConcept ? '▲' : '▼'}</span>
                </div>
              </button>

              {showConcept && (
                <div className="bg-purple-50 p-4 rounded-xl mb-4 border border-purple-200">
                  <p className="text-purple-900 text-sm">{challenge.conceptExplanation}</p>
                </div>
              )}

              <button
                onClick={nextChallenge}
                className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-4 px-6 rounded-xl transition-colors"
              >
                {currentChallenge < challenges.length - 1 ? 'Næsta spurning' : 'Ljúka stigi 3'}
              </button>
            </>
          )}
        </div>

        {/* Reference tables */}
        <div className="mt-6 grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 shadow">
            <h3 className="font-bold text-gray-700 mb-3">🧬 Blendnitafla</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-2 text-left">Svið</th>
                  <th className="p-2 text-left">Blendni</th>
                  <th className="p-2 text-left">Lögun</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t"><td className="p-2">2</td><td className="hybridization-sp">sp</td><td>Línuleg</td></tr>
                <tr className="border-t"><td className="p-2">3</td><td className="hybridization-sp2">sp²</td><td>Þríhyrnd</td></tr>
                <tr className="border-t"><td className="p-2">4</td><td className="hybridization-sp3">sp³</td><td>Fjórflötungur</td></tr>
                <tr className="border-t"><td className="p-2">5</td><td className="hybridization-sp3d">sp³d</td><td>Tvípýramída</td></tr>
                <tr className="border-t"><td className="p-2">6</td><td className="hybridization-sp3d2">sp³d²</td><td>Áttflötungur</td></tr>
              </tbody>
            </table>
          </div>

          <div className="bg-white rounded-xl p-4 shadow">
            <h3 className="font-bold text-gray-700 mb-3">⚡ Skautun</h3>
            <div className="space-y-2 text-sm">
              <div className="bg-green-50 p-2 rounded">
                <strong>Óskautuð:</strong> Samhverf lögun → tvískautsvægi jafnast út
              </div>
              <div className="bg-blue-50 p-2 rounded">
                <strong>Skautuð:</strong> Ósamhverf → nettó tvískautsvægi ≠ 0
              </div>
              <div className="text-gray-600 mt-2">
                <strong>Dæmi:</strong><br/>
                CO₂ (línuleg) → óskautuð<br/>
                H₂O (beygð) → skautuð<br/>
                CCl₄ (fjórflötungur) → óskautuð<br/>
                CHCl₃ (fjórflötungur) → skautuð
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
