import { useCallback, useMemo, useState } from 'react';

import { ErrorBoundary, Header } from '@shared/components';
import { useGameProgress } from '@shared/hooks';
import { useScreenTop } from '@shared/utils';

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

  // Every screen change replaces the whole page. On a phone the button that
  // caused it sits a screen or more down, so the new screen would otherwise
  // open part-way through; it starts at the top instead, at any width, as the
  // game's own helper did. Focus moves to the new screen's heading, since the
  // button that caused the swap has gone. Back on the menu, the next phase not
  // yet done is focused, and on a phone brought into view.
  const nextPhase = PHASES.find((phase) => !completed.includes(phase.id))?.id;
  useScreenTop(screen, {
    anyWidth: true,
    target: () =>
      screen === 'menu' && nextPhase
        ? document.querySelector(`[data-phase-card="${nextPhase}"]`)
        : null,
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <Header variant="game" backHref="/efnafraedi/1-ar/" gameTitle="Útfellingarhvörf" />

      <a href="#main-content" className="skip-link">
        Fara beint í efni
      </a>

      <main id="main-content" className="container mx-auto px-4 py-4 sm:py-8 phone:py-4">
        {screen === 'menu' && (
          <div className="mx-auto max-w-4xl">
            <p className="mb-8 text-center text-lg text-warm-600 phone:mb-3 phone:text-base">
              Tvær tærar lausnir, eitt skýjað glas — og jafnan sem segir hvað raunverulega gerðist
            </p>

            {/* On a phone the card is a flex column, so the overview paragraph can
                follow the four phases and every phase shows on the first screen.
                The paragraph previews the game rather than teaching it: its one
                statement of chemistry is Skilja's second rung, where the
                ladder teaches it, and Kanna deliberately comes before any rule.
                It holds nothing focusable. Only blocks without a control move:
                the paragraph and the reading under the phases take order 1, so
                the phase buttons keep their place and the tab order is what is
                seen (design §3 Menu, P4). */}
            <div className="rounded-lg bg-white p-5 shadow-md sm:p-8 phone:flex phone:flex-col phone:p-3">
              <h2 className="mb-2 text-2xl font-bold text-warm-800 phone:mb-3 phone:text-xl">
                Fjórir áfangar
              </h2>
              <p className="mb-6 text-warm-600 phone:order-1 phone:mb-0 phone:mt-4">
                Þú kannt að stilla efnajöfnur. Hér bætist við spurningin sem efnajafnan svarar ekki:
                hvað af því sem stendur í jöfnunni tók raunverulega þátt? Uppleyst jónaefni er ekki
                heilt í vatninu — það er sundrað í lausar jónir — og oft eru það aðeins tvær þeirra
                sem gera nokkuð.
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

              <div className="mt-6 rounded-lg bg-warm-50 p-4 phone:order-1">
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

              <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 phone:order-1">
                <h3 className="mb-2 font-semibold text-amber-800">Af hverju útfellingarhvörf?</h3>
                <p className="text-sm text-amber-700">
                  Svona eru þungmálmar teknir úr skólpi, svona myndast kalkið í hraðsuðukatlinum, og
                  svona er klóríð mælt í drykkjarvatni. Þetta er líka fyrsta efnahvarfið sem þú
                  skrifar á þrjá mismunandi vegu — og sá þriðji, nettójónajafnan, er sá sem
                  efnafræðingar nota, því hann sleppir öllu sem skiptir ekki máli.
                </p>
              </div>

              <div className="mt-3 text-center text-xs text-warm-500 phone:order-1">
                <strong>Námsleiðin:</strong> Einingagreining → Lotukerfið → Nafnakerfið → Mólmassi →
                Reynsluformúlur → Stilla efnajöfnur → <u>Útfellingarhvörf</u> → Takmarkandi →
                Lausnir → Einingakeðjan
              </div>
              <div className="mt-2 text-center text-xs text-warm-400 phone:order-1">
                Kafli 4 — Chemistry: The Central Science (Brown et al.)
              </div>
            </div>
          </div>
        )}

        {screen === 'kanna' && (
          <KannaScreen onComplete={() => markCompleted('kanna', 'skilja')} onBack={backToMenu} />
        )}

        {screen === 'skilja' && (
          <SkiljaScreen onComplete={() => markCompleted('skilja', 'aefa')} onBack={backToMenu} />
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
