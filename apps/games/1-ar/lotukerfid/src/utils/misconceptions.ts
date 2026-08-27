/**
 * Naming the error behind a wrong answer, for the `FeedbackPanel`'s
 * misconception slot.
 *
 * The Year-1 curriculum review found this game names no misconception at all —
 * zero call sites across all its items — so a wrong answer got "Rangt" and a
 * restatement of the right one. This looks at the number the student actually
 * gave and finds the single confusion that explains it, the way
 * `1-ar/molmassi`'s `diagnoseMistake` does; the review holds that up as one of
 * four patterns worth copying.
 *
 * Every function here returns `undefined` when the answer is not one it can
 * read. That is deliberate: a misconception the student does not hold is worse
 * than none, because they will try to act on it.
 */

import type { Element } from '../data/elements';

export type ParticleQuestionType = 'protons' | 'electrons' | 'neutrons' | 'identify-by-particles';

const neutronCount = (el: Element): number => el.massNumber - el.atomicNumber;

/**
 * Level 3 — a particle count, or a table click for identify-by-particles.
 *
 * `given` is the number typed, or the sætistala of the element clicked.
 */
export function particleMisconception(
  type: ParticleQuestionType,
  element: Element,
  given: number
): string | undefined {
  const z = element.atomicNumber;
  const a = element.massNumber;
  const n = neutronCount(element);

  switch (type) {
    case 'protons':
    case 'electrons': {
      const particle = type === 'protons' ? 'Róteindir' : 'Rafeindir';
      if (given === a) {
        return `${particle} eru taldar með sætistölunni (${z}), ekki massatölunni (${a}). Massatalan telur róteindir OG nifteindir saman.`;
      }
      if (given === n && n !== z) {
        return 'Þú gafst upp fjölda nifteinda. Sætistalan telur róteindirnar; nifteindirnar eru massatalan mínus sætistalan.';
      }
      if (given === Math.round(element.atomicMass) && given !== z) {
        return 'Talan neðst í reitnum í lotukerfinu er frumeindamassi — meðaltal yfir samsætur — ekki fjöldi agna. Sætistalan efst í reitnum er sú sem þú vilt.';
      }
      return undefined;
    }

    case 'neutrons': {
      if (given === z) {
        return `Þú gafst upp fjölda róteinda. Sætistalan telur róteindirnar; nifteindirnar eru það sem eftir stendur af massatölunni: ${a} − ${z}.`;
      }
      if (given === a) {
        return `Massatalan (${a}) telur róteindir og nifteindir saman. Til að fá nifteindirnar einar þarf að draga sætistöluna frá: ${a} − ${z}.`;
      }
      if (given === a + z) {
        return `Hér er lagt saman þar sem á að draga frá. Massatalan inniheldur róteindirnar nú þegar, svo nifteindirnar eru ${a} − ${z}.`;
      }
      if (given === Math.round(element.atomicMass) - z && given !== n) {
        return 'Þú notaðir frumeindamassann af lotukerfinu. Hann er meðaltal yfir samsætur og á ekki við um eina tiltekna samsætu — notaðu massatöluna sem stendur í heiti hennar.';
      }
      return undefined;
    }

    case 'identify-by-particles': {
      if (given === n && n !== z) {
        return 'Þú valdir frumefnið eftir nifteindafjöldanum. Það er sætistalan — fjöldi róteinda — sem ræður hvaða frumefni þetta er; nifteindirnar segja bara hvaða samsæta.';
      }
      if (given === a) {
        return 'Þú valdir eftir massatölunni. Sætistalan — fjöldi róteinda — ræður hvaða frumefni þetta er; massatalan segir hvaða samsæta.';
      }
      return undefined;
    }
  }
}

/**
 * Level 1 — the student clicked the wrong cell while looking for an element.
 *
 * Lota and flokkur are the two coordinates of the table and students routinely
 * swap the words, so a click in the right row or the right column is worth
 * naming as exactly that.
 */
export function tableClickMisconception(target: Element, clicked: Element): string | undefined {
  if (clicked.symbol === target.symbol) return undefined;

  if (clicked.period === target.period) {
    return 'Þú valdir frumefni í sömu lotu — sömu láréttu röð. Lota er lárétt röð, flokkur er lóðréttur dálkur.';
  }
  if (clicked.group === target.group) {
    return 'Þú valdir frumefni í sama flokki — sama lóðrétta dálki. Flokkur er lóðréttur dálkur, lota er lárétt röð.';
  }
  if (Math.abs(clicked.atomicNumber - target.atomicNumber) === 1) {
    return 'Þú lentir á næsta frumefni við hliðina. Sætistölurnar hlaupa frá vinstri til hægri eftir hverri lotu og halda svo áfram í næstu línu fyrir neðan.';
  }
  return undefined;
}

/**
 * Level 2 — the four question types, keyed on which option the student picked.
 *
 * Less signal than Level 3: the options are strings and the wrong ones are
 * mostly plausible-but-unrelated, so what is diagnosable here is the confusion
 * the question type invites rather than the specific choice. Each of these is
 * the one thing a student who gets that type wrong most often has wrong.
 */
export function level2Misconception(
  type: 'classify' | 'order-by-mass' | 'group-property' | 'trend'
): string | undefined {
  switch (type) {
    case 'classify':
      return 'Flokkun ræðst af staðsetningu, ekki af nafninu. Málmar eru vinstra megin, málmleysingjar hægra megin og efst, og hálfmálmarnir liggja á stiganum þarna á milli — B, Si, Ge, As, Sb, Te.';
    case 'order-by-mass':
      return 'Frumeindamassi vex almennt með sætistölunni, svo röðin fylgir lestrarröðinni í lotukerfinu: frá vinstri til hægri eftir lotunni og svo niður í næstu.';
    case 'group-property':
      return 'Það er flokkurinn — lóðrétti dálkurinn — sem gefur frumefnum svipaða eiginleika, því hann ræður fjölda gildisrafeinda. Lotan, lárétta röðin, gerir það ekki.';
    case 'trend':
      return 'Lotubundnar sveiflur eiga sér allar sömu skýringu: hversu fast kjarninn heldur í ystu rafeindirnar. Athugaðu fyrst hvort frumefnin tvö eru í sömu lotu eða sama flokki — reglan snýst við eftir því.';
  }
}
