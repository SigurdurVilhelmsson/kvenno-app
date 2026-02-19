import { createGameTranslations } from '@shared/hooks/useGameI18n';

/**
 * Thermodynamics Predictor Game Translations
 */
export const gameTranslations = createGameTranslations({
  is: {
    game: {
      title: 'Varmafræði Spámaður',
      subtitle: 'Kvennaskólinn - Efnafræði 3. ár',
      description: 'Lærðu um Gibbs orkuna og spáðu hvort hvörf séu sjálfspyrjandi',
    },
    intro: {
      title: 'Hvað er Gibbs orka?',
      description: 'Gibbs orka (ΔG) segir okkur hvort hvarf sé sjálfspyrjandi. Ef ΔG < 0, þá gerist hvarfið sjálfkrafa.',
      formula: 'ΔG = ΔH - TΔS',
    },
    levels: {
      level1: {
        name: 'Stig 1: Merki',
        description: 'Lærðu merki ΔH og ΔS',
        details: 'Skildu hvað jákvæð og neikvæð merki þýða fyrir varma og óreiðu.',
      },
      level2: {
        name: 'Stig 2: Spá',
        description: 'Spáðu hvort hvörf séu sjálfspyrjandi',
        details: 'Notaðu merki ΔH og ΔS til að spá fyrir um ΔG.',
        locked: 'Ljúktu stigi 1 fyrst',
      },
      level3: {
        name: 'Stig 3: Útreikningar',
        description: 'Reiknaðu ΔG og crossover hitastig',
        details: 'Notaðu formúluna til að finna ΔG og hitastigið þar sem ΔG = 0.',
        locked: 'Ljúktu stigi 2 fyrst',
      },
    },
    concepts: {
      enthalpy: 'Skammtavarmi (ΔH)',
      entropy: 'Óreiða (ΔS)',
      gibbsEnergy: 'Gibbs orka (ΔG)',
      spontaneous: 'Sjálfspyrjandi',
      nonSpontaneous: 'Ekki sjálfspyrjandi',
      exothermic: 'Varmagefjandi (ΔH < 0)',
      endothermic: 'Varmatökandi (ΔH > 0)',
      entropyIncrease: 'Óreiða eykst (ΔS > 0)',
      entropyDecrease: 'Óreiða minnkar (ΔS < 0)',
      crossoverTemperature: 'Crossover hitastig',
    },
    predictions: {
      alwaysSpontaneous: 'Alltaf sjálfspyrjandi',
      neverSpontaneous: 'Aldrei sjálfspyrjandi',
      spontaneousAtLowT: 'Sjálfspyrjandi við lágan hita',
      spontaneousAtHighT: 'Sjálfspyrjandi við háan hita',
    },
    formulas: {
      title: 'Lykilformúlur',
      gibbsEnergy: 'ΔG = ΔH - TΔS',
      crossover: 'T = ΔH / ΔS (þegar ΔG = 0)',
      spontaneity: 'ΔG < 0 → sjálfspyrjandi',
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
      title: 'Thermodynamics Predictor',
      subtitle: 'Kvennaskólinn - Chemistry Year 3',
      description: 'Learn about Gibbs energy and predict whether reactions are spontaneous',
    },
    intro: {
      title: 'What is Gibbs energy?',
      description: "Gibbs energy (ΔG) tells us whether a reaction is spontaneous. If ΔG < 0, the reaction occurs spontaneously.",
      formula: 'ΔG = ΔH - TΔS',
    },
    levels: {
      level1: {
        name: 'Level 1: Signs',
        description: 'Learn signs of ΔH and ΔS',
        details: 'Understand what positive and negative signs mean for heat and disorder.',
      },
      level2: {
        name: 'Level 2: Predict',
        description: 'Predict whether reactions are spontaneous',
        details: 'Use signs of ΔH and ΔS to predict ΔG.',
        locked: 'Complete level 1 first',
      },
      level3: {
        name: 'Level 3: Calculations',
        description: 'Calculate ΔG and crossover temperature',
        details: 'Use the formula to find ΔG and the temperature where ΔG = 0.',
        locked: 'Complete level 2 first',
      },
    },
    concepts: {
      enthalpy: 'Enthalpy (ΔH)',
      entropy: 'Entropy (ΔS)',
      gibbsEnergy: 'Gibbs energy (ΔG)',
      spontaneous: 'Spontaneous',
      nonSpontaneous: 'Non-spontaneous',
      exothermic: 'Exothermic (ΔH < 0)',
      endothermic: 'Endothermic (ΔH > 0)',
      entropyIncrease: 'Entropy increases (ΔS > 0)',
      entropyDecrease: 'Entropy decreases (ΔS < 0)',
      crossoverTemperature: 'Crossover temperature',
    },
    predictions: {
      alwaysSpontaneous: 'Always spontaneous',
      neverSpontaneous: 'Never spontaneous',
      spontaneousAtLowT: 'Spontaneous at low temperature',
      spontaneousAtHighT: 'Spontaneous at high temperature',
    },
    formulas: {
      title: 'Key Formulas',
      gibbsEnergy: 'ΔG = ΔH - TΔS',
      crossover: 'T = ΔH / ΔS (when ΔG = 0)',
      spontaneity: 'ΔG < 0 → spontaneous',
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
      title: 'Predictor termodynamiczny',
      subtitle: 'Kvennaskólinn - Chemia rok 3',
      description: 'Poznaj energie Gibbsa i przewiduj czy reakcje sa samorzutne',
    },
    intro: {
      title: 'Czym jest energia Gibbsa?',
      description: 'Energia Gibbsa (ΔG) mowi nam czy reakcja jest samorzutna. Jesli ΔG < 0, reakcja zachodzi samorzutnie.',
      formula: 'ΔG = ΔH - TΔS',
    },
    levels: {
      level1: {
        name: 'Poziom 1: Znaki',
        description: 'Poznaj znaki ΔH i ΔS',
        details: 'Zrozum co oznaczaja znaki dodatnie i ujemne dla ciepla i nieuporzadkowania.',
      },
      level2: {
        name: 'Poziom 2: Przewiduj',
        description: 'Przewiduj czy reakcje sa samorzutne',
        details: 'Uzyj znakow ΔH i ΔS do przewidzenia ΔG.',
        locked: 'Najpierw ukoncz poziom 1',
      },
      level3: {
        name: 'Poziom 3: Obliczenia',
        description: 'Oblicz ΔG i temperature przejscia',
        details: 'Uzyj wzoru aby znalezc ΔG i temperature gdzie ΔG = 0.',
        locked: 'Najpierw ukoncz poziom 2',
      },
    },
    concepts: {
      enthalpy: 'Entalpia (ΔH)',
      entropy: 'Entropia (ΔS)',
      gibbsEnergy: 'Energia Gibbsa (ΔG)',
      spontaneous: 'Samorzutna',
      nonSpontaneous: 'Niesamorzutna',
      exothermic: 'Egzotermiczna (ΔH < 0)',
      endothermic: 'Endotermiczna (ΔH > 0)',
      entropyIncrease: 'Entropia wzrasta (ΔS > 0)',
      entropyDecrease: 'Entropia maleje (ΔS < 0)',
      crossoverTemperature: 'Temperatura przejscia',
    },
    predictions: {
      alwaysSpontaneous: 'Zawsze samorzutna',
      neverSpontaneous: 'Nigdy samorzutna',
      spontaneousAtLowT: 'Samorzutna w niskiej temperaturze',
      spontaneousAtHighT: 'Samorzutna w wysokiej temperaturze',
    },
    formulas: {
      title: 'Kluczowe wzory',
      gibbsEnergy: 'ΔG = ΔH - TΔS',
      crossover: 'T = ΔH / ΔS (gdy ΔG = 0)',
      spontaneity: 'ΔG < 0 → samorzutna',
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
