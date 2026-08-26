import { useCallback, useMemo, useState } from 'react';

import { ErrorBoundary, Header } from '@shared/components';
import { useGameProgress } from '@shared/hooks';

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <Header variant="game" backHref="/efnafraedi/1-ar/" gameTitle="Einingakeðjan" />

      <a href="#main-content" className="skip-link">
        Fara beint í efni
      </a>

      <main id="main-content" className="container mx-auto px-4 py-8">
        {screen === 'menu' && (
          <div className="mx-auto max-w-4xl">
            <p className="mb-8 text-center text-lg text-warm-600">
              Byggðu leiðina frá mælingu að svari — og láttu einingarnar segja þér hvort hún gengur
              upp
            </p>

            <div className="rounded-lg bg-white p-8 shadow-md">
              <h2 className="mb-2 text-2xl font-bold text-warm-800">Fjórir áfangar</h2>
              <p className="mb-6 text-warm-600">
                Þú færð mælingu sem þú getur séð fyrir þér, mark sem þú átt að komast á, og safn af
                hlutföllum. Verkefnið er að raða hlutföllunum þannig að allar einingar styttist út
                nema sú sem þú leitar að.
              </p>

              <div className="grid gap-4">
                {PHASES.map((phase) => (
                  <button
                    key={phase.id}
                    type="button"
                    onClick={() => setScreen(phase.id)}
                    className={`game-card rounded-lg p-6 text-left text-white transition-colors ${phase.tone}`}
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-2xl">{phase.number}</span>
                      <h3 className="text-xl font-semibold">{phase.name}</h3>
                    </div>
                    <p className="text-white/85">{phase.description}</p>
                    {completed.includes(phase.id) && (
                      <p className="mt-2 text-sm text-white/80">Lokið</p>
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-6 rounded-lg border border-warm-200 bg-warm-50 p-4">
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

              <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
                <h3 className="mb-2 font-semibold text-amber-800">Af hverju einingakeðjur?</h3>
                <p className="text-sm text-amber-700">
                  Enginn mælir efni í mólum. Það er vigtað í grömmum, mælt í millilítrum og selt í
                  töflum — en efnajafnan talar bara um mól. Öll efnafræði sem er raunverulega notuð,
                  hvort sem það er skammtastærð lyfs eða kolefnisspor eldsneytis, byrjar á því að
                  brúa þetta bil. Einingarnar sjálfar segja þér hvort brúin heldur.
                </p>
              </div>

              <div className="mt-3 text-center text-xs text-warm-500">
                <strong>Námsleiðin:</strong> Einingagreining → Lotukerfið → Nafnakerfið → Mólmassi →
                Jafna jöfnur → Takmarkandi → Lausnir → <u>Einingakeðjan</u>
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
