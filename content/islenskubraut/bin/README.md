# BÍN lookups

`pnpm islenskubraut:bin` checks every word in the Íslenskubraut content against BÍN.
`content/islenskubraut/README.md` explains how to run it.

- `ordmyndir.json` holds BÍN's answers, written by `pnpm islenskubraut:bin --fetch`. Do not
  edit it by hand.
- `ekki-i-bin.yaml` lists correct words that BÍN-kjarninn does not carry, each with the
  reason someone checked it. People edit this one.

## Licence of `ordmyndir.json`

The rest of this repository is MIT. **`ordmyndir.json` is not.** It is data from BÍN-kjarninn,
released under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). BÍN's terms of
use (https://bin.arnastofnun.is/) say that anyone may use it and publish data from it free of
charge, on two conditions:

- **Do not change the data.** The script stores each form and its tags exactly as BÍN sent
  them, and keeps only the entries it looked up.
- **Name its origin**, in this wording: Gögnin eru úr Beygingarlýsingu íslensks nútímamáls
  (BÍN) og eru í eigu Stofnunar Árna Magnússonar í íslenskum fræðum.

The file carries that statement and the licence in its own `_heimild` and `_leyfi` fields, so
they travel with it. Any page or PDF that shows students forms taken from it must carry the
same attribution.
