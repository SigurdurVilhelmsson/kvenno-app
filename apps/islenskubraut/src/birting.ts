/**
 * Whether the drafts are live: shown to everyone, not only under `?drog`. Siggi's call on
 * 2026-11-12, while the site is not yet in use: everything drafted is on the site, and what a
 * teacher has approved is still recorded where it always was, in the YAML (`approved`,
 * `confirmed`, `draft`, `hljod.yaml`) and on the teachers' review page, which is unchanged.
 * The site itself does not say what is a draft, except under `?drog`.
 *
 * Set it to `false` before the site goes into use, and students see approved content only again.
 * The one thing it does not make live is a recording a teacher heard as wrong (`rangt`).
 */
export const DROG_BIRT = true;
