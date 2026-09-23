import { useCallback, useEffect, useMemo, useState } from 'react';

import { ErrorBoundary, Header } from '@shared/components';
import { useGameProgress } from '@shared/hooks';

import { AefaScreen } from './components/AefaScreen';
import { BeitaScreen } from './components/BeitaScreen';
import { KannaScreen } from './components/KannaScreen';
import { SkiljaScreen } from './components/SkiljaScreen';
import { scrollPageToTop } from './utils/reveal';
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
    description: 'Massahlutfall og fjöldi frumeinda eru ekki sami hluturinn.',
    tone: 'bg-green-500 hover:bg-green-600',
  },
  {
    id: 'skilja',
    number: '2',
    name: 'Skilja',
    description: 'Fjórar súlur: prósenta → mól → hlutfall → vísitala.',
    tone: 'bg-sky-600 hover:bg-sky-700',
  },
  {
    id: 'aefa',
    number: '3',
    name: 'Æfa',
    description: 'Fylltu töfluna sjálf/ur, súlu fyrir súlu, á átta efnum.',
    tone: 'bg-kvenno-orange hover:bg-kvenno-orange-dark',
  },
  {
    id: 'beita',
    number: '4',
    name: 'Beita',
    description: 'Reynsluformúla plús mældur mólmassi gefur sameindaformúluna.',
    tone: 'bg-purple-600 hover:bg-purple-700',
  },
];

function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  const { progress, updateProgress } = useGameProgress<Progress>('reynsluformulur-progress', {
    completed: [],
  });

  const completed = useMemo(() => progress.completed ?? [], [progress.completed]);

  const markCompleted = useCallback(
    (phase: Screen) => {
      if (!completed.includes(phase)) updateProgress({ completed: [...completed, phase] });
      setScreen('menu');
    },
    [completed, updateProgress]
  );

  const backToMenu = useCallback(() => setScreen('menu'), []);

  // Every screen change replaces the whole page. On a phone the button that
  // caused it sits a screen or more down, so the new screen would otherwise
  // open part-way through; start it at the top instead.
  useEffect(() => {
    scrollPageToTop();
  }, [screen]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <Header variant="game" backHref="/efnafraedi/1-ar/" gameTitle="Reynsluformúlur" />

      <a href="#main-content" className="skip-link">
        Fara beint í efni
      </a>

      <main id="main-content" className="container mx-auto px-4 py-4 sm:py-8">
        {screen === 'menu' && (
          <div className="mx-auto max-w-4xl">
            <p className="mb-8 text-center text-lg text-warm-600">
              Efnagreining gefur þér prósentur. Formúlan er ekki í þeim — hún fæst með því að deila
              massanum burt
            </p>

            <div className="rounded-lg bg-white p-5 shadow-md sm:p-8">
              <h2 className="mb-2 text-2xl font-bold text-warm-800">Fjórir áfangar</h2>
              <p className="mb-6 text-warm-600">
                Þú kannt að reikna mólmassa út frá formúlu. Hér ferðu í hina áttina: út frá því sem
                mælitækið gefur — hversu stór hluti massans er kolefni, hversu stór hluti er vetni —
                og að formúlunni sjálfri.
              </p>

              <div className="grid gap-4">
                {PHASES.map((phase) => (
                  <button
                    key={phase.id}
                    type="button"
                    onClick={() => setScreen(phase.id)}
                    className={`game-card rounded-lg p-5 text-left text-white transition-colors sm:p-6 ${phase.tone}`}
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
                    <span>Að massahlutfall og fjöldi frumeinda eru sitt hvor spurningin</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-orange-500">✓</span>
                    <span>Fjögurra súlna leiðina: prósenta → mól → hlutfall → vísitala</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-orange-500">✓</span>
                    <span>
                      Að hlutfall upp á 1,5 er ekki námundunarvilla heldur helmingur — margfaldaðu,
                      ekki námunda
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-orange-500">✓</span>
                    <span>
                      Að reynsluformúlan ein og sér segir ekki hvaða efni þú ert með; til þess þarf
                      mólmassann
                    </span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 rounded-lg bg-warm-50 p-4">
                <h3 className="mb-2 font-semibold text-warm-700">Lykilskref</h3>
                <div className="space-y-2 font-mono text-sm text-warm-600">
                  <p>
                    <strong>Mól:</strong> n = m / M — prósentan er grömm í 100 g sýni
                  </p>
                  <p>
                    <strong>Hlutfall:</strong> deildu öllu með minnsta mólfjöldanum
                  </p>
                  <p>
                    <strong>Vísitala:</strong> margfaldaðu upp í heilar tölur
                  </p>
                  <p>
                    <strong>Sameind:</strong> n = mólmassi / massi reynsluformúlu
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
                <h3 className="mb-2 font-semibold text-amber-800">Af hverju reynsluformúlur?</h3>
                <p className="text-sm text-amber-700">
                  Þegar nýtt efni finnst — í plöntu, í þvagsýni, í fornri leirkrukku — veit enginn
                  formúluna. Tækið brennir sýnið og mælir hvað kemur út: svo mikið kolefni, svo
                  mikið vetni. Reynsluformúlan er fyrsta svarið sem hægt er að fá úr þeirri mælingu,
                  og hún er það sem stendur í greininni þegar nýtt efnasamband er birt.
                </p>
              </div>

              <div className="mt-3 text-center text-xs text-warm-500">
                <strong>Námsleiðin:</strong> Einingagreining → Lotukerfið → Nafnakerfið → Mólmassi →{' '}
                <u>Reynsluformúlur</u> → Stilla efnajöfnur → Útfellingarhvörf → Takmarkandi →
                Lausnir → Einingakeðjan
              </div>
              <div className="mt-2 text-center text-xs text-warm-400">
                Kafli 3 — Chemistry: The Central Science (Brown et al.)
              </div>
            </div>
          </div>
        )}

        {screen === 'kanna' && (
          <KannaScreen onComplete={() => markCompleted('kanna')} onBack={backToMenu} />
        )}

        {screen === 'skilja' && (
          <SkiljaScreen onComplete={() => markCompleted('skilja')} onBack={backToMenu} />
        )}

        {screen === 'aefa' && (
          <AefaScreen onComplete={() => markCompleted('aefa')} onBack={backToMenu} />
        )}

        {screen === 'beita' && (
          <BeitaScreen onComplete={() => markCompleted('beita')} onBack={backToMenu} />
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
