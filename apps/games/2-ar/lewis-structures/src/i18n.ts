import { createGameTranslations } from '@shared/hooks/useGameI18n';

/**
 * Lewis Structures Game Translations
 */
export const gameTranslations = createGameTranslations({
  is: {
    game: {
      title: 'Lewis Formúlur',
      subtitle: 'Kvennaskólinn - Efnafræði 2. ár',
      description: 'Lærðu að teikna Lewis formúlur og skilja rafeindir í efnatengjum',
    },
    intro: {
      title: 'Hvað eru Lewis formúlur?',
      description: 'Lewis formúlur sýna hvernig gildisrafeindir eru dreifðar í sameind. Þær sýna bindingar og stakeindir á einfaldan hátt.',
    },
    levels: {
      level1: {
        name: 'Stig 1: Einföld sambönd',
        description: 'Einfaldar bindingar og stakeindir',
        details: 'Lærðu að teikna einfaldar sameindir með einföldum bindingum.',
      },
      level2: {
        name: 'Stig 2: Margfaldar bindingar',
        description: 'Tvöfaldar og þrífaldar bindingar',
        details: 'Kynntu þér tvöfaldar og þrífaldar efnabindingar.',
        locked: 'Ljúktu stigi 1 fyrst',
      },
      level3: {
        name: 'Stig 3: Formhleðsla',
        description: 'Formhleðsla og samómun',
        details: 'Reiknaðu formhleðslu og teiknaðu samómunarmyndir.',
        locked: 'Ljúktu stigi 2 fyrst',
      },
    },
    concepts: {
      bondingPair: 'Bindipör',
      lonePair: 'Stakeindir',
      singleBond: 'Einfalt band',
      doubleBond: 'Tvöfalt band',
      tripleBond: 'Þrefalt band',
      formalCharge: 'Formhleðsla',
      resonance: 'Samómun',
      octetRule: 'Áttundreglan',
      valenceElectrons: 'Gildisrafeindir',
    },
    instructions: {
      countElectrons: 'Telja rafeindir',
      drawBonds: 'Teikna bindingar',
      addLonePairs: 'Bæta við stakeindrapörum',
      checkOctet: 'Athuga áttundreglu',
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
      title: 'Lewis Structures',
      subtitle: 'Kvennaskólinn - Chemistry Year 2',
      description: 'Learn to draw Lewis structures and understand electrons in chemical bonds',
    },
    intro: {
      title: 'What are Lewis structures?',
      description: 'Lewis structures show how valence electrons are distributed in a molecule. They show bonds and lone pairs in a simple way.',
    },
    levels: {
      level1: {
        name: 'Level 1: Simple Compounds',
        description: 'Single bonds and lone pairs',
        details: 'Learn to draw simple molecules with single bonds.',
      },
      level2: {
        name: 'Level 2: Multiple Bonds',
        description: 'Double and triple bonds',
        details: 'Get familiar with double and triple chemical bonds.',
        locked: 'Complete level 1 first',
      },
      level3: {
        name: 'Level 3: Formal Charge',
        description: 'Formal charge and resonance',
        details: 'Calculate formal charge and draw resonance structures.',
        locked: 'Complete level 2 first',
      },
    },
    concepts: {
      bondingPair: 'Bonding pair',
      lonePair: 'Lone pair',
      singleBond: 'Single bond',
      doubleBond: 'Double bond',
      tripleBond: 'Triple bond',
      formalCharge: 'Formal charge',
      resonance: 'Resonance',
      octetRule: 'Octet rule',
      valenceElectrons: 'Valence electrons',
    },
    instructions: {
      countElectrons: 'Count electrons',
      drawBonds: 'Draw bonds',
      addLonePairs: 'Add lone pairs',
      checkOctet: 'Check octet rule',
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
      title: 'Struktury Lewisa',
      subtitle: 'Kvennaskólinn - Chemia rok 2',
      description: 'Naucz sie rysowac struktury Lewisa i rozumiec elektrony w wiazaniach chemicznych',
    },
    intro: {
      title: 'Czym sa struktury Lewisa?',
      description: 'Struktury Lewisa pokazuja jak elektrony walencyjne sa rozlozone w czasteczce. Pokazuja wiazania i wolne pary w prosty sposob.',
    },
    levels: {
      level1: {
        name: 'Poziom 1: Proste zwiazki',
        description: 'Wiazania pojedyncze i wolne pary',
        details: 'Naucz sie rysowac proste czasteczki z wiazaniami pojedynczymi.',
      },
      level2: {
        name: 'Poziom 2: Wiazania wielokrotne',
        description: 'Wiazania podwojne i potrojne',
        details: 'Zapoznaj sie z podwojnymi i potrojnymi wiazaniami chemicznymi.',
        locked: 'Najpierw ukoncz poziom 1',
      },
      level3: {
        name: 'Poziom 3: Ladunek formalny',
        description: 'Ladunek formalny i rezonans',
        details: 'Obliczaj ladunek formalny i rysuj struktury rezonansowe.',
        locked: 'Najpierw ukoncz poziom 2',
      },
    },
    concepts: {
      bondingPair: 'Para wiazaca',
      lonePair: 'Wolna para',
      singleBond: 'Wiazanie pojedyncze',
      doubleBond: 'Wiazanie podwojne',
      tripleBond: 'Wiazanie potrojne',
      formalCharge: 'Ladunek formalny',
      resonance: 'Rezonans',
      octetRule: 'Regula oktetu',
      valenceElectrons: 'Elektrony walencyjne',
    },
    instructions: {
      countElectrons: 'Policz elektrony',
      drawBonds: 'Narysuj wiazania',
      addLonePairs: 'Dodaj wolne pary',
      checkOctet: 'Sprawdz regule oktetu',
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
