import type { Ref } from 'react';

import { Header, MenuCard, MenuProgress } from '@shared/components';

import { questions, type Level } from '../data';
import { GameMode, GasLawProgress } from '../types';

interface MenuScreenProps {
  progress: GasLawProgress;
  resetProgress: () => void;
  /** Starts a mode on a level: a level card starts practice, Keppnishamur its own buttons. */
  onStart: (mode: GameMode, level: Level) => void;
  /** Opens Nærmynd, the cylinder of molecules. */
  onNaermynd: () => void;
  /** Opens Gasblöndur og efnahvörf: Dalton's law and gas stoichiometry. */
  onBlondur: () => void;
  /** The screen's root, for App's screen-swap anchoring. */
  rootRef?: Ref<HTMLDivElement>;
}

/** A level's best practice round as `N af M rétt`, or null before one is finished. */
function roundLabel(progress: GasLawProgress, level: Level): string | null {
  const result = progress.practice?.[level];
  return result ? `${result.correct} af ${result.total} rétt` : null;
}

const LEVELS: {
  level: Level;
  icon: string;
  title: string;
  subtitle: string;
  description: string;
}[] = [
  {
    level: 1,
    icon: '🎈',
    title: 'Stig 1: Kjörgaslögmálið',
    subtitle: 'PV = nRT',
    description: 'Lærðu miðlögmálið og allar fjórar breyturnar.',
  },
  {
    level: 2,
    icon: '🔧',
    title: 'Stig 2: Sérstök tilvik',
    subtitle: 'Boyle / Charles / Gay-Lussac',
    description: 'Sjáðu hvað gerist þegar ein breyta er föst.',
  },
  {
    level: 3,
    icon: '⚖️',
    title: 'Stig 3: Samanburður',
    subtitle: 'Sameinað + Avogadro',
    description: 'Beittu mörgum lögmálum saman.',
  },
];

/**
 * Gaslögmál's menu, in pH Títrun's order (2026-11-17): the teaching box, Nærmynd, the
 * three levels as cards that start a practice round, Gasblöndur, then Keppnishamur and
 * the progress line. A level used to be chosen first and started from a mode button
 * further down.
 */
export function MenuScreen({
  progress,
  resetProgress,
  onStart,
  onNaermynd,
  onBlondur,
  rootRef,
}: MenuScreenProps) {
  const levelsDone = ([1, 2, 3] as const).filter((level) => progress.practice?.[level]).length;
  const hasProgress =
    levelsDone > 0 ||
    Object.keys(progress.challengeBest ?? {}).length > 0 ||
    (progress.challengeBestStreak ?? 0) > 0;
  return (
    <div ref={rootRef}>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
        <Header variant="game" backHref="/efnafraedi/3-ar/" gameTitle="Gaslögmál" />
        <div className="min-h-screen p-4 md:p-8 phone:p-3">
          <main className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 phone:p-3">
            <p className="text-warm-600 mb-1">
              Lærðu að leysa verkefni um kjörgaslögmálið: PV = nRT
            </p>
            <p className="text-sm text-warm-500 mb-4 phone:mb-3">
              {questions.length} spurningar í boði
            </p>

            <div className="bg-purple-50 p-4 sm:p-6 rounded-xl mb-8 border border-purple-200 phone:p-3 phone:mb-4">
              <h2 className="font-bold text-purple-800 mb-3">Hvað segir PV = nRT?</h2>
              <p className="text-sm text-purple-700 mb-3">
                Gasagnir (sameindir) eru á stöðugri hreyfingu. Þegar þær rekast á veggi ílátsins
                skapa þær <strong>þrýsting</strong>. Þetta tengir saman fjórar stærðir:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-3">
                <div className="bg-white p-2 rounded">
                  <strong className="text-blue-700">P (þrýstingur)</strong> — fleiri og harðari
                  árekstrar = meiri þrýstingur
                </div>
                <div className="bg-white p-2 rounded">
                  <strong className="text-green-700">V (rúmmál)</strong> — minna ílát = fleiri
                  árekstrar
                </div>
                <div className="bg-white p-2 rounded">
                  <strong className="text-red-700">T (hitastig)</strong> — hærra T = hraðari agnir =
                  fleiri og harðari árekstrar
                </div>
                <div className="bg-white p-2 rounded">
                  <strong className="text-amber-700">n (mólfjöldi)</strong> — fleiri agnir = fleiri
                  árekstrar
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg text-center">
                <p className="font-mono text-purple-800 text-lg">PV = nRT</p>
                <p className="text-xs text-purple-600 mt-1">
                  R = 0,08206 L·atm/(mól·K) — tengir einingarnar saman
                </p>
              </div>
              <p className="text-xs text-purple-600 mt-3">
                <strong>Mikilvægt:</strong> T verður alltaf að vera í Kelvin (K = °C + 273). Þetta
                lögmál gildir best fyrir gas við lágan þrýsting og hátt hitastig (kjörgas).
              </p>
            </div>

            {/* Nærmynd: nothing graded, so it sits with the teaching, before the levels. */}

            <div className="space-y-4 phone:space-y-3">
              {/* Nærmynd: the Explore phase, before any level. Nothing is graded or stored. */}
              <MenuCard
                tone="naermynd"
                icon="🔬"
                title="Nærmynd"
                subtitle="Strokkur með stimpli"
                description="Ýttu, hitaðu og bættu gasi við, og sjáðu hvernig P, V, T og n hanga saman. Ekkert er metið."
                onClick={onNaermynd}
              />
              {LEVELS.map(({ level, ...card }) => (
                <MenuCard
                  key={level}
                  tone={level}
                  {...card}
                  result={roundLabel(progress, level)}
                  data-level-card={level}
                  onClick={() => onStart('practice', level)}
                />
              ))}
              <MenuCard
                tone={4}
                icon="🫧"
                title="Gasblöndur og efnahvörf"
                subtitle="Lögmál Daltons og rúmmál lofttegunda í efnahvörfum"
                description="Mólbrot, gas safnað yfir vatni og rúmmál lofttegunda í efnahvörfum. Skýring, blanda til að kanna og átta dæmi úr kennslubókinni."
                onClick={onBlondur}
              />
            </div>

            {/* Keppnishamur: timed and scored, the one place points live (decision 1 (b)). */}
            <section
              aria-labelledby="gas-keppni-heading"
              className="mt-6 rounded-xl border-2 border-orange-200 bg-white p-4 phone:p-3"
            >
              <h2 id="gas-keppni-heading" className="font-bold text-orange-900">
                ⏱️ Keppnishamur
              </h2>
              <p className="text-sm text-warm-600 mt-1">
                90 sekúndur á spurningu, tímabónus fyrir hraða og vísbendingar í boði.
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {([1, 2, 3] as const).map((level) => {
                  const best = progress.challengeBest?.[level];
                  return (
                    <button
                      key={level}
                      type="button"
                      data-challenge-start={level}
                      aria-label={`Byrja keppni: Stig ${level}`}
                      onClick={() => onStart('challenge', level)}
                      className="rounded-lg bg-kvenno-orange px-3 py-2.5 font-semibold text-white hover:bg-kvenno-orange-600"
                    >
                      Stig {level}
                      {best !== undefined && (
                        <span className="block text-xs font-normal">Met: {best} stig</span>
                      )}
                    </button>
                  );
                })}
              </div>
              {(progress.challengeBestStreak ?? 0) > 0 && (
                <p className="mt-2 text-sm text-warm-600">
                  🔥 Besta röð: {progress.challengeBestStreak}
                </p>
              )}
            </section>

            {/* Progress: which levels are done, and the way to start over. */}
            {hasProgress && (
              <MenuProgress onReset={resetProgress} className="mt-6">
                {levelsDone} af 3 stigum lokið
              </MenuProgress>
            )}

            {/* Formula reference */}
            <div className="mt-6 bg-warm-50 p-4 rounded-xl">
              <h3 className="font-semibold text-warm-700 mb-2">📐 Lykilformúlur</h3>
              <div className="font-mono text-base md:text-sm space-y-2 text-warm-600">
                <p>
                  <strong>Kjörgaslögmálið:</strong>{' '}
                  <span className="whitespace-nowrap">PV = nRT</span>,{' '}
                  <span className="whitespace-nowrap">R = 0,08206 L·atm/(mól·K)</span>
                </p>
                <p>
                  <strong>Sameinaða gaslögmálið:</strong>{' '}
                  <span className="whitespace-nowrap">P₁V₁/T₁ = P₂V₂/T₂</span>
                </p>
                <p>
                  <strong>Kelvin:</strong> <span className="whitespace-nowrap">K = °C + 273</span>
                </p>
              </div>
              <p className="mt-3 text-xs text-warm-600 pointer-coarse:hidden">
                Lyklaborð: <kbd className="px-1 bg-warm-200 rounded">Enter</kbd> athuga svar ·{' '}
                <kbd className="px-1 bg-warm-200 rounded">H</kbd> vísbending ·{' '}
                <kbd className="px-1 bg-warm-200 rounded">S</kbd> sýna lausn
              </p>
            </div>

            <div className="mt-6 bg-amber-50 p-4 rounded-lg border border-amber-200">
              <h3 className="font-semibold text-amber-800 mb-2">Af hverju gaslögmálin?</h3>
              <p className="text-sm text-amber-700">
                Gaslögmálin útskýra veður, köfunarhættur, hvernig bílvélar virka, og af hverju
                flugvélar eru þrýstijafnaðar. Þau tengja saman þrýsting, hitastig og rúmmál.
              </p>
            </div>
            <div className="mt-3 text-center text-xs text-warm-500">
              <strong>Námsleiðin:</strong> <u>Gaslögmál</u> → Jafnvægisfastinn → Hliðrun jafnvægis →
              Sýrufastinn → Varmafræði → pH Títrun → Stuðpúðar → Leysnijafnvægi
            </div>
            <div className="mt-2 text-center text-xs text-warm-400">Kafli 9 — Efnafræði 2e</div>
          </main>
        </div>
      </div>
    </div>
  );
}
