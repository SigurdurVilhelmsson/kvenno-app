# Myndtákn — pictograms for the A1 chips

Every chip a student sees on an A1 card (the answers on the question card, and the words the
sentence builder offers) can carry a pictogram from [ARASAAC](https://arasaac.org), the set made
for language learners and AAC. `myndir.yaml` holds the pairings.

## The workflow

    pnpm islenskubraut:myndir --fetch    # search ARASAAC, choose the best match, download it
    pnpm islenskubraut:myndir            # check, offline, and rewrite the review sheet

1. `--fetch` searches ARASAAC (in English) for every chip with no `id`, writes the best match into
   `myndir.yaml`, keeps the other matches in `frambod.json`, and saves each chosen picture as
   `apps/islenskubraut/public/myndir/<id>.png`. ARASAAC is not reachable from a cloud session, so
   this runs on your own machine, as `pnpm islenskubraut:bin --fetch` does.
2. Open `islenskubraut-myndir-yfirlit.html` (in the repo root, not committed). Each chip shows the
   chosen picture and up to six others ARASAAC found, with their numbers.
3. Where a better picture is there, put its number in `id`. Where none fits, change `search`,
   delete `id`, and fetch again.
4. When the picture matches the word, set `approved: true`. **Only approved pictures are shown to
   students.** A picture that shows the wrong thing teaches the wrong word, and no check can tell.
5. Run `--fetch` once more to download any pictures you changed, then commit `myndir.yaml`,
   `frambod.json` and `apps/islenskubraut/public/myndir/`.

The build fails if a chip on an A1 card has no entry here, if an entry is for a chip no card has,
or if an approved picture's file is missing. So adding a chip to a card means adding it here too.

`words` is shared by every card. `categories` overrides it where the same chip means something
else on one card: on Staðir, `hátt` is a tall building, while on Dýr it is a loud sound.

## Licence

ARASAAC's pictograms are **CC BY-NC-SA 4.0**, not MIT like the rest of the repo: free for a
school, but not for sale, and anything made with them is shared on the same terms. They are the
property of the Government of Aragón and were created by Sergio Palao. Every page or card that
shows them must say so; the site uses this wording (`CREDIT` in `scripts/islenskubraut/myndir.mjs`):

> Myndtáknin eru eign ríkisstjórnar Aragóníu og gerð af Sergio Palao fyrir ARASAAC
> (https://arasaac.org), sem dreifir þeim með Creative Commons-leyfinu BY-NC-SA.

The files in `apps/islenskubraut/public/myndir/` are ARASAAC's, unchanged.
