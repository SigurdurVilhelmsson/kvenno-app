import { createGameTranslations } from '@shared/hooks/useGameI18n';

/**
 * Solutions (Lausnir) Game Translations
 * Game about molarity, dilution, and solutions
 */
export const gameTranslations = createGameTranslations({
  is: {
    game: {
      title: 'Lausnir',
      subtitle: 'Lærðu um mólstyrk, útþynningu og lausnir',
    },
    menu: {
      howItWorks: 'Hvernig virkar þetta?',
      howItWorksDesc:
        'Þessi leikur notar hugtakamiðaða nálgun sem byggir á rannsóknum í kennslu raunvísinda. Þú byrjar á að skilja hugtökin sjónrænt, síðan spáir þú fyrir um breytingar, og að lokum reiknar þú með formúlum.',
      inspiredBy: 'Innblásið af PhET Interactive Simulations (University of Colorado Boulder)',
      progress: 'Framvinda',
      reset: 'Endurstilla',
      levelsCompleted: 'Stigum lokið',
      formulas: 'Formúlur (Stig 3)',
      backToGames: 'Til baka í leikjayfirlit',
    },
    levels: {
      level1: {
        name: 'Stig 1: Hugtök',
        description: 'Sjónræn meðhöndlun - ENGIR útreikningar',
        details:
          'Dragðu, smelltu og sjáðu hvernig styrkur breytist í rauntíma. Byggðu innsæi fyrir M = n/V.',
      },
      level2: {
        name: 'Stig 2: Rökstuðningur',
        description: 'Spáðu fyrir um breytingar - fjölval',
        details: '"Hvað gerist ef...?" spurningar. Notaðu hugtökin sem þú lærðir.',
      },
      level3: {
        name: 'Stig 3: Útreikningar',
        description: 'Reikna styrk með einingagreiningu',
        details:
          'Notaðu umbreytingarstuðla og einingagreiningu til að leysa útþynningar- og styrkreikningsdæmi.',
      },
      completed: 'Lokið',
      of: 'af',
      correct: 'rétt',
    },
    completion: {
      title: 'Til hamingju!',
      completedAll: 'Þú hefur lokið öllum stigum!',
      level1Summary: 'Styrkur = sameindir / rúmmál (sjónrænt)',
      level2Summary: 'Spá fyrir um hvernig breytingar hafa áhrif á styrk',
      level3Summary: 'Reikna styrk og útþynningar með einingagreiningu',
      whatYouLearned: 'Hvað lærðir þú?',
      back: 'Til baka',
      startOver: 'Byrja upp á nýtt',
      visualHandling: 'Sjónræn meðhöndlun',
      predictChanges: 'Spá fyrir um breytingar',
      useFormulas: 'Einingagreining',
    },
    formulas: {
      molarity: 'Mólstyrkur: mól efnis / rúmmál í lítrum',
      dilution: 'Útþynning: mól breytast ekki (M₁×V₁ = M₂×V₂)',
      moles: 'g → mól: g × (1 mól / mólmassi g)',
      mixing: 'Blöndun: heildarmól / heildarrúmmál',
    },
    achievements: {
      perfectMixing: 'Fullkomin blöndun! 🧪',
      dilutionExpert: 'Útþynningar sérfræðingur! 💧',
      fiveCorrect: '5 réttar! 🔥🔥',
      threeInRow: '3 í röð! 🔥',
    },
  },
  en: {
    game: {
      title: 'Solutions',
      subtitle: 'Learn about molarity, dilution, and solutions',
    },
    menu: {
      howItWorks: 'How does this work?',
      howItWorksDesc:
        'This game uses a concept-first approach based on science education research. You start by understanding concepts visually, then predict changes, and finally calculate with formulas.',
      inspiredBy: 'Inspired by PhET Interactive Simulations (University of Colorado Boulder)',
      progress: 'Progress',
      reset: 'Reset',
      levelsCompleted: 'Levels completed',
      formulas: 'Formulas (Level 3)',
      backToGames: 'Back to game overview',
    },
    levels: {
      level1: {
        name: 'Level 1: Concepts',
        description: 'Visual manipulation - NO calculations',
        details:
          'Drag, click and see how concentration changes in real time. Build intuition for M = n/V.',
      },
      level2: {
        name: 'Level 2: Reasoning',
        description: 'Predict changes - multiple choice',
        details: '"What happens if...?" questions. Use the concepts you learned.',
      },
      level3: {
        name: 'Level 3: Calculations',
        description: 'Use formulas to calculate',
        details: 'M₁V₁ = M₂V₂, moles = mass/molar mass. Now you understand WHY they work!',
      },
      completed: 'Completed',
      of: 'of',
      correct: 'correct',
    },
    completion: {
      title: 'Congratulations!',
      completedAll: 'You have completed all levels!',
      level1Summary: 'Concentration = molecules / volume (visual)',
      level2Summary: 'Predict how changes affect concentration',
      level3Summary: 'Use M₁V₁ = M₂V₂ and other formulas',
      whatYouLearned: 'What did you learn?',
      back: 'Back',
      startOver: 'Start over',
      visualHandling: 'Visual manipulation',
      predictChanges: 'Predict changes',
      useFormulas: 'Use formulas',
    },
    formulas: {
      molarity: 'M = mol / L (molarity)',
      dilution: 'M₁V₁ = M₂V₂ (dilution)',
      moles: 'mol = mass(g) / molar mass(g/mol)',
      mixing: 'M = (M₁V₁ + M₂V₂) / (V₁ + V₂) (mixing)',
    },
    achievements: {
      perfectMixing: 'Perfect mixing! 🧪',
      dilutionExpert: 'Dilution expert! 💧',
      fiveCorrect: '5 correct! 🔥🔥',
      threeInRow: '3 in a row! 🔥',
    },
  },
  pl: {
    game: {
      title: 'Roztwory',
      subtitle: 'Poznaj stężenie molowe, rozcieńczanie i roztwory',
    },
    menu: {
      howItWorks: 'Jak to działa?',
      howItWorksDesc:
        'Ta gra wykorzystuje podejście oparte na pojęciach, bazujące na badaniach edukacji naukowej. Zaczynasz od wizualnego zrozumienia pojęć, potem przewidujesz zmiany, a na końcu obliczasz za pomocą wzorów.',
      inspiredBy: 'Inspirowane przez PhET Interactive Simulations (University of Colorado Boulder)',
      progress: 'Postęp',
      reset: 'Resetuj',
      levelsCompleted: 'Ukończone poziomy',
      formulas: 'Wzory (Poziom 3)',
      backToGames: 'Powrót do przeglądu gier',
    },
    levels: {
      level1: {
        name: 'Poziom 1: Pojęcia',
        description: 'Manipulacja wizualna - BEZ obliczeń',
        details:
          'Przeciągaj, klikaj i obserwuj, jak stężenie zmienia się w czasie rzeczywistym. Zbuduj intuicję dla M = n/V.',
      },
      level2: {
        name: 'Poziom 2: Rozumowanie',
        description: 'Przewiduj zmiany - wielokrotny wybór',
        details: 'Pytania "Co się stanie, jeśli...?". Użyj pojęć, których się nauczyłeś.',
      },
      level3: {
        name: 'Poziom 3: Obliczenia',
        description: 'Użyj wzorów do obliczeń',
        details: 'M₁V₁ = M₂V₂, mole = masa/masa molowa. Teraz rozumiesz, DLACZEGO działają!',
      },
      completed: 'Ukończone',
      of: 'z',
      correct: 'poprawnie',
    },
    completion: {
      title: 'Gratulacje!',
      completedAll: 'Ukończyłeś wszystkie poziomy!',
      level1Summary: 'Stężenie = cząsteczki / objętość (wizualnie)',
      level2Summary: 'Przewiduj, jak zmiany wpływają na stężenie',
      level3Summary: 'Użyj M₁V₁ = M₂V₂ i innych wzorów',
      whatYouLearned: 'Czego się nauczyłeś?',
      back: 'Wstecz',
      startOver: 'Zacznij od nowa',
      visualHandling: 'Manipulacja wizualna',
      predictChanges: 'Przewiduj zmiany',
      useFormulas: 'Użyj wzorów',
    },
    formulas: {
      molarity: 'M = mol / L (stężenie molowe)',
      dilution: 'M₁V₁ = M₂V₂ (rozcieńczanie)',
      moles: 'mol = masa(g) / masa molowa(g/mol)',
      mixing: 'M = (M₁V₁ + M₂V₂) / (V₁ + V₂) (mieszanie)',
    },
    achievements: {
      perfectMixing: 'Idealne mieszanie! 🧪',
      dilutionExpert: 'Ekspert od rozcieńczania! 💧',
      fiveCorrect: '5 poprawnych! 🔥🔥',
      threeInRow: '3 z rzędu! 🔥',
    },
  },
});
