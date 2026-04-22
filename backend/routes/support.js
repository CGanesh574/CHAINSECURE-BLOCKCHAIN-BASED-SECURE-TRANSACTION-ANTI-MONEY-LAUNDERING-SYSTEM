const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authenticate, isAdmin } = require('../middleware/auth');
const SupportTicket = require('../models/SupportTicket');
const User = require('../models/User');

// Configure multer for file upload (store in memory)
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Allow images and PDFs only
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, and PDF files are allowed.'));
        }
    }
});

/**
 * @route   POST /api/support/create
 * @desc    Create a new support ticket
 * @access  Private (User)
 */
router.post('/create', authenticate, upload.array('documents', 5), async (req, res) => {
    try {
        console.log('🎫 SUPPORT TICKET CREATE - Route reached!');
        console.log('   User authenticated:', !!req.user);
        console.log('   User ID:', req.user?._id);
        console.log('   Body:', req.body);
        console.log('   Files:', req.files?.length || 0);
        
        const { category, subject, message } = req.body;

        console.log('📝 Creating support ticket:', {
            userId: req.user._id,
            category,
            subject
        });

        if (!category || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: 'Category, subject, and message are required'
            });
        }

        // Generate unique ticket ID
        const ticketId = `TICKET-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        // Process uploaded documents
        const documents = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                documents.push({
                    filename: `${Date.now()}-${file.originalname}`,
                    originalName: file.originalname,
                    mimetype: file.mimetype,
                    size: file.size,
                    data: file.buffer,
                    uploadedAt: new Date()
                });
            }
        }

        // Create support ticket
        const ticket = await SupportTicket.create({
            ticketId,
            userId: req.user._id,
            category,
            subject,
            message,
            documents,
            status: 'OPEN',
            priority: category === 'ACCOUNT_BLOCKING' ? 'HIGH' : 'MEDIUM'
        });

        console.log(`✅ Support ticket created: ${ticketId}`);
        console.log(`   Documents uploaded: ${documents.length}`);

        res.status(201).json({
            success: true,
            message: 'Support ticket created successfully',
            ticket: {
                ticketId: ticket.ticketId,
                category: ticket.category,
                subject: ticket.subject,
                status: ticket.status,
                createdAt: ticket.createdAt
            }
        });

    } catch (error) {
        console.error('❌ Create support ticket error:', error);
        console.error('Error stack:', error.stack);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            code: error.code
        });
        res.status(500).json({
            success: false,
            message: 'Failed to create support ticket',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/support/my-tickets
 * @desc    Get all tickets for the logged-in user
 * @access  Private (User)
 */
router.get('/my-tickets', authenticate, async (req, res) => {
    try {
        const tickets = await SupportTicket.find({ userId: req.user._id })
            .select('-documents.data') // Exclude document data from list
            .sort({ createdAt: -1 })
            .populate('userId', 'name email')
            .populate('replies.repliedBy', 'name email role');

        console.log(`📋 User ${req.user.email} fetched ${tickets.length} tickets`);

        res.json({
            success: true,
            tickets,
            count: tickets.length
        });

    } catch (error) {
        console.error('Get user tickets error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch tickets'
        });
    }
});

/**
 * @route   GET /api/support/ticket/:ticketId
 * @desc    Get a specific ticket with full details
 * @access  Private
 */
router.get('/ticket/:ticketId', authenticate, async (req, res) => {
    try {
        const { ticketId } = req.params;

        console.log('🎫 Fetching ticket details:', ticketId);
        console.log('   Requested by:', req.user._id, req.user.role);

        const ticket = await SupportTicket.findOne({ ticketId })
            .select('-documents.data') // Exclude binary data
            .populate('userId', 'name email walletAddress')
            .populate('replies.repliedBy', 'name email role')
            .populate('resolvedBy', 'name email');

        if (!ticket) {
            console.log('❌ Ticket not found:', ticketId);
            return res.status(404).json({
                success: false,
                message: 'Ticket not found'
            });
        }

        console.log('✅ Ticket found:', ticket.ticketId);
        console.log('   Owner:', ticket.userId._id);
        console.log('   Replies count:', ticket.replies.length);

        // Check authorization (user can only view their own tickets, admin can view all)
        if (req.user.role !== 'admin' && ticket.userId._id.toString() !== req.user._id.toString()) {
            console.log('❌ Access denied - User', req.user._id, 'trying to access ticket of', ticket.userId._id);
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        console.log('✅ Sending ticket details with', ticket.replies.length, 'replies');

        res.json({
            success: true,
            ticket
        });

    } catch (error) {
        console.error('Get ticket error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch ticket'
        });
    }
});

/**
 * @route   GET /api/support/document/:ticketId/:documentIndex
 * @desc    Download a specific document from a ticket
 * @access  Private
 */
router.get('/document/:ticketId/:documentIndex', authenticate, async (req, res) => {
    try {
        const { ticketId, documentIndex } = req.params;

        const ticket = await SupportTicket.findOne({ ticketId });

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found'
            });
        }

        // Check authorization
        const ticketUserId = ticket.userId._id ? ticket.userId._id.toString() : ticket.userId.toString();
        if (req.user.role !== 'admin' && ticketUserId !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        const document = ticket.documents[parseInt(documentIndex)];
        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        console.log(`📥 Viewing document: ${document.originalName}`);

        res.set({
            'Content-Type': document.mimetype,
            'Content-Disposition': `inline; filename="${document.originalName}"`,
            'Content-Length': document.size
        });

        res.send(document.data);

    } catch (error) {
        console.error('Download document error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to download document'
        });
    }
});

/**
 * @route   POST /api/support/reply/:ticketId
 * @desc    Add a reply to a ticket
 * @access  Private
 */
router.post('/reply/:ticketId', authenticate, async (req, res) => {
    try {
        const { ticketId } = req.params;
        const { message } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Reply message is required'
            });
        }

        const ticket = await SupportTicket.findOne({ ticketId });

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found'
            });
        }

        console.log('💬 Adding reply to ticket:', ticketId);
        console.log('   User:', req.user._id, req.user.role);
        console.log('   Ticket owner:', ticket.userId);

        // Check authorization - handle both populated and non-populated userId
        const ticketUserId = ticket.userId._id ? ticket.userId._id.toString() : ticket.userId.toString();
        if (req.user.role !== 'admin' && ticketUserId !== req.user._id.toString()) {
            console.log('❌ Authorization failed');
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Add reply
        ticket.replies.push({
            message: message.trim(),
            repliedBy: req.user._id,
            repliedAt: new Date(),
            isAdmin: req.user.role === 'admin'
        });

        // Update status if admin is replying
        if (req.user.role === 'admin' && ticket.status === 'OPEN') {
            ticket.status = 'IN_PROGRESS';
        }

        await ticket.save();

        console.log(`✅ Reply added to ticket ${ticketId} by ${req.user.email}`);

        // Populate the new reply
        await ticket.populate('replies.repliedBy', 'name email role');

        res.json({
            success: true,
            message: 'Reply added successfully',
            reply: ticket.replies[ticket.replies.length - 1]
        });

    } catch (error) {
        console.error('Add reply error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add reply'
        });
    }
});

/**
 * @route   GET /api/support/admin/all-tickets
 * @desc    Get all support tickets (Admin only)
 * @access  Private (Admin)
 */
router.get('/admin/all-tickets', authenticate, isAdmin, async (req, res) => {
    try {
        const tickets = await SupportTicket.find()
            .select('-documents.data')
            .sort({ createdAt: -1 })
            .populate('userId', 'name email walletAddress')
            .populate('replies.repliedBy', 'name email role');

        console.log(`📋 Admin fetched ${tickets.length} support tickets`);

        res.json({
            success: true,
            tickets,
            count: tickets.length
        });

    } catch (error) {
        console.error('Get all tickets error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch tickets'
        });
    }
});

/**
 * @route   PUT /api/support/admin/update-status/:ticketId
 * @desc    Update ticket status (Admin only)
 * @access  Private (Admin)
 */
router.put('/admin/update-status/:ticketId', authenticate, isAdmin, async (req, res) => {
    try {
        const { ticketId } = req.params;
        const { status, priority } = req.body;

        const ticket = await SupportTicket.findOne({ ticketId });

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found'
            });
        }

        if (status) {
            ticket.status = status;
            if (status === 'RESOLVED' || status === 'CLOSED') {
                ticket.resolvedAt = new Date();
                ticket.resolvedBy = req.user._id;
            }
        }

        if (priority) {
            ticket.priority = priority;
        }

        await ticket.save();

        console.log(`✅ Ticket ${ticketId} updated: status=${status}, priority=${priority}`);

        res.json({
            success: true,
            message: 'Ticket updated successfully',
            ticket
        });

    } catch (error) {
        console.error('Update ticket error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update ticket'
        });
    }
});

/**
 * @route   GET /api/support/admin/stats
 * @desc    Get support ticket statistics (Admin only)
 * @access  Private (Admin)
 */
router.get('/admin/stats', authenticate, isAdmin, async (req, res) => {
    try {
        const totalTickets = await SupportTicket.countDocuments();
        const openTickets = await SupportTicket.countDocuments({ status: 'OPEN' });
        const inProgressTickets = await SupportTicket.countDocuments({ status: 'IN_PROGRESS' });
        const resolvedTickets = await SupportTicket.countDocuments({ status: 'RESOLVED' });
        const closedTickets = await SupportTicket.countDocuments({ status: 'CLOSED' });

        res.json({
            success: true,
            stats: {
                totalTickets,
                openTickets,
                inProgressTickets,
                resolvedTickets,
                closedTickets
            }
        });

    } catch (error) {
        console.error('Get support stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch statistics'
        });
    }
});

module.exports = router;
