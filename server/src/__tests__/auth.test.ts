/**
 * The Claude endpoints take only a signed-in teacher or student (`src/lib/auth.ts`).
 *
 * Until 2026-10-24 they took anyone who sent `Origin: https://kvenno.app`, so the Claude key was
 * an open proxy (`docs/REVIEW-QUEUE.md` D4). Each case below is a token that must not pass, or the
 * one that must.
 */
import { createHmac, generateKeyPairSync } from 'node:crypto';

import request from 'supertest';
import { afterEach, describe, expect, it } from 'vitest';

import { verifyIdToken } from '../lib/auth.js';
import { CLIENT, KID, TENANT, bearer, idToken, useTestKeys } from './test-auth.js';

process.env.CLAUDE_API_KEY = 'test-key-for-auth-tests';
useTestKeys();
const { app } = await import('../index.js');

const config = { tenantId: TENANT, clientId: CLIENT };
const now = Math.floor(Date.now() / 1000);
const segment = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url');

describe('verifyIdToken', () => {
  it('passes a token from the tenant, for this app, in date', async () => {
    expect(await verifyIdToken(idToken(), config)).toMatchObject({ name: 'Kennari Prófsson' });
  });

  it.each([
    ['issued to another app', { aud: 'some-other-app' }],
    ['from another tenant', { tid: 'other-tenant' }],
    ['with another issuer', { iss: 'https://login.microsoftonline.com/other/v2.0' }],
    ['expired more than five minutes ago', { exp: now - 6 * 60 }],
    ['not valid for another hour', { nbf: now + 3600 }],
    ['with no expiry', { exp: undefined }],
  ])('refuses a token %s', async (_why, claims) => {
    expect(await verifyIdToken(idToken(claims), config)).toBeNull();
  });

  it('allows five minutes of clock drift on expiry', async () => {
    expect(await verifyIdToken(idToken({ exp: now - 60 }), config)).not.toBeNull();
  });

  it('refuses a token signed with another key', async () => {
    const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
    expect(await verifyIdToken(idToken({}, {}, privateKey), config)).toBeNull();
  });

  it('refuses a key id the tenant does not publish', async () => {
    expect(await verifyIdToken(idToken({}, { kid: 'not-published' }), config)).toBeNull();
  });

  it('refuses alg none and HS256, the classic forgeries', async () => {
    const claims = segment({
      aud: CLIENT,
      iss: `https://login.microsoftonline.com/${TENANT}/v2.0`,
      tid: TENANT,
      exp: now + 3600,
    });
    const none = `${segment({ alg: 'none', kid: KID })}.${claims}.`;
    expect(await verifyIdToken(none, config)).toBeNull();
    const hsHead = segment({ alg: 'HS256', kid: KID });
    const hs = createHmac('sha256', 'any secret').update(`${hsHead}.${claims}`).digest('base64url');
    expect(await verifyIdToken(`${hsHead}.${claims}.${hs}`, config)).toBeNull();
  });

  it('refuses what is not a token at all', async () => {
    for (const junk of ['', 'abc', 'a.b.c', `${idToken().split('.').slice(0, 2).join('.')}.!!`]) {
      expect(await verifyIdToken(junk, config), junk).toBeNull();
    }
  });
});

describe('the Claude endpoints', () => {
  const endpoints = ['/api/analyze', '/api/analyze-2ar', '/api/process-document'];
  const savedTenant = process.env.AZURE_TENANT_ID;
  const savedNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.AZURE_TENANT_ID = savedTenant;
    // Assigning undefined would set the string "undefined".
    if (savedNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = savedNodeEnv;
    delete process.env.AUTH_DISABLED;
  });

  it.each(endpoints)('%s refuses a request with no token (401)', async (path) => {
    const res = await request(app).post(path).set('Origin', 'https://kvenno.app').send({});
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/Innskráning/);
  });

  it.each(endpoints)('%s refuses a forged token (401)', async (path) => {
    const res = await request(app)
      .post(path)
      .set('Origin', 'https://kvenno.app')
      .set('Authorization', `Bearer ${idToken({ aud: 'some-other-app' })}`)
      .send({});
    expect(res.status).toBe(401);
  });

  it('lets a signed-in request through to the endpoint itself', async () => {
    // An empty body passes the login check and is refused by the endpoint's own validation.
    const res = await request(app)
      .post('/api/analyze-2ar')
      .set('Origin', 'https://kvenno.app')
      .set('Authorization', bearer())
      .send({});
    expect(res.status).toBe(400);
  });

  it('fails closed when the tenant is not configured (503)', async () => {
    delete process.env.AZURE_TENANT_ID;
    const res = await request(app)
      .post('/api/analyze-2ar')
      .set('Origin', 'https://kvenno.app')
      .set('Authorization', bearer())
      .send({});
    expect(res.status).toBe(503);
  });

  it('ignores AUTH_DISABLED in production', async () => {
    process.env.AUTH_DISABLED = 'true';
    process.env.NODE_ENV = 'production';
    const res = await request(app)
      .post('/api/analyze-2ar')
      .set('Origin', 'https://kvenno.app')
      .send({});
    expect(res.status).toBe(401);
  });

  it('honours AUTH_DISABLED outside production, for local work', async () => {
    process.env.AUTH_DISABLED = 'true';
    process.env.NODE_ENV = 'development';
    const res = await request(app)
      .post('/api/analyze-2ar')
      .set('Origin', 'https://kvenno.app')
      .send({});
    expect(res.status).toBe(400);
  });

  it('leaves the teaching-card PDFs open: students download them without signing in', async () => {
    const res = await request(app).get('/api/islenskubraut/pdf');
    expect(res.status).toBe(400);
  });
});
