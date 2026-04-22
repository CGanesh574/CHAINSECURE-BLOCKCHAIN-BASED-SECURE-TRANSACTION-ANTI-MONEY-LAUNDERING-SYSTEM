const mongoose = require('mongoose');

/**
 * KYC Schema
 * Stores KYC verification documents and status
 */
const kycSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    documentType: {
        type: String,
        enum: ['aadhaar', 'pan', 'driving_license', 'passport', 'voter_id'],
        required: true
    },
    documentNumber: {
        type: String,
        required: true,
        trim: true
    },
    documentImage: {
        data: Buffer,
        contentType: String
    },
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        default: 'PENDING'
    },
    rejectionReason: {
        type: String,
        default: ''
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviewedAt: {
        type: Date
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for faster queries
kycSchema.index({ userId: 1 });
kycSchema.index({ status: 1 });
kycSchema.index({ createdAt: -1 });

module.exports = mongoose.model('KYC', kycSchema);
