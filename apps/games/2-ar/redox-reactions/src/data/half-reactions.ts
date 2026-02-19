export interface HalfReaction {
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

export interface RedoxProblem {
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

export const problems: RedoxProblem[] = [
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
