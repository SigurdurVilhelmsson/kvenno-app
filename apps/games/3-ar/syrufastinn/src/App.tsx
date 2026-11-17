import { useCallback, useMemo, useState } from 'react';

import { ErrorBoundary, Header, MenuCard, MenuProgress } from '@shared/components';
import type { MenuCardTone } from '@shared/components';
import { useGameProgress } from '@shared/hooks';
import { useScreenTop } from '@shared/utils';

import { ApplyScreen } from './components/ApplyScreen';
import { ExploreScreen } from './components/ExploreScreen';
import { NaermyndScreen } from './components/NaermyndScreen';
import { PracticeScreen } from './components/PracticeScreen';
import { UnderstandScreen } from './components/UnderstandScreen';
import './styles.css';

type Screen = 'menu' | 'naermynd' | 'kanna' | 'skilja' | 'aefa' | 'beita';

interface Progress {
  completed: Screen[];
}

const PHASES: { id: Screen; number: string; name: string; description: string; icon: string }[] = [
  {
    id: 'kanna',
    number: '1',
    name: 'Kanna',
    description: 'Mældu sömu sýru í mismunandi styrk. Ekkert rétt eða rangt.',

    icon: '🔍',
  },
  {
    id: 'skilja',
    number: '2',
    name: 'Skilja',
    description: 'ICE-taflan, sýrufastajafnan og hvaðan nálgunin kemur.',

    icon: '💡',
  },
  {
    id: 'aefa',
    number: '3',
    name: 'Æfa',
    description: 'Fimm dæmi í þremur skrefum, með vísbendingum og 5 % athuguninni.',

    icon: '✏️',
  },
  {
    id: 'beita',
    number: '4',
    name: 'Beita',
    description: 'Ka, Kb og klofnunarhlutfall — og dæmi þar sem nálgunin bregst.',

    icon: '🎯',
  },
];

function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  const { progress, updateProgress, resetProgress } = useGameProgress<Progress>(
    'syrufastinn-progress',
    {
      completed: [],
    }
  );

  const completed = useMemo(() => progress.completed ?? [], [progress.completed]);

  // Kanna and Skilja end on "Áfram í Skilja" / "Áfram í Æfa", so those two go
  // on to the phase they name; they used to drop the student on the menu.
  const markCompleted = useCallback(
    (phase: Screen, next: Screen = 'menu') => {
      if (!completed.includes(phase)) updateProgress({ completed: [...completed, phase] });
      setScreen(next);
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      <Header variant="game" backHref="/efnafraedi/3-ar/" gameTitle="Sýrufastinn" />

      <a href="#main-content" className="skip-link">
        Fara beint í efni
      </a>

      <main id="main-content" className="container mx-auto px-4 py-8 phone:py-4">
        {screen === 'menu' && (
          <div className="mx-auto max-w-3xl">
            {/* On a phone the card is a flex column, so the overview paragraph can
                follow the four phases: every phase shows on the first screen.
                The paragraph says what the phases will do rather than teaching
                anything, and holds nothing focusable (design §3 Menu). Only
                blocks without a control move: the paragraph and the reading
                under the phases take order 1, so the phase buttons keep their
                place and the tab order is what is seen. */}
            <div className="rounded-2xl bg-white p-4 shadow-2xl sm:p-6 md:p-8 phone:flex phone:flex-col phone:p-3">
              <p className="mb-4 text-warm-600 phone:mb-3">
                Ein tala lýsir sýrunni sjálfri — hvaðan hún kemur, hvað hún segir og hvenær styttri
                leiðina að svarinu má nota
              </p>
              <h2 className="mb-2 text-2xl font-bold text-warm-800 phone:mb-3 phone:text-xl">
                Fjórir áfangar
              </h2>
              <p className="mb-6 text-warm-600 phone:order-1 phone:mb-0 phone:mt-4">
                Í pH Títrun og Stuðpúðum færðu pKa gefinn upp í dæmum. Hér kemur talan sjálf: hvaðan
                hún fæst, af hverju hún breytist ekki með styrknum, og hvers vegna nálgunin sem
                allir nota heldur næstum alltaf en ekki alveg.
              </p>

              {/* Nærmynd: the particles behind percent dissociation. Not one of the four
                  phases and never marked done; nothing in it is graded. */}
              <MenuCard
                tone="naermynd"
                icon="🔬"
                title="Nærmynd"
                subtitle="Sjáðu sameindirnar: veik sýra þynnt, og veik sýra borin saman við sterka."
                className="mb-4 phone:mb-3"
                onClick={() => setScreen('naermynd')}
              />

              <div className="grid gap-4 phone:gap-3 phone-land:grid-cols-2">
                {PHASES.map((phase, index) => (
                  <MenuCard
                    key={phase.id}
                    tone={(index + 1) as MenuCardTone}
                    icon={phase.icon}
                    title={`${phase.number}. ${phase.name}`}
                    subtitle={phase.description}
                    result={completed.includes(phase.id) ? 'Lokið' : null}
                    data-phase-card={phase.id}
                    onClick={() => setScreen(phase.id)}
                  />
                ))}
              </div>

              {completed.length > 0 && (
                <MenuProgress onReset={resetProgress} className="mt-6">
                  {completed.length} af 4 áföngum lokið
                </MenuProgress>
              )}

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
                <h3 className="mb-2 font-semibold text-warm-700">📐 Lykilformúlur</h3>
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
                Kafli 14 — Efnafræði 2e
              </div>
            </div>
          </div>
        )}

        {screen === 'naermynd' && <NaermyndScreen onBack={backToMenu} />}

        {screen === 'kanna' && (
          <ExploreScreen onComplete={() => markCompleted('kanna', 'skilja')} onBack={backToMenu} />
        )}

        {screen === 'skilja' && (
          <UnderstandScreen
            onComplete={() => markCompleted('skilja', 'aefa')}
            onBack={backToMenu}
          />
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
