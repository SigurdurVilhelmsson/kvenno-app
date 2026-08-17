# Year 1 Games — Curriculum & Pedagogy Review

**Date:** 2026-08-15
**Scope:** all 7 Year-1 games, reviewed against Brown et al., _Chemistry: The Central Science_, chapters 1–4
**Lens:** curriculum coverage, proven pedagogical method, and whether the games are engaging — a different axis from `REVIEW_TRACKER.md` iterations 1–4 (structure, code health, accessibility, polish)
**Method:** 13 agents read every source and data file; every gap claim was independently re-searched by an adversarial verifier; a completeness critic ran the built games in Chromium and ran the test suite. Headline defects were then hand-verified against source.

---

## Updates since publication (2026-08-16)

Three findings from `apps/games/ORPHANED_GAMES_ASSESSMENT.md` change what is written below. Read them before acting on §2 or §6.

1. **B1 is quantified and worse than stated.** Of the 36 elements in Lotukerfið's pool, 7 mismatch, and 6 of those round to radioactive nuclides with no natural abundance (Ni-59, Cu-64, Zn-65, Ga-70, Se-79, Br-80); the seventh is Ge, which rounds to Ge-73 — a real isotope, but a minor one at ~7.8%, where the rule should have landed on Ge-74 at ~36.5% (NIST, cross-checked against CIAAW; no rank is asserted among germanium's five, because Ge-76 at 7.73% sits within the stated uncertainty of Ge-73's 7.76(8)%). Drawing 2 **graded** neutron slots from 36, **~36% of playthroughs mis-grade a correct answer**; across all 4 neutron-derived slots, ~60% display a wrong neutron count; and because the particle-breakdown card prints a neutron count after _every_ question regardless of type (`Level3.tsx:389-412`, gated on `answered` alone), **~86% of playthroughs show at least one wrong count somewhere**. The fix content already exists in the old repo's `uppbygging-atomanna` (`src/components/Level3.tsx:157-163`, `src/i18n.ts:64-71`).
2. **Two rows in §1 are wrong-as-diagnosed, not wrong-as-taught.** `C3-yield` (percent yield, line 72) and the mass→mole→mass row (line 68) describe content that **existed and was lost** in the Feb 2026 consolidation, not content never written. Old `takmarkandi/Level4.tsx` shipped 8 percent-yield problems; old `molmassi/conversionChains.ts` drove a `Level5.tsx`. Both are recoverable at `379266e` in `namsbokasafn-leikir`. The remaining gaps in §1 were re-tested against better Icelandic stems and **stand**.
3. **A worse defect than anything in §2 exists in Year 3.** `apps/games/3-ar/ph-titration/src/utils/ph-calculations.ts:57,95,133,198` divides a molarity that is already in mol/L by 1000, so every initial-pH branch is wrong — 0.100 M acetic acid renders **pH 4.37** where the game's own `data/titrations.ts:76` asserts **2.87**. Verified by hand. This review is Year-1 scoped and never looked at it; there is no equivalent Y2/Y3 review.

---

## Assumption you should check first

No curriculum mapping exists anywhere in this repo, so the chapter→topic map below is **assumed from Brown 14th ed.** and drives the whole coverage section. If your edition splits differently, correct this one table and the gaps re-sort themselves.

| Ch  | Assumed topics                                                                                                                                                                                                   |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Classification of matter; physical vs chemical properties & separation; SI units, density; precision/accuracy & significant figures; dimensional analysis                                                        |
| 2   | Atomic theory & subatomic particles; atomic number, mass number, isotopes, atomic weight; periodic table structure; molecules & formulas; ions & ionic compounds; nomenclature; simple organic                   |
| 3   | Equations & balancing; reaction patterns incl. combustion; formula weight & percent composition; the mole & molar mass; empirical formula & combustion analysis; stoichiometry; limiting reactant; percent yield |
| 4   | Electrolytes; precipitation & solubility rules; net ionic equations; acids/bases & neutralization; redox, oxidation numbers, activity series; molarity & dilution; solution stoichiometry & titration            |

---

## Headline

The seven games teach **11 of the 27 topics** in chapters 1–4 well or partially. The year's chemistry is **front-loaded and then thins out**: chapter 1 and chapter 2 are decently served, chapter 3 loses the mole halfway through, and **chapter 4 is essentially one topic — molarity and dilution**. Six of chapter 4's seven topics are absent, and four of those are absent from years 2 and 3 as well.

Pedagogically the games are the opposite of flashy — the April 2026 restructure did its job. But nothing replaced what it removed. Across all seven games there is **no sandbox, no level gating, and almost no free construction from memory**; the dominant loop is read-prompt → pick-or-type → be graded, and in five of seven games the entire item pool is fixed and exhausted in one sitting. The single most common defect is not pedagogical theory at all: **in four games the correct answer is visible on screen before the student answers.**

There are also **17 verified correctness defects**: seven that teach false chemistry, six that break grading (some punishing correct work, some accepting wrong work), and four where the answer is simply printed on screen before the student answers.

---

## 1. Curriculum coverage vs Brown ch. 1–4

**Legend:** ●&nbsp;taught (a level is built on it) · ◐&nbsp;touched (appears, not the target skill) · ○&nbsp;absent

### Chapter 1 — Matter and Measurement

| Topic                                       | Status | Where                                                                                                                                                                                                                                 |
| ------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dimensional analysis                        | ●      | Einingagreining, whole game                                                                                                                                                                                                           |
| SI units & metric prefixes                  | ●      | Einingagreining (mass/volume/length/time)                                                                                                                                                                                             |
| Density                                     | ◐      | Einingagreining — used as a multiplier in 5 items, never taught as a concept; no other game                                                                                                                                           |
| Significant figures                         | ◐      | **Demanded but never taught.** `dimensional-analysis/src/data/challenges.ts:249,304,354,379` set `significantFigures: 3` and `Level3.tsx:744-766` grades it; no sig-fig rule appears anywhere. Precision vs accuracy never mentioned. |
| Classification of matter                    | ○      | **Used as an unexplained prerequisite.** `frumefni`/`efnasamband` appear in questions (`nafnakerfid/src/components/Level1.tsx:304`) but are never defined. Not covered in Y2/Y3 either.                                               |
| Physical vs chemical properties, separation | ○      | Zero hits for eiming/litskiljun/síun anywhere in Y1. Not covered later as a ch-1 distinction.                                                                                                                                         |
| Temperature scales                          | ○      | The one temperature item was deleted (ID gap at `challenges.ts:381-383`)                                                                                                                                                              |

### Chapter 2 — Atoms, Molecules and Ions

| Topic                    | Status | Where                                                                                                                                                                                   |
| ------------------------ | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Periodic table structure | ●      | Lotukerfið, whole game                                                                                                                                                                  |
| Nomenclature             | ●      | Nafnakerfið, whole game (ionic, variable oxidation state, Greek prefixes)                                                                                                               |
| Subatomic particles      | ●      | Lotukerfið L3 (proton/neutron/electron counting)                                                                                                                                        |
| Molecules & formulas     | ◐      | Formulas are everywhere; molecular vs **empirical** formula never distinguished                                                                                                         |
| Ions & charge prediction | ◐      | Present only implicitly inside naming rules. Lotukerfið stops at valence-electron counting and never reaches ionic charge — though `lotukerfid/src/App.tsx:215-217` promises prediction |
| Isotopes                 | ○      | **The word `samsæta` appears nowhere in Y1.** See blocker B1 — Lotukerfið currently teaches a rule that is false _because_ isotopes are missing                                         |
| Simple organic           | ◐      | Alkane names used as molar-mass fodder only; properly taught in Y2 `organic-nomenclature`                                                                                               |

### Chapter 3 — Stoichiometry

| Topic                                   | Status | Where                                                                                                                                             |
| --------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Balancing equations                     | ●      | Jafna jöfnur (20 reactions, all verified correct)                                                                                                 |
| Formula weight & the mole               | ●      | Mólmassi (mass↔mole↔particles)                                                                                                                    |
| Limiting reactant                       | ●      | Takmarkandi                                                                                                                                       |
| Stoichiometry from equations            | ◐      | Only as **whole-molecule counting**. No gram→mole→ratio→mole→gram calculation exists anywhere in Y1                                               |
| Reaction patterns (combustion etc.)     | ◐      | Combustion equations appear in Jafna jöfnur; reaction _types_ are never taught as a classification                                                |
| Percent composition                     | ◐      | Mólmassi computes per-element contributions but never converts them to %                                                                          |
| Empirical formula / combustion analysis | ○      | **Confirmed absent from all three years.**                                                                                                        |
| Percent yield                           | ○      | **Advertised but never taught** — `takmarkandi/src/i18n.ts:11` promises "reikna heimtir"; nothing in the game delivers it. Absent from Y2/Y3 too. |

### Chapter 4 — Aqueous Reactions — _the hole_

| Topic                                      | Status | Where                                                                                                                                         |
| ------------------------------------------ | ------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Molarity & dilution                        | ●      | Lausnir (the only chapter-4 topic taught)                                                                                                     |
| Solution stoichiometry / titration         | ◐      | Concentration half only; the stoichiometric half absent. Titration taught from scratch in Y3                                                  |
| Acids & bases as a reaction class          | ◐      | Acids appear as names and molar masses; neutralization never taught. Covered in Y3                                                            |
| Electrolytes / dissociation / conductivity | ○      | Zero hits for raflausn/rafleiðni/jónast in Y1 — **and in Y2/Y3.** Y3's buffer and titration games assume ionization that was never introduced |
| Precipitation & solubility rules           | ○      | Zero teaching hits; **zero `(aq)` state symbols anywhere in Y1**                                                                              |
| Net ionic equations & spectator ions       | ○      | **Zero trace in the entire curriculum, all three years**                                                                                      |
| Redox: oxidation numbers, activity series  | ○      | Roman numerals appear for naming only; `oxunartala` never appears in Y1. Oxidation numbers taught in Y2; activity series nowhere              |

**The four gaps that are never filled by any game in any year:** empirical formula, percent yield, electrolytes/dissociation, net ionic equations. Precipitation and solubility rules are effectively in the same category (two incidental traces in Y3, never taught).

---

## 2. Verified correctness defects

All hand-checked against source. Ordered by how directly they harm a student.

### Teaches false chemistry

| #   | Game                   | Defect                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Location                                                                                                                                                  |
| --- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| B1  | Lotukerfið             | Neutron count = `Math.round(atomicMass) - atomicNumber`, taught as a method. Chemically false for **7** of the 36 elements in the Level-3 pool — Ni, Cu, Zn, Ga, **Ge**, Se, Br. (This line originally said 6, omitted Ge, and kept a ~54% figure derived from the 6-element set. Element set recomputed 2026-08-16 against `elements.ts`, which holds 42 elements, 36 of them with `period <= 4`; abundances are from NIST/CIAAW, so the set rests on an external source. Probabilities recomputed 2026-08-17 from the corrected set — hypergeometric, cross-checked by a 2M-run Monte Carlo against the shipped shuffle.) **Mis-grades a correct answer in ~36% of playthroughs** — the 2 graded neutron slots drawn from 36; a wrong count is _displayed_ in ~60% (4 neutron-derived slots) and ~86% once the particle-breakdown card is counted. The game states "Nifteindir = massatala − atómnúmer = 64 − 29 = 35" for Cu; the real Cu-63 has 34. | `lotukerfid/src/components/Level3.tsx:31-33`, taught at `:75`, `:106`, `:262`, recomputed inline at `:405` and `:410` (the latter prints the mass number) |
| B2  | Einingagreining        | Speed of light answer wrong by 1000×: `expectedAnswer: 1.08e12`, correct is `1.08e9 km/klst`. The wrong value is also leaked in the input placeholder.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | `dimensional-analysis/src/data/challenges.ts:271`; `Level3.tsx:553`                                                                                       |
| B3  | Lausnir                | Gas solubility data 10× too high — g/L values under a `g/100g H₂O` axis label (CO₂ 3.35 should be 0.335; O₂ 0.069 should be 0.0069)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | `lausnir/src/components/TemperatureSolubility.tsx:59,67`; label at `:220`                                                                                 |
| B4  | Mólmassi               | 12 of 29 compounds print a per-element breakdown whose lines **do not sum to the total printed underneath** (Al₂(SO₄)₃ lines sum to 342.132, total prints 342.151) — in the one game whose entire skill is summing element masses. Both numbers render at `toFixed(3)`, so every delta is visible, down to the +0.001 cases. Cause: `elements.ts` stores abridged atomic masses for O (15.999), Cl (35.45) _and_ S (32.06) while `compounds.ts` hardcodes unabridged totals — not sulfur alone; 5 of the 12 mismatching compounds contain no sulfur.                                                                                                                                                                                                                                                                                                                                                                                                    | `molmassi/src/data/compounds.ts` vs `elements.ts:50,60` via `CalculationBreakdown.tsx:36-49`                                                              |
| B5  | Nafnakerfið + Mólmassi | Wrong compound names taught as fact: P₄O₁₀ = "Fosfordekoxíð" (missing tetra- — inconsistent with N₂O₄, N₂O₅ and Cl₂O₇ in the same table, which all carry their prefix correctly); Fe₃O₄ = "Járnoxíð (blandað)" (not a nomenclature name, and the parenthetical doubles as a filter flag); Co(NO₃)₂ = "Kóbolt(II)nítrat" (Icelandic is _kóbalt_ — the sibling game spells it right at `lotukerfid/src/data/elements.ts:314`); `naming.ts:25` gives S the root "brennisteinið", a non-word, which is one reason SF₆ is unbuildable in Level 3. In Mólmassi: Na₂CO₃·10H₂O = "Vatnaglas hýdrat" (vatnsgler is sodium _silicate_; this is þvottasódi); NaOH = "Natrímhýdroxíð" (typo)                                                                                                                                                                                                                                                                        | `nafnakerfid/src/data/compounds.ts:357,440,548`, `naming.ts:25`; `molmassi/src/data/compounds.ts:33,46,51`                                                |
| B6  | Lausnir                | Level 3 generates physically impossible solutions — mass drawn 10–100 g against volume 50–500 mL with no solubility ceiling; up to **54 M HCl**. ~14–20% of generated problems exceed real solubility                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | `lausnir/src/utils/problem-generator.ts:116-120`                                                                                                          |
| B7  | Mólmassi / Takmarkandi | Ionic formula units called "sameindir" (molecules) — a documented misconception, which Mólmassi itself corrects in Level 3                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | `molmassi/src/components/Level2.tsx:89`; takmarkandi throughout                                                                                           |

### Grades correct work as wrong

| #   | Game              | Defect                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Location                                                                                |
| --- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| B8  | Takmarkandi       | Reactant counts are drawn at random with no relation to the coefficients, then the run count is floored. A student who follows the game's own printed hint `min(A÷c₁, B÷c₂)` is **graded wrong on ~44% of Level 2 and ~70% of Level 3 problems** (Monte Carlo, 400k runs). The app also prints raw 16-digit decimals, and the reactant labelled "takmarkandi" is usually not fully consumed — breaking the definition.                                                                                                                                                                  | `takmarkandi/src/utils/calculations.ts:48-66` and `:14`                                 |
| B9  | Einingagreining   | `parseFloat` rejects the Icelandic decimal comma **that the game's own worked example teaches** (`0,5 g` at `Level2.tsx:407`) → parses to 0, graded wrong, then blames the student for inverting a factor. 8 of the 15 Level-2 targets are non-integer, so this is reachable on over half the level.                                                                                                                                                                                                                                                                                    | `dimensional-analysis/src/components/Level2.tsx:246,286`; also `Level3.tsx:128,137,151` |
| B10 | Lausnir, Mólmassi | **Worse variant, verified by keyboard test in the shipped `dist/` build.** On `input type="number"`, typing `0,5` silently **drops the comma and leaves `05`** — the field is `valid`, `badInput` is false, submit stays enabled, and the student's 0.5 is graded as **5**. A silent 10× error with no signal to the student. Identical under `is-IS` and `en-US`, so it is not a locale setting. Mólmassi Level 1 _has_ a comma normaliser at `Level1.tsx:107` (`input.replace(',', '.')`) that can never fire, because `:384` is `type="number"` and the browser ate the comma first. | `lausnir/src/components/Level3.tsx:203-206`; `molmassi/src/components/Level1.tsx:384`   |
| B11 | Einingagreining   | A mathematically valid reordering of two commutative factors is marked wrong; the default diagnosis then misattributes it to factor inversion                                                                                                                                                                                                                                                                                                                                                                                                                                           | `dimensional-analysis/src/components/Level2.tsx:245,265`                                |
| B12 | Jafna jöfnur      | Non-reduced coefficient sets accepted as correct (4H₂ + 2O₂ → 4H₂O passes); the lowest-whole-number requirement is never checked or mentioned                                                                                                                                                                                                                                                                                                                                                                                                                                           | `jafna-jofnur/src/utils/balanceChecker.ts:71-74`                                        |
| B13 | Einingagreining   | Absolute 0.01 tolerance: on an answer of 0.005 kg, typing `0` scores correct                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | `dimensional-analysis/src/components/Level2.tsx:254,295`                                |

### The answer is on screen before the student answers

| #   | Game            | Defect                                                                                                                                                                              | Location                                                 |
| --- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| B14 | Nafnakerfið     | Level 2 prints the finished name in a box labelled "Mundu:" **directly above the input asking for it** — all 12 items. It is a typing exercise, and it awards 10 points.            | `nafnakerfid/src/components/Level2.tsx:508-511`          |
| B15 | Lotukerfið      | Every Level 2 question is answerable from the reference table rendered beneath it — including order-by-mass items where the three masses are printed on the three highlighted cells | `lotukerfid/src/components/Level2.tsx:356,435`           |
| B16 | Lausnir         | Half of Level 2's items display the answer before the student answers                                                                                                               | `lausnir/src/components/Level2.tsx:550-553,562`          |
| B17 | Einingagreining | Level 3 efficiency items print the correct answer on the choice buttons                                                                                                             | `dimensional-analysis/src/components/Level3.tsx:523-537` |

**Also:** Nafnakerfið Level 3's chip pool cannot construct 33 of its 51 possible compounds (no Roman-numeral chips, no polyatomic-ion chips, 7 metals missing), so a student drawing 10 at random gets roughly 6 unanswerable items (`nafnakerfid/src/components/Level3.tsx:63-89`).

---

## 3. Pedagogy

Rated against eight criteria from the effective-instruction literature, independent of the tracker's P1–P7.

|                                       | Einingagr. | Lotukerfið | Nafnakerfið | Mólmassi | Jafna jöfnur | Takmarkandi | Lausnir |
| ------------------------------------- | ---------- | ---------- | ----------- | -------- | ------------ | ----------- | ------- |
| **R1** Retrieval / generation         | ◐          | ✗          | ✗           | ✓        | ✓            | ◐           | ◐       |
| **R2** Faded worked examples          | ◐          | ✗          | ◐           | ◐        | ◐            | ◐           | ✗       |
| **R3** Elaborated diagnostic feedback | ✗          | ✗          | ◐           | ◐        | ◐            | ◐           | ◐       |
| **R4** Misconception confrontation    | ◐          | ✗          | ◐           | ✗        | ✗            | ✗           | ◐       |
| **R5** Dual coding                    | ◐          | ◐          | ✗           | ✗        | ◐            | ✗           | ◐       |
| **R6** Cognitive load                 | ◐          | ◐          | ◐           | ◐        | ◐            | ✓           | ◐       |
| **R7** Agency & curiosity             | ✗          | ✗          | ✗           | ✗        | ✗            | ✗           | ◐       |
| **R8** Variability & transfer         | ◐          | ◐          | ✗           | ◐        | ✗            | ✗           | ◐       |

### The four patterns that work — copy these

1. **Let the student build the wrong artefact and look at it.** Einingagreining's `OrientationChallenge` (`components/challenges/OrientationChallenge.tsx:48-130`) says "try both factors and see what happens"; the wrong one renders the literal product `km × km / m`. A real prediction, a real refutation, ten seconds. This is the best teaching moment in Year 1.
2. **Live, manipulable state.** Jafna jöfnur's `AtomCounter` (`AtomCounter.tsx:20-56`) recomputes on every keystroke — the one place a game feels like a machine responding rather than grading. (Caveat below.)
3. **Commit before you see.** Lausnir's prediction gate (`lausnir/src/components/Level1.tsx:518-637`) locks the slider until the student commits to increase/decrease/unchanged, then refutes in writing. Worth copying verbatim into every game that opens on manipulation.
4. **Diagnose the specific error.** Mólmassi's `diagnoseMistake` (`molmassi/src/components/Level1.tsx:17-47`) perturbs each element count ±1 to find which single miscount explains the student's number, then says "you seem to have forgotten one oxygen atom". ~30 lines, and it generalises to any answer that is a sum over countable parts.

### The systematic failures

- **One shared line hides the explanation in every game in the repo.** `packages/shared/components/FeedbackPanel/FeedbackPanel.tsx:104` is `useState(false)`, and `:186` gates the explanation body on it — so the authored "why" is one click away and off by default at all 26 call sites across all three years. Six games' worth of separately-filed "feedback is binary" findings are this one line. Two scoping caveats, both checked: the _misconception_ slot renders **outside** the toggle (`:202-213`), so games that populate it are not bare — and Mólmassi additionally renders its own visible content on every wrong answer (`Level1.tsx:455` breakdown table, `Level3.tsx:476-487` worked solution). Where the bare word **"Rangt"** really is the whole response is the games that pass only `explanation` and never `misconception`: **Lotukerfið** (zero misconception call sites, all 26 items) and **Jafna jöfnur** (its per-element diagnostic is inside the collapsed slot). Note also that two obvious-looking fixes are no-ops: `showExplanation` is already `true` and gates only the toggle button, and there is no `defaultExpanded` prop on `FeedbackPanelConfig`.
- **No game gates any level.** All seven render every level button unconditionally, while Takmarkandi and Lausnir still ship dead "Ljúktu stigi 1 fyrst" strings. Every "the hardest level has the least scaffolding" finding is worse than filed, because that level is the one a confused student can open first.
- **The completion rung is missing everywhere.** Six of seven games go straight from a worked example to independent problems. No game ever hands the student a partially-completed problem to finish.
- **Misconceptions are barely attacked.** Four of seven games name no misconception at all, and the shared `FeedbackPanel` has a purpose-built misconception channel that most games leave empty. Takmarkandi's one named misconception ("the limiting reactant isn't just the one you have less of") is **structurally impossible to encounter**: `Level1.tsx:38-44` never generates an item where the limiting reactant is the more numerous one — and its correct answer alternates left/right, so the level can be scored 100% without reading.
- **Fixed, exhaustible pools.** Einingagreining 37 items, Jafna jöfnur 20, Nafnakerfið ~40 answerable, Lausnir 16 hand-authored. Lotukerfið and Mólmassi L2 generate; nothing else does.

### Engagement — and an honest caveat

All seven games scored **2/5**, and I'm reporting the caveat with the number: the reviewers rated _structure_ (item counts, branch counts, presence of a sandbox) and several then wrote it up as a prediction about teenagers' attention. The structural claim is solid and I stand behind it; treat "a 16-year-old wouldn't play this voluntarily" as an inference, not a measurement.

What the structure actually shows:

- **No sandbox exists in any game**, with one exception — Lausnir's Temperature Explorer (`Level2.tsx:871-963`), free choice of compounds with real data, which hides behind an unlabelled "🔬 Kanna" button that nothing in the game points at, and whose autoscale flattens the very curves it exists to contrast.
- **Lotukerfið locks the one genuinely explorable object in first-year chemistry.** The periodic table is rendered `interactive={false}` in Levels 2 and 3 and used purely as an answer widget in Level 1.
- **Jafna jöfnur's counter is never gated**, so the intended reasoning is optional: press + toward whichever number is smaller until the rows turn green. The gold-standard reputation belongs to the component, not to the loop it sits in.
- **Five of seven games have zero surface-context variation** — no lab, no medicine, no kitchen, no industry. Every item is a bare formula.

---

## 4. Cross-game problems

These are invisible from inside any single game.

1. **"Sameind" means three different quantities in three consecutive chain positions.** Mólmassi (pos 4): 1 mól = 6.022×10²³ sameindir. Takmarkandi (pos 6): discrete molecules, and the word `mól` appears **zero times in the whole game**. Lausnir (pos 7): `Level1.tsx:334` — one "sameind" = 0.01 mol, i.e. 6×10²¹ real molecules. A first-year cannot know the word was silently redefined twice.
2. **The mole is introduced at position 4 and then abandoned.** Occurrences of `mól` per game: Einingagreining 0, Lotukerfið 0, Nafnakerfið 0, **Mólmassi 69**, Jafna jöfnur 0, Takmarkandi 0, **Lausnir 48**. The year gets _less_ quantitative as it advances — and mass-to-mass stoichiometry, the most exam-relevant Y1 skill, is practised nowhere, while the landing page bills Takmarkandi as "Takmarkandi hvarfefni og stökjómetría" (`apps/landing/src/pages/GamesHub.tsx:57`).
3. **Terminology doesn't match the students' own glossary.** Atomic number ships as both `raðtala` and `atómnúmer` — split across teaching vs assessment _within Lotukerfið Level 3_ — while the approved term in `namsbokasafn-efni`'s unified glossary is **`sætistala`**, which appears in zero games. Similarly `stækifræði` vs `stökjómetría` (the latter on the hub page every student passes through).
4. **Nafnakerfið asks students to name compounds built from elements Lotukerfið never showed them** (Sn in SnO₂, Xe in XeF₄ — absent from the 42-element table the previous chain position teaches them to read). And NaCl is 58.44 g/mol in Mólmassi but 58.5 in Lausnir and Einingagreining.
5. **The three games with zero tests are exactly the three carrying unguarded blockers.** The suite is green — 55 files, 967 tests, 57s — and certifies nothing about chemistry: Lotukerfið, Jafna jöfnur and Takmarkandi have no test files at all (Takmarkandi's `__tests__/` is an empty directory), and they hold B1, B8 and B12. This is why four review iterations missed these defects.

---

## 5. Stale documentation

- **`docs/game-reviews/01,02,03,04,05-*.md` are substantially false for Y1** — they describe deleted features (memory-match Level 3, NameBuilder, ParticleBeaker, ReactionAnimation, achievements, hint systems, mastery gates, timer/competition modes) and score accuracy 5/5 on databases that contain the errors in §2. They predate the April 2026 restructure and should be marked superseded rather than read.
- **`REVIEW_TRACKER.md`'s "Zero FAIL ratings across all 7 games — achieved"** is true only inside its own P1–P7 rubric. Against the criteria in §3 there are 20 FAILs. One closed item is factually wrong: iter-1 item 4 ("verified hints are already strategic, not solution-revealing") — `Level1Conceptual.tsx:300` renders the full solution at hint tier 3.
- **`molmassi/LEVEL1_README.md` and `VISUAL_COMPARISON.md` are inverted** — they describe the current Level 1 as the "OLD" design that was replaced. `molmassi/README.md` is still the untouched game-template README.
- **`SUGGESTED_IMPROVEMENTS_1-AR.md` (Feb 2026)**: its two chemistry-connection recommendations — add g→mol contexts to Einingagreining L2, add gram/mole scenarios to Takmarkandi — are **still open and now the highest-value content items in the file**, since §4.2 shows the mole is missing from both.
- **`CLAUDE.md:161`** lists Jafna jöfnur as gold standard on the strength of its atom counter. Worth qualifying: the counter is excellent and ungated (§3).

---

## 6. Recommended order of work

**Tier 0 — correctness (all small except where noted).** B1 neutron counts _(M — see below)_, B2 speed of light, B8 Takmarkandi generator _(M, fixes three blockers at once)_, B3 gas solubility, B6 molarity ceiling, B12 GCD check, B4 breakdown sums, B5 compound names, B13 tolerance.

**The decimal comma (B9/B10) deserves one repo-wide pass**, since the fix differs by mechanism and only Mólmassi L2/L3 get it right today:

- Any field whose answer is non-integer must be `type="text"` with `inputMode="decimal"`, **not** `type="number"` — on `type="number"` the browser deletes the comma before your code runs, so `0,5` is submitted as `5`.
- Then normalise before parsing: `parseFloat(v.replace(',', '.'))` at every grading site.
- Affected: Lausnir `Level3.tsx:203`, Mólmassi `Level1.tsx:384` (both `type="number"` with decimal answers), Einingagreining `Level2.tsx:246,286` and `Level3.tsx:128,137,151` (text, unnormalised). Not affected: Lotukerfið and Takmarkandi, whose numeric fields take integer counts.
- Add a `'0,5'` case to the unit tests; nothing currently guards this.

**Tier 1 — stop showing the answer.** B14 (delete the "Mundu" block and fade the 12 items), B15, B16, B17, plus the Nafnakerfið chip pool.

**Tier 2 — one line, best pedagogical return per character.** Default `FeedbackPanel` to expanded on incorrect answers (`FeedbackPanel.tsx:104`). One change, 26 call sites, all three years; it matters most in Lotukerfið and Jafna jöfnur, where nothing else visible replaces the hidden text. Populating the `misconception` prop in the games that leave it empty is the natural companion, since that slot already renders uncollapsed.

**Tier 3 — curriculum decisions (yours, not code).** The chapter-4 hole is the big one: electrolytes, precipitation/solubility rules, net ionic equations, and neutralization as a reaction class are absent from Y1 _and_ from Y2/Y3. Empirical formula and percent yield are likewise absent everywhere. Mass-to-mass stoichiometry needs a home. Whether these become new games, new levels in Lausnir/Takmarkandi, or stay off-platform is a teaching decision.

**Tier 4 — engagement.** Gate levels. Propagate the four patterns in §3. Unhide the Temperature Explorer. Gate the atom counter (e.g. reveal after a prediction). Add context variation to the five games that have none.

**Turn B1 into the missing lesson.** Lotukerfið's neutron bug exists precisely because isotopes are missing (Ch 2). Add a `massNumber` field per element and an isotope panel, and one blocker fix closes one curriculum gap.

---

## Limits of this review

Source-level, plus browser runs against the built `dist/` HTML (Chromium via Playwright, explicit `is-IS` and `en-US` contexts) — which is how B10 was found and then corrected, and which no amount of reading would have caught. No student testing. The engagement scores are structural inferences (see §3). Every finding above was cited to `file:line` by one agent and re-checked by an adversarial verifier; the 17 defects in §2 were then hand-verified against source, and B10 by keyboard test. Where a verifier narrowed a claim, the narrowed version is what appears here.

Twelve e2e specs already exist in `e2e/` and were not part of any prior review iteration. Open behavioural questions they could settle cheaply: whether Einingagreining's "Áskorun 11 / 10" progress bar visibly overflows; whether Lausnir's dead submit button reads as a broken app; and whether Jafna jöfnur's ungated atom counter really does permit hill-climbing to a green table without reasoning — the single most load-bearing engagement claim here, given that CLAUDE.md holds that game up as gold standard.
