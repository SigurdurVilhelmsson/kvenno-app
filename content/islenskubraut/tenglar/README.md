# Tenglar — Fleiri úrræði

Each card page ends with a short list of resources elsewhere that do what Íslenskubraut should not
rebuild. They include:

- a picture dictionary with audio
- bilingual dictionaries
- a self-study course
- teaching materials from MMS

`tenglar.yaml` holds them. The reasoning is item 1 of
[`docs/research/islenskubraut-additions/`](../../../docs/research/islenskubraut-additions/README.md).

## Adding or changing a link

Each entry has these fields:

- **`name`, `description`:** what the card page shows.
- **`audience`:** `nemendur` or `kennarar`. The panel shows these as two lists.
- **`levels`:** the card levels the link appears on (A1, A2, B1).
- **`url`:** one address for every card, or one per category. A category with no address gets no
  link.
- **`approved`:** set it to `true` once you have opened the link and agree with the wording.

**Only approved links show.** Add `?drog` to a card page's address, for example
`/islenskubraut/spjald/dyr?drog`, to see the drafts as well, each marked "(drög)".

    pnpm islenskubraut:build             # regenerate apps/islenskubraut/src/data/tenglar.ts
    pnpm islenskubraut:tenglar           # list the links per level, and which are approved
    pnpm islenskubraut:tenglar --online  # also check that every address still answers

The build fails on an address that is not https, a category that does not exist, or text that
looks ASCII-flattened. Whether a site still answers is the `--online` check's job, not the
build's: a site that is down for an hour should not stop a deploy.

**Check Bildetema's addresses in a browser.** They are `#/isl/<theme>`, and the part after `#` is
never sent to the server, so `--online` checks the site but not the theme.
