import { useState, useEffect, useLayoutEffect, useMemo, useRef, useCallback } from 'react';

import {
  Header,
  InteractiveGraph,
  ErrorBoundary,
  Presence,
  FadePresence,
  PhoneDisclosure,
} from '@shared/components';
import type {
  DataPoint,
  DataSeries,
  MarkerConfig,
  RegionConfig,
  VerticalLineConfig,
} from '@shared/components';
import { useGameProgress } from '@shared/hooks';
import {
  focusTarget,
  formatDecimal,
  isPhone,
  revealSpan,
  revealTop,
  useArmedAfter,
  useIsPhone,
  usableArea,
} from '@shared/utils';

import { EntropyVisualization } from './components/EntropyVisualization';
import { PROBLEMS } from './data';
import type { Difficulty, GameMode, Spontaneity, Problem } from './types';
import { practiceDeck } from './utils/deck';
import { formatRounded } from './utils/format';
import { toggleSign } from './utils/sign';
import {
  calculateDeltaG,
  crossoverTemperature,
  deltaGAxisHalfRange,
  getSpontaneity,
  isDeltaGCorrect,
} from './utils/thermo-calculations';

/** How long the answer card takes to leave once an answer is checked (its Presence exit). */
const ANSWER_CARD_EXIT_MS = 250;

/**
 * Height of the feedback box's first line of text (border, padding and the verdict) —
 * if that much of it is not on screen, the student cannot see whether they were right.
 */
const FEEDBACK_VERDICT_PX = 60;

/** Which screen a mode shows: the two runs share one. */
type Screen = 'menu' | 'discover' | 'game';
const screenOf = (mode: GameMode): Screen =>
  mode === 'menu' ? 'menu' : mode === 'discover' ? 'discover' : 'game';

/** The top of the page, at once and at every width — what `window.scrollTo(0, 0)` did. */
const toPageTop = () =>
  revealTop(document.documentElement, { anyWidth: true, always: true, gap: 0, instant: true });

/** Right answers out of the problems in one Æfingarhamur round. */
interface RoundResult {
  correct: number;
  total: number;
}

/**
 * What the game remembers between visits, under `thermodynamics-predictor-progress`.
 *
 * Points and streaks belong to Keppnishamur only (mobile-pass decision 1 (b)): an
 * Æfingarhamur round reports `N af M rétt`, and Keppnishamur keeps a best run. Progress saved
 * before that change held a `score` that was never reset and that both modes added to, so
 * Keppnishamur started from a lifetime total; its `highScore`, `bestStreak` and
 * `problemsCompleted` mixed the modes too. None of it is read.
 */
interface ThermoProgress {
  /** The best finished Æfingarhamur round at each difficulty. */
  practice?: Partial<Record<Difficulty, RoundResult>>;
  /** The best Keppnishamur run at each difficulty, in points. */
  challengeBest?: Partial<Record<Difficulty, number>>;
  /** The longest run of right answers in any Keppnishamur run. */
  challengeBestStreak?: number;
}

const DEFAULT_PROGRESS: ThermoProgress = {};

const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'] as const;

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  beginner: '🟢 Auðvelt',
  intermediate: '🟡 Miðlungs',
  advanced: '🔴 Erfitt',
};

function App() {
  const [mode, setMode] = useState<GameMode>('menu');
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [temperature, setTemperature] = useState(298);
  const [userDeltaG, setUserDeltaG] = useState('');
  const [userSpontaneity, setUserSpontaneity] = useState<Spontaneity | ''>('');
  const [showSolution, setShowSolution] = useState(false);
  const [feedback, setFeedback] = useState('');
  // Whether the checked answer was right. The feedback box took its colour from
  // `feedback.includes('Rétt')`, and the half-right messages say "Rétt svar: …", so a wrong
  // answer was boxed in the green of a right one.
  const [answeredCorrectly, setAnsweredCorrectly] = useState(false);
  // Which question of this run is on screen. This was the stored count of correct answers
  // plus one, which neither rose on a wrong answer nor started at 1 on a return visit.
  const [questionNumber, setQuestionNumber] = useState(0);
  const {
    progress,
    updateProgress,
    resetProgress: resetStoredProgress,
  } = useGameProgress<ThermoProgress>('thermodynamics-predictor-progress', DEFAULT_PROGRESS);
  const [streak, setStreak] = useState(0);
  // Keppnishamur's points, for the run being played: every run starts from 0.
  const [runScore, setRunScore] = useState(0);
  // Æfingarhamur plays a difficulty as a round, every problem once, then `N af M rétt`.
  const [deck, setDeck] = useState<Problem[]>([]);
  const [round, setRound] = useState<RoundResult>({ correct: 0, total: 0 });
  /** The finished round, once its last problem is answered. */
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null);
  const [timeLeft, setTimeLeft] = useState(90);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const shownMode = useRef(mode);
  // The mode the student last left for the menu, whose start button the menu brings back.
  const leftMode = useRef<GameMode | null>(null);

  // Each mode is its own screen: open it at the top, at every width, as it always has. The
  // menu is long on a phone, so without this a student who taps a mode at its foot lands in
  // the middle of the next screen. Only on a change of mode, so loading the page leaves the
  // browser's own scrolling alone. A layout effect, so the new screen never paints at the
  // old offset.
  useLayoutEffect(() => {
    if (shownMode.current === mode) return;
    if (mode === 'menu') leftMode.current = shownMode.current;
    shownMode.current = mode;
    toPageTop();
  }, [mode]);

  // Focus follows each screen swap, since the button that caused it has gone with the old
  // screen and focus would otherwise fall to <body> (design P3): a mode focuses its heading —
  // the problem's name in a run — and back on the menu the mode just left, brought on screen
  // on a phone together with the difficulty choice above it. Nothing on the initial load.
  //
  // The screens fade (FadePresence), which mounts the new one a render after `mode` changes,
  // so this usually runs as the new screen's root attaches. A screen shown again before its
  // fade-out ended never unmounted, so the swap itself runs it for that one.
  const screen: Screen = screenOf(mode);
  const lastShown = useRef<Screen>(screen);
  const shownScreen = useRef<Screen>(screen);
  shownScreen.current = screen;
  const roots = useRef<Partial<Record<Screen, HTMLElement>>>({});
  const shownRef = useRef<(which: Screen, root: HTMLElement) => void>(() => {});
  shownRef.current = (which, root) => {
    if (lastShown.current === which) return;
    lastShown.current = which;
    if (which === 'menu') {
      const start = leftMode.current
        ? root.querySelector<HTMLElement>(`[data-mode-start="${leftMode.current}"]`)
        : null;
      revealSpan(start, [root.querySelector('[data-difficulty-chooser]'), start]);
      focusTarget(start);
    } else {
      focusTarget(root.querySelector<HTMLElement>('[data-item-start]'));
    }
  };
  const attach = useCallback((which: Screen, el: HTMLDivElement | null) => {
    if (!el) {
      delete roots.current[which];
      return;
    }
    roots.current[which] = el;
    if (shownScreen.current === which) shownRef.current(which, el);
  }, []);
  const menuRoot = useCallback((el: HTMLDivElement | null) => attach('menu', el), [attach]);
  const discoverRoot = useCallback((el: HTMLDivElement | null) => attach('discover', el), [attach]);
  const gameRoot = useCallback((el: HTMLDivElement | null) => attach('game', el), [attach]);
  useLayoutEffect(() => {
    const root = roots.current[screen];
    if (root) shownRef.current(screen, root);
  }, [screen]);

  // "Næsta spurning" sits at the foot of the solution; the new problem opens at the top of
  // the page, at every width as before, with its name focused. A new run is a screen swap,
  // handled above.
  const shownQuestion = useRef(questionNumber);
  useLayoutEffect(() => {
    if (shownQuestion.current === questionNumber) return;
    shownQuestion.current = questionNumber;
    const root = roots.current.game;
    if (!root || lastShown.current !== 'game') return;
    toPageTop();
    focusTarget(root.querySelector<HTMLElement>('[data-item-start]'));
  }, [questionNumber]);

  // Once an answer is checked the solution takes the answer card's place; the verdict has to
  // be seen, or tapping "Athuga svar" would seem to show a solution without saying whether
  // the answer was right. When the challenge timer runs out the student may be scrolled away
  // from it altogether. After the answer card has left and the layout has settled:
  // - on a phone the verdict box comes on screen whole, "Næsta spurning" with it where it
  //   fits (design P2); a verdict too tall for the screen is brought to the top to be read;
  // - on a wider screen, exactly as before: only when its first line is not on screen, by
  //   the least scroll that shows it.
  // Either way focus moves to the verdict box (design P3), not to Næsta, so a second Enter
  // or tap cannot skip it.
  useEffect(() => {
    if (!showSolution || !feedback) return;
    const timer = window.setTimeout(() => {
      const box = feedbackRef.current;
      if (!box) return;
      if (isPhone()) {
        revealSpan(nextRef.current ?? box, [box]);
      } else {
        const { top } = box.getBoundingClientRect();
        const area = usableArea();
        if (top < area.top || top + FEEDBACK_VERDICT_PX > area.bottom) {
          revealSpan(box, [], { anyWidth: true, gap: 0 });
        }
      }
      focusTarget(box);
    }, ANSWER_CARD_EXIT_MS + 50);
    return () => window.clearTimeout(timer);
  }, [showSolution, feedback]);

  // "Athuga svar" opened the verdict. A press on Næsta within 400 ms of it appearing is the
  // second half of a double tap, not a decision, and is dropped (design P3).
  const armed = useArmedAfter(400, showSolution);
  // The phone-only copy of the Keppnishamur clock exists only on a phone, so desktop and
  // screen readers never meet a second clock (design §3: no twins).
  const phone = useIsPhone();

  const resetProgress = () => {
    resetStoredProgress();
    setStreak(0);
  };

  /** Open a problem. */
  const showProblem = (problem: Problem) => {
    setCurrentProblem(problem);
    setTemperature(problem.defaultTemp);
    setUserDeltaG('');
    setUserSpontaneity('');
    setShowSolution(false);
    setFeedback('');
    setAnsweredCorrectly(false);
    setQuestionNumber((n) => n + 1);
    // Every new problem gets a full clock. This was reset only when `mode` read 'challenge',
    // but entering a mode calls this in the same click as `setMode`, while `mode` still reads
    // the screen being left — so a new Keppnishamur run kept the old run's remaining seconds,
    // and a run that had timed out started at 0. The clock only runs in Keppnishamur.
    setTimeLeft(90);
  };

  /** A Keppnishamur problem, drawn at random from the chosen difficulty. */
  const randomProblem = () => {
    const problems = PROBLEMS[difficulty];
    return problems[Math.floor(Math.random() * problems.length)];
  };

  /** Open Æfingarhamur or Keppnishamur at its first question. */
  const startRun = (next: 'learning' | 'challenge') => {
    setMode(next);
    setQuestionNumber(0);
    if (next === 'challenge') {
      setStreak(0);
      setRunScore(0);
      showProblem(randomProblem());
    } else {
      const newDeck = practiceDeck(PROBLEMS[difficulty]);
      setDeck(newDeck);
      setRound({ correct: 0, total: 0 });
      setRoundResult(null);
      showProblem(newDeck[0]);
    }
  };

  /** Næsta spurning: the round's next problem, or a new draw in Keppnishamur. */
  const nextProblem = () => {
    if (mode === 'learning') {
      showProblem(deck[Math.min(questionNumber, deck.length - 1)]);
    } else {
      showProblem(randomProblem());
    }
  };

  // Calculate ΔG for the current problem at a given temperature
  const calcDeltaGForProblem = (temp: number): number => {
    if (!currentProblem) return 0;
    return calculateDeltaG(currentProblem.deltaH, currentProblem.deltaS, temp);
  };

  // Get scenario description
  const getScenarioDescription = (scenario: number): string => {
    const descriptions: Record<number, string> = {
      1: 'Alltaf sjálfgengt (ΔH<0, ΔS>0 eða ΔH<<0)',
      2: 'Aldrei sjálfgengt (ΔH>0, ΔS<0)',
      3: 'Sjálfgengt við lágt hitastig (ΔH<0, ΔS<0)',
      4: 'Sjálfgengt við hátt hitastig (ΔH>0, ΔS>0)',
    };
    return descriptions[scenario] || '';
  };

  /**
   * Build a conceptual "why" sentence for the current scenario + temperature.
   * Helps students connect the correct answer back to the ΔH/ΔS sign pattern rather than just memorizing the formula.
   */
  const buildSpontaneityReasoning = (): string => {
    if (!currentProblem) return '';
    const { deltaS, scenario } = currentProblem;
    const TdeltaS = (temperature * deltaS) / 1000;
    switch (scenario) {
      case 1:
        return `ΔH er neikvætt (efnahvarfið losar varma) og ΔS er jákvætt (óreiða eykst). Báðir þættir styðja sjálfgengi — þess vegna er þetta hvarf alltaf sjálfgengt óháð hitastigi.`;
      case 2:
        return `ΔH er jákvætt (efnahvarfið þarf varma) og ΔS er neikvætt (óreiða minnkar). Báðir þættir andmæla sjálfgengi — þess vegna er þetta hvarf aldrei sjálfgengt óháð hitastigi.`;
      case 3:
        return `ΔH er neikvætt (styður sjálfgengi) en ΔS er neikvætt (andmælir). Við ${temperature} K vegur TΔS = ${formatRounded(TdeltaS, 1)} kJ/mól. Ef |ΔH| > |TΔS|, þá vinnur varminn og hvarfið er sjálfgengt. Þess vegna eru svona hvörf sjálfgeng við lágt hitastig en ekki við hátt.`;
      case 4:
        return `ΔH er jákvætt (andmælir sjálfgengi) en ΔS er jákvætt (styður). Við ${temperature} K vegur TΔS = ${formatRounded(TdeltaS, 1)} kJ/mól. Ef TΔS > ΔH, þá vinnur óreiða og hvarfið er sjálfgengt. Þess vegna eru svona hvörf ekki sjálfgeng við lágt hitastig en verða sjálfgeng við nógu hátt.`;
      default:
        return '';
    }
  };

  // Check answer
  const checkAnswer = () => {
    const calculatedDeltaG = calcDeltaGForProblem(temperature);
    const correctSpontaneity = getSpontaneity(calculatedDeltaG);

    const deltaGCorrect = isDeltaGCorrect(userDeltaG, calculatedDeltaG);
    const spontaneityCorrect = userSpontaneity === correctSpontaneity;
    const right = deltaGCorrect && spontaneityCorrect;
    setAnsweredCorrectly(right);

    // Æfingarhamur counts the answer towards the round and scores nothing. Nothing in it shows
    // the answer before it is given except the live ΔG° panel, which is decision 109's
    // question, not this one; a right answer counts.
    if (mode === 'learning') {
      const nextRound = { correct: round.correct + (right ? 1 : 0), total: round.total + 1 };
      setRound(nextRound);
      if (nextRound.total >= deck.length) {
        setRoundResult(nextRound);
        const best = progress.practice?.[difficulty];
        if (!best || best.total !== nextRound.total || nextRound.correct >= best.correct) {
          updateProgress({ practice: { ...progress.practice, [difficulty]: nextRound } });
        }
      }
    }

    if (right && mode === 'challenge') {
      const points = 100 + streak * 10;
      const newStreak = streak + 1;
      setStreak(newStreak);
      const newScore = runScore + points;
      setRunScore(newScore);
      updateProgress({
        challengeBest: {
          ...progress.challengeBest,
          [difficulty]: Math.max(progress.challengeBest?.[difficulty] ?? 0, newScore),
        },
        challengeBestStreak: Math.max(progress.challengeBestStreak ?? 0, newStreak),
      });
      setFeedback(`Rétt! +${points} stig`);
    } else if (right) {
      setFeedback('Rétt!');
    } else {
      setStreak(0);
      const reasoning = buildSpontaneityReasoning();
      if (!deltaGCorrect && !spontaneityCorrect) {
        setFeedback(`Rangt. Bæði ΔG útreikningur og sjálfgengi eru röng. ${reasoning}`);
      } else if (!deltaGCorrect) {
        setFeedback(
          `Sjálfgengi er rétt en ΔG er rangt. Rétt svar: ${formatRounded(calculatedDeltaG, 1)} kJ/mól`
        );
      } else {
        const spontaneityText =
          correctSpontaneity === 'spontaneous'
            ? 'Sjálfgengt'
            : correctSpontaneity === 'equilibrium'
              ? 'Jafnvægi'
              : 'Ekki sjálfgengt';
        setFeedback(
          `ΔG er rétt en sjálfgengi er rangt. Rétt svar: ${spontaneityText}. ${reasoning}`
        );
      }
    }
    setShowSolution(true);
  };

  // Generate graph data for InteractiveGraph
  const graphData = useMemo(() => {
    if (!currentProblem) return null;

    const deltaH = currentProblem.deltaH;
    const deltaS = currentProblem.deltaS / 1000;
    const tempRange = { min: 200, max: 1200 };
    const yHalf = deltaGAxisHalfRange(
      currentProblem.deltaH,
      currentProblem.deltaS,
      tempRange.min,
      tempRange.max
    );

    // Generate curve data points
    const dataPoints: DataPoint[] = [];
    for (let t = tempRange.min; t <= tempRange.max; t += 10) {
      const deltaG = deltaH - t * deltaS;
      dataPoints.push({ x: t, y: deltaG });
    }

    const series: DataSeries[] = [
      {
        id: 'deltaG',
        data: dataPoints,
        color: '#f36b22',
        lineWidth: 3,
        label: 'ΔG°',
      },
    ];

    // Spontaneity regions
    const regions: RegionConfig[] = [
      {
        yMin: -yHalf,
        yMax: 0,
        color: 'rgba(34, 197, 94, 0.1)',
        label: 'Sjálfgengt',
        labelPosition: 'left',
      },
      {
        yMin: 0,
        yMax: yHalf,
        color: 'rgba(239, 68, 68, 0.1)',
        label: 'Ekki sjálfgengt',
        labelPosition: 'left',
      },
    ];

    // Current temperature marker
    const currentDeltaG = calcDeltaGForProblem(temperature);
    const markers: MarkerConfig[] = [
      {
        x: temperature,
        y: currentDeltaG,
        color: currentDeltaG < 0 ? '#22c55e' : '#ef4444',
        radius: 6,
        label: `${formatRounded(currentDeltaG, 0)} kJ/mól`,
      },
    ];

    // Crossover temperature line
    const verticalLines: VerticalLineConfig[] = [];
    const crossTemp = crossoverTemperature(currentProblem.deltaH, currentProblem.deltaS);
    if (crossTemp !== null && crossTemp >= tempRange.min && crossTemp <= tempRange.max) {
      verticalLines.push({
        x: crossTemp,
        color: '#8b5cf6',
        lineDash: [5, 5],
        label: `T_cross = ${formatRounded(crossTemp, 0)} K`,
        labelPosition: 'bottom',
      });
      // Add crossover point marker
      markers.push({
        x: crossTemp,
        y: 0,
        color: '#8b5cf6',
        radius: 8,
        label: 'ΔG = 0',
      });
    }

    return { series, regions, markers, verticalLines, yHalf };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: calcDeltaGForProblem is derived from currentProblem
  }, [currentProblem, temperature]);

  // Timer for challenge mode. Only Keppnishamur runs out of time: this used to fire in any
  // mode once the clock read 0, so after one timed-out challenge every Æfingarhamur problem
  // opened already marked "Tíminn rann út!".
  useEffect(() => {
    if (mode !== 'challenge' || showSolution) return;
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
    setFeedback('Tíminn rann út!');
    setAnsweredCorrectly(false);
    setShowSolution(true);
    setStreak(0);
  }, [mode, timeLeft, showSolution]);

  const hasProgress =
    Object.keys(progress.practice ?? {}).length > 0 ||
    Object.keys(progress.challengeBest ?? {}).length > 0;

  const renderMenu = () => (
    <div ref={menuRoot}>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
        <Header variant="game" backHref="/efnafraedi/3-ar/" gameTitle="Varmafræði spámaður" />
        <div className="min-h-screen py-8 phone:py-3">
          <a
            href="#game-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:rounded focus:shadow-lg focus:text-orange-600 focus:font-bold"
          >
            Fara í efni
          </a>
          <div className="max-w-4xl mx-auto px-4">
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-8 phone:p-3" id="game-content">
              <p className="text-warm-600 mb-4 phone:mb-3">
                Lærðu um Gibbs frjálsa orku og sjálfgengi efnahvarfa
              </p>

              {/* Progress: each difficulty's best Æfingarhamur round as `N af M rétt`, and
                  points only for Keppnishamur (mobile-pass decision 1 (b)). */}
              {hasProgress && (
                <div className="mb-8 bg-warm-50 p-4 rounded-lg phone:mb-4 phone:p-3">
                  <div className="flex justify-between items-center mb-3 phone:mb-2">
                    <h3 className="font-semibold text-warm-700">Framvinda</h3>
                    <button
                      onClick={resetProgress}
                      className="text-sm text-warm-500 hover:text-red-500 transition-colors pointer-coarse:py-3 pointer-coarse:-my-3"
                    >
                      Endurstilla
                    </button>
                  </div>
                  {/* Below sm each difficulty is a row (label left, results right). */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-center phone:gap-1.5">
                    {DIFFICULTIES.map((level) => {
                      const round = progress.practice?.[level];
                      const best = progress.challengeBest?.[level];
                      return (
                        <div
                          key={level}
                          className="bg-white rounded-lg p-3 flex items-center justify-between gap-3 sm:block phone:px-3 phone:py-1.5"
                        >
                          <div className="text-sm text-warm-600">{DIFFICULTY_LABEL[level]}</div>
                          <div className="text-right sm:text-center sm:mt-1">
                            <div className="font-bold text-green-700 whitespace-nowrap">
                              {round ? `${round.correct} af ${round.total} rétt` : '—'}
                            </div>
                            {best !== undefined && (
                              <div className="text-xs text-orange-700 whitespace-nowrap">
                                Keppnismet: {best} stig
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {(progress.challengeBestStreak ?? 0) > 0 && (
                    <p className="mt-2 text-sm text-warm-600 text-center">
                      🔥 Besta röð (Keppnishamur): {progress.challengeBestStreak}
                    </p>
                  )}
                </div>
              )}

              {/* Conceptual derivation of ΔG = ΔH - TΔS */}
              <div className="mb-8 p-4 sm:p-6 bg-blue-50 rounded-lg space-y-4 phone:mb-4 phone:p-3 phone:space-y-3">
                <h2 className="text-xl font-bold text-blue-800">
                  Af hverju <span className="whitespace-nowrap">ΔG = ΔH − TΔS?</span>
                </h2>

                <p className="text-sm text-blue-700">
                  Til að spá fyrir um hvort hvörf gerist sjálfkrafa (sjálfgengt) þurfum við að skoða{' '}
                  <strong>tvo drifkrafta</strong>:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-white p-3 rounded-lg">
                    <strong className="text-red-700">ΔH (vermi)</strong>
                    <p className="text-sm text-warm-700 mt-1">
                      Efni vilja losa orku → ΔH &lt; 0 er hagstætt.
                      <br />
                      (Eins og bolti sem vill rúlla niður hæð)
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <strong className="text-purple-700">ΔS (óreiða)</strong>
                    <p className="text-sm text-warm-700 mt-1">
                      Náttúran stefnir í meiri óreiðu → ΔS &gt; 0 er hagstætt.
                      <br />
                      (Eins og herbergi sem verður alltaf ósnyrtilegra)
                    </p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800 mb-2">
                    <strong>Gibbs</strong> sameinaði hvort tveggja í eina jöfnu:
                  </p>
                  <p className="font-mono text-lg text-center text-blue-900">ΔG = ΔH − TΔS</p>
                  <div className="text-xs text-blue-600 mt-2 space-y-1">
                    <p>
                      • Ef ΔG &lt; 0 → hvörfin eru <strong>sjálfgeng</strong> (geta gerst
                      sjálfkrafa)
                    </p>
                    <p>
                      • Ef ΔG &gt; 0 → hvörfin eru <strong>ekki sjálfgeng</strong>
                    </p>
                    <p>
                      • Ef ΔG = 0 → kerfið er í <strong>jafnvægi</strong>
                    </p>
                  </div>
                </div>

                <div className="bg-amber-50 p-3 rounded-lg text-sm text-amber-800">
                  <strong>Hlutverk hitastigs:</strong> T margfaldar ΔS. Við hátt hitastig ráða
                  óreiðuáhrif meiru (TΔS stórt). Við lágt hitastig ráða orkuáhrifin (ΔH). Þess vegna
                  geta sum hvörf verið sjálfgeng aðeins við ákveðið hitastig.
                </div>
              </div>

              <div className="mb-8 phone:mb-4" data-difficulty-chooser>
                <h3 className="text-lg font-bold mb-4 phone:mb-2">Veldu erfiðleikastig:</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 phone:gap-2 phone-land:grid-cols-3">
                  <button
                    onClick={() => setDifficulty('beginner')}
                    className={`p-4 rounded-lg border-2 transition phone:px-3 phone:py-2 phone:flex phone:flex-wrap phone:items-baseline phone:gap-x-2 ${
                      difficulty === 'beginner'
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-warm-300 hover:border-orange-300'
                    }`}
                  >
                    <div className="text-lg font-bold">🟢 Auðvelt</div>
                    <div className="text-sm text-warm-600">Einföld hvarfefni</div>
                  </button>
                  <button
                    onClick={() => setDifficulty('intermediate')}
                    className={`p-4 rounded-lg border-2 transition phone:px-3 phone:py-2 phone:flex phone:flex-wrap phone:items-baseline phone:gap-x-2 ${
                      difficulty === 'intermediate'
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-warm-300 hover:border-orange-300'
                    }`}
                  >
                    <div className="text-lg font-bold">🟡 Miðlungs</div>
                    <div className="text-sm text-warm-600">Iðnaðarhvarfefni</div>
                  </button>
                  <button
                    onClick={() => setDifficulty('advanced')}
                    className={`p-4 rounded-lg border-2 transition phone:px-3 phone:py-2 phone:flex phone:flex-wrap phone:items-baseline phone:gap-x-2 ${
                      difficulty === 'advanced'
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-warm-300 hover:border-orange-300'
                    }`}
                  >
                    <div className="text-lg font-bold">🔴 Erfitt</div>
                    <div className="text-sm text-warm-600">Háþróaðir útreikningar</div>
                  </button>
                </div>
              </div>

              {/* Discover button (recommended first step) */}
              <button
                onClick={() => setMode('discover')}
                data-mode-start="discover"
                className="game-card w-full p-5 rounded-lg text-white font-bold text-lg transition mb-4 phone:px-4 phone:py-3 phone:mb-2"
                style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}
              >
                🔬 Könnun — sjáðu hvernig ΔG breytist með hitastigi
                <div className="text-sm font-normal mt-1 phone:mt-0.5">
                  Byrjaðu hér — stillanlegur hita-sleði og rauntíma-útreikningur
                </div>
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 phone:gap-2 phone-land:grid-cols-2">
                <button
                  onClick={() => startRun('learning')}
                  data-mode-start="learning"
                  className="game-card p-6 rounded-lg text-white font-bold text-lg transition phone:px-4 phone:py-3"
                  style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' }}
                >
                  📖 Æfingarhamur
                  <div className="text-sm font-normal mt-1 phone:mt-0.5">Ótakmarkaður tími</div>
                </button>
                <button
                  onClick={() => startRun('challenge')}
                  data-mode-start="challenge"
                  className="game-card p-6 rounded-lg text-white font-bold text-lg transition phone:px-4 phone:py-3"
                  style={{ background: 'linear-gradient(135deg, #f36b22 0%, #d95a1a 100%)' }}
                >
                  ⚡ Keppnishamur
                  <div className="text-sm font-normal mt-1 phone:mt-0.5">
                    90 sek tími, stigagjöf
                  </div>
                </button>
              </div>
            </div>

            {/* Why this matters + curriculum */}
            <div className="mt-6 bg-amber-50 p-4 rounded-lg border border-amber-200 phone:mt-3 phone:p-3">
              <h3 className="font-semibold text-amber-800 mb-2">Af hverju varmafræði?</h3>
              <p className="text-sm text-amber-700">
                ΔG segir okkur hvort efnahvörf GETA gerst sjálfkrafa — ekki bara hvort þau losa
                orku. Þetta útskýrir af hverju ís bráðnar, af hverju salt leysist í vatni, og
                hvernig lífverur nýta orku.
              </p>
            </div>
            <div className="mt-3 text-center text-xs text-warm-500">
              <strong>Námsleiðin:</strong> Gaslögmál → Jafnvægisfastinn → Hliðrun jafnvægis →
              Sýrufastinn → <u>Varmafræði</u> → pH Títrun → Stuðpúðar → Leysnijafnvægi
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  /**
   * Discover mode — interactive warm-up.
   * Uses a canonical scenario 3 reaction (CH₄ combustion: ΔH=-802, ΔS=-5, crossover ≈ 160400 K — artificially low ΔS).
   * Students slide the temperature to watch ΔG flip sign at the crossover temperature; this builds the
   * intuition that temperature modulates the TΔS term before any graded problems appear.
   */
  const renderDiscover = () => {
    // Canonical scenario 3 demo: ΔH=-100 kJ/mol, ΔS=-200 J/(mol·K) → crossover at 500 K.
    const demoDeltaH = -100;
    const demoDeltaS = -200; // J/(mol·K)
    const demoT = temperature;
    const demoDeltaG = demoDeltaH - (demoT * demoDeltaS) / 1000;
    const demoCrossover = Math.abs(demoDeltaH / (demoDeltaS / 1000));
    // The same verdict the graded problems use, so ΔG = 0 at 500 K reads as equilibrium: a
    // plain `< 0` test called it "Ekki sjálfgengt — ΔG > 0" at the one temperature the
    // "Hvað sést?" list below says is equilibrium.
    const demoSpontaneity = getSpontaneity(demoDeltaG);
    return (
      <div
        ref={discoverRoot}
        className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-4 md:p-8 phone:p-3"
      >
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 space-y-5 phone:p-3 phone:space-y-3">
          <button
            onClick={() => setMode('menu')}
            className="text-warm-600 hover:text-warm-800 text-sm pointer-coarse:py-3 pointer-coarse:-mt-3 pointer-coarse:mb-2"
          >
            {/* 44 px tall on touch. Only the top padding is pulled back: a bottom -my-3 would also
                cancel space-y-5's gap and seat the heading against this link. */}
            ← Til baka í valmynd
          </button>
          <h2 data-item-start className="text-2xl font-bold text-indigo-700 phone:text-xl">
            🔬 Könnun: hvernig hitastig hefur áhrif á ΔG
          </h2>
          <p className="text-warm-700">
            Hér er dæmi um efnahvarf sem losar varma (ΔH = −100 kJ/mól) en óreiða minnkar (ΔS = −200
            J/(mól·K)). Dragðu hitastigs-sleðann og sjáðu hvernig ΔG breytist.
          </p>

          {/* On a phone the ΔG° result comes before the slider (CSS order: both blocks moved are
              plain text), so the thumb and what it changes share the screen. */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 sm:p-6 rounded-xl border border-indigo-200 phone:p-3 phone:flex phone:flex-col">
            {/* One column below sm: side by side, "(vermibreyting)" and "J/(mol·K)" split mid-word. */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 text-center phone:-order-2 phone:gap-2 phone:mb-3 phone-land:grid-cols-2">
              <div className="bg-red-50 p-3 rounded-lg border border-red-200 phone:p-2">
                <div className="text-xs text-red-700 font-semibold">ΔH° (vermibreyting)</div>
                <div className="text-2xl font-bold text-red-800 phone:text-xl">
                  {demoDeltaH} kJ/mól
                </div>
                <div className="text-xs text-red-600 mt-1">Losun varma → styður sjálfgengi</div>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg border border-purple-200 phone:p-2">
                <div className="text-xs text-purple-700 font-semibold">ΔS° (óreiðubreyting)</div>
                <div className="text-2xl font-bold text-purple-800 phone:text-xl">
                  {demoDeltaS} J/(mól·K)
                </div>
                <div className="text-xs text-purple-600 mt-1">Minni óreiða → andmælir</div>
              </div>
            </div>

            <label htmlFor="thermo-discover-temp" className="block font-semibold mb-2">
              🌡️ Hitastig: {demoT} K ({demoT - 273}°C)
            </label>
            <input
              id="thermo-discover-temp"
              type="range"
              min={200}
              max={1200}
              value={demoT}
              onChange={(e) => setTemperature(parseInt(e.target.value, 10))}
              className="w-full mb-2"
              aria-valuetext={`${demoT} Kelvin`}
            />
            <div className="flex justify-between text-xs text-warm-500">
              <span>200 K</span>
              <span>1200 K</span>
            </div>

            <div
              className={`mt-4 p-4 rounded-lg border-2 phone:-order-1 phone:mt-0 phone:mb-3 phone:p-3 ${
                demoSpontaneity === 'spontaneous'
                  ? 'bg-green-50 border-green-500 text-green-900'
                  : demoSpontaneity === 'equilibrium'
                    ? 'bg-yellow-50 border-yellow-500 text-yellow-900'
                    : 'bg-red-50 border-red-500 text-red-900'
              }`}
            >
              <div className="font-bold text-sm">
                {/* Unbroken on a phone: the line otherwise splits between ")(" at 375 px.
                    The wrapper exists only there, so a desktop window renders the
                    line exactly as it did. */}
                {phone ? (
                  <>
                    ΔG° = ΔH° − TΔS° = {demoDeltaH}{' '}
                    <span className="whitespace-nowrap">
                      − ({demoT})({formatDecimal(demoDeltaS / 1000)})
                    </span>{' '}
                    ={' '}
                  </>
                ) : (
                  <>
                    ΔG° = ΔH° − TΔS° = {demoDeltaH} − ({demoT})({formatDecimal(demoDeltaS / 1000)})
                    ={' '}
                  </>
                )}
                <span className="text-xl whitespace-nowrap">
                  {formatRounded(demoDeltaG, 1)} kJ/mól
                </span>
              </div>
              <div className="mt-1 text-sm">
                {demoSpontaneity === 'spontaneous' && (
                  <>
                    ✓ <strong>Sjálfgengt</strong> — ΔG &lt; 0
                  </>
                )}
                {demoSpontaneity === 'equilibrium' && (
                  <>
                    ⚖️ <strong>Jafnvægi</strong> — ΔG ≈ 0
                  </>
                )}
                {demoSpontaneity === 'non-spontaneous' && (
                  <>
                    ✗ <strong>Ekki sjálfgengt</strong> — ΔG &gt; 0
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <div className="font-bold text-amber-900 mb-2">Hvað sést?</div>
            <ul className="text-sm text-amber-900 space-y-2 list-disc list-inside">
              <li>
                Við lágt hitastig vinnur <strong>ΔH</strong> og hvarfið er{' '}
                <strong>sjálfgengt</strong> (ΔG &lt; 0).
              </li>
              <li>
                Þegar T vex, vex <strong>TΔS</strong>-liðurinn. Þar sem ΔS er neikvætt, þýðir það
                stórt jákvætt tillag til ΔG.
              </li>
              <li>
                Við <strong>þveragahitastig T = ΔH/ΔS ≈ {formatRounded(demoCrossover, 0)} K</strong>{' '}
                verða liðurnir jafnir og hvarfið nær jafnvægi.
              </li>
              <li>Ofan við þveragahitastigið verður hvarfið ekki sjálfgengt.</li>
            </ul>
          </div>

          {/* Stacked below sm: two half-width buttons leave "æfingarhamur" no room at 320 px. */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setMode('menu')}
              className="flex-1 bg-warm-200 hover:bg-warm-300 text-warm-700 font-bold py-3 rounded-xl"
            >
              ← Valmynd
            </button>
            <button
              onClick={() => startRun('learning')}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl"
            >
              Byrja æfingarham →
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderGame = () => {
    if (!currentProblem) return null;

    const currentDeltaG = calcDeltaGForProblem(temperature);
    const currentSpontaneity = getSpontaneity(currentDeltaG);
    const crossoverTemp = crossoverTemperature(currentProblem.deltaH, currentProblem.deltaS);
    // The verdict is the message's first sentence ("Rétt!", "Rangt.", "Sjálfgengi er rétt en
    // ΔG er rangt."); the rest explains it.
    const feedbackLead = feedback.match(/^.+?[.!](?=\s|$)/)?.[0] ?? feedback;
    const feedbackRest = feedback.slice(feedbackLead.length);

    return (
      <div
        ref={gameRoot}
        className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-6 phone:py-3"
      >
        <a
          href="#problem-display"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:rounded focus:shadow-lg focus:text-orange-600 focus:font-bold"
        >
          Fara í verkefni
        </a>
        <div className="max-w-6xl mx-auto px-4 phone:px-3">
          {/* Header: one slim row on a phone (design P4), the challenge stats a second. */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4 phone:px-3 phone:py-2 phone:mb-3">
            <div className="flex justify-between items-center flex-wrap gap-4 phone:gap-x-3 phone:gap-y-1.5">
              <button
                onClick={() => setMode('menu')}
                className="px-4 py-2 border-2 rounded-lg font-medium phone:px-3"
                style={{ borderColor: '#f36b22', color: '#f36b22' }}
              >
                ← Til baka
              </button>

              {/* Below sm the challenge stats take a row of their own, under the back button and
                  question count, rather than pushing the count onto a line by itself. */}
              {mode === 'challenge' && (
                <div className="flex gap-4 items-center order-last w-full justify-around sm:order-none sm:w-auto sm:justify-start">
                  <div className="text-center">
                    <div className="text-sm text-warm-600 phone:text-xs">Stig</div>
                    <div className="text-xl font-bold phone:text-base">{runScore}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-warm-600 phone:text-xs">Runa</div>
                    <div className="text-xl font-bold phone:text-base">{streak}🔥</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-warm-600 phone:text-xs">Tími</div>
                    <div
                      className={`text-xl font-bold phone:text-base ${timeLeft < 20 ? 'text-red-500' : ''}`}
                    >
                      {timeLeft}s
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4 items-center">
                <div className="text-center phone:flex phone:items-baseline phone:gap-1.5">
                  <div className="text-sm text-warm-600">Spurning</div>
                  <div className="text-xl font-bold phone:text-lg">
                    {questionNumber}
                    {mode === 'learning' && (
                      <span className="text-base font-normal text-warm-600"> af {deck.length}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* On a portrait phone the two columns flatten into play order (design §3): problem,
              slider, the graph it drives, answer, verdict, solution, then the reference cards.
              The column wrappers are role-less and `display: contents` there. CSS order moves
              the plain-text and canvas blocks around the controls; every block with a control in
              it keeps its place in the sequence of controls, so focus order still matches what
              is seen. On a phone's side the two columns come back. The left column is a flex
              column rather than `space-y-4` so that the solution's empty wrapper takes no gap:
              the geometry is the same. */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 phone:gap-3 phone-land:grid-cols-2">
            {/* Left Column - Problem & Controls */}
            <div className="flex flex-col gap-4 phone:contents phone-land:flex phone-land:gap-3">
              {/* Problem Display */}
              <div
                className="bg-white rounded-lg shadow-lg p-4 sm:p-6 phone:p-3 phone:-order-1"
                id="problem-display"
              >
                <div className="mb-4 phone:mb-2">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-white text-sm scenario-${currentProblem.scenario}`}
                  >
                    Atburðarás {currentProblem.scenario}:{' '}
                    {currentProblem.scenario === 1
                      ? 'ΔH<0, ΔS>0'
                      : currentProblem.scenario === 2
                        ? 'ΔH>0, ΔS<0'
                        : currentProblem.scenario === 3
                          ? 'ΔH<0, ΔS<0'
                          : 'ΔH>0, ΔS>0'}
                  </span>
                  <span className="ml-2 text-sm text-warm-600">{currentProblem.difficulty}</span>
                </div>

                <h2 data-item-start className="text-xl font-bold mb-2 phone:text-lg phone:mb-1">
                  {currentProblem.name}
                </h2>
                <div className="text-lg mb-4 font-mono bg-warm-50 p-3 rounded phone:text-base phone:p-2 phone:mb-2">
                  {currentProblem.reaction}
                </div>

                {/* One column below sm: at 320 px half a card splits "J/(mol·K)" and the
                    endothermic tag mid-word. Two-up on a phone, where the value is smaller and
                    wraps at the space before its unit. */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 phone:grid-cols-2 phone:gap-2 phone:mb-0">
                  <div className="bg-red-50 p-3 rounded-lg phone:px-2.5 phone:py-2 phone:min-w-0">
                    <div className="text-sm text-warm-600 phone:text-xs">Vermi (ΔH°)</div>
                    <div
                      className="text-xl font-bold phone:text-base"
                      style={{
                        color:
                          currentProblem.deltaH < 0
                            ? 'var(--exothermic, #ff6b6b)'
                            : 'var(--endothermic, #4dabf7)',
                      }}
                    >
                      {currentProblem.deltaH > 0 ? '+' : ''}
                      {formatDecimal(currentProblem.deltaH)} kJ/mól
                    </div>
                    <div className="text-xs mt-1 phone:mt-0.5">
                      {currentProblem.deltaH < 0 ? '🔥 Útvermið' : '❄️ Innvermið'}
                    </div>
                  </div>

                  <div className="bg-purple-50 p-3 rounded-lg phone:px-2.5 phone:py-2 phone:min-w-0">
                    <div className="text-sm text-warm-600 phone:text-xs">Óreiða (ΔS°)</div>
                    <div
                      className="text-xl font-bold phone:text-base"
                      style={{
                        color:
                          currentProblem.deltaS > 0
                            ? 'var(--entropy-increase, #22c55e)'
                            : 'var(--entropy-decrease, #a855f7)',
                      }}
                    >
                      {currentProblem.deltaS > 0 ? '+' : ''}
                      {formatDecimal(currentProblem.deltaS)} J/(mól·K)
                    </div>
                    <div className="text-xs mt-1 phone:mt-0.5">
                      {currentProblem.deltaS > 0 ? '↑ Óreiða eykst' : '↓ Óreiða minnkar'}
                    </div>
                  </div>
                </div>

                {currentProblem.advancedTask && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4 phone:p-2 phone:mb-0 phone:mt-2">
                    <div className="text-sm font-bold">Áskorun:</div>
                    <div className="text-sm">{currentProblem.advancedTask}</div>
                  </div>
                )}
              </div>

              {/* Temperature Slider */}
              <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 phone:p-3 phone:-order-1">
                <h3 className="font-bold mb-3 phone:mb-1">🌡️ Hitastig</h3>
                <div className="mb-4 phone:mb-2">
                  <input
                    type="range"
                    min="200"
                    max="1200"
                    value={temperature}
                    onChange={(e) => setTemperature(parseInt(e.target.value, 10))}
                    className="w-full"
                    aria-label="Hitastig í Kelvinum"
                    aria-valuetext={`${temperature} Kelvin (${temperature - 273} gráður á Celsíus)`}
                  />
                  <div className="flex justify-between text-sm text-warm-600 mt-2 phone:mt-1 phone:items-baseline">
                    <span>200 K</span>
                    <span className="text-xl font-bold phone:text-lg" style={{ color: '#f36b22' }}>
                      {temperature} K ({temperature - 273}°C)
                    </span>
                    <span>1200 K</span>
                  </div>
                </div>

                {/* Real-time ΔG calculation */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg phone:p-3">
                  <div className="text-sm text-warm-600 mb-2 phone:mb-1">
                    Við núverandi hitastig:
                  </div>
                  <div className="font-mono text-sm mb-2 phone:mb-1">
                    ΔG° = ΔH° - TΔS°
                    <br />
                    ΔG° = ({formatDecimal(currentProblem.deltaH)}) - ({temperature})(
                    {formatDecimal(currentProblem.deltaS / 1000)})<br />
                    ΔG° ={' '}
                    <span className="font-bold text-lg">
                      {formatRounded(currentDeltaG, 1)} kJ/mól
                    </span>
                  </div>
                  <div
                    className={`text-lg font-bold ${currentSpontaneity === 'spontaneous' ? 'text-green-600' : currentSpontaneity === 'equilibrium' ? 'text-yellow-600' : 'text-red-600'}`}
                  >
                    {currentSpontaneity === 'spontaneous' && '✓ Sjálfgengt'}
                    {currentSpontaneity === 'equilibrium' && '⚖️ Jafnvægi'}
                    {currentSpontaneity === 'non-spontaneous' && '✗ Ekki sjálfgengt'}
                  </div>
                </div>

                {crossoverTemp && crossoverTemp >= 200 && crossoverTemp <= 1200 && (
                  <div
                    className={`mt-3 text-sm p-3 rounded border-l-4 phone:mt-2 phone:p-2 ${
                      currentProblem.scenario === 3 || currentProblem.scenario === 4
                        ? 'bg-purple-50 border-purple-500'
                        : 'bg-warm-50 border-warm-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🎯</span>
                      <div>
                        <strong className="text-purple-700">
                          Umbreytingarhitastig (T<sub>cross</sub>):
                        </strong>
                        <span className="ml-2 font-mono font-bold">
                          {formatRounded(crossoverTemp, 0)} K
                        </span>
                        <span className="text-warm-500 ml-1">
                          ({formatRounded(crossoverTemp - 273, 0)}°C)
                        </span>
                      </div>
                    </div>
                    {(currentProblem.scenario === 3 || currentProblem.scenario === 4) && (
                      <div className="mt-2 text-xs">
                        {currentProblem.scenario === 3 ? (
                          <span className="text-purple-600">
                            ⚡ Þetta hvarf er sjálfgengt <strong>undir</strong> þessu hitastigi
                          </span>
                        ) : (
                          <span className="text-purple-600">
                            ⚡ Þetta hvarf er sjálfgengt <strong>yfir</strong> þessu hitastigi
                          </span>
                        )}
                      </div>
                    )}
                    {temperature > 0 && (
                      <div className="mt-2 text-xs">
                        {temperature < crossoverTemp ? (
                          <span
                            className={
                              currentProblem.scenario === 3 ? 'text-green-600' : 'text-red-600'
                            }
                          >
                            📍 Núverandi hitastig ({temperature} K) er <strong>undir</strong> T
                            <sub>cross</sub>
                          </span>
                        ) : temperature > crossoverTemp ? (
                          <span
                            className={
                              currentProblem.scenario === 4 ? 'text-green-600' : 'text-red-600'
                            }
                          >
                            📍 Núverandi hitastig ({temperature} K) er <strong>yfir</strong> T
                            <sub>cross</sub>
                          </span>
                        ) : (
                          <span className="text-yellow-600">
                            📍 Núverandi hitastig ({temperature} K) er <strong>við</strong> T
                            <sub>cross</sub> (jafnvægi)
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Answer Input / Solution */}
              <Presence show={!showSolution} exitDuration={ANSWER_CARD_EXIT_MS}>
                <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 phone:p-3">
                  <h3 className="font-bold mb-4 phone:mb-2 phone:flex phone:items-baseline phone:justify-between phone:gap-3">
                    Svarið þitt:
                    {/* Keppnishamur's clock sits in the header, which a phone has scrolled away
                        by the time the answer is typed: a copy here, for the eye only — the
                        header's is the one announced. */}
                    {mode === 'challenge' && phone && (
                      <span
                        aria-hidden="true"
                        className={`text-sm tabular-nums ${timeLeft < 20 ? 'text-red-500' : 'text-warm-600'}`}
                      >
                        ⏱ {timeLeft}s
                      </span>
                    )}
                  </h3>

                  <div className="mb-4 phone:mb-3">
                    <label
                      htmlFor="thermo-delta-g"
                      className="block text-sm font-medium mb-2 phone:mb-1"
                    >
                      ΔG° við {temperature} K (kJ/mól):
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        id="thermo-delta-g"
                        type="text"
                        inputMode="decimal"
                        autoComplete="off"
                        enterKeyHint="done"
                        value={userDeltaG}
                        onChange={(e) => setUserDeltaG(e.target.value)}
                        onKeyDown={(e) => {
                          // Enter checks the answer once a verdict is picked too (design P12).
                          if (e.key === 'Enter' && userDeltaG && userSpontaneity) checkAnswer();
                        }}
                        className="w-full min-w-0 px-4 py-2 border-2 border-warm-300 rounded-lg focus:border-orange-500 focus:outline-none"
                        placeholder="t.d. -33,5"
                      />
                      {/* The decimal keypad has no minus key on an iPhone, and most ΔG° answers
                          here are negative. Touch screens only; a desktop keyboard has one. */}
                      <button
                        type="button"
                        onClick={() => setUserDeltaG(toggleSign(userDeltaG))}
                        aria-label="Skipta um formerki"
                        className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-lg border-2 border-warm-300 bg-white font-mono text-lg text-warm-700 pointer-coarse:inline-flex"
                      >
                        ±
                      </button>
                    </div>
                  </div>

                  <div className="mb-4 phone:mb-3" role="radiogroup" aria-label="Sjálfgengi">
                    <label className="block text-sm font-medium mb-2 phone:mb-1">Sjálfgengi:</label>
                    {/* Three across on a phone, as on a wide screen. */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 phone:grid-cols-3 phone:gap-1.5">
                      <button
                        onClick={() => setUserSpontaneity('spontaneous')}
                        role="radio"
                        aria-checked={userSpontaneity === 'spontaneous'}
                        className={`px-4 py-2 rounded-lg border-2 transition phone:px-1 phone:text-sm phone:leading-tight phone:min-h-11 ${
                          userSpontaneity === 'spontaneous'
                            ? 'border-green-500 bg-green-50 font-bold'
                            : 'border-warm-300 hover:border-green-300'
                        }`}
                      >
                        ✓ Sjálfgengt
                      </button>
                      <button
                        onClick={() => setUserSpontaneity('equilibrium')}
                        role="radio"
                        aria-checked={userSpontaneity === 'equilibrium'}
                        className={`px-4 py-2 rounded-lg border-2 transition phone:px-1 phone:text-sm phone:leading-tight phone:min-h-11 ${
                          userSpontaneity === 'equilibrium'
                            ? 'border-yellow-500 bg-yellow-50 font-bold'
                            : 'border-warm-300 hover:border-yellow-300'
                        }`}
                      >
                        ⚖️ Jafnvægi
                      </button>
                      <button
                        onClick={() => setUserSpontaneity('non-spontaneous')}
                        role="radio"
                        aria-checked={userSpontaneity === 'non-spontaneous'}
                        className={`px-4 py-2 rounded-lg border-2 transition phone:px-1 phone:text-sm phone:leading-tight phone:min-h-11 ${
                          userSpontaneity === 'non-spontaneous'
                            ? 'border-red-500 bg-red-50 font-bold'
                            : 'border-warm-300 hover:border-red-300'
                        }`}
                      >
                        ✗ Ekki sjálfgengt
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={checkAnswer}
                    disabled={!userDeltaG || !userSpontaneity}
                    className="w-full py-3 rounded-lg text-white font-bold text-lg transition disabled:opacity-50 disabled:cursor-not-allowed phone:py-2.5"
                    style={{ background: 'linear-gradient(135deg, #f36b22 0%, #d95a1a 100%)' }}
                  >
                    Athuga svar
                  </button>
                </div>
              </Presence>

              {/* Solution. On a phone it follows the verdict (CSS order on this wrapper, which
                  holds no control). Empty, and so hidden, while the answer card shows. */}
              <div className="empty:hidden phone:order-1">
                <Presence show={showSolution} exitDuration={250}>
                  <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 phone:p-3">
                    <h3 className="font-bold text-lg mb-4 phone:mb-2">📝 Lausn:</h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <strong>Skref 1:</strong> Umbreyta ΔS° í kJ/(mól·K)
                        <br />
                        ΔS° = {formatDecimal(currentProblem.deltaS)} J/(mól·K) × (1 kJ / 1000 J) ={' '}
                        {formatDecimal(currentProblem.deltaS / 1000)} kJ/(mól·K)
                      </div>
                      <div>
                        <strong>Skref 2:</strong> Beita Gibbs jöfnunni
                        <br />
                        ΔG° = ΔH° - TΔS°
                        <br />
                        ΔG° = ({formatDecimal(currentProblem.deltaH)}) - ({temperature})(
                        {formatDecimal(currentProblem.deltaS / 1000)})<br />
                        {/* TΔS in brackets, as on the line above: bare, a negative TΔS printed
                          as "-283 - -25,9". */}
                        ΔG° = ({formatDecimal(currentProblem.deltaH)}) - (
                        {formatRounded((temperature * currentProblem.deltaS) / 1000, 1)})
                        <br />
                        <strong>ΔG° = {formatRounded(currentDeltaG, 1)} kJ/mól</strong>
                      </div>
                      <div>
                        <strong>Skref 3:</strong> Túlka niðurstöðu
                        <br />
                        {/* The grader's own verdict. This tested |ΔG°| ≤ 1 where the grader tests
                          < 1, so at exactly 1 (protein unfolding at 332 K) the solution said
                          JAFNVÆGI while the grader wanted "Ekki sjálfgengt". */}
                        {currentSpontaneity === 'spontaneous' && 'ΔG° < 0 → SJÁLFGENGT ✓'}
                        {currentSpontaneity === 'equilibrium' && 'ΔG° ≈ 0 → JAFNVÆGI ⚖️'}
                        {currentSpontaneity === 'non-spontaneous' && 'ΔG° > 0 → EKKI SJÁLFGENGT ✗'}
                      </div>
                      {/* Crossover temperature explanation for scenarios 3 & 4 */}
                      {(currentProblem.scenario === 3 || currentProblem.scenario === 4) &&
                        crossoverTemp && (
                          <div className="bg-purple-50 border-l-4 border-purple-500 p-3 rounded">
                            <strong>Skref 4:</strong> Reikna umbreytingarhitastig (T<sub>cross</sub>
                            )
                            <br />
                            <div className="font-mono mt-1">
                              Þegar ΔG° = 0: ΔH° = TΔS°
                              <br />T<sub>cross</sub> = ΔH° / ΔS°
                              <br />T<sub>cross</sub> = {formatDecimal(currentProblem.deltaH)} /{' '}
                              {formatDecimal(currentProblem.deltaS / 1000)}
                              <br />
                              <strong>
                                T<sub>cross</sub> = {formatRounded(crossoverTemp, 0)} K (
                                {formatRounded(crossoverTemp - 273, 0)}°C)
                              </strong>
                            </div>
                            <div className="mt-2 text-sm">
                              {currentProblem.scenario === 3 ? (
                                <>
                                  🔹 Við T &lt; {formatRounded(crossoverTemp, 0)} K: ΔG° &lt; 0
                                  (sjálfgengt)
                                  <br />
                                  🔹 Við T &gt; {formatRounded(crossoverTemp, 0)} K: ΔG° &gt; 0
                                  (ekki sjálfgengt)
                                </>
                              ) : (
                                <>
                                  🔹 Við T &lt; {formatRounded(crossoverTemp, 0)} K: ΔG° &gt; 0
                                  (ekki sjálfgengt)
                                  <br />
                                  🔹 Við T &gt; {formatRounded(crossoverTemp, 0)} K: ΔG° &lt; 0
                                  (sjálfgengt)
                                </>
                              )}
                            </div>
                          </div>
                        )}

                      <div className="bg-blue-50 p-3 rounded">
                        <strong>Atburðarás {currentProblem.scenario}:</strong>
                        <br />
                        {getScenarioDescription(currentProblem.scenario)}
                      </div>
                    </div>
                  </div>
                </Presence>
              </div>

              {/* Feedback. The box is the region focus moves to after a check (design P3),
                  named by the verdict's first sentence; the message itself is the alert. On a
                  phone it is body-size text with only that first sentence bold. */}
              <Presence show={!!feedback} exitDuration={250}>
                <div
                  ref={feedbackRef}
                  role="group"
                  aria-labelledby={phone ? 'thermo-verdict' : 'thermo-feedback'}
                  tabIndex={-1}
                  className={`rounded-lg shadow-lg p-4 sm:p-6 focus:outline-none phone:p-3 ${
                    answeredCorrectly
                      ? 'bg-green-50 border-2 border-green-500'
                      : 'bg-red-50 border-2 border-red-500'
                  }`}
                >
                  {/* On a phone only the verdict's first sentence stays bold, and it
                      names the group; a desktop window keeps the one bold line it had,
                      which names the group whole. */}
                  <div
                    id="thermo-feedback"
                    role="alert"
                    aria-live="polite"
                    className="text-lg font-bold mb-2 phone:text-base phone:font-normal phone:mb-0"
                  >
                    {phone ? (
                      <>
                        <span id="thermo-verdict" className="font-bold">
                          {feedbackLead}
                        </span>
                        {feedbackRest}
                      </>
                    ) : (
                      feedback
                    )}
                  </div>
                  {/* The end of an Æfingarhamur round: how many it got right, and no score. */}
                  {showSolution && roundResult && mode === 'learning' && (
                    <p className="mt-3 text-lg font-bold text-warm-800 phone:text-base">
                      Æfingu lokið: {roundResult.correct} af {roundResult.total} rétt
                    </p>
                  )}
                  {showSolution && (
                    <button
                      ref={nextRef}
                      onClick={armed(
                        roundResult && mode === 'learning'
                          ? () => startRun('learning')
                          : nextProblem
                      )}
                      className="mt-4 w-full py-2 rounded-lg text-white font-bold pointer-coarse:min-h-11 phone:mt-3"
                      style={{ background: '#f36b22' }}
                    >
                      {roundResult && mode === 'learning' ? 'Æfa aftur →' : 'Næsta spurning →'}
                    </button>
                  )}
                </div>
              </Presence>
            </div>

            {/* Right Column - Visualizations */}
            <div className="space-y-4 phone:contents phone:space-y-0 phone-land:block phone-land:space-y-3">
              {/* Graph: on a portrait phone straight under the slider that drives it. */}
              <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 phone:p-3 phone:-order-1">
                <h3 className="font-bold mb-3 phone:mb-1">📊 ΔG° vs Hitastig</h3>
                {graphData && (
                  <InteractiveGraph
                    width={500}
                    height={300}
                    series={graphData.series}
                    xAxis={{ min: 200, max: 1200, label: 'T (K)', tickInterval: 200 }}
                    yAxis={{
                      min: -graphData.yHalf,
                      max: graphData.yHalf,
                      label: 'ΔG (kJ/mól)',
                      tickInterval: graphData.yHalf / 5,
                    }}
                    regions={graphData.regions}
                    markers={graphData.markers}
                    verticalLines={graphData.verticalLines}
                    horizontalLines={[
                      {
                        y: 0,
                        color: '#374151',
                        lineWidth: 2,
                        label: 'ΔG = 0',
                      },
                    ]}
                    ariaLabel="ΔG vs Hitastig graf"
                  />
                )}
                <div className="mt-3 text-xs text-warm-600 grid grid-cols-1 sm:grid-cols-2 gap-2 phone:mt-2 phone:grid-cols-2 phone:gap-x-2 phone:gap-y-1">
                  <div>🟠 Línuhalli: -ΔS°</div>
                  <div>🟢 Sjálfgengt: ΔG° &lt; 0</div>
                  <div>🔵 Y-skurður: ΔH°</div>
                  <div>🔴 Ekki sjálfgengt: ΔG° &gt; 0</div>
                  <div className="sm:col-span-2">
                    <span className="inline-block w-3 h-3 rounded-full bg-purple-500 mr-1"></span>T
                    <sub>cross</sub>: Umbreytingarhitastig (ΔG° = 0)
                  </div>
                </div>
              </div>

              {/* Entropy Visualization */}
              <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 phone:p-3 phone:order-1">
                <h3 className="font-bold mb-3 phone:mb-2">🎲 Óreiða</h3>
                <EntropyVisualization deltaS={currentProblem.deltaS} />
                <div className="mt-4 text-sm">
                  <div
                    className={`font-bold ${currentProblem.deltaS > 0 ? 'text-green-600' : 'text-purple-600'}`}
                  >
                    {currentProblem.deltaS > 0 ? (
                      <>
                        ↑ Óreiða eykst (ΔS° &gt; 0)
                        <div className="text-xs font-normal mt-1">Eftirfarandi gerist:</div>
                        <ul className="text-xs font-normal list-disc list-inside mt-1">
                          <li>Lofttegundir myndast</li>
                          <li>Fasaskipti: fast efni → vökvi → gas</li>
                          <li>Uppleysingarferli</li>
                        </ul>
                      </>
                    ) : (
                      <>
                        ↓ Óreiða minnkar (ΔS° &lt; 0)
                        <div className="text-xs font-normal mt-1">Eftirfarandi gerist:</div>
                        <ul className="text-xs font-normal list-disc list-inside mt-1">
                          <li>Lofttegundir hverfa</li>
                          <li>Fasaskipti: gas → vökvi → fast efni</li>
                          <li>Útfelling</li>
                        </ul>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Scenario Guide */}
              <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 phone:p-3 phone:order-1">
                <h3 className="font-bold mb-3 phone:mb-2">🎯 Fjórar atburðarásir</h3>
                <div className="space-y-2 text-xs">
                  <div className="p-2 rounded scenario-1 text-white">
                    <strong>1: ΔH&lt;0, ΔS&gt;0</strong> → Alltaf sjálfgengt
                  </div>
                  <div className="p-2 rounded scenario-2 text-white">
                    <strong>2: ΔH&gt;0, ΔS&lt;0</strong> → Aldrei sjálfgengt
                  </div>
                  <div className="p-2 rounded scenario-3 text-white">
                    <strong>3: ΔH&lt;0, ΔS&lt;0</strong> → Sjálfgengt við lágt T
                  </div>
                  <div className="p-2 rounded scenario-4 text-white">
                    <strong>4: ΔH&gt;0, ΔS&gt;0</strong> → Sjálfgengt við hátt T
                  </div>
                </div>
              </div>

              {/* Formula Reference: reference, so closed on a phone until opened (design P9). It
                  is the last block both in the page and among the controls. */}
              <PhoneDisclosure
                summary="📐 Formúlur"
                className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg shadow-lg p-4 sm:p-6 phone:p-2 phone:order-1"
                buttonClassName="border-transparent"
              >
                <h3 className="font-bold mb-3 phone:sr-only">📐 Formúlur</h3>
                <div className="space-y-2 text-sm font-mono">
                  <div className="bg-white p-2 rounded">ΔG° = ΔH° - TΔS°</div>
                  <div className="bg-white p-2 rounded">
                    T<sub>cross</sub> = ΔH° / ΔS°
                  </div>
                </div>
                <div className="mt-3 text-xs text-warm-600">
                  R = 8,314 J/(mól·K)
                  <br />T í Kelvin (K = °C + 273)
                  <br />
                  ΔG° &lt; 0 → sjálfgengt
                </div>
              </PhoneDisclosure>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <FadePresence show={mode === 'menu'} exitDuration={200}>
        {renderMenu()}
      </FadePresence>
      <FadePresence show={mode === 'discover'} exitDuration={200}>
        {renderDiscover()}
      </FadePresence>
      <FadePresence show={mode === 'learning' || mode === 'challenge'} exitDuration={200}>
        {renderGame()}
      </FadePresence>
    </>
  );
}

function AppWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}

export default AppWithErrorBoundary;
