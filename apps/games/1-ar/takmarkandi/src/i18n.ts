import { createGameTranslations } from '@shared/hooks/useGameI18n';

/**
 * Limiting Reagent Game Translations
 */
export const gameTranslations = createGameTranslations({
  is: {
    game: {
      title: 'Takmarkandi hvarfefni',
      subtitle: 'Kvennaskólinn - Efnafræði 1. ár',
      description: 'Lærðu að finna takmarkandi hvarfefni og reikna heimtur',
    },
    menu: {
      selectLevel: 'Veldu stig',
      backToGames: 'Til baka í leikjayfirlit',
    },
    levels: {
      level1: {
        name: 'Stig 1',
        title: 'Grunnhugtök',
        description: 'Skildu hugtökin sjónrænt - hvað eyðist fyrst?',
      },
      level2: {
        name: 'Stig 2',
        title: 'Leiðbeind æfing',
        description: 'Leystu verkefni skref fyrir skref með leiðsögn',
      },
      level3: {
        name: 'Stig 3',
        title: 'Meistarapróf',
        description:
          'Samþætt verkefni í grömmum: finndu takmarkandi hvarfefni, fræðilegar heimtur og prósentuheimtur',
      },
    },
    progress: {
      title: 'Framvinda',
      levelsCompleted: 'Stig lokið',
      totalScore: 'Heildarstig',
      gamesPlayed: 'Leikir spilaðir',
      accuracy: 'nákvæmni',
      points: 'stig',
      completed: 'Lokið',
      reset: 'Endurstilla',
    },
    learn: {
      title: 'Hvað lærir þú?',
      point1: 'Hvað er takmarkandi hvarfefni og hvers vegna það skiptir máli',
      point2: 'Hvernig á að finna takmarkandi hvarfefni út frá stuðlum',
      point3: 'Reikna magn myndefna og afganga eftir hvarf',
      point4: 'Nota hlutfallaefnafræði til að leysa raunveruleg vandamál',
    },
  },
  en: {
    game: {
      title: 'Limiting Reagent',
      subtitle: 'Kvennaskólinn - Chemistry Year 1',
      description: 'Learn to find limiting reagents and calculate yields',
    },
    menu: {
      selectLevel: 'Select level',
      backToGames: 'Back to game overview',
    },
    levels: {
      level1: {
        name: 'Level 1',
        title: 'Basic Concepts',
        description: 'Understand concepts visually - what runs out first?',
      },
      level2: {
        name: 'Level 2',
        title: 'Guided Practice',
        description: 'Solve problems step by step with guidance',
      },
      level3: {
        name: 'Level 3',
        title: 'Master Test',
        description:
          'Integrated problems in grams: find the limiting reactant, the theoretical yield and the percent yield',
      },
    },
    progress: {
      title: 'Progress',
      levelsCompleted: 'Levels completed',
      totalScore: 'Total score',
      gamesPlayed: 'Games played',
      accuracy: 'accuracy',
      points: 'points',
      completed: 'Completed',
      reset: 'Reset',
    },
    learn: {
      title: 'What will you learn?',
      point1: 'What is a limiting reagent and why it matters',
      point2: 'How to find limiting reagent from coefficients',
      point3: 'Calculate product amounts and excess after reaction',
      point4: 'Use stoichiometry to solve real problems',
    },
  },
  pl: {
    game: {
      title: 'Substrat ograniczający',
      subtitle: 'Kvennaskólinn - Chemia rok 1',
      description: 'Naucz się znajdować substrat ograniczający i obliczać wydajność',
    },
    menu: {
      selectLevel: 'Wybierz poziom',
      backToGames: 'Powrót do przeglądu gier',
    },
    levels: {
      level1: {
        name: 'Poziom 1',
        title: 'Podstawowe pojęcia',
        description: 'Zrozum pojęcia wizualnie - co skończy się pierwsze?',
      },
      level2: {
        name: 'Poziom 2',
        title: 'Ćwiczenia z prowadzeniem',
        description: 'Rozwiązuj zadania krok po kroku z pomocą',
      },
      level3: {
        name: 'Poziom 3',
        title: 'Test mistrzowski',
        description: 'Zadania w gramach: znajdź substrat ograniczający i oblicz wydajność',
      },
    },
    progress: {
      title: 'Postęp',
      levelsCompleted: 'Ukończone poziomy',
      totalScore: 'Całkowity wynik',
      gamesPlayed: 'Rozegrane gry',
      accuracy: 'dokładność',
      points: 'punkty',
      completed: 'Ukończone',
      reset: 'Resetuj',
    },
    learn: {
      title: 'Czego się nauczysz?',
      point1: 'Czym jest substrat ograniczający i dlaczego jest ważny',
      point2: 'Jak znaleźć substrat ograniczający ze współczynników',
      point3: 'Obliczać ilości produktów i nadmiaru po reakcji',
      point4: 'Używać stechiometrii do rozwiązywania rzeczywistych problemów',
    },
  },
});
