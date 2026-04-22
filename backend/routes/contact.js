const express = require('express');
const router = express.Router();
const emailService = require('../services/emailService');

/**
 * @route   POST /api/contact/send
 * @desc    Send contact form email to support
 * @access  Public
 */
router.post('/send', async (req, res) => {
    try {
        console.log('📧 Contact form submission received');
        
        const { name, email, subject, message } = req.body;

        // Validate input
        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required (name, email, subject, message)'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email address format'
            });
        }

        // Send email
        await emailService.sendContactFormEmail({
            name,
            email,
            subject,
            message
        });

        console.log(`✅ Contact form email sent from ${email}`);

        res.json({
            success: true,
            message: 'Your message has been sent successfully. We will get back to you soon!'
        });

    } catch (error) {
        console.error('❌ Contact form error:', error);
        
        // Check if it's an email configuration error
        if (error.message && error.message.includes('Invalid login')) {
            return res.status(500).json({
                success: false,
                message: 'Email service is currently unavailable. Please try again later or contact us directly at cganesh_cse220574@mgit.ac.in'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to send message. Please try again later.'
        });
    }
});

module.exports = router;
