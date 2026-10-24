/**
 * Who may use the Claude endpoints: a person signed in to the school's Microsoft tenant.
 *
 * Until 2026-10-24 `/api/analyze`, `/api/analyze-2ar` and `/api/process-document` accepted anyone
 * who sent `Origin: https://kvenno.app`, a header any script can set, so the Claude key behind them
 * was an open proxy limited only by the rate limiter (`docs/REVIEW-QUEUE.md` D4). The lab-reports
 * front end already signs every user in with MSAL before it shows anything; it now sends that
 * sign-in's ID token, and this checks it.
 *
 * The check is the standard one for an ID token from the Microsoft identity platform (v2.0):
 * - the signature, RS256 only, against the keys the tenant publishes at its JWKS address;
 * - `aud` is this app's client ID, so a token issued to another app does not pass;
 * - `iss` and `tid` are this tenant, so a token from another organisation does not pass;
 * - `exp` and `nbf`, with five minutes' allowance for clock drift.
 *
 * No library: Node's `crypto` verifies RS256 against a JWK directly, and adding a dependency
 * needs the lockfile regenerated, which the session that wrote this could not do.
 */

import { createPublicKey, verify, type KeyObject } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

/** Clock drift allowed on `exp` and `nbf`, in seconds. */
const CLOCK_SKEW_S = 5 * 60;
/** How long fetched keys are trusted before they are fetched again. */
const KEYS_TTL_MS = 24 * 60 * 60 * 1000;
/** The least time between two fetches, so a stream of tokens with made-up key ids cannot make the
 *  server hammer Microsoft. */
const MIN_REFETCH_MS = 60 * 1000;

interface Jwk {
  kid?: string;
  kty?: string;
  use?: string;
  n?: string;
  e?: string;
}

/** Where the signing keys for a key id come from. Tests replace it with a local key pair. */
export type KeySource = (tenantId: string) => Promise<Jwk[]>;

const microsoftKeys: KeySource = async (tenantId) => {
  const url = `https://login.microsoftonline.com/${encodeURIComponent(tenantId)}/discovery/v2.0/keys`;
  const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
  if (!response.ok) throw new Error(`JWKS fetch failed: ${response.status}`);
  const body = (await response.json()) as { keys?: Jwk[] };
  return Array.isArray(body.keys) ? body.keys : [];
};

let keySource: KeySource = microsoftKeys;
let cache: { tenantId: string; keys: Map<string, KeyObject>; fetchedAt: number } | null = null;

/** For tests: where keys come from, and a clear cache. */
export function setKeySource(source: KeySource | null): void {
  keySource = source ?? microsoftKeys;
  cache = null;
}

async function keyFor(tenantId: string, kid: string): Promise<KeyObject | undefined> {
  const now = Date.now();
  const fresh = cache && cache.tenantId === tenantId && now - cache.fetchedAt < KEYS_TTL_MS;
  if (fresh && cache!.keys.has(kid)) return cache!.keys.get(kid);
  // A key id not yet seen may be a rotated key: fetch again, but not more than once a minute.
  if (fresh && now - cache!.fetchedAt < MIN_REFETCH_MS) return undefined;
  const keys = new Map<string, KeyObject>();
  for (const jwk of await keySource(tenantId)) {
    if (!jwk.kid || jwk.kty !== 'RSA' || !jwk.n || !jwk.e) continue;
    if (jwk.use && jwk.use !== 'sig') continue;
    keys.set(jwk.kid, createPublicKey({ key: { kty: 'RSA', n: jwk.n, e: jwk.e }, format: 'jwk' }));
  }
  cache = { tenantId, keys, fetchedAt: now };
  return keys.get(kid);
}

function decodeSegment(segment: string): Record<string, unknown> {
  const parsed: unknown = JSON.parse(Buffer.from(segment, 'base64url').toString('utf8'));
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('not an object');
  }
  return parsed as Record<string, unknown>;
}

export interface AuthConfig {
  tenantId: string;
  clientId: string;
}

/** The claims of a token that passed. */
export interface VerifiedUser {
  oid?: string;
  name?: string;
  preferredUsername?: string;
}

/**
 * Verify a Microsoft ID token. Returns the user, or `null` for any token that does not pass;
 * it never says why, to the caller or in a log, since the reason helps only someone forging one.
 */
export async function verifyIdToken(
  token: string,
  config: AuthConfig,
  nowS: number = Math.floor(Date.now() / 1000)
): Promise<VerifiedUser | null> {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [headerPart, payloadPart, signaturePart] = parts;
  let header: Record<string, unknown>;
  let claims: Record<string, unknown>;
  try {
    header = decodeSegment(headerPart);
    claims = decodeSegment(payloadPart);
  } catch {
    return null;
  }

  // RS256 only: `none`, and HS256 signed with the public key as a secret, are the classic forgeries.
  if (header.alg !== 'RS256' || typeof header.kid !== 'string') return null;

  let key: KeyObject | undefined;
  try {
    key = await keyFor(config.tenantId, header.kid);
  } catch (error) {
    console.error('[auth] Could not fetch the signing keys:', error);
    return null;
  }
  if (!key) return null;

  const signed = Buffer.from(`${headerPart}.${payloadPart}`);
  const signature = Buffer.from(signaturePart, 'base64url');
  try {
    if (!verify('RSA-SHA256', signed, key, signature)) return null;
  } catch {
    return null;
  }

  const issuer = `https://login.microsoftonline.com/${config.tenantId}/v2.0`;
  if (claims.aud !== config.clientId) return null;
  if (claims.iss !== issuer || claims.tid !== config.tenantId) return null;
  if (typeof claims.exp !== 'number' || claims.exp + CLOCK_SKEW_S < nowS) return null;
  if (typeof claims.nbf === 'number' && claims.nbf - CLOCK_SKEW_S > nowS) return null;

  return {
    oid: typeof claims.oid === 'string' ? claims.oid : undefined,
    name: typeof claims.name === 'string' ? claims.name : undefined,
    preferredUsername:
      typeof claims.preferred_username === 'string' ? claims.preferred_username : undefined,
  };
}

/** The tenant and app from the environment (`server/.env`), or `null` while either is unset. */
function configFromEnv(): AuthConfig | null {
  const tenantId = process.env.AZURE_TENANT_ID?.trim();
  const clientId = process.env.AZURE_CLIENT_ID?.trim();
  return tenantId && clientId ? { tenantId, clientId } : null;
}

/**
 * Express middleware: a request goes on only with `Authorization: Bearer <ID token>` that passes.
 *
 * **It fails closed.** With `AZURE_TENANT_ID` or `AZURE_CLIENT_ID` unset it refuses every request
 * (503), so a deploy that forgets them leaves the key shut, not open. `AUTH_DISABLED=true` lets
 * every request through for local work with `VITE_BYPASS_AUTH`, and is ignored when
 * `NODE_ENV=production`.
 */
export async function requireLogin(req: Request, res: Response, next: NextFunction) {
  if (process.env.AUTH_DISABLED === 'true' && process.env.NODE_ENV !== 'production') {
    return next();
  }
  const config = configFromEnv();
  if (!config) {
    console.error('[auth] AZURE_TENANT_ID and AZURE_CLIENT_ID must be set in server/.env');
    return res.status(503).json({ error: 'Innskráning er ekki stillt á þjóninum' });
  }
  const match = /^Bearer\s+(\S+)$/i.exec(req.headers.authorization ?? '');
  const user = match ? await verifyIdToken(match[1], config) : null;
  if (!user) {
    return res.status(401).json({ error: 'Innskráning þarf — skráðu þig inn aftur' });
  }
  res.locals.user = user;
  next();
}
