# Ég get… — can-do statements

Three or four statements per card and level about what a student can do with it ("Ég get sagt
hvar dýrið býr"). They print on two pages beside the cards, `egget-<flokkur>-<stig>.pdf`:

1. **Four strips to cut apart**, one per student. Each statement has three boxes: _ekki enn_,
   _með hjálp_, _sjálf/ur_. The student ticks what fits now.
2. **A class checklist for the teacher**, with the same statements numbered. The teacher writes H
   (with help) or S (on their own) beside a student's name while the student talks about the card.

Nothing is stored, and neither page is a grade: the checklist says so. The reasoning is item 6 of
[`docs/research/islenskubraut-additions/`](../../../docs/research/islenskubraut-additions/README.md),
which also warns that self-rating needs a teacher to explain it. It is not something to hand out
without a word.

## The file

    confirmed: false
    A1:
      - Ég get sagt hvaða dýr þetta er.
      - Ég get sagt hvernig dýrið lítur út.
      - Ég get sagt hvar dýrið býr.

Each level has three or four statements, each starting `Ég get`. Write them about what the card at
that level lets a student do, in words a student at that level can read.

Set `confirmed: true` once a teacher has read all three levels. Until then the card page does not
link the sheet. Add `?drog` to a card page's address, for example `/islenskubraut/spjald/dyr?drog`,
to see the link anyway.

## After an edit

    pnpm islenskubraut:bin --fetch   # the statements are checked against BÍN like the cards
    pnpm islenskubraut:build
    pnpm islenskubraut:spjold        # renders the sheets; fails on one that is not two pages

The statements were drafted by Claude, from each card's questions and frames. They were checked
with Greynir on 2026-10-16: every one parses. Its only flags were `lýst` → `líst`, which is wrong,
since `ég get lýst` is from `lýsa`.
