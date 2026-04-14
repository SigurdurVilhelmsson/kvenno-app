import { useState } from 'react';

import { FeedbackPanel } from '@shared/components';

import { PeriodicTable } from './PeriodicTable';
import {
  ELEMENTS,
  CATEGORY_LABELS,
  getClassification,
  type Element,
  type ElementClassification,
} from '../data/elements';

interface Level2Props {
  onBack: () => void;
  onComplete: () => void;
}

type QuestionType = 'classify' | 'order-by-mass' | 'group-property';

interface Question {
  type: QuestionType;
  text: string;
  options: string[];
  correctOption: string;
  explanation: string;
  /** Elements relevant to highlight on the periodic table */
  highlightSymbols: string[];
}

/** Fisher-Yates shuffle */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRandom<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n);
}

/** Classification questions: metal / nonmetal / metalloid */
function makeClassifyQuestion(el: Element): Question {
  const correct = getClassification(el.category);
  const options: ElementClassification[] = ['málmur', 'málmleysingi', 'hálfmálmur'];
  const categoryLabel = CATEGORY_LABELS[el.category];
  return {
    type: 'classify',
    text: `Er ${el.name} (${el.symbol}) málmur, málmleysingi eða hálfmálmur?`,
    options,
    correctOption: correct,
    explanation: `${el.name} er ${correct}. Flokkur: ${categoryLabel}.`,
    highlightSymbols: [el.symbol],
  };
}

/** Order elements by atomic mass */
function makeOrderQuestion(): Question {
  const elements = pickRandom(
    ELEMENTS.filter((e) => e.period <= 4),
    3
  );
  elements.sort((a, b) => a.atomicMass - b.atomicMass);
  const correctOrder = elements.map((e) => e.symbol).join(' < ');
  const shuffled = shuffle(elements);

  // Generate plausible wrong orderings
  const allPerms = [
    [0, 1, 2],
    [0, 2, 1],
    [1, 0, 2],
    [1, 2, 0],
    [2, 0, 1],
    [2, 1, 0],
  ];
  const options = allPerms
    .map((perm) => perm.map((i) => elements[i].symbol).join(' < '))
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .slice(0, 4);

  if (!options.includes(correctOrder)) {
    options[options.length - 1] = correctOrder;
  }

  return {
    type: 'order-by-mass',
    text: `Raðaðu ${shuffled.map((e) => e.name).join(', ')} eftir vaxandi frumeindamassa:`,
    options: shuffle(options),
    correctOption: correctOrder,
    explanation: `Rétt röðun: ${elements.map((e) => `${e.name} (${e.atomicMass.toFixed(1)})`).join(' < ')}.`,
    highlightSymbols: elements.map((e) => e.symbol),
  };
}

/** Group property questions */
function makeGroupQuestion(): Question {
  const groupQuestions: {
    elements: string[];
    question: string;
    correct: string;
    options: string[];
    explanation: string;
  }[] = [
    {
      elements: ['Na', 'K', 'Li'],
      question: 'Hvað er sameiginlegt með Na, K og Li?',
      correct: 'Þau eru öll alkalímálmar (flokkur 1)',
      options: [
        'Þau eru öll alkalímálmar (flokkur 1)',
        'Þau eru öll eðallofttegundir',
        'Þau eru öll halógen',
        'Þau eru öll skiptimálmar',
      ],
      explanation:
        'Na, K og Li eru öll í flokki 1 (alkalímálmar). Þau eiga sér eitt gildisrafeind.',
    },
    {
      elements: ['F', 'Cl', 'Br'],
      question: 'Hvað er sameiginlegt með F, Cl og Br?',
      correct: 'Þau eru öll halógen (flokkur 17)',
      options: [
        'Þau eru öll halógen (flokkur 17)',
        'Þau eru öll alkalímálmar',
        'Þau eru öll ómálmar í flokki 16',
        'Þau eru öll eðallofttegundir',
      ],
      explanation: 'F, Cl og Br eru öll halógen (flokkur 17). Þau eiga sér 7 gildisrafeindir.',
    },
    {
      elements: ['He', 'Ne', 'Ar'],
      question: 'Hvað er sameiginlegt með He, Ne og Ar?',
      correct: 'Þau eru öll eðallofttegundir (flokkur 18)',
      options: [
        'Þau eru öll eðallofttegundir (flokkur 18)',
        'Þau eru öll ómálmar í flokki 1',
        'Þau eru öll halógen',
        'Þau eru öll málmar',
      ],
      explanation:
        'He, Ne og Ar eru eðallofttegundir (flokkur 18). Þau hafa fulla ystu rafeindaskel og eru mjög stöðug.',
    },
    {
      elements: ['Be', 'Mg', 'Ca'],
      question: 'Hvað er sameiginlegt með Be, Mg og Ca?',
      correct: 'Þau eru öll jarðalkalímálmar (flokkur 2)',
      options: [
        'Þau eru öll jarðalkalímálmar (flokkur 2)',
        'Þau eru öll alkalímálmar (flokkur 1)',
        'Þau eru öll hálfmálmar',
        'Þau eru öll skiptimálmar',
      ],
      explanation:
        'Be, Mg og Ca eru jarðalkalímálmar (flokkur 2). Þau eiga sér tvær gildisrafeindir.',
    },
  ];

  const q = groupQuestions[Math.floor(Math.random() * groupQuestions.length)];
  return {
    type: 'group-property',
    text: q.question,
    options: shuffle(q.options),
    correctOption: q.correct,
    explanation: q.explanation,
    highlightSymbols: q.elements,
  };
}

function generateQuestions(): Question[] {
  const questions: Question[] = [];
  const classifyElements = pickRandom(
    ELEMENTS.filter((e) => e.period <= 4),
    4
  );

  for (const el of classifyElements) {
    questions.push(makeClassifyQuestion(el));
  }

  questions.push(makeOrderQuestion());
  questions.push(makeOrderQuestion());

  questions.push(makeGroupQuestion());
  questions.push(makeGroupQuestion());

  return shuffle(questions);
}

const TOTAL = 8;

export function Level2({ onBack, onComplete }: Level2Props) {
  const [questions, setQuestions] = useState<Question[]>(generateQuestions);
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const question = questions[index];

  const handleOptionClick = (option: string) => {
    if (answered) return;
    const correct = option === question.correctOption;
    setSelectedOption(option);
    setIsCorrect(correct);
    if (correct) setCorrectCount((prev) => prev + 1);
    setAnswered(true);
  };

  const handleNext = () => {
    if (index + 1 >= TOTAL) {
      setDone(true);
      return;
    }
    setIndex((prev) => prev + 1);
    setAnswered(false);
    setIsCorrect(false);
    setSelectedOption(null);
  };

  const handleRetry = () => {
    setQuestions(generateQuestions());
    setIndex(0);
    setCorrectCount(0);
    setAnswered(false);
    setIsCorrect(false);
    setSelectedOption(null);
    setDone(false);
  };

  // --- Summary screen ---
  if (done) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center space-y-6">
          <div className="text-5xl">
            {correctCount >= 6 ? '🎉' : correctCount >= 4 ? '👍' : '📚'}
          </div>
          <h2 className="text-2xl font-bold text-warm-800">Niðurstöður</h2>
          <p className="text-lg text-warm-700">
            Þú svaraðir <span className="font-bold text-kvenno-orange">{correctCount}</span> af{' '}
            <span className="font-bold">{TOTAL}</span> rétt
          </p>
          <div className="h-3 bg-warm-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-kvenno-orange transition-all duration-700"
              style={{ width: `${(correctCount / TOTAL) * 100}%` }}
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRetry}
              className="flex-1 bg-warm-200 hover:bg-warm-300 text-warm-800 font-bold py-3 rounded-xl transition-colors"
            >
              Reyna aftur
            </button>
            <button
              onClick={onComplete}
              className="flex-1 bg-kvenno-orange hover:bg-kvenno-orange-dark text-white font-bold py-3 rounded-xl transition-colors"
            >
              Ljúka stigi
            </button>
          </div>
          <button onClick={onBack} className="text-warm-500 hover:text-warm-700 text-sm">
            Til baka í valmynd
          </button>
        </div>
      </div>
    );
  }

  // --- Gameplay ---
  const highlightSet = new Set(question.highlightSymbols);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-2 sm:p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-3 sm:p-4 mb-3">
          <div className="flex justify-between items-center">
            <button
              onClick={onBack}
              className="text-warm-500 hover:text-warm-700 font-semibold text-sm"
            >
              ← Til baka
            </button>
            <h1 className="text-base sm:text-lg font-bold text-warm-800">Flokkar og lóðir</h1>
            <span className="text-sm font-semibold text-warm-600">
              {index + 1}/{TOTAL}
            </span>
          </div>
          <div className="mt-2 h-2 bg-warm-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-kvenno-orange progress-fill"
              style={{ width: `${((index + 1) / TOTAL) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div
          className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-3 text-center animate-fade-in-up"
          key={index}
        >
          <p className="text-lg sm:text-xl font-bold text-warm-800">{question.text}</p>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3 max-w-2xl mx-auto">
          {question.options.map((option) => {
            const isSelected = selectedOption === option;
            const isCorrectOption = option === question.correctOption;
            let optionClass =
              'bg-white border-warm-300 text-warm-700 hover:border-kvenno-orange hover:bg-orange-50';
            if (answered) {
              if (isCorrectOption) {
                optionClass = 'bg-green-100 border-green-500 text-green-800';
              } else if (isSelected && !isCorrectOption) {
                optionClass = 'bg-red-100 border-red-400 text-red-700';
              } else {
                optionClass = 'bg-warm-50 border-warm-200 text-warm-400';
              }
            }
            return (
              <button
                key={option}
                onClick={() => handleOptionClick(option)}
                disabled={answered}
                className={`p-3 sm:p-4 rounded-xl border-2 font-medium text-sm sm:text-base transition-all text-left ${optionClass}`}
              >
                {option}
              </button>
            );
          })}
        </div>

        {/* Periodic table (reference, non-interactive) */}
        <div className="bg-white rounded-xl shadow-lg p-2 sm:p-4 mb-3">
          <PeriodicTable highlightedElements={highlightSet} interactive={false} />
        </div>

        {/* Feedback */}
        {answered && (
          <div className="space-y-3 mb-3 max-w-2xl mx-auto animate-fade-in-up">
            <FeedbackPanel
              feedback={{
                isCorrect,
                explanation: question.explanation,
              }}
              config={{ showExplanation: true }}
            />
            <button
              onClick={handleNext}
              className="w-full bg-kvenno-orange hover:bg-kvenno-orange-dark text-white font-bold py-3 rounded-xl transition-colors"
            >
              {index + 1 < TOTAL ? 'Næsta spurning →' : 'Sjá niðurstöður →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Level2;
