# Texti — Frá tali til texta

A one-page sheet per card and level that takes a student from talking about the picture to
writing about it. The reasoning is item 4 of
[`docs/research/islenskubraut-additions/`](../../../docs/research/islenskubraut-additions/README.md).
It is the shape MEMM's vocabulary page recommends (picture, then words, then sentences), in four
steps:

1. **Segðu frá:** say something about the card to a partner, with the level's frames.
2. **Lestu:** read a short model text. Each part of it is named beside it, so the student sees
   how the text is built.
3. **Fylltu í:** fold the page and fill the same text with the card's words taken out, from a box
   of them.
4. **Skrifaðu:** write two to five sentences of your own about something else on the card.

There is one file per category, named like the category's card (`dyr.yaml`, `matur.yaml`, …).

## The file

    confirmed: false
    A1:
      genre: Lýsing
      stages:
        - name: Hvað er það?
          text: Þetta er hundur. Hundur er gæludýr.
        - name: Útlit
          text: Hann hefur feld og hala. Feldurinn er mjúkur.

- **`genre`:** the kind of text, printed in the title. A1 and A2 are a `Lýsing`. At B1 each
  category has a school genre: Dýr a `Skýrsla`, Matur a `Samanburður`, Farartæki an `Útskýring`,
  Manneskja a `Starfslýsing`, Staðir a `Lýsing á stað` and Klæðnaður a `Ráðlegging`.
- **`stages`:** at least two, each with a `name` printed beside it and its `text`.
- **`confirmed`:** set it to `true` once a teacher has read all three levels. Until then the card
  page does not link the sheet. Add `?drog` to a card page's address, for example
  `/islenskubraut/spjald/dyr?drog`, to see the link anyway.

Manneskja is about jobs, not family, so that the task does not ask a student to write about their
own family or journey.

## The gaps

You do not mark the gaps; the build finds them. A word is a gap where BÍN reads it as a form of a
word the card offers **at that level**, so `feld` is a gap for the chip `feldur` and `hönskum` for
`hanskar`. A chip of more than one word (`á morgnana`, `úr málmi`) is a gap where it appears exactly
as printed. Only nouns, adjectives and verbs count, so `heima` and `allir` stay in the text even
though they are chips. Each word is a gap once, the first time it appears. The box lists the gaps
in lower case and alphabetical order, so neither a capital nor the order gives a gap away.

To see the gaps, render the sheets (`pnpm islenskubraut:spjold`) and open
`apps/islenskubraut/public/spjold/texti-<flokkur>-<stig>.pdf`.

## After an edit

    pnpm islenskubraut:bin --fetch   # look up the new words in BÍN
    pnpm islenskubraut:build         # regenerate, and find the gaps

The build stops on:

- a word that has never been looked up in BÍN (run `--fetch`)
- a level with fewer than two stages
- a level whose text uses fewer than four of the card's words
- text that looks ASCII-flattened

`pnpm islenskubraut:bin` also fails on a word BÍN does not know, as it does for the cards.

The texts were drafted by Claude and checked with Greynir and GreynirCorrect (MIT) on 2026-10-16.
Every sentence parsed, and the one flag it raised was the card's own chip `til að stunda
íþróttir`. Greynir checks grammar, not meaning, so a teacher still reads every text
(`docs/REVIEW-QUEUE.md` C14).
