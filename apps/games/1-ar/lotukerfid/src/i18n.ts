import { createGameTranslations } from '@shared/hooks/useGameI18n';

/**
 * Lotukerfið (The Periodic Table) Game Translations
 * Covers element identification, classification, and atomic structure
 */
export const gameTranslations = createGameTranslations({
  is: {
    game: {
      title: 'Lotukerfið',
      subtitle: 'Kynntu þér lotukerfið, frumefni og sameindagerð',
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
        title: 'Stig 2: Flokkar og lóðir',
        description: 'Flokka frumefni og skilja mynstur lotukerfisins',
        tags: {
          classify: 'Flokka',
          trends: 'Mynstur',
          groups: 'Flokkar',
        },
      },
      level3: {
        title: 'Stig 3: Sameindagerð',
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
          title: 'Flokkar og lóðir',
          description: 'Skilja skipulag lotukerfisins og mynstur þess',
        },
        step3: {
          title: 'Sameindagerð',
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
      title: 'Uklad okresowy',
      subtitle: 'Poznaj uklad okresowy, pierwiastki i budowe atomu',
    },
    menu: {
      level1: {
        title: 'Poziom 1: Rozpoznaj pierwiastki',
        description: 'Znajdz pierwiastki w ukladzie okresowym i rozpoznaj ich symbole',
        tags: {
          find: 'Znajdz w tabeli',
          symbols: 'Symbole',
          position: 'Pozycja',
        },
      },
      level2: {
        title: 'Poziom 2: Grupy i trendy',
        description: 'Klasyfikuj pierwiastki i rozumiej wzorce ukladu okresowego',
        tags: {
          classify: 'Klasyfikuj',
          trends: 'Trendy',
          groups: 'Grupy',
        },
      },
      level3: {
        title: 'Poziom 3: Budowa atomu',
        description: 'Protony, neutrony i elektrony pierwiastkow',
        tags: {
          protons: 'Protony',
          neutrons: 'Neutrony',
          electrons: 'Elektrony',
        },
      },
      learningPath: {
        title: 'Sciezka nauki',
        step1: {
          title: 'Rozpoznaj pierwiastki',
          description: 'Znajdz pierwiastki w ukladzie okresowym i rozpoznaj ich symbole',
        },
        step2: {
          title: 'Grupy i trendy',
          description: 'Zrozum organizacje i wzorce ukladu okresowego',
        },
        step3: {
          title: 'Budowa atomu',
          description: 'Oblicz liczbe protonow, neutronow i elektronow',
        },
      },
      resetProgress: 'Resetuj postep',
      resetConfirm: 'Czy na pewno chcesz zresetowac caly postep?',
    },
  },
});
