/**
 * Two lines of `server/nginx-site.conf` that nothing else would notice going missing.
 *
 * - `server_tokens off`, so the Server header and error pages do not name nginx's version.
 * - The `/api/` location drops the backend's copies of the security headers nginx sets at
 *   server level. Passed through, every response carried each one twice, with
 *   X-Frame-Options both `DENY` and `SAMEORIGIN` (REVIEW-QUEUE D4, fixed 2026-10-24).
 */

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const conf = readFileSync(new URL('../../nginx-site.conf', import.meta.url), 'utf8');

/** The text of a `location` block, from its opening brace to the matching closing one. */
function block(opening: string): string {
  const start = conf.indexOf(opening);
  expect(start, opening).toBeGreaterThan(-1);
  let depth = 0;
  for (let i = conf.indexOf('{', start); i < conf.length; i++) {
    if (conf[i] === '{') depth++;
    if (conf[i] === '}' && --depth === 0) return conf.slice(start, i + 1);
  }
  throw new Error(`Unclosed block: ${opening}`);
}

/** The header names the HTTPS server block sets with `add_header` itself, not in a location. */
function serverLevelHeaders(): string[] {
  const https = block('# HTTPS configuration');
  let depth = 0;
  let own = '';
  for (const ch of https) {
    if (ch === '{') depth++;
    if (depth === 1) own += ch;
    if (ch === '}') depth--;
  }
  return [...own.matchAll(/^\s*add_header\s+([\w-]+)/gm)].map((m) => m[1]);
}

describe('server/nginx-site.conf', () => {
  it('hides the nginx version in both server blocks', () => {
    expect(conf.match(/^\s*server_tokens off;/gm)).toHaveLength(2);
  });

  it('lets one copy of each security header through on /api/', () => {
    const api = block('location /api/');
    expect(api).not.toMatch(/^\s*add_header/m);
    const hidden = [...api.matchAll(/proxy_hide_header\s+([\w-]+);/g)].map((m) => m[1]);
    const headers = serverLevelHeaders();
    expect(headers).toContain('X-Frame-Options');
    for (const name of headers.filter((h) => h !== 'Permissions-Policy')) {
      expect(hidden, name).toContain(name);
    }
  });
});
