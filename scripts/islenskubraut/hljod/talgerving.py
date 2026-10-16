"""Say the cards' texts with an Icelandic voice: one MP3 per text, into public/hljod/.

    python scripts/islenskubraut/hljod/talgerving.py hljod-verk.json

`hljod-verk.json` comes from `pnpm islenskubraut:hljod --jobs`: each job is the text as printed,
what to say (`say`, with a slash read as a list and a blank as a pause) and the file to write.
Setting up the voice once is in content/islenskubraut/hljod/README.md.

The voice is Talrómur C, FastSpeech2 (Reykjavík University's Language and Voice Lab, CC BY 4.0),
with the Talrómur 1+2 Style MelGAN vocoder (Apache 2.0). It reads phonemes, not letters: ice-g2p
(Grammatek, Apache 2.0) turns each word into them, from its pronunciation dictionary where the word
is there and its model where it is not.
"""
import json
import os
import re
import subprocess
import sys
import tempfile

import kaldiio
import soundfile
import torch
from espnet2.bin.tts_inference import Text2Speech
from huggingface_hub import snapshot_download
from ice_g2p.transcriber import Transcriber

VOICE = 'language-and-voice-lab/talromur_c_loudnorm_xvector_finetune_fastspeech2'
VOCODER = 'language-and-voice-lab/talromur_1and2_style_melgan'
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..'))
OUT = os.path.join(ROOT, 'apps/islenskubraut/public/hljod')

# A word is Icelandic letters; a comma, full stop, question mark or ellipsis is a pause.
TOKEN = re.compile(r"[a-záðéíóúýþæö]+|[,.?!…]")


def phonemes(g2p, text):
    """The voice's input for a text: each word's phonemes, `sil` at each pause and at the end."""
    out = []
    for token in TOKEN.findall(text.lower()):
        if token in ',.?!…':
            if out and out[-1] != 'sil':
                out.append('sil')
        else:
            out.append(g2p.transcribe(token))
    if not out or out[-1] != 'sil':
        out.append('sil')
    return ' '.join(out)


def load_voice():
    voice = snapshot_download(VOICE)
    vocoder = snapshot_download(VOCODER)
    exp = os.path.join(voice, 'exp/tts_finetune_c_loudnorm_xvector_fastspeech2')
    here = os.getcwd()
    os.chdir(voice)  # the config names its statistics files relative to the recipe
    try:
        tts = Text2Speech(
            train_config=os.path.join(exp, 'config.yaml'),
            model_file=os.path.join(exp, 'valid.loss.ave_5best.pth'),
            vocoder_config=os.path.join(vocoder, 'config.yml'),
            vocoder_file=os.path.join(vocoder, 'checkpoint-1500000steps.pkl'),
            device='cpu',
        )
    finally:
        os.chdir(here)
    scp = os.path.join(voice, 'dump/xvector/train_c/spk_xvector.scp')
    with open(scp) as f:  # the paths in it are relative to the snapshot
        key, ark = f.readline().split()
    speaker = kaldiio.load_mat(os.path.join(voice, ark))
    return tts, torch.tensor(speaker, dtype=torch.float32)


def main(jobs_file):
    with open(jobs_file, encoding='utf-8') as f:
        jobs = json.load(f)
    os.makedirs(OUT, exist_ok=True)
    g2p = Transcriber(use_dict=True)
    tts, speaker = load_voice()
    for n, job in enumerate(jobs, 1):
        target = os.path.join(OUT, job['file'])
        if os.path.exists(target):
            continue
        phones = phonemes(g2p, job['say'])
        with torch.no_grad():
            wav = tts(phones, spembs=speaker)['wav'].numpy()
        with tempfile.NamedTemporaryFile(suffix='.wav') as tmp:
            soundfile.write(tmp.name, wav, tts.fs)
            # Mono MP3, a tenth of a second of quiet before so the first sound is not clipped.
            subprocess.run(
                ['ffmpeg', '-loglevel', 'error', '-y', '-i', tmp.name, '-af', 'adelay=100',
                 '-ac', '1', '-codec:a', 'libmp3lame', '-q:a', '5', target],
                check=True,
            )
        print(f'{n}/{len(jobs)} {job["text"]}  [{phones}]', flush=True)


if __name__ == '__main__':
    main(sys.argv[1])
