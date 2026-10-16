# Glossur — Á þínu máli

A student's own language beside each word on the question card. The student picks it from "Á
þínu máli" on the card page, and the choice is remembered in that browser only. The reasoning is
item 8 of
[`docs/research/islenskubraut-additions/`](../../../docs/research/islenskubraut-additions/README.md),
the best-evidenced addition in it.

A wrong word in a student's own language does more harm than no word, so **only a language a
speaker has checked reaches students**. Add `?drog` to a card page's address, for example
`/islenskubraut/spjald/dyr?drog`, to see the drafts.

## The file

One file per language, named by its code (`pl.yaml`, `uk.yaml`, `ar.yaml`):

    name: Polski                # the language's name in itself
    dir: ltr                    # rtl for Arabic, Farsi, Kurdish (Sorani)
    approved: false
    approvedBy: null            # who checked it, when approved
    dictionary: https://polska.arnastofnun.is/pl/leit/{word}
    words:
      feldur: futro
      hátt: głośno
    categories:                 # a chip that means something else on one card
      stadir:
        hátt: wysokie

- **`words`:** a gloss per chip, as the chip is printed.
- **`categories`:** a gloss for one card only, for a chip that means something else there.
  `hátt` is loud on Dýr and Farartæki, and tall on Staðir.
- **`dictionary`:** optional. An address with `{word}` where the Icelandic word goes. Each chip then
  gets a link to look it up. A chip of several words is looked up by its last word, which the
  dictionary finds under its headword (`feld` under `feldur`).

**To approve a language,** a speaker reads every word and you set `approved: true` and `approvedBy`
to their name. The build then fails until every A1 chip has a gloss: the research's "A1 first".

**A dictionary alone is enough.** A language with a dictionary and no `words` gives each chip its
link and nothing else. That suits Polish, where Árnastofnun's Icelandic–Polish dictionary has every
chip, written and checked by its editors.

## Polish

`pl.yaml` has a gloss for all 103 A1 chips. **They were drafted by machine translation (Claude) and
no speaker has checked them.** The research's rule is that machine translation may draft but never
publish. Two ways forward, in `docs/REVIEW-QUEUE.md` C18:

- a Polish speaker checks the glosses, or
- delete `words` and `categories` and approve the dictionary link alone.

## Not yet

- **A bilingual word list.** The research's printable version of item 2 waits for an approved
  language.
- **Other languages.** Each needs its own speaker. Copy `pl.yaml` without `words`, or with a
  dictionary if one exists for the language.
