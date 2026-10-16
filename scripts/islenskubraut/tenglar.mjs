/**
 * Fleiri úrræði: the links out from each card page (docs/research/islenskubraut-additions/,
 * item 1). `content/islenskubraut/tenglar/tenglar.yaml` is the source; this module validates it and
 * resolves each link to an address per category.
 *
 * Pure: `build.mjs` and `tenglar-check.mjs` do the reading and fetching, and the tests drive this
 * with small fixtures.
 */
import { LEVELS } from './load.mjs';
import { findInvisible, isFlattened } from './text.mjs';

export const AUDIENCES = ['nemendur', 'kennarar'];

function assert(condition, message) {
  if (!condition) throw new Error(`tenglar.yaml: ${message}`);
}

function checkText(value, where) {
  assert(typeof value === 'string' && value.trim() !== '', `${where} must be text`);
  const invisible = findInvisible(value);
  assert(invisible.length === 0, `${where} contains ${invisible.join(', ')}`);
  assert(!isFlattened(value), `${where} looks ASCII-flattened — "${value}"`);
}

function checkUrl(value, where) {
  let url;
  try {
    url = new URL(value);
  } catch {
    assert(false, `${where} is not an address: ${value}`);
  }
  assert(url.protocol === 'https:', `${where} must be https: ${value}`);
}

/**
 * The parsed YAML, validated against the categories that exist. Each link comes back with
 * `urls`, its address for every category it applies to.
 */
export function readTenglar(raw, categoryIds) {
  assert(raw && Array.isArray(raw.links), 'must have a `links` list');
  const seen = new Set();
  return raw.links.map((link, i) => {
    const where = `links[${i}]${link?.id ? ` (${link.id})` : ''}`;
    assert(link && typeof link === 'object' && !Array.isArray(link), `${where} must be a map`);
    const { id, name, description, audience, levels, url, approved = false, ...rest } = link;
    assert(Object.keys(rest).length === 0, `${where} has unknown keys: ${Object.keys(rest)}`);
    assert(typeof id === 'string' && /^[a-z0-9-]+$/.test(id), `${where}.id must be a-z, 0-9, -`);
    assert(!seen.has(id), `${where}.id is used twice`);
    seen.add(id);
    checkText(name, `${where}.name`);
    checkText(description, `${where}.description`);
    assert(AUDIENCES.includes(audience), `${where}.audience must be ${AUDIENCES.join(' or ')}`);
    assert(
      Array.isArray(levels) && levels.length > 0 && levels.every((l) => LEVELS.includes(l)),
      `${where}.levels must list ${LEVELS.join(', ')}`
    );
    assert(new Set(levels).size === levels.length, `${where}.levels repeats a level`);
    assert(typeof approved === 'boolean', `${where}.approved must be true or false`);

    let urls;
    if (typeof url === 'string') {
      checkUrl(url, `${where}.url`);
      urls = Object.fromEntries(categoryIds.map((c) => [c, url]));
    } else {
      assert(url && typeof url === 'object', `${where}.url must be an address or a map`);
      for (const [c, u] of Object.entries(url)) {
        assert(categoryIds.includes(c), `${where}.url names no category: ${c}`);
        checkUrl(u, `${where}.url.${c}`);
      }
      assert(Object.keys(url).length > 0, `${where}.url names no category`);
      urls = Object.fromEntries(categoryIds.filter((c) => c in url).map((c) => [c, url[c]]));
    }
    return {
      id,
      name: name.trim(),
      description: description.trim(),
      audience,
      levels: LEVELS.filter((l) => levels.includes(l)),
      urls,
      approved,
    };
  });
}

/** Every distinct address, with the links that use it, for checking that each still answers. */
export function addresses(tenglar) {
  const byUrl = new Map();
  for (const t of tenglar) {
    for (const u of Object.values(t.urls)) {
      byUrl.set(u, [...new Set([...(byUrl.get(u) ?? []), t.id])]);
    }
  }
  return [...byUrl].map(([url, ids]) => ({ url, ids }));
}

/**
 * Whether an address answers. The part after `#` is not sent, so for Bildetema this checks the
 * site, not the theme; the themes were checked in a browser when they were added.
 */
export async function checkAddress(url, fetchImpl = fetch) {
  try {
    const res = await fetchImpl(url, {
      redirect: 'follow',
      // Some of these sites (memm.mms.is) refuse a request that does not look like a browser.
      headers: { 'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) kvenno.app link check' },
    });
    return { ok: res.status >= 200 && res.status < 300, status: res.status };
  } catch (err) {
    return { ok: false, status: err.cause?.code ?? err.message };
  }
}
