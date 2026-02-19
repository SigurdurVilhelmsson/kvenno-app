import { createGameTranslations } from '@shared/hooks/useGameI18n';

/**
 * VSEPR Geometry Game Translations
 */
export const gameTranslations = createGameTranslations({
  is: {
    game: {
      title: 'VSEPR Rúmfræði',
      subtitle: 'Kvennaskólinn - Efnafræði 2. ár',
      description: 'Lærðu um lögun sameinda og VSEPR kenninguna',
    },
    intro: {
      title: 'Hvað er VSEPR?',
      description: 'VSEPR (Valence Shell Electron Pair Repulsion) útskýrir hvernig rafeindasvæði í kringum miðatóm fælast frá hvor öðru og mynda mismunandi lögun sameinda.',
    },
    levels: {
      level1: {
        name: 'Stig 1: Grunnlögun',
        description: 'Lærðu undirstöðulögunina',
        details: 'Kynntu þér línulega, hornrétta, þríhliða og fjórhliða lögun.',
      },
      level2: {
        name: 'Stig 2: Stakeindir',
        description: 'Stakeindir breyta lögun',
        details: 'Sjáðu hvernig stakeindarapör hafa áhrif á sameindalögun.',
        locked: 'Ljúktu stigi 1 fyrst',
      },
      level3: {
        name: 'Stig 3: Bindishorn',
        description: 'Spáðu bindishornum',
        details: 'Reiknaðu og spáðu bindishornum milli atóma.',
        locked: 'Ljúktu stigi 2 fyrst',
      },
    },
    geometry: {
      linear: 'Línuleg',
      bentShape: 'Hornrétt',
      trigonalPlanar: 'Þríhliða slétt',
      trigonalPyramidal: 'Þríhliða pýramída',
      tetrahedral: 'Fjórhliða',
      trigonalBipyramidal: 'Þríhliða tvípýramída',
      octahedral: 'Áttflötungur',
      seesawShape: 'Vippu',
      tShape: 'T-lögun',
      squarePlanar: 'Ferningur slétt',
      squarePyramidal: 'Fernings pýramída',
    },
    bondAngles: {
      title: 'Bindishorn',
      degrees: 'gráður',
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
      title: 'VSEPR Geometry',
      subtitle: 'Kvennaskólinn - Chemistry Year 2',
      description: 'Learn about molecular shapes and VSEPR theory',
    },
    intro: {
      title: 'What is VSEPR?',
      description: 'VSEPR (Valence Shell Electron Pair Repulsion) explains how electron regions around a central atom repel each other and form different molecular shapes.',
    },
    levels: {
      level1: {
        name: 'Level 1: Basic Shapes',
        description: 'Learn the fundamental shapes',
        details: 'Get familiar with linear, bent, trigonal and tetrahedral shapes.',
      },
      level2: {
        name: 'Level 2: Lone Pairs',
        description: 'Lone pairs change shapes',
        details: 'See how lone pairs affect molecular geometry.',
        locked: 'Complete level 1 first',
      },
      level3: {
        name: 'Level 3: Bond Angles',
        description: 'Predict bond angles',
        details: 'Calculate and predict bond angles between atoms.',
        locked: 'Complete level 2 first',
      },
    },
    geometry: {
      linear: 'Linear',
      bentShape: 'Bent',
      trigonalPlanar: 'Trigonal planar',
      trigonalPyramidal: 'Trigonal pyramidal',
      tetrahedral: 'Tetrahedral',
      trigonalBipyramidal: 'Trigonal bipyramidal',
      octahedral: 'Octahedral',
      seesawShape: 'Seesaw',
      tShape: 'T-shaped',
      squarePlanar: 'Square planar',
      squarePyramidal: 'Square pyramidal',
    },
    bondAngles: {
      title: 'Bond Angles',
      degrees: 'degrees',
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
      title: 'Geometria VSEPR',
      subtitle: 'Kvennaskólinn - Chemia rok 2',
      description: 'Poznaj ksztalty czastek i teorie VSEPR',
    },
    intro: {
      title: 'Czym jest VSEPR?',
      description: 'VSEPR (Valence Shell Electron Pair Repulsion) wyjasnia jak obszary elektronowe wokol atomu centralnego odpychaja sie nawzajem i tworza rozne ksztalty czastek.',
    },
    levels: {
      level1: {
        name: 'Poziom 1: Podstawowe ksztalty',
        description: 'Poznaj podstawowe ksztalty',
        details: 'Zapoznaj sie z ksztaltem liniowym, katowym, trojkatnym i tetraedrycznym.',
      },
      level2: {
        name: 'Poziom 2: Wolne pary',
        description: 'Wolne pary zmieniaja ksztalt',
        details: 'Zobacz jak wolne pary wplywaja na geometrie czasteczki.',
        locked: 'Najpierw ukoncz poziom 1',
      },
      level3: {
        name: 'Poziom 3: Katy wiazania',
        description: 'Przewiduj katy wiazania',
        details: 'Obliczaj i przewiduj katy wiazania miedzy atomami.',
        locked: 'Najpierw ukoncz poziom 2',
      },
    },
    geometry: {
      linear: 'Liniowy',
      bentShape: 'Katowy',
      trigonalPlanar: 'Trojkatny plaski',
      trigonalPyramidal: 'Trojkatny piramidalny',
      tetrahedral: 'Tetraedryczny',
      trigonalBipyramidal: 'Trojkatny dwupiramidalny',
      octahedral: 'Oktaedryczny',
      seesawShape: 'Hustawka',
      tShape: 'Ksztalt T',
      squarePlanar: 'Kwadratowy plaski',
      squarePyramidal: 'Kwadratowy piramidalny',
    },
    bondAngles: {
      title: 'Katy wiazania',
      degrees: 'stopni',
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
