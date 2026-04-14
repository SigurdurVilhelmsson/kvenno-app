import { createGameTranslations } from '@shared/hooks/useGameI18n';

/**
 * Mólhugtakið (The Mole Concept) Game Translations
 * Covers molar mass calculation, mole conversions, and combined practice
 */
export const gameTranslations = createGameTranslations({
  is: {
    game: {
      title: 'Mólhugtakið',
      subtitle: 'Lærðu um mólmassa, mól-umbreytingar og Avogadro-tölu',
    },
    menu: {
      level1: {
        title: 'Stig 1: Mólmassi',
        description: 'Reikna mólmassa úr efnaformúlu',
        tags: {
          calculate: 'Reikna M',
          periodicTable: 'Lotukerfið',
          formula: 'M = Σ(n × m)',
        },
      },
      level2: {
        title: 'Stig 2: Mól-umbreytingar',
        description: 'Umbreyta milli gramma, móla og sameinda',
        tags: {
          massToMoles: 'g → mól',
          molesToMass: 'mól → g',
          molesToParticles: 'mól → sameindir',
        },
      },
      level3: {
        title: 'Stig 3: Samþætt æfing',
        description: 'Fjölþrepa verkefni sem sameina alla þætti',
        tags: {
          multiStep: 'Fjölþrepa',
          combined: 'Samþætt',
          mastery: 'Leikni',
        },
      },
      learningPath: {
        title: 'Námsferillinn',
        step1: {
          title: 'Mólmassi',
          description: 'Reikna mólmassa efna úr lotukerfinu',
        },
        step2: {
          title: 'Umbreytingar',
          description: 'Nota einingagreiningu til að umbreyta milli eininga',
        },
        step3: {
          title: 'Samþætting',
          description: 'Leysa fjölþrepa verkefni',
        },
      },
      resetProgress: 'Endurstilla framvindu',
      resetConfirm: 'Ertu viss um að þú viljir endurstilla framvinduna?',
    },
  },
  en: {
    game: {
      title: 'The Mole Concept',
      subtitle: "Learn about molar mass, mole conversions, and Avogadro's number",
    },
    menu: {
      level1: {
        title: 'Level 1: Molar Mass',
        description: 'Calculate molar mass from chemical formulas',
        tags: {
          calculate: 'Calculate M',
          periodicTable: 'Periodic table',
          formula: 'M = Σ(n × m)',
        },
      },
      level2: {
        title: 'Level 2: Mole Conversions',
        description: 'Convert between grams, moles, and molecules',
        tags: {
          massToMoles: 'g → mol',
          molesToMass: 'mol → g',
          molesToParticles: 'mol → molecules',
        },
      },
      level3: {
        title: 'Level 3: Combined Practice',
        description: 'Multi-step problems combining all concepts',
        tags: {
          multiStep: 'Multi-step',
          combined: 'Combined',
          mastery: 'Mastery',
        },
      },
      learningPath: {
        title: 'Learning Path',
        step1: {
          title: 'Molar Mass',
          description: 'Calculate molar mass using the periodic table',
        },
        step2: {
          title: 'Conversions',
          description: 'Use formulas to convert between units',
        },
        step3: {
          title: 'Integration',
          description: 'Solve multi-step problems',
        },
      },
      resetProgress: 'Reset progress',
      resetConfirm: 'Are you sure you want to reset all progress?',
    },
  },
  pl: {
    game: {
      title: 'Pojęcie mola',
      subtitle: 'Naucz się o masie molowej, przeliczeniach i liczbie Avogadra',
    },
    menu: {
      level1: {
        title: 'Poziom 1: Masa molowa',
        description: 'Oblicz masę molową ze wzoru chemicznego',
        tags: {
          calculate: 'Oblicz M',
          periodicTable: 'Układ okresowy',
          formula: 'M = Σ(n × m)',
        },
      },
      level2: {
        title: 'Poziom 2: Przeliczenia',
        description: 'Przeliczaj między gramami, molami i cząsteczkami',
        tags: {
          massToMoles: 'g → mol',
          molesToMass: 'mol → g',
          molesToParticles: 'mol → cząsteczki',
        },
      },
      level3: {
        title: 'Poziom 3: Ćwiczenia łączone',
        description: 'Wieloetapowe zadania łączące wszystkie pojęcia',
        tags: {
          multiStep: 'Wieloetapowe',
          combined: 'Łączone',
          mastery: 'Biegłość',
        },
      },
      learningPath: {
        title: 'Ścieżka nauki',
        step1: {
          title: 'Masa molowa',
          description: 'Obliczaj masę molową z układu okresowego',
        },
        step2: {
          title: 'Przeliczenia',
          description: 'Używaj wzorów do przeliczania między jednostkami',
        },
        step3: {
          title: 'Integracja',
          description: 'Rozwiązuj zadania wieloetapowe',
        },
      },
      resetProgress: 'Resetuj postęp',
      resetConfirm: 'Czy na pewno chcesz zresetować cały postęp?',
    },
  },
});
