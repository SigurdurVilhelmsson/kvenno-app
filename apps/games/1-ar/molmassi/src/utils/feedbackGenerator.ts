/**
 * Generates detailed feedback for Level 1 challenges.
 * Each challenge type has specific correct/incorrect explanations,
 * misconception tips, related concepts, and next steps.
 */

import type { DetailedFeedback } from '@shared/types';


import type { Challenge } from './challengeGenerator';
import { ATOMIC_MASSES } from './challengeGenerator';
import { ATOM_VISUALS } from '../components/AtomVisuals';

/**
 * Generate detailed feedback for the FeedbackPanel based on the
 * current challenge type, the user's correctness, and the challenge data.
 */
export function getDetailedFeedback(challenge: Challenge, isCorrect: boolean): DetailedFeedback {
  const elementName = ATOM_VISUALS[challenge.targetElement!]?.name || challenge.targetElement;

  switch (challenge.type) {
    case 'count_atoms': {
      if (isCorrect) {
        return {
          isCorrect: true,
          explanation: `Rétt! Í ${challenge.compound.formula} eru ${challenge.correctCount} ${elementName} frumeindir. Þú fannst rétt tölu með því að lesa formúluna.`,
          relatedConcepts: ['Efnaformúlur', 'Subscripts', 'Frumeindir'],
          nextSteps: 'Reyndu næst að bera saman massa sameinda.',
        };
      }
      return {
        isCorrect: false,
        explanation: `Í ${challenge.compound.formula} eru ${challenge.correctCount} ${elementName} (${challenge.targetElement}) frumeindir. Líttu á töluna við hliðina á ${challenge.targetElement} í formúlunni.`,
        misconception: 'Mundu: Ef engin tala er við hliðina á frumefninu, þá er 1 frumeind. Talan (subscript) á aðeins við það frumefni sem hún er við.',
        relatedConcepts: ['Efnaformúlur', 'Subscripts'],
        nextSteps: 'Æfðu þig í að lesa subscripts í mismunandi formúlum.',
      };
    }

    case 'compare_mass': {
      const heavier = challenge.compound.molarMass > (challenge.compareCompound?.molarMass || 0)
        ? challenge.compound
        : challenge.compareCompound;
      const lighter = challenge.compound.molarMass <= (challenge.compareCompound?.molarMass || 0)
        ? challenge.compound
        : challenge.compareCompound;

      if (isCorrect) {
        return {
          isCorrect: true,
          explanation: `Rétt! ${heavier?.name} (${heavier?.molarMass.toFixed(1)} g/mol) er þyngri en ${lighter?.name} (${lighter?.molarMass.toFixed(1)} g/mol).`,
          relatedConcepts: ['Mólmassi', 'Atómmassi', 'Samanburður'],
          nextSteps: 'Reyndu að áætla í hvaða massabil sameind fellur.',
        };
      }
      return {
        isCorrect: false,
        explanation: `${heavier?.name} er í raun þyngri (${heavier?.molarMass.toFixed(1)} g/mol) en ${lighter?.name} (${lighter?.molarMass.toFixed(1)} g/mol).`,
        misconception: 'Stærri frumeindir (eins og O, Cl, Na) hafa meiri massa en litlar (eins og H). Fleiri frumeindir þýðir líka meiri massa.',
        relatedConcepts: ['Mólmassi', 'Atómmassi'],
        nextSteps: 'Hugsaðu um bæði stærð og fjölda frumefna þegar þú berð saman.',
      };
    }

    case 'build_molecule': {
      const targetFormula = challenge.compound.elements.map(e =>
        `${e.count}\u00d7 ${ATOM_VISUALS[e.symbol]?.name || e.symbol}`
      ).join(' + ');

      if (isCorrect) {
        return {
          isCorrect: true,
          explanation: `Frábært! Þú byggðir ${challenge.compound.name} (${challenge.compound.formula}) rétt: ${targetFormula}.`,
          relatedConcepts: ['Efnaformúlur', 'Sameindir', 'Frumeindir'],
          nextSteps: 'Reyndu nú að áætla mólmassa þessarar sameindar.',
        };
      }
      return {
        isCorrect: false,
        explanation: `${challenge.compound.name} (${challenge.compound.formula}) inniheldur: ${targetFormula}. Berðu saman við það sem þú byggðir.`,
        misconception: 'Lestu formúluna vandlega - hver tala (subscript) segir þér nákvæmlega hversu margar af hverri frumeind þarf.',
        relatedConcepts: ['Efnaformúlur', 'Sameindir'],
        nextSteps: 'Byrjaðu á fyrsta frumefninu og farðu kerfisbundið í gegnum formúluna.',
      };
    }

    case 'estimate_range': {
      const mass = challenge.compound.molarMass;
      const correctRange = challenge.ranges?.[challenge.correctRangeIndex!];
      const calculation = challenge.compound.elements.map(e =>
        `${e.count}\u00d7${ATOMIC_MASSES[e.symbol]?.toFixed(0) || '?'}`
      ).join(' + ');

      if (isCorrect) {
        return {
          isCorrect: true,
          explanation: `Rétt! ${challenge.compound.name} = ${mass.toFixed(1)} g/mol (${calculation}), sem fellur í bilið ${correctRange?.label}.`,
          relatedConcepts: ['Mólmassi', 'Atómmassi', 'Útreikningar'],
          nextSteps: 'Þú ert tilbúin/n að reikna nákvæman mólmassa!',
        };
      }
      return {
        isCorrect: false,
        explanation: `${challenge.compound.name} = ${calculation} = ${mass.toFixed(1)} g/mol, sem fellur í bilið ${correctRange?.label}.`,
        misconception: 'Mundu atómmassamina: H\u22481, C\u224812, N\u224814, O\u224816 g/mol. Margfaldaðu með fjöldanum og leggðu saman.',
        relatedConcepts: ['Mólmassi', 'Atómmassi'],
        nextSteps: 'Æfðu þig í að leggja saman atómmassa - það er grunnurinn að mólmassaútreikningum.',
      };
    }

    default:
      return {
        isCorrect,
        explanation: isCorrect ? 'Rétt svar!' : 'Rangt svar.',
      };
  }
}
