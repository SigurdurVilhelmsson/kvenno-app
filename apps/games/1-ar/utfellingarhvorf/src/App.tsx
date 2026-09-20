import { useCallback, useMemo, useState } from 'react';

import { ErrorBoundary, Header } from '@shared/components';
import { useGameProgress } from '@shared/hooks';

import { AefaScreen } from './components/AefaScreen';
import { BeitaScreen } from './components/BeitaScreen';
import { KannaScreen } from './components/KannaScreen';
import { SkiljaScreen } from './components/SkiljaScreen';
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
    description: 'Helltu saman tærum lausnum og sjáðu hvenær eitthvað gerist.',
    tone: 'bg-green-500 hover:bg-green-600',
  },
  {
    id: 'skilja',
    number: '2',
    name: 'Skilja',
    description: 'Sameindajafna → heildarjónajafna → nettójónajafna.',
    tone: 'bg-sky-600 hover:bg-sky-700',
  },
  {
    id: 'aefa',
    number: '3',
    name: 'Æfa',
    description: 'Leysanlegt eða ekki — og hvaða regla ræður því.',
    tone: 'bg-kvenno-orange hover:bg-kvenno-orange-dark',
  },
  {
    id: 'beita',
    number: '4',
    name: 'Beita',
    description: 'Spáðu fyrir um botnfallið og byggðu nettójónajöfnuna sjálf/ur.',
    tone: 'bg-purple-600 hover:bg-purple-700',
  },
];

function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  const { progress, updateProgress } = useGameProgress<Progress>('utfellingarhvorf-progress', {
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <Header variant="game" backHref="/efnafraedi/1-ar/" gameTitle="Útfellingarhvörf" />

      <a href="#main-content" className="skip-link">
        Fara beint í efni
      </a>

      <main id="main-content" className="container mx-auto px-4 py-8">
        {screen === 'menu' && (
          <div className="mx-auto max-w-4xl">
            <p className="mb-8 text-center text-lg text-warm-600">
              Tvær tærar lausnir, eitt skýjað glas — og jafnan sem segir hvað raunverulega gerðist
            </p>

            <div className="rounded-lg bg-white p-8 shadow-md">
              <h2 className="mb-2 text-2xl font-bold text-warm-800">Fjórir áfangar</h2>
              <p className="mb-6 text-warm-600">
                Þú kannt að stilla efnajöfnur. Hér bætist við spurningin sem efnajafnan svarar ekki:
                hvað af því sem stendur í jöfnunni tók raunverulega þátt? Uppleyst jónaefni er ekki
                heilt í vatninu — það er sundrað í lausar jónir — og oft er það aðeins tvær þeirra
                sem gera nokkuð.
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
                      Leysnireglurnar — og að undantekningarnar eru þar sem dæmin eru samin
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-orange-500">✓</span>
                    <span>Að spá fyrir um hvort botnfall myndist, áður en þú hellir</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-orange-500">✓</span>
                    <span>
                      Að skrifa heildarjónajöfnu og strika út áhorfendajónirnar til að fá
                      nettójónajöfnuna
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-orange-500">✓</span>
                    <span>
                      Að nettójónajafnan á við hvaðan sem jónirnar koma — hún lýsir efnahvarfinu,
                      ekki flöskunum
                    </span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 rounded-lg bg-warm-50 p-4">
                <h3 className="mb-2 font-semibold text-warm-700">Lykilskref</h3>
                <div className="space-y-2 font-mono text-sm text-warm-600">
                  <p>
                    <strong>1.</strong> Skrifaðu allar jónirnar sem eru í glasinu
                  </p>
                  <p>
                    <strong>2.</strong> Paraðu þær á hinn veginn — gæti eitthvert parið verið
                    óleysanlegt?
                  </p>
                  <p>
                    <strong>3.</strong> Leysnireglurnar svara því
                  </p>
                  <p>
                    <strong>4.</strong> Strikaðu út það sem er eins beggja vegna
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
                <h3 className="mb-2 font-semibold text-amber-800">Af hverju útfellingarhvörf?</h3>
                <p className="text-sm text-amber-700">
                  Svona eru þungmálmar teknir úr skólpi, svona myndast kalkið í hraðsuðukatlinum, og
                  svona er klóríð mælt í drykkjarvatni. Þetta er líka fyrsta efnahvarfið sem þú
                  skrifar á þrjá mismunandi vegu — og sá þriðji, nettójónajafnan, er sá sem
                  efnafræðingar nota, því hann sleppir öllu sem skiptir ekki máli.
                </p>
              </div>

              <div className="mt-3 text-center text-xs text-warm-500">
                <strong>Námsleiðin:</strong> Einingagreining → Lotukerfið → Nafnakerfið → Mólmassi →
                Reynsluformúlur → Stilla efnajöfnur → <u>Útfellingarhvörf</u> → Takmarkandi →
                Lausnir → Einingakeðjan
              </div>
              <div className="mt-2 text-center text-xs text-warm-400">
                Kafli 4 — Chemistry: The Central Science (Brown et al.)
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
