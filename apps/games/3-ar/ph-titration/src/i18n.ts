import { createGameTranslations } from '@shared/hooks/useGameI18n';

/**
 * pH Titration Game Translations
 */
export const gameTranslations = createGameTranslations({
  is: {
    game: {
      title: 'pH Títrun',
      subtitle: 'Kvennaskólinn - Efnafræði 3. ár',
      description: 'Lærðu um títrun og hvernig á að finna jafngildispunkt',
    },
    intro: {
      title: 'Hvað er títrun?',
      description: 'Títrun er aðferð til að finna styrk óþekktrar lausnar með því að bæta við þekktri lausn þar til jafngildispunkti er náð.',
    },
    levels: {
      level1: {
        name: 'Stig 1: Grunnhugtök',
        description: 'Skildu títrunarkúrfur',
        details: 'Lærðu um sterkar og veikar sýrur/basar og hvernig kúrfurnar líta út.',
      },
      level2: {
        name: 'Stig 2: Jafngildispunktur',
        description: 'Finndu jafngildispunktinn',
        details: 'Greindu títrunarkúrfur og finndu pH við jafngildispunkt.',
        locked: 'Ljúktu stigi 1 fyrst',
      },
      level3: {
        name: 'Stig 3: Útreikningar',
        description: 'Reiknaðu styrk og rúmmál',
        details: 'Notaðu títrunargögn til að reikna óþekktar stærðir.',
        locked: 'Ljúktu stigi 2 fyrst',
      },
    },
    concepts: {
      titration: 'Títrun',
      equivalencePoint: 'Jafngildispunktur',
      endPoint: 'Lokpunktur',
      indicator: 'Indikator',
      burette: 'Byretta',
      analyte: 'Greinefni',
      titrant: 'Títrefni',
      bufferRegion: 'Stuðpúðasvæði',
      halfEquivalencePoint: 'Hálfur jafngildispunktur',
    },
    acids: {
      strongAcid: 'Sterk sýra',
      weakAcid: 'Veik sýra',
      strongBase: 'Sterkur basi',
      weakBase: 'Veikur basi',
    },
    indicators: {
      phenolphthalein: 'Fenólftaleín',
      methylOrange: 'Metýlappelsínugult',
      litmus: 'Lakmus',
      bromothymolBlue: 'Brómþýmólblátt',
    },
    curveFeatures: {
      initialPH: 'Upphafs pH',
      bufferRegion: 'Stuðpúðasvæði',
      equivalencePoint: 'Jafngildispunktur',
      finalPH: 'Loka pH',
    },
    formulas: {
      title: 'Lykilformúlur',
      neutralization: 'M₁V₁ = M₂V₂ (fyrir einprótóna)',
      henderson: 'pH = pKa + log([A⁻]/[HA])',
    },
    progress: {
      title: 'Framvinda',
      levelsCompleted: 'Stig lokið',
      totalScore: 'Heildar stig',
      gamesPlayed: 'Leikir spilaðir',
      reset: 'Endurstilla',
    },
  },
  en: {
    game: {
      title: 'pH Titration',
      subtitle: 'Kvennaskólinn - Chemistry Year 3',
      description: 'Learn about titration and how to find the equivalence point',
    },
    intro: {
      title: 'What is titration?',
      description: 'Titration is a method to find the concentration of an unknown solution by adding a known solution until the equivalence point is reached.',
    },
    levels: {
      level1: {
        name: 'Level 1: Basic Concepts',
        description: 'Understand titration curves',
        details: 'Learn about strong and weak acids/bases and what their curves look like.',
      },
      level2: {
        name: 'Level 2: Equivalence Point',
        description: 'Find the equivalence point',
        details: 'Analyze titration curves and find pH at equivalence point.',
        locked: 'Complete level 1 first',
      },
      level3: {
        name: 'Level 3: Calculations',
        description: 'Calculate concentration and volume',
        details: 'Use titration data to calculate unknown quantities.',
        locked: 'Complete level 2 first',
      },
    },
    concepts: {
      titration: 'Titration',
      equivalencePoint: 'Equivalence point',
      endPoint: 'End point',
      indicator: 'Indicator',
      burette: 'Burette',
      analyte: 'Analyte',
      titrant: 'Titrant',
      bufferRegion: 'Buffer region',
      halfEquivalencePoint: 'Half-equivalence point',
    },
    acids: {
      strongAcid: 'Strong acid',
      weakAcid: 'Weak acid',
      strongBase: 'Strong base',
      weakBase: 'Weak base',
    },
    indicators: {
      phenolphthalein: 'Phenolphthalein',
      methylOrange: 'Methyl orange',
      litmus: 'Litmus',
      bromothymolBlue: 'Bromothymol blue',
    },
    curveFeatures: {
      initialPH: 'Initial pH',
      bufferRegion: 'Buffer region',
      equivalencePoint: 'Equivalence point',
      finalPH: 'Final pH',
    },
    formulas: {
      title: 'Key Formulas',
      neutralization: 'M₁V₁ = M₂V₂ (for monoprotic)',
      henderson: 'pH = pKa + log([A⁻]/[HA])',
    },
    progress: {
      title: 'Progress',
      levelsCompleted: 'Levels completed',
      totalScore: 'Total score',
      gamesPlayed: 'Games played',
      reset: 'Reset',
    },
  },
  pl: {
    game: {
      title: 'Miareczkowanie pH',
      subtitle: 'Kvennaskólinn - Chemia rok 3',
      description: 'Poznaj miareczkowanie i jak znalezc punkt rownowaznikowy',
    },
    intro: {
      title: 'Czym jest miareczkowanie?',
      description: 'Miareczkowanie to metoda znajdowania stezenia nieznanego roztworu poprzez dodawanie znanego roztworu az do osiagniecia punktu rownowaznikowego.',
    },
    levels: {
      level1: {
        name: 'Poziom 1: Podstawowe pojecia',
        description: 'Zrozum krzywe miareczkowania',
        details: 'Poznaj mocne i slabe kwasy/zasady i jak wygladaja ich krzywe.',
      },
      level2: {
        name: 'Poziom 2: Punkt rownowaznikowy',
        description: 'Znajdz punkt rownowaznikowy',
        details: 'Analizuj krzywe miareczkowania i znajdz pH w punkcie rownowaznikowym.',
        locked: 'Najpierw ukoncz poziom 1',
      },
      level3: {
        name: 'Poziom 3: Obliczenia',
        description: 'Oblicz stezenie i objetosc',
        details: 'Uzyj danych z miareczkowania do obliczenia nieznanych wielkosci.',
        locked: 'Najpierw ukoncz poziom 2',
      },
    },
    concepts: {
      titration: 'Miareczkowanie',
      equivalencePoint: 'Punkt rownowaznikowy',
      endPoint: 'Punkt koncowy',
      indicator: 'Wskaznik',
      burette: 'Biureta',
      analyte: 'Analit',
      titrant: 'Titrant',
      bufferRegion: 'Obszar buforowy',
      halfEquivalencePoint: 'Polpunkt rownowaznikowy',
    },
    acids: {
      strongAcid: 'Mocny kwas',
      weakAcid: 'Slaby kwas',
      strongBase: 'Mocna zasada',
      weakBase: 'Slaba zasada',
    },
    indicators: {
      phenolphthalein: 'Fenoloftaleina',
      methylOrange: 'Oranz metylowy',
      litmus: 'Lakmus',
      bromothymolBlue: 'Blekit bromotymolowy',
    },
    curveFeatures: {
      initialPH: 'Poczatkowe pH',
      bufferRegion: 'Obszar buforowy',
      equivalencePoint: 'Punkt rownowaznikowy',
      finalPH: 'Koncowe pH',
    },
    formulas: {
      title: 'Kluczowe wzory',
      neutralization: 'M₁V₁ = M₂V₂ (dla jednoprotonowych)',
      henderson: 'pH = pKa + log([A⁻]/[HA])',
    },
    progress: {
      title: 'Postep',
      levelsCompleted: 'Ukonczone poziomy',
      totalScore: 'Calkowity wynik',
      gamesPlayed: 'Rozegrane gry',
      reset: 'Resetuj',
    },
  },
});
