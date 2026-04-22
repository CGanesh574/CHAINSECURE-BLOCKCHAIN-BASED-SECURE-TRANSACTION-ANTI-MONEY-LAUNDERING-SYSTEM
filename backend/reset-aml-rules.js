const mongoose = require('mongoose');
require('dotenv').config();

async function resetAndSeedAMLRules() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');
        
        const AMLRule = require('./models/AMLRule');
        const User = require('./models/User');
        
        // Find admin user
        const admin = await User.findOne({ role: 'admin' });
        if (!admin) {
            console.log('❌ No admin user found. Please create admin first.');
            await mongoose.disconnect();
            return;
        }
        
        console.log(`👤 Using admin: ${admin.email}\n`);
        
        // Delete all existing rules
        const deleteResult = await AMLRule.deleteMany({});
        console.log(`🗑️  Deleted ${deleteResult.deletedCount} existing rules\n`);
        
        // Create new rules with proper parameters
        const defaultRules = [
            {
                name: 'Large Transaction Alert',
                description: 'Triggers when a single transaction exceeds 10 ETH',
                ruleType: 'transaction_limit',
                severity: 'high',
                parameters: {
                    maxAmount: 10,  // 10 ETH
                    threshold: 10
                },
                action: 'block',
                priority: 9,
                isActive: true,
                createdBy: admin._id
            },
            {
                name: 'Repeated Same Receiver Rule',
                description: 'Detects more than 5 transactions to the same wallet address within 1 hour',
                ruleType: 'receiver_pattern',
                severity: 'high',
                parameters: {
                    maxTransactions: 5,
                    timeWindow: 3600  // 1 hour in seconds
                },
                action: 'block',
                priority: 8,
                isActive: true,
                createdBy: admin._id
            },
            {
                name: 'High Velocity Alert',
                description: 'Flags accounts making more than 5 transactions in 10 minutes',
                ruleType: 'velocity',
                severity: 'high',
                parameters: {
                    maxTransactions: 5,
                    timeWindow: 600  // 10 minutes
                },
                action: 'block',
                priority: 8,
                isActive: true,
                createdBy: admin._id
            },
            {
                name: 'Daily Transaction Volume Limit',
                description: 'Monitors total daily transaction volume per wallet (max 50 ETH)',
                ruleType: 'threshold',
                severity: 'high',
                parameters: {
                    threshold: 50,  // 50 ETH per day
                    timeWindow: 86400  // 24 hours
                },
                action: 'block',
                priority: 7,
                isActive: true,
                createdBy: admin._id
            },
            {
                name: 'New Account High Activity',
                description: 'Alerts when accounts less than 7 days old make transactions over 5 ETH',
                ruleType: 'behavioral',
                severity: 'medium',
                parameters: {
                    accountAge: 7,  // days
                    threshold: 5  // 5 ETH
                },
                action: 'block',
                priority: 6,
                isActive: true,
                createdBy: admin._id
            },
            {
                name: 'Frequent Small Transactions',
                description: 'Detects more than 15 small transactions (< 1 ETH) in 1 hour',
                ruleType: 'frequency',
                severity: 'medium',
                parameters: {
                    maxAmount: 1,  // Less than 1 ETH
                    maxTransactions: 15,
                    timeWindow: 3600  // 1 hour
                },
                action: 'alert',
                priority: 5,
                isActive: true,
                createdBy: admin._id
            },
            {
                name: 'Unusual Large Transfer',
                description: 'Flags transactions exceeding 20 ETH for review',
                ruleType: 'transaction_limit',
                severity: 'critical',
                parameters: {
                    maxAmount: 20  // 20 ETH
                },
                action: 'block',
                priority: 10,
                isActive: true,
                createdBy: admin._id
            },
            {
                name: 'Suspicious Pattern - Round Numbers',
                description: 'Detects transactions in exact round numbers (e.g., exactly 1, 5, 10 ETH)',
                ruleType: 'pattern',
                severity: 'low',
                parameters: {
                    patterns: ['round_numbers']
                },
                action: 'flag',
                priority: 3,
                isActive: true,
                createdBy: admin._id
            }
        ];
        
        const rules = await AMLRule.insertMany(defaultRules);
        
        console.log(`✅ Created ${rules.length} new AML rules\n`);
        
        console.log('📋 Rule Summary:');
        rules.forEach((rule, index) => {
            console.log(`${index + 1}. ${rule.name}`);
            console.log(`   Type: ${rule.ruleType}`);
            console.log(`   Severity: ${rule.severity}`);
            console.log(`   Parameters:`, JSON.stringify(rule.parameters, null, 2));
            console.log('---');
        });
        
        await mongoose.disconnect();
        console.log('\n✅ Done! AML rules have been reset and seeded with proper parameters.');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
    }
}

resetAndSeedAMLRules();
