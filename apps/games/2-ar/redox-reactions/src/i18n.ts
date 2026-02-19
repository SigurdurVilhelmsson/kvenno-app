import { createGameTranslations } from '@shared/hooks/useGameI18n';

/**
 * Redox Reactions Game Translations
 */
export const gameTranslations = createGameTranslations({
  is: {
    game: {
      title: 'Redox Hvörf',
      subtitle: 'Kvennaskólinn - Efnafræði 2. ár',
      description: 'Lærðu um oxun og afoxun í efnahvörfum',
    },
    intro: {
      title: 'Hvað eru redox hvörf?',
      description: 'Redox hvörf fela í sér flutning rafeinda á milli efna. Oxun þýðir að tapa rafeindum, afoxun þýðir að öðlast rafeindir.',
      mnemonic: 'OIL RIG: Oxidation Is Loss, Reduction Is Gain',
    },
    levels: {
      level1: {
        name: 'Stig 1: Oxunartölur',
        description: 'Ákvarða oxunartölur',
        details: 'Lærðu reglur um oxunartölur og hvernig á að finna þær.',
      },
      level2: {
        name: 'Stig 2: Greina hvörf',
        description: 'Finna oxun og afoxun',
        details: 'Greindu hvaða efni oxast og hvaða efni afoxast.',
        locked: 'Ljúktu stigi 1 fyrst',
      },
      level3: {
        name: 'Stig 3: Jafna hvörf',
        description: 'Jafna redox hvörf',
        details: 'Notaðu hálfhvarfsaðferð til að jafna redox jöfnur.',
        locked: 'Ljúktu stigi 2 fyrst',
      },
    },
    concepts: {
      oxidation: 'Oxun',
      reduction: 'Afoxun',
      oxidationNumber: 'Oxunartala',
      oxidizingAgent: 'Oxunarefni',
      reducingAgent: 'Afoxunarefni',
      halfReaction: 'Hálfhvarf',
      electronTransfer: 'Rafeinduflutningur',
      balancing: 'Jöfnun',
    },
    rules: {
      title: 'Reglur um oxunartölur',
      rule1: 'Frumefni hafa oxunartölu 0',
      rule2: 'Einatóma jónir: oxunartala = hleðsla',
      rule3: 'Súrefni er venjulega -2',
      rule4: 'Vetni er venjulega +1',
      rule5: 'Summa oxunartalna = heildarhleðsla',
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
      title: 'Redox Reactions',
      subtitle: 'Kvennaskólinn - Chemistry Year 2',
      description: 'Learn about oxidation and reduction in chemical reactions',
    },
    intro: {
      title: 'What are redox reactions?',
      description: 'Redox reactions involve the transfer of electrons between substances. Oxidation means losing electrons, reduction means gaining electrons.',
      mnemonic: 'OIL RIG: Oxidation Is Loss, Reduction Is Gain',
    },
    levels: {
      level1: {
        name: 'Level 1: Oxidation Numbers',
        description: 'Determine oxidation numbers',
        details: 'Learn the rules for oxidation numbers and how to find them.',
      },
      level2: {
        name: 'Level 2: Analyze Reactions',
        description: 'Find oxidation and reduction',
        details: 'Identify which substances are oxidized and which are reduced.',
        locked: 'Complete level 1 first',
      },
      level3: {
        name: 'Level 3: Balance Reactions',
        description: 'Balance redox reactions',
        details: 'Use the half-reaction method to balance redox equations.',
        locked: 'Complete level 2 first',
      },
    },
    concepts: {
      oxidation: 'Oxidation',
      reduction: 'Reduction',
      oxidationNumber: 'Oxidation number',
      oxidizingAgent: 'Oxidizing agent',
      reducingAgent: 'Reducing agent',
      halfReaction: 'Half-reaction',
      electronTransfer: 'Electron transfer',
      balancing: 'Balancing',
    },
    rules: {
      title: 'Oxidation Number Rules',
      rule1: 'Elements have oxidation number 0',
      rule2: 'Monatomic ions: oxidation number = charge',
      rule3: 'Oxygen is usually -2',
      rule4: 'Hydrogen is usually +1',
      rule5: 'Sum of oxidation numbers = total charge',
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
      title: 'Reakcje redoks',
      subtitle: 'Kvennaskólinn - Chemia rok 2',
      description: 'Poznaj utlenianie i redukcje w reakcjach chemicznych',
    },
    intro: {
      title: 'Czym sa reakcje redoks?',
      description: 'Reakcje redoks obejmuja transfer elektronow miedzy substancjami. Utlenianie oznacza utrate elektronow, redukcja oznacza zyskanie elektronow.',
      mnemonic: 'LEO GER: Loss of Electrons is Oxidation, Gain of Electrons is Reduction',
    },
    levels: {
      level1: {
        name: 'Poziom 1: Stopnie utlenienia',
        description: 'Okresl stopnie utlenienia',
        details: 'Poznaj zasady dotyczace stopni utlenienia i jak je znajdowac.',
      },
      level2: {
        name: 'Poziom 2: Analiza reakcji',
        description: 'Znajdz utlenianie i redukcje',
        details: 'Okresl ktore substancje sie utleniaja, a ktore redukuja.',
        locked: 'Najpierw ukoncz poziom 1',
      },
      level3: {
        name: 'Poziom 3: Rownowazenie reakcji',
        description: 'Rownowaz reakcje redoks',
        details: 'Uzyj metody polrownan do rownowazenia rownan redoks.',
        locked: 'Najpierw ukoncz poziom 2',
      },
    },
    concepts: {
      oxidation: 'Utlenianie',
      reduction: 'Redukcja',
      oxidationNumber: 'Stopien utlenienia',
      oxidizingAgent: 'Utleniacz',
      reducingAgent: 'Reduktor',
      halfReaction: 'Polreakcja',
      electronTransfer: 'Transfer elektronow',
      balancing: 'Rownowazenie',
    },
    rules: {
      title: 'Zasady stopni utlenienia',
      rule1: 'Pierwiastki maja stopien utlenienia 0',
      rule2: 'Jony jednoatomowe: stopien utlenienia = ladunek',
      rule3: 'Tlen ma zwykle -2',
      rule4: 'Wodor ma zwykle +1',
      rule5: 'Suma stopni utlenienia = calkowity ladunek',
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
