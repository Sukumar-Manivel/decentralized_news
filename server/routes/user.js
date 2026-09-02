const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Evidence = require('../models/Evidence');
const { calculateLevel, getVisibilityBoostMinutes } = require('../agents/creditPointsAgent');

// @route   GET /api/user/wallet
// @desc    Get wallet balance, earnings, and payout status
// @access  Private
router.get('/wallet', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    const balanceInRupees = (user.walletBalance || 0) / 100;
    const totalEarningsInRupees = (user.totalEarnings || 0) / 100;

    res.status(200).json({
      success: true,
      wallet: {
        balance: balanceInRupees,
        totalEarnings: totalEarningsInRupees,
        totalUploads: user.totalUploads || 0
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/user/withdraw
// @desc    Withdraw wallet balance to bank account
// @access  Private
router.post('/withdraw', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if ((user.walletBalance || 0) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance to withdraw'
      });
    }

    const withdrawnAmount = user.walletBalance / 100;
    user.walletBalance = 0;
    await user.save();

    res.status(200).json({
      success: true,
      message: `₹${withdrawnAmount.toLocaleString('en-IN')} successfully transferred to your registered bank account.`,
      withdrawnAmount
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/user/credits
// @desc    Get user reputation credits, rank level, and visibility boost
// @access  Private
router.get('/credits', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const credits = user.creditPoints || 0;
    const levelInfo = calculateLevel(credits);
    const boostMinutes = getVisibilityBoostMinutes(credits);

    res.status(200).json({
      success: true,
      credits: {
        points: credits,
        level: levelInfo.level,
        title: levelInfo.title,
        multiplier: levelInfo.multiplier,
        visibilityBoostMinutes: boostMinutes
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/user/leaderboard
// @desc    Get top reporters leaderboard
// @access  Public
router.get('/leaderboard', async (req, res, next) => {
  try {
    const topReporters = await User.find({ role: 'citizen' })
      .select('displayName reporterLevel creditPoints totalUploads totalEarnings')
      .sort({ creditPoints: -1, totalEarnings: -1 })
      .limit(10);

    const formatted = topReporters.map((rep, idx) => {
      const levelInfo = calculateLevel(rep.creditPoints || 0);
      return {
        rank: idx + 1,
        id: rep._id,
        displayName: rep.displayName,
        creditPoints: rep.creditPoints || 0,
        level: levelInfo.level,
        levelTitle: levelInfo.title,
        totalUploads: rep.totalUploads || 0,
        totalEarnings: (rep.totalEarnings || 0) / 100
      };
    });

    res.status(200).json({
      success: true,
      leaderboard: formatted
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
