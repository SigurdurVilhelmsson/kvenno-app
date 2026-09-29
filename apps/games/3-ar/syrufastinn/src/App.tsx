import { useCallback, useMemo, useState } from 'react';

import { ErrorBoundary, Header } from '@shared/components';
import { useGameProgress } from '@shared/hooks';
import { useScreenTop } from '@shared/utils';

import { ApplyScreen } from './components/ApplyScreen';
import { ExploreScreen } from './components/ExploreScreen';
import { PracticeScreen } from './components/PracticeScreen';
import { UnderstandScreen } from './components/UnderstandScreen';
import './styles.css';

type Screen = 'menu' | 'kanna' | 'skilja' | 'aefa' | 'beita';

interface Progress {
  completed: Screen[];
}

const PHASES: { id: Screen; number: string; name: string; description: string; tone: string }[] = [
  {
    id: 'kanna',
    number: '1',
    name: 'Kanna',
    description: 'Mældu sömu sýru í mismunandi styrk. Ekkert rétt eða rangt.',
    tone: 'bg-green-500 hover:bg-green-600',
  },
  {
    id: 'skilja',
    number: '2',
    name: 'Skilja',
    description: 'ICE-taflan, sýrufastajafnan og hvaðan nálgunin kemur.',
    tone: 'bg-sky-600 hover:bg-sky-700',
  },
  {
    id: 'aefa',
    number: '3',
    name: 'Æfa',
    description: 'Fimm dæmi í þremur skrefum, með vísbendingum og 5 % athuguninni.',
    tone: 'bg-kvenno-orange hover:bg-kvenno-orange-dark',
  },
  {
    id: 'beita',
    number: '4',
    name: 'Beita',
    description: 'Ka, Kb og klofnunarhlutfall — og dæmi þar sem nálgunin bregst.',
    tone: 'bg-purple-600 hover:bg-purple-700',
  },
];

function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  const { progress, updateProgress } = useGameProgress<Progress>('syrufastinn-progress', {
    completed: [],
  });

  const completed = useMemo(() => progress.completed ?? [], [progress.completed]);

  const markCompleted = useCallback(
    (phase: Screen) => {
      if (!completed.includes(phase)) {
        updateProgress({ completed: [...completed, phase] });
      }
      setScreen('menu');
    },
    [completed, updateProgress]
  );

  const backToMenu = useCallback(() => setScreen('menu'), []);

  // Each screen swap starts the new screen at its top with its heading focused:
  // on a phone the page would otherwise stay at the old offset, and focus would
  // fall to <body> with the button that caused the swap. Back on the menu, the
  // next phase not yet done is revealed and focused instead.
  const nextPhase = PHASES.find((phase) => !completed.includes(phase.id))?.id;
  useScreenTop(screen, {
    target: () =>
      screen === 'menu' && nextPhase
        ? document.querySelector(`[data-phase-card="${nextPhase}"]`)
        : null,
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <Header variant="game" backHref="/efnafraedi/3-ar/" gameTitle="Sýrufastinn" />

      <a href="#main-content" className="skip-link">
        Fara beint í efni
      </a>

      <main id="main-content" className="container mx-auto px-4 py-8 phone:py-4">
        {screen === 'menu' && (
          <div className="mx-auto max-w-4xl">
            <p className="mb-8 text-center text-lg text-warm-600 phone:mb-3 phone:text-base">
              Ein tala lýsir sýrunni sjálfri — hvaðan hún kemur, hvað hún segir og hvenær styttri
              leiðina að svarinu má nota
            </p>

            {/* On a phone the card is a flex column, so the overview paragraph can
                follow the four phases: every phase shows on the first screen.
                The paragraph says what the phases will do rather than teaching
                anything, and holds nothing focusable (design §3 Menu). Only
                blocks without a control move: the paragraph and the reading
                under the phases take order 1, so the phase buttons keep their
                place and the tab order is what is seen. */}
            <div className="rounded-lg bg-white p-5 shadow-md sm:p-8 phone:flex phone:flex-col phone:p-3">
              <h2 className="mb-2 text-2xl font-bold text-warm-800 phone:mb-3 phone:text-xl">
                Fjórir áfangar
              </h2>
              <p className="mb-6 text-warm-600 phone:order-1 phone:mb-0 phone:mt-4">
                Þú hefur þegar séð pKa gefinn upp í dæmum — í títrunum og í Henderson-Hasselbalch.
                Hér kemur talan sjálf: hvaðan hún fæst, af hverju hún breytist ekki með styrknum, og
                hvers vegna nálgunin sem allir nota heldur næstum alltaf en ekki alveg.
              </p>

              <div className="grid gap-4 phone:gap-3 phone-land:grid-cols-2">
                {PHASES.map((phase) => (
                  <button
                    key={phase.id}
                    type="button"
                    data-phase-card={phase.id}
                    onClick={() => setScreen(phase.id)}
                    className={`game-card rounded-lg p-5 text-left text-white transition-colors sm:p-6 phone:relative phone:p-3 ${phase.tone}`}
                  >
                    <div className="mb-2 flex items-center gap-2 phone:mb-1">
                      <span className="text-2xl phone:text-xl">{phase.number}</span>
                      <h3 className="text-xl font-semibold phone:text-lg">{phase.name}</h3>
                    </div>
                    <p className="text-white/85 phone:text-sm">{phase.description}</p>
                    {/* On a phone, a badge in the corner of the title row. */}
                    {completed.includes(phase.id) && (
                      <p className="mt-2 text-sm text-white/80 phone:absolute phone:right-3 phone:top-3 phone:mt-0 phone:rounded-full phone:bg-white/20 phone:px-2 phone:py-0.5 phone:text-xs phone:font-semibold phone:text-white">
                        Lokið
                      </p>
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-6 rounded-lg border border-warm-200 bg-warm-50 p-4 phone:order-1">
                <h3 className="mb-2 font-semibold text-warm-800">Þú lærir</h3>
                <ul className="space-y-1.5 text-sm text-warm-700">
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-orange-500">✓</span>
                    <span>
                      Að sýrufastinn Ka lýsir sýrunni, ekki lausninni — sama tala hvað sem þú þynnir
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-orange-500">✓</span>
                    <span>Að lesa Ka út úr mældu pH, sem er áttin sem hann er ákvarðaður í</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-orange-500">✓</span>
                    <span>
                      Að x = √(Ka · C) er nálgun með forsendu, og hvernig 5 % reglan prófar hana
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-orange-500">✓</span>
                    <span>
                      Að Ka · Kb = Kw, svo basafasti samoka basans er ekki ný fræði heldur sama
                      talan á hvolfi
                    </span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 rounded-lg bg-warm-50 p-4 phone:order-1">
                <h3 className="mb-2 font-semibold text-warm-700">Lykilformúlur</h3>
                {/* A formula wraps as a whole, onto the line below its label, rather
                    than breaking between its terms on a phone. */}
                <div className="space-y-2 font-mono text-sm text-warm-600">
                  <p>
                    <strong>Sýrufasti:</strong>{' '}
                    <span className="whitespace-nowrap">Ka = x² / (C − x)</span>
                  </p>
                  <p>
                    <strong>Nákvæm lausn:</strong>{' '}
                    <span className="whitespace-nowrap">x² + Ka·x − Ka·C = 0</span>
                  </p>
                  <p>
                    <strong>Nálgun:</strong>{' '}
                    <span className="whitespace-nowrap">x ≈ √(Ka · C)</span>, gildir ef{' '}
                    <span className="whitespace-nowrap">x/C &lt; 5 %</span>
                  </p>
                  <p>
                    <strong>Samoka par:</strong>{' '}
                    <span className="whitespace-nowrap">Ka · Kb = Kw</span>{' '}
                    <span className="whitespace-nowrap">= 1,0 × 10⁻¹⁴</span>
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 phone:order-1">
                <h3 className="mb-2 font-semibold text-amber-800">Af hverju sýrufastinn?</h3>
                <p className="text-sm text-amber-700">
                  Blóðið þitt heldur pH 7,4 af því að kolsýra og bíkarbónat sitja í jafnvægi sem
                  sýrufastinn ákveður. Sama tala ræður því hversu mikið af lyfi kemst gegnum
                  magavegginn, af hverju súrt regn leysir upp kalkstein, og hvers vegna edik
                  bragðast súrt en er samt innan við eitt prósent klofið. Ka er talan sem gerir
                  „veik sýra“ að mælanlegri stærð í stað lýsingarorðs.
                </p>
              </div>

              <div className="mt-3 text-center text-xs text-warm-500 phone:order-1">
                <strong>Námsleiðin:</strong> Gaslögmál → Jafnvægisfastinn → Hliðrun jafnvægis →{' '}
                <u>Sýrufastinn</u> → Varmafræði → pH Títrun → Stuðpúðar → Leysnijafnvægi
              </div>
              <div className="mt-2 text-center text-xs text-warm-400 phone:order-1">
                Kafli 16 — Chemistry: The Central Science (Brown et al.)
              </div>
            </div>
          </div>
        )}

        {screen === 'kanna' && (
          <ExploreScreen onComplete={() => markCompleted('kanna')} onBack={backToMenu} />
        )}

        {screen === 'skilja' && (
          <UnderstandScreen onComplete={() => markCompleted('skilja')} onBack={backToMenu} />
        )}

        {screen === 'aefa' && (
          <PracticeScreen onComplete={() => markCompleted('aefa')} onBack={backToMenu} />
        )}

        {screen === 'beita' && (
          <ApplyScreen onComplete={() => markCompleted('beita')} onBack={backToMenu} />
        )}
      </main>
    </div>
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
