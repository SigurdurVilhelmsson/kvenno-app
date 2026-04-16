import type { LevelConfig } from './Level';

function Level1Intro() {
  return (
    <>
      <div className="bg-white rounded-xl shadow-lg p-6 mb-4">
        <h2 className="text-xl font-bold text-warm-800 mb-3">Af hverju jöfnum við efnajöfnur?</h2>
        <p className="text-warm-700 text-sm leading-relaxed mb-3">
          <strong>Massavarðveislulögmálið</strong> segir að atóm hverfa ekki og myndast ekki í
          efnahvörfum — þau breyta bara um tengsl. Fjöldi atóma af hverju frumefni verður að vera sá
          sami beggja megin við örina.
        </p>
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
          Ef 4 vetnisatóm eru vinstra megin verða 4 vetnisatóm að vera hægra megin.
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 mb-4">
        <h3 className="text-lg font-bold text-warm-800 mb-3">Dæmi: Vatn myndast</h3>
        <div className="bg-warm-50 rounded-lg p-4 mb-4 text-center">
          <p className="font-mono text-lg text-warm-800 mb-1">
            H<sub>2</sub> + O<sub>2</sub> → H<sub>2</sub>O
          </p>
          <p className="text-xs text-warm-500">Ójöfnuð jafna</p>
        </div>
        <div className="space-y-3 text-sm text-warm-700">
          <div className="flex items-start gap-2">
            <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">
              1
            </span>
            <p>
              <strong>Telja atóm:</strong> Vinstri: 2 H, 2 O. Hægri: 2 H, 1 O. Súrefni er ójafnað!
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">
              2
            </span>
            <p>
              <strong>
                Setja 2 framan við H<sub>2</sub>O:
              </strong>{' '}
              Nú er hægri hliðin 2 H<sub>2</sub>O = 4 H og 2 O. Súrefni jafnað!
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">
              3
            </span>
            <p>
              <strong>Athuga vetni:</strong> Hægri: 4 H. Vinstri: 2 H. Setja 2 framan við H
              <sub>2</sub> — nú eru 4 H beggja megin.
            </p>
          </div>
        </div>
        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3 text-center">
          <p className="font-mono text-lg text-green-800">
            <strong>2</strong>H<sub>2</sub> + O<sub>2</sub> → <strong>2</strong>H<sub>2</sub>O
          </p>
          <p className="text-xs text-green-600 mt-1">Jöfnuð jafna — 4 H og 2 O beggja megin</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h3 className="text-lg font-bold text-warm-800 mb-3">Aðferð til að jafna</h3>
        <ol className="space-y-2 text-sm text-warm-700 list-decimal list-inside">
          <li>
            Jafnaðu <strong>málma</strong> fyrst (Na, Fe, Ca, ...)
          </li>
          <li>
            Síðan <strong>málmleysingja</strong> sem ekki eru O eða H (Cl, N, S, ...)
          </li>
          <li>
            Næst <strong>súrefni</strong> (O)
          </li>
          <li>
            Að lokum <strong>vetni</strong> (H)
          </li>
        </ol>
        <p className="text-xs text-warm-500 mt-3">
          Þessi röð virkar í flestum tilvikum. Athugaðu alltaf allan fjölda í lokin!
        </p>
      </div>
    </>
  );
}

export const LEVEL1_CONFIG: LevelConfig = {
  difficulty: 'easy',
  title: 'Einfaldar jöfnur – Stig 1',
  bgFrom: 'from-green-50',
  intro: <Level1Intro />,
  instructions: 'Notaðu + og - takkana til að breyta stuðlum og jafna jöfnuna.',
  highlightUnbalancedOnHint: true,
  hintSource: 'reaction-hint',
};

export const LEVEL2_CONFIG: LevelConfig = {
  difficulty: 'medium',
  title: 'Miðlungs jöfnur – Stig 2',
  bgFrom: 'from-blue-50',
  hintSource: 'reaction-hint',
};

export const LEVEL3_CONFIG: LevelConfig = {
  difficulty: 'hard',
  title: 'Erfiðar jöfnur – Stig 3',
  bgFrom: 'from-purple-50',
  hintSource: 'dynamic-unbalanced',
};
