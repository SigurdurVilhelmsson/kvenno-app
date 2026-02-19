import { createGameTranslations } from '@shared/hooks/useGameI18n';

/**
 * Kinetics Game Translations
 */
export const gameTranslations = createGameTranslations({
  is: {
    game: {
      title: 'Hvarfhraði',
      subtitle: 'Kvennaskólinn - Efnafræði 2. ár',
      description: 'Lærðu um hvarfhraða og hvað hefur áhrif á hraða efnahvarfa',
    },
    intro: {
      title: 'Hvað er hvarfhraði?',
      description: 'Hvarfhraði lýsir hversu hratt efnahvarf á sér stað. Hraðinn fer eftir styrk hvarfefna, hita, hvata og yfirborðsflatarmáli.',
    },
    levels: {
      level1: {
        name: 'Stig 1: Grunnhugtök',
        description: 'Hvað hefur áhrif á hvarfhraða?',
        details: 'Lærðu um styrk, hita og hvata.',
      },
      level2: {
        name: 'Stig 2: Hraðajöfnur',
        description: 'Hraðalögmál og hraðafasti',
        details: 'Skildu og notaðu hraðajöfnur til að reikna hvarfhraða.',
        locked: 'Ljúktu stigi 1 fyrst',
      },
      level3: {
        name: 'Stig 3: Arrhenius',
        description: 'Virkjunarorka og hitastuðull',
        details: 'Notaðu Arrhenius jöfnuna til að tengja hita og hraðafasta.',
        locked: 'Ljúktu stigi 2 fyrst',
      },
    },
    concepts: {
      reactionRate: 'Hvarfhraði',
      concentration: 'Styrkur',
      temperature: 'Hiti',
      catalyst: 'Hvati',
      activationEnergy: 'Virkjunarorka',
      rateConstant: 'Hraðafasti',
      rateLaw: 'Hraðalögmál',
      reactionOrder: 'Stig hvarfs',
      collisionTheory: 'Árekstrarkenning',
      maxwellBoltzmann: 'Maxwell-Boltzmann dreifing',
    },
    simulation: {
      title: 'Hermun',
      particleSpeed: 'Hraði agna',
      collisionRate: 'Árekstrartíðni',
      successfulCollisions: 'Árangursríkir árekstrar',
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
      title: 'Kinetics',
      subtitle: 'Kvennaskólinn - Chemistry Year 2',
      description: 'Learn about reaction rates and what affects the speed of chemical reactions',
    },
    intro: {
      title: 'What is reaction kinetics?',
      description: 'Reaction rate describes how fast a chemical reaction occurs. The rate depends on reactant concentration, temperature, catalysts, and surface area.',
    },
    levels: {
      level1: {
        name: 'Level 1: Basic Concepts',
        description: 'What affects reaction rate?',
        details: 'Learn about concentration, temperature, and catalysts.',
      },
      level2: {
        name: 'Level 2: Rate Equations',
        description: 'Rate laws and rate constants',
        details: 'Understand and use rate equations to calculate reaction rates.',
        locked: 'Complete level 1 first',
      },
      level3: {
        name: 'Level 3: Arrhenius',
        description: 'Activation energy and temperature coefficient',
        details: 'Use the Arrhenius equation to relate temperature and rate constant.',
        locked: 'Complete level 2 first',
      },
    },
    concepts: {
      reactionRate: 'Reaction rate',
      concentration: 'Concentration',
      temperature: 'Temperature',
      catalyst: 'Catalyst',
      activationEnergy: 'Activation energy',
      rateConstant: 'Rate constant',
      rateLaw: 'Rate law',
      reactionOrder: 'Reaction order',
      collisionTheory: 'Collision theory',
      maxwellBoltzmann: 'Maxwell-Boltzmann distribution',
    },
    simulation: {
      title: 'Simulation',
      particleSpeed: 'Particle speed',
      collisionRate: 'Collision rate',
      successfulCollisions: 'Successful collisions',
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
      title: 'Kinetyka',
      subtitle: 'Kvennaskólinn - Chemia rok 2',
      description: 'Poznaj szybkosc reakcji i co wplywa na szybkosc reakcji chemicznych',
    },
    intro: {
      title: 'Czym jest kinetyka reakcji?',
      description: 'Szybkosc reakcji opisuje jak szybko zachodzi reakcja chemiczna. Szybkosc zalezy od stezenia reagentow, temperatury, katalizatorow i powierzchni.',
    },
    levels: {
      level1: {
        name: 'Poziom 1: Podstawowe pojecia',
        description: 'Co wplywa na szybkosc reakcji?',
        details: 'Poznaj stezenie, temperature i katalizatory.',
      },
      level2: {
        name: 'Poziom 2: Rownania kinetyczne',
        description: 'Prawo szybkosci i stala szybkosci',
        details: 'Zrozum i uzyj rownan kinetycznych do obliczania szybkosci reakcji.',
        locked: 'Najpierw ukoncz poziom 1',
      },
      level3: {
        name: 'Poziom 3: Arrhenius',
        description: 'Energia aktywacji i wspolczynnik temperaturowy',
        details: 'Uzyj rownania Arrheniusa do powiazania temperatury ze stala szybkosci.',
        locked: 'Najpierw ukoncz poziom 2',
      },
    },
    concepts: {
      reactionRate: 'Szybkosc reakcji',
      concentration: 'Stezenie',
      temperature: 'Temperatura',
      catalyst: 'Katalizator',
      activationEnergy: 'Energia aktywacji',
      rateConstant: 'Stala szybkosci',
      rateLaw: 'Prawo szybkosci',
      reactionOrder: 'Rzad reakcji',
      collisionTheory: 'Teoria zderzen',
      maxwellBoltzmann: 'Rozklad Maxwella-Boltzmanna',
    },
    simulation: {
      title: 'Symulacja',
      particleSpeed: 'Predkosc czastek',
      collisionRate: 'Czestotliwosc zderzen',
      successfulCollisions: 'Skuteczne zderzenia',
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
