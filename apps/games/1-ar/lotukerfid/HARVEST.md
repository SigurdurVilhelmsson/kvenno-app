# Lotukerfið — the periodic-trends harvest

**Landed:** 2026-08-27 · **Roadmap:** `docs/plans/2026-08-16-games-roadmap.md`, Phase 3, row 3
**Source:** `namsbokasafn-leikir` at `379266e`, `games/1-ar/lotukerfid/src/data/trends.ts`

Periodic trends were taught nowhere on the platform. Level 2 is called _Groups and Trends_ in its
own English and Polish strings, but the closest it came to a trend was asking a student to **order
three elements by atomic mass**, which is a lookup in the table printed underneath the question.

Twelve comparisons — four each for atomic radius, ionisation energy and electronegativity — were
written in February and never left the old repo. They are now `src/data/trends.ts` and a fourth
question type in Level 2, with the three rules taught in the level's intro before any of them is
asked.

## What came over, and what did not

**The chemistry was right.** All twelve keys check out, which the harvest does not take on trust:
`__tests__/trends.test.ts` never reads `answerSymbol`, it derives the answer from the two elements'
positions in `elements.ts` and compares. Verified to fail on a flipped key.

**The Icelandic was not.**

- `atómgeisli` for the atomic radius, throughout. `packages/shared/i18n/ordabok.md` gives
  `atomic radius;atómradíus`, and the school's textbook corpus has **23** hits for `atómradíus` and
  **zero** for `atómgeisl-`. Corrected, and pinned by a test.
- The across-period contraction was blamed on `sterkari kjarnakraftur`. The strong nuclear force
  has nothing to do with it — the cause is the rising **effective nuclear charge**, which the
  textbook calls `virk kjarnhleðsla` (17 hits). Corrected, and pinned by a test.
- `hópur` for a column of the periodic table, where this game says `flokkur` everywhere else. Both
  are in the glossary; only one of them is what the game already teaches.

**The English and Polish did not come over at all.** The old file carried `questionIs`/`questionEn`
pairs. This game's own question generators have been hardcoded Icelandic since it shipped, and the
platform-wide i18n question is still open (roadmap decision 7), so the harvest does not add a
fifteenth game to it.

## Two mistranslated level titles, fixed while here

Both were visible on the menu, and both are settled by the file's own English and Polish blocks:

| Was                | Is                                | Why                                                                                                                 |
| ------------------ | --------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `Flokkar og lóðir` | `Flokkar og lotubundnar sveiflur` | `Groups and Trends` / `Grupy i trendy`. A `lóð` is a weight or a plot of land; a period is a `lota`                 |
| `Sameindagerð`     | `Atómbygging`                     | `Atomic Structure` / `Budowa atomu`. The level counts protons, neutrons and electrons; there are no molecules in it |

## A term this harvest deferred, and the ruling that closed it

The old data said `rafeindaskel` for an electron shell. So did the shipped platform, in 43 places
across `lotukerfid`, `lewis-structures`, `rafeindabygging` and `vsepr-geometry` — so the harvested
content shipped saying it too, because one platform with one word for one concept is the property
the glossary exists to protect, and this was a ruling rather than a harvest.

The evidence put to Siggi: `ordabok.md` gives `shell;hvolf`, and the corpus has **133** hits for
`hvolfi` and **33** for `gildishvolf` against **7** for `skelja` and **2** for `ystu skel`. Students
read `hvolf` in the book and `skel` in the games.

**Ruled 2026-08-27: `hvolf`**, and swept the same day. It is the largest agreement change in the
`CLAUDE.md` table, because `skel` is feminine and `hvolf` is neuter — `fulla ystu skel` became
`fullt ysta hvolf`, `í ystu skel` became `í ysta hvolfi`, `vegna fullrar ystu skeljar` became
`vegna fulls ysta hvolfs`. `atómradíus` was ruled with it, so this game's own pin is now backed by
`packages/shared/i18n/__tests__/governed-terms.test.ts` as well.

## What guards it

`src/__tests__/trends.test.ts` — every key derived from periodic position rather than trusted; every
pair required to share a period or a group (a diagonal comparison is refused, because the rules this
level teaches do not settle one); and the two corrected terms pinned so they cannot drift back.
