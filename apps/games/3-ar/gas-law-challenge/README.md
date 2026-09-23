# Gaslögmál

Chain position 1 in Year 3, before Jafnvægisfastinn. The game teaches the ideal gas law
`PV = nRT` (R = 0,08206 L·atm/(mol·K)) and the special cases that fall out of it when one or more
variables are held constant: Boyle, Charles, Gay-Lussac, the combined gas law and Avogadro.

> This file replaced an **unedited scaffold template** on 2026-09-22. The old one was headed
> "Kvennaskólinn Chemistry Game Template", documented a `create-game.sh` that does not exist in this
> repository, and said nothing whatever about this game. Nothing was lost by replacing it.

## Structure

A menu with an intro card ("Af hverju PV = nRT?"), a level picker and two modes. Each question is
drawn at random, with replacement, from the chosen level's pool (`getRandomQuestionForLevel` in
`src/data/questions.ts`). Levels are not gated.

| Stig | Laws                       | Questions | Law-selection step |
| ---- | -------------------------- | --------- | ------------------ |
| 1    | `ideal` only               | 13        | skipped            |
| 2    | Boyle, Charles, Gay-Lussac | 6         | yes, in practice   |
| 3    | combined gas law, Avogadro | 4         | yes, in practice   |

Before this, every question was drawn at random from all six laws, which the Y3 review cycle rated
a P3 failure. The iteration-5 restructure split them by law into the three curriculum-ordered levels
above (`LEVEL_LAWS`, `src/data/questions.ts`).

- **Æfingahamur** — no timer, unlimited hints, a "Sýna lausn" panel. On Levels 2 and 3 the student
  first picks which law applies ("Skref 1: Hvaða lögmál á við?") and is told why if wrong.
- **Keppnishamur** — 90 seconds per question, no law-selection step, no solution panel, and a
  50-point bonus for answering with more than 60 seconds left.

Feedback shows the student's and the correct answer, the step-by-step solution, and an
"Af hverju virkar …?" card carrying the law's molecular-level `principleIs` from `src/types.ts`.

## Before touching it

- **Hints cost nothing.** Points come from accuracy only — 100 within tolerance, 150 within 1 %, plus
  the challenge time bonus (`src/App.tsx:148-152`); `getHint()` only counts hints for the stats. A
  phantom "hints cost points" string lived in the old `i18n.ts` and went with it (see
  `docs/README.md`).
- **The language switcher was stripped on 2026-09-19** — the game had zero `t()` calls, and the
  `i18n.ts` is gone. `switcher-earns-its-place.test.ts` lists this game and fails if it returns.
- **One name, three places:** the hub card, the `<title>` and the `Header`'s `gameTitle` all say
  `Gaslögmál`, enforced by `game-titles-agree.test.ts`. The old English title appeared at four
  student-facing sites until 2026-09-19 and is banned by name; do not reintroduce it, including in
  new UI copy.
- **Everything a student reads is Icelandic, with a decimal comma.** Until 2026-09-22 all 13 Stig 1
  questions — the default level — carried English hints and worked solutions, and every question
  printed an English copy of its scenario under the Icelandic one. Both are gone (the `scenario_en`
  and `nameEn` fields with them), and `src/__tests__/icelandic-text.test.ts` fails on English
  vocabulary or a decimal point in any question string or `GAS_LAW_INFO` field. The law is
  `Kjörgaslögmálið`, as `ordabok.md` has it; `governed-terms.test.ts` bans the old
  `lofttegundalögmál` compound. Numbers formatted at render time — the given values, the revealed
  answer, the feedback screen and the simulator's readouts — go through `formatDecimal` from
  `@shared/utils` since 2026-09-22 (they printed a full stop until then);
  `src/__tests__/decimal-comma.test.ts` fails on a `toFixed`, a raw `{….value}` or a raw `{R}` in
  `App.tsx` or any component.
- **The `Námsleiðin` chain lives in `src/components/MenuScreen.tsx`**, not `App.tsx` as in the
  sibling games. `3-ar/syrufastinn/src/__tests__/chain-string.test.ts` reads it from there.
- **`andhverfu hlutfalli` is correct here.** Boyle's law really is an inverse proportion, and the
  `governed-terms.test.ts` ban on the reaction sense of that word carves out a following form of
  `hlutfall` for exactly this string in `src/types.ts`.
- **The answer field is `type="text"` + `inputMode="decimal"`** and is parsed with
  `parseStudentNumber`, so an Icelandic decimal comma is read. Grading is an absolute `±tolerance`
  per question (`checkAnswer`, `src/utils/gas-calculations.ts`).
- **The answer's unit comes from the question, not the variable.** `answerUnit` in
  `src/utils/gas-calculations.ts` uses the unit the question states the sought variable in — V₂ in
  V₁'s unit — and falls back to `getUnit` for the ideal-gas questions, which never state it. Question
  14 is the reason: its syringe is in mL and its answer is stored in mL, but the field was labelled
  `L` until 2026-09-22, so a student who converted to match the label was marked wrong.
  `answer-unit.test.ts` holds every answer label to the unit its worked solution ends in.

## Layout

```
index.html                      <title>Gaslögmál - Kvennaskólinn</title>
src/App.tsx                     state, grading, timer, keyboard (Enter / H / S)
src/types.ts                    GasLawQuestion, GAS_LAW_INFO (six laws), R
src/data/questions.ts           23 questions, LEVEL_LAWS, level pools
src/utils/gas-calculations.ts   solveGasLaw, checkAnswer, calculateError, units, names
src/components/MenuScreen.tsx   intro, level picker, modes, Námsleiðin chain
src/components/GameScreen.tsx   law selection, answer input, hints, solution
src/components/FeedbackScreen.tsx
src/components/GasLawSimulator.tsx   particle view of the question's P, V, T, n
src/__tests__/gas-calculations.test.ts
src/__tests__/icelandic-text.test.ts
src/__tests__/answer-unit.test.ts
```

## Open

- **Score, streak and "Besta röð" are shown in both modes**, including practice, and a correct
  practice answer still awards points. That sits uneasily with the no-scoring-while-learning rule;
  whether practice should keep them is a ruling, not a code fix.
- **No Explore phase.** The first thing after the menu is a graded question; the review cycle
  deferred a manipulable pre-game simulator.
- **No test checks that each stored `answer` follows from its givens.** The tests cover the
  calculation helpers, the Icelandic text, the answer units and the decimal comma, but not the
  answers themselves, as `1-ar/reynsluformulur` and `3-ar/buffer-recipe-creator` now do by deriving.
