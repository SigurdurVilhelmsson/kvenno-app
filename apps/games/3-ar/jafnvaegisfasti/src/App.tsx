import { useCallback, useMemo, useRef, useState } from 'react';

import { ErrorBoundary, Header, MenuCard, MenuProgress } from '@shared/components';
import type { MenuCardTone } from '@shared/components';
import { useGameProgress } from '@shared/hooks';
import { useRevealTopOnDesktop, useScreenTop } from '@shared/utils';

import { AefaScreen } from './components/AefaScreen';
import { BeitaScreen } from './components/BeitaScreen';
import { KannaScreen } from './components/KannaScreen';
import { NaermyndScreen } from './components/NaermyndScreen';
import { SkiljaScreen } from './components/SkiljaScreen';
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
    description: 'Fjórar ólíkar blöndur af sama hvarfi. Hvar enda þær?',

    icon: '🔍',
  },
  {
    id: 'skilja',
    number: '2',
    name: 'Skilja',
    description: 'Stæðan, föstu efnin sem detta út, Kc á móti Kp, og Q.',

    icon: '💡',
  },
  {
    id: 'aefa',
    number: '3',
    name: 'Æfa',
    description: 'Skrifa stæðuna, spá fyrir um stefnu, breyta Kc í Kp, tengja jafnvægi saman.',

    icon: '✏️',
  },
  {
    id: 'beita',
    number: '4',
    name: 'Beita',
    description: 'ICE-töflur í styrkjum og í hlutþrýstingi — og dæmi þar sem nálgunin dugar ekki.',

    icon: '🎯',
  },
];

function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  const mainRef = useRef<HTMLElement>(null);

  const { progress, updateProgress, resetProgress } = useGameProgress<Progress>(
    'jafnvaegisfasti-progress',
    {
      completed: [],
    }
  );

  const completed = useMemo(() => progress.completed ?? [], [progress.completed]);

  // Kanna and Skilja end on "Áfram í Skilja" / "Áfram í Æfa" and go on to the phase they
  // name, as in Sýrufastinn and Leysnijafnvægi; Kanna's "Áfram" used to drop the student on
  // the menu.
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
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
          <div className="mx-auto max-w-3xl">
            {/* On a phone the card is a flex column, so the overview paragraph can
                follow the four phases: every phase shows on the first screen.
                The paragraph says what the phases will do rather than teaching
                it, and holds nothing focusable (design §3 Menu). Only blocks
                without a control move: the paragraph and the reading under the
                phases take order 1, so the phase buttons keep their place and
                the tab order is what is seen. */}
            <div className="rounded-2xl bg-white p-4 shadow-2xl sm:p-6 md:p-8 phone:flex phone:flex-col phone:p-3">
              <p className="mb-4 text-warm-600 phone:mb-3">
                Ein tala segir hvar hvarfið stöðvast — og hvaða leið blandan þarf að fara til að
                komast þangað
              </p>
              <h2 className="mb-2 text-2xl font-bold text-warm-800 phone:mb-2 phone:text-xl">
                Fjórir áfangar
              </h2>
              <p className="mb-6 text-warm-600 phone:order-1 phone:mb-0 phone:mt-4">
                Þú hefur séð efnajafnvægi hliðrast til hægri og vinstri. Hér kemur talan á bak við
                það: hvernig hún er skrifuð, hvað hún segir um blönduna, og hvernig maður reiknar út
                hvar jafnvægið lendir í stað þess að segja bara í hvora áttina það færist.
              </p>

              {/* Nærmynd: the approach to equilibrium, drawn. Not one of the four phases
                  and never marked done; nothing in it is graded. */}
              <MenuCard
                tone="naermynd"
                icon="🔬"
                title="Nærmynd"
                subtitle="Sjáðu sameindirnar: ein blanda úr hvarfefnum, önnur úr myndefnum, og Q sem stefnir á K í báðum."
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
                <h3 className="mb-2 font-semibold text-warm-700">📐 Lykilformúlur</h3>
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

        {screen === 'naermynd' && <NaermyndScreen onBack={backToMenu} />}

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
