const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Purchase = require('../models/Purchase');
const Evidence = require('../models/Evidence');
const { processLicensePurchase } = require('../agents/paymentAgent');

// @route   POST /api/payment/checkout
// @desc    Acquire license for evidence (Razorpay Escrow flow)
// @access  Private (Journalist / Newsroom)
router.post('/checkout', auth, async (req, res, next) => {
  try {
    const { evidenceId, paymentId } = req.body;

    if (!evidenceId) {
      return res.status(400).json({
        success: false,
        message: 'Evidence ID is required'
      });
    }

    // Process transaction through Payment Agent
    const purchase = await processLicensePurchase({
      evidenceId,
      buyerUser: req.user,
      paymentId: paymentId || `PAY-${Date.now()}`
    });

    res.status(201).json({
      success: true,
      message: 'License acquired successfully. Master file unlocked.',
      purchase
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/payment/my-purchases
// @desc    Get list of all licenses acquired by the logged-in user
// @access  Private
router.get('/my-purchases', auth, async (req, res, next) => {
  try {
    const purchases = await Purchase.find({ buyerId: req.user._id })
      .populate('evidenceId')
      .populate('sellerId', 'displayName email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: purchases.length,
      purchases
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/payment/license/:id
// @desc    Get single license certificate details
// @access  Private
router.get('/license/:id', auth, async (req, res, next) => {
  try {
    const purchase = await Purchase.findById(req.params.id)
      .populate('evidenceId')
      .populate('sellerId', 'displayName');

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'License record not found'
      });
    }

    res.status(200).json({
      success: true,
      purchase
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
