const express = require('express');
const router = express.Router();
const { authenticate, isAdmin } = require('../middleware/auth');
const AMLRule = require('../models/AMLRule');

/**
 * @route   GET /api/aml/rules
 * @desc    Get all AML rules
 * @access  Admin
 */
router.get('/rules', authenticate, isAdmin, async (req, res) => {
    try {
        const rules = await AMLRule.find()
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email')
            .sort({ priority: -1, createdAt: -1 });
        
        res.json({
            success: true,
            rules,
            count: rules.length
        });
        
    } catch (error) {
        console.error('Get AML rules error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch AML rules'
        });
    }
});

/**
 * @route   GET /api/aml/rules/:id
 * @desc    Get single AML rule
 * @access  Admin
 */
router.get('/rules/:id', authenticate, isAdmin, async (req, res) => {
    try {
        const rule = await AMLRule.findById(req.params.id)
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email');
        
        if (!rule) {
            return res.status(404).json({
                success: false,
                message: 'AML rule not found'
            });
        }
        
        res.json({
            success: true,
            rule
        });
        
    } catch (error) {
        console.error('Get AML rule error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch AML rule'
        });
    }
});

/**
 * @route   POST /api/aml/rules
 * @desc    Create new AML rule
 * @access  Admin
 */
router.post('/rules', authenticate, isAdmin, async (req, res) => {
    try {
        const { name, description, ruleType, parameters, action, priority, isActive, blockTarget } = req.body;
        
        // Validate required fields
        if (!name || !description || !ruleType) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }
        
        // Create new rule
        const rule = new AMLRule({
            name,
            description,
            ruleType,
            severity: 'medium',
            parameters: parameters || {},
            action: action || 'alert',
            blockTarget: blockTarget || 'sender',
            priority: priority || 1,
            isActive: isActive !== undefined ? isActive : true,
            createdBy: req.user.userId
        });
        
        await rule.save();
        
        // Populate creator info
        await rule.populate('createdBy', 'name email');
        
        res.status(201).json({
            success: true,
            message: 'AML rule created successfully',
            rule
        });
        
    } catch (error) {
        console.error('Create AML rule error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create AML rule'
        });
    }
});

/**
 * @route   PUT /api/aml/rules/:id
 * @desc    Update AML rule
 * @access  Admin
 */
router.put('/rules/:id', authenticate, isAdmin, async (req, res) => {
    try {
        console.log('📝 Updating AML rule:', req.params.id);
        console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
        
        const { name, description, ruleType, parameters, action, priority, isActive, blockTarget } = req.body;
        
        const rule = await AMLRule.findById(req.params.id);
        
        if (!rule) {
            console.log('❌ Rule not found:', req.params.id);
            return res.status(404).json({
                success: false,
                message: 'AML rule not found'
            });
        }
        
        console.log('✅ Found rule:', rule.name);
        
        // Update fields
        if (name !== undefined) rule.name = name;
        if (description !== undefined) rule.description = description;
        if (ruleType !== undefined) rule.ruleType = ruleType;
        if (parameters !== undefined) rule.parameters = parameters;
        if (action !== undefined) rule.action = action;
        if (blockTarget !== undefined) rule.blockTarget = blockTarget;
        if (priority !== undefined) rule.priority = priority;
        if (isActive !== undefined) rule.isActive = isActive;
        
        rule.updatedBy = req.user.userId;
        
        await rule.save();
        
        console.log('✅ Rule saved successfully');
        
        // Populate user info
        await rule.populate('createdBy', 'name email');
        await rule.populate('updatedBy', 'name email');
        
        res.json({
            success: true,
            message: 'AML rule updated successfully',
            rule
        });
        
    } catch (error) {
        console.error('❌ Update AML rule error:', error);
        console.error('Stack:', error.stack);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update AML rule'
        });
    }
});

/**
 * @route   DELETE /api/aml/rules/:id
 * @desc    Delete AML rule
 * @access  Admin
 */
router.delete('/rules/:id', authenticate, isAdmin, async (req, res) => {
    try {
        const rule = await AMLRule.findById(req.params.id);
        
        if (!rule) {
            return res.status(404).json({
                success: false,
                message: 'AML rule not found'
            });
        }
        
        await AMLRule.findByIdAndDelete(req.params.id);
        
        res.json({
            success: true,
            message: 'AML rule deleted successfully'
        });
        
    } catch (error) {
        console.error('Delete AML rule error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete AML rule'
        });
    }
});

/**
 * @route   PATCH /api/aml/rules/:id/toggle
 * @desc    Toggle AML rule active status
 * @access  Admin
 */
router.patch('/rules/:id/toggle', authenticate, isAdmin, async (req, res) => {
    try {
        const rule = await AMLRule.findById(req.params.id);
        
        if (!rule) {
            return res.status(404).json({
                success: false,
                message: 'AML rule not found'
            });
        }
        
        rule.isActive = !rule.isActive;
        rule.updatedBy = req.user.userId;
        
        await rule.save();
        
        res.json({
            success: true,
            message: `AML rule ${rule.isActive ? 'activated' : 'deactivated'} successfully`,
            rule
        });
        
    } catch (error) {
        console.error('Toggle AML rule error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to toggle AML rule status'
        });
    }
});

/**
 * @route   POST /api/aml/rules/seed
 * @desc    Seed initial AML rules (for development)
 * @access  Admin
 */
router.post('/rules/seed', authenticate, isAdmin, async (req, res) => {
    try {
        // Check if rules already exist
        const existingRules = await AMLRule.countDocuments();
        if (existingRules > 0) {
            return res.status(400).json({
                success: false,
                message: 'AML rules already exist. Delete existing rules first.'
            });
        }
        
        const defaultRules = [
            {
                name: 'Large Transaction Alert',
                description: 'Triggers when a single transaction exceeds $10,000 USD equivalent in ETH',
                ruleType: 'transaction_limit',
                severity: 'high',
                parameters: {
                    threshold: 10000,
                    maxAmount: 10000
                },
                action: 'alert',
                blockTarget: 'sender',
                priority: 9,
                isActive: true,
                createdBy: req.user.userId
            },
            {
                name: 'Rapid Fire Transactions',
                description: 'Detects more than 10 transactions from the same wallet within 1 hour',
                ruleType: 'velocity',
                severity: 'medium',
                parameters: {
                    maxTransactions: 10,
                    timeWindow: 3600
                },
                action: 'review',
                blockTarget: 'sender',
                priority: 7,
                isActive: true,
                createdBy: req.user.userId
            },
            {
                name: 'Structuring Pattern Detection',
                description: 'Identifies transactions just below reporting thresholds ($9,000-$9,999)',
                ruleType: 'pattern',
                severity: 'critical',
                parameters: {
                    minAmount: 9000,
                    maxAmount: 9999,
                    maxTransactions: 3
                },
                action: 'block',
                blockTarget: 'sender',
                priority: 10,
                isActive: true,
                createdBy: req.user.userId
            },
            {
                name: 'High-Risk Geographic Location',
                description: 'Flags transactions from sanctioned or high-risk countries',
                ruleType: 'geographic',
                severity: 'high',
                parameters: {
                    countries: ['North Korea', 'Iran', 'Syria', 'Cuba', 'Sudan']
                },
                action: 'block',
                blockTarget: 'sender',
                priority: 9,
                isActive: true,
                createdBy: req.user.userId
            },
            {
                name: 'Suspicious Round Number Pattern',
                description: 'Detects transactions in exact round numbers (e.g., exactly $1000, $5000)',
                ruleType: 'pattern',
                severity: 'low',
                parameters: {
                    patterns: ['round_numbers']
                },
                action: 'flag',
                blockTarget: 'sender',
                priority: 3,
                isActive: true,
                createdBy: req.user.userId
            },
            {
                name: 'New Account High Activity',
                description: 'Alerts when accounts less than 7 days old make transactions over $5,000',
                ruleType: 'behavioral',
                severity: 'medium',
                parameters: {
                    accountAge: 7,
                    threshold: 5000
                },
                action: 'review',
                blockTarget: 'sender',
                priority: 6,
                isActive: true,
                createdBy: req.user.userId
            },
            {
                name: 'PEP (Politically Exposed Person) Check',
                description: 'Enhanced due diligence for transactions involving PEPs',
                ruleType: 'identity',
                severity: 'high',
                parameters: {
                    checkType: 'PEP'
                },
                action: 'review',
                blockTarget: 'sender',
                priority: 8,
                isActive: true,
                createdBy: req.user.userId
            },
            {
                name: 'OFAC Sanctions List Check',
                description: 'Verifies addresses against OFAC Specially Designated Nationals list',
                ruleType: 'watchlist',
                severity: 'critical',
                parameters: {
                    watchlist: 'OFAC_SDN'
                },
                action: 'block',
                blockTarget: 'sender',
                priority: 10,
                isActive: true,
                createdBy: req.user.userId
            },
            {
                name: 'Daily Transaction Limit',
                description: 'Monitors total daily transaction volume per wallet (max $50,000)',
                ruleType: 'threshold',
                severity: 'medium',
                parameters: {
                    threshold: 50000,
                    timeWindow: 86400
                },
                action: 'alert',
                blockTarget: 'sender',
                priority: 5,
                isActive: true,
                createdBy: req.user.userId
            },
            {
                name: 'Unusual Time Pattern',
                description: 'Flags transactions occurring during unusual hours (2 AM - 5 AM)',
                ruleType: 'frequency',
                severity: 'low',
                parameters: {
                    timeRange: '02:00-05:00',
                    threshold: 3
                },
                action: 'flag',
                blockTarget: 'sender',
                priority: 4,
                isActive: true,
                createdBy: req.user.userId
            }
        ];
        
        const rules = await AMLRule.insertMany(defaultRules);
        
        res.status(201).json({
            success: true,
            message: 'AML rules seeded successfully',
            count: rules.length,
            rules
        });
        
    } catch (error) {
        console.error('Seed AML rules error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to seed AML rules'
        });
    }
});

module.exports = router;
