import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { FeedbackPanel } from '@shared/components';
import { useEscapeKey } from '@shared/hooks';
import {
  formatDecimal,
  revealSpan,
  revealTop,
  shuffleArray,
  useArmedAfter,
  useIsPhone,
  useItemTop,
  useRevealAfterCommit,
  useScreenTop,
} from '@shared/utils';

import { PeriodicTable } from './PeriodicTable';
import {
  ELEMENTS,
  CATEGORY_LABELS,
  getClassification,
  nameInSentence,
  type Element,
  type ElementClassification,
} from '../data/elements';
import { TREND_INFO, TREND_QUESTIONS, type TrendQuestion } from '../data/trends';
import { level2Misconception } from '../utils/misconceptions';
import { tabletBelowMd } from '../utils/tableLayout';

interface Level2Props {
  onBack: () => void;
  onComplete: () => void;
}

type QuestionType = 'classify' | 'order-by-mass' | 'group-property' | 'trend';

export interface Question {
  type: QuestionType;
  text: string;
  options: string[];
  correctOption: string;
  explanation: string;
  /** Elements relevant to highlight on the periodic table */
  highlightSymbols: string[];
}

function pickRandom<T>(arr: T[], n: number): T[] {
  return shuffleArray(arr).slice(0, n);
}

/** Classification questions: metal / nonmetal / metalloid */
function makeClassifyQuestion(el: Element): Question {
  const correct = getClassification(el.category);
  const options: ElementClassification[] = ['málmur', 'málmleysingi', 'hálfmálmur'];
  const categoryLabel = CATEGORY_LABELS[el.category];
  return {
    type: 'classify',
    text: `Er ${nameInSentence(el)} (${el.symbol}) málmur, málmleysingi eða hálfmálmur?`,
    options,
    correctOption: correct,
    // `Tegund`, not `Flokkur`: in this game a flokkur is a column of the
    // table, and the intro defines it as exactly that. Left out where the
    // tegund is the answer itself (a hálfmálmur, a málmleysingi), which would
    // only say it twice.
    explanation:
      categoryLabel.toLowerCase() === correct
        ? `${el.name} er ${correct}.`
        : `${el.name} er ${correct}. Tegund: ${categoryLabel.toLowerCase()}.`,
    highlightSymbols: [el.symbol],
  };
}

/**
 * True where ordering by sætistala and ordering by meðalatómmassi disagree.
 *
 * The intro teaches that mass rises with the atomic number, and inside the
 * period<=4 pool that rule holds everywhere except Ar/K and Co/Ni, where the
 * heavier-numbered element is the lighter one. While the masses were printed on
 * every cell of the table below the question those two pairs were answerable by
 * reading; now that they are masked, an item containing one would be an item the
 * taught rule gets wrong and the student has no way to check. Draw around them
 * and name the exception in the teaching text instead.
 */
function hasMassInversion(elements: Element[]): boolean {
  const byNumber = [...elements].sort((a, b) => a.atomicNumber - b.atomicNumber);
  return byNumber.some((el, i) => i > 0 && byNumber[i - 1].atomicMass > el.atomicMass);
}

/** Order elements by atomic mass */
function makeOrderQuestion(): Question {
  const pool = ELEMENTS.filter((e) => e.period <= 4);

  // Built one element at a time rather than drawn and retried, so the guarantee
  // is structural: a candidate that would invert against anything already
  // chosen is never taken in the first place.
  const elements: Element[] = [];
  for (const candidate of shuffleArray(pool)) {
    if (elements.length === 3) break;
    if (!hasMassInversion([...elements, candidate])) elements.push(candidate);
  }

  elements.sort((a, b) => a.atomicMass - b.atomicMass);
  const correctOrder = elements.map((e) => e.symbol).join(' < ');
  const shuffled = shuffleArray(elements);

  // The three wrong orderings are drawn from all five, not taken as the first
  // three in a fixed list. That list never put the heaviest element first, so
  // whichever element led no option was the heaviest, and half the answer was
  // readable off the options alone.
  const wrongPerms = [
    [0, 2, 1],
    [1, 0, 2],
    [1, 2, 0],
    [2, 0, 1],
    [2, 1, 0],
  ];
  const options = [
    correctOrder,
    ...pickRandom(wrongPerms, 3).map((perm) => perm.map((i) => elements[i].symbol).join(' < ')),
  ];

  const names = shuffled.map(nameInSentence);
  return {
    type: 'order-by-mass',
    // `raða` governs the dative, which a masculine name does not share with
    // its nominative (brennisteini, kísli); a list after the colon does not
    // need the case.
    text: `Raðaðu þessum frumefnum eftir vaxandi meðalatómmassa: ${names.slice(0, -1).join(', ')} og ${names[names.length - 1]}.`,
    options: shuffleArray(options),
    correctOption: correctOrder,
    explanation: `Rétt röðun: ${elements.map((e) => `${nameInSentence(e)} (${formatDecimal(e.atomicMass, 1)})`).join(' < ')}.`,
    highlightSymbols: elements.map((e) => e.symbol),
  };
}

interface GroupQuestion {
  elements: string[];
  question: string;
  correct: string;
  options: string[];
  explanation: string;
}

/**
 * Group property questions.
 *
 * The group number lives in the explanation, not in the options: it used to
 * be appended to the right answer and to almost none of the wrong ones, so the
 * one option carrying "(flokkur N)" was the answer.
 */
const GROUP_QUESTIONS: GroupQuestion[] = [
  {
    elements: ['Na', 'K', 'Li'],
    question: 'Hvað er sameiginlegt með Na, K og Li?',
    correct: 'Þau eru öll alkalímálmar',
    options: [
      'Þau eru öll alkalímálmar',
      'Þau eru öll eðalgös',
      'Þau eru öll halógen',
      'Þau eru öll hliðarmálmar',
    ],
    explanation: 'Na, K og Li eru öll í flokki 1 (alkalímálmar). Þau hafa eina gildisrafeind.',
  },
  {
    elements: ['F', 'Cl', 'Br'],
    question: 'Hvað er sameiginlegt með F, Cl og Br?',
    correct: 'Þau eru öll halógen',
    options: [
      'Þau eru öll halógen',
      'Þau eru öll alkalímálmar',
      'Þau eru öll málmleysingjar í flokki 16',
      'Þau eru öll eðalgös',
    ],
    explanation: 'F, Cl og Br eru öll halógen (flokkur 17). Þau hafa 7 gildisrafeindir.',
  },
  {
    elements: ['He', 'Ne', 'Ar'],
    question: 'Hvað er sameiginlegt með He, Ne og Ar?',
    correct: 'Þau eru öll eðalgös',
    options: [
      'Þau eru öll eðalgös',
      'Þau eru öll málmleysingjar í flokki 1',
      'Þau eru öll halógen',
      'Þau eru öll málmar',
    ],
    explanation:
      'He, Ne og Ar eru eðalgös (flokkur 18). Þau hafa fullt ysta rafeindahvolf og eru mjög stöðug.',
  },
  {
    elements: ['Be', 'Mg', 'Ca'],
    question: 'Hvað er sameiginlegt með Be, Mg og Ca?',
    correct: 'Þau eru öll jarðalkalímálmar',
    options: [
      'Þau eru öll jarðalkalímálmar',
      'Þau eru öll alkalímálmar',
      'Þau eru öll hálfmálmar',
      'Þau eru öll hliðarmálmar',
    ],
    explanation: 'Be, Mg og Ca eru jarðalkalímálmar (flokkur 2). Þau hafa tvær gildisrafeindir.',
  },
];

function makeGroupQuestion(q: GroupQuestion): Question {
  return {
    type: 'group-property',
    text: q.question,
    options: shuffleArray(q.options),
    correctOption: q.correct,
    explanation: q.explanation,
    highlightSymbols: q.elements,
  };
}

/**
 * A periodic-trend comparison.
 *
 * Two options rather than four, which is what the textbook exercise is and what
 * the harvested data supports: the pairs are curated so that both elements sit
 * in the same period or the same group, because the rules this level teaches
 * disagree on a diagonal comparison. A run draws two of the twelve, so guessing
 * both is a 1-in-4 shot at two of ten questions — the trade for asking the
 * comparison in the form a student will meet it in.
 */
function makeTrendQuestion(trend: TrendQuestion): Question {
  const info = TREND_INFO[trend.trendType];
  const other =
    trend.answerSymbol === trend.element1Symbol ? trend.element2Symbol : trend.element1Symbol;
  const nameOf = (symbol: string) => {
    const element = ELEMENTS.find((e) => e.symbol === symbol);
    return element ? `${element.name} (${symbol})` : symbol;
  };

  return {
    type: 'trend',
    text: `${info.emoji} ${trend.question}`,
    options: shuffleArray([nameOf(trend.answerSymbol), nameOf(other)]),
    correctOption: nameOf(trend.answerSymbol),
    explanation: `${trend.explanation} Regla: ${info.rule}`,
    highlightSymbols: [trend.element1Symbol, trend.element2Symbol],
  };
}

/** Exported for tests: the level's whole question pool for one run. */
export function generateQuestions(): Question[] {
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

  // Two different groups: drawn independently, a run asked the same one twice
  // a quarter of the time.
  for (const q of pickRandom(GROUP_QUESTIONS, 2)) {
    questions.push(makeGroupQuestion(q));
  }

  // Two trends, drawn from different trend types so a run never asks the same
  // rule twice.
  const trendTypes = shuffleArray([...new Set(TREND_QUESTIONS.map((q) => q.trendType))]).slice(
    0,
    2
  );
  for (const trendType of trendTypes) {
    const forType = TREND_QUESTIONS.filter((q) => q.trendType === trendType);
    questions.push(makeTrendQuestion(shuffleArray(forType)[0]));
  }

  return shuffleArray(questions);
}

const TOTAL = 10;

/**
 * Whether a question's options are short enough to sit two to a row on a phone
 * without a word breaking: the orderings (`N < S < Ge`), the three kinds of
 * element and the trend pairs (`Köfnunarefni (N)`), but not the group
 * sentences. Twelve letters is the longest word a half-width option holds at
 * 320 px.
 */
export function optionsTwoUp(options: string[]): boolean {
  return options.every((o) => o.length <= 16 && o.split(' ').every((w) => w.length <= 12));
}

function hintFor(question: Question): string {
  if (question.type === 'trend') {
    return 'Finndu bæði frumefnin í lotukerfinu fyrir neðan. Eru þau í sömu lotu (láréttri röð) eða sama flokki (lóðréttum dálki)? Reglan fyrir hvora átt er í kennslunni.';
  }
  if (question.type === 'classify') {
    return 'Skoðaðu hvar frumefnið er í lotukerfinu: málmar eru vinstra megin, hálfmálmar á landamærum, málmleysingjar hægra megin og efst.';
  }
  if (question.type === 'order-by-mass') {
    return 'Meðalatómmassi vex frá vinstri til hægri og niður eftir lotunum.';
  }
  return 'Flokkurinn (dálkurinn) ákvarðar eiginleikana. Sjáðu hvar táknin eru í lotukerfinu fyrir neðan.';
}

export function Level2({ onBack, onComplete }: Level2Props) {
  const [showIntro, setShowIntro] = useState(true);
  useEscapeKey(onBack, showIntro);
  const [questions, setQuestions] = useState<Question[]>(generateQuestions);
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [done, setDone] = useState(false);
  const question = questions[index];

  // Each screen (teaching, questions, results) starts at its top on a phone,
  // with its heading focused; each new question brings its card back under
  // the top of the screen, with focus on the question. The button that moved
  // on has unmounted, and focus would otherwise fall to <body>.
  const screen = showIntro ? 'intro' : done ? 'done' : 'play';
  useScreenTop(screen);
  const itemRef = useItemTop<HTMLDivElement>(index);

  // After an answer: the question through "Næsta" if it fits, else the
  // student's own choice, else the feedback at the top. Focus moves to the
  // feedback, not to "Næsta", so a second tap or Enter lands on nothing
  // (design P3).
  const optionsRef = useRef<HTMLDivElement>(null);
  const feedbackBoxRef = useRef<HTMLDivElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  useRevealAfterCommit(answered, () => ({
    bottom: nextRef.current,
    tops: [
      itemRef.current,
      optionsRef.current?.children[question.options.indexOf(selectedOption ?? '')] ?? null,
      feedbackRef.current,
    ],
    focus: feedbackRef.current,
  }));
  // "Næsta" ignores a press within 400 ms of appearing, so the second tap of a
  // double tap on an option cannot skip the feedback; the results' buttons
  // likewise, after the last "Næsta".
  const armed = useArmedAfter(400, `${index}:${answered}`);
  // One tap on a cell or an option is the answer, so the answers ignore a tap
  // within 400 ms of a question appearing: the second tap of a double tap on
  // "Byrja æfingar" or "Næsta" must not answer a question nobody has read.
  const armedAnswer = useArmedAfter(400, `${screen}:${index}`);
  const armedResults = useArmedAfter(400, done);

  // Opening the hint replaces its button, which dropped focus to <body> and
  // pushed the options down: focus moves to the hint, and a phone keeps the
  // hint and the options on screen together where they fit.
  const hintRef = useRef<HTMLDivElement>(null);
  useRevealAfterCommit(showHint && !answered, () => ({
    bottom: optionsRef.current,
    tops: [hintRef.current],
    focus: hintRef.current,
  }));

  // Below md but wider than a phone, the game's old helper started each screen
  // and each question at the top of the page, in one jump, and brought the feedback into
  // view the way `scrollIntoView({ block: 'nearest' })` does; it still does.
  useLayoutEffect(() => {
    if (tabletBelowMd())
      revealTop(document.documentElement, { anyWidth: true, always: true, instant: true });
  }, [screen, index]);
  useEffect(() => {
    if (answered && tabletBelowMd()) {
      revealSpan(feedbackBoxRef.current, [], { anyWidth: true, gap: 0 });
    }
  }, [answered]);

  // On a phone the table goes between the question and the options, where it
  // is read: below the options it took a scroll down to read it and another
  // back up to answer. It is moved in the DOM, not by CSS order, because its
  // sideways-scrolling box can take keyboard focus. Everywhere else it stays
  // where it was.
  const phone = useIsPhone();

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
    setShowHint(false);
  };

  const handleRetry = () => {
    setQuestions(generateQuestions());
    setIndex(0);
    setCorrectCount(0);
    setAnswered(false);
    setIsCorrect(false);
    setSelectedOption(null);
    setShowHint(false);
    setDone(false);
  };

  // --- Summary screen ---
  if (done) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center space-y-6 phone:p-6 phone:space-y-4">
          <div className="text-5xl phone:text-4xl">
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
              onClick={armedResults(handleRetry)}
              className="flex-1 bg-warm-200 hover:bg-warm-300 text-warm-800 font-bold py-3 rounded-xl transition-colors"
            >
              Reyna aftur
            </button>
            <button
              onClick={armedResults(onComplete)}
              className="flex-1 bg-kvenno-orange hover:bg-kvenno-orange-dark text-white font-bold py-3 rounded-xl transition-colors"
            >
              Ljúka stigi
            </button>
          </div>
          <button
            onClick={onBack}
            className="text-warm-500 hover:text-warm-700 text-sm pointer-coarse:py-3 pointer-coarse:-my-3"
          >
            Til baka í valmynd
          </button>
        </div>
      </div>
    );
  }

  // --- Teaching intro ---
  if (showIntro) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 phone:py-3">
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-xl shadow-md p-4 mb-4 phone:p-3 phone:mb-3">
            {/* On a phone the title takes a line of its own under the back
                button, instead of being squeezed to a word per line. */}
            <div className="flex flex-wrap md:flex-nowrap justify-between items-center gap-y-1">
              <button
                onClick={onBack}
                className="text-warm-500 hover:text-warm-700 font-semibold text-sm whitespace-nowrap md:whitespace-normal pointer-coarse:py-3 pointer-coarse:-my-3"
              >
                ← Til baka
              </button>
              <h1 className="order-last basis-full md:order-none md:basis-auto text-base md:text-lg font-bold text-warm-800">
                Flokkar og lotubundnir eiginleikar — Kennsla
              </h1>
              <span className="text-sm text-warm-500">Yfirlit</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 space-y-5 animate-fade-in-up phone:space-y-4">
            <h2 className="text-xl font-bold text-warm-800">Lotukerfið — mynstur og flokkar</h2>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-bold text-blue-800 mb-2">Málmar, málmleysingjar og hálfmálmar</h3>
              <p className="text-sm text-blue-700">
                <strong>Málmar</strong> eru vinstra megin (flestir). <strong>Málmleysingjar</strong>{' '}
                eru hægra megin.
                <strong> Hálfmálmar</strong> (B, Si, Ge, As, Sb, Te) eru á mörkum þeirra — stiginn í
                lotukerfinu.
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-bold text-green-800 mb-2">Mikilvægustu flokkarnir</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div className="bg-white p-2 rounded">
                  <strong className="text-red-700">Flokkur 1:</strong> Alkalímálmar (Li, Na, K...) —
                  1 gildisrafeind
                </div>
                <div className="bg-white p-2 rounded">
                  <strong className="text-orange-700">Flokkur 2:</strong> Jarðalkalímálmar (Be, Mg,
                  Ca...) — 2 gildisrafeindir
                </div>
                <div className="bg-white p-2 rounded">
                  <strong className="text-purple-700">Flokkur 17:</strong> Halógen (F, Cl, Br...) —
                  7 gildisrafeindir
                </div>
                <div className="bg-white p-2 rounded">
                  <strong className="text-blue-700">Flokkur 18:</strong> Eðalgös (He, Ne, Ar...) —
                  fullt hvolf
                </div>
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-bold text-purple-800 mb-2">Lotubundnir eiginleikar</h3>
              <p className="text-sm text-purple-700 mb-2">
                Þrír eiginleikar breytast eftir reglu þegar farið er um lotukerfið — og allir þrír
                eiga sér sömu skýringu: hversu fast kjarninn heldur í ystu rafeindirnar.
              </p>
              <div className="space-y-2 text-sm">
                {(Object.keys(TREND_INFO) as (keyof typeof TREND_INFO)[]).map((key) => (
                  <div key={key} className="bg-white p-2 rounded">
                    <strong className="text-purple-700">
                      {TREND_INFO[key].emoji} {TREND_INFO[key].name}:
                    </strong>{' '}
                    {TREND_INFO[key].description}
                    <p className="text-warm-600 mt-1">{TREND_INFO[key].rule}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-warm-50 p-4 rounded-lg">
              <h3 className="font-bold text-warm-800 mb-2">Meðalatómmassi</h3>
              <p className="text-sm text-warm-700">
                Meðalatómmassi eykst almennt eftir því sem sætistalan hækkar. Frumefni í sama flokki
                (lóðrétt) hafa svipaða efnaeiginleika en aukinn massa.
              </p>
              <p className="text-sm text-warm-600 mt-2">
                <strong>Almennt</strong> — ekki alltaf. Argon (18) er þyngra en kalíum (19), og
                kóbalt (27) þyngra en nikkel (28), því meðalatómmassi er meðaltal yfir samsætur.
                Þess vegna er lotukerfinu raðað eftir sætistölu en ekki massa.
              </p>
            </div>

            <button
              onClick={() => setShowIntro(false)}
              className="w-full bg-kvenno-orange hover:bg-kvenno-orange-dark text-white font-bold py-3 rounded-xl transition-colors"
            >
              Byrja æfingar →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Gameplay ---
  const highlightSet = new Set(question.highlightSymbols);

  // The table below the question is a locator, not an answer key. Whichever
  // datum the current question asks about is masked until the student has
  // committed — then revealed, which is where the checking happens.
  const showCategories =
    answered || (question.type !== 'classify' && question.type !== 'group-property');
  const showMasses = answered || question.type !== 'order-by-mass';

  // Periodic table (reference, non-interactive)
  const table = (
    <div className="bg-white rounded-xl shadow-lg p-2 sm:p-4 mb-3 phone:mb-2 phone:p-2 max-md:phone-land:col-start-2 max-md:phone-land:row-start-1 max-md:phone-land:row-span-2">
      <p className="text-xs text-warm-500 mb-2 text-center phone:mb-1">
        {showCategories && showMasses
          ? 'Lotukerfið til hliðsjónar — staðsetningin segir þér mest.'
          : showCategories
            ? 'Meðalatómmassinn er falinn þangað til þú hefur svarað — notaðu regluna um sætistöluna.'
            : 'Flokkalitirnir eru faldir þangað til þú hefur svarað — notaðu staðsetninguna.'}
      </p>
      <PeriodicTable
        highlightedElements={highlightSet}
        interactive={false}
        showCategories={showCategories}
        showMasses={showMasses}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-2 sm:p-4 phone:p-2">
      <div className="max-w-6xl mx-auto">
        {/* Header: one short row on a phone (design P4) */}
        <div className="bg-white rounded-xl shadow-md p-3 sm:p-4 mb-3 phone:py-2 phone:mb-2">
          <div className="flex justify-between items-center gap-2 phone:gap-3">
            <button
              onClick={onBack}
              className="text-warm-500 hover:text-warm-700 font-semibold text-sm whitespace-nowrap pointer-coarse:py-3 pointer-coarse:-my-3 phone:shrink-0"
            >
              ← Til baka
            </button>
            <h1 className="min-w-0 text-center text-base sm:text-lg font-bold text-warm-800 phone:flex-1 phone:text-sm">
              Flokkar og lotubundnir eiginleikar
            </h1>
            <span className="text-sm font-semibold text-warm-600 phone:shrink-0">
              {index + 1}/{TOTAL}
            </span>
          </div>
          <div className="mt-2 h-2 bg-warm-200 rounded-full overflow-hidden phone:mt-1.5 phone:h-1.5">
            <div
              className="h-full bg-kvenno-orange progress-fill"
              style={{ width: `${((index + 1) / TOTAL) * 100}%` }}
            />
          </div>
        </div>

        {/* A phone on its side (below md, where the table scrolls sideways): the
            question and the options | the table, with the feedback across both
            below them. The second row takes the table's extra height, so the
            options sit right under the question. Everywhere else a plain block,
            so nothing moves. */}
        <div className="max-md:phone-land:grid max-md:phone-land:grid-cols-2 max-md:phone-land:grid-rows-[auto_1fr] max-md:phone-land:gap-x-3 max-md:phone-land:items-start">
          {/* Question */}
          <div
            ref={itemRef}
            className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-3 text-center animate-fade-in-up phone:p-3 phone:mb-2"
            key={index}
          >
            <p data-item-start className="text-lg sm:text-xl font-bold text-warm-800 phone:text-lg">
              {question.text}
            </p>
            {!answered && !showHint && (
              <button
                onClick={() => setShowHint(true)}
                className="mt-3 phone:mt-2 text-sm px-4 py-2 pointer-coarse:min-h-11 rounded-full bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-yellow-400 outline-none"
              >
                💡 Vísbending
              </button>
            )}
            {!answered && showHint && (
              <div
                ref={hintRef}
                className="mt-3 phone:mt-2 bg-yellow-50 border-2 border-yellow-200 rounded-xl p-3 text-sm text-yellow-900 text-left"
              >
                <span className="font-bold">Vísbending:</span> {hintFor(question)}
              </div>
            )}
          </div>

          {phone && table}

          {/* Options */}
          <div
            ref={optionsRef}
            className={`grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3 max-w-2xl mx-auto phone:gap-2 phone:mb-2 max-md:phone-land:col-start-1 max-md:phone-land:w-full ${optionsTwoUp(question.options) ? 'phone:grid-cols-2' : 'phone:grid-cols-1'}`}
          >
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
                  onClick={armedAnswer(() => handleOptionClick(option))}
                  disabled={answered}
                  className={`p-3 sm:p-4 phone:p-3 rounded-xl border-2 font-medium text-sm sm:text-base transition-all text-left ${optionClass}`}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {!phone && table}

          {/* Feedback */}
          {answered && (
            <div
              ref={feedbackBoxRef}
              className="space-y-3 mb-3 max-w-2xl mx-auto animate-fade-in-up max-md:phone-land:col-span-2 max-md:phone-land:w-full"
            >
              {/* The region focus moves to after an answer. FeedbackPanel keeps
                its own role="alert". */}
              <div ref={feedbackRef} tabIndex={-1} role="group">
                <FeedbackPanel
                  feedback={{
                    isCorrect,
                    explanation: question.explanation,
                    // Renders outside the collapsible explanation, so it is the one
                    // thing a student who reads nothing else still sees.
                    misconception: isCorrect ? undefined : level2Misconception(question.type),
                  }}
                  config={{ showExplanation: true }}
                />
              </div>
              <button
                key="next"
                ref={nextRef}
                onClick={armed(handleNext)}
                className="w-full bg-kvenno-orange hover:bg-kvenno-orange-dark text-white font-bold py-3 rounded-xl transition-colors"
              >
                {index + 1 < TOTAL ? 'Næsta spurning →' : 'Sjá niðurstöður →'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Level2;
