const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  evidenceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Evidence',
    required: true
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  amountPaid: {
    type: Number,
    required: true
  },
  platformFee: {
    type: Number,
    required: true
  },
  sellerPayout: {
    type: Number,
    required: true
  },

  paymentGateway: {
    type: String,
    default: 'Razorpay (Escrow Mode)'
  },
  razorpayOrderId: {
    type: String
  },
  razorpayPaymentId: {
    type: String
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed'
  },

  // Steganographic Invisible Watermark Tagging
  watermarkId: {
    type: String,
    required: true
  },
  watermarkPayload: {
    buyerName: String,
    buyerEmail: String,
    transactionId: String,
    issuedAt: Date
  },
  downloadFile: {
    type: String
  },
  downloadCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Purchase', purchaseSchema);
