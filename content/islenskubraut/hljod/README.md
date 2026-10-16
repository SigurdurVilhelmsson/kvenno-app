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
      hali: false       # not listened to yet, or wrong

**A student hears only the ones marked `true`.** Add `?drog` to a card page's address, for
example `/islenskubraut/spjald/dyr?drog`, to hear the rest. Whenever any recording plays, the card
page credits the voice, as its licence requires.

## Listening

    pnpm islenskubraut:hljod

This writes `islenskubraut-hljod-yfirlit.html` in the repository root: every text with its
recording, sorted so the doubtful ones come first. Open it in a browser, listen, and write `true`
in `hljod.yaml` beside each one that is right. Then run `pnpm islenskubraut:build`.

The page is sorted by a speech recogniser's reading, where one has been run (see below). It
transcribed each recording back, and the page shows what it heard. A high score means the
recogniser heard something else. That is not proof the recording is wrong, but listen to those
first. On the first run (2026-10-16) the median score was 0, and seven of 431 scored over 20 %:

- `les` (heard `e`)
- `gogg` and `goggur` (heard `gok` and `bokur`)
- `úr ull` (heard `sú rull`)
- `feld`, `húfa` and `oddhvasst`

**If a recording is wrong,** delete its file from `apps/islenskubraut/public/hljod/` and make it
again (below). A word the voice keeps saying wrongly can be spelt for the voice in the job file,
or recorded by a person under the same file name.

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

The voice downloads itself from Hugging Face on the first run. All 431 recordings took under five
minutes on a laptop-class CPU.

To sort the review page by the recogniser's reading, run this in the same environment:

    pip install "transformers<4.50"
    python scripts/islenskubraut/hljod/hlustun.py hljod-verk.json > hljod-hlustun.json

It uses Reykjavík University's wav2vec2 recogniser (`wav2vec2-large-xlsr-53-icelandic-ep30-967h`,
CC BY 4.0). It is a first pass for a person, not a replacement for one.

## Not yet

The research also proposed a QR code on each printed card, linking to its page. That waits until
some recordings are approved: until then the page it leads to plays nothing.
