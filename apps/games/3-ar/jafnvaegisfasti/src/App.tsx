import { useCallback, useMemo, useRef, useState } from 'react';

import { ErrorBoundary, Header } from '@shared/components';
import { useGameProgress } from '@shared/hooks';

import { AefaScreen } from './components/AefaScreen';
import { BeitaScreen } from './components/BeitaScreen';
import { KannaScreen } from './components/KannaScreen';
import { SkiljaScreen } from './components/SkiljaScreen';
import { useRevealTopOnChange } from './utils/reveal';
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
    tone: 'bg-kvenno-orange hover:bg-kvenno-orange-dark',
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

  // A phase opened from low down the menu, or the menu returned to from the
  // foot of a phase, would otherwise open at the old scroll position.
  useRevealTopOnChange(mainRef, screen);
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <Header variant="game" backHref="/efnafraedi/3-ar/" gameTitle="Jafnvægisfastinn" />

      <a href="#main-content" className="skip-link">
        Fara beint í efni
      </a>

      <main ref={mainRef} id="main-content" className="container mx-auto px-4 py-4 sm:py-8">
        {screen === 'menu' && (
          <div className="mx-auto max-w-4xl">
            <p className="mb-6 text-center text-lg text-warm-600 sm:mb-8">
              Ein tala segir hvar hvarfið stöðvast — og hvaða leið blandan þarf að fara til að
              komast þangað
            </p>

            <div className="rounded-lg bg-white p-5 shadow-md sm:p-8">
              <h2 className="mb-2 text-2xl font-bold text-warm-800">Fjórir áfangar</h2>
              <p className="mb-6 text-warm-600">
                Þú hefur séð efnajafnvægi hliðrast til hægri og vinstri. Hér kemur talan á bak við
                það: hvernig hún er skrifuð, hvað hún segir um blönduna, og hvernig maður reiknar út
                hvar jafnvægið lendir í stað þess að segja bara í hvora áttina það færist.
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

              <div className="mt-6 rounded-lg bg-warm-50 p-4">
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

              <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
                <h3 className="mb-2 font-semibold text-amber-800">Af hverju jafnvægisfastinn?</h3>
                <p className="text-sm text-amber-700">
                  Haber-ferlið bindur köfnunarefni úr andrúmsloftinu í áburð og heldur þar með uppi
                  matvælaframleiðslu fyrir milljarða manna. Jafnvægisfastinn er talan sem segir
                  verkfræðingnum hversu mikið ammóníak fæst við tiltekinn hita og þrýsting — og hún
                  er líka ástæðan fyrir því að ferlið er keyrt við aðstæður sem eru dýrar en gefa
                  meira. Sama tala ræður því hversu mikið súrefni blóðrauðinn þinn sleppir í vöðva,
                  og hversu mikill kalksteinn leysist upp í dropasteinshelli.
                </p>
              </div>

              <div className="mt-3 text-center text-xs text-warm-500">
                <strong>Námsleiðin:</strong> Gaslögmál → <u>Jafnvægisfastinn</u> → Hliðrun jafnvægis
                → Sýrufastinn → Varmafræði → pH Títrun → Stuðpúðar → Leysnijafnvægi
              </div>
              <div className="mt-2 text-center text-xs text-warm-400">Kafli 13 — Efnafræði 2e</div>
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
