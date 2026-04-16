import { useState, useMemo } from 'react';

import { shuffleArray } from '@shared/utils';

interface Level3Props {
  onComplete: (score: number) => void;
  onBack: () => void;
}

interface Challenge {
  id: number;
  type: 'comparison' | 'real_world' | 'anomaly' | 'multi_factor';
  title: string;
  scenario: string;
  question: string;
  compounds?: { formula: string; name: string; info: string }[];
  options: { id: string; text: string; correct: boolean; explanation: string }[];
  hint: string;
  conceptNote: string;
}

const challenges: Challenge[] = [
  {
    id: 1,
    type: 'comparison',
    title: 'Etanól vs Dímetýleter',
    scenario:
      'Etanól (CH₃CH₂OH) og dímetýleter (CH₃OCH₃) hafa báðar sömu sameindaformúlu: C₂H₆O og sama mólmassa (46 g/mol).',
    question: 'Af hverju hefur etanól MIKLU hærra suðumark (78°C) en dímetýleter (-24°C)?',
    compounds: [
      { formula: 'CH₃CH₂OH', name: 'Etanól', info: 'Suðumark: 78°C' },
      { formula: 'CH₃OCH₃', name: 'Dímetýleter', info: 'Suðumark: -24°C' },
    ],
    options: [
      { id: 'a', text: 'Etanól er þyngri', correct: false, explanation: 'Þau hafa sama mólmassa.' },
      {
        id: 'b',
        text: 'Etanól hefur O-H hóp sem myndar vetnistengi',
        correct: true,
        explanation:
          'Rétt! O-H í etanóli getur gefið OG tekið við vetnistengslum. Dímetýleter (C-O-C) getur aðeins tekið við H-tengi, ekki gefið.',
      },
      {
        id: 'c',
        text: 'Dímetýleter er ólínuleg sameind',
        correct: false,
        explanation: 'Lögun skiptir minna máli heldur en geta til H-tengja.',
      },
      {
        id: 'd',
        text: 'Etanól hefur stærri London krafta',
        correct: false,
        explanation: 'London kraftar eru svipaðir þar sem mólmassi er sá sami.',
      },
    ],
    hint: 'Hvaða sameind getur myndað vetnistengi SEM GJAFI? (gefur H)',
    conceptNote:
      'Vetnistengi krefst bæði GJAFA (H bundið við F/O/N) og ÞEGA (F/O/N með einstæð pör). Etanól getur verið hvort tveggja, dímetýleter er aðeins þegi.',
  },
  {
    id: 2,
    type: 'anomaly',
    title: 'Óeðlilegar eiginleikar vatns',
    scenario:
      'Vatn (H₂O, M=18 g/mol) hefur suðumark 100°C. Vetnissúlfíð (H₂S, M=34 g/mol) hefur suðumark -60°C.',
    question:
      'Þrátt fyrir að H₂S sé nær tvöfalt þyngri, hefur vatn MIKLU hærra suðumark. Af hverju?',
    options: [
      {
        id: 'a',
        text: 'Vatn er skautaðra en H₂S',
        correct: false,
        explanation: 'Báðar eru skautaðar, en það útskýrir ekki muninn.',
      },
      {
        id: 'b',
        text: 'Súrefni er rafneikvæðara en brennisteinn → sterkari H-tengi',
        correct: true,
        explanation:
          'Rétt! O er mun rafneikvæðara en S. O-H myndast sterk vetnistengi, S-H mjög veik.',
      },
      {
        id: 'c',
        text: 'Vatn er minna í rúmmáli',
        correct: false,
        explanation: 'Rúmmál hefur ekki bein áhrif á suðumark.',
      },
      {
        id: 'd',
        text: 'H₂S brotnar niður við upphitun',
        correct: false,
        explanation: 'Þetta hefur ekki áhrif á suðumark.',
      },
    ],
    hint: 'Vetnistengi eru sterkust þegar H er bundið við MJÖG rafneikvætt atóm.',
    conceptNote:
      'Vetnistengi myndast helst með F, O, N vegna mikillar rafneikvæmni. S, Cl, P eru ekki rafneikvæð nóg til að mynda sterk H-tengi.',
  },
  {
    id: 3,
    type: 'real_world',
    title: 'Af hverju er vatn seigt?',
    scenario: 'Við herðum á vatn á pönnu og það rennur hægar en t.d. aseton eða bensín.',
    question: 'Af hverju er seigja vatns meiri en flestra lífrænna leysa?',
    options: [
      {
        id: 'a',
        text: 'Vatn er tungara',
        correct: false,
        explanation: 'Vatn er í raun léttara en mörg lífræn leysi.',
      },
      {
        id: 'b',
        text: 'Vatn hefur 3D net af vetnistengjum',
        correct: true,
        explanation:
          'Rétt! Hver vatnssameind getur myndað allt að 4 H-tengi og þetta net veldur seigju.',
      },
      {
        id: 'c',
        text: 'Vatn er ólitað',
        correct: false,
        explanation: 'Litur hefur engin áhrif á seigju.',
      },
      {
        id: 'd',
        text: 'Vatn inniheldur upplausin efni',
        correct: false,
        explanation: 'Hreint vatn er einnig seigra en mörg lífræn leysi.',
      },
    ],
    hint: 'Hver vatnssameind getur myndað allt að 4 vetnistengi samtímis.',
    conceptNote:
      'Vatnsameindir mynda þrívítt net af vetnistengjum. Þetta net þarf að „brjóta" til að sameindir geti runnið framhjá hvor annarri, sem eykur seigju.',
  },
  {
    id: 4,
    type: 'multi_factor',
    title: 'n-Oktan vs. 2,2,3,3-Tetrametýlbútan',
    scenario:
      'Báðar sameindir hafa formúlu C₈H₁₈ og mólmassa 114 g/mol. n-Oktan er löng keðja, 2,2,3,3-tetrametýlbútan er „kúlulaga".',
    question: 'Hvor hefur hærra suðumark?',
    compounds: [
      { formula: 'n-Oktan', name: 'Löng keðja', info: 'Suðumark: 126°C' },
      { formula: '2,2,3,3-TMB', name: 'Kúlulag', info: 'Suðumark: 106°C' },
    ],
    options: [
      {
        id: 'a',
        text: 'n-Oktan (löng keðja) — meira yfirborðsflatarmál',
        correct: true,
        explanation:
          'Rétt! Lengri keðjur hafa meira yfirborðsflatarmál → sterkari London kraftar → hærra suðumark.',
      },
      {
        id: 'b',
        text: '2,2,3,3-TMB (kúlulag) — þéttari sameind',
        correct: false,
        explanation: 'Þéttari lögun þýðir minna yfirborð → veikari London kraftar.',
      },
      {
        id: 'c',
        text: 'Sama suðumark — sami mólmassi',
        correct: false,
        explanation: 'Lögun hefur einnig áhrif, ekki bara mólmassi.',
      },
      {
        id: 'd',
        text: 'Fer eftir hitastigi',
        correct: false,
        explanation: 'Suðumark er skilgreindur eiginleiki við ákveðinn þrýsting.',
      },
    ],
    hint: 'Hugsaðu um hversu mikið sameindin getur „snert" nágrannasameindir.',
    conceptNote:
      'London kraftar aukast með yfirborðsflatarmáli sameindarinnar. Löng, sveigjanleg keðja hefur meira yfirborð en kompakt „kúla" með sama mólmassa.',
  },
  {
    id: 5,
    type: 'real_world',
    title: 'Af hverju loðir gekki á veggi?',
    scenario: 'Gekkóar geta gengið upp glugga og hangið á lofti án límefna eða sogbolla.',
    question: 'Hvaða millisameindakraftar gera þeim kleift að loða við fléttar?',
    options: [
      {
        id: 'a',
        text: 'Vetnistengi við glerið',
        correct: false,
        explanation: 'Gekki myndar ekki efnasambönd við undirlag.',
      },
      {
        id: 'b',
        text: 'London dreifikraftar — milljónir smárra hára',
        correct: true,
        explanation:
          'Rétt! Fætur þeirra hafa milljónir smárra hára (setae) sem auka yfirborðsflatarmál. Samanlagðir London kraftar eru nógu sterkir.',
      },
      {
        id: 'c',
        text: 'Rafstöðuaðdráttarkraftar',
        correct: false,
        explanation: 'Þetta er ekki rafstöðufyrirbæri.',
      },
      {
        id: 'd',
        text: 'Þeir framleiða lím',
        correct: false,
        explanation: 'Gekkóar nota ekki lím — krafturinn er hrein eðlisfræði.',
      },
    ],
    hint: 'Gekkófætur hafa milljónir smárra hára. Hvað gerist þegar yfirborðsflatarmál eykst?',
    conceptNote:
      'Þetta er dæmigert um hvernig margir veikir kraftar geta orðið sterkir saman. Hver setae gefur smá London kraft, en milljónir þeirra gefa nægan kraft til að halda gekkónanum.',
  },
  {
    id: 6,
    type: 'comparison',
    title: 'Edik vs. edikaldehýð',
    scenario:
      'Ediksýra (CH₃COOH, M=60) hefur suðumark 118°C. Edikaldehýð (CH₃CHO, M=44) hefur suðumark 20°C.',
    question: 'Bæði efni eru skautuð. Af hverju er munurinn svona mikill?',
    options: [
      {
        id: 'a',
        text: 'Ediksýra hefur O-H hóp sem myndar vetnistengi',
        correct: true,
        explanation:
          'Rétt! Karboxýlsýrur (-COOH) mynda sterk vetnistengi. Aldehýð (-CHO) hefur ekkert H á O.',
      },
      {
        id: 'b',
        text: 'Ediksýra er stærri sameind',
        correct: false,
        explanation: 'Það er ekki aðalástæðan — H-tengi eru lykilatriði.',
      },
      { id: 'c', text: 'Aldehýð brotnar niður', correct: false, explanation: 'Þetta á ekki við.' },
      {
        id: 'd',
        text: 'Ediksýra er sýra',
        correct: false,
        explanation: 'Sýrustig hefur ekki bein áhrif á suðumark.',
      },
    ],
    hint: 'Skoðaðu formúlurnar: -COOH vs. -CHO. Hvor hefur H bundið við O?',
    conceptNote:
      'Karboxýlsýrur (-COOH) mynda vetnistengi vegna O-H hópsins. Aldehýð (-CHO) er skautuð en getur aðeins tekið við H-tengi, ekki gefið.',
  },
  {
    id: 7,
    type: 'anomaly',
    title: 'Ís flýtur á vatni',
    scenario: 'Flest föst efni sökkva í vökvaforminu, en ís flýtur á vatni.',
    question: 'Af hverju er ís léttari (minni þéttleiki) en fljótandi vatn?',
    options: [
      {
        id: 'a',
        text: 'Vatnsameindir þenjast út við frystingu',
        correct: false,
        explanation: 'Þetta lýsir fyrirbærinu en útskýrir ekki ástæðuna.',
      },
      {
        id: 'b',
        text: 'Vetnistengjanetið í ís er opnara og minna þétt',
        correct: true,
        explanation:
          'Rétt! Í ís myndar hver sameind 4 H-tengi í föstu sexhyrningamynstri. Þetta skapar „eyður" og minnkar þéttleika.',
      },
      {
        id: 'c',
        text: 'Ís inniheldur loft',
        correct: false,
        explanation: 'Hreinn ís hefur sama eiginleika.',
      },
      {
        id: 'd',
        text: 'Vatn er óvenjulega þungt',
        correct: false,
        explanation: 'Það sem skiptir máli er munurinn á þéttleika vökva og fasts efnis.',
      },
    ],
    hint: 'Hugsaðu um hvernig H-tengi raðast í kristallinu vs. í vökvanum.',
    conceptNote:
      'Í ískristallnum er hvert vatnssameindin í föstu mynstri með 4 H-tengi, sem skapar opinn „kagala" formgerð. Í vökva er formgerðin breytilegri og þéttari.',
  },
  {
    id: 8,
    type: 'multi_factor',
    title: 'Hvaða olía er seigust?',
    scenario:
      'Við höfum þrjár vökvar: vatn (H₂O), jurtaolíu (langkeðju þríglýseríð), og bensín (blanda af C₅-C₁₂ alkanum).',
    question: 'Hver er seigastur?',
    options: [
      {
        id: 'a',
        text: 'Vatn — vetnistengi',
        correct: false,
        explanation: 'Vatn er seigt, en jurtaolía er seigari.',
      },
      {
        id: 'b',
        text: 'Jurtaolía — mjög langar keðjur með miklu yfirborði',
        correct: true,
        explanation:
          'Rétt! Jurtaolíur hafa risastórar sameindir (600-900 g/mol) með langar feitukeðjur → gríðarlega sterkir London kraftar.',
      },
      {
        id: 'c',
        text: 'Bensín — mörg mismunandi sameindir',
        correct: false,
        explanation: 'Bensín hefur litlar sameindir og er í raun mjög þunnt.',
      },
      {
        id: 'd',
        text: 'Öll jafnseig',
        correct: false,
        explanation: 'Seigja er mjög mismunandi milli þessara vökva.',
      },
    ],
    hint: 'Hugsaðu um stærð sameindanna. Jurtaolíur hafa mólmassa 600-900 g/mol.',
    conceptNote:
      'Þó vetnistengi séu sterk, geta risastórar sameindir með mikið yfirborð haft svo sterka London krafta að þeir vinna yfir H-tengi lítilla sameinda.',
  },
  {
    id: 9,
    type: 'real_world',
    title: 'Af hverju er sápubóla kúlulag?',
    scenario: 'Sápubólur eru alltaf kúlulaga, og vatn hefur háa yfirborðsspennu.',
    question: 'Hvað veldur yfirborðsspennu vatns?',
    options: [
      {
        id: 'a',
        text: 'Vatnsameindir á yfirborðinu eru dregnar inn á við af H-tengjum',
        correct: true,
        explanation:
          'Rétt! Sameindir á yfirborðinu hafa færri nágranna til að mynda H-tengi við → þær eru dregnar inn á við. Þetta skapar „húð" sem vill lágmarka flatarmál = kúla.',
      },
      {
        id: 'b',
        text: 'Loftþrýstingur',
        correct: false,
        explanation: 'Loftþrýstingur hefur ekki bein áhrif á yfirborðsspennu.',
      },
      {
        id: 'c',
        text: 'Vatn er þungt',
        correct: false,
        explanation: 'Þyngd hefur ekki áhrif á yfirborðsspennu.',
      },
      {
        id: 'd',
        text: 'Rafstöðuafleiðsla',
        correct: false,
        explanation: 'Þetta er ekki rafstöðufyrirbæri.',
      },
    ],
    hint: 'Sameindir á yfirborðinu hafa færri nágranna til að mynda H-tengi við...',
    conceptNote:
      'Yfirborðsspenna stafar af ójöfnum krafti á yfirborðssameindir. Þær hafa færri H-tengja nágranna og eru dregnar inn á við → yfirborðið vill lágmarka flatarmál.',
  },
  {
    id: 10,
    type: 'comparison',
    title: 'HF vs. H₂O',
    scenario: 'HF (M=20) hefur suðumark 20°C. H₂O (M=18) hefur suðumark 100°C.',
    question: 'Flúor er rafneikvæðara en súrefni, en vatn hefur mun hærra suðumark. Af hverju?',
    options: [
      {
        id: 'a',
        text: 'HF getur aðeins myndað 2 H-tengi, vatn getur myndað 4',
        correct: true,
        explanation:
          'Rétt! HF hefur aðeins eitt H og eitt F → hámark 2 H-tengi. H₂O hefur 2 H og 2 einstæð pör → allt að 4 H-tengi.',
      },
      {
        id: 'b',
        text: 'Vatn er þyngra',
        correct: false,
        explanation: 'Vatn er í raun léttara (18 vs 20 g/mol).',
      },
      {
        id: 'c',
        text: 'HF er eitrað',
        correct: false,
        explanation: 'Eiturhrif hafa ekki áhrif á suðumark.',
      },
      {
        id: 'd',
        text: 'Flúor er gas við stofuhita',
        correct: false,
        explanation: 'Þetta útskýrir ekki af hverju HF er einnig gas.',
      },
    ],
    hint: 'Teldu: Hversu mörg H-tengi getur hver sameind myndað?',
    conceptNote:
      'Styrk H-tengja skiptir máli, en FJÖLDI þeirra skiptir líka máli. Vatn getur myndað tvöfalt fleiri H-tengi en HF (4 vs 2) og þetta vinnur yfir að hvert HF-tengi sé sterkara.',
  },
];

// Max possible score: 10 challenges * 12 points = 120 points

export function Level3({ onComplete, onBack }: Level3Props) {
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showConcept, setShowConcept] = useState(false);
  const [score, setScore] = useState(0);
  const [, setTotalHintsUsed] = useState(0);

  const challenge = challenges[currentChallenge];

  // Shuffle options for current challenge - memoize to keep stable during challenge
  const shuffledOptions = useMemo(() => {
    const shuffled = shuffleArray(challenge.options);
    // Assign new sequential IDs (a, b, c, d) after shuffling
    return shuffled.map((opt, idx) => ({
      ...opt,
      id: String.fromCharCode(97 + idx), // 'a', 'b', 'c', 'd'
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: re-shuffle when challenge index changes
  }, [currentChallenge, challenge.options]);

  const checkAnswer = () => {
    const selected = shuffledOptions.find((opt) => opt.id === selectedOption);
    const correct = selected?.correct ?? false;
    if (correct) {
      if (!showHint) {
        setScore((prev) => prev + 12);
      } else {
        setScore((prev) => prev + 6);
      }
    }
    setShowResult(true);
  };

  const nextChallenge = () => {
    if (currentChallenge < challenges.length - 1) {
      setCurrentChallenge((prev) => prev + 1);
      setSelectedOption(null);
      setShowResult(false);
      setShowHint(false);
      setShowConcept(false);
    } else {
      onComplete(score);
    }
  };

  const handleShowHint = () => {
    setShowHint(true);
    setTotalHintsUsed((prev) => prev + 1);
  };

  const isCorrect = showResult && shuffledOptions.find((o) => o.id === selectedOption)?.correct;

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'comparison':
        return { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Samanburður' };
      case 'real_world':
        return { bg: 'bg-green-100', text: 'text-green-800', label: 'Raunheimur' };
      case 'anomaly':
        return { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Óvenjulegur eiginleiki' };
      case 'multi_factor':
        return { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Margir þættir' };
      default:
        return { bg: 'bg-warm-100', text: 'text-warm-800', label: type };
    }
  };

  const badge = getTypeBadge(challenge.type);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack} className="text-warm-600 hover:text-warm-800">
            ← Til baka
          </button>
          <div className="text-right">
            <div className="text-sm text-warm-600">
              Spurning {currentChallenge + 1} af {challenges.length}
            </div>
            <div className="text-lg font-bold text-indigo-600">{score} stig</div>
          </div>
        </div>

        <div className="w-full bg-warm-200 rounded-full h-2 mb-6">
          <div
            className="bg-indigo-500 h-2 rounded-full transition-all"
            style={{ width: `${((currentChallenge + 1) / challenges.length) * 100}%` }}
          />
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
          {/* Type badge and title */}
          <div className="mb-4">
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${badge.bg} ${badge.text}`}
            >
              {badge.label}
            </span>
          </div>

          <h2 className="text-xl font-bold text-warm-800 mb-4">{challenge.title}</h2>

          {/* Scenario */}
          <div className="bg-warm-50 p-4 rounded-xl mb-4">
            <p className="text-warm-700">{challenge.scenario}</p>
          </div>

          {/* Compounds comparison if available */}
          {challenge.compounds && (
            <div className="grid grid-cols-2 gap-4 mb-4">
              {challenge.compounds.map((compound) => (
                <div key={compound.formula} className="bg-warm-900 p-4 rounded-xl text-center">
                  <div className="text-xl font-bold text-white">{compound.formula}</div>
                  <div className="text-warm-400 text-sm">{compound.name}</div>
                  <div className="text-indigo-400 text-sm mt-1">{compound.info}</div>
                </div>
              ))}
            </div>
          )}

          {/* Question */}
          <p className="text-warm-800 text-lg font-medium mb-6">{challenge.question}</p>

          {/* Options */}
          <div className="space-y-3 mb-6">
            {shuffledOptions.map((option) => (
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
                        : 'border-warm-200 opacity-50'
                    : selectedOption === option.id
                      ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                      : 'border-warm-300 hover:border-indigo-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="font-bold text-warm-500">{option.id}.</span>
                  <span className="flex-1">{option.text}</span>
                </div>
                {showResult && selectedOption === option.id && (
                  <div
                    className={`mt-2 text-sm ${option.correct ? 'text-green-700' : 'text-red-700'}`}
                  >
                    {option.explanation}
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Hint */}
          {!showResult && !showHint && (
            <button
              onClick={handleShowHint}
              className="text-indigo-600 hover:text-indigo-800 text-sm underline mb-4"
            >
              Sýna vísbendingu
            </button>
          )}

          {showHint && !showResult && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl mb-4">
              <span className="font-bold text-yellow-800">Vísbending: </span>
              <span className="text-yellow-900">{challenge.hint}</span>
            </div>
          )}

          {/* Check / Next buttons */}
          {!showResult ? (
            <button
              onClick={checkAnswer}
              disabled={!selectedOption}
              className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-warm-300 text-white font-bold py-4 px-6 rounded-xl"
            >
              Athuga svar
            </button>
          ) : (
            <>
              <div
                className={`p-4 rounded-xl mb-4 ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}
              >
                <div className={`font-bold ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                  {isCorrect ? 'Rétt!' : 'Rangt'}
                </div>
              </div>

              {/* Concept toggle */}
              <button
                onClick={() => setShowConcept(!showConcept)}
                className="w-full text-left p-4 bg-purple-50 rounded-xl mb-4 hover:bg-purple-100"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-800">💡 Dýpri skilningur</span>
                  <span className="text-purple-600">{showConcept ? '▲' : '▼'}</span>
                </div>
              </button>

              {showConcept && (
                <div className="bg-purple-50 p-4 rounded-xl mb-4 border border-purple-200">
                  <p className="text-purple-900 text-sm">{challenge.conceptNote}</p>
                </div>
              )}

              <button
                onClick={nextChallenge}
                className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-4 px-6 rounded-xl"
              >
                {currentChallenge < challenges.length - 1 ? 'Næsta spurning' : 'Ljúka stigi 3'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
