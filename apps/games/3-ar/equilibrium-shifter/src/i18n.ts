import { createGameTranslations } from '@shared/hooks/useGameI18n';

/**
 * Equilibrium Shifter Game Translations
 */
export const gameTranslations = createGameTranslations({
  is: {
    game: {
      title: 'Jafnvægisbreyting',
      subtitle: 'Kvennaskólinn - Efnafræði 3. ár',
      description: 'Lærðu Le Chatelier reglu og hvernig jafnvægi breytist',
    },
    intro: {
      title: 'Hvað er Le Chatelier regla?',
      description:
        'Þegar ytri aðstæður breytast, bregst kerfið við til að vinna á móti breytingunni og ná nýju jafnvægi.',
    },
    levels: {
      level1: {
        name: 'Stig 1: Grunnhugtök',
        description: 'Styrk-, þrýstings- og hitabreytingar',
        details: 'Lærðu hvernig jafnvægi bregst við breytingum.',
      },
      level2: {
        name: 'Stig 2: Spá',
        description: 'Spáðu áhrifum breytinga',
        details: 'Notaðu Le Chatelier reglu til að spá fyrir um jafnvægisfærslur.',
      },
      level3: {
        name: 'Stig 3: Q vs K',
        description: 'Hvarfstuðlar og stefna',
        details: 'Berðu saman Q og K til að ákvarða stefnu hvarfs.',
      },
    },
    concepts: {
      equilibrium: 'Jafnvægi',
      equilibriumConstant: 'Jafnvægisfasti (K)',
      reactionQuotient: 'Hvarfstuðull (Q)',
      forwardReaction: 'Framhvarf',
      reverseReaction: 'Bakhvarf',
      shiftRight: 'Færist til hægri',
      shiftLeft: 'Færist til vinstri',
      noChange: 'Engin breyting',
    },
    changes: {
      addReactant: 'Bæta við hvarfefni',
      removeReactant: 'Fjarlægja hvarfefni',
      addProduct: 'Bæta við myndefni',
      removeProduct: 'Fjarlægja myndefni',
      increaseTemperature: 'Hækka hita',
      decreaseTemperature: 'Lækka hita',
      increasePressure: 'Auka þrýsting',
      decreasePressure: 'Minnka þrýsting',
      addCatalyst: 'Bæta við hvata',
    },
    comparison: {
      qLessThanK: 'Q < K: Hvarf fer fram',
      qEqualsK: 'Q = K: Við jafnvægi',
      qGreaterThanK: 'Q > K: Hvarf fer aftur',
    },
    progress: {
      title: 'Framvinda',
      levelsCompleted: 'Stigum lokið',
      totalScore: 'Heildarstig',
      gamesPlayed: 'Leikir spilaðir',
      reset: 'Endurstilla',
    },
  },
  en: {
    game: {
      title: 'Equilibrium Shifter',
      subtitle: 'Kvennaskólinn - Chemistry Year 3',
      description: "Learn Le Chatelier's principle and how equilibrium shifts",
    },
    intro: {
      title: "What is Le Chatelier's principle?",
      description:
        'When external conditions change, the system responds to counteract the change and reach a new equilibrium.',
    },
    levels: {
      level1: {
        name: 'Level 1: Basic Concepts',
        description: 'Concentration, pressure, and temperature changes',
        details: 'Learn how equilibrium responds to changes.',
      },
      level2: {
        name: 'Level 2: Predict',
        description: 'Predict effects of changes',
        details: "Use Le Chatelier's principle to predict equilibrium shifts.",
      },
      level3: {
        name: 'Level 3: Q vs K',
        description: 'Reaction quotients and direction',
        details: 'Compare Q and K to determine reaction direction.',
      },
    },
    concepts: {
      equilibrium: 'Equilibrium',
      equilibriumConstant: 'Equilibrium constant (K)',
      reactionQuotient: 'Reaction quotient (Q)',
      forwardReaction: 'Forward reaction',
      reverseReaction: 'Reverse reaction',
      shiftRight: 'Shifts right',
      shiftLeft: 'Shifts left',
      noChange: 'No change',
    },
    changes: {
      addReactant: 'Add reactant',
      removeReactant: 'Remove reactant',
      addProduct: 'Add product',
      removeProduct: 'Remove product',
      increaseTemperature: 'Increase temperature',
      decreaseTemperature: 'Decrease temperature',
      increasePressure: 'Increase pressure',
      decreasePressure: 'Decrease pressure',
      addCatalyst: 'Add catalyst',
    },
    comparison: {
      qLessThanK: 'Q < K: Reaction proceeds forward',
      qEqualsK: 'Q = K: At equilibrium',
      qGreaterThanK: 'Q > K: Reaction proceeds reverse',
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
      title: 'Przesunięcie równowagi',
      subtitle: 'Kvennaskólinn - Chemia rok 3',
      description: 'Poznaj zasadę Le Chateliera i to, jak przesuwa się równowaga',
    },
    intro: {
      title: 'Czym jest zasada Le Chateliera?',
      description:
        'Gdy warunki zewnętrzne się zmieniają, układ reaguje tak, aby przeciwdziałać zmianie i osiągnąć nową równowagę.',
    },
    levels: {
      level1: {
        name: 'Poziom 1: Podstawowe pojęcia',
        description: 'Zmiany stężenia, ciśnienia i temperatury',
        details: 'Poznaj, jak równowaga reaguje na zmiany.',
      },
      level2: {
        name: 'Poziom 2: Przewiduj',
        description: 'Przewiduj efekty zmian',
        details: 'Użyj zasady Le Chateliera do przewidywania przesunięcia równowagi.',
      },
      level3: {
        name: 'Poziom 3: Q vs K',
        description: 'Ilorazy reakcji i kierunek',
        details: 'Porównaj Q i K, aby określić kierunek reakcji.',
      },
    },
    concepts: {
      equilibrium: 'Równowaga',
      equilibriumConstant: 'Stała równowagi (K)',
      reactionQuotient: 'Iloraz reakcji (Q)',
      forwardReaction: 'Reakcja w przód',
      reverseReaction: 'Reakcja wsteczna',
      shiftRight: 'Przesuwa się w prawo',
      shiftLeft: 'Przesuwa się w lewo',
      noChange: 'Bez zmian',
    },
    changes: {
      addReactant: 'Dodaj substrat',
      removeReactant: 'Usuń substrat',
      addProduct: 'Dodaj produkt',
      removeProduct: 'Usuń produkt',
      increaseTemperature: 'Zwiększ temperaturę',
      decreaseTemperature: 'Zmniejsz temperaturę',
      increasePressure: 'Zwiększ ciśnienie',
      decreasePressure: 'Zmniejsz ciśnienie',
      addCatalyst: 'Dodaj katalizator',
    },
    comparison: {
      qLessThanK: 'Q < K: Reakcja biegnie w przód',
      qEqualsK: 'Q = K: W równowadze',
      qGreaterThanK: 'Q > K: Reakcja biegnie wstecz',
    },
    progress: {
      title: 'Postęp',
      levelsCompleted: 'Ukończone poziomy',
      totalScore: 'Całkowity wynik',
      gamesPlayed: 'Rozegrane gry',
      reset: 'Resetuj',
    },
  },
});
