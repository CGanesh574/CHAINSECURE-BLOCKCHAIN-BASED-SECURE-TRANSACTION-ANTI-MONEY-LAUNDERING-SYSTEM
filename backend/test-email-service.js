/**
 * Test script to verify email service configuration
 * Run this to test if email notifications are working properly
 */

require('dotenv').config();
const emailService = require('./services/emailService');

console.log('🧪 Testing Email Service Configuration...\n');

// Test 1: Contact Form Email
async function testContactEmail() {
    console.log('📧 Test 1: Contact Form Email');
    try {
        const result = await emailService.sendContactFormEmail({
            name: 'Test User',
            email: 'test@example.com',
            subject: 'Test Contact Form Submission',
            message: 'This is a test message to verify the email service is working correctly.'
        });
        console.log('✅ Contact form email sent successfully!');
        console.log('   Message ID:', result.messageId);
        return true;
    } catch (error) {
        console.error('❌ Failed to send contact form email');
        console.error('   Error:', error.message);
        return false;
    }
}

// Test 2: Account Blocked Email
async function testBlockedEmail() {
    console.log('\n📧 Test 2: Account Blocked Email');
    try {
        const result = await emailService.sendAccountBlockedEmail(
            {
                name: 'Test User',
                email: process.env.SUPPORT_EMAIL || 'cganesh_cse220574@mgit.ac.in'
            },
            [
                {
                    ruleName: 'Transaction Limit Exceeded',
                    severity: 'critical',
                    reason: 'Transaction amount 15 ETH exceeds maximum limit of 10 ETH'
                },
                {
                    ruleName: 'Velocity Check',
                    severity: 'high',
                    reason: '5 transactions in 1 hour exceeds limit of 3'
                }
            ]
        );
        console.log('✅ Account blocked email sent successfully!');
        console.log('   Message ID:', result.messageId);
        return true;
    } catch (error) {
        console.error('❌ Failed to send account blocked email');
        console.error('   Error:', error.message);
        return false;
    }
}

// Test 3: Account Unblocked Email
async function testUnblockedEmail() {
    console.log('\n📧 Test 3: Account Unblocked Email');
    try {
        const result = await emailService.sendAccountUnblockedEmail(
            {
                name: 'Test User',
                email: process.env.SUPPORT_EMAIL || 'cganesh_cse220574@mgit.ac.in'
            },
            'Transaction Limit Exceeded'
        );
        console.log('✅ Account unblocked email sent successfully!');
        console.log('   Message ID:', result.messageId);
        return true;
    } catch (error) {
        console.error('❌ Failed to send account unblocked email');
        console.error('   Error:', error.message);
        return false;
    }
}

// Run all tests
async function runTests() {
    console.log('Email Configuration:');
    console.log('   EMAIL_USER:', process.env.EMAIL_USER);
    console.log('   SUPPORT_EMAIL:', process.env.SUPPORT_EMAIL);
    console.log('   EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '***configured***' : '❌ NOT SET');
    console.log('\n' + '='.repeat(60) + '\n');

    if (!process.env.EMAIL_PASSWORD) {
        console.error('❌ EMAIL_PASSWORD not set in .env file!');
        console.error('   Please configure your Gmail App Password in backend/.env');
        process.exit(1);
    }

    let allPassed = true;

    // Run tests with delay between each
    allPassed = await testContactEmail() && allPassed;
    await delay(2000);
    
    allPassed = await testBlockedEmail() && allPassed;
    await delay(2000);
    
    allPassed = await testUnblockedEmail() && allPassed;

    console.log('\n' + '='.repeat(60));
    if (allPassed) {
        console.log('\n✅ All email tests passed! Email service is working correctly.');
        console.log('   Check inbox: ' + (process.env.SUPPORT_EMAIL || 'cganesh_cse220574@mgit.ac.in'));
    } else {
        console.log('\n❌ Some email tests failed. Check the errors above.');
    }
    console.log('='.repeat(60) + '\n');
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Run tests
runTests().catch(error => {
    console.error('\n❌ Test execution failed:', error);
    process.exit(1);
});
