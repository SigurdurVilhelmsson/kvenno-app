import { createGameTranslations } from '@shared/hooks/useGameI18n';

/**
 * Hess's Law Game Translations
 */
export const gameTranslations = createGameTranslations({
  is: {
    game: {
      title: 'Lögmál Hess',
      subtitle: 'Kvennaskólinn - Efnafræði 2. ár',
      description: 'Lærðu um orkubreytingar í efnahvörfum og hvernig á að reikna ΔH',
    },
    intro: {
      title: 'Hvað er lögmál Hess?',
      description: 'Skammtavarmi (ΔH) er ástandsfall — það skiptir ekki máli hvaða leið efnahvörfin taka, aðeins upphafs- og lokaaðstæður skipta máli. Þetta þýðir að við getum sameinað jöfnur til að finna ΔH fyrir hvörf sem erfitt er að mæla beint.',
      formula: 'ΔH heild = ΔH₁ + ΔH₂ + ΔH₃ + ...',
    },
    levels: {
      level1: {
        name: 'Stig 1: Skilningur',
        description: 'Orkubrautir og ΔH merki',
        details: 'Sjáðu hvernig ΔH breytist þegar þú snýrð við eða margfaldar jöfnur. Byggðu innsæi fyrir lögmál Hess.',
      },
      level2: {
        name: 'Stig 2: Þrautir',
        description: 'Sameina jöfnur til að ná markmiðsjöfnu',
        details: 'Notaðu 2-3 jöfnur til að búa til nýja jöfnu. Útskýrðu rökstuðning.',
        locked: 'Ljúktu stigi 1 fyrst',
      },
      level3: {
        name: 'Stig 3: Útreikningar',
        description: 'Myndunarvarminn og flókin hvörf',
        details: 'Notaðu ΔH°f töflur til að reikna ΔH°rxn. Leystu öfug verkefni.',
        locked: 'Ljúktu stigi 2 fyrst',
      },
    },
    complete: {
      title: 'Til hamingju!',
      message: 'Þú hefur lokið öllum stigum!',
      backToMenu: 'Til baka í valmynd',
      learned: {
        title: 'Hvað lærðir þú?',
        hessLaw: 'Lögmál Hess: ΔH fer sama leiðina óháð hvörfunarferlinu',
        reverse: 'Snúa við: Ef þú snýrðu við hvörfum, snýrðu einnig formerki ΔH',
        multiply: 'Margfalda: Ef þú margfaldar jöfnu, margfaldar þú einnig ΔH',
        formation: 'Myndunarvarminn: ΔH°rxn = Σ ΔH°f(afurðir) - Σ ΔH°f(hvarfefni)',
      },
    },
    progress: {
      title: 'Framvinda',
      levelsCompleted: 'Stig lokið',
      totalScore: 'Heildar stig',
      gamesPlayed: 'Leikir spilaðir',
      reset: 'Endurstilla',
      points: 'stig',
    },
    formulas: {
      title: 'Lykilformúlur',
      hessLaw: 'Lögmál Hess: ΔH heild = Σ ΔH skref',
      reverse: 'Snúa við hvörfum: ΔH → -ΔH',
      multiply: 'Margfalda jöfnu: n × jafna → n × ΔH',
      formation: 'Myndunarvarminn: ΔH°rxn = Σ ΔH°f(afurðir) - Σ ΔH°f(hvarfefni)',
    },
    credits: 'Kafli 5 — Chemistry: The Central Science (Brown et al.)',
  },
  en: {
    game: {
      title: "Hess's Law",
      subtitle: 'Kvennaskólinn - Chemistry Year 2',
      description: 'Learn about energy changes in chemical reactions and how to calculate ΔH',
    },
    intro: {
      title: "What is Hess's Law?",
      description: 'Enthalpy (ΔH) is a state function — it does not matter which path a chemical reaction takes, only the initial and final states matter. This means we can combine equations to find ΔH for reactions that are difficult to measure directly.',
      formula: 'ΔH total = ΔH₁ + ΔH₂ + ΔH₃ + ...',
    },
    levels: {
      level1: {
        name: 'Level 1: Understanding',
        description: 'Energy pathways and ΔH signs',
        details: 'See how ΔH changes when you reverse or multiply equations. Build intuition for Hess\'s Law.',
      },
      level2: {
        name: 'Level 2: Puzzles',
        description: 'Combine equations to reach target equation',
        details: 'Use 2-3 equations to create a new equation. Explain your reasoning.',
        locked: 'Complete level 1 first',
      },
      level3: {
        name: 'Level 3: Calculations',
        description: 'Formation enthalpy and complex reactions',
        details: 'Use ΔH°f tables to calculate ΔH°rxn. Solve reverse problems.',
        locked: 'Complete level 2 first',
      },
    },
    complete: {
      title: 'Congratulations!',
      message: 'You have completed all levels!',
      backToMenu: 'Back to menu',
      learned: {
        title: 'What did you learn?',
        hessLaw: "Hess's Law: ΔH follows the same path regardless of reaction pathway",
        reverse: 'Reversing: If you reverse a reaction, you also reverse the sign of ΔH',
        multiply: 'Multiplying: If you multiply an equation, you also multiply ΔH',
        formation: 'Formation enthalpy: ΔH°rxn = Σ ΔH°f(products) - Σ ΔH°f(reactants)',
      },
    },
    progress: {
      title: 'Progress',
      levelsCompleted: 'Levels completed',
      totalScore: 'Total score',
      gamesPlayed: 'Games played',
      reset: 'Reset',
      points: 'points',
    },
    formulas: {
      title: 'Key Formulas',
      hessLaw: "Hess's Law: ΔH total = Σ ΔH steps",
      reverse: 'Reverse reactions: ΔH → -ΔH',
      multiply: 'Multiply equation: n × equation → n × ΔH',
      formation: 'Formation enthalpy: ΔH°rxn = Σ ΔH°f(products) - Σ ΔH°f(reactants)',
    },
    credits: 'Chapter 5 — Chemistry: The Central Science (Brown et al.)',
  },
  pl: {
    game: {
      title: 'Prawo Hessa',
      subtitle: 'Kvennaskólinn - Chemia rok 2',
      description: 'Poznaj zmiany energii w reakcjach chemicznych i jak obliczyc ΔH',
    },
    intro: {
      title: 'Czym jest prawo Hessa?',
      description: 'Entalpia (ΔH) jest funkcja stanu — nie ma znaczenia jaka droga przebiega reakcja chemiczna, liczy sie tylko stan poczatkowy i koncowy. Oznacza to, ze mozemy laczyc rownania, aby znalezc ΔH dla reakcji trudnych do bezposredniego pomiaru.',
      formula: 'ΔH calkowite = ΔH₁ + ΔH₂ + ΔH₃ + ...',
    },
    levels: {
      level1: {
        name: 'Poziom 1: Zrozumienie',
        description: 'Sciezki energetyczne i znaki ΔH',
        details: 'Zobacz jak ΔH zmienia sie gdy odwracasz lub mnozysz rownania. Zbuduj intuicje dla prawa Hessa.',
      },
      level2: {
        name: 'Poziom 2: Lamiglowki',
        description: 'Lacz rownania aby osiagnac rownanie docelowe',
        details: 'Uzyj 2-3 rownan aby stworzyc nowe rownanie. Wyjasnij swoje rozumowanie.',
        locked: 'Najpierw ukoncz poziom 1',
      },
      level3: {
        name: 'Poziom 3: Obliczenia',
        description: 'Entalpia tworzenia i zlozone reakcje',
        details: 'Uzyj tabel ΔH°f do obliczenia ΔH°rxn. Rozwiazuj zadania odwrotne.',
        locked: 'Najpierw ukoncz poziom 2',
      },
    },
    complete: {
      title: 'Gratulacje!',
      message: 'Ukonczyles wszystkie poziomy!',
      backToMenu: 'Powrot do menu',
      learned: {
        title: 'Czego sie nauczyles?',
        hessLaw: 'Prawo Hessa: ΔH jest taki sam niezaleznie od drogi reakcji',
        reverse: 'Odwracanie: Jesli odwrocisz reakcje, odwrocisz tez znak ΔH',
        multiply: 'Mnozenie: Jesli pomnozysz rownanie, pomnozysz tez ΔH',
        formation: 'Entalpia tworzenia: ΔH°rxn = Σ ΔH°f(produkty) - Σ ΔH°f(substraty)',
      },
    },
    progress: {
      title: 'Postep',
      levelsCompleted: 'Ukonczone poziomy',
      totalScore: 'Calkowity wynik',
      gamesPlayed: 'Rozegrane gry',
      reset: 'Resetuj',
      points: 'punkty',
    },
    formulas: {
      title: 'Kluczowe wzory',
      hessLaw: 'Prawo Hessa: ΔH calkowite = Σ ΔH krokow',
      reverse: 'Odwracanie reakcji: ΔH → -ΔH',
      multiply: 'Mnozenie rownania: n × rownanie → n × ΔH',
      formation: 'Entalpia tworzenia: ΔH°rxn = Σ ΔH°f(produkty) - Σ ΔH°f(substraty)',
    },
    credits: 'Rozdzial 5 — Chemistry: The Central Science (Brown et al.)',
  },
});
