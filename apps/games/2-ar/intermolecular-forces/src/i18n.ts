import { createGameTranslations } from '@shared/hooks/useGameI18n';

/**
 * Intermolecular Forces Game Translations
 */
export const gameTranslations = createGameTranslations({
  is: {
    game: {
      title: 'Millisameindakraftar',
      subtitle: 'Kvennaskólinn - Efnafræði 2. ár',
      description: 'Lærðu um krafta milli sameinda og hvernig þeir hafa áhrif á eiginleika efna',
    },
    intro: {
      title: 'Hvað eru millisameindakraftar?',
      description: 'Millisameindakraftar eru aðdráttarkraftar milli sameinda sem hafa áhrif á suðu- og bræðslumark, seigju og leysanleika.',
    },
    levels: {
      level1: {
        name: 'Stig 1: Tegundir krafta',
        description: 'Kynntu þér mismunandi krafta',
        details: 'Lærðu um London-krafta, tvískautakrafta og vetnistengi.',
      },
      level2: {
        name: 'Stig 2: Bera saman',
        description: 'Raða eftir styrkleika',
        details: 'Berðu saman krafta og útskýrðu mismun á eiginleikum.',
        locked: 'Ljúktu stigi 1 fyrst',
      },
      level3: {
        name: 'Stig 3: Spá eiginleikum',
        description: 'Tengja krafta við eiginleika',
        details: 'Notaðu þekkingu til að spá fyrir um efniseiginleika.',
        locked: 'Ljúktu stigi 2 fyrst',
      },
    },
    forces: {
      londonDispersion: 'London dreifikraftar',
      dipoleDipole: 'Tvískautakraftar',
      hydrogenBonding: 'Vetnistengi',
      ionDipole: 'Jón-tvískautakraftar',
    },
    properties: {
      boilingPoint: 'Suðumark',
      meltingPoint: 'Bræðslumark',
      viscosity: 'Seigja',
      surfaceTension: 'Yfirborðsspenna',
      solubility: 'Leysanleiki',
      vaporPressure: 'Gufuþrýstingur',
    },
    concepts: {
      polarity: 'Skautun',
      electronegativity: 'Rafneikvæðni',
      molecularSize: 'Sameindastig',
      temporaryDipole: 'Tímabundin tvískaut',
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
      title: 'Intermolecular Forces',
      subtitle: 'Kvennaskólinn - Chemistry Year 2',
      description: 'Learn about forces between molecules and how they affect properties of substances',
    },
    intro: {
      title: 'What are intermolecular forces?',
      description: 'Intermolecular forces are attractive forces between molecules that affect boiling and melting points, viscosity, and solubility.',
    },
    levels: {
      level1: {
        name: 'Level 1: Types of Forces',
        description: 'Get to know different forces',
        details: 'Learn about London dispersion forces, dipole-dipole forces, and hydrogen bonding.',
      },
      level2: {
        name: 'Level 2: Compare',
        description: 'Rank by strength',
        details: 'Compare forces and explain differences in properties.',
        locked: 'Complete level 1 first',
      },
      level3: {
        name: 'Level 3: Predict Properties',
        description: 'Connect forces to properties',
        details: 'Use knowledge to predict material properties.',
        locked: 'Complete level 2 first',
      },
    },
    forces: {
      londonDispersion: 'London dispersion forces',
      dipoleDipole: 'Dipole-dipole forces',
      hydrogenBonding: 'Hydrogen bonding',
      ionDipole: 'Ion-dipole forces',
    },
    properties: {
      boilingPoint: 'Boiling point',
      meltingPoint: 'Melting point',
      viscosity: 'Viscosity',
      surfaceTension: 'Surface tension',
      solubility: 'Solubility',
      vaporPressure: 'Vapor pressure',
    },
    concepts: {
      polarity: 'Polarity',
      electronegativity: 'Electronegativity',
      molecularSize: 'Molecular size',
      temporaryDipole: 'Temporary dipole',
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
      title: 'Sily miedzyczasteczkowe',
      subtitle: 'Kvennaskólinn - Chemia rok 2',
      description: 'Poznaj sily miedzy czasteczkami i jak wplywaja na wlasciwosci substancji',
    },
    intro: {
      title: 'Czym sa sily miedzyczasteczkowe?',
      description: 'Sily miedzyczasteczkowe to sily przyciagania miedzy czasteczkami, ktore wplywaja na temperatury wrzenia i topnienia, lepkosc i rozpuszczalnosc.',
    },
    levels: {
      level1: {
        name: 'Poziom 1: Rodzaje sil',
        description: 'Poznaj rozne sily',
        details: 'Poznaj sily dyspersyjne Londona, sily dipol-dipol i wiazania wodorowe.',
      },
      level2: {
        name: 'Poziom 2: Porownaj',
        description: 'Uszereguj wedlug sily',
        details: 'Porownaj sily i wyjasnij roznice we wlasciwosciach.',
        locked: 'Najpierw ukoncz poziom 1',
      },
      level3: {
        name: 'Poziom 3: Przewiduj wlasciwosci',
        description: 'Polacz sily z wlasciwosciami',
        details: 'Uzyj wiedzy do przewidywania wlasciwosci materialow.',
        locked: 'Najpierw ukoncz poziom 2',
      },
    },
    forces: {
      londonDispersion: 'Sily dyspersyjne Londona',
      dipoleDipole: 'Sily dipol-dipol',
      hydrogenBonding: 'Wiazania wodorowe',
      ionDipole: 'Sily jon-dipol',
    },
    properties: {
      boilingPoint: 'Temperatura wrzenia',
      meltingPoint: 'Temperatura topnienia',
      viscosity: 'Lepkosc',
      surfaceTension: 'Napiecie powierzchniowe',
      solubility: 'Rozpuszczalnosc',
      vaporPressure: 'Cisnienie pary',
    },
    concepts: {
      polarity: 'Polarnosc',
      electronegativity: 'Elektroujemnosc',
      molecularSize: 'Rozmiar czasteczki',
      temporaryDipole: 'Chwilowy dipol',
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
