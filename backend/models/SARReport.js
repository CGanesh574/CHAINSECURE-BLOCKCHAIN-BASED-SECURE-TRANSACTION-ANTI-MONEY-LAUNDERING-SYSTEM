const mongoose = require('mongoose');

const sarReportSchema = new mongoose.Schema({
    reportId: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    walletAddress: {
        type: String,
        required: true
    },
    userDetails: {
        name: String,
        email: String,
        phone: String,
        age: Number,
        gender: String
    },
    violationType: {
        type: String,
        required: true
    },
    violatedRules: [{
        ruleName: String,
        severity: String,
        reason: String,
        timestamp: Date
    }],
    transactionDetails: {
        transactionHash: String,
        amount: String,
        timestamp: Date,
        from: String,
        to: String
    },
    blockTimestamp: {
        type: Date,
        required: true,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['PENDING', 'REVIEWED', 'CLOSED'],
        default: 'PENDING'
    },
    investigationNotes: {
        type: String,
        default: ''
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviewedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Index for faster queries (reportId already has unique index from schema)
sarReportSchema.index({ userId: 1 });
sarReportSchema.index({ walletAddress: 1 });
sarReportSchema.index({ blockTimestamp: -1 });
sarReportSchema.index({ status: 1 });

module.exports = mongoose.model('SARReport', sarReportSchema);
