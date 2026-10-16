# Giskaleikur — Hvað er þetta?

A guessing game for two students, printed beside each card. Student A draws a cut-out card that
names a thing (`hundur`, `strætó`) and lists what the card says about it. Student B asks the card's
own questions, one at a time, and crosses out the things on the question sheet that no longer fit
until only one is left. A answers each question in a whole sentence, using the card's frames.

This is an **information gap**: each student knows something the other does not, so the talk is
real. The reasoning is item 3 of
[`docs/research/islenskubraut-additions/`](../../../docs/research/islenskubraut-additions/README.md).

There is one file per category, named like the category's card (`dyr.yaml`, `matur.yaml`, …).

## The file

    confirmed: false
    items:
      - name: hundur
        from: A1
        answers:
          Útlit: [feldur, hali, fjórir fætur]
          Hljóð: [gelur]
          hvar: [heima]

- **`name`:** the thing to guess. It is printed on the cut-out card and in the list of
  candidates on the question sheet.
- **`from`:** the first level the thing appears at. A thing from `A2` is on the A2 and B1 games.
- **`answers`:** what the card says about the thing, per question. A main question is named by
  its label (`Útlit`, `Hljóð`), a coloured context question by its kind (`hvar`, `hvenaer`,
  `hver`, `notagildi`). Every chip must be one the card prints.
- **`confirmed`:** set it to `true` once a teacher has read every item at every level. Until then
  the card page does not link the game. Add `?drog` to a card page's address, for example
  `/islenskubraut/spjald/dyr?drog`, to see the link anyway.

**Each level's game uses only that level's words.** A chip the card does not offer at a level is
left off that level's game, so an A1 student is never handed a B1 word. That is why an item can
list more chips than any one level shows.

## What the build refuses

`pnpm islenskubraut:build` checks every file against its card, and stops on:

- a chip the card does not print, or a question it does not ask
- a chip that is the thing's own name, which would give the answer away
- a thing listed twice, or text that looks ASCII-flattened

It also stops when a level's game cannot be played:

- fewer than four things to guess among
- a thing the card says fewer than three things about at that level
- two things described in exactly the same words at that level, so no question could tell them
  apart

Adding a chip to a card, or removing one, can make an existing game fail one of these, and the
build says which.

## Printing

`pnpm islenskubraut:spjold` renders `giskaleikur-<flokkur>-<stig>.pdf` into
`apps/islenskubraut/public/spjold/`, beside the cards and word lists. It is two A4 pages, so it
prints on one sheet, both sides:

1. **Spjöld:** the cut-out cards, one per thing.
2. **Spurningablað:** the rules, the card's questions, the things it could be (with a box to cross
   each out) and the level's sentence frames.

The render fails on a game that is not exactly two pages. The rules text on page 2 was drafted by
Claude and awaits a teacher's reading, like the items (`docs/REVIEW-QUEUE.md` C13).
