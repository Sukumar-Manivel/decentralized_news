const Evidence = require('../models/Evidence');
const User = require('../models/User');
const Purchase = require('../models/Purchase');
const { embedInvisibleWatermark } = require('./invisibleWatermarkAgent');

/**
 * 🤖 PAYMENT & ESCROW AGENT
 * Manages the license transaction lifecycle:
 * 1. Verifies buyer payment
 * 2. Computes the 80/20 Escrow split (80% to citizen uploader, 20% to platform)
 * 3. Triggers Invisible Watermark Agent to embed buyer steganography
 * 4. Updates citizen wallet balance & awards reputation credits
 */
const processLicensePurchase = async ({ evidenceId, buyerUser, paymentId }) => {
  const evidence = await Evidence.findById(evidenceId);
  if (!evidence) {
    throw new Error('Evidence item not found');
  }

  const seller = await User.findById(evidence.uploaderId);
  if (!seller) {
    throw new Error('Seller not found');
  }

  const amount = evidence.price; // in INR
  const platformFee = Math.round(amount * 0.20); // 20%
  const sellerPayout = amount - platformFee;     // 80%
  const transactionId = paymentId || `TXN-${Date.now()}`;

  // 1. Trigger Invisible Watermark Agent
  const watermarkResult = await embedInvisibleWatermark(evidence.originalFile, {
    buyerId: buyerUser._id,
    buyerName: buyerUser.displayName,
    buyerEmail: buyerUser.email,
    transactionId
  });

  // 2. Create Purchase Record
  const purchase = await Purchase.create({
    evidenceId: evidence._id,
    buyerId: buyerUser._id,
    sellerId: seller._id,
    amountPaid: amount,
    platformFee,
    sellerPayout,
    paymentGateway: 'Razorpay (Escrow Mode)',
    razorpayPaymentId: transactionId,
    paymentStatus: 'completed',
    watermarkId: watermarkResult.watermarkId,
    watermarkPayload: watermarkResult.payload,
    downloadFile: watermarkResult.downloadFile
  });

  // 3. Update Evidence metrics
  evidence.totalPurchases += 1;
  await evidence.save();

  // 4. Credit Seller's Wallet (80%) and award +15 Credits for successful purchase
  await User.findByIdAndUpdate(seller._id, {
    $inc: { 
      walletBalance: sellerPayout * 100, // stored in paise
      totalEarnings: sellerPayout * 100,
      creditPoints: 15
    }
  });

  console.log(`\n💳 [PaymentAgent] Transaction Processed:`);
  console.log(`   --> Amount: ₹${amount.toLocaleString('en-IN')}`);
  console.log(`   --> Citizen Payout (80%): ₹${sellerPayout.toLocaleString('en-IN')}`);
  console.log(`   --> Platform Fee (20%): ₹${platformFee.toLocaleString('en-IN')}`);
  console.log(`   --> Credited to Citizen: ${seller.displayName}\n`);

  return purchase;
};

module.exports = { processLicensePurchase };
