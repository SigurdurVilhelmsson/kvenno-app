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
      { experiment: 1, concentrationA: 0.1, concentrationB: 0.1, initialRate: 0.015 },
      { experiment: 2, concentrationA: 0.2, concentrationB: 0.1, initialRate: 0.03 },
      { experiment: 3, concentrationA: 0.1, concentrationB: 0.2, initialRate: 0.06 },
    ],
    correctOrderA: 1,
    correctOrderB: 2,
    correctRateConstant: 15,
    rateConstantUnit: 'M⁻²s⁻¹',
    hint: 'Berðu saman tilraunir þar sem aðeins einn styrkur breytist',
    explanation:
      'Tilraun 1→2: [A] tvöfaldast, Rate tvöfaldast → 1. stig í A. Tilraun 1→3: [B] tvöfaldast, Rate fjórfaldast → 2. stig í B.',
  },
  {
    id: 2,
    title: 'Núllta stigs hvörf',
    description: 'Þegar ensím eru mettað virkar hvörf oft á 0. stigi.',
    equation: 'S → P (ensímhvörf)',
    data: [
      { experiment: 1, concentrationA: 0.5, concentrationB: 0, initialRate: 0.02 },
      { experiment: 2, concentrationA: 1.0, concentrationB: 0, initialRate: 0.02 },
      { experiment: 3, concentrationA: 2.0, concentrationB: 0, initialRate: 0.02 },
    ],
    correctOrderA: 0,
    correctOrderB: 0,
    correctRateConstant: 0.02,
    rateConstantUnit: 'M·s⁻¹',
    hint: 'Ef hraðinn breytist ekki þegar styrkur breytist, hver er röðin?',
    explanation:
      'Styrkur tvöfaldast en hraðinn helst sá sami → 0. stigs hvörf. Rate = k = 0.020 M/s.',
  },
  {
    id: 3,
    title: 'Annars stigs hvörf',
    description: 'Finndu hraðalögmálið fyrir þetta hvörf.',
    equation: '2NO₂ → 2NO + O₂',
    data: [
      { experiment: 1, concentrationA: 0.01, concentrationB: 0, initialRate: 0.001 },
      { experiment: 2, concentrationA: 0.02, concentrationB: 0, initialRate: 0.004 },
      { experiment: 3, concentrationA: 0.03, concentrationB: 0, initialRate: 0.009 },
    ],
    correctOrderA: 2,
    correctOrderB: 0,
    correctRateConstant: 10,
    rateConstantUnit: 'M⁻¹s⁻¹',
    hint: 'Hvað gerist við hraðann þegar styrkur tvöfaldast? Þrefaldast?',
    explanation:
      'Tilraun 1→2: [NO₂] tvöfaldast (×2), Rate fjórfaldast (×4 = 2²) → 2. stigs. k = Rate/[A]² = 0.001/0.01² = 10 M⁻¹s⁻¹.',
  },
  {
    id: 4,
    title: 'Tvö hvarfefni',
    description: 'Greindu röðina fyrir bæði BrO₃⁻ og Br⁻.',
    equation: 'BrO₃⁻ + 5Br⁻ + 6H⁺ → 3Br₂ + 3H₂O',
    data: [
      { experiment: 1, concentrationA: 0.1, concentrationB: 0.1, initialRate: 0.8 },
      { experiment: 2, concentrationA: 0.2, concentrationB: 0.1, initialRate: 1.6 },
      { experiment: 3, concentrationA: 0.1, concentrationB: 0.3, initialRate: 2.4 },
    ],
    correctOrderA: 1,
    correctOrderB: 1,
    correctRateConstant: 80,
    rateConstantUnit: 'M⁻¹s⁻¹',
    hint: 'A = BrO₃⁻, B = Br⁻ (H⁺ er stöðugur)',
    explanation:
      'Tilraun 1→2: [A] tvöfaldast → Rate tvöfaldast → 1. stig í A. Tilraun 1→3: [B] þrefaldast → Rate þrefaldast → 1. stig í B.',
  },
  {
    id: 5,
    title: 'Flóknari tilfelli',
    description: 'Ákvarðaðu heildarröð hvörfunar.',
    equation: '2H₂ + 2NO → N₂ + 2H₂O',
    data: [
      { experiment: 1, concentrationA: 0.1, concentrationB: 0.1, initialRate: 0.005 },
      { experiment: 2, concentrationA: 0.2, concentrationB: 0.1, initialRate: 0.01 },
      { experiment: 3, concentrationA: 0.1, concentrationB: 0.2, initialRate: 0.02 },
    ],
    correctOrderA: 1,
    correctOrderB: 2,
    correctRateConstant: 50,
    rateConstantUnit: 'M⁻²s⁻¹',
    hint: 'A = H₂, B = NO. Heildarröð = m + n',
    explanation: 'H₂ er 1. stigs, NO er 2. stigs. Heildarröð = 1 + 2 = 3. stigs hvörf.',
  },
  {
    id: 6,
    title: 'Reikna k',
    description: 'Þú veist nú röðina. Reiknaðu hraðafastann k.',
    equation: 'A + 2B → C',
    data: [
      { experiment: 1, concentrationA: 0.5, concentrationB: 0.5, initialRate: 0.25 },
      { experiment: 2, concentrationA: 1.0, concentrationB: 0.5, initialRate: 0.5 },
      { experiment: 3, concentrationA: 0.5, concentrationB: 1.0, initialRate: 1.0 },
    ],
    correctOrderA: 1,
    correctOrderB: 2,
    correctRateConstant: 2.0,
    rateConstantUnit: 'M⁻²s⁻¹',
    hint: 'k = Rate / ([A]^m × [B]^n)',
    explanation:
      'Rate = k[A][B]². Notum tilraun 1: k = 0.250 / (0.50 × 0.50²) = 0.250 / 0.125 = 2.0 M⁻²s⁻¹.',
  },
];
