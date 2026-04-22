const mongoose = require('mongoose');

/**
 * User Schema
 * Stores user registration data and wallet information
 */
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true,
        min: 18
    },
    gender: {
        type: String,
        required: true,
        enum: ['Male', 'Female', 'Other']
    },
    walletAddress: {
        type: String,
        required: false,
        lowercase: true,
        default: ''
    },
    isWalletVerified: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    accountStatus: {
        type: String,
        enum: ['ACTIVE', 'BLOCKED'],
        default: 'ACTIVE'
    },
    violatedRuleName: {
        type: String,
        default: ''
    },
    violationDescription: {
        type: String,
        default: ''
    },
    violatedRules: {
        type: [{
            ruleName: String,
            reason: String,
            severity: String,
            timestamp: Date
        }],
        default: []
    },
    blockTimestamp: {
        type: Date
    },
    blockHistory: {
        type: [{
            ruleName: String,
            reason: String,
            severity: String,
            blockedAt: Date,
            unblockedAt: Date,
            unblockedBy: String
        }],
        default: []
    },
    kycStatus: {
        type: String,
        enum: ['NOT_SUBMITTED', 'PENDING', 'APPROVED', 'REJECTED'],
        default: 'NOT_SUBMITTED'
    },
    kycSubmittedAt: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Create unique index for email
userSchema.index({ email: 1 }, { unique: true });
// Create sparse unique index for walletAddress (allows multiple empty values)
userSchema.index({ walletAddress: 1 }, { unique: true, sparse: true, partialFilterExpression: { walletAddress: { $ne: '' } } });

module.exports = mongoose.model('User', userSchema);
