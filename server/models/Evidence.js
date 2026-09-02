const mongoose = require('mongoose');

// Evidence Schema represents uploaded media (photo or video) with forensic authenticity data
const evidenceSchema = new mongoose.Schema({
  uploaderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please provide a title for the evidence'],
    trim: true,
    maxlength: [150, 'Title cannot be more than 150 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  mediaType: {
    type: String,
    enum: ['photo', 'video'],
    required: true
  },
  
  // Stored file names inside server/uploads subdirectories
  originalFile: {
    type: String,
    required: true
  },
  previewFile: {
    type: String
  },
  thumbnailFile: {
    type: String
  },
  fileSize: {
    type: Number
  },
  mimeType: {
    type: String
  },

  // Pricing in INR (e.g. ₹15,000)
  price: {
    type: Number,
    required: [true, 'Please set a price for your evidence'],
    min: [100, 'Price must be at least ₹100']
  },

  // Automated Verification Agent outputs
  trustScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'flagged'],
    default: 'pending'
  },
  verificationDetails: {
    hashSHA256: { type: String },
    isAiGenerated: { type: Boolean, default: false },
    isEdited: { type: Boolean, default: false },
    elaScore: { type: Number, default: 0 },
    exifPresent: { type: Boolean, default: false },
    exifData: {
      make: String,
      model: String,
      dateTime: String,
      gps: {
        latitude: Number,
        longitude: Number
      }
    }
  },

  // Dynamic tags
  freshnessTag: {
    type: String,
    enum: ['breaking', 'recent', 'archival'],
    default: 'breaking'
  },

  totalPurchases: {
    type: Number,
    default: 0
  },
  totalViews: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'sold_exclusive', 'archived'],
    default: 'active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Evidence', evidenceSchema);
