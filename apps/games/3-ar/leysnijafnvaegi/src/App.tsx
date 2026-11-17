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
    description: '„Óleysanlegt“ er tala — og hún hreyfist þegar þú bætir við samjón.',

    icon: '🔍',
  },
  {
    id: 'skilja',
    number: '2',
    name: 'Skilja',
    description: 'Upplausnarjafna → Ksp → 4s³ → mólarleysni, á 2:1 salti.',

    icon: '💡',
  },
  {
    id: 'aefa',
    number: '3',
    name: 'Æfa',
    description: 'Reiknaðu mólarleysni út frá Ksp, og Ksp út frá mælingu.',

    icon: '✏️',
  },
  {
    id: 'beita',
    number: '4',
    name: 'Beita',
    description: 'Q á móti Ksp með raunverulegri þynningu, og hlutfelling.',

    icon: '🎯',
  },
];

function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  const mainRef = useRef<HTMLElement>(null);
  const { progress, updateProgress, resetProgress } = useGameProgress<Progress>(
    'leysnijafnvaegi-progress',
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
      <Header variant="game" backHref="/efnafraedi/3-ar/" gameTitle="Leysnijafnvægi" />

      <a href="#main-content" className="skip-link">
        Fara beint í efni
      </a>

      <main
        ref={mainRef}
        id="main-content"
        className="container mx-auto px-4 py-4 sm:py-8 phone:py-4"
      >
        {screen === 'menu' && (
          <div className="mx-auto max-w-3xl">
            {/* On a phone the card is a flex column, so the overview paragraph can
                follow the four phases: every phase shows on the first screen.
                The paragraph says what the phases will do — the rule against the
                number — rather than teaching it, and holds nothing focusable
                (design §3 Menu). Only blocks without a control move: the
                paragraph and the reading under the phases take order 1, so the
                phase buttons keep their place and the tab order is what is
                seen. */}
            <div className="rounded-2xl bg-white p-4 shadow-2xl sm:p-6 md:p-8 phone:flex phone:flex-col phone:p-3">
              <p className="mb-4 text-warm-600 phone:mb-3">
                Í fyrsta bekk var svarið „óleysanlegt“. Hér er talan á bak við orðið — og hvenær hún
                ræður úrslitum
              </p>
              <h2 className="mb-2 text-2xl font-bold text-warm-800 phone:mb-3 phone:text-xl">
                Fjórir áfangar
              </h2>
              <p className="mb-6 text-warm-600 phone:order-1 phone:mb-0 phone:mt-4">
                Útfellingarhvörf svöruðu spurningunni eftir reglu: flettu jónunum upp í
                leysnitöflunni og segðu já eða nei. Hér er sama spurning svöruð með tölu, og svarið
                er ekki alltaf það sama — hvort botnfall myndast fer eftir því hversu sterkar
                lausnirnar voru sem þú blandaðir.
              </p>

              {/* Nærmynd: the ions behind Ksp. Not one of the four phases and never
                  marked done; nothing in it is graded. */}
              <MenuCard
                tone="naermynd"
                icon="🔬"
                title="Nærmynd"
                subtitle="Sjáðu jónirnar: mettuð lausn, samjón, tvær lausnir blandaðar og Mohr-títrun."
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
                    <span>Að skrifa leysnimargfeldi út frá upplausnarjöfnu</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-orange-500">✓</span>
                    <span>
                      Að reikna mólarleysni úr Ksp — og af hverju kvaðratrótin dugar bara fyrir 1:1
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-orange-500">✓</span>
                    <span>Samjónahrif: af hverju salt leysist verr í lausn sem á jónina fyrir</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-orange-500">✓</span>
                    <span>
                      Að bera Q saman við Ksp — og að þynna fyrst, sem er skrefið sem klikkar
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-orange-500">✓</span>
                    <span>Hlutfellingu, þar sem lægra Ksp fellur ekki endilega út fyrst</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 rounded-lg bg-warm-50 p-4 phone:order-1">
                <h3 className="mb-2 font-semibold text-warm-700">📐 Lykilformúlur</h3>
                {/* Each formula wraps as a whole, onto the line below its label,
                    rather than breaking between its terms on a phone. */}
                <div className="space-y-2 font-mono text-sm text-warm-600">
                  <p>
                    <strong>Ksp:</strong>{' '}
                    <span className="whitespace-nowrap">AₓB_y(s) ⇌ xAʸ⁺ + yBˣ⁻,</span>{' '}
                    <span className="whitespace-nowrap">Ksp = [Aʸ⁺]ˣ[Bˣ⁻]ʸ</span>
                  </p>
                  <p>
                    <strong>Mólarleysni:</strong> <span className="whitespace-nowrap">s =</span>{' '}
                    <span className="whitespace-nowrap">(Ksp / (xˣ · yʸ))^(1/(x+y))</span>
                  </p>
                  <p>
                    <strong>Botnfall:</strong>{' '}
                    <span className="whitespace-nowrap">Q &gt; Ksp → fellur út</span> ·{' '}
                    <span className="whitespace-nowrap">Q &lt; Ksp → ekkert gerist</span>
                  </p>
                  <p>
                    <strong>Þynning:</strong> <span className="whitespace-nowrap">c₁V₁ = c₂V₂</span>
                    , alltaf áður en Q er reiknað
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 phone:order-1">
                <h3 className="mb-2 font-semibold text-amber-800">Af hverju leysnijafnvægi?</h3>
                <p className="text-sm text-amber-700">
                  Sjúklingur drekkur baríumsúlfat viljandi fyrir röntgenmyndatöku þótt baríumjónir
                  séu eitraðar, og Ksp er nákvæmlega ástæðan fyrir því að það er óhætt. Nýrnasteinar
                  eru kalsíumoxalat sem fór yfir mörkin. Kalkið í katlinum, þungmálmahreinsun í
                  skólpi, og af hverju tannkrem með flúor virkar — allt sama jafnan.
                </p>
              </div>

              <div className="mt-3 text-center text-xs text-warm-500 phone:order-1">
                <strong>Námsleiðin:</strong> Gaslögmál → Jafnvægisfastinn → Hliðrun jafnvægis →
                Sýrufastinn → Varmafræði → pH Títrun → Stuðpúðar → <u>Leysnijafnvægi</u>
              </div>
              <div className="mt-2 text-center text-xs text-warm-400 phone:order-1">
                Kafli 15 — Efnafræði 2e
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
