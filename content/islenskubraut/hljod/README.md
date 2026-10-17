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

**A student hears only the ones marked `true`.** A `rangt` one is never approved from a review
file, however many teachers later hear it as right, until it has been made again (below). Add `?drog` to a card page's address, for
example `/islenskubraut/spjald/dyr?drog`, to hear the rest. Whenever any recording plays, the card
page credits the voice, as its licence requires.

## Listening

**Teachers listen on the site**, at `/islenskubraut/yfirferd/hljod` (nothing links to it but the
review page, `/islenskubraut/yfirferd`). Every recording plays there, drafts included, with `Rétt`
and `Rangt` beside it and a box for what is wrong. The page keeps the marks in the teacher's
browser, and they press `Sækja skrá` and send the file back. Save the files in the repository
root, where they are gitignored (they carry teachers' names), and keep every one. Then:

    pnpm islenskubraut:yfirferd yfirferd-islenskubraut-*.json           # read what they say
    pnpm islenskubraut:yfirferd yfirferd-islenskubraut-*.json --apply   # write the verdicts
    pnpm islenskubraut:build

`--apply` changes `hljod.yaml` only:

- `true` beside each recording someone heard as right and nobody as wrong;
- `rangt` beside each one someone heard as wrong and nobody as right, so that a later run cannot
  approve it on another teacher's word;
- `rangt` beside an approved one that someone now hears as wrong, which the report lists first,
  since students hear it until then.

One heard both ways, and one marked `rangt` before but now heard as right, are listed for a
person to settle, as is every note. A teacher's later file replaces what their earlier one said.
Each verdict is tied to the audio it was given to, so after a recording is made again the old
verdicts on it are reported and ignored, and the page asks the teacher to listen again.

To listen without the site:

    pnpm islenskubraut:hljod

This writes `islenskubraut-hljod-yfirlit.html` in the repository root: every text with its
recording, sorted so the doubtful ones come first. Open it in a browser, listen, and write `true`
in `hljod.yaml` beside each one that is right. Then run `pnpm islenskubraut:build`.

Both pages are sorted by a speech recogniser's reading, from `hlustun.json` here (see below). It
transcribed each recording back, and the pages show what it heard. A high score means the
recogniser heard something else. That is not proof the recording is wrong, but listen to those
first. On 2026-10-16 the median score was 0, and eight of 524 scored over 20 %, which is where
the listening page draws the line:

- `les` (heard `e`)
- `gogg` and `goggur` (heard `gok` and `bokur`)
- `úr ull` (heard `sú rull`) and `reglustika` (heard `reglu slíka`)
- `feld`, `húfa` and `oddhvasst`

**If a recording is wrong,** delete its file from `apps/islenskubraut/public/hljod/` and make it
again (below), then change its `rangt` to `false` in `hljod.yaml` so it can be heard and approved
afresh; `pnpm islenskubraut:hljod` lists every `rangt` one. A word the voice keeps saying wrongly
can be spelt for the voice in the job file, or recorded by a person under the same file name.

## After the cards change

A text that changes needs a new recording; the file name is a hash of the text, so the old one
simply stops being used. A text with no recording has no play button, so the build does not stop
for one. It does stop if a recording marked `true` has no file.

    pnpm islenskubraut:hljod --jobs     # write hljod-verk.json: the texts with no recording
    python scripts/islenskubraut/hljod/talgerving.py hljod-verk.json
    pnpm islenskubraut:hljod --record   # list the new recordings in hljod.yaml, as false
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
