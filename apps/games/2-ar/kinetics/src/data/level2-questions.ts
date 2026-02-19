export interface ExperimentData {
  experiment: number;
  concentrationA: number;
  concentrationB: number;
  initialRate: number;
}

export interface RateLawChallenge {
  id: number;
  title: string;
  description: string;
  equation: string;
  data: ExperimentData[];
  correctOrderA: number;
  correctOrderB: number;
  correctRateConstant: number;
  rateConstantUnit: string;
  hint: string;
  explanation: string;
}

export const challenges: RateLawChallenge[] = [
  {
    id: 1,
    title: 'Einföld hvörf',
    description: 'Finndu röð hvörfunar fyrir A og B með því að bera saman tilraunir.',
    equation: 'A + B → Products',
    data: [
      { experiment: 1, concentrationA: 0.10, concentrationB: 0.10, initialRate: 0.015 },
      { experiment: 2, concentrationA: 0.20, concentrationB: 0.10, initialRate: 0.030 },
      { experiment: 3, concentrationA: 0.10, concentrationB: 0.20, initialRate: 0.060 },
    ],
    correctOrderA: 1,
    correctOrderB: 2,
    correctRateConstant: 15,
    rateConstantUnit: 'M⁻²s⁻¹',
    hint: 'Berðu saman tilraunir þar sem aðeins einn styrkur breytist',
    explanation: 'Tilraun 1→2: [A] tvöfaldast, Rate tvöfaldast → 1. stig í A. Tilraun 1→3: [B] tvöfaldast, Rate fjórfaldast → 2. stig í B.'
  },
  {
    id: 2,
    title: 'Núllta stigs hvörf',
    description: 'Þegar ensím eru mettað virkar hvörf oft á 0. stigi.',
    equation: 'S → P (ensímhvörf)',
    data: [
      { experiment: 1, concentrationA: 0.50, concentrationB: 0, initialRate: 0.020 },
      { experiment: 2, concentrationA: 1.00, concentrationB: 0, initialRate: 0.020 },
      { experiment: 3, concentrationA: 2.00, concentrationB: 0, initialRate: 0.020 },
    ],
    correctOrderA: 0,
    correctOrderB: 0,
    correctRateConstant: 0.020,
    rateConstantUnit: 'M·s⁻¹',
    hint: 'Ef hraðinn breytist ekki þegar styrkur breytist, hver er röðin?',
    explanation: 'Styrkur tvöfaldast en hraðinn helst sá sami → 0. stigs hvörf. Rate = k = 0.020 M/s.'
  },
  {
    id: 3,
    title: 'Annars stigs hvörf',
    description: 'Finndu hraðalögmálið fyrir þetta hvörf.',
    equation: '2NO₂ → 2NO + O₂',
    data: [
      { experiment: 1, concentrationA: 0.010, concentrationB: 0, initialRate: 0.0010 },
      { experiment: 2, concentrationA: 0.020, concentrationB: 0, initialRate: 0.0040 },
      { experiment: 3, concentrationA: 0.030, concentrationB: 0, initialRate: 0.0090 },
    ],
    correctOrderA: 2,
    correctOrderB: 0,
    correctRateConstant: 10,
    rateConstantUnit: 'M⁻¹s⁻¹',
    hint: 'Hvað gerist við hraðann þegar styrkur tvöfaldast? Þrefaldast?',
    explanation: 'Tilraun 1→2: [NO₂] tvöfaldast (×2), Rate fjórfaldast (×4 = 2²) → 2. stigs. k = Rate/[A]² = 0.001/0.01² = 10 M⁻¹s⁻¹.'
  },
  {
    id: 4,
    title: 'Tvö hvarfefni',
    description: 'Greindu röðina fyrir bæði BrO₃⁻ og Br⁻.',
    equation: 'BrO₃⁻ + 5Br⁻ + 6H⁺ → 3Br₂ + 3H₂O',
    data: [
      { experiment: 1, concentrationA: 0.10, concentrationB: 0.10, initialRate: 0.80 },
      { experiment: 2, concentrationA: 0.20, concentrationB: 0.10, initialRate: 1.60 },
      { experiment: 3, concentrationA: 0.10, concentrationB: 0.30, initialRate: 2.40 },
    ],
    correctOrderA: 1,
    correctOrderB: 1,
    correctRateConstant: 80,
    rateConstantUnit: 'M⁻¹s⁻¹',
    hint: 'A = BrO₃⁻, B = Br⁻ (H⁺ er stöðugur)',
    explanation: 'Tilraun 1→2: [A] tvöfaldast → Rate tvöfaldast → 1. stig í A. Tilraun 1→3: [B] þrefaldast → Rate þrefaldast → 1. stig í B.'
  },
  {
    id: 5,
    title: 'Flóknari tilfelli',
    description: 'Ákvarðaðu heildarröð hvörfunar.',
    equation: '2H₂ + 2NO → N₂ + 2H₂O',
    data: [
      { experiment: 1, concentrationA: 0.10, concentrationB: 0.10, initialRate: 0.0050 },
      { experiment: 2, concentrationA: 0.20, concentrationB: 0.10, initialRate: 0.0100 },
      { experiment: 3, concentrationA: 0.10, concentrationB: 0.20, initialRate: 0.0200 },
    ],
    correctOrderA: 1,
    correctOrderB: 2,
    correctRateConstant: 50,
    rateConstantUnit: 'M⁻²s⁻¹',
    hint: 'A = H₂, B = NO. Heildarröð = m + n',
    explanation: 'H₂ er 1. stigs, NO er 2. stigs. Heildarröð = 1 + 2 = 3. stigs hvörf.'
  },
  {
    id: 6,
    title: 'Reikna k',
    description: 'Þú veist nú röðina. Reiknaðu hraðafastann k.',
    equation: 'A + 2B → C',
    data: [
      { experiment: 1, concentrationA: 0.50, concentrationB: 0.50, initialRate: 0.250 },
      { experiment: 2, concentrationA: 1.00, concentrationB: 0.50, initialRate: 0.500 },
      { experiment: 3, concentrationA: 0.50, concentrationB: 1.00, initialRate: 1.000 },
    ],
    correctOrderA: 1,
    correctOrderB: 2,
    correctRateConstant: 2.0,
    rateConstantUnit: 'M⁻²s⁻¹',
    hint: 'k = Rate / ([A]^m × [B]^n)',
    explanation: 'Rate = k[A][B]². Notum tilraun 1: k = 0.250 / (0.50 × 0.50²) = 0.250 / 0.125 = 2.0 M⁻²s⁻¹.'
  },
];

export const MAX_SCORE = 20 * 6; // 20 points per challenge, 6 challenges
