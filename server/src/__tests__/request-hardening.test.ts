/**
 * Two defences for the endpoints anyone on the internet can reach:
 *
 * 1. A compressed request body is refused before anything decodes it. Express 5's
 *    parsers inflate `Content-Encoding: br` by default, which put Node's Brotli
 *    decoder — CVE-2026-111497, an out-of-bounds write — in reach of any client.
 * 2. LibreOffice and pandoc, which read uploaded documents, run without the
 *    server's environment, so the Claude API key is not inherited by them.
 */

import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import { brotliCompressSync, deflateSync, gzipSync } from 'node:zlib';
import request from 'supertest';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { bearer, useTestKeys } from './test-auth.js';

type Call = {
  file: string;
  args: string[];
  options: { env?: NodeJS.ProcessEnv; timeout?: number };
};
const calls: Call[] = [];

vi.mock('child_process', async (importOriginal) => {
  const actual = await importOriginal<typeof import('child_process')>();
  const run = async (file: string, args: string[], options: Call['options'] = {}) => {
    calls.push({ file, args, options });
    if (file === 'libreoffice' && args.includes('--convert-to')) {
      const outDir = args[args.indexOf('--outdir') + 1];
      const docx = args[args.length - 1];
      await writeFile(path.join(outDir, `${path.basename(docx, '.docx')}.pdf`), '%PDF-1.4 test');
    }
    return { stdout: file === 'pandoc' ? 'Jafna $x^2$' : '', stderr: '' };
  };
  const execFile = Object.assign(
    () => {
      throw new Error('only the promisified form is used');
    },
    { [promisify.custom]: run }
  );
  return { ...actual, execFile };
});

process.env.CLAUDE_API_KEY = 'sk-ant-test-must-not-reach-converters';
// The Claude endpoints take a signed-in teacher's ID token (src/lib/auth.ts).
useTestKeys();
const { app } = await import('../index.js');

// supertest serialises a Buffer sent as JSON into {"type":"Buffer",...}; these
// tests need the bytes on the wire exactly as given.
const asIs = (body: unknown) => body as string;

describe('compressed request bodies', () => {
  // Decoded and parsed, this body fails validation with a 400 that names the
  // field, which is how the test tells "refused" from "decoded".
  const json = Buffer.from(JSON.stringify({ systemPrompt: 5, userPrompt: 'x' }));
  const cases: Array<[string, Buffer]> = [
    ['br', brotliCompressSync(json)],
    ['BR', brotliCompressSync(json)],
    ['gzip', gzipSync(json)],
    ['deflate', deflateSync(json)],
  ];

  for (const [encoding, body] of cases) {
    it(`refuses Content-Encoding: ${encoding} with 415, without decoding it`, async () => {
      const res = await request(app)
        .post('/api/analyze-2ar')
        .set('Authorization', bearer())
        .set('Origin', 'https://kvenno.app')
        .set('Content-Type', 'application/json')
        .set('Content-Encoding', encoding)
        .serialize(asIs)
        .send(body);

      expect(res.status).toBe(415);
      expect(res.body.error).not.toMatch(/systemPrompt/);
    });
  }

  it('refuses a compressed urlencoded body too', async () => {
    const res = await request(app)
      .post('/api/analyze-2ar')
      .set('Authorization', bearer())
      .set('Origin', 'https://kvenno.app')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .set('Content-Encoding', 'br')
      .serialize(asIs)
      .send(brotliCompressSync(Buffer.from('systemPrompt=a')));

    expect(res.status).toBe(415);
  });

  it('still reads an uncompressed body, with or without Content-Encoding: identity', async () => {
    for (const encoding of [undefined, 'identity']) {
      const req = request(app)
        .post('/api/analyze-2ar')
        .set('Authorization', bearer())
        .set('Origin', 'https://kvenno.app')
        .set('Content-Type', 'application/json');
      if (encoding) req.set('Content-Encoding', encoding);
      const res = await req.serialize(asIs).send(json);

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid systemPrompt');
    }
  });
});

describe('document converters', () => {
  beforeEach(() => {
    calls.length = 0;
  });

  it('run without the API key in their environment, and pandoc has a timeout', async () => {
    const res = await request(app)
      .post('/api/process-document')
      .set('Authorization', bearer())
      .set('Origin', 'https://kvenno.app')
      .attach('file', Buffer.from('not really a docx'), { filename: 'skyrsla.docx' });

    expect(res.status).toBe(200);
    expect(res.body.type).toBe('converted-pdf');

    const converters = calls.filter((c) => c.file === 'libreoffice' || c.file === 'pandoc');
    expect(converters.map((c) => c.file).sort()).toEqual([
      'libreoffice',
      'libreoffice',
      'pandoc',
      'pandoc',
    ]);
    for (const call of converters) {
      expect(call.options.env).toBeDefined();
      expect(call.options.env).not.toHaveProperty('CLAUDE_API_KEY');
      expect(call.options.env).not.toHaveProperty('ANTHROPIC_API_KEY');
      expect(call.options.env?.PATH).toBe(process.env.PATH);
    }
    const pandocConvert = converters.find(
      (c) => c.file === 'pandoc' && c.args.includes('--from=docx')
    );
    expect(pandocConvert?.options.timeout).toBeGreaterThan(0);
  });
});
