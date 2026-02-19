/**
 * Interactive lessons for teaching dimensional analysis concepts
 */

export interface Lesson {
  id: number;
  title: string;
  content: string;
  animation: 'beakers' | 'cancellation' | 'orientation';
  quiz: {
    question: string;
    options: string[];
    correct: number | number[];
    multiSelect?: boolean;
    explanation: string;
  };
}

export const lessons: Lesson[] = [
  {
    id: 1,
    title: "Hvað er umbreytingarstuðull?",
    content: "Umbreytingarstuðull er brot sem jafngildir 1. Vegna þess að teljari og nefnari tákna sama magn, getum við margfaldað með honum án þess að breyta raunverulegu magni.",
    animation: "beakers",
    quiz: {
      question: "Hvaða gildi hefur 1000 mL / 1 L?",
      options: ["0.001", "1", "1000", "1000000"],
      correct: 1,
      explanation: "Vegna þess að 1000 mL = 1 L þá er þessi brot jafn og 1"
    }
  },
  {
    id: 2,
    title: "Af hverju strikast einingar út?",
    content: "Þegar sama einingin birtist bæði í teljara og nefnara getum við strikað hana út, alveg eins og með tölur í brotum.",
    animation: "cancellation",
    quiz: {
      question: "Hvaða pör strikast út? (Veldu öll rétt)",
      options: ["g/g", "mL/L", "kg/g", "cm/cm"],
      correct: [0, 3],
      multiSelect: true,
      explanation: "Aðeins nákvæmlega sama einingin strikast út: g með g, cm með cm"
    }
  },
  {
    id: 3,
    title: "Hvernig vel ég rétta stefnu?",
    content: "Til að velja rétta stefnu á umbreytingarstuðli þarftu að hugsa um hvaða eining þarf að vera í nefnara til að strikast út við upphafseiningu.",
    animation: "orientation",
    quiz: {
      question: "Til að breyta g → kg, hvaða stuðull er réttur?",
      options: ["1 kg / 1000 g", "1000 g / 1 kg", "Báðir virka", "Hvorugur virkar"],
      correct: 0,
      explanation: "Við þurfum 'g' í nefnara til að strika út við upphafs 'g', svo 1 kg / 1000 g er rétt"
    }
  }
];
