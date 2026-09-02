const User = require('../models/User');

/**
 * 🤖 CREDIT POINTS AGENT (Reputation & Visibility Engine)
 * Manages zero-cost reputation credits, calculates reporter levels (1-5),
 * and computes queue visibility boosts in the marketplace feed.
 * 
 * Formulas:
 * - 10 credits = 1 minute queue visibility boost
 * - Level 1: 0 - 20 pts (Rookie)
 * - Level 2: 21 - 50 pts (Active)
 * - Level 3: 51 - 100 pts (Pro Reporter)
 * - Level 4: 101 - 250 pts (Elite Reporter)
 * - Level 5: 250+ pts (Legend Reporter)
 */
const calculateLevel = (credits) => {
  if (credits >= 250) return { level: 5, title: 'Legend Reporter', multiplier: 1.5 };
  if (credits >= 101) return { level: 4, title: 'Elite Reporter', multiplier: 1.3 };
  if (credits >= 51)  return { level: 3, title: 'Pro Reporter', multiplier: 1.2 };
  if (credits >= 21)  return { level: 2, title: 'Active Reporter', multiplier: 1.1 };
  return { level: 1, title: 'Rookie Reporter', multiplier: 1.0 };
};

const getVisibilityBoostMinutes = (credits) => {
  // 10 credits = 1 minute boost
  return Math.min(60, Math.floor(credits / 10));
};

const awardCredits = async (userId, amount, reason) => {
  const user = await User.findById(userId);
  if (!user) return;

  user.creditPoints = (user.creditPoints || 0) + amount;
  const levelInfo = calculateLevel(user.creditPoints);
  user.reporterLevel = levelInfo.level;

  await user.save();
  console.log(`⭐ [CreditPointsAgent] User ${user.displayName} awarded +${amount} credits for "${reason}". Total: ${user.creditPoints} (${levelInfo.title})`);
  return {
    creditPoints: user.creditPoints,
    level: levelInfo.level,
    levelTitle: levelInfo.title,
    boostMinutes: getVisibilityBoostMinutes(user.creditPoints)
  };
};

module.exports = {
  calculateLevel,
  getVisibilityBoostMinutes,
  awardCredits
};
