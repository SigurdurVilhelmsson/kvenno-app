# What you decided in February

**Scope.** 2026-01-26 → 2026-02-05, 57 commits, `387 files changed, 136762 insertions(+), 3614 deletions(-)`, PRs #87–#100. Everything in that window was authored in the cloud and never reached the 2026-02-19 copy-from-disk that became kvenno-app. This document recovers the _decisions_, not the code.

Shorthand used throughout: **OLD** = `/home/siggi/dev/repos/namsbokasafn-leikir` (frozen at `379266e`), **NEW** = `/home/siggi/dev/repos/kvenno-app`.

---

## The short version

Four days of work produced one thing you cannot re-derive and three things you can, expensively. The one is the **Icelandic terminology ruling** — PRs #99 and #100, 2026-02-04/05, ~30 term corrections across 25 files in 13 games, every one of them checked against `Orðasafn í efnafræði` and every one of them still wrong in kvenno-app today. The three are the **curriculum gap analyses** (one per year, against Brown), the **pedagogical criteria** the games were reviewed by, and a **priority ranking** that was overwritten before it was spent.

**Provenance, stated plainly, because it changes how much weight each item carries.** Every document and every game in the window is `Author: Claude <noreply@anthropic.com>`. Across PRs #87–#100: **zero review comments, zero issue-thread discussion, zero issues in any state, median merge latency ~10 seconds** (#88 created 16:08:54, merged 16:09:01). That is not "the discussion could not be found" — there was none. Two acts in the whole window are verifiably yours: commit `dc5e614` (2026-01-27, the Y1 enhancement batch) and `e3460b1` (2026-02-04 07:27:35 +0000, `Sigurður E. Vilhelmsson`, "Add files via upload" — the glossary, put at the repo root so the cloud agent could see it; the sweep ran 3 h 22 m later). So: an agent proposed, an auto-merge accepted, and the only human ruling in the set is _which dictionary governs_. Below, "the February review decided" means an agent acting for you; **"you"** is reserved for `review-prompt.md` (`f65c10f`, 2025-11-29, your own voice) and the glossary.

Worth having back, in order:

1. **The terminology ruling.** Six of the eleven questions a later kvenno-app review filed as "blocked on a teaching decision from Siggi" already have citations. Three more are contested-with-evidence rather than blank. One is a shipped correctness bug, not a preference. Only two are genuinely open.
2. **The Y1 chapter-4 hole was answered on 2026-02-03 and built the next morning.** `CURRICULUM_REVIEW.md:220` asks whether electrolytes, solubility rules, net ionic equations and neutralization "become new games, new levels in Lausnir/Takmarkandi, or stay off-platform." February answered: new games — `Jónir í lausn` (#1 must-have) and `Sýrur og basar` (#3) — _and_ a Lausnir enhancement, both.
3. **Ka/Kb was ruled a prerequisite of pH Títrun.** _"Currently pH Titration assumes students know Ka/Kb calculations, but these aren't taught"_ (`YEAR-3-DEVELOPMENT-PLAN.md:362`ff). A 3-level, 26-problem game was built to sit before it. kvenno-app ships pH Títrun and has no Ka/Kb node. The hole is live in production.
4. **A cheap tier nobody has looked at:** content added _inside_ files that did migrate — 25 real-world dimensional-analysis scenarios, the g↔mol / mol↔particles / mol↔L conversion machinery, solubility-vs-temperature data. Not whole games. Data and single components that drop into games you already ship.

---

## The terminology decisions

### The authority, and how it was established

The glossary's _path_ history is the decision:

```
eec05d3  2025-12-06 17:19  Sigurður E. Vilhelmsson  root: "Orðasafn í efnafræði.md"
edce36b  2026-01-18 12:49  SigurdurVilhelmsson      → docs/ordabok.md
24518f1  2026-01-22 11:35  SigurdurVilhelmsson      → shared/i18n/ordabok.md
912d997  2026-01-25 20:59  ← freeze (file present, in shared/)
e3460b1  2026-02-04 07:27  Sigurður E. Vilhelmsson  duplicate copy back at repo root
cf7e31b  2026-02-04 10:49  the sweep (PR #99, merged 11:46)
ecfb082  2026-02-05 09:13  the follow-up (PR #100, merged 09:20)
```

You moved it **into the shared library** three days before the freeze — the same place it sits today as `packages/shared/i18n/ordabok.md`. Promoting a reference file into `shared/` is the statement that it governs all games. It was never deleted; the 07:27 upload is a duplicate for agent visibility, not a restoration. `md5sum` is `0eb4c077b983fbbd20c5459d7962931c` for all three copies — 594 lines, 593 `en-US;is-IS` pairs.

**Authority order, as a repeatable test:**

1. **`packages/shared/i18n/ordabok.md`** — where it rules, it rules.
2. **`/home/siggi/dev/repos/namsbokasafn-efni`** — the school's own Icelandic textbook corpus. Decisive where the glossary is silent. `grep -roi "<stem>[a-uáéíóúýþæö]*" --include=*.md . | wc -l` is the whole test.
3. **You** — only where both are silent or they disagree.

Two cautions on the glossary itself. It contains at least one internal ambiguity: `resonance;vok` (`:473`) _and_ `resonance;samhrif` (`:474`) — #99 chose **samhrif**, and without that record it gets re-litigated. And #99 knowingly diverged from it in about eight places (see the last table in this section), so "adopt `ordabok.md`" is not a mechanical operation.

### Ruling vs draft — read this before importing any Icelandic string

`cf7e31b` + `ecfb082` touched exactly these 15 game directories:

```
1-ar: hlutfallsgreining, jonir-i-lausn, lotukerfid, molmassi
2-ar: electrochemistry, hess-law, kinetics, lewis-structures, organic-reactions, vsepr-geometry
3-ar: buffer-recipe-creator, equilibrium-shifter, ka-kb-jafnvaegi, ph-titration, thermodynamics-predictor
```

(`cf7e31b`'s own body says _"25 files in 12 games"_; the file list spans 13 directories. Minor, but it is the most-cited primary source in this recovery, so: the body's count does not match the file.)

**Nine games' vocabulary was never seen by the pass** — `gerdir-efnahvarfa`, `stilltu-efnajofnur`, `markverdir-tolustafir`, `flokkun-efna`, `nafnakerfid`, `sydur-og-basar`, `uppbygging-atomanna`, `calorimetry`, `solubility-equilibrium`. Terms from those files are **agent coinages, not rulings.** Importing them wholesale re-commits exactly the error #99 corrected — which is not hypothetical: `ecfb082` fixed `Ómálmur → Málmleysingi` on 2026-02-05, and `8ce63d5` (2026-04-14) wrote a brand-new `lotukerfid` in kvenno-app that reproduced the identical error at `apps/games/1-ar/lotukerfid/src/data/elements.ts:52`.

### The ruling — every term, with its glossary citation

`ordabok` = line in `packages/shared/i18n/ordabok.md`. All line citations below were re-verified against the shipped file. **Status** describes kvenno-app today (`grep -rn --include=*.ts --include=*.tsx` over `apps/games`, deliberately excluding `ordabok.md` itself).

| Wrong                              | Ruled correct                                               | English               | ordabok                | Status in kvenno-app                                                                                                                                                                                                                   |
| ---------------------------------- | ----------------------------------------------------------- | --------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Skammtavarmi`                     | **Vermi**                                                   | enthalpy              | `:198`                 | **live**, 6 lines / 5 files: `hess-law/src/App.tsx:190`, `hess-law/src/i18n.ts:15`, `hess-law/src/components/Level1.tsx:23,289`, `hess-law/src/data/challenges.ts:27`, `thermodynamics-predictor/src/i18n.ts:38`                       |
| `Gibbs orka`                       | **Gibbs fríorka**                                           | Gibbs free energy     | `:242`                 | **live**, `thermodynamics-predictor/src/i18n.ts:11,14,15,40` (`:11` is the inflected `Gibbs orkuna`)                                                                                                                                   |
| `Sjálfspyrjandi`                   | **Sjálfgengt / sjálfgengur**                                | spontaneous           | `:515`                 | **live**, `thermodynamics-predictor/src/i18n.ts:11,15,26,41,42,50,51,52,53,59` (10 sites) — plus a _fifth_ word, `sjálfviljugheit`, at `App.tsx:142,155,282`                                                                           |
| `sjálfvirkni`                      | **sjálfgengi**                                              | spontaneity           | `:514`                 | `sjálfvirkur` means _automatic_; explicitly ruled out in PR #100's body                                                                                                                                                                |
| `Varmagefjandi`                    | **Útvermið**                                                | exothermic            | `:216`                 | live, `thermodynamics-predictor`                                                                                                                                                                                                       |
| `Varmatökandi`                     | **Innvermið**                                               | endothermic           | `:195`                 | live, `thermodynamics-predictor/src/i18n.ts:44`                                                                                                                                                                                        |
| `Stakeindir`                       | **Rafeindapör**                                             | lone pair             | `:319`                 | **live**, `lewis-structures/src/i18n.ts:38` + prose `:15,20`; `vsepr-geometry/src/i18n.ts:25` titles a whole level _"Stig 2: Stakeindir"_                                                                                              |
| `Samómun`                          | **Samhrif**                                                 | resonance             | `:474`                 | live, `lewis-structures/src/i18n.ts:43`                                                                                                                                                                                                |
| `Einfalt / Tvöfalt / Þrefalt band` | **Eintengi / Tvítengi / Þrítengi**                          | bond order            | `:498`, `:155`, `:564` | live, `lewis-structures/src/i18n.ts:39-41`                                                                                                                                                                                             |
| `hornrétt`                         | **beygð**                                                   | bent                  | `:55`                  | live, `vsepr-geometry/src/i18n.ts:22`                                                                                                                                                                                                  |
| `fjórhliða`                        | **ferflötungur**                                            | tetrahedral           | `:547`                 | live, same line                                                                                                                                                                                                                        |
| `þríhliða slétt`                   | **þríhyrningslaga flöt**                                    | trigonal planar       | `:562`                 | live, same line                                                                                                                                                                                                                        |
| `þríhliða pýramída`                | **þríhyrningslaga pýramídi**                                | trigonal pyramidal    | `:563`                 | live, `vsepr-geometry`                                                                                                                                                                                                                 |
| `þríhliða tvípýramída`             | **þríhyrningslaga tvípýramídi**                             | trigonal bipyramidal  | —                      | live, `vsepr-geometry`                                                                                                                                                                                                                 |
| `Frumskref`                        | **Grunnskref**                                              | elementary step       | `:189`                 | **live** ×4, `kinetics/src/App.tsx:120,145,276`, `data/level3-questions.ts:96`                                                                                                                                                         |
| `hraðaákvarðandi skref`            | **hraðatakmarkandi skref**                                  | rate-determining step | `:455`                 | **live** ×8, `kinetics/src/App.tsx:276`, `data/level3-questions.ts:66,73`                                                                                                                                                              |
| `Indikator`                        | **Litvísir**                                                | indicator             | `:273`                 | live, `ph-titration/src/i18n.ts:40`                                                                                                                                                                                                    |
| `Títrefni`                         | **Títrantur**                                               | titrant               | `:555`                 | live, `ph-titration/src/i18n.ts:43`                                                                                                                                                                                                    |
| `púffer`                           | **stuðpúði**                                                | buffer                | `:71`                  | **live, 27 sites vs 101 correct** — see below                                                                                                                                                                                          |
| `Púffermagn`                       | **Stuðpúðageta**                                            | buffer capacity       | —                      | live, `buffer-recipe-creator`                                                                                                                                                                                                          |
| `samstæð sýra` / `samstæður basi`  | **samoka sýra / basi**                                      | conjugate acid/base   | `:116-117`             | live, `buffer-recipe-creator/src/i18n.ts:15`                                                                                                                                                                                           |
| `samþjöppuð sýra/basi`             | **samoka**                                                  | conjugate             | `:117`                 | **live at 7 sites**, not 3: `ph-titration/src/data/level2-puzzles.ts:36,60,74`, `level1-challenges.ts:100,103,212`, `level3-challenges.ts:226`                                                                                         |
| `sundrun`                          | **klofnun** — _scoped: dissociation, **not** decomposition_ | dissociation          | `:149`                 | `hess-law/src/data/challenges.ts:62,119,121` uses `sundrun` for thermal _decomposition_ — correct as written, not a survivor                                                                                                           |
| `Ómálmur`                          | **Málmleysingi**                                            | nonmetal              | `:372`                 | **live**, `lotukerfid/src/data/elements.ts:52`, `molmassi/src/components/PeriodicTable.tsx:132` — and re-introduced from scratch in April                                                                                              |
| `Siðmálmar`                        | **Hliðarmálmar**                                            | transition metal      | `:558`                 | kvenno ships a **third** word, `Skiptimálmur` (`lotukerfid/src/data/elements.ts:49`, `molmassi/PeriodicTable.tsx:129`); `Hliðarmálm` = 0 hits                                                                                          |
| `Anode` / `Cathode`                | **Anóða / Katóða**                                          | electrodes            | `:34`, `:78`           | kvenno ships `kaþóðu` (`redox-reactions/src/components/ElectrochemicalCell.tsx:542`), `kaþóða`/`anóða` (`:530`), and unaccented `anoða`/`katoða` in the aria-label at `:354` — a fifth form, and the one a screen-reader student hears |
| `rafleiðari`                       | **rafkleyfi**                                               | electrolyte           | `:168`                 | 0 hits in game code (2 in `ordabok.md`, 4 in `ORPHANED_GAMES_ASSESSMENT.md`)                                                                                                                                                           |
| `Órafleiðari`                      | **Órafkleyfi**                                              | non-electrolyte       | `:371`                 | 0 in game code                                                                                                                                                                                                                         |
| `kjarnsækni`                       | **kjarnsækir**                                              | nucleophile           | `:378`                 | orphan game only                                                                                                                                                                                                                       |
| `rafeindasækni`                    | **rafsækir**                                                | electrophile          | `:185`                 | orphan game only                                                                                                                                                                                                                       |
| `reynslujafna`                     | **reynsluformúla**                                          | empirical formula     | `:193`                 | orphan game only                                                                                                                                                                                                                       |
| `sameindajafna`                    | **sameindaformúla**                                         | molecular formula     | `:357`                 | orphan game only                                                                                                                                                                                                                       |

**Three of these are correctness bugs, not preferences — do them first.**

- `Stakeindir` for _lone pairs_. `ordabok.md:450` is `radical;stakeind`. `vsepr-geometry` has a level titled "Level 2: Radicals."
- `Rafeindasækni` for _electrophile_. `ordabok.md:175` is `electron affinity;rafsækni` — a different quantity taught in the same course. #99 split them: `rafsækir` the species, `rafsækni` the property.
- `jafna` (equation) vs `formúla` (formula). The glossary encodes both — `:356` `molecular equation;sameindajafna`, `:357` `molecular formula;sameindaformúla`. #99 rewrote 15 strings in `hlutfallsgreining/src/i18n.ts` on this distinction alone. Independently flagged in `ORPHANED_GAMES_ASSESSMENT.md:342`.

**Self-contradictions inside a single shipped game** — worse in front of a student than a merely stale term, and all three were fixed in February:

| Game                       | Says                                                | And also says                                                         |
| -------------------------- | --------------------------------------------------- | --------------------------------------------------------------------- |
| `lotukerfid`               | `Málmleysingjar` (`components/Level2.tsx:306`)      | `Ómálmur` (`data/elements.ts:52`) — `ecfb082` fixed exactly this file |
| `buffer-recipe-creator`    | `samoka basa` (`App.tsx:128-129`, `Level1.tsx:475`) | `samstæða basa` (`i18n.ts:15`) — `cf7e31b` fixed exactly this line    |
| `buffer-recipe-creator`    | `Stuðpúðauppskriftir` (`i18n.ts:9`)                 | _"Af hverju **púfferar**?"_ (`App.tsx:294`)                           |
| `thermodynamics-predictor` | `Gibbs orka`, `Sjálfspyrjandi` (`i18n.ts`)          | `Gibbs frjálsa orku`, `sjálfviljugheit` (`App.tsx:282`)               |

The buffer count is the sharpest: **27 wrong vs 101 correct in the same product.** Five nav labels say `Púfferar` — `thermodynamics-predictor/src/App.tsx:461`, `buffer-recipe-creator/src/App.tsx:302`, `ph-titration/src/App.tsx:345`, `equilibrium-shifter/src/App.tsx:469`, `gas-law-challenge/src/components/MenuScreen.tsx:243` — pointing at a game titled `Stuðpúðauppskriftir`. One find-and-replace plus the Y3 chain line in `CLAUDE.md`. Smallest shippable item in this document.

### The "blocked on a teaching decision from Siggi" list — recomputed

Eleven questions were filed against `ORPHANED_GAMES_ASSESSMENT.md`. Corrected score: **6 decided · 3 contested-with-evidence · 1 reclassified as a shipped defect · 2 genuinely open.**

| #   | Question                                             | Verdict                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| --- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 4   | Atomic number: `sætistala` / `raðtala` / `atómnúmer` | ✅ **DECIDED — strongest item in the recovery.** `ordabok.md:41 atomic number;sætistala`; corpus `sætistal*` **59** / `raðtal*` **0** / `atómnúmer` **0**; and the only game that ever used it, `uppbygging-atomanna/src/i18n.ts:50,52,63` (_"Fjöldi róteinda = sætistala (Z)"_). Two independent authorities plus a usage precedent. kvenno ships `atómnúmer` ×7+ (`lotukerfid/src/components/Level3.tsx:50,75,88,100`, `molmassi/PeriodicTable.tsx:325`) and `raðtalan` (`lotukerfid/src/components/Level2.tsx:338`). **First find-and-replace.**                                                                                                                                                                                                                                                                                                                                                                                                 |
| 11  | Enthalpy: `vermi` vs `skammtavarmi`                  | ✅ **DECIDED, emphatically.** `ordabok.md:198` plus a whole family: `vermibreyting :199`, `myndunarvermi :200`, `bráðnunarvermi :201`, `þurrgufunarvermi :202`, `gufunarvermi :203`. Both PRs fixed it. ⚠️ `calorimetry` — which this document recommends porting — ships a _fourth_ word, `Enþalpía`, plus `Exóþermt`/`Endóþermt` against the ruled `Útvermið`/`Innvermið`. It was never pass-reviewed. Port the chemistry, not the strings.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 2   | `sjálfgengur` / `sjálfgengt` / `sjálfvirkur`         | ✅ **DECIDED twice.** `:515` adjective (inflects: `sjálfgengt` with neuter _hvarf_), `:514` noun `sjálfgengi`. `sjálfvirkur` explicitly ruled out in PR #100's body.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 1   | `anóða` / `katóða` vs English                        | ✅ **DECIDED.** `:34`, `:78`; #99 applied it (`anode: 'Anode (oxun)'` → `'Anóða (oxun)'`).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 8   | `markverðir stafir` vs `markverðir tölustafir`       | ✅ **DECIDED, and kvenno already agrees.** `:495`. `dimensional-analysis/src/components/Level3.tsx:420,753,757`, `data/challenges.ts:242`. **Zero code change.**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 10  | Ksp family                                           | ✅ **ALL FOUR DECIDED.** `solubility product;leysnimargfeldi :501`, `common ion effect;samjónahrif :102`, `molar solubility;mólarleysni :351`, `fractional precipitation;hlutfelling :229`. All four = 0 occurrences in kvenno code. Decided, never adopted.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 3   | The five reaction-type names                         | ⚠️ **PARTLY ANSWERED — not blocked.** Two February games carry full five-type vocabularies and were built six hours apart: `gerdir-efnahvarfa/src/i18n.ts` (`cb95ac9`) and `stilltu-efnajofnur/src/data/equations.ts:506-513` (`8b7f074`). They **agree** on `Samsetningarhvarf`, `Brunahvarf` (matches `ordabok combustion;bruni`), and the `víxlhvarf` pair. They **disagree** on decomposition: `Sundurliturarhvarf` vs `Sundrunarhvarf`, against the glossary's third option `decomposition reaction;niðurbrotsefnahvarf :132`. Neither game was pass-reviewed, so both are drafts; `sundurlitur` is not an Icelandic chemistry word, and `Sundrunarhvarf` uses the stem #99 demoted. Also unresolved: singular (`Einfalt víxlhvarf`) vs plural (`Einföld víxlhvörf`). kvenno's `jafna-jofnur/src/i18n.ts:37` ships `displacement: 'Tvíbóta'`, matching neither. **Open decision: decomposition term + number. Three names you can adopt now.** |
| 7   | `staðalform` vs `vísindaritháttur`                   | ⚠️ **NOT a clean slate — contested, with an incumbent on each side.** February shipped `'Stig 3: Vísindaritháttur'` (`markverdir-tolustafir/src/i18n.ts`, `47eef01`). The textbook uses **`staðalform`** with `veldisvísirform` as synonym (`ORPHANED_GAMES_ASSESSMENT.md:352`, citing `appendices/m68860-segments.is.md:113`). No glossary entry. Zero occurrences of either in kvenno game code.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 9   | Decimal separator                                    | 🐞 **RECLASSIFY: this is a shipped correctness bug, not a preference.** The textbook writes `2,98 × 10⁵`; the games write `.` and parse with `parseFloat`, so a student typing `13,8` gets 13 and is marked wrong (`ORPHANED_GAMES_ASSESSMENT.md:352`, citing `Level2.tsx:47`, `Level3.tsx:84-86`). Fix the parser regardless of which separator you display.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 5   | Galvanic cell noun                                   | ❌ **OPEN — and the shipped text is ungrammatical either way.** No glossary entry for galvanic cell; the glossary is consistent on `-ker` (`electrolytic cell;rafker :169`, `half-cell;hálfker :251`, `cell potential;kerspenna :81`, `fuel cell;efnarafall :236`). #99 left `'Stig 1: Galvanísk hlaup'` unchanged (_hlaup_ is jelly) — and it recurs: `cellPotential: 'Spennumunur hlaups'`. kvenno ships `Galvanísk klefi` (`ElectrochemicalCell.tsx:309,542`) and `galvaníska klefi` (`:55`). `klefi` is masculine, so **`Galvanískur klefi`** is required whichever noun wins. Four candidates for cell potential: `kerspenna` (glossary), `Staðalmætti (E°)` (old `electrochemistry/src/i18n.ts:24`), `Rafspenna` (Y2 review), `Spennumunur` (old game).                                                                                                                                                                                       |
| 6   | Stoichiometry                                        | ❌ **OPEN, and kvenno ships three words.** `stökjómetríu` (`takmarkandi/src/App.tsx:251`, `i18n.ts:51`), `Stökefnafræði` (`hess-law/src/components/Level1.tsx:25`), `stækifræði` (`jafna-jofnur/src/i18n.ts:11`). No glossary entry; neither PR touched it.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |

### Acid nomenclature — a rule worth having and an example set that needs ruling

`1d1837b` (2026-02-01) added acids to `nafnakerfid` with the naming rule taught inline in each entry's `info` field:

> `-at` → `-sýra` (nitrate → nítursýra) · `-ít` → `-sýrlingur` (nitrite → nítursýrlingur)

New categories: `sýra-tvíefni` (binary), `sýra-súrefnis` (oxyacid). The rule is the standard `-ate → -ic` / `-ite → -ous` mapping and is sound. **The 16 worked examples are separable from it, and three of them fail the corpus test:**

| February name           | corpus hits | textbook form                                          | hits    |
| ----------------------- | ----------- | ------------------------------------------------------ | ------- |
| `Nítursýra` (HNO₃)      | **0**       | **saltpéturssýra**                                     | **118** |
| `Nítursýrlingur` (HNO₂) | **0**       | **saltpéturssýrlingur**                                | **22**  |
| `Undirklórsýra` (HClO)  | **0**       | hýpóklórsýra / -sýrlingur (corpus itself inconsistent) | 3       |

The other thirteen match the corpus: saltsýr 57 · flúorsýr 15 · brennisteinssýr 126 · brennisteinssýrling 25 · fosfórsýr 44 · perklórsýr 17 · klórsýr 31 · klórsýrling 2 · kolsýr 55 · ediksýr 175 · vetnisbrómíð 17 · vetnisjoðíð 14 · vetnissúlfíð 5. `ordabok.md` has **no nitric-acid entry at all**, so the glossary cannot rule and the corpus decides.

Two consequences. kvenno **already ships the textbook form** — `apps/games/1-ar/lausnir/src/data/chemicals.ts:17` reads `displayName: 'HNO₃ (saltpéturssýra)'` — so a straight lift would put `Nítursýra` and `saltpéturssýra` one curriculum node apart. And `sydur-og-basar`'s `Salpeturssýra` is not a different wrong word; it is the textbook root with its accents stripped, the same ASCII mangling that file has throughout.

Two further defects in the February list, neither flagged at the time:

- **It breaks its own rule.** `compounds.ts:102` teaches `'Hýpóklórít (ClO⁻) → Undirklórsýra'`. Hypochlor**ite** is an `-ít` anion, so by the file's own rule HClO must take a `-sýrlingur` form.
- **The binary category is internally inconsistent.** Five entries, all `category: 'sýra-tvíefni'`: `HCl → Saltsýra`, `HF → Flúorsýra`, but `HBr → Vetnisbrómíð`, `HI → Vetnisjoðíð`, `H₂S → Vetnissúlfíð`. The HCl entry states the pattern _"H + hálógen → vetni + -sýra"_ and the very next entry, HBr — a halogen — contradicts it. A student drilling this category learns a rule that fails 3 times in 5.

A third window list exists and _was_ pass-reviewed: `ka-kb-jafnvaegi/src/data/acids-bases.ts`. It reads `Saltpéturssýrlingur` for HNO₂ against `nafnakerfid`'s `Nítursýrlingur` — the genuine native-vs-Latin-stem split, and the one that needs you. It also reads `Edikssýra` vs `Ediksýra` (a linking-genitive-s question, normalise either way) and `Flúorvetni` for HF — which is not a vocabulary conflict: HF(g) is flúorvetni, HF(aq) is flúorsýra, so in a Ka table `nafnakerfid` is right and `ka-kb` is wrong _in context_. A mechanical reconcile would corrupt the correct one.

**Recommendation: adopt the rule; lift 13 of the 16; rule on `Nítur-` vs `Saltpéturs-` and on HClO; rewrite the binary category.**

### Where #99 knowingly diverged from the glossary

"Adopt `ordabok.md`" is not mechanical. #99 derived _from_ the glossary, but left these:

| Concept      | Glossary           | What #99 kept / kvenno ships                                                |
| ------------ | ------------------ | --------------------------------------------------------------------------- |
| burette      | `búretta :74`      | `Byretta` (`ph-titration/src/i18n.ts:41`)                                   |
| see-saw      | `vegasalt :489`    | `Vippu` (`vsepr-geometry/src/i18n.ts:44`)                                   |
| substitution | `skiptihvarf :536` | `Staðgengill` (= _a deputy_)                                                |
| elimination  | `brottnám :190`    | `Brotthvarf` (= _dropping out of school_)                                   |
| addition     | `álagning :17`     | `Viðbót`                                                                    |
| rate law     | `hraðajafna :454`  | `hraðalögmál` — kvenno ships **both** (`kinetics/src/i18n.ts:43` and `:24`) |
| intermediate | `milliefni :286`   | `millistig`                                                                 |
| noble gas    | `eðalgas :369`     | `Eðalgös` / `Eðallofttegundir` (`molmassi:134`)                             |

`álagning`, `brottnám`, `skiptihvarf` and `milliefni` return **zero hits across the entire old repo**. The organic reaction-name family is the one place the glossary has never been applied at all — that is a fresh decision, not a restoration.

**Two names the glossary does not rule and February coined without backing:** `Hitalitun` (calorimetry — no `calorimetry` entry; the related terms _are_ settled: `heat capacity;varmarýmd :255`, `specific heat capacity;eðlisvarmi :507`) and `Sameginleikar lausna` (colligative — no entry). Also: `skel`/`undirskel` as shipped in `rafeindabygging` vs `ordabok.md:493,534` `shell;hvolf` / `subshell;undirhvolf` — a decision, not an error; `skel` is standard classroom Icelandic.

**One more the glossary settles that no game uses:** `electron configuration;rafeindaskipan` (`:176`). kvenno's Ch.-6 game uses four _other_ words — the directory name `rafeindabygging`, `rafeindauppsetning` ×7 (`i18n.ts:8,21`, `App.tsx:179,245,270`, `Level2.tsx:270`, `Level3.tsx:65`), and the level title `Rafeindasmíð` (`Level2.tsx:229`). `rafeindaskipan` = 0 hits in any game. Also `Pauli exclusion principle;einsetulögmál Pauli :398` vs shipped `Útilokunarregla Paulis` (`Level2.tsx:179`).

---

## The curriculum judgments

### The chapter-to-year map

`d8d9f8d` (2026-01-30) settled it: **Y1 = Brown Ch. 1–4 · Y2 = Ch. 5–14, 20, 24–25 · Y3 = Ch. 10, 15–17, 19**, against _Chemistry: The Central Science_, Brown et al. Its tri-year verdict, verbatim:

> Year 1 … **Identified gaps: balancing equations, percent composition, matter classification**.
> Year 2 … **Identified gaps: electrochemistry, calorimetry, organic reactions**.
> Year 3 … **Critical: Buffer Recipe Creator Levels 2-3 not implemented**. **Identified gaps: ICE tables, Ksp, Ka/Kb calculations**.

Note this map differs from the one kvenno's August review assumed. `CURRICULUM_REVIEW.md:22` invites the correction: _"the chapter→topic map below is **assumed from Brown 14th ed.** … If your edition splits differently, correct this one table and the gaps re-sort themselves."_

### Year 1 — the gap analysis, verbatim

`YEAR-1-PEDAGOGICAL-REVIEW.md:224-235`:

| Topic                                | Brown   | Coverage then                | Priority |
| ------------------------------------ | ------- | ---------------------------- | -------- |
| Atomic structure (p, n, e⁻)          | 2.3     | None                         | **High** |
| Isotopes and average atomic mass     | 2.3–2.4 | None                         | **High** |
| Periodic table organization          | 2.5     | None                         | **High** |
| Ions and ionic bonding basics        | 2.7     | Implicit in Nafnakerfið      | Medium   |
| Electrolytes vs non-electrolytes     | 4.1     | None                         | **High** |
| Precipitation & solubility rules     | 4.2     | None                         | **High** |
| Acid-base reactions (neutralization) | 4.3     | Briefly in Gerðir efnahvarfa | **High** |
| Oxidation-reduction basics           | 4.4     | None                         | Medium   |
| Solution stoichiometry               | 4.6     | None                         | Medium   |
| Separation techniques                | 1.3     | None                         | Low      |

Three of these are priority _rulings_ the August review leaves unranked: **redox basics in Y1 = Medium, not must-have** (Y2 owns it); **separation techniques = Low**; **solution stoichiometry = Medium**, with two homes chosen — `Sýrur og basar` L3 _and_ a Lausnir enhancement.

Closing judgment (`:372`): _"The main gaps are in Brown Chapter 2 (atomic structure, periodic table) and Chapter 4 (aqueous reactions, precipitation, acid-base chemistry). Filling these gaps with 3–4 new games and enhancing the feedback systems in existing games would create comprehensive coverage of the first-year curriculum."_

**The answer to the chapter-4 question, verbatim** (`:346-351`) — must-haves, in order:

> 1. **Jónir í lausn** — Precipitation, solubility rules, net ionic equations (Ch. 4.2)
> 2. **Uppbygging atómanna** — Atomic structure, isotopes, average atomic mass (Ch. 2.3–2.4)
> 3. **Sýrur og basar** — Acid-base neutralization (Ch. 4.3)
> 4. Improve **Gerðir efnahvarfa** with driving forces, activity series, and precipitation prediction

Rationale for #1 (`:275`): _"Precipitation reactions with solubility rules are among the most heavily tested topics in first-year chemistry, and they are currently absent from the game suite."_ For #3 (`:292`): _"Brown Section 4.3 covers acid-base reactions, and this is inadequately represented. The gerðir-efnahvarfa game includes one neutralization example but doesn't teach the concept systematically."_

**The form of the answer was "both", not "standalone games only".** All four were built as separate Vite apps in `57d815d` (2026-02-04 06:33) — but the same review also asked for electrolyte classification _inside_ Lausnir (`:187`: _"Brown Section 4.1 distinguishes strong electrolytes… A sorting exercise would directly support the chapter 4 content"_) and ranked it Should-Have #6 (`:356`).

**All four shipped with 3 levels; all four specs had a Level 4.** That is not an unexplained loss — it was normalised away by a written house rule: `YEAR-1-DEVELOPMENT-PLAN.md:658` _"All new games follow consistent 3-level pattern with localization (is, en, pl)"_ (added by `ee43483`, 42 minutes before the games were built), `57d815d`'s own body (_"Each game follows the established 3-level pattern"_), and `.claude/skills/game-development.md:34-42` (_"All games should have: 3 difficulty levels (progressive)"_). **That cap is a live constraint on every Level-4 port recommended below.**

The expensive casualty: **Jónir L4 was the only place a student would have written a net ionic equation.** What shipped is the eight equations as post-answer feedback (`jonir-i-lausn/src/data/reactions.ts:37,54,71,88,105,122,139,156` — `'Ag⁺(aq) + Cl⁻(aq) → AgCl(s)'`, `'Pb²⁺(aq) + 2I⁻(aq) → PbI₂(s)'`, …), rendered at `components/Level3.tsx:336-339`. Display, not practice.

### Year 2 — Chapter 6

> **"This is the single largest curriculum gap in the year 2 games."** — `YEAR-2-PEDAGOGICAL-REVIEW.md:291`

> "This chapter is the conceptual bridge between 'atoms have protons, neutrons, and electrons' (Chapter 2) and 'atoms form bonds' (Chapter 8). **Without it, Lewis structures lack theoretical grounding — students learn _rules_ for bonding without understanding _why_ atoms bond.**" — `:305`

A five-level spec followed (`:307-341`). kvenno's `rafeindabygging` (built April 2026, independently) implements three:

| Spec                                                                                        | Shipped                                                                                                                                                                                                                                                                               |
| ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| L1 Quantum numbers, 12 problems, misconception _"l can equal n"_                            | ✅ as L1, **8** puzzles. Misconception targeted: `quantum-numbers.ts:20` `// l cannot equal n`, taught at `Level1.tsx:160-162`                                                                                                                                                        |
| L2 Orbital shapes + energy ordering, shielding, 4s-before-3d, 8 challenges                  | ⚠️ **demoted to a teaching panel.** The energy argument survives (`Level2.tsx:158-176`, an ASCII ladder plus _"4s-svigrúmið liggur innar (nær kjarnanum) en 3d vegna skarpari kjarnaáhrifa"_). No orbital-shape visualization, no 8 challenges — the student never practises ordering |
| L3 Electron configurations, Aufbau/Hund/Pauli, 15 elements H→Kr                             | ✅ as L2, **8** elements (H, C, N, O, Na, Cl, Fe, Kr)                                                                                                                                                                                                                                 |
| L4 s/p/d/f blocks → predict valence count → **"Connect to Lewis dot symbols"**, 10 problems | ❌ **the bridge is not built.** `grep "blokk\|gildisrafeind\|Lewis"` → only `Level3.tsx:67,84` and `App.tsx:339`                                                                                                                                                                      |
| L5 Electromagnetic radiation, c = λν, E = hν                                                | ❌ absent. Ranked Medium by the review itself — defensible                                                                                                                                                                                                                            |

`App.tsx:339` places the game first in the chain and `:343` cites _"Kafli 6 — Chemistry: The Central Science (Brown et al.)"_. **The placement asserts a bridge to Lewis that the content does not build.** Finishing L2's practice half and L4's Lewis-dot bridge is the cheapest highest-value item in the whole recovery.

Three other Y2 games were proposed and never built anywhere: **Sameginleikar lausna** (colligative properties, Ch. 11 — ranked Critical), **Hraðalögmál** (rate laws/Arrhenius — mostly already existed), **Rafspenna** (cell potentials, ΔG° = −nFE°, Faraday).

**⚠️ The Y2 review's ❌ column is unreliable in one direction.** It read only Level 1 of some games and marked shipped content missing. Verified present in the code it was reviewing: Arrhenius (`kinetics/src/components/Level4.tsx:10-73`, full `ArrheniusProblem` set), rate laws (`kinetics/src/i18n.ts:24`), formal charge and resonance (`lewis-structures/src/i18n.ts:30`), octet exceptions (`lewis-structures/src/components/Level4.tsx:296-313`), functional groups (`organic-nomenclature/src/components/Level3.tsx:23-59`), cell potential (`electrochemistry/src/i18n.ts:24`), bond enthalpy (`hess-law/src/i18n.ts:37`), ΔH°f (`hess-law/src/components/Level3.tsx:22-45`). The `YEAR-2-DEVELOPMENT-PLAN.md` fails in the opposite direction: `146e2b2` flipped it to `Status: ✅ All Phases Complete` one day before the review contradicted it. **Neither file's status column is evidence. Grep the source.**

Where the review is right: colligative properties, Redox acid/base balancing, activity series and Chapter 6 were genuinely absent — and remain absent in kvenno today, along with three whole games (`calorimetry`, `electrochemistry`, `organic-reactions`) that never migrated.

### Year 3 — the gap matrix and the Ka/Kb ruling

`d8d9f8d`'s original Y3 matrix (the version on disk today has been all-✅'d and no longer shows what was judged missing):

| Chapter | Topic                      | Judged 01-30        | Priority     | By 02-03           |
| ------- | -------------------------- | ------------------- | ------------ | ------------------ |
| 10      | Ideal Gas Law              | ✅ Strong           | —            | ✅                 |
| 10      | Real gases / Van der Waals | ❌ Missing          | Low          | ❌ never built     |
| 15      | Le Chatelier               | ✅ Excellent        | —            | ✅                 |
| 15      | Equilibrium constants (K)  | ⚠️ Qualitative only | **High**     | ✅ ICE mode        |
| 15      | ICE table calculations     | ❌ Missing          | **High**     | ✅ ICE mode        |
| 15      | Ksp                        | ❌ Missing          | **High**     | ✅ Leysnisjafnvægi |
| 16      | Acid-base equilibrium      | ⚠️ Partial          | Medium       | ✅                 |
| 16      | Ka/Kb calculations         | ❌ Missing          | Medium       | ✅                 |
| 17      | Buffers                    | ⚠️ Incomplete       | **Critical** | ✅ 3 levels        |
| 17      | Titration curves           | ✅ Strong           | —            | ✅                 |
| 19      | Entropy (ΔS)               | ⚠️ Qualitative only | Medium       | ✅                 |
| 19      | Gibbs free energy          | ✅ Strong           | —            | ✅                 |
| 19      | Equilibrium & ΔG           | ❌ Missing          | Medium       | ✅                 |

**The ordering judgment:** _"Ka/Kb game would strengthen acid-base foundation before pH Titration"_ (`semester-priority-plan.md:76`), from _"Currently pH Titration assumes students know Ka/Kb calculations, but these aren't taught"_ (`YEAR-3-DEVELOPMENT-PLAN.md:362`ff). Built as `ka-kb-jafnvaegi` (`ecc894e`, 2026-02-03), 3 levels, 26 problems: `Ka/Kb Tjáningar` (Ka × Kb = Kw) → `pH Útreikningar` (ICE tables, 5% approximation) → `Jónunarprósenta` (dilution effect, pKa/pKb). kvenno's chain is `Gaslögmál → Jafnvægi → Varmafræði → pH Títrun → Púfferar` — no Ka/Kb node.

**One architecture decision, answered by action:** the plan asked whether an ICE-table game _"could be standalone or integrated into Equilibrium Shifter"_ (`:397-402`). `974c3a3` built it as a mode inside Jafnvægisstjóri. The standalone `ICE Töfluleikur` was never built. **Don't spawn a new game for it.**

**Real gases is NOT ruled out.** It was assessed missing, assigned **Low**, and never built — which is not a decision. Contrast `checklist.md:161-162`, where virtual pH paper and the dPH/dV derivative curve carry the tracker's own **"(future)"** annotation. That is conscious parking; the real-gas row is not.

**Icelandic names decided here:** `Leysnisjafnvægi` ("Ksp og botnfall"), `Ka/Kb Jafnvægisreikningar`, `Jafnvægisstjóri`, `Varmafræði Spámaður`. Neither of the two new games' `i18n.ts` was pass-reviewed, and both use `Þrep` for level where every other Y3 game uses `Stig` — 27 occurrences, confined to those two files. That is drift, not a decision; normalise on port.

### February vs August — where two independent passes agree

The strongest evidence in this document. Different method (agent doc review vs 13-agent adversarial verification with browser runs), six months apart, no shared sight:

| Topic                                   | February                                                                                                              | August (`CURRICULUM_REVIEW.md`)                                        |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Isotopes / average atomic mass          | `:227` None / **High**                                                                                                | `:68` _"the word `samsæta` appears nowhere in Y1"_                     |
| Electrolytes                            | `:230` None / **High**                                                                                                | `:91` _"Zero hits for raflausn/rafleiðni/jónast in Y1 — and in Y2/Y3"_ |
| Precipitation & solubility rules        | `:231` None / **High**                                                                                                | `:92` _"zero `(aq)` state symbols anywhere in Y1"_                     |
| Neutralization                          | `:232` Briefly / **High**                                                                                             | `:90` _"never taught. Covered in Y3"_                                  |
| Net ionic equations                     | `:281` Jónir L4                                                                                                       | `:93` _"Zero trace in the entire curriculum, all three years"_         |
| Solution stoichiometry                  | `:234` None / Medium                                                                                                  | `:89` _"Concentration half only"_                                      |
| Separation techniques                   | `:235` None / Low                                                                                                     | `:56` _"Zero hits for eiming/litskiljun/síun"_                         |
| Activity series                         | `:210` rec, unbuilt                                                                                                   | `:94` _"activity series nowhere"_                                      |
| Density as a concept                    | `:69` _"the first place students encounter dimensional analysis, and it is missing"_                                  | `:53` _"used as a multiplier in 5 items, never taught as a concept"_   |
| Classification of matter                | built as `flokkun-efna`, orphaned                                                                                     | `:55` _"used as an unexplained prerequisite"_                          |
| Significant figures                     | built as `markverdir-tolustafir`, orphaned                                                                            | `:54` _"Demanded but never taught"_                                    |
| Empirical formula / combustion analysis | built as `hlutfallsgreining`, orphaned                                                                                | `:81` _"Confirmed absent from all three years"_                        |
| Percent yield                           | built (Takmarkandi L4), lost                                                                                          | `:82` _"Advertised but never taught"_                                  |
| Temperature scales                      | `:71` _"K = °C + 273.15 breaks the 'multiply by a conversion factor' pattern… even 2–3 questions would address this"_ | `:57` _"The one temperature item was deleted"_                         |

**Thirteen independent agreements. That is the best available evidence about where the real gaps are.**

One convergence worth naming: February's balancing rec (`:109`) — _"**Show atom inventory tables.** For each equation attempt, showing a live table of 'atoms on left | atoms on right'… is more effective than just 'incorrect — try again'"_ — was independently built in kvenno's `jafna-jofnur`, and August names it one of four patterns to copy (`:158`): _"Jafna jöfnur's `AtomCounter` recomputes on every keystroke — the one place a game feels like a machine responding rather than grading."_

**One genuine unresolved curriculum question:** periodic trends. February scoped atomic radius / ionization energy / electronegativity into Ch. 2.5 and built 12 verified paired comparisons (`lotukerfid/src/data/trends.ts`). August's assumed map lists only "periodic table structure" for Ch. 2, and Brown puts trends in Ch. 7 — so it never counts trends as a Y1 gap. The asset exists and is verified. Whether Y1 owns it is a teaching call. Related: the window put atomic structure in **Y1** (`uppbygging-atomanna`, Ch. 2.3–2.4); April put electron configuration in **Y2** (`rafeindabygging`, chain position 1). Both readings are in your own history; **which year owns atomic structure is not determined.**

### Where February praised code that was already broken

**Do not trust February's quality ratings or accuracy claims.** Two cases, on code verified byte-identical between the repos:

- **Takmarkandi.** February `:157-161`: _"the strongest game pedagogically… best-in-class… 20 reactions across three difficulty tiers, all correctly balanced, with accurate molar masses."_ August B8 (`:120`): reactant counts are drawn at random with no relation to the coefficients, so a student following the game's own printed hint `min(A÷c₁, B÷c₂)` is _"graded wrong on ~44% of Level 2 and ~70% of Level 3 problems"_. `generateReactantCounts` is character-identical between OLD `:50-68` and NEW `:48-66`.
- **Lausnir.** February `:179-180`: ★★★★★, _"Real solubility data… CaSO₄ retrograde solubility is a sophisticated inclusion."_ August B3 (`:110`): gas solubility 10× too high. `TemperatureSolubility.tsx:59,67` — `[0.069, …]` and `[3.35, …]` — identical in both repos, both under the `g/100g H₂O` label at `:220`.

The February reviewer read structure and never checked a number. **Its gap analysis carries a lot of weight; its praise carries none.**

---

## The pedagogical positions

### Your own framing — `review-prompt.md` (194 lines, `f65c10f`, 2025-11-29, your voice)

This file is entirely absent from kvenno-app: `grep -rli "pattern recognition\|review-prompt\|Three-Level Framework"` over the monorepo returns zero.

> _"I am Siggi, a chemistry teacher at Kvennaskólinn í Reykjavík (Icelandic secondary school, students aged 15-19). My textbook is **'Chemistry: The Central Science' by Brown et al.**"_ — `:5`

> **Core test:** A student who doesn't understand the concept should NOT be able to score well through guessing or pattern recognition. — `:158`

| Level | Focus             | Student must…                                 |
| ----- | ----------------- | --------------------------------------------- |
| 1     | Understand/Create | Build mental model through guided exploration |
| 2     | Predict/Explain   | Predict outcomes AND justify reasoning        |
| 3     | Analyze/Calculate | Apply quantitatively, solve reverse problems  |

The per-level review questions (`:72-88`) are the recognisable ancestor of April's teach-before-test, three months earlier:

> **Level1 — Conceptual Foundation:** "Does it teach BEFORE testing? · Are there interactive demonstrations? · Do students learn WHY, not just WHAT?"
> **Level2 — Application with Reasoning:** "Must students predict AND explain? · **Is trial-and-error success prevented?**"
> **Level3 — Analysis and Calculation:** "Quantitative applications present? · **Reverse problems (given outcome → find cause)?** · Multi-concept synthesis?"

Also yours: the priority vocabulary `Critical | Important | Nice-to-have` (`:104-108`); the architecture rule (`:36`) _"Shared components handle UI/UX, accessibility, progress, and i18n. Game-specific code focuses purely on chemistry content and pedagogy"_; and the one misconception you reached for yourself (`:166-172`) — _"Students add ΔH values without flipping signs when reversing reactions"_.

**The core test at `:158` is the sentence that operationalises "pedagogically sound." kvenno's `CLAUDE.md` states the weaker half of it (teach-before-test) and not the test itself.**

### The feedback standard

`YEAR-1-PEDAGOGICAL-REVIEW.md:336` — the clearest pedagogical position in the February documents:

> Takmarkandi's tiered hint system with misconception-specific feedback is the best in the suite. **When a student gives a specific wrong answer, the feedback should address _why that particular wrong answer is tempting_.** For example, in Nafnakerfið, if a student names FeCl₃ as "iron chloride" (omitting the Roman numeral), the feedback should say "Iron can form Fe²⁺ or Fe³⁺ ions. You need the Roman numeral (III) to specify which one."

An irony worth knowing: February praised Takmarkandi's named misconception (`:158`, _"Limiting reagent isn't always the smaller amount"_), and August (`:167`) found it _"structurally impossible to encounter: `Level1.tsx:38-44` never generates an item where the limiting reactant is the more numerous one."_ February's own fix (`:167`) was already the right one — _"**Include problems where the limiting reactant switches.** … This prevents the pattern-matching shortcut"_ — prescribed February, never built, re-diagnosed August.

### The misconception targets

The highest re-derivation cost in the February set — specified per game, easily lost inside a table of level names:

**Uppbygging atómanna** (`:249-252`): _"Protons and electrons are always equal" (not in ions!)_ · _"Mass number = atomic mass on periodic table" (no — atomic mass is a weighted average of isotopes)_ · _"Neutrons don't matter" (they determine isotope identity and nuclear stability)_

**Lotukerfið** (`:266-269`): _"Metals are always solid" (mercury is liquid)_ · _"The periodic table is just for looking up masses" (it predicts properties!)_ · _"Noble gases don't do anything"_

**Jónir í lausn** (`:283-286`): _"All ionic compounds dissolve in water"_ · _"Spectator ions react" (they don't — that's what makes them spectators)_ · _"Net ionic equations are just shorter versions" (they reveal the actual chemistry happening)_

**Sýrur og basar** (`:300-303`): _"All acids are dangerous" (vinegar is acetic acid; citric acid is in lemons)_ · _"Neutralization always produces pH 7" (only for strong acid + strong base)_ · _"Bases are the opposite of acids" (they are complementary, not opposite)_

Scattered elsewhere: the "pure substance" trap (`:34`, _"Is filtered tap water a pure substance? No — it still contains dissolved minerals"_); exact numbers and sig figs (`:48`, _"Students routinely get tripped up by using the '2' in '2H₂O' as a sig fig limit"_); empirical-formula rounding (`:148`, _"Students frequently round 1.5 to 2"_). Y2 adds: heat vs temperature, _"temperature decreases activation energy"_, _"London forces only exist in nonpolar molecules"_, _"the substance that IS oxidized" vs "the oxidizing agent"_.

### Positions April 2026 overruled — do not re-import

| February                                                                                                                                                                                                                             | kvenno-app now                                                                                                                                |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| _"The tiered hint system… **with point penalties** is best-in-class"_ (`Y1:157`); _"the 10 → 5 → 2 pattern works well"_ (`Y2:411`); hint decay 100→80→60→40% (`docs/plans/2025-12-30-tiered-hint-system-design.md`)                  | _"Hint usage is never penalized."_ The **tier labels survive** — `packages/shared/types/hint.types.ts:57-62`, Efni / Aðferð / Formúla / Lausn |
| Lotukerfið L1 _"Timed for engagement"_ (`Y1:261`); `gerdir-efnahvarfa` L3 timed at 12 s/question                                                                                                                                     | _"No scoring, timers, or streaks during learning phases."_                                                                                    |
| `recommendations.md:423-428` Phase 4 Gamification Expansion (more badges, quests, streak rewards, milestone rewards); `:358-363` adaptive difficulty; `:381` sound effects; `:385-391` leaderboards; the 23-badge achievement system | Gamification chrome stripped Apr 2026; `ParticleCelebration`, `AnimatedBackground`, `SoundToggle` deleted Aug 2026                            |
| _"3 difficulty levels (progressive)"_ + _"Achievement integration"_ as universal standards (`.claude/skills/game-development.md:34-42`)                                                                                              | Replaced by Explore → Understand → Practice → Apply                                                                                           |

Which authority won is visible: `review-prompt.md` is yours, `recommendations.md:4` is _"Evaluator: Claude Code Analysis"_. Your line survived into kvenno's teach-before-test; the agent's Fishman-derived rewards programme was deleted. **Anything in `recommendations.md` tagged badges, streaks, timers, quests, leaderboards or celebration is superseded, not pending.**

Two of that memo's items did win and were re-derived independently in kvenno: the tiered hint ladder, and _"Lazy load 3D visualization libraries"_ (`:472` → the Aug 2026 Three.js code-split).

### Where February still says something April did not

- **Level gating.** All four February games gate: `jonir-i-lausn/src/App.tsx:125-126` and siblings compute `isLevel2Unlocked = progress.level1Completed`, disable the button, render 🔒 with _"Ljúktu Stig 1 til að opna þetta stig."_ April removed gating; August asks for it back (`CURRICULUM_REVIEW.md:222`). **And the strings are still there:** 14 shipped games carry `locked:` keys in `i18n.ts` with **zero component consumers** (`grep -rn "\.locked" apps/games/*/*/src --include=*.tsx` → 0) — `dimensional-analysis`, `lausnir`, `takmarkandi`, `hess-law`, `intermolecular-forces`, `kinetics`, `lewis-structures`, `organic-nomenclature`, `redox-reactions`, `vsepr-geometry`, `buffer-recipe-creator`, `equilibrium-shifter`, `ph-titration`, `thermodynamics-predictor`. Restoring gating is a wiring job with the strings already written, in three languages.
- **Cross-game synthesis** (`Y1:319`): one capstone touching five games — _"Given 5.00 g of Na₂CO₃ and 100 mL of 0.200 M HCl, identify the reaction type, determine the limiting reactant, calculate the theoretical yield of CO₂, and express your answer to the correct number of significant figures."_
- **Laboratory framing** (`Y1:321-328`): _"Chemistry is an experimental science… This makes the math feel purposeful rather than abstract."_
- **Error analysis mode** (`Y1:332`): _"A student calculated the molar mass of Ca(OH)₂ as 57 g/mol. What did they do wrong?" … Error analysis develops deeper understanding than just solving problems correctly, and it mirrors how scientists actually think._
- **The Lewis → VSEPR → IMF → properties pipeline** (`Y2:398-402`, a bulleted chain): Lewis structure → electron domains → geometry → polarity → IMF type → physical properties. Ranked twice, never built.
- **Worked-example mode** (`Y2:414-419`): _"a 'worked example' mode where students see a complete solution, then solve an isomorphic problem, would apply the cognitive science principle of example-problem pairs."_
- **A glossary popup** (`Y1:338-340`): mapping Icelandic ↔ English ↔ chemical symbols, because _"Students working with Brown (an English textbook) alongside Icelandic-medium instruction may struggle with terminology mapping."_ The asset now ships (`packages/shared/i18n/ordabok.md`); the popup does not.

---

## The priorities and the plan

### The Y1/Y2 backlog that was overwritten, not completed

`git show 679ab07:docs/game-improvement/semester-priority-plan.md` (2026-01-29) is a **different document** from the file on disk today. Its header: `Scope: Year 1 and Year 2 games only (Year 3 deferred)`, with a line reading _"Year 3 games are deferred until next semester"_. Four days later the title, scope line and the entire ranked backlog were **deleted** and replaced with "All Years Complete" and a Y3 section. The items were never marked done — they were overwritten. That revision is the only place they survive:

| Rank    | Year   | Game                 | Feature                      | Effort |
| ------- | ------ | -------------------- | ---------------------------- | ------ |
| 🔴 HIGH | 1      | Dimensional Analysis | Drag-and-drop unit builder   | High   |
| 🔴 HIGH | 1      | Limiting Reactants   | Visual stoichiometry         | Medium |
| 🔴 HIGH | 2      | Hess's Law           | Drag-drop equation builder   | High   |
| 🟡 MED  | 1      | Dimensional Analysis | Real-world context scenarios | Low    |
| 🟡 MED  | 1      | Molar Mass           | Animated mass calculation    | Medium |
| 🟡 MED  | 1      | Nomenclature         | Audio pronunciation (TTS)    | Medium |
| 🟡 MED  | 1      | Solutions            | Pipette/dropper tool         | Medium |
| 🟡 MED  | 1      | Limiting Reactants   | Factory game mode            | Medium |
| 🟡 MED  | Shared | Audio utilities      | TTS for pronunciations       | Medium |
| 🟢 LOW  | 1      | Molar Mass           | Mystery molecule mode        | Medium |
| 🟢 LOW  | 1      | Solutions            | Concentration-based colour   | Low    |
| 🟢 LOW  | 1      | Solutions            | Temperature effects          | Medium |
| 🟢 LOW  | 2      | IMF                  | Surface tension demo         | High   |

Its two stated selection criteria: _"Focus on leveraging existing shared components (`DragDropBuilder`, `ReactionAnimation`)"_ and _"Prioritize features with highest pedagogical impact for current curriculum."_ Rationales from the phase prose: _"Core skill for Year 1 chemistry"_ (`:68`), _"High pedagogical value for understanding stoichiometry"_ (`:63`), _"`DragDropBuilder` already built and ready"_ (`:72`), _"Content addition only, no new components needed"_ (`:82`).

**Note there is no teaching calendar anywhere in the document family.** Both revisions carry `Created: 2026-01-29` / `Updated: 2026-02-03`, and "Phase 1…Phase 6" is effort ordering, not weeks. Do not reconstruct a schedule from it.

### The Y2 review's ranking, verbatim (`:474-499`)

**Must-Have:** 1 Rafeindabygging (Ch. 6) · 2 Sameginleikar lausna (colligative) · 3 Hraðalögmál · 4 Lewis formal charge/resonance/octet exceptions · 5 Organic functional groups/substituents · 6 Rafspenna.
**Should-Have:** 7 Kinetics mechanisms/catalysis · 8 Hitalitun ΔH°f + sign-convention drill · 9 Hess ΔH°f alternative + bond enthalpies · 10 Organic Markovnikov + SN1/SN2 · 11 VSEPR polarity + dipole vectors · 12 Rafefnafræði electrolysis + cell notation.
**Nice-to-Have:** 13 IMF phase diagrams · 14 Redox acid/base balancing · 15 Lewis→VSEPR→IMF pipeline · 16 cross-game worked examples · 17 stereochemistry (E/Z) · 18 arrow-pushing mechanisms.

Five of its six must-haves were already partly or wholly built in the code it was reviewing (see the Y2 section above). #1 and #2 are the real ones.

### `checklist.md` — the rows are the record, the percentages are not

| Section               | Enumerated rows | ✅  | ⬜  | Summary claims    |
| --------------------- | --------------- | --- | --- | ----------------- |
| Shared infrastructure | 8               | 7   | 1   | 8 / 8 / 100% ✘    |
| Year 1                | 21              | 20  | 1   | 21 / 20 / 95.2% ✔ |
| Year 2                | 31              | 31  | 0   | 40 / 27 / 67.5% ✘ |
| Year 3                | 35              | 26  | 9   | 40 / 19 / 47.5% ✘ |

Three mutually inconsistent aggregate tables in one file ("By Priority" totals 109; "By Category" 108), and `:243-244` claims _"Interactivity 0/30 = 0%"_ while the rows directly above show nearly every interactivity item ✅. **There is no hidden backlog of 13 Year-2 items — Year 2 is 31/31.** But the checklist's real defect is coverage, not arithmetic: `grep '^#### '` returns 18 game blocks (5 Y1, 7 Y2, 6 Y3) against a 27-game inventory. Eight games were never tracked at all, including `ka-kb-jafnvaegi`, built 2026-02-03 with its own sequencing rationale.

**Year 1's one open row:** `:50` audio pronunciation (TTS) for Nafnakerfið.

**Year 3's nine open rows, in full:**

```
:161 Virtual pH paper          | ⬜ | Low    | Medium | Alternative measurement (future)
:162 Derivative curve display  | ⬜ | Low    | Medium | dPH/dV analysis (future)
:168 Interactive PVT simulation| ⬜ | High   | High   | Slider-controlled
:169 Particle KE visualization | ⬜ | High   | High   | Temperature-speed link
:171 Real gas deviation        | ⬜ | Low    | Medium | Van der Waals comparison
:181 K expression builder      | ⬜ | Medium | Medium | Interactive formula
:191 Phase diagram integration | ⬜ | Medium | High   | Link to phases
:192 Coupled reaction examples | ⬜ | Medium | Medium | ATP hydrolysis
:203 HH equation builder       | ⬜ | Medium | Low    | Interactive formula
```

**Only two are High, and both are Gas Law.** `ParticleSimulation` already ships in `packages/shared/components/` — that pair is wiring, not building, and it is the exact fix for a game the Dec-2025 memo rated 3★ "calculation-focused" and August describes as _"read-prompt → pick-or-type → be graded"_.

### Cross-game integration — two built, three never

| Connection                                                                                | Status                                                                                 |
| ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Equilibrium ↔ Thermodynamics (K/ΔG/ΔS for 30 equilibria + `ThermodynamicsConnection.tsx`) | ✅ built Feb, **absent from kvenno** (`grep -c "deltaG" equilibria.ts`: OLD 30, NEW 0) |
| Buffer ↔ Titration (buffer-region highlighting on the curve)                              | ✅ built, migrated                                                                     |
| **Lewis → VSEPR** — structure to geometry pipeline                                        | ⬜ never built                                                                         |
| **IMF → Organic** — functional group property links                                       | ⬜ never built                                                                         |
| **Kinetics ↔ Hess's Law** — energy diagram connections                                    | ⬜ never built                                                                         |

All six games in the three unbuilt rows ship in kvenno-app today. This is a priority ranked twice (`semester-priority-plan.md:57-59`, `Y2:395-404`) and never spent — and cross-game links are a teaching device, not gamification, so April's restructure does not touch them.

### Two more standing items from `repository-status.md`

- **Accessibility audit: `Never` run, rated High**, with the reason _"Educational sites must be accessible to all students"_ (`:86-91`). kvenno has since added keyboard access to `MoleculeViewer3D` and touch to `DragDropBuilder`, but no audit. Still open, still your stated priority.
- **Polish (`is`/`en`/`pl`) was a deliberate, systematic addition**, not a leftover: _"Languages: Icelandic (primary), English, Polish (in progress)"_ (`:233`), and every window-built game carries a full `pl:` block — `jonir-i-lausn` 250 lines, `lotukerfid` 313, `gerdir-efnahvarfa` 211, `ka-kb-jafnvaegi` 151, `calorimetry` 148. **The open item in kvenno's `CLAUDE.md` ("Hess Polish i18n block — teacher sign-off") is the tail of a much larger layer**, not one stray block: the 14 dead `locked:` blocks alone all carry Polish (e.g. `lausnir/src/i18n.ts:177,184`), and `kinetics/src/i18n.ts:140,142` ships Polish Arrhenius strings. For a Reykjavík school this is a teaching asset with a specific student population attached. Decide it knowingly.

### Counts recorded in the plans that do not match the code

| Claim                                   | Measured                          |
| --------------------------------------- | --------------------------------- |
| Ksp game "10 + 12 + 8 = 30 problems"    | **21** (8 / 7 / 6)                |
| Ka/Kb game "10 + 12 + 8 = 30 problems"  | **26** (10 / 8 / 8)               |
| "Year 1: 10 games"                      | **14** on disk by 2026-02-04      |
| Nafnakerfið "17 acids" (`1d1837b` body) | **16** (`grep -c "type: 'acid'"`) |

Accurate as claimed: ICE 10 (3/3/4), Q-vs-K 12 (4/4/4), Dalton 8, pH-Titration L4 18 (6 Ka + 6 polyprotic + 6 curve-interpretation), standard entropy 57 species ("45+" understates). **Prefer the commit message over the plan checkbox** — `e5a8d33`'s body says _"21 ionic compounds… and 21+ problems"_, i.e. it was accurate on the day and only the doc drifted.

---

## What is still lost

- **Whether you read, approved or requested any February document.** Zero PR review comments, zero issues, ~10-second merges. The only human ruling is the glossary upload.
- **87 window `components/*.tsx` files were never read** — of 387 changed files, 202 are real game source (87 components, 55 data, 26 App.tsx, 24 i18n.ts, 8 types/utils), and the recovery covered roughly half the `data/` and `i18n.ts` files and essentially no components outside `rafeindabygging`. That matters because `rafeindabygging` proved Level components carry teaching prose that exists in no doc and no i18n: `Level2.tsx:158-176` renders an ASCII orbital-energy ladder and the sentence _"4s-svigrúmið liggur innar (nær kjarnanum) en 3d vegna skarpari kjarnaáhrifa"_. Any Level component in the 14 window games can hold an equivalent explanation. **This is the residual risk class.**
- **Why the four Y1 must-haves inverted in practice** — three lost, the should-have (Lotukerfið) independently rebuilt in April as a different game (43 elements vs 36; L3 is p/n/e⁻ counting, not periodic trends).
- **Whether periodic trends belong in Y1**, and **which year owns atomic structure**.
- **No decision on `Nítur-` vs `Saltpéturs-`** — the native-vs-Latin stem split. The corpus favours `Saltpéturs-` overwhelmingly; two February games disagree with each other.
- **No teaching calendar** anywhere in the document family.
- **No ADRs.** `docs/decisions/` in the old repo exists and is empty. That is an answer, not a gap in the search.
- **Why the AI Chemistry Tutor was dropped.** The old structure doc gave it equal billing with Lab Reports across all three years, Azure-AD-protected, three builds. kvenno's `docs/KVENNO-STRUCTURE.md` removed it from the URL map but left five zombie references implying it exists (`:67`, `:186`, `:296-320`, `:423`, `:732`), including a documented `POST /api/chat` that returns zero hits in `server/` and `apps/`. Neither shipped nor cancelled.
- **What `/val/` and `/f-bekkir/` were meant to hold.** The old doc says "TBD" and nothing resolves it.
- **Whether the per-year games hub deletion was reasoned.** A 4079-line `1-ar/index.html` was removed on 2026-01-29 (`dd06b89`) with the subject _"remove stale index.html"_. kvenno inherited the outcome without the reasoning.

---

## What this changes about the work ahead

### Apply now — decided, cited, zero teaching judgment required

1. **`sætistala` for atomic number.** Two independent authorities plus a usage precedent. Replace `atómnúmer` (7+ sites) and `raðtalan` (`lotukerfid/src/components/Level2.tsx:338`).
2. **`stuðpúði`, not `púffer`.** 27 wrong vs 101 correct in one product, including two words inside one game. Five nav labels plus the Y3 chain line in `CLAUDE.md`. Smallest shippable item here.
3. **The three mis-teaching terms:** `Stakeindir` → `Rafeindapör` (currently says "radicals", and titles a VSEPR level), `Rafeindasækni` → `Rafsækir` (collides with electron affinity), `jafna` → `formúla` for formulas.
4. **The rest of the #99/#100 table** across the 10 shipped games it corrected: `hess-law`, `thermodynamics-predictor`, `lewis-structures`, `vsepr-geometry`, `kinetics`, `ph-titration`, `buffer-recipe-creator`, `equilibrium-shifter`, `lotukerfid`, `molmassi`. The patch is `git show cf7e31b ecfb082` in the old repo; the human-readable list is the PR #99/#100 bodies on GitHub.
5. **The three self-contradictions first** (`lotukerfid`, `buffer-recipe-creator`, `thermodynamics-predictor`) — a student who notices these learns the vocabulary is unreliable.
6. **The decimal-separator parser.** `13,8` → 13 → marked wrong is a defect, not a style question.
7. **Grammar that rides along regardless:** `Galvanísk klefi` → `Galvanískur klefi`, and the unaccented `anoða`/`katoða` in the aria-label at `ElectrochemicalCell.tsx:354`.

**Then make it durable.** `packages/shared/i18n/ordabok.md` already ships and nothing enforces it — three READMEs mention it, no build step, no lint rule, no test. April's `lotukerfid` proves a one-time patch will not hold: `ecfb082` fixed `Ómálmur` on 2026-02-05 and a brand-new game re-committed it two months later. A "banned term → correct term" block in `CLAUDE.md`, ideally with a test that greps rendered strings, is what stops this recurring. Add the corpus test as the second rung: **`ordabok.md` → `namsbokasafn-efni` → you.**

### Re-decide, because the platform changed

- **Level 4 vs the 3-level cap.** Almost every port below is Level-4 content (net ionic, percent yield, Ka-from-curve, quantitative Arrhenius, bond enthalpy, Dalton), and February's own house rule was three levels. April replaced that with Explore → Understand → Practice → Apply, which has no level count. Decide once whether Level 4 exists, or whether that content becomes the Apply phase.
- **Level gating.** February built it, April removed it, August wants it back, and the strings for 15 games are already written in three languages with no consumers — 14 under `menu.levels.*.locked`, plus `1-ar/nafnakerfid` under `completeLevel1First`/`completeLevel2First` (measured 2026-08-17; grep both key names). One decision, then wiring.
- **Polish.** February shipped it systematically; `CLAUDE.md` now says Icelandic-only. The open item is much bigger than the Hess block it names.
- **Where sig figs live.** February built a standalone game; `ORPHANED_GAMES_ASSESSMENT.md:356` argues for a _"Stig 0 — Nákvæmni og staðalform"_ level inside `dimensional-analysis`, _"not an eighth Y1 game: Brown treats sig figs as a subsection."_
- **TTS pronunciation of Icelandic chemical names.** Ranked 🟡 MED in January and appearing in three separate lists. Aug 2026 deleted the sound chrome with a standing "don't reintroduce without a pedagogical reason." Pronouncing Icelandic chemical names plausibly is that reason — but it needs you to say so.
- **Periodic trends in Y1, and which year owns atomic structure.**

### The shortest path to "pedagogically sound, accurate, error free, covering the curriculum"

**Cheapest first — content that drops into games you already ship.** This tier is invisible to the orphaned-games assessment, which indexes _files_; these are rows and components added inside files that migrated.

- **25 real-world dimensional-analysis scenarios, gone without trace.** `dc5e614` — your own commit — added 5 each of `L3-COOK`, `L3-PHARM`, `L3-ENG`, `L3-SPORT`, `L3-TRAVEL` with worked Icelandic explanations (_"2 bollar × 240 mL/bolli = 480 mL"_, _"💉 Sjúklingur þarf 0.25 mg af morfíni…"_). `challenges.ts`: 427 lines at the freeze → 739 at window end → **404 in kvenno**, with zero items from any of the five families. A second batch took `problems.ts` context count 16 → 23; kvenno is back at 16. `checklist.md` records this as a completed ✅ and February ranked it 🟡 MED with the note _"Content addition only, no new components needed."_ It is the cheapest item on the board and it directly answers August's central complaint about the interaction loop.
- **The mole-conversion machinery.** `Level4Chemistry.tsx` + `chemistryConversions` (8 compounds with molar masses, gas volume at STP 22.4 L/mol), `molmassi/src/data/avogadro.ts` (251 lines) and `conversionChains.ts` (270 lines, with `n = m/M`, `m = n×M`, `N = n×Nₐ` written out). **This corrects a standing assumption:** mass-to-mass stoichiometry is not un-answered — both directions of g↔mol, mol↔particles and mol↔L _were_ specified and built and lost. Only the two-substance stoichiometric ratio bridge was never specified. `grep -rn "chemistryConversions\|22.4\|6.022" apps/games/1-ar/dimensional-analysis/src/` returns nothing today.
- **`lausnir/src/data/saturation.ts`** — 254 lines of solubility-vs-temperature data, six temperature points per compound (KNO₃ `[13, 32, 64, 110, 169, 246]`), plus `Pipette.tsx` and `IndicatorSystem.tsx`. And `takmarkandi`'s `FactoryMode.tsx` / `StoichiometryVisualization.tsx`.
- **Gas Law PVT + KE visualization** — the only two High-priority open rows in the entire Y3 checklist, with `ParticleSimulation` already in `packages/shared/components/`.

**Then the Y3 ports — five subsystems, tested-by-use, absent from kvenno.** ICE tables (`equilibrium-shifter/src/components/ICETable.tsx` ~618 lines + `data/ice-problems.ts` + `utils/ice-table.ts`, 10 problems), Q-vs-K challenge (`QKChallenge.tsx`, 12 problems), pH Titration Level 4 (`Level4.tsx` + `level4-challenges.ts`, 18 problems — textbook reverse-problem work), thermodynamics calculation challenges (`CalculationChallenges.tsx` + `standard-entropy.ts`, 57 species), Dalton's Law (8 questions plus adding `| 'dalton'` back to the `GasLaw` union at `types.ts:19` — port _into_ the new `MenuScreen`/`GameScreen` split, don't revert it). Plus the Equilibrium ↔ Thermodynamics link (K/ΔG/ΔS for 30 equilibria).

**Then the two whole Y3 games that close self-assessed gaps:** `Leysnisjafnvægi` (Ksp, 21 problems — the "major curriculum gap") and `ka-kb-jafnvaegi` (26 problems), the latter changing the chain to `Gaslögmál → Jafnvægi → Varmafræði → Ka/Kb → pH Títrun → Stuðpúðar`. ⚠️ `solubility-equilibrium` was never terminology-reviewed; `ka-kb`'s problem text was but its `i18n.ts` titles were not; both use `Þrep` where kvenno uses `Stig`.

**Then the Y1 chapter-4 hole**, which is the largest real gap and where February and August agree hardest: `jonir-i-lausn` (15 substances, 21 solubility rules verified against the school's own textbook table, 12 mixing scenarios) and `sydur-og-basar` (15 substances, 10 neutralization reactions, 8 stoichiometry problems). ⚠️ Take the structure and the chemistry, **not** the Icelandic — `sydur-og-basar` ships ASCII-mangled strings and misspells its own subject; the correct forms are in `57d815d`'s commit message. Net ionic equations still need building: the level was specified, never coded, and the eight equations exist only as display strings.

**Then finish `rafeindabygging`** — L2's practice half and L4's Lewis-dot bridge, which is the reason the game was argued for. And fix its correctness defects while you are in there: the correct answer sits at index 0 in 8/8 Level-3 items and valid-before-invalid throughout Level 1, both rendered unshuffled; `dreifastar` → `dreifast` ×3 (`App.tsx:139`, `Level2.tsx:202`, `electron-configs.ts:40`); `Natrín` (`electron-configs.ts:76`) and `Kalsín` (`periodic-configs.ts:20`) contradict Y1's `Natríum`/`Kalsíum`; and `4s`-before-`3d` vs `3d`-before-`4s` in noble-gas shorthand is a convention you have never picked.

**Teaching assets worth lifting even if no code moves:** the Ka/Kb table (18 species with Ka, pKa, conjugate formula and name, and a context string each — _"Found in vinegar"_, _"Found in ant stings"_); the Ksp table (Ksp at 25 °C with molar mass and **precipitate colour** — AgCl white, AgBr pale yellow — the observable a student actually sees, present nowhere else); the significant-figures rules written out in Icelandic (_"Núll framarlega eru EKKI markverð"_, _"Við samlagningu/frádrátt: notum fjölda aukastafa / Við margföldun/deilingu: notum fjölda markverðra tölustafa"_); the matter-classification vocabulary `Frumefni / Efnasamband / Einsleit blanda / Misleit blanda` under `Hrein efni` / `Blöndur` with 24 sample items; measured surface tensions at 20 °C (water 72.8, ethanol 22.1, hexane 18.4, mercury 485.5 mN/m); the calorimeter names `Kaffibollahitamælir` and `Sprengihitamælir`; and `Afgangur`, the label you chose for excess reactant in `dc5e614`.

**Two things to put in `CLAUDE.md` before any of the above:** the core test — _"A student who doesn't understand the concept should NOT be able to score well through guessing or pattern recognition"_ — and the textbook anchor, Brown et al., _Chemistry: The Central Science_, students aged 15-19. The first is the sentence that makes "pedagogically sound" checkable. The second is the named authority "covering the curriculum" needs, and it is currently cited inside individual games but stated nowhere as a standing rule.
