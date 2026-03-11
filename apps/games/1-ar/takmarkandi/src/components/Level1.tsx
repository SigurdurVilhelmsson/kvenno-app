import { useState } from 'react';

import { HintSystem, FeedbackPanel } from '@shared/components';
import type { TieredHints } from '@shared/types';
import { shuffleArray } from '@shared/utils';

import { Molecule } from './Molecule';
import { ReactionAnimation } from './ReactionAnimation';
import { REACTIONS } from '../data/reactions';
import { Reaction } from '../types';

// Misconceptions for each challenge type
const MISCONCEPTIONS: Record<ChallengeType, string> = {
  which_runs_out:
    'Takmarkandi hvarfefni er ekki alltaf það sem er minna af - það ræðst af stuðlum í jöfnunni og hlutföllum.',
  count_times_r1:
    'Mundu að deila með stuðlinum, ekki margfalda. Fjöldi sameinda ÷ stuðull = fjöldi skipta.',
  count_times_r2:
    'Athugaðu stuðulinn vandlega. Ef þú þarft 2 af hvarfefni fyrir hvert hvarf, þá helmingast fjöldi skipta.',
  which_is_limiting:
    'Berðu saman fjölda skipta, ekki fjölda sameinda. Það hvarfefni sem gefur FÆRRI skipti er takmarkandi.',
  count_products:
    'Margfaldaðu fjölda skipta með stuðli AFURÐAR, ekki hvarfefnis. Athugaðu jöfnuna vandlega.',
  count_excess: 'Afgangur = upphaf - notað. Notaðu fjölda skipta × stuðul til að finna notað magn.',
};

// Related concepts for each challenge type
const RELATED_CONCEPTS: Record<ChallengeType, string[]> = {
  which_runs_out: ['Takmarkandi hvarfefni', 'Stökefnafræðileg hlutföll', 'Hvörfunargeta'],
  count_times_r1: ['Mólhlutföll', 'Stuðlar', 'Stökefnafræði'],
  count_times_r2: ['Mólhlutföll', 'Stuðlar', 'Stökefnafræði'],
  which_is_limiting: ['Takmarkandi hvarfefni', 'Hlutfallsleg magn', 'Hvörfunargeta'],
  count_products: ['Afurðir', 'Stökefnafræðileg hlutföll', 'Hvörfunarútkoma'],
  count_excess: ['Afgang', 'Nýting hvarfefna', 'Stökefnafræði'],
};

interface Level1Props {
  onComplete: (score: number, maxScore: number, hintsUsed: number) => void;
  onBack: () => void;
  onCorrectAnswer?: () => void;
  onIncorrectAnswer?: () => void;
}

type ChallengeType =
  | 'which_runs_out'
  | 'count_times_r1'
  | 'count_times_r2'
  | 'which_is_limiting'
  | 'count_products'
  | 'count_excess';

interface Challenge {
  type: ChallengeType;
  reaction: Reaction;
  r1Count: number;
  r2Count: number;
}

// Simple reactions for learning (easy only)
const LEVEL1_REACTIONS = REACTIONS.filter((r) => r.difficulty === 'easy').slice(0, 6);

function generateChallenge(challengeIndex: number): Challenge {
  const types: ChallengeType[] = [
    'which_runs_out',
    'count_times_r1',
    'count_times_r2',
    'which_is_limiting',
    'count_products',
    'count_excess',
  ];

  const type = types[challengeIndex % types.length];
  const reaction = LEVEL1_REACTIONS[challengeIndex % LEVEL1_REACTIONS.length];

  // Generate counts that create a clear limiting reactant
  let r1Count: number, r2Count: number;

  if (challengeIndex % 2 === 0) {
    // R1 is limiting
    r1Count = reaction.reactant1.coeff * 2;
    r2Count = reaction.reactant2.coeff * 4;
  } else {
    // R2 is limiting
    r1Count = reaction.reactant1.coeff * 4;
    r2Count = reaction.reactant2.coeff * 2;
  }

  return { type, reaction, r1Count, r2Count };
}

export function Level1({ onComplete, onBack, onCorrectAnswer, onIncorrectAnswer }: Level1Props) {
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [challenge, setChallenge] = useState<Challenge>(() => generateChallenge(0));
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [hintMultiplier, setHintMultiplier] = useState(1.0);
  const [totalHintsUsed, setTotalHintsUsed] = useState(0);
  const [showAnimation, setShowAnimation] = useState(false);

  const totalChallenges = 8;
  const masteryThreshold = 6;
  const hasMastery = correctCount >= masteryThreshold;
  const isComplete = challengeIndex >= totalChallenges || hasMastery;

  // Calculate correct answers
  const timesR1 = challenge.r1Count / challenge.reaction.reactant1.coeff;
  const timesR2 = challenge.r2Count / challenge.reaction.reactant2.coeff;
  const limitingReactant =
    timesR1 <= timesR2
      ? challenge.reaction.reactant1.formula
      : challenge.reaction.reactant2.formula;
  const timesReactionRuns = Math.min(timesR1, timesR2);
  const productCount = challenge.reaction.products[0].coeff * timesReactionRuns;
  const excessCount =
    timesR1 <= timesR2
      ? challenge.r2Count - timesReactionRuns * challenge.reaction.reactant2.coeff
      : challenge.r1Count - timesReactionRuns * challenge.reaction.reactant1.coeff;

  const checkAnswer = (answer: string | number) => {
    setSelectedAnswer(answer);
    let correct = false;

    switch (challenge.type) {
      case 'which_runs_out':
      case 'which_is_limiting':
        correct = answer === limitingReactant;
        break;
      case 'count_times_r1':
        correct = answer === timesR1;
        break;
      case 'count_times_r2':
        correct = answer === timesR2;
        break;
      case 'count_products':
        correct = answer === productCount;
        break;
      case 'count_excess':
        correct = answer === excessCount;
        break;
    }

    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      const points = Math.round(10 * hintMultiplier);
      setScore((prev) => prev + points);
      setCorrectCount((prev) => prev + 1);
      onCorrectAnswer?.();
    } else {
      onIncorrectAnswer?.();
    }
  };

  const nextChallenge = () => {
    const next = challengeIndex + 1;
    setChallengeIndex(next);
    if (next < totalChallenges) {
      setChallenge(generateChallenge(next));
      setSelectedAnswer(null);
      setShowFeedback(false);
      setHintMultiplier(1.0);
      setShowAnimation(false);
    }
  };

  // Complete screen
  if (isComplete) {
    const passedLevel = hasMastery;
    const questionsAnswered = challengeIndex + (showFeedback ? 1 : 0);
    const accuracy =
      questionsAnswered > 0 ? Math.round((correctCount / questionsAnswered) * 100) : 0;

    return (
      <div
        className={`min-h-screen bg-gradient-to-b ${passedLevel ? 'from-green-50' : 'from-yellow-50'} to-white p-4`}
      >
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="text-6xl mb-4">{passedLevel ? '🎉' : '💪'}</div>
            <h2 className="text-3xl font-bold text-warm-800 mb-2">
              {passedLevel ? 'Frábært!' : 'Góð tilraun!'}
            </h2>
            <p className="text-warm-600 mb-6">
              {passedLevel
                ? `Þú náðir ${masteryThreshold}+ réttum svörum og hefur lokið Stigi 1!`
                : `Þú þarft ${masteryThreshold} rétt svör til að opna Stig 2. Reyndu aftur!`}
            </p>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-green-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-green-600">
                  {correctCount}/{questionsAnswered}
                </div>
                <div className="text-xs text-warm-600">Rétt svör</div>
              </div>
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-blue-600">{accuracy}%</div>
                <div className="text-xs text-warm-600">Nákvæmni</div>
              </div>
              <div className="bg-purple-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-purple-600">{score}</div>
                <div className="text-xs text-warm-600">Stig</div>
              </div>
            </div>

            {/* Mastery progress */}
            <div className="bg-warm-50 rounded-xl p-4 mb-6">
              <div className="flex justify-between text-sm text-warm-600 mb-2">
                <span>Framvinda í lærdómi</span>
                <span>
                  {correctCount}/{masteryThreshold} rétt svör
                </span>
              </div>
              <div className="h-3 bg-warm-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${passedLevel ? 'bg-green-500' : 'bg-yellow-500'}`}
                  style={{ width: `${Math.min((correctCount / masteryThreshold) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* What you learned */}
            <div className="bg-blue-50 rounded-xl p-4 mb-6 text-left">
              <h3 className="font-bold text-blue-800 mb-3">Hvað lærðir þú?</h3>
              <ul className="text-sm text-warm-700 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Takmarkandi hvarfefni er það sem eyðist fyrst</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Reikna hversu oft hvarf getur gerst: sameindir ÷ stuðull</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Minnsta fjöldi skipta takmarkar hvörfin</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Afurðir = fjöldi skipta × stuðull afurðar</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              {passedLevel ? (
                <button
                  onClick={() => onComplete(score, totalChallenges * 10, totalHintsUsed)}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl transition-colors"
                >
                  Halda áfram í Stig 2 →
                </button>
              ) : (
                <button
                  onClick={() => {
                    setChallengeIndex(0);
                    setScore(0);
                    setCorrectCount(0);
                    setChallenge(generateChallenge(0));
                    setSelectedAnswer(null);
                    setShowFeedback(false);
                    setHintMultiplier(1.0);
                    setTotalHintsUsed(0);
                  }}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-xl transition-colors"
                >
                  Reyna aftur
                </button>
              )}
              <button
                onClick={onBack}
                className="w-full text-warm-500 hover:text-warm-700 font-semibold py-2"
              >
                Til baka í valmynd
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get challenge title and instructions with tiered hints
  const getChallengeInfo = (): { title: string; instruction: string; hints: TieredHints } => {
    switch (challenge.type) {
      case 'which_runs_out':
        return {
          title: 'Hvort hvarfefnið eyðist fyrst?',
          instruction: 'Ímyndaðu þér að hvörfin gerist. Hvort hvarfefnið mun klárast fyrst?',
          hints: {
            topic: 'Þetta snýst um takmarkandi hvarfefni og stökefnafræðileg hlutföll.',
            strategy: 'Berðu saman hversu oft hvert hvarfefni getur brugðist miðað við stuðlana.',
            method:
              'Líttu á stuðlana í jöfnunni. Ef þú þarft 2 af A fyrir hvert 1 af B, þá eyðist A hraðar.',
            solution: `${challenge.reaction.reactant1.formula}: ${challenge.r1Count}÷${challenge.reaction.reactant1.coeff}=${timesR1} skipti. ${challenge.reaction.reactant2.formula}: ${challenge.r2Count}÷${challenge.reaction.reactant2.coeff}=${timesR2} skipti. ${timesR1 <= timesR2 ? challenge.reaction.reactant1.formula : challenge.reaction.reactant2.formula} eyðist fyrst.`,
          },
        };
      case 'count_times_r1':
        return {
          title: `Hversu oft getur ${challenge.reaction.reactant1.formula} hvarfast?`,
          instruction: `Ef þú hefur ${challenge.r1Count} ${challenge.reaction.reactant1.formula} og þarft ${challenge.reaction.reactant1.coeff} fyrir hvert hvarf, hversu oft getur hvörfin gerst?`,
          hints: {
            topic: 'Þetta snýst um mólhlutföll og stökefnafræði.',
            strategy: 'Deildu fjölda sameinda með stuðlinum til að finna fjölda skipta.',
            method: `Notaðu: fjöldi sameinda ÷ stuðull = fjöldi skipta`,
            solution: `${challenge.r1Count} ÷ ${challenge.reaction.reactant1.coeff} = ${timesR1} skipti`,
          },
        };
      case 'count_times_r2':
        return {
          title: `Hversu oft getur ${challenge.reaction.reactant2.formula} hvarfast?`,
          instruction: `Ef þú hefur ${challenge.r2Count} ${challenge.reaction.reactant2.formula} og þarft ${challenge.reaction.reactant2.coeff} fyrir hvert hvarf, hversu oft getur hvörfin gerst?`,
          hints: {
            topic: 'Þetta snýst um mólhlutföll og stökefnafræði.',
            strategy: 'Deildu fjölda sameinda með stuðlinum til að finna fjölda skipta.',
            method: `Notaðu: fjöldi sameinda ÷ stuðull = fjöldi skipta`,
            solution: `${challenge.r2Count} ÷ ${challenge.reaction.reactant2.coeff} = ${timesR2} skipti`,
          },
        };
      case 'which_is_limiting':
        return {
          title: 'Hvort er takmarkandi hvarfefnið?',
          instruction: `${challenge.reaction.reactant1.formula} getur hvarfast ${timesR1} sinnum, ${challenge.reaction.reactant2.formula} getur hvarfast ${timesR2} sinnum. Hvort takmarkar hvörfin?`,
          hints: {
            topic: 'Þetta snýst um að bera kennsl á takmarkandi hvarfefni.',
            strategy: 'Takmarkandi hvarfefnið er það sem gefur FÆRRI hvarfaskipti.',
            method: 'Berðu saman fjölda skipta. Lægri talan ákvarðar takmarkandi hvarfefnið.',
            solution: `${challenge.reaction.reactant1.formula}: ${timesR1} skipti. ${challenge.reaction.reactant2.formula}: ${timesR2} skipti. ${timesR1 < timesR2 ? timesR1 : timesR2} < ${timesR1 < timesR2 ? timesR2 : timesR1}, svo ${limitingReactant} er takmarkandi.`,
          },
        };
      case 'count_products':
        return {
          title: `Hversu margar ${challenge.reaction.products[0].formula} myndast?`,
          instruction: `Hvörfin geta gerst ${timesReactionRuns} sinnum. Stuðull ${challenge.reaction.products[0].formula} er ${challenge.reaction.products[0].coeff}. Hversu margar myndast?`,
          hints: {
            topic: 'Þetta snýst um að reikna afurðir úr stökefnafræði.',
            strategy: 'Margfaldaðu fjölda skipta með stuðli afurðar.',
            method: `Notaðu: afurðir = fjöldi skipta × stuðull afurðar`,
            solution: `${timesReactionRuns} × ${challenge.reaction.products[0].coeff} = ${productCount} ${challenge.reaction.products[0].formula}`,
          },
        };
      case 'count_excess':
        return {
          title: 'Hversu margar sameindur verða eftir?',
          instruction: `Hvörfin geta gerst ${timesReactionRuns} sinnum. Hversu margar sameindur af afgangshvarfefninu verða eftir?`,
          hints: {
            topic: 'Þetta snýst um að reikna afgang hvarfefnis.',
            strategy: 'Finndu hversu mikið var notað og dragðu frá upphaflegu magni.',
            method: `Afgangur = upphaflegur fjöldi - (fjöldi skipta × stuðull)`,
            solution: `Afgangshvarfefni: ${timesR1 <= timesR2 ? challenge.reaction.reactant2.formula : challenge.reaction.reactant1.formula}. Afgangur = ${timesR1 <= timesR2 ? challenge.r2Count : challenge.r1Count} - (${timesReactionRuns} × ${timesR1 <= timesR2 ? challenge.reaction.reactant2.coeff : challenge.reaction.reactant1.coeff}) = ${excessCount}`,
          },
        };
      default:
        return {
          title: '',
          instruction: '',
          hints: { topic: '', strategy: '', method: '', solution: '' },
        };
    }
  };

  const info = getChallengeInfo();

  // Render challenge options
  const renderOptions = () => {
    switch (challenge.type) {
      case 'which_runs_out':
      case 'which_is_limiting':
        return (
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => !showFeedback && checkAnswer(challenge.reaction.reactant1.formula)}
              disabled={showFeedback}
              className={`p-6 rounded-xl border-4 transition-all ${
                showFeedback && selectedAnswer === challenge.reaction.reactant1.formula
                  ? isCorrect
                    ? 'border-green-500 bg-green-50'
                    : 'border-red-500 bg-red-50'
                  : showFeedback && limitingReactant === challenge.reaction.reactant1.formula
                    ? 'border-green-500 bg-green-50'
                    : 'border-warm-200 hover:border-orange-300 hover:bg-orange-50'
              }`}
            >
              <div className="text-center mb-4">
                <div className="text-2xl font-bold">{challenge.reaction.reactant1.formula}</div>
                <div className="text-sm text-warm-600">{challenge.r1Count} sameindur</div>
                <div className="text-xs text-warm-500">
                  Stuðull: {challenge.reaction.reactant1.coeff}
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-1">
                {Array.from({ length: Math.min(challenge.r1Count, 8) }).map((_, i) => (
                  <Molecule
                    key={i}
                    formula={challenge.reaction.reactant1.formula}
                    color={challenge.reaction.reactant1.color}
                    size={30}
                  />
                ))}
                {challenge.r1Count > 8 && (
                  <span className="text-warm-500">+{challenge.r1Count - 8}</span>
                )}
              </div>
            </button>

            <button
              onClick={() => !showFeedback && checkAnswer(challenge.reaction.reactant2.formula)}
              disabled={showFeedback}
              className={`p-6 rounded-xl border-4 transition-all ${
                showFeedback && selectedAnswer === challenge.reaction.reactant2.formula
                  ? isCorrect
                    ? 'border-green-500 bg-green-50'
                    : 'border-red-500 bg-red-50'
                  : showFeedback && limitingReactant === challenge.reaction.reactant2.formula
                    ? 'border-green-500 bg-green-50'
                    : 'border-warm-200 hover:border-orange-300 hover:bg-orange-50'
              }`}
            >
              <div className="text-center mb-4">
                <div className="text-2xl font-bold">{challenge.reaction.reactant2.formula}</div>
                <div className="text-sm text-warm-600">{challenge.r2Count} sameindur</div>
                <div className="text-xs text-warm-500">
                  Stuðull: {challenge.reaction.reactant2.coeff}
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-1">
                {Array.from({ length: Math.min(challenge.r2Count, 8) }).map((_, i) => (
                  <Molecule
                    key={i}
                    formula={challenge.reaction.reactant2.formula}
                    color={challenge.reaction.reactant2.color}
                    size={30}
                  />
                ))}
                {challenge.r2Count > 8 && (
                  <span className="text-warm-500">+{challenge.r2Count - 8}</span>
                )}
              </div>
            </button>
          </div>
        );

      case 'count_times_r1':
      case 'count_times_r2':
      case 'count_products':
      case 'count_excess': {
        const correctAnswer =
          challenge.type === 'count_times_r1'
            ? timesR1
            : challenge.type === 'count_times_r2'
              ? timesR2
              : challenge.type === 'count_products'
                ? productCount
                : excessCount;

        // Generate options including correct answer
        const options = new Set<number>([correctAnswer]);
        options.add(correctAnswer + 1);
        options.add(Math.max(0, correctAnswer - 1));
        options.add(correctAnswer * 2);
        if (correctAnswer > 2) options.add(Math.floor(correctAnswer / 2));

        const shuffledNumericOptions = shuffleArray(Array.from(options).slice(0, 4));

        return (
          <div className="grid grid-cols-4 gap-3">
            {shuffledNumericOptions.map((num) => (
              <button
                key={num}
                onClick={() => !showFeedback && checkAnswer(num)}
                disabled={showFeedback}
                className={`p-4 rounded-xl border-4 font-bold text-xl transition-all ${
                  showFeedback && selectedAnswer === num
                    ? isCorrect
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-red-500 bg-red-50 text-red-700'
                    : showFeedback && num === correctAnswer
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-warm-200 hover:border-orange-300 hover:bg-orange-50'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-warm-800">Takmarkandi - Stig 1</h1>
              <p className="text-sm text-warm-600">Skildu hugtökin sjónrænt</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{score}</div>
              <div className="text-xs text-warm-600">Stig</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-warm-500 mb-1">
              <span>
                Áskorun {challengeIndex + 1}/{totalChallenges}
              </span>
              <span>
                {correctCount}/{masteryThreshold} rétt
              </span>
            </div>
            <div className="h-2 bg-warm-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 transition-all duration-500"
                style={{ width: `${((challengeIndex + 1) / totalChallenges) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Equation display */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-4">
          <div className="text-center text-xl font-mono bg-warm-50 p-3 rounded-lg">
            {challenge.reaction.equation}
          </div>
        </div>

        {/* Challenge */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-4">
          <h2 className="text-xl font-bold text-warm-800 mb-2">{info.title}</h2>
          <p className="text-warm-600 mb-6">{info.instruction}</p>

          {renderOptions()}
        </div>

        {/* Feedback */}
        {showFeedback && (
          <div className="mb-4">
            <FeedbackPanel
              feedback={{
                isCorrect,
                explanation: isCorrect
                  ? `Rétt! ${info.hints.solution}`
                  : `${
                      challenge.type === 'which_runs_out' || challenge.type === 'which_is_limiting'
                        ? `Rétt svar: ${limitingReactant}`
                        : challenge.type === 'count_times_r1'
                          ? `Rétt svar: ${timesR1}`
                          : challenge.type === 'count_times_r2'
                            ? `Rétt svar: ${timesR2}`
                            : challenge.type === 'count_products'
                              ? `Rétt svar: ${productCount}`
                              : `Rétt svar: ${excessCount}`
                    }. ${info.hints.solution}`,
                misconception: isCorrect ? undefined : MISCONCEPTIONS[challenge.type],
                relatedConcepts: RELATED_CONCEPTS[challenge.type],
                nextSteps: isCorrect
                  ? 'Þú skilur þetta hugtak vel. Haltu áfram!'
                  : 'Lestu útskýringuna og reyndu að nota aðferðina í næstu áskorun.',
              }}
              config={{
                showExplanation: true,
                showMisconceptions: !isCorrect,
                showRelatedConcepts: true,
                showNextSteps: true,
              }}
            />

            {/* Reaction Animation Toggle */}
            <div className="mt-4">
              <button
                onClick={() => setShowAnimation(!showAnimation)}
                className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                  showAnimation
                    ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                    : 'bg-purple-500 hover:bg-purple-600 text-white'
                }`}
              >
                {showAnimation ? '🎬 Fela hreyfimynd' : '🎬 Sjá hvörfin í hreyfimynd'}
              </button>

              {showAnimation && (
                <div className="mt-4">
                  <ReactionAnimation
                    reactant1={challenge.reaction.reactant1}
                    reactant2={challenge.reaction.reactant2}
                    products={challenge.reaction.products}
                    r1Count={challenge.r1Count}
                    r2Count={challenge.r2Count}
                    showResult={true}
                    autoPlay={false}
                  />
                </div>
              )}
            </div>

            <button
              onClick={nextChallenge}
              className="mt-3 w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              {challengeIndex + 1 < totalChallenges ? 'Næsta áskorun →' : 'Sjá niðurstöður →'}
            </button>
          </div>
        )}

        {/* Tiered Hint System */}
        <HintSystem
          hints={info.hints}
          basePoints={10}
          onHintUsed={() => setTotalHintsUsed((prev) => prev + 1)}
          onPointsChange={setHintMultiplier}
          disabled={showFeedback}
          resetKey={challengeIndex}
          className="mb-4"
        />

        {/* Educational note */}
        <div className="bg-blue-50 rounded-xl p-4 mb-4">
          <h3 className="font-bold text-blue-800 mb-2">Lykilhugmynd:</h3>
          <p className="text-sm text-warm-700">
            {challenge.type === 'which_runs_out' &&
              'Takmarkandi hvarfefni er það sem eyðist fyrst. Það ákvarðar hversu mikið af afurðum getur myndast.'}
            {challenge.type === 'count_times_r1' &&
              'Til að finna hversu oft hvarf getur gerst, deilir þú fjölda sameinda með stuðli úr jöfnunni.'}
            {challenge.type === 'count_times_r2' &&
              'Fjöldi skipta = fjöldi sameinda ÷ stuðull. Þetta segir þér hversu oft hvörfin geta gerst.'}
            {challenge.type === 'which_is_limiting' &&
              'Berðu saman fjölda skipta. Hvarfefnið sem gefur FÆRRI skipti er takmarkandi.'}
            {challenge.type === 'count_products' &&
              'Afurðir = fjöldi skipta × stuðull afurðar. Notaðu fjölda skipta frá takmarkandi hvarfefni.'}
            {challenge.type === 'count_excess' &&
              'Afgangur = upphafleg - notuð. Notaðu fjölda skipta og stuðul til að finna hversu margar voru notaðar.'}
          </p>
        </div>

        {/* Back button */}
        <button
          onClick={onBack}
          className="w-full text-warm-500 hover:text-warm-700 font-semibold py-2"
        >
          ← Til baka í valmynd
        </button>
      </div>
    </div>
  );
}

export default Level1;
