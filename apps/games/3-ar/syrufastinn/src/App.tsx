import { useCallback, useMemo, useState } from 'react';

import { ErrorBoundary, Header } from '@shared/components';
import { useGameProgress } from '@shared/hooks';

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <Header variant="game" backHref="/efnafraedi/3-ar/" gameTitle="Sýrufastinn" />

      <a href="#main-content" className="skip-link">
        Fara beint í efni
      </a>

      <main id="main-content" className="container mx-auto px-4 py-8">
        {screen === 'menu' && (
          <div className="mx-auto max-w-4xl">
            <p className="mb-8 text-center text-lg text-warm-600">
              Ein tala lýsir sýrunni sjálfri — hvaðan hún kemur, hvað hún segir og hvenær styttri
              leiðin að svarinu má nota
            </p>

            <div className="rounded-lg bg-white p-8 shadow-md">
              <h2 className="mb-2 text-2xl font-bold text-warm-800">Fjórir áfangar</h2>
              <p className="mb-6 text-warm-600">
                Þú hefur þegar séð pKa gefinn upp í dæmum — í títrunum og í Henderson-Hasselbalch.
                Hér kemur talan sjálf: hvaðan hún fæst, af hverju hún breytist ekki með styrknum, og
                hvers vegna nálgunin sem allir nota heldur næstum alltaf en ekki alveg.
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

              <div className="mt-6 rounded-lg bg-warm-50 p-4">
                <h3 className="mb-2 font-semibold text-warm-700">Lykilformúlur</h3>
                <div className="space-y-2 font-mono text-sm text-warm-600">
                  <p>
                    <strong>Sýrufasti:</strong> Ka = x² / (C − x)
                  </p>
                  <p>
                    <strong>Nákvæm lausn:</strong> x² + Ka·x − Ka·C = 0
                  </p>
                  <p>
                    <strong>Nálgun:</strong> x ≈ √(Ka · C), gildir ef x/C &lt; 5 %
                  </p>
                  <p>
                    <strong>Samoka par:</strong> Ka · Kb = Kw = 1,0 × 10⁻¹⁴
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
                <h3 className="mb-2 font-semibold text-amber-800">Af hverju sýrufastinn?</h3>
                <p className="text-sm text-amber-700">
                  Blóðið þitt heldur pH 7,4 af því að kolsýra og bíkarbónat sitja í jafnvægi sem
                  sýrufastinn ákveður. Sama tala ræður því hversu mikið af lyfi kemst gegnum
                  magavegginn, af hverju súrt regn leysir upp kalkstein, og hvers vegna edik
                  bragðast súrt en er samt aðeins örfá prósent klofið. Ka er talan sem gerir „veik
                  sýra“ að mælanlegri stærð í stað lýsingarorðs.
                </p>
              </div>

              <div className="mt-3 text-center text-xs text-warm-500">
                <strong>Námsleiðin:</strong> Gaslögmál → Jafnvægi → <u>Sýrufastinn</u> → Varmafræði
                → pH Títrun → Stuðpúðar
              </div>
              <div className="mt-2 text-center text-xs text-warm-400">
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
