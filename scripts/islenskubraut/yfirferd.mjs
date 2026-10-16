/**
 * Teachers' reviews, as the review page sends them (`/islenskubraut/yfirferd`, "Sækja skrá"): a
 * note per item and a verdict per recording. This module reads one, sums several up, and works out
 * which recordings every reviewer heard as right, for `yfirferd-check.mjs --apply` to approve.
 *
 * Pure: the command does the reading and writing.
 */

export const FORMAT = 'islenskubraut-yfirferd/1';

function assert(condition, message) {
  if (!condition) throw new Error(`yfirferd: ${message}`);
}

/** One review file, checked. Returns `{ reviewer, date, notes, clips }`. */
export function readReview(raw, where = 'review') {
  assert(raw && typeof raw === 'object', `${where} is not a review file`);
  assert(raw.format === FORMAT, `${where} is not a ${FORMAT} file (format: ${raw.format})`);
  const reviewer = typeof raw.reviewer === 'string' ? raw.reviewer.trim() : '';
  const date = typeof raw.date === 'string' ? raw.date : '';
  assert(Array.isArray(raw.notes), `${where}: notes must be a list`);
  assert(Array.isArray(raw.clips), `${where}: clips must be a list`);
  const notes = raw.notes.map((n, i) => {
    assert(
      n && typeof n.key === 'string' && typeof n.text === 'string',
      `${where}: notes[${i}] needs a key and a text`
    );
    return { key: n.key, label: typeof n.label === 'string' ? n.label : n.key, text: n.text };
  });
  const clips = raw.clips.map((c, i) => {
    assert(c && typeof c.text === 'string', `${where}: clips[${i}] needs a text`);
    assert(
      c.verdict === 'right' || c.verdict === 'wrong',
      `${where}: clips[${i}].verdict must be right or wrong`
    );
    return { text: c.text, verdict: c.verdict, ...(c.note ? { note: String(c.note) } : {}) };
  });
  return { reviewer: reviewer || where, date, notes, clips };
}

/**
 * Which recordings may be approved from these reviews: every one some reviewer marked right and
 * none marked wrong, that is on the cards and not approved yet. A recording marked both ways is a
 * conflict for a person to settle, and one no longer on the cards is reported, not approved.
 */
export function approvals(reviews, manifest) {
  const verdicts = new Map();
  for (const r of reviews) {
    for (const c of r.clips) {
      if (!verdicts.has(c.text)) verdicts.set(c.text, []);
      verdicts.get(c.text).push({ reviewer: r.reviewer, verdict: c.verdict, note: c.note });
    }
  }
  const approve = [];
  const wrong = [];
  const conflicts = [];
  const unknown = [];
  const already = [];
  for (const [text, vs] of verdicts) {
    if (!manifest.clips.has(text)) {
      unknown.push(text);
      continue;
    }
    const right = vs.some((v) => v.verdict === 'right');
    const bad = vs.filter((v) => v.verdict === 'wrong');
    if (right && bad.length > 0) conflicts.push({ text, verdicts: vs });
    else if (bad.length > 0) wrong.push({ text, notes: bad.map((v) => v.note).filter(Boolean) });
    else if (manifest.clips.get(text)) already.push(text);
    else approve.push(text);
  }
  return { approve, wrong, conflicts, unknown, already };
}

/** Everything the reviews say, as text for a person: the notes by item, then the recordings. */
export function report(reviews, result) {
  const lines = [];
  lines.push(`${reviews.length} yfirferð(ir): ${reviews.map((r) => r.reviewer).join(', ')}`);
  const byItem = new Map();
  for (const r of reviews) {
    for (const n of r.notes) {
      if (!byItem.has(n.key)) byItem.set(n.key, { label: n.label, notes: [] });
      byItem.get(n.key).notes.push({ reviewer: r.reviewer, text: n.text });
    }
  }
  for (const { label, notes } of [...byItem.values()].sort((a, b) =>
    a.label.localeCompare(b.label, 'is')
  )) {
    lines.push('', label);
    for (const n of notes) lines.push(`  ${n.reviewer}: ${n.text.replace(/\n+/g, ' / ')}`);
  }
  lines.push('', 'Upptökur');
  lines.push(`  réttar, má samþykkja: ${result.approve.length}`);
  lines.push(`  þegar samþykktar: ${result.already.length}`);
  lines.push(`  rangar: ${result.wrong.length}`);
  for (const w of result.wrong) {
    lines.push(`    „${w.text}“${w.notes.length ? ` — ${w.notes.join(' / ')}` : ''}`);
  }
  if (result.conflicts.length > 0) {
    lines.push(`  rétt hjá einum, rangt hjá öðrum: ${result.conflicts.length}`);
    for (const c of result.conflicts) {
      const who = c.verdicts.map((v) => `${v.reviewer}: ${v.verdict === 'right' ? 'rétt' : 'rangt'}`);
      lines.push(`    „${c.text}“ (${who.join(', ')})`);
    }
  }
  if (result.unknown.length > 0) {
    lines.push(`  ekki lengur á spjöldunum: ${result.unknown.map((t) => `„${t}“`).join(', ')}`);
  }
  return `${lines.join('\n')}\n`;
}
