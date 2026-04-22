const express = require('express');
const router = express.Router();
const { authenticate, isAdmin } = require('../middleware/auth');
const SARReport = require('../models/SARReport');
const PDFDocument = require('pdfkit');

/**
 * @route   GET /api/sar/reports
 * @desc    Get all SAR reports with search and filter
 * @access  Admin
 */
router.get('/reports', authenticate, isAdmin, async (req, res) => {
    try {
        const { search, status, startDate, endDate } = req.query;
        
        let query = {};
        
        // Search by report ID, wallet address, or user email
        if (search) {
            query.$or = [
                { reportId: { $regex: search, $options: 'i' } },
                { walletAddress: { $regex: search, $options: 'i' } },
                { 'userDetails.email': { $regex: search, $options: 'i' } },
                { 'userDetails.name': { $regex: search, $options: 'i' } }
            ];
        }
        
        // Filter by status
        if (status && status !== 'ALL') {
            query.status = status;
        }
        
        // Filter by date range
        if (startDate || endDate) {
            query.blockTimestamp = {};
            if (startDate) {
                query.blockTimestamp.$gte = new Date(startDate);
            }
            if (endDate) {
                query.blockTimestamp.$lte = new Date(endDate);
            }
        }
        
        const reports = await SARReport.find(query)
            .populate('userId', 'name email walletAddress')
            .populate('reviewedBy', 'name email')
            .sort({ blockTimestamp: -1 });
        
        res.json({
            success: true,
            reports,
            count: reports.length
        });
        
    } catch (error) {
        console.error('Get SAR reports error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch SAR reports'
        });
    }
});

/**
 * @route   GET /api/sar/reports/:id
 * @desc    Get single SAR report
 * @access  Admin
 */
router.get('/reports/:id', authenticate, isAdmin, async (req, res) => {
    try {
        const report = await SARReport.findById(req.params.id)
            .populate('userId', 'name email walletAddress phone age gender')
            .populate('reviewedBy', 'name email');
        
        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'SAR report not found'
            });
        }
        
        res.json({
            success: true,
            report
        });
        
    } catch (error) {
        console.error('Get SAR report error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch SAR report'
        });
    }
});

/**
 * @route   GET /api/sar/reports/:id/download
 * @desc    Download SAR report as PDF
 * @access  Admin
 */
router.get('/reports/:id/download', authenticate, isAdmin, async (req, res) => {
    try {
        const report = await SARReport.findById(req.params.id)
            .populate('userId', 'name email walletAddress phone age gender')
            .populate('reviewedBy', 'name email');
        
        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'SAR report not found'
            });
        }
        
        // Create PDF document
        const doc = new PDFDocument({ margin: 50 });
        
        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=SAR_${report.reportId}.pdf`);
        
        // Pipe PDF to response
        doc.pipe(res);
        
        // Add header
        doc.fontSize(20)
           .fillColor('#667eea')
           .text('SUSPICIOUS ACTIVITY REPORT (SAR)', { align: 'center' })
           .moveDown();
        
        doc.fontSize(10)
           .fillColor('#666666')
           .text(`Report ID: ${report.reportId}`, { align: 'center' })
           .text(`Generated: ${new Date(report.blockTimestamp).toLocaleString()}`, { align: 'center' })
           .moveDown(2);
        
        // Add divider
        doc.moveTo(50, doc.y)
           .lineTo(550, doc.y)
           .stroke()
           .moveDown();
        
        // Account Information Section
        doc.fontSize(14)
           .fillColor('#000000')
           .text('ACCOUNT INFORMATION', { underline: true })
           .moveDown(0.5);
        
        doc.fontSize(11)
           .fillColor('#333333')
           .text(`Full Name: ${report.userDetails.name}`)
           .text(`Email Address: ${report.userDetails.email}`)
           .text(`Phone Number: ${report.userDetails.phone || 'N/A'}`)
           .text(`Age: ${report.userDetails.age || 'N/A'}`)
           .text(`Gender: ${report.userDetails.gender || 'N/A'}`)
           .moveDown();
        
        // Wallet Information Section
        doc.fontSize(14)
           .fillColor('#000000')
           .text('WALLET INFORMATION', { underline: true })
           .moveDown(0.5);
        
        doc.fontSize(11)
           .fillColor('#333333')
           .text(`Wallet Address: ${report.walletAddress}`)
           .moveDown();
        
        // Violation Details Section
        doc.fontSize(14)
           .fillColor('#000000')
           .text('VIOLATION DETAILS', { underline: true })
           .moveDown(0.5);
        
        doc.fontSize(11)
           .fillColor('#333333')
           .text(`Violation Type: ${report.violationType}`)
           .text(`Block Timestamp: ${new Date(report.blockTimestamp).toLocaleString()}`)
           .moveDown();
        
        // AML Rules Violated
        if (report.violatedRules && report.violatedRules.length > 0) {
            doc.fontSize(12)
               .fillColor('#000000')
               .text('AML Rules Violated:', { underline: true })
               .moveDown(0.3);
            
            report.violatedRules.forEach((rule, index) => {
                doc.fontSize(10)
                   .fillColor('#333333')
                   .text(`${index + 1}. ${rule.ruleName} (${rule.severity.toUpperCase()})`, { indent: 20 })
                   .fontSize(9)
                   .fillColor('#666666')
                   .text(`   Reason: ${rule.reason}`, { indent: 20 })
                   .text(`   Timestamp: ${new Date(rule.timestamp).toLocaleString()}`, { indent: 20 })
                   .moveDown(0.3);
            });
            doc.moveDown();
        }
        
        // Transaction Details Section
        if (report.transactionDetails && report.transactionDetails.transactionHash) {
            doc.fontSize(14)
               .fillColor('#000000')
               .text('TRANSACTION DETAILS', { underline: true })
               .moveDown(0.5);
            
            doc.fontSize(11)
               .fillColor('#333333')
               .text(`Transaction Hash: ${report.transactionDetails.transactionHash}`)
               .text(`Amount: ${report.transactionDetails.amount} ETH`)
               .text(`From: ${report.transactionDetails.from}`)
               .text(`To: ${report.transactionDetails.to}`)
               .text(`Timestamp: ${new Date(report.transactionDetails.timestamp).toLocaleString()}`)
               .moveDown();
        }
        
        // Investigation Section
        doc.fontSize(14)
           .fillColor('#000000')
           .text('INVESTIGATION STATUS', { underline: true })
           .moveDown(0.5);
        
        doc.fontSize(11)
           .fillColor('#333333')
           .text(`Status: ${report.status}`)
           .text(`Notes: ${report.investigationNotes || 'No notes available'}`)
           .moveDown();
        
        if (report.reviewedBy) {
            doc.text(`Reviewed By: ${report.reviewedBy.name} (${report.reviewedBy.email})`)
               .text(`Reviewed At: ${new Date(report.reviewedAt).toLocaleString()}`)
               .moveDown();
        }
        
        // Footer
        doc.fontSize(8)
           .fillColor('#999999')
           .text('This is a confidential document generated by ChainSecure AML System', 50, doc.page.height - 50, {
               align: 'center'
           });
        
        // Finalize PDF
        doc.end();
        
    } catch (error) {
        console.error('Download SAR report error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to download SAR report'
        });
    }
});

/**
 * @route   PUT /api/sar/reports/:id
 * @desc    Update SAR report status and notes
 * @access  Admin
 */
router.put('/reports/:id', authenticate, isAdmin, async (req, res) => {
    try {
        const { status, investigationNotes } = req.body;
        
        const report = await SARReport.findById(req.params.id);
        
        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'SAR report not found'
            });
        }
        
        if (status) report.status = status;
        if (investigationNotes !== undefined) report.investigationNotes = investigationNotes;
        
        report.reviewedBy = req.user.userId;
        report.reviewedAt = new Date();
        
        await report.save();
        
        await report.populate('userId', 'name email walletAddress');
        await report.populate('reviewedBy', 'name email');
        
        res.json({
            success: true,
            message: 'SAR report updated successfully',
            report
        });
        
    } catch (error) {
        console.error('Update SAR report error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update SAR report'
        });
    }
});

/**
 * @route   GET /api/sar/stats
 * @desc    Get SAR report statistics
 * @access  Admin
 */
router.get('/stats', authenticate, isAdmin, async (req, res) => {
    try {
        const totalReports = await SARReport.countDocuments();
        const pendingReports = await SARReport.countDocuments({ status: 'PENDING' });
        const reviewedReports = await SARReport.countDocuments({ status: 'REVIEWED' });
        const closedReports = await SARReport.countDocuments({ status: 'CLOSED' });
        
        // Get reports from last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentReports = await SARReport.countDocuments({
            blockTimestamp: { $gte: thirtyDaysAgo }
        });
        
        res.json({
            success: true,
            stats: {
                totalReports,
                pendingReports,
                reviewedReports,
                closedReports,
                recentReports
            }
        });
        
    } catch (error) {
        console.error('Get SAR stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch SAR statistics'
        });
    }
});

module.exports = router;
