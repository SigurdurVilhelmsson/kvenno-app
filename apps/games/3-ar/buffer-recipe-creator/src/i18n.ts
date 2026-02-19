import { createGameTranslations } from '@shared/hooks/useGameI18n';

/**
 * Buffer Recipe Creator Game Translations
 */
export const gameTranslations = createGameTranslations({
  is: {
    game: {
      title: 'Stuðpúðauppskriftir',
      subtitle: 'Kvennaskólinn - Efnafræði 3. ár',
      description: 'Lærðu að búa til stuðpúðalausnir með ákveðið pH',
    },
    intro: {
      title: 'Hvað er stuðpúðalausn?',
      description: 'Stuðpúðalausn er lausn sem viðheldur næstum föstu pH þegar lítið magn af sýru eða basa er bætt við. Hún inniheldur veika sýru og samstæða basa (eða öfugt).',
    },
    levels: {
      level1: {
        name: 'Stig 1: Grunnhugtök',
        description: 'Skildu stuðpúðalausnir',
        details: 'Lærðu hvað stuðpúðar eru og hvernig þeir virka.',
      },
      level2: {
        name: 'Stig 2: Henderson-Hasselbalch',
        description: 'Notaðu jöfnuna til að reikna pH',
        details: 'Notaðu Henderson-Hasselbalch jöfnuna til að spá pH stuðpúðalausna.',
        locked: 'Ljúktu stigi 1 fyrst',
      },
      level3: {
        name: 'Stig 3: Búðu til lausn',
        description: 'Hannaðu stuðpúðalausnir',
        details: 'Reiknaðu hlutföll til að búa til stuðpúðalausn með ákveðið pH.',
        locked: 'Ljúktu stigi 2 fyrst',
      },
    },
    concepts: {
      buffer: 'Stuðpúði',
      bufferCapacity: 'Stuðpúðageta',
      weakAcid: 'Veik sýra',
      conjugateBase: 'Samstæður basi',
      weakBase: 'Veikur basi',
      conjugateAcid: 'Samstæð sýra',
      pKa: 'pKa',
      bufferRange: 'Stuðpúðasvið',
    },
    bufferPairs: {
      title: 'Algeng stuðpúðapör',
      aceticAcetate: 'Ediksýra / Asetat',
      ammoniaAmmonium: 'Ammóníak / Ammóníum',
      carbonicBicarbonate: 'Kolsýra / Tvíkarbónat',
      phosphate: 'Fosfat stuðpúði',
    },
    biologicalBuffers: {
      title: 'Líffræðilegir stuðpúðar',
      blood: 'Blóð stuðpúði (pH 7.4)',
      carbonate: 'Tvíkarbónat stuðpúði',
      phosphateBuffer: 'Fosfat stuðpúði',
      proteinBuffer: 'Prótein stuðpúði',
    },
    formulas: {
      title: 'Lykilformúlur',
      hendersonHasselbalch: 'pH = pKa + log([A⁻]/[HA])',
      bufferRatioAcid: '[A⁻]/[HA] = 10^(pH - pKa)',
      bufferRatioBase: '[HB⁺]/[B] = 10^(pKa - pH)',
    },
    instructions: {
      selectComponents: 'Veldu stuðpúðaþætti',
      setTargetPH: 'Stilltu mark-pH',
      calculateRatio: 'Reiknaðu hlutföll',
      verifyBuffer: 'Staðfestu stuðpúðann',
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
      title: 'Buffer Recipe Creator',
      subtitle: 'Kvennaskólinn - Chemistry Year 3',
      description: 'Learn to create buffer solutions with a specific pH',
    },
    intro: {
      title: 'What is a buffer solution?',
      description: 'A buffer solution maintains a nearly constant pH when small amounts of acid or base are added. It contains a weak acid and its conjugate base (or vice versa).',
    },
    levels: {
      level1: {
        name: 'Level 1: Basic Concepts',
        description: 'Understand buffer solutions',
        details: 'Learn what buffers are and how they work.',
      },
      level2: {
        name: 'Level 2: Henderson-Hasselbalch',
        description: 'Use the equation to calculate pH',
        details: 'Use the Henderson-Hasselbalch equation to predict pH of buffer solutions.',
        locked: 'Complete level 1 first',
      },
      level3: {
        name: 'Level 3: Create a Solution',
        description: 'Design buffer solutions',
        details: 'Calculate ratios to create a buffer solution with a specific pH.',
        locked: 'Complete level 2 first',
      },
    },
    concepts: {
      buffer: 'Buffer',
      bufferCapacity: 'Buffer capacity',
      weakAcid: 'Weak acid',
      conjugateBase: 'Conjugate base',
      weakBase: 'Weak base',
      conjugateAcid: 'Conjugate acid',
      pKa: 'pKa',
      bufferRange: 'Buffer range',
    },
    bufferPairs: {
      title: 'Common Buffer Pairs',
      aceticAcetate: 'Acetic acid / Acetate',
      ammoniaAmmonium: 'Ammonia / Ammonium',
      carbonicBicarbonate: 'Carbonic acid / Bicarbonate',
      phosphate: 'Phosphate buffer',
    },
    biologicalBuffers: {
      title: 'Biological Buffers',
      blood: 'Blood buffer (pH 7.4)',
      carbonate: 'Bicarbonate buffer',
      phosphateBuffer: 'Phosphate buffer',
      proteinBuffer: 'Protein buffer',
    },
    formulas: {
      title: 'Key Formulas',
      hendersonHasselbalch: 'pH = pKa + log([A⁻]/[HA])',
      bufferRatioAcid: '[A⁻]/[HA] = 10^(pH - pKa)',
      bufferRatioBase: '[HB⁺]/[B] = 10^(pKa - pH)',
    },
    instructions: {
      selectComponents: 'Select buffer components',
      setTargetPH: 'Set target pH',
      calculateRatio: 'Calculate ratios',
      verifyBuffer: 'Verify the buffer',
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
      title: 'Kreator buforow',
      subtitle: 'Kvennaskólinn - Chemia rok 3',
      description: 'Naucz sie tworzyc roztwory buforowe o okreslonym pH',
    },
    intro: {
      title: 'Czym jest roztwor buforowy?',
      description: 'Roztwor buforowy utrzymuje prawie stale pH gdy dodawane sa male ilosci kwasu lub zasady. Zawiera slaby kwas i jego sprzezona zasade (lub odwrotnie).',
    },
    levels: {
      level1: {
        name: 'Poziom 1: Podstawowe pojecia',
        description: 'Zrozum roztwory buforowe',
        details: 'Poznaj czym sa bufory i jak dzialaja.',
      },
      level2: {
        name: 'Poziom 2: Henderson-Hasselbalch',
        description: 'Uzyj rownania do obliczenia pH',
        details: 'Uzyj rownania Hendersona-Hasselbalcha do przewidzenia pH roztworow buforowych.',
        locked: 'Najpierw ukoncz poziom 1',
      },
      level3: {
        name: 'Poziom 3: Stworz roztwor',
        description: 'Projektuj roztwory buforowe',
        details: 'Oblicz proporcje aby stworzyc roztwor buforowy o okreslonym pH.',
        locked: 'Najpierw ukoncz poziom 2',
      },
    },
    concepts: {
      buffer: 'Bufor',
      bufferCapacity: 'Pojemnosc buforowa',
      weakAcid: 'Slaby kwas',
      conjugateBase: 'Sprzezona zasada',
      weakBase: 'Slaba zasada',
      conjugateAcid: 'Sprzezony kwas',
      pKa: 'pKa',
      bufferRange: 'Zakres buforowy',
    },
    bufferPairs: {
      title: 'Popularne pary buforowe',
      aceticAcetate: 'Kwas octowy / Octan',
      ammoniaAmmonium: 'Amoniak / Jon amonowy',
      carbonicBicarbonate: 'Kwas weglowy / Wodoroweglan',
      phosphate: 'Bufor fosforanowy',
    },
    biologicalBuffers: {
      title: 'Bufory biologiczne',
      blood: 'Bufor krwi (pH 7.4)',
      carbonate: 'Bufor wodoroweglanowy',
      phosphateBuffer: 'Bufor fosforanowy',
      proteinBuffer: 'Bufor bialkowiny',
    },
    formulas: {
      title: 'Kluczowe wzory',
      hendersonHasselbalch: 'pH = pKa + log([A⁻]/[HA])',
      bufferRatioAcid: '[A⁻]/[HA] = 10^(pH - pKa)',
      bufferRatioBase: '[HB⁺]/[B] = 10^(pKa - pH)',
    },
    instructions: {
      selectComponents: 'Wybierz skladniki buforu',
      setTargetPH: 'Ustaw docelowe pH',
      calculateRatio: 'Oblicz proporcje',
      verifyBuffer: 'Zweryfikuj bufor',
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
