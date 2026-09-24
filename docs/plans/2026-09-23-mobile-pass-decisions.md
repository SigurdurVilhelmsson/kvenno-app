# Decisions left open by the September mobile pass

**Date:** 2026-09-23 · **For:** Siggi · **Status:** nothing in items 1–122 has been changed

The 2026-09 mobile pass, and the bug-fix passes that followed it (one per game, then four over the
shared code), fixed every defect that had one right answer. Whatever needed a teaching, content or
terminology ruling was left as it was and is collected here: 122 items, platform-wide first,
then one section per game in curriculum order.

Each item states the decision in bold, then where it lives, the options, and the pass's
recommendation. The numbers are for replying: "4 (b), 17 as recommended, 30 leave" is enough to
act on. Most rulings then become one sweep plus a guard test, the way the terminology table in
`CLAUDE.md` did.

Terminology items follow `CLAUDE.md`'s resolution order (`ordabok.md`, then the textbook corpus,
then Siggi), so every one here is a case where the first two are silent or disagree. Corpus counts
are from `books/efnafraedi-2e/02-mt-output/`.

Two short sections at the end fall outside "nothing changed". **Applied — confirm only** lists four
changes the passes did make on a glossary entry or a written review; each is reversible. **Not for
Siggi** lists engineering follow-ups found on the way, so they are not lost.

Many per-game items are also in that game's README `## Open` section. This file is the one place
they are all together.

---

## Platform-wide

**1. Scores, points and streaks are shown while students practise.**
`CLAUDE.md` says "No scoring, timers, or streaks during learning phases", but no ruling has applied
it to practice levels. Where: a running `Stig: N` / `N stig` in every level of `rafeindabygging`,
`intermolecular-forces`, `kinetics` and `redox-reactions` (whose Stig 1 also pays less for a second
try); score and streak in the practice modes of `gas-law-challenge` and `thermodynamics-predictor`
(whose score is never reset, so Keppnishamur starts from a lifetime total that includes practice).
Options: (a) keep; (b) no running score inside a level, `N af M rétt` at its end, points only in the
timed Keppnishamur modes; (c) no points anywhere. **Recommendation:** (b), ruled once and swept.
Items 23, 42, 54, 58 and 66 are this question in one game each.

**2. Two games still charge for hints.**
`CLAUDE.md` says no game charges for a hint any more; two do. `lewis-structures` Level 1 scales its
15 points by the HintSystem tier multiplier and shows it (`Level1.tsx:292,441`); its Level 3 awards
8 instead of 15 once the hint is opened and says nothing (`Level3.tsx:380`).
`buffer-recipe-creator` multiplies in all three levels, visibly (`Level1.tsx:159`,
`Level2.tsx:185`, `Level3.tsx:186`). Options: (a) keep; (b) a flat award, as the four August
stragglers got, with a `hint-cost` test in each game; (c) keep, but make Lewis Level 3 show its
cost. **Recommendation:** (b). A silent penalty is the worst of the three. `docs/README.md:44,52`
records Lewis Level 1 as deliberately left, so it changes with the ruling.

**3. The Year-2 Námsleiðin chain is half English.**
`Rafeindabygging → Lewis → VSEPR → IMF → Hess → Kinetics → Redox → Organic`, in all eight Y2
`App.tsx` files and in `CLAUDE.md`. The Y1 and Y3 chains are Icelandic and test-guarded. Options:
(a) keep; (b) the hub-card names (`Millisameindakraftar`, `Hvarfhraði`, `Oxun og afoxun`,
`Lífræn nafnagift`, …); (c) short node labels you choose, as Y3 got `Hliðrun jafnvægis`.
**Recommendation:** (b) or (c), in one sweep with a Y2 `chain-string.test.ts`. The `Redox` node
waits on item 83.

**4. The i18n question is still open in twelve games.**
The 2026-09-19 ruling stripped the language switcher where nothing went through `t()`. Twelve games
still render it. Three translate only the title and description (`rafeindabygging`,
`vsepr-geometry`, `takmarkandi`); the rest mix `t()` with hardcoded Icelandic (`lausnir`'s Stig 0,
`takmarkandi`'s Stig 3, and others; `docs/i18n-coverage.md` has the counts). Found inside the
blocks: `lotukerfid`'s and `lausnir`'s Polish is ASCII-flattened (`Uklad okresowy`, `stezenie`);
`vsepr-geometry`'s unread `is` block holds wrong chemistry (`Hornrétt` for bent, `Stakeindir` for
lone pairs); `hess-law`'s en/pl explanations still print decimal points, and its Polish block still
wants your sign-off. Options: (a) strip everywhere; (b) finish wiring; (c) keep. **Recommendation:**
extend the September rule to the three title-only games now. If Polish stays anywhere, restore its
diacritics in one pass with a flattened-Polish guard.

**5. Which number is `1.300` when a student types it?**
`parseStudentNumber` (`packages/shared/utils/numbers.ts:38-44`, used by about 20 games) reads the
dot as a decimal point. The textbook writes thousands with a dot 127 times and with a space never
(`1.300 grömm`, ch01/m68690:62), but also writes 1083 decimals with exactly three places (`1,008`),
and an English-region phone keypad offers only `.`, so a lone `d.ddd` really is ambiguous. Some
forms are misread under any reading: `2.219,2` → 2,219; `1.000.000` → 1. It also half-reads
trailing text: `8,3 × 10²` → 8,3, `0,8-1,0` → 0,8, while `4,64 g` → 4,64 is wanted. Options:
(a) status quo; (b) read only the unambiguous book forms as thousands (several dots, or dot groups
before a comma decimal) and keep a lone `d.ddd` as a decimal; (c) refuse a lone `d.ddd`, which
also refuses a correct `1.008`; (d) in games whose answers pass 1000 (`dimensional-analysis`
Level 2 and Stig 0), say so in feedback when the typed value is exactly answer/1000.
**Recommendation:** (b) plus (d), with Icelandic wording from you for (d), and settle strictness
about trailing text in the same ruling. Only the docstring changed: it had claimed a thousands
space is how Icelandic writes large numbers, and the book never does.

**6. English glosses and abbreviations inside Icelandic text.**
`kinetics` glosses terms in parentheses (`Hvarfhraði (reaction rate)`, `stefna (orientation)` ×3,
`Milliefni (intermediate)`, `(rate-determining step)`) in `App.tsx`, `Level1.tsx`, `Level3.tsx`
and the question data. `vsepr-geometry` shows `nameEn` subtitles in the Stig 1 grid and
`ShapeTransitionAnimation`, `(hybridization)`, and the pair abbreviations `lp`, `bp`, `LP`, `BP`.
Options: (a) strip them; (b) keep them, in the book's `(e. …)` form; (c) keep them only in
definition boxes. **Recommendation:** (c), in `(e. …)` form, since students meet the English terms
in Brown. Rule the pair abbreviations with item 20.

**7. Expanded octets are explained by d-orbitals.**
`lewis-structures` `Level2.tsx` (PCl₅ and SF₆ explanations, the `Stækkuð átta` card, ~:603) says
`getur notað d-undirhvolf`; `vsepr-geometry` `Level2.tsx:153,187` says `rúmað 5 tengsl vegna
d-hvolfa`, which is also not the glossary's word (`undirhvolf`).
Brown treats the d-orbital account as unsupported and puts it down to the central atom's size.
Options: (a) keep; (b) reword to size, e.g. `P og S eru á 3. lotu og nógu stór til að rúma fleiri
en fjögur rafeindapör`; (c) drop the why. **Recommendation:** (b), your wording, in both games.

**8. The 3D viewer tells phone users to scroll-wheel.**
`Dragðu til að snúa, skrollaðu til að stækka` in `intermolecular-forces` (`Level1.tsx:778`),
`lewis-structures` and `vsepr-geometry`. On a phone zoom is a pinch, and `skrolla` is slang.
Options: (a) leave; (b) one wording for both devices, e.g. `Dragðu til að snúa; klíptu eða skrunaðu
til að stækka`; (c) switch the text on pointer type. **Recommendation:** (b), in all three at once.

**9. Which book's formation enthalpies do the Hess and thermodynamics games use?**
Both games store their own ΔH°f values. `packages/shared/data/thermo.ts` transcribes the Icelandic
book's appendix (m68865), and the Appendix D ruling does not reach enthalpies. In `hess-law` the
gap changes an answer: CaCO₃ is −1206,9 in the game and −1220,0 in the book, so challenge 3 stores
178,3 (±3,6) while the book gives +191,6 and a student using it is marked wrong
(`utils/hess-calculations.ts`, `Level3.tsx`). `thermodynamics-predictor` ids 12 (CaCO₃, 178 vs
191,6) and 21 (NO₂ dimerisation, −57 vs −55,3) differ without changing a sign. Options: (a) derive
from `thermo.ts`, as `equilibrium-shifter` does, adding the missing rows (Fe₂O₃, Al₂O₃, C₂H₅OH);
(b) keep the stored tables and say whose they are; (c) wait for a check against Brown.
**Recommendation:** (a), once you confirm the Icelandic appendix is acceptable here. `hess-law`
Level 2 uses a third set of roundings, which (a) retires too.

**10. Printed givens cannot carry trailing zeros.**
A stored JS number drops them. `einingakedjan`'s ratio cards print `0,1 mol NaOH = 1 L` directly
above their source `0,100 M NaOH`, water's density as `1 g = 1 mL` while a hint says `1,00 g/mL`,
and molar masses `32`, `40` among two-decimal siblings (`data/ratios.ts`). `gas-law-challenge`'s
`Gefnar upplýsingar` print `V: 2 L` beside a scenario that says `2,0 L` (`GameScreen.tsx`).
Options: (a) an optional display label on the data, with a test that label and value agree, as
`Problem.startLabel` already does in `einingakedjan`; (b) leave. **Recommendation:** (a), low
priority. Significant figures are not graded in either game, but both contradict what
Einingagreining teaches.

**11. The progress caption `Stig lokið`.**
`lokið` governs the dative, so the sentence form is `Stigum lokið`; the corpus does not settle a
caption. About 15 sites in 14 games (`takmarkandi`, `lausnir`, `nafnakerfid`, `hess-law`, `kinetics`,
`vsepr-geometry`, …). Options: (a) `Stigum lokið`; (b) keep as a label; (c) `Lokin stig`.
**Recommendation:** (c), which reads naturally under a number and sidesteps the case, but it is a
native-speaker call. Sweep all sites together once ruled.

### Terminology that spans games

**12. `umbreytingarstuðull` or the book's `umreikningsstuðull`; and one verb for
cancelling units.**
`dimensional-analysis` says `umbreytingarstuðull` at 13+ sites; `lausnir` and `molmassi` use it
too. The corpus has `umreikningsstuð*` 33 to 1, and `umreikningsstuðull eininga` is the ch01
glossary headword; `ordabok.md` is silent. For cancel, the game says both `strikast út` (about 20
sites, 0 in the corpus) and `styttast út` (about 12, the book's word). Options: (a) sweep to
`umreikningsstuðull` and `styttast út`, with governed-terms rows; (b) keep `umbreytingarstuðull`
but pick one verb; (c) leave. **Recommendation:** (a) for the noun; for the verb, `styttast út` in
prose and `strika út` only as the name of the on-screen strike-through.

**13. Words for subscript and superscript.**
`ordabok.md` has neither. Three games use three words, and the two agents that looked recommended
different replacements. `reynsluformulur` names its whole fourth column `Vísitala` (Skilja, Æfa,
the menu, aria-labels, README); `jafna-jofnur`'s misconception slot says `Vísitölunum (litlu
tölunum) má aldrei breyta` (`utils/balanceChecker.ts`). The book uses `vísitala` only as
`hávísitala`/`lágvísitala` in figure alt-text; its prose has `lágstafur` 240+ times, including the
empirical-formula module ch03/m68702, and `neðanskrift` 341 times (ch04/m68709:155). For superscript
`rafeindabygging` says `yfirskrift (1s²)`; the book's usual word is `hávísir`. Options: (a)
`lágstafur`; (b) `neðanskrift`; (c) keep `vísitala`. **Recommendation:** one word for the platform
and an `ordabok.md` entry. `lágstafur` is what the book's empirical-formula module uses; either
is attested. Superscript: `Notaðu tölustafi (1s2) eða hávísa (1s²)`. `vísitala` → `lágstafur` moves
gender, so it is a rewrite, not a swap.

**14. `Saltsýra` and `Flússýra` for the pure compounds.**
`saltsýra` is HCl(aq). `intermolecular-forces` gives HCl the name `Saltsýra` beside the gas's
boiling point, −85 °C (`Level1.tsx` molecules 3 and 9, `Level2.tsx` problem 1), and HF `Flússýra`;
`molmassi` names HCl `Saltsýra` while quoting the compound's molar mass (already open in
`CLAUDE.md`). `lausnir`, `ph-titration` and `syrufastinn` mean the solution and may be right.
Corpus: `vetnisklóríð` 22, `vetnisflúoríð` 26. Options: (a) keep; (b) `vetnisklóríð` /
`vetnisflúoríð` wherever the pure compound is meant. **Recommendation:** (b), one ruling for all.

**15. `Köfnunarefni` or `Nitur` for N; and the name of N₂O₄.**
`ordabok.md` is silent. The book uses both as the element name (105 to 63) and prefers the `nitur-`
stem in compounds (`nituratóm` 80+ to 49+). `lotukerfid` and `molmassi` say `Köfnunarefni`;
`lewis-structures`, `vsepr-geometry`, `hess-law` and `rafeindabygging` (`electron-configs.ts:47,54`)
say `Nitur`; `nafnakerfid` uses both. A sweep to `köfnunarefni` was reverted in this pass because
the platform is split. N₂O₄: `nafnakerfid` and `jafnvaegisfasti` say `díniturtetroxíð`, the corpus
`tvíköfnunarefnistetraoxíð` (4+ hits, 0 for the platform form), and `equilibrium-shifter` id 1 says
`Díköfnunarefnisoxíð`, which is N₂O. Options: (a) `köfnunarefni` for the element, keeping the
`nitur-` compounds; (b) `nitur`; (c) both. **Recommendation:** (a), plus an `ordabok.md` entry.
For N₂O₄, keep `díniturtetroxíð` (what Y1 teaches) and fix id 1 to it, unless you prefer the book's
form platform-wide.

**16. `kolsýringur` or `kolmónoxíð` for CO.**
`hess-law` says both: `Kolmónoxíð` (Stig 2 puzzle 1 title, `data/puzzles.ts`) and `Kolsýringur`
(the ΔH°f table). Three other games say `kolsýringur`. Corpus 23 to 24; `ordabok.md` is silent.
Options: (a) `kolsýringur`; (b) `kolmónoxíð`, systematic as Nafnakerfið teaches oxides.
**Recommendation:** (a), with an `ordabok.md` entry.

**17. The contact process has four names in three games.**
`equilibrium-shifter` `equilibria.ts:363` (`Contact Process` / `Snertiaðferð`), `hess-law`
`data/puzzles.ts:177,179` (`Snertiferlið (Contact Process)`), `thermodynamics-predictor`
`data/problems.ts:160` (`Contact aðferðin`). No `ordabok.md` entry; 0 corpus hits for either
Icelandic form. Options: (a) `snertiferlið`; (b) `Snertiaðferðin`; (c) keep an English gloss.
**Recommendation:** (a), a one-line glossary entry, then one sweep with a governed-terms row.

**18. `gufuþrýstingur` or the glossary's `gufunarþrýstingur`.**
`intermolecular-forces` Level 2 problem 3 and `jafnvaegisfasti` say `gufuþrýstingur`; `ordabok.md`
says `gufunarþrýstingur`; the corpus is 126 to 5 the other way. Both masculine, so a pure swap.
**Recommendation:** keep `gufuþrýstingur` and correct `ordabok.md`.

**19. `Vatnsgashvarfið` or `Vatnsgas hvarfið`.**
Already open in `CLAUDE.md`: `jafnvaegisfasti` and `equilibrium-shifter` were harmonised to the
compound, which is a spelling choice, not a ruling. The corpus has 0 hits for either.
**Recommendation:** confirm the compound, since a genitive compound cannot be split.

**20. Year-2 bonding and geometry vocabulary.**
`lone pair` (now `stakt rafeindapar`) and `tetrahedral` (item 124) were swept in this
pass; the rest were not. The glossary's or the book's word against the games': bonds `eintengi` /
`tvítengi` / `þrítengi` (346/229/62) against `einföld/tvöföld/þreföld tengsl` in `lewis-structures`
(`tengsl` n.pl. → `tvítengi` n.sg. moves agreement); resonance `vokmynd` / `vokblendingur` (the
book's ch07/m68740 title) against `samsvörun` / `samsvörunarformúla`; `formleg hleðsla` against
`formhleðsla` (Lewis's Stig 3 title); octet `áttund` against `átta` / `stækkuð átta`;
hybridization `svigrúmablöndun` (151 to 0) against `blendni`; see-saw `vegasalt` against
`Sjáldruslögun`; `þríhyrningslaga flatt` against `Þríhyrnd slétt`; `ferningslaga flatt` against
`Ferningsslétt`; electron domain `svæði rafeindaþéttleika` (no glossary entry). Options: (a) sweep
to the glossary forms, one change across `lewis-structures`, `vsepr-geometry` and
`intermolecular-forces`; (b) rule the game words acceptable and add them to `ordabok.md`.
**Recommendation:** (a), starting with Lewis Level 3, where the book's section title settles both
terms.

**21. Post-transition metals: `P-málmar`, and `Lantaníð`/`Aktíníð`.**
Periodic-table legends in `lotukerfid` (`PeriodicTable.tsx:306`, `data/elements.ts:66`) and
`molmassi` (`PeriodicTable.tsx:134`). `ordabok.md` has no entry; the corpus has one
`eftirhliðarmálmar`. `lotukerfid`'s `Lantaníð`/`Aktíníð` labels are unused, and `ordabok.md` spells
them `lanþaníð`/`aktiníð`. **Recommendation:** keep `P-málmar` until the glossary has an entry;
fix the two unused labels to the glossary spelling when it does.

---

## Year 1

### dimensional-analysis — Einingagreining

**22. Two descriptions promise a prediction step Stig 2 no longer has.**
`Level1Conceptual.tsx:221` (`Þar munt þú nota þessi hugtök til að spá fyrir um niðurstöður.`) and
the level-2 menu line `Spá fyrir og rökstyðja` (`i18n.ts:25`, en :91, pl :157, `App.tsx:115`
fallback). Prediction was disabled in `2ae30b3`. Options: (a) reword to what Stig 2 does, e.g.
`Þar byggir þú keðjur úr umbreytingarstuðlum.` / `Byggja umbreytingarkeðjur`; (b) delete the
Stig 1 line; (c) bring prediction back. **Recommendation:** (a), your wording; the noun follows
item 12.

**23. Stig 1's score line can only read `6 af 6`.**
No Stig 1 challenge can be answered wrong, so `Þú svaraðir {n} af 6 rétt` is always full marks
and the retry branch is dead (`Level1Conceptual.tsx:181-198`, `:230-256`). Options: (a) reword as
completion, e.g. `Þú kláraðir allar {n} áskoranirnar`, and delete the dead branch; (b) keep;
(c) make Stig 1 answers fail-able. **Recommendation:** (a).

**24. Stig 1's automatic hint counts every click as an attempt.**
`Level1Conceptual.tsx:115-122` opens the hint after the third `onAttempt()`, and every challenge
calls it on every click, right or wrong, so the hint can open while a student explores as told
(C4 says to try both factors). Options: (a) count only wrong selections; (b) keep; (c) drop the
auto-hint and rely on `Fá meiri hjálp`. **Recommendation:** (a), which matches the on-screen
promise `Ef þú reynir nokkrum sinnum birtist hjálp`.

**25. Picking the same block twice shows `≠ 1` above `1 L / 1 L = 1,0`.**
`challenges/FactorBuildingChallenge.tsx` `judge()` (same-unit branch) and the verdict at `:182-188`;
reachable with 1 L/1 L, 1000 mL/1000 mL and others. The fraction really is 1; it is just not a
conversion. Options: (a) show `= 1` in red and let the existing `Sömu einingarnar!` box explain;
(b) stop one block filling both slots; (c) accept it. **Recommendation:** (a), perhaps with (b).
The screen should not state something false.

**26. The chip `Factor-label aðferð`.**
English in a related-concepts chip on every Level 2 verdict (`Level2.tsx:52`). The book renders
the method three ways and calls it a synonym of `víddagreining`, which is the chip beside it.
Options: (a) drop the chip; (b) `einingabreytingaraðferð`; (c) `þáttamerkingaraðferð`.
**Recommendation:** (a): no English, no duplicate, no choice between three renderings.

**27. The mode toggle `Skipta í smella-ham` no longer names a difference.**
Tapping works in both Level 2 modes now, and they share one chain (`Level2.tsx`). Options:
(a) rename to describe the layouts, e.g. `Skipta í hnappalista` / `Skipta í keðjusmíð`; (b) remove
click mode; (c) leave. **Recommendation:** (a) or (b), your wording.

**28. A wrong Level 2 answer never shows the right value.**
The incorrect branch says only `Rétta leiðin er: <factors>` (`Level2.tsx:311-329`), so a right
chain with a slipped number gets no message about the number. Options: (a) append the value
(`… = 0,5 g`, via `printNumber`); (b) a misconception line, e.g. `Leiðin er rétt, en talan ekki —
reiknaðu aftur`; (c) leave. **Recommendation:** (a).

**29. The `Strika út X` button shows for 1,5 s and vanishes.**
The auto-animation cancels every pair anyway (`Level2.tsx`, `showCancelButton`). Options: (a) drop
the button; (b) turn off the auto-run and keep the button until every pair is struck, a hands-on
step. **Recommendation:** (a), or (b) if you want students to strike units out themselves.

**30. Level 3 grades explanations by length.**
The composite (answer 40 %, method 30 %, explanation 20 %, efficiency 10 %) takes method and
explanation credit from text length (`utils/scoring.ts` `scoreExplanation`; `Level3.tsx`
`handleSubmit`). So a wrong answer with 21 characters of explanation reads `✓ Rétt aðferð valin`
under `Gott!`, a fully correct run with terse explanations fails mastery, and the intro promises
`lengd skiptir ekki máli`. (`fyrir betri einkunn`, which promised keyword scoring that does not
exist, was removed in this pass.) Options: (a) master on the answer alone and keep the explanation
as ungraded reflection; (b) keep the composite but take method credit only from a correct answer
or chosen path; (c) keep, and reword the intro. **Recommendation:** (b).

**31. Level 3 ends with no summary.**
`Ljúka stigi` returns straight to the menu (`Level3.tsx` → `App.tsx` `onComplete`), so a student
who misses mastery is not told why. Levels 1 and 2 have one. **Recommendation:** add a one-line
summary, after item 30, since mastery depends on it.

**32. Stig 0's rule 4 is not the book's.**
The game teaches that a trailing comma makes trailing zeros count (`1200,` = 4, `60,` = 2) and
grades by it (`data/sigfig-items.ts` `RULES[3]`, `COUNT_ITEMS` c5; `utils/sigfigs.ts`
`countSigFigs`). The book calls such zeros ambiguous, settled by standard form or assumed not
significant (ch01/m68690:47,62). Options: (a) keep the game's convention; (b) follow the book,
changing `countSigFigs`, the rule and c5. **Recommendation:** your call; (b) is small and contained
if the course follows the book.

**33. A word for scientific notation.**
The game had coined `veldisritháttur` (Stig 0) and `vísindatölustafir` (Level 3), 0 corpus hits
each; this pass made both strings term-free. `ordabok.md` has no entry. The book's defined term is
`staðalform` (Appendix B, 17 hits, and its own sig-fig exercise), though the same word means
standard state in ch05 and ch16; `veldisvísanotkun` has 3. Listed as a teaching decision in
`ORPHANED_GAMES_ASSESSMENT.md:352`. **Recommendation:** confirm `staðalform`, add
`scientific notation;staðalform` to `ordabok.md`, then use it.

**34. Two Level 3 items ask for more significant figures than their givens carry.**
L3-12 (0,5 mol × 58,5 g/mol, declares 3) and L3-COOK-2 (4 oz × 28,35 g/oz, declares 4), in
`data/challenges.ts`. Under the rule Stig 0 teaches both give 1. Whether a recipe's `4 oz` is a
measurement or exact is a teaching question. Options: (a) remove `significantFigures` from both;
(b) give the precision in the prompt (`0,500 mol`, `4,00 oz`); (c) treat the givens as exact.
**Recommendation:** (b) for L3-12, a lab quantity; (a) for COOK-2.

Also here: the thousands dot (item 5, option (d)) and the conversion-factor term
(item 12).

### lotukerfid — Lotukerfið

**35. The legend lists halogens and noble gases apart from `Málmleysingjar`, while
Stig 2 counts them as málmleysingjar.**
`PeriodicTable.tsx` legend (~:300) against `Level2.tsx` `GROUP_QUESTIONS`. Options: (a) label the
category `Aðrir málmleysingjar`; (b) keep. **Recommendation:** (a).

Also here: `P-málmar` and the unused `Lantaníð`/`Aktíníð` labels (item 21), the
element name for N (item 15), and the flattened Polish block (item 4).

### nafnakerfid — Nafnakerfið

**36. Level 2 accepts names typed without Icelandic letters.**
`Level2.tsx` `normalizeAnswer` (~:334) folds ó→o, ð→d, æ→ae and so on, so `Kalsiumoxid` and
`Jarn III klorid` pass. Options: (a) keep, and say so in the README; (b) require the letters, still
ignoring case, spaces and parentheses; (c) accept but reply `Rétt — en skrifaðu …` with the
spelling. **Recommendation:** (c). A phone keyboard types every Icelandic letter, and silent
acceptance teaches the flattened form.

**37. Level 3 accepts only the elided prefix.**
`naming.ts` makes `tetroxíð` the target over `tetraoxíð` on purpose, but the tray can still offer
`tetra` and `oxíð` (0,25–0,85 % of trays for N₂O₄, N₂O₅, Cl₂O₇, P₄O₁₀), and a student who builds
the textbook-valid unelided name is shown the `a` in red. Level 2 already accepts both.
**Recommendation:** accept both in `handleCheck`, with Level 2's fold.

**38. Level 3's info line gives the answer away before the student builds anything.**
`compound.info` renders under the formula (`Level3.tsx`, `data/compounds.ts`), and on at least 13
of 52 items it states the charge or ion being tested (`Kóbalt +2` under Co(NO₃)₂;
`Ammóníum (NH₄⁺) + Klóríð` is the whole answer). But for Fe₃O₄ and for ions Levels 1–2 never
teach (ammóníum, fosfat, vetniskarbónat, díkrómat) it is the only route. Options: (a) split the field, as
`lausnir` did, into a pre-answer `observable` and a post-answer `why`; (b) show it only after the
answer and teach the four ions in the rules panel; (c) keep it as a deliberate hint.
**Recommendation:** (a), with the four ions added to the `Fjölatóma jónir` line and Fe₃O₄ keeping
`blanda Fe²⁺ og Fe³⁺` before the answer.

**39. `fjölatóma jón` against the glossary's `fjölfrumeinda jón`.**
About 20 sites say `fjölatóma jón`, and two info lines say `Sameindajón` (`compounds.ts`, Na₂CO₃
and KNO₃). `ordabok.md:452` says `fjölfrumeinda jón` (and `:384` `einfrumeinda jón`); the corpus
has `fjölatóma jón` 23 (including the naming module ch02/m68698) to 2. Options: (a) rule
`fjölatóma jón` and update `ordabok.md`; (b) sweep to the glossary form. **Recommendation:** (a),
the running prose of the section that defines it, as with `hvarfstuðull`. The two `Sameindajón`
lines follow either way.

**40. The warm-up card's metal/non-metal groups are wrong at the edges.**
`Málmar: hópar 1, 2, 3-12` and `Málmleysingjar: hópar 15-18` (`Level1.tsx` ~:780): group 1 holds
hydrogen, groups 13–14 are missing, 15–16 hold Bi and Po. Nothing is graded wrong, but Levels 2–3
ask about Al, Sn and Pb. Options: (a) keep; (b) `vinstra megin og í miðju (hópar 1–12, nema
vetni)` / `efst til hægri (hópar 14–18, að hluta)`; (c) point to the stair-step line.
**Recommendation:** (b) or (c).

**41. The menu says IUPAC names are `óháð tungumáli`.**
`App.tsx` `Af hverju` card: `Sama nafn, sama efni — óháð tungumáli`, while the next screen teaches
that Natríumklóríð is sodium chloride. **Recommendation:** reword, e.g. `Sama kerfi, sama efni — á
hvaða tungumáli sem er`.

### molmassi — Mólhugtakið

**42. Stig 3 is marked complete at any score, 0 of 8 included.**
`Level3.tsx` `next()` calls `onComplete` unconditionally; Stig 2 needs 60 of 100 and Stig 1 an
explicit `Ljúka stigi`. Options: (a) keep; (b) a pass threshold like Stig 2; (c) a `Ljúka stigi`
button at any score, like Stig 1. **Recommendation:** (c) or (a); a threshold would make the tick a
grade.

**43. Five of Stig 3's six mass-to-particles problems have the same answer.**
36 g H₂O, 88 g CO₂, 117 g NaCl, 34 g NH₃ and 64 g O₂ are all 2 mol, so all answer 1,20 × 10²⁴
(`Level3.tsx` `DESCRIPTORS`). Options: (a) leave; (b) vary the masses (27 g H₂O = 1,5 mol, 110 g
CO₂ = 2,5 mol, 175,5 g NaCl = 3 mol); the answers stay derived. **Recommendation:** (b). An answer
that never changes can be learned without calculating.

**44. `undirstaða allrar magnefnafræði`.**
The menu's `Af hverju mólmassi?` card (`App.tsx`). `magnefnafræði` has 0 corpus hits and no
glossary entry. Options: (a) `hlutfallaefnafræði`, the ruled stoichiometry term, a pure swap;
(b) `magnbundinnar efnafræði`; (c) leave. **Recommendation:** (a); grams-to-moles opens Brown ch. 3.

**45. Where percent composition goes.**
Already open in the README: it was planned as a fourth `molmassi` level, which the 2026-08-29
no-Level-4 ruling rules out. `reynsluformulur`'s README also lists it, with combustion analysis, as
uncovered. **Recommendation:** none needed now; it is a roadmap item.

Also here: `Saltsýra` (item 14) and `P-málmar` (item 21).

### reynsluformulur — Reynsluformúlur

**46. Æfa prints `rétt: x` beside every wrong cell and leaves the inputs open.**
Submitting zeros and copying the shown values passes every column of all 8 compounds
(`components/AefaScreen.tsx`). Related: the Vísitala hint says `1,5 námundað í 2` even for
Kalíumdíkrómat, whose ratio is 3,5, and compounds that need no multiplier get no hint text.
Options: (a) keep; (b) first wrong try shows which cells and that column's hint, second reveals
`rétt: x`, as `HintSystem` tiers; (c) reveal, lock, and move on without it counting.
**Recommendation:** (b), with the hint text in the same change.

**47. The menu's `Lykilskref` box uses `n` for two quantities.**
`n = m / M` (moles), then two lines below `n = mólmassi / massi reynsluformúlu` (the multiplier,
which Beita also calls `n`) (`App.tsx`). Options: (a) write the moles line in words, `mól = massi /
mólmassi`; (b) a new letter for the multiplier, which changes Beita too; (c) keep.
**Recommendation:** (a), one line.

Also here: `Vísitala` (item 13).

### jafna-jofnur — Stilla efnajöfnur

**48. The intro and the Stig 2 hint teach opposite orders for O and H.**
`components/levelConfigs.tsx` `Aðferð til að stilla` lists O third and H last; reaction 8's hint
(`data/reactions.ts`) says `stilltu súrefni síðast`, as does the book (ch04/m68709:263).
Options: (a) swap so O is last, noting or reordering the Stig 1 worked example (H₂ + O₂ → H₂O);
(b) change the hint; (c) teach the book's principle instead of a fixed order: elements in one
substance per side first, O and H last. **Recommendation:** (a) or (c).

**49. Stig 2 and 3 grade the lowest-whole-number rule without stating it.**
Only `LEVEL1_CONFIG` has the banner; levels are not gated, so a student can start at Stig 2.
Options: (a) a banner on Stig 2/3 (about 50 px, and the Stig 1 banner already pushes `Athuga` below
the fold at 360×740); (b) the sentence in the Stig 2/3 menu card descriptions; (c) leave.
**Recommendation:** (b), which states it before grading at no layout cost.

Also here: `Vísitölunum` (item 13).

### utfellingarhvorf — Útfellingarhvörf

**50. In Æfa, does an anion row count as "the rule" when it reaches the verdict only
through its exception?**
Na₂CO₃, K₂CrO₄, Na₃PO₄, (NH₄)₂S: `engine/precipitation.ts` `decidingRules()` accepts only the
group-1 row, pinned by `aefa-rule-grading.test.tsx`. Options: (a) keep; (b) also accept the anion
row, consistent with BaSO₄ graded right through the sulfate row's exception. **Recommendation:**
(a). The carbonate row's face states the opposite verdict, and the drill's point is that group 1
always wins. (b) is a one-line change.

**51. The FeCl₃ + NaOH context frames iron as a pollutant removed from sewage.**
`data/problems.ts` scenario `fecl3-naoh`: `Þannig eru járnjónir felldar úr skólpi í
hreinsistöðvum`. Plants add iron(III) as a coagulant, and its hydroxide carries phosphate down;
removing dissolved iron is mainly a groundwater process. Defensible, not false.
**Recommendation:** reword, low priority, with your Icelandic for the coagulant wording.

**52. Acetate, bicarbonate and chlorate are in the book's table, not the ion pool.**
`data/ions.ts`. Adding them needs Icelandic ion names `ordabok.md` does not settle.
**Recommendation:** leave out until a scenario needs one.

**53. Precipitate colours are named, not drawn.**
`KannaScreen.tsx` Beaker keeps three neutral states on purpose (a phone in a lit classroom).
**Recommendation:** keep; the context sentences name the colours.

### takmarkandi — Takmarkandi hvarfefni

**54. Stig 3's `Reyna aftur` comes after the answer is printed, and scores full marks.**
A wrong step shows `Rétt svar: …`, then offers a retry worth the same 10 points, so anyone reaches
150/150 (`Level3.tsx` `feedbackForStep`, `retryStep`). Options: (a) a retried step earns 0 or 5;
(b) hide the number while a retry is on offer; (c) drop per-step retry. **Recommendation:** (a),
score the first attempt only, if points stay at all (item 1).

**55. Stig 1 never poses the case its own misconception text is about.**
The panel says the limiting reactant is not always the one there is less of (`Level1.tsx:330`),
but `buildQuestions` never makes the more numerous reactant limiting. February prescribed it
(`FEBRUARY-DECISIONS-RECOVERED.md:358`) and it was never built. Options: (a) 2–3 such items per
run, e.g. 6 H₂ against 4 O₂; (b) drop the sentence. **Recommendation:** (a).

**56. In three of Stig 3's five problems the lighter reactant is limiting.**
`vatn`, `magnesiumoxid` and `natriumklorid` (`data/yieldProblems.ts`), so "pick the smaller number"
passes step 1 three times in five. `yield.test.ts:156` requires at least one of each kind, so the
mix is a design choice. Options: (a) re-weigh one or two so the heavier mass is limiting (e.g. 8 g
H₂ against 48 g O₂); everything else is derived; (b) keep the masses, fix only the misconception
text. **Recommendation:** (a) for at least one, plus a misconception keyed to which reactant the
student picked; `natriumklorid`'s `þótt klórgasið sé miklu þyngra` goes in the same rewrite.

**57. Stig 1–2 call atoms and formula units `sameindir` (B7).**
Mg, Na, K, Ca, Zn, Cu: `Level1.tsx:257`, `Level2.tsx:235,252`, `Molecule.tsx:15`, and the prose
`fjölda sameinda` (`CURRICULUM_REVIEW.md:145`). Options: (a) neutral `eindir` throughout;
(b) `sameindir`, `atóm` or `formúlueiningar` by species, with a particle-kind field in
`reactions.ts`. **Recommendation:** (b) if you settle `formúlueining`; otherwise (a) for now.

### lausnir — Lausnir

**58. The four levels score on three scales, and the totals mean nothing.**
Stig 0 pays 10 per item, Stig 1–2 pay 100, Stig 3 pays 1; `Heildarstig` adds 1–3 and leaves Stig 0
out. Stig 3 records completion only at ≥5/8 (`Level3.tsx:100`), a completion gate in an ungated
game, and finishing it always opens `Þú hefur lokið öllum stigum!` even if 0–2 were never played.
Options: (a) 100 per item everywhere, Stig 0 in the totals, no gate, the closing screen only when
all four are done; (b) no points: `x af N rétt` per level, no `Heildarstig`, the same gate and
closing-screen changes. **Recommendation:** (b), per item 1.

**59. `Þess vegna er kalt gos fríðara!`**
`Level2.tsx:295`, the cold-soda explanation; `fríðara` means prettier. Options: (a) `Þess vegna
helst kalt gos lengur kolsýrt!`; (b) drop the sentence. **Recommendation:** (a).

**60. Stig 1's `Athuga lausn ✓` does nothing on a wrong concentration.**
`Level1.tsx` `checkAnswer` (~:426) acts only when correct. Options: (a) one line, e.g. `Ekki alveg
— fylgstu með örvunum á styrkmælinum`; (b) disable the button until in tolerance; (c) leave.
**Recommendation:** (a).

### einingakedjan — Einingakeðjan

**61. After a wrong turn, which repair counts as correct?**
`engine/chain.ts` `correctionPrompt` diagnoses from the failing step alone: in the wrong-unit branch
"add a step" is always right, in the inverted branch "remove" is always told the ratio itself is
right. Every Beita problem ships a distractor that walks into this. This pass fixed the false step
count; three sentences stay false (`Þá færirðu þig lengra frá markinu`, `Vandinn … keðjan sé of
stutt`, `Hlutfallið sjálft er rétt valið`). Options: (a) compare `stepsToTarget` from the chain's end
with it after dropping the last card, and mark "remove" correct when that is shorter; for
inverted, "flip" only if the flipped card is on a shortest route; (b) keep the grading, make the
sentences route-neutral; (c) leave. **Recommendation:** (a). The rule (shortest repair wins) and
the wording are yours.

**62. B4 puts 25,0 mL of ethanol in one dose of hand sanitiser.**
`data/problems.ts` B4; one pump holds about 2 mL. Options: (a) `Í lítilli flösku af handspritti
eru um 25,0 mL af etanóli`, keeping every number; (b) change the volume and the answer.
**Recommendation:** (a).

Also here: the ratio cards' precision (item 10).

---

## Year 2

### rafeindabygging — Rafeindabygging

**63. `aðalskammtatala` and `hliðarskammtatala` against the glossary and the book.**
The game says `aðalskammtatala` (`Level1.tsx:114`, `App.tsx` ~:340) with the glossary's
`hliðarskammtatala`. `ordabok.md:466` says `höfuðskammtatala` (0 corpus hits; the book says
`aðalskammtatala` 16 times) and `:32` `hliðarskammtatala` (0; the book says `aukaskammtatala`).
**Recommendation:** the book's pair, `aðalskammtatala` and `aukaskammtatala`, ruled together, with
`ordabok.md` corrected.

**64. Stig 2 grades configurations by exact order and format.**
`Level2.tsx` `handleSubmit`, `electron-configs.ts` `normalizeConfig`: Fe as `…3d⁶ 4s²` (n-order) is
wrong, and so is a correct answer with commas or carets, and the hint stays silent because the
electron counts match. Options: (a) keep filling order as the only form, but say why (`Réttar
rafeindir, en skrifaðu í Aufbau-röð`), and accept `,` `;` `^` as separators; (b) accept any order.
**Recommendation:** (a); it matches the book.

Also here: `yfirskrift` (item 13), `Nitur` (item 15) and the running
score (item 1).

### lewis-structures — Lewis-formúlur

**65. Level 1's valence table prints the answer to question 1.**
`Gildisrafeindatafla` shows C = 4 under `Hversu margar gildisrafeindir hefur kolefni?`, and its
`slice(0,16)` cuts off Cl, question 2's element (`Level1.tsx:488-499`). Options: (a) keep as a
look-up; (b) replace it with the menu's group table (`App.tsx:310-346`), which keeps the route
without the answer; (c) hide it during the two counting questions. **Recommendation:** (b).

**66. The Level 2 walkthrough's +5 bonus can be earned without limit.**
`Opna leiðsögn` reappears after each run, so replays push the level past its 135 maximum and
progress stores it (`Level2.tsx:364`). **Recommendation:** drop the +5, or award it once per run,
per item 1.

Also here: hint penalties (item 2), d-orbitals (item 7), the bonding
vocabulary (item 20), and the chip `Rafeindasameignir` (item 87).

### vsepr-geometry — VSEPR Rúmfræði

**67. CO₂'s count step says `Bindandi pör` but grades domains.**
The key is 2, so a student who counts CO₂'s four bonding pairs is wrong (`Level2.tsx`,
`molecules[3]`; the only multiple-bond molecule). Options: (a) relabel both inputs as domains,
which needs a term (the book says `svæði rafeindaþéttleika`); (b) also accept 4; (c) swap CO₂ out.
**Recommendation:** (a), your wording.

**68. SF₆'s distractor `d²sp³` is graded wrong while its explanation calls it the
same as `sp³d²`.**
`Level3.tsx` challenge 4, option d. Options: (a) a plainly wrong distractor (sp³d³, sp²);
(b) rewrite the explanation (d²sp³ is complex-ion notation); (c) accept both.
**Recommendation:** (a).

**69. The NF₃ against NH₃ explanation contradicts its own conclusion.**
`Level3.tsx` challenge 12 `conceptExplanation`: `N-H tengisl benda FRÁ N` with the lone pair
`bendir einnig upp` cannot both hold. Options: (a) rewrite in Brown's convention (arrow toward
δ−); (b) cut to the correct sentence from option b. **Recommendation:** (a), your Icelandic.

**70. The angle grader accepts a list that contains the right angle.**
`90 104,5 107 109,5 120 180` is right for every molecule (`utils/bondAngles.ts`
`gradeBondAngle`). A strict grader needs every true angle per shape (TBP, octahedral, T-shaped and
square planar also have 180°). **Recommendation:** store the angle sets and reject any number
outside them, once you confirm the sets.

**71. The angle hint and reference table give the answer; Stig 1 pictures show the
shape asked about.**
`Level2.tsx` `getHint` returns `horn nálægt {bondAngle}` and the `Lögunartafla` sits under every
step; `Level1.tsx` Q1, Q6 and Q7 draw the shape in question. Options: keep as scaffolds, or tier
the hint and hide the picture on identify questions until answered. **Recommendation:** tier the
hint.

Also here: d-orbitals (item 7), vocabulary (item 20), glosses and
`lp`/`bp` (item 6), and the dead `is` block (item 4).

### intermolecular-forces — Millisameindakraftar

**72. Stig 1 shows the answer beside the question.**
Badges `⚡ Skautuð` / `○ Óskautuð` and `🔗 H-F/O/N tengi`, δ labels only on polar molecules, and a
hint that adds the H-bond reminder only when there is one (`Level1.tsx:786-801`, `:745`,
`:874-877`). Polarity plus the H-bond badge fully determines the answer. Options: (a) keep as
scaffolding; (b) hide badges and δ labels until checked (the corrected drawing and the 3D view
keep a route); (c) make the hint unconditional. **Recommendation:** (b) with (c).

**73. Three Level 3 content statements.**
`Level3.tsx`. Challenge 6 `Edik vs. edikaldehýð`: `edik` is vinegar, and `edikaldehýð` has 0 hits
(`asetaldehýð` 6, `etanal` 3; no glossary entry). Challenge 7 `„kagala" formgerð`: not a word we
can find. Challenge 3's distractor explanation `Vatn er í raun léttara en margir lífrænir leysar`
is true per molecule, false per volume. **Recommendation:** retitle 6 `Ediksýra vs. asetaldehýð`
(a naming call); supply or drop the word in 7; in 3 talk about mass per molecule.

**74. `London kraftar` without a hyphen.**
About 15 sites; the corpus writes `London-kraftar` (8) or `dreifikraftar` (45), and `ordabok.md`
is silent. **Recommendation:** `London-kraftar`, platform-wide; `e2e/mobile-game-screens.ts:2839`
clicks the unhyphenated name and changes with it.

Also here: `Saltsýra`/`Flússýra` (item 14), `Gufuþrýstingur` (item 18),
the 3D hint (item 8) and the running score (item 1).

### hess-law — Lögmál Hess

**75. Stig 3's workspace shows both totals before the student answers.**
Every n×ΔH°f term and `Samtals myndefni` / `Samtals hvarfefni` are on screen, so ΔH°rxn is one
subtraction away (`Level3.tsx`, `Útreikningur`). Options: (a) keep the fully worked scaffold;
(b) show the terms, hide both totals until checked; (c) hide the workspace behind a free
`Sýna útreikning`. **Recommendation:** (b); the student still adds and subtracts, which is the
skill the level is named for.

**76. Stig 2 draws the target ΔH line before checking.**
`EnergyPathwayDiagram.tsx` draws `Markmið` as soon as one equation is chosen, while the card says
`ΔH = ? kJ (finndu þetta!)`. Grading now requires the target equation, so hitting the line with a
wrong combination no longer scores. Options: (a) keep; (b) draw it after `Athuga lausn`; (c) put it
behind a hint. **Recommendation:** (a), or (b) if the level should test reasoning over guided
search.

**77. The state-path panel under every Level 1 challenge shows c5's answer.**
`StatePathComparison compact` labels C + ½O₂ → CO as −111, the value c5 asks for
(`Level1.tsx`). Options: (a) `exampleId='water-formation'` on c5; (b) hide the step labels until
answered; (c) keep as a worked example. **Recommendation:** (a), one prop.

**78. Coined words in Level 1 chips: `Hverfanleiki` and `Ferlisstuðull`.**
`Level1.tsx` `RELATED_CONCEPTS[2]`, `[5]`, `[6]`; 0 corpus hits, no glossary entry. Challenge 6
is about path-independence, which `ordabok.md` calls `ástandsfall`. **Recommendation:**
`Ástandsfall` for 6; delete `Hverfanleiki` from 2 (which already has `Öfug hvörf`) and from 5.

**79. Stig 2's card promises `Útskýrðu rökstuðning.`, and the level has no such step.**
`App.tsx` and `i18n.ts` `levels.level2.details`. Options: (a) delete the sentence; (b) add a short
"which species cancel?" step. **Recommendation:** (a) now.

Also here: the formation-enthalpy table (item 9), the contact process (item
17), CO (item 16) and the en/pl decimals (item 4).

### kinetics — Hvarfhraði

**80. The Maxwell–Boltzmann panel cannot show its tail.**
`MaxwellBoltzmann.tsx`: at real scale the fraction above Ea is at most about 10⁻² %, so the
distribution sits against the left edge and the E ≥ Ea shading is invisible at every setting.
Options: (a) log-scale y axis; (b) a labelled, magnified inset of the tail; (c) make it explicitly
schematic; (d) shrink the Ea slider (not recommended). **Recommendation:** (b). Also decide whether
the catalyst demo follows Level 1's T/Ea sliders (it copies them only on mount, so the screen has
two temperature sliders) and rename one of the two `% sameinda` readouts, which measure different
things.

**81. Rate law, rate-determining step and reaction order.**
`ordabok.md` says `hraðajafna`, `hraðatakmarkandi skref` and `stig efnahvarfs`. The game says
`hraðalögmál` (157 to 9 in the book), `hraðaákvarðandi` (the book's defining sentence uses
`hraðatakmarkandi þrep`, its prose 12 to 4 the other way), and `röð hvörfunar` / `Heildarröð`.
**Recommendation:** `hraðalögmál` (correct `ordabok.md`); `hraðatakmarkandi`; `stig efnahvarfs`,
but only with item 1, so `stig` stops meaning level, points and order on one screen.

**82. Level 2 challenge 6 asks the student to compute k and has nowhere to enter it.**
`data/level2-questions.ts` id 6 `Reikna k`; `Level2.tsx` grades only the two orders. Options:
(a) a k field graded against `rateConstantOf()` with a relative tolerance (`type="text"`,
`parseStudentNumber`); (b) reword the card. **Recommendation:** (a).

Also here: the chain (item 3), glosses (item 6) and points (item
1).

### redox-reactions — Oxun og afoxun

**83. `redox-hvarf` against the glossary's `oxunar-afoxunarhvarf`.**
The game writes `redox-hvörf` throughout (`i18n.ts`, `Level1.tsx:18`, `Level2.tsx:273`,
`Level3.tsx:503`, `App.tsx:307`) and the Y2 chain and hub card say `Redox`. Corpus:
`oxunar-afoxunarhv` 68, `redox-hv` 13, `redoxhv` 9. The open two-word forms were hyphenated in
this pass. Options: (a) sweep to `oxunar-afoxunarhvarf` platform-wide; (b) rule `redox-hvarf`
acceptable and add it to `ordabok.md`; (c) leave. **Recommendation:** (b), and harmonise the two
solid `Redoxhvarf` forms in the Stig 2 and 3 intros.

**84. Stig 2 and Stig 3 carry different names on different screens.**
Stig 3 is `Stilla hvörf` (menu, header), `Stilla efnajöfnur` (closing screen) and `Stilla
redox-jöfnur` (unused title); Stig 2 is `Greina hvörf` and `Greina redox`. What is balanced is an
equation, not a reaction. Also `Rafeindir: 2 tapað = 2 öðlast` (`Level3.tsx:469-471`) does not
agree with `rafeindir`. **Recommendation:** one name per level everywhere, e.g. `Stig 2: Greina
redox-hvörf`, `Stig 3: Stilla redox-jöfnur`, taken with item 83; the e2e paths
change too.

**85. Stig 1 asks `í þessari sameind?` of NaCl, CuSO₄ and Cr₂O₇²⁻.**
`Level1.tsx:356`: three of ten items are not molecules. Options: (a) `í þessu efnasambandi?` /
`í þessari jón?` per item; (b) one neutral `í þessari formúlu?`. **Recommendation:** (a); the data
already marks the ion.

**86. Least common multiple: `LCM(3,2)=6` and `Minnsta samþakning`.**
English in `data/half-reactions.ts:125`, a non-word in the Stig 3 intro, Skref 3. Neither source
has a term. **Recommendation:** `minnsta sameiginlega margfeldi` in the intro, where it is taught;
avoid the term in the hint (`3 × 2 = 6 rafeindir, svo 2×Al og 3×(2H⁺)`).

**87. The chip `Rafeindasameignir` is not a word.**
`Level1.tsx:18` here and `lewis-structures` `Level1.tsx:24`; 0 corpus hits, and it is unclear
whether it means shared electrons or transfer. Options: (a) `Rafeindaflutningur`; (b) `Samgild
tengi`; (c) drop it. **Recommendation:** (a) in redox. In Lewis it sits between `Efnatengi` and
`Jónatengi`, where it plainly means covalent bonding, so (b) there.

**88. The Daniell cell's name.**
Now `Zn–Cu galvaníhlað (Daniell)` (`ElectrochemicalCell.tsx:38`), an interim form without English.
The book says `Daniell-kerið`, but the platform ruled the galvanic genus `-hlað` and reserved
`-ker` for `rafker`/`hálfker`. Options: (a) `Daniell-hlað (Zn–Cu)`; (b) `Daniell-ker (Zn–Cu)`;
(c) keep. **Recommendation:** (a), matching `galvaníhlað` on the same card.

Also here: the running score and Stig 1's lower pay for retries (item 1).

### organic-nomenclature — Lífræn nafnagift

**89. Stig 1 teaches English roots (`meth-`, `eth-`, `oct-`, `non-`, `dec-`) and
spells every name with Icelandic stems.**
So `eth + an = etan` does not add up (`Level1.tsx:44-55`, quiz Q1/Q2/Q5/Q9, misconceptions; Level 2
chips, hints and `Útskýring`; `App.tsx`). The book uses `met-`, `et-`, `próp-`, … (ch20/m68846:386),
and `utils/naming.ts` already builds names from them. Options: (a) teach the book's stems
everywhere; (b) keep the international roots and say so; (c) leave. **Recommendation:** (a). It
changes quiz answers, chips, cards and hints, not the engine.

**90. The menu's three-card explainer contradicts Stig 1.**
`App.tsx:164-177` defines Stofn as bond type and Viðskeyti as functional group; Stig 1 teaches
viðskeyti as bond type (`-an/-en/-ýn`) and never mentions stofn; the book's model differs again.
Options: (a) make the card match the game and drop `Stofn`; (b) move the game to the book's model.
**Recommendation:** (a) now; weigh (b) with item 89.

**91. The molecule builder allows a second multiple bond and names only one.**
CH₂=CH–CH=CH₂ shows as `1-búten` (`utils/naming.ts` `nameChain`, `MoleculeBuilder.tsx`
`cycleBond`). The book has `1,3-bútadíen` but no Icelandic for diynes or enynes. Options:
(a) at most one multiple bond; (b) name dienes as the book does and rule the rest; (c) show `—`
with a note. **Recommendation:** (a).

**92. The explanation for branched molecules ignores the branch.**
`Level2.tsx` `Útskýring` (~:811) builds from carbon count and bond type, so 2-metýlprópan reads
`prop (3 kolefni) + an`. **Recommendation:** add `+ metýlgrein á kolefni {n}` and the longest-chain
sentence already in each molecule's hint.

---

## Year 3

### gas-law-challenge — Gaslögmál

**93. `Næstum rétt! Reyndu aftur.` with no way to try again.**
`App.tsx` `finishQuestion`; the feedback screen offers only `Næsta spurning` and `Valmynd`.
Options: (a) a `Reyna aftur` button in practice mode; (b) reword to `Næstum rétt — en utan
vikmarka.`; (c) leave. **Recommendation:** (a) in practice, (b) in Keppnishamur.

**94. There is no Explore phase.**
The first thing after the menu is a graded question. **Recommendation:** an Explore screen with
V/T/n sliders driving the existing `GasLawSimulator`; your call on scope.

Also here: score and streak in practice (item 1) and trailing zeros (item
10).

### jafnvaegisfasti — Jafnvægisfastinn

**95. Tengd jafnvægi's first stage has no way out but trial.**
`components/AefaScreen.tsx` `CoupledTask`, `stage === 'operations'` (~:600): stage two and Beita
offer `Sýna svarið og halda áfram` after a wrong check; stage one does not. **Recommendation:** the
same button after a wrong `Athuga jöfnuna`, applying the route and moving on, so the student still
computes K.

**96. Beita's direction step is ungraded, and the answer is always forward.**
Both buttons move on (`BeitaScreen.tsx` ~:180), and all ten problems start with every product at 0
(`data/problems.ts`). Options: (a) grade it (`Rétt.`/`Ekki rétt.`); (b) add a sourced problem that
starts with products and runs backwards; (c) leave. **Recommendation:** (a), and (b) if ch. 13 has
an example.

**97. The NH₄Cl pressure problem asks a 5 % question with no answer.**
No reactant in K, both gases start at 0 atm; the screen reports `0,00 % af upphafsþrýstingnum` and
marks `Nei — það verður að leysa nákvæmlega` wrong, though x² = Kp is exact (`BeitaScreen.tsx`
~:290-360). Options: (a) skip the step for such a problem, with one sentence, e.g. `Hér er enginn
nefnari — x² = Kp er leyst nákvæmlega og engin nálgun þarf.`; (b) accept either; (c) replace the
problem. **Recommendation:** (a), your wording.

**98. `K er einfaldlega gufuþrýstingurinn` directly under `Kc = [Br₂]`.**
`data/problems.ts:77-79`. True of Kp, loose beside Kc. **Recommendation:** `Vökvinn dettur út og K
er einfaldlega styrkur gufunnar — skrifað sem Kp er það gufuþrýstingurinn.`, low priority.

**99. K is masculine in some strings and neuter in others.**
Masculine in Skilja and `coupled.ts` (`K er háður hitastigi`); neuter in the `problems.ts` contexts
(`K örsmátt`, `Stórt Kp`). The corpus has 2 hits, both masculine. **Recommendation:** masculine
throughout, on your say-so.

**100. Two README Open items.**
ICE before Le Chatelier, where the book puts it after: recommendation keep, since ICE needs only K.
Temperature dependence of K here: recommendation leave it to `equilibrium-shifter`, which has it.

Also here: water-gas naming (item 19) and `gufuþrýstingur` (item 18).

### equilibrium-shifter — Jafnvægisstjóri (Hliðrun jafnvægis)

**101. What counts toward unlocking Keppnishamur?**
You ruled the gate stays (2026-09-19), but it can never open: only Keppnishamur writes
`problemsCompleted` (`App.tsx:427`, gate `:521-522`), so `Verkefni kláruð` also stays 0. The locked
card promises `Opnast þegar þú hefur klárað 5 verkefni í lærdómshamri` (`:537`). Options: (a) count
correct Lærdómshamur answers; (b) count any answered one. **Recommendation:** (a), which keeps the
card's promise; arguably a fix under the existing ruling.

**102. Acetic acid is +5 kJ/mol in one system and 0 in the other.**
Id 8 stores +5 and answers heating as a shift; id 24, the same reaction written with hydronium,
stores 0 (`data/equilibria.ts:245,760`). Neither is sourced, and the literature value is near 0.
Options: (a) source a value for both; (b) drop the heating stress from id 8; (c) leave.
**Recommendation:** (b) now, (a) when an aqueous ΔH source is ruled on.

**103. Ten systems have no constant, and aqueous temperature stresses stay
directional.**
Already open in the README: the complex-ion and hemoglobin systems need the Icelandic book's
formation constants (m68869), and `thermo.ts` has no dissolved ions. Both are a new source, your
call. `numbers.test.ts` pins the count at ten.

**104. Several equilibrium names need a ruling.**
`data/equilibria.ts`: id 1 `Díköfnunarefnisoxíð` (item 15); ids 6 and 22 `komplex`
/ `ligandskipti` (glossary roots: `Járn-þíósýanatflókajón`, `Kopar-ammóníakflókajón`,
`tenglaskipti`); id 17 `Gufuumbrot` (0 hits); id 23 `Samtengt kolefnishvarf` and id 27 `Samhliða
jafnvægi`, each naming a single reaction. `App.tsx`: `Le Chatelier meginreglan` (the book says
`lögmál Le Chateliers`) and the menu bullet `Veltudæmi` (`:516`). **Recommendation:** as given in
parentheses; rename ids 23 and 27 to what their equations show (e.g. `Bruni kolefnis í
kolmónoxíð`); drop `Veltudæmi` or say `Útskýrð svör`.

Also here: `Contact Process` (item 17) and water-gas naming (item 19).

### syrufastinn — Sýrufastinn

**105. Two sentences print the exact α beside the approximate x.**
`PracticeScreen.tsx:156-160` prints `x = 1,14e-3 M úr 0,100 M lausn. Klofnunarhlutfallið er 1,13 %`,
where the division gives 1,14 %; `data/problems.ts:231-236` likewise. Grading uses the exact root
on purpose. Options: (a) print x_approx/C in those two sentences, keep the exact α for the bar and
grading; (b) keep and say it is from the exact root. **Recommendation:** (a); the sentence is the
student's own check, done the book's way.

**106. Æfa's five problems are not what its comment promises.**
Three are ediksýra and the last is at 2,65 %, not near the 5 % line (`data/problems.ts:60-72`).
Options: (a) end at the tightest valid pair (maurasýra 0,1 M, 4,15 %); (b) also one problem per acid;
(c) keep and fix the comment. **Recommendation:** (a) and (b).

**107. The menu says students have already seen pKa in titrations and buffers.**
`App.tsx:87-91`; both come after this game in the chain. Options: (a) `Í pH Títrun og Stuðpúðum
færðu pKa gefinn upp í dæmum. Hér kemur talan sjálf: …`; (b) keep, if lab titrations were meant.
**Recommendation:** (a), unless (b) was the intent.

**108. Æfa and Skilja print constants in e-notation with an extra figure.**
`Ka = 1,80e-5` (`PracticeScreen.tsx:29-30`), `x = 1,333e-3 M` (`UnderstandScreen.tsx:206`),
`4,90 × 10⁻¹⁰` (`ExploreScreen.tsx:25-32`), where Kanna and Beita print `1,8 × 10⁻⁵`.
**Recommendation:** `formatScientific` at the source's figures, keeping the e-form only where it
models what to type.

### thermodynamics-predictor — Varmafræði spámaður

**109. The live ΔG° panel and graph marker show the answer while the question is open.**
`App.tsx:830-850` and the graph markers, in both modes; the slider is graded live, so a Keppnishamur
player can slide to the printed T_cross and answer 0 / Jafnvægi. Options: (a) keep everything live;
(b) hide the ΔG° number, verdict and marker label until `Athuga svar`; (c) (b), and lock T in
Keppnishamur. **Recommendation:** (c). Könnun already exists for live exploration.

**110. Gibbs free energy, crossover temperature, and two reaction names.**
`App.tsx:344` `Gibbs frjálsa orku`: `ordabok.md` says `Gibbs fríorka`, the book `frjáls orka`
(13 to 0). Crossover: `þveragahitastig` (`App.tsx:644`) and `Umbreytingarhitastig` (5 sites, and
`T_cross`), 0 hits each; the book only paraphrases. Id 17 `Gufumyndun` names steam reforming but
means vapour formation; id 27 `ATP vatnsrofhvarfun` (the glossary has only `vatnsrof`).
**Recommendation:** the book's `frjáls orka`, correcting `ordabok.md`; `Umbreytingarhitastig` on
both screens; `Vatnsrof ATP` for id 27, built on the glossary word; a word from you for steam
reforming.

**111. The Erfitt `Áskorun` prompts are not graded.**
Ids 23–30 (`data/problems.ts`) ask for K, −nFE°, Hess, melting point and optimum T; the grader
checks only ΔG° and the verdict. Options: (a) grade them; (b) reword them as optional reflection;
(c) remove. **Recommendation:** (b) now; (a) for the K prompts only if ΔG° = −RT ln K returns to the
formula card.

Also here: scoring in practice (item 1), ids 12 and 21 (item 9), and
`Contact aðferðin` (item 17).

### ph-titration — pH Títrun

**112. Level 1 shows the same misconception on every wrong answer.**
`Level1.tsx:305` always passes the equivalence-point message (`… pH fer ekki alltaf í 7!`), so a
student wrong about methyl orange's colour hears about pH 7. Four matching messages already exist,
unused (`:14-23`). **Recommendation:** map by challenge (ch1 strong–strong, ch2 weak–strong, ch5
buffer region, ch6 indicator, none for ch3–4). Arguably a fix under the FeedbackPanel rule, as
`intermolecular-forces`' was.

**113. Level 2 grades indicators inconsistently, and against Level 1's rule.**
Level 1 ch6 teaches that the range must contain the equivalence pH. Level 2's hand lists
(`data/level2-puzzles.ts:23,55,69,85`) accept methyl red for P1 (eq. 7), reject methyl orange there
but accept it for P3 (also eq. 7), and accept phenolphthalein for P5 (eq. 8,08). Options: (a) derive
by Level 1's rule with the unused `isIndicatorAppropriate` (`data/indicators.ts:68`); (b) the
real-lab rule, any range inside the steep jump, rewording Level 1 ch6; (c) hand lists that agree.
**Recommendation:** (a).

**114. The indicator cards say which titration each suits.**
`data/indicators.ts` `description`, rendered at `IndicatorSelector.tsx:63`, gives away half the
Level 2 task and disagrees with the grader. Options: (a) keep; (b) remove; (c) show after the
result. **Recommendation:** (c).

**115. Unreachable titrations and polyprotic maths carry wrong data.**
`data/titrations.ts` ids 3, 4, 8, 10–13 and `utils/ph-calculations.ts:117-232`: non-Appendix-D
constants (benzoic, H₃PO₄), H₂SO₃ with no Appendix D row, and polyprotic branches that fall to −∞ or
NaN. Nothing renders them today. Options: (a) delete; (b) correct and test them before anyone wires
them. **Recommendation:** (a), unless a polyprotic Level 2 puzzle is planned.

**116. Four terms the sources do not settle.**
Half-equivalence: `hálfur jafngildispunktur` (11 sites); `ordabok.md` says `hálfgildispunktur`
(0 corpus hits), the book `hálfjafngildispunkt` once. The Flask aria-label says `Erlenmeyerkolbi`;
`ordabok.md` says `keiluflaska`. `Fenólftaleín`: no entry, corpus splits 5 `fenólftalín` to 3.
`vísir` against `litvísir`: the corpus says `vísar` 35 times. **Recommendation:** the book's
`hálfjafngildispunktur` (the glossary entry has a typo in its English headword), `keiluflaska`,
`fenólftalín`, keep `vísir`.

### buffer-recipe-creator — Stuðpúðasmíði

**117. `Ammóníustuðpúði`, 8 sites, this game only.**
`data/level1-challenges.ts:297,321`, `level2-puzzles.ts:145,148`, `level3-puzzles.ts` (puzzle 5),
`problems.ts:268`. Every `ammóníum-` word in the book keeps the `-m` (57 hits); no glossary entry.
Options: (a) `ammóníumstuðpúði`; (b) keep; (c) avoid the compound. **Recommendation:** (a), with a
governed-terms row.

**118. Past its capacity, the simulator's pH stops moving.**
`BufferCapacityVisualization.tsx` floors a used-up component at 0,001 M, so the buffer looks
limitless while the water keeps falling. Options: (a) past exhaustion, pH from the excess strong
acid or base; (b) a full charge-balance solve; (c) show `–` once exhausted. **Recommendation:** (a),
the textbook treatment.

**119. Stig 2's flask comparison never says what was added.**
`Level2.tsx:336-342` adds 0,01 mol strong acid to 1 L. **Recommendation:** a one-line caption,
e.g. `Eftir að 0,01 mól af sterkri sýru er bætt við 1 L`, your wording.

Also here: the hint cost in all three levels (item 2).

### leysnijafnvaegi — Leysnijafnvægi

**120. Should Æfa diagnose the two common Ksp slips?**
This pass removed a false claim from the `veldisvisir` message; the two mistakes it named (forgetting
the 4 in 4s³, taking the wrong root) actually grade `tolustafir` or `baedi`, whose messages say only
`Reiknaðu aftur` (`components/AefaScreen.tsx` ~:62-69). Both are exactly detectable. Options:
(a) move the advice to those two outcomes; (b) diagnose the entry: within 2 % of √Ksp says square
root, within 2 % of ∛Ksp says the 4 was forgotten; (c) leave. **Recommendation:** (b), which is what
the misconception slot is for.

**121. The notes on where the two books disagree are never shown.**
`data/salts.ts` `divergenceNote` for AgI, Ag₂CrO₄, CaCO₃ and BaSO₄ is maintainer prose no screen
renders; BaSO₄'s own note says a student checking the Icelandic appendix finds a 14× different
solubility, and Æfa asks for exactly that. **Recommendation:** one student-facing line in Kanna,
e.g. `Íslenska kennslubókin gefur annað gildi — hér er notað gildi Brown.`, for BaSO₄ at least.

**122. Selective precipitation is posed only as ordering; no temperature dependence.**
README Open. **Recommendation:** leave until the Y3 roadmap schedules them.

---

## Applied — confirm only

These were changed, each on a glossary entry or a written review, and each is reversible. They are
listed so a ruling can undo them, not because anything waits on them.

**123. `eðalgas` for noble gas.** Swept in `lotukerfid` and `molmassi` (neuter:
`eðalgös`), with a governed-terms row. `ordabok.md` and the book's glossary headword (ch02/m68695)
say `eðalgas`; its running prose says `eðallofttegund` 38 to 19. Same shape as `prósentuheimtur`.

**124. `ferflötungur` for tetrahedral.** Swept in `vsepr-geometry` and
`intermolecular-forces`, with a row. `ordabok.md` and the VSEPR module's glossary headword
(ch07/m68742) agree; the corpus overall is 84 `fjór-` to 57 `fer-`.

**125. `virknihópur` for functional group** in `organic-nomenclature`, replacing the
non-word `hóptengi`. `ordabok.md` and the glossary agree; the book's prose mostly writes `virkur
hópur`. A row banning `hóptengi` could follow.

**126. Level 2 of `dimensional-analysis` now accepts the right factors in either order.**
B11 in `CURRICULUM_REVIEW.md:154` ("grades correct work as wrong"). Graded as a multiset, with tests;
easy to revert if you want step order enforced.

---

## Not for Siggi — engineering follow-ups

Found on the way, no ruling needed, not done in this pass.

- `3-ar/syrufastinn` and `3-ar/leysnijafnvaegi`: `Áfram í Skilja` / `Áfram í Æfa` return to the
  menu. Fixed this pass in `reynsluformulur` and `utfellingarhvorf` with `markCompleted(phase, next)`.
- `3-ar/jafnvaegisfasti` `AefaScreen.tsx:367-368`: the KpTask `veldisvisir` message blames the Δn
  sign and °C, which never produce that outcome. Same defect as item 120's, still live.
- `1-ar/lotukerfid` `PeriodicTable.tsx` (~:328): `role="grid"` with no rows or gridcells.
- `2-ar/hess-law` `Level2.tsx` `EquationBlock`: a `role="button"` card containing its own buttons.
- `2-ar/vsepr-geometry` `BondAngleMeasurement.tsx`: tick labels measure the half-angle, so a 90°
  bond sits near `60°`. Drop the numbers.
- `2-ar/lewis-structures` `Level3.tsx`: a formal charge of 0 prints as `+0`.
- `packages/shared/components/AnimatedMolecule` (Lewis mode): a +1 formal-charge badge is drawn in
  the `formalChargePositive` red on a red O atom (CO's O), so its edge barely shows. The `+1` text
  stays readable; the badge needs an outline or a contrasting fill.
- `packages/shared/utils/scientific.ts` `gradeScientific` compares the typed mantissa as written,
  not normalised: `13,4` with `-5` against 1,34 × 10⁻⁵ (right digits, 10× too big) grades
  `tolustafir`, not `veldisvisir`, and a slip across the mantissa-10 boundary does too. Comparing
  log₁₀(value/expected) against an integer fixes it, but changes which message
  `leysnijafnvaegi` and `jafnvaegisfasti` show, and their tests key on those outcomes.
- The `ogilt` prompt `Fylltu í báða reitina — tölu og veldisvísi` now also shows when both fields
  are filled but one holds more than a number (e.g. `8,3 × 10²` typed into Tala), since
  `gradeScientific` reads each field whole. Not wrong, but it could say what went wrong
  (`leysnijafnvaegi` `AefaScreen.tsx:71`, `jafnvaegisfasti` `AefaScreen.tsx:371,687`,
  `BeitaScreen.tsx:238`).
- An exponent written `-5,0` or `5,` now grades `ogilt` (it used to read as -5 / 5). Deliberate
  and tested; accepting a trailing `,0` would be friendlier, and nothing is misread either way.
