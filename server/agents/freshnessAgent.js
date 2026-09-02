const cron = require('node-cron');
const Evidence = require('../models/Evidence');

/**
 * 🤖 FRESHNESS AGENT
 * Runs periodically to automatically classify evidence freshness:
 * - 🔴 BREAKING: Uploaded within the last 6 hours
 * - 🟡 RECENT: Uploaded within the last 7 days
 * - 🔵 ARCHIVAL: Older than 7 days (useful for comparison & historical reporting)
 */
const updateFreshnessTags = async () => {
  try {
    const now = new Date();
    const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // 1. Tag breaking (< 6 hrs)
    const breakingRes = await Evidence.updateMany(
      { createdAt: { $gte: sixHoursAgo }, status: 'active' },
      { freshnessTag: 'breaking' }
    );

    // 2. Tag recent (6 hrs to 7 days)
    const recentRes = await Evidence.updateMany(
      { createdAt: { $lt: sixHoursAgo, $gte: sevenDaysAgo }, status: 'active' },
      { freshnessTag: 'recent' }
    );

    // 3. Tag archival (> 7 days)
    const archivalRes = await Evidence.updateMany(
      { createdAt: { $lt: sevenDaysAgo }, status: 'active' },
      { freshnessTag: 'archival' }
    );

    console.log(`🕒 [FreshnessAgent] Tags refreshed: Breaking(${breakingRes.modifiedCount}), Recent(${recentRes.modifiedCount}), Archival(${archivalRes.modifiedCount})`);
  } catch (error) {
    console.error('[FreshnessAgent] Failed to update freshness tags:', error.message);
  }
};

// Schedule to run every hour: '0 * * * *'
const initFreshnessCron = () => {
  cron.schedule('0 * * * *', () => {
    console.log('⏰ [Cron] Running hourly Freshness Agent...');
    updateFreshnessTags();
  });
  // Also run once on server startup
  updateFreshnessTags();
};

module.exports = { initFreshnessCron, updateFreshnessTags };
