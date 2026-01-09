// Badge definitions and unlock criteria
const BADGES = {
  // Milestone badges
  FIRST_QUIZ: {
    id: 'first_quiz',
    name: 'First Step',
    description: 'Completed your first quiz',
    icon: '🎯',
    category: 'milestone',
    xpReward: 25,
    unlockCriteria: (stats) => stats.quizzesCompleted >= 1
  },
  QUIZ_MASTER: {
    id: 'quiz_master',
    name: 'Quiz Master',
    description: 'Completed 10 quizzes',
    icon: '🏆',
    category: 'milestone',
    xpReward: 100,
    unlockCriteria: (stats) => stats.quizzesCompleted >= 10
  },
  LEGEND: {
    id: 'legend',
    name: 'Legend',
    description: 'Completed 50 quizzes',
    icon: '👑',
    category: 'milestone',
    xpReward: 250,
    unlockCriteria: (stats) => stats.quizzesCompleted >= 50
  },

  // Performance badges
  PERFECT_SCORE: {
    id: 'perfect_score',
    name: 'Perfect Score',
    description: 'Achieved 100% on a quiz',
    icon: '⭐',
    category: 'performance',
    xpReward: 50,
    unlockCriteria: (stats) => stats.perfectScores >= 1
  },
  ACCURACY_MASTER: {
    id: 'accuracy_master',
    name: 'Accuracy Master',
    description: 'Maintained 90%+ accuracy across 5 quizzes',
    icon: '🎯',
    category: 'performance',
    xpReward: 75,
    unlockCriteria: (stats) => stats.averageAccuracy >= 90 && stats.quizzesCompleted >= 5
  },
  CONSISTENCY_KING: {
    id: 'consistency_king',
    name: 'Consistency King',
    description: 'Scored above 80% on 10 consecutive quizzes',
    icon: '🔥',
    category: 'performance',
    xpReward: 150,
    unlockCriteria: (stats) => stats.consecutiveHighScores >= 10
  },

  // Streak badges
  WEEK_WARRIOR: {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: 'Maintained a 7-day activity streak',
    icon: '⚔️',
    category: 'streak',
    xpReward: 75,
    unlockCriteria: (stats) => stats.currentStreak >= 7
  },
  MONTH_MASTER: {
    id: 'month_master',
    name: 'Month Master',
    description: 'Maintained a 30-day activity streak',
    icon: '🌟',
    category: 'streak',
    xpReward: 200,
    unlockCriteria: (stats) => stats.currentStreak >= 30
  },
  CENTURY_CLUB: {
    id: 'century_club',
    name: 'Century Club',
    description: 'Maintained a 100-day activity streak',
    icon: '💯',
    category: 'streak',
    xpReward: 500,
    unlockCriteria: (stats) => stats.currentStreak >= 100
  },

  // Achievement badges
  CONCEPTS_EXPLORER: {
    id: 'concepts_explorer',
    name: 'Concepts Explorer',
    description: 'Learned 10 different concept topics',
    icon: '🔬',
    category: 'achievement',
    xpReward: 75,
    unlockCriteria: (stats) => stats.topicsLearned >= 10
  },
  CHEMISTRY_SCHOLAR: {
    id: 'chemistry_scholar',
    name: 'Chemistry Scholar',
    description: 'Learned 25 different concept topics',
    icon: '📚',
    category: 'achievement',
    xpReward: 150,
    unlockCriteria: (stats) => stats.topicsLearned >= 25
  },
  EXPERT: {
    id: 'expert',
    name: 'Chemistry Expert',
    description: 'Learned 50 different concept topics',
    icon: '🧪',
    category: 'achievement',
    xpReward: 300,
    unlockCriteria: (stats) => stats.topicsLearned >= 50
  }
};

/**
 * Check which badges should be awarded based on user stats
 * @param {Object} currentBadges - Array of already earned badge IDs
 * @param {Object} stats - User statistics object
 * @returns {Array} Array of newly unlocked badges
 */
function checkBadgeUnlocks(currentBadges, stats) {
  const earnedBadgeIds = currentBadges.map(b => b.id);
  const newBadges = [];

  Object.values(BADGES).forEach(badge => {
    // Only unlock if not already earned and criteria met
    if (!earnedBadgeIds.includes(badge.id) && badge.unlockCriteria(stats)) {
      newBadges.push(badge);
    }
  });

  return newBadges;
}

/**
 * Calculate user level based on total XP
 * @param {Number} totalXp - Total XP points
 * @returns {Object} Object with level and progressToNextLevel
 */
function calculateLevel(totalXp) {
  const XP_PER_LEVEL = 100;
  const level = Math.floor(totalXp / XP_PER_LEVEL) + 1;
  const currentLevelXp = (level - 1) * XP_PER_LEVEL;
  const nextLevelXp = level * XP_PER_LEVEL;
  const progressToNextLevel = Math.min(100, Math.round(((totalXp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100));

  return { level, progressToNextLevel, currentLevelXp, nextLevelXp };
}

/**
 * Award XP for quiz completion
 * @param {Number} score - Quiz score (0-100)
 * @param {String} difficulty - Quiz difficulty (Beginner, Intermediate, Advanced)
 * @returns {Number} XP to award
 */
function getQuizXp(score, difficulty = 'Intermediate') {
  const baseXp = {
    'Beginner': 25,
    'Intermediate': 50,
    'Advanced': 100
  };

  const xpForDifficulty = baseXp[difficulty] || 50;
  const scoreBonus = Math.round((score / 100) * xpForDifficulty * 0.5); // 0-50% bonus based on score

  return xpForDifficulty + scoreBonus;
}

module.exports = {
  BADGES,
  checkBadgeUnlocks,
  calculateLevel,
  getQuizXp
};
