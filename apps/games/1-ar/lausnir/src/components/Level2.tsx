import { useState, useCallback, useMemo } from 'react';

import { shuffleArray } from '@shared/utils';

import { ConcentrationComparison } from './StoichiometryVisualization';
import {
  TemperatureComparison,
  TemperatureSolubilityCurve,
  SOLUBILITY_DATA,
  SolubilityData,
} from './TemperatureSolubility';

// Level 2: Application/Reasoning - "What happens when..." questions
// Students predict outcomes without calculating

interface BaseScenario {
  id: number;
  title: string;
  setup: string;
  question: string;
  hint: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    explanation: string;
  }[];
  concept: string;
}

interface ConcentrationScenario extends BaseScenario {
  type: 'concentration';
  visualBefore: {
    molecules: number;
    volumeML: number;
    concentration: number;
  };
  visualAfter: {
    molecules: number;
    volumeML: number;
    concentration: number;
  };
}

interface TemperatureScenario extends BaseScenario {
  type: 'temperature';
  compound: SolubilityData;
  tempBefore: number;
  tempAfter: number;
}

type Scenario = ConcentrationScenario | TemperatureScenario;

// Get compound data by formula
const getCompound = (formula: string): SolubilityData =>
  SOLUBILITY_DATA.find((d) => d.formula === formula) || SOLUBILITY_DATA[0];

const SCENARIOS: Scenario[] = [
  // Concentration scenarios (original)
  {
    id: 1,
    type: 'concentration',
    title: 'Útþynning með vatni',
    setup: 'Þú ert með 100 mL af 2.0 M NaCl lausn.',
    question: 'Hvað gerist við styrkinn ef þú bætir við 100 mL af vatni?',
    hint: 'Fjöldi sameinda breytist ekki, en rúmmálið tvöfaldast.',
    options: [
      {
        id: 'a',
        text: 'Styrkurinn tvöfaldast (4.0 M)',
        isCorrect: false,
        explanation: 'Nei - að bæta við vatni þynnir lausnina, eykur hana ekki.',
      },
      {
        id: 'b',
        text: 'Styrkurinn helst óbreyttur (2.0 M)',
        isCorrect: false,
        explanation: 'Nei - þegar rúmmál eykst en sameindir haldast, lækkar styrkur.',
      },
      {
        id: 'c',
        text: 'Styrkurinn helmingast (1.0 M)',
        isCorrect: true,
        explanation: 'Rétt! Tvöfalt rúmmál með sama fjölda sameinda = helmingur styrks.',
      },
      {
        id: 'd',
        text: 'Styrkurinn verður núll (0 M)',
        isCorrect: false,
        explanation: 'Nei - sameindir hverfa ekki, þær dreifast bara á stærra rúmmál.',
      },
    ],
    concept: 'Við útþynningu: sameindir haldast, rúmmál eykst → styrkur minnkar í réttu hlutfalli.',
    visualBefore: { molecules: 40, volumeML: 100, concentration: 2.0 },
    visualAfter: { molecules: 40, volumeML: 200, concentration: 1.0 },
  },
  {
    id: 2,
    type: 'concentration',
    title: 'Bæta við leysiefni',
    setup: 'Þú ert með 200 mL af 1.5 M glúkósalausn.',
    question:
      'Þú leysir upp meira af glúkósu í lausninni (án þess að breyta rúmmáli). Hvað gerist?',
    hint: 'Rúmmálið helst óbreytt en fjöldi sameinda eykst.',
    options: [
      {
        id: 'a',
        text: 'Styrkurinn eykst',
        isCorrect: true,
        explanation: 'Rétt! Fleiri sameindir í sama rúmmáli = hærri styrkur.',
      },
      {
        id: 'b',
        text: 'Styrkurinn minnkar',
        isCorrect: false,
        explanation: 'Nei - að bæta við sameindum eykur styrk, ekki minnkar.',
      },
      {
        id: 'c',
        text: 'Styrkurinn helst óbreyttur',
        isCorrect: false,
        explanation: 'Nei - fleiri sameindir í sama rúmmáli breytir styrknum.',
      },
      {
        id: 'd',
        text: 'Lausnin verður ómöguleg',
        isCorrect: false,
        explanation: 'Nei - þú getur bætt við efni að vissu marki (mettunarpunkti).',
      },
    ],
    concept: 'Styrkur = sameindir/rúmmál. Fleiri sameindir í sama rúmmáli = hærri styrkur.',
    visualBefore: { molecules: 30, volumeML: 200, concentration: 1.5 },
    visualAfter: { molecules: 50, volumeML: 200, concentration: 2.5 },
  },
  {
    id: 3,
    type: 'concentration',
    title: 'Blanda tveggja lausna',
    setup: 'Þú blandar 100 mL af 3.0 M lausn við 100 mL af 1.0 M lausn (sama efni).',
    question: 'Hver verður endanlegur styrkur blöndunnar?',
    hint: 'Heildarfjöldi sameinda er summa beggja lausna.',
    options: [
      {
        id: 'a',
        text: 'Nákvæmlega 2.0 M (meðaltal)',
        isCorrect: true,
        explanation: 'Rétt! Þegar rúmmálin eru jöfn er lokastyrkur meðaltal beggja.',
      },
      {
        id: 'b',
        text: 'Nákvæmlega 4.0 M (summa)',
        isCorrect: false,
        explanation: 'Nei - styrkur legst ekki saman svona. Sameindir dreifast á heildarrúmmálið.',
      },
      {
        id: 'c',
        text: 'Nákvæmlega 3.0 M (hærri styrkurinn)',
        isCorrect: false,
        explanation: 'Nei - veikari lausnin þynnir þá sterkari.',
      },
      {
        id: 'd',
        text: 'Nákvæmlega 1.0 M (lægri styrkurinn)',
        isCorrect: false,
        explanation: 'Nei - sterkari lausnin hækkar heildarstyrk.',
      },
    ],
    concept: 'Við blöndun: heildarsameindir / heildarrúmmál = lokastyrkur. Jöfn rúmmál → meðaltal.',
    visualBefore: { molecules: 30, volumeML: 100, concentration: 3.0 },
    visualAfter: { molecules: 40, volumeML: 200, concentration: 2.0 },
  },
  // Temperature scenarios (new)
  {
    id: 4,
    type: 'temperature',
    title: 'Hitun á saltlausn',
    setup: 'Þú ert með mettuð NaCl (borðsalt) lausn við 20°C.',
    question: 'Þú hitar lausnina upp í 80°C. Hvað gerist við leysigetu saltsins?',
    hint: 'NaCl er þekkt sem undantekning — skoðaðu leysigetu feril.',
    options: [
      {
        id: 'a',
        text: 'Leysigeta eykst talsvert',
        isCorrect: false,
        explanation: 'Nei - NaCl er óvenjulegt. Leysigeta þess breytist mjög lítið með hitastigi.',
      },
      {
        id: 'b',
        text: 'Leysigeta eykst lítillega',
        isCorrect: true,
        explanation:
          'Rétt! NaCl fer úr 36 g/100g við 20°C í 38 g/100g við 80°C - bara ~6% aukning!',
      },
      {
        id: 'c',
        text: 'Leysigeta minnkar',
        isCorrect: false,
        explanation: 'Nei - leysigeta NaCl minnkar ekki við hitun.',
      },
      {
        id: 'd',
        text: 'Leysigeta helst nákvæmlega óbreytt',
        isCorrect: false,
        explanation: 'Nei - hún breytist aðeins, en minna en flest önnur efni.',
      },
    ],
    concept:
      'NaCl er sérstakt: leysigeta þess breytist mjög lítið með hitastigi (35.7-39.2 g/100g frá 0°C til 100°C).',
    compound: getCompound('NaCl'),
    tempBefore: 20,
    tempAfter: 80,
  },
  {
    id: 5,
    type: 'temperature',
    title: 'Hitun á KNO₃ lausn',
    setup: 'Þú ert með mettuð kalíumnítrat (KNO₃) lausn við 20°C.',
    question: 'Þú hitar lausnina upp í 60°C. Hvað gerist við leysigetu KNO₃?',
    hint: 'KNO₃ hefur eitt hæsta hitaháðni meðal salta.',
    options: [
      {
        id: 'a',
        text: 'Leysigeta eykst mikið (meira en tvöfaldast)',
        isCorrect: true,
        explanation:
          'Rétt! KNO₃ fer úr 32 g/100g við 20°C í 110 g/100g við 60°C - meira en þrefaldast!',
      },
      {
        id: 'b',
        text: 'Leysigeta eykst lítillega',
        isCorrect: false,
        explanation: 'Nei - KNO₃ hefur eina hæstu hitabreytni í leysigetu. Hún eykst gríðarlega.',
      },
      {
        id: 'c',
        text: 'Leysigeta minnkar',
        isCorrect: false,
        explanation: 'Nei - fyrir flest fast efni eykst leysigeta við hitun.',
      },
      {
        id: 'd',
        text: 'Leysigeta helst óbreytt',
        isCorrect: false,
        explanation: 'Nei - KNO₃ er þekkt fyrir mikla hitaháða leysigetu.',
      },
    ],
    concept:
      'KNO₃ er dæmi um efni með mikla hitaháðni: leysigeta fer frá 13 g/100g við 0°C upp í 246 g/100g við 100°C.',
    compound: getCompound('KNO₃'),
    tempBefore: 20,
    tempAfter: 60,
  },
  {
    id: 6,
    type: 'temperature',
    title: 'Kæling á gosi',
    setup: 'Þú ert með glas af gosi (kolsýrt vatn, CO₂) við 20°C.',
    question: 'Þú setur gosið í ísskáp (5°C). Hvað gerist við CO₂ innihaldið?',
    hint: 'Lofttegundir hegða sér öfugt við föst efni.',
    options: [
      {
        id: 'a',
        text: 'Meira CO₂ leysist upp',
        isCorrect: true,
        explanation:
          'Rétt! Lofttegundir leysast betur í köldu vatni. Þess vegna er kalt gos fríðara!',
      },
      {
        id: 'b',
        text: 'Minna CO₂ leysist upp',
        isCorrect: false,
        explanation: 'Nei - þetta á við um föst efni, ekki lofttegundir.',
      },
      {
        id: 'c',
        text: 'CO₂ innihald helst óbreytt',
        isCorrect: false,
        explanation: 'Nei - hitastig hefur mikil áhrif á leysigetu lofttegunda.',
      },
      {
        id: 'd',
        text: 'Allt CO₂ gufar upp',
        isCorrect: false,
        explanation: 'Nei - kæling hjálpar að halda CO₂ í vatninu.',
      },
    ],
    concept: 'Lofttegundir (eins og CO₂, O₂) leysast BETUR í köldu vatni - öfugt við föst efni!',
    compound: getCompound('CO₂'),
    tempBefore: 20,
    tempAfter: 5,
  },
  // More concentration scenarios
  {
    id: 7,
    type: 'concentration',
    title: 'Uppgufun',
    setup: 'Þú hefur 500 mL af 0.5 M saltlausn í opinni skál. Helmingur vatnsins gufar upp.',
    question: 'Hvað gerist við styrkinn?',
    hint: 'Sameindir hverfa ekki — rúmmálið minnkar.',
    options: [
      {
        id: 'a',
        text: 'Styrkurinn helmingast (0.25 M)',
        isCorrect: false,
        explanation: 'Nei - minna rúmmál með sama fjölda sameinda = hærri styrkur.',
      },
      {
        id: 'b',
        text: 'Styrkurinn tvöfaldast (1.0 M)',
        isCorrect: true,
        explanation: 'Rétt! Helmingur rúmmáls með sama fjölda sameinda = tvöfaldur styrkur.',
      },
      {
        id: 'c',
        text: 'Styrkurinn helst óbreyttur',
        isCorrect: false,
        explanation: 'Nei - minna rúmmál þýðir meiri þéttleika sameinda.',
      },
      {
        id: 'd',
        text: 'Saltið gufar líka upp',
        isCorrect: false,
        explanation: 'Nei - salt (NaCl) gufar ekki upp við venjulegt hitastig.',
      },
    ],
    concept:
      'Uppgufun er andstæða útþynningar: rúmmál minnkar en sameindir haldast → styrkur eykst.',
    visualBefore: { molecules: 25, volumeML: 500, concentration: 0.5 },
    visualAfter: { molecules: 25, volumeML: 250, concentration: 1.0 },
  },
  {
    id: 8,
    type: 'temperature',
    title: 'Súrefni í vatni',
    setup: 'Fiskar þurfa súrefni (O₂) sem leyst er upp í vatni. Vatnið er 20°C.',
    question: 'Ef vatnið hlýnar upp í 30°C á heitu sumri, hvað gerist við súrefnisinnihaldið?',
    hint: 'Lofttegundir leysast verr í heitu vatni.',
    options: [
      {
        id: 'a',
        text: 'Súrefni í vatninu minnkar',
        isCorrect: true,
        explanation: 'Rétt! Lofttegundir leysast verr í heitu vatni. Þetta getur skaðað fiska!',
      },
      {
        id: 'b',
        text: 'Súrefni í vatninu eykst',
        isCorrect: false,
        explanation: 'Nei - lofttegundir leysast VERR í heitu vatni, ekki betur.',
      },
      {
        id: 'c',
        text: 'Súrefni helst óbreytt',
        isCorrect: false,
        explanation: 'Nei - hitastig hefur mikil áhrif á leysigetu lofttegunda.',
      },
      {
        id: 'd',
        text: 'Fiskar þurfa ekki súrefni',
        isCorrect: false,
        explanation: 'Nei - fiskar anda súrefni sem leyst er í vatninu!',
      },
    ],
    concept:
      'Lofttegundir leysast verr í heitu vatni. Þetta er alvarlegt vandamál þegar vötn hitna vegna loftslagsbreytinga.',
    compound: getCompound('O₂'),
    tempBefore: 20,
    tempAfter: 30,
  },
  {
    id: 9,
    type: 'concentration',
    title: 'Þríföld útþynning',
    setup: 'Þú þarft að þynna 6.0 M sýru niður í 2.0 M.',
    question: 'Hversu mikið þarftu að auka rúmmálið?',
    hint: 'C₁V₁ = C₂V₂. Hver er nýja rúmmálið?',
    options: [
      {
        id: 'a',
        text: 'Tvöfalda rúmmálið',
        isCorrect: false,
        explanation: 'Nei - tvöfalt rúmmál gefur 3.0 M (helmingur), ekki 2.0 M.',
      },
      {
        id: 'b',
        text: 'Þrífalda rúmmálið',
        isCorrect: true,
        explanation: 'Rétt! 6.0 M ÷ 3 = 2.0 M. Þrefalda rúmmálið = þriðjungur styrks.',
      },
      {
        id: 'c',
        text: 'Sexfalda rúmmálið',
        isCorrect: false,
        explanation: 'Nei - það myndi gefa 1.0 M (of þunnt).',
      },
      {
        id: 'd',
        text: 'Bæta við jafn miklu vatni',
        isCorrect: false,
        explanation: 'Nei - það tvöfaldar rúmmálið og gefur 3.0 M.',
      },
    ],
    concept: 'Til að þynna um ákveðið hlutfall þarftu að margfalda rúmmálið um sama hlutfall.',
    visualBefore: { molecules: 60, volumeML: 100, concentration: 6.0 },
    visualAfter: { molecules: 60, volumeML: 300, concentration: 2.0 },
  },
  {
    id: 10,
    type: 'temperature',
    title: 'Sykurlausn',
    setup: 'Þú ert að búa til karamellulausn. Þú hefur mettuð sykurlausn við 20°C.',
    question: 'Þú hitar lausnina upp í 80°C. Getur þú nú bætt við meiri sykri?',
    hint: 'Sykur er dæmi um efni með mikla hitaháðni í leysigetu.',
    options: [
      {
        id: 'a',
        text: 'Já, miklu meira',
        isCorrect: true,
        explanation:
          'Rétt! Sykur fer úr 204 g/100g við 20°C í 362 g/100g við 80°C - næstum tvöfaldast!',
      },
      {
        id: 'b',
        text: 'Já, aðeins meira',
        isCorrect: false,
        explanation: 'Nei - sykur hefur mikla hitabreytni í leysigetu, ekki litla.',
      },
      {
        id: 'c',
        text: 'Nei, leysigeta helst óbreytt',
        isCorrect: false,
        explanation: 'Nei - sykur leysist mun betur í heitu vatni.',
      },
      {
        id: 'd',
        text: 'Nei, sykurinn brennur',
        isCorrect: false,
        explanation: 'Nei - við 80°C er sykurinn enn langt frá brennslumarki.',
      },
    ],
    concept:
      'Sykur er gott dæmi um efni með mikla hitaháðni í leysigetu (179 g/100g við 0°C upp í 487 g/100g við 100°C).',
    compound: getCompound('C₁₂H₂₂O₁₁'),
    tempBefore: 20,
    tempAfter: 80,
  },
];

// Visual component showing before/after states
function BeforeAfterVisual({
  before,
  after,
  showAfter,
}: {
  before: { molecules: number; volumeML: number; concentration: number };
  after: { molecules: number; volumeML: number; concentration: number };
  showAfter: boolean;
}) {
  const maxVolume = Math.max(before.volumeML, after.volumeML);

  const renderBeaker = (
    data: { molecules: number; volumeML: number; concentration: number },
    label: string,
    opacity: number = 1
  ) => {
    const fillPercent = (data.volumeML / maxVolume) * 80;
    const displayMolecules = Math.min(data.molecules, 50);

    // Beaker boundaries in SVG coordinates (viewBox 0 0 80 120)
    // Beaker inner walls: x=11 to x=69, liquid bottom at y=98
    const beakerLeft = 13;
    const beakerRight = 67;
    const beakerBottom = 98;
    const liquidTop = 100 - fillPercent + 2;
    const availableLiquidHeight = Math.max(5, beakerBottom - liquidTop);
    const liquidWidth = beakerRight - beakerLeft;

    // Calculate grid layout for even distribution
    const moleculeRadius = 1.5;
    const cols = Math.max(
      1,
      Math.floor(
        liquidWidth /
          Math.max(
            moleculeRadius * 3,
            Math.min(7, Math.sqrt((liquidWidth * availableLiquidHeight) / displayMolecules))
          )
      )
    );
    const rows = Math.max(1, Math.ceil(displayMolecules / cols));

    const xSpacing = liquidWidth / (cols + 1);
    const ySpacing = availableLiquidHeight / (rows + 1);

    return (
      <div className="text-center" style={{ opacity }}>
        <div className="text-sm font-semibold mb-2 text-warm-700">{label}</div>
        <svg viewBox="0 0 80 120" className="w-24 h-32 mx-auto">
          {/* Beaker */}
          <path
            d="M10 10 L10 100 Q10 110 20 110 L60 110 Q70 110 70 100 L70 10"
            fill="none"
            stroke="#374151"
            strokeWidth="2"
          />
          {/* Solution fill */}
          <rect
            x="11"
            y={100 - fillPercent}
            width="58"
            height={fillPercent}
            fill="#3b82f6"
            opacity={Math.min(0.3 + data.concentration * 0.1, 0.8)}
            className="transition-all duration-500"
          />
          {/* Molecules - distributed evenly throughout liquid */}
          {Array.from({ length: displayMolecules }).map((_, i) => {
            const row = Math.floor(i / cols);
            const col = i % cols;

            // Deterministic jitter for natural look
            const jitterX = (((i * 7) % 5) - 2) * 0.4;
            const jitterY = (((i * 11) % 5) - 2) * 0.4;

            const x = beakerLeft + xSpacing * (col + 1) + jitterX;
            const y = liquidTop + ySpacing * (row + 1) + jitterY;

            // Clamp to stay within liquid boundaries
            const clampedX = Math.max(
              beakerLeft + moleculeRadius,
              Math.min(beakerRight - moleculeRadius, x)
            );
            const clampedY = Math.max(
              liquidTop + moleculeRadius,
              Math.min(beakerBottom - moleculeRadius, y)
            );

            return (
              <circle
                key={i}
                cx={clampedX}
                cy={clampedY}
                r={moleculeRadius}
                fill="#1d4ed8"
                className="transition-all duration-500"
              />
            );
          })}
        </svg>
        <div className="text-xs text-warm-600 mt-1">
          <div>{data.volumeML} mL</div>
          <div className="font-bold text-blue-600">{data.concentration.toFixed(1)} M</div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex items-center justify-center gap-4 my-4">
      {renderBeaker(before, 'Fyrir', 1)}
      <div className="text-2xl text-warm-400">→</div>
      {renderBeaker(after, 'Eftir', showAfter ? 1 : 0.3)}
    </div>
  );
}

interface Level2Props {
  onComplete: (score: number, maxScore: number, hintsUsed: number) => void;
  onBack: () => void;
  onCorrectAnswer?: () => void;
  onIncorrectAnswer?: () => void;
}

export function Level2({ onComplete, onBack, onCorrectAnswer, onIncorrectAnswer }: Level2Props) {
  const [currentScenario, setCurrentScenario] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState<number[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showExplorer, setShowExplorer] = useState(false);
  const [explorerTemp, setExplorerTemp] = useState(25);
  const [selectedCompounds, setSelectedCompounds] = useState<string[]>(['KNO₃', 'NaCl', 'CO₂']);

  const scenario = SCENARIOS[currentScenario];

  // Shuffle options for current scenario - memoize to keep stable during scenario
  const shuffledOptions = useMemo(() => {
    const shuffled = shuffleArray(scenario.options);
    // Assign new sequential IDs (a, b, c, d) after shuffling
    return shuffled.map((opt, idx) => ({
      ...opt,
      id: String.fromCharCode(97 + idx), // 'a', 'b', 'c', 'd'
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: re-shuffle when scenario index changes
  }, [currentScenario, scenario.options]);

  const selectedOption = shuffledOptions.find((o) => o.id === selectedAnswer);
  const isCorrect = selectedOption?.isCorrect ?? false;

  const handleSubmit = useCallback(() => {
    if (!selectedAnswer) return;

    setShowResult(true);
    if (isCorrect) {
      setScore((prev) => prev + 100);
      setCompleted((prev) => [...prev, scenario.id]);
      onCorrectAnswer?.();
    } else {
      onIncorrectAnswer?.();
    }
  }, [selectedAnswer, isCorrect, showHint, scenario.id, onCorrectAnswer, onIncorrectAnswer]);

  const handleNext = useCallback(() => {
    if (currentScenario < SCENARIOS.length - 1) {
      setShowHint(false);
      setCurrentScenario((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      const finalScore = score + (isCorrect ? 100 : 0);
      const maxScore = SCENARIOS.length * 100;
      onComplete(finalScore, maxScore, hintsUsed);
    }
  }, [currentScenario, score, isCorrect, showHint, hintsUsed, onComplete]);

  const allComplete = currentScenario === SCENARIOS.length - 1 && showResult;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-green-600">Lausnir - Stigur 2</h1>
              <p className="text-sm text-warm-600">
                Spáðu fyrir um breytingar - ENGIN útreikningar!
              </p>
            </div>

            <div className="flex gap-4 items-center">
              <button onClick={onBack} className="text-warm-600 hover:text-warm-800 text-sm">
                ← Til baka
              </button>
              <button
                onClick={() => setShowExplorer(true)}
                className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                title="Kanna leysigetu"
              >
                🔬 Kanna
              </button>
              <div className="text-center">
                <div className="text-xl font-bold text-green-600">{score}</div>
                <div className="text-xs text-warm-600">Stig</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-blue-600">
                  {completed.length}/{SCENARIOS.length}
                </div>
                <div className="text-xs text-warm-600">Rétt</div>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4 bg-warm-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{
                width: `${((currentScenario + (showResult ? 1 : 0)) / SCENARIOS.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Scenario card */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
          <div className="mb-6">
            <div className="inline-block bg-green-100 px-4 py-2 rounded-full text-sm font-semibold text-green-800 mb-2">
              Atburðarás {currentScenario + 1}: {scenario.title}
            </div>

            {/* Setup */}
            <div className="bg-warm-50 p-4 rounded-xl mb-4">
              <p className="text-lg text-warm-800">{scenario.setup}</p>
            </div>

            {/* Visual representation - depends on scenario type */}
            {scenario.type === 'concentration' ? (
              <BeforeAfterVisual
                before={scenario.visualBefore}
                after={scenario.visualAfter}
                showAfter={showResult}
              />
            ) : (
              <TemperatureComparison
                compound={scenario.compound}
                tempBefore={scenario.tempBefore}
                tempAfter={scenario.tempAfter}
                showAfter={showResult}
              />
            )}

            {/* Question */}
            <div className="text-xl font-semibold text-warm-800 mb-4">{scenario.question}</div>

            {/* Hint display */}
            {showHint && (
              <div className="mb-4 bg-yellow-50 border-2 border-yellow-300 p-4 rounded-xl">
                <h4 className="font-semibold text-yellow-800 mb-1">💡 Vísbending:</h4>
                <p className="text-yellow-900">{scenario.hint}</p>
              </div>
            )}
          </div>

          {/* Options */}
          <div className="space-y-3 mb-6">
            {shuffledOptions.map((option) => {
              let bgColor = 'bg-white hover:bg-warm-50';
              let borderColor = 'border-warm-200';
              let textColor = 'text-warm-800';

              if (selectedAnswer === option.id && !showResult) {
                bgColor = 'bg-green-50';
                borderColor = 'border-green-500';
              }

              if (showResult) {
                if (option.isCorrect) {
                  bgColor = 'bg-green-100';
                  borderColor = 'border-green-500';
                  textColor = 'text-green-800';
                } else if (selectedAnswer === option.id) {
                  bgColor = 'bg-red-100';
                  borderColor = 'border-red-500';
                  textColor = 'text-red-800';
                }
              }

              return (
                <button
                  key={option.id}
                  onClick={() => !showResult && setSelectedAnswer(option.id)}
                  disabled={showResult}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${bgColor} ${borderColor} ${textColor} ${showResult ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="font-bold text-lg">{option.id.toUpperCase()}.</span>
                    <span className="flex-1">{option.text}</span>
                  </div>
                  {showResult && (
                    <div
                      className={`mt-2 text-sm ${option.isCorrect ? 'text-green-700' : 'text-warm-600'}`}
                    >
                      {option.explanation}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Result and concept */}
          {showResult && (
            <div
              className={`p-4 rounded-xl mb-6 ${isCorrect ? 'bg-green-50 border-2 border-green-400' : 'bg-yellow-50 border-2 border-yellow-400'}`}
            >
              <div className="text-xl font-bold mb-2">
                {isCorrect ? '✓ Rétt!' : '✗ Ekki alveg rétt'}
              </div>
              <div className="text-warm-700 mb-4">
                <strong>Lykilhugtak:</strong> {scenario.concept}
              </div>

              {/* Visual comparison - depends on scenario type */}
              <div className="mt-4 p-4 bg-white rounded-xl">
                <div className="text-sm font-semibold text-warm-600 text-center mb-3">
                  Samantekt á breytingum:
                </div>
                {scenario.type === 'concentration' ? (
                  <ConcentrationComparison
                    before={scenario.visualBefore}
                    after={scenario.visualAfter}
                    showParticles={true}
                    animate={false}
                  />
                ) : (
                  <div className="text-center">
                    <div className="flex justify-center items-center gap-4 text-lg">
                      <span className="font-mono bg-blue-100 px-3 py-1 rounded">
                        {scenario.tempBefore}°C
                      </span>
                      <span className="text-warm-400">→</span>
                      <span className="font-mono bg-red-100 px-3 py-1 rounded">
                        {scenario.tempAfter}°C
                      </span>
                    </div>
                    <div className="mt-3 text-sm text-warm-700">
                      {scenario.compound.type === 'gas' ? (
                        <span>
                          Lofttegundir leysast{' '}
                          {scenario.tempAfter < scenario.tempBefore ? 'betur' : 'verr'} við{' '}
                          {scenario.tempAfter < scenario.tempBefore ? 'lægra' : 'hærra'} hitastig
                        </span>
                      ) : (
                        <span>
                          Flest föst efni leysast{' '}
                          {scenario.tempAfter > scenario.tempBefore ? 'betur' : 'verr'} við{' '}
                          {scenario.tempAfter > scenario.tempBefore ? 'hærra' : 'lægra'} hitastig
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action button */}
          <div className="flex flex-col items-center">
            {!showResult ? (
              <>
                {!showHint && (
                  <button
                    onClick={() => {
                      setShowHint(true);
                      setHintsUsed((prev) => prev + 1);
                    }}
                    className="mb-3 text-sm px-4 py-2 rounded-full bg-yellow-100 hover:bg-yellow-200 text-yellow-700 font-medium transition-colors"
                  >
                    💡 Vísbending
                  </button>
                )}
                <button
                  onClick={handleSubmit}
                  disabled={!selectedAnswer}
                  className={`px-8 py-3 rounded-xl font-bold transition-colors ${
                    selectedAnswer
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : 'bg-warm-200 text-warm-500 cursor-not-allowed'
                  }`}
                >
                  Staðfesta svar
                </button>
              </>
            ) : (
              <button
                onClick={handleNext}
                className="px-8 py-3 rounded-xl font-bold bg-green-500 hover:bg-green-600 text-white transition-colors"
              >
                {allComplete ? 'Ljúka Stigi 2 →' : 'Næsta spurning →'}
              </button>
            )}
          </div>
        </div>

        {/* Scenario navigation */}
        <div className="mt-6 flex justify-center gap-2">
          {SCENARIOS.map((s, i) => (
            <div
              key={s.id}
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                completed.includes(s.id)
                  ? 'bg-green-500 text-white'
                  : i === currentScenario
                    ? 'bg-green-200 text-green-800 border-2 border-green-500'
                    : i < currentScenario
                      ? 'bg-red-200 text-red-800'
                      : 'bg-warm-200 text-warm-600'
              }`}
            >
              {completed.includes(s.id) ? '✓' : i + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Temperature Explorer Modal */}
      {showExplorer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-purple-700">🔬 Könnun á leysigetu</h2>
                <button
                  onClick={() => setShowExplorer(false)}
                  className="text-warm-500 hover:text-warm-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <p className="text-warm-600 mb-4">
                Dragðu sleðann til að sjá hvernig hitastig hefur áhrif á leysigetu mismunandi efna.
                Taktu eftir muninum á föstum efnum og lofttegundum!
              </p>

              {/* Compound selection */}
              <div className="mb-4">
                <div className="text-sm font-semibold text-warm-700 mb-2">
                  Veldu efni til að skoða:
                </div>
                <div className="flex flex-wrap gap-2">
                  {SOLUBILITY_DATA.map((compound) => (
                    <button
                      key={compound.formula}
                      onClick={() => {
                        setSelectedCompounds((prev) =>
                          prev.includes(compound.formula)
                            ? prev.filter((f) => f !== compound.formula)
                            : [...prev, compound.formula]
                        );
                      }}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        selectedCompounds.includes(compound.formula)
                          ? 'text-white'
                          : 'bg-warm-100 text-warm-700 hover:bg-warm-200'
                      }`}
                      style={{
                        backgroundColor: selectedCompounds.includes(compound.formula)
                          ? compound.color
                          : undefined,
                      }}
                    >
                      {compound.emoji} {compound.formula}
                      {compound.type === 'gas' && ' (gas)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Solubility curve */}
              <TemperatureSolubilityCurve
                selectedCompounds={selectedCompounds}
                temperature={explorerTemp}
                onTemperatureChange={setExplorerTemp}
                interactive={true}
                showCurve={true}
              />

              {/* Key insight */}
              <div className="mt-4 bg-purple-50 p-4 rounded-xl">
                <h3 className="font-bold text-purple-800 mb-2">Lykilatriði</h3>
                <ul className="text-sm text-purple-900 space-y-1">
                  <li>
                    • <strong>Föst efni:</strong> Flest leysast betur við hærra hitastig (KNO₃,
                    sykur)
                  </li>
                  <li>
                    • <strong>Undantekning:</strong> Sum efni eins og CaSO₄ leysast verr við hærra
                    hitastig
                  </li>
                  <li>
                    • <strong>Lofttegundir:</strong> Leysast VERR við hærra hitastig (O₂, CO₂)
                  </li>
                  <li>
                    • <strong>NaCl:</strong> Næstum óháð hitastigi (sértilfelli)
                  </li>
                </ul>
              </div>

              <button
                onClick={() => setShowExplorer(false)}
                className="mt-4 w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 rounded-xl transition-colors"
              >
                Loka og halda áfram
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Level2;
