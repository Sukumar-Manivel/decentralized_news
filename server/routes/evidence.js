const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const Evidence = require('../models/Evidence');
const { runVerificationAgent } = require('../agents/verificationAgent');

// @route   POST /api/evidence
// @desc    Upload new evidence and trigger automated forensic verification
// @access  Private (Citizen / CCTV Operator)
router.post('/', auth, upload.single('media'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a photo or video file'
      });
    }

    const { title, description, price } = req.body;

    if (!title || !price) {
      return res.status(400).json({
        success: false,
        message: 'Title and Price are required'
      });
    }

    const mediaType = req.file.mimetype.startsWith('video/') ? 'video' : 'photo';

    // 1. Create Evidence document in MongoDB
    const evidence = await Evidence.create({
      uploaderId: req.user._id,
      title,
      description,
      mediaType,
      originalFile: req.file.filename,
      thumbnailFile: req.file.filename,
      previewFile: req.file.filename,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      price: Number(price)
    });

    // 2. Run Verification Agent immediately
    const verifiedEvidence = await runVerificationAgent(evidence._id);

    res.status(201).json({
      success: true,
      message: 'Evidence uploaded and verified successfully',
      evidence: verifiedEvidence || evidence
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/evidence
// @desc    Get all active evidence items for marketplace
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    const { mediaType, minTrustScore, sort } = req.query;
    const query = { status: 'active' };

    if (mediaType) query.mediaType = mediaType;
    if (minTrustScore) query.trustScore = { $gte: Number(minTrustScore) };

    let sortOption = { createdAt: -1 };
    if (sort === 'trust') sortOption = { trustScore: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    if (sort === 'price_desc') sortOption = { price: -1 };

    const evidenceList = await Evidence.find(query)
      .populate('uploaderId', 'displayName creditPoints reporterLevel')
      .sort(sortOption);

    res.status(200).json({
      success: true,
      count: evidenceList.length,
      evidence: evidenceList
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/evidence/my
// @desc    Get all evidence uploaded by the logged-in user
// @access  Private
router.get('/my', auth, async (req, res, next) => {
  try {
    const myEvidence = await Evidence.find({ uploaderId: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: myEvidence.length,
      evidence: myEvidence
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/evidence/:id
// @desc    Get full details of a single evidence item
// @access  Public
router.get('/:id', async (req, res, next) => {
  try {
    const evidence = await Evidence.findById(req.params.id)
      .populate('uploaderId', 'displayName creditPoints reporterLevel');

    if (!evidence) {
      return res.status(404).json({
        success: false,
        message: 'Evidence item not found'
      });
    }

    // Increment view count
    evidence.totalViews += 1;
    await evidence.save();

    res.status(200).json({
      success: true,
      evidence
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
