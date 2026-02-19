import type { ProblemsData } from '../types';

export const PROBLEMS: ProblemsData = {
  beginner: [
    {
      id: 1,
      reaction: "CH₄(g) + 2O₂(g) → CO₂(g) + 2H₂O(g)",
      name: "Brennsla metans",
      deltaH: -802,
      deltaS: -5,
      defaultTemp: 298,
      scenario: 3,
      difficulty: "Auðvelt"
    },
    {
      id: 2,
      reaction: "H₂O(l) → H₂O(s)",
      name: "Frysing vatns",
      deltaH: -6.0,
      deltaS: -22,
      defaultTemp: 273,
      scenario: 3,
      difficulty: "Auðvelt"
    },
    {
      id: 3,
      reaction: "2H₂O₂(l) → 2H₂O(l) + O₂(g)",
      name: "Niðurbrot vetnisproxíðs",
      deltaH: -196,
      deltaS: 126,
      defaultTemp: 298,
      scenario: 1,
      difficulty: "Auðvelt"
    },
    {
      id: 4,
      reaction: "3O₂(g) → 2O₃(g)",
      name: "Myndun ósons",
      deltaH: 285,
      deltaS: -137,
      defaultTemp: 298,
      scenario: 2,
      difficulty: "Auðvelt"
    },
    {
      id: 5,
      reaction: "H₂O(l) → H₂O(g)",
      name: "Uppgufun vatns við 25°C",
      deltaH: 44.0,
      deltaS: 118,
      defaultTemp: 298,
      scenario: 4,
      difficulty: "Auðvelt"
    },
    {
      id: 6,
      reaction: "2H₂(g) + O₂(g) → 2H₂O(l)",
      name: "Myndun vatns",
      deltaH: -572,
      deltaS: -327,
      defaultTemp: 298,
      scenario: 3,
      difficulty: "Auðvelt"
    },
    {
      id: 7,
      reaction: "NaCl(s) → Na⁺(aq) + Cl⁻(aq)",
      name: "Leysing NaCl",
      deltaH: 3.9,
      deltaS: 43,
      defaultTemp: 298,
      scenario: 4,
      difficulty: "Auðvelt"
    },
    {
      id: 8,
      reaction: "C(s) + O₂(g) → CO₂(g)",
      name: "Brennsla kolefnis",
      deltaH: -394,
      deltaS: 3,
      defaultTemp: 298,
      scenario: 1,
      difficulty: "Auðvelt"
    },
    {
      id: 9,
      reaction: "N₂(g) + O₂(g) → 2NO(g)",
      name: "Myndun köfnunarefnisoxíðs",
      deltaH: 180,
      deltaS: 25,
      defaultTemp: 298,
      scenario: 4,
      difficulty: "Auðvelt"
    },
    {
      id: 10,
      reaction: "CO(g) + ½O₂(g) → CO₂(g)",
      name: "Brennsla kolsýrings",
      deltaH: -283,
      deltaS: -87,
      defaultTemp: 298,
      scenario: 3,
      difficulty: "Auðvelt"
    }
  ],
  intermediate: [
    {
      id: 11,
      reaction: "N₂(g) + 3H₂(g) → 2NH₃(g)",
      name: "Haber aðferðin",
      deltaH: -92,
      deltaS: -199,
      defaultTemp: 500,
      scenario: 3,
      difficulty: "Miðlungs"
    },
    {
      id: 12,
      reaction: "CaCO₃(s) → CaO(s) + CO₂(g)",
      name: "Niðurbrot kalsíumkarbónats",
      deltaH: 178,
      deltaS: 161,
      defaultTemp: 1000,
      scenario: 4,
      difficulty: "Miðlungs"
    },
    {
      id: 13,
      reaction: "H₂O(l) → H₂O(g)",
      name: "Uppgufun vatns við 100°C",
      deltaH: 44.0,
      deltaS: 118,
      defaultTemp: 373,
      scenario: 4,
      difficulty: "Miðlungs"
    },
    {
      id: 14,
      reaction: "6CO₂(g) + 6H₂O(l) → C₆H₁₂O₆(s) + 6O₂(g)",
      name: "Ljóstillífun",
      deltaH: 2803,
      deltaS: -210,
      defaultTemp: 298,
      scenario: 2,
      difficulty: "Miðlungs"
    },
    {
      id: 15,
      reaction: "C(demant) → C(grafít)",
      name: "Demant → Grafít",
      deltaH: -1.9,
      deltaS: 3.3,
      defaultTemp: 298,
      scenario: 1,
      difficulty: "Miðlungs"
    },
    {
      id: 16,
      reaction: "2SO₂(g) + O₂(g) → 2SO₃(g)",
      name: "Contact aðferðin",
      deltaH: -198,
      deltaS: -188,
      defaultTemp: 723,
      scenario: 3,
      difficulty: "Miðlungs"
    },
    {
      id: 17,
      reaction: "CH₄(g) + H₂O(g) → CO(g) + 3H₂(g)",
      name: "Gufumyndun",
      deltaH: 206,
      deltaS: 216,
      defaultTemp: 1000,
      scenario: 4,
      difficulty: "Miðlungs"
    },
    {
      id: 18,
      reaction: "Fe₂O₃(s) + 3CO(g) → 2Fe(s) + 3CO₂(g)",
      name: "Járnframleiðsla",
      deltaH: -25,
      deltaS: 15,
      defaultTemp: 1200,
      scenario: 1,
      difficulty: "Miðlungs"
    },
    {
      id: 19,
      reaction: "NH₄Cl(s) → NH₃(g) + HCl(g)",
      name: "Niðurbrot ammoníumklóríðs",
      deltaH: 176,
      deltaS: 285,
      defaultTemp: 298,
      scenario: 4,
      difficulty: "Miðlungs"
    },
    {
      id: 20,
      reaction: "PCl₅(g) → PCl₃(g) + Cl₂(g)",
      name: "Niðurbrot PCl₅",
      deltaH: 88,
      deltaS: 140,
      defaultTemp: 500,
      scenario: 4,
      difficulty: "Miðlungs"
    },
    {
      id: 21,
      reaction: "2NO₂(g) → N₂O₄(g)",
      name: "Dímun NO₂",
      deltaH: -57,
      deltaS: -176,
      defaultTemp: 298,
      scenario: 3,
      difficulty: "Miðlungs"
    },
    {
      id: 22,
      reaction: "Br₂(l) → Br₂(g)",
      name: "Uppgufun bróms",
      deltaH: 31,
      deltaS: 93,
      defaultTemp: 298,
      scenario: 4,
      difficulty: "Miðlungs"
    }
  ],
  advanced: [
    {
      id: 23,
      reaction: "N₂(g) + 3H₂(g) → 2NH₃(g)",
      name: "ΔG° → K umbreyting",
      deltaH: -92,
      deltaS: -199,
      defaultTemp: 298,
      scenario: 3,
      difficulty: "Erfitt",
      advancedTask: "Reiknaðu K við 298 K"
    },
    {
      id: 24,
      reaction: "N₂(g) + 3H₂(g) → 2NH₃(g)",
      name: "Hitastigsháð K",
      deltaH: -92,
      deltaS: -199,
      defaultTemp: 500,
      scenario: 3,
      difficulty: "Erfitt",
      advancedTask: "Reiknaðu K við 298 K, 500 K, og 700 K"
    },
    {
      id: 25,
      reaction: "C(s) + ½O₂(g) → CO(g)",
      name: "Samtvinnuð hvarfefni",
      deltaH: -137,
      deltaS: 90,
      defaultTemp: 298,
      scenario: 1,
      difficulty: "Erfitt",
      advancedTask: "Notaðu Hess lögmál"
    },
    {
      id: 26,
      reaction: "Próteín (felltur) → Próteín (óvafinn)",
      name: "Afvöfnun prótíns",
      deltaH: 250,
      deltaS: 750,
      defaultTemp: 310,
      scenario: 4,
      difficulty: "Erfitt",
      advancedTask: "Hvers vegna afvafnast prótín við háum hita?"
    },
    {
      id: 27,
      reaction: "ATP + H₂O → ADP + Pᵢ",
      name: "ATP vatnsrofhvarfun",
      deltaH: -20,
      deltaS: 35,
      defaultTemp: 310,
      scenario: 1,
      difficulty: "Erfitt",
      advancedTask: "Reiknaðu K og útskýrðu líffræðilega þýðingu"
    },
    {
      id: 28,
      reaction: "Zn(s) + Cu²⁺(aq) → Zn²⁺(aq) + Cu(s)",
      name: "Rafefnafræðileg tenging",
      deltaH: -218,
      deltaS: -20,
      defaultTemp: 298,
      scenario: 3,
      difficulty: "Erfitt",
      advancedTask: "Notaðu ΔG° = -nFE° (E° = 1.10 V)"
    },
    {
      id: 29,
      reaction: "H₂O(s) → H₂O(l)",
      name: "Bræðsla ís",
      deltaH: 6.0,
      deltaS: 22,
      defaultTemp: 273,
      scenario: 4,
      difficulty: "Erfitt",
      advancedTask: "Spáðu bræðslumarki við 1 atm"
    },
    {
      id: 30,
      reaction: "2SO₂(g) + O₂(g) → 2SO₃(g)",
      name: "Hagræðing iðnaðarhvarfs",
      deltaH: -198,
      deltaS: -188,
      defaultTemp: 723,
      scenario: 3,
      difficulty: "Erfitt",
      advancedTask: "Hvaða hitastig hámarkar framleiðslu?"
    }
  ]
};
