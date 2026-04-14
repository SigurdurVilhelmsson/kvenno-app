import { createGameTranslations } from '@shared/hooks/useGameI18n';

export const gameTranslations = createGameTranslations({
  is: {
    game: {
      title: 'Rafeindabygging',
      subtitle: 'Kvennaskólinn - Efnafræði 2. ár',
      description: 'Skammtatölur, svigrúm og rafeindauppsetning',
    },
    levels: {
      level1: {
        name: 'Stig 1: Skammtatölur',
        description: 'Lærðu um skammtatölurnar n, l, mₗ og mₛ',
      },
      level2: {
        name: 'Stig 2: Rafeindasmíð',
        description: 'Fylltu í svigrúm samkvæmt Aufbau og Hund',
      },
      level3: {
        name: 'Stig 3: Lotukerfi og rafeindir',
        description: 'Tengdu sæti í lotukerfinu við rafeindauppsetningu',
      },
    },
  },
  pl: {
    game: {
      title: 'Budowa elektronowa',
      subtitle: 'Kvennaskólinn - Chemia rok 2',
      description: 'Liczby kwantowe, orbitale i konfiguracja elektronowa',
    },
    levels: {
      level1: {
        name: 'Poziom 1: Liczby kwantowe',
        description: 'Poznaj liczby kwantowe n, l, mₗ i mₛ',
      },
      level2: {
        name: 'Poziom 2: Konfiguracja elektronowa',
        description: 'Wypełniaj orbitale zgodnie z regułą Aufbau i Hunda',
      },
      level3: {
        name: 'Poziom 3: Układ okresowy i elektrony',
        description: 'Połącz pozycję w układzie okresowym z konfiguracją elektronową',
      },
    },
  },
  en: {
    game: {
      title: 'Electronic Structure',
      subtitle: 'Kvennaskólinn - Chemistry Year 2',
      description: 'Quantum numbers, orbitals, and electron configuration',
    },
    levels: {
      level1: {
        name: 'Level 1: Quantum Numbers',
        description: 'Learn about quantum numbers n, l, mₗ, and mₛ',
      },
      level2: {
        name: 'Level 2: Electron Configuration',
        description: "Fill orbitals using Aufbau principle and Hund's rule",
      },
      level3: {
        name: 'Level 3: Periodic Table & Electrons',
        description: 'Connect periodic table position to electron configuration',
      },
    },
  },
});
