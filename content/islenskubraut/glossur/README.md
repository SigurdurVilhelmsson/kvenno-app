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
    questions:                  # a chip that means two things on one card
      farartaeki:
        Útlit:                  # a question's label, or its box: hvar, hver, hvenaer, notagildi
          hátt: wysokie

- **`words`:** a gloss per chip, as the chip is printed.
- **`categories`:** a gloss for one card only, for a chip that means something else there.
  `hátt` is loud on Dýr, and tall on Staðir.
- **`questions`:** a gloss under one question of a card, for a chip that means two things on the
  same card. On Farartæki `hátt` is loud under Hljóð and tall under Útlit; on Matur `sterkt` answers
  the taste question (`mocne`) and the smell one (`mocno`). A question is named by its label, or by
  its box's kind. The question's gloss is read first, then the card's, then the shared one.
- **`dictionary`:** optional. An address with `{word}` where the Icelandic word goes. Each chip then
  gets a link to look it up. A chip of several words is looked up by its last word, which the
  dictionary finds under its headword (`feld` under `feldur`).

**To approve a language,** a speaker reads every word and you set `approved: true` and `approvedBy`
to their name. The build then fails until every A1 chip has a gloss: the research's "A1 first".

**A dictionary alone is enough.** A language with a dictionary and no `words` gives each chip its
link and nothing else. That suits Polish, where Árnastofnun's Icelandic–Polish dictionary has every
chip, written and checked by its editors.

## Polish

`pl.yaml` has a gloss for every chip at every level: the 103 A1 chips, and since 2026-10-18 the 223
that appear only at A2 and B1, which until then showed the dictionary link alone. **They were
drafted by machine translation (Claude) and no speaker has checked them.** The A2 and B1 drafts were
checked against Árnastofnun's dictionary, entry by entry, by the drafter and a second reviewer.

**A chip added to a card needs a Polish gloss in the same change**, or CI fails
(`glossur.test.ts`): a draft is enough, since nothing here reaches students before a speaker has
read the file. Write it as the others are: a neuter adjective for `Það er …` (`mjúkt` → `miękkie`),
an adverb for smell (`mocno`), a verb in the person the question asks for, and an idiomatic phrase
for where and when. The research's rule is that machine translation may draft but never
publish. Two ways forward, in `docs/REVIEW-QUEUE.md` C18:

- a Polish speaker checks the glosses, or
- delete `words` and `categories` and approve the dictionary link alone.

## Not yet

- **A bilingual word list.** The research's printable version of item 2 waits for an approved
  language.
- **Other languages.** Each needs its own speaker. Copy `pl.yaml` without `words`, or with a
  dictionary if one exists for the language.
