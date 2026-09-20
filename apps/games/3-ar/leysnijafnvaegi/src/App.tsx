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
    description: '„Óleysanlegt“ er tala — og hún hreyfist þegar þú bætir við samjón.',
    tone: 'bg-green-500 hover:bg-green-600',
  },
  {
    id: 'skilja',
    number: '2',
    name: 'Skilja',
    description: 'Upplausnarjafna → Ksp → 4s³ → mólarleysni, á 2:1 salti.',
    tone: 'bg-sky-600 hover:bg-sky-700',
  },
  {
    id: 'aefa',
    number: '3',
    name: 'Æfa',
    description: 'Reiknaðu mólarleysni út frá Ksp, og Ksp út frá mælingu.',
    tone: 'bg-kvenno-orange hover:bg-kvenno-orange-dark',
  },
  {
    id: 'beita',
    number: '4',
    name: 'Beita',
    description: 'Q á móti Ksp með raunverulegri þynningu, og hlutfelling.',
    tone: 'bg-purple-600 hover:bg-purple-700',
  },
];

function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  const { progress, updateProgress } = useGameProgress<Progress>('leysnijafnvaegi-progress', {
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
      <Header variant="game" backHref="/efnafraedi/3-ar/" gameTitle="Leysnijafnvægi" />

      <a href="#main-content" className="skip-link">
        Fara beint í efni
      </a>

      <main id="main-content" className="container mx-auto px-4 py-8">
        {screen === 'menu' && (
          <div className="mx-auto max-w-4xl">
            <p className="mb-8 text-center text-lg text-warm-600">
              Í fyrsta bekk var svarið „óleysanlegt“. Hér er talan á bak við orðið — og hvenær hún
              ræður úrslitum
            </p>

            <div className="rounded-lg bg-white p-8 shadow-md">
              <h2 className="mb-2 text-2xl font-bold text-warm-800">Fjórir áfangar</h2>
              <p className="mb-6 text-warm-600">
                Útfellingarhvörf svöruðu spurningunni eftir reglu: flettu jónunum upp í
                leysnitöflunni og segðu já eða nei. Hér er sama spurning svöruð með tölu, og svarið
                er ekki alltaf það sama — hvort botnfall myndast fer eftir því hversu sterkar
                lausnirnar voru sem þú blandaðir.
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

              <div className="mt-6 rounded-lg bg-warm-50 p-4">
                <h3 className="mb-2 font-semibold text-warm-700">Lykiljöfnur</h3>
                <div className="space-y-2 font-mono text-sm text-warm-600">
                  <p>
                    <strong>Ksp:</strong> AₓB_y(s) ⇌ xAʸ⁺ + yBˣ⁻, Ksp = [Aʸ⁺]ˣ[Bˣ⁻]ʸ
                  </p>
                  <p>
                    <strong>Mólarleysni:</strong> s = (Ksp / (xˣ · yʸ))^(1/(x+y))
                  </p>
                  <p>
                    <strong>Botnfall:</strong> Q &gt; Ksp → fellur út · Q &lt; Ksp → ekkert gerist
                  </p>
                  <p>
                    <strong>Þynning:</strong> c₁V₁ = c₂V₂, alltaf áður en Q er reiknað
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
                <h3 className="mb-2 font-semibold text-amber-800">Af hverju leysnijafnvægi?</h3>
                <p className="text-sm text-amber-700">
                  Baríumsúlfat er eitrað efni sem sjúklingur drekkur viljandi fyrir
                  röntgenmyndatöku, og Ksp er nákvæmlega ástæðan fyrir því að það er óhætt.
                  Nýrnasteinar eru kalsíumoxalat sem fór yfir mörkin. Kalkið í katlinum,
                  þungmálmahreinsun í skólpi, og af hverju tannkrem með flúor virkar — allt sama
                  jafnan.
                </p>
              </div>

              <div className="mt-3 text-center text-xs text-warm-500">
                <strong>Námsleiðin:</strong> Gaslögmál → Jafnvægi → Sýrufastinn → Varmafræði → pH
                Títrun → Stuðpúðar → <u>Leysnijafnvægi</u>
              </div>
              <div className="mt-2 text-center text-xs text-warm-400">
                Kafli 17 — Chemistry: The Central Science (Brown et al.)
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
