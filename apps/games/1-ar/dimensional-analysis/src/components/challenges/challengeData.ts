import type { TieredHints } from '@shared/types';

export interface Challenge {
  id: string;
  type: 'equivalence' | 'factor_building' | 'cancellation' | 'orientation';
  title: string;
  instruction: string;
  hints: TieredHints;
  /** "Af hverju?" explanation shown after solving */
  whyExplanation: string;
}

export const challenges: Challenge[] = [
  {
    id: 'C1',
    type: 'equivalence',
    title: 'Jafngildi eininga',
    instruction: 'Finndu hversu margir LÍTRAR jafngilda 1000 mL. Notaðu takkana til að stilla.',
    hints: {
      topic: 'Þetta snýst um jafngildi milli mismunandi einingakerfa.',
      strategy: 'Hugsaðu um hvernig mismunandi tölur geta táknað sama rúmmál.',
      method: 'Mundu: 1 L = 1000 mL. Lítrar og millilítrar mæla sama rúmmál.',
      solution: '1000 mL = 1 L. Stilltu á 1 lítra.',
    },
    whyExplanation:
      'Umbreytingarstuðull jafngildir 1 vegna þess að teljari og nefnari tákna sama magn',
  },
  {
    id: 'C2',
    type: 'factor_building',
    title: 'Byggja umbreytingarstuðul',
    instruction: 'Dragðu einingar í brotið til að búa til stuðul sem jafngildir 1.',
    hints: {
      topic: 'Þetta snýst um umbreytingarstuðla og hvernig þeir virka.',
      strategy: 'Stuðull jafngildir 1 þegar teljari og nefnari tákna sama magn.',
      method: 'Veldu tvær einingar sem tákna nákvæmlega sama rúmmál.',
      solution: '1000 mL / 1 L = 1 eða 1 L / 1000 mL = 1',
    },
    whyExplanation:
      'Þegar brot jafngildir 1, getum við margfaldað með því án þess að breyta gildinu',
  },
  {
    id: 'C3',
    type: 'cancellation',
    title: 'Strikun eininga',
    instruction:
      'Veldu réttan stuðul til að breyta mL í L. Horfðu á hvernig einingarnar strikast út!',
    hints: {
      topic: 'Þetta snýst um strikun eininga í einingagreiningu.',
      strategy: 'Einingin sem þú vilt losna við þarf að vera í nefnara stuðulsins.',
      method: 'mL í byrjunargildi þarf að para við mL í nefnara stuðulsins.',
      solution: 'Veldu (1 L / 1000 mL) þar sem mL er í nefnara og strikast út.',
    },
    whyExplanation: 'Einingin strikast út vegna þess að sama einingin er bæði í teljara og nefnara',
  },
  {
    id: 'C4',
    type: 'orientation',
    title: 'Snúningur stuðuls',
    instruction: 'Prófaðu báða stuðla. Hver virkar til að breyta km í m?',
    hints: {
      topic: 'Þetta snýst um stefnu umbreytingarstuðla.',
      strategy: 'Einingin sem á að hverfa þarf að vera í nefnara.',
      method: 'km er í byrjunargildi, svo km þarf að vera í nefnara stuðulsins.',
      solution: 'Veldu (1000 m / 1 km) þar sem km í nefnara strikast út með km í teljara.',
    },
    whyExplanation:
      'Rétt stefna tryggir að óæskilega einingin strikist út og æskilega einingin verði eftir',
  },
  {
    id: 'C5',
    type: 'cancellation',
    title: 'Keðjubreyting',
    instruction: 'Notaðu tvo stuðla til að breyta mg í kg.',
    hints: {
      topic: 'Þetta snýst um keðjubreytingar með mörgum stuðlum.',
      strategy: 'Fyrst mg → g, síðan g → kg. Fylgstu með hvernig einingarnar hverfa.',
      method: 'Í hverju skrefi þarf einingin sem á að hverfa að vera í nefnara.',
      solution: 'Skref 1: (1 g / 1000 mg), Skref 2: (1 kg / 1000 g)',
    },
    whyExplanation: 'Keðjuumbreytingar nota mörg skref þegar engin ein umbreyting dugar',
  },
  {
    id: 'C6',
    type: 'cancellation',
    title: 'Keðjubreyting - Tími',
    instruction: 'Byggðu keðjuna til að breyta 1 klukkustund í sekúndur. Veldu rétta stuðla!',
    hints: {
      topic: 'Þetta snýst um keðjubreytingar með tímaeiningum.',
      strategy: 'Byrjaðu með klst → mín, síðan mín → s. Einingin sem á að hverfa fer í nefnara.',
      method: 'klst strikast út með klst í nefnara, mín strikast út með mín í nefnara.',
      solution: 'Skref 1: (60 mín / 1 klst), Skref 2: (60 s / 1 mín)',
    },
    whyExplanation: 'Sama regla gildir um tímaeiningar og önnur stærðfræðileg sambönd',
  },
];

/** Map challenge id to CancellationChallenge variant */
export const cancellationVariants: Record<string, 'mL-to-L' | 'mg-to-kg' | 'time-chain'> = {
  C3: 'mL-to-L',
  C5: 'mg-to-kg',
  C6: 'time-chain',
};

/** Success messages keyed by challenge type */
export const successMessages: Record<string, string> = {
  equivalence: 'Þú skildir að mismunandi tölur með mismunandi einingum geta táknað sama magn!',
  factor_building: 'Þú bjóst til stuðul sem jafngildir 1 - lykilhugtak í einingagreiningu!',
  cancellation: 'Þú sást hvernig einingarnar strikast út þegar þær eru eins!',
  orientation: 'Þú lærðir að einingin sem á að hverfa þarf að vera í nefnara!',
};
