const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const Evidence = require('../models/Evidence');
const User = require('../models/User');
const { generateSHA256 } = require('../utils/hash');
const { extractEXIF } = require('../utils/exif');
const { performELA } = require('../utils/ela');
const { generateVisibleWatermark } = require('./watermarkAgent');

/**
 * 🤖 VERIFICATION AGENT
 * Automated background processor that inspects uploaded evidence,
 * performs cryptographic and forensic checks, calculates the Trust Score (0-100),
 * and awards reputation credits to the uploader.
 */
const runVerificationAgent = async (evidenceId) => {
  try {
    const evidence = await Evidence.findById(evidenceId);
    if (!evidence) {
      console.error(`[VerificationAgent] Evidence with ID ${evidenceId} not found.`);
      return;
    }

    console.log(`\n🤖 [VerificationAgent] Starting forensic pipeline for: "${evidence.title}" (${evidence._id})`);

    const filePath = path.join(__dirname, '../uploads/originals', evidence.originalFile);
    if (!fs.existsSync(filePath)) {
      console.error(`[VerificationAgent] File not found on disk: ${filePath}`);
      return;
    }

    // STAGE 1: Cryptographic Integrity (SHA-256)
    console.log('   [1/5] Calculating SHA-256 integrity hash...');
    const fileHash = await generateSHA256(filePath);
    console.log(`   --> SHA-256: ${fileHash.substring(0, 16)}...`);

    // STAGE 2: Forensic Error Level Analysis (ELA)
    console.log('   [2/5] Running Error Level Analysis (ELA)...');
    const elaResult = await performELA(filePath);
    console.log(`   --> ELA Score: ${elaResult.elaScore} (Edited: ${elaResult.isEdited}, AI: ${elaResult.isAiGenerated})`);

    // STAGE 3: EXIF Metadata Extraction (Camera, Time, GPS)
    console.log('   [3/5] Extracting EXIF metadata...');
    const exifResult = await extractEXIF(filePath);
    const hasExif = exifResult.hasExif;
    if (hasExif) {
      console.log(`   --> Camera: ${exifResult.data.make || 'Unknown'} ${exifResult.data.model || ''}`);
      if (exifResult.data.gps) {
        console.log(`   --> GPS: Lat ${exifResult.data.gps.latitude}, Long ${exifResult.data.gps.longitude}`);
      }
    } else {
      console.log('   --> No EXIF headers (typical for dashcams/CCTV/web uploads)');
    }

    // STAGE 4: Thumbnail Generation for Marketplace Display
    const thumbnailName = `thumb-${path.parse(evidence.originalFile).name}.jpg`;
    const thumbnailPath = path.join(__dirname, '../uploads/thumbnails', thumbnailName);

    if (evidence.mediaType === 'photo') {
      try {
        await sharp(filePath)
          .resize(400, 250, { fit: 'cover' })
          .jpeg({ quality: 80 })
          .toFile(thumbnailPath);
        evidence.thumbnailFile = thumbnailName;
      } catch (thumbErr) {
        evidence.thumbnailFile = evidence.originalFile;
      }
    } else {
      // For video in MVP, thumbnail defaults to original or placeholder
      evidence.thumbnailFile = evidence.originalFile;
    }

    // STAGE 5: Trust Score Calculation (0 - 100)
    let score = 20; // Base points for valid file & verified SHA-256 hash

    // Core checks (applicable to all media)
    if (!elaResult.isEdited) score += 30; // Compression is uniform
    if (!elaResult.isAiGenerated) score += 20; // Natural sensor noise detected

    // Bonus checks (when device metadata is available)
    if (hasExif) {
      score += 10; // Genuine original camera container
      if (exifResult.data.make || exifResult.data.model) score += 10; // Hardware footprint verified
      if (exifResult.data.gps) score += 10; // GPS location anchored
    }

    score = Math.min(100, Math.max(10, score));

    // Determine verification status
    const status = score >= 50 ? 'verified' : 'flagged';

    // Generate protected preview with visible watermark
    const previewFilename = await generateVisibleWatermark(evidence.originalFile);

    // Update Evidence document
    evidence.trustScore = score;
    evidence.verificationStatus = status;
    evidence.previewFile = previewFilename;
    evidence.verificationDetails = {
      hashSHA256: fileHash,
      isAiGenerated: elaResult.isAiGenerated,
      isEdited: elaResult.isEdited,
      elaScore: elaResult.elaScore,
      exifPresent: hasExif,
      exifData: exifResult.data ? {
        make: exifResult.data.make,
        model: exifResult.data.model,
        dateTime: exifResult.data.dateTime,
        gps: exifResult.data.gps
      } : null
    };

    await evidence.save();
    console.log(`   🎯 [VerificationAgent] Completed! Final Trust Score: ${score}/100 (${status.toUpperCase()})`);

    // STAGE 6: Reputation Credit Reward for Citizen
    let creditBonus = 0;
    if (score >= 80) creditBonus = 10;
    else if (score >= 60) creditBonus = 5;
    else creditBonus = 2;

    await User.findByIdAndUpdate(evidence.uploaderId, {
      $inc: { creditPoints: creditBonus, totalUploads: 1 }
    });
    console.log(`   ⭐ [VerificationAgent] Awarded +${creditBonus} credit points to uploader.\n`);

    return evidence;
  } catch (error) {
    console.error(`[VerificationAgent] Execution failed for ${evidenceId}:`, error);
  }
};

module.exports = { runVerificationAgent };
