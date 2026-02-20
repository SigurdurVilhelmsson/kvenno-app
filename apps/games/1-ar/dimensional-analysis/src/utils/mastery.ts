import { Level1Progress, Level2Progress, Level3Progress } from '@shared/types';

/**
 * Check if Level 1 has been mastered
 * Requires: 6 questions answered, 5+ correct
 * (Level 1 is conceptual with exactly 6 challenges and no explanation scoring)
 */
export const checkLevel1Mastery = (level1Data: Level1Progress): boolean => {
  const { questionsCorrect, questionsAnswered } = level1Data;
  if (questionsAnswered < 6) return false;

  return questionsCorrect >= 5;
};

/**
 * Check if Level 2 has been mastered
 * Requires: 15+ problems completed, 0.7+ prediction accuracy, 0.8+ answer accuracy
 */
export const checkLevel2Mastery = (level2Data: Level2Progress): boolean => {
  const { problemsCompleted, predictionsMade, predictionsCorrect, finalAnswersCorrect } = level2Data;
  if (problemsCompleted < 15) return false;

  const predictionAccuracy = predictionsMade > 0 ? predictionsCorrect / predictionsMade : 0;
  const answerAccuracy = problemsCompleted > 0 ? finalAnswersCorrect / problemsCompleted : 0;

  return predictionAccuracy >= 0.7 && answerAccuracy >= 0.8;
};

/**
 * Check if Level 3 has been mastered
 * Requires: 10+ problems completed, 0.75+ average composite score
 */
export const checkLevel3Mastery = (level3Data: Level3Progress): boolean => {
  const { compositeScores } = level3Data;
  if (compositeScores.length < 10) return false;

  const avgScore = compositeScores.reduce((a, b) => a + b, 0) / compositeScores.length;
  return avgScore >= 0.75;
};

/**
 * Achievement definition
 */
export interface Achievement {
  id: string;
  name: string;
  description: string;
}

/**
 * Check for earned achievements based on Level 3 performance
 */
export const checkAchievements = (level3Data: {
  compositeScores: number[];
  problemsCompleted: number;
  totalSteps?: number;
}): Achievement[] => {
  const achievements: Achievement[] = [];
  const { compositeScores, problemsCompleted, totalSteps = 0 } = level3Data;

  if (compositeScores.length >= 10) {
    const avgScore = compositeScores.reduce((a, b) => a + b, 0) / compositeScores.length;

    // Score-based achievements
    if (avgScore >= 0.95) {
      achievements.push({ id: 'gold', name: 'Gullstjarna', description: '95%+ heildareinkunn' });
    } else if (avgScore >= 0.85) {
      achievements.push({ id: 'silver', name: 'Silfurstjarna', description: '85%+ heildareinkunn' });
    } else if (avgScore >= 0.75) {
      achievements.push({ id: 'bronze', name: 'Bronsstjarna', description: '75%+ heildareinkunn' });
    }

    // Efficiency achievement
    if (totalSteps > 0) {
      const avgSteps = totalSteps / problemsCompleted;
      if (avgSteps < 3) {
        achievements.push({ id: 'efficiency', name: 'Skilvirkni', description: 'Að meðaltali færri en 3 skref' });
      }
    }

    // Perfect explanations achievement
    const perfectExplanations = compositeScores.every(score => score >= 0.9);
    if (perfectExplanations) {
      achievements.push({ id: 'explainer', name: 'Útskýrandi', description: 'Fullkomnar útskýringar' });
    }
  }

  return achievements;
};
