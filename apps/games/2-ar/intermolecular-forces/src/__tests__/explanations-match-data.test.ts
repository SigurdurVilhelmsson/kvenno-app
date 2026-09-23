import { describe, expect, it } from 'vitest';

import { problems } from '../components/Level2';

/**
 * A Stig 2 explanation that ranks a compound by molar mass has to agree with the molar
 * masses the same problem shows. Problem 2 said methanol reached the highest boiling point
 * "þrátt fyrir lægsta mólmassa", beside ethane at 30 g/mol against methanol's 32, so a
 * student checking the table found the explanation contradicting it.
 *
 * Every sentence claiming a compound has the lowest or highest molar mass is checked against
 * the compounds in its problem. The compound is the sentence's subject, its first word, by
 * name or formula.
 */

const CLAIM = /\b(lægst|hæst)\S* mólmass/;

describe('Stig 2 explanations', () => {
  const claims = problems.flatMap((problem) =>
    problem.explanation
      .split(/(?<=[.!])\s+/)
      .filter((sentence) => CLAIM.test(sentence))
      .map((sentence) => ({ problem, sentence }))
  );

  it('finds the claims it checks', () => {
    // Problem 7 says NH₃ boils highest despite the lowest molar mass, which is true.
    expect(claims.length).toBeGreaterThan(0);
  });

  it.each(claims.map((c) => [c.problem.id, c.sentence, c] as const))(
    'problem %i: "%s" agrees with the molar masses shown',
    (_id, sentence, { problem }) => {
      const subject = sentence.split(/\s+/)[0];
      const compound = problem.compounds.find((c) => c.name === subject || c.formula === subject);
      expect(compound, `subject "${subject}" is one of the problem's compounds`).toBeDefined();

      const masses = problem.compounds.map((c) => c.molarMass);
      const extreme =
        CLAIM.exec(sentence)![1] === 'lægst' ? Math.min(...masses) : Math.max(...masses);
      expect(compound!.molarMass).toBe(extreme);
    }
  );
});
