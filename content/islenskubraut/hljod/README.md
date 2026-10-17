# Hljóð — Hlustaðu

A recording of every word, frame and worked example on the cards, so a student who cannot yet read
Icelandic can hear it. On the card page each one gets a small play button. The reasoning is item 5
of [`docs/research/islenskubraut-additions/`](../../../docs/research/islenskubraut-additions/README.md).

The recordings are synthesised, not recorded by a person:

- **Voice:** Talrómur C, a FastSpeech2 voice from Reykjavík University's Language and Voice Lab
  (CC BY 4.0), with the Talrómur 1+2 Style MelGAN vocoder (Apache 2.0).
- **Pronunciation:** Grammatek's ice-g2p (Apache 2.0) gives each word's pronunciation, from its
  dictionary or its model.

Tiro's public speech service, which the research first named, had gone by 2026-10-16.

## Only approved recordings play

`hljod.yaml` lists every recording and whether a person has listened to it:

    clips:
      feldur: true      # listened to, and right
      hali: false       # not listened to yet, or not settled
      les: rangt        # listened to, and wrong: make it again

**A student hears only the ones marked `true`.** Add `?drog` to a card page's address, for example
`/islenskubraut/spjald/dyr?drog`, to hear the rest, `rangt` ones included. Whenever any recording
plays, the card page credits the voice, as its licence requires.

**`stada.json` beside it is the tools' record** of each recording: the version of its audio (a
hash of the file) and its value in `hljod.yaml` for that audio. Never edit it by hand;
`pnpm islenskubraut:hljod --record` and `pnpm islenskubraut:yfirferd --apply` write it. It ties an
approval to the audio approved: when a file is replaced, by the voice or by a person recording
under the same name, `--record` sets that recording back to `false`, since nobody has heard the new
audio. So does a `true` with no record at all. The build, `pnpm build` and so `deploy.sh` included,
refuses to run until `--record` has seen every change, so a replaced recording can never play to
students unheard.

**The build also refuses a value the teachers' verdicts do not give,** wherever `mat.json` (below)
holds a verdict on the recording as it is now. A hand edit, or a git merge of two runs, could
otherwise approve a recording a teacher heard as wrong. `pnpm islenskubraut:yfirferd --apply`, with
no files, works every such value out again.

**After editing `hljod.yaml` by hand, run `pnpm islenskubraut:hljod --record`** before building. A
hand edit holds only for a recording nobody has given a verdict on as it is now; to overrule
teachers, give a ruling (below).

## Listening

**Teachers listen on the site**, at `/islenskubraut/yfirferd/hljod`, which only the review page,
`/islenskubraut/yfirferd`, links to. Every recording plays there, drafts included, with `Rétt` and
`Rangt` beside it and a box for what is wrong. The page keeps the marks in the teacher's browser,
and they type their name and press `Sækja skrá` and send the file back. Its name carries the date
and time, theirs and the start of their browser's id, so no two downloads share one; keep every
one, since a later file need not hold all an earlier did. A teacher who cannot send a file presses
`Afrita sem texta` and pastes the text into an email: it carries the same data between two marker
lines, so save the email's text as `yfirferd-islenskubraut-<name>.txt` and pass it like a file.
Save them in the repository root, where they are gitignored (they carry teachers' names). Then:

    pnpm islenskubraut:yfirferd yfirferd-islenskubraut-*                # read what they say
    pnpm islenskubraut:yfirferd yfirferd-islenskubraut-* --apply        # write the verdicts

Without `--apply` it ends by saying what `--apply` would write. Until it no longer names `mat.json`,
the files' verdicts are not in the record, so keep the files.

**`--apply` adds the files' verdicts to `mat.json` here, the record of every verdict given,** works
each recording's value out from the whole record, and runs `pnpm islenskubraut:build`. Commit
everything git then shows changed: `mat.json`, `hljod.yaml`, `stada.json` and the app's generated
`hljod.ts` and `hlustun.ts`. After that the files can be deleted once their notes on the cards have
been read, since the record keeps only the verdicts; a file applied twice changes nothing. The
record names nobody: each reviewer in it is a hash of their browser's id, and of what they wrote it
keeps only what was wrong with a recording, not the notes on the cards. So the values come from
every file ever applied, on any machine, not only from the ones passed this time:

- `true` if someone heard it as right and nobody as wrong;
- `rangt` if someone heard it as wrong and nobody as right;
- `false` if it was heard both ways, or the verdicts on it were taken back: it is to be heard
  again.

A recording whose verdicts are all on audio since replaced keeps the value it has, which `--record`
set back to `false` when the audio changed; the record keeps those verdicts beside the new ones, so
audio that comes back (a revert, say) finds its own. A recording nobody has given a verdict on
keeps its value too. An approved recording that this makes `false` or `rangt` is listed first in the report:
students hear it until the site is built and deployed again. Every change is listed with who said
what; a reviewer whose file is not among those passed shows as `kennari` and the start of their
hash.

A verdict counts only for the audio it was given to, and each reviewer's latest verdict on a
recording counts, by when their browser says they gave it; writing what is wrong counts as a later
word. Pressing the pressed button again takes a verdict back, and
the next file says so; a teacher can send a file that only takes one back. A mark merely missing
from a later file still stands from an earlier one, which is what happens after `Hreinsa allt`.
**A reviewer is a browser, not a name:** the page gives each browser a random id, put in every file
it sends, so two teachers who type the same name are still two. `Hreinsa allt` gives the browser a
new id, since the next person to use it is someone else. So a teacher who reviews on two devices,
or clears the review and starts again, is two reviewers. That only matters if they change their
mind: the earlier verdict still stands, and the recording is heard both ways until it is settled.

A page left open since before a recording was made again would name the old audio. The listening
page asks for each recording by the version it was built with (`?v=` in the address, so the
browser fetches it afresh rather than playing a copy kept from before), fetches the same address
to hash what the server holds there, and where that is not the version it knows it takes no
verdict or note until the page is reloaded. Where the browser cannot check (an old browser, or no
https), a verdict on other audio given after someone had judged the current one is listed in the
report without counting. So is one given to audio since abandoned, by a revert say: the record
cannot tell the two apart. Listen to that recording yourself, and rule.

**To settle a recording heard both ways, or to overrule the teachers,** listen yourself on the
same page, send yourself the file, and pass your name as a ruling:

    pnpm islenskubraut:yfirferd yfirferd-islenskubraut-* --urskurdur "Siggi" --apply

The name must be on the files of exactly one browser among those passed (any name that browser's
files carry). A ruler's verdict decides the recording whatever the others say, and the report lists
every verdict it overrules, on every run, so none is lost. **The record keeps who rules,** so the
ruling lasts on later runs without `--urskurdur`, and so do the ruler's later verdicts. Of several
rulings on a recording the latest decides, so a ruler who changes their mind, on another browser or
after `Hreinsa allt`, rules again: pass the new browser's file alone with `--urskurdur`, since a
name the files of two browsers carry is refused, even when one of them already rules (the other
could be a colleague of the same name). Only two rulings given at the same moment that disagree
leave a recording `false`. The report ends with who rules, by the hash `mat.json` keeps; to stop
someone ruling, delete their hash from `rulers` there and run `--apply`.

**After a git merge or rebase that touched these files, run `pnpm islenskubraut:yfirferd --apply`**
with no files. If git left a conflict in `mat.json`, `hljod.yaml` or `stada.json`, it merges each
again from git's three versions of it, recording by recording: the record takes every verdict from
both sides, a ruler one side removed stays removed, and a recording only one side changed takes
that side. One both sides changed differently goes back to `false`, and the report lists it. Every
value the record decides is then worked out again, and the build regenerates the app's data, a
conflicted `hljod.ts` or `hlustun.ts` included. Then `git add` the files and commit, or
`git rebase --continue`.

To listen without the site:

    pnpm islenskubraut:hljod

This writes `islenskubraut-hljod-yfirlit.html` in the repository root: every text with its
recording, sorted so the doubtful ones come first. Open it in a browser, listen, and write `true`
or `rangt` in `hljod.yaml` beside each one. Then run `pnpm islenskubraut:hljod --record` and
`pnpm islenskubraut:build`. This works only for a recording nobody has given a verdict on as it is
now: for the others the build refuses the edit, and a ruling on the listening page is the way.

Both pages are sorted by a speech recogniser's reading, from `hlustun.json` here (see below). It
transcribed each recording back, and the pages show what it heard. A high score means the
recogniser heard something else. That is not proof the recording is wrong, but listen to those
first. A reading of audio since replaced is not shown. On 2026-10-16 the median score was 0, and
eight of 524 scored over 20 %, which is where the listening page draws the line:

- `les` (heard `e`)
- `gogg` and `goggur` (heard `gok` and `bokur`)
- `úr ull` (heard `sú rull`) and `reglustika` (heard `reglu slíka`)
- `feld`, `húfa` and `oddhvasst`

**If a recording is wrong,** delete its file from `apps/islenskubraut/public/hljod/` and make it
again (below); `--record` then sets it back to `false`, to be heard afresh.
`pnpm islenskubraut:hljod` lists every `rangt` one. A word the voice keeps saying wrongly can be
spelt for the voice in the job file, or recorded by a person under the same file name.

## After the cards change

A text that changes needs a new recording; the file name is a hash of the text, so the old one
simply stops being used. A text with no recording has no play button, so the build does not stop
for one. It does stop if a recording marked `true` has no file, or `stada.json` is out of date.

    pnpm islenskubraut:hljod --jobs     # write hljod-verk.json: the texts with no recording,
                                        #   and the recordings the recogniser has not heard
    python scripts/islenskubraut/hljod/talgerving.py hljod-verk.json   # makes the missing ones
    pnpm islenskubraut:hljod --record   # list the new recordings as false; record what changed
    pnpm islenskubraut:build

`talgerving.py` needs Python with the voice installed. Do this once, in a folder outside the
repository:

    uv venv -p 3.10 rodd && . rodd/bin/activate
    python -m ensurepip && pip install "pip<24.1" setuptools wheel
    pip install --index-url https://download.pytorch.org/whl/cpu torch==2.5.1 torchaudio==2.5.1
    pip install fairseq==0.12.2 ice-g2p && fetch-models
    pip install --no-build-isolation parallel_wavegan
    pip install espnet kaldiio soundfile huggingface_hub "scipy<1.13"

It also needs `ffmpeg` for the MP3s. The versions are pinned because the tools are old:

- **Python 3.10:** fairseq 0.12 does not build on newer Pythons.
- **`pip<24.1`:** fairseq's `omegaconf` has metadata that newer pips refuse.
- **`scipy<1.13`:** the vocoder imports a function that SciPy 1.13 removed.

The voice downloads itself from Hugging Face on the first run. The first 431 recordings took under five
minutes on a laptop-class CPU.

To sort the review pages by the recogniser's reading, run this in the same environment:

    pip install "transformers<4.50"
    python scripts/islenskubraut/hljod/hlustun.py hljod-verk.json content/islenskubraut/hljod/hlustun.json
    pnpm islenskubraut:build

It merges the new readings into `hlustun.json`, keeping every earlier one, and writes the file
only when it has finished. `hlustun.json` is committed, since the listening page on the site reads
it through the build.

It uses Reykjavík University's wav2vec2 recogniser (`wav2vec2-large-xlsr-53-icelandic-ep30-967h`,
CC BY 4.0). It is a first pass for a person, not a replacement for one.

## Not yet

The research also proposed a QR code on each printed card, linking to its page. That waits until
some recordings are approved: until then the page it leads to plays nothing.
