/**
 * The particles Agnasýn draws in the flask, and how they move from one set of
 * counts to the next.
 *
 * Pure apart from the random source, which is passed in, so the tests can run a
 * titration through it and check what is left. The component owns the frame
 * loop and draws `sys.particles`.
 *
 * A change of counts is shown as the reactions that make it, wherever it can
 * be: a new OH⁻ drips in with its Na⁺ and swims to a CH₃COOH, which becomes
 * CH₃COO⁻ while the OH⁻ leaves as water; the exaggerated pair of a dynamic
 * equilibrium recombines into the molecule it came from. Whatever no reaction
 * explains (a slider dragged backwards, a jump between scenes) fades in or out.
 */

import type { FlagPair, ParticleCounts } from './agnasyn';

export type Kind = 'HA' | 'A' | 'H3O' | 'OH' | 'Na' | 'H2O';

type Action = 'neutralize' | 'recombine';

export interface Particle {
  id: number;
  kind: Kind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** 0–1. */
  alpha: number;
  fade: 'in' | 'out' | null;
  /** Part of an exaggerated pair, drawn with a dashed ring. */
  flag: boolean;
  pairId?: number;
  /** The particle this one swims to, and what happens when it arrives. */
  target?: number;
  action?: Action;
  /** Someone is swimming to it. */
  reserved?: boolean;
  /** A brief highlight after a reaction, seconds left. */
  glow: number;
  /** A pair to form from another molecule once this one has recombined. */
  respawn?: Exclude<FlagPair, null>;
  /** Seconds a water molecule has left. */
  life?: number;
}

export interface Bounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export interface System {
  particles: Particle[];
  bounds: Bounds;
  /** Where a drop from the búretta lands. */
  spout: { x: number; y: number };
  nextId: number;
  nextPair: number;
  time: number;
  /** Actions to run later, at `time`. */
  later: { at: number; run: (sys: System, rng: () => number) => void }[];
}

export const RADIUS: Record<Kind, number> = {
  HA: 11,
  A: 11,
  H3O: 7,
  OH: 7,
  Na: 6,
  H2O: 6,
};

const FADE_PER_S = 2.5;
const SWIM_SPEED = 90;
const DRIFT_SPEED = 14;
const WATER_LIFE = 1.1;
const GLOW_S = 1.2;

export function createSystem(bounds: Bounds): System {
  return {
    particles: [],
    bounds,
    spout: { x: (bounds.left + bounds.right) / 2, y: bounds.top },
    nextId: 1,
    nextPair: 1,
    time: 0,
    later: [],
  };
}

function randomPoint(sys: System, rng: () => number, r: number): { x: number; y: number } {
  const b = sys.bounds;
  return {
    x: b.left + r + rng() * Math.max(0, b.right - b.left - 2 * r),
    y: b.top + r + rng() * Math.max(0, b.bottom - b.top - 2 * r),
  };
}

function spawn(
  sys: System,
  kind: Kind,
  rng: () => number,
  where: 'random' | 'spout' | { x: number; y: number },
  animate: boolean
): Particle {
  const r = RADIUS[kind];
  const at =
    where === 'random'
      ? randomPoint(sys, rng, r)
      : where === 'spout'
        ? { x: sys.spout.x + (rng() - 0.5) * 10, y: sys.bounds.top + r }
        : where;
  const p: Particle = {
    id: sys.nextId++,
    kind,
    x: at.x,
    y: at.y,
    vx: (rng() - 0.5) * DRIFT_SPEED,
    vy: where === 'spout' ? 40 + rng() * 20 : (rng() - 0.5) * DRIFT_SPEED,
    alpha: animate ? 0 : 1,
    fade: animate ? 'in' : null,
    flag: false,
    glow: 0,
  };
  sys.particles.push(p);
  return p;
}

function byId(sys: System, id: number | undefined): Particle | undefined {
  return id === undefined ? undefined : sys.particles.find((p) => p.id === id);
}

function alive(p: Particle): boolean {
  return p.fade !== 'out' && p.kind !== 'H2O';
}

function pick<T>(items: T[], rng: () => number): T | undefined {
  return items.length === 0 ? undefined : items[Math.floor(rng() * items.length)];
}

/**
 * The counts the system is heading for once every swim in progress arrives,
 * with the exaggerated pairs taken back: a flagged CH₃COO⁻ counts as the
 * CH₃COOH it came from and a flagged CH₃COOH as its CH₃COO⁻; the flagged
 * H⁺ or OH⁻ counts as nothing.
 */
export function realCounts(sys: System): Omit<ParticleCounts, 'flag'> {
  const c = { HA: 0, A: 0, H3O: 0, OH: 0, Na: 0 };
  const neutralizing = new Set(
    sys.particles.filter((p) => alive(p) && p.action === 'neutralize').map((p) => p.target)
  );
  for (const p of sys.particles) {
    if (!alive(p)) continue;
    if (p.action === 'neutralize') continue;
    if (p.flag) {
      if (p.kind === 'A') c.HA++;
      else if (p.kind === 'HA') c.A++;
      continue;
    }
    if (p.kind === 'HA' && neutralizing.has(p.id)) c.A++;
    else if (p.kind !== 'H2O') c[p.kind]++;
  }
  return c;
}

/** What is drawn now, flagged particles included, for the legend and the tests. */
export function shownCounts(sys: System): Record<Exclude<Kind, 'H2O'>, number> {
  const c = { HA: 0, A: 0, H3O: 0, OH: 0, Na: 0 };
  for (const p of sys.particles) if (alive(p)) c[p.kind as Exclude<Kind, 'H2O'>]++;
  return c;
}

/** Take back the exaggerated pairs (all, or those named), each partner swimming home. */
function revertPairs(
  sys: System,
  rng: () => number,
  animate: boolean,
  only?: Set<number>,
  respawn?: Exclude<FlagPair, null>
): void {
  const flagged = sys.particles.filter(
    (p) => alive(p) && p.flag && (!only || (p.pairId !== undefined && only.has(p.pairId)))
  );
  const pairs = new Map<number, Particle[]>();
  for (const p of flagged) {
    if (p.pairId === undefined) continue;
    pairs.set(p.pairId, [...(pairs.get(p.pairId) ?? []), p]);
  }
  for (const members of pairs.values()) {
    const ion = members.find((p) => p.kind === 'H3O' || p.kind === 'OH');
    const home = members.find((p) => p.kind === 'A' || p.kind === 'HA');
    if (!ion || !home) {
      for (const p of members) p.flag = false;
      continue;
    }
    if (ion.action === 'recombine') continue;
    ion.respawn = respawn;
    if (animate) {
      ion.target = home.id;
      ion.action = 'recombine';
      home.reserved = true;
    } else {
      finishRecombine(sys, ion, home, rng, false);
    }
  }
}

function finishRecombine(
  sys: System,
  ion: Particle,
  home: Particle,
  rng: () => number,
  animate: boolean
): void {
  home.kind = home.kind === 'A' ? 'HA' : 'A';
  home.flag = false;
  home.pairId = undefined;
  home.reserved = false;
  home.glow = GLOW_S;
  sys.particles = sys.particles.filter((p) => p !== ion);
  if (ion.respawn) addPair(sys, ion.respawn, rng, animate, home.id);
}

function finishNeutralize(sys: System, oh: Particle, acid: Particle, animate: boolean): void {
  acid.kind = 'A';
  acid.reserved = false;
  acid.glow = GLOW_S;
  if (animate) {
    oh.kind = 'H2O';
    oh.target = undefined;
    oh.action = undefined;
    oh.flag = false;
    oh.life = WATER_LIFE;
    oh.vx = (oh.x - acid.x) * 0.8;
    oh.vy = (oh.y - acid.y) * 0.8 - 10;
  } else {
    sys.particles = sys.particles.filter((p) => p !== oh);
  }
}

/** Make an exaggerated pair from one free molecule. */
export function addPair(
  sys: System,
  type: Exclude<FlagPair, null>,
  rng: () => number,
  animate: boolean,
  /** A molecule not to use: the one that just recombined. */
  not?: number
): void {
  const from = type === 'ion' ? 'HA' : 'A';
  const home = pick(
    sys.particles.filter(
      (p) => alive(p) && p.kind === from && !p.flag && !p.reserved && p.id !== not
    ),
    rng
  );
  if (!home) return;
  const pairId = sys.nextPair++;
  home.kind = type === 'ion' ? 'A' : 'HA';
  home.flag = true;
  home.pairId = pairId;
  home.glow = animate ? GLOW_S : 0;
  const angle = rng() * Math.PI * 2;
  const ion = spawn(
    sys,
    type === 'ion' ? 'H3O' : 'OH',
    rng,
    { x: home.x + Math.cos(angle) * 16, y: home.y + Math.sin(angle) * 16 },
    false
  );
  ion.flag = true;
  ion.pairId = pairId;
  ion.vx = Math.cos(angle) * 30;
  ion.vy = Math.sin(angle) * 30;
  clamp(sys, home);
  clamp(sys, ion);
}

/**
 * The dynamic equilibrium of a flagged scene: the pair recombines into the
 * molecule it came from, and as it does another molecule ionises, so there is
 * always one pair and the counts stay as they are.
 */
export function flicker(sys: System, rng: () => number): void {
  const flagged = sys.particles.filter((p) => alive(p) && p.flag && p.pairId !== undefined);
  if (flagged.some((p) => p.action === 'recombine')) return;
  const type: FlagPair = flagged.some((p) => p.kind === 'H3O')
    ? 'ion'
    : flagged.some((p) => p.kind === 'OH')
      ? 'hyd'
      : null;
  if (!type) return;
  revertPairs(sys, rng, true, new Set(flagged.map((p) => p.pairId!)), type);
}

function fadeOut(sys: System, kind: Kind, n: number, rng: () => number, animate: boolean): void {
  for (let i = 0; i < n; i++) {
    const p = pick(
      sys.particles.filter(
        (q) => alive(q) && q.kind === kind && !q.flag && !q.reserved && !q.action
      ),
      rng
    );
    if (!p) return;
    if (animate) p.fade = 'out';
    else sys.particles = sys.particles.filter((q) => q !== p);
  }
}

function convert(sys: System, from: Kind, to: Kind, n: number, rng: () => number): void {
  for (let i = 0; i < n; i++) {
    const p = pick(
      sys.particles.filter((q) => alive(q) && q.kind === from && !q.flag && !q.reserved),
      rng
    );
    if (!p) return;
    p.kind = to;
    p.glow = GLOW_S;
  }
}

/**
 * Move the system to new counts. With `drip`, new NaOH arrives as drops at the
 * spout and each OH⁻ a CH₃COOH needs swims to it; otherwise every change is
 * made where the particles are, fading or converting in place.
 */
export function applyCounts(
  sys: System,
  target: ParticleCounts,
  rng: () => number,
  opts: { animate: boolean; drip: boolean }
): void {
  const { animate } = opts;
  const drip = opts.drip && animate;
  revertPairs(sys, rng, animate);

  let cur = realCounts(sys);
  const dNa = target.Na - cur.Na;
  if (dNa > 0) {
    const toNeutralize = Math.min(dNa, Math.max(0, cur.HA - target.HA));
    for (let i = 0; i < dNa; i++) {
      spawn(sys, 'Na', rng, drip ? 'spout' : 'random', animate);
      const oh = spawn(sys, 'OH', rng, drip ? 'spout' : 'random', animate);
      if (i < toNeutralize) {
        const acid = pick(
          sys.particles.filter((p) => alive(p) && p.kind === 'HA' && !p.flag && !p.reserved),
          rng
        );
        if (!acid) continue;
        if (drip) {
          oh.target = acid.id;
          oh.action = 'neutralize';
          acid.reserved = true;
        } else {
          finishNeutralize(sys, oh, acid, false);
        }
      }
    }
  } else if (dNa < 0) {
    fadeOut(sys, 'Na', -dNa, rng, animate);
  }

  cur = realCounts(sys);
  // CH₃COOH and CH₃COO⁻ trade places where no OH⁻ came to do it.
  if (cur.HA > target.HA && cur.A < target.A) {
    convert(sys, 'HA', 'A', Math.min(cur.HA - target.HA, target.A - cur.A), rng);
  } else if (cur.A > target.A && cur.HA < target.HA) {
    convert(sys, 'A', 'HA', Math.min(cur.A - target.A, target.HA - cur.HA), rng);
  }

  cur = realCounts(sys);
  for (const kind of ['HA', 'A', 'H3O', 'OH'] as const) {
    const d = target[kind] - cur[kind];
    if (d > 0) for (let i = 0; i < d; i++) spawn(sys, kind, rng, 'random', animate);
    else if (d < 0) fadeOut(sys, kind, -d, rng, animate);
  }

  if (target.flag) {
    const flag = target.flag;
    if (drip) {
      sys.later.push({ at: sys.time + 1.6, run: (s, r) => addPair(s, flag, r, true) });
    } else {
      addPair(sys, flag, rng, animate);
    }
  }
}

function clamp(sys: System, p: Particle): void {
  const r = RADIUS[p.kind];
  const b = sys.bounds;
  if (p.x < b.left + r) {
    p.x = b.left + r;
    p.vx = Math.abs(p.vx);
  } else if (p.x > b.right - r) {
    p.x = b.right - r;
    p.vx = -Math.abs(p.vx);
  }
  if (p.y < b.top + r) {
    p.y = b.top + r;
    p.vy = Math.abs(p.vy);
  } else if (p.y > b.bottom - r) {
    p.y = b.bottom - r;
    p.vy = -Math.abs(p.vy);
  }
}

/** Advance the system by `dt` seconds. With `still`, nothing drifts. */
export function step(sys: System, dt: number, rng: () => number, still = false): void {
  sys.time += dt;
  const due = sys.later.filter((l) => l.at <= sys.time);
  sys.later = sys.later.filter((l) => l.at > sys.time);
  for (const l of due) l.run(sys, rng);

  for (const p of [...sys.particles]) {
    if (p.glow > 0) p.glow = Math.max(0, p.glow - dt);
    if (p.fade === 'in') {
      p.alpha = Math.min(1, p.alpha + FADE_PER_S * dt);
      if (p.alpha >= 1) p.fade = null;
    } else if (p.fade === 'out') {
      p.alpha -= FADE_PER_S * dt;
      if (p.alpha <= 0) {
        sys.particles = sys.particles.filter((q) => q !== p);
        continue;
      }
    }
    if (p.kind === 'H2O') {
      p.life = (p.life ?? 0) - dt;
      p.alpha = Math.max(0, (p.life ?? 0) / WATER_LIFE);
      if ((p.life ?? 0) <= 0) {
        sys.particles = sys.particles.filter((q) => q !== p);
        continue;
      }
    }

    const target = byId(sys, p.target);
    if (p.target !== undefined && !target) {
      p.target = undefined;
      p.action = undefined;
    }
    if (target) {
      const dx = target.x - p.x;
      const dy = target.y - p.y;
      const dist = Math.hypot(dx, dy);
      if (dist < RADIUS[target.kind] + RADIUS[p.kind] * 0.5 || still) {
        if (p.action === 'neutralize') finishNeutralize(sys, p, target, !still);
        else finishRecombine(sys, p, target, rng, !still);
        continue;
      }
      p.vx = (dx / dist) * SWIM_SPEED;
      p.vy = (dy / dist) * SWIM_SPEED;
    } else if (!still) {
      // A random walk: a nudge each frame, damped, so the speed stays near DRIFT_SPEED.
      p.vx += (rng() - 0.5) * 60 * dt;
      p.vy += (rng() - 0.5) * 60 * dt;
      const speed = Math.hypot(p.vx, p.vy);
      const cap = p.kind === 'H2O' ? 40 : DRIFT_SPEED;
      if (speed > cap) {
        const k = 1 - Math.min(1, 2 * dt);
        p.vx *= k;
        p.vy *= k;
      }
    }
    if (!still || target) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
    clamp(sys, p);
  }
  if (!still) separate(sys);
}

/**
 * Push overlapping particles apart, so a crowded flask stays readable. A
 * swimmer and the particle it swims to are left to meet.
 */
function separate(sys: System): void {
  const ps = sys.particles.filter((p) => p.kind !== 'H2O');
  for (let i = 0; i < ps.length; i++) {
    for (let j = i + 1; j < ps.length; j++) {
      const a = ps[i];
      const b = ps[j];
      if (a.target === b.id || b.target === a.id) continue;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const min = RADIUS[a.kind] + RADIUS[b.kind] + 1;
      const d2 = dx * dx + dy * dy;
      if (d2 >= min * min || d2 === 0) continue;
      const d = Math.sqrt(d2);
      const push = (min - d) / 2;
      const ux = dx / d;
      const uy = dy / d;
      // A swimmer holds its course; the other particle gives way.
      const ka = a.target !== undefined ? 0 : b.target !== undefined ? 2 : 1;
      const kb = 2 - ka;
      a.x -= ux * push * ka;
      a.y -= uy * push * ka;
      b.x += ux * push * kb;
      b.y += uy * push * kb;
      clamp(sys, a);
      clamp(sys, b);
    }
  }
}

/** Run every swim, fade and pending action to its end at once. */
export function settle(sys: System, rng: () => number): void {
  for (const l of sys.later) l.run(sys, rng);
  sys.later = [];
  for (const p of [...sys.particles]) {
    const target = byId(sys, p.target);
    if (target) {
      if (p.action === 'neutralize') finishNeutralize(sys, p, target, false);
      else finishRecombine(sys, p, target, rng, false);
    }
  }
  sys.particles = sys.particles.filter((p) => p.fade !== 'out' && p.kind !== 'H2O');
  for (const p of sys.particles) {
    p.alpha = 1;
    p.fade = null;
    p.glow = 0;
  }
}

/** Keep every particle inside new bounds, e.g. once the liquid has risen. */
export function setBounds(sys: System, bounds: Bounds): void {
  sys.bounds = bounds;
  sys.spout = { x: (bounds.left + bounds.right) / 2, y: bounds.top };
  for (const p of sys.particles) clamp(sys, p);
}

/** A seeded random source, so a test replays the same drops. */
export function seeded(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 1_000_000) / 1_000_000;
  };
}
