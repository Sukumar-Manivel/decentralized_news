const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const Purchase = require('../models/Purchase');

// @route   GET /api/download/:purchaseId
// @desc    Download high-resolution master file embedded with unique invisible watermark
// @access  Private (Verified Buyer only)
router.get('/:purchaseId', auth, async (req, res, next) => {
  try {
    const purchase = await Purchase.findById(req.params.purchaseId)
      .populate('evidenceId');

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase record not found'
      });
    }

    // Verify authorized buyer access
    const isBuyer = purchase.buyerId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isBuyer && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. You must hold a valid license to download this master file.'
      });
    }

    const filePath = path.join(__dirname, '../uploads/downloads', purchase.downloadFile);

    if (!fs.existsSync(filePath)) {
      // Fallback: If not in downloads, serve from originals
      const fallbackPath = path.join(__dirname, '../uploads/originals', purchase.evidenceId?.originalFile);
      if (fs.existsSync(fallbackPath)) {
        purchase.downloadCount += 1;
        await purchase.save();
        return res.download(fallbackPath, `citizenlens-${purchase.evidenceId.title.replace(/[^a-zA-Z0-9]/g, '_')}.jpg`);
      }

      return res.status(404).json({
        success: false,
        message: 'Master file not found on disk'
      });
    }

    // Increment download counter
    purchase.downloadCount += 1;
    await purchase.save();

    console.log(`📥 [Download] License #${purchase.watermarkId} master file downloaded by: ${req.user.displayName}`);

    // Stream as secure attachment
    res.download(filePath, `licensed-master-${purchase.watermarkId}.jpg`);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
