import { createGameTranslations } from '@shared/hooks/useGameI18n';

/**
 * Lotukerfið (The Periodic Table) Game Translations
 * Covers element identification, classification, and atomic structure
 */
export const gameTranslations = createGameTranslations({
  is: {
    game: {
      title: 'Lotukerfið',
      subtitle: 'Kynntu þér lotukerfið, frumefni og atómbyggingu',
    },
    menu: {
      level1: {
        title: 'Stig 1: Þekkja frumefni',
        description: 'Finndu frumefni í lotukerfinu og þekktu tákn þeirra',
        tags: {
          find: 'Finna í töflu',
          symbols: 'Efnatákn',
          position: 'Staðsetning',
        },
      },
      level2: {
        title: 'Stig 2: Flokkar og lotubundnir eiginleikar',
        description: 'Flokka frumefni og skilja mynstur lotukerfisins',
        tags: {
          classify: 'Flokka',
          trends: 'Mynstur',
          groups: 'Flokkar',
        },
      },
      level3: {
        title: 'Stig 3: Atómbygging',
        description: 'Róteindir, nifteindir og rafeindir frumefna',
        tags: {
          protons: 'Róteindir',
          neutrons: 'Nifteindir',
          electrons: 'Rafeindir',
        },
      },
      learningPath: {
        title: 'Námsferillinn',
        step1: {
          title: 'Þekkja frumefni',
          description: 'Finna frumefni í lotukerfinu og þekkja tákn þeirra',
        },
        step2: {
          title: 'Flokkar og lotubundnir eiginleikar',
          description: 'Skilja skipulag lotukerfisins og mynstur þess',
        },
        step3: {
          title: 'Atómbygging',
          description: 'Reikna fjölda róteinda, nifteinda og rafeinda',
        },
      },
      resetProgress: 'Endurstilla framvindu',
      resetConfirm: 'Ertu viss um að þú viljir endurstilla framvinduna?',
    },
  },
  en: {
    game: {
      title: 'The Periodic Table',
      subtitle: 'Explore the periodic table, elements, and atomic structure',
    },
    menu: {
      level1: {
        title: 'Level 1: Identify Elements',
        description: 'Find elements in the periodic table and recognize their symbols',
        tags: {
          find: 'Find in table',
          symbols: 'Symbols',
          position: 'Position',
        },
      },
      level2: {
        title: 'Level 2: Groups and Trends',
        description: 'Classify elements and understand periodic table patterns',
        tags: {
          classify: 'Classify',
          trends: 'Trends',
          groups: 'Groups',
        },
      },
      level3: {
        title: 'Level 3: Atomic Structure',
        description: 'Protons, neutrons, and electrons of elements',
        tags: {
          protons: 'Protons',
          neutrons: 'Neutrons',
          electrons: 'Electrons',
        },
      },
      learningPath: {
        title: 'Learning Path',
        step1: {
          title: 'Identify Elements',
          description: 'Find elements in the periodic table and recognize their symbols',
        },
        step2: {
          title: 'Groups and Trends',
          description: 'Understand the organization and patterns of the periodic table',
        },
        step3: {
          title: 'Atomic Structure',
          description: 'Calculate the number of protons, neutrons, and electrons',
        },
      },
      resetProgress: 'Reset progress',
      resetConfirm: 'Are you sure you want to reset all progress?',
    },
  },
  pl: {
    game: {
      title: 'Układ okresowy',
      subtitle: 'Poznaj układ okresowy, pierwiastki i budowę atomu',
    },
    menu: {
      level1: {
        title: 'Poziom 1: Rozpoznaj pierwiastki',
        description: 'Znajdź pierwiastki w układzie okresowym i rozpoznaj ich symbole',
        tags: {
          find: 'Znajdź w tabeli',
          symbols: 'Symbole',
          position: 'Pozycja',
        },
      },
      level2: {
        title: 'Poziom 2: Grupy i trendy',
        description: 'Klasyfikuj pierwiastki i rozumiej wzorce układu okresowego',
        tags: {
          classify: 'Klasyfikuj',
          trends: 'Trendy',
          groups: 'Grupy',
        },
      },
      level3: {
        title: 'Poziom 3: Budowa atomu',
        description: 'Protony, neutrony i elektrony pierwiastków',
        tags: {
          protons: 'Protony',
          neutrons: 'Neutrony',
          electrons: 'Elektrony',
        },
      },
      learningPath: {
        title: 'Ścieżka nauki',
        step1: {
          title: 'Rozpoznaj pierwiastki',
          description: 'Znajdź pierwiastki w układzie okresowym i rozpoznaj ich symbole',
        },
        step2: {
          title: 'Grupy i trendy',
          description: 'Zrozum organizację i wzorce układu okresowego',
        },
        step3: {
          title: 'Budowa atomu',
          description: 'Oblicz liczbę protonów, neutronów i elektronów',
        },
      },
      resetProgress: 'Resetuj postęp',
      resetConfirm: 'Czy na pewno chcesz zresetować cały postęp?',
    },
  },
});
