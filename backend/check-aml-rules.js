const mongoose = require('mongoose');
require('dotenv').config();

async function checkAMLRules() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');
        
        const AMLRule = require('./models/AMLRule');
        
        const rules = await AMLRule.find();
        
        console.log(`📊 Total AML Rules: ${rules.length}\n`);
        
        if (rules.length === 0) {
            console.log('⚠️ No AML rules found. Run seed endpoint from admin dashboard.\n');
        } else {
            rules.forEach((rule, index) => {
                console.log(`${index + 1}. ${rule.name}`);
                console.log(`   Type: ${rule.ruleType}`);
                console.log(`   Severity: ${rule.severity}`);
                console.log(`   Active: ${rule.isActive}`);
                console.log(`   Parameters:`, JSON.stringify(rule.parameters, null, 2));
                console.log(`   Action: ${rule.action}`);
                console.log(`   Priority: ${rule.priority}`);
                console.log('---');
            });
        }
        
        await mongoose.disconnect();
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkAMLRules();
