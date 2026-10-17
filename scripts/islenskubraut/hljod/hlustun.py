"""Listen back to every clip with an Icelandic speech recogniser, as a first check before a person.

    python scripts/islenskubraut/hljod/hlustun.py hljod-verk.json content/islenskubraut/hljod/hlustun.json

It merges into the file named, keeping every reading of a clip it was not given, and records the
version of the audio it heard (`v`, as `clipVersion` in hljod.mjs), so a reading of a recording
since made again is ignored. For each job whose clip exists, it transcribes the clip and compares it with what the voice was told
to say: the share of its letters that differ from the closest stretch of what was heard (0 is a
perfect match). Only the closest stretch counts, because the recogniser often hears a word that is
not there before a single word (`og hart` for `hart`). A high rate does not prove the clip is
wrong, nor a low one that it is right: it orders the review so a person hears the doubtful
ones first. The listening page (`/islenskubraut/yfirferd/hljod`) and `pnpm islenskubraut:hljod`
show what was heard beside each clip and put the doubtful ones first.

The recogniser is wav2vec2-large-xlsr-53-icelandic-ep30-967h (Reykjavík University's Language and
Voice Lab, CC BY 4.0).
"""
import hashlib
import json
import os
import re
import subprocess
import sys

import numpy as np
import torch
from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor

MODEL = 'language-and-voice-lab/wav2vec2-large-xlsr-53-icelandic-ep30-967h'
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..'))
CLIPS = os.path.join(ROOT, 'apps/islenskubraut/public/hljod')


def letters(text):
    return re.sub(r'\s+', ' ', re.sub(r'[^a-záðéíóúýþæö ]', ' ', text.lower())).strip()


def distance(said, heard):
    """Edits from `said` to the closest stretch of `heard`: words heard around it cost nothing."""
    row = [0] * (len(heard) + 1)
    for i, ca in enumerate(said, 1):
        prev, row[0] = row[0], i
        for j, cb in enumerate(heard, 1):
            prev, row[j] = row[j], min(row[j] + 1, row[j - 1] + 1, prev + (ca != cb))
    return min(row)


def load(path):
    raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', path, '-ac', '1', '-ar', '16000',
                          '-f', 'f32le', '-'], check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32)


def main(jobs_file, out_file):
    """Transcribe the jobs' clips and merge them into `out_file`, keeping every other entry.

    The job file lists only clips made since the last `--jobs`, so writing it alone would drop
    every earlier reading. The file is written once, at the end, through a temporary file, so a
    run that fails partway leaves it as it was.
    """
    with open(jobs_file, encoding='utf-8') as f:
        jobs = json.load(f)
    out = {}
    if os.path.exists(out_file):
        with open(out_file, encoding='utf-8') as f:
            out = json.load(f)
    todo = [job for job in jobs if os.path.exists(os.path.join(CLIPS, job['file']))]
    if todo:
        processor = Wav2Vec2Processor.from_pretrained(MODEL)
        model = Wav2Vec2ForCTC.from_pretrained(MODEL).eval()
    for job in todo:
        path = os.path.join(CLIPS, job['file'])
        inputs = processor(load(path), sampling_rate=16000, return_tensors='pt')
        with torch.no_grad():
            ids = model(inputs.input_values).logits.argmax(dim=-1)
        heard = letters(processor.batch_decode(ids)[0])
        said = letters(job['say'])
        with open(path, 'rb') as f:
            version = hashlib.sha256(f.read()).hexdigest()[:12]
        out[job['text']] = {
            'heard': heard,
            'score': round(distance(said, heard) / max(1, len(said)), 3),
            # The audio heard, as clipVersion in hljod.mjs: a reading of other audio is ignored.
            'v': version,
        }
    tmp = f'{out_file}.tmp'
    with open(tmp, 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
        f.write('\n')
    os.replace(tmp, out_file)
    print(f'{len(todo)} clip(s) transcribed, {len(out)} reading(s) in {out_file}', file=sys.stderr)


if __name__ == '__main__':
    if len(sys.argv) != 3:
        sys.exit('usage: python hlustun.py hljod-verk.json content/islenskubraut/hljod/hlustun.json')
    main(sys.argv[1], sys.argv[2])
