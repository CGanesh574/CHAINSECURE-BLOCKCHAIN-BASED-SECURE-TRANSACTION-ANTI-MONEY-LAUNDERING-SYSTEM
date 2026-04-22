const mongoose = require('mongoose');

/**
 * Notification Schema
 * Stores user notifications for AML violations and account actions
 */
const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['AML_VIOLATION', 'ACCOUNT_UNBLOCKED', 'SYSTEM'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    isRead: {
        type: Boolean,
        default: false
    },
    metadata: {
        ruleName: String,
        transactionHash: String,
        amount: String,
        adminId: mongoose.Schema.Types.ObjectId
    }
}, {
    timestamps: true
});

// Index for faster queries
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
