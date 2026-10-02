import { useCallback, useMemo, useRef, useState } from 'react';

import { ErrorBoundary, Header } from '@shared/components';
import { useGameProgress } from '@shared/hooks';
import { useRevealTopOnDesktop, useScreenTop } from '@shared/utils';

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
    description: 'Fjórar ólíkar blöndur af sama hvarfi. Hvar enda þær?',
    tone: 'bg-green-500 hover:bg-green-600',
  },
  {
    id: 'skilja',
    number: '2',
    name: 'Skilja',
    description: 'Stæðan, föstu efnin sem detta út, Kc á móti Kp, og Q.',
    tone: 'bg-sky-600 hover:bg-sky-700',
  },
  {
    id: 'aefa',
    number: '3',
    name: 'Æfa',
    description: 'Skrifa stæðuna, spá fyrir um stefnu, breyta Kc í Kp, tengja jafnvægi saman.',
    tone: 'bg-kvenno-orange hover:bg-kvenno-orange-600',
  },
  {
    id: 'beita',
    number: '4',
    name: 'Beita',
    description: 'ICE-töflur í styrkjum og í hlutþrýstingi — og dæmi þar sem nálgunin dugar ekki.',
    tone: 'bg-purple-600 hover:bg-purple-700',
  },
];

function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  const mainRef = useRef<HTMLElement>(null);

  const { progress, updateProgress } = useGameProgress<Progress>('jafnvaegisfasti-progress', {
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
  // next phase not yet done is brought into view on a phone and focused.
  const nextPhase = PHASES.find((phase) => !completed.includes(phase.id))?.id;
  useScreenTop(screen, {
    target: () =>
      screen === 'menu' && nextPhase
        ? document.querySelector(`[data-phase-card="${nextPhase}"]`)
        : null,
  });
  // A desktop window keeps what the game's own helper did there, at any width:
  // a phase opened from low down the menu, or the menu returned to from the
  // foot of a phase, brings the top of <main> back under the header.
  useRevealTopOnDesktop(mainRef, screen);

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <Header variant="game" backHref="/efnafraedi/3-ar/" gameTitle="Jafnvægisfastinn" />

      <a href="#main-content" className="skip-link">
        Fara beint í efni
      </a>

      <main
        ref={mainRef}
        id="main-content"
        className="container mx-auto px-4 py-4 sm:py-8 phone:py-3"
      >
        {screen === 'menu' && (
          <div className="mx-auto max-w-4xl">
            <p className="mb-6 text-center text-lg text-warm-600 sm:mb-8 phone:mb-3 phone:text-sm">
              Ein tala segir hvar hvarfið stöðvast — og hvaða leið blandan þarf að fara til að
              komast þangað
            </p>

            {/* On a phone the card is a flex column, so the overview paragraph can
                follow the four phases: every phase shows on the first screen.
                The paragraph says what the phases will do rather than teaching
                it, and holds nothing focusable (design §3 Menu). Only blocks
                without a control move: the paragraph and the reading under the
                phases take order 1, so the phase buttons keep their place and
                the tab order is what is seen. */}
            <div className="rounded-lg bg-white p-5 shadow-md sm:p-8 phone:flex phone:flex-col phone:p-3">
              <h2 className="mb-2 text-2xl font-bold text-warm-800 phone:mb-2 phone:text-xl">
                Fjórir áfangar
              </h2>
              <p className="mb-6 text-warm-600 phone:order-1 phone:mb-0 phone:mt-4">
                Þú hefur séð efnajafnvægi hliðrast til hægri og vinstri. Hér kemur talan á bak við
                það: hvernig hún er skrifuð, hvað hún segir um blönduna, og hvernig maður reiknar út
                hvar jafnvægið lendir í stað þess að segja bara í hvora áttina það færist.
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
                      Að skrifa jafnvægisstæðu þar sem stuðlarnir verða veldisvísar — og af hverju
                      föst efni og hreinir vökvar eru ekki með
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-orange-500">✓</span>
                    <span>
                      Að Kc og Kp eru sami fastinn, tengd með (R·T) í veldinu Δn — og að Δn telur
                      aðeins gas
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-orange-500">✓</span>
                    <span>
                      Að hvarfstuðullinn Q er sama stæðan utan jafnvægis, svo Q á móti K segir í
                      hvora áttina hvarfið gengur
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-orange-500">✓</span>
                    <span>
                      Að reikna jafnvægisstyrki með ICE-töflu, og hvenær{' '}
                      <span className="whitespace-nowrap">5 % reglan</span> leyfir styttri leiðina
                    </span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 rounded-lg bg-warm-50 p-4 phone:order-1">
                <h3 className="mb-2 font-semibold text-warm-700">Lykilformúlur</h3>
                <div className="space-y-2 font-mono text-sm text-warm-600">
                  <p>
                    <strong>Jafnvægisstæðan:</strong> Kc = [myndefni]ⁿ / [hvarfefni]ᵐ
                  </p>
                  <p>
                    <strong>Hvarfstuðullinn:</strong> Q = sama stæða, hvenær sem er
                  </p>
                  <p>
                    <strong>Kc og Kp:</strong> Kp = Kc · (R·T)
                    <sup className="pointer-coarse:text-[12px]">Δn</sup>, Δn = mól gass í myndefnum
                    − í hvarfefnum
                  </p>
                  <p>
                    <strong>Nálgunin:</strong> sleppa x ef breytingin er undir{' '}
                    <span className="whitespace-nowrap">5 %</span> af upphafsstyrknum
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 phone:order-1">
                <h3 className="mb-2 font-semibold text-amber-800">Af hverju jafnvægisfastinn?</h3>
                <p className="text-sm text-amber-700">
                  Haber-ferlið bindur nitur úr andrúmsloftinu í áburð og heldur þar með uppi
                  matvælaframleiðslu fyrir milljarða manna. Jafnvægisfastinn er talan sem segir
                  verkfræðingnum hversu mikið ammóníak fæst við tiltekinn hita og þrýsting — og hún
                  er líka ástæðan fyrir því að ferlið er keyrt við aðstæður sem eru dýrar en gefa
                  meira. Sama tala ræður því hversu mikið súrefni blóðrauðinn þinn sleppir í vöðva,
                  og hversu mikill kalksteinn leysist upp í dropasteinshelli.
                </p>
              </div>

              <div className="mt-3 text-center text-xs text-warm-500 phone:order-1">
                <strong>Námsleiðin:</strong> Gaslögmál → <u>Jafnvægisfastinn</u> → Hliðrun jafnvægis
                → Sýrufastinn → Varmafræði → pH Títrun → Stuðpúðar → Leysnijafnvægi
              </div>
              <div className="mt-2 text-center text-xs text-warm-400 phone:order-1">
                Kafli 13 — Efnafræði 2e
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
