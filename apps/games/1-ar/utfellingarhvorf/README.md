# Útfellingarhvörf

**Status: complete and registered.** Four phases, 103 tests of its own, in `build-games.mjs`, on the
hub, and in the Y1 `Námsleiðin` chain between Stilla efnajöfnur and Takmarkandi.

Phase 5 of the games roadmap. The third of the four confirmed curriculum gaps to close, after
Sýrufastinn (Ka/Kb) and Reynsluformúlur (empirical formula). This one closes **three** absences at
once — electrolyte classification goes to `1-ar/lausnir`, and solubility rules, precipitation and
net ionic equations come here.

## The gap was the largest one measured

`ORPHANED_GAMES_ASSESSMENT.md:322` ran 34 greps in Icelandic and English across all twenty shipped
games: `rafkleyfi` 0 · `raflausn` 0 · `rafleiðni` 0 · `jónast` 0 · `botnfall` 0 · `útfelling` 0 ·
`net ionic` 0 · `áhorfendajón` 0 · `leysnireglur` 0. `(aq)` returned twelve hits, **all Year 3** — so
Year 1 had never seen the notation either.

The near-miss is worth naming, because the two share an Icelandic word and nothing else:
`1-ar/lausnir` does teach `leysni`, but `TemperatureSolubility.tsx` is g/100 g H₂O against
temperature (Brown §13.3, _how much_ dissolves). It never asks _which_ ionic compounds dissolve,
which is §4.2 and is what this game is.

**Net ionic equations were the single largest hole**: absent from all three years. February
specified a fourth level of `jonir-i-lausn` for them and never built it, so what shipped was the
eight equations as post-answer display strings — decoration, not practice
(`docs/FEBRUARY-DECISIONS-RECOVERED.md:234`).

## Where the chapter split put it

The assessment offered two defensible chain positions. The school's own textbook settles it:
electrolytes are **ch. 11** (`ch11/m68781`, solutions) and precipitation is **ch. 4**
(`ch04/m68710`). So precipitation comes first and this node sits after Stilla efnajöfnur, while the
electrolyte phase belongs in Lausnir, further along the chain. Both deliverables, in the order the
book teaches them — which is what February answered when it said "both".

## Why nothing here is stored

Compare the ancestor. `jonir-i-lausn` stored, per reaction, a molecular equation, a net ionic
equation, a product name and an explanation, as four independent strings. Nothing made them agree,
and `ORPHANED_GAMES_ASSESSMENT.md:326` found the consequence: **it tested an Ag₂CrO₄ precipitate
against a six-rule table with no chromate row**, so the question could not be reasoned to at all.

Here a scenario is **two soluble salts and a sentence of context**. Everything else is computed:

| Derived                | From                                            |
| ---------------------- | ----------------------------------------------- |
| the compound's formula | the two ion charges, crossed and reduced        |
| soluble or not         | the school's table, plus the exception list     |
| the molecular equation | ion conservation, solved and reduced            |
| the complete ionic one | splitting every aqueous salt                    |
| the net ionic one      | striking the spectators out of the complete one |
| the spectator ions     | equal amounts on both sides                     |

So the Ag₂CrO₄ defect is not fixed, it is **unwritable**: `solubility()` throws when no rule covers
an anion rather than defaulting, and `precipitation.test.ts` asserts as a property that every anion
in the pool is covered. `react()` also refuses a scenario whose reactants are not both soluble, so
"pour the AgCl solution" cannot be typed either.

This is the pattern `1-ar/reynsluformulur` used for the same class of defect, and the reason to
reach for it is the same: the data is an arithmetic result, not a fact, so it should be computed.

## The solubility table is the book's, not the old game's

Transcribed from `ch04/m68710-segments.is.md`. The old game's six-rule paraphrase differs in four
places, and each difference mattered:

- **no chromate rule at all**, while the game tested a chromate precipitate;
- sulfate exceptions omitted **Ag⁺** and **Hg₂²⁺**;
- hydroxide exceptions included **Ca²⁺**, which the book does not list — Ca(OH)₂ is insoluble here;
- no rule for **F⁻**, acetate, bicarbonate or chlorate.

Adding the fluoride row bought a scenario the old game could not pose: CaF₂, where a normally
soluble anion precipitates with a group-2 cation.

## The answer leak, and why the builder is a tray rather than a text box

`ORPHANED_GAMES_ASSESSMENT.md:326` measured the old Level 3's grader. `normalizeFormula` stripped
only whitespace and state labels — despite a comment claiming more — then did exact string equality
against Unicode-subscript strings, so **six of its eight precipitates were unanswerable from an
Icelandic keyboard**, and the placeholder told the student to type `BaSO₄(s)`. `Level3.tsx:81` then
set `isCorrect = true` on any formula submission at all, so both the score and the accuracy readout
were fiction.

The Beita phase therefore has the student **select ions from a tray and set coefficients**, which is
answerable on any keyboard and is graded against a derived answer. Same shape as
`1-ar/nafnakerfid`'s name builder, this repo's precedent for exactly this problem: an input a
student cannot physically produce is not an assessment.

Level 1's leak was separate and just as total — all fifteen descriptions named the category in
words, and the unlit bulb rendered before the answer. That content went to Lausnir, rewritten.

## Terminology

Four terms were missing from `ordabok.md` and all four came out of the school's textbook rather than
being coined. Counts are from the live corpus, excluding its backup tree:

| Term                    | Ruled              | Corpus              |
| ----------------------- | ------------------ | ------------------- |
| net ionic equation      | `nettójónajafna`   | 23 vs 8 two-word    |
| complete ionic equation | `heildarjónajafna` | 6 vs 1              |
| spectator ion           | `áhorfendajón`     | 6 vs 0              |
| precipitation reaction  | `útfellingarhvarf` | 9 vs 7 `botnfalls-` |

**One variant is worth Siggi's confirmation and is not blocking**: the book's glossary headwords are
the two-word `nettó jónajafna` and `fullkomin jónajafna`, while its running prose overwhelmingly
writes the solid compounds above. The solid forms were taken because prose frequency is decisive and
because `ordabok.md`'s neighbours (`jónajafna`, `sameindajafna`) are solid. Both forms are the
book's own, so this is a spelling choice, not a coinage.

`útfellingarhvarf` over `botnfallshvarf` follows `ordabok.md`'s existing split: `precipitation;
útfelling` names the process and `precipitate;botnfall` names the solid, so the reaction takes the
first.

Three `governed-terms.test.ts` rows were added, and **none of them guards a form that ships today**.
They guard the file this game was harvested from, because a later port would bring them back — the
`enþalpía`-from-`calorimetry` trap:

- **`rafkleyfi` is masculine.** The old game rendered `Sterkt rafkleyfi` and `Veikt rafkleyfi` on
  every Level-1 answer button; the corpus says `sterkur rafkleyfi` and `sterkir rafkleyfar`. Its
  `Órafkleyfi` is not a word the book uses at all — non-electrolyte is `órafkleyft efni`, an
  adjective plus a noun, which is what `ordabok.md` already carried.
- **`áhorfendajón`, not `áhorfandajón`.** The linking form is the genitive plural.
  `ORPHANED_GAMES_ASSESSMENT.md:207` writes the wrong one, and Markdown is not scanned.
- **`joðíð`, not `jódíð`.** The corpus is 54 to 0 and the shipped platform was already clean; the
  old game says `jódíð` four times, on the very reaction the book uses as its worked example.

`rafleiðari` and `raflausn` were checked and are **not** banned: the corpus uses both correctly, for
_conductor_ and for _electrolyte solution_. February's ruling was that `rafleiðari` must not be used
to mean electrolyte, not that the word is wrong.

## Layout

```
src/data/ions.ts               ions, charges, and the school's solubility table
src/engine/precipitation.ts    formulas, verdicts, balancing, the three equations
src/data/problems.ts           17 scenarios as ion pairs; 24 drill compounds
src/components/                KannaScreen, SkiljaScreen, AefaScreen, BeitaScreen
src/utils/desktopReveal.ts     a desktop window's reveals, kept as they were before the phone pass
src/__tests__/                 the engine, the data, the graders, and the screens played through
```

The engine is exercised over **every** soluble pairing in the pool, not just the shipped scenarios —
several hundred reactions, each checked for atom balance, charge balance, reduced coefficients, and
a net ionic equation containing no spectator. A new ion is therefore tested the moment it is
declared.

## On a phone

Built for 360 × 740 first; from `sm` up every screen keeps its desktop layout. The vertical-scroll
pass (`docs/plans/2026-09-23-vertical-scroll-design.md` §4) then fitted each play loop to one screen
at 360 × 640 and 390 × 664, with every visible change behind `phone:`, `phone-land:` or `pin:`:

- **The menu shows all four phases on the first screen.** The cards are compacted, `Lokið` is a
  corner badge, and on a phone the overview paragraph follows the phases. It previews the game
  rather than teaching it — its one statement of chemistry is Skilja's second rung, where the ladder
  teaches it — and holds nothing focusable. On a phone on its side the phases are 2 × 2. Back from a
  phase, the next one not yet done is focused, and on a phone brought into view.
- **Kanna: after a pick or a pour, the pairs, the beakers and the result share the screen**, so
  the next pair is a tap away with no scroll. The pairs go three to a row with their formulas
  stacked (that markup exists only on a phone), and the beakers are smaller. On the SE only the
  beakers and the result fit. On a phone on its side the pairs sit beside the beakers and the
  result. After a pour, focus moves to the result.
- **Skilja keeps its ladder.** On a phone "Næsta skref" shows the rung it opened down to the button,
  and focus moves to the rung. The net ionic equation's box under the last rung is teaching, read in
  full, so "Áfram í Æfa" may be a scroll below it.
- **Æfa: the first question sits inside the compound's card, and "Athuga" is pinned to the foot of
  a portrait phone** (design P8: after compaction the compound to "Athuga" was still 602–622 px
  against 584 px of screen; a choice screen, no text input). The bar leaves with "Athuga" on the
  check, so it never covers the feedback. The rules keep their text; all but the last two show
  above the bar at 360 × 640. On a phone on its side the compound and its question sit beside the
  rules.
- **Beita: the four ions go two to a row**, so the build step fits under the scenario. Each new
  question takes focus.
- **After a check, focus goes to the feedback, never to the button that follows it**, and that
  button is a new element, not the one pressed. "Næsta", "Næsta dæmi", "Næsta skref", "Áfram í
  Æfa" and Beita's answer buttons ignore a press within 400 ms of appearing, so a double tap cannot
  skip what the check just said, or answer the next question unread.
- **Scrolling goes through `@shared/utils`.** The game's own `src/utils/reveal.ts` is gone. A
  desktop window keeps exactly what it did — the same trigger and the same landing, at any width —
  through `src/utils/desktopReveal.ts`, which only decides and leaves the scrolling to the shared
  helpers. `phone-reveal.test.tsx` holds both.

## Its Year-3 sibling

Ksp was the sibling gap, and `3-ar/leysnijafnvaegi` closed it on 2026-09-20. This game asks the
qualitative question ("does a precipitate form, by rule?", Brown 4.2); that one asks the
quantitative one ("by Q vs Ksp?", 17.6), and the two share anchor compounds on purpose. One anchor
does not cross: PbI₂, this game's worked example, has no Appendix D row, so Leysnijafnvægi carries
no Ksp for it — see its README.

## Open

- **Precipitate colours are named in prose, not rendered.** The beaker has three states. The colours
  a student actually sees are in the context sentences instead;
  `solubility-equilibrium/src/data/compounds.ts` in the frozen `namsbokasafn-leikir` repo has colour
  data for twenty compounds if that is ever wanted.
- **Acetate, bicarbonate and chlorate are in the book's table but not in the ion pool.** Nothing
  needs them yet, and each would need a name ruling before it could be rendered.
- **Which rule "decides" a group-1 carbonate, chromate, phosphate or sulfide is Siggi's call.**
  Æfa asks "Hvaða regla ræður því?" and accepts every row whose own statement settles the compound
  (`decidingRules` in `src/engine/precipitation.ts`) — so NaNO₃ takes the group-1 row or the nitrate
  row, and KCl and NaF likewise. Until 2026-09-23 only the group-1 row was accepted, and the
  student who chose the nitrate row was told another rule decided it. Still rejected: the carbonate
  row for Na₂CO₃ (and the same for K₂CrO₄, Na₃PO₄ and (NH₄)₂S), which reaches the right answer only
  through its exception clause while the group-1 row settles it directly. BaSO₄ is already graded
  right through the sulfate row's exception, so there is a case for accepting the carbonate row
  too; `aefa-rule-grading.test.tsx` pins the current line.
