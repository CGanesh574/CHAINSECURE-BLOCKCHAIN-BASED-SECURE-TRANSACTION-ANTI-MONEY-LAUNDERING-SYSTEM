const nodemailer = require('nodemailer');
require('dotenv').config();

/**
 * Email Service for sending notifications via Gmail SMTP
 */
class EmailService {
    constructor() {
        this.transporter = null;
        this.supportEmail = process.env.SUPPORT_EMAIL || 'cganesh_cse220574@mgit.ac.in';
        this.initializeTransporter();
    }

    /**
     * Initialize nodemailer transporter with Gmail SMTP
     */
    initializeTransporter() {
        try {
            this.transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD
                }
            });

            // Verify connection
            this.transporter.verify((error, success) => {
                if (error) {
                    console.error('❌ Email service initialization failed:', error.message);
                    console.error('   Please configure EMAIL_USER and EMAIL_PASSWORD in .env file');
                } else {
                    console.log('✅ Email service ready to send messages');
                }
            });
        } catch (error) {
            console.error('❌ Failed to create email transporter:', error);
        }
    }

    /**
     * Send email to support from contact form
     * @param {Object} formData - Contact form data {name, email, subject, message}
     */
    async sendContactFormEmail(formData) {
        try {
            const { name, email, subject, message } = formData;

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: this.supportEmail,
                subject: `Contact Form: ${subject}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                        <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">New Contact Form Submission</h2>
                        
                        <div style="margin: 20px 0;">
                            <p style="margin: 10px 0;"><strong style="color: #34495e;">Name:</strong> ${name}</p>
                            <p style="margin: 10px 0;"><strong style="color: #34495e;">Email:</strong> ${email}</p>
                            <p style="margin: 10px 0;"><strong style="color: #34495e;">Subject:</strong> ${subject}</p>
                        </div>
                        
                        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <p style="margin: 0; color: #34495e;"><strong>Message:</strong></p>
                            <p style="margin: 10px 0; color: #555; white-space: pre-wrap;">${message}</p>
                        </div>
                        
                        <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #ddd;">
                            <p style="color: #7f8c8d; font-size: 12px; margin: 0;">
                                This message was sent from ChainSecure Contact Form<br>
                                Received on: ${new Date().toLocaleString()}
                            </p>
                        </div>
                    </div>
                `,
                replyTo: email
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('✅ Contact form email sent:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('❌ Failed to send contact form email:', error);
            throw error;
        }
    }

    /**
     * Send account blocked notification to user
     * @param {Object} userData - User information {name, email}
     * @param {Array} violations - Array of violated rules
     */
    async sendAccountBlockedEmail(userData, violations) {
        try {
            const { name, email } = userData;

            // Format violated rules for display
            const violationsList = violations.map((v, index) => `
                <li style="margin: 10px 0; padding: 10px; background-color: #fff5f5; border-left: 3px solid #e74c3c; border-radius: 3px;">
                    <strong style="color: #c0392b;">${v.ruleName}</strong> 
                    <span style="color: #e74c3c;">(${v.severity.toUpperCase()})</span><br>
                    <span style="color: #555; font-size: 14px;">${v.reason}</span>
                </li>
            `).join('');

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: '🚨 ChainSecure - Account Blocked Due to AML Violation',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 2px solid #e74c3c; border-radius: 8px; background-color: #fff;">
                        <div style="background-color: #e74c3c; color: white; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                            <h2 style="margin: 0; font-size: 24px;">⚠️ Account Blocked</h2>
                        </div>
                        
                        <p style="color: #34495e; font-size: 16px;">Dear ${name},</p>
                        
                        <p style="color: #555; line-height: 1.6;">
                            We regret to inform you that your ChainSecure account has been <strong style="color: #e74c3c;">temporarily blocked</strong> 
                            due to suspicious transaction activity detected by our Anti-Money Laundering (AML) monitoring system.
                        </p>
                        
                        <div style="background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 5px; padding: 15px; margin: 20px 0;">
                            <h3 style="color: #856404; margin-top: 0;">🔍 AML Rules Violated:</h3>
                            <ul style="list-style: none; padding: 0; margin: 10px 0;">
                                ${violationsList}
                            </ul>
                        </div>
                        
                        <div style="background-color: #f8f9fa; border-radius: 5px; padding: 15px; margin: 20px 0;">
                            <h3 style="color: #2c3e50; margin-top: 0;">📞 Need Assistance?</h3>
                            <p style="color: #555; margin: 10px 0;">
                                If you believe this is an error or would like to appeal this decision, please contact our support team:
                            </p>
                            <ul style="color: #555; line-height: 1.8;">
                                <li><strong>Support Email:</strong> <a href="mailto:${this.supportEmail}" style="color: #3498db; text-decoration: none;">${this.supportEmail}</a></li>
                                <li><strong>Support Center:</strong> Login to your account and submit a ticket via the Support Center</li>
                            </ul>
                        </div>
                        
                        <div style="background-color: #e8f4fd; border-left: 4px solid #3498db; padding: 15px; margin: 20px 0; border-radius: 3px;">
                            <p style="margin: 0; color: #2c3e50;">
                                <strong>💡 What happens next?</strong><br>
                                <span style="color: #555;">
                                    Our compliance team will review your account. You can submit an appeal through the Support Center 
                                    in your dashboard or contact us directly via email.
                                </span>
                            </p>
                        </div>
                        
                        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                            <p style="color: #7f8c8d; font-size: 12px; margin: 5px 0;">
                                This is an automated notification from ChainSecure<br>
                                Sent on: ${new Date().toLocaleString()}<br>
                                For support: ${this.supportEmail}
                            </p>
                        </div>
                    </div>
                `
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log(`✅ Account blocked email sent to ${email}:`, info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('❌ Failed to send account blocked email:', error);
            throw error;
        }
    }

    /**
     * Send account unblocked notification to user
     * @param {Object} userData - User information {name, email}
     * @param {String} previousViolation - Previous violation reason
     */
    async sendAccountUnblockedEmail(userData, previousViolation = '') {
        try {
            const { name, email } = userData;

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: '✅ ChainSecure - Account Unblocked Successfully',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 2px solid #27ae60; border-radius: 8px; background-color: #fff;">
                        <div style="background-color: #27ae60; color: white; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                            <h2 style="margin: 0; font-size: 24px;">✅ Account Unblocked</h2>
                        </div>
                        
                        <p style="color: #34495e; font-size: 16px;">Dear ${name},</p>
                        
                        <p style="color: #555; line-height: 1.6;">
                            Good news! Your ChainSecure account has been <strong style="color: #27ae60;">successfully unblocked</strong> 
                            by our administrator team. You can now resume all transactions and account activities.
                        </p>
                        
                        ${previousViolation ? `
                        <div style="background-color: #fff9e6; border: 1px solid #ffa500; border-radius: 5px; padding: 15px; margin: 20px 0;">
                            <h3 style="color: #856404; margin-top: 0;">ℹ️ Previous Issue Resolved:</h3>
                            <p style="color: #555; margin: 5px 0;">${previousViolation}</p>
                        </div>
                        ` : ''}
                        
                        <div style="background-color: #e8f8f5; border-radius: 5px; padding: 15px; margin: 20px 0;">
                            <h3 style="color: #16a085; margin-top: 0;">✨ What You Can Do Now:</h3>
                            <ul style="color: #555; line-height: 1.8;">
                                <li>Login to your ChainSecure account</li>
                                <li>Perform transactions normally</li>
                                <li>Access all account features</li>
                                <li>Review your transaction history</li>
                            </ul>
                        </div>
                        
                        <div style="background-color: #f8f9fa; border-radius: 5px; padding: 15px; margin: 20px 0;">
                            <h3 style="color: #2c3e50; margin-top: 0;">📋 Important Reminders:</h3>
                            <p style="color: #555; line-height: 1.6; margin: 10px 0;">
                                To avoid future issues, please ensure your transactions comply with our Anti-Money Laundering (AML) policies. 
                                Suspicious patterns may trigger automatic security measures.
                            </p>
                        </div>
                        
                        <div style="background-color: #e8f4fd; border-left: 4px solid #3498db; padding: 15px; margin: 20px 0; border-radius: 3px;">
                            <p style="margin: 0; color: #2c3e50;">
                                <strong>Need Help?</strong><br>
                                <span style="color: #555;">
                                    If you have any questions or concerns, contact us at: 
                                    <a href="mailto:${this.supportEmail}" style="color: #3498db; text-decoration: none;">${this.supportEmail}</a>
                                </span>
                            </p>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <p style="color: #27ae60; font-size: 18px; margin: 0;">
                                <strong>Welcome back to ChainSecure! 🎉</strong>
                            </p>
                        </div>
                        
                        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                            <p style="color: #7f8c8d; font-size: 12px; margin: 5px 0;">
                                This is an automated notification from ChainSecure<br>
                                Sent on: ${new Date().toLocaleString()}<br>
                                For support: ${this.supportEmail}
                            </p>
                        </div>
                    </div>
                `
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log(`✅ Account unblocked email sent to ${email}:`, info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('❌ Failed to send account unblocked email:', error);
            throw error;
        }
    }
}

// Export a singleton instance
module.exports = new EmailService();
