const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { authenticate, isAdmin } = require('../middleware/auth');
const KYC = require('../models/KYC');
const User = require('../models/User');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '..', 'uploads', 'kyc');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('📁 Created uploads directory:', uploadsDir);
}

// Configure multer for memory storage (store in buffer, not disk)
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only JPG, PNG, and PDF files are allowed'), false);
        }
    }
});

/**
 * @route   POST /api/kyc/submit
 * @desc    Submit KYC document
 * @access  Private (User)
 */
router.post('/submit', authenticate, (req, res, next) => {
    upload.single('document')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            console.error('❌ Multer Error:', err.message);
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    success: false,
                    error: 'File size exceeds 5MB limit'
                });
            }
            return res.status(400).json({
                success: false,
                error: `Upload error: ${err.message}`
            });
        } else if (err) {
            console.error('❌ File Upload Error:', err.message);
            return res.status(400).json({
                success: false,
                error: err.message
            });
        }
        next();
    });
}, async (req, res) => {
    try {
        const { documentType, documentNumber } = req.body;
        
        console.log('📄 KYC Submission received');
        console.log('   User ID:', req.user ? req.user.userId : 'No user');
        console.log('   Document Type:', documentType);
        console.log('   Document Number:', documentNumber);
        console.log('   File:', req.file ? `${req.file.originalname} (${req.file.mimetype})` : 'Missing');
        
        if (!documentType || !documentNumber) {
            return res.status(400).json({
                success: false,
                error: 'Document type and number are required'
            });
        }
        
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'Document file is required (JPG, PNG, or PDF)'
            });
        }
        
        // Check if user already has a pending or approved KYC
        const existingKYC = await KYC.findOne({ 
            userId: req.user.userId,
            status: { $in: ['PENDING', 'APPROVED'] }
        });
        
        if (existingKYC) {
            console.log('⚠️ User already has a', existingKYC.status, 'KYC submission');
            return res.status(400).json({
                success: false,
                error: existingKYC.status === 'APPROVED' 
                    ? 'Your KYC is already approved' 
                    : 'You already have a pending KYC submission. Please wait for review.'
            });
        }
        
        // If rejected KYC exists, user can resubmit - no need to delete old one
        console.log('✅ User can submit KYC (no pending/approved submissions found)');
        
        // Create KYC document
        console.log('💾 Creating KYC document...');
        const kyc = new KYC({
            userId: req.user.userId,
            documentType,
            documentNumber,
            documentImage: {
                data: req.file.buffer,
                contentType: req.file.mimetype
            },
            status: 'PENDING',
            submittedAt: new Date()
        });
        
        console.log('💾 Saving to MongoDB...');
        await kyc.save();
        console.log('✅ KYC document saved to MongoDB');
        
        // Also save to filesystem for easy viewing
        try {
            const user = await User.findById(req.user.userId);
            const extension = req.file.mimetype === 'application/pdf' ? 'pdf' 
                            : req.file.mimetype.includes('jpeg') || req.file.mimetype.includes('jpg') ? 'jpg'
                            : req.file.mimetype === 'image/png' ? 'png'
                            : req.file.mimetype.split('/')[1];
            
            const sanitizedEmail = user.email.replace(/[^a-zA-Z0-9]/g, '_');
            const filename = `${sanitizedEmail}_${documentType}_${kyc._id}.${extension}`;
            const filepath = path.join(uploadsDir, filename);
            
            fs.writeFileSync(filepath, req.file.buffer);
            console.log('📁 File also saved to:', filepath);
        } catch (fsError) {
            console.error('⚠️ Failed to save to filesystem (not critical):', fsError.message);
            // Don't fail the request if filesystem save fails
        }
        
        // Update user KYC status
        console.log('👤 Updating user KYC status...');
        await User.findByIdAndUpdate(req.user.userId, {
            kycStatus: 'PENDING',
            kycSubmittedAt: new Date()
        });
        console.log('✅ User status updated');
        
        console.log('✅ KYC submitted successfully - ID:', kyc._id);
        
        res.json({
            success: true,
            message: 'KYC document submitted successfully',
            kycId: kyc._id,
            status: 'PENDING'
        });
        
    } catch (error) {
        console.error('❌ KYC submission error:');
        console.error('   Error name:', error.name);
        console.error('   Error message:', error.message);
        console.error('   Stack:', error.stack);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to submit KYC. Please try again.'
        });
    }
});

/**
 * @route   GET /api/kyc/status
 * @desc    Get user's KYC status
 * @access  Private (User)
 */
router.get('/status', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('kycStatus kycSubmittedAt');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Get latest KYC submission
        const latestKYC = await KYC.findOne({ userId: req.user.userId })
            .sort({ createdAt: -1 })
            .select('-documentImage');
        
        res.json({
            success: true,
            kycStatus: user.kycStatus,
            kycSubmittedAt: user.kycSubmittedAt,
            latestSubmission: latestKYC
        });
        
    } catch (error) {
        console.error('Get KYC status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get KYC status'
        });
    }
});

/**
 * @route   GET /api/kyc/history
 * @desc    Get user's KYC submission history
 * @access  Private (User)
 */
router.get('/history', authenticate, async (req, res) => {
    try {
        const kycHistory = await KYC.find({ userId: req.user.userId })
            .sort({ createdAt: -1 })
            .select('-documentImage')
            .populate('reviewedBy', 'name email');
        
        res.json({
            success: true,
            history: kycHistory
        });
        
    } catch (error) {
        console.error('Get KYC history error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get KYC history'
        });
    }
});

/**
 * @route   GET /api/kyc/admin/all
 * @desc    Get all KYC submissions (admin)
 * @access  Private (Admin)
 */
router.get('/admin/all', authenticate, isAdmin, async (req, res) => {
    try {
        const { status } = req.query;
        
        let query = {};
        if (status && ['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
            query.status = status;
        }
        
        const kycSubmissions = await KYC.find(query)
            .sort({ createdAt: -1 })
            .select('-documentImage')
            .populate('userId', 'name email phone walletAddress')
            .populate('reviewedBy', 'name email');
        
        console.log(`📋 Admin fetched ${kycSubmissions.length} KYC submissions`);
        
        res.json({
            success: true,
            submissions: kycSubmissions,
            count: kycSubmissions.length
        });
        
    } catch (error) {
        console.error('Get KYC submissions error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get KYC submissions'
        });
    }
});

/**
 * @route   GET /api/kyc/admin/document/:id
 * @desc    Get KYC document image (admin)
 * @access  Private (Admin)
 */
router.get('/admin/document/:id', authenticate, isAdmin, async (req, res) => {
    try {
        console.log('📄 Admin requesting document for KYC ID:', req.params.id);
        
        const kyc = await KYC.findById(req.params.id);
        
        if (!kyc) {
            console.log('❌ KYC document not found in database');
            return res.status(404).json({
                success: false,
                message: 'KYC document not found'
            });
        }
        
        console.log('✅ KYC found:', {
            id: kyc._id,
            userId: kyc.userId,
            documentType: kyc.documentType,
            hasImage: !!kyc.documentImage,
            hasData: !!(kyc.documentImage && kyc.documentImage.data),
            contentType: kyc.documentImage?.contentType,
            dataSize: kyc.documentImage?.data ? kyc.documentImage.data.length : 0
        });
        
        if (!kyc.documentImage || !kyc.documentImage.data) {
            console.log('❌ Document image data not found');
            return res.status(404).json({
                success: false,
                message: 'Document image not found'
            });
        }
        
        console.log('📤 Sending document:', kyc.documentImage.contentType, kyc.documentImage.data.length, 'bytes');
        res.set('Content-Type', kyc.documentImage.contentType);
        res.set('Content-Length', kyc.documentImage.data.length);
        res.send(kyc.documentImage.data);
        
    } catch (error) {
        console.error('❌ Get KYC document error:', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        res.status(500).json({
            success: false,
            message: 'Failed to get document'
        });
    }
});

/**
 * @route   PUT /api/kyc/admin/review/:id
 * @desc    Approve or reject KYC (admin)
 * @access  Private (Admin)
 */
router.put('/admin/review/:id', authenticate, isAdmin, async (req, res) => {
    try {
        const { status, rejectionReason } = req.body;
        
        console.log('📝 Admin reviewing KYC:', req.params.id);
        console.log('   Status:', status);
        console.log('   Rejection Reason:', rejectionReason);
        console.log('   Admin ID:', req.user.userId);
        
        if (!['APPROVED', 'REJECTED'].includes(status)) {
            console.log('❌ Invalid status provided:', status);
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be APPROVED or REJECTED'
            });
        }
        
        if (status === 'REJECTED' && !rejectionReason) {
            console.log('❌ Rejection reason missing');
            return res.status(400).json({
                success: false,
                message: 'Rejection reason is required'
            });
        }
        
        const kyc = await KYC.findById(req.params.id);
        
        if (!kyc) {
            console.log('❌ KYC not found');
            return res.status(404).json({
                success: false,
                message: 'KYC submission not found'
            });
        }
        
        console.log('📄 Found KYC:', {
            id: kyc._id,
            userId: kyc.userId,
            currentStatus: kyc.status
        });
        
        // Update KYC document
        kyc.status = status;
        kyc.reviewedBy = req.user.userId;
        kyc.reviewedAt = new Date();
        
        if (status === 'REJECTED') {
            kyc.rejectionReason = rejectionReason;
        }
        
        await kyc.save();
        console.log('✅ KYC document updated');
        
        // Update user's KYC status
        await User.findByIdAndUpdate(kyc.userId, {
            kycStatus: status
        });
        console.log('✅ User KYC status updated');
        
        console.log(`✅ KYC ${status} successfully`);
        
        res.json({
            success: true,
            message: `KYC ${status.toLowerCase()} successfully`,
            kyc: {
                _id: kyc._id,
                status: kyc.status,
                reviewedAt: kyc.reviewedAt,
                reviewedBy: kyc.reviewedBy
            }
        });
        
    } catch (error) {
        console.error('❌ Review KYC error:', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        res.status(500).json({
            success: false,
            message: 'Failed to review KYC',
            error: error.message
        });
    }
});

module.exports = router;
