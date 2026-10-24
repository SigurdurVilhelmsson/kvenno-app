/**
 * Signed-in requests for the server tests.
 *
 * The Claude endpoints take only a Microsoft ID token that verifies against the tenant's keys
 * (`src/lib/auth.ts`). Here the keys are a local RSA pair, and `idToken` signs tokens with it, so
 * the tests exercise the real check rather than a bypass.
 */
import { generateKeyPairSync, sign } from 'node:crypto';

import { setKeySource } from '../lib/auth.js';

export const TENANT = '11111111-2222-3333-4444-555555555555';
export const CLIENT = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
export const KID = 'test-key';

const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const jwk = publicKey.export({ format: 'jwk' });

/** Point the server at the test tenant, app and keys. */
export function useTestKeys(): void {
  process.env.AZURE_TENANT_ID = TENANT;
  process.env.AZURE_CLIENT_ID = CLIENT;
  setKeySource(async () => [{ kty: 'RSA', n: jwk.n, e: jwk.e, kid: KID, use: 'sig' }]);
}

const segment = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url');

/** A signed ID token; `claims` and `header` override the valid defaults. */
export function idToken(
  claims: Record<string, unknown> = {},
  header: Record<string, unknown> = {},
  key = privateKey
): string {
  const now = Math.floor(Date.now() / 1000);
  const head = segment({ alg: 'RS256', typ: 'JWT', kid: KID, ...header });
  const body = segment({
    aud: CLIENT,
    iss: `https://login.microsoftonline.com/${TENANT}/v2.0`,
    tid: TENANT,
    iat: now,
    nbf: now - 60,
    exp: now + 3600,
    oid: '99999999-0000-0000-0000-000000000000',
    name: 'Kennari Prófsson',
    ...claims,
  });
  const signature = sign('RSA-SHA256', Buffer.from(`${head}.${body}`), key).toString('base64url');
  return `${head}.${body}.${signature}`;
}

/** The Authorization header of a signed-in teacher. */
export const bearer = (): string => `Bearer ${idToken()}`;
