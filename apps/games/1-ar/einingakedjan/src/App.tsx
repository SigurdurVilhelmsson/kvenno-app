import { useCallback, useMemo, useState } from 'react';

import { ErrorBoundary, Header } from '@shared/components';
import { useGameProgress } from '@shared/hooks';
import { useScreenTop } from '@shared/utils';

import { ChainBuilder } from './components/ChainBuilder';
import { ExploreScreen } from './components/ExploreScreen';
import { UnderstandScreen } from './components/UnderstandScreen';
import { problemsForPhase } from './data/problems';

type Screen = 'menu' | 'kanna' | 'skilja' | 'aefa' | 'beita';

interface Progress {
  completed: Screen[];
}

const PHASES: { id: Screen; number: string; name: string; description: string; tone: string }[] = [
  {
    id: 'kanna',
    number: '1',
    name: 'Kanna',
    description: 'Prófaðu þig áfram með hlutföll. Ekkert rétt eða rangt.',
    tone: 'bg-green-500 hover:bg-green-600',
  },
  {
    id: 'skilja',
    number: '2',
    name: 'Skilja',
    description: 'Mólmassi, mólstyrkur og eðlismassi — hvert um sig tvö brot.',
    tone: 'bg-sky-600 hover:bg-sky-700',
  },
  {
    id: 'aefa',
    number: '3',
    name: 'Æfa',
    description: 'Fimm dæmi í tveimur skrefum, með vísbendingum og spá um útkomuna.',
    tone: 'bg-kvenno-orange hover:bg-kvenno-orange-dark',
  },
  {
    id: 'beita',
    number: '4',
    name: 'Beita',
    description: 'Fimm dæmi í þremur til fjórum skrefum, með efnajöfnum og fleiri hlutföllum.',
    tone: 'bg-purple-600 hover:bg-purple-700',
  },
];

function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  const { progress, updateProgress } = useGameProgress<Progress>('einingakedjan-progress', {
    completed: [],
  });

  // Defaulted through useMemo so the identity is stable across renders and the
  // markCompleted callback below is not rebuilt every time.
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

  // Each phase replaces the whole screen, but the page kept the scroll position
  // of the menu card that opened it. On a phone that is a screen or two down, so
  // a phase opened with its problem statement already scrolled past. Every
  // screen starts at its top, at any width, as the game's own helper did. Focus
  // moves to the new screen's heading (Æfa and Beita have none: there it goes to
  // the problem, `[data-item-start]`), since the button that caused the swap has
  // gone. Back on the menu the next phase not yet done is focused, and on a
  // phone brought into view. The first render is left to the browser.
  const nextPhase = PHASES.find((phase) => !completed.includes(phase.id))?.id;
  useScreenTop(screen, {
    anyWidth: true,
    target: () => {
      if (screen === 'menu') {
        return nextPhase ? document.querySelector(`[data-phase-card="${nextPhase}"]`) : null;
      }
      return screen === 'aefa' || screen === 'beita'
        ? document.querySelector('main [data-item-start]')
        : null;
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <Header variant="game" backHref="/efnafraedi/1-ar/" gameTitle="Einingakeðjan" />

      <a href="#main-content" className="skip-link">
        Fara beint í efni
      </a>

      <main id="main-content" className="container mx-auto px-4 py-8 phone:py-4">
        {screen === 'menu' && (
          <div className="mx-auto max-w-4xl">
            <p className="mb-8 text-center text-lg text-warm-600 phone:mb-3 phone:text-base phone:leading-snug">
              Byggðu leiðina frá mælingu að svari — og láttu einingarnar segja þér hvort hún gengur
              upp
            </p>

            {/* On a phone the card is a flex column, so the overview paragraph can
                follow the four phases and every phase shows on the first screen.
                The paragraph says what the student will be doing rather than
                teaching it — Skilja is where the ratios are taught — and holds
                nothing focusable. Only blocks without a control move: the
                paragraph and the reading under the phases take order 1, so the
                phase buttons keep their place and the tab order is what is seen
                (design §3 Menu, P4). */}
            <div className="rounded-lg bg-white p-5 shadow-md sm:p-8 phone:flex phone:flex-col phone:p-3">
              <h2 className="mb-2 text-2xl font-bold text-warm-800 phone:mb-3 phone:text-xl">
                Fjórir áfangar
              </h2>
              <p className="mb-6 text-warm-600 phone:order-1 phone:mb-0 phone:mt-4">
                Þú færð mælingu sem þú getur séð fyrir þér, mark sem þú átt að komast á, og safn af
                hlutföllum. Verkefnið er að raða hlutföllunum þannig að allar einingar styttist út
                nema sú sem þú leitar að.
              </p>

              <div className="grid gap-4 phone:gap-2 phone-land:grid-cols-2">
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
                      Að hvert hlutfall má nota í báðar áttir — og hvernig þú velur áttina
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-orange-500">✓</span>
                    <span>
                      Að mólmassi, mólstyrkur, eðlismassi og stuðlar úr efnajöfnu eru allt sömu
                      tegund verkfæris
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-orange-500">✓</span>
                    <span>Að komast frá massa eins efnis yfir í massa annars — í gegnum mólin</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-orange-500">✓</span>
                    <span>Að lesa úr einingunum sjálfum hvort leiðin gengur upp</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 phone:order-1">
                <h3 className="mb-2 font-semibold text-amber-800">Af hverju einingakeðjur?</h3>
                <p className="text-sm text-amber-700">
                  Enginn mælir efni í mólum. Það er vigtað í grömmum, mælt í millilítrum og selt í
                  töflum — en efnajafnan talar bara um mól. Öll efnafræði sem er raunverulega notuð,
                  hvort sem það er skammtastærð lyfs eða kolefnisspor eldsneytis, byrjar á því að
                  brúa þetta bil. Einingarnar sjálfar segja þér hvort brúin heldur.
                </p>
              </div>

              <div className="mt-3 text-center text-xs text-warm-500 phone:order-1">
                <strong>Námsleiðin:</strong> Einingagreining → Lotukerfið → Nafnakerfið → Mólmassi →
                Reynsluformúlur → Stilla efnajöfnur → Útfellingarhvörf → Takmarkandi → Lausnir →{' '}
                <u>Einingakeðjan</u>
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
          <ChainBuilder
            problems={problemsForPhase('aefa')}
            predictBeforeSolving
            onComplete={() => markCompleted('aefa')}
            onBack={backToMenu}
          />
        )}

        {screen === 'beita' && (
          <ChainBuilder
            problems={problemsForPhase('beita')}
            predictBeforeSolving={false}
            onComplete={() => markCompleted('beita')}
            onBack={backToMenu}
          />
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
