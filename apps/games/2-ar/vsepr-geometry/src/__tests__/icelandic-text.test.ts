import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

/**
 * Text this game shipped and a student read, scanned in its source so it
 * cannot come back. Comments are scanned too, so an explanation of a fix must
 * not quote the form it removed.
 *
 * Tests are not scanned: this file has to name what it bans.
 */

const SRC = join(__dirname, '..');

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === '__tests__' ? [] : sourceFiles(full);
    return /\.tsx?$/.test(entry.name) ? [full] : [];
  });
}

function offences(pattern: RegExp): string[] {
  const hits: string[] = [];
  for (const file of sourceFiles(SRC)) {
    readFileSync(file, 'utf8')
      .split('\n')
      .forEach((line, i) => {
        if (pattern.test(line)) hits.push(`${file.slice(SRC.length + 1)}:${i + 1}: ${line.trim()}`);
      });
  }
  return hits;
}

describe('vsepr-geometry text', () => {
  it('prints no angle with a decimal point', () => {
    // The decimal-comma pass (B9/B10): "109.5°" beside an answer field that
    // reads "109,5". Numbers computed at runtime go through formatDecimal.
    expect(offences(/\d\.\d+\s*°/)).toEqual([]);
  });

  it('spells rafeind- with its d', () => {
    // "Rafeinasvið", "rafeinalögun" and "rafeinapör" shipped at 60-odd sites,
    // beside "rafeindasvið" in the same menu.
    expect(offences(/rafeina(?!d)/i)).toEqual([]);
  });

  it.each([
    ['Syna visbendingu', /Syna visbendingu/],
    ['skatuaðar', /skatua/],
    ['ritháttður', /ritháttð/],
    ['miðsléttuhhorn', /sléttuhh/],
    ['Tengjahorn (corpus: tengihorn 40, tengjahorn 0)', /tengjahorn/i],
    ['English tool name', /Bond Angle Tool/],
    ['Brennisteinstvísýringur (corpus: brennisteinsdíoxíð 38, 0)', /tvísýring/i],
    ['Rafeindahrun (hrun is a collapse)', /Rafeindahrun/],
    ['Hrundur', /Hrundur/],
    ['Frávísunarkraftur (corpus: fráhrindikraftur)', /Frávísunarkraft/],
    ['orbital as breyta or braut (ordabok: orbital;svigrúm)', /atómbreyt|d-breyt|Atómbraut/i],
    ['Flókin sameindir', /Flókin sameindir/],
    ['í þessari samhengi', /þessari samhengi/],
    ['enginn nettó tvískautsvægi', /enginn nettó/],
    ['ósamhverft dreifing', /ósamhverft dreifing/],
    ['í einni slétti', /einni slétti\b/],
    ['tvöfald (not a form of tvöfaldur)', /\btvöfald\b/i],
    ['tvöfalt tengingar', /tvöfalt tengingar/],
    ['þríhyrnd sléttu lögun', /þríhyrnd sléttu lögun/],
    ['brennisteinið', /brennisteinið/],
    ['Þú vantar', /Þú vantar/],
    ['fasti efnið', /fasti efnið/],
    ['í þrívíð fjórflötungsröðun', /þrívíð fjórflöt/],
    ['Þrjú … dreifist', /dreifist jafnt/],
    ['ferningssléttu lögun', /ferningssléttu lögun/],
    ['Úr þríhyrnd sléttri', /þríhyrnd sléttri/],
    ['Algengar sameindarlögun', /Algengar sameindarlögun/],
    ['þríhyrnd slétta lögun (fyrir takes the accusative)', /þríhyrnd slétta/],
    ['vatn er … (og leysi) (a predicate takes the nominative)', /og leysi\)/],
  ])('does not ship %s', (_label, pattern) => {
    expect(offences(pattern)).toEqual([]);
  });
});
