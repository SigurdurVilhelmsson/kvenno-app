import { createGameTranslations } from '@shared/hooks/useGameI18n';

/**
 * Jafna Jöfnur (Balance Equations) Game Translations
 * Covers balancing chemical equations at three difficulty tiers.
 */
export const gameTranslations = createGameTranslations({
  is: {
    game: {
      title: 'Jafna Jöfnur',
      subtitle: 'Lærðu að jafna efnajöfnur - undirstaða stækifræði',
    },
    menu: {
      level1: {
        title: 'Stig 1: Einfaldar jöfnur',
        description: 'Jafna einfaldar efnajöfnur með litlum stuðlum',
        tags: {
          simple: 'Einfaldar',
          smallCoeffs: 'Stuðlar 1-4',
          hints: 'Vísbendingar',
        },
      },
      level2: {
        title: 'Stig 2: Miðlungs jöfnur',
        description: 'Jöfnur með fleiri frumefnum og stærri stuðlum',
        tags: {
          medium: 'Miðlungs',
          multiElement: 'Fleiri frumefni',
          larger: 'Stærri stuðlar',
        },
      },
      level3: {
        title: 'Stig 3: Erfiðar jöfnur',
        description: 'Brunajöfnur, tvíbótaviðbrögð og flóknari jöfnur',
        tags: {
          combustion: 'Bruni',
          displacement: 'Tvíbóta',
          complex: 'Flóknar',
        },
      },
      learningPath: {
        title: 'Námsferillinn',
        step1: {
          title: 'Einfaldar jöfnur',
          description: 'Byrja á einföldum jöfnum með 2 frumefnum',
        },
        step2: {
          title: 'Miðlungs jöfnur',
          description: 'Þjálfa sig á jöfnum með 3+ frumefnum',
        },
        step3: {
          title: 'Erfiðar jöfnur',
          description: 'Leysa flóknari jöfnur sjálfstætt',
        },
      },
      resetProgress: 'Endurstilla framvindu',
      resetConfirm: 'Ertu viss um að þú viljir endurstilla framvinduna?',
    },
    equation: {
      check: 'Athuga',
      next: 'Næsta jafna',
      seeResults: 'Sjá niðurstöður',
      balanced: 'Jafna jöfn!',
      notBalanced: 'Jafnan er ekki jöfn - reyndu aftur.',
      coefficient: 'Stuðull',
      leftSide: 'Vinstri',
      rightSide: 'Hægri',
      element: 'Frumefni',
      atomCount: 'Fjöldi atóma',
      hint: 'Vísbending',
      reactants: 'Hvarfefni',
      products: 'Myndefni',
    },
    results: {
      title: 'Niðurstöður',
      score: 'Þú jafnaðir {correct} af {total} jöfnum rétt',
      retry: 'Reyna aftur',
      complete: 'Ljúka stigi',
      backToMenu: 'Til baka í valmynd',
    },
    level: {
      back: '← Til baka',
      title1: 'Einfaldar jöfnur – Stig 1',
      title2: 'Miðlungs jöfnur – Stig 2',
      title3: 'Erfiðar jöfnur – Stig 3',
    },
  },
  en: {
    game: {
      title: 'Balance Equations',
      subtitle: 'Learn to balance chemical equations - the foundation of stoichiometry',
    },
    menu: {
      level1: {
        title: 'Level 1: Simple Equations',
        description: 'Balance simple chemical equations with small coefficients',
        tags: {
          simple: 'Simple',
          smallCoeffs: 'Coefficients 1-4',
          hints: 'Hints',
        },
      },
      level2: {
        title: 'Level 2: Medium Equations',
        description: 'Equations with more elements and larger coefficients',
        tags: {
          medium: 'Medium',
          multiElement: 'Multi-element',
          larger: 'Larger coefficients',
        },
      },
      level3: {
        title: 'Level 3: Hard Equations',
        description: 'Combustion, displacement and complex equations',
        tags: {
          combustion: 'Combustion',
          displacement: 'Displacement',
          complex: 'Complex',
        },
      },
      learningPath: {
        title: 'Learning Path',
        step1: {
          title: 'Simple Equations',
          description: 'Start with simple 2-element equations',
        },
        step2: {
          title: 'Medium Equations',
          description: 'Practice with 3+ element equations',
        },
        step3: {
          title: 'Hard Equations',
          description: 'Solve complex equations independently',
        },
      },
      resetProgress: 'Reset progress',
      resetConfirm: 'Are you sure you want to reset all progress?',
    },
    equation: {
      check: 'Check',
      next: 'Next equation',
      seeResults: 'See results',
      balanced: 'Equation balanced!',
      notBalanced: 'Equation is not balanced - try again.',
      coefficient: 'Coefficient',
      leftSide: 'Left',
      rightSide: 'Right',
      element: 'Element',
      atomCount: 'Atom count',
      hint: 'Hint',
      reactants: 'Reactants',
      products: 'Products',
    },
    results: {
      title: 'Results',
      score: 'You balanced {correct} of {total} equations correctly',
      retry: 'Try again',
      complete: 'Complete level',
      backToMenu: 'Back to menu',
    },
    level: {
      back: '← Back',
      title1: 'Simple Equations - Level 1',
      title2: 'Medium Equations - Level 2',
      title3: 'Hard Equations - Level 3',
    },
  },
  pl: {
    game: {
      title: 'Równoważenie równań',
      subtitle: 'Naucz się równoważyć równania chemiczne - podstawa stechiometrii',
    },
    menu: {
      level1: {
        title: 'Poziom 1: Proste równania',
        description: 'Równoważ proste równania z małymi współczynnikami',
        tags: {
          simple: 'Proste',
          smallCoeffs: 'Współczynniki 1-4',
          hints: 'Wskazówki',
        },
      },
      level2: {
        title: 'Poziom 2: Średnie równania',
        description: 'Równania z większą liczbą pierwiastków i współczynników',
        tags: {
          medium: 'Średnie',
          multiElement: 'Wiele pierwiastków',
          larger: 'Większe współczynniki',
        },
      },
      level3: {
        title: 'Poziom 3: Trudne równania',
        description: 'Spalanie, wymiana podwójna i złożone równania',
        tags: {
          combustion: 'Spalanie',
          displacement: 'Wymiana',
          complex: 'Złożone',
        },
      },
      learningPath: {
        title: 'Ścieżka nauki',
        step1: {
          title: 'Proste równania',
          description: 'Zacznij od prostych równań z 2 pierwiastkami',
        },
        step2: {
          title: 'Średnie równania',
          description: 'Ćwicz równania z 3+ pierwiastkami',
        },
        step3: {
          title: 'Trudne równania',
          description: 'Rozwiązuj złożone równania samodzielnie',
        },
      },
      resetProgress: 'Resetuj postęp',
      resetConfirm: 'Czy na pewno chcesz zresetować cały postęp?',
    },
    equation: {
      check: 'Sprawdź',
      next: 'Następne równanie',
      seeResults: 'Zobacz wyniki',
      balanced: 'Równanie zrównoważone!',
      notBalanced: 'Równanie nie jest zrównoważone - spróbuj ponownie.',
      coefficient: 'Współczynnik',
      leftSide: 'Lewa',
      rightSide: 'Prawa',
      element: 'Pierwiastek',
      atomCount: 'Liczba atomów',
      hint: 'Wskazówka',
      reactants: 'Substraty',
      products: 'Produkty',
    },
    results: {
      title: 'Wyniki',
      score: 'Zrównoważyłeś {correct} z {total} równań poprawnie',
      retry: 'Spróbuj ponownie',
      complete: 'Ukończ poziom',
      backToMenu: 'Powrót do menu',
    },
    level: {
      back: '← Wstecz',
      title1: 'Proste równania - Poziom 1',
      title2: 'Średnie równania - Poziom 2',
      title3: 'Trudne równania - Poziom 3',
    },
  },
});
