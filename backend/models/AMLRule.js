const mongoose = require('mongoose');

const amlRuleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    ruleType: {
        type: String,
        required: true,
        enum: ['transaction_limit', 'velocity', 'pattern', 'geographic', 'identity', 'behavioral', 'compliance', 'watchlist', 'threshold', 'frequency', 'receiver_pattern']
    },
    severity: {
        type: String,
        required: true,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    parameters: {
        // Flexible parameters object for different rule types
        threshold: Number,
        timeWindow: Number, // in seconds
        maxAmount: Number,
        minAmount: Number,
        maxTransactions: Number,
        countries: [String],
        patterns: [String],
        percentage: Number
    },
    action: {
        type: String,
        enum: ['alert', 'block', 'review', 'flag'],
        default: 'alert'
    },
    blockTarget: {
        type: String,
        enum: ['sender', 'receiver', 'both'],
        default: 'sender'
    },
    priority: {
        type: Number,
        default: 1,
        min: 1,
        max: 10
    },
    triggeredCount: {
        type: Number,
        default: 0
    },
    lastTriggered: {
        type: Date
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Index for faster queries
amlRuleSchema.index({ isActive: 1, severity: 1 });
amlRuleSchema.index({ ruleType: 1 });
amlRuleSchema.index({ blockTarget: 1 });

module.exports = mongoose.model('AMLRule', amlRuleSchema);
