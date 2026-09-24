# Resuming the vertical-scroll rollout

**Temporary. Delete this directory before PR #66 merges** (the finalize step of the rollout does
it). The rollout was paused on 2026-09-24 at 12:55 UTC so a usage limit could reset; everything
here exists so a fresh container can pick it up with nothing lost.

## State at the pause

- Branch `claude/mobile-vertical-scroll` at `f498d32`, pushed, clean.
- **Integrated (15 of 24):** intermolecular-forces, organic-nomenclature, kinetics,
  redox-reactions, syrufastinn, lotukerfid, nafnakerfid, molmassi, reynsluformulur, jafna-jofnur,
  lausnir, rafeindabygging, utfellingarhvorf, takmarkandi, leysnijafnvaegi. Plus the two pilots,
  hess-law and dimensional-analysis.
- **Not started or lost in flight (9):** vsepr-geometry, lewis-structures (both were mid-way and
  restart from scratch), buffer-recipe-creator, thermodynamics-predictor, jafnvaegisfasti,
  einingakedjan, equilibrium-shifter, gas-law-challenge, ph-titration.
- **Not yet run:** the finalize step (step 6, CLAUDE.md, full verification, desktop-compare over
  26 games) and the completeness critic with its fix round.
- **PR #67** (jafna-jofnur → stilla-efnajofnur) is separate and green. If it has merged by the
  time you resume, merge `origin/main` into this branch first and resolve the rename: the
  `e2e/mobile-game-screens.ts` key `1-ar/jafna-jofnur` becomes `1-ar/stilla-efnajofnur` (keep this
  branch's loops), and `jafna-jofnur` must also leave the `done` list below.

## Files here

| File | What it is |
|---|---|
| `rollout-workflow.js.txt` | The Workflow script. Copy it out as `.js` before running |
| `mobile-lib.mjs.txt`, `scroll-lib.mjs.txt`, `midword.mjs.txt`, `mobile-probe.mjs.txt` | The phone measurement harness the agents are pointed at |
| `HARNESS-STANDARD.md` | The harness's rules and caveats (a full-page screenshot disables touch emulation) |
| `playwright.local.config.ts.txt` | Local Chromium config; the agents copy it per port |
| `keep-4175.sh.txt` | Watchdog that keeps the base build served on :4175 |

## Steps

1. **Recreate the paths the script expects.** It hard-codes `SP` (the harness directory) and
   `BASE_DIST`. In a new container either recreate them at those exact paths or edit the two
   constants at the top of the script:
   - copy the harness files, without `.txt`, into the `SP` directory, `HARNESS-STANDARD.md` as
     `STANDARD.md`;
   - the integration worktree is `/home/user/kvenno-vscroll` on this branch
     (`git worktree add /home/user/kvenno-vscroll claude/mobile-vertical-scroll`, then
     `pnpm install --frozen-lockfile`), with `playwright.local.config.ts.txt` copied to its root as
     `playwright.local.config.ts` (git-excluded: add it to `.git/info/exclude`);
   - `mkdir -p /home/user/vs-wt` for the per-game worktrees.
2. **Rebuild the base ("before") build.** It is the #65 head, `4a216bf` (code-identical to
   `main`'s merge commit `6859246`):
   `git worktree add --detach /tmp/claude-0/wt-e2e 4a216bf && cd /tmp/claude-0/wt-e2e &&
   pnpm install --frozen-lockfile && pnpm build`, then run the watchdog in the background.
3. **Launch the rollout, fresh — never with `resumeFromRunId`.** Its two parallel lanes break the
   resume cache, which re-runs finished games. Pass the integrated games instead:

   ```js
   Workflow({ scriptPath: '<path>/rollout-workflow.js',
     args: { done: ['intermolecular-forces', 'organic-nomenclature', 'kinetics',
       'redox-reactions', 'syrufastinn', 'lotukerfid', 'nafnakerfid', 'molmassi',
       'reynsluformulur', 'jafna-jofnur', 'lausnir', 'rafeindabygging', 'utfellingarhvorf',
       'takmarkandi', 'leysnijafnvaegi'] } })
   ```

   If more games were integrated before the pause than this list says, trust
   `git log --oneline 1fbf19e..HEAD` over the list.
4. **The lanes are already rebalanced** in this copy of the script: of the 9 games left, lane A
   takes vsepr-geometry, jafnvaegisfasti, buffer-recipe-creator, einingakedjan and
   thermodynamics-predictor; lane B takes lewis-structures, equilibrium-shifter, gas-law-challenge
   and ph-titration. thermodynamics-predictor and ph-titration stay last in their lanes (design
   §7 risks: Presence timing).
5. Check-ins: schedule one about hourly; CI runs on every push since #66 targets `main`.
